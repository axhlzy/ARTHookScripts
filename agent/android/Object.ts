import { HeapReference } from "./Interface/art/mirror/HeapReference"
import { ArtThread } from "./implements/10/art/Thread"
import { StdString } from "../tools/StdString"
import { callSym } from "./Utils/SymHelper"
import { JSHandle } from "./JSHandle"

class ArtField extends JSHandle { }

export class ArtObject extends JSHandle implements SizeOfClass {

    // // The Class representing the type of the object.
    // HeapReference<Class> klass_;
    protected klass_: NativePointer = this.handle // 0x4
    // // Monitor and hash code information.
    // uint32_t monitor_;
    protected monitor_: NativePointer = this.klass_.add(0x4) // 0x4

    constructor(handle: NativePointer) {
        super(handle)
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + 0x4 * 2
    }

    get klass(): HeapReference<typeof ArtClass> {
        return new HeapReference((handle) => new ArtClass(handle), ptr(this.klass_.readU32()))
    }

    get monitor(): number {
        return this.monitor_.readU32()
    }

    // caseTo<T extends ArtObject>(T: any): T {
    //     return new T(this.handle)
    // }

    simpleDisp(): string {
        if (this.handle.isNull()) return `ArtObject<${this.handle}>`
        const prettyTypeOf: string = this.PrettyTypeOf()
        let disp: string = `ArtObject<${this.handle}> <- ${prettyTypeOf}`
        // if (prettyTypeOf == "java.lang.String") disp += ` <- ${JavaString.caseToJavaString(this).value}`
        return disp
    }

    toString(): string {
        let disp: string = `ArtObject< ${this.handle} >`
        if (this.handle.isNull()) return disp
        // disp += `\n${this.klass.toString()}`
        return disp
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


    // static std::string PrettyTypeOf(ObjPtr<mirror::Object> obj)
    // _ZN3art6mirror6Object12PrettyTypeOfENS_6ObjPtrIS1_EE
    public static PrettyTypeOf(obj: ArtObject): string {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZN3art6mirror6Object12PrettyTypeOfENS_6ObjPtrIS1_EE", "libart.so"
            , ["pointer", "pointer", "pointer"]
            , ["pointer"]
            , obj.handle)).toString()
    }

    // std::string PrettyTypeOf()
    // art::mirror::Object::PrettyTypeOf()
    public PrettyTypeOf(): string {
        try {
            return StdString.fromPointers(callSym<NativePointer[]>(
                "_ZN3art6mirror6Object12PrettyTypeOfEv", "libart.so"
                , ["pointer", "pointer", "pointer"]
                , ["pointer"]
                , this.handle)).toString()
        } catch (error) {
            return 'ERROR -> PrettyTypeOf'
        }
    }

    // // A utility function that copies an object in a read barrier and write barrier-aware way.
    // // This is internally used by Clone() and Class::CopyOf(). If the object is finalizable,
    // // it is the callers job to call Heap::AddFinalizerReference.
    // static ObjPtr<Object> CopyObject(ObjPtr<mirror::Object> dest,
    //     ObjPtr<mirror::Object> src,
    //     size_t num_bytes)
    // REQUIRES_SHARED(Locks::mutator_lock_);
    // _ZN3art6mirror6Object10CopyObjectENS_6ObjPtrIS1_EES3_m
    public static CopyObject(dest: ArtObject, src: ArtObject, num_bytes: number): ArtObject {
        return new ArtObject(callSym<NativePointer>(
            "_ZN3art6mirror6Object10CopyObjectENS_6ObjPtrIS1_EES3_m", "libart.so"
            , ["pointer"]
            , ["pointer", "pointer", "int"]
            , dest.handle, src.handle, num_bytes))
    }

    // ObjPtr<Object> Clone(Thread* self) REQUIRES_SHARED(Locks::mutator_lock_)
    // _ZN3art6mirror6Object5CloneEPNS_6ThreadE
    public Clone(self: ArtThread): ArtObject {
        return new ArtObject(callSym<NativePointer>(
            "_ZN3art6mirror6Object5CloneEPNS_6ThreadE", "libart.so"
            , ["pointer"]
            , ["pointer", "pointer"]
            , this.handle, self.handle))
    }

    // ArtField* FindFieldByOffset(MemberOffset offset) REQUIRES_SHARED(Locks::mutator_lock_);
    // _ZN3art6mirror6Object17FindFieldByOffsetENS_12MemberOffsetE
    public FindFieldByOffset(offset: number): ArtField {
        return new ArtField(callSym<NativePointer>(
            "_ZN3art6mirror6Object17FindFieldByOffsetENS_12MemberOffsetE", "libart.so"
            , ["pointer"]
            , ["pointer", "int"]
            , this.handle, offset))
    }

    // static uint32_t GenerateIdentityHashCode();
    // _ZN3art6mirror6Object24GenerateIdentityHashCodeEv
    public static GenerateIdentityHashCode(): number {
        return callSym<number>(
            "_ZN3art6mirror6Object24GenerateIdentityHashCodeEv", "libart.so"
            , ["int"]
            , [])
    }

}

globalThis.ArtObject = ArtObject