import './android/include'
import './tools/include'
import './Java/include'
import { ArtMethod } from './tools/ArtMethod'

globalThis.test = () => {

    Java.perform(() => {

        let artMethod_0: NativePointer = Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage.handle
        let artMethod_1: NativePointer = Java.use("com.unity3d.player.UnityPlayer").IsWindowTranslucent.handle

        let art_0 = new ArtMethod(artMethod_0)
        let art_1 = new ArtMethod(artMethod_1)

        LOGD(art_0.toString())
        LOGD(art_0.getInfo())

        LOGD(art_0.GetInvokeType())
        LOGD(art_0.GetRuntimeMethodName())
        LOGD(art_1.GetRuntimeMethodName())
        LOGD(art_0.HasSameNameAndSignature(art_1))
        LOGD(art_0.GetQuickenedInfo())
        LOGD(art_0.GetObsoleteDexCache())


        // art.RegisterNativeJS((args: NativePointer[]) => {
        //     LOGE(`called RegisterNativeJS: ${args}`)
        //     return NULL
        // })


        // Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage("1", "2", "3")

    })

}


declare global {
    var test: () => void
}

