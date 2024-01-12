import { JSHandle } from "../../../../JSHandle"

export class ArtRuntime extends JSHandle {

    private constructor(handle: NativePointer) {
        super(handle)
    }

    // public static Instance: ArtRuntime = new ArtRuntime(((Java as any).api.artRuntime as NativePointer).readPointer())

}