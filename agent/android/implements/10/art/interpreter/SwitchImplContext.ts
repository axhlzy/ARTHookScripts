import { JSHandleNotImpl } from "../../../../JSHandle"
import { PointerSize } from "../Globals"
import { ShadowFrame } from "../ShadowFrame"
import { ArtThread } from "../Thread"
import { JValue } from "../Type/JValue"
import { CodeItemDataAccessor } from "../dexfile/CodeItemDataAccessor"

export class SwitchImplContext extends JSHandleNotImpl {

    // Thread* self;
    private _self: NativePointer = this.handle
    // const CodeItemDataAccessor& accessor; 
    private _accessor: NativePointer = this._self.add(PointerSize)
    // ShadowFrame& shadow_frame;
    private _shadow_frame: NativePointer = this._accessor.add(PointerSize)
    // JValue& result_register;
    private _result_register: NativePointer = this._shadow_frame.add(PointerSize)
    // bool interpret_one_instruction;
    private _interpret_one_instruction: NativePointer = this._result_register.add(PointerSize)
    // JValue result;
    private _result: NativePointer = this._interpret_one_instruction.add(PointerSize)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get self(): ArtThread {
        return new ArtThread(this._self.readPointer())
    }

    get accessor(): CodeItemDataAccessor {
        return CodeItemDataAccessor.fromPointer(this._accessor.readPointer())
    }

    get shadow_frame(): ShadowFrame {
        return new ShadowFrame(this._shadow_frame)
    }

    // JValue& result_register;
    get result_register(): NativePointer {
        return this._result_register.readPointer()
    }

    get interpret_one_instruction(): boolean {
        return !!this._interpret_one_instruction.readU8()
    }

    // JValue result;
    get result(): JValue {
        return new JValue(this._result.readPointer())
    }

    toString(): string {
        let disp: string = `SwitchImplContext<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t self=${this.self}`
        disp += `\n\t accessor_=${this._accessor}`
        disp += `\n\t shadow_frame_=${this._shadow_frame}`
        disp += `\n\t result_register=${this.result_register}`
        disp += `\n\t interpret_one_instruction=${this.interpret_one_instruction}`
        disp += `\n\t result_=${this._result}`
        return disp
    }

}