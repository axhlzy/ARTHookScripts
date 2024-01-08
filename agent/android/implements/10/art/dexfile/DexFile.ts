import { DexClassDef, DexTryItem } from "./DexFileStructs"
import { StdString } from "../../../../../tools/StdString"
import { JSHandle } from "../../../../JSHandle"
import { OatDexFile } from "../Oat/OatDexFile"
import { DexTypeIndex } from "./DexIndex"
import { PointerSize } from "../Globals"
import { DexHeader } from "./Header"

// virtual class DexFile;
export class DexFile extends JSHandle {

    public static readonly Standard_InsnsOffset: number = 0x2 * 4 + 0x4 * 2
    public static readonly Compact_InsnsOffset: number = 0x2 * 4 + 0x4 * 1

    // v_table
    v_table = this.handle

    // The base address of the data section (same as Begin() for standard dex).
    //   const uint8_t* const data_begin_;
    begin_ = this.currentHandle
    // The base address of the data section (same as Begin() for standard dex).
    //   const uint8_t* const data_begin_;
    size_ = this.begin_.add(PointerSize * 1)
    // The base address of the data section (same as Begin() for standard dex).
    //   const uint8_t* const data_begin_;
    data_begin_ = this.size_.add(PointerSize * 1)
    // The base address of the data section (same as Begin() for standard dex).
    //   const uint8_t* const data_begin_;
    data_size_ = this.data_begin_.add(PointerSize * 1)
    // Typically the dex file name when available, alternatively some identifying string.
    //
    // The ClassLinker will use this to match DexFiles the boot class
    // path to DexCache::GetLocation when loading from an image.
    // const std::string location_;
    location_ = this.data_size_.add(PointerSize * 1) // pointerSize * 3
    // const uint32_t location_checksum_;
    location_checksum_ = this.location_.add(PointerSize * 3)
    // Points to the header section.
    //   const Header* const header_;
    header_ = this.location_checksum_.add(0x4).add(0x4) // 后面计算oat_dex_file_缺了0x4 所以这里应该是内存对齐 （uint32_t -> 0x8）
    // Points to the base of the string identifier list.
    //   const dex::StringId* const string_ids_;
    string_ids_ = this.header_.add(PointerSize * 1)
    // Points to the base of the type identifier list.
    //   const dex::TypeId* const type_ids_;
    type_ids_ = this.string_ids_.add(PointerSize * 1)
    //   // Points to the base of the field identifier list.
    //   const dex::FieldId* const field_ids_;
    field_ids_ = this.type_ids_.add(PointerSize * 1)
    // Points to the base of the method identifier list.
    //   const dex::MethodId* const method_ids_;
    method_ids_ = this.field_ids_.add(PointerSize * 1)
    // Points to the base of the prototype identifier list.
    //   const dex::ProtoId* const proto_ids_;
    proto_ids_ = this.method_ids_.add(PointerSize * 1)
    // Points to the base of the class definition list.
    // Points to the base of the class definition list.
    //   const dex::ClassDef* const class_defs_;
    class_defs_ = this.proto_ids_.add(PointerSize * 1)
    // Points to the base of the method handles list.
    // Points to the base of the method handles list.
    //   const dex::MethodHandleItem* method_handles_;
    method_handles_ = this.class_defs_.add(PointerSize * 1)
    // Number of elements in the method handles list.
    //   size_t num_method_handles_;
    num_method_handles_ = this.method_handles_.add(PointerSize * 1)
    // Points to the base of the call sites id list.
    //   const dex::CallSiteIdItem* call_site_ids_;
    call_site_ids_ = this.num_method_handles_.add(PointerSize * 1)
    // Number of elements in the call sites list.
    //   size_t num_call_site_ids_;
    num_call_site_ids_ = this.call_site_ids_.add(PointerSize * 1)
    // Points to the base of the hiddenapi class data item_, or nullptr if the dex
    // file does not have one.
    //   const dex::HiddenapiClassData* hiddenapi_class_data_;
    hiddenapi_class_data_ = this.num_call_site_ids_.add(PointerSize * 1)
    // If this dex file was loaded from an oat file, oat_dex_file_ contains a
    // pointer to the OatDexFile it was loaded from. Otherwise oat_dex_file_ is
    // null.
    //   mutable const OatDexFile* oat_dex_file_;
    oat_dex_file_ = this.hiddenapi_class_data_.add(PointerSize * 1)
    // Manages the underlying memory allocation.
    //   std::unique_ptr<DexFileContainer> container_;
    container_ = this.oat_dex_file_.add(PointerSize * 1)
    // If the dex file is a compact dex file. If false then the dex file is a standard dex file.
    //   const bool is_compact_dex_;
    is_compact_dex_ = this.container_.add(PointerSize * 1)
    // The domain this dex file belongs to for hidden API access checks.
    // It is decleared `mutable` because the domain is assigned after the DexFile
    // has been created and can be changed later by the runtime.
    //   mutable hiddenapi::Domain hiddenapi_domain_;
    // enum class Domain {
    //     kCorePlatform = 0,
    //     kPlatform,
    //     kApplication,
    //   };
    hiddenapi_domain_ = this.is_compact_dex_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get VirtualClassOffset(): number {
        return PointerSize
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset)
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + (this.hiddenapi_domain_.add(0x4).sub(this.currentHandle).toInt32()) + this.VirtualClassOffset
    }

    toString(): string {
        let disp: string = `DexFile<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t location: ${this.location} @ ${this.location_}`
        disp += `\n\t location_checksum: ${this.location_checksum} ( ${ptr(this.location_checksum)} ) is_compact_dex: ${this.is_compact_dex}`
        disp += `\n\t begin: ${this.begin} size: ${this.size} ( ${ptr(this.size)} ) | data_begin: ${this.data_begin} data_size: ${this.data_size} ( ${ptr(this.data_size)} )`
        disp += `\n\t oat_dex_file_ ${this.oat_dex_file_} | header_: ${this.header}`
        disp += `\n\t string_ids: ${this.string_ids}`
        disp += `\n\t type_ids: ${this.type_ids}`
        disp += `\n\t field_ids: ${this.field_ids}`
        disp += `\n\t method_ids: ${this.method_ids}`
        disp += `\n\t proto_ids: ${this.proto_ids}`
        disp += `\n\t class_defs: ${this.class_defs}`
        disp += `\n\t method_handles: ${this.method_handles} num_method_handles: ${this.num_method_handles}`
        disp += `\n\t call_site_ids: ${this.call_site_ids} num_call_site_ids: ${this.num_call_site_ids}`
        disp += `\n\t hiddenapi_class_data: ${this.hiddenapi_class_data}`
        return disp
    }

    get begin(): NativePointer {
        return this.begin_.readPointer()
    }

    get size(): number {
        return this.size_.readU32()
    }

    get data_begin(): NativePointer {
        return this.data_begin_.readPointer()
    }

    get data_size(): number {
        return this.data_size_.readU32()
    }

    get location(): string {
        try {
            return new StdString(this.location_).toString()
        } catch (error) {
            return "ERROR"
        }
    }

    get location_checksum(): number {
        return this.location_checksum_.readU32()
    }

    get header(): DexHeader {
        return new DexHeader(this.header_.readPointer())
    }

    get string_ids(): NativePointer {
        return this.string_ids_.readPointer()
    }

    get type_ids(): NativePointer {
        return this.type_ids_.readPointer()
    }

    get field_ids(): NativePointer {
        return this.field_ids_.readPointer()
    }

    get method_ids(): NativePointer {
        return this.method_ids_.readPointer()
    }

    get proto_ids(): NativePointer {
        return this.proto_ids_.readPointer()
    }

    get class_defs(): NativePointer {
        return this.class_defs_.readPointer()
    }

    get method_handles(): NativePointer {
        return this.method_handles_.readPointer()
    }

    get num_method_handles(): number {
        return this.num_method_handles_.readU32()
    }

    get call_site_ids(): NativePointer {
        return this.call_site_ids_.readPointer()
    }

    get num_call_site_ids(): number {
        return this.num_call_site_ids_.readU32()
    }

    get hiddenapi_class_data(): NativePointer {
        return this.hiddenapi_class_data_.readPointer()
    }

    get oat_dex_file(): OatDexFile {
        if (this.oat_dex_file_.isNull()) return null
        return new OatDexFile(this.oat_dex_file_.readPointer())
    }

    get container(): NativePointer {
        return this.container_.readPointer()
    }

    get is_compact_dex(): boolean {
        try {
            return this.begin.readCString() == "cdex001"
            // 下面这个莫名其妙的搞不准确，不知道是不是地址没算对，从内存去看似乎也没看出正确的值
            return this.is_compact_dex_.readU8() === 1
        } catch (error) {
            return false
        }
    }

    get hiddenapi_domain(): NativePointer {
        return this.hiddenapi_domain_.readPointer()
    }

    get DexInstsOffset(): number {
        return this.is_compact_dex ? DexFile.Compact_InsnsOffset : DexFile.Standard_InsnsOffset
    }

    dump(fileName?: string, path?: string): void {
        let dexLocation: string = this.location
        dexLocation = dexLocation.substring(dexLocation.lastIndexOf("/") + 1)
        let localName = fileName == undefined ? `${this.begin}_${this.size}_${dexLocation}` : fileName
        let localPath = path == undefined ? getFilesDir() : path
        dumpMem(this.begin, this.size, localName, localPath, false)
        LOGZ(`\t[SaveTo] => ${localPath}/${localName}`)
    }

    // ALWAYS_INLINE std::string PrettyMethod(uint32_t method_idx, bool with_signature = true) const {
    //     std::string result;
    //     AppendPrettyMethod(method_idx, with_signature, &result);
    //     return result;
    //   }
    // _ZNK3art7DexFile12PrettyMethodEjb
    PrettyMethod(method_idx: number, with_signature: boolean = true): string {
        // const PrettyMethodAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile12PrettyMethodEjb")!
        // const PrettyMethod = new NativeFunction(PrettyMethodAddr, "pointer", ["pointer", "pointer", "pointer"])
        // return new StdString(PrettyMethod(this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL) as NativePointer).disposeToString()
        return new StdString(callSym<NativePointer>(
            "_ZNK3art7DexFile12PrettyMethodEjb", "libdexfile.so",
            "pointer", ["pointer", "pointer", "pointer"],
            this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL)
        ).disposeToString()
    }

    // _ZNK3art7DexFile17CalculateChecksumEv
    // virtual uint32_t CalculateChecksum() const;
    CalculateChecksum(): number {
        return callSym<number>(
            "_ZNK3art7DexFile17CalculateChecksumEv", "libdexfile.so",
            "uint32", ["pointer"],
            this.handle)
    }

    // _ZNK3art7DexFile10IsReadOnlyEv
    // bool IsReadOnly() const;
    IsReadOnly(): boolean {
        return callSym<boolean>(
            "_ZNK3art7DexFile10IsReadOnlyEv", "libdexfile.so",
            "bool", ["pointer"],
            this.handle)
    }

    // _ZNK3art7DexFile12DisableWriteEv
    // bool DisableWrite() const;
    DisableWrite(): boolean {
        return callSym<boolean>(
            "_ZNK3art7DexFile12DisableWriteEv", "libdexfile.so",
            "bool", ["pointer"],
            this.handle)
    }

    // _ZNK3art7DexFile11EnableWriteEv
    // bool EnableWrite() const;
    EnableWrite(): boolean {
        return callSym<boolean>(
            "_ZNK3art7DexFile11EnableWriteEv", "libdexfile.so",
            "bool", ["pointer"],
            this.handle)
    }

    // _ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE
    // std::string PrettyType(dex::TypeIndex type_idx) const;
    PrettyType(type_idx: DexTypeIndex): string {
        return callSym<string>(
            "_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE", "libdexfile.so",
            "pointer", ["pointer", "pointer"],
            this.handle, type_idx.index)
    }

    // static int32_t FindTryItem(const dex::TryItem* try_items, uint32_t tries_size, uint32_t address)
    // _ZN3art7DexFile11FindTryItemEPKNS_3dex7TryItemEjj
    static FindTryItem(try_items: DexTryItem, tries_size: number, address: number): number {
        return callSym<number>(
            "_ZN3art7DexFile11FindTryItemEPKNS_3dex7TryItemEjj", "libdexfile.so",
            "int32", ["pointer", "uint", "uint"],
            try_items.handle, tries_size, address)
    }

    // const StringId* DexFile::FindStringId(const char* string) const 
    // _ZNK3art7DexFile12FindStringIdEPKc
    FindStringId(string: string): NativePointer {
        return callSym<NativePointer>(
            "_ZNK3art7DexFile12FindStringIdEPKc", "libdexfile.so",
            "pointer", ["pointer", "pointer"],
            this.handle, Memory.allocUtf8String(string))
    }

    // const ClassDef* DexFile::FindClassDef(dex::TypeIndex type_idx) const
    // _ZNK3art7DexFile12FindClassDefENS_3dex9TypeIndexE
    FindClassDef(type_idx: DexTypeIndex): NativePointer {
        return callSym<NativePointer>(
            "_ZNK3art7DexFile12FindClassDefENS_3dex9TypeIndexE", "libdexfile.so",
            "pointer", ["pointer", "pointer"],
            this.handle, type_idx.index)
    }

    // uint32_t DexFile::FindCodeItemOffset(const ClassDef& class_def, uint32_t method_idx) const 
    // _ZNK3art7DexFile18FindCodeItemOffsetERKNS_3dex8ClassDefEj
    FindCodeItemOffset(class_def: DexClassDef, method_idx: number): number {
        return callSym<number>(
            "_ZNK3art7DexFile18FindCodeItemOffsetERKNS_3dex8ClassDefEj", "libdexfile.so",
            "uint32", ["pointer", "pointer", "uint"],
            this.handle, class_def.handle, method_idx)
    }

}

export class DexFile_CodeItem extends JSHandle {

    constructor(handle: NativePointer) {
        super(handle)
    }

}

Reflect.set(globalThis, "DexFile", DexFile)