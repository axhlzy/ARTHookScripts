export class JSHandle implements SizeOfClass {

    public handle: NativePointer

    constructor(handle: NativePointer | number) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle
    }

    get CurrentHandle(): NativePointer {
        return this.handle
    }

    get SizeOfClass(): number {
        return 0
    }

    get VirtualClassOffset(): number {
        return 0
    }

    show(): void {
        LOGD(this.toString())
    }
}