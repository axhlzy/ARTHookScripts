import { Instrumentation } from "./Instrumentation"
import { JSHandle } from "../../../../JSHandle"
import { PointerSize } from "../Globals"
import { ArtThread } from "../Thread"

export class InstrumentationStackPopper extends JSHandle {

    // Thread* self_;
    self_: NativePointer = this.CurrentHandle
    // Instrumentation* instrumentation_;
    instrumentation_: NativePointer = this.self_.add(PointerSize)
    // uint32_t frames_to_remove_;
    frames_to_remove_: NativePointer = this.instrumentation_.add(PointerSize)

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `InstrumentationStackPopper< ${this.handle} >`
        if (this.handle.isNull()) return disp
        disp += `\n${this.self}`
        disp += `\n${this.frames_to_remove}`
        return disp
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + (this.frames_to_remove_.add(0x4).sub(this.handle).toInt32())
    }

    get self(): ArtThread {
        return new ArtThread(this.self_.readPointer())
    }

    get frames_to_remove(): number {
        return this.frames_to_remove_.readU32()
    }

}