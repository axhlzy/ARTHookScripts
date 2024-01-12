import { callSym } from "../../../Utils/SymHelper"
import { JSHandle } from "../../../JSHandle"
import { PointerSize } from "./Globals"
import { ObjPtr } from "./ObjPtr"

export class ClassLinker extends JSHandle {

    // std::vector<const DexFile*> boot_class_path_;
    boot_class_path_: NativePointer = this.CurrentHandle
    // std::vector<std::unique_ptr<const DexFile>> boot_dex_files_;
    boot_dex_files_: NativePointer = this.boot_class_path_.add(PointerSize)
    // std::list<DexCacheData> dex_caches_ GUARDED_BY(Locks::dex_lock_);
    dex_caches_: NativePointer = this.boot_dex_files_.add(PointerSize)
    // std::list<ClassLoaderData> class_loaders_
    class_loaders_: NativePointer = this.dex_caches_.add(PointerSize)
    // std::unique_ptr<ClassTable> boot_class_table_ GUARDED_BY(Locks::classlinker_classes_lock_);
    boot_class_table_: NativePointer = this.class_loaders_.add(PointerSize)
    // td::vector<GcRoot<mirror::Class>> new_class_roots_ GUARDED_BY(Locks::classlinker_classes_lock_);
    new_class_roots_: NativePointer = this.boot_class_table_.add(PointerSize)
    // std::vector<const OatFile*> new_bss_roots_boot_oat_files_GUARDED_BY(Locks::classlinker_classes_lock_);
    new_bss_roots_boot_oat_files_: NativePointer = this.new_class_roots_.add(PointerSize)
    // Atomic<uint32_t> failed_dex_cache_class_lookups_;
    failed_dex_cache_class_lookups_: NativePointer = this.new_bss_roots_boot_oat_files_.add(PointerSize)
    // GcRoot<mirror::ObjectArray<mirror::Class>> class_roots_;
    class_roots_: NativePointer = this.failed_dex_cache_class_lookups_.add(PointerSize)
    static kFindArrayCacheSize: NativePointer = ptr(16)
    // GcRoot<mirror::Class> find_array_class_cache_[kFindArrayCacheSize];
    find_array_class_cache_: NativePointer = this.class_roots_.add(0x4)
    // size_t find_array_class_cache_next_victim_;
    find_array_class_cache_next_victim_: NativePointer = this.find_array_class_cache_.add(0x4)
    // bool init_done_;
    init_done_: NativePointer = this.find_array_class_cache_next_victim_.add(PointerSize)
    // bool log_new_roots_ GUARDED_BY(Locks::classlinker_classes_lock_);
    log_new_roots_: NativePointer = this.init_done_.add(PointerSize)
    // const bool fast_class_not_found_exceptions_;
    fast_class_not_found_exceptions_: NativePointer = this.log_new_roots_.add(PointerSize)

    // const void* quick_resolution_trampoline_;
    quick_resolution_trampoline_: NativePointer = this.fast_class_not_found_exceptions_.add(PointerSize)
    // const void* quick_imt_conflict_trampoline_;
    quick_imt_conflict_trampoline_: NativePointer = this.quick_resolution_trampoline_.add(PointerSize)
    // const void* quick_generic_jni_trampoline_;
    quick_generic_jni_trampoline_: NativePointer = this.quick_imt_conflict_trampoline_.add(PointerSize)
    // const void* quick_to_interpreter_bridge_trampoline_;
    quick_to_interpreter_bridge_trampoline_: NativePointer = this.quick_generic_jni_trampoline_.add(PointerSize)

    // PointerSize image_pointer_size_;
    image_pointer_size_: NativePointer = this.quick_to_interpreter_bridge_trampoline_.add(PointerSize)
    // std::unique_ptr<ClassHierarchyAnalysis> cha_;
    cha_: NativePointer = this.image_pointer_size_.add(PointerSize)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get CurrentHandle(): NativePointer {
        return this.handle
    }

    get SizeOfClass(): number {
        return this.cha_.add(PointerSize).sub(this.handle).toInt32()
    }

    toString(): string {
        let disp: string = `ClassLinker<${this.handle}>`
        return disp
    }

    IsReadOnly(): boolean {
        return callSym<boolean>(
            "_ZNK3art7DexFile10IsReadOnlyEv", "libdexfile.so",
            "bool", ["pointer"],
            this.handle)
    }

    // ObjPtr<mirror::Class> LookupClass(Thread* self,
    //     const char* descriptor,
    //     ObjPtr<mirror::ClassLoader> class_loader)
    // _ZN3art11ClassLinker11LookupClassEPNS_6ThreadEPKcNS_6ObjPtrINS_6mirror11ClassLoaderEEE
    LookupClass(descriptor: string, class_loader: ObjPtr): ObjPtr {
        return callSym<ObjPtr>(
            "_ZN3art11ClassLinker11LookupClassEPNS_6ThreadEPKcNS_6ObjPtrINS_6mirror11ClassLoaderEEE", "libart.so",
            "pointer", ["pointer", "pointer", "pointer"],
            this.handle, Memory.allocUtf8String(descriptor), class_loader)
    }


}