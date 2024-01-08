import { JSHandle } from "../../../../JSHandle"
import { ArtObject } from "../../../../Object"
import { PointerSize } from "../Globals"
import { ArtMethod } from "../mirror/ArtMethod"

export class InstrumentationStackFrame extends JSHandle {

    //   mirror::Object* this_object_;
    this_object_: NativePointer = this.CurrentHandle
    //   ArtMethod* method_;
    method_: NativePointer = this.this_object_.add(PointerSize)
    //   uintptr_t return_pc_;
    return_pc_: NativePointer = this.method_.add(PointerSize)
    //   size_t frame_id_;
    frame_id_: NativePointer = this.return_pc_.add(PointerSize)
    //   bool interpreter_entry_;
    interpreter_entry_: NativePointer = this.frame_id_.add(PointerSize)

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        let disp: string = `InstrumentationStackFrame< ${this.handle} >`
        if (this.handle.isNull()) return disp
        disp += `\n${this.this_object}`
        disp += `\n${this.method}`
        disp += `\n${this.return_pc}`
        disp += `\n${this.frame_id}`
        disp += `\n${this.interpreter_entry}`
        return disp
    }

    get SizeOfClass(): number {
        return super.SizeOfClass + (this.interpreter_entry_.add(0x4).sub(this.handle).toInt32())
    }

    get this_object(): ArtObject {
        return new ArtObject(this.this_object_.readPointer())
    }

    get method(): ArtMethod {
        return new ArtMethod(this.method_.readPointer())
    }

    get return_pc(): NativePointer {
        return this.return_pc_.readPointer()
    }

    get frame_id(): number {
        return this.frame_id_.readU32()
    }

    get interpreter_entry(): boolean {
        return this.interpreter_entry_.readU8() == 1
    }

    // std::string InstrumentationStackFrame::Dump() const {
    //     std::ostringstream os;
    //     os << "Frame " << frame_id_ << " " << ArtMethod::PrettyMethod(method_) << ":"
    //         << reinterpret_cast<void*>(return_pc_) << " this=" << reinterpret_cast<void*>(this_object_);
    //     return os.str();
    //   }
    Dump(): string {
        return `Frame ${this.frame_id_} ${this.method.PrettyMethod()}:${this.return_pc_} this=${this.this_object}`
    }

}