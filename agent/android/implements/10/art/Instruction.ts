import { StdString } from "../../../../tools/StdString"
import { JSHandle } from "../../../JSHandle"
import { DexFile } from "./DexFile"

export class ArtInstruction extends JSHandle {

    // _ZN3art11Instruction17kInstructionNamesE
    // static const char* const kInstructionNames[];
    private static cached_kInstructionNames: String[] = []
    static get kInstructionNames(): String[] {
        if (ArtInstruction.cached_kInstructionNames.length > 0) return ArtInstruction.cached_kInstructionNames
        const kInstructionNames_ptr: NativePointer = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction17kInstructionNamesE')
        let arrary_ret: String[] = []
        let loopAddaddress: NativePointer = kInstructionNames_ptr
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer().readCString())
            loopAddaddress = loopAddaddress.add(Process.pointerSize)
        }
        ArtInstruction.cached_kInstructionNames = arrary_ret
        return arrary_ret
    }

    // test
    // ArtInstruction.kInstructionDescriptors.forEach((descriptor, index) => {
    //     LOGD(`${index} -> ${descriptor}`)
    // })

    // _ZN3art11Instruction23kInstructionDescriptorsE
    // static const InstructionDescriptor kInstructionDescriptors[];
    private static cached_kInstructionDescriptors: InstructionDescriptor[] = []
    static get kInstructionDescriptors(): InstructionDescriptor[] {
        if (ArtInstruction.cached_kInstructionDescriptors.length > 0) return ArtInstruction.cached_kInstructionDescriptors
        const kInstructionDescriptors_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction23kInstructionDescriptorsE')
        const arrary_ret: InstructionDescriptor[] = []
        let loopAddaddress: NativePointer = kInstructionDescriptors_ptr
        let counter = 0xFF // 256
        while (counter-- > 0) {
            arrary_ret.push(new InstructionDescriptor(loopAddaddress))
            loopAddaddress = loopAddaddress.add(Process.pointerSize)
        }
        ArtInstruction.cached_kInstructionDescriptors = arrary_ret
        return arrary_ret
    }

    // _ZNK3art11Instruction10DumpStringEPKNS_7DexFileE
    // std::string DumpString(const DexFile*) const;
    dumpString(dexFile: DexFile): String {
        const DumpString_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE")!
        const DumpString_func = new NativeFunction(DumpString_ptr, ["pointer", "pointer", "pointer"], ["pointer", "pointer"])
        const result: NativePointer[] = DumpString_func(this.handle, dexFile.handle) as NativePointer[]
        return StdString.fromPointers(result)
    }

    // _ZNK3art11Instruction7DumpHexEm
    // std::string DumpHex(size_t code_units) const;
    dumpHex(code_units: number = 3): String {
        const DumpHex_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction7DumpHexEm")
        const DumpHex_func = new NativeFunction(DumpHex_ptr, ["pointer", "pointer", "pointer"], ["pointer", "int"])
        const result: NativePointer[] = DumpHex_func(this.handle, code_units) as NativePointer[]
        return StdString.fromPointers(result)
    }

    // _ZNK3art11Instruction9DumpHexLEEm
    // std::string DumpHexLE(size_t instr_code_units) const;
    dumpHexLE(instr_code_units: number = 3): String {
        const realInsLen: number = this.SizeInCodeUnits / 2
        if (realInsLen > instr_code_units) instr_code_units = realInsLen
        const DumpHexLE_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction9DumpHexLEEm")
        const DumpHexLE_func = new NativeFunction(DumpHexLE_ptr, ["pointer", "pointer", "pointer"], ["pointer", "int"])
        const result: NativePointer[] = DumpHexLE_func(this.handle, instr_code_units) as NativePointer[]
        return `${realInsLen} - ${StdString.fromPointers(result)}`
    }

    // _ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv
    // size_t SizeInCodeUnitsComplexOpcode() const;
    sizeInCodeUnitsComplexOpcode(): number {
        const SizeInCodeUnitsComplexOpcode_ptr: NativePointer = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv")
        const SizeInCodeUnitsComplexOpcode_func = new NativeFunction(SizeInCodeUnitsComplexOpcode_ptr, ["pointer"], ["pointer"])
        return SizeInCodeUnitsComplexOpcode_func(this.handle) as number
    }

    // static const Instruction* At(const uint16_t* code) 
    static At(code: NativePointer): ArtInstruction {
        return new ArtInstruction(code)
    }

    // const Instruction* RelativeAt(int32_t offset) 
    RelativeAt(offset: number): ArtInstruction {
        return ArtInstruction.At(this.handle.add(offset))
    }

    // const Instruction* Next() const
    Next(): ArtInstruction {
        return this.RelativeAt(this.SizeInCodeUnits)
    }

    get SizeInCodeUnits(): number {
        const opcode: number = this.Fetch16()
        let result: number = (ArtInstruction.kInstructionDescriptors[opcode].size_in_code_units)
        if (result < 0) {
            let ret = this.sizeInCodeUnitsComplexOpcode() * 0x2
            return ret
        }
        else return result * 0x2
    }

    //   uint16_t Fetch16(size_t offset) const {
    //     const uint16_t* insns = reinterpret_cast<const uint16_t*>(this);
    //     return insns[offset];
    //   }
    Fetch16(offset: number = 0): number {
        return this.handle.add(offset).readU8()
    }

}

