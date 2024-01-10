import { JSHandleNotImpl } from "../../../../JSHandle"

export class jobject extends JSHandleNotImpl {

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `jobject<${this.handle}>`
        if (this.handle.isNull()) return disp
        return disp
    }
}