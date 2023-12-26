
import { ArtModifiers } from '../tools/modifiers'
import { parseInstructionsAt } from './machine-code'

const jsizeSize = 4
const pointerSize = Process.pointerSize

const kAccPublic = 0x0001
const kAccStatic = 0x0008
const kAccFinal = 0x0010
const kAccNative = 0x0100
const kAccFastNative = 0x00080000
const kAccCriticalNative = 0x00200000
const kAccFastInterpreterToInterpreterInvoke = 0x40000000
const kAccSkipAccessChecks = 0x00080000
const kAccSingleImplementation = 0x08000000
const kAccNterpEntryPointFastPathFlag = 0x00100000
const kAccNterpInvokeFastPathFlag = 0x00200000
const kAccPublicApi = 0x10000000
const kAccXposedHookedMethod = 0x10000000

const kPointer = 0x0

const STD_STRING_SIZE = 3 * pointerSize
const STD_VECTOR_SIZE = 3 * pointerSize

let systemPropertyGet = null
const PROP_VALUE_MAX = 92

const nativeFunctionOptions: NativeFunctionOptions = {
    exceptions: 'propagate'
}

function getAndroidSystemProperty(name: string) {
    if (systemPropertyGet === null) {
        systemPropertyGet = new NativeFunction(Module.getExportByName('libc.so', '__system_property_get'), 'int', ['pointer', 'pointer'], nativeFunctionOptions)
    }
    const buf = Memory.alloc(PROP_VALUE_MAX)
    systemPropertyGet(Memory.allocUtf8String(name), buf)
    return buf.readUtf8String()
}

function getAndroidApiLevel() {
    return parseInt(getAndroidSystemProperty('ro.build.version.sdk'), 10)
}

function getAndroidCodename() {
    return getAndroidSystemProperty('ro.build.version.codename')
}

let cachedArtClassLinkerSpec = null
function tryGetArtClassLinkerSpec(runtime, runtimeSpec) {
    if (cachedArtClassLinkerSpec !== null) {
        return cachedArtClassLinkerSpec
    }

    /*
     * On Android 5.x:
     *
     * class ClassLinker {
     * ...
     * InternTable* intern_table_;                          <-- We find this then calculate our way forwards
     * const void* portable_resolution_trampoline_;
     * const void* quick_resolution_trampoline_;
     * const void* portable_imt_conflict_trampoline_;
     * const void* quick_imt_conflict_trampoline_;
     * const void* quick_generic_jni_trampoline_;           <-- ...to this
     * const void* quick_to_interpreter_bridge_trampoline_;
     * ...
     * }
     *
     * On Android 6.x and above:
     *
     * class ClassLinker {
     * ...
     * InternTable* intern_table_;                          <-- We find this then calculate our way forwards
     * const void* quick_resolution_trampoline_;
     * const void* quick_imt_conflict_trampoline_;
     * const void* quick_generic_jni_trampoline_;           <-- ...to this
     * const void* quick_to_interpreter_bridge_trampoline_;
     * ...
     * }
     */

    const { classLinker: classLinkerOffset, internTable: internTableOffset } = runtimeSpec.offset
    const classLinker = runtime.add(classLinkerOffset).readPointer()
    const internTable = runtime.add(internTableOffset).readPointer()

    const startOffset = (pointerSize === 4) ? 100 : 200
    const endOffset = startOffset + (100 * pointerSize)

    const apiLevel = getAndroidApiLevel()

    let spec = null

    for (let offset = startOffset; offset !== endOffset; offset += pointerSize) {
        const value = classLinker.add(offset).readPointer()
        if (value.equals(internTable)) {
            let delta
            if (apiLevel >= 30 || getAndroidCodename() === 'R') {
                delta = 6
            } else if (apiLevel >= 29) {
                delta = 4
            } else if (apiLevel >= 23) {
                delta = 3
            } else {
                delta = 5
            }

            const quickGenericJniTrampolineOffset = offset + (delta * pointerSize)

            let quickResolutionTrampolineOffset
            if (apiLevel >= 23) {
                quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - (2 * pointerSize)
            } else {
                quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - (3 * pointerSize)
            }

            spec = {
                offset: {
                    quickResolutionTrampoline: quickResolutionTrampolineOffset,
                    quickImtConflictTrampoline: quickGenericJniTrampolineOffset - pointerSize,
                    quickGenericJniTrampoline: quickGenericJniTrampolineOffset,
                    quickToInterpreterBridgeTrampoline: quickGenericJniTrampolineOffset + pointerSize
                }
            }

            break
        }
    }

    if (spec !== null) {
        cachedArtClassLinkerSpec = spec
    }

    return spec
}

