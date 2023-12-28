import { CodeItemInstructionAccessor } from "../CodeItemInstructionAccessor"
import { IArtMethod } from "../../../../Interface/art/mirror/IArtMethod"
import { OatQuickMethodHeader } from "../OatQuickMethodHeader"
import { StdString } from "../../../../../tools/StdString"
import { InvokeType } from "../../../../../tools/enum"
import { JSHandle } from "../../../../JSHandle"
import { ArtClass } from "./ArtClass"
import { DexFile, DexFile_CodeItem } from "../DexFile"
import { GcRoot } from "../GcRoot"
import { ObjPtr } from "../ObjPtr"
import { ArtInstruction } from "../Instruction"
import { ArtModifiers } from "../../../../../tools/modifiers"
import { DexCache } from "./DexCache"

export class ArtMethod extends JSHandle implements IArtMethod, SizeOfClass {

    // GcRoot<mirror::Class> declaring_class_; 
    declaring_class_: NativePointer = this.CurrentHandle // 0x4
    // std::atomic<std::uint32_t> access_flags_;
    access_flags_: NativePointer = this.CurrentHandle.add(GcRoot.Size)   // 0x4
    // uint32_t dex_code_item_offset_;
    dex_code_item_offset_: NativePointer = this.CurrentHandle.add(GcRoot.Size + 0x4) // 0x4
    // uint32_t dex_method_index_;
    dex_method_index_: NativePointer = this.CurrentHandle.add(GcRoot.Size + 0x4 * 2) // 0x4
    // uint16_t method_index_;
    method_index_: NativePointer = this.CurrentHandle.add(GcRoot.Size + 0x4 * 3) // 0x2

    //   union {
    //     // Non-abstract methods: The hotness we measure for this method. Not atomic,
    //     // as we allow missing increments: if the method is hot, we will see it eventually.
    //     uint16_t hotness_count_;
    //     // Abstract methods: IMT index (bitwise negated) or zero if it was not cached.
    //     // The negation is needed to distinguish zero index and missing cached entry.
    //     uint16_t imt_index_;
    //   };
    hotness_count_: NativePointer = this.CurrentHandle.add(GcRoot.Size + 0x4 * 3 + 0x2 * 1)
    imt_index_: NativePointer = this.CurrentHandle.add(GcRoot.Size + 0x4 * 3 + 0x2 * 1)

    // Must be the last fields in the method.
    //   struct PtrSizedFields {
    //     // Depending on the method type, the data is
    //     //   - native method: pointer to the JNI function registered to this method
    //     //                    or a function to resolve the JNI function,
    //     //   - conflict method: ImtConflictTable,
    //     //   - abstract/interface method: the single-implementation if any,
    //     //   - proxy method: the original interface method or constructor,
    //     //   - other methods: the profiling data.
    //     void* data_;

    //     // Method dispatch from quick compiled code invokes this pointer which may cause bridging into
    //     // the interpreter.
    //     void* entry_point_from_quick_compiled_code_;
    //   } ptr_sized_fields_;

    ptr_sized_fields_: {
        data_: NativePointer
        entry_point_from_quick_compiled_code_: NativePointer
    }

    constructor(handle: NativePointer) {
        super(handle)
        this.ptr_sized_fields_ = {
            data_: this.handle.add(getArtMethodSpec().offset.jniCode),
            entry_point_from_quick_compiled_code_: this.handle.add(getArtMethodSpec().offset.quickCode)
        }
    }

