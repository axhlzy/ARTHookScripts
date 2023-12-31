import { JSHandle } from "../../../JSHandle"
import { ArtObject } from "../../../Object"

// class GcRoot {}
export class GcRoot<T extends ArtObject> extends JSHandle {

    public static readonly Size: number = 0x4

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

    toString(): string {
        return `GcRoot<(read32)${this.lsthandle} -> ${this.handle}>`
    }

}