//   // Raw header_item.
//   struct Header {
//     uint8_t magic_[8] = {};
//     uint32_t checksum_ = 0;  // See also location_checksum_
//     uint8_t signature_[kSha1DigestSize] = {};
//     uint32_t file_size_ = 0;  // size of entire file
//     uint32_t header_size_ = 0;  // offset to start of next section
//     uint32_t endian_tag_ = 0;
//     uint32_t link_size_ = 0;  // unused
//     uint32_t link_off_ = 0;  // unused
//     uint32_t map_off_ = 0;  // map list offset from data_off_
//     uint32_t string_ids_size_ = 0;  // number of StringIds
//     uint32_t string_ids_off_ = 0;  // file offset of StringIds array
//     uint32_t type_ids_size_ = 0;  // number of TypeIds, we don't support more than 65535
//     uint32_t type_ids_off_ = 0;  // file offset of TypeIds array
//     uint32_t proto_ids_size_ = 0;  // number of ProtoIds, we don't support more than 65535
//     uint32_t proto_ids_off_ = 0;  // file offset of ProtoIds array
//     uint32_t field_ids_size_ = 0;  // number of FieldIds
//     uint32_t field_ids_off_ = 0;  // file offset of FieldIds array
//     uint32_t method_ids_size_ = 0;  // number of MethodIds
//     uint32_t method_ids_off_ = 0;  // file offset of MethodIds array
//     uint32_t class_defs_size_ = 0;  // number of ClassDefs
//     uint32_t class_defs_off_ = 0;  // file offset of ClassDef array
//     uint32_t data_size_ = 0;  // size of data section
//     uint32_t data_off_ = 0;  // file offset of data section
//  };

import { JSHandle } from "../../../../JSHandle"

export class DexHeader extends JSHandle {

    // uint8_t magic_[8] = {};
    magic_: NativePointer = this.CurrentHandle
    // uint32_t checksum_ = 0;  // See also location_checksum_
    checksum_: NativePointer = this.magic_.add(0x1 * 8)
    // uint8_t signature_[kSha1DigestSize] = {};
    signature_: NativePointer = this.checksum_.add(0x4)
    // uint32_t file_size_ = 0;  // size of entire file
    file_size_: NativePointer = this.signature_.add(0x1 * DexHeader.kSha1DigestSize)
    // uint32_t header_size_ = 0;  // offset to start of next section
    header_size_: NativePointer = this.file_size_.add(0x4)
    // uint32_t endian_tag_ = 0;
    endian_tag_: NativePointer = this.header_size_.add(0x4)
    // uint32_t link_size_ = 0;  // unused
    link_size_: NativePointer = this.endian_tag_.add(0x4)
    // uint32_t link_off_ = 0;  // unused
    link_off_: NativePointer = this.link_size_.add(0x4)
    // uint32_t map_off_ = 0;  // map list offset from data_off_
    map_off_: NativePointer = this.link_off_.add(0x4)
    // uint32_t string_ids_size_ = 0;  // number of StringIds
    string_ids_size_: NativePointer = this.map_off_.add(0x4)
    // uint32_t string_ids_off_ = 0;  // file offset of StringIds array
    string_ids_off_: NativePointer = this.string_ids_size_.add(0x4)
    // uint32_t type_ids_size_ = 0;  // number of TypeIds, we don't support more than 65535
    type_ids_size_: NativePointer = this.string_ids_off_.add(0x4)
    // uint32_t type_ids_off_ = 0;  // file offset of TypeIds array
    type_ids_off_: NativePointer = this.type_ids_size_.add(0x4)
    // uint32_t proto_ids_size_ = 0;  // number of ProtoIds, we don't support more than 65535
    proto_ids_size_: NativePointer = this.type_ids_off_.add(0x4)
    // uint32_t proto_ids_off_ = 0;  // file offset of ProtoIds array
    proto_ids_off_: NativePointer = this.proto_ids_size_.add(0x4)
    // uint32_t field_ids_size_ = 0;  // number of FieldIds
    field_ids_size_: NativePointer = this.proto_ids_off_.add(0x4)
    // uint32_t field_ids_off_ = 0;  // file offset of FieldIds array
    field_ids_off_: NativePointer = this.field_ids_size_.add(0x4)
    // uint32_t method_ids_size_ = 0;  // number of MethodIds
    method_ids_size_: NativePointer = this.field_ids_off_.add(0x4)
    // uint32_t method_ids_off_ = 0;  // file offset of MethodIds array
    method_ids_off_: NativePointer = this.method_ids_size_.add(0x4)
    // uint32_t class_defs_size_ = 0;  // number of ClassDefs
    class_defs_size_: NativePointer = this.method_ids_off_.add(0x4)
    // uint32_t class_defs_off_ = 0;  // file offset of ClassDef array
    class_defs_off_: NativePointer = this.class_defs_size_.add(0x4)
    // uint32_t data_size_ = 0;  // size of data section
    data_size_: NativePointer = this.class_defs_off_.add(0x4)
    // uint32_t data_off_ = 0;  // file offset of data section
    data_off_: NativePointer = this.data_size_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    static get kDexMagicSize(): number {
        return 4
    }

    static get kDexVersionLen(): number {
        return 4
    }

    static get kSha1DigestSize(): number {
        return 20
    }

    static get kClassDefinitionOrderEnforcedVersion(): number {
        return 37
    }

    get SizeOfClass(): number {
        return this.data_off_.add(0x4).sub(this.CurrentHandle).toInt32()
    }

    toString(): string {
        const bt_1: ArrayBuffer = this.magic_.readByteArray(DexHeader.kDexMagicSize)
        const btStr_1: string = Array.from(new Uint8Array(bt_1)).map((item: number) => item.toString(16).padStart(2, '0')).join(' ')
        const bt_2: ArrayBuffer = this.magic_.add(DexHeader.kDexMagicSize).readByteArray(DexHeader.kDexVersionLen)
        const btStr_2: string = Array.from(new Uint8Array(bt_2)).map((item: number) => item.toString(16).padStart(2, '0')).join(' ')
        let disp: string = `DexHeader<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t magic: ${this.magic} | ${btStr_1} | ${btStr_2}`
        disp += `\n\t checksum: ${this.checksum}`
        disp += `\n\t signature: ${this.signature}`
        disp += `\n\t file_size: ${this.file_size} | ${ptr(this.file_size)}`
        disp += `\n\t header_size: ${this.header_size} | ${ptr(this.header_size)}`
        disp += `\n\t endian_tag: ${this.endian_tag}`
        disp += `\n\t link_size: ${this.link_size}`
        disp += `\n\t link_off: ${this.link_off}`
        disp += `\n\t map_off: ${this.map_off}`
        disp += `\n\t string_ids_size: ${this.string_ids_size}`
        disp += `\n\t string_ids_off: ${this.string_ids_off}`
        disp += `\n\t type_ids_size: ${this.type_ids_size}`
        disp += `\n\t type_ids_off: ${this.type_ids_off}`
        disp += `\n\t proto_ids_size: ${this.proto_ids_size}`
        disp += `\n\t proto_ids_off: ${this.proto_ids_off}`
        disp += `\n\t field_ids_size: ${this.field_ids_size}`
        disp += `\n\t field_ids_off: ${this.field_ids_off}`
        disp += `\n\t method_ids_size: ${this.method_ids_size}`
        disp += `\n\t method_ids_off: ${this.method_ids_off}`
        disp += `\n\t class_defs_size: ${this.class_defs_size}`
        disp += `\n\t class_defs_off: ${this.class_defs_off}`
        disp += `\n\t data_size: ${this.data_size}`
        disp += `\n\t data_off: ${this.data_off}`
        return disp
    }

    GetVersion(): number {
        return this.magic_.add(DexHeader.kDexMagicSize).readU32()
    }

    get magic(): string {
        return this.magic_.readCString()
    }

    get checksum(): NativePointer {
        return ptr(this.checksum_.readU32())
    }

    get signature(): number {
        return this.signature_.readU32()
    }

    get file_size(): number {
        return this.file_size_.readU32()
    }

    get header_size(): number {
        return this.header_size_.readU32()
    }

    get endian_tag(): number {
        return this.endian_tag_.readU32()
    }

    get link_size(): number {
        return this.link_size_.readU32()
    }

    get link_off(): NativePointerValue {
        return ptr(this.link_off_.readU32())
    }

    get map_off(): NativePointerValue {
        return ptr(this.map_off_.readU32())
    }

    get string_ids_size(): number {
        return this.string_ids_size_.readU32()
    }

    get string_ids_off(): NativePointerValue {
        return ptr(this.string_ids_off_.readU32())
    }

    get type_ids_size(): number {
        return this.type_ids_size_.readU32()
    }

    get type_ids_off(): NativePointerValue {
        return ptr(this.type_ids_off_.readU32())
    }

    get proto_ids_size(): number {
        return this.proto_ids_size_.readU32()
    }

    get proto_ids_off(): NativePointerValue {
        return ptr(this.proto_ids_off_.readU32())
    }

    get field_ids_size(): number {
        return this.field_ids_size_.readU32()
    }

    get field_ids_off(): NativePointerValue {
        return ptr(this.field_ids_off_.readU32())
    }

    get method_ids_size(): number {
        return this.method_ids_size_.readU32()
    }

    get method_ids_off(): NativePointerValue {
        return ptr(this.method_ids_off_.readU32())
    }

    get class_defs_size(): number {
        return this.class_defs_size_.readU32()
    }

    get class_defs_off(): NativePointerValue {
        return ptr(this.class_defs_off_.readU32())
    }

    get data_size(): number {
        return this.data_size_.readU32()
    }

    get data_off(): NativePointerValue {
        return ptr(this.data_off_.readU32())
    }

}