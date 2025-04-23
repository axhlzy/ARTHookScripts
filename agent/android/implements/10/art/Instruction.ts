import { JSHandle, JSHandleNotImpl } from "../../../JSHandle"
import { StdString } from "../../../../tools/StdString"
import { callSym, getSym } from "../../../Utils/SymHelper"
import { Opcode } from "./Instrumentation/InstructionList"
import { DexFile } from "./dexfile/DexFile"
import { assert } from "console"

const DEBUG_LOG: boolean = false

export class ArtInstruction extends JSHandleNotImpl {

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `ArtInstruction<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t SizeInCodeUnits=${this.SizeInCodeUnits}`
        disp += `\n\t DumpHexLE=${this.dumpHexLE()}`
        return disp
    }

    // _ZN3art11Instruction17kInstructionNamesE
    // static const char* const kInstructionNames[];
    private static cached_kInstructionNames: string[] = []
    static get kInstructionNames(): string[] {
        if (ArtInstruction.cached_kInstructionNames.length > 0) return ArtInstruction.cached_kInstructionNames
        const kInstructionNames_ptr: NativePointer = getSym('_ZN3art11Instruction17kInstructionNamesE', 'libdexfile.so', true)
        let arrary_ret: string[] = []
        let loopAddaddress: NativePointer = kInstructionNames_ptr
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer().readCString())
            loopAddaddress = loopAddaddress.add(Process.pointerSize)
        }
        ArtInstruction.cached_kInstructionNames = new Array(...arrary_ret)
        return arrary_ret
    }

    // _ZN3art11Instruction23kInstructionDescriptorsE
    // static const InstructionDescriptor kInstructionDescriptors[];
    private static cached_kInstructionDescriptors: InstructionDescriptor[] = []
    static get kInstructionDescriptors(): InstructionDescriptor[] {
        try {
            if (ArtInstruction.cached_kInstructionDescriptors.length > 0) return ArtInstruction.cached_kInstructionDescriptors
            // Process.findModuleByName("libdexfile.so").enumerateSymbols().filter(md=>{md.name.includes("InstructionDescriptors") }).forEach(md=>console.log(md.name)) 高版本安卓没有这个符号
            const kInstructionDescriptors_ptr = getSym('_ZN3art11Instruction23kInstructionDescriptorsE', 'libdexfile.so', true)
            const arrary_ret: InstructionDescriptor[] = []
            let loopAddaddress: NativePointer = kInstructionDescriptors_ptr
            let counter = 0xFF // 256
            if (DEBUG_LOG) var index = 0
            while (counter-- > 0) {
                arrary_ret.push(new InstructionDescriptor(loopAddaddress))
                if (DEBUG_LOG) LOGZ(`${++index} ${new InstructionDescriptor(loopAddaddress)}`)
                loopAddaddress = loopAddaddress.add(InstructionDescriptor.SizeOfClass)
            }
            ArtInstruction.cached_kInstructionDescriptors = new Array(...arrary_ret)
            return arrary_ret
        } catch (error) {
            LOGE(`NOT SUPPORT ANDROID VERSION \n${error}`)
        }
    }

    // https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_instruction.h;l=689
    private static cached_kInstructionDescriptorsMap: Array<[String, InstructionDescriptor]> = []
    static get InstructionGroup(): Array<[String, InstructionDescriptor]> {
        if (ArtInstruction.cached_kInstructionDescriptorsMap.length > 0) return ArtInstruction.cached_kInstructionDescriptorsMap
        let arrary_ret: Array<[String, InstructionDescriptor]> = []
        ArtInstruction.kInstructionDescriptors.forEach((descriptor, index) => {
            arrary_ret.push([ArtInstruction.kInstructionNames[index], descriptor])
        })
        ArtInstruction.cached_kInstructionDescriptorsMap = new Array(...arrary_ret)
        return arrary_ret
    }

    // _ZNK3art11Instruction10DumpStringEPKNS_7DexFileE
    // std::string DumpString(const DexFile*) const;
    dumpString(dexFile: DexFile): String {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE", "libdexfile.so"
            , ["pointer", "pointer", "pointer"]
            , ["pointer", "pointer"]
            , this, dexFile))
    }

    // _ZNK3art11Instruction7DumpHexEm
    // std::string DumpHex(size_t code_units) const;
    dumpHex(code_units: number = 3): String {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZNK3art11Instruction7DumpHexEm", "libdexfile.so"
            , ["pointer", "pointer", "pointer"]
            , ["pointer", "pointer"]
            , this.handle, code_units))
    }

    // _ZNK3art11Instruction9DumpHexLEEm
    // std::string DumpHexLE(size_t instr_code_units) const;
    dumpHexLE(instr_code_units: number = 3): String {
        const realInsLen: number = this.SizeInCodeUnits / 2
        return `${realInsLen} - ${StdString.fromPointers(callSym<NativePointer[]>(
            "_ZNK3art11Instruction9DumpHexLEEm", "libdexfile.so"
            , ["pointer", "pointer", "pointer"]
            , ["pointer", "int"]
            , this.handle, realInsLen > instr_code_units ? realInsLen : instr_code_units))}`
    }

    // _ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv
    // size_t SizeInCodeUnitsComplexOpcode() const;
    sizeInCodeUnitsComplexOpcode(): number {
        return callSym<number>(
            "_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv", "libdexfile.so"
            , ["pointer"]
            , ["pointer"]
            , this.handle)
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

    clone(): ArtInstruction {
        var tempMemory = Memory.alloc(this.SizeInCodeUnits)
        Memory.copy(tempMemory, this.handle, this.SizeInCodeUnits)
        return ArtInstruction.At(tempMemory)
    }

    // current Address
    get current(): NativePointer {
        return this.handle
    }

    get SizeInCodeUnits(): number {
        const opcode: number = this.Fetch16()
        if (DEBUG_LOG) LOGZ(`opcode: ${ptr(opcode)} ${opcode} | ${ArtInstruction.kInstructionDescriptors[opcode]} | ${ArtInstruction.kInstructionNames[opcode]}`)
        let result: number = (ArtInstruction.InstructionGroup[opcode][1].size_in_code_units)
        if (result < 0) return this.sizeInCodeUnitsComplexOpcode() * 0x2
        else return result * 0x2
    }

    //   uint16_t Fetch16(size_t offset) const {
    //     const uint16_t* insns = reinterpret_cast<const uint16_t*>(this);
    //     return insns[offset];
    //   }
    Fetch16(offset: number = 0): number {
        return this.handle.add(offset).readU8()
    }

    get opcode(): number {
        return this.Fetch16()
    }

    get opName_RunTime(): string {
        assert(this.opcode < ArtInstruction.kInstructionNames.length, `opcode ${this.opcode} out of range`)
        return ArtInstruction.kInstructionNames[this.opcode]
    }

    get opName(): string {
        assert(this.opcode < ArtInstruction.kInstructionNames.length, `opcode ${this.opcode} out of range`)
        return Opcode.getOpName(this.opcode)
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

// https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_instruction.h;l=208
class InstructionDescriptor extends JSHandleNotImpl {

    // uint32_t verify_flags; 
    verify_flags_ = this.handle
    // Format format; => uint8_t
    format_ = this.verify_flags_.add(0x4)
    // IndexType index_type; => uint8_t
    index_type_ = this.format_.add(0x1)
    // uint8_t flags;
    flags_ = this.index_type_.add(0x1)
    // int8_t size_in_code_units;
    size_in_code_units_ = this.flags_.add(0x1)

    toString(): string {
        return `InstructionDescriptor<${this.handle}> | format: ${this.format.name} @ ${this.format.handle} | size_in_code_units: ${this.size_in_code_units} @ `
    }

    static get SizeOfClass(): NativePointer {
        return ptr(0x4).add(0x1).add(0x1).add(0x1).add(0x1)
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

// https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_instruction.h;l=144
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

// https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_instruction.h;l=129
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

// https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_instruction.h;l=92
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

    private format: number = this.CurrentHandle.toUInt32()

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

export { }

declare global {
    var InstructionGroup: () => Array<[String, InstructionDescriptor]>
}

// https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_instruction_list.h;l=21
globalThis.InstructionGroup = () => { return ArtInstruction.InstructionGroup }

Reflect.set(globalThis, "ArtInstruction", ArtInstruction)