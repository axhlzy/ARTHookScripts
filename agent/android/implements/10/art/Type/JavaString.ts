import { ArtObject } from "../../../../Object"

export class JavaString extends ArtObject {

    // int32_t count_;
    private count_: NativePointer = this.CurrentHandle
    // uint32_t hash_code_;
    private hash_code_: NativePointer = this.count_.add(0x4)
    // Compression of all-ASCII into 8-bit memory leads to usage one of these fields
    //   union {
    //     uint16_t value_[0];
    //     uint8_t value_compressed_[0];
    //   };
    public str_data_: {
        data_: NativePointer
        entry_point_from_quick_compiled_code_: NativePointer
    }

    constructor(handle: NativePointer) {
        super(handle)
        this.str_data_ = {
            data_: this.hash_code_.add(0x4),
            entry_point_from_quick_compiled_code_: this.hash_code_.add(0x4)
        }
    }

    toString(): string {
        let disp: string = `JavaString<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t count_=${this.count_} <- ${this.count}`
        disp += `\n\t hash_code_=${this.hash_code_} <- ${this.hash_code}`
        disp += `\n\t str_data_=${this.str_data_.data_} -> '${this.value}'`
        return disp
    }

    get count(): number {
        return this.count_.readS32()
    }

    get hash_code(): number {
        return this.hash_code_.readU32()
    }

    get value_ptr(): NativePointer {
        return this.str_data_.data_
    }

    get value(): string {
        return this.value_ptr.readCString()
    }

    public static caseToJavaString<T extends ArtObject>(artObject: T): JavaString {
        return new JavaString(artObject.handle)
    }

}