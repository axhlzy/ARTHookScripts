import { StdString } from "../../../../tools/StdString"
import { callSym } from "../../../Utils/SymHelper"

export class dex2oat {

    // _ZNK3art7Runtime21GetCompilerExecutableEv
    static GetCompilerExecutable(runtime: NativePointer): string {
        const str = new StdString()
        callSym<NativePointer[]>(
            "_ZNK3art7Runtime21GetCompilerExecutableEv", "libart.so",
            ['pointer', 'pointer', 'pointer'], ['pointer', 'pointer'], runtime, str.handle
        )
        return str.disposeToString()
    }

}

Reflect.set(globalThis, 'dex2oat', dex2oat)