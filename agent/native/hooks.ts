import { get } from "http"

export { }

declare global {
    var hookNativeMethod: (start: NativePointer, end: NativePointer) => void
}

// typedef struct {
//     const char* name;
//     const char* signature;
//     void*       fnPtr;
// } JNINativeMethod;
class JNINativeMethod {
    address: NativePointer

    constructor(address: NativePointer) {
        this.address = address
    }

    getAddress(): NativePointer {
        return this.address
    }

    getMethodName(): string {
        return this.address.readCString()
    }

    getMethodSignature(): string {
        return this.address.add(Process.pointerSize * 1).readCString()
    }

    getMethodImplementation(): NativePointer {
        return this.address.add(Process.pointerSize * 2).readPointer()
    }

    toString(): string {
        return `fnPtr: ${this.getMethodImplementation()} | name: ${this.getMethodName()} | signature: ${this.getMethodSignature()}`
    }

    hook(): void {
        LOGZ(`Hooking : ${this.getMethodName()} @ ${this.getMethodImplementation()}`)
        {
            let func = () => {
                let thisObj = this
                return Interceptor.attach(thisObj.getMethodImplementation(), {
                    onEnter: function (args) {
                        let currentImp = thisObj.getMethodImplementation()
                        let md = Process.findModuleByAddress(currentImp)
                        let extInfo = ''
                        if (md != null) extInfo += `| ${currentImp.sub(md.base)} @ ${md.name}`
                        LOGD(`Called : ${thisObj.getMethodName()} @ ${currentImp} ${extInfo}`)
                        LOGZ(`\targs : ${args[0]} ${args[1]} ${args[2]} ${args[3]}`)
                    }
                })
            }; func()
        }
    }

    next(): NativePointer {
        return this.address.add(Process.pointerSize * 3).readPointer()
    }
}

globalThis.hookNativeMethod = (start, end) => {
    LOGD(`looking from ${start} to ${end}`)
    let count = 0
    for (let local = start; local < end; local = local.add(Process.pointerSize * 3)) {
        let method = new JNINativeMethod(local)
        LOGD(method.toString())
        method.hook()
        count++
    }
    LOGD(`Total methods found: ${count}`)
}