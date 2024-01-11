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
    private class_loader_ = this.CurrentHandle
    // HeapReference<Class> component_type_;
    private component_type_ = this.class_loader_.add(HeapReference.Size)
    // HeapReference<DexCache> dex_cache_;
    private dex_cache_ = this.component_type_.add(HeapReference.Size)
    // HeapReference<ClassExt> ext_data_;
    private ext_data_ = this.dex_cache_.add(HeapReference.Size)
    // HeapReference<IfTable> iftable_;
    private iftable_ = this.ext_data_.add(HeapReference.Size)
    // HeapReference<String> name_;
    private name_ = this.iftable_.add(HeapReference.Size)
    // HeapReference<Class> super_class_;
    private super_class_ = this.name_.add(HeapReference.Size)
    // HeapReference<PointerArray> vtable_;
    private vtable_ = this.super_class_.add(HeapReference.Size)
    // ArtFields are allocated as a length prefixed ArtField array, and not an array of pointers to ArtFields.
    // uint64_t ifields_; => instance fields
    private ifields_ = this.vtable_.add(HeapReference.Size)
    // uint64_t methods_;
    private methods_ = this.ifields_.add(0x8)
    // uint64_t sfields_;
    private sfields_ = this.methods_.add(0x8)
    // uint32_t access_flags_;
    private access_flags_ = this.sfields_.add(0x8)
    // uint32_t class_flags_;
    private class_flags_ = this.access_flags_.add(0x4)
    // uint32_t class_size_;
    private class_size_ = this.class_flags_.add(0x4)
    // pid_t clinit_thread_id_;
    private clinit_thread_id_ = this.class_size_.add(0x4)
    // int32_t dex_class_def_idx_;
    private dex_class_def_idx_ = this.clinit_thread_id_.add(0x8)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get SizeOfClass(): number {
        return (this.dex_class_def_idx_).add(0x4).sub(this.CurrentHandle).add(this.super_class.SizeOfClass).toInt32()
    }

    get CurrentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset)
    }

    toString(): string {
        let disp: string = `ArtClass< ${this.handle} >`
        if (this.handle.isNull()) return disp
        disp += `\n\t class_loader: ${this.class_loader} -> ArtClassLoader< ${this.class_loader.root.handle} >`
        disp += `\n\t component_type: ${this.component_type} -> ArtClass< ${this.component_type.root.handle} >`
        disp += `\n\t dex_cache: ${this.dex_cache} -> DexCache<P:${this.dex_cache.root.handle} >`
        disp += `\n\t ext_data: ${this.ext_data}`
        disp += `\n\t iftable: ${this.iftable}`
        disp += `\n\t name: ${this.name} -> ${this.name_str}`
        disp += `\n\t super_class: ${this.super_class} -> ArtClass< ${this.super_class.root.handle} >`
        disp += `\n\t vtable: ${this.vtable}`
        disp += `\n\t ifields: ${this.ifields} | ${ptr(this.ifields)}`
        disp += `\n\t methods: ${this.methods} | ${ptr(this.methods)}`
        disp += `\n\t sfields: ${this.sfields} | ${ptr(this.sfields)}`
        disp += `\n\t access_flags: ${this.access_flags} -> ${this.access_flags_string}`
        disp += `\n\t class_flags: ${this.class_flags}`
        disp += `\n\t class_size: ${this.class_size}`
        disp += `\n\t clinit_thread_id: ${this.clinit_thread_id}`
        disp += `\n\t dex_class_def_idx: ${this.dex_class_def_idx}`
        return disp
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

    private name_str(): string {
        return StdString.from(this.name.root.handle)
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