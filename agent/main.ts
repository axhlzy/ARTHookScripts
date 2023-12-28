import "./include"

globalThis.testArtMethod = () => {

    Java.perform(() => {

        var JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"))

        pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").showSmali()

        pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").GetDexFile().toString()

    })

}

// setImmediate(testArtMethod)

declare global {
    var testArtMethod: () => void
}