import { CodeItemInstructionAccessor } from "./CodeItemInstructionAccessor"

export class CodeItemDataAccessorMD extends CodeItemInstructionAccessor implements SizeOfClass {

    static MD: CModule = new CModule(`

    #include <glib.h>
    
    struct CodeItemDataAccessor {
        uint16_t registers_size_;
        uint16_t ins_size_;
        uint16_t outs_size_;
        uint16_t tries_size_;
    };
    
    void CodeItemDataAccessor_init(struct CodeItemDataAccessor *codeItemDataAccessor, uint16_t registers_size, uint16_t ins_size, uint16_t outs_size, uint16_t tries_size) {
        codeItemDataAccessor->registers_size_ = registers_size;
        codeItemDataAccessor->ins_size_ = ins_size;
        codeItemDataAccessor->outs_size_ = outs_size;
        codeItemDataAccessor->tries_size_ = tries_size;
    }
    
    uint16_t CodeItemDataAccessor_get_registers_size(struct CodeItemDataAccessor *codeItemDataAccessor) {
        return codeItemDataAccessor->registers_size_;
    }
    
    uint16_t CodeItemDataAccessor_get_ins_size(struct CodeItemDataAccessor *codeItemDataAccessor) {
        return codeItemDataAccessor->ins_size_;
    }
    
    uint16_t CodeItemDataAccessor_get_outs_size(struct CodeItemDataAccessor *codeItemDataAccessor) {
        return codeItemDataAccessor->outs_size_;
    }

    uint16_t CodeItemDataAccessor_get_tries_size(struct CodeItemDataAccessor *codeItemDataAccessor) {
        return codeItemDataAccessor->tries_size_;
    }

    void CodeItemDataAccessor_set_registers_size(struct CodeItemDataAccessor *codeItemDataAccessor, uint16_t registers_size) {
        codeItemDataAccessor->registers_size_ = registers_size;
    }

    void CodeItemDataAccessor_set_ins_size(struct CodeItemDataAccessor *codeItemDataAccessor, uint16_t ins_size) {
        codeItemDataAccessor->ins_size_ = ins_size;
    }

    void CodeItemDataAccessor_set_outs_size(struct CodeItemDataAccessor *codeItemDataAccessor, uint16_t outs_size) {
        codeItemDataAccessor->outs_size_ = outs_size;
    }

    void CodeItemDataAccessor_set_tries_size(struct CodeItemDataAccessor *codeItemDataAccessor, uint16_t tries_size) {
        codeItemDataAccessor->tries_size_ = tries_size;
    }
    
    `)

    instance: NativePointer = Memory.alloc(CodeItemDataAccessorMD.SIZE_OF_CodeItemDataAccessor)

    constructor(insns_size_in_code_units: number, insns: NativePointer, registers_size: number = 0, ins_size: number = 0, outs_size: number = 0, tries_size: number = 0) {
        super(insns_size_in_code_units, insns)

        CodeItemDataAccessorMD.MD.CodeItemDataAccessor_init(this.CurrentHandle, registers_size, ins_size, outs_size, tries_size)
    }

    get SizeOfClass(): number {
        return CodeItemDataAccessorMD.SIZE_OF_CodeItemDataAccessor + super.SizeOfClass
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get registers_size(): number {
        return CodeItemDataAccessorMD.MD.CodeItemDataAccessor_get_registers_size(this.CurrentHandle)
    }

    get ins_size(): number {
        return CodeItemDataAccessorMD.MD.CodeItemDataAccessor_get_ins_size(this.CurrentHandle)
    }

    get outs_size(): number {
        return CodeItemDataAccessorMD.MD.CodeItemDataAccessor_get_outs_size(this.CurrentHandle)
    }

    get tries_size(): number {
        return CodeItemDataAccessorMD.MD.CodeItemDataAccessor_get_tries_size(this.CurrentHandle)
    }

    set registers_size(registers_size: number) {
        CodeItemDataAccessorMD.MD.CodeItemDataAccessor_set_registers_size(this.CurrentHandle, registers_size)
    }

    set ins_size(ins_size: number) {
        CodeItemDataAccessorMD.MD.CodeItemDataAccessor_set_ins_size(this.CurrentHandle, ins_size)
    }

    set outs_size(outs_size: number) {
        CodeItemDataAccessorMD.MD.CodeItemDataAccessor_set_outs_size(this.CurrentHandle, outs_size)
    }

    set tries_size(tries_size: number) {
        CodeItemDataAccessorMD.MD.CodeItemDataAccessor_set_tries_size(this.CurrentHandle, tries_size)
    }

}