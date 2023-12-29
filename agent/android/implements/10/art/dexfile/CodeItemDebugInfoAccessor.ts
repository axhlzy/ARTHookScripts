import { CodeItemDataAccessor } from "./CodeItemDataAccessor"
import { PointerSize } from "../Globals"

export class CodeItemDebugInfoAccessor extends CodeItemDataAccessor implements SizeOfClass {

    // const DexFile* dex_file_ = nullptr;
    dex_file_ = this.CurrentHandle.add(0x0)
    // uint32_t debug_info_offset_ = 0u;
    debug_info_offset_ = this.CurrentHandle.add(PointerSize)

    constructor(insns_size_in_code_units: number, insns: NativePointer, registers_size?: number, ins_size?: number, outs_size?: number, tries_size?: number, dex_file: NativePointer = NULL, debug_info_offset: number = 0) {
        super(insns_size_in_code_units, insns, registers_size, ins_size, outs_size, tries_size)
        this.dex_file_.writePointer(dex_file)
        this.debug_info_offset_.writeU32(debug_info_offset)
    }

    get SizeOfClass(): number {
        return CodeItemDebugInfoAccessor.SIZE_OF_CodeItemDebugInfoAccessor + super.SizeOfClass
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get dex_file(): NativePointer {
        return this.dex_file_.readPointer()
    }

    get debug_info_offset(): number {
        return this.debug_info_offset_.readU32()
    }

    set dex_file(dex_file: NativePointer) {
        this.dex_file_.writePointer(dex_file)
    }

    set debug_info_offset(debug_info_offset: number) {
        this.debug_info_offset_.writeU32(debug_info_offset)
    }

}