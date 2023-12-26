export class JSHandle implements SizeOfClass {

    public handle: NativePointer

    constructor(handle: NativePointer | number) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle
    }

    get SizeOfClass(): number {
        return 0
    }
}

declare global {
    var Arch: string
    var PointerSize: number
}

globalThis.Arch = Process.arch
globalThis.PointerSize = Process.pointerSize