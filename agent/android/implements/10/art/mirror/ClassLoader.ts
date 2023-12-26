import { ArtObject } from "../../../../Object"

// C++ mirror of java.lang.ClassLoader
// class MANAGED ClassLoader : public Object {}
export class ArtClassLoader extends ArtObject {

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): String {
        return `ClassLoader<${this.handle}>`
    }

}

declare global {
    var ArtClassLoader: any
}

globalThis.ArtClassLoader = ArtClassLoader