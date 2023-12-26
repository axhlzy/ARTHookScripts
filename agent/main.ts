import { ArtMethod } from "./android/implements/10/art/mirror/ArtMethod"
import "./include"

globalThis.testArtMethod = () => {

    Java.perform(() => {

        let artMethod_0: NativePointer = Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage.handle
        // let artMethod_0: NativePointer = Java.use("com.unity3d.player.Camera2Wrapper").deinitCamera2Jni.handle
        let artMethod_1: NativePointer = Java.use("com.unity3d.player.UnityPlayer").IsWindowTranslucent.handle

        // public static void com.unity3d.player.UnityPlayer.UnitySendMessage(java.lang.String, java.lang.String, java.lang.String)
        var JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"))

        let art_0 = new ArtMethod(artMethod_0)
        let art_1 = new ArtMethod(artMethod_1)

        LOGD(art_0.toString())
        LOGD(art_0.getInfo())

        LOGD(`GetInvokeType -> ${art_0.GetInvokeType()}`)
        LOGD(`GetRuntimeMethodName -> ${art_0.GetRuntimeMethodName()}`)
        LOGD(`dex_code_item_offset_ -> ${art_0.dex_code_item_offset} -> ${ptr(art_0.dex_code_item_offset)}`)
        LOGD(`dex_method_index -> ${ptr(art_0.dex_method_index)}`)
        LOGD(`GetRuntimeMethodName -> ${art_1.GetRuntimeMethodName()}`)
        LOGD(`HasSameNameAndSignature -> ${art_0.HasSameNameAndSignature(art_1)}`)
        LOGD(`access_flags_string -> ${art_0.access_flags_string}`)
        LOGD(`GetQuickenedInfo -> ${art_0.GetQuickenedInfo()}`)
        LOGD(`entry_point_from_quick_compiled_code -> ${art_0.entry_point_from_quick_compiled_code}`)

        newLine()

        LOGD(`GetDexFile -> ${art_0.GetDexFile()}`)
        LOGD(`GetDexFile -> ${art_0.GetDexFile().begin.add(art_0.dex_code_item_offset)}`)

        // ArtInstruction.kInstructionNames.forEach((name, index) => {
        //     LOGD(`${index} -> ${name}`)
        // })

        // art.RegisterNativeJS((args: NativePointer[]) => {
        //     LOGE(`called RegisterNativeJS: ${args}`)
        //     return NULL
        // })


        // Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage("1", "2", "3")

    })

}

declare global {
    var testArtMethod: () => void
}