// NOP = (0x00), MOVE = (0x01), MOVE_FROM16 = (0x02), MOVE_16 = (0x03), MOVE_WIDE = (0x04), MOVE_WIDE_FROM16 = (0x05), MOVE_WIDE_16 = (0x06), MOVE_OBJECT = (0x07), MOVE_OBJECT_FROM16 = (0x08), MOVE_OBJECT_16 = (0x09), MOVE_RESULT = (0x0A), MOVE_RESULT_WIDE = (0x0B), MOVE_RESULT_OBJECT = (0x0C), MOVE_EXCEPTION = (0x0D), RETURN_VOID = (0x0E), RETURN = (0x0F), RETURN_WIDE = (0x10), RETURN_OBJECT = (0x11), CONST_4 = (0x12), CONST_16 = (0x13), CONST = (0x14), CONST_HIGH16 = (0x15), CONST_WIDE_16 = (0x16), CONST_WIDE_32 = (0x17), CONST_WIDE = (0x18), CONST_WIDE_HIGH16 = (0x19), CONST_STRING = (0x1A), CONST_STRING_JUMBO = (0x1B), CONST_CLASS = (0x1C), MONITOR_ENTER = (0x1D), MONITOR_EXIT = (0x1E), CHECK_CAST = (0x1F), INSTANCE_OF = (0x20), ARRAY_LENGTH = (0x21), NEW_INSTANCE = (0x22), NEW_ARRAY = (0x23), FILLED_NEW_ARRAY = (0x24), FILLED_NEW_ARRAY_RANGE = (0x25), FILL_ARRAY_DATA = (0x26), THROW = (0x27), GOTO = (0x28), GOTO_16 = (0x29), GOTO_32 = (0x2A), PACKED_SWITCH = (0x2B), SPARSE_SWITCH = (0x2C), CMPL_FLOAT = (0x2D), CMPG_FLOAT = (0x2E), CMPL_DOUBLE = (0x2F), CMPG_DOUBLE = (0x30), CMP_LONG = (0x31), IF_EQ = (0x32), IF_NE = (0x33), IF_LT = (0x34), IF_GE = (0x35), IF_GT = (0x36), IF_LE = (0x37), IF_EQZ = (0x38), IF_NEZ = (0x39), IF_LTZ = (0x3A), IF_GEZ = (0x3B), IF_GTZ = (0x3C), IF_LEZ = (0x3D), UNUSED_3E = (0x3E), UNUSED_3F = (0x3F), UNUSED_40 = (0x40), UNUSED_41 = (0x41), UNUSED_42 = (0x42), UNUSED_43 = (0x43), AGET = (0x44), AGET_WIDE = (0x45), AGET_OBJECT = (0x46), AGET_BOOLEAN = (0x47), AGET_BYTE = (0x48), AGET_CHAR = (0x49), AGET_SHORT = (0x4A), APUT = (0x4B), APUT_WIDE = (0x4C), APUT_OBJECT = (0x4D), APUT_BOOLEAN = (0x4E), APUT_BYTE = (0x4F), APUT_CHAR = (0x50), APUT_SHORT = (0x51), IGET = (0x52), IGET_WIDE = (0x53), IGET_OBJECT = (0x54), IGET_BOOLEAN = (0x55), IGET_BYTE = (0x56), IGET_CHAR = (0x57), IGET_SHORT = (0x58), IPUT = (0x59), IPUT_WIDE = (0x5A), IPUT_OBJECT = (0x5B), IPUT_BOOLEAN = (0x5C), IPUT_BYTE = (0x5D), IPUT_CHAR = (0x5E), IPUT_SHORT = (0x5F), SGET = (0x60), SGET_WIDE = (0x61), SGET_OBJECT = (0x62), SGET_BOOLEAN = (0x63), SGET_BYTE = (0x64), SGET_CHAR = (0x65), SGET_SHORT = (0x66), SPUT = (0x67), SPUT_WIDE = (0x68), SPUT_OBJECT = (0x69), SPUT_BOOLEAN = (0x6A), SPUT_BYTE = (0x6B), SPUT_CHAR = (0x6C), SPUT_SHORT = (0x6D), INVOKE_VIRTUAL = (0x6E), INVOKE_SUPER = (0x6F), INVOKE_DIRECT = (0x70), INVOKE_STATIC = (0x71), INVOKE_INTERFACE = (0x72), RETURN_VOID_NO_BARRIER = (0x73), INVOKE_VIRTUAL_RANGE = (0x74), INVOKE_SUPER_RANGE = (0x75), INVOKE_DIRECT_RANGE = (0x76), INVOKE_STATIC_RANGE = (0x77), INVOKE_INTERFACE_RANGE = (0x78), UNUSED_79 = (0x79), UNUSED_7A = (0x7A), NEG_INT = (0x7B), NOT_INT = (0x7C), NEG_LONG = (0x7D), NOT_LONG = (0x7E), NEG_FLOAT = (0x7F), NEG_DOUBLE = (0x80), INT_TO_LONG = (0x81), INT_TO_FLOAT = (0x82), INT_TO_DOUBLE = (0x83), LONG_TO_INT = (0x84), LONG_TO_FLOAT = (0x85), LONG_TO_DOUBLE = (0x86), FLOAT_TO_INT = (0x87), FLOAT_TO_LONG = (0x88), FLOAT_TO_DOUBLE = (0x89), DOUBLE_TO_INT = (0x8A), DOUBLE_TO_LONG = (0x8B), DOUBLE_TO_FLOAT = (0x8C), INT_TO_BYTE = (0x8D), INT_TO_CHAR = (0x8E), INT_TO_SHORT = (0x8F), ADD_INT = (0x90), SUB_INT = (0x91), MUL_INT = (0x92), DIV_INT = (0x93), REM_INT = (0x94), AND_INT = (0x95), OR_INT = (0x96), XOR_INT = (0x97), SHL_INT = (0x98), SHR_INT = (0x99), USHR_INT = (0x9A), ADD_LONG = (0x9B), SUB_LONG = (0x9C), MUL_LONG = (0x9D), DIV_LONG = (0x9E), REM_LONG = (0x9F), AND_LONG = (0xA0), OR_LONG = (0xA1), XOR_LONG = (0xA2), SHL_LONG = (0xA3), SHR_LONG = (0xA4), USHR_LONG = (0xA5), ADD_FLOAT = (0xA6), SUB_FLOAT = (0xA7), MUL_FLOAT = (0xA8), DIV_FLOAT = (0xA9), REM_FLOAT = (0xAA), ADD_DOUBLE = (0xAB), SUB_DOUBLE = (0xAC), MUL_DOUBLE = (0xAD), DIV_DOUBLE = (0xAE), REM_DOUBLE = (0xAF), ADD_INT_2ADDR = (0xB0), SUB_INT_2ADDR = (0xB1), MUL_INT_2ADDR = (0xB2), DIV_INT_2ADDR = (0xB3), REM_INT_2ADDR = (0xB4), AND_INT_2ADDR = (0xB5), OR_INT_2ADDR = (0xB6), XOR_INT_2ADDR = (0xB7), SHL_INT_2ADDR = (0xB8), SHR_INT_2ADDR = (0xB9), USHR_INT_2ADDR = (0xBA), ADD_LONG_2ADDR = (0xBB), SUB_LONG_2ADDR = (0xBC), MUL_LONG_2ADDR = (0xBD), DIV_LONG_2ADDR = (0xBE), REM_LONG_2ADDR = (0xBF), AND_LONG_2ADDR = (0xC0), OR_LONG_2ADDR = (0xC1), XOR_LONG_2ADDR = (0xC2), SHL_LONG_2ADDR = (0xC3), SHR_LONG_2ADDR = (0xC4), USHR_LONG_2ADDR = (0xC5), ADD_FLOAT_2ADDR = (0xC6), SUB_FLOAT_2ADDR = (0xC7), MUL_FLOAT_2ADDR = (0xC8), DIV_FLOAT_2ADDR = (0xC9), REM_FLOAT_2ADDR = (0xCA), ADD_DOUBLE_2ADDR = (0xCB), SUB_DOUBLE_2ADDR = (0xCC), MUL_DOUBLE_2ADDR = (0xCD), DIV_DOUBLE_2ADDR = (0xCE), REM_DOUBLE_2ADDR = (0xCF), ADD_INT_LIT16 = (0xD0), RSUB_INT = (0xD1), MUL_INT_LIT16 = (0xD2), DIV_INT_LIT16 = (0xD3), REM_INT_LIT16 = (0xD4), AND_INT_LIT16 = (0xD5), OR_INT_LIT16 = (0xD6), XOR_INT_LIT16 = (0xD7), ADD_INT_LIT8 = (0xD8), RSUB_INT_LIT8 = (0xD9), MUL_INT_LIT8 = (0xDA), DIV_INT_LIT8 = (0xDB), REM_INT_LIT8 = (0xDC), AND_INT_LIT8 = (0xDD), OR_INT_LIT8 = (0xDE), XOR_INT_LIT8 = (0xDF), SHL_INT_LIT8 = (0xE0), SHR_INT_LIT8 = (0xE1), USHR_INT_LIT8 = (0xE2), IGET_QUICK = (0xE3), IGET_WIDE_QUICK = (0xE4), IGET_OBJECT_QUICK = (0xE5), IPUT_QUICK = (0xE6), IPUT_WIDE_QUICK = (0xE7), IPUT_OBJECT_QUICK = (0xE8), INVOKE_VIRTUAL_QUICK = (0xE9), INVOKE_VIRTUAL_RANGE_QUICK = (0xEA), IPUT_BOOLEAN_QUICK = (0xEB), IPUT_BYTE_QUICK = (0xEC), IPUT_CHAR_QUICK = (0xED), IPUT_SHORT_QUICK = (0xEE), IGET_BOOLEAN_QUICK = (0xEF), IGET_BYTE_QUICK = (0xF0), IGET_CHAR_QUICK = (0xF1), IGET_SHORT_QUICK = (0xF2), UNUSED_F3 = (0xF3), UNUSED_F4 = (0xF4), UNUSED_F5 = (0xF5), UNUSED_F6 = (0xF6), UNUSED_F7 = (0xF7), UNUSED_F8 = (0xF8), UNUSED_F9 = (0xF9), INVOKE_POLYMORPHIC = (0xFA), INVOKE_POLYMORPHIC_RANGE = (0xFB), INVOKE_CUSTOM = (0xFC), INVOKE_CUSTOM_RANGE = (0xFD), CONST_METHOD_HANDLE = (0xFE), CONST_METHOD_TYPE = (0xFF),
class Code extends JSHandle {

