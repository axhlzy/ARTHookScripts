import { ExecuteSwitchImplCppManager } from "./functions/ExecuteSwitchImplCpp"
import { DefineClassHookManager } from "./functions/DefineClass"
import { OpenCommonHookManager } from "./functions/OpenCommon"
import { linkerManager as LinkerManager } from "./functions/LinkerManager"
import { libC, pthread_attr_t, pthread_t } from "./Utils/libcfuncs"
import { waitSoLoad, whenSoLoad } from "./functions/dlopen"
import { PointerSize } from "./implements/10/art/Globals"
import { hookThread } from "./Utils/ThreadHooker"
import { SYSCALL } from "./Utils/syscalls"
import { getSym } from "./Utils/SymHelper"

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
        LinkerManager.Hook_CallConstructors()
    }

    public static Trace_ExecuteSwitchImplCpp() {
        ExecuteSwitchImplCppManager.enableHook()
    }

    public static TraceArtMethodInvoke() {
        HookArtMethodInvoke()
    }

    public static TraceException(){
        logSoLoad()

        Process.setExceptionHandler((exception: ExceptionDetails) => {
            LOGE(`TYPE:${exception.type} | NCONTEXT: ${exception.nativeContext} | ADDRESS: ${exception.address} { ${DebugSymbol.fromAddress(exception.address)} }`)
            PrintStackTraceNative(exception.context, '', false, true)
        })
    
        // libart.so!_ZN3art3JNIILb0EE18CallBooleanMethodVEP7_JNIEnvP8_jobjectP10_jmethodIDSt9__va_list+0xc4
        Interceptor.attach(getSym("_ZN3art3JNIILb0EE18CallBooleanMethodVEP7_JNIEnvP8_jobjectP10_jmethodIDSt9__va_list","libart.so"), {
            onEnter(args) {
                // libart.so!art::JNI<false>::CallBooleanMethodV(_JNIEnv*, _jobject*, _jmethodID*, std::__va_list)
                LOGD(`art::JNI<false>::CallBooleanMethodV( _JNIEnv:${args[0]}, _jobject:${args[1]}, _jmethodID:${args[2]}, __va_list:${args[3]})`)
                LOGZ(`\t_jobject -> ${Java.cast(args[1], Java.use("java.lang.Object"))}`)
                LOGZ(`\t_jmethodID -> ${Java.cast(args[2], Java.use("java.lang.Object"))}`)
            }
        })

        // _ZN7_JNIEnv16CallObjectMethodEP8_jobjectP10_jmethodIDz
        // jobject     (*CallObjectMethod)(JNIEnv*, jobject, jmethodID, ...);
        Interceptor.attach(getSym("_ZN7_JNIEnv16CallObjectMethodEP8_jobjectP10_jmethodIDz","libart.so"), {
            onEnter(args) {
                LOGD(`_ZN7_JNIEnv16CallObjectMethodEP8_jobjectP10_jmethodIDz`)
                LOGZ(`\t_jobject -> ${Java.cast(args[0], Java.use("java.lang.Object"))}`)
                LOGZ(`\t_jmethodID -> ${Java.cast(args[1], Java.use("java.lang.Object"))}`)
            }
        })
    
    }
}


// LOGD(Process.id)
// libC.sleep(15)
// hookThread()

setImmediate(() => {
    
    // TraceManager.TraceException()

    // whenSoLoad("libRMS.so", (soName)=>{LOGW(`onEnter ${soName}`)},  ()=>{})
    // // waitSoLoad("libRMS.so", 20)

    // LinkerManager.addOnSoLoadCallback("libRMS.so", (md: Module) => {
    //     LOGD(`onCalled libRMS.so | md.base = ${md.base}`)

    //     const addr0 = Process.findModuleByName("libRMS.so").base.add(0x00003f20)
    //     LOGE(`addr0 = ${addr0}`)
    //     Memory.protect(addr0, 4, 'rwx')
    //     let w = new ArmWriter(addr0)
    //     w.putRet()
    //     w.flush()

    //     const addr1 = Process.findModuleByName("libRMS.so").base.add(0x00003584)
    //     LOGE(`addr1 = ${addr1}`)
    //     Memory.protect(addr1, 4, 'rwx')
    //     let w1 = new ArmWriter(addr1)
    //     w1.putNop()
    //     w1.flush()

    //     LOGW(Process.id)
    // })

    // TraceManager.Trace_DefineClass()
    // TraceManager.Trace_ExecuteSwitchImplCpp()
    // TraceManager.Trace_OpenCommon()
    // TraceManager.Trace_CallConstructors()

})