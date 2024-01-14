import { KeyValueStore } from "../../../../../tools/common"
import { R } from "../../../../../tools/intercepter"
import { JSHandleNotImpl } from "../../../../JSHandle"
import { getSym } from "../../../../Utils/SymHelper"

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

    // _ZN3art11interpreter22MoveToExceptionHandlerEPNS_6ThreadERNS_11ShadowFrameEPKNS_15instrumentation15InstrumentationE
    // bool MoveToExceptionHandler(art::Thread*, art::ShadowFrame&, art::instrumentation::Instrumentation const*)
    public static Hook_MoveToExceptionHandler() {
        const target: NativePointer = getSym("_ZN3art11interpreter22MoveToExceptionHandlerEPNS_6ThreadERNS_11ShadowFrameEPKNS_15instrumentation15InstrumentationE")
        try {
            R(target, new NativeCallback(() => {
                LOGD(`Called MoveToExceptionHandler()`)
                return
            }, 'bool', []))
        } catch (error) {
            // LOGE(`Hook_MoveToExceptionHandler ${error}`)
        }
    }

    static onValueChanged(key: string, value: boolean): void {
        if (key != "CanUseMterp") return
        LOGZ(`ArtInterpreter Got New Value -> ${key} -> ${value}`)
        if (key == "CanUseMterp") interpreter.CanUseMterp = value
    }

}

setImmediate(() => {
    KeyValueStore.getInstance<string, boolean>().subscribe(interpreter)
})

setImmediate(() => {
    interpreter.Hook_CanUseMterp()

    interpreter.Hook_AbortTransaction()
    interpreter.Hook_AbortTransactionV()
    // interpreter.Hook_MoveToExceptionHandler()

})

Reflect.set(globalThis, "ArtInterpreter", interpreter)