    enumMap: Map<number, string> = new Map([
        [0x00, "NOP"],
        [0x01, "MOVE"],
        [0x02, "MOVE_FROM16"],
        [0x03, "MOVE_16"],
        [0x04, "MOVE_WIDE"],
        [0x05, "MOVE_WIDE_FROM16"],
        [0x06, "MOVE_WIDE_16"],
        [0x07, "MOVE_OBJECT"],
        [0x08, "MOVE_OBJECT_FROM16"],
        [0x09, "MOVE_OBJECT_16"],
        [0x0A, "MOVE_RESULT"],
        [0x0B, "MOVE_RESULT_WIDE"],
        [0x0C, "MOVE_RESULT_OBJECT"],
        [0x0D, "MOVE_EXCEPTION"],
        [0x0E, "RETURN_VOID"],
        [0x0F, "RETURN"],
        [0x10, "RETURN_WIDE"],
        [0x11, "RETURN_OBJECT"],
        [0x12, "CONST_4"],
        [0x13, "CONST_16"],
        [0x14, "CONST"],
        [0x15, "CONST_HIGH16"],
        [0x16, "CONST_WIDE_16"],
        [0x17, "CONST_WIDE_32"],
        [0x18, "CONST_WIDE"],
        [0x19, "CONST_WIDE_HIGH16"],
        [0x1A, "CONST_STRING"],
        [0x1B, "CONST_STRING_JUMBO"],
        [0x1C, "CONST_CLASS"],
        [0x1D, "MONITOR_ENTER"],
        [0x1E, "MONITOR_EXIT"],
        [0x1F, "CHECK_CAST"],
        [0x20, "INSTANCE_OF"],
        [0x21, "ARRAY_LENGTH"],
        [0x22, "NEW_INSTANCE"],
        [0x23, "NEW_ARRAY"],
        [0x24, "FILLED_NEW_ARRAY"],
        [0x25, "FILLED_NEW_ARRAY_RANGE"],
        [0x26, "FILL_ARRAY_DATA"],
        [0x27, "THROW"],
        [0x28, "GOTO"],
        [0x29, "GOTO_16"],
        [0x2A, "GOTO_32"],
        [0x2B, "PACKED_SWITCH"],
        [0x2C, "SPARSE_SWITCH"],
        // todo
    ])

