import { StdString } from "../../../../../tools/StdString"
import { JSHandle } from "../../../../JSHandle"
import { PointerSize } from "../Globals"

export class OatFile extends JSHandle {

    // const std::string location_;
    location_ = this.currentHandle
    // std::unique_ptr<VdexFile> vdex_;
    vdex_ = this.location_.add(PointerSize * 3)
    // const uint8_t* begin_;
    begin_ = this.vdex_.add(PointerSize)
    // const uint8_t* end_;
    end_ = this.begin_.add(PointerSize)
    // const uint8_t* data_bimg_rel_ro_begin_;
    data_bimg_rel_ro_begin_ = this.end_.add(PointerSize)
    // const uint8_t* data_bimg_rel_ro_end_;
    data_bimg_rel_ro_end_ = this.data_bimg_rel_ro_begin_.add(PointerSize)
    // uint8_t* bss_begin_;
    bss_begin_ = this.data_bimg_rel_ro_end_.add(PointerSize)
    // uint8_t* bss_end_;
    bss_end_ = this.bss_begin_.add(PointerSize)
    // uint8_t* bss_methods_;
    bss_methods_ = this.bss_end_.add(PointerSize)
    // uint8_t* bss_roots_;
    bss_roots_ = this.bss_methods_.add(PointerSize)
    // const bool is_executable_;
    is_executable_ = this.bss_roots_.add(PointerSize)
    // uint8_t* vdex_begin_;
    vdex_begin_ = this.is_executable_.add(PointerSize)
    // uint8_t* vdex_end_;
    vdex_end_ = this.vdex_begin_.add(PointerSize)
    // std::vector<const OatDexFile*> oat_dex_files_storage_;
    oat_dex_files_storage_ = this.vdex_end_.add(PointerSize)
    // using Table = AllocationTrackingSafeMap<std::string_view, const OatDexFile*, kAllocatorTagOatFile>;
    // Table oat_dex_files_;
    oat_dex_files_ = this.oat_dex_files_storage_.add(PointerSize)
    // mutable Mutex secondary_lookup_lock_ DEFAULT_MUTEX_ACQUIRED_AFTER;
    secondary_lookup_lock_ = this.oat_dex_files_.add(PointerSize)
    // mutable Table secondary_oat_dex_files_ GUARDED_BY(secondary_lookup_lock_);
    secondary_oat_dex_files_ = this.secondary_lookup_lock_.add(PointerSize)
    // mutable std::list<std::string> string_cache_ GUARDED_BY(secondary_lookup_lock_);
    string_cache_ = this.secondary_oat_dex_files_.add(PointerSize)
    // std::unique_ptr<std::vector<std::unique_ptr<const DexFile>>> uncompressed_dex_files_;
    uncompressed_dex_files_ = this.string_cache_.add(PointerSize)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get SizeOfClass(): number {
        return this.uncompressed_dex_files_.add(PointerSize).sub(this.CurrentHandle).toInt32()
    }

    get VirtualClassOffset(): number {
        return PointerSize
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset)
    }

    toString(): string {
        let disp: string = `OatFile<${this.handle}>`
        disp += `\n\tlocation_: ${this.location} @ ${this.location_}`
        disp += `\n\tbegin: ${this.begin} | end: ${this.end}`
        disp += `\n\tdata_bimg_rel_ro_begin: ${this.data_bimg_rel_ro_begin} | data_bimg_rel_ro_end: ${this.data_bimg_rel_ro_end}`
        disp += `\n\tbss_begin: ${this.bss_begin} | bss_end: ${this.bss_end}`
        disp += `\n\tbss_methods: ${this.bss_methods} | bss_roots: ${this.bss_roots}`
        disp += `\n\tis_executable: ${this.is_executable}`
        disp += `\n\tvdex_begin: ${this.vdex_begin} | vdex_end: ${this.vdex_end}`
        disp += `\n\toat_dex_files_storage: ${this.oat_dex_files_storage} | oat_dex_files: ${this.oat_dex_files}`
        return disp
    }

    get location(): string {
        return new StdString(this.location_).toString()
    }

    get begin(): NativePointer {
        return this.begin_.readPointer()
    }

    get end(): NativePointer {
        return this.end_.readPointer()
    }

    get data_bimg_rel_ro_begin(): NativePointer {
        return this.data_bimg_rel_ro_begin_.readPointer()
    }

    get data_bimg_rel_ro_end(): NativePointer {
        return this.data_bimg_rel_ro_end_.readPointer()
    }

    get bss_begin(): NativePointer {
        return this.bss_begin_.readPointer()
    }

    get bss_end(): NativePointer {
        return this.bss_end_.readPointer()
    }

    get bss_methods(): NativePointer {
        return this.bss_methods_.readPointer()
    }

    get bss_roots(): NativePointer {
        return this.bss_roots_.readPointer()
    }

    get is_executable(): boolean {
        return this.is_executable_.readU8() === 1
    }

    get vdex_begin(): NativePointer {
        return this.vdex_begin_.readPointer()
    }

    get vdex_end(): NativePointer {
        return this.vdex_end_.readPointer()
    }

    get oat_dex_files_storage(): NativePointer {
        return this.oat_dex_files_storage_.readPointer()
    }

    get oat_dex_files(): NativePointer {
        return this.oat_dex_files_.readPointer()
    }

    get secondary_lookup_lock(): NativePointer {
        return this.secondary_lookup_lock_.readPointer()
    }

    get secondary_oat_dex_files(): NativePointer {
        return this.secondary_oat_dex_files_.readPointer()
    }

    get string_cache(): NativePointer {
        return this.string_cache_.readPointer()
    }

    get uncompressed_dex_files(): NativePointer {
        return this.uncompressed_dex_files_.readPointer()
    }

}