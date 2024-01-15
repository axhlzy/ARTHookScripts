import { DexFile, DexFile_CodeItem } from "./DexFile"
import { kInsnsSizeShift } from "../Globals"

export class CompactDexFile extends DexFile {

    constructor(dexFile: NativePointer) {
        super(dexFile)
    }

}

export class CompactDexFile_CodeItem extends DexFile_CodeItem {

    // uint16_t fields_;
    // Packed code item data, 4 bits each: [registers_size, ins_size, outs_size, tries_size]
    private fields_ = this.CurrentHandle
    // uint16_t insns_count_and_flags_;
    // 5 bits for if either of the fields required preheader extension, 11 bits for the number of instruction code units.
    private insns_count_and_flags_ = this.fields_.add(0x2)
    // uint16_t insns_[1];
    public insns_ = this.insns_count_and_flags_.add(0x2)

    constructor(dex_pc: NativePointer) {
        super(dex_pc)
    }

    toString(): string {
        let disp: string = `CompactDexFile::CodeItem<${this.handle}>`
        disp += `\n\tfields: ${this.fields} | insns_count_and_flags: ${this.insns_count_and_flags} | insns: ${this.insns_start}`
        disp += `\n\tregisters_size: ${this.registers_size} | ins_size: ${this.ins_size} | outs_size: ${this.outs_size} | tries_size: ${this.tries_size}`
        disp += `\n\tinsns_size_in_code_units: ${this.insns_size_in_code_units} | extension_preheader: ${this.extension_preheader}`
        return disp
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get fields(): NativePointer {
        return ptr(this.fields_.readU16())
    }

    get insns_count_and_flags(): NativePointer {
        return ptr(this.insns_count_and_flags_.readU16())
    }

    set insns_count_and_flags(insns_count_and_flags: NativePointer) {
        this.insns_count_and_flags_.writeU16(insns_count_and_flags.toInt32())
    }

    set fields(fields: NativePointer) {
        this.fields_.writeU16(fields.toUInt32())
    }

    public get registers_size(): number {
        return (this.fields.toUInt32() >> (4 * 3))
    }

    public get ins_size(): number {
        return (this.fields.and(0xF00).toUInt32()) >> (4 * 2)
    }

    public set ins_size(ins_size: number) {
        this.fields = ptr((ins_size << (4 * 2)) | this.fields.toUInt32())
    }

    public get outs_size(): number {
        return (this.fields.toUInt32() & 0xF0) >> (4 * 1)
    }

    public get tries_size(): number {
        return (this.fields.toUInt32() & 0xF) >> (4 * 0)
    }

    public get insns_size_in_code_units(): number {
        return this.insns_count_and_flags.shr(kInsnsSizeShift).toUInt32()
    }

    public set insns_size_in_code_units(insns_size_in_code_units: number) {
        this.insns_count_and_flags = ptr((insns_size_in_code_units << kInsnsSizeShift) | this.insns_count_and_flags.toUInt32())
    }

    // ???? 
    public get extension_preheader(): number {
        return this.insns_count_and_flags.shl(kInsnsSizeShift).toUInt32()
    }

    public get header_start(): NativePointer {
        return this.CurrentHandle
    }

    public get header_size(): number {
        return this.insns_.sub(this.CurrentHandle).toUInt32()
    }

    public get insns_start(): NativePointer {
        return this.insns_
    }

    public get insns_size(): number {
        return this.insns_size_in_code_units * 2
    }
}