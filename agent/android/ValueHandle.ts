import { PointerSize } from "./implements/10/art/Globals"

export class ValueHandle implements SizeOfClass {

    protected value_: NativePointerValue = NULL

    constructor(handle: NativePointerValue) {
        this.value_ = handle
    }

    protected get value(): NativePointerValue {
        return this.value_
    }

    get Invalid_8(): boolean {
        return this.value_ > ptr(0xff)
    }

    get Invalid_16(): boolean {
        return this.value_ > ptr(0xffff)
    }

    get Invalid_32(): boolean {
        return this.value_ > ptr(0xffffffff)
    }

    get Invalid_64(): boolean {
        return this.value_ > ptr(0xffffffffffffffff)
    }

    public ReadAs64(): NativePointerValue {
        return this.value_
    }

    public ReadAs32(): NativePointerValue {
        if (this.Invalid_32) {
            return ptr(Memory.alloc(Process.pageSize).writePointer(this.value_).readU32())
        }
        return this.value_
    }

    public ReadAs16(): NativePointerValue {
        if (this.Invalid_16) {
            return ptr(Memory.alloc(Process.pageSize).writePointer(this.value_).readU16())
        }
        return this.value_
    }

    public ReadAs8(): NativePointerValue {
        if (this.Invalid_8) {
            return ptr(Memory.alloc(Process.pageSize).writePointer(this.value_).readU8())
        }
        return this.value_
    }

    get SizeOfClass(): number {
        return PointerSize
    }

    get CurrentHandle(): NativePointer {
        throw new Error("Method not implemented.")
    }

    get VirtualClassOffset(): number {
        throw new Error("Method not implemented.")
    }

    get VirtualTableList(): NativePointer[] {
        throw new Error("Method not implemented.")
    }

}