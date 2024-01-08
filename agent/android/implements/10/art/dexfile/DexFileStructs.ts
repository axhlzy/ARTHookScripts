// // Raw type_item.
// struct TypeItem {
//     dex::TypeIndex type_idx_;  // index into type_ids section

import { DexProtoIndex, DexStringIndex, DexTypeIndex } from "./DexIndex"
import { JSHandleNotImpl } from "../../../../JSHandle"
import { PointerSize } from "../Globals"

export class DexTypeItem extends JSHandleNotImpl {

    // dex::TypeIndex type_idx_;  // index into type_ids section
    private type_idx_: NativePointer = this.handle

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `TypeItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t type_idx: ${this.type_idx}`
        return disp
    }

    get type_idx(): DexTypeIndex {
        return new DexTypeIndex(this.type_idx_)
    }

    static SizeOfClass: number = PointerSize

}

export class DexTypeList extends JSHandleNotImpl {

    // uint32_t size_;  // size of the list, in entries
    private size_: NativePointer = this.handle
    // TypeItem list_[1];  // elements of the list
    private list_: NativePointer = this.size_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `TypeList<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t size: ${this.size}`
        disp += `\n\t list: ${this.list}`
        return disp
    }

    get size(): number {
        return this.size_.readU32()
    }

    get list(): DexTypeItem[] {
        let list: DexTypeItem[] = []
        for (let i = 0; i < this.size; i++) {
            list.push(new DexTypeItem(this.list_.add(i * DexTypeItem.SizeOfClass)))
        }
        return list
    }

}

export class DexTryItem extends JSHandleNotImpl {

    // dex::TypeIndex type_idx_;  // index into type_ids section
    private type_idx_ = this.handle

    constructor(handle: NativePointer) {
        super(handle)
    }

    get type_idx(): DexTypeIndex {
        return new DexTypeIndex(this.type_idx_)
    }

    toString(): string {
        let disp: string = `TryItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t type_idx: ${this.type_idx}`
        return disp
    }

}

// alignas(4) struct DexClassDef 
export class DexClassDef extends JSHandleNotImpl {

    //   dex::TypeIndex class_idx_;  // index into type_ids_ array for this class
    private class_idx_: NativePointer = this.handle
    //   uint16_t pad1_;  // padding = 0
    private pad1_ = this.class_idx_.add(DexTypeIndex.SizeOfClass) //padding 2 => 0x4
    //   uint32_t access_flags_;
    private access_flags_: NativePointer = this.pad1_.add(0x2)
    //   dex::TypeIndex superclass_idx_;  // index into type_ids_ array for superclass
    private superclass_idx_: NativePointer = this.access_flags_.add(0x4)
    //   uint16_t pad2_;  // padding = 0
    private pad2_ = this.superclass_idx_.add(DexTypeIndex.SizeOfClass) //padding 2 => 0xc
    //   uint32_t interfaces_off_;  // file offset to TypeList
    private interfaces_off_: NativePointer = this.pad2_.add(0x2)
    //   dex::StringIndex source_file_idx_;  // index into string_ids_ for source file name
    private source_file_idx_: NativePointer = this.interfaces_off_.add(0x4)
    //   uint32_t annotations_off_;  // file offset to annotations_directory_item
    private annotations_off_: NativePointer = this.source_file_idx_.add(DexStringIndex.SizeOfClass)
    //   uint32_t class_data_off_;  // file offset to class_data_item
    private class_data_off_: NativePointer = this.annotations_off_.add(0x4)
    //   uint32_t static_values_off_;  // file offset to EncodedArray
    private static_values_off_: NativePointer = this.class_data_off_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `ClassDef<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t class_idx: ${this.class_idx}`
        disp += `\n\t access_flags: ${this.access_flags}`
        disp += `\n\t superclass_idx: ${this.superclass_idx}`
        disp += `\n\t interfaces_off: ${this.interfaces_off}`
        disp += `\n\t source_file_idx: ${this.source_file_idx}`
        disp += `\n\t annotations_off: ${this.annotations_off}`
        disp += `\n\t class_data_off: ${this.class_data_off}`
        disp += `\n\t static_values_off: ${this.static_values_off}`
        return disp
    }

    static get SizeOfClass(): number {
        return DexTypeIndex.SizeOfClass + 0x2 + 0x4 + DexTypeIndex.SizeOfClass + 0x2 + 0x4 + DexStringIndex.SizeOfClass + 0x4 + 0x4 + 0x4
    }

    get class_idx(): DexTypeIndex {
        return new DexTypeIndex(this.class_idx_.readU16())
    }

    get access_flags(): number {
        return this.access_flags_.readU32()
    }

    get superclass_idx(): DexTypeIndex {
        return new DexTypeIndex(this.superclass_idx_.readU16())
    }

    get interfaces_off(): number {
        return this.interfaces_off_.readU32()
    }

    get source_file_idx(): DexStringIndex {
        return new DexStringIndex(this.source_file_idx_.readU32())
    }

    get annotations_off(): number {
        return this.annotations_off_.readU32()
    }

    get class_data_off(): number {
        return this.class_data_off_.readU32()
    }

    get static_values_off(): number {
        return this.static_values_off_.readU32()
    }

}

