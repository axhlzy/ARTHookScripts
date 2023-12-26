
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
        return new HeapReference((handle) => new StdString(handle), this.handle.add(PointerSize * 0).readPointer())
    }

    // uint32_t num_preresolved_strings_;
    get num_preresolved_strings(): number {
        return this.handle.add(PointerSize * 0 + 0x4).readU32()
    }

    // uint64_t dex_file_;                // const DexFile*
    get dex_file(): DexFile {
        return new DexFile(this.handle.add(PointerSize * 1 + 0x4).readPointer())
    }

    // uint64_t preresolved_strings_;     // GcRoot<mirror::String*> array with num_preresolved_strings elements.
    get preresolved_strings(): NativePointer {
        return this.handle.add(PointerSize * 2 + 0x4).readPointer()
    }

    // uint64_t resolved_call_sites_;     // GcRoot<CallSite>* array with num_resolved_call_sites_ elements.
    get resolved_call_sites(): NativePointer {
        return this.handle.add(PointerSize * 3 + 0x4).readPointer()
    }

    // uint64_t resolved_fields_;         // std::atomic<FieldDexCachePair>*, array with num_resolved_fields_ elements.
    get resolved_fields(): NativePointer {
        return this.handle.add(PointerSize * 4 + 0x4).readPointer()
    }

    // uint64_t resolved_methods_;        // ArtMethod*, array with num_resolved_methods_ elements.
    get resolved_methods(): NativePointer {
        return this.handle.add(PointerSize * 5 + 0x4).readPointer()
    }

    // uint64_t resolved_types_;          // TypeDexCacheType*, array with num_resolved_types_ elements.
    get resolved_types(): NativePointer {
        return this.handle.add(PointerSize * 6 + 0x4).readPointer()
    }

    // uint64_t strings_;                 // std::atomic<StringDexCachePair>*, array with num_strings_ elements.
    get strings(): NativePointer {
        return this.handle.add(PointerSize * 7 + 0x4).readPointer()
    }

    // uint32_t num_resolved_call_sites_;    // Number of elements in the call_sites_ array.
    get num_resolved_call_sites(): number {
        return this.handle.add(PointerSize * 8 + 0x4).readPointer().toInt32()
    }

    // uint32_t num_resolved_fields_;        // Number of elements in the resolved_fields_ array.
    get num_resolved_fields(): number {
        return this.handle.add(PointerSize * 8 + 0x4 * 2).readPointer().toInt32()
    }

    // uint32_t num_resolved_method_types_;  // Number of elements in the resolved_method_types_ array.
    get num_resolved_method_types(): number {
        return this.handle.add(PointerSize * 8 + 0x4 * 3).readPointer().toInt32()
    }

    // uint32_t num_resolved_methods_;       // Number of elements in the resolved_methods_ array.
    get num_resolved_methods(): number {
        return this.handle.add(PointerSize * 8 + 0x4 * 4).readPointer().toInt32()
    }

    // uint32_t num_resolved_types_;         // Number of elements in the resolved_types_ array.
    get num_resolved_types(): number {
        return this.handle.add(PointerSize * 8 + 0x4 * 5).readPointer().toInt32()
    }

    // uint32_t num_strings_;                // Number of elements in the strings_ array.
    get num_strings(): number {
        return this.handle.add(PointerSize * 8 + 0x4 * 6).readPointer().toInt32()
    }

}

declare global {
    var DexCache: any
}

globalThis.DexCache = DexCache