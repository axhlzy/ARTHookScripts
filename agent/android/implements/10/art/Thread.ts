import { ManagedStack, RuntimeStats } from "./Thread_Inl"
import { callSym, getSym } from "../../../Utils/SymHelper"
import { StdString } from "../../../../tools/StdString"
import { ArtMethod } from "./mirror/ArtMethod"
import { JSHandle } from "../../../JSHandle"
import { jobject } from "./Type/jobject"
import { PointerSize } from "./Globals"

// jetbrains://clion/navigate/reference?project=libart&path=thread.h

export class ArtThread extends JSHandle {

    // tls32_ 
    private tls32_: {
        // union StateAndFlags state_and_flags;
        state_and_flags: NativePointer
        // int suspend_count GUARDED_BY(Locks::thread_suspend_count_lock_);
        suspend_count: NativePointer
        // int debug_suspend_count GUARDED_BY(Locks::thread_suspend_count_lock_);
        debug_suspend_count: NativePointer
        // int32_t thin_lock_thread_id;
        thin_lock_thread_id: NativePointer
        // uint32_t tid;
        tid: NativePointer
        // const bool32_t daemon;
        daemon: NativePointer
        // bool32_t throwing_OutOfMemoryError;
        throwing_OutOfMemoryError: NativePointer
        // uint32_t no_thread_suspension;
        no_thread_suspension: NativePointer
        // uint32_t thread_exit_check_count;
        thread_exit_check_count: NativePointer
        // bool32_t handling_signal_;
        handling_signal_: NativePointer
        // bool32_t is_transitioning_to_runnable;
        is_transitioning_to_runnable: NativePointer
        // bool32_t ready_for_debug_invoke;
        ready_for_debug_invoke: NativePointer
        // bool32_t debug_method_entry_;
        debug_method_entry_: NativePointer
        // bool32_t is_gc_marking;
        is_gc_marking: NativePointer
        // Atomic<bool32_t> interrupted;
        interrupted: NativePointer
        // AtomicInteger park_state_;
        park_state_: NativePointer
        // bool32_t weak_ref_access_enabled;
        weak_ref_access_enabled: NativePointer
        // uint32_t disable_thread_flip_count;
        disable_thread_flip_count: NativePointer
        // int user_code_suspend_count GUARDED_BY(Locks::thread_suspend_count_lock_);
        user_code_suspend_count: NativePointer
        // uint32_t force_interpreter_count;
        force_interpreter_count: NativePointer
        // std::atomic<bool32_t> use_mterp;
        use_mterp: NativePointer
    }

    // tls64_
    private tls64_: {
        // uint64_t trace_clock_base;
        trace_clock_base: NativePointer,
        // RuntimeStats stats;
        stats: RuntimeStats,
    }

