import { KeyValueStore } from "../../../../../tools/common"
import { JSHandleNotImpl } from "../../../../JSHandle"
import { getSym } from "../../../../Utils/SymHelper"
import { R } from "../../../../../tools/intercepter"
import { ShadowFrame } from "../ShadowFrame"
import { ArtThread } from "../Thread"

type MoveToExceptionHandleCalledListener = (ret: NativePointerValue, thread: ArtThread, shadowFrame: ShadowFrame, instrumentation: NativePointer) => NativePointerValue

export class interpreter extends JSHandleNotImpl {

    private static _CanUseMterp: boolean = false

    static get CanUseMterp() {
        return interpreter._CanUseMterp
    }

    static set CanUseMterp(value: boolean) {
        interpreter._CanUseMterp = value
    }

    // _ZN3art11interpreter11CanUseMterpEv
    // bool CanUseMterp();
    public static Hook_CanUseMterp() {
        const target: NativePointer = getSym("_ZN3art11interpreter11CanUseMterpEv")
        Interceptor.attach(target, {
            onLeave(retval) {
                // LOGD(`Called CanUseMterp() => ${retval}`)
                retval.replace(interpreter._CanUseMterp ? ptr(1) : NULL)
            }
        })
    }

    // _ZN3art11interpreter17AbortTransactionFEPNS_6ThreadEPKcz
    // void AbortTransaction(art::Thread*, char const*, ...)
    public static Hook_AbortTransaction() {
        const target: NativePointer = getSym("_ZN3art11interpreter17AbortTransactionFEPNS_6ThreadEPKcz")
        try {
            R(target, new NativeCallback(() => {
                LOGD(`Called AbortTransaction()`)
                return
            }, 'void', []))
        } catch (error) {
            // LOGE(`Hook_AbortTransaction ${error}`)
        }
    }

    // _ZN3art11interpreter17AbortTransactionVEPNS_6ThreadEPKcSt9__va_list
    // void AbortTransactionV(art::Thread*, char const*, std::__va_list)
    public static Hook_AbortTransactionV() {
        const target: NativePointer = getSym("_ZN3art11interpreter17AbortTransactionVEPNS_6ThreadEPKcSt9__va_list")
        try {
            R(target, new NativeCallback(() => {
                LOGD(`Called AbortTransactionV()`)
                return
            }, 'void', []))
        } catch (error) {
            // LOGE(`Hook_AbortTransactionV ${error}`)
        }
    }

    // _ZN3art11interpreter22MoveToExceptionHandlerEPNS_6ThreadERNS_11ShadowFrameEbb
    // _ZN3art11interpreter22MoveToExceptionHandlerEPNS_6ThreadERNS_11ShadowFrameEPKNS_15instrumentation15InstrumentationE
    // bool MoveToExceptionHandler(art::Thread* self, art::ShadowFrame& shadow_frame, art::instrumentation::Instrumentation const* instrumentation)
    public static Hook_MoveToExceptionHandler() {
        const target: NativePointer = getSym("_ZN3art11interpreter22MoveToExceptionHandlerEPNS_6ThreadERNS_11ShadowFrameEPKNS_15instrumentation15InstrumentationE")
        const target_SrcCall = new NativeFunction(target, 'pointer', ['pointer', 'pointer', 'pointer'])
        try {
            R(target, new NativeCallback((self: NativePointer, shadow_frame: NativePointer, instrumentation: NativePointer) => {
                let ret = target_SrcCall(self, shadow_frame, instrumentation)
                // const thread = new ArtThread(self)
                const shadowFrame = new ShadowFrame(shadow_frame)
                // if (!shadowFrame.dex_instructions.handle.isNull()) {
                //     LOGD(`Called MoveToExceptionHandler() -> ${shadowFrame.method.methodName} -> ${ret}`)
                // }
                // const instrumentation_ = instrumentation
                // interpreter.moveToExceptionHandleCalledListeners.forEach(listener => {
                //     const lis_ret: NativePointerValue = listener(ret, thread, shadowFrame, instrumentation_)
                //     if (lis_ret) ret = lis_ret
                // })
                return ret
            }, 'pointer', ['pointer', 'pointer', 'pointer']))
        } catch (error) {
            // LOGE(`Hook_MoveToExceptionHandler ${error}`)
        }
    }

    static onValueChanged(key: string, value: boolean): void {
        if (key != "CanUseMterp") return
        LOGZ(`ArtInterpreter Got New Value -> ${key} -> ${value}`)
        if (key == "CanUseMterp") interpreter.CanUseMterp = value
    }

    private static moveToExceptionHandleCalledListeners: MoveToExceptionHandleCalledListener[] = []

    public static addMoveToExceptionHandleCalledListener(listener: MoveToExceptionHandleCalledListener) {
        interpreter.moveToExceptionHandleCalledListeners.push(listener)
    }

}

setImmediate(() => {
    KeyValueStore.getInstance<string, boolean>().subscribe(interpreter)
})

setImmediate(() => {
    try {
        interpreter.Hook_CanUseMterp() // by defult
        // interpreter.Hook_AbortTransaction()
        // interpreter.Hook_AbortTransactionV()
        interpreter.Hook_MoveToExceptionHandler() // by defult
    } catch (error) {
        // LOGE(error)
    }
})

Reflect.set(globalThis, "ArtInterpreter", interpreter)