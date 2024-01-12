import { InstrumentationEvent, InstrumentationListener, InstrumentationListenerInterface } from "./InstrumentationListener"
import { getArtRuntimeSpec } from "../../../../android"
import { callSym } from "../../../../Utils/SymHelper"
import { JSHandle } from "../../../../JSHandle"

type InstrumentationLevelTable = NativePointer

export class Instrumentation extends JSHandle {

    //     // Have we hijacked ArtMethod::code_ so that it calls instrumentation/interpreter code?
    //   bool instrumentation_stubs_installed_;
    instrumentation_stubs_installed_: NativePointer = this.CurrentHandle

    //   // Have we hijacked ArtMethod::code_ to reference the enter/exit stubs?
    //   bool entry_exit_stubs_installed_;
    entry_exit_stubs_installed_: NativePointer = this.instrumentation_stubs_installed_.add(0x1)

    //   // Have we hijacked ArtMethod::code_ to reference the enter interpreter stub?
    //   bool interpreter_stubs_installed_;
    interpreter_stubs_installed_: NativePointer = this.entry_exit_stubs_installed_.add(0x1)

    //   // Do we need the fidelity of events that we only get from running within the interpreter?
    //   bool interpret_only_;
    interpret_only_: NativePointer = this.interpreter_stubs_installed_.add(0x1)

    //   // Did the runtime request we only run in the interpreter? ie -Xint mode.
    //   bool forced_interpret_only_;
    forced_interpret_only_: NativePointer = this.interpret_only_.add(0x1)

    //   // Do we have any listeners for method entry events? Short-cut to avoid taking the
    //   // instrumentation_lock_.
    //   bool have_method_entry_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_method_entry_listeners_: NativePointer = this.forced_interpret_only_.add(0x1)

    //   // Do we have any listeners for method exit events? Short-cut to avoid taking the
    //   // instrumentation_lock_.
    //   bool have_method_exit_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_method_exit_listeners_: NativePointer = this.have_method_entry_listeners_.add(0x1)

    //   // Do we have any listeners for method unwind events? Short-cut to avoid taking the
    //   // instrumentation_lock_.
    //   bool have_method_unwind_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_method_unwind_listeners_: NativePointer = this.have_method_exit_listeners_.add(0x1)

    //   // Do we have any listeners for dex move events? Short-cut to avoid taking the
    //   // instrumentation_lock_.
    //   bool have_dex_pc_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_dex_pc_listeners_: NativePointer = this.have_method_unwind_listeners_.add(0x1)

    //   // Do we have any listeners for field read events? Short-cut to avoid taking the
    //   // instrumentation_lock_.
    //   bool have_field_read_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_field_read_listeners_: NativePointer = this.have_dex_pc_listeners_.add(0x1)

    //   // Do we have any listeners for field write events? Short-cut to avoid taking the
    //   // instrumentation_lock_.
    //   bool have_field_write_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_field_write_listeners_: NativePointer = this.have_field_read_listeners_.add(0x1)

    //   // Do we have any exception thrown listeners? Short-cut to avoid taking the instrumentation_lock_.
    //   bool have_exception_thrown_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_exception_thrown_listeners_: NativePointer = this.have_field_write_listeners_.add(0x1)

    //   // Do we have any frame pop listeners? Short-cut to avoid taking the instrumentation_lock_.
    //   bool have_watched_frame_pop_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_watched_frame_pop_listeners_: NativePointer = this.have_exception_thrown_listeners_.add(0x1)

    //   // Do we have any branch listeners? Short-cut to avoid taking the instrumentation_lock_.
    //   bool have_branch_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_branch_listeners_: NativePointer = this.have_watched_frame_pop_listeners_.add(0x1)

    //   // Do we have any exception handled listeners? Short-cut to avoid taking the
    //   // instrumentation_lock_.
    //   bool have_exception_handled_listeners_ GUARDED_BY(Locks::mutator_lock_);
    have_exception_handled_listeners_: NativePointer = this.have_branch_listeners_.add(0x1)

