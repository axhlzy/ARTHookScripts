// _ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcmNS_6HandleINS_6mirror11ClassLoaderEEERKNS_7DexFileERKNS_3dex8ClassDefE
// art::ClassLinker::DefineClass(art::Thread*, char const*, unsigned long, art::Handle<art::mirror::ClassLoader>, art::DexFile const&, art::dex::ClassDef const&)
// ObjPtr<mirror::Class> ClassLinker::DefineClass(Thread* self, const char* descriptor,size_t hash,Handle<mirror::ClassLoader> class_loader,const DexFile& dex_file,const dex::ClassDef& dex_class_def) 

// https://cs.android.com/android/platform/superproject/+/master:art/runtime/class_linker.cc;l=3388?q=ClassLinker::DefineClass&ss=android%2Fplatform%2Fsuperproject

import { DexFile } from "../implements/10/art/dexfile/DexFile"
import { DexFileManager } from "./DexFileManager"

export class DefineClassHookManager extends DexFileManager {

    private static enableLogs: boolean = false

    private static instance: DefineClassHookManager = null

    private constructor() {
        super()
    }

    public static getInstance(): DefineClassHookManager {
        if (DefineClassHookManager.instance == null) {
            DefineClassHookManager.instance = new DefineClassHookManager()
        }
        return DefineClassHookManager.instance
    }

    public get defineClassAddress() {
        return this.artSymbolFilter(["ClassLinker", "DefineClass", "Thread", "DexFile"]).address
    }

    public dexClassFiles: DexFile[] = []

    public addDexClassFiles(dexFile: DexFile) {
        if (this.hasDexFile(dexFile)) return
        this.dexClassFiles.push(dexFile)
        this.dexClassFiles.forEach((item: DexFile) => {
            if (this.dexFiles.some((retItem: DexFile) => retItem.location == item.location)) return
            this.dexFiles.push(item)
        })
    }

    public enableHook() {
        Interceptor.attach(this.defineClassAddress, {
            onEnter: function (this: InvocationContext, args: InvocationArguments) {
                const dex_file = new DexFile(args[5])
                DefineClassHookManager.getInstance().addDexClassFiles(dex_file)
                if (!DefineClassHookManager.enableLogs) return
                let disp: string = `ClassLinker::DefineClass(\n`
                disp += `\tClassLinker* instance = ${args[0]}\n`
                disp += `\tThread* self = ${args[1]}\n`
                disp += `\tconst char* descriptor = ${args[2]} | ${args[2].readCString()}\n`
                disp += `\tsize_t hash = ${args[3]}\n`
                disp += `\tHandle<mirror::ClassLoader> class_loader = ${args[4]}\n`
                disp += `\tconst DexFile& dex_file = ${args[5]}\n`
                disp += `\tconst dex::ClassDef& dex_class_def = ${args[6]}\n`
                disp += `)`
                this.passDis = disp
                this.needShow = !DefineClassHookManager.getInstance().hasDexFile(dex_file)
            },
            onLeave: function (this: InvocationContext, retval: InvocationReturnValue) {
                if (!this.needShow || !DefineClassHookManager.enableLogs) return
                LOGD(this.passDis)
                LOGD(`retval [ ObjPtr<mirror::Class> ] = ${retval}`)
                newLine()
            }
        })
    }

}