import { BaseClass } from "../BaseClass"

export class ClassExt extends BaseClass {

    toString(): String {
        return `ClassExt<${this.handle}>`
    }

}