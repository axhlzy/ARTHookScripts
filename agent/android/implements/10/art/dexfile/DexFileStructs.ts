// // Raw type_item.
// struct TypeItem {
//     dex::TypeIndex type_idx_;  // index into type_ids section

import { JSHandle } from "../../../../JSHandle"
import { PointerSize } from "../Globals"
import { DexStringIndex, DexTypeIndex } from "./DexIndex"

export class DexTypeItem extends JSHandle {

    // dex::TypeIndex type_idx_;  // index into type_ids section
    type_idx_: NativePointer = this.CurrentHandle.add(0x0)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get type_idx(): DexTypeIndex {
        return new DexTypeIndex(this.type_idx_)
    }

    static SizeOfClass: number = PointerSize

}

export class DexTypeList extends JSHandle {

    // uint32_t size_;  // size of the list, in entries
    size_: NativePointer = this.CurrentHandle.add(0x0)
    // TypeItem list_[1];  // elements of the list
    list_: NativePointer = this.CurrentHandle.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
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

export class DexTryItem extends JSHandle {

    // dex::TypeIndex type_idx_;  // index into type_ids section
    type_idx_ = this.CurrentHandle.add(0x0)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get type_idx(): DexTypeIndex {
        return new DexTypeIndex(this.type_idx_)
    }

}

// alignas(4) struct DexClassDef 
export class DexClassDef extends JSHandle {

    //   dex::TypeIndex class_idx_;  // index into type_ids_ array for this class
    class_idx_: NativePointer = this.CurrentHandle.add(0x0)
    //   uint16_t pad1_;  // padding = 0
    pad1_ = this.class_idx_.add(DexTypeIndex.SizeOfClass) //padding 2 => 0x4
    //   uint32_t access_flags_;
    access_flags_: NativePointer = this.pad1_.add(0x2)
    //   dex::TypeIndex superclass_idx_;  // index into type_ids_ array for superclass
    superclass_idx_: NativePointer = this.access_flags_.add(0x4)
    //   uint16_t pad2_;  // padding = 0
    pad2_ = this.superclass_idx_.add(DexTypeIndex.SizeOfClass) //padding 2 => 0xc
    //   uint32_t interfaces_off_;  // file offset to TypeList
    interfaces_off_: NativePointer = this.pad2_.add(0x2)
    //   dex::StringIndex source_file_idx_;  // index into string_ids_ for source file name
    source_file_idx_: NativePointer = this.interfaces_off_.add(0x4)
    //   uint32_t annotations_off_;  // file offset to annotations_directory_item
    annotations_off_: NativePointer = this.source_file_idx_.add(DexStringIndex.SizeOfClass)
    //   uint32_t class_data_off_;  // file offset to class_data_item
    class_data_off_: NativePointer = this.annotations_off_.add(0x4)
    //   uint32_t static_values_off_;  // file offset to EncodedArray
    static_values_off_: NativePointer = this.class_data_off_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get SizeOfClass(): number {
        return this.static_values_off_.add(0x4).sub(this.CurrentHandle).toInt32()
    }

    get class_idx(): DexTypeIndex {
        return new DexTypeIndex(this.class_idx_)
    }

    get access_flags(): NativePointer {
        return this.access_flags_
    }

    get superclass_idx(): DexTypeIndex {
        return new DexTypeIndex(this.superclass_idx_)
    }

    get interfaces_off(): NativePointer {
        return this.interfaces_off_
    }

    get source_file_idx(): DexStringIndex {
        return new DexStringIndex(this.source_file_idx_)
    }

    get annotations_off(): NativePointer {
        return this.annotations_off_
    }

    get class_data_off(): NativePointer {
        return this.class_data_off_
    }

    get static_values_off(): NativePointer {
        return this.static_values_off_
    }

}

// todo ...