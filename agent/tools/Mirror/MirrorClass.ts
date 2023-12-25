import { BaseClass } from "../BaseClass"
import { StdString } from "../StdString"
import { ClassExt } from "./ClassExt"
import { ClassLoader } from "./ClassLoader"
import { DexCache } from "./DexCache"
import { HeapReference } from "./HeapReference"
import { IfTable } from "./IfTable"

export class MirrorClass extends BaseClass {

    private static HeapReferenceSize: number = Process.pointerSize

    toString(): String {
        return `MirrorClass<${this.handle}>`
    }

    // HeapReference<ClassLoader> class_loader_;
    get class_loader(): HeapReference<ClassLoader> {
        return new HeapReference((handle) => new ClassLoader(handle), this.handle.add(MirrorClass.HeapReferenceSize * 0))
    }

    // HeapReference<Class> component_type_;
    get component_type(): HeapReference<MirrorClass> {
        return new HeapReference((handle) => new MirrorClass(handle), this.handle.add(MirrorClass.HeapReferenceSize * 1))
    }

    // HeapReference<DexCache> dex_cache_;
    get dex_cache(): HeapReference<DexCache> {
        return new HeapReference((handle) => new DexCache(handle), this.handle.add(MirrorClass.HeapReferenceSize * 2))
    }

    // HeapReference<ClassExt> ext_data_;
    get ext_data(): HeapReference<ClassExt> {
        return new HeapReference((handle) => new ClassExt(handle), this.handle.add(MirrorClass.HeapReferenceSize * 3))
    }

    // HeapReference<IfTable> iftable_;
    get iftable(): HeapReference<IfTable> {
        return new HeapReference((handle) => new IfTable(handle), this.handle.add(MirrorClass.HeapReferenceSize * 4))
    }

    // HeapReference<String> name_;
    get name(): HeapReference<StdString> {
        return new HeapReference((handle) => new StdString(handle), this.handle.add(MirrorClass.HeapReferenceSize * 5))
    }

    // HeapReference<Class> super_class_;
    get super_class(): HeapReference<MirrorClass> {
        return new HeapReference((handle) => new MirrorClass(handle), this.handle.add(MirrorClass.HeapReferenceSize * 6))
    }

    // HeapReference<PointerArray> vtable_;
    get vtable(): HeapReference<NativePointer> {
        return new HeapReference((handle) => new NativePointer(handle), this.handle.add(MirrorClass.HeapReferenceSize * 7))
    }

    // ArtFields are allocated as a length prefixed ArtField array, and not an array of pointers to ArtFields.
    // uint64_t ifields_; => instance fields
    get ifields(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8).readU64().toNumber()
    }

    // uint64_t methods_;
    get methods(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8 + 64).readU64().toNumber()
    }

    // uint64_t sfields_;
    get sfields(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8 + 64 * 2).readU64().toNumber()
    }

    // uint32_t access_flags_;
    get access_flags(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8 + 64 * 3).readU32()
    }

    get access_flags_string(): string {
        return PrettyAccessFlags(this.access_flags)
    }

    // uint32_t class_flags_;
    get class_flags(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8 + 64 * 3 + 32).readU32()
    }

    // uint32_t class_size_;
    get class_size(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8 + 64 * 3 + 32 * 2).readU32()
    }

    // pid_t clinit_thread_id_;
    get clinit_thread_id(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8 + 64 * 3 + 32 * 3).readS32()
    }

    // int32_t dex_class_def_idx_;
    get dex_class_def_idx(): number {
        return this.handle.add(MirrorClass.HeapReferenceSize * 8 + 64 * 3 + 32 * 4).readS32()
    }

    // todo ...

}