export class dlopenManager {

    public static init() {

        // void* dlopen(const char* filename, int flag)
        // https://cs.android.com/android/platform/superproject/+/master:bionic/libdl/libdl.cpp;l=86?q=libdl%20dlopen&sq=&ss=android%2Fplatform%2Fsuperproject
        Interceptor.attach(Module.findExportByName(null, "dlopen"), {
            onEnter: function (args) {
                const name = args[0].readCString()
                const flag = args[1].toInt32()
                this.loadName = name
            },
            onLeave: function (_retval) {
                dlopenManager.callbacks.forEach(item => {
                    if (item.soName.includes(this.loadName)) {
                        item.calls.forEach(action => {
                            action()
                        })
                        dlopenManager.callbacks = dlopenManager.callbacks.filter(item => item.soName != this.loadName)
                    }
                })
            }
        })

        // void* android_dlopen_ext(const char* __filename, int __flags, const android_dlextinfo* __info)
        // https://cs.android.com/android/platform/superproject/+/master:prebuilts/vndk/v32/x86_64/include/generated-headers/bionic/libc/libc/android_vendor.32_x86_64_shared/gen/include/android/dlext.h;l=185?q=android_dlopen_ext&ss=android%2Fplatform%2Fsuperproject
        Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
            onEnter: function (args) {
                const name = args[0].readCString()
                const flag = args[1].toInt32()
                const info = args[2]
                this.loadName = name
            },
            onLeave: function (_retval) {
                dlopenManager.callbacks.forEach(item => {
                    if (item.soName.includes(this.loadName)) {
                        item.calls.forEach(action => {
                            action()
                        })
                        dlopenManager.callbacks = dlopenManager.callbacks.filter(item => item.soName != this.loadName)
                    }
                })
            }
        })
    }

    private static callbacks: onCallActions[] = []

    public static registSoLoadCallBack(soName: string, action: () => void) {
        const index = dlopenManager.callbacks.findIndex(item => item.soName == soName)
        if (index == -1) {
            dlopenManager.callbacks.push({
                soName: soName,
                calls: [action]
            })
        } else {
            dlopenManager.callbacks[index].calls.push(action)
        }
        LOGD(`registSoLoadCallBack: ${JSON.stringify(dlopenManager.callbacks)}`)
    }

}

interface onCallActions {
    soName: string,
    calls: (() => void)[]
}

dlopenManager.init()

declare global {
    var addSoLoadCallBack: (soName: string, action: () => void) => void
}

globalThis.addSoLoadCallBack = (soName: string, action: () => void) => {
    dlopenManager.registSoLoadCallBack(soName, action)
}