    //   // Contains the instrumentation level required by each client of the instrumentation identified
    //   // by a string key.
    //   typedef SafeMap<const char*, InstrumentationLevel> InstrumentationLevelTable;
    //   InstrumentationLevelTable requested_instrumentation_levels_ GUARDED_BY(Locks::mutator_lock_);
    requested_instrumentation_levels_: NativePointer = this.have_exception_handled_listeners_.add(0x1)

    //     // The event listeners, written to with the mutator_lock_ exclusively held.
    //   // Mutators must be able to iterate over these lists concurrently, that is, with listeners being
    //   // added or removed while iterating. The modifying thread holds exclusive lock,
    //   // so other threads cannot iterate (i.e. read the data of the list) at the same time but they
    //   // do keep iterators that need to remain valid. This is the reason these listeners are std::list
    //   // and not for example std::vector: the existing storage for a std::list does not move.
    //   // Note that mutators cannot make a copy of these lists before iterating, as the instrumentation
    //   // listeners can also be deleted concurrently.
    //   // As a result, these lists are never trimmed. That's acceptable given the low number of
    //   // listeners we have.
    //   std::list<InstrumentationListener*> method_entry_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> method_exit_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> method_unwind_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> branch_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> dex_pc_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> field_read_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> field_write_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> exception_thrown_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> watched_frame_pop_listeners_ GUARDED_BY(Locks::mutator_lock_);
    //   std::list<InstrumentationListener*> exception_handled_listeners_ GUARDED_BY(Locks::mutator_lock_);

    //   // The set of methods being deoptimized (by the debugger) which must be executed with interpreter
    //   // only.
    //   mutable std::unique_ptr<ReaderWriterMutex> deoptimized_methods_lock_ BOTTOM_MUTEX_ACQUIRED_AFTER;
    //   std::unordered_set<ArtMethod*> deoptimized_methods_ GUARDED_BY(GetDeoptimizedMethodsLock());
    //   bool deoptimization_enabled_;

    //   // Current interpreter handler table. This is updated each time the thread state flags are
    //   // modified.
    //   InterpreterHandlerTable interpreter_handler_table_ GUARDED_BY(Locks::mutator_lock_);

    //   // Greater than 0 if quick alloc entry points instrumented.
    //   size_t quick_alloc_entry_points_instrumentation_counter_;

    //   // alloc_entrypoints_instrumented_ is only updated with all the threads suspended, this is done
    //   // to prevent races with the GC where the GC relies on thread suspension only see
    //   // alloc_entrypoints_instrumented_ change during suspend points.
    //   bool alloc_entrypoints_instrumented_;

    //   // If we can use instrumentation trampolines. After the first time we instrument something with
    //   // the interpreter we can no longer use trampolines because it can lead to stack corruption.
    //   // TODO Figure out a way to remove the need for this.
    //   bool can_use_instrumentation_trampolines_;

    private constructor(handle: NativePointer) {
        super(handle)
    }

    public static get Instance(): Instrumentation {
        const handle_ref: NativePointer = ((Java as any).api.artRuntime as NativePointer).add(getArtRuntimeSpec().offset.instrumentation)
        return new Instrumentation(handle_ref)
    }

