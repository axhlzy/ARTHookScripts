
import { BaseClass } from "./BaseClass";
import { DexFile } from "./DexFile";
import { StdString } from "./StdString";

export class ArtInstruction extends BaseClass {

    toString(): String {
        return this.constructor.name
    }

    // _ZN3art11Instruction17kInstructionNamesE
    // static const char* const kInstructionNames[];
    static get kInstructionNames(): String[] {
        const kInstructionNames_ptr: NativePointer = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction17kInstructionNamesE')
        let arrary_ret: String[] = []
        let loopAddaddress: NativePointer = kInstructionNames_ptr
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer().readCString())
            loopAddaddress = loopAddaddress.add(Process.pointerSize)
        }
        return arrary_ret
    }

    // _ZN3art11Instruction23kInstructionDescriptorsE
    // static const InstructionDescriptor kInstructionDescriptors[];
    static get kInstructionDescriptors(): NativePointer[] {
        const kInstructionDescriptors_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction23kInstructionDescriptorsE')
        let arrary_ret: NativePointer[] = []
        let loopAddaddress: NativePointer = kInstructionDescriptors_ptr
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer())
            loopAddaddress = loopAddaddress.add(Process.pointerSize)
        }
        return arrary_ret
    }

    // _ZNK3art11Instruction10DumpStringEPKNS_7DexFileE
    // std::string DumpString(const DexFile*) const;
    dumpString(dexFile: DexFile): String {
        const DumpString_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE")
        const DumpString_func = new NativeFunction(DumpString_ptr, ["pointer"], ["pointer", "pointer"])
        const result: NativePointer = DumpString_func(this.handle, dexFile.handle) as NativePointer
        return new StdString(result).disposeToString()
    }

    // _ZNK3art11Instruction7DumpHexEm
    // std::string DumpHex(size_t code_units) const;
    dumpHex(code_units: number): String {
        const DumpHex_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction7DumpHexEm")
        const DumpHex_func = new NativeFunction(DumpHex_ptr, ["pointer"], ["pointer", "int"])
        const result: NativePointer = DumpHex_func(this.handle, code_units) as NativePointer
        return new StdString(result).disposeToString()
    }

    // _ZNK3art11Instruction9DumpHexLEEm
    // std::string DumpHexLE(size_t instr_code_units) const;
    dumpHexLE(instr_code_units: number): String {
        const DumpHexLE_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction9DumpHexLEEm")
        const DumpHexLE_func = new NativeFunction(DumpHexLE_ptr, ["pointer"], ["pointer", "int"])
        const result: NativePointer = DumpHexLE_func(this.handle, instr_code_units) as NativePointer
        return new StdString(result).disposeToString()
    }

    // _ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv
    // size_t SizeInCodeUnitsComplexOpcode() const;
    sizeInCodeUnitsComplexOpcode(): number {
        const SizeInCodeUnitsComplexOpcode_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv")
        const SizeInCodeUnitsComplexOpcode_func = new NativeFunction(SizeInCodeUnitsComplexOpcode_ptr, ["pointer"], ["pointer"])
        return SizeInCodeUnitsComplexOpcode_func(this.handle) as number
    }

}