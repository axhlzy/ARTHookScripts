import { HeapReference } from "../../../../Interface/art/mirror/HeapReference"
import { ArtObject } from "../../../../Object"

// C++ mirror of java.lang.ClassLoader
// class MANAGED ClassLoader : public Object {}
export class ArtClassLoader extends ArtObject {

    // // Field order required by test "ValidateFieldOrderOfJavaCppUnionClasses".
    // HeapReference<Object> packages_;
    private packages_: NativePointer = this.CurrentHandle
    // HeapReference<ClassLoader> parent_;
    private parent_: NativePointer = this.packages_.add(HeapReference.Size)
    // HeapReference<Object> proxyCache_;
    private proxyCache_: NativePointer = this.parent_.add(HeapReference.Size)
    // // Native pointer to class table, need to zero this out when image writing.
    // uint32_t padding_ ATTRIBUTE_UNUSED;
    private padding_: NativePointer = this.proxyCache_.add(HeapReference.Size)
    // uint64_t allocator_;
    private allocator_: NativePointer = this.padding_.add(0x4)
    // uint64_t class_table_;
    private class_table_: NativePointer = this.allocator_.add(0x8)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + this.class_table_.add(0x8).sub(this.handle).toInt32()
    }

    toString(): string {
        let idsp: string = `ClassLoader<${this.handle}>`
        if (this.handle.isNull()) return idsp
        idsp += `\n\t packages_: ${this.packages} | parent_: ${this.parent} | proxyCache_: ${this.proxyCache}`
        idsp += `\n\t allocator_: ${this.allocator} | class_table_: ${this.class_table}`
        return idsp
    }

    get packages(): HeapReference<ArtObject> {
        return new HeapReference((handle) => new ArtObject(handle), this.packages_)
    }

    get parent(): HeapReference<ArtClassLoader> {
        return new HeapReference((handle) => new ArtClassLoader(handle), this.parent_)
    }

    get proxyCache(): HeapReference<ArtObject> {
        return new HeapReference((handle) => new ArtObject(handle), this.proxyCache_)
    }

    get allocator(): HeapReference<ArtObject> {
        return new HeapReference((handle) => new ArtObject(handle), this.allocator_)
    }

    get class_table(): NativePointer {
        return ptr(this.class_table_.readU32())
    }

}