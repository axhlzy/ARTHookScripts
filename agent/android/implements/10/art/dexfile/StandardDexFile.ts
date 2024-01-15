import { DexFile, DexFile_CodeItem } from "./DexFile"
import { DexItemStruct } from "./DexFileStructs"

// StandardDexFile === DexFile
export class StandardDexFile extends DexFile { }

export class StandardDexFile_CodeItem extends DexFile_CodeItem implements DexItemStruct {

    // uint16_t registers_size_;
    private registers_size_ = this.CurrentHandle
    // uint16_t ins_size_;
    private ins_size_ = this.CurrentHandle.add(0x2 * 1)
    // uint16_t outs_size_;
    private outs_size_ = this.CurrentHandle.add(0x2 * 2)
    // uint16_t tries_size_;
    private tries_size_ = this.CurrentHandle.add(0x2 * 3)
    // uint32_t debug_info_off_;
    private debug_info_off_ = this.CurrentHandle.add(0x2 * 4)
    // uint32_t insns_size_in_code_units_;
    private insns_size_in_code_units_ = this.CurrentHandle.add(0x2 * 4 + 0x4 * 1)
    // uint16_t insns_[1]
    private insns_ = this.CurrentHandle.add(0x2 * 4 + 0x4 * 2)

    constructor(dex_pc: NativePointer) {
        super(dex_pc)
    }

    toString(): string {
        let disp: string = `StandardDexFile::CodeItem<${this.handle}>`
        disp += `\n\tregisters_size: ${this.registers_size} | ins_size: ${this.ins_size} | outs_size: ${this.outs_size} | tries_size: ${this.tries_size} | debug_info_off: ${this.debug_info_off} | insns_size_in_code_units: ${this.insns_size_in_code_units} | insns: ${this.insns}`
        return disp
    }

    public get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    public get registers_size(): number {
        return this.registers_size_.readU16()
    }

    public get insns(): NativePointer {
        return this.insns_
    }

    public get ins_size(): number {
        return this.ins_size_.readU16()
    }

    public get outs_size(): number {
        return this.outs_size_.readU16()
    }

    public get tries_size(): number {
        return this.tries_size_.readU16()
    }

    public get debug_info_off(): number {
        return this.debug_info_off_.readU32()
    }

    public get insns_size_in_code_units(): number {
        return this.insns_size_in_code_units_.readU32()
    }

    public set registers_size(registers_size: number) {
        this.registers_size_.writeU16(registers_size)
    }

    public set ins_size(ins_size: number) {
        this.ins_size_.writeU16(ins_size)
    }

    public set outs_size(outs_size: number) {
        this.outs_size_.writeU16(outs_size)
    }

    public set tries_size(tries_size: number) {
        this.tries_size_.writeU16(tries_size)
    }

    public set debug_info_off(debug_info_off: number) {
        this.debug_info_off_.writeU32(debug_info_off)
    }

    public set insns_size_in_code_units(insns_size_in_code_units: number) {
        this.insns_size_in_code_units_.writeU32(insns_size_in_code_units)
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