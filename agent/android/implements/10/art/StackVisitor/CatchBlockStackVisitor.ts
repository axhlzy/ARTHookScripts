import { StackVisitor } from "./StackVisitor"

export class CatchBlockStackVisitor extends StackVisitor {

    constructor(handle: NativePointer) {
        super(handle)
    }

}