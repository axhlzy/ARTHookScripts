import { JSHandle } from "../../../JSHandle"
import { ArtObject } from "../../../Object"
import { PointerSize } from "./Globals"
import { ArtInstruction } from "./Instruction"
import { ArtMethod } from "./mirror/ArtMethod"

// jetbrains://clion/navigate/reference?project=libart&path=interpreter/shadow_frame.h

type int16_t = number
type uint16_t = number
type uint32_t = number
type JValue = NativePointer

export class ShadowFrame extends JSHandle {

    //   // Link to previous shadow frame or null.
    //   ShadowFrame* link_;
    link_: NativePointer = this.CurrentHandle
    //   ArtMethod* method_;
    method_: NativePointer = this.link_.add(PointerSize)
    //   JValue* result_register_;
    result_register_: NativePointer = this.method_.add(PointerSize)
    //   const uint16_t* dex_pc_ptr_;
    dex_pc_ptr_: NativePointer = this.result_register_.add(PointerSize)
    //   // Dex instruction base of the code item.
    //   const uint16_t* dex_instructions_;
    dex_instructions_: NativePointer = this.dex_pc_ptr_.add(PointerSize)
    //   LockCountData lock_count_data_;  // This may contain GC roots when lock counting is active.
    //   const uint32_t number_of_vregs_;
    number_of_vregs_: NativePointer = this.dex_instructions_.add(PointerSize)
    //   uint32_t dex_pc_;
    dex_pc_: NativePointer = this.number_of_vregs_.add(PointerSize)
    //   int16_t cached_hotness_countdown_;
    cached_hotness_countdown_: NativePointer = this.dex_pc_.add(0x4)
    //   int16_t hotness_countdown_;
    hotness_countdown_: NativePointer = this.cached_hotness_countdown_.add(0x2)

    //   // This is a set of ShadowFrame::FrameFlags which denote special states this frame is in.
    //   // NB alignment requires that this field takes 4 bytes no matter its size. Only 3 bits are
    //   // currently used.
    //   uint32_t frame_flags_;
    frame_flags_: NativePointer = this.hotness_countdown_.add(0x2)

    //   // This is a two-part array:
    //   //  - [0..number_of_vregs) holds the raw virtual registers, and each element here is always 4
    //   //    bytes.
    //   //  - [number_of_vregs..number_of_vregs*2) holds only reference registers. Each element here is
    //   //    ptr-sized.
    //   // In other words when a primitive is stored in vX, the second (reference) part of the array will
    //   // be null. When a reference is stored in vX, the second (reference) part of the array will be a
    //   // copy of vX.
    //   uint32_t vregs_[0];
    vregs_: NativePointer = this.frame_flags_.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `ShadowFrame<${this.handle}>`
        disp += `\nlink: ${this.link}`
        disp += `\nmethod: ${this.method}`
        disp += `\nresult_register: ${this.result_register}`
        disp += `\ndex_pc_ptr: ${this.dex_pc_ptr}`
        disp += `\ndex_instructions: ${this.dex_instructions}`
        disp += `\nnumber_of_vregs: ${this.number_of_vregs}`
        disp += `\ndex_pc: ${this.dex_pc}`
        disp += `\ncached_hotness_countdown: ${this.cached_hotness_countdown}`
        disp += `\nhotness_countdown: ${this.hotness_countdown}`
        disp += `\nframe_flags: ${this.frame_flags}`
        disp += `\nvregs: ${this.vregs}`
        return disp
    }

    get link(): ShadowFrame {
        return new ShadowFrame(this.link_)
    }

    get method(): ArtMethod {
        return new ArtMethod(this.method_)
    }

    get result_register(): JValue {
        return this.result_register_
    }

    get dex_pc_ptr(): uint16_t {
        return this.dex_pc_ptr_.readPointer().toUInt32()
    }

    get dex_instructions(): ArtInstruction {
        return new ArtInstruction(this.dex_instructions_)
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

    set dex_pc_ptr(dex_pc_ptr_: uint16_t) {
        this.dex_pc_ptr_.writePointer(ptr(dex_pc_ptr_))
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
        this.dex_pc_ptr = 0
    }

}