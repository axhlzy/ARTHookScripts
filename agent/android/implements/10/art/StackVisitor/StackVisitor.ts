import { QuickMethodFrameInfo } from "../QuickMethodFrameInfo"
import { OatQuickMethodHeader } from "../OatQuickMethodHeader"
import { StdString } from "../../../../../tools/StdString"
import { ArtMethod } from "../mirror/ArtMethod"
import { JSHandle } from "../../../../JSHandle"
import { ArtObject } from "../../../../Object"
import { ShadowFrame } from "../ShadowFrame"
import { PointerSize } from "../Globals"
import { ArtThread } from "../Thread"

type size_t = number
type uint16_t = number
type uint32_t = number
type uint64_t = number
type uintptr_t = NativePointer

export class StackVisitor extends JSHandle {

    // public:
    // Thread* const thread_;
    thread_: NativePointer = this.CurrentHandle
    // const StackWalkKind walk_kind_;
    walk_kind_: NativePointer = this.thread_.add(PointerSize)
    // ShadowFrame* cur_shadow_frame_;
    cur_shadow_frame_: NativePointer = this.walk_kind_.add(PointerSize)
    // ArtMethod** cur_quick_frame_;
    cur_quick_frame_: NativePointer = this.cur_shadow_frame_.add(PointerSize)
    // uintptr_t cur_quick_frame_pc_;
    cur_quick_frame_pc_: NativePointer = this.cur_quick_frame_.add(PointerSize)
    // const OatQuickMethodHeader* cur_oat_quick_method_header_;
    cur_oat_quick_method_header_: NativePointer = this.cur_quick_frame_pc_.add(PointerSize)
    // // Lazily computed, number of frames in the stack.
    // size_t num_frames_;
    num_frames_: NativePointer = this.cur_oat_quick_method_header_.add(PointerSize)
    // // Lazily computed, depth of the deepest stack frame.
    // // Depth of the frame we're currently at.
    // size_t cur_depth_;
    cur_depth_: NativePointer = this.num_frames_.add(PointerSize)
    // // Current inlined frames of the method we are currently at.
    // // We keep poping frames from the end as we visit the frames.
    // CodeInfo current_code_info_;
    current_code_info_: NativePointer = this.cur_depth_.add(PointerSize)
    // BitTableRange<InlineInfo> current_inline_frames_;
    current_inline_frames_: NativePointer = this.current_code_info_.add(PointerSize)