    private flags: number = this.CurrentHandle.toInt32()

    get Option_Name(): string {
        return this.enumMap.get(this.flags) || "unknown"
    }

    get Option_Value(): number {
        return this.flags
    }

    get Option_Value_ptr(): NativePointer {
        return ptr(this.Option_Value)
    }

}

//   Collect the enums in a struct for better locality.
//   struct InstructionDescriptor {
//     uint32_t verify_flags;         // Set of VerifyFlag.
//     Format format;
//     IndexType index_type;
//     uint8_t flags;                 // Set of Flags.
//     int8_t size_in_code_units;
//   };
class InstructionDescriptor extends JSHandle {

    // uint32_t verify_flags; 
    verify_flags_ = this.CurrentHandle
    // Format format; => uint8_t
    format_ = this.verify_flags_.add(0x4)
    // IndexType index_type; => uint8_t
    index_type_ = this.format_.add(0x1)
    // uint8_t flags;
    flags_ = this.index_type_.add(0x1)
    // int8_t size_in_code_units;
    size_in_code_units_ = this.flags_.add(0x1)

    toString(): string {
        return `InstructionDescriptor<${this.handle}> | format: ${this.format.name} | size_in_code_units_: ${this.size_in_code_units}`
    }

    get verify_flags(): number {
        return this.verify_flags_.readU32()
    }

