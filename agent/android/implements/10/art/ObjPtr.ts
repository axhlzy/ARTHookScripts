import { JSHandle } from "../../../JSHandle"

// Value type representing a pointer to a mirror::Object of type MirrorType
// Since the cookie is thread based, it is not safe to share an ObjPtr between threads.
// template<class MirrorType>
// class ObjPtr {}
export class ObjPtr extends JSHandle {

    constructor(handle: NativePointer) {
        super(handle)
    }

    // uintptr_t reference_;
    get value(): NativePointer {
        return this.handle.readPointer()
    }

    toString(): string {
        return `${this.handle} -> ${this.value}`
    }

}