function parsex86InstrumentationOffset(insn) {
    if (insn.mnemonic !== 'lea') {
        return null
    }
    const offset = insn.operands[1].value.disp
    if (offset < 0x100 || offset > 0x400) {
        return null
    }
    return offset
}

function parseArmInstrumentationOffset(insn) {
    if (insn.mnemonic !== 'add.w') {
        return null
    }
    const ops = insn.operands
    if (ops.length !== 3) {
        return null
    }
    const op2 = ops[2]
    if (op2.type !== 'imm') {
        return null
    }
    return op2.value
}

function parseArm64InstrumentationOffset(insn) {
    if (insn.mnemonic !== 'add') {
        return null
    }
    const ops = insn.operands
    if (ops.length !== 3) {
        return null
    }
    if (ops[0].value === 'sp' || ops[1].value === 'sp') {
        return null
    }
    const op2 = ops[2]
    if (op2.type !== 'imm') {
        return null
    }
    const offset = op2.value.valueOf()
    if (offset < 0x100 || offset > 0x400) {
        return null
    }
    return offset
}

const instrumentationOffsetParsers = {
    ia32: parsex86InstrumentationOffset,
    x64: parsex86InstrumentationOffset,
    arm: parseArmInstrumentationOffset,
    arm64: parseArm64InstrumentationOffset
}

function tryDetectInstrumentationOffset(api) {
    const impl = api['art::Runtime::DeoptimizeBootImage']
    if (impl === undefined) {
        return null
    }
    return parseInstructionsAt(impl, instrumentationOffsetParsers[Process.arch], { limit: 30 })
}