    // tlsPtr_
    private tlsPtr_: {
        // uint8_t* card_table;
        card_table: NativePointer,
        // mirror::Throwable* exception;
        exception: NativePointer,
        // uint8_t* stack_end;
        stack_end: NativePointer,
        // ManagedStack managed_stack;
        managed_stack: NativePointer,
        // uintptr_t* suspend_trigger;
        suspend_trigger: NativePointer,
        // JNIEnvExt* jni_env;
        jni_env: NativePointer,

        // // Temporary storage to transfer a pre-allocated JNIEnvExt from the creating thread to the
        // // created thread.
        // JNIEnvExt* tmp_jni_env;
        tmp_jni_env: NativePointer

        // // Initialized to "this". On certain architectures (such as x86) reading off of Thread::Current
        // // is easy but getting the address of Thread::Current is hard. This field can be read off of
        // // Thread::Current to give the address.
        // Thread* self;
        self: NativePointer

        // // Our managed peer (an instance of java.lang.Thread). The jobject version is used during thread
        // // start up, until the thread is registered and the local opeer_ is used.
        // mirror::Object* opeer;
        opeer: NativePointer
        // jobject jpeer;
        jpeer: NativePointer

        // // The "lowest addressable byte" of the stack.
        // uint8_t* stack_begin;
        stack_begin: NativePointer

        // // Size of the stack.
        // size_t stack_size;
        stack_size: NativePointer

        // union DepsOrStackTraceSample
        DepsOrStackTraceSample: {
            // std::vector<ArtMethod*>* stack_trace_sample;
            verifier_deps: NativePointer,
            // verifier::VerifierDeps* verifier_deps;
            stack_trace_sample: NativePointer,
        }

        // Thread* wait_next;
        wait_next: NativePointer

        //     // If we're blocked in MonitorEnter, this is the object we're trying to lock.
        // mirror::Object* monitor_enter_object;
        monitor_enter_object: NativePointer

        // // Top of linked list of handle scopes or null for none.
        // BaseHandleScope* top_handle_scope;
        top_handle_scope: NativePointer

        // // Needed to get the right ClassLoader in JNI_OnLoad, but also
        // // useful for testing.
        // jobject class_loader_override;
        class_loader_override: NativePointer

        // // Thread local, lazily allocated, long jump context. Used to deliver exceptions.
        // Context* long_jump_context;
        long_jump_context: NativePointer

        // // Additional stack used by method instrumentation to store method and return pc values.
        // // Stored as a pointer since std::deque is not PACKED.
        // std::deque<instrumentation::InstrumentationStackFrame>* instrumentation_stack;
        instrumentation_stack: NativePointer

        // // JDWP invoke-during-breakpoint support.
        // DebugInvokeReq* debug_invoke_req;
        debug_invoke_req: NativePointer

        // // JDWP single-stepping support.
        // SingleStepControl* single_step_control;
        single_step_control: NativePointer

        // // For gc purpose, a shadow frame record stack that keeps track of:
        // // 1) shadow frames under construction.
        // // 2) deoptimization shadow frames.
        // StackedShadowFrameRecord* stacked_shadow_frame_record;
        stacked_shadow_frame_record: NativePointer

        // // Deoptimization return value record stack.
        // DeoptimizationContextRecord* deoptimization_context_stack;
        deoptimization_context_stack: NativePointer

        // // For debugger, a linked list that keeps the mapping from frame_id to shadow frame.
        // // Shadow frames may be created before deoptimization happens so that the debugger can
        // // set local values there first.
        // FrameIdToShadowFrame* frame_id_to_shadow_frame;
        frame_id_to_shadow_frame: NativePointer

        // // A cached copy of the java.lang.Thread's name.
        // std::string* name;
        name: NativePointer

        // // A cached pthread_t for the pthread underlying this Thread*.
        // pthread_t pthread_self;
        pthread_self: NativePointer

        // // If no_thread_suspension_ is > 0, what is causing that assertion.
        // const char* last_no_thread_suspension_cause;
        last_no_thread_suspension_cause: NativePointer

        // // Pending checkpoint function or null if non-pending. If this checkpoint is set and someone\
        // // requests another checkpoint, it goes to the checkpoint overflow list.
        // Closure* checkpoint_function GUARDED_BY(Locks::thread_suspend_count_lock_);
        checkpoint_function: NativePointer

        // // Pending barriers that require passing or NULL if non-pending. Installation guarding by
        // // Locks::thread_suspend_count_lock_.
        // // They work effectively as art::Barrier, but implemented directly using AtomicInteger and futex
        // // to avoid additional cost of a mutex and a condition variable, as used in art::Barrier.
        // AtomicInteger* active_suspend_barriers[kMaxSuspendBarriers];
        active_suspend_barriers: NativePointer

        // // Thread-local allocation pointer. Moved here to force alignment for thread_local_pos on ARM.
        // uint8_t* thread_local_start;
        thread_local_start: NativePointer

        // // thread_local_pos and thread_local_end must be consecutive for ldrd and are 8 byte aligned for
        // // potentially better performance.
        // uint8_t* thread_local_pos;
        thread_local_pos: NativePointer
        // uint8_t* thread_local_end;
        thread_local_end: NativePointer

        // // Thread local limit is how much we can expand the thread local buffer to, it is greater or
        // // equal to thread_local_end.
        // uint8_t* thread_local_limit;
        thread_local_limit: NativePointer

        // size_t thread_local_objects;
        thread_local_objects: NativePointer

        // // Entrypoint function pointers.
        // // TODO: move this to more of a global offset table model to avoid per-thread duplication.
        // JniEntryPoints jni_entrypoints;
        jni_entrypoints: NativePointer
        // QuickEntryPoints quick_entrypoints;
        quick_entrypoints: NativePointer

        // // Mterp jump table base.
        // void* mterp_current_ibase;
        mterp_current_ibase: NativePointer

        // // There are RosAlloc::kNumThreadLocalSizeBrackets thread-local size brackets per thread.
        // void* rosalloc_runs[kNumRosAllocThreadLocalSizeBracketsInThread];
        rosalloc_runs: NativePointer

        // // Thread-local allocation stack data/routines.
        // StackReference<mirror::Object>* thread_local_alloc_stack_top;
        thread_local_alloc_stack_top: NativePointer
        // StackReference<mirror::Object>* thread_local_alloc_stack_end;
        thread_local_alloc_stack_end: NativePointer

        // // Support for Mutex lock hierarchy bug detection.
        // BaseMutex* held_mutexes[kLockLevelCount];
        held_mutexes: NativePointer

        // // The function used for thread flip.
        // Closure* flip_function;
        flip_function: NativePointer

        // // Current method verifier, used for root marking.
        // verifier::MethodVerifier* method_verifier;
        method_verifier: NativePointer

        // // Thread-local mark stack for the concurrent copying collector.
        // gc::accounting::AtomicStack<mirror::Object>* thread_local_mark_stack;
        thread_local_mark_stack: NativePointer

        // // The pending async-exception or null.
        // mirror::Throwable* async_exception;
        async_exception: NativePointer
    }

