import { BaseClass } from "./BaseClass"

export class GcRoot<T extends BaseClass> extends BaseClass {

    private lsthandle: NativePointer
    private _factory: (handle: NativePointer) => T

    constructor(factory: (handle: NativePointer) => T, handle: NativePointer) {
        super(handle.readU32())
        this.lsthandle = handle
        this._factory = factory;
    }

    // mutable mirror::CompressedReference<mirror::Object> root_;
    get root(): T {
        return this._factory(this.handle)
    }

    toString(): String {
        return `GcRoot<(read32)${this.lsthandle} -> ${this.handle}>`
    }

}