function getArtRuntimeSpec(api) {
    /*
     * class Runtime {
     * ...
     * gc::Heap* heap_;                <-- we need to find this
     * std::unique_ptr<ArenaPool> jit_arena_pool_;     <----- API level >= 24
     * std::unique_ptr<ArenaPool> arena_pool_;             __
     * std::unique_ptr<ArenaPool> low_4gb_arena_pool_; <--|__ API level >= 23
     * std::unique_ptr<LinearAlloc> linear_alloc_;         \_
     * size_t max_spins_before_thin_lock_inflation_;
     * MonitorList* monitor_list_;
     * MonitorPool* monitor_pool_;
     * ThreadList* thread_list_;        <--- and these
     * InternTable* intern_table_;      <--/
     * ClassLinker* class_linker_;      <-/
     * SignalCatcher* signal_catcher_;
     * SmallIrtAllocator* small_irt_allocator_; <------------ API level >= 33 or Android Tiramisu Developer Preview
     * std::unique_ptr<jni::JniIdManager> jni_id_manager_; <- API level >= 30 or Android R Developer Preview
     * bool use_tombstoned_traces_;     <-------------------- API level 27/28
     * std::string stack_trace_file_;   <-------------------- API level <= 28
     * JavaVMExt* java_vm_;             <-- so we find this then calculate our way backwards
     * ...
     * }
     */

    const vm = api.vm
    const runtime = api.artRuntime

    const startOffset = (pointerSize === 4) ? 200 : 384
    const endOffset = startOffset + (100 * pointerSize)

    const apiLevel = getAndroidApiLevel()
    const codename = getAndroidCodename()

    let spec = null

    for (let offset = startOffset; offset !== endOffset; offset += pointerSize) {
        const value = runtime.add(offset).readPointer()
        if (value.equals(vm)) {
            let classLinkerOffsets
            let jniIdManagerOffset = null
            if (apiLevel >= 33 || codename === 'Tiramisu') {
                classLinkerOffsets = [offset - (4 * pointerSize)]
                jniIdManagerOffset = offset - pointerSize
            } else if (apiLevel >= 30 || codename === 'R') {
                classLinkerOffsets = [offset - (3 * pointerSize), offset - (4 * pointerSize)]
                jniIdManagerOffset = offset - pointerSize
            } else if (apiLevel >= 29) {
                classLinkerOffsets = [offset - (2 * pointerSize)]
            } else if (apiLevel >= 27) {
                classLinkerOffsets = [offset - STD_STRING_SIZE - (3 * pointerSize)]
            } else {
                classLinkerOffsets = [offset - STD_STRING_SIZE - (2 * pointerSize)]
            }

            for (const classLinkerOffset of classLinkerOffsets) {
                const internTableOffset = classLinkerOffset - pointerSize
                const threadListOffset = internTableOffset - pointerSize

                let heapOffset
                if (apiLevel >= 24) {
                    heapOffset = threadListOffset - (8 * pointerSize)
                } else if (apiLevel >= 23) {
                    heapOffset = threadListOffset - (7 * pointerSize)
                } else {
                    heapOffset = threadListOffset - (4 * pointerSize)
                }

                const candidate = {
                    offset: {
                        heap: heapOffset,
                        threadList: threadListOffset,
                        internTable: internTableOffset,
                        classLinker: classLinkerOffset,
                        jniIdManager: jniIdManagerOffset
                    }
                }
                if (tryGetArtClassLinkerSpec(runtime, candidate) !== null) {
                    spec = candidate
                    break
                }
            }

            break
        }
    }

    if (spec === null) {
        throw new Error('Unable to determine Runtime field offsets')
    }

    spec.offset.instrumentation = tryDetectInstrumentationOffset(api)
    spec.offset.jniIdsIndirection = tryDetectJniIdsIndirectionOffset()

    return spec
}

function parsex86JniIdsIndirectionOffset(insn) {
    if (insn.mnemonic === 'cmp') {
        return insn.operands[0].value.disp
    }

    return null
}

function parseArmJniIdsIndirectionOffset(insn) {
    if (insn.mnemonic === 'ldr.w') {
        return insn.operands[1].value.disp
    }

    return null
}

function parseArm64JniIdsIndirectionOffset(insn, prevInsn) {
    if (prevInsn === null) {
        return null
    }

    const { mnemonic } = insn
    const { mnemonic: prevMnemonic } = prevInsn

    if ((mnemonic === 'cmp' && prevMnemonic === 'ldr') || (mnemonic === 'bl' && prevMnemonic === 'str')) {
        return prevInsn.operands[1].value.disp
    }

    return null
}

const jniIdsIndirectionOffsetParsers = {
    ia32: parsex86JniIdsIndirectionOffset,
    x64: parsex86JniIdsIndirectionOffset,
    arm: parseArmJniIdsIndirectionOffset,
    arm64: parseArm64JniIdsIndirectionOffset
}

function tryDetectJniIdsIndirectionOffset() {
    const impl = Module.findExportByName('libart.so', '_ZN3art7Runtime12SetJniIdTypeENS_9JniIdTypeE')
    if (impl === null) {
        return null
    }

    const offset = parseInstructionsAt(impl, jniIdsIndirectionOffsetParsers[Process.arch], { limit: 20 })
    if (offset === null) {
        throw new Error('Unable to determine Runtime.jni_ids_indirection_ offset')
    }

    return offset
}

function unwrapMethodId(methodId) {
    const api = (Java as any).api

    const runtimeOffset = getArtRuntimeSpec(api).offset
    const jniIdManagerOffset = runtimeOffset.jniIdManager
    const jniIdsIndirectionOffset = runtimeOffset.jniIdsIndirection

    if (jniIdManagerOffset !== null && jniIdsIndirectionOffset !== null) {
        const runtime = api.artRuntime

        const jniIdsIndirection = runtime.add(jniIdsIndirectionOffset).readInt()

        if (jniIdsIndirection !== kPointer) {
            const jniIdManager = runtime.add(jniIdManagerOffset).readPointer()
            return api['art::jni::JniIdManager::DecodeMethodId'](jniIdManager, methodId)
        }
    }

    return methodId
}

