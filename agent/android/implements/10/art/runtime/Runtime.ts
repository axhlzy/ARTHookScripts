import { JSHandle } from "../../../../JSHandle"

export class ArtRuntime extends JSHandle {

    private constructor(handle: NativePointer) {
        super(handle)
    }

    public static getInstance() {
        return new ArtRuntime(((Java as any).api.artRuntime as NativePointer))
    }

}