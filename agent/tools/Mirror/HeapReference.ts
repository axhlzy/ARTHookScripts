import { BaseClass } from "../BaseClass"

export class HeapReference<T> extends BaseClass {

    private lsthandle: NativePointer
    private _factory: (handle: NativePointer) => T

    constructor(factory: (handle: NativePointer) => T, handle: NativePointer) {
        super(handle.readU32())
        this.lsthandle = handle
        this._factory = factory;
    }

    // mutable mirror::CompressedReference<mirror::Object> root_;
    get root(): T {
        return this._factory(this.handle) as T
    }

    toString(): String {
        return `HeapReference<(read32)${this.lsthandle} -> ${this.handle}>`
    }

}