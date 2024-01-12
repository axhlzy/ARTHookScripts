import { StdString } from "../../../../../tools/StdString"
import { JSHandle } from "../../../../JSHandle"
import { callSym, getSym } from "../../../../Utils/SymHelper"
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

    // static OatFile* OpenWithElfFile(int zip_fd, ElfFile* elf_file, VdexFile* vdex_file, const std::string& location, const char* abs_dex_location, td::string* error_msg);
    // _ZN3art7OatFile15OpenWithElfFileEiPNS_7ElfFileEPNS_8VdexFileERKNSt3__112basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEEPKcPSB_
    static OpenWithElfFile(zip_fd: number, elf_file: NativePointer, vdex_file: NativePointer, location: string, abs_dex_location: string): OatFile {
        return callSym<OatFile>(
            "_ZN3art7OatFile15OpenWithElfFileEiPNS_7ElfFileEPNS_8VdexFileERKNSt3__112basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEEPKcPSB_", "libart.so",
            "pointer", ["int", "pointer", "pointer", "pointer", "pointer"],
            zip_fd, elf_file, vdex_file, location, abs_dex_location)
    }

    // static OatFile* Open(int zip_fd, const std::string& filename, const std::string& location, bool executable, bool low_4gb, const char* abs_dex_location, /*inout*/MemMap* reservation,  // Where to load if not null. /*out*/std::string* error_msg);
    // _ZN3art7OatFile4OpenEiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEES9_bbPKcPNS_6MemMapEPS7_
    static Open(zip_fd: number, filename: string, location: string, executable: boolean, low_4gb: boolean, abs_dex_location: string, reservation: NativePointer): OatFile {
        return callSym<OatFile>(
            "_ZN3art7OatFile4OpenEiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEES9_bbPKcPNS_6MemMapEPS7_", "libart.so",
            "pointer", ["int", "pointer", "pointer", "bool", "bool", "pointer", "pointer"],
            zip_fd, filename, location, executable, low_4gb, abs_dex_location, reservation)
    }

    // static OatFile* Open(int zip_fd, int vdex_fd, int oat_fd, const std::string& oat_location, bool executable, bool low_4gb, const char* abs_dex_location, /*inout*/MemMap* reservation,  // Where to load if not null. /*out*/std::string* error_msg);
    // _ZN3art7OatFile4OpenEiiiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbPKcPNS_6MemMapEPS7_
    static Open2(zip_fd: number, vdex_fd: number, oat_fd: number, oat_location: string, executable: boolean, low_4gb: boolean, abs_dex_location: string, reservation: NativePointer): OatFile {
        return callSym<OatFile>(
            "_ZN3art7OatFile4OpenEiiiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbPKcPNS_6MemMapEPS7_", "libart.so",
            "pointer", ["int", "int", "int", "pointer", "bool", "bool", "pointer", "pointer"],
            zip_fd, vdex_fd, oat_fd, oat_location, executable, low_4gb, abs_dex_location, reservation)
    }

}

class OatDexFile_Ini extends OatDexFile {

    static hookOpen_1() {
        Interceptor.attach(getSym("_ZN3art7OatFile4OpenEiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEES9_bbPKcPNS_6MemMapEPS7_", "libart.so")!, {
            onEnter: function (args) {
                LOGD(`OatDexFile::Open(\n\tzip_fd=${args[0]}, \n\tfilename=${new StdString(args[1])}, \n\tlocation=${new StdString(args[2])}, \n\texecutable=${args[3]}, \n\tlow_4gb=${args[4]}, \n\tabs_dex_location=${new StdString(args[5])}, \n\treservation=${args[6]}`)
            }
        })
    }

    static hookOpen_2() {
        Interceptor.attach(getSym("_ZN3art7OatFile4OpenEiiiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbPKcPNS_6MemMapEPS7_", "libart.so")!, {
            onEnter: function (args) {
                LOGD(`OatDexFile::Open(\n\tzip_fd=${args[0]}, \n\tvdex_fd=${args[1]}, \n\toat_fd=${args[2]}, \n\toat_location=${new StdString(args[3])}, \n\texecutable=${args[4]}, \n\tlow_4gb=${args[5]}, \n\tabs_dex_location=${new StdString(args[6])}, \n\treservation=${args[7]}`)
            }
        })
    }

