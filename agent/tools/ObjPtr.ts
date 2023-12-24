export class ObjPtr {

    // uintptr_t reference_;

    handle: NativePointer

    constructor(handle: NativePointer) {
        this.handle = handle
    }

    get value(): NativePointer {
        return this.handle.readPointer()
    }

    toString(): string {
        return `${this.handle} -> ${this.value}`
    }

}