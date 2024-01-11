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

export class ObjectReference extends JSHandle {

    // The encoded reference to a mirror::Object.
    //   uint32_t reference_;
    private reference_: NativePointer = this.handle

    public static SizeOfClass: number = 0x4

    constructor(handle: NativePointer) {
        super(handle)
    }

    get reference(): NativePointer {
        return ptr(this.reference_.readU32())
    }

}