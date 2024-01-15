import { InstrumentationEvent, InstrumentationListenerJsProxImpl } from "./InstrumentationListener"
import { CodeItemInstructionAccessor } from "../dexfile/CodeItemInstructionAccessor"
import { StandardDexFile_CodeItem } from "../dexfile/StandardDexFile"
import { CompactDexFile_CodeItem } from "../dexfile/CompactDexFile"
import { DexItemStruct } from "../dexfile/DexFileStructs"
import { interpreter } from "../interpreter/interpreter"
import { Instrumentation } from "./Instrumentation"
import { ArtInstruction } from "../Instruction"
import { ArtMethod } from "../mirror/ArtMethod"
import { ShadowFrame } from "../ShadowFrame"
import { SmaliWriter } from "./SmaliWriter"
import { ArtThread } from "../Thread"
import { assert } from "console"

type InputArtMethod = ArtMethod | NativePointer | number | string

export class SmaliInlineManager {

    static recoverMap: Map<ArtMethod, { src: NativePointer, new: NativePointer }> = new Map()

    public static enable() {
        SmaliInlineManager.handleException()
    }

    private static convertToArtMethod(method: InputArtMethod): ArtMethod {
        if (method instanceof NativePointer) method = new ArtMethod(method)
        if (typeof method == 'number') method = new ArtMethod(ptr(method))
        if (typeof method == 'string') method = pathToArtMethod(method)
        assert(method instanceof ArtMethod, "method must be ArtMethod")
        return method
    }

    public static traceSingleMethod(method: InputArtMethod) {
        method = SmaliInlineManager.convertToArtMethod(method)
        if (SmaliInlineManager.recoverMap.has(method)) throw new Error("method already traced")
        const newSmali = SmaliInlineManager.Impl_CP(method)
        SmaliInlineManager.recoverMap.set(method, { src: method.DexInstructions().CodeItem.insns_start, new: newSmali.newStart })
        method.SetCodeItem(newSmali.newStart)
        method.DexInstructions().CodeItem.insns_size_in_code_units = newSmali.insnsSize
    }

    public static restoreSingleMethod(method: InputArtMethod) {
        method = SmaliInlineManager.convertToArtMethod(method)
        if (!SmaliInlineManager.recoverMap.has(method)) return
        const { src, new: _newStart } = SmaliInlineManager.recoverMap.get(method)!
        method.SetCodeItem(src)
    }

    // This implementation has a limitation in that it is not effective when the dex (cdex) cannot be modified permissions (read/write) by mprotect.
    // inline way to modify and save smali code
    private static Impl_Inline() {

    }

    // cp smali to new memory and reset dexfile codeitem entrypoint
    private static Impl_CP(method: InputArtMethod): { newStart: NativePointer, insnsMap: Map<NativePointer, NativePointer>, insnsSize: number } {
        method = SmaliInlineManager.convertToArtMethod(method)
        const st = method.GetCodeItemPack()
        const allocSize: number = st.headerSize + st.insnsSize * 2
        var new_smali_start: NativePointer = Memory.alloc(allocSize)
        Memory.copy(new_smali_start, st.headerStart, st.headerSize)
        const sw = new SmaliWriter(new_smali_start.add(st.headerSize))
        sw.putNop()
        method.forEachSmali((instruction: ArtInstruction, _codeItem: DexItemStruct) => {
            sw.writeInsns(instruction)
            sw.putNop()
        })
        sw.flush()

        return { newStart: new_smali_start, insnsMap: sw.insnsMap, insnsSize: sw.insnsSize / 2 }
    }

    private static handleException() {

        // there's 2 way to impl
        // 1. use Instrumentation listener (virtual classs impl)
        // class method_listeners extends InstrumentationListenerJsProxImpl {
        //     MethodEntered(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number): void {
        //         LOGD(`method_listeners -> MethodEntered: ${method.PrettyMethod(false)}`)
        //     }
        // }
        // Instrumentation.AddListener(new method_listeners(), InstrumentationEvent.kMethodEntered)

        // 2. hook target method and catch exception
        interpreter.addMoveToExceptionHandleCalledListener((ret: NativePointerValue, thread: ArtThread, shadowFrame: ShadowFrame, instrumentation: NativePointer) => {
            // Exceptions not handled by the original function
            if (ret == NULL) {
                LOGE(`MoveToExceptionHandleCalledListener -> ${shadowFrame.toString()}`)
            }
            return ret
        })

    }

}

setImmediate(() => { SmaliInlineManager.enable() })

Reflect.set(globalThis, "SmaliInlineManager", SmaliInlineManager)