export class DexStringId extends JSHandleNotImpl {

    // int32_t string_data_off_;  // offset in bytes from the base address
    private string_data_off_: NativePointer = this.handle

    constructor(handle: NativePointer) {
        super(handle)
    }

    get string_data_off(): number {
        return this.string_data_off_.readU32()
    }

    toString(): string {
        let disp: string = `StringId<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t string_data_off: ${this.string_data_off} -> ${ptr(this.string_data_off)}`
        return disp
    }

}

export class DexTypeId extends JSHandleNotImpl {

    // Dex::StringIndex descriptor_idx_;  // index into string_ids
    private descriptor_idx_: NativePointer = this.handle

    constructor(handle: NativePointer) {
        super(handle)
    }

    get descriptor_idx(): DexStringIndex {
        return new DexStringIndex(this.descriptor_idx_.readU16())
    }

    toString(): string {
        let disp: string = `TypeId<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t descriptor_idx: ${this.descriptor_idx}`
        return disp
    }

    static get SizeOfClass(): number {
        return 0x4
    }

}

export class DexFieldId extends JSHandleNotImpl {

    // dex::TypeIndex class_idx_;   // index into type_ids_ array for defining class
    private class_idx_: NativePointer = this.handle
    // dex::TypeIndex type_idx_;    // index into type_ids_ array for field type
    private type_idx_: NativePointer = this.class_idx_.add(DexTypeIndex.SizeOfClass)
    // dex::StringIndex name_idx_;  // index into string_ids_ array for field name
    private name_idx_: NativePointer = this.type_idx_.add(DexTypeIndex.SizeOfClass)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get class_idx(): DexTypeIndex {
        return new DexTypeIndex(this.class_idx_.readU16())
    }

    get type_idx(): DexTypeIndex {
        return new DexTypeIndex(this.type_idx_.readU16())
    }

    get name_idx(): DexStringIndex {
        return new DexStringIndex(this.name_idx_.readU16())
    }

    static get SizeOfClass(): number {
        return 0x2 + 0x2 + 0x4
    }

    toString(): string {
        let disp: string = `FieldId<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t class_idx: ${this.class_idx}`
        disp += `\n\t type_idx: ${this.type_idx}`
        disp += `\n\t name_idx: ${this.name_idx}`
        return disp
    }

}

export class DexProtoId extends JSHandleNotImpl {

    // dex::StringIndex shorty_idx_;     // index into string_ids array for shorty descriptor
    private shorty_idx_: NativePointer = this.handle
    // dex::TypeIndex return_type_idx_;  // index into type_ids array for return type
    private return_type_idx_: NativePointer = this.shorty_idx_.add(DexStringIndex.SizeOfClass)
    // uint16_t pad_;                    // padding = 0
    private pad_: NativePointer = this.return_type_idx_.add(0x2)
    // uint32_t parameters_off_;         // file offset to type_list for parameter types
    private parameters_off_: NativePointer = this.pad_.add(0x2)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get shorty_idx(): DexStringIndex {
        return new DexStringIndex(this.shorty_idx_.readU16())
    }

