// #define RTLD_LOCAL    0
// #define RTLD_LAZY     0x00001
// #define RTLD_NOW      0x00002
// #define RTLD_NOLOAD   0x00004
// #define RTLD_GLOBAL   0x00100
// #define RTLD_NODELETE 0x01000
const MAP_RTLD: { [key: number]: string } = {
    0: "RTLD_LOCAL",
    0x00001: "RTLD_LAZY    ",
    0x00002: "RTLD_NOW     ",
    0x00004: "RTLD_NOLOAD  ",
    0x00100: "RTLD_GLOBAL  ",
    0x01000: "RTLD_NODELETE"
}

export class dlopenManager {

    private static needLog_G: boolean = true

    public static init(needLog: boolean) {
        dlopenManager.needLog_G = needLog

        // void* dlopen(const char* filename, int flag)
        // https://cs.android.com/android/platform/superproject/+/master:bionic/libdl/libdl.cpp;l=86?q=libdl%20dlopen&sq=&ss=android%2Fplatform%2Fsuperproject
        Interceptor.attach(Module.findExportByName(null, "dlopen"), {
            onEnter: function (args) {
                this.name_p = args[0].readCString()
                this.flag_p = args[1].toInt32()
            },
            onLeave: function (retval: NativePointer) {
                dlopenManager.onSoLoad(this.name_p, this.flag_p, retval)
            }
        })

        // void* android_dlopen_ext(const char* __filename, int __flags, const android_dlextinfo* __info)
        // https://cs.android.com/android/platform/superproject/+/master:prebuilts/vndk/v32/x86_64/include/generated-headers/bionic/libc/libc/android_vendor.32_x86_64_shared/gen/include/android/dlext.h;l=185?q=android_dlopen_ext&ss=android%2Fplatform%2Fsuperproject
        Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
            onEnter: function (args) {
                if (args[0] !== undefined && args[0] != null) {
                    this.name_p = args[0].readCString()
                    this.flag_p = args[1].toInt32()
                    this.info_p = args[2].toInt32()
                }
            },
            onLeave: function (retval: NativePointer) {
                dlopenManager.onSoLoad(this.name_p, this.flag_p, retval, this.info_p)
            }
        })
    }

    public static onSoLoad(soName: string, flag: number, retval: NativePointer, _info?: NativePointer) {
        if (dlopenManager.needLog_G) LOGD(`dlopen: ${flag} -> ${MAP_RTLD[flag]} | ${soName}`)
        // if (dlopenManager.needLog_G) LOGD(`dlopen: ${retval} | ${flag} -> ${MAP_RTLD[flag]} | ${soName}`)
        if (dlopenManager.callbacks == undefined) return
        dlopenManager.callbacks.forEach((actions: (() => void)[], name: string) => {
            if (soName.indexOf(name) !== -1) {
                actions.forEach(action => {
                    action()
                })
            }
            dlopenManager.callbacks.delete(name)
        })
    }

    private static callbacks: Map<string, (() => void)[]> = new Map<string, (() => void)[]>()

    public static registSoLoadCallBack(soName: string, action: () => void) {
        if (dlopenManager.callbacks.has(soName)) {
            dlopenManager.callbacks.get(soName).push(action)
        } else {
            dlopenManager.callbacks.set(soName, [action])
        }
    }

}

setImmediate(() => {
    dlopenManager.init(false)
})

declare global {
    var addSoLoadCallBack: (soName: string, action: () => void) => void
}

globalThis.addSoLoadCallBack = (soName: string, action: () => void) => {
    dlopenManager.registSoLoadCallBack(soName, action)
}