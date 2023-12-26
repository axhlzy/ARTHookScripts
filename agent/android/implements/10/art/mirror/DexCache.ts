
import { HeapReference } from "../../../../Interface/art/mirror/HeapReference"
import { StdString } from "../../../../../tools/StdString"
import { ArtObject } from "../../../../Object"
import { DexFile } from "../DexFile"
import { ArtClass } from "./ArtClass"

// C++ mirror of java.lang.DexCache.
// class MANAGED DexCache final : public Object {}
export class DexCache extends ArtObject {

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): String {
        let disp: string = `DexCache<${this.handle}>`
        // disp += `location: ${this.location.root.disposeToString()} \n`
        return disp
    }

    // HeapReference<String> location_;
    get location(): HeapReference<StdString> {
        return new HeapReference((handle) => new StdString(handle), this.handle.add(ArtClass.PointerSize * 0).readPointer())
    }

    // uint32_t num_preresolved_strings_;
    get num_preresolved_strings(): number {
        return this.handle.add(ArtClass.PointerSize + 32).readU32()
    }

    // uint64_t dex_file_;                // const DexFile*
    get dex_file(): DexFile {
        return new DexFile(ptr(this.handle.add(ArtClass.PointerSize + 32).readU64().toString()))
        // return new DexFile(ptr(this.handle.add(0x10).readU64().toString()))
    }

    // uint64_t preresolved_strings_;     // GcRoot<mirror::String*> array with num_preresolved_strings elements.
    get preresolved_strings(): NativePointer {
        return ptr(this.handle.add(ArtClass.PointerSize + 32 + 64 * 1).readU64().toString())
    }

    // uint64_t resolved_call_sites_;     // GcRoot<CallSite>* array with num_resolved_call_sites_ elements.
    get resolved_call_sites(): NativePointer {
        return ptr(this.handle.add(ArtClass.PointerSize + 32 + 64 * 2).readU64().toString())
    }

    // uint64_t resolved_fields_;         // std::atomic<FieldDexCachePair>*, array with num_resolved_fields_ elements.
    get resolved_fields(): NativePointer {
        return ptr(this.handle.add(ArtClass.PointerSize + 32 + 64 * 3).readU64().toString())
    }

    // uint64_t resolved_methods_;        // ArtMethod*, array with num_resolved_methods_ elements.
    get resolved_methods(): NativePointer {
        return ptr(this.handle.add(ArtClass.PointerSize + 32 + 64 * 4).readU64().toString())
    }

    // uint64_t resolved_types_;          // TypeDexCacheType*, array with num_resolved_types_ elements.
    get resolved_types(): NativePointer {
        return ptr(this.handle.add(ArtClass.PointerSize + 32 + 64 * 5).readU64().toString())
    }

    // uint64_t strings_;                 // std::atomic<StringDexCachePair>*, array with num_strings_ elements.
    get strings(): NativePointer {
        return ptr(this.handle.add(ArtClass.PointerSize + 32 + 64 * 6).readU64().toString())
    }

    // uint32_t num_resolved_call_sites_;    // Number of elements in the call_sites_ array.
    get num_resolved_call_sites(): number {
        return this.handle.add(ArtClass.PointerSize + 32 + 64 * 7 + 32).readU32()
    }

    // uint32_t num_resolved_fields_;        // Number of elements in the resolved_fields_ array.
    get num_resolved_fields(): number {
        return this.handle.add(ArtClass.PointerSize + 32 + 64 * 7 + 32 * 2).readU32()
    }

    // uint32_t num_resolved_method_types_;  // Number of elements in the resolved_method_types_ array.
    get num_resolved_method_types(): number {
        return this.handle.add(ArtClass.PointerSize + 32 + 64 * 7 + 32 * 3).readU32()
    }

    // uint32_t num_resolved_methods_;       // Number of elements in the resolved_methods_ array.
    get num_resolved_methods(): number {
        return this.handle.add(ArtClass.PointerSize + 32 + 64 * 7 + 32 * 4).readU32()
    }

    // uint32_t num_resolved_types_;         // Number of elements in the resolved_types_ array.
    get num_resolved_types(): number {
        return this.handle.add(ArtClass.PointerSize + 32 + 64 * 7 + 32 * 5).readU32()
    }

    // uint32_t num_strings_;                // Number of elements in the strings_ array.
    get num_strings(): number {
        return this.handle.add(ArtClass.PointerSize + 32 + 64 * 7 + 32 * 6).readU32()
    }

}