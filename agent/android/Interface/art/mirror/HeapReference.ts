import { JSHandle } from "../../../JSHandle"

// References between objects within the managed heap.
// Similar API to ObjectReference, but not a value type. Supports atomic access.
// template<class MirrorType>
// class MANAGED HeapReference {}
export class HeapReference<T extends JSHandle | NativePointer | Object> extends JSHandle {

    private _factory: (handle: NativePointer) => T

    constructor(factory: (handle: NativePointer) => T, handle: NativePointer) {
        super(handle.readU32())
        this._factory = factory
    }

    // mutable mirror::CompressedReference<mirror::Object> root_;
    get root(): T {
        return this._factory(this.handle) as T
    }

    toString(): String {
        return `HeapReference<${this.handle}> [U32]`
    }

}