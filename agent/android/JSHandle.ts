export class JSHandle {

    public handle: NativePointer

    constructor(handle: NativePointer | number) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle
    }
}