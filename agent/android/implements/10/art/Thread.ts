import { StdString } from "../../../../tools/StdString"
import { JSHandle } from "../../../JSHandle"
import { jobject } from "./Type/jobject"
import { ArtMethod } from "./mirror/ArtMethod"

// jetbrains://clion/navigate/reference?project=libart&path=thread.h

export class ArtThread extends JSHandle {

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `ArtThread<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t ThreadName=${this.GetThreadName()}`
        try {
            disp += `\n\t CurrentMethod=${this.GetCurrentMethod().PrettyMethod(false)}`
        } catch { }
        return disp
    }

    // _ZN3art6Thread11is_started_E
    // art::Thread::is_started_
    public get is_started(): boolean {
        return getSym("_ZN3art6Thread11is_started_E", "libart.so").readU8() == 1
    }

    // ObjPtr<mirror::String> GetThreadName()
    // _ZNK3art6Thread13GetThreadNameEv
    public GetThreadName(): string {
        return StdString.from(callSym<NativePointer>(
            "_ZNK3art6Thread13GetThreadNameEv", "libart.so",
            "pointer", ["pointer"],
            this.CurrentHandle))
    }

    // art::Thread::SetThreadName(char const*)
    // _ZN3art6Thread13SetThreadNameEPKc
    public SetThreadName(name: string): void {
        callSym<void>(
            "_ZN3art6Thread13SetThreadNameEPKc", "libart.so",
            "void", ["pointer", "pointer"],
            this.CurrentHandle, Memory.allocUtf8String(name))
    }

    //   void DumpJavaStack(std::ostream& os,
    //     bool check_suspended = true,
    //     bool dump_locks = true) const
    // REQUIRES_SHARED(Locks::mutator_lock_);
    // art::Thread::DumpJavaStack(std::__1::basic_ostream<char, std::__1::char_traits<char> >&, bool, bool) const
    // _ZNK3art6Thread13DumpJavaStackERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEEbb
    public DumpJavaStack(check_suspended: boolean = true, dump_locks: boolean = true): string {
        let stdStr = new StdString()
        callSym<void>(
            "_ZNK3art6Thread13DumpJavaStackERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEEbb", "libart.so",
            "void", ["pointer", "bool", "bool"],
            this.CurrentHandle, stdStr, check_suspended, dump_locks)
        return stdStr.disposeToString()
    }

    // size_t NumberOfHeldMutexes() const;
    // _ZNK3art6Thread19NumberOfHeldMutexesEv
    public NumberOfHeldMutexes(): number {
        return callSym<number>(
            "_ZNK3art6Thread19NumberOfHeldMutexesEv", "libart.so",
            "int", ["pointer"],
            this.CurrentHandle)
    }

    // art::Thread::SetClassLoaderOverride(_jobject*)
    // _ZN3art6Thread22SetClassLoaderOverrideEP8_jobject
    public SetClassLoaderOverride(class_loader: jobject): void {
        callSym<void>(
            "_ZN3art6Thread22SetClassLoaderOverrideEP8_jobject", "libart.so",
            "void", ["pointer", "pointer"],
            this.CurrentHandle, class_loader.handle)
    }

    // ShadowFrame* FindDebuggerShadowFrame(size_t frame_id)
    // _ZN3art6Thread23FindDebuggerShadowFrameEm
    public FindDebuggerShadowFrame(frame_id: number): NativePointer {
        return callSym<NativePointer>(
            "_ZN3art6Thread23FindDebuggerShadowFrameEm", "libart.so",
            "pointer", ["pointer", "int"],
            this.CurrentHandle, frame_id)
    }

    // void Park(bool is_absolute, int64_t time) 
    // _ZN3art6Thread4ParkEbl
    public Park(is_absolute: boolean = true, time: number = 10): void {
        callSym<void>(
            "_ZN3art6Thread4ParkEbl", "libart.so",
            "void", ["pointer", "pointer", "pointer"],
            this.CurrentHandle, ptr(is_absolute ? 1 : 0), ptr(time))
    }

    // void Unpark();
    // _ZN3art6Thread6UnparkEv
    public Unpark(): void {
        callSym<void>(
            "_ZN3art6Thread6UnparkEv", "libart.so",
            "void", ["pointer"],
            this.CurrentHandle)
    }

    // art::Thread::Notify()
    // _ZN3art6Thread6NotifyEv
    public Notify(): void {
        callSym<void>(
            "_ZN3art6Thread6NotifyEv", "libart.so",
            "void", ["pointer"],
            this.CurrentHandle)
    }

    /*
   * Returns the thread priority for the current thread by querying the system.
   * This is useful when attaching a thread through JNI.
   *
   * Returns a value from 1 to 10 (compatible with java.lang.Thread values).
   */
    // static int GetNativePriority();
    // _ZN3art6Thread17GetNativePriorityEv
    public static GetNativePriority(): number {
        return callSym<number>(
            "_ZN3art6Thread17GetNativePriorityEv", "libart.so",
            "int", [],
        )
    }

    // Returns true if the thread is allowed to load java classes.
    // bool CanLoadClasses() const;
    // _ZNK3art6Thread14CanLoadClassesEv
    public CanLoadClasses(): boolean {
        return !!callSym<number>(
            "_ZNK3art6Thread14CanLoadClassesEv", "libart.so",
            "int", ["pointer"],
            this.CurrentHandle)
    }

    // Get the current method and dex pc. If there are errors in retrieving the dex pc, this will
    // // abort the runtime iff abort_on_error is true.
    // ArtMethod* GetCurrentMethod(uint32_t* dex_pc,
    //     bool check_suspended = true,
    //     bool abort_on_error = true) const
    // REQUIRES_SHARED(Locks::mutator_lock_);
    // _ZNK3art6Thread16GetCurrentMethodEPjbb
    public GetCurrentMethod(dex_pc: number = 0, check_suspended: boolean = true, abort_on_error: boolean = true): ArtMethod {
        return new ArtMethod(callSym<NativePointer>(
            "_ZNK3art6Thread16GetCurrentMethodEPjbb", "libart.so",
            "pointer", ["pointer", "pointer", "pointer", "pointer"],
            this.CurrentHandle, ptr(dex_pc), ptr(check_suspended ? 1 : 0), ptr(abort_on_error ? 1 : 0)))
    }

    // void Interrupt(Thread* self) REQUIRES(!wait_mutex_);
    // _ZN3art6Thread9InterruptEPS0_
    public Interrupt(): void {
        callSym<void>(
            "_ZN3art6Thread9InterruptEPS0_", "libart.so",
            "void", ["pointer"],
            this.CurrentHandle)
    }

    // bool IsInterrupted();
    // _ZN3art6Thread13IsInterruptedEv
    public IsInterrupted(): boolean {
        return !!callSym<number>(
            "_ZN3art6Thread13IsInterruptedEv", "libart.so",
            "int", ["pointer"],
            this.CurrentHandle)
    }

    // bool Interrupted();
    // _ZN3art6Thread11InterruptedEv
    public Interrupted(): boolean {
        return !!callSym<number>(
            "_ZN3art6Thread11InterruptedEv", "libart.so",
            "int", ["pointer"],
            this.CurrentHandle)
    }

    // bool IsSystemDaemon() const REQUIRES_SHARED(Locks::mutator_lock_);
    // _ZNK3art6Thread14IsSystemDaemonEv
    public IsSystemDaemon(): boolean {
        return !!callSym<number>(
            "_ZNK3art6Thread14IsSystemDaemonEv", "libart.so",
            "int", ["pointer"],
            this.CurrentHandle)
    }

    // static bool IsAotCompiler();
    // _ZN3art6Thread13IsAotCompilerEv
    public static IsAotCompiler(): boolean {
        return !!callSym<number>(
            "_ZN3art6Thread13IsAotCompilerEv", "libart.so",
            "int", [],
        )
    }

    // bool ProtectStack(bool fatal_on_error = true);
    // _ZN3art6Thread12ProtectStackEb
    public ProtectStack(fatal_on_error: boolean = true): boolean {
        return !!callSym<number>(
            "_ZN3art6Thread12ProtectStackEb", "libart.so",
            "int", ["pointer", "bool"],
            this.CurrentHandle, fatal_on_error)
    }

    // art::Thread::UnprotectStack()
    // _ZN3art6Thread14UnprotectStackEv
    public UnprotectStack(): void {
        callSym<void>(
            "_ZN3art6Thread14UnprotectStackEv", "libart.so",
            "void", ["pointer"],
            this.CurrentHandle)
    }

    // art::Thread::HandleScopeContains(_jobject*) const
    // _ZNK3art6Thread19HandleScopeContainsEP8_jobject
    public HandleScopeContains(obj: jobject): boolean {
        return !!callSym<number>(
            "_ZNK3art6Thread19HandleScopeContainsEP8_jobject", "libart.so",
            "int", ["pointer", "pointer"],
            this.CurrentHandle, obj.handle)
    }

    // static Thread* Attach(const char* thread_name, bool as_daemon, jobject thread_peer);
    // _ZN3art6Thread6AttachEPKcbP8_jobject
    public static Attach_3(thread_name: string, as_daemon: boolean, thread_peer: jobject): ArtThread {
        return new ArtThread(callSym<NativePointer>(
            "_ZN3art6Thread6AttachEPKcbP8_jobject", "libart.so",
            "pointer", ["pointer", "bool", "pointer"],
            Memory.allocUtf8String(thread_name), as_daemon, thread_peer.handle))
    }

    // static Thread* Attach(const char* thread_name, bool as_daemon, jobject thread_group, bool create_peer);
    // _ZN3art6Thread6AttachEPKcbP8_jobjectb
    public static Attach_4(thread_name: string, as_daemon: boolean, thread_group: jobject, create_peer: boolean): ArtThread {
        return new ArtThread(callSym<NativePointer>(
            "_ZN3art6Thread6AttachEPKcbP8_jobjectb", "libart.so",
            "pointer", ["pointer", "bool", "pointer", "bool"],
            Memory.allocUtf8String(thread_name), as_daemon, thread_group.handle, create_peer))
    }

}