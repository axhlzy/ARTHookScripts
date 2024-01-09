import { DefineClassHookManager } from "./start/DefineClass"
import { OpenCommonHookManager } from "./start/OpenCommon"
import { InitArray } from "./start/init_array"

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

}

setImmediate(() => {

    TraceManager.Trace_DefineClass()
    // TraceManager.Trace_OpenCommon()
    // TraceManager.Trace_CallConstructors()

})