    static hookOpenWithElfFile() {
        Interceptor.attach(getSym("_ZN3art7OatFile15OpenWithElfFileEiPNS_7ElfFileEPNS_8VdexFileERKNSt3__112basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEEPKcPSB_", "libart.so")!, {
            onEnter: function (args) {
                LOGD(`OatDexFile::OpenWithElfFile(\n\tzip_fd=${args[0]}, \n\telf_file=${args[1]}, \n\tvdex_file=${args[2]}, \n\tlocation=${new StdString(args[3])}, \n\tabs_dex_location=${new StdString(args[4])})`)
            }
        })
    }

    static hookOpen_3() {
        // OatFileBase* OatFileBase::OpenOatFile(int zip_fd, const std::string& vdex_filename, const std::string& elf_filename, const std::string& location,
        //     bool writable,  bool executable, bool low_4gb, const char* abs_dex_location, /*inout*/MemMap* reservation, /*out*/std::string* error_msg) 
        // _ZN3art11OatFileBase11OpenOatFileINS_10ElfOatFileEEEPS0_iiiRKNSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESC_bbbPKcPNS_6MemMapEPSA_
        Interceptor.attach(getSym("_ZN3art11OatFileBase11OpenOatFileINS_10ElfOatFileEEEPS0_iiiRKNSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESC_bbbPKcPNS_6MemMapEPSA_", "libart.so")!, {
            onEnter: function (args) {
                LOGD(`OatDexFile::OpenOatFile(\n\tzip_fd=${args[0]}, \n\tvdex_filename=${new StdString(args[1])}, \n\telf_filename=${new StdString(args[2])}, \n\tlocation=${new StdString(args[3])}, \n\twritable=${args[4]}, \n\texecutable=${args[5]}, \n\tlow_4gb=${args[6]}, \n\tabs_dex_location=${new StdString(args[7])}, \n\treservation=${args[8]}`)
            }
        })
    }

    static hookOpen_4() {
        // bool DlOpenOatFile::Load(const std::string& elf_filename, bool writable, bool executable, bool low_4gb, /*inout*/MemMap* reservation,  // Where to load if not null. /*out*/std::string* error_msg) 
        // _ZN3art13DlOpenOatFile4LoadERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbbPNS_6MemMapEPS7_
        Interceptor.attach(getSym("_ZN3art13DlOpenOatFile4LoadERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbbPNS_6MemMapEPS7_", "libart.so")!, {
            onEnter: function (args) {
                LOGD(`DlOpenOatFile::Load(\n\telf_filename=${new StdString(args[1])}, \n\twritable=${args[2]}, \n\texecutable=${args[3]}, \n\tlow_4gb=${args[4]}, \n\treservation=${args[5]}`)
                args[2] = ptr(1)
            }
        })
    }

    static hookOpen_5() {
        // bool DlOpenOatFile::Load(const std::string& elf_filename, bool writable, bool executable, bool low_4gb, /*inout*/MemMap* reservation,  // Where to load if not null. /*out*/std::string* error_msg)
        // _ZN3art10ElfOatFile4LoadEibbbPNS_6MemMapEPNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEE
        Interceptor.attach(getSym("_ZN3art10ElfOatFile4LoadEibbbPNS_6MemMapEPNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEE", "libart.so")!, {
            onEnter: function (args) {
                LOGD(`OatDexFile::Load(\n\telf_filename=${new StdString(args[1])}, \n\twritable=${args[2]}, \n\texecutable=${args[3]}, \n\tlow_4gb=${args[4]}, \n\treservation=${args[5]}`)
                args[2] = ptr(1)
            }
        })
    }

}

// setImmediate(() => {
//     // OatDexFile_Ini.hookOpen_1()
//     // OatDexFile_Ini.hookOpen_2()
//     // OatDexFile_Ini.hookOpenWithElfFile()
//     // OatDexFile_Ini.hookOpen_3()
//     OatDexFile_Ini.hookOpen_4()
//     OatDexFile_Ini.hookOpen_5()
// })