    toString(): string {
        let disp: string = `Instrumentation< ${this.handle} >`
        if (this.handle.isNull()) return disp
        disp += `\n\t instrumentation_stubs_installed=${this.instrumentation_stubs_installed}`
        disp += `\n\t entry_exit_stubs_installed=${this.entry_exit_stubs_installed}`
        disp += `\n\t interpreter_stubs_installed=${this.interpreter_stubs_installed}`
        disp += `\n\t interpret_only=${this.interpret_only}`
        disp += `\n\t forced_interpret_only=${this.forced_interpret_only}`
        disp += `\n\t have_method_entry_listeners=${this.have_method_entry_listeners}`
        disp += `\n\t have_method_exit_listeners=${this.have_method_exit_listeners}`
        disp += `\n\t have_method_unwind_listeners=${this.have_method_unwind_listeners}`
        disp += `\n\t have_dex_pc_listeners=${this.have_dex_pc_listeners}`
        disp += `\n\t have_field_read_listeners=${this.have_field_read_listeners}`
        disp += `\n\t have_field_write_listeners=${this.have_field_write_listeners}`
        disp += `\n\t have_exception_thrown_listeners=${this.have_exception_thrown_listeners}`
        disp += `\n\t have_watched_frame_pop_listeners=${this.have_watched_frame_pop_listeners}`
        disp += `\n\t have_branch_listeners=${this.have_branch_listeners}`
        disp += `\n\t have_exception_handled_listeners=${this.have_exception_handled_listeners}`
        disp += `\n\t requested_instrumentation_levels=${this.requested_instrumentation_levels}`
        return disp
    }

    get instrumentation_stubs_installed(): boolean {
        return this.instrumentation_stubs_installed_.readU8() == 1
    }

    get entry_exit_stubs_installed(): boolean {
        return this.entry_exit_stubs_installed_.readU8() == 1
    }

    get interpreter_stubs_installed(): boolean {
        return this.interpreter_stubs_installed_.readU8() == 1
    }

    get interpret_only(): boolean {
        return this.interpret_only_.readU8() == 1
    }

    get forced_interpret_only(): boolean {
        return this.forced_interpret_only_.readU8() == 1
    }

    get have_method_entry_listeners(): boolean {
        return this.have_method_entry_listeners_.readU8() == 1
    }

    get have_method_exit_listeners(): boolean {
        return this.have_method_exit_listeners_.readU8() == 1
    }

    get have_method_unwind_listeners(): boolean {
        return this.have_method_unwind_listeners_.readU8() == 1
    }

    get have_dex_pc_listeners(): boolean {
        return this.have_dex_pc_listeners_.readU8() == 1
    }

    get have_field_read_listeners(): boolean {
        return this.have_field_read_listeners_.readU8() == 1
    }

    get have_field_write_listeners(): boolean {
        return this.have_field_write_listeners_.readU8() == 1
    }

    get have_exception_thrown_listeners(): boolean {
        return this.have_exception_thrown_listeners_.readU8() == 1
    }

    get have_watched_frame_pop_listeners(): boolean {
        return this.have_watched_frame_pop_listeners_.readU8() == 1
    }

    get have_branch_listeners(): boolean {
        return this.have_branch_listeners_.readU8() == 1
    }

    get have_exception_handled_listeners(): boolean {
        return this.have_exception_handled_listeners_.readU8() == 1
    }

    // typedef SafeMap<const char*, InstrumentationLevel> InstrumentationLevelTable;
    get requested_instrumentation_levels(): InstrumentationLevelTable {
        return this.requested_instrumentation_levels_
    }

    public static ForceInterpretOnly(): void {
        Instrumentation.Instance.interpret_only_.writeU8(1)
        Instrumentation.Instance.forced_interpret_only_.writeU8(1)
    }

    // void Instrumentation::AddListener(InstrumentationListener* listener, uint32_t events) 
    // art::instrumentation::Instrumentation::AddListener(art::instrumentation::InstrumentationListener*, unsigned int)
    // _ZN3art15instrumentation15Instrumentation11AddListenerEPNS0_23InstrumentationListenerEj
    public static AddListener(listener: InstrumentationListenerInterface, events: InstrumentationEvent): void {
        callSym<void>("_ZN3art15instrumentation15Instrumentation11AddListenerEPNS0_23InstrumentationListenerEj", "libart.so",
            'void',
            ['pointer', 'pointer', 'int'],
            Instrumentation.Instance.handle, new InstrumentationListener(listener).VirtualPtr, events)
    }

}

globalThis.Instrumentation = Instrumentation