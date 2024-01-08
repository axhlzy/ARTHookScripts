import {
    DexAnnotationSetItem,
    DexAnnotationsDirectoryItem,
    DexCallSiteIdItem, DexClassDef, DexFieldAnnotationsItem, DexFieldId, DexMethodHandleItem, DexMethodId,
    DexProtoId, DexStringId, DexTryItem, DexTypeId, DexTypeList, LEB128String
} from "./DexFileStructs"
import { StdString } from "../../../../../tools/StdString"
import { DexStringIndex, DexTypeIndex } from "./DexIndex"
import { JSHandle } from "../../../../JSHandle"
import { OatDexFile } from "../Oat/OatDexFile"
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
        disp += `\n\t oat_dex_file_ ${this.oat_dex_file_}`
        // disp += `\n\t oat_dex_file_ ${this.oat_dex_file_} | header_: ${this.header}`
        disp += `\n\t string_ids: ${this.string_ids}`
        disp += `\n\t type_ids: ${this.type_ids}`
        disp += `\n\t field_ids: ${this.field_ids}`
        disp += `\n\t method_ids: ${this.method_ids}`
        disp += `\n\t proto_ids: ${this.proto_ids}`
        disp += `\n\t class_defs: ${this.class_defs}`
        disp += `\n\t method_handles: ${this.method_handles} num_method_handles: ${this.num_method_handles}`
        disp += `\n\t call_site_ids: ${this.call_site_ids} num_call_site_ids: ${this.num_call_site_ids}`
        disp += `\n\t hiddenapi_class_data: ${this.hiddenapi_class_data}`
        disp += `\n\n${this.header}`
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

    StringDataByIdx(index: DexStringIndex | number): LEB128String {
        const index_: number = index instanceof DexStringIndex ? index.index : index
        if (index_ < 0 || index_ > this.header.string_ids_size) throw new Error("index out of range")
        const string_id = this.string_ids.add(index_ * 0x4).readU32()
        const string_data = this.data_begin.add(string_id)
        return LEB128String.from(string_data)
    }

    NumStringIds(): number {
        return this.header.string_ids_size
    }

    FindStringId(string: string): number {
        for (let i = 0; i < this.NumStringIds(); i++) {
            const string_id = this.StringDataByIdx(i)
            if (string_id.str == string) return i
        }
        return -1
    }

    get type_ids(): NativePointer {
        return this.type_ids_.readPointer()
    }

    // const dex::TypeId& GetTypeId(dex::TypeIndex idx) const
    GetTypeId(idx: DexTypeIndex | number): DexTypeId {
        const idx_: number = idx instanceof DexTypeIndex ? idx.index : idx
        if (idx_ < 0 || idx_ > this.header.type_ids_size) throw new Error("index out of range")
        return new DexTypeId(this.type_ids.add(idx_ * DexTypeId.SizeOfClass))
    }

    GetTypeDescriptor(type_idx: DexTypeIndex | number): string {
        const type_idx_: number = type_idx instanceof DexTypeIndex ? type_idx.index : type_idx
        if (type_idx_ < 0 || type_idx_ > this.header.type_ids_size) throw new Error("index out of range")
        const type_id = this.type_ids.add(type_idx_ * 0x4).readU32()
        const type_descriptor = this.StringDataByIdx(type_id)
        return type_descriptor.str
    }

    get field_ids(): NativePointer {
        return this.field_ids_.readPointer()
    }

    // size_t NumFieldIds() const 
    NumFieldIds(): number {
        return this.header.field_ids_size
    }

    // const dex::FieldId& GetFieldId(uint32_t idx) const
    GetFieldId(idx: number): DexFieldId {
        if (idx < 0 || idx > this.header.field_ids_size) throw new Error("index out of range")
        return new DexFieldId(this.field_ids.add(idx * DexFieldId.SizeOfClass))
    }

    // const dex::FieldAnnotationsItem* GetFieldAnnotations(const dex::AnnotationsDirectoryItem* anno_dir) const 
    GetFieldAnnotations(anno_dir: DexAnnotationsDirectoryItem): DexFieldAnnotationsItem {
        return new DexFieldAnnotationsItem(this.data_begin.add(anno_dir.fields_size == 0 ? NULL : anno_dir.class_annotations_off_.add(PointerSize)))
    }

    get proto_ids(): NativePointer {
        return this.proto_ids_.readPointer()
    }

    // size_t NumProtoIds() const 
    NumProtoIds(): number {
        return this.header.proto_ids_size
    }

    // const dex::ProtoId& GetProtoId(dex::ProtoIndex idx) const
    GetProtoId(idx: DexTypeIndex | number): DexProtoId {
        const idx_: number = idx instanceof DexTypeIndex ? idx.index : idx
        if (idx_ < 0 || idx_ > this.header.proto_ids_size) throw new Error("index out of range")
        return new DexProtoId(this.proto_ids.add(idx_ * DexProtoId.SizeOfClass))
    }

    // const char* GetShorty(dex::ProtoIndex proto_idx) const;
    GetShorty(proto_idx: DexTypeIndex | number): string {
        return this.StringDataByIdx(this.GetProtoId(proto_idx).shorty_idx).str
    }

    // const char* GetReturnTypeDescriptor(const dex::ProtoId& proto_id) const;
    GetReturnTypeDescriptor(proto_id: DexProtoId): string {
        return this.StringDataByIdx(proto_id.return_type_idx).str
    }

    // const dex::TypeList* GetProtoParameters(const dex::ProtoId& proto_id) const
    GetProtoParameters(proto_id: DexProtoId): DexTypeList {
        return new DexTypeList(this.data_begin.add(proto_id.parameters_off))
    }

    get method_ids(): NativePointer {
        return this.method_ids_.readPointer()
    }

    // const dex::MethodId& GetMethodId(uint32_t idx) const 
    GetMethodId(idx: number): DexMethodId {
        if (idx < 0 || idx > this.header.method_ids_size) throw new Error("index out of range")
        return new DexMethodId(this.method_ids.add(idx * DexMethodId.SizeOfClass))
    }

    get class_defs(): NativePointer {
        return this.class_defs_.readPointer()
    }

    // const dex::ClassDef& GetClassDef(uint16_t idx) const 
    GetClassDef(idx: number): DexClassDef {
        if (idx < 0 || idx > this.header.class_defs_size) throw new Error("index out of range")
        return new DexClassDef(this.class_defs.add(idx * DexClassDef.SizeOfClass))
    }

    // const char* GetClassDescriptor(const dex::ClassDef& class_def) const
    GetClassDescriptor(class_def: DexClassDef | number): string {
        const class_idx = class_def instanceof DexClassDef ? class_def.class_idx.index : class_def
        const type_id = this.type_ids.add(class_idx * 0x4).readU32()
        const type_descriptor = this.StringDataByIdx(type_id)
        return type_descriptor.str
    }

    // const dex::ClassDef* FindClassDef(dex::TypeIndex type_idx) const
    FindClassDef(type_idx: DexTypeIndex): DexClassDef {
        return new DexClassDef(this.data_begin.add(this.header.class_defs_off).add(type_idx.index * DexClassDef.SizeOfClass))
    }

    // const dex::AnnotationsDirectoryItem* GetAnnotationsDirectory(const dex::ClassDef& class_def)
    GetAnnotationsDirectory(class_def: DexClassDef): DexAnnotationsDirectoryItem {
        return new DexAnnotationsDirectoryItem(this.data_begin.add(class_def.annotations_off))
    }

    // const dex::AnnotationSetItem* GetClassAnnotationSet(const dex::AnnotationsDirectoryItem* anno_dir)
    GetClassAnnotationSet(anno_dir: DexAnnotationsDirectoryItem): DexAnnotationSetItem {
        return new DexAnnotationSetItem(this.data_begin.add(anno_dir.class_annotations_off))
    }

    // uint32_t NumClassDefs() const
    NumClassDefs(): number {
        return this.header.class_defs_size
    }

    // const dex::TypeList* GetInterfacesList(const dex::ClassDef& class_def) const 
    GetInterfacesList(class_def: DexClassDef): DexTypeList {
        return new DexTypeList(this.data_begin.add(class_def.interfaces_off))
    }

    get method_handles(): NativePointer {
        return this.method_handles_.readPointer()
    }

    get num_method_handles(): number {
        return this.num_method_handles_.readU32()
    }

    // uint32_t NumMethodHandles() const
    NumMethodHandles(): number {
        return this.num_method_handles
    }

    // const dex::MethodHandleItem& GetMethodHandle(uint32_t idx) const 
    GetMethodHandle(idx: number): DexMethodHandleItem {
        if (idx < 0 || idx > this.num_method_handles) throw new Error("index out of range")
        return new DexMethodHandleItem(this.method_handles.add(idx * DexMethodHandleItem.SizeOfClass))
    }

    get call_site_ids(): NativePointer {
        return this.call_site_ids_.readPointer()
    }

    get num_call_site_ids(): number {
        return this.num_call_site_ids_.readU32()
    }

    // uint32_t NumCallSiteIds() const
    NumCallSiteIds(): number {
        return this.num_call_site_ids
    }

    // const dex::CallSiteIdItem& GetCallSiteId(uint32_t idx) const 
    GetCallSiteId(idx: number): DexCallSiteIdItem {
        if (idx < 0 || idx > this.num_call_site_ids) throw new Error("index out of range")
        return new DexCallSiteIdItem(this.call_site_ids.add(idx * DexCallSiteIdItem.SizeOfClass))
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
    FindStringId_(string: string): DexStringId {
        return new DexStringId(callSym<NativePointer>(
            "_ZNK3art7DexFile12FindStringIdEPKc", "libdexfile.so",
            "pointer", ["pointer", "pointer"],
            this.handle, Memory.allocUtf8String(string)))
    }

    // const ClassDef* DexFile::FindClassDef(dex::TypeIndex type_idx) const
    // _ZNK3art7DexFile12FindClassDefENS_3dex9TypeIndexE
    FindClassDef_(type_idx: DexTypeIndex): NativePointer {
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