    get format(): Format {
        return new Format(this.format_.readU8())
    }

    get index_type(): IndexType {
        return new IndexType(this.index_type_.readU8())
    }

    get flags(): Flags {
        return new Flags(this.flags_.readU8())
    }

    get size_in_code_units(): number {
        return this.size_in_code_units_.readS8()
    }

}

//   enum Flags : uint8_t {
//     kBranch              = 0x01,  // conditional or unconditional branch
//     kContinue            = 0x02,  // flow can continue to next statement
//     kSwitch              = 0x04,  // switch statement
//     kThrow               = 0x08,  // could cause an exception to be thrown
//     kReturn              = 0x10,  // returns, no additional statements
//     kInvoke              = 0x20,  // a flavor of invoke
//     kUnconditional       = 0x40,  // unconditional branch
//     kExperimental        = 0x80,  // is an experimental opcode
//   };

class Flags extends JSHandle {

    enumMap: Map<number, string> = new Map([
        [0x01, "kBranch"],
        [0x02, "kContinue"],
        [0x04, "kSwitch"],
        [0x08, "kThrow"],
        [0x10, "kReturn"],
        [0x20, "kInvoke"],
        [0x40, "kUnconditional"],
        [0x80, "kExperimental"],
    ])

    private flags: number = this.CurrentHandle.toInt32()

    get name(): string {
        return this.enumMap.get(this.flags) || "unknown"
    }

    get value(): number {
        return this.flags
    }

    get value_ptr(): NativePointer {
        return ptr(this.value)
    }

}

