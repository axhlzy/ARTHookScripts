export class BaseClass {

    public handle: NativePointer

    public static Arch: string = Process.arch
    public static PointerSize: number = Process.pointerSize

    constructor(handle: NativePointer | number) {
        this.handle = typeof handle === "number" ? ptr(handle) : handle
    }

    toString(): String {
        return `BaseClass< ${this.handle} >`
    }
}