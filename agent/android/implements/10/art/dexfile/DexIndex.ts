import { ValueHandle } from "../../../../ValueHandle"

export class DexIndex extends ValueHandle {

    constructor(handle: NativePointer | number) {
        handle instanceof NativePointer ? super(handle) : super(ptr(handle))
    }

    toString(): string {
        return `DexIndex<${this.value_}>`
    }

}

export class DexTypeIndex extends DexIndex {

    get index(): number {
        return (this.ReadAs16() as NativePointer).toInt32()
    }

    static get SizeOfClass(): number {
        return 2
    }

    toString(): string {
        return `TypeIndex<${this.index}>`
    }

}

export class DexProtoIndex extends DexIndex {

    get index(): number {
        return (this.ReadAs16() as NativePointer).toInt32()
    }

    static get SizeOfClass(): number {
        return 2
    }

    toString(): string {
        return `ProtoIndex<${this.index}>`
    }

}

export class DexStringIndex extends DexIndex {

    get index(): number {
        return (this.ReadAs32() as NativePointer).toInt32()
    }

    static get SizeOfClass(): number {
        return 4
    }

    toString(): string {
        return `StringIndex<${this.index}>`
    }

}

