import { StackVisitor } from "./StackVisitor"

export class CHAStackVisitor extends StackVisitor {

    constructor(handle: NativePointer) {
        super(handle)
    }

}