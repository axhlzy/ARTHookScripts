// _ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcmNS_6HandleINS_6mirror11ClassLoaderEEERKNS_7DexFileERKNS_3dex8ClassDefE
// art::ClassLinker::DefineClass(art::Thread*, char const*, unsigned long, art::Handle<art::mirror::ClassLoader>, art::DexFile const&, art::dex::ClassDef const&)
// ObjPtr<mirror::Class> ClassLinker::DefineClass(Thread* self, const char* descriptor,size_t hash,Handle<mirror::ClassLoader> class_loader,const DexFile& dex_file,const dex::ClassDef& dex_class_def) 

// https://cs.android.com/android/platform/superproject/+/master:art/runtime/class_linker.cc;l=3388?q=ClassLinker::DefineClass&ss=android%2Fplatform%2Fsuperproject

import { DexFile } from "../implements/10/art/dexfile/DexFile"
import { DexFileManager } from "./DexFileManager"

export class DefineClassHookManager extends DexFileManager {

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

    static MD: CModule = new CModule(`
        #include <stdio.h>
        #include <glib.h>
        #include <gum/gumprocess.h>
        #include <gum/guminterceptor.h>

        extern void _frida_log(const gchar * message);

        static void frida_log(const char * format, ...) {
            gchar * message;
            va_list args;
            va_start (args, format);
            message = g_strdup_vprintf (format, args);
            va_end (args);
            _frida_log (message);
            g_free (message);
        }

        extern void gotDexFile(void* dexFile);

        void(*it)(void* dexFile);

        extern GHashTable *ptrHash;

        void IterDexFile(void* callback) {
            if (ptrHash == NULL) ptrHash = g_hash_table_new_full(g_direct_hash, g_direct_equal, NULL, NULL);
            guint size = g_hash_table_size(ptrHash);
            if (size == 0) {
                frida_log("IterDexFile -> ptrHash is empty");
            } else {
                GHashTableIter iter;
                gpointer key, value;
                g_hash_table_iter_init(&iter, ptrHash);
                while (g_hash_table_iter_next(&iter, &key, &value)) {
                    ((void(*)(void*))callback)(key);
                }
            }
        }

        gboolean filterPtr(void* ptr) {
            if (ptrHash == NULL) {
                ptrHash = g_hash_table_new_full(g_direct_hash, g_direct_equal, NULL, NULL);
            }
            if (g_hash_table_contains(ptrHash, ptr)) {
                // frida_log("Filter PASS -> %p", ptr);
                return 0;
            } else {
                g_hash_table_add(ptrHash, ptr);
                return 1;
            }
        }

        void onEnter(GumInvocationContext *ctx) {
            void* dexFile = gum_invocation_context_get_nth_argument(ctx,5);
            if (filterPtr(dexFile)) {
                gotDexFile(dexFile);
            }
        }

    `, {
        ptrHash: Memory.alloc(Process.pointerSize),
        _frida_log: new NativeCallback((message: NativePointer) => {
            LOGZ(message.readCString())
        }, 'void', ['pointer']),
        gotDexFile: new NativeCallback((dexFile: NativePointer) => {
            const dex_file = new DexFile(dexFile)
            // LOGD(`gotDexFile -> ${dexFile} | ${dex_file.location}`)
            DefineClassHookManager.getInstance().addDexClassFiles(dex_file)
        }, 'void', ['pointer'])
    })

    public IterDexFile(callback: (dexFile: NativePointer) => void | NativePointer | undefined) {
        let localCallback = NULL
        if (callback == undefined || callback == null) {
            localCallback = new NativeCallback((dexFile: NativePointer) => {
                const dex_file = new DexFile(dexFile)
                LOGD(`IterDexFile -> ${dexFile} | ${dex_file.location}`)
                DefineClassHookManager.getInstance().addDexClassFiles(dex_file)
            }, 'void', ['pointer'])
        } else {
            localCallback = new NativeCallback(callback, 'void', ['pointer'])
        }
        new NativeFunction(DefineClassHookManager.MD.IterDexFile, 'void', ['pointer'])(localCallback)
    }

    public enableHook(enableLogs: boolean = false) {
        if (enableLogs) {
            LOGD(`EnableHook -> DefineClassHookManager`)
            Interceptor.attach(this.defineClassAddress, {
                onEnter: function (this: InvocationContext, args: InvocationArguments) {
                    const dex_file = new DexFile(args[5])
                    DefineClassHookManager.getInstance().addDexClassFiles(dex_file)
                    if (!enableLogs) return
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
                    if (!this.needShow || !enableLogs) return
                    LOGD(this.passDis)
                    LOGD(`retval [ ObjPtr<mirror::Class> ] = ${retval}`)
                    newLine()
                }
            })
        } else {
            Interceptor.attach(this.defineClassAddress, DefineClassHookManager.MD as NativeInvocationListenerCallbacks)
        }

    }

}

declare global {
    var IterDexFile: (callback: (dexFile: NativePointer) => void | NativePointer | undefined) => void
}

globalThis.IterDexFile = DefineClassHookManager.getInstance().IterDexFile.bind(DefineClassHookManager.getInstance())