import { StdString } from "../../../../../tools/StdString"
import { JSHandle } from "../../../../JSHandle"
import { PointerSize } from "../Globals"
import { OatFile } from "./OatFile"

export class OatDexFile extends JSHandle {

    //   const OatFile* const oat_file_ = nullptr;
    private oat_file_: NativePointer = this.CurrentHandle
    //   const std::string dex_file_location_;
    private dex_file_location_: NativePointer = this.oat_file_.add(PointerSize)
    //   const std::string canonical_dex_file_location_;
    private canonical_dex_file_location_: NativePointer = this.dex_file_location_.add(PointerSize * 3)
    //   const uint32_t dex_file_location_checksum_ = 0u;
    private dex_file_location_checksum_: NativePointer = this.canonical_dex_file_location_.add(PointerSize * 3)
    //   const uint8_t* const dex_file_pointer_ = nullptr;
    private dex_file_pointer_: NativePointer = this.dex_file_location_checksum_.add(PointerSize)
    //   const uint8_t* const lookup_table_data_ = nullptr;
    private lookup_table_data_: NativePointer = this.dex_file_pointer_.add(PointerSize)
    //   const IndexBssMapping* const method_bss_mapping_ = nullptr;
    private method_bss_mapping_: NativePointer = this.lookup_table_data_.add(PointerSize)
    //   const IndexBssMapping* const type_bss_mapping_ = nullptr;
    private type_bss_mapping_: NativePointer = this.method_bss_mapping_.add(PointerSize)
    //   const IndexBssMapping* const string_bss_mapping_ = nullptr;
    private string_bss_mapping_: NativePointer = this.type_bss_mapping_.add(PointerSize)
    //   const uint32_t* const oat_class_offsets_pointer_ = nullptr;
    private oat_class_offsets_pointer_: NativePointer = this.string_bss_mapping_.add(PointerSize)
    //   TypeLookupTable lookup_table_;
    private lookup_table_: NativePointer = this.oat_class_offsets_pointer_.add(PointerSize)
    //   const DexLayoutSections* const dex_layout_sections_ = nullptr;
    private dex_layout_sections_: NativePointer = this.lookup_table_.add(PointerSize)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get SizeOfClass(): number {
        return this.dex_layout_sections_.add(PointerSize).sub(this.CurrentHandle).toInt32()
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset)
    }

    get VirtualClassOffset(): number {
        return 0
    }

    toString(): string {
        let disp: string = `OatDexFile<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t oat_file = ${this.oat_file_}`
        disp += `\n\t dex_file_location = ${this.dex_file_location} @ ${this.dex_file_location_}`
        disp += `\n\t canonical_dex_file_location = ${this.canonical_dex_file_location} @ ${this.canonical_dex_file_location_}`
        disp += `\n\t dex_file_location_checksum = ${this.dex_file_location_checksum} | ${ptr(this.dex_file_location_checksum)} @ ${this.dex_file_location_checksum_}`
        disp += `\n\t dex_file_pointer = ${this.dex_file_pointer} @ ${this.dex_file_pointer_}`
        disp += `\n\t lookup_table_data = ${this.lookup_table_data} @ ${this.lookup_table_data_}`
        disp += `\n\t method_bss_mapping = ${this.method_bss_mapping} @ ${this.method_bss_mapping_}`
        disp += `\n\t type_bss_mapping = ${this.type_bss_mapping} @ ${this.type_bss_mapping_}`
        disp += `\n\t string_bss_mapping = ${this.string_bss_mapping} @ ${this.string_bss_mapping_}`
        disp += `\n\t oat_class_offsets_pointer = ${this.oat_class_offsets_pointer} @ ${this.oat_class_offsets_pointer_}`
        disp += `\n\t lookup_table = ${this.lookup_table} @ ${this.lookup_table_}`
        disp += `\n\t dex_layout_sections = ${this.dex_layout_sections} @ ${this.dex_layout_sections_}`
        return disp
    }

    get oat_file(): OatFile {
        if (this.oat_file_.isNull()) return null
        return new OatFile(this.oat_file_.readPointer())
    }

    get dex_file_location(): string {
        return new StdString(this.dex_file_location_).toString()
    }

    get canonical_dex_file_location(): string {
        return new StdString(this.canonical_dex_file_location_).toString()
    }

    get dex_file_location_checksum(): number {
        return this.dex_file_location_checksum_.readUInt()
    }

    // the same to DexFile->begin
    get dex_file_pointer(): NativePointer {
        return this.dex_file_pointer_.readPointer()
    }

    get lookup_table_data(): NativePointer {
        return this.lookup_table_data_.readPointer()
    }

    get method_bss_mapping(): NativePointer {
        return this.method_bss_mapping_.readPointer()
    }

    get type_bss_mapping(): NativePointer {
        return this.type_bss_mapping_.readPointer()
    }

    get string_bss_mapping(): NativePointer {
        return this.string_bss_mapping_.readPointer()
    }

    get oat_class_offsets_pointer(): number {
        return this.oat_class_offsets_pointer_.readU32()
    }

    get lookup_table(): NativePointer {
        return this.lookup_table_.readPointer()
    }

    get dex_layout_sections(): NativePointer {
        return this.dex_layout_sections_.readPointer()
    }

}