    get return_type_idx(): DexTypeIndex {
        return new DexTypeIndex(this.return_type_idx_.readU16())
    }

    get parameters_off(): number {
        return this.parameters_off_.readU32()
    }

    static get SizeOfClass(): number {
        return 0x4 + 0x2 + 0x2 + 0x4
    }

    toString(): string {
        let disp: string = `ProtoId<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t shorty_idx: ${this.shorty_idx}`
        disp += `\n\t return_type_idx: ${this.return_type_idx}`
        disp += `\n\t parameters_off: ${this.parameters_off}`
        return disp
    }

}

export class DexMethodId extends JSHandleNotImpl {

    // dex::TypeIndex class_idx_;   // index into type_ids_ array for defining class
    private class_idx_: NativePointer = this.handle
    // dex::ProtoIndex proto_idx_;  // index into proto_ids_ array for method prototype
    private proto_idx_: NativePointer = this.class_idx_.add(DexTypeIndex.SizeOfClass)
    // dex::StringIndex name_idx_;  // index into string_ids_ array for method name
    private name_idx_: NativePointer = this.proto_idx_.add(DexProtoIndex.SizeOfClass)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get class_idx(): DexTypeIndex {
        return new DexTypeIndex(this.class_idx_.readU16())
    }

    get proto_idx(): DexProtoIndex {
        return new DexProtoIndex(this.proto_idx_.readU16())
    }

    get name_idx(): DexStringIndex {
        return new DexStringIndex(this.name_idx_.readU32())
    }

    static get SizeOfClass(): number {
        return 0x2 + 0x2 + 0x4
    }

    toString(): string {
        let disp: string = `MethodId<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t class_idx: ${this.class_idx}`
        disp += `\n\t proto_idx: ${this.proto_idx}`
        disp += `\n\t name_idx: ${this.name_idx}`
        return disp
    }

}

export class DexCallSiteIdItem extends JSHandleNotImpl {

    // uint32_t data_off_;  // Offset into data section pointing to encoded array items.
    private data_off_: NativePointer = this.handle

    constructor(handle: NativePointer) {
        super(handle)
    }

    get data_off(): number {
        return this.data_off_.readU32()
    }

    static get SizeOfClass(): number {
        return 0x4
    }

    tostring(): string {
        let disp: string = `CallSiteIdItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t data_off: ${this.data_off}`
        return disp
    }

}

export class DexMethodHandleItem extends JSHandleNotImpl {

    // uint16_t method_handle_type_;
    private method_handle_type_: NativePointer = this.handle
    // uint16_t reserved1_;            // Reserved for future use.
    private reserved1_: NativePointer = this.method_handle_type_.add(0x2)
    // uint16_t field_or_method_idx_;  // Field index for accessors, method index otherwise.
    private field_or_method_idx_: NativePointer = this.reserved1_.add(0x2)
    // uint16_t reserved2_;            // Reserved for future use.
    private reserved2_: NativePointer = this.field_or_method_idx_.add(0x2)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get method_handle_type(): number {
        return this.method_handle_type_.readU16()
    }

    get field_or_method_idx(): number {
        return this.field_or_method_idx_.readU16()
    }

    static get SizeOfClass(): number {
        return 0x2 + 0x2 + 0x2 + 0x2
    }

    tostring(): string {
        let disp: string = `MethodHandleItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t method_handle_type: ${this.method_handle_type}`
        disp += `\n\t field_or_method_idx: ${this.field_or_method_idx}`
        return disp
    }

}

export class DexAnnotationsDirectoryItem extends JSHandleNotImpl {

