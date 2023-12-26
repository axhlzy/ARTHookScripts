import { ArtObject } from "../../../../Object"

// C++ mirror of dalvik.system.ClassExt
// class MANAGED ClassExt : public Object {｝
export class ClassExt extends ArtObject {

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): String {
        return `ClassExt<${this.handle}>`
    }

}