import { JSHandle } from "./JSHandle"

export class ArtObject extends JSHandle {

    constructor(handle: NativePointer) {
        super(handle)
    }

}