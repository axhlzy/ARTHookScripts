import { DexFile, DexFile_CodeItem } from "./DexFile"

export class CompactDexFile extends DexFile {

    constructor(dexFile: NativePointer) {
        super(dexFile)
    }

}

export class CompactDexFile_CodeItem extends DexFile_CodeItem {

    // uint16_t fields_;
    fields_ = this.CurrentHandle
    // uint16_t insns_count_and_flags_;
    insns_count_and_flags_ = this.fields_.add(0x2)
    // uint16_t insns_[1];
    insns_ = this.insns_count_and_flags_.add(0x2)

    constructor(dex_pc: NativePointer) {
        super(dex_pc)
    }

    toString(): string {
        let disp: string = `CompactDexFile::CodeItem<${this.handle}>`
        disp += `\nfields: ${this.fields} | insns_count_and_flags: ${this.insns_count_and_flags} | insns: ${this.insns}`
        return disp
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get fields(): number {
        return this.fields_.readU16()
    }

    get insns_count_and_flags(): number {
        return this.insns_count_and_flags_.readU16()
    }

    get insns(): NativePointer {
        return this.insns_.readPointer()
    }

    set fields(fields: number) {
        this.fields_.writeU16(fields)
    }

}