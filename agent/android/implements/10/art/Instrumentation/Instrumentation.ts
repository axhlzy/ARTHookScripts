import { JSHandle } from "../../../../JSHandle"
import { PointerSize } from "../Globals"

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

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `Instrumentation< ${this.handle} >`
        if (this.handle.isNull()) return disp
        // disp += `\n${this.instrumentation_stubs_installed}`
        // disp += `\n${this.entry_exit_stubs_installed}`
        // disp += `\n${this.interpreter_stubs_installed}`
        // disp += `\n${this.interpret_only}`
        // disp += `\n${this.forced_interpret_only}`
        // disp += `\n${this.have_method_entry_listeners}`
        // disp += `\n${this.have_method_exit_listeners}`
        // disp += `\n${this.have_method_unwind_listeners}`
        // disp += `\n${this.have_dex_pc_listeners}`
        // disp += `\n${this.have_field_read_listeners}`
        // disp += `\n${this.have_field_write_listeners}`
        // disp += `\n${this.have_exception_thrown_listeners}`
        // disp += `\n${this.have_watched_frame_pop_listeners}`
        // disp += `\n${this.have_branch_listeners}`
        // disp += `\n${this.have_exception_handled_listeners}`
        // disp += `\n${this.requested_instrumentation_levels}`
        return disp
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + (this.requested_instrumentation_levels_.add(PointerSize).sub(this.CurrentHandle).toInt32())
    }

}