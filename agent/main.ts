import { ArtMethod } from "./android/implements/10/art/mirror/ArtMethod"
import { DexFile } from "./android/implements/10/art/dexfile/DexFile"
import "./include"

globalThis.testArtMethod = () => {

    Java.perform(() => {

        let method: ArtMethod = pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage")
        let dexFile: DexFile = method.GetDexFile()
        method.show()

        for (let i = dexFile.NumStringIds(); i > dexFile.NumStringIds() - 20; i--) {
            LOGD(dexFile.StringDataByIdx(i).toString())
        }

        for (let i = dexFile.NumTypeIds(); i > dexFile.NumTypeIds() - 20; i--) {
            LOGD(dexFile.GetTypeDescriptor(i))
        }
        // test parse dexFile
        newLine()
        LOGD(dexFile.StringDataByIdx(8907).str)
        dexFile.PrettyMethod(41007)
        // LOGD(dexFile.GetFieldId(10))
        // LOGD(dexFile.GetTypeId(617))
        // LOGD(dexFile.GetProtoId(10))
        // LOGD(dexFile.GetMethodId(10))
        // LOGD(dexFile.GetClassDef(10))
    })
}

globalThis.sendMessage = (a: string = "test_class", b: string = "test_function", c: string = "test_value") => {
    Java.perform(() => {
        const JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new(a), JavaString.$new(b), JavaString.$new(c))
    })
}

declare global {
    var testArtMethod: () => void
    var sendMessage: (a?: string, b?: string, c?: string) => void
}

