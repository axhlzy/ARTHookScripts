import { ValueHandle } from "../../../../ValueHandle"

export class DexIndex extends ValueHandle {

}

export class DexTypeIndex extends DexIndex {

    get index(): NativePointerValue {
        return this.ReadAs16()
    }

    static get SizeOfClass(): number {
        return 2
    }

}

export class DexProtoIndex extends DexIndex {

    get index(): NativePointerValue {
        return this.ReadAs16()
    }

    static get SizeOfClass(): number {
        return 2
    }

}

export class DexStringIndex extends DexIndex {

    get index(): NativePointerValue {
        return this.ReadAs32()
    }

    static get SizeOfClass(): number {
        return 4
    }

}

