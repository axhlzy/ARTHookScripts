// <reference path="jetbrains://clion/navigate/reference?project=libart&path=oat_quick_method_header.h" />

//   // The offset in bytes from the start of the vmap table to the end of the header.
//   uint32_t vmap_table_offset_ = 0u;
//   // The code size in bytes. The highest bit is used to signify if the compiled
//   // code with the method header has should_deoptimize flag.
//   uint32_t code_size_ = 0u;
//   // The actual code.
//   uint8_t code_[0];

export class OatQuickMethodHeader {

    private handle: NativePointer

    constructor(handle: NativePointer) {
        this.handle = handle
    }

    get vmap_table_offset(): number {
        return this.handle.add(0).readU32()
    }

    get code_size(): number {
        return this.handle.add(4).readU32()
    }

    get code(): NativePointer {
        return this.handle.add(8).readPointer()
    }

    toString(): string {
        return `${this.handle} -> vmap_table_offset: ${this.vmap_table_offset} code_size: ${this.code_size} code: ${this.code}`
    }

}