export interface ArtMethodSpec {
    size: number
    offset: {
        jniCode: number
        quickCode: number
        accessFlags: number
        interpreterCode?: number
    }
}

export interface ArtFieldSpec {
    // GcRoot<mirror::Class> declaring_class_;
    declaringClass: NativePointer
    // uint32_t access_flags_;
    accessFlags: number
    // uint32_t field_dex_idx_;
    fieldDexIdx: number
    // uint32_t offset_;
    offset: number
}

export function getArtMethodSpec(): ArtMethodSpec {

    let spec
    Java.perform(() => {

        const api = (Java as any).api
        const env = Java.vm.getEnv()

        const process = env.findClass('android/os/Process')
        const getElapsedCpuTime = unwrapMethodId(env.getStaticMethodId(process, 'getElapsedCpuTime', '()J'))
        env.deleteLocalRef(process)

        const runtimeModule = Process.getModuleByName('libandroid_runtime.so')
        const runtimeStart = runtimeModule.base
        const runtimeEnd = runtimeStart.add(runtimeModule.size)

        const apiLevel = getAndroidApiLevel()

        const entrypointFieldSize = (apiLevel <= 21) ? 8 : Process.pointerSize

        const expectedAccessFlags = kAccPublic | kAccStatic | kAccFinal | kAccNative
        const relevantAccessFlagsMask = ~(kAccFastInterpreterToInterpreterInvoke | kAccPublicApi | kAccNterpInvokeFastPathFlag) >>> 0

        let jniCodeOffset: number = null
        let accessFlagsOffset: number = null
        let remaining = 2
        for (let offset = 0; offset !== 64 && remaining !== 0; offset += 4) {
            const field = getElapsedCpuTime.add(offset)

            if (jniCodeOffset === null) {
                const address = field.readPointer()
                if (address.compare(runtimeStart) >= 0 && address.compare(runtimeEnd) < 0) {
                    jniCodeOffset = offset
                    remaining--
                }
            }

            if (accessFlagsOffset === null) {
                const flags = field.readU32()
                if ((flags & relevantAccessFlagsMask) === expectedAccessFlags) {
                    accessFlagsOffset = offset
                    remaining--
                }
            }
        }

        if (remaining !== 0) {
            throw new Error('Unable to determine ArtMethod field offsets')
        }

        const quickCodeOffset: number = jniCodeOffset + entrypointFieldSize

        const size = (apiLevel <= 21) ? (quickCodeOffset + 32) : (quickCodeOffset + Process.pointerSize)

        spec = {
            size,
            offset: {
                jniCode: jniCodeOffset,
                quickCode: quickCodeOffset,
                accessFlags: accessFlagsOffset
            }
        }

        if ('artInterpreterToCompiledCodeBridge' in api) {
            spec.offset.interpreterCode = jniCodeOffset - entrypointFieldSize
        }

    })

    return spec
}

globalThis.getArtFieldSpec = (handle: NativePointer) => {
    return {
        declaringClass: handle.add(0).readPointer(),
        accessFlags: handle.add(pointerSize).readU32(),
        fieldDexIdx: handle.add(pointerSize + 0x4).readU32(),
        offset: handle.add(pointerSize + 0x8).readU32(),
    }
}

declare global {
    var getArtMethodSpec: () => ArtMethodSpec
    var getArtFieldSpec: (handle: NativePointer) => ArtFieldSpec
    var getAndroidSystemProperty: (name: string) => string
    var getAndroidApiLevel: () => number
    var getAndroidCodename: () => string
}

globalThis.getArtMethodSpec = getArtMethodSpec
globalThis.getAndroidSystemProperty = getAndroidSystemProperty
globalThis.getAndroidApiLevel = getAndroidApiLevel
globalThis.getAndroidCodename = getAndroidCodename