    // uint32_t class_annotations_off_;
    public class_annotations_off_: NativePointer = this.handle
    // uint32_t fields_size_;
    private fields_size_: NativePointer = this.class_annotations_off_.add(0x4)
    // uint32_t methods_size_;
    private methods_size_: NativePointer = this.fields_size_.add(0x4)
    // uint32_t parameters_size_;
    private parameters_size_: NativePointer = this.methods_size_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get class_annotations_off(): number {
        return this.class_annotations_off_.readU32()
    }

    get fields_size(): number {
        return this.fields_size_.readU32()
    }

    get methods_size(): number {
        return this.methods_size_.readU32()
    }

    get parameters_size(): number {
        return this.parameters_size_.readU32()
    }

    static get SizeOfClass(): number {
        return 0x4 + 0x4 + 0x4 + 0x4
    }

    toString(): string {
        let disp: string = `AnnotationsDirectoryItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t class_annotations_off: ${this.class_annotations_off}`
        disp += `\n\t fields_size: ${this.fields_size}`
        disp += `\n\t methods_size: ${this.methods_size}`
        disp += `\n\t parameters_size: ${this.parameters_size}`
    }

}

export class DexAnnotationItem extends JSHandleNotImpl {

    // uint8_t visibility_;
    visibility_: NativePointer = this.handle
    // uint8_t annotation_[1];
    annotation_: NativePointer = this.visibility_.add(0x1)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get visibility(): number {
        return this.visibility_.readU8()
    }

    get annotation(): number {
        return this.annotation_.readU8()
    }

    static get SizeOfClass(): number {
        return 0x1 + 0x1
    }

    toString(): string {
        let disp: string = `AnnotationItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t visibility: ${this.visibility}`
        disp += `\n\t annotation: ${this.annotation}`
        return disp
    }

}

export class DexAnnotationSetItem extends JSHandleNotImpl {

    // uint32_t size_;
    private size_: NativePointer = this.handle
    // uint32_t entries_[1];  // offset to DexAnnotationItem
    private entries_: NativePointer = this.size_.add(DexAnnotationItem.SizeOfClass)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get size(): number {
        return this.size_.readU32()
    }

    get entries(): number[] {
        let entries: number[] = []
        for (let i = 0; i < this.size; i++) {
            entries.push(this.entries_.add(i * 0x4).readU32())
        }
        return entries
    }

    static get SizeOfClass(): number {
        return 0x4 + 0x4 // not real
    }

    toString(): string {
        let disp: string = `AnnotationSetItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t size: ${this.size}`
        disp += `\n\t entries: ${this.entries}`
        return disp
    }

}

export class DexFieldAnnotationsItem extends JSHandleNotImpl {

    // uint32_t field_idx_;
    private field_idx_: NativePointer = this.handle
    // uint32_t annotations_off_;
    private annotations_off_: NativePointer = this.field_idx_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get field_idx(): number {
        return this.field_idx_.readU32()
    }

    get annotations_off(): number {
        return this.annotations_off_.readU32()
    }

    static get SizeOfClass(): number {
        return 0x4 + 0x4
    }

    toString(): string {
        let disp: string = `FieldAnnotationsItem<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t field_idx: ${this.field_idx}`
        disp += `\n\t annotations_off: ${this.annotations_off}`
        return disp
    }

}

export class LEB128String {

    private size_: NativePointer = NULL
    private data_: NativePointer = NULL

    private constructor(handle: NativePointer) {
        this.size_ = handle
        this.data_ = this.size_.add(0x1)
    }

    static from(handle: NativePointer): LEB128String {
        return new LEB128String(handle)
    }

    get data_ptr(): NativePointer {
        return this.data_
    }

    get size(): number {
        return this.size_.readU8()
    }

    get str(): string {
        try {
            return this.data_.readUtf8String()
        } catch (error) {
            return ""
        }
    }

    toString(): string {
        return `'${this.str}' | Size:${this.size}`
    }

}

// todo ...


globalThis.DexClassDef = DexClassDef
globalThis.DexStringId = DexStringId
globalThis.DexTypeId = DexTypeId
globalThis.DexFieldId = DexFieldId
globalThis.DexProtoId = DexProtoId
globalThis.DexMethodId = DexMethodId