    //     // Small thread-local cache to be used from the interpreter.
    //   // It is keyed by dex instruction pointer.
    //   // The value is opcode-depended (e.g. field offset).
    //   InterpreterCache interpreter_cache_;
    interpreter_cache_: NativePointer

    //   // All fields below this line should not be accessed by native code. This means these fields can
    //   // be modified, rearranged, added or removed without having to modify asm_support.h

    //   // Guards the 'wait_monitor_' members.
    //   Mutex* wait_mutex_ DEFAULT_MUTEX_ACQUIRED_AFTER;
    wait_mutex_: NativePointer

    //   // Condition variable waited upon during a wait.
    //   ConditionVariable* wait_cond_ GUARDED_BY(wait_mutex_);
    wait_cond_: NativePointer
    //   // Pointer to the monitor lock we're currently waiting on or null if not waiting.
    //   Monitor* wait_monitor_ GUARDED_BY(wait_mutex_);
    wait_monitor_: NativePointer

    //   // Debug disable read barrier count, only is checked for debug builds and only in the runtime.
    //   uint8_t debug_disallow_read_barrier_ = 0;
    debug_disallow_read_barrier_: NativePointer

    //   // Note that it is not in the packed struct, may not be accessed for cross compilation.
    //   uintptr_t poison_object_cookie_ = 0;
    poison_object_cookie_: NativePointer

    //   // Pending extra checkpoints if checkpoint_function_ is already used.
    //   std::list<Closure*> checkpoint_overflow_ GUARDED_BY(Locks::thread_suspend_count_lock_);
    checkpoint_overflow_: NativePointer

    //   // Custom TLS field that can be used by plugins or the runtime. Should not be accessed directly by
    //   // compiled code or entrypoints.
    //   SafeMap<std::string, std::unique_ptr<TLSData>> custom_tls_ GUARDED_BY(Locks::custom_tls_lock_);
    custom_tls_: NativePointer

    //   // True if the thread is some form of runtime thread (ex, GC or JIT).
    //   bool is_runtime_thread_;
    is_runtime_thread_: NativePointer

