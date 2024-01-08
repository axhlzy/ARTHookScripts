
import { HeapReference } from "../../../../Interface/art/mirror/HeapReference"
import { StdString } from "../../../../../tools/StdString"
import { ArtObject } from "../../../../Object"
import { DexFile } from "../dexfile/DexFile"
import { PointerSize } from "../Globals"

// C++ mirror of java.lang.DexCache.
// class MANAGED DexCache final : public Object {}
export class DexCache extends ArtObject implements SizeOfClass {

    // HeapReference<String> location_; // 0x4
    location_ = this.currentHandle.add(0)
    // uint32_t num_preresolved_strings_; // 0x4
    num_preresolved_strings_ = this.currentHandle.add(0x4)
    // uint64_t dex_file_;                // const DexFile*
    dex_file_ = this.currentHandle.add(0x4 * 2)
    // uint64_t preresolved_strings_;     // GcRoot<mirror::String*> array with num_preresolved_strings elements.
    preresolved_strings_ = this.currentHandle.add(0x4 * 2 + 0x8 * 1)
    // uint64_t resolved_call_sites_;     // GcRoot<CallSite>* array with num_resolved_call_sites_ elements.
    resolved_call_sites_ = this.currentHandle.add(0x4 * 2 + 0x8 * 2)
    // uint64_t resolved_fields_;         // std::atomic<FieldDexCachePair>*, array with num_resolved_fields_ elements.
    resolved_fields_ = this.currentHandle.add(0x4 * 2 + 0x8 * 3)
    // uint64_t resolved_methods_;        // ArtMethod*, array with num_resolved_methods_ elements.
    resolved_methods_ = this.currentHandle.add(0x4 * 2 + 0x8 * 4)
    // uint64_t resolved_types_;          // TypeDexCacheType*, array with num_resolved_types_ elements.
    resolved_types_ = this.currentHandle.add(0x4 * 2 + 0x8 * 5)
    // uint64_t strings_;                 // std::atomic<StringDexCachePair>*, array with num_strings_ elements.
    strings_ = this.currentHandle.add(0x4 * 2 + 0x8 * 6)
    // uint32_t num_resolved_call_sites_;    // Number of elements in the call_sites_ array.
    num_resolved_call_sites_ = this.currentHandle.add(0x4 * 2 + 0x8 * 7)
    // uint32_t num_resolved_fields_;        // Number of elements in the resolved_fields_ array.
    num_resolved_fields_ = this.currentHandle.add(0x4 * 3 + 0x8 * 7)
    // uint32_t num_resolved_method_types_;  // Number of elements in the resolved_method_types_ array.
    num_resolved_method_types_ = this.currentHandle.add(0x4 * 4 + 0x8 * 7)
    // uint32_t num_resolved_methods_;       // Number of elements in the resolved_methods_ array.
    num_resolved_methods_ = this.currentHandle.add(0x4 * 5 + 0x8 * 7)
    // uint32_t num_resolved_types_;         // Number of elements in the resolved_types_ array.
    num_resolved_types_ = this.currentHandle.add(0x4 * 6 + 0x8 * 7)
    // uint32_t num_strings_;                // Number of elements in the strings_ array.
    num_strings_ = this.currentHandle.add(0x4 * 7 + 0x8 * 7)

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `DexCache<P:${this.handle} | C:${this.currentHandle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t location: ${this.location_str} @ ${this.location.root.handle}`
        disp += `\n\t preresolved_strings_: ${this.preresolved_strings} | num_preresolved_strings_: ${this.num_preresolved_strings} | resolved_call_sites_: ${this.resolved_call_sites}`
        disp += `\n\t resolved_fields_: ${this.resolved_fields} | resolved_methods_: ${this.resolved_methods} | resolved_types_: ${this.resolved_types}`
        disp += `\n\t strings_: ${this.strings} | num_resolved_call_sites_: ${this.num_resolved_call_sites} | num_resolved_fields_: ${this.num_resolved_fields}`
        disp += `\n\t num_resolved_method_types_: ${this.num_resolved_method_types} | num_resolved_methods_: ${this.num_resolved_methods} | num_resolved_types_: ${this.num_resolved_types}`
        disp += `\n\t num_strings_: ${this.num_strings}`
        return disp
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + this.num_strings_.add(0x4).sub(this.CurrentHandle).toInt32()
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset)
    }

    // HeapReference contains StdString -> The Third Pointer don't need read
    get location(): HeapReference<StdString> {
        return new HeapReference(handle => new StdString(handle), this.location_)
    }

    private get location_str(): string {
        return StdString.from(this.location.root.handle)
    }

    get num_preresolved_strings(): number {
        return this.num_preresolved_strings_.readU32()
    }

    get dex_file(): DexFile {
        return new DexFile(this.dex_file_.readPointer())
    }

    get preresolved_strings(): NativePointer {
        return this.preresolved_strings_.readPointer()
    }

    get resolved_call_sites(): NativePointer {
        return this.resolved_call_sites_.readPointer()
    }

    get resolved_fields(): NativePointer {
        return this.resolved_fields_.readPointer()
    }

    get resolved_methods(): NativePointer {
        return this.resolved_methods_.readPointer()
    }

    get resolved_types(): NativePointer {
        return this.resolved_types_.readPointer()
    }

    get strings(): NativePointer {
        return this.strings_.readPointer()
    }

    get num_resolved_call_sites(): number {
        return this.num_resolved_call_sites_.readU32()
    }

    get num_resolved_fields(): number {
        return this.num_resolved_fields_.readU32()
    }

    get num_resolved_method_types(): number {
        return this.num_resolved_method_types_.readU32()
    }

    get num_resolved_methods(): number {
        return this.num_resolved_methods_.readU32()
    }

    get num_resolved_types(): number {
        return this.num_resolved_types_.readU32()
    }

    get num_strings(): number {
        return this.num_strings_.readU32()
    }

}

Reflect.set(globalThis, "DexCache", DexCache)