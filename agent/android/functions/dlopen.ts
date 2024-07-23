import { PointerSize } from "../implements/10/art/Globals"
import { DEBUG } from "../../tools/common"
import { libC } from "../Utils/libcfuncs"

export const waitSoLoad = (soName: string, sleepS: number = 10) => {
    whenSoLoad(soName, () => { libC.sleep(sleepS) })
}

export const logSoLoad = ()=> whenSoLoad(undefined)

var mapCalled = new Map<string, boolean>()
export const whenSoLoad = (soName: string, fun_enter?: Function, fun_leave?: Function, callOnce: boolean = true) => {

    const callback: InvocationListenerCallbacks = {
        onEnter: function (args) {
            this.path = ''
            try {
                this.path = String(args[0].readCString())
                LOGD(this.path)
            } catch (error) {
                if (DEBUG) LOGE(error)
            }
            if (checkOnce(callOnce, this.path) && this.path != undefined && this.path.includes(soName) && fun_enter != undefined) fun_enter(soName)
        },
        onLeave: function (_retval) {
            if (checkOnce(callOnce, this.path) && this.path != undefined && this.path.includes(soName) && fun_leave != undefined) fun_leave(soName)
        },
    }

    function checkOnce(callOnce: boolean, path: string): boolean {
        if (callOnce) {
            if (mapCalled.has(path)) return false
            else {
                mapCalled.set(path, true)
                return true
            }
        }
    }

    const dlopen = Module.findExportByName(null, "dlopen")
    const android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext")
    const MEM = Memory.alloc(PointerSize)
    if (dlopen != null) Interceptor.attach(dlopen, callback, MEM.writeInt(0))
    if (android_dlopen_ext != null) Interceptor.attach(android_dlopen_ext, callback, MEM.writeInt(1))
}

declare global {
    var logSoLoad: ()=>void
    var waitSoLoad: (soName: string, sleepS?: number)=>void
    var whenSoLoad: (soName: string, fun_enter?: Function, fun_leave?: Function, callOnce?: boolean)=>void
}

globalThis.logSoLoad = logSoLoad
globalThis.waitSoLoad = waitSoLoad
globalThis.whenSoLoad = whenSoLoad