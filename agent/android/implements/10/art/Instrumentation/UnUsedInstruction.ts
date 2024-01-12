import { JSHandleNotImpl } from "../../../../JSHandle"
import { getSym } from "../../../../Utils/SymHelper"
import { ArtInstruction } from "../Instruction"
import { ShadowFrame } from "../ShadowFrame"
import { DexFile } from "../dexfile/DexFile"

enum UnUsedInstructions {
    UNUSED_3E = 0x3E,
    UNUSED_3F = 0x3F,
    UNUSED_40 = 0x40,
    UNUSED_41 = 0x41,
    UNUSED_42 = 0x42,
    UNUSED_43 = 0x43,
    UNUSED_79 = 0x79,
    UNUSED_7A = 0x7A,
    UNUSED_F3 = 0xF3,
    UNUSED_F4 = 0xF4,
    UNUSED_F5 = 0xF5,
    UNUSED_F6 = 0xF6,
    UNUSED_F7 = 0xF7,
    UNUSED_F8 = 0xF8,
    UNUSED_F9 = 0xF9,
}

export class UnUsedInstruction extends JSHandleNotImpl {

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
        Interceptor.replace(sym_addr, new NativeCallback((inst_: NativePointer, shadow_frame_: NativePointer) => {
            let inst = new ArtInstruction(inst_)
            let shadow_frame = new ShadowFrame(shadow_frame_)
            if (UnUsedInstruction.listenerMap.has(inst.opcode) && UnUsedInstruction.listenerMap.get(inst.opcode).length > 0) {
                UnUsedInstruction.listenerMap.get(inst.opcode).forEach(listener => {
                    listener(inst, shadow_frame)
                })
            } else {
                shadow_frame.printBackTraceWithSmali()
                LOGD(`UnexpectedOpcode ${inst.toString()} ${shadow_frame.toString()}`)
                UnUsedInstruction.lastInsPtr.writePointer(UnUsedInstruction.lastInsValue)
                // const last = shadow_frame.link
                UnUsedInstruction.lastInsPtr.writePointer(UnUsedInstruction.lastInsValue)
            }
        }, 'pointer', ['pointer', 'pointer']))
    }

    static lastInsPtr: NativePointer = NULL
    static lastInsValue: NativePointer = NULL

    public static ModSmaliInstruction(ptr: NativePointer, dexfile: DexFile) {
        if (dexfile.IsReadOnly()) dexfile.EnableWrite()
        UnUsedInstruction.lastInsValue = ptr.readPointer()
        UnUsedInstruction.lastInsPtr = ptr
        ptr.writeU32(0x3E)
    }

    private static newClass(): Java.Wrapper {
        const rewardClass = Java.registerClass({
            name: "com.Test.CallbackClass",
            superClass: Java.use("java.lang.Object"),
            implements: undefined,
            methods: {
                ['onReward']: {
                    returnType: 'void',
                    argumentTypes: ['boolean'],
                    implementation: function (z: boolean) {
                        LOGW(`called CallbackClass -> onReward ${z}`)
                    }
                }
            }
        })
        return rewardClass
    }

    public static test() {
        return UnUsedInstruction.newClass().onReward.handle
    }

}

setImmediate(() => { UnUsedInstruction.catchUnexpectedOpcode() })


declare global {
    var ModSmaliInstruction: (ptr: NativePointer, dexfile: DexFile) => void
}

// ModSmaliInstruction(ptr(0x73757b9534), pathToArtMethod("com.bytedance.applog.util.i.a").GetDexFile())
globalThis.ModSmaliInstruction = UnUsedInstruction.ModSmaliInstruction
globalThis.test = () => { Java.perform(() => { LOGD(UnUsedInstruction.test()) }) }