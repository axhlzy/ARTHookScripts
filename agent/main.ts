import { ArtInstruction } from "./android/implements/10/art/Instruction"
import "./include"

globalThis.testArtMethod = () => {

    Java.perform(() => {

        const JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"))

        pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").show()

    })
}

setImmediate(() => {

    // TraceManager.Trace_DefineClass()
    // TraceManager.Trace_OpenCommon()

})

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

