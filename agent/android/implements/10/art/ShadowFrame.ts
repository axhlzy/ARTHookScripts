import { JSHandle } from "../../../JSHandle"

// jetbrains://clion/navigate/reference?project=libart&path=interpreter/shadow_frame.h

export class ShadowFrame extends JSHandle {

    constructor(handle: NativePointer) {
        super(handle)
    }

}