    constructor(handle: NativePointer) {
        super(handle)
        return
        this.tls32_ = {
            // state_and_flags: new StateAndFlags(this.handle),
            // suspend_count: this.tls32_.state_and_flags.handle.add(StateAndFlags.SizeOfClass),
            state_and_flags: this.handle,
            suspend_count: this.tls32_.state_and_flags.add(0x4 * 3),
            debug_suspend_count: this.tls32_.suspend_count.add(0x4),
            thin_lock_thread_id: this.tls32_.debug_suspend_count.add(0x4),
            tid: this.tls32_.thin_lock_thread_id.add(0x4),
            daemon: this.tls32_.tid.add(0x4),
            throwing_OutOfMemoryError: this.tls32_.daemon.add(0x4),
            no_thread_suspension: this.tls32_.throwing_OutOfMemoryError.add(0x4),
            thread_exit_check_count: this.tls32_.no_thread_suspension.add(0x4),
            handling_signal_: this.tls32_.thread_exit_check_count.add(0x4),
            is_transitioning_to_runnable: this.tls32_.handling_signal_.add(0x4),
            ready_for_debug_invoke: this.tls32_.is_transitioning_to_runnable.add(0x4),
            debug_method_entry_: this.tls32_.ready_for_debug_invoke.add(0x4),
            is_gc_marking: this.tls32_.debug_method_entry_.add(0x4),
            interrupted: this.tls32_.is_gc_marking.add(0x4),
            park_state_: this.tls32_.interrupted.add(0x4),
            weak_ref_access_enabled: this.tls32_.park_state_.add(0x4),
            disable_thread_flip_count: this.tls32_.weak_ref_access_enabled.add(0x4),
            user_code_suspend_count: this.tls32_.disable_thread_flip_count.add(0x4),
            force_interpreter_count: this.tls32_.user_code_suspend_count.add(0x4),
            use_mterp: this.tls32_.force_interpreter_count.add(0x4)
        }
        this.tls64_ = {
            trace_clock_base: this.tls32_.use_mterp.add(0x4),
            stats: new RuntimeStats(this.tls32_.use_mterp.add(0x8))
        }
        this.tlsPtr_ = {
            card_table: this.tls64_.stats.handle.add(RuntimeStats.SizeOfClass),
            exception: this.tlsPtr_.card_table.add(PointerSize),
            stack_end: this.tlsPtr_.exception.add(PointerSize),
            managed_stack: this.tlsPtr_.stack_end.add(PointerSize),
            suspend_trigger: this.tlsPtr_.managed_stack.add(PointerSize),
            jni_env: this.tlsPtr_.suspend_trigger.add(PointerSize),
            tmp_jni_env: this.tlsPtr_.jni_env.add(PointerSize),
            self: this.tlsPtr_.tmp_jni_env.add(PointerSize),
            opeer: this.tlsPtr_.self.add(PointerSize),
            jpeer: this.tlsPtr_.opeer.add(PointerSize),
            stack_begin: this.tlsPtr_.jpeer.add(PointerSize),
            stack_size: this.tlsPtr_.stack_begin.add(PointerSize),
            DepsOrStackTraceSample: {
                verifier_deps: this.tlsPtr_.stack_size.add(PointerSize),
                stack_trace_sample: this.tlsPtr_.stack_size.add(PointerSize)
            },
            wait_next: this.tlsPtr_.DepsOrStackTraceSample.stack_trace_sample.add(PointerSize),
            monitor_enter_object: this.tlsPtr_.wait_next.add(PointerSize),
            top_handle_scope: this.tlsPtr_.monitor_enter_object.add(PointerSize),
            class_loader_override: this.tlsPtr_.top_handle_scope.add(PointerSize),
            long_jump_context: this.tlsPtr_.class_loader_override.add(PointerSize),
            instrumentation_stack: this.tlsPtr_.long_jump_context.add(PointerSize),
            debug_invoke_req: this.tlsPtr_.instrumentation_stack.add(PointerSize),
            single_step_control: this.tlsPtr_.debug_invoke_req.add(PointerSize),
            stacked_shadow_frame_record: this.tlsPtr_.single_step_control.add(PointerSize),
            deoptimization_context_stack: this.tlsPtr_.stacked_shadow_frame_record.add(PointerSize),
            frame_id_to_shadow_frame: this.tlsPtr_.deoptimization_context_stack.add(PointerSize),
            name: this.tlsPtr_.frame_id_to_shadow_frame.add(PointerSize),
            pthread_self: this.tlsPtr_.name.add(PointerSize),
            last_no_thread_suspension_cause: this.tlsPtr_.pthread_self.add(PointerSize),
            checkpoint_function: this.tlsPtr_.last_no_thread_suspension_cause.add(PointerSize),
            active_suspend_barriers: this.tlsPtr_.checkpoint_function.add(PointerSize),
            thread_local_start: this.tlsPtr_.active_suspend_barriers.add(PointerSize),
            thread_local_pos: this.tlsPtr_.thread_local_start.add(PointerSize),
            thread_local_end: this.tlsPtr_.thread_local_pos.add(PointerSize),
            thread_local_limit: this.tlsPtr_.thread_local_end.add(PointerSize),
            thread_local_objects: this.tlsPtr_.thread_local_limit.add(PointerSize),
            jni_entrypoints: this.tlsPtr_.thread_local_objects.add(PointerSize),
            quick_entrypoints: this.tlsPtr_.jni_entrypoints.add(PointerSize),
            mterp_current_ibase: this.tlsPtr_.quick_entrypoints.add(PointerSize),
            rosalloc_runs: this.tlsPtr_.mterp_current_ibase.add(PointerSize),
            thread_local_alloc_stack_top: this.tlsPtr_.rosalloc_runs.add(PointerSize),
            thread_local_alloc_stack_end: this.tlsPtr_.thread_local_alloc_stack_top.add(PointerSize),
            held_mutexes: this.tlsPtr_.thread_local_alloc_stack_end.add(PointerSize),
            flip_function: this.tlsPtr_.held_mutexes.add(PointerSize),
            method_verifier: this.tlsPtr_.flip_function.add(PointerSize),
            thread_local_mark_stack: this.tlsPtr_.method_verifier.add(PointerSize),
            async_exception: this.tlsPtr_.thread_local_mark_stack.add(PointerSize)
        }
        // class ALIGNED(16) InterpreterCache 
        this.interpreter_cache_ = this.tlsPtr_.async_exception.add(PointerSize)

        this.wait_mutex_ = this.interpreter_cache_.add(16)
        this.wait_cond_ = this.wait_mutex_.add(PointerSize)
        this.wait_monitor_ = this.wait_cond_.add(PointerSize)
        this.debug_disallow_read_barrier_ = this.wait_monitor_.add(PointerSize)
        this.poison_object_cookie_ = this.debug_disallow_read_barrier_.add(1)
        this.checkpoint_overflow_ = this.poison_object_cookie_.add(7 + PointerSize)
        this.custom_tls_ = this.checkpoint_overflow_.add(PointerSize)
        this.is_runtime_thread_ = this.custom_tls_.add(PointerSize)
    }

    toString(): string {
        let disp: string = `ArtThread<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t ThreadName=${this.GetThreadName()}`
        disp += `\n\t is_started=${this.is_started}`
        return disp
    }

    public get tls_ptr_managed_stack(): ManagedStack {
        return new ManagedStack(this.tlsPtr_.managed_stack.readPointer())
    }

    public get tls_ptr_stack_begin(): NativePointer {
        return this.tlsPtr_.stack_begin.readPointer()
    }

    public get tls_ptr_stack_size(): number {
        return this.tlsPtr_.stack_size.readPointer().toInt32()
    }

    public get tls_ptr_stack_end(): NativePointer {
        return this.tlsPtr_.stack_end.readPointer()
    }

    public get tls_ptr_name(): string {
        return this.tlsPtr_.name.readCString()
    }

    public get tls_ptr_self(): ArtThread {
        return new ArtThread(this.tlsPtr_.self.readPointer())
    }

    public get tls_ptr_jni_env(): NativePointer {
        return this.tlsPtr_.jni_env.readPointer()
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