    // protected:
    // Context* const context_;
    context_: NativePointer = this.current_inline_frames_.add(PointerSize)
    // const bool check_suspended_;
    check_suspended_: NativePointer = this.context_.add(PointerSize)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset)
    }

    get SizeOfClass(): number {
        return this.check_suspended_.add(PointerSize).sub(this.CurrentHandle).toInt32()
    }

    get VirtualClassOffset(): number {
        return PointerSize
    }

    get thread(): ArtThread {
        return new ArtThread(this.thread_.readPointer())
    }

    get walk_kind(): StackWalkKind {
        return this.walk_kind_.readU32()
    }

    get cur_shadow_frame(): ShadowFrame {
        return new ShadowFrame(this.cur_shadow_frame_.readPointer())
    }

    get cur_quick_frame(): ArtMethod {
        return new ArtMethod(this.cur_quick_frame_.readPointer().readPointer())
    }

    get cur_quick_frame_pc(): NativePointer {
        return this.cur_quick_frame_pc_.readPointer()
    }

    get cur_oat_quick_method_header(): OatQuickMethodHeader {
        return new OatQuickMethodHeader(this.cur_oat_quick_method_header_.readPointer())
    }

    get num_frames(): number {
        return this.num_frames_.readPointer().toInt32()
    }

    get cur_depth(): number {
        return this.cur_depth_.readPointer().toInt32()
    }

    get current_code_info(): NativePointer {
        return this.current_code_info_.readPointer()
    }

    get current_inline_frames(): NativePointer {
        return this.current_inline_frames_.readPointer()
    }

    get context(): NativePointer {
        return this.context_.readPointer()
    }

    get check_suspended(): boolean {
        return this.check_suspended_.readU8() == 1
    }

    // StackVisitor(Thread* thread, Context* context, StackWalkKind walk_kind, bool check_suspended = true);
    // _ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEb
    static fromThread(thread: NativePointer, context: NativePointer, walk_kind: StackWalkKind, check_suspended: boolean = true): StackVisitor {
        return new StackVisitor(callSym<NativePointer>(
            "_ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEb", "libart.so",
            "pointer", ["pointer", "pointer", "int", "bool"],
            thread, context, walk_kind, check_suspended))
    }

    // uint32_t StackVisitor::GetDexPc(bool abort_on_failure) const 
    // _ZNK3art12StackVisitor8GetDexPcEb
    GetDexPc(abort_on_failure: boolean): uint32_t {
        return callSym<uint32_t>(
            "_ZNK3art12StackVisitor8GetDexPcEb", "libart.so",
            "int", ["pointer", "int"],
            this.CurrentHandle, abort_on_failure)
    }

    // ArtMethod* StackVisitor::GetMethod() const
    // _ZNK3art12StackVisitor9GetMethodEv
    GetMethod(): ArtMethod {
        return new ArtMethod(callSym<NativePointer>(
            "_ZNK3art12StackVisitor9GetMethodEv", "libart.so",
            "pointer", ["pointer"],
            this.CurrentHandle))
    }

    // _ZNK3art12StackVisitor6GetGPREj
    // uintptr_t* StackVisitor::GetGPRAddress(uint32_t reg) const
    GetGPR(reg: uint32_t): NativePointer {
        return callSym<uintptr_t>(
            "_ZNK3art12StackVisitor6GetGPREj", "libart.so",
            "pointer", ["pointer", "int"],
            this.handle, reg)
    }

    // _ZNK3art12StackVisitor28GetVRegPairFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindES3_Pm
    // bool StackVisitor::GetVRegPairFromOptimizedCode(ArtMethod* m, uint16_t vreg,
    //     VRegKind kind_lo, VRegKind kind_hi,
    //     uint64_t* val) const {
    GetVRegPairFromOptimizedCode(m: ArtMethod, vreg: uint16_t, kind_lo: VRegKind, kind_hi: VRegKind, val: uint64_t): boolean {
        return callSym<NativePointer>(
            "_ZNK3art12StackVisitor28GetVRegPairFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindES3_Pm", "libart.so",
            "pointer", ["pointer", "pointer", "short", "int", "int"],
            this.handle, m.handle, vreg, kind_lo, kind_hi, val).isNull()
    }

    // _ZNK3art12StackVisitor13GetGPRAddressEj
    // uintptr_t* StackVisitor::GetGPRAddress(uint32_t reg) const 
    GetGPRAddress(reg: uint32_t): uintptr_t {
        return callSym<uintptr_t>(
            "_ZNK3art12StackVisitor13GetGPRAddressEj", "libart.so",
            "pointer", ["pointer", "int"],
            this.handle, reg)
    }

    // void StackVisitor::SanityCheckFrame() const 
    // _ZNK3art12StackVisitor16SanityCheckFrameEv
    SanityCheckFrame(): void {
        callSym<void>(
            "_ZNK3art12StackVisitor16SanityCheckFrameEv", "libart.so",
            "void", ["pointer"],
            this.handle)
    }

    // void StackVisitor::SetMethod(ArtMethod* method) 
    // _ZN3art12StackVisitor9SetMethodEPNS_9ArtMethodE
    SetMethod(method: ArtMethod): void {
        callSym<void>(
            "_ZN3art12StackVisitor9SetMethodEPNS_9ArtMethodE", "libart.so",
            "void", ["pointer", "pointer"],
            this.handle, method.handle)
    }

    // size_t StackVisitor::ComputeNumFrames(Thread* thread, StackWalkKind walk_kind) 
    // _ZN3art12StackVisitor16ComputeNumFramesEPNS_6ThreadENS0_13StackWalkKindE
    ComputeNumFrames(thread: NativePointer, walk_kind: VRegKind): number {
        return callSym<number>(
            "_ZN3art12StackVisitor16ComputeNumFramesEPNS_6ThreadENS0_13StackWalkKindE", "libart.so",
            "int", ["pointer", "pointer", "int"],
            this.handle, thread, walk_kind)
    }

    // template <StackVisitor::CountTransitions kCount>
    // void StackVisitor::WalkStack(bool include_transitions) 

    // _ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE0EEEvb
    // void art::StackVisitor::WalkStack<(art::StackVisitor::CountTransitions)0>(bool)
    WalkStack_0(include_transitions: boolean): void {
        callSym<void>(
            "_ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE0EEEvb", "libart.so",
            "void", ["pointer", "bool"],
            this.handle, include_transitions)
    }

    // _ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE1EEEvb
    // void art::StackVisitor::WalkStack<(art::StackVisitor::CountTransitions)1>(bool)
    WalkStack_1(include_transitions: boolean): void {
        callSym<void>(
            "_ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE1EEEvb", "libart.so",
            "void", ["pointer", "bool"],
            this.handle, include_transitions)
    }

    // uintptr_t StackVisitor::GetReturnPc() const 
    // _ZNK3art12StackVisitor11GetReturnPcEv
    GetReturnPc(): uintptr_t {
        return callSym<uintptr_t>(
            "_ZNK3art12StackVisitor11GetReturnPcEv", "libart.so",
            "pointer", ["pointer"],
            this.handle)
    }

    // void StackVisitor::SetReturnPc(uintptr_t new_ret_pc) 
    // _ZN3art12StackVisitor11SetReturnPcEm
    SetReturnPc(new_ret_pc: uintptr_t): void {
        callSym<void>(
            "_ZN3art12StackVisitor11SetReturnPcEm", "libart.so",
            "void", ["pointer", "pointer"],
            this.handle, new_ret_pc)
    }

    // void StackVisitor::DescribeStack(Thread* thread) 
    // _ZN3art12StackVisitor13DescribeStackEPNS_6ThreadE
    DescribeStack(thread: ArtThread): void {
        callSym<void>(
            "_ZN3art12StackVisitor13DescribeStackEPNS_6ThreadE", "libart.so",
            "void", ["pointer", "pointer"],
            this.handle, thread.handle)
    }

    // bool StackVisitor::GetVRegFromOptimizedCode(ArtMethod* m, uint16_t vreg, VRegKind kind, uint32_t* val) const 
    // _ZNK3art12StackVisitor24GetVRegFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindEPj
    GetVRegFromOptimizedCode(m: ArtMethod, vreg: uint16_t, kind: VRegKind, val: uint32_t): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor24GetVRegFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindEPj", "libart.so",
            "int", ["pointer", "pointer", "short", "int", "int"],
            this.handle, m.handle, vreg, kind, val)
    }

    // bool StackVisitor::GetVRegPair(ArtMethod* m, uint16_t vreg, VRegKind kind_lo, VRegKind kind_hi, uint64_t* val) 
    // _ZNK3art12StackVisitor11GetVRegPairEPNS_9ArtMethodEtNS_8VRegKindES3_Pm
    GetVRegPair(m: ArtMethod, vreg: uint16_t, kind_lo: VRegKind, kind_hi: VRegKind, val: uint64_t): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor11GetVRegPairEPNS_9ArtMethodEtNS_8VRegKindES3_Pm", "libart.so",
            "int", ["pointer", "pointer", "short", "int", "int"],
            this.handle, m.handle, vreg, kind_lo, kind_hi, val)
    }

    // bool StackVisitor::SetVReg(ArtMethod* m, uint16_t vreg, uint32_t new_value, VRegKind kind)
    // _ZN3art12StackVisitor7SetVRegEPNS_9ArtMethodEtjNS_8VRegKindE
    SetVReg(m: ArtMethod, vreg: uint16_t, new_value: uint32_t, kind: VRegKind): boolean {
        return callSym<boolean>(
            "_ZN3art12StackVisitor7SetVRegEPNS_9ArtMethodEtjNS_8VRegKindE", "libart.so",
            "int", ["pointer", "pointer", "short", "int", "int"],
            this.handle, m.handle, vreg, new_value, kind)
    }

    // bool StackVisitor::GetVReg(ArtMethod* m, uint16_t vreg, VRegKind kind, uint32_t* val) const 
    // _ZNK3art12StackVisitor7GetVRegEPNS_9ArtMethodEtNS_8VRegKindEPj
    GetVReg(m: ArtMethod, vreg: uint16_t, kind: VRegKind): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor7GetVRegEPNS_9ArtMethodEtNS_8VRegKindEPj", "libart.so",
            "int", ["pointer", "pointer", "short", "int", "int"],
            this.handle, m.handle, vreg, kind)
    }

    // size_t StackVisitor::GetNativePcOffset() const
    // _ZN3art12StackVisitor11SetReturnPcEm
    GetNativePcOffset(): size_t {
        return callSym<size_t>(
            "_ZN3art12StackVisitor19GetNativePcOffsetEv", "libart.so",
            "int", ["pointer"],
            this.handle)
    }

    // bool StackVisitor::SetVRegPair(ArtMethod* m, uint16_t vreg, uint64_t new_value, VRegKind kind_lo, VRegKind kind_hi) 
    // _ZN3art12StackVisitor11SetVRegPairEPNS_9ArtMethodEtmNS_8VRegKindES3_
    SetVRegPair(m: ArtMethod, vreg: uint16_t, new_value: uint64_t, kind_lo: VRegKind, kind_hi: VRegKind): boolean {
        return callSym<boolean>(
            "_ZN3art12StackVisitor11SetVRegPairEPNS_9ArtMethodEtmNS_8VRegKindES3_", "libart.so",
            "int", ["pointer", "pointer", "short", "int", "int", "int"],
            this.handle, m.handle, vreg, new_value, kind_lo, kind_hi)
    }

    // std::string StackVisitor::DescribeLocation() const
    // _ZNK3art12StackVisitor16DescribeLocationEv
    DescribeLocation(): string {
        return StdString.fromPointer(callSym<NativePointer>(
            "_ZNK3art12StackVisitor16DescribeLocationEv", "libart.so",
            "pointer", ["pointer"],
            this.handle))
    }

    // QuickMethodFrameInfo StackVisitor::GetCurrentQuickFrameInfo() const 
    // _ZNK3art12StackVisitor24GetCurrentQuickFrameInfoEv
    GetCurrentQuickFrameInfo(): QuickMethodFrameInfo {
        return new QuickMethodFrameInfo(callSym<NativePointer>(
            "_ZNK3art12StackVisitor24GetCurrentQuickFrameInfoEv", "libart.so",
            "pointer", ["pointer"],
            this.handle))
    }

    // bool StackVisitor::IsAccessibleGPR(uint32_t reg) const 
    // _ZNK3art12StackVisitor15IsAccessibleGPREj
    IsAccessibleGPR(reg: uint32_t): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor15IsAccessibleGPREj", "libart.so",
            "bool", ["pointer", "int"],
            this.handle, reg)
    }

    // uintptr_t StackVisitor::GetFPR(uint32_t reg) const 
    // _ZNK3art12StackVisitor6GetFPREj
    GetFPR(reg: uint32_t): uintptr_t {
        return callSym<uintptr_t>(
            "_ZNK3art12StackVisitor6GetFPREj", "libart.so",
            "pointer", ["pointer", "int"],
            this.handle, reg)
    }

    // bool StackVisitor::GetVRegPairFromDebuggerShadowFrame(uint16_t vreg, VRegKind kind_lo, VRegKind kind_hi, uint64_t* val) 
    // _ZNK3art12StackVisitor34GetVRegPairFromDebuggerShadowFrameEtNS_8VRegKindES1_Pm
    GetVRegPairFromDebuggerShadowFrame(vreg: uint16_t, kind_lo: VRegKind, kind_hi: VRegKind, val: uint64_t): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor34GetVRegPairFromDebuggerShadowFrameEtNS_8VRegKindES1_Pm", "libart.so",
            "int", ["pointer", "int", "int", "int"],
            this.handle, vreg, kind_lo, kind_hi, val)
    }

    // bool StackVisitor::GetVRegFromDebuggerShadowFrame(uint16_t vreg, VRegKind kind, uint32_t* val) const 
    // _ZNK3art12StackVisitor30GetVRegFromDebuggerShadowFrameEtNS_8VRegKindEPj
    GetVRegFromDebuggerShadowFrame(vreg: uint32_t, kind: VRegKind): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor30GetVRegFromDebuggerShadowFrameEtNS_8VRegKindEPj", "libart.so",
            "int", ["pointer", "short", "pointer"],
            this.handle, vreg, kind)
    }

    // bool StackVisitor::GetRegisterPairIfAccessible(uint32_t reg_lo, uint32_t reg_hi, VRegKind kind_lo, uint64_t* val) const
    // _ZNK3art12StackVisitor27GetRegisterPairIfAccessibleEjjNS_8VRegKindEPm
    GetRegisterPairIfAccessible(reg_lo: uint32_t, reg_hi: VRegKind, kind_lo: VRegKind, val: uint64_t): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor27GetRegisterPairIfAccessibleEjjNS_8VRegKindEPm", "libart.so",
            "int", ["pointer", "int", "int", "int", "int"],
            this.handle, reg_lo, reg_hi, kind_lo, val)
    }

    // bool StackVisitor::GetRegisterIfAccessible(uint32_t reg, VRegKind kind, uint32_t* val) const 
    // _ZNK3art12StackVisitor23GetRegisterIfAccessibleEjNS_8VRegKindEPj
    GetRegisterIfAccessible(reg: uint32_t, kind: VRegKind, val: uint32_t): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor23GetRegisterIfAccessibleEjNS_8VRegKindEPj", "libart.so",
            "int", ["pointer", "int", "int"],
            this.handle, reg, kind, val)
    }

    // bool StackVisitor::IsAccessibleFPR(uint32_t reg) const 
    // _ZNK3art12StackVisitor15IsAccessibleFPREj
    IsAccessibleFPR(reg: uint32_t): boolean {
        return callSym<boolean>(
            "_ZNK3art12StackVisitor15IsAccessibleFPREj", "libart.so",
            "bool", ["pointer", "int"],
            this.handle, reg)
    }

    // mirror::Object* StackVisitor::GetThisObject() const 
    // _ZNK3art12StackVisitor13GetThisObjectEv
    GetThisObject(): ArtObject {
        return new ArtObject(callSym<NativePointer>(
            "_ZNK3art12StackVisitor13GetThisObjectEv", "libart.so",
            "pointer", ["pointer"],
            this.handle))
    }

    // bool StackVisitor::GetNextMethodAndDexPc(ArtMethod** next_method, uint32_t* next_dex_pc)
    // _ZN3art12StackVisitor20GetNextMethodAndDexPcEPPNS_9ArtMethodEPj
    GetNextMethodAndDexPc(next_method: NativePointer, next_dex_pc: uint32_t): boolean {
        return callSym<boolean>(
            "_ZN3art12StackVisitor20GetNextMethodAndDexPcEPPNS_9ArtMethodEPj", "libart.so",
            "bool", ["pointer", "pointer", "pointer"],
            this.handle, next_method, next_dex_pc)
    }

}

// enum VRegKind {
//     kReferenceVReg,
//     kIntVReg,
//     kFloatVReg,
//     kLongLoVReg,
//     kLongHiVReg,
//     kDoubleLoVReg,
//     kDoubleHiVReg,
//     kConstant,
//     kImpreciseConstant,
//     kUndefined,
//   };
export enum VRegKind {
    kReferenceVReg = 0,
    kIntVReg = 1,
    kFloatVReg = 2,
    kLongLoVReg = 3,
    kLongHiVReg = 4,
    kDoubleLoVReg = 5,
    kDoubleHiVReg = 6,
    kConstant = 7,
    kImpreciseConstant = 8,
    kUndefined = 9,
};

//   enum class StackWalkKind {
//     kIncludeInlinedFrames,
//     kSkipInlinedFrames,
//   };
export enum StackWalkKind {
    kIncludeInlinedFrames = 0,
    kSkipInlinedFrames = 1,
};