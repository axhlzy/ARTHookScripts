import { ArtInstruction } from "./Instruction"
import { ArtMethod } from "./mirror/ArtMethod"
import { JSHandle } from "../../../JSHandle"
import { ArtObject } from "../../../Object"
import { PointerSize } from "./Globals"
import { JValue } from "./Type/JValue"

// jetbrains://clion/navigate/reference?project=libart&path=interpreter/shadow_frame.h

type int16_t = number
type uint16_t = number
type uint32_t = number

export class ShadowFrame extends JSHandle {

    //   // Link to previous shadow frame or null.
    //   ShadowFrame* link_;
    private link_: NativePointer = this.CurrentHandle
    //   ArtMethod* method_;
    private method_: NativePointer = this.link_.add(PointerSize)
    //   JValue* result_register_;
    private result_register_: NativePointer = this.method_.add(PointerSize)
    //   const uint16_t* dex_pc_ptr_;
    private dex_pc_ptr_: NativePointer = this.result_register_.add(PointerSize)
    //   // Dex instruction base of the code item.
    //   const uint16_t* dex_instructions_;
    private dex_instructions_: NativePointer = this.dex_pc_ptr_.add(PointerSize)
    //   LockCountData lock_count_data_;  // This may contain GC roots when lock counting is active.
    //   const uint32_t number_of_vregs_;
    private number_of_vregs_: NativePointer = this.dex_instructions_.add(PointerSize)
    //   uint32_t dex_pc_;
    private dex_pc_: NativePointer = this.number_of_vregs_.add(0x4)
    //   int16_t cached_hotness_countdown_;
    private cached_hotness_countdown_: NativePointer = this.dex_pc_.add(0x4)
    //   int16_t hotness_countdown_;
    private hotness_countdown_: NativePointer = this.cached_hotness_countdown_.add(0x2)

    //   // This is a set of ShadowFrame::FrameFlags which denote special states this frame is in.
    //   // NB alignment requires that this field takes 4 bytes no matter its size. Only 3 bits are
    //   // currently used.
    //   uint32_t frame_flags_;
    private frame_flags_: NativePointer = this.hotness_countdown_.add(0x2)

