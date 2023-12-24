import { OatQuickMethodHeader } from "./OatQuickMethodHeader"
import { ObjPtr } from "./ObjPtr"
import { StdString } from "./StdString"
import { InvokeType } from "./enum"

// export var quickCodeOffset: number = null
// export var jniCodeOffset: number = null
// export var interpreterCode: number = null

// Java.perform(() => {
//     const artMethodSpec = getArtMethodSpec()
//     quickCodeOffset = artMethodSpec.offset.quickCode
//     jniCodeOffset = artMethodSpec.offset.jniCode
//     interpreterCode = artMethodSpec.offset.interpreterCode
// })

// declare global {
//     var quickCodeOffset: number
//     var jniCodeOffset: number
//     var interpreterCode: number
// }

// globalThis.quickCodeOffset = quickCodeOffset
// globalThis.jniCodeOffset = jniCodeOffset
// globalThis.interpreterCode = interpreterCode

export interface ArtMethodRetArray {
    handle: NativePointer
    prettyMethod: string
}

export class ArtMethod {

    handle: NativePointer

    constructor(handle: NativePointer) {
        this.handle = handle
    }

    prettyMethod(withSignature = true): string {
        const result = new StdString();
        (Java as any).api['art::ArtMethod::PrettyMethod'](result, this.handle, withSignature ? 1 : 0)
        return result.disposeToString()
    }

    toString(): string {
        const PrettyJavaAccessFlagsStr = PrettyJavaAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()))
        return `${this.handle} -> ${PrettyJavaAccessFlagsStr}${this.prettyMethod()}`
    }

    toArray(): ArtMethodRetArray {
        return {
            handle: this.handle,
            prettyMethod: this.prettyMethod()
        }
    }

    getInfo(): string {
        const accessFlags: NativePointerValue = ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32())
        const quickCode: NativePointer = this.handle.add(getArtMethodSpec().offset.quickCode).readPointer()
        const jniCode: NativePointer = this.handle.add(getArtMethodSpec().offset.jniCode).readPointer()
        const size: number = getArtMethodSpec().size
        const jniCodeMd: Module = Process.findModuleByAddress(jniCode)
        const jniCodeStr: string = jniCodeMd == null ? jniCode.toString() : `${jniCode} -> ${jniCode.sub(jniCodeMd.base)} @ ${jniCodeMd.name}`
        // const interpreterCode = this.handle.add(getArtMethodSpec().offset.interpreterCode).readPointer()
        return `quickCode: ${quickCode} | jniCode: ${jniCodeStr} | accessFlags: ${accessFlags} | size: ${size}\n`
        // return `${this.prettyMethod()} quickCode: ${quickCode} jniCode: ${jniCodeStr} interpreterCode: ${interpreterCode}\n`
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
    GetObsoleteDexCache(): ObjPtr {
        const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv")
        const GetObsoleteDexCacheFunc = new NativeFunction(GetObsoleteDexCacheAddr, 'pointer', ['pointer'])
        const ret: NativePointer = GetObsoleteDexCacheFunc(this.handle) as NativePointer
        if (ret.isNull()) return null
        return new ObjPtr(ret)
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

    // inline const DexFile* ArtMethod::GetDexFile()
    GetDexFile(): NativePointer {


        Interceptor.attach
        return NULL
    }


}