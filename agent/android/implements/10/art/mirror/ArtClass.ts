import { HeapReference } from "../../../../Interface/art/mirror/HeapReference"
import { StdString } from "../../../../../tools/StdString"
import { ArtObject } from "../../../../Object"
import { ArtClassLoader } from "./ClassLoader"
import { ClassExt } from "./ClassExt"
import { DexCache } from "./DexCache"
import { IfTable } from "./IfTable"

export class ArtClass extends ArtObject implements SizeOfClass {

    isVirtualClass: boolean = false

    // HeapReference<ClassLoader> class_loader_;
    class_loader_ = this.currentHandle
    // HeapReference<Class> component_type_;
    component_type_ = this.currentHandle.add(HeapReference.Size * 1)
    // HeapReference<DexCache> dex_cache_;
    dex_cache_ = this.currentHandle.add(HeapReference.Size * 2)
    // HeapReference<ClassExt> ext_data_;
    ext_data_ = this.currentHandle.add(HeapReference.Size * 3)
    // HeapReference<IfTable> iftable_;
    iftable_ = this.currentHandle.add(HeapReference.Size * 4)
    // HeapReference<String> name_;
    name_ = this.currentHandle.add(HeapReference.Size * 5)
    // HeapReference<Class> super_class_;
    super_class_ = this.currentHandle.add(HeapReference.Size * 6)
    // HeapReference<PointerArray> vtable_;
    vtable_ = this.currentHandle.add(HeapReference.Size * 7)
    // ArtFields are allocated as a length prefixed ArtField array, and not an array of pointers to ArtFields.
    // uint64_t ifields_; => instance fields
    ifields_ = this.currentHandle.add(HeapReference.Size * 8)
    // uint64_t methods_;
    methods_ = this.currentHandle.add(HeapReference.Size * 8 + 0x8 * 1)
    // uint64_t sfields_;
    sfields_ = this.currentHandle.add(HeapReference.Size * 8 + 0x8 * 2)
    // uint32_t access_flags_;
    access_flags_ = this.currentHandle.add(HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 1)
    // uint32_t class_flags_;
    class_flags_ = this.currentHandle.add(HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 2)
    // uint32_t class_size_;
    class_size_ = this.currentHandle.add(HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 3)
    // pid_t clinit_thread_id_;
    clinit_thread_id_ = this.currentHandle.add(HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 4)
    // int32_t dex_class_def_idx_;
    dex_class_def_idx_ = this.currentHandle.add(HeapReference.Size * 8 + 0x8 * 3 + 0x4 * 4)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + (HeapReference.Size * 8 + 64 * 3 + 32 * 5)
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    toString(): String {
        return `ArtClass< ${this.handle} >`
    }

    get class_loader(): HeapReference<ArtClassLoader> {
        return new HeapReference((handle) => new ArtClassLoader(handle), this.class_loader_)
    }

    get component_type(): HeapReference<ArtClass> {
        return new HeapReference((handle) => new ArtClass(handle), this.component_type_)
    }

    get dex_cache(): HeapReference<DexCache> {
        return new HeapReference((handle) => new DexCache(handle), this.dex_cache_)
    }

    get ext_data(): HeapReference<ClassExt> {
        return new HeapReference((handle) => new ClassExt(handle), this.ext_data_)
    }

    get iftable(): HeapReference<IfTable> {
        return new HeapReference((handle) => new IfTable(handle), this.iftable_)
    }

    get name(): HeapReference<StdString> {
        return new HeapReference((handle) => new StdString(handle), this.name_)
    }

    get super_class(): HeapReference<ArtClass> {
        return new HeapReference((handle) => new ArtClass(handle), this.super_class_)
    }

    get vtable(): HeapReference<NativePointer> {
        return new HeapReference((handle) => new NativePointer(handle), this.vtable_)
    }

    get ifields(): number {
        return this.ifields_.readU64().toNumber()
    }

    get methods(): number {
        return this.methods_.readU64().toNumber()
    }

    get sfields(): number {
        return this.sfields_.readU64().toNumber()
    }

    get access_flags(): number {
        return this.access_flags_.readU32()
    }

    get access_flags_string(): string {
        return PrettyAccessFlags(this.access_flags)
    }

    get class_flags(): number {
        return this.class_flags_.readU32()
    }

    get class_size(): number {
        return this.class_size_.readU32()
    }

    get clinit_thread_id(): number {
        return this.clinit_thread_id_.readS32()
    }

    get dex_class_def_idx(): number {
        return this.dex_class_def_idx_.readS32()
    }

    // todo ...
}

declare global {
    var ArtClass: any
}

globalThis.ArtClass = ArtClass