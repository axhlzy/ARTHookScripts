import { ExecuteSwitchImplCppManager } from "./functions/ExecuteSwitchImplCpp"
import { DefineClassHookManager } from "./functions/DefineClass"
import { OpenCommonHookManager } from "./functions/OpenCommon"
import { InitArray } from "./functions/init_array"

export class TraceManager {

    public static startTrace(name: string): void {
        console.log("startTrace", name);
    }

    public static stopTrace(name: string): void {
        console.log("stopTrace", name);
    }

    // jetbrains://clion/navigate/reference?project=libart&path=interpreter/interpreter_common.h
    public static TraceJava2Java() {
        // static ALWAYS_INLINE bool DoInvoke(Thread* self,
        //     ShadowFrame& shadow_frame,
        //     const Instruction* inst,
        //     uint16_t inst_data,
        //     JValue* result)

    }

    public static TraceJava2Native() {

    }

    public static TraceNative2Java() {

    }

    public static TraceNative2Native() {

    }

    public static Trace_OpenCommon() {
        OpenCommonHookManager.getInstance().enableHook()
    }

    public static Trace_DefineClass() {
        DefineClassHookManager.getInstance().enableHook()
    }

    public static Trace_CallConstructors() {
        InitArray.Hook_CallConstructors()
    }

    public static Trace_ExecuteSwitchImplCpp() {
        ExecuteSwitchImplCppManager.enableHook()
    }

    public static TraceArtMethodInvoke() {
        HookArtMethodInvoke()
    }

}

setImmediate(() => {

    TraceManager.Trace_DefineClass()
    // TraceManager.Trace_ExecuteSwitchImplCpp()
    // TraceManager.Trace_OpenCommon()
    // TraceManager.Trace_CallConstructors()

})