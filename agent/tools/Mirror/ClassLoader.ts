import { BaseClass } from "../BaseClass"

export class ClassLoader extends BaseClass {


    toString(): String {
        return `ClassLoader<${this.handle}>`
    }

}