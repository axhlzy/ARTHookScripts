import { HeapReference } from "./Interface/art/mirror/HeapReference"
import { JSHandle } from "./JSHandle"

export class ArtObject extends JSHandle implements SizeOfClass {

    // // The Class representing the type of the object.
    // HeapReference<Class> klass_;
    protected klass_: NativePointer
    // // Monitor and hash code information.
    // uint32_t monitor_;
    protected monitor_: NativePointer

    constructor(handle: NativePointer) {
        super(handle)
        this.klass_ = this.handle // pointerSize
        this.monitor_ = this.handle.add(PointerSize) // 0x4
    }

    get SizeOfClass(): number {
        return PointerSize + 0x4
    }

    get klass(): HeapReference<typeof ArtClass> {
        return new HeapReference((handle) => new ArtClass(handle), this.klass_.readPointer())
    }

    get monitor(): number {
        return this.handle.add(PointerSize).readU32()
    }

}

declare global {
    var ArtObject: any
}

globalThis.ArtObject = ArtObject