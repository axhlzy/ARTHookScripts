import { ArtMethod } from "./android/implements/10/art/mirror/ArtMethod"
import "./include"

globalThis.testArtMethod = () => {

    Java.perform(() => {

        const JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"))

        pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").show()

    })
}

globalThis.testRegisterJavaClass = () => {

    Java.performNow(() => {
        const newClass = Java.registerClass({
            // superClass: Java.use("java.lang.Object"),
            name: "com.unity3d.player.test",
            fields: {
                a: "java.lang.String",
                b: "java.lang.String",
                c: "java.lang.String"
            },
            methods: {
                ['onReward']: {
                    returnType: 'void',
                    argumentTypes: ['boolean'],
                    implementation: function (z) {
                        LOGD("onReward")
                    }
                },
                ['toString']: {
                    returnType: 'java.lang.String',
                    argumentTypes: [],
                    implementation: function () {
                        return `val -> ${this.a.value} ${this.b.value} ${this.c.value}`
                    }
                }
            }
        })
        LOGD(newClass.onReward)
    })

}

globalThis.sendMessage = (a: string = "test_class", b: string = "test_function", c: string = "test_value") => {
    Java.perform(() => {
        const JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new(a), JavaString.$new(b), JavaString.$new(c))
    })
}

// setImmediate(testArtMethod)

declare global {
    var testArtMethod: () => void
    var sendMessage: (a?: string, b?: string, c?: string) => void
    var testRegisterJavaClass: () => void
}