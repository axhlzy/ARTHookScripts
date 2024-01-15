import { CodeItemInstructionAccessor } from "../dexfile/CodeItemInstructionAccessor"
import { JSHandleNotImpl } from "../../../../JSHandle"
import { R } from "../../../../../tools/intercepter"
import { getSym } from "../../../../Utils/SymHelper"
import { ArtMethod } from "../mirror/ArtMethod"
import { ArtInstruction } from "../Instruction"
import { ShadowFrame } from "../ShadowFrame"
import { DexFile } from "../dexfile/DexFile"
import { Opcode } from "./InstructionList"

class UnUsedInstructions extends Opcode { }

export class UnUsedInstructionManager extends JSHandleNotImpl {

    // listenerMap record UNUSED_F6 and listener
    private static listenerMap: Map<UnUsedInstructions, Function[]> = new Map()

    public static registerListener(opcode: UnUsedInstructions, listener: Function) {
        if (!this.listenerMap.has(opcode)) {
            this.listenerMap.set(opcode, [])
        }
        this.listenerMap.get(opcode).push(listener)
    }

    public static removeListener(opcode: UnUsedInstructions) {
        this.listenerMap.delete(opcode)
    }

    public static catchUnexpectedOpcode() {

        // _ZN3art11interpreter16UnexpectedOpcodeEPKNS_11InstructionERKNS_11ShadowFrameE
        // art::interpreter::UnexpectedOpcode(art::Instruction const*, art::ShadowFrame const&)
        // void UnexpectedOpcode(const Instruction* inst, const ShadowFrame& shadow_frame)

        // Interceptor.attach(getSym("_ZN3art11interpreter16UnexpectedOpcodeEPKNS_11InstructionERKNS_11ShadowFrameE", "libart.so"), {
        //     onEnter: function (args) {
        //         const inst: ArtInstruction = new ArtInstruction(args[0])
        //         const shadow_frame: ShadowFrame = new ShadowFrame(args[1])
        //         if (UnUsedInstruction.listenerMap.has(inst.opcode) && UnUsedInstruction.listenerMap.get(inst.opcode).length > 0) {
        //             UnUsedInstruction.listenerMap.get(inst.opcode).forEach(listener => {
        //                 listener(inst, shadow_frame)
        //             })
        //         } else {
        //             shadow_frame.printBackTraceWithSmali()
        //             LOGD(`UnexpectedOpcode ${inst.toString()} ${shadow_frame.toString()}`)
        //             ptr(0x7375846512).writeU32(0x0a02)
        //             const last = shadow_frame.link
        //             args[1] = last.handle
        //         }
        //     }
        // })

        const sym_addr: NativePointer = getSym("_ZN3art11interpreter16UnexpectedOpcodeEPKNS_11InstructionERKNS_11ShadowFrameE", "libart.so")
        const src_function = new NativeFunction(sym_addr, 'pointer', ['pointer', 'pointer'])
        R(sym_addr, new NativeCallback((inst_: NativePointer, shadow_frame_: NativePointer) => {
            let inst = new ArtInstruction(inst_)
            let shadow_frame = new ShadowFrame(shadow_frame_)
            LOGD(`UnexpectedOpcode ${inst.toString()} ${shadow_frame.toString()}`)
            return
            if (UnUsedInstructionManager.listenerMap.has(inst.opcode) && UnUsedInstructionManager.listenerMap.get(inst.opcode).length > 0) {
                UnUsedInstructionManager.listenerMap.get(inst.opcode).forEach(listener => {
                    listener(inst, shadow_frame)
                })
            } else {
                shadow_frame.printBackTraceWithSmali()
                UnUsedInstructionManager.mapModify.has(inst_) && inst_.writeByteArray(UnUsedInstructionManager.mapModify.get(inst_))
                shadow_frame.SetDexPC(shadow_frame.GetDexPC())
            }
        }, 'pointer', ['pointer', 'pointer']))
    }

    private static mapModify: Map<NativePointer, ArrayBuffer> = new Map()

    public static ModSmaliInstruction(methodPath: string = "com.unity3d.player.UnityPlayer.UnitySendMessage", offset: number = 0x42) {
        const CurrentMethod: ArtMethod = pathToArtMethod(methodPath)
        const dexfile: DexFile = CurrentMethod.GetDexFile()
        if (dexfile.is_compact_dex) throw new Error("not support compact dex")
        const dexInstructions: CodeItemInstructionAccessor = CurrentMethod.DexInstructions()
        const ins_ptr_patch_start: NativePointer = dexInstructions.CodeItem.insns_start.add(offset)
        const ins_ptr_patch_len = new ArtInstruction(ins_ptr_patch_start).SizeInCodeUnits
        LOGD(`ins_ptr_patch_start ${ins_ptr_patch_start} ins_ptr_patch_len ${ins_ptr_patch_len}`)
        const ins_arr: ArrayBuffer = ins_ptr_patch_start.readByteArray(ins_ptr_patch_len)
        UnUsedInstructionManager.mapModify.set(ins_ptr_patch_start, ins_arr)
        if (dexfile.IsReadOnly()) dexfile.EnableWrite()
        ins_ptr_patch_start.writeU32(UnUsedInstructions.UNUSED_3E)
        if (ins_ptr_patch_len > 0x1) {
            for (let iterP = ins_ptr_patch_start.add(0x1); iterP < ins_ptr_patch_start.add(ins_ptr_patch_len); iterP = iterP.add(0x1)) {
                iterP.writeU8(0x0)
            }
        }
    }

    private static newClass(): Java.Wrapper {
        const rewardClass = Java.registerClass({
            name: "com.Test.CallbackClass",
            superClass: Java.use("java.lang.Object"),
            implements: undefined,
            methods: {
                ['OnCalled']: {
                    returnType: 'void',
                    argumentTypes: ['boolean'],
                    implementation: function (z: boolean) {
                        LOGW(`called CallbackClass -> OnCalled ${z}`)
                    }
                }
            }
        })
        return rewardClass
    }

    public static test() {
        return UnUsedInstructionManager.newClass().OnCalled.handle
    }

}

setImmediate(() => { UnUsedInstructionManager.catchUnexpectedOpcode() })

Reflect.set(globalThis, "UnUsedInstructionManager", UnUsedInstructionManager)

declare global {
    var ModSmaliInstruction: (methodPath: string, offset: number) => void
    var test: () => void
    var testCallSendMessage
}

globalThis.ModSmaliInstruction = UnUsedInstructionManager.ModSmaliInstruction
globalThis.test = () => { Java.perform(() => { LOGD(UnUsedInstructionManager.test()) }) }
globalThis.testCallSendMessage = () => {
    Java.perform(() => {
        var JavaString = Java.use("java.lang.String")
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"))
    })
}