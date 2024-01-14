import { getSym } from "../android/Utils/SymHelper"

export const bsym = (name: string, lib: string = "libart.so") => {

    const target: NativePointer = getSym(name, lib, false)
    const demangleStr: string = demangleName(name)
    const targetName: string = `${demangleStr.length == 0}` ? name : demangleStr
    LOGD(`Hooking [ ${targetName} ] from ${lib} => ${target}`)

    Interceptor.attach(target, {
        onEnter(args) {
            this.args = args
        },
        onLeave(retval) {
            LOGD(`\nCalled ${name}(${this.args.map((arg) => arg.toString()).join(', ')}) => ${retval}`)
        }
    })
}

export const nop = (functionAddress: NativePointer | number) => R(functionAddress, new NativeCallback(() => { LOGD(`Called NOP -> ${functionAddress}`); return }, 'void', []))

export const R = (functionAddress: NativePointer | number | string, callback: NativeCallback) => {
    if (typeof functionAddress == 'number') functionAddress = ptr(functionAddress)
    if (typeof functionAddress == "string") functionAddress = getSym(functionAddress)
    const debugInfo = DebugSymbol.fromAddress(functionAddress)
    try {
        Interceptor.replace(functionAddress, callback)
        // LOGD(`Enable Replace -> ${debugInfo.name} | ${debugInfo.address}`)
    } catch (error) {
        if (error.message.indexOf("already hooked") != -1) {
            LOGE(`Enable Replace -> ${debugInfo.name} | ${debugInfo.address} <- already replaced , try to rehook`)
            Interceptor.revert(functionAddress)
            Interceptor.replace(functionAddress, callback)
        } else {
            LOGE(`Enable Replace -> ${debugInfo.name} | ${debugInfo.address} <- ${error}`)
        }
    }
}

const listeners: InvocationListener[] = []
export const A = (functionAddress: NativePointer | number | string, callbacksOrProbe: InvocationListenerCallbacks | InstructionProbeCallback, data?: NativePointerValue) => {
    if (typeof functionAddress == 'number') functionAddress = ptr(functionAddress)
    if (typeof functionAddress == "string") functionAddress = getSym(functionAddress)
    const debugInfo = DebugSymbol.fromAddress(functionAddress)
    try {
        listeners.push(Interceptor.attach(functionAddress, callbacksOrProbe, data))
        LOGD(`Enable Attach -> ${debugInfo.name} | ${debugInfo.address}`)
    } catch (error) {
        LOGE(`Enable Attach -> ${debugInfo.name} | ${debugInfo.address} <- ${error}`)
    }
}

Reflect.set(global, 'bsym', bsym)
Reflect.set(global, 'nop', nop)
Reflect.set(global, 'R', R)