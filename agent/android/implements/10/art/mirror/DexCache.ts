
import { HeapReference } from "../../../../Interface/art/mirror/HeapReference"
import { StdString } from "../../../../../tools/StdString"
import { ArtObject } from "../../../../Object"
import { DexFile } from "../DexFile"
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

    toString(): String {
        let disp: string = `DexCache<P:${this.handle}|C:${this.currentHandle}>`
        // disp += `location: ${this.location.root.disposeToString()} \n`
        return disp
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + (PointerSize * 8 + 0x4 * 6)
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset)
    }

    get location(): HeapReference<StdString> {
        return new HeapReference((handle) => new StdString(handle), ptr(this.location_.readU32()))
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