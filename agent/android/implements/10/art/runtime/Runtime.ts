import { callSym } from "../../../../Utils/SymHelper"
import { JSHandle } from "../../../../JSHandle"
import { StdString } from "../../../../../tools/StdString"

export class ArtRuntime extends JSHandle {

    private constructor(handle: NativePointer) {
        super(handle)
    }

    public static getInstance() {
        return new ArtRuntime(((Java as any).api.artRuntime as NativePointer))
    }

    // std::string Runtime::GetCompilerExecutable() const {
    //   if (!compiler_executable_.empty()) {
    //     return compiler_executable_;
    //   }
    //   std::string compiler_executable(GetAndroidRoot());
    //   compiler_executable += (kIsDebugBuild ? "/bin/dex2oatd" : "/bin/dex2oat");
    //   return compiler_executable;
    // }
    // _ZNK3art7Runtime21GetCompilerExecutableEv
    GetCompilerExecutable(): string {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZNK3art7Runtime21GetCompilerExecutableEv", "libart.so",
            ['pointer', 'pointer', 'pointer'], ['pointer'],
            this.handle))
    }

}

Reflect.set(global, 'ArtRuntime', ArtRuntime)