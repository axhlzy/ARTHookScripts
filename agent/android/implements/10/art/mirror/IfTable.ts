import { ArtObject } from "../../../../Object"

// class MANAGED IfTable final : public ObjectArray<Object> {}
export class IfTable extends ArtObject {

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): string {
        return `IfTable<${this.handle}>`
    }

}