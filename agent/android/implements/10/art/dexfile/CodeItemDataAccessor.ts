import { JSHandle } from "../../../../JSHandle"
import { PointerSize } from "../Globals"
import { CodeItemInstructionAccessor } from "./CodeItemInstructionAccessor"

export class CodeItemDataAccessor extends CodeItemInstructionAccessor implements SizeOfClass {

    // uint16_t registers_size_;
    private registers_size_ = this.CurrentHandle.add(0x0)
    // uint16_t ins_size_;
    private ins_size_ = this.CurrentHandle.add(0x2)
    // uint16_t outs_size_;
    private outs_size_ = this.CurrentHandle.add(0x2 * 2)
    // uint16_t tries_size_;
    private tries_size_ = this.CurrentHandle.add(0x2 * 3)

    constructor(insns_size_in_code_units?: number, insns?: NativePointer, registers_size: number = 0, ins_size: number = 0, outs_size: number = 0, tries_size: number = 0) {
        if (typeof insns_size_in_code_units == "number") {
            super(insns_size_in_code_units, insns)
            this.registers_size_.writeU16(registers_size)
            this.ins_size_.writeU16(ins_size)
            this.outs_size_.writeU16(outs_size)
            this.tries_size_.writeU16(tries_size)
        }
    }

    toString(): string {
        let disp: string = `CodeItemDataAccessor<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t registers_size_: ${this.registers_size}`
        disp += `\n\t ins_size_: ${this.ins_size}`
        disp += `\n\t outs_size_: ${this.outs_size}`
        disp += `\n\t tries_size_: ${this.tries_size}`
        return disp
    }

    get SizeOfClass(): number {
        return CodeItemDataAccessor.SIZE_OF_CodeItemDataAccessor + super.SizeOfClass
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get registers_size(): number {
        return this.registers_size_.readU16()
    }

    get ins_size(): number {
        return this.ins_size_.readU16()
    }

    get outs_size(): number {
        return this.outs_size_.readU16()
    }

    get tries_size(): number {
        return this.tries_size_.readU16()
    }

    set registers_size(registers_size: number) {
        this.registers_size_.writeU16(registers_size)
    }

    set ins_size(ins_size: number) {
        this.ins_size_.writeU16(ins_size)
    }

    set outs_size(outs_size: number) {
        this.outs_size_.writeU16(outs_size)
    }

    set tries_size(tries_size: number) {
        this.tries_size_.writeU16(tries_size)
    }

    public static fromRef(ref_ptr: NativePointer) {
        const accessor: CodeItemDataAccessor = Object.create(CodeItemDataAccessor.prototype)
        accessor.handle = ref_ptr
        accessor.registers_size_ = ref_ptr.add(0x4 + 0x4 + PointerSize)
        accessor.ins_size_ = accessor.registers_size_.add(0x2)
        accessor.outs_size_ = accessor.ins_size_.add(0x2)
        accessor.tries_size_ = accessor.outs_size_.add(0x2)
        Reflect.defineProperty(accessor, 'insns_', ref_ptr.add(0x4 + 0x4))
        Reflect.defineProperty(accessor, 'insns_size_in_code_units_', ref_ptr)
        return accessor
    }

}