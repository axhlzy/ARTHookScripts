(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJavaMembersFromClass = void 0;
const ArtMethod_1 = require("../android/implements/10/art/mirror/ArtMethod");
const ArrayCurrentItems = [];
function getJavaMembersFromClass(className = "com.unity3d.player.UnityPlayer") {
    const ar_methods = [];
    const ar_fields = [];
    const ar_fields_name = [];
    Java.perform(() => {
        const clazz = Java.use(className);
        clazz.$ownMembers.forEach((name) => {
            try {
                if (Object.getOwnPropertyNames(clazz[name]).includes("_p")) {
                    const field = clazz[name];
                    ar_fields.push(field);
                    ar_fields_name.push(name);
                }
                else {
                    const method = clazz[name].overloads;
                    ar_methods.push(...method);
                }
            }
            catch (error) {
            }
        });
    });
    return { "methods": ar_methods, "fields": ar_fields, "fields_name": ar_fields_name };
}
exports.getJavaMembersFromClass = getJavaMembersFromClass;
globalThis.listJavaMethods = (className = "com.unity3d.player.UnityPlayer", showInfo = true) => {
    let countFields = 0;
    let countMethods = 0;
    if (typeof className === "number") {
        if (className >= ArrayCurrentItems.length) {
            throw new Error(`index out of range, current length is ${ArrayCurrentItems.length}`);
        }
        className = ArrayCurrentItems[className];
    }
    const members = getJavaMembersFromClass(className);
    LOGD(`\n\n${className}`);
    try {
        LOGD(`\nfields :`);
        members.fields.map((field, index) => {
            let result = "";
            let flag = "";
            let currentIndex = ++countFields;
            try {
                result = `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field.value)} | ${field.fieldReturnType}`;
            }
            catch (error) {
                result = `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field)}`;
            }
            return result;
        }).forEach(LOGD);
        newLine();
    }
    catch (e) {
        LOGE(e);
    }
    try {
        LOGD(`\nmethods :`);
        members.methods.forEach((method) => {
            const artMethod = new ArtMethod_1.ArtMethod(method.handle);
            LOGD(`\n\t[${++countMethods}] ${artMethod}`);
            if (showInfo)
                LOGZ(`\n\t\t${artMethod.getInfo()}`);
        });
        newLine();
    }
    catch (e) {
        LOGE(e);
    }
};
globalThis.enumClasses = () => {
    let countClasses = -1;
    newLine();
    ArrayCurrentItems.splice(0, ArrayCurrentItems.length);
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            ArrayCurrentItems.push(className);
            LOGD(`[${++countClasses}] ${className}`);
        },
        onComplete: function () {
            LOGZ(`\nTotal classes: ${countClasses + 1}\n`);
        }
    });
};
globalThis.findJavaClasses = (keyword, searchInstance = true) => {
    let countClasses = -1;
    newLine();
    ArrayCurrentItems.splice(0, ArrayCurrentItems.length);
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            if (className.includes(keyword)) {
                ArrayCurrentItems.push(className);
                LOGD(`[${++countClasses}] ${className}`);
                if (searchInstance) {
                    const instances = ChooseClasses(countClasses, true);
                    let instanceCount = -1;
                    if (instances != undefined && instances.length > 0) {
                        LOGZ(`\t[${++instanceCount}] ${instances[0]}}]`);
                    }
                }
            }
        },
        onComplete: function () {
            LOGZ(`\nTotal classes: ${countClasses + 1}\n`);
        }
    });
};
globalThis.ChooseClasses = (className, retArray = false) => {
    let classNameLocal;
    if (typeof className === "number") {
        if (className >= ArrayCurrentItems.length)
            throw new Error(`index out of range, current length is ${ArrayCurrentItems.length}`);
        classNameLocal = ArrayCurrentItems[className];
    }
    else {
        classNameLocal = className;
    }
    let countClasses = -1;
    let ret = [];
    Java.perform(() => {
        try {
            Java.choose(classNameLocal, {
                onMatch: function (instance) {
                    if (retArray) {
                        ret.push(instance);
                    }
                    else {
                        LOGD(`[${++countClasses}] ${instance}`);
                    }
                },
                onComplete: function () {
                    if (!retArray)
                        LOGZ(`\nTotal instance: ${countClasses + 1}\n`);
                }
            });
        }
        catch (error) {
        }
    });
    if (retArray)
        return ret;
};
},{"../android/implements/10/art/mirror/ArtMethod":18}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JavaUtil");
},{"./JavaUtil":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./mirror/include");
},{"./mirror/include":6}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeapReference = void 0;
const JSHandle_1 = require("../../../JSHandle");
class HeapReference extends JSHandle_1.JSHandle {
    lsthandle;
    _factory;
    constructor(factory, handle) {
        super(handle.readU32());
        this.lsthandle = handle;
        this._factory = factory;
    }
    get root() {
        return this._factory(this.handle);
    }
    toString() {
        return `HeapReference<(read32)${this.lsthandle} -> ${this.handle}>`;
    }
}
exports.HeapReference = HeapReference;
},{"../../../JSHandle":8}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./HeapReference");
require("./IArtMethod");
},{"./HeapReference":4,"./IArtMethod":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":3}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSHandle = void 0;
class JSHandle {
    handle;
    constructor(handle) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle;
    }
}
exports.JSHandle = JSHandle;
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtObject = void 0;
const JSHandle_1 = require("./JSHandle");
class ArtObject extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
}
exports.ArtObject = ArtObject;
},{"./JSHandle":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArtMethodSpec = void 0;
const machine_code_1 = require("./machine-code");
const jsizeSize = 4;
const pointerSize = Process.pointerSize;
const kAccPublic = 0x0001;
const kAccStatic = 0x0008;
const kAccFinal = 0x0010;
const kAccNative = 0x0100;
const kAccFastNative = 0x00080000;
const kAccCriticalNative = 0x00200000;
const kAccFastInterpreterToInterpreterInvoke = 0x40000000;
const kAccSkipAccessChecks = 0x00080000;
const kAccSingleImplementation = 0x08000000;
const kAccNterpEntryPointFastPathFlag = 0x00100000;
const kAccNterpInvokeFastPathFlag = 0x00200000;
const kAccPublicApi = 0x10000000;
const kAccXposedHookedMethod = 0x10000000;
const kPointer = 0x0;
const STD_STRING_SIZE = 3 * pointerSize;
const STD_VECTOR_SIZE = 3 * pointerSize;
let systemPropertyGet = null;
const PROP_VALUE_MAX = 92;
const nativeFunctionOptions = {
    exceptions: 'propagate'
};
function getAndroidSystemProperty(name) {
    if (systemPropertyGet === null) {
        systemPropertyGet = new NativeFunction(Module.getExportByName('libc.so', '__system_property_get'), 'int', ['pointer', 'pointer'], nativeFunctionOptions);
    }
    const buf = Memory.alloc(PROP_VALUE_MAX);
    systemPropertyGet(Memory.allocUtf8String(name), buf);
    return buf.readUtf8String();
}
function getAndroidApiLevel() {
    return parseInt(getAndroidSystemProperty('ro.build.version.sdk'), 10);
}
function getAndroidCodename() {
    return getAndroidSystemProperty('ro.build.version.codename');
}
let cachedArtClassLinkerSpec = null;
function tryGetArtClassLinkerSpec(runtime, runtimeSpec) {
    if (cachedArtClassLinkerSpec !== null) {
        return cachedArtClassLinkerSpec;
    }
    const { classLinker: classLinkerOffset, internTable: internTableOffset } = runtimeSpec.offset;
    const classLinker = runtime.add(classLinkerOffset).readPointer();
    const internTable = runtime.add(internTableOffset).readPointer();
    const startOffset = (pointerSize === 4) ? 100 : 200;
    const endOffset = startOffset + (100 * pointerSize);
    const apiLevel = getAndroidApiLevel();
    let spec = null;
    for (let offset = startOffset; offset !== endOffset; offset += pointerSize) {
        const value = classLinker.add(offset).readPointer();
        if (value.equals(internTable)) {
            let delta;
            if (apiLevel >= 30 || getAndroidCodename() === 'R') {
                delta = 6;
            }
            else if (apiLevel >= 29) {
                delta = 4;
            }
            else if (apiLevel >= 23) {
                delta = 3;
            }
            else {
                delta = 5;
            }
            const quickGenericJniTrampolineOffset = offset + (delta * pointerSize);
            let quickResolutionTrampolineOffset;
            if (apiLevel >= 23) {
                quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - (2 * pointerSize);
            }
            else {
                quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - (3 * pointerSize);
            }
            spec = {
                offset: {
                    quickResolutionTrampoline: quickResolutionTrampolineOffset,
                    quickImtConflictTrampoline: quickGenericJniTrampolineOffset - pointerSize,
                    quickGenericJniTrampoline: quickGenericJniTrampolineOffset,
                    quickToInterpreterBridgeTrampoline: quickGenericJniTrampolineOffset + pointerSize
                }
            };
            break;
        }
    }
    if (spec !== null) {
        cachedArtClassLinkerSpec = spec;
    }
    return spec;
}
function parsex86InstrumentationOffset(insn) {
    if (insn.mnemonic !== 'lea') {
        return null;
    }
    const offset = insn.operands[1].value.disp;
    if (offset < 0x100 || offset > 0x400) {
        return null;
    }
    return offset;
}
function parseArmInstrumentationOffset(insn) {
    if (insn.mnemonic !== 'add.w') {
        return null;
    }
    const ops = insn.operands;
    if (ops.length !== 3) {
        return null;
    }
    const op2 = ops[2];
    if (op2.type !== 'imm') {
        return null;
    }
    return op2.value;
}
function parseArm64InstrumentationOffset(insn) {
    if (insn.mnemonic !== 'add') {
        return null;
    }
    const ops = insn.operands;
    if (ops.length !== 3) {
        return null;
    }
    if (ops[0].value === 'sp' || ops[1].value === 'sp') {
        return null;
    }
    const op2 = ops[2];
    if (op2.type !== 'imm') {
        return null;
    }
    const offset = op2.value.valueOf();
    if (offset < 0x100 || offset > 0x400) {
        return null;
    }
    return offset;
}
const instrumentationOffsetParsers = {
    ia32: parsex86InstrumentationOffset,
    x64: parsex86InstrumentationOffset,
    arm: parseArmInstrumentationOffset,
    arm64: parseArm64InstrumentationOffset
};
function tryDetectInstrumentationOffset(api) {
    const impl = api['art::Runtime::DeoptimizeBootImage'];
    if (impl === undefined) {
        return null;
    }
    return (0, machine_code_1.parseInstructionsAt)(impl, instrumentationOffsetParsers[Process.arch], { limit: 30 });
}
function getArtRuntimeSpec(api) {
    const vm = api.vm;
    const runtime = api.artRuntime;
    const startOffset = (pointerSize === 4) ? 200 : 384;
    const endOffset = startOffset + (100 * pointerSize);
    const apiLevel = getAndroidApiLevel();
    const codename = getAndroidCodename();
    let spec = null;
    for (let offset = startOffset; offset !== endOffset; offset += pointerSize) {
        const value = runtime.add(offset).readPointer();
        if (value.equals(vm)) {
            let classLinkerOffsets;
            let jniIdManagerOffset = null;
            if (apiLevel >= 33 || codename === 'Tiramisu') {
                classLinkerOffsets = [offset - (4 * pointerSize)];
                jniIdManagerOffset = offset - pointerSize;
            }
            else if (apiLevel >= 30 || codename === 'R') {
                classLinkerOffsets = [offset - (3 * pointerSize), offset - (4 * pointerSize)];
                jniIdManagerOffset = offset - pointerSize;
            }
            else if (apiLevel >= 29) {
                classLinkerOffsets = [offset - (2 * pointerSize)];
            }
            else if (apiLevel >= 27) {
                classLinkerOffsets = [offset - STD_STRING_SIZE - (3 * pointerSize)];
            }
            else {
                classLinkerOffsets = [offset - STD_STRING_SIZE - (2 * pointerSize)];
            }
            for (const classLinkerOffset of classLinkerOffsets) {
                const internTableOffset = classLinkerOffset - pointerSize;
                const threadListOffset = internTableOffset - pointerSize;
                let heapOffset;
                if (apiLevel >= 24) {
                    heapOffset = threadListOffset - (8 * pointerSize);
                }
                else if (apiLevel >= 23) {
                    heapOffset = threadListOffset - (7 * pointerSize);
                }
                else {
                    heapOffset = threadListOffset - (4 * pointerSize);
                }
                const candidate = {
                    offset: {
                        heap: heapOffset,
                        threadList: threadListOffset,
                        internTable: internTableOffset,
                        classLinker: classLinkerOffset,
                        jniIdManager: jniIdManagerOffset
                    }
                };
                if (tryGetArtClassLinkerSpec(runtime, candidate) !== null) {
                    spec = candidate;
                    break;
                }
            }
            break;
        }
    }
    if (spec === null) {
        throw new Error('Unable to determine Runtime field offsets');
    }
    spec.offset.instrumentation = tryDetectInstrumentationOffset(api);
    spec.offset.jniIdsIndirection = tryDetectJniIdsIndirectionOffset();
    return spec;
}
function parsex86JniIdsIndirectionOffset(insn) {
    if (insn.mnemonic === 'cmp') {
        return insn.operands[0].value.disp;
    }
    return null;
}
function parseArmJniIdsIndirectionOffset(insn) {
    if (insn.mnemonic === 'ldr.w') {
        return insn.operands[1].value.disp;
    }
    return null;
}
function parseArm64JniIdsIndirectionOffset(insn, prevInsn) {
    if (prevInsn === null) {
        return null;
    }
    const { mnemonic } = insn;
    const { mnemonic: prevMnemonic } = prevInsn;
    if ((mnemonic === 'cmp' && prevMnemonic === 'ldr') || (mnemonic === 'bl' && prevMnemonic === 'str')) {
        return prevInsn.operands[1].value.disp;
    }
    return null;
}
const jniIdsIndirectionOffsetParsers = {
    ia32: parsex86JniIdsIndirectionOffset,
    x64: parsex86JniIdsIndirectionOffset,
    arm: parseArmJniIdsIndirectionOffset,
    arm64: parseArm64JniIdsIndirectionOffset
};
function tryDetectJniIdsIndirectionOffset() {
    const impl = Module.findExportByName('libart.so', '_ZN3art7Runtime12SetJniIdTypeENS_9JniIdTypeE');
    if (impl === null) {
        return null;
    }
    const offset = (0, machine_code_1.parseInstructionsAt)(impl, jniIdsIndirectionOffsetParsers[Process.arch], { limit: 20 });
    if (offset === null) {
        throw new Error('Unable to determine Runtime.jni_ids_indirection_ offset');
    }
    return offset;
}
function unwrapMethodId(methodId) {
    const api = Java.api;
    const runtimeOffset = getArtRuntimeSpec(api).offset;
    const jniIdManagerOffset = runtimeOffset.jniIdManager;
    const jniIdsIndirectionOffset = runtimeOffset.jniIdsIndirection;
    if (jniIdManagerOffset !== null && jniIdsIndirectionOffset !== null) {
        const runtime = api.artRuntime;
        const jniIdsIndirection = runtime.add(jniIdsIndirectionOffset).readInt();
        if (jniIdsIndirection !== kPointer) {
            const jniIdManager = runtime.add(jniIdManagerOffset).readPointer();
            return api['art::jni::JniIdManager::DecodeMethodId'](jniIdManager, methodId);
        }
    }
    return methodId;
}
function getArtMethodSpec() {
    let spec;
    Java.perform(() => {
        const api = Java.api;
        const env = Java.vm.getEnv();
        const process = env.findClass('android/os/Process');
        const getElapsedCpuTime = unwrapMethodId(env.getStaticMethodId(process, 'getElapsedCpuTime', '()J'));
        env.deleteLocalRef(process);
        const runtimeModule = Process.getModuleByName('libandroid_runtime.so');
        const runtimeStart = runtimeModule.base;
        const runtimeEnd = runtimeStart.add(runtimeModule.size);
        const apiLevel = getAndroidApiLevel();
        const entrypointFieldSize = (apiLevel <= 21) ? 8 : Process.pointerSize;
        const expectedAccessFlags = kAccPublic | kAccStatic | kAccFinal | kAccNative;
        const relevantAccessFlagsMask = ~(kAccFastInterpreterToInterpreterInvoke | kAccPublicApi | kAccNterpInvokeFastPathFlag) >>> 0;
        let jniCodeOffset = null;
        let accessFlagsOffset = null;
        let remaining = 2;
        for (let offset = 0; offset !== 64 && remaining !== 0; offset += 4) {
            const field = getElapsedCpuTime.add(offset);
            if (jniCodeOffset === null) {
                const address = field.readPointer();
                if (address.compare(runtimeStart) >= 0 && address.compare(runtimeEnd) < 0) {
                    jniCodeOffset = offset;
                    remaining--;
                }
            }
            if (accessFlagsOffset === null) {
                const flags = field.readU32();
                if ((flags & relevantAccessFlagsMask) === expectedAccessFlags) {
                    accessFlagsOffset = offset;
                    remaining--;
                }
            }
        }
        if (remaining !== 0) {
            throw new Error('Unable to determine ArtMethod field offsets');
        }
        const quickCodeOffset = jniCodeOffset + entrypointFieldSize;
        const size = (apiLevel <= 21) ? (quickCodeOffset + 32) : (quickCodeOffset + Process.pointerSize);
        spec = {
            size,
            offset: {
                jniCode: jniCodeOffset,
                quickCode: quickCodeOffset,
                accessFlags: accessFlagsOffset
            }
        };
        if ('artInterpreterToCompiledCodeBridge' in api) {
            spec.offset.interpreterCode = jniCodeOffset - entrypointFieldSize;
        }
    });
    return spec;
}
exports.getArtMethodSpec = getArtMethodSpec;
globalThis.getArtFieldSpec = (handle) => {
    return {
        declaringClass: handle.add(0).readPointer(),
        accessFlags: handle.add(pointerSize).readU32(),
        fieldDexIdx: handle.add(pointerSize + 0x4).readU32(),
        offset: handle.add(pointerSize + 0x8).readU32(),
    };
};
globalThis.getArtMethodSpec = getArtMethodSpec;
globalThis.getAndroidSystemProperty = getAndroidSystemProperty;
globalThis.getAndroidApiLevel = getAndroidApiLevel;
globalThis.getAndroidCodename = getAndroidCodename;
},{"./machine-code":27}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexFile = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
const ArtClass_1 = require("./mirror/ArtClass");
class DexFile extends JSHandle_1.JSHandle {
    static size_t_len = 32;
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `DexFile<${this.handle}> \n`;
        disp += `begin: ${this.begin} size: ${this.size} ( ${ptr(this.size)} ) | data_begin: ${this.data_begin} data_size: ${this.data_size} ( ${ptr(this.data_size)} ) `;
        return disp;
    }
    get begin() {
        return this.handle.readPointer();
    }
    get size() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 1 + DexFile.size_t_len * 0).readU32();
    }
    get data_begin() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 1 + DexFile.size_t_len * 1).readPointer();
    }
    get data_size() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 2 + DexFile.size_t_len).readU32();
    }
    get location() {
        try {
            return new StdString_1.StdString(this.handle.add(ArtClass_1.ArtClass.PointerSize * 2 + DexFile.size_t_len * 2).readPointer()).disposeToString();
        }
        catch (error) {
            return "...";
        }
    }
    get location_checksum() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 3 + DexFile.size_t_len * 2).readU32();
    }
    get header() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 3 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get string_ids() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 4 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get type_ids() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 5 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get field_ids() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 6 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get method_ids() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 7 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get proto_ids() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 8 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get class_defs() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 9 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get method_handles() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 10 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get num_method_handles() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 11 + DexFile.size_t_len * 2 + 32).readU32();
    }
    get call_site_ids() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 11 + DexFile.size_t_len * 3 + 32).readPointer();
    }
    get num_call_site_ids() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 12 + DexFile.size_t_len * 3 + 32).readU32();
    }
    get hiddenapi_class_data() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 12 + DexFile.size_t_len * 4 + 32).readPointer();
    }
    get oat_dex_file() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 13 + DexFile.size_t_len * 4 + 32).readPointer();
    }
    get container() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 14 + DexFile.size_t_len * 4 + 32).readPointer();
    }
    get is_compact_dex() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 13 + DexFile.size_t_len * 4 + 32).readU8() == 1;
    }
    get hiddenapi_domain() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize * 13 + DexFile.size_t_len * 4 + 32 + 8).readPointer();
    }
}
exports.DexFile = DexFile;
globalThis.DexFile = DexFile;
},{"../../../../tools/StdString":30,"../../../JSHandle":8,"./mirror/ArtClass":17}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcRoot = void 0;
const JSHandle_1 = require("../../../JSHandle");
class GcRoot extends JSHandle_1.JSHandle {
    lsthandle;
    _factory;
    constructor(factory, handle) {
        super(handle.readU32());
        this.lsthandle = handle;
        this._factory = factory;
    }
    get root() {
        return this._factory(this.handle);
    }
    toString() {
        return `GcRoot<(read32)${this.lsthandle} -> ${this.handle}>`;
    }
}
exports.GcRoot = GcRoot;
},{"../../../JSHandle":8}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtInstruction = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
class ArtInstruction extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return this.constructor.name;
    }
    static get kInstructionNames() {
        const kInstructionNames_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction17kInstructionNamesE');
        let arrary_ret = [];
        let loopAddaddress = kInstructionNames_ptr;
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer().readCString());
            loopAddaddress = loopAddaddress.add(Process.pointerSize);
        }
        return arrary_ret;
    }
    static get kInstructionDescriptors() {
        const kInstructionDescriptors_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction23kInstructionDescriptorsE');
        let arrary_ret = [];
        let loopAddaddress = kInstructionDescriptors_ptr;
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer());
            loopAddaddress = loopAddaddress.add(Process.pointerSize);
        }
        return arrary_ret;
    }
    dumpString(dexFile) {
        const DumpString_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE");
        const DumpString_func = new NativeFunction(DumpString_ptr, ["pointer"], ["pointer", "pointer"]);
        const result = DumpString_func(this.handle, dexFile.handle);
        return new StdString_1.StdString(result).disposeToString();
    }
    dumpHex(code_units) {
        const DumpHex_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction7DumpHexEm");
        const DumpHex_func = new NativeFunction(DumpHex_ptr, ["pointer"], ["pointer", "int"]);
        const result = DumpHex_func(this.handle, code_units);
        return new StdString_1.StdString(result).disposeToString();
    }
    dumpHexLE(instr_code_units) {
        const DumpHexLE_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction9DumpHexLEEm");
        const DumpHexLE_func = new NativeFunction(DumpHexLE_ptr, ["pointer"], ["pointer", "int"]);
        const result = DumpHexLE_func(this.handle, instr_code_units);
        return new StdString_1.StdString(result).disposeToString();
    }
    sizeInCodeUnitsComplexOpcode() {
        const SizeInCodeUnitsComplexOpcode_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv");
        const SizeInCodeUnitsComplexOpcode_func = new NativeFunction(SizeInCodeUnitsComplexOpcode_ptr, ["pointer"], ["pointer"]);
        return SizeInCodeUnitsComplexOpcode_func(this.handle);
    }
}
exports.ArtInstruction = ArtInstruction;
globalThis.ArtInstruction = ArtInstruction;
},{"../../../../tools/StdString":30,"../../../JSHandle":8}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OatQuickMethodHeader = void 0;
const JSHandle_1 = require("../../../JSHandle");
class OatQuickMethodHeader extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    get vmap_table_offset() {
        return this.handle.add(0).readU32();
    }
    get code_size() {
        return this.handle.add(4).readU32();
    }
    get code() {
        return this.handle.add(8).readPointer();
    }
    toString() {
        return `${this.handle} -> vmap_table_offset: ${this.vmap_table_offset} code_size: ${this.code_size} code: ${this.code}`;
    }
}
exports.OatQuickMethodHeader = OatQuickMethodHeader;
},{"../../../JSHandle":8}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjPtr = void 0;
const JSHandle_1 = require("../../../JSHandle");
class ObjPtr extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    get value() {
        return this.handle.readPointer();
    }
    toString() {
        return `${this.handle} -> ${this.value}`;
    }
}
exports.ObjPtr = ObjPtr;
},{"../../../JSHandle":8}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./DexFile");
require("./GcRoot");
require("./Instruction");
require("./OatQuickMethodHeader");
require("./ObjPtr");
require("./mirror/include");
},{"./DexFile":11,"./GcRoot":12,"./Instruction":13,"./OatQuickMethodHeader":14,"./ObjPtr":15,"./mirror/include":23}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtClass = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const StdString_1 = require("../../../../../tools/StdString");
const Object_1 = require("../../../../Object");
const ClassLoader_1 = require("./ClassLoader");
const ClassExt_1 = require("./ClassExt");
const DexCache_1 = require("./DexCache");
const IfTable_1 = require("./IfTable");
class ArtClass extends Object_1.ArtObject {
    static Arch = Process.arch;
    static PointerSize = Process.pointerSize;
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `ArtClass< ${this.handle} >`;
    }
    static HeapReferenceSize = Process.pointerSize;
    get class_loader() {
        return new HeapReference_1.HeapReference((handle) => new ClassLoader_1.ArtClassLoader(handle), this.handle.add(ArtClass.HeapReferenceSize * 0));
    }
    get component_type() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), this.handle.add(ArtClass.HeapReferenceSize * 1));
    }
    get dex_cache() {
        return new HeapReference_1.HeapReference((handle) => new DexCache_1.DexCache(handle), this.handle.add(ArtClass.HeapReferenceSize * 2));
    }
    get ext_data() {
        return new HeapReference_1.HeapReference((handle) => new ClassExt_1.ClassExt(handle), this.handle.add(ArtClass.HeapReferenceSize * 3));
    }
    get iftable() {
        return new HeapReference_1.HeapReference((handle) => new IfTable_1.IfTable(handle), this.handle.add(ArtClass.HeapReferenceSize * 4));
    }
    get name() {
        return new HeapReference_1.HeapReference((handle) => new StdString_1.StdString(handle), this.handle.add(ArtClass.HeapReferenceSize * 5));
    }
    get super_class() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), this.handle.add(ArtClass.HeapReferenceSize * 6));
    }
    get vtable() {
        return new HeapReference_1.HeapReference((handle) => new NativePointer(handle), this.handle.add(ArtClass.HeapReferenceSize * 7));
    }
    get ifields() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8).readU64().toNumber();
    }
    get methods() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8 + 64).readU64().toNumber();
    }
    get sfields() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8 + 64 * 2).readU64().toNumber();
    }
    get access_flags() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8 + 64 * 3).readU32();
    }
    get access_flags_string() {
        return PrettyAccessFlags(this.access_flags);
    }
    get class_flags() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8 + 64 * 3 + 32).readU32();
    }
    get class_size() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8 + 64 * 3 + 32 * 2).readU32();
    }
    get clinit_thread_id() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8 + 64 * 3 + 32 * 3).readS32();
    }
    get dex_class_def_idx() {
        return this.handle.add(ArtClass.HeapReferenceSize * 8 + 64 * 3 + 32 * 4).readS32();
    }
}
exports.ArtClass = ArtClass;
globalThis.ArtClass = ArtClass;
},{"../../../../../tools/StdString":30,"../../../../Interface/art/mirror/HeapReference":4,"../../../../Object":9,"./ClassExt":19,"./ClassLoader":20,"./DexCache":21,"./IfTable":22}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const StdString_1 = require("../../../../../tools/StdString");
const enum_1 = require("../../../../../tools/enum");
const JSHandle_1 = require("../../../../JSHandle");
const ArtClass_1 = require("./ArtClass");
const DexFile_1 = require("../DexFile");
const GcRoot_1 = require("../GcRoot");
const ObjPtr_1 = require("../ObjPtr");
class ArtMethod extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    get declaring_class() {
        return new GcRoot_1.GcRoot((handle) => new ArtClass_1.ArtClass(handle), this.handle);
    }
    get access_flags() {
        return this.handle.add(0x4).readU32();
    }
    get access_flags_string() {
        return ArtModifiers.PrettyAccessFlags(this.access_flags);
    }
    get dex_code_item_offset() {
        return this.handle.add(0x8).readU32();
    }
    get dex_method_index() {
        return this.handle.add(0xC).readU16();
    }
    get method_index() {
        return this.handle.add(0xC).readU16();
    }
    get hotness_count() {
        return this.handle.add(0x4 * 4 + 0x2).readU16();
    }
    get imt_index() {
        return this.handle.add(0x4 * 4 + 0x2).readU16();
    }
    get data() {
        return this.handle.add(0x4 * 5 + 0x2 * 2).readPointer();
    }
    get entry_point_from_quick_compiled_code() {
        return this.handle.add(0x4 * 5 + 0x2 * 2 + ArtClass_1.ArtClass.PointerSize).readPointer();
    }
    GetCodeItemOffset() {
        return this.dex_code_item_offset;
    }
    prettyMethod(withSignature = true) {
        const result = new StdString_1.StdString();
        Java.api['art::ArtMethod::PrettyMethod'](result, this.handle, withSignature ? 1 : 0);
        return result.disposeToString();
    }
    toString() {
        const PrettyJavaAccessFlagsStr = PrettyAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()));
        return `${this.handle} -> ${PrettyJavaAccessFlagsStr}${this.prettyMethod()}`;
    }
    toArray() {
        return {
            handle: this.handle,
            prettyMethod: this.prettyMethod()
        };
    }
    getInfo() {
        const accessFlags = ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32());
        const quickCode = this.handle.add(getArtMethodSpec().offset.quickCode).readPointer();
        const jniCode = this.handle.add(getArtMethodSpec().offset.jniCode).readPointer();
        const size = getArtMethodSpec().size;
        const debugInfo_jniCode = DebugSymbol.fromAddress(jniCode);
        let jniCodeStr = jniCode.isNull() ? "null" : `${jniCode} -> ${debugInfo_jniCode.name} @ ${debugInfo_jniCode.moduleName}`;
        const debugInfo_quickCode = DebugSymbol.fromAddress(quickCode);
        return `quickCode: ${quickCode} -> ${debugInfo_quickCode.name} @ ${debugInfo_quickCode.moduleName} | jniCode: ${jniCodeStr} | accessFlags: ${accessFlags} | size: ${ptr(size)}\n`;
    }
    GetObsoleteDexCache() {
        const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv");
        const GetObsoleteDexCacheFunc = new NativeFunction(GetObsoleteDexCacheAddr, 'pointer', ['pointer']);
        const ret = GetObsoleteDexCacheFunc(this.handle);
        if (ret.isNull())
            return null;
        return new ObjPtr_1.ObjPtr(ret).handle;
    }
    GetDexFile() {
        let access_flags = this.handle.add(0x4).readU32();
        if ((access_flags & ArtModifiers.kAccObsoleteMethod) != 0) {
            return new DexFile_1.DexFile(this.GetObsoleteDexCache());
        }
        else {
            return this.declaring_class.root.dex_cache.root.dex_file;
        }
    }
    HasSameNameAndSignature(other) {
        const HasSameNameAndSignature = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_");
        const HasSameNameAndSignatureFunc = new NativeFunction(HasSameNameAndSignature, 'bool', ['pointer', 'pointer']);
        const ret = HasSameNameAndSignatureFunc(this.handle, other.handle);
        return ret;
    }
    GetRuntimeMethodName() {
        const GetRuntimeMethodName = Module.findExportByName("libart.so", "_ZN3art9ArtMethod20GetRuntimeMethodNameEv");
        const GetRuntimeMethodNameFunc = new NativeFunction(GetRuntimeMethodName, 'pointer', ['pointer']);
        const ret = GetRuntimeMethodNameFunc(this.handle);
        return ret.readCString();
    }
    SetNotIntrinsic() {
        const SetNotIntrinsic = Module.findExportByName("libart.so", "_ZN3art9ArtMethod15SetNotIntrinsicEv");
        const SetNotIntrinsicFunc = new NativeFunction(SetNotIntrinsic, 'void', ['pointer']);
        SetNotIntrinsicFunc(this.handle);
    }
    CopyFrom(src) {
        const CopyFrom = Module.findExportByName("libart.so", "_ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE");
        const CopyFromFunc = new NativeFunction(CopyFrom, 'void', ['pointer', 'pointer', 'int']);
        CopyFromFunc(this.handle, src.handle, Process.pointerSize);
    }
    GetOatQuickMethodHeader(pc = 0) {
        const func_addr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm");
        const func = new NativeFunction(func_addr, 'pointer', ['pointer', 'uint64']);
        const ret = func(this.handle, pc);
        if (ret.isNull())
            return null;
        return new OatQuickMethodHeader_1.OatQuickMethodHeader(ret);
    }
    FindObsoleteDexClassDefIndex() {
        const FindObsoleteDexClassDefIndex = Module.findExportByName("libart.so", "_ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv");
        const FindObsoleteDexClassDefIndexFunc = new NativeFunction(FindObsoleteDexClassDefIndex, 'uint64', ['pointer']);
        return FindObsoleteDexClassDefIndexFunc(this.handle);
    }
    GetSingleImplementation() {
        const GetSingleImplementation = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE");
        const GetSingleImplementationFunc = new NativeFunction(GetSingleImplementation, 'pointer', ['pointer', 'int']);
        return GetSingleImplementationFunc(this.handle, Process.pointerSize);
    }
    FindOverriddenMethod() {
        const FindOverriddenMethod = Module.findExportByName("libart.so", "_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE");
        const FindOverriddenMethodFunc = new NativeFunction(FindOverriddenMethod, 'pointer', ['pointer', 'int']);
        return FindOverriddenMethodFunc(this.handle, Process.pointerSize);
    }
    IsOverridableByDefaultMethod() {
        const IsOverridableByDefaultMethod = Module.findExportByName("libart.so", "_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv");
        const IsOverridableByDefaultMethodFunc = new NativeFunction(IsOverridableByDefaultMethod, 'bool', ['pointer']);
        return IsOverridableByDefaultMethodFunc(this.handle);
    }
    GetQuickenedInfo(dex_pc = 0) {
        const GetQuickenedInfo = Module.findExportByName("libart.so", "_ZN3art9ArtMethod16GetQuickenedInfoEv");
        if (GetQuickenedInfo == null)
            return null;
        const GetQuickenedInfoFunc = new NativeFunction(GetQuickenedInfo, 'pointer', ['pointer', 'uint64']);
        return GetQuickenedInfoFunc(this.handle, dex_pc);
    }
    RegisterNative(native_method) {
        const RegisterNativeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod14RegisterNativeEPKv");
        const RegisterNativeFunc = new NativeFunction(RegisterNativeAddr, 'pointer', ['pointer', 'pointer']);
        LOGD(`RegisterNative: ${this.handle} -> ${native_method}`);
        return RegisterNativeFunc(this.handle, native_method);
    }
    RegisterNativeJS(native_method) {
        return this.RegisterNative(new NativeCallback(native_method, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']));
    }
    UnregisterNative() {
        const UnregisterNativeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod16UnregisterNativeEv");
        const UnregisterNativeFunc = new NativeFunction(UnregisterNativeAddr, 'void', ['pointer']);
        return UnregisterNativeFunc(this.handle);
    }
    static NumArgRegisters(shorty) {
        const NumArgRegistersAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod15NumArgRegistersEPKc");
        const NumArgRegistersFunc = new NativeFunction(NumArgRegistersAddr, 'size_t', ['pointer', 'pointer']);
        return NumArgRegistersFunc(Memory.allocUtf8String(shorty));
    }
    GetInvokeType() {
        const GetInvokeTypeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod13GetInvokeTypeEv");
        const GetInvokeTypeFunc = new NativeFunction(GetInvokeTypeAddr, 'int', ['pointer']);
        return enum_1.InvokeType.toString(GetInvokeTypeFunc(this.handle));
    }
}
exports.ArtMethod = ArtMethod;
globalThis.ArtMethod = ArtMethod;
},{"../../../../../tools/StdString":30,"../../../../../tools/enum":32,"../../../../JSHandle":8,"../DexFile":11,"../GcRoot":12,"../OatQuickMethodHeader":14,"../ObjPtr":15,"./ArtClass":17}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassExt = void 0;
const Object_1 = require("../../../../Object");
class ClassExt extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `ClassExt<${this.handle}>`;
    }
}
exports.ClassExt = ClassExt;
},{"../../../../Object":9}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtClassLoader = void 0;
const Object_1 = require("../../../../Object");
class ArtClassLoader extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `ClassLoader<${this.handle}>`;
    }
}
exports.ArtClassLoader = ArtClassLoader;
globalThis.ArtClassLoader = ArtClassLoader;
},{"../../../../Object":9}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexCache = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const StdString_1 = require("../../../../../tools/StdString");
const Object_1 = require("../../../../Object");
const DexFile_1 = require("../DexFile");
const ArtClass_1 = require("./ArtClass");
class DexCache extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `DexCache<${this.handle}>`;
        return disp;
    }
    get location() {
        return new HeapReference_1.HeapReference((handle) => new StdString_1.StdString(handle), this.handle.add(ArtClass_1.ArtClass.PointerSize * 0).readPointer());
    }
    get num_preresolved_strings() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize + 32).readU32();
    }
    get dex_file() {
        return new DexFile_1.DexFile(ptr(this.handle.add(ArtClass_1.ArtClass.PointerSize + 32).readU64().toString()));
    }
    get preresolved_strings() {
        return ptr(this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 1).readU64().toString());
    }
    get resolved_call_sites() {
        return ptr(this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 2).readU64().toString());
    }
    get resolved_fields() {
        return ptr(this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 3).readU64().toString());
    }
    get resolved_methods() {
        return ptr(this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 4).readU64().toString());
    }
    get resolved_types() {
        return ptr(this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 5).readU64().toString());
    }
    get strings() {
        return ptr(this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 6).readU64().toString());
    }
    get num_resolved_call_sites() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 7 + 32).readU32();
    }
    get num_resolved_fields() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 7 + 32 * 2).readU32();
    }
    get num_resolved_method_types() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 7 + 32 * 3).readU32();
    }
    get num_resolved_methods() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 7 + 32 * 4).readU32();
    }
    get num_resolved_types() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 7 + 32 * 5).readU32();
    }
    get num_strings() {
        return this.handle.add(ArtClass_1.ArtClass.PointerSize + 32 + 64 * 7 + 32 * 6).readU32();
    }
}
exports.DexCache = DexCache;
},{"../../../../../tools/StdString":30,"../../../../Interface/art/mirror/HeapReference":4,"../../../../Object":9,"../DexFile":11,"./ArtClass":17}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfTable = void 0;
const Object_1 = require("../../../../Object");
class IfTable extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `IfTable<${this.handle}>`;
    }
}
exports.IfTable = IfTable;
},{"../../../../Object":9}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":17,"./ArtMethod":18,"./ClassExt":19,"./ClassLoader":20,"./IfTable":22}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":16}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":24}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Object");
require("./JSHandle");
require("./android");
require("./machine-code");
require("./implements/include");
require("./Interface/include");
},{"./Interface/include":7,"./JSHandle":8,"./Object":9,"./android":10,"./implements/include":25,"./machine-code":27}],27:[function(require,module,exports){
function parseInstructionsAt(address, tryParse, { limit }) {
    let cursor = address;
    let prevInsn = null;
    for (let i = 0; i !== limit; i++) {
        const insn = Instruction.parse(cursor);
        const value = tryParse(insn, prevInsn);
        if (value !== null) {
            return value;
        }
        cursor = insn.next;
        prevInsn = insn;
    }
    return null;
}
module.exports = {
    parseInstructionsAt
};
},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":2,"./android/include":26,"./tools/include":33}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArtMethod_1 = require("./android/implements/10/art/mirror/ArtMethod");
require("./include");
globalThis.testArtMethod = () => {
    Java.perform(() => {
        let artMethod_0 = Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage.handle;
        let artMethod_1 = Java.use("com.unity3d.player.UnityPlayer").IsWindowTranslucent.handle;
        var JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"));
        let art_0 = new ArtMethod_1.ArtMethod(artMethod_0);
        let art_1 = new ArtMethod_1.ArtMethod(artMethod_1);
        LOGD(art_0.toString());
        LOGD(art_0.getInfo());
        LOGD(`GetInvokeType -> ${art_0.GetInvokeType()}`);
        LOGD(`GetRuntimeMethodName -> ${art_0.GetRuntimeMethodName()}`);
        LOGD(`dex_code_item_offset_ -> ${art_0.dex_code_item_offset} -> ${ptr(art_0.dex_code_item_offset)}`);
        LOGD(`dex_method_index -> ${ptr(art_0.dex_method_index)}`);
        LOGD(`GetRuntimeMethodName -> ${art_1.GetRuntimeMethodName()}`);
        LOGD(`HasSameNameAndSignature -> ${art_0.HasSameNameAndSignature(art_1)}`);
        LOGD(`access_flags_string -> ${art_0.access_flags_string}`);
        LOGD(`GetQuickenedInfo -> ${art_0.GetQuickenedInfo()}`);
        LOGD(`entry_point_from_quick_compiled_code -> ${art_0.entry_point_from_quick_compiled_code}`);
        newLine();
        LOGD(`GetDexFile -> ${art_0.GetDexFile()}`);
        LOGD(`GetDexFile -> ${art_0.GetDexFile().begin.add(art_0.dex_code_item_offset)}`);
    });
};
},{"./android/implements/10/art/mirror/ArtMethod":18,"./include":28}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdString = void 0;
class StdString {
    static STD_STRING_SIZE = 3 * Process.pointerSize;
    handle;
    constructor(mPtr = Memory.alloc(StdString.STD_STRING_SIZE)) {
        this.handle = mPtr;
    }
    dispose() {
        const [data, isTiny] = this._getData();
        if (!isTiny) {
            Java.api.$delete(data);
        }
    }
    disposeToString() {
        const result = this.toString();
        this.dispose();
        return result;
    }
    toString() {
        const data = this._getData()[0];
        return data.readUtf8String();
    }
    _getData() {
        const str = this.handle;
        const isTiny = (str.readU8() & 1) === 0;
        const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer();
        return [data, isTiny];
    }
}
exports.StdString = StdString;
},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
globalThis.clear = () => console.log('\x1Bc');
globalThis.cls = () => clear();
globalThis.seeHexA = (addr, length = 0x40, header = true, color) => {
    let localAddr = NULL;
    if (typeof addr == "number") {
        localAddr = ptr(addr);
    }
    else {
        localAddr = addr;
    }
    LOG(hexdump(localAddr, {
        length: length,
        header: header,
    }), color == undefined ? LogColor.WHITE : color);
};
},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvokeType = void 0;
class InvokeType {
    static kStatic = 0;
    static kDirect = 1;
    static kVirtual = 2;
    static kSuper = 3;
    static kInterface = 4;
    static kPolymorphic = 5;
    static kCustom = 6;
    static kMaxInvokeType = 6;
    static toString(type) {
        switch (type) {
            case InvokeType.kStatic:
                return "kStatic";
            case InvokeType.kDirect:
                return "kDirect";
            case InvokeType.kVirtual:
                return "kVirtual";
            case InvokeType.kSuper:
                return "kSuper";
            case InvokeType.kInterface:
                return "kInterface";
            case InvokeType.kPolymorphic:
                return "kPolymorphic";
            case InvokeType.kCustom:
                return "kCustom";
            case InvokeType.kMaxInvokeType:
                return "kMaxInvokeType";
            default:
                return "unknown";
        }
    }
}
exports.InvokeType = InvokeType;
},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
},{"./StdString":30,"./common":31,"./enum":32,"./logger":34,"./modifiers":35}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogColor = void 0;
var LogColor;
(function (LogColor) {
    LogColor[LogColor["WHITE"] = 0] = "WHITE";
    LogColor[LogColor["RED"] = 1] = "RED";
    LogColor[LogColor["YELLOW"] = 3] = "YELLOW";
    LogColor[LogColor["C31"] = 31] = "C31";
    LogColor[LogColor["C32"] = 32] = "C32";
    LogColor[LogColor["C33"] = 33] = "C33";
    LogColor[LogColor["C34"] = 34] = "C34";
    LogColor[LogColor["C35"] = 35] = "C35";
    LogColor[LogColor["C36"] = 36] = "C36";
    LogColor[LogColor["C41"] = 41] = "C41";
    LogColor[LogColor["C42"] = 42] = "C42";
    LogColor[LogColor["C43"] = 43] = "C43";
    LogColor[LogColor["C44"] = 44] = "C44";
    LogColor[LogColor["C45"] = 45] = "C45";
    LogColor[LogColor["C46"] = 46] = "C46";
    LogColor[LogColor["C90"] = 90] = "C90";
    LogColor[LogColor["C91"] = 91] = "C91";
    LogColor[LogColor["C92"] = 92] = "C92";
    LogColor[LogColor["C93"] = 93] = "C93";
    LogColor[LogColor["C94"] = 94] = "C94";
    LogColor[LogColor["C95"] = 95] = "C95";
    LogColor[LogColor["C96"] = 96] = "C96";
    LogColor[LogColor["C97"] = 97] = "C97";
    LogColor[LogColor["C100"] = 100] = "C100";
    LogColor[LogColor["C101"] = 101] = "C101";
    LogColor[LogColor["C102"] = 102] = "C102";
    LogColor[LogColor["C103"] = 103] = "C103";
    LogColor[LogColor["C104"] = 104] = "C104";
    LogColor[LogColor["C105"] = 105] = "C105";
    LogColor[LogColor["C106"] = 106] = "C106";
    LogColor[LogColor["C107"] = 107] = "C107";
})(LogColor = exports.LogColor || (exports.LogColor = {}));
class Logger {
    static linesMap = new Map();
    static colorEndDes = "\x1b[0m";
    static colorStartDes = (color) => `\x1b[${color}m`;
    static logL = console.log;
    static LOGW = (msg) => LOG(msg, LogColor.YELLOW);
    static LOGE = (msg) => LOG(msg, LogColor.RED);
    static LOGG = (msg) => LOG(msg, LogColor.C32);
    static LOGD = (msg) => LOG(msg, LogColor.C36);
    static LOGN = (msg) => LOG(msg, LogColor.C35);
    static LOGO = (msg) => LOG(msg, LogColor.C33);
    static LOGP = (msg) => LOG(msg, LogColor.C34);
    static LOGM = (msg) => LOG(msg, LogColor.C92);
    static LOGH = (msg) => LOG(msg, LogColor.C96);
    static LOGZ = (msg) => LOG(msg, LogColor.C90);
    static LOGJSON = (obj, type = LogColor.C36, space = 1) => LOG(JSON.stringify(obj, null, space), type);
    static LOG = (str, type = LogColor.WHITE) => {
        switch (type) {
            case LogColor.WHITE:
                Logger.logL(str);
                break;
            case LogColor.RED:
                console.error(str);
                break;
            case LogColor.YELLOW:
                console.warn(str);
                break;
            default:
                Logger.logL("\x1b[" + type + "m" + str + "\x1b[0m");
                break;
        }
    };
    static printLogColors = () => {
        let str = "123456789";
        Logger.logL(`\n${getLine(16)}  listLogColors  ${getLine(16)}`);
        for (let i = 30; i <= 37; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
        for (let i = 40; i <= 47; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
        for (let i = 90; i <= 97; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
        for (let i = 100; i <= 107; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
    };
    static getLine = (length, fillStr = "-") => {
        if (length == 0)
            return "";
        let key = length + "|" + fillStr;
        if (Logger.linesMap.get(key) != null)
            return Logger.linesMap.get(key);
        for (var index = 0, tmpRet = ""; index < length; index++)
            tmpRet += fillStr;
        Logger.linesMap.set(key, tmpRet);
        return tmpRet;
    };
    static getTextFormart = (text, color = LogColor.WHITE, fillStr = " ", length = -1, center = false) => {
        if (text == undefined)
            text = "";
        if (length == -1)
            length = text.length;
        let ret = Logger.colorStartDes(color);
        let fillLength = length - text.length;
        if (fillLength > 0) {
            let left = Math.floor(fillLength / 2);
            let right = fillLength - left;
            if (center) {
                left = right;
            }
            ret += getLine(left, fillStr) + text + getLine(right, fillStr);
        }
        else {
            ret += text;
        }
        ret += Logger.colorEndDes;
        return ret;
    };
}
exports.Logger = Logger;
var android_LogPriority;
(function (android_LogPriority) {
    android_LogPriority[android_LogPriority["ANDROID_LOG_UNKNOWN"] = 0] = "ANDROID_LOG_UNKNOWN";
    android_LogPriority[android_LogPriority["ANDROID_LOG_DEFAULT"] = 1] = "ANDROID_LOG_DEFAULT";
    android_LogPriority[android_LogPriority["ANDROID_LOG_VERBOSE"] = 2] = "ANDROID_LOG_VERBOSE";
    android_LogPriority[android_LogPriority["ANDROID_LOG_DEBUG"] = 3] = "ANDROID_LOG_DEBUG";
    android_LogPriority[android_LogPriority["ANDROID_LOG_INFO"] = 4] = "ANDROID_LOG_INFO";
    android_LogPriority[android_LogPriority["ANDROID_LOG_WARN"] = 5] = "ANDROID_LOG_WARN";
    android_LogPriority[android_LogPriority["ANDROID_LOG_ERROR"] = 6] = "ANDROID_LOG_ERROR";
    android_LogPriority[android_LogPriority["ANDROID_LOG_FATAL"] = 7] = "ANDROID_LOG_FATAL";
    android_LogPriority[android_LogPriority["ANDROID_LOG_SILENT"] = 8] = "ANDROID_LOG_SILENT";
})(android_LogPriority || (android_LogPriority = {}));
const LOG_TAG = "ZZZ";
const useCModule = false;
globalThis.logcat = (fmt, msg, tag = LOG_TAG, priority = android_LogPriority.ANDROID_LOG_INFO) => {
    if (!useCModule) {
        let logcat = new NativeFunction(Module.findExportByName("liblog.so", "__android_log_print"), 'void', ['int', 'pointer', 'pointer', 'pointer']);
        logcat(4, Memory.allocUtf8String(tag), Memory.allocUtf8String(fmt), Memory.allocUtf8String(msg));
    }
    else {
        var cmd = new CModule(`
        #include <stdio.h>
    
        extern int __android_log_print(int, const char*, const char*, ...);
        void logcat(const char* fmt, const char* msg){
            __android_log_print(${priority}, "${tag}", fmt, msg);
        }
        `, { __android_log_print: Module.findExportByName("liblog.so", "__android_log_print") });
        new NativeFunction(cmd["logcat"], 'void', ['pointer'])(Memory.allocUtf8String(msg));
    }
};
globalThis.LOG = Logger.LOG;
globalThis.LOGW = Logger.LOGW;
globalThis.LOGE = Logger.LOGE;
globalThis.LOGG = Logger.LOGG;
globalThis.LOGD = Logger.LOGD;
globalThis.LOGN = Logger.LOGN;
globalThis.LOGO = Logger.LOGO;
globalThis.LOGP = Logger.LOGP;
globalThis.LOGH = Logger.LOGH;
globalThis.LOGM = Logger.LOGM;
globalThis.LOGZ = Logger.LOGZ;
globalThis.LOGJSON = Logger.LOGJSON;
globalThis.getLine = Logger.getLine;
globalThis.printLogColors = Logger.printLogColors;
globalThis.newLine = (lines = 1) => Logger.LOG(getLine(lines, "\n"));
globalThis.LogColor = LogColor;
},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtModifiers = void 0;
class ArtModifiers {
    static kAccPublic = 0x0001;
    static kAccPrivate = 0x0002;
    static kAccProtected = 0x0004;
    static kAccStatic = 0x0008;
    static kAccFinal = 0x0010;
    static kAccSynchronized = 0x0020;
    static kAccSuper = 0x0020;
    static kAccVolatile = 0x0040;
    static kAccBridge = 0x0040;
    static kAccTransient = 0x0080;
    static kAccVarargs = 0x0080;
    static kAccNative = 0x0100;
    static kAccInterface = 0x0200;
    static kAccAbstract = 0x0400;
    static kAccStrict = 0x0800;
    static kAccSynthetic = 0x1000;
    static kAccAnnotation = 0x2000;
    static kAccEnum = 0x4000;
    static kAccJavaFlagsMask = 0xffff;
    static kAccConstructor = 0x00010000;
    static kAccDeclaredSynchronized = 0x00020000;
    static kAccClassIsProxy = 0x00040000;
    static kAccObsoleteMethod = 0x00040000;
    static kAccSkipAccessChecks = 0x00080000;
    static kAccVerificationAttempted = 0x00080000;
    static kAccSkipHiddenapiChecks = 0x00100000;
    static kAccCopied = 0x00100000;
    static PrettyAccessFlags = (access_flags) => {
        let access_flags_local = NULL;
        if (typeof access_flags === "number") {
            access_flags_local = ptr(access_flags);
        }
        else {
            access_flags_local = access_flags;
        }
        if (access_flags_local.isNull())
            throw new Error("access_flags is null");
        let result = "";
        if (!(access_flags_local.and(ArtModifiers.kAccPublic)).isNull()) {
            result += "public ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccProtected)).isNull()) {
            result += "protected ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccPrivate)).isNull()) {
            result += "private ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccFinal)).isNull()) {
            result += "final ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccStatic)).isNull()) {
            result += "static ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccAbstract)).isNull()) {
            result += "abstract ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccInterface)).isNull()) {
            result += "interface ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccTransient)).isNull()) {
            result += "transient ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccVolatile)).isNull()) {
            result += "volatile ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccSynchronized)).isNull()) {
            result += "synchronized ";
        }
        return result;
    };
}
exports.ArtModifiers = ArtModifiers;
globalThis.ArtModifiers = ArtModifiers;
globalThis.PrettyAccessFlags = (access_flags) => ArtModifiers.PrettyAccessFlags(access_flags);
},{}]},{},[29])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9JbnRlcmZhY2UvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL0hlYXBSZWZlcmVuY2UudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9KU0hhbmRsZS50cyIsImFnZW50L2FuZHJvaWQvT2JqZWN0LnRzIiwiYWdlbnQvYW5kcm9pZC9hbmRyb2lkLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9EZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9HY1Jvb3QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydWN0aW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXRRdWlja01ldGhvZEhlYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2JqUHRyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQXJ0Q2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRNZXRob2QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9DbGFzc0V4dC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzTG9hZGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvRGV4Q2FjaGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9JZlRhYmxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL21hY2hpbmUtY29kZS5qcyIsImFnZW50L2luY2x1ZGUudHMiLCJhZ2VudC9tYWluLnRzIiwiYWdlbnQvdG9vbHMvU3RkU3RyaW5nLnRzIiwiYWdlbnQvdG9vbHMvY29tbW9uLnRzIiwiYWdlbnQvdG9vbHMvZW51bS50cyIsImFnZW50L3Rvb2xzL2luY2x1ZGUudHMiLCJhZ2VudC90b29scy9sb2dnZXIudHMiLCJhZ2VudC90b29scy9tb2RpZmllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNBQSw2RUFBeUU7QUFJekUsTUFBTSxpQkFBaUIsR0FBYSxFQUFFLENBQUE7QUFRdEMsU0FBZ0IsdUJBQXVCLENBQUMsWUFBb0IsZ0NBQWdDO0lBRXhGLE1BQU0sVUFBVSxHQUFrQixFQUFFLENBQUE7SUFDcEMsTUFBTSxTQUFTLEdBQWlCLEVBQUUsQ0FBQTtJQUNsQyxNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUE7SUFFbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDZCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2pDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDdkMsSUFBSTtnQkFFQSxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxD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
