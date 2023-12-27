import { HeapReference } from "./Interface/art/mirror/HeapReference"
import { JSHandle } from "./JSHandle"

export class ArtObject extends JSHandle implements SizeOfClass {

    // // The Class representing the type of the object.
    // HeapReference<Class> klass_;
    protected klass_: NativePointer // 0x4
    // // Monitor and hash code information.
    // uint32_t monitor_;
    protected monitor_: NativePointer // 0x4

    constructor(handle: NativePointer) {
        super(handle)
        this.klass_ = this.handle // pointerSize
        this.monitor_ = this.handle.add(PointerSize) // 0x4
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + 0x4 * 2
    }

    get klass(): HeapReference<typeof ArtClass> {
        return new HeapReference((handle) => new ArtClass(handle), ptr(this.klass_.readU32()))
    }

    get monitor(): number {
        return this.handle.add(0x4).readU32()
    }

}

declare global {
    var ArtObject: any
}

globalThis.ArtObject = ArtObject