    get SizeOfClass(): number {
        return getArtMethodSpec().size + super.SizeOfClass
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    // GcRoot<mirror::Class> declaring_class_;
    get declaring_class(): GcRoot<ArtClass> {
        return new GcRoot((handle) => new ArtClass(handle), this.declaring_class_)
    }

    // std::atomic<std::uint32_t> access_flags_;
    get access_flags(): NativePointer {
        return ptr(this.access_flags_.readU32())
    }

    get access_flags_string(): string {
        return ArtModifiers.PrettyAccessFlags(this.access_flags)
    }

    // uint32_t dex_code_item_offset_;
    get dex_code_item_offset(): number {
        return this.dex_code_item_offset_.readU32()
    }

    // uint16_t method_index_;
    get dex_method_index(): number {
        return this.dex_method_index_.readU32()
    }

    // uint16_t method_index_;
    get method_index(): number {
        return this.method_index_.readU16()
    }

    // union {
    //     // Non-abstract methods: The hotness we measure for this method. Not atomic,
    //     // as we allow missing increments: if the method is hot, we will see it eventually.
    //     uint16_t hotness_count_;
    //     // Abstract methods: IMT index (bitwise negated) or zero if it was not cached.
    //     // The negation is needed to distinguish zero index and missing cached entry.
    //     uint16_t imt_index_;
    //   };
    get hotness_count(): number {
        return this.hotness_count_.readU16()
    }

    get imt_index(): number {
        return this.imt_index_.readU16()
    }

    // Must be the last fields in the method.
    //   struct PtrSizedFields {
    //     // Depending on the method type, the data is
    //     //   - native method: pointer to the JNI function registered to this method
    //     //                    or a function to resolve the JNI function,
    //     //   - conflict method: ImtConflictTable,
    //     //   - abstract/interface method: the single-implementation if any,
    //     //   - proxy method: the original interface method or constructor,
    //     //   - other methods: the profiling data.
    //     void* data_;

    //     // Method dispatch from quick compiled code invokes this pointer which may cause bridging into
    //     // the interpreter.
    //     void* entry_point_from_quick_compiled_code_;
    //   } ptr_sized_fields_;

    get data(): NativePointer {
        return this.ptr_sized_fields_.data_.readPointer()
    }

    get jniCode(): NativePointer {
        return this.data
    }

    get entry_point_from_quick_compiled_code(): NativePointer {
        return this.ptr_sized_fields_.entry_point_from_quick_compiled_code_.readPointer()
    }

    // _ZN3art9ArtMethod12PrettyMethodEb => art::ArtMethod::PrettyMethod(bool)
    // _ZN3art9ArtMethod12PrettyMethodEPS0_b => art::ArtMethod::PrettyMethod(art::ArtMethod*, bool)
    // _ZNK3art7DexFile12PrettyMethodEjb => art::DexFile::PrettyMethod(unsigned int, bool) const
    prettyMethod(withSignature = true): string {
        const result = new StdString();
        (Java as any).api['art::ArtMethod::PrettyMethod'](result, this.handle, withSignature ? 1 : 0)
        return result.toString()
    }

    toString(): string {
        const PrettyJavaAccessFlagsStr: string = PrettyAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()))
        return `${this.handle} -> ${PrettyJavaAccessFlagsStr}${this.prettyMethod()}`
    }

    getInfo(): string {
        const quickCode: NativePointer = this.entry_point_from_quick_compiled_code
        const jniCode: NativePointer = this.data
        const debugInfo_jniCode = DebugSymbol.fromAddress(jniCode)
        let jniCodeStr: string = jniCode.isNull() ? "null" : `${jniCode} -> ${debugInfo_jniCode.name} @ ${debugInfo_jniCode.moduleName}`
        // const interpreterCode = this.handle.add(getArtMethodSpec().offset.interpreterCode).readPointer()
        const debugInfo_quickCode = DebugSymbol.fromAddress(quickCode)
        return `quickCode: ${quickCode} -> ${debugInfo_quickCode.name} @ ${debugInfo_quickCode.moduleName} | jniCode: ${jniCodeStr} | accessFlags: ${this.access_flags} | size: ${ptr(this.SizeOfClass)}\n`
        // return `${this.prettyMethod()} quickCode: ${quickCode} jniCode: ${jniCodeStr} interpreterCode: ${interpreterCode}\n`
    }

    //   ALWAYS_INLINE CodeItemInstructionAccessor DexInstructions()
    DexInstructions(): CodeItemInstructionAccessor {
        return CodeItemInstructionAccessor.fromArtMethod(this)
    }

    // // jetbrains://clion/navigate/reference?project=libart&path=~/bin/aosp/art/libdexfile/dex/modifiers.h
    // // std::string PrettyJavaAccessFlags(uint32_t access_flags)
    // // __int64 __usercall art::PrettyJavaAccessFlags@<X0>(__int64 this@<X0>, _QWORD *a2@<X8>)
    // PrettyJavaAccessFlags(): string {
    //     const result = new StdString()
    //     const PrettyJavaAccessFlags = Module.findExportByName("libdexfile.so", "_ZN3art21PrettyJavaAccessFlagsEj")
    //     const PrettyJavaAccessFlagsFunc = new NativeFunction(PrettyJavaAccessFlags, 'pointer', ['uint32', 'pointer'])
    //     PrettyJavaAccessFlagsFunc(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32(), result.handle)
    //     return result.disposeToString()
    // }

    // ObjPtr<mirror::DexCache> ArtMethod::GetObsoleteDexCache()
    // _ZN3art9ArtMethod19GetObsoleteDexCacheEv
    // __int64 __fastcall art::ArtMethod::GetObsoleteDexCache(art::ArtMethod *this, art::mirror::Object *a2)
    private GetObsoleteDexCache(): NativePointer {
        const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv")
        const GetObsoleteDexCacheFunc = new NativeFunction(GetObsoleteDexCacheAddr, 'pointer', ['pointer'])
        const ret: NativePointer = GetObsoleteDexCacheFunc(this.handle) as NativePointer
        if (ret.isNull()) return null
        return new ObjPtr(ret).handle
    }

    GetCodeItem(): NativePointer {
        const dexCodeItemOffset = this.dex_code_item_offset
        const dexFile = this.GetDexFile()
        return dexFile.data_begin.add(dexCodeItemOffset)
    }

    // inline ObjPtr<mirror::DexCache> ArtMethod::GetDexCache()
    // bool IsObsolete() => return (GetAccessFlags() & kAccObsoleteMethod) != 0;
    private static checkDexFile_onceFlag: boolean = true
    GetDexFile(): DexFile {
        let access_flags = this.handle.add(0x4).readU32()
        // IsObsolete() => (GetAccessFlags() & kAccObsoleteMethod) != 0
        if ((access_flags & ArtModifiers.kAccObsoleteMethod) != 0) {
            // LOGD(`flag => ${access_flags}`)
            return new DexCache(this.GetObsoleteDexCache()).dex_file
        } else {
            return this.declaring_class.root.dex_cache.root.dex_file
        }

        function checkDexFile() {

            if (!ArtMethod.checkDexFile_onceFlag) return
            ArtMethod.checkDexFile_onceFlag = false

            const artBase: NativePointer = Module.findBaseAddress("libart.so")!

            const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv")!
            Interceptor.attach(GetObsoleteDexCacheAddr, {
                onEnter(args) {
                    LOGW(`onEnter GetObsoleteDexCacheAddr -> ${args[0]} -> ${args[0].readPointer()}`)
                }, onLeave(retval) {
                    LOGW(`onLeave GetObsoleteDexCacheAddr -> ${retval} -> ${retval.readPointer()}`)
                }
            })

            const branchAddr = artBase.add(0x16C194)
            Interceptor.attach(branchAddr, {
                onEnter(this: InvocationContext, args: InvocationArguments) {
                    const ctx = this.context as Arm64CpuContext
                    const x0 = ctx.x0
                    LOGW(`onEnter branchAddr -> PID:${Process.getCurrentThreadId()}-> ${x0} -> ${ptr(x0.readU32())}`)
                }
            })
        }
    }

    // bool ArtMethod::HasSameNameAndSignature(ArtMethod* other) 
    // _ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_
    HasSameNameAndSignature(other: ArtMethod): Boolean {
        const HasSameNameAndSignature = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_")
        const HasSameNameAndSignatureFunc = new NativeFunction(HasSameNameAndSignature, 'bool', ['pointer', 'pointer'])
        const ret: NativeReturnValue = HasSameNameAndSignatureFunc(this.handle, other.handle)
        return ret as boolean
    }

    // Used by GetName and GetNameView to share common code.
    // const char* GetRuntimeMethodName()
    // _ZN3art9ArtMethod20GetRuntimeMethodNameEv
    GetRuntimeMethodName(): string {
        const GetRuntimeMethodName = Module.findExportByName("libart.so", "_ZN3art9ArtMethod20GetRuntimeMethodNameEv")
        const GetRuntimeMethodNameFunc = new NativeFunction(GetRuntimeMethodName, 'pointer', ['pointer'])
        const ret: NativeReturnValue = GetRuntimeMethodNameFunc(this.handle)
        return (ret as NativePointer).readCString()
    }

    // void ArtMethod::SetNotIntrinsic()
    // _ZN3art9ArtMethod15SetNotIntrinsicEv
    SetNotIntrinsic() {
        const SetNotIntrinsic = Module.findExportByName("libart.so", "_ZN3art9ArtMethod15SetNotIntrinsicEv")
        const SetNotIntrinsicFunc = new NativeFunction(SetNotIntrinsic, 'void', ['pointer'])
        SetNotIntrinsicFunc(this.handle)
    }

    // void ArtMethod::CopyFrom(ArtMethod* src, PointerSize image_pointer_size)
    // _ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE
    CopyFrom(src: ArtMethod) {
        const CopyFrom = Module.findExportByName("libart.so", "_ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE")
        const CopyFromFunc = new NativeFunction(CopyFrom, 'void', ['pointer', 'pointer', 'int'])
        CopyFromFunc(this.handle, src.handle, Process.pointerSize)
    }

    // const OatQuickMethodHeader* GetOatQuickMethodHeader(uintptr_t pc)
    // _ZN3art9ArtMethod23GetOatQuickMethodHeaderEm
    GetOatQuickMethodHeader(pc: number = 0): OatQuickMethodHeader {
        const func_addr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm")
        const func = new NativeFunction(func_addr, 'pointer', ['pointer', 'uint64'])
        const ret = func(this.handle, pc) as NativePointer
        if (ret.isNull()) return null
        return new OatQuickMethodHeader(ret)
    }

    // uint16_t FindObsoleteDexClassDefIndex()
    // _ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv
    FindObsoleteDexClassDefIndex() {
        const FindObsoleteDexClassDefIndex = Module.findExportByName("libart.so", "_ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv")
        const FindObsoleteDexClassDefIndexFunc = new NativeFunction(FindObsoleteDexClassDefIndex, 'uint64', ['pointer'])
        return FindObsoleteDexClassDefIndexFunc(this.handle)
    }

    // ArtMethod* GetSingleImplementation(PointerSize pointer_size);
    // _ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE
    // check impl if this methid is IsAbstract
    GetSingleImplementation() {
        const GetSingleImplementation = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE")
        const GetSingleImplementationFunc = new NativeFunction(GetSingleImplementation, 'pointer', ['pointer', 'int'])
        return GetSingleImplementationFunc(this.handle, Process.pointerSize)
    }

    // ArtMethod* FindOverriddenMethod(PointerSize pointer_size)
    // _ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE
    FindOverriddenMethod() {
        const FindOverriddenMethod = Module.findExportByName("libart.so", "_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE")
        const FindOverriddenMethodFunc = new NativeFunction(FindOverriddenMethod, 'pointer', ['pointer', 'int'])
        return FindOverriddenMethodFunc(this.handle, Process.pointerSize)
    }

    // Returns true if this method could be overridden by a default method.
    // bool IsOverridableByDefaultMethod() 
    // _ZN3art9ArtMethod28IsOverridableByDefaultMethodEv
    IsOverridableByDefaultMethod() {
        const IsOverridableByDefaultMethod = Module.findExportByName("libart.so", "_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv")
        const IsOverridableByDefaultMethodFunc = new NativeFunction(IsOverridableByDefaultMethod, 'bool', ['pointer'])
        return IsOverridableByDefaultMethodFunc(this.handle)
    }

    // uint16_t ArtMethod::GetIndexFromQuickening(uint32_t dex_pc) 
    // _ZN3art9ArtMethod16GetQuickenedInfoEv
    GetQuickenedInfo(dex_pc: number = 0) {
        const GetQuickenedInfo = Module.findExportByName("libart.so", "_ZN3art9ArtMethod16GetQuickenedInfoEv")
        if (GetQuickenedInfo == null) return null
        const GetQuickenedInfoFunc = new NativeFunction(GetQuickenedInfo, 'pointer', ['pointer', 'uint64'])
        return GetQuickenedInfoFunc(this.handle, dex_pc)
    }

    // // std::string JniShortName()
    // // _ZN3art9ArtMethod12JniShortNameEv
    // JniShortName() {
    //     const stdString = new StdString()
    //     const JniShortName = Module.findExportByName("libart.so", "_ZN3art9ArtMethod12JniShortNameEv")
    //     const JniShortNameFunc = new NativeFunction(JniShortName, 'pointer', ['pointer', 'pointer'])
    //     JniShortNameFunc(this.handle, stdString.handle)
    //     return stdString.disposeToString()
    // }

    // // std::string JniLongName()
    // // _ZN3art9ArtMethod11JniLongNameEv
    // JniLongName() {
    //     const stdString = new StdString()
    //     const JniLongName = Module.findExportByName("libart.so", "_ZN3art9ArtMethod11JniLongNameEv")
    //     const JniLongNameFunc = new NativeFunction(JniLongName, 'pointer', ['pointer', 'pointer'])
    //     JniLongNameFunc(this.handle, stdString.handle)
    //     return stdString.disposeToString()
    // }

    // const void* RegisterNative(const void* native_method)
    // _ZN3art9ArtMethod14RegisterNativeEPKv
    RegisterNative(native_method: NativePointerValue) {
        const RegisterNativeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod14RegisterNativeEPKv")
        const RegisterNativeFunc = new NativeFunction(RegisterNativeAddr, 'pointer', ['pointer', 'pointer'])
        LOGD(`RegisterNative: ${this.handle} -> ${native_method}`)
        return RegisterNativeFunc(this.handle, native_method)
    }

    // pack RegisterNative using NativeCallback (default 4 args)
    RegisterNativeJS(native_method: (args: any[]) => {}) {
        return this.RegisterNative(new NativeCallback(native_method, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']))
    }

    //  void UnregisterNative()
    // _ZN3art9ArtMethod16UnregisterNativeEv
    UnregisterNative() {
        const UnregisterNativeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod16UnregisterNativeEv")
        const UnregisterNativeFunc = new NativeFunction(UnregisterNativeAddr, 'void', ['pointer'])
        return UnregisterNativeFunc(this.handle)
    }

    // Number of 32bit registers that would be required to hold all the arguments
    // static size_t NumArgRegisters(const char* shorty);
    // _ZN3art9ArtMethod15NumArgRegistersEPKc
    static NumArgRegisters(shorty: string) {
        const NumArgRegistersAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod15NumArgRegistersEPKc")
        const NumArgRegistersFunc = new NativeFunction(NumArgRegistersAddr, 'size_t', ['pointer', 'pointer'])
        return NumArgRegistersFunc(Memory.allocUtf8String(shorty)) as number
    }

    // InvokeType ArtMethod::GetInvokeType()
    // _ZN3art9ArtMethod13GetInvokeTypeEv
    GetInvokeType(): string {
        const GetInvokeTypeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod13GetInvokeTypeEv")
        const GetInvokeTypeFunc = new NativeFunction(GetInvokeTypeAddr, 'int', ['pointer'])
        return InvokeType.toString(GetInvokeTypeFunc(this.handle) as number)
    }

    test() {
        LOGD(`GetInvokeType -> ${this.GetInvokeType()}`)
        LOGD(`GetRuntimeMethodName -> ${this.GetRuntimeMethodName()}`)
        LOGD(`dex_code_item_offset_ -> ${this.dex_code_item_offset} -> ${ptr(this.dex_code_item_offset)}`)
        LOGD(`dex_method_index -> ${ptr(this.dex_method_index)}`)
        LOGD(`GetRuntimeMethodName -> ${this.GetRuntimeMethodName()}`)
        // LOGD(`HasSameNameAndSignature -> ${this.HasSameNameAndSignature(art_1)}`)
        LOGD(`access_flags_string -> ${this.access_flags_string}`)
        LOGD(`GetQuickenedInfo -> ${this.GetQuickenedInfo()}`)
        LOGD(`entry_point_from_quick_compiled_code -> ${this.entry_point_from_quick_compiled_code}`)
    }

    show = (num: number) => this.showSmali(num)

    showSmali(num: number = -1, info: boolean = false, loopMax: number = 100): void {
        const accessor: CodeItemInstructionAccessor = this.DexInstructions()
        const dex_file: DexFile = this.GetDexFile()
        let insns: ArtInstruction = accessor.InstructionAt()
        if (!this.jniCode.isNull()) {
            LOGD(`↓ArtMethod↓\n${this}`)
            return LOGE(`jniCode is not null -> ${this.jniCode}`)
        }
        newLine()
        if (num != -1) LOGD(`↓accessor↓\n${accessor}\n`)
        if (info) {
            LOGD(`↓ArtMethod↓\n${this}\n`)
            LOGD(`↓dex_file↓\n${dex_file}\n`)
            if (num == -1) LOGD(`↓accessor↓\n${accessor}\n`)
            newLine()
        }
        let offset: number = 0
        let insns_num: number = 0
        let count_num: number = num
        const count_insns: number = accessor.insns_size_in_code_units * 2
        while (true) {
            const offStr: string = `[${(++insns_num).toString().padStart(3, ' ')}|${ptr(offset).toString().padEnd(5, ' ')}]`
            LOGD(`${offStr} ${insns.handle} - ${insns.dumpHexLE()} | ${insns.dumpString(dex_file)}`)
            offset += insns.SizeInCodeUnits
            if (count_num != -1) {
                if (--count_num <= 0) break
            } else {
                if (offset >= count_insns) break
            }
            insns = insns.Next()
        }
        newLine()
    }

}

Reflect.set(globalThis, 'ArtMethod', ArtMethod)