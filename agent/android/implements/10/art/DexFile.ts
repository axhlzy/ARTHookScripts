import { StdString } from "../../../../tools/StdString"
import { JSHandle } from "../../../JSHandle"
import { PointerSize } from "./Globals"

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
    header_ = this.location_checksum_.add(0x4)
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

    toString(): String {
        let disp: String = `DexFile<${this.handle}> \n`
        disp += `location: ${this.location} \n`
        disp += `location_checksum: ${this.location_checksum} ( ${ptr(this.location_checksum)} ) is_compact_dex: ${this.is_compact_dex} \n`
        disp += `begin: ${this.begin} size: ${this.size} ( ${ptr(this.size)} ) | data_begin: ${this.data_begin} data_size: ${this.data_size} ( ${ptr(this.data_size)} ) `
        return disp
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
    PrettyType(type_idx: number): string {
        return callSym<string>(
            "_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE", "libdexfile.so",
            "pointer", ["pointer", "pointer"],
            this.handle, ptr(type_idx))
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
        return new StdString(this.location_).toString()
    }

    get location_checksum(): number {
        return this.location_checksum_.readU32()
    }

    get header(): NativePointer {
        return this.header_.readPointer()
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

    get oat_dex_file(): NativePointer {
        return this.oat_dex_file_.readPointer()
    }

    get container(): NativePointer {
        return this.container_.readPointer()
    }

    get is_compact_dex(): boolean {
        return this.begin.readCString() == "cdex001"
        // 下面这个莫名其妙的搞不准确，不知道是不是地址没算对，从内存去看似乎也没看出正确的值
        return this.is_compact_dex_.readU8() === 1
    }

    get hiddenapi_domain(): NativePointer {
        return this.hiddenapi_domain_.readPointer()
    }

    get DexInstsOffset(): number {
        return this.is_compact_dex ? DexFile.Compact_InsnsOffset : DexFile.Standard_InsnsOffset
    }

}

export class DexFile_CodeItem extends JSHandle {

    constructor(handle: NativePointer) {
        super(handle)
    }

}

Reflect.set(globalThis, "DexFile", DexFile)