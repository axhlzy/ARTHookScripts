
import { IArtMethod } from "../../../../Interface/art/mirror/IArtMethod"
import { OatQuickMethodHeader } from "../runtime/OatQuickMethodHeader"
import { ArtModifiers } from "../../../../../tools/modifiers"
import { StdString } from "../../../../../tools/StdString"
import { InvokeType } from "../../../../../tools/enum"
import { ArtInstruction } from "../Instruction"
import { JSHandle } from "../../../../JSHandle"
import { PointerSize } from "../Globals"
import { ArtClass } from "./ArtClass"
import { DexCache } from "./DexCache"
import { GcRoot } from "../GcRoot"
import { CodeItemInstructionAccessor } from "../dexfile/CodeItemInstructionAccessor"
import { DexFile } from "../dexfile/DexFile"

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
        return result.disposeToString()
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
    PrettyJavaAccessFlags(): string {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZN3art21PrettyJavaAccessFlagsEj", "libdexfile.so",
            ['pointer', 'pointer', 'pointer'], ['pointer', 'uint32'],
            this, this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()))
    }

    // ObjPtr<mirror::DexCache> ArtMethod::GetObsoleteDexCache()
    // _ZN3art9ArtMethod19GetObsoleteDexCacheEv
    // __int64 __fastcall art::ArtMethod::GetObsoleteDexCache(art::ArtMethod *this, art::mirror::Object *a2)
    GetObsoleteDexCache(): DexCache {
        return new DexCache(callSym<NativePointer>(
            "_ZN3art9ArtMethod19GetObsoleteDexCacheEv", "libart.so",
            'pointer', ['pointer'],
            this.handle))
    }

    GetCodeItem(): NativePointer {
        const dexCodeItemOffset = this.dex_code_item_offset
        if (dexCodeItemOffset == 0) return ptr(0)
        const dexFile = this.GetDexFile()
        return dexFile.data_begin.add(dexCodeItemOffset)
    }

    GetDexCache(): DexCache {
        let access_flags = this.handle.add(0x4).readU32()
        // IsObsolete() => (GetAccessFlags() & kAccObsoleteMethod) != 0
        if ((access_flags & ArtModifiers.kAccObsoleteMethod) != 0) {
            // LOGD(`flag => ${access_flags}`)
            return this.GetObsoleteDexCache()
        } else {
            return new DexCache(this.declaring_class.root.dex_cache.root.handle)
        }
    }

    // inline ObjPtr<mirror::DexCache> ArtMethod::GetDexCache()
    // bool IsObsolete() => return (GetAccessFlags() & kAccObsoleteMethod) != 0;
    private static checkDexFile_onceFlag: boolean = true
    GetDexFile(): DexFile {
        return this.GetDexCache().dex_file

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
        return callSym<boolean>(
            "_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_", "libart.so",
            'bool', ['pointer', 'pointer'],
            this.handle, other.handle)
    }

    // Used by GetName and GetNameView to share common code.
    // const char* GetRuntimeMethodName()
    // _ZN3art9ArtMethod20GetRuntimeMethodNameEv
    GetRuntimeMethodName(): string {
        return callSym<string>(
            "_ZN3art9ArtMethod20GetRuntimeMethodNameEv", "libart.so",
            'pointer', ['pointer'],
            this.handle)
    }

    // void ArtMethod::SetNotIntrinsic()
    // _ZN3art9ArtMethod15SetNotIntrinsicEv
    SetNotIntrinsic() {
        return callSym<void>(
            "_ZN3art9ArtMethod15SetNotIntrinsicEv", "libart.so",
            'void', ['pointer'],
            this.handle)
    }

    // void ArtMethod::CopyFrom(ArtMethod* src, PointerSize image_pointer_size)
    // _ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE
    CopyFrom(src: ArtMethod) {
        return callSym<void>(
            "_ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE", "libart.so",
            'void', ['pointer', 'pointer', 'int'],
            this.handle, src.handle, PointerSize)
    }

    // const OatQuickMethodHeader* GetOatQuickMethodHeader(uintptr_t pc)
    // _ZN3art9ArtMethod23GetOatQuickMethodHeaderEm
    GetOatQuickMethodHeader(pc: number = 0): OatQuickMethodHeader {
        return new OatQuickMethodHeader(callSym<NativePointer>(
            "_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm", "libart.so",
            'pointer', ['pointer', 'pointer'],
            this.handle, pc))
    }

    // uint16_t FindObsoleteDexClassDefIndex()
    // _ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv
    FindObsoleteDexClassDefIndex() {
        return callSym<number>(
            "_ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv", "libart.so",
            'int', ['pointer'],
            this.handle)
    }

    // ArtMethod* GetSingleImplementation(PointerSize pointer_size);
    // _ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE
    // check impl if this methid is IsAbstract
    GetSingleImplementation() {
        return callSym<NativePointer>(
            "_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE", "libart.so",
            'pointer', ['pointer', 'int'],
            this.handle, Process.pointerSize)
    }

    // ArtMethod* FindOverriddenMethod(PointerSize pointer_size)
    // _ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE
    FindOverriddenMethod() {
        return callSym<NativePointer>(
            "_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE", "libart.so",
            'pointer', ['pointer', 'int'],
            this.handle, Process.pointerSize)
    }

    // Returns true if this method could be overridden by a default method.
    // bool IsOverridableByDefaultMethod() 
    // _ZN3art9ArtMethod28IsOverridableByDefaultMethodEv
    IsOverridableByDefaultMethod() {
        return callSym<boolean>(
            "_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv", "libart.so",
            'bool', ['pointer'],
            this.handle)
    }

    // uint16_t ArtMethod::GetIndexFromQuickening(uint32_t dex_pc) 
    // _ZN3art9ArtMethod16GetQuickenedInfoEv
    GetQuickenedInfo(dex_pc: number = 0) {
        return callSym<number>("_ZN3art9ArtMethod16GetQuickenedInfoEv", "libart.so",
            'int', ['pointer', 'int'],
            this, dex_pc)
    }

    // std::string JniShortName()
    // _ZN3art9ArtMethod12JniShortNameEv
    JniShortName() {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZN3art9ArtMethod12JniShortNameEv", "libart.so",
            ['pointer', 'pointer', 'pointer'], ['pointer'],
            this.handle))
    }

    // std::string JniLongName()
    // _ZN3art9ArtMethod11JniLongNameEv
    JniLongName() {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZN3art9ArtMethod11JniLongNameEv", "libart.so",
            ['pointer', 'pointer', 'pointer'], ['pointer'],
            this.handle))
    }

    // const void* RegisterNative(const void* native_method)
    // _ZN3art9ArtMethod14RegisterNativeEPKv
    RegisterNative(native_method: NativePointerValue) {
        return callSym<NativePointer>("_ZN3art9ArtMethod14RegisterNativeEPKv", "libart.so",
            'pointer', ['pointer', 'pointer'],
            this.handle, native_method)
    }

    // pack RegisterNative using NativeCallback (default 4 args)
    RegisterNativeJS(native_method: (args: any[]) => {}) {
        return this.RegisterNative(new NativeCallback(native_method, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']))
    }

    //  void UnregisterNative()
    // _ZN3art9ArtMethod16UnregisterNativeEv
    UnregisterNative(): void {
        return callSym<void>("_ZN3art9ArtMethod16UnregisterNativeEv", "libart.so", 'void', ['pointer'], this.handle)
    }

    // Number of 32bit registers that would be required to hold all the arguments
    // static size_t NumArgRegisters(const char* shorty);
    // _ZN3art9ArtMethod15NumArgRegistersEPKc
    static NumArgRegisters(shorty: string) {
        return callSym<number>(
            "_ZN3art9ArtMethod15NumArgRegistersEPKc", "libart.so",
            'int', ['pointer'],
            Memory.allocUtf8String(shorty))
    }

    // InvokeType ArtMethod::GetInvokeType()
    // _ZN3art9ArtMethod13GetInvokeTypeEv
    GetInvokeType(): string {
        return InvokeType.toString(callSym<number>(
            "_ZN3art9ArtMethod13GetInvokeTypeEv", "libart.so",
            'int', ['pointer'], this.handle))
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

    show = (num?: number) => {
        const debugInfo: DebugSymbol = DebugSymbol.fromAddress(this.entry_point_from_quick_compiled_code)
        debugInfo.moduleName == "base.odex" ? this.showOatAsm(num) : this.showSmali(num)
    }

    showSmali(num: number = -1, info: boolean = false): void {
        const accessor: CodeItemInstructionAccessor = this.DexInstructions()
        const dex_file: DexFile = this.GetDexFile()
        let insns: ArtInstruction = accessor.InstructionAt()
        if (!this.jniCode.isNull()) {
            LOGD(`👉 ${this}`)
            LOGE(`jniCode is not null -> ${this.jniCode}`)
            return
        }
        LOGD(`↓dex_file↓\n${dex_file}\n`)
        LOGD(`👉 ${this}\n${this.getInfo()}`)
        if (info) LOGD(`↓accessor↓\n${accessor}\n`)
        let offset: number = 0
        let insns_num: number = 0
        let count_num: number = num
        const count_insns: number = accessor.insns_size_in_code_units * 2
        while (true) {
            const offStr: string = `[${(++insns_num).toString().padStart(3, ' ')}|${ptr(offset).toString().padEnd(5, ' ')}]`
            LOGD(`${offStr} ${insns.handle} - ${insns.dumpHexLE()} | ${insns.dumpString(dex_file)}`)
            offset += insns.SizeInCodeUnits
            if (count_num != -1) {
                if (--count_num <= 0 || ptr(offset).isNull()) break
            } else {
                if (offset >= count_insns) break
            }
            insns = insns.Next()
        }
        newLine()
    }

    showOatAsm(num: number = 20) {
        let insns: Instruction = Instruction.parse(this.entry_point_from_quick_compiled_code)
        newLine()
        LOGD(`👉 ${this}\n${this.getInfo()}`)
        LOGD(`↓insns↓\n`)

        let num_local: number = 0
        let code_offset: number = 0
        while (++num_local < num) {
            let indexStr: string = `[${num_local.toString().padStart(4, ' ')}|${ptr(code_offset).toString().padEnd(5, ' ')}]`
            LOGD(`${indexStr} ${insns.address}\t${insns.toString()}`)
            code_offset += insns.size
            insns = Instruction.parse(insns.next)
            // todo 这里的num后续可以省略，使用栈寄存器判断平栈的位置作为函数结束的位置
            // 还需要去了解一下oat文件格式，配合一些其他的信息来添加上更多的一些符号信息以便于提高可读性
            // 解析出更多信息后是不是可以考虑在进入这个函数的时候判断当前函数是否已经被oat然后决定实现javahook的方式直接去hook已经编译好的oat文件
        }
        newLine()
    }

}

Reflect.set(globalThis, 'ArtMethod', ArtMethod)