    //   // This is a two-part array:
    //   //  - [0..number_of_vregs) holds the raw virtual registers, and each element here is always 4
    //   //    bytes.
    //   //  - [number_of_vregs..number_of_vregs*2) holds only reference registers. Each element here is
    //   //    ptr-sized.
    //   // In other words when a primitive is stored in vX, the second (reference) part of the array will
    //   // be null. When a reference is stored in vX, the second (reference) part of the array will be a
    //   // copy of vX.
    //   uint32_t vregs_[0];
    private vregs_: NativePointer = this.frame_flags_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `ShadowFrame<${this.handle}>`
        seeHexA(this.handle)
        if (this.handle.isNull()) return disp
        disp += `\n\t link_: ${this.link_}`
        disp += `\n\t method_: ${this.method_} -> ${this.method.PrettyMethod()}`
        disp += `\n\t result_register: ${this.result_register}`
        disp += `\n\t dex_pc_ptr: ${this.dex_pc_ptr}`
        disp += `\n\t dex_instructions: ${this.dex_instructions.toString().split('\n').map((item, index) => index == 0 ? item : `\n\t${item}`).join('')}`
        disp += `\n\t number_of_vregs: ${this.number_of_vregs}`
        disp += `\n\t dex_pc: ${this.dex_pc}`
        disp += `\n\t cached_hotness_countdown: ${this.cached_hotness_countdown}`
        disp += `\n\t hotness_countdown: ${this.hotness_countdown}`
        disp += `\n\t frame_flags: ${this.frame_flags}`
        // disp += `\n\t vregs: ${this.vregs}`
        return disp
    }

    get link(): ShadowFrame {
        return new ShadowFrame(this.link_.readPointer())
    }

    get method(): ArtMethod {
        return new ArtMethod(this.method_.readPointer())
    }

    get result_register(): JValue {
        return new JValue(this.result_register_.readPointer())
    }

    get dex_pc_ptr(): NativePointer {
        return this.dex_pc_ptr_.readPointer()
    }

    get dex_instructions(): ArtInstruction {
        return new ArtInstruction(this.dex_instructions_.readPointer())
    }

    get number_of_vregs(): uint32_t {
        return this.number_of_vregs_.readU32()
    }

    get dex_pc(): uint32_t {
        return this.dex_pc_.readU32()
    }

    get cached_hotness_countdown(): int16_t {
        return this.cached_hotness_countdown_.readS16()
    }

    get hotness_countdown(): int16_t {
        return this.hotness_countdown_.readS16()
    }

    get frame_flags(): uint32_t {
        return this.frame_flags_.readU32()
    }

    set dex_pc(dex_pc_: uint32_t) {
        this.dex_pc_.writeU32(dex_pc_)
    }

    set dex_pc_ptr(dex_pc_ptr_: NativePointer) {
        this.dex_pc_ptr_.writePointer(dex_pc_ptr_)
    }

    get vregs(): uint32_t[] {
        const vregs = []
        for (let i = 0; i < this.number_of_vregs; i++) {
            vregs.push(this.vregs_.add(i * 4).readU32())
        }
        return vregs
    }

    get vreg_refs(): NativePointer[] {
        const vreg_refs = []
        for (let i = 0; i < this.number_of_vregs; i++) {
            vreg_refs.push(this.vregs_.add(this.number_of_vregs * 0x4 + i * PointerSize))
        }
        return vreg_refs
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

    // mirror::Object* GetThisObject() 
    // _ZNK3art11ShadowFrame13GetThisObjectEv
    GetThisObject(): ArtObject {
        return new ArtObject(callSym<NativePointer>(
            "_ZNK3art11ShadowFrame13GetThisObjectEt", "libart.so"
            , ["pointer", "uint16"]
            , ["pointer", "uint16"]
            , this.handle, 0))
    }

    //  mirror::Object* GetThisObject(uint16_t num_ins)
    // _ZNK3art11ShadowFrame13GetThisObjectEt
    GetThisObject_num_ins(num_ins: uint16_t): ArtObject {
        return new ArtObject(callSym<NativePointer>(
            "_ZNK3art11ShadowFrame13GetThisObjectEt", "libart.so"
            , ["pointer", "uint16"]
            , ["pointer", "uint16"]
            , this.handle, num_ins))
    }

    // uint32_t GetDexPC() const 
    GetDexPC(): NativePointer {
        return this.dex_pc_ptr_.isNull() ? this.dex_pc_ : this.dex_pc_ptr_.sub(this.dex_instructions_)
    }

    // int16_t GetCachedHotnessCountdown() const 
    GetCachedHotnessCountdown(): int16_t {
        return this.cached_hotness_countdown
    }

    // void SetCachedHotnessCountdown(int16_t cached_hotness_countdown) 
    SetCachedHotnessCountdown(cached_hotness_countdown: int16_t): void {
        this.cached_hotness_countdown_.writeS16(cached_hotness_countdown)
    }

    // int16_t GetHotnessCountdown() const
    GetHotnessCountdown(): int16_t {
        return this.hotness_countdown
    }

    // void SetHotnessCountdown(int16_t hotness_countdown)
    SetHotnessCountdown(hotness_countdown: int16_t): void {
        this.hotness_countdown_.writeS16(hotness_countdown)
    }

    // void SetDexPC(uint32_t dex_pc) 
    SetDexPC(dex_pc_v: uint32_t): void {
        this.dex_pc = dex_pc_v
        this.dex_pc_ptr = NULL
    }

    get backTrace(): ShadowFrame[] {
        const backtrace = []
        let sf: ShadowFrame = this
        while (!sf.link.handle.isNull()) {
            backtrace.push(sf)
            sf = sf.link
        }
        return backtrace
    }

    public printBackTrace(simple: boolean = true): void {
        this.backTrace.map((sf, index) => `${index}: ${simple ? sf.method.PrettyMethod() : sf.method}`).forEach(LOGD)
    }

    public printBackTraceWithSmali(simple: boolean = true, smaliLines: number = 3): void {
        this.backTrace.forEach((sf: ShadowFrame, index: number) => {
            const thisMethod: ArtMethod = sf.method
            LOGD(`${index}: ${simple ? thisMethod.PrettyMethod() : thisMethod}`)
            const dexfile = thisMethod.GetDexFile()
            let artInstruction = sf.dex_pc_ptr.isNull() ? thisMethod.DexInstructions().InstructionAt() : new ArtInstruction(sf.dex_pc_ptr)
            let counter: number = smaliLines
            let disp_smali: string = ""
            while (--counter >= 0 && artInstruction.Next().SizeInCodeUnits > 0) {
                const offset: NativePointer = artInstruction.handle.sub(thisMethod.DexInstructions().insns)
                disp_smali += `\t${artInstruction.handle} ${offset} -> ${artInstruction.dumpString(dexfile)}\n`
                artInstruction = artInstruction.Next()
            }
            LOGZ(disp_smali.trimEnd())
        })
    }

}