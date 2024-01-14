import { R } from "../../../../../tools/intercepter"
import { JSHandleNotImpl } from "../../../../JSHandle"
import { getSym } from "../../../../Utils/SymHelper"

export class InstructionHandler extends JSHandleNotImpl {

    // _ZN3art11interpreter18InstructionHandlerILb0ELb1EE45HandlePendingExceptionWithInstrumentationImplEPKNS_15instrumentation15InstrumentationE
    // void art::interpreter::InstructionHandler<false, true>::HandlePendingExceptionWithInstrumentationImpl(art::instrumentation::Instrumentation const*)
    public static Hook_InstructionHandler() {
        const target: NativePointer = getSym("_ZN3art11interpreter18InstructionHandlerILb0ELb1EE45HandlePendingExceptionWithInstrumentationImplEPKNS_15instrumentation15InstrumentationE")
        R(target, new NativeCallback(() => {
            LOGD(`Called InstructionHandler()`)
            return
        }, 'void', []))
    }

}

setImmediate(() => {
    // InstructionHandler.Hook_InstructionHandler()
})