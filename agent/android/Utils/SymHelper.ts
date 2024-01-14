import { demangleName_onlyFunctionName as demangleName_ } from "../../tools/functions"
import { SymbolManager } from "../functions/SymbolManager"
import { JSHandle } from "../JSHandle"

const DEBUG_LOG: boolean = false

function CallSymLocal<T>(address: NativePointer, retType: NativeType, argTypes: NativeType[], ...args: any[]): T {
    try {
        return new NativeFunction(address, retType, argTypes)(...args) as T
    } catch (error: any) {
        throw error
        LOGE(`CallSymLocal exception 👇 \n${error.stack}`)
        return null
    }
}

type ArgType = NativeType | JSHandle | NativePointer | number

function transformArgs(args: ArgType[], argTypes: NativeType[]): any[] {
    return args.map((arg: any, index: number) => {
        if (argTypes[index] == "int") return parseInt(arg.toString())
        if (arg instanceof NativePointer) return arg
        if (arg instanceof JSHandle) return arg.handle
        if (typeof arg === "number") return arg
        if (typeof arg === "string") return Memory.allocUtf8String(arg)
        return ptr(arg)
    })
}

export function callSym<T>(sym: string, md: string, retType: NativeType, argTypes: NativeType[], ...args: any[]): T {
    return CallSymLocal<T>(getSym(sym, md), retType, argTypes, ...transformArgs(args, argTypes))
}

const Cache: Map<string, NativePointer> = new Map()
export function getSym(symName: string, md: string = "libart.so", checkNotFunction: boolean = false): NativePointer | null {
    if (Cache.has(symName)) return Cache.get(symName)!
    if (symName == undefined || md == null || symName == "" || md == "")
        throw new Error(`Usage: getSym(symName: string, md: string, check: boolean = false)`)

    const module: Module = Process.getModuleByName(md)
    if (module == null) throw new Error(`module ${md} not found`)

    let address: NativePointer | null = module.findExportByName(symName)

    // add action to find in symbols
    if (address == null) {
        let res: ModuleSymbolDetails[] = module.enumerateSymbols().filter((sym: ModuleSymbolDetails) => {
            return sym.name == symName && (checkNotFunction ? sym.type == "function" : true)
        })
        if (res.length > 1) {
            address = res[0].address
            LOGW(`find too many symbol, just ret first | size : ${res.length}`)
            return address
        } else if (res.length == 1) {
            address = res[0].address
            return address
        }
    }

    // Use demangle to handle function export names, 
    // used to deal with the problem of exporting functions with the same name 
    // but different arguments under arm32 and arm64
    if (address == null) {
        let sym_ret: ModuleSymbolDetails = SymbolManager.SymbolFilter(null, demangleName_(symName))
        if (DEBUG_LOG) LOGD(`debug -> symbol ${symName} found in ${sym_ret} -> ${sym_ret.address}`)
        if (sym_ret.type != "function") throw new Error(`symbol ${sym_ret.name} not a function [ ${sym_ret.type} ]`)
        address = sym_ret.address
    }
    if (DEBUG_LOG) LOGD(`debug -> symbol ${symName} found in ${md} -> ${address}`)
    if (address == null) {
        throw new Error(`symbol ${symName} not found`)
    }
    if (checkNotFunction) {
        const syms: ModuleSymbolDetails[] = module.enumerateSymbols().filter((sym: ModuleSymbolDetails) => {
            return sym.name == symName && sym.type == "object"
        })
        if (syms.length == 0) {
            throw new Error(`symbol ${symName} not found`)
        } else {
            // LOGD(`symbol ${symName} found \n ${JSON.stringify(syms[0])}`)
        }
    }
    Cache.set(symName, address)
    return address
}

Reflect.set(globalThis, "getSym", getSym)
Reflect.set(globalThis, "callSym", callSym)