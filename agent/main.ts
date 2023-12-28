import "./include"

globalThis.testArtMethod = () => {

    Java.perform(() => {

        var JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"))
        newLine()

        LOGD(pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").GetDexFile().toString())

        pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").showSmali()

    })

}

globalThis.testRegisterJavaClass = () => {

    Java.performNow(() => {
        var newClass = Java.registerClass({
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

// setImmediate(testArtMethod)

declare global {
    var testArtMethod: () => void
    var testRegisterJavaClass: () => void
}