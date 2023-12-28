import { StandardDexFile_CodeItem } from "./StandardDexFile"
import { CompactDexFile_CodeItem } from "./CompactDexFile"
import { PointerSize, kInsnsSizeShift } from "./Globals"
import { ArtInstruction } from "./Instruction"
import { ArtMethod } from "./mirror/ArtMethod"
import { JSHandle } from "../../../JSHandle"
import { DexFile } from "./DexFile"

export class CodeItemInstructionAccessor extends JSHandle implements SizeOfClass {

    protected static readonly SIZE_OF_CodeItemInstructionAccessor: number = 0x4 + PointerSize
    protected static readonly SIZE_OF_CodeItemDebugInfoAccessor = PointerSize + 0x4
    protected static readonly SIZE_OF_CodeItemDataAccessor = 0x2 * 4

    // size of the insns array, in 2 byte code units. 0 if there is no code item.
    //   uint32_t insns_size_in_code_units_ = 0;
    insns_size_in_code_units_ = this.CurrentHandle

    // Pointer to the instructions, null if there is no code item.
    // const uint16_t* insns_ = nullptr;
    insns_ = this.CurrentHandle.add(0x4) // ref ptr

    constructor(insns_size_in_code_units: number = 0, insns: NativePointer = NULL) {
        const needAllocSize: number = CodeItemInstructionAccessor.SIZE_OF_CodeItemInstructionAccessor
            + CodeItemInstructionAccessor.SIZE_OF_CodeItemDataAccessor
            + CodeItemInstructionAccessor.SIZE_OF_CodeItemDebugInfoAccessor
        super(Memory.alloc(needAllocSize))
        this.CurrentHandle.add(0x0).writeU32(insns_size_in_code_units)
        this.CurrentHandle.add(0x4).writePointer(insns)
    }

    toString(): String {
        let disp: string = `CodeItemInstructionAccessor<${this.handle}>`
        disp += `\ninsns_size_in_code_units: ${this.insns_size_in_code_units} | insns_: ${this.insns}`
        return disp
    }

    public static fromDexFile(dexFile: DexFile, dex_pc: NativePointer): CodeItemInstructionAccessor {
        const accessor = new CodeItemInstructionAccessor()
        if (dexFile.is_compact_dex) {
            const codeItem = new CompactDexFile_CodeItem(dex_pc)
            accessor.insns_size_in_code_units = ptr(codeItem.insns_count_and_flags).shr(kInsnsSizeShift).toUInt32()
            accessor.insns = codeItem.insns_
        } else {
            const codeItem = new StandardDexFile_CodeItem(dex_pc)
            accessor.insns_size_in_code_units = codeItem.insns_size_in_code_units
            accessor.insns = codeItem.insns_
        }
        return accessor
    }

    public static fromArtMethod(artMethod: ArtMethod): CodeItemInstructionAccessor {
        const dexFile: DexFile = artMethod.GetDexFile()
        const dex_pc: NativePointer = artMethod.GetCodeItem()
        return CodeItemInstructionAccessor.fromDexFile(dexFile, dex_pc)
    }

    get SizeOfClass(): number {
        return CodeItemInstructionAccessor.SIZE_OF_CodeItemInstructionAccessor + super.SizeOfClass
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get insns_size_in_code_units(): number {
        return this.insns_size_in_code_units_.readU32()
    }

    get insns(): NativePointer {
        return this.insns_.readPointer()
    }

    set insns_size_in_code_units(insns_size_in_code_units: number) {
        this.insns_size_in_code_units_.writeU32(insns_size_in_code_units)
    }

    set insns(insns: NativePointer) {
        this.insns_.writePointer(insns)
    }

    /*****************************************************************/

    // uint32_t InsnsSizeInBytes() const {
    //     static constexpr uint32_t kCodeUnitSizeInBytes = 2u;
    //     return insns_size_in_code_units_ * kCodeUnitSizeInBytes;
    //   }
    InsnsSizeInBytes(): number {
        return this.insns_size_in_code_units * 2
    }

    // Return the instruction for a dex pc.
    //   const Instruction& InstructionAt(uint32_t dex_pc) const {
    //     DCHECK_LT(dex_pc, InsnsSizeInCodeUnits());
    //     return *Instruction::At(insns_ + dex_pc);
    //   }
    InstructionAt(dex_pc: number = 0): ArtInstruction {
        return ArtInstruction.At(this.insns.add(dex_pc))
    }

}

declare global {
    var fromDexFile: (dexFile: DexFile, dex_pc: NativePointer) => CodeItemInstructionAccessor
    var fromArtMethod: (artMethod: ArtMethod) => CodeItemInstructionAccessor
}

globalThis.fromDexFile = CodeItemInstructionAccessor.fromDexFile
globalThis.fromArtMethod = CodeItemInstructionAccessor.fromArtMethod