// enum IndexType : uint8_t {
//     kIndexUnknown = 0,
//     kIndexNone,               // has no index
//     kIndexTypeRef,            // type reference index
//     kIndexStringRef,          // string reference index
//     kIndexMethodRef,          // method reference index
//     kIndexFieldRef,           // field reference index
//     kIndexFieldOffset,        // field offset (for static linked fields)
//     kIndexVtableOffset,       // vtable offset (for static linked methods)
//     kIndexMethodAndProtoRef,  // method and a proto reference index (for invoke-polymorphic)
//     kIndexCallSiteRef,        // call site reference index
//     kIndexMethodHandleRef,    // constant method handle reference index
//     kIndexProtoRef,           // prototype reference index
//   };

class IndexType extends JSHandle {

    enumMap: Map<number, string> = new Map([
        [0, "kIndexUnknown"],
        [1, "kIndexNone"],
        [2, "kIndexTypeRef"],
        [3, "kIndexStringRef"],
        [4, "kIndexMethodRef"],
        [5, "kIndexFieldRef"],
        [6, "kIndexFieldOffset"],
        [7, "kIndexVtableOffset"],
        [8, "kIndexMethodAndProtoRef"],
        [9, "kIndexCallSiteRef"],
        [10, "kIndexMethodHandleRef"],
        [11, "kIndexProtoRef"],
    ])

    private index_type: number = this.CurrentHandle.toInt32()

    get name(): string {
        return this.enumMap.get(this.index_type) || "unknown"
    }

    get value(): number {
        return this.index_type
    }

    get value_ptr(): NativePointer {
        return ptr(this.value)
    }

}

// enum Format : uint8_t {
//     k10x,  // op
//     k12x,  // op vA, vB
//     k11n,  // op vA, #+B
//     k11x,  // op vAA
//     k10t,  // op +AA
//     k20t,  // op +AAAA
//     k22x,  // op vAA, vBBBB
//     k21t,  // op vAA, +BBBB
//     k21s,  // op vAA, #+BBBB
//     k21h,  // op vAA, #+BBBB00000[00000000]
//     k21c,  // op vAA, thing@BBBB
//     k23x,  // op vAA, vBB, vCC
//     k22b,  // op vAA, vBB, #+CC
//     k22t,  // op vA, vB, +CCCC
//     k22s,  // op vA, vB, #+CCCC
//     k22c,  // op vA, vB, thing@CCCC
//     k32x,  // op vAAAA, vBBBB
//     k30t,  // op +AAAAAAAA
//     k31t,  // op vAA, +BBBBBBBB
//     k31i,  // op vAA, #+BBBBBBBB
//     k31c,  // op vAA, thing@BBBBBBBB
//     k35c,  // op {vC, vD, vE, vF, vG}, thing@BBBB (B: count, A: vG)
//     k3rc,  // op {vCCCC .. v(CCCC+AA-1)}, meth@BBBB

//     // op {vC, vD, vE, vF, vG}, meth@BBBB, proto@HHHH (A: count)
//     // format: AG op BBBB FEDC HHHH
//     k45cc,

//     // op {VCCCC .. v(CCCC+AA-1)}, meth@BBBB, proto@HHHH (AA: count)
//     // format: AA op BBBB CCCC HHHH
//     k4rcc,  // op {VCCCC .. v(CCCC+AA-1)}, meth@BBBB, proto@HHHH (AA: count)

//     k51l,  // op vAA, #+BBBBBBBBBBBBBBBB
//   };

class Format extends JSHandle {

    enumMap: Map<number, string> = new Map([
        [0, "k10x"],
        [1, "k12x"],
        [2, "k11n"],
        [3, "k11x"],
        [4, "k10t"],
        [5, "k20t"],
        [6, "k22x"],
        [7, "k21t"],
        [8, "k21s"],
        [9, "k21h"],
        [10, "k21c"],
        [11, "k23x"],
        [12, "k22b"],
        [13, "k22t"],
        [14, "k22s"],
        [15, "k22c"],
        [16, "k32x"],
        [17, "k30t"],
        [18, "k31t"],
        [19, "k31i"],
        [20, "k31c"],
        [21, "k35c"],
        [22, "k3rc"],
        [23, "k45cc"],
        [24, "k4rcc"],
        [25, "k51l"],
    ])

    private format: number = this.CurrentHandle.toInt32()

    get name(): string {
        return this.enumMap.get(this.format) || "unknown"
    }

    get value(): number {
        return this.format
    }

    get value_ptr(): NativePointer {
        return ptr(this.value)
    }

}