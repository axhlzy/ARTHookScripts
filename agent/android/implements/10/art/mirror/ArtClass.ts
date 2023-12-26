import { HeapReference } from "../../../../Interface/art/mirror/HeapReference"
import { StdString } from "../../../../../tools/StdString"
import { ArtObject } from "../../../../Object"
import { ArtClassLoader } from "./ClassLoader"
import { ClassExt } from "./ClassExt"
import { DexCache } from "./DexCache"
import { IfTable } from "./IfTable"

const HeapReferenceSize: number = PointerSize

export class ArtClass extends ArtObject {

    constructor(handle: NativePointer) {
        super(handle)
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + HeapReferenceSize * 8 + 64 * 3 + 32 * 5
    }

    toString(): String {
        return `ArtClass< ${this.handle} >`
    }

    // HeapReference<ClassLoader> class_loader_;
    get class_loader(): HeapReference<ArtClassLoader> {
        return new HeapReference((handle) => new ArtClassLoader(handle), this.handle.add(HeapReferenceSize * 0))
    }

    // HeapReference<Class> component_type_;
    get component_type(): HeapReference<ArtClass> {
        return new HeapReference((handle) => new ArtClass(handle), this.handle.add(HeapReferenceSize * 1))
    }

    // HeapReference<DexCache> dex_cache_;
    get dex_cache(): HeapReference<DexCache> {
        return new HeapReference((handle) => new DexCache(handle), this.handle.add(HeapReferenceSize * 2))
    }

    // HeapReference<ClassExt> ext_data_;
    get ext_data(): HeapReference<ClassExt> {
        return new HeapReference((handle) => new ClassExt(handle), this.handle.add(HeapReferenceSize * 3))
    }

    // HeapReference<IfTable> iftable_;
    get iftable(): HeapReference<IfTable> {
        return new HeapReference((handle) => new IfTable(handle), this.handle.add(HeapReferenceSize * 4))
    }

    // HeapReference<String> name_;
    get name(): HeapReference<StdString> {
        return new HeapReference((handle) => new StdString(handle), this.handle.add(HeapReferenceSize * 5))
    }

    // HeapReference<Class> super_class_;
    get super_class(): HeapReference<ArtClass> {
        return new HeapReference((handle) => new ArtClass(handle), this.handle.add(HeapReferenceSize * 6))
    }

    // HeapReference<PointerArray> vtable_;
    get vtable(): HeapReference<NativePointer> {
        return new HeapReference((handle) => new NativePointer(handle), this.handle.add(HeapReferenceSize * 7))
    }

    // ArtFields are allocated as a length prefixed ArtField array, and not an array of pointers to ArtFields.
    // uint64_t ifields_; => instance fields
    get ifields(): number {
        return this.handle.add(HeapReferenceSize * 8).readU64().toNumber()
    }

    // uint64_t methods_;
    get methods(): number {
        return this.handle.add(HeapReferenceSize * 8 + 64).readU64().toNumber()
    }

    // uint64_t sfields_;
    get sfields(): number {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 2).readU64().toNumber()
    }

    // uint32_t access_flags_;
    get access_flags(): number {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3).readU32()
    }

    get access_flags_string(): string {
        return PrettyAccessFlags(this.access_flags)
    }

    // uint32_t class_flags_;
    get class_flags(): number {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32).readU32()
    }

    // uint32_t class_size_;
    get class_size(): number {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32 * 2).readU32()
    }

    // pid_t clinit_thread_id_;
    get clinit_thread_id(): number {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32 * 3).readS32()
    }

    // int32_t dex_class_def_idx_;
    get dex_class_def_idx(): number {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32 * 4).readS32()
    }

    // todo ...
}

declare global {
    var ArtClass: any
}

globalThis.ArtClass = ArtClass