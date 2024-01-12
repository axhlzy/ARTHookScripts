import { JSHandleNotImpl } from "../../../../JSHandle"
import { callSym } from "../../../../Utils/SymHelper"
import { ArtThread } from "../Thread"

export class ThreadList extends JSHandleNotImpl {

    constructor() {
        const value = (Java as any).api.artThreadList as NativePointer
        super(value)
    }

    toString(): string {
        let disp: string = `ThreadList<${(Java as any).api.artThreadList as NativePointer}>`
        if (this.handle.isNull()) return disp
        return disp
    }

    // void SuspendAll(const char* cause, bool long_suspend = false)
    // _ZN3art10ThreadList10SuspendAllEPKcb
    public static SuspendAll(cause: string = "SuspendAll", long_suspend: boolean = false) {
        Java.perform(() => {
            callSym<void>(
                "_ZN3art10ThreadList10SuspendAllEPKcb", "libart.so",
                "void", ["pointer", "pointer", "pointer"],
                (Java as any).api.artThreadList as NativePointer, Memory.allocUtf8String(cause), long_suspend == true ? ptr(1) : NULL)
        })
    }

    // void ThreadList::ResumeAll() 
    // _ZN3art10ThreadList9ResumeAllEv
    public static ResumeAll() {
        return callSym<void>(
            "_ZN3art10ThreadList9ResumeAllEv", "libart.so",
            "void", ["pointer"],
            (Java as any).api.artThreadList as NativePointer,)
    }

    // void Register(Thread* self)
    // _ZN3art10ThreadList8RegisterEPNS_6ThreadE
    public static Register(self: ArtThread) {
        return callSym<void>(
            "_ZN3art10ThreadList8RegisterEPNS_6ThreadE", "libart.so",
            "void", ["pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, self.handle)
    }

    // void WaitForOtherNonDaemonThreadsToExit()
    // _ZN3art10ThreadList34WaitForOtherNonDaemonThreadsToExitEv
    public static WaitForOtherNonDaemonThreadsToExit() {
        return callSym<void>(
            "_ZN3art10ThreadList34WaitForOtherNonDaemonThreadsToExitEv", "libart.so",
            "void", ["pointer"],
            (Java as any).api.artThreadList as NativePointer,)
    }

    // void ReleaseThreadId(Thread* self, uint32_t id) REQUIRES(!Locks::allocated_thread_ids_lock_);
    // _ZN3art10ThreadList15ReleaseThreadIdEPNS_6ThreadEj
    public static ReleaseThreadId(self: ArtThread, id: number) {
        return callSym<void>(
            "_ZN3art10ThreadList15ReleaseThreadIdEPNS_6ThreadEj", "libart.so",
            "void", ["pointer", "pointer", "int"],
            (Java as any).api.artThreadList as NativePointer, self, id)
    }

    // bool Contains(Thread* thread) REQUIRES(Locks::thread_list_lock_);
    // _ZN3art10ThreadList8ContainsEPNS_6ThreadE
    public static Contains(thread: ArtThread) {
        return callSym<boolean>(
            "_ZN3art10ThreadList8ContainsEPNS_6ThreadE", "libart.so",
            "bool", ["pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, thread.handle)
    }

    // void VisitRootsForSuspendedThreads(RootVisitor* visitor)
    // _ZN3art10ThreadList29VisitRootsForSuspendedThreadsEPNS_11RootVisitorE
    public static VisitRootsForSuspendedThreads(visitor: NativePointer) {
        return callSym<void>(
            "_ZN3art10ThreadList29VisitRootsForSuspendedThreadsEPNS_11RootVisitorE", "libart.so",
            "void", ["pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, visitor)
    }

    // Thread* SuspendThreadByThreadId(uint32_t thread_id, SuspendReason reason, bool* timed_out)
    // _ZN3art10ThreadList23SuspendThreadByThreadIdEjNS_13SuspendReasonEPb
    public static SuspendThreadByThreadId(thread_id: number, reason: SuspendReason = SuspendReason.kForUserCode, timed_out: NativePointer = NULL) {
        return callSym<ArtThread>(
            "_ZN3art10ThreadList23SuspendThreadByThreadIdEjNS_13SuspendReasonEPb", "libart.so",
            "pointer", ["pointer", "pointer", "pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, ptr(thread_id), ptr(reason), timed_out)
    }

    // void Unregister(Thread* self)
    // _ZN3art10ThreadList10UnregisterEPNS_6ThreadE
    public static Unregister(self: ArtThread) {
        return callSym<void>(
            "_ZN3art10ThreadList10UnregisterEPNS_6ThreadE", "libart.so",
            "void", ["pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, self.handle)
    }


    // Thread* FindThreadByThreadId(uint32_t thread_id)
    // _ZN3art10ThreadList20FindThreadByThreadIdEj
    public static FindThreadByThreadId(thread_id: number): ArtThread {
        return new ArtThread(callSym<NativePointer>(
            "_ZN3art10ThreadList20FindThreadByThreadIdEj", "libart.so",
            "pointer", ["pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, ptr(thread_id)))
    }

    // void SuspendAllForDebugger()
    // _ZN3art10ThreadList21SuspendAllForDebuggerEv
    public static SuspendAllForDebugger() {
        return callSym<void>(
            "_ZN3art10ThreadList21SuspendAllForDebuggerEv", "libart.so",
            "void", ["pointer"],
            (Java as any).api.artThreadList as NativePointer)
    }

    // void ResumeAllForDebugger()
    // _ZN3art10ThreadList20ResumeAllForDebuggerEv
    public static ResumeAllForDebugger() {
        return callSym<void>(
            "_ZN3art10ThreadList20ResumeAllForDebuggerEv", "libart.so",
            "void", ["pointer"],
            (Java as any).api.artThreadList as NativePointer)
    }

    // void UndoDebuggerSuspensions()
    // _ZN3art10ThreadList23UndoDebuggerSuspensionsEv
    public static UndoDebuggerSuspensions() {
        return callSym<void>(
            "_ZN3art10ThreadList23UndoDebuggerSuspensionsEv", "libart.so",
            "void", ["pointer"],
            (Java as any).api.artThreadList as NativePointer)
    }

    // void Dump(std::ostream& os, bool dump_native_stack = true)
    // _ZN3art10ThreadList4DumpERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEEb
    public static Dump(os: NativePointer, dump_native_stack: boolean = true) {
        return callSym<void>(
            "_ZN3art10ThreadList4DumpERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEEb", "libart.so",
            "void", ["pointer", "pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, os, ptr(dump_native_stack ? 1 : 0))
    }

    // void DumpNativeStacks(std::ostream& os)
    // _ZN3art10ThreadList16DumpNativeStacksERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEE
    public static DumpNativeStacks(os: NativePointer) {
        return callSym<void>(
            "_ZN3art10ThreadList16DumpNativeStacksERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEE", "libart.so",
            "void", ["pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, os)
    }

    // void ForEach(void (*callback)(Thread*, void*), void* context)
    // _ZN3art10ThreadList7ForEachEPFvPNS_6ThreadEPvES3_
    public static ForEach(callback: NativePointer, context: NativePointer) {
        return callSym<void>(
            "_ZN3art10ThreadList7ForEachEPFvPNS_6ThreadEPvES3_", "libart.so",
            "void", ["pointer", "pointer", "pointer"],
            (Java as any).api.artThreadList as NativePointer, callback, context)
    }

    public static get ThreadLists() {
        const tempMemory = Memory.alloc(Process.pointerSize)
        const threadLists: { thread: ArtThread, context: NativePointer }[] = new Array()
        ThreadList.ForEach(new NativeCallback((thread: NativePointer, context: NativePointer) => {
            threadLists.push({ thread: new ArtThread(thread), context: context })
        }, "void", ["pointer", "pointer"]), tempMemory)
        return threadLists
    }

}

globalThis.ThreadList = ThreadList

export enum SuspendReason {
    // Suspending for internal reasons (e.g. GC, stack trace, etc.).
    // TODO Split this into more descriptive sections.
    kInternal = 0,
    // Suspending for debugger (code in Dbg::*, runtime/jdwp/, etc.).
    kForDebugger = 1,
    // Suspending due to non-runtime, user controlled, code. (For example Thread#Suspend()).
    kForUserCode = 2,
}

declare global {
    var SuspendAll: () => void
    var ResumeAll: () => void
    var ThreadLists: string[]
    var SuspendThreadByThreadId: (thread_id: number) => ArtThread
}

globalThis.SuspendAll = ThreadList.SuspendAll
globalThis.ResumeAll = ThreadList.ResumeAll
globalThis.ThreadLists = ThreadList.ThreadLists.map((item) => item.thread.toString())
globalThis.SuspendThreadByThreadId = ThreadList.SuspendThreadByThreadId