import { StdString } from "../../../../../tools/StdString"
import { JSHandleNotImpl } from "../../../../JSHandle"
import { PointerSize } from "../Globals"

export class MemMap extends JSHandleNotImpl {

    //   std::string name_;
    name_: NativePointer = this.handle
    //   uint8_t* begin_ = nullptr;    // Start of data. May be changed by AlignBy.
    begin_: NativePointer = this.name_.add(PointerSize * 3)
    //   size_t size_ = 0u;            // Length of data.
    size_: NativePointer = this.begin_.add(PointerSize)

    //   void* base_begin_ = nullptr;  // Page-aligned base address. May be changed by AlignBy.
    base_begin_: NativePointer = this.size_.add(PointerSize)
    //   size_t base_size_ = 0u;       // Length of mapping. May be changed by RemapAtEnd (ie Zygote).
    base_size_: NativePointer = this.base_begin_.add(PointerSize)
    //   int prot_ = 0;                // Protection of the map.
    prot_: NativePointer = this.base_size_.add(PointerSize)

    //   // When reuse_ is true, this is just a view of an existing mapping
    //   // and we do not take ownership and are not responsible for
    //   // unmapping.
    //   bool reuse_ = false;
    reuse_: NativePointer = this.prot_.add(PointerSize)

    //   // When already_unmapped_ is true the destructor will not call munmap.
    //   bool already_unmapped_ = false;
    already_unmapped_: NativePointer = this.reuse_.add(PointerSize)

    //   size_t redzone_size_ = 0u;
    redzone_size_: NativePointer = this.already_unmapped_.add(PointerSize)

    toString(): string {
        let disp: string = `MemMap<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t name = ${this.name} @ ${this.name_}`
        disp += `\n\t begin = ${this.begin} @ ${this.begin_}`
        disp += `\n\t size = ${this.size} | ${ptr(this.size)} @ ${this.size_}`
        disp += `\n\t base_begin = ${this.base_begin} @ ${this.base_begin_}`
        disp += `\n\t base_size = ${this.base_size} | ${ptr(this.base_size)} @ ${this.base_size_}`
        disp += `\n\t prot = ${this.prot} | ${ptr(this.prot)} @ ${this.prot_}`
        disp += `\n\t reuse = ${this.reuse} @ ${this.reuse_}`
        disp += `\n\t already_unmapped = ${this.already_unmapped} @ ${this.already_unmapped_}`
        disp += `\n\t redzone_size = ${this.redzone_size} | ${ptr(this.redzone_size)} @ ${this.redzone_size_}`
        return disp
    }

    get name(): string {
        return new StdString(this.name_).toString()
    }

    get begin(): NativePointer {
        return this.begin_.readPointer()
    }

    get size(): number {
        return this.size_.toInt32()
    }

    get base_begin(): NativePointer {
        return this.base_begin_.readPointer()
    }

    get base_size(): number {
        return this.base_size_.toInt32()
    }

    get prot(): number {
        return this.prot_.toInt32()
    }

    get reuse(): boolean {
        return this.reuse_.toInt32() != 0
    }

    get already_unmapped(): boolean {
        return this.already_unmapped_.toInt32() != 0
    }

    get redzone_size(): number {
        return this.redzone_size_.toInt32()
    }
}