import { DexFile_CodeItem } from "./android/implements/10/art/DexFile"
import { ArtMethod } from "./android/implements/10/art/mirror/ArtMethod"
import "./include"

var onceFlag: boolean = true

globalThis.testArtMethod = () => {

    Java.perform(() => {

        // let artMethod_0: NativePointer = Java.use("com.unity3d.player.UnityPlayer").checkResumePlayer.handle
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

        function checkDexFile() {

            if (!onceFlag) return
            onceFlag = false

            const artBase: NativePointer = Module.findBaseAddress("libart.so")!

            const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv")!
            Interceptor.attach(GetObsoleteDexCacheAddr, {
                onEnter(args) {
                    LOGW(`onEnter GetObsoleteDexCacheAddr -> ${args[0]} -> ${args[0].readPointer()}`)
                }, onLeave(retval) {
                    LOGW(`onLeave GetObsoleteDexCacheAddr -> ${retval} -> ${retval.readPointer()}`)
                }
            })

            const branchAddr = artBase.add(0x16C194)
            Interceptor.attach(branchAddr, {
                onEnter(this: InvocationContext, args: InvocationArguments) {
                    const ctx = this.context as Arm64CpuContext
                    const x0 = ctx.x0
                    LOGW(`onEnter branchAddr -> PID:${Process.getCurrentThreadId()}-> ${x0} -> ${ptr(x0.readU32())}`)
                }
            })
        }

        // checkDexFile()

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
        let dex_off: number = art_0.dex_code_item_offset
        let dex_file = art_0.GetDexFile()
        let dex_ins_ptr = dex_file.data_begin.add(dex_off)
        LOGD(`dex_ins_ptr -> ${dex_ins_ptr}`)

        // ArtInstruction.kInstructionDescriptors.forEach((descriptor, index) => {
        //     LOGD(`${index} -> ${descriptor}`)
        // })

        const accessor = art_0.DexInstructions()
        LOGD(`accessor -> ${accessor}`)
        let insns = accessor.InstructionAt()

        let offset: number = 0
        for (let i = 0; i < 100; i++) {
            const disp = `${insns.handle} | ${insns.dumpHexLE()} | ${insns.dumpString(dex_file)}`
            LOGD(`${ptr(offset).toString().padEnd(4, ' ')} ${disp}`)
            if (offset > (accessor.insns_size_in_code_units * 0x2 + (dex_file.is_compact_dex ? DexFile_CodeItem.Compact_InsnsOffset : DexFile_CodeItem.Standard_InsnsOffset))) break
            offset += insns.SizeInCodeUnits
            insns = insns.Next()
        }

    })

}

declare global {
    var testArtMethod: () => void
}