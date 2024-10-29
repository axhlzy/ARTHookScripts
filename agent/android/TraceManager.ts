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
    }
}

// LOGD(Process.id)
// libC.sleep(15)
// hookThread()

setImmediate(() => {

    // logSoLoad()
    // hookThread()

    // const addr = Module.findBaseAddress("libJX3_Client.so").add(0x166CEE4)
    // Memory.patchCode(addr, Process.pointerSize, (address)=>{
    //     const w = new Arm64Writer(address)
    //     w.putNop()
    //     w.flush()
    // })

    Process.setExceptionHandler((exception: ExceptionDetails) => {
        LOGE(`\nCatch Exception:\nTYPE:${exception.type} | NCONTEXT: ${exception.nativeContext} | ADDRESS: ${exception.address} { ${DebugSymbol.fromAddress(exception.address)} }`)
        PrintStackTraceNative(exception.context, '', false, true)
        return true
    })

    // Module.load("/data/local/tmp/libinject.so")
    
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