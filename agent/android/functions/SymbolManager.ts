import { DEBUG } from "../../tools/common"
import { LOGW } from "../../tools/logger"

export class SymbolManager {

    static get artModule(): Module {
        return Process.getModuleByName("libart.so")!
    }

    static get artBaseAddress(): NativePointer {
        return Module.findBaseAddress("libart.so")
    }

    static get artSymbol(): ModuleSymbolDetails[] {
        return this.artModule.enumerateSymbols()
    }

    public artSymbolFilter(filterStrs: string[], excludefilterStrs?: string[]): ModuleSymbolDetails {
        return SymbolManager.symbolFilter(SymbolManager.artSymbol, filterStrs, excludefilterStrs)
    }

    static get dexDileModule(): Module {
        return Process.getModuleByName("libdexfile.so")
    }

    static get dexfileAddress(): NativePointer {
        return Module.findBaseAddress("libdexfile.so")
    }

    static get dexfileSymbol(): ModuleSymbolDetails[] {
        return this.dexDileModule.enumerateSymbols()
    }

    public dexfileSymbolFilter(filterStrs: string[], excludefilterStrs?: string[]): ModuleSymbolDetails {
        return SymbolManager.symbolFilter(SymbolManager.dexfileSymbol, filterStrs, excludefilterStrs)
    }

    public static SymbolFilter(moduleName: Module | string | null, filterStrs?: string[], excludefilterStrs?: string[]): ModuleSymbolDetails {
        let localMd: Module = null
        if (moduleName == null || moduleName == undefined) {
            let syms: ModuleSymbolDetails = SymbolManager.symbolFilter(this.artSymbol, filterStrs, excludefilterStrs, false)
            if (syms == null) syms = SymbolManager.symbolFilter(this.dexfileSymbol, filterStrs, excludefilterStrs, false)
            if (syms == null) throw new Error("can not find symbol")
            return syms
        } else {
            if (typeof moduleName == "string") {
                localMd = Process.getModuleByName(moduleName)!
            } else if (moduleName instanceof Module) {
                localMd = moduleName
            }
            return SymbolManager.symbolFilter(localMd.enumerateSymbols(), filterStrs)
        }
    }

    private static symbolFilter(mds: ModuleSymbolDetails[], containfilterStrs: string[], excludefilterStrs: string[] = [], withError: boolean = true): ModuleSymbolDetails {
        let ret = mds.filter((item: ModuleSymbolDetails) => {
            return containfilterStrs.every((filterStr: string) => {
                return item.name.indexOf(filterStr) != -1
            })
        })
        ret = ret.filter((item: ModuleSymbolDetails) => {
            return excludefilterStrs.every((filterStr: string) => {
                return item.name.indexOf(filterStr) == -1
            })
        })
        if (ret.length == 0) if (withError) throw new Error("can not find symbol")
        if (ret.length > 1) {
            if (DEBUG) LOGW(`find too many symbol, just ret first | size : ${ret.length}`)
            if (ret.length < 5) {
                ret.forEach((item: ModuleSymbolDetails) => {
                    LOGZ(JSON.stringify(item))
                })
            }
        }
        return ret[0]
    }
}