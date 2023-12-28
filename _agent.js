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
globalThis.listJavaMethods = (className = "com.unity3d.player.UnityPlayer", showInfo = true, showSmali = false) => {
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
            if (showSmali)
                new ArtMethod_1.ArtMethod(method.handle).showSmali();
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
globalThis.findJavaClasses = (keyword, depSearch = false, searchInstance = true) => {
    let countClasses = -1;
    newLine();
    ArrayCurrentItems.splice(0, ArrayCurrentItems.length);
    if (depSearch) {
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                enumClasses(loader);
            },
            onComplete: function () {
            }
        });
    }
    else {
        enumClasses(Java.classFactory.loader);
    }
    function enumClasses(loader) {
        Java.classFactory.loader = loader;
        LOGW(`Using loader: ${loader}`);
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
    }
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
},{"../android/implements/10/art/mirror/ArtMethod":27}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JavaUtil");
},{"./JavaUtil":1}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./mirror/include");
require("./SizeOfClass");
},{"./SizeOfClass":3,"./mirror/include":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeapReference = void 0;
const JSHandle_1 = require("../../../JSHandle");
class HeapReference extends JSHandle_1.JSHandle {
    static Size = 0x4;
    _factory;
    constructor(factory, handle) {
        super(handle.readU32());
        this._factory = factory;
    }
    get root() {
        return this._factory(this.handle);
    }
    toString() {
        return `HeapReference<${this.handle}> [U32]`;
    }
}
exports.HeapReference = HeapReference;
},{"../../../JSHandle":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./HeapReference");
require("./IArtMethod");
},{"./HeapReference":5,"./IArtMethod":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":4}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSHandle = void 0;
class JSHandle {
    handle;
    constructor(handle) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle;
    }
    get CurrentHandle() {
        return this.handle;
    }
    get SizeOfClass() {
        return 0;
    }
    get VirtualClassOffset() {
        return 0;
    }
}
exports.JSHandle = JSHandle;
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtObject = void 0;
const HeapReference_1 = require("./Interface/art/mirror/HeapReference");
const Globals_1 = require("./implements/10/art/Globals");
const JSHandle_1 = require("./JSHandle");
class ArtObject extends JSHandle_1.JSHandle {
    klass_;
    monitor_;
    constructor(handle) {
        super(handle);
        this.klass_ = this.handle;
        this.monitor_ = this.handle.add(Globals_1.PointerSize);
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get SizeOfClass() {
        return super.SizeOfClass + 0x4 * 2;
    }
    get klass() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), ptr(this.klass_.readU32()));
    }
    get monitor() {
        return this.handle.add(0x4).readU32();
    }
}
exports.ArtObject = ArtObject;
globalThis.ArtObject = ArtObject;
},{"./Interface/art/mirror/HeapReference":5,"./JSHandle":9,"./implements/10/art/Globals":20}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArtMethod_1 = require("../implements/10/art/mirror/ArtMethod");
globalThis.pathToArtMethod = (path) => {
    const index = path.lastIndexOf(".");
    const className = path.substring(0, index);
    const methodName = path.substring(index + 1);
    let retArtMethod = null;
    Java.perform(() => {
        const clazz = Java.use(className);
        const method = clazz[methodName];
        const handle = method.handle;
        retArtMethod = new ArtMethod_1.ArtMethod(handle);
    });
    return retArtMethod;
};
},{"../implements/10/art/mirror/ArtMethod":27}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtMethodHelper");
},{"./ArtMethodHelper":11}],13:[function(require,module,exports){
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
},{"./machine-code":36}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeItemDataAccessor = void 0;
const CodeItemInstructionAccessor_1 = require("./CodeItemInstructionAccessor");
class CodeItemDataAccessor extends CodeItemInstructionAccessor_1.CodeItemInstructionAccessor {
    registers_size_ = this.CurrentHandle.add(0x0);
    ins_size_ = this.CurrentHandle.add(0x2);
    outs_size_ = this.CurrentHandle.add(0x2 * 2);
    tries_size_ = this.CurrentHandle.add(0x2 * 3);
    constructor(insns_size_in_code_units, insns, registers_size = 0, ins_size = 0, outs_size = 0, tries_size = 0) {
        super(insns_size_in_code_units, insns);
        this.registers_size_.writeU16(registers_size);
        this.ins_size_.writeU16(ins_size);
        this.outs_size_.writeU16(outs_size);
        this.tries_size_.writeU16(tries_size);
    }
    get SizeOfClass() {
        return CodeItemDataAccessor.SIZE_OF_CodeItemDataAccessor + super.SizeOfClass;
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get registers_size() {
        return this.registers_size_.readU16();
    }
    get ins_size() {
        return this.ins_size_.readU16();
    }
    get outs_size() {
        return this.outs_size_.readU16();
    }
    get tries_size() {
        return this.tries_size_.readU16();
    }
    set registers_size(registers_size) {
        this.registers_size_.writeU16(registers_size);
    }
    set ins_size(ins_size) {
        this.ins_size_.writeU16(ins_size);
    }
    set outs_size(outs_size) {
        this.outs_size_.writeU16(outs_size);
    }
    set tries_size(tries_size) {
        this.tries_size_.writeU16(tries_size);
    }
}
exports.CodeItemDataAccessor = CodeItemDataAccessor;
},{"./CodeItemInstructionAccessor":16}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeItemDebugInfoAccessor = void 0;
const CodeItemDataAccessor_1 = require("./CodeItemDataAccessor");
const Globals_1 = require("./Globals");
class CodeItemDebugInfoAccessor extends CodeItemDataAccessor_1.CodeItemDataAccessor {
    dex_file_ = this.CurrentHandle.add(0x0);
    debug_info_offset_ = this.CurrentHandle.add(Globals_1.PointerSize);
    constructor(insns_size_in_code_units, insns, registers_size, ins_size, outs_size, tries_size, dex_file = NULL, debug_info_offset = 0) {
        super(insns_size_in_code_units, insns, registers_size, ins_size, outs_size, tries_size);
        this.dex_file_.writePointer(dex_file);
        this.debug_info_offset_.writeU32(debug_info_offset);
    }
    get SizeOfClass() {
        return CodeItemDebugInfoAccessor.SIZE_OF_CodeItemDebugInfoAccessor + super.SizeOfClass;
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get dex_file() {
        return this.dex_file_.readPointer();
    }
    get debug_info_offset() {
        return this.debug_info_offset_.readU32();
    }
    set dex_file(dex_file) {
        this.dex_file_.writePointer(dex_file);
    }
    set debug_info_offset(debug_info_offset) {
        this.debug_info_offset_.writeU32(debug_info_offset);
    }
}
exports.CodeItemDebugInfoAccessor = CodeItemDebugInfoAccessor;
},{"./CodeItemDataAccessor":14,"./Globals":20}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeItemInstructionAccessor = void 0;
const StandardDexFile_1 = require("./StandardDexFile");
const CompactDexFile_1 = require("./CompactDexFile");
const Globals_1 = require("./Globals");
const Instruction_1 = require("./Instruction");
const JSHandle_1 = require("../../../JSHandle");
class CodeItemInstructionAccessor extends JSHandle_1.JSHandle {
    static SIZE_OF_CodeItemInstructionAccessor = 0x4 + Globals_1.PointerSize;
    static SIZE_OF_CodeItemDebugInfoAccessor = Globals_1.PointerSize + 0x4;
    static SIZE_OF_CodeItemDataAccessor = 0x2 * 4;
    insns_size_in_code_units_ = this.CurrentHandle;
    insns_ = this.CurrentHandle.add(0x4);
    constructor(insns_size_in_code_units = 0, insns = NULL) {
        const needAllocSize = CodeItemInstructionAccessor.SIZE_OF_CodeItemInstructionAccessor
            + CodeItemInstructionAccessor.SIZE_OF_CodeItemDataAccessor
            + CodeItemInstructionAccessor.SIZE_OF_CodeItemDebugInfoAccessor;
        super(Memory.alloc(needAllocSize));
        this.CurrentHandle.add(0x0).writeU32(insns_size_in_code_units);
        this.CurrentHandle.add(0x4).writePointer(insns);
    }
    toString() {
        let disp = `CodeItemInstructionAccessor<${this.handle}>`;
        disp += `\ninsns_size_in_code_units: ${this.insns_size_in_code_units} | insns_: ${this.insns}`;
        return disp;
    }
    static fromDexFile(dexFile, dex_pc) {
        const accessor = new CodeItemInstructionAccessor();
        if (dexFile.is_compact_dex) {
            const codeItem = new CompactDexFile_1.CompactDexFile_CodeItem(dex_pc);
            accessor.insns_size_in_code_units = ptr(codeItem.insns_count_and_flags).shr(Globals_1.kInsnsSizeShift).toUInt32();
            accessor.insns = codeItem.insns_;
        }
        else {
            const codeItem = new StandardDexFile_1.StandardDexFile_CodeItem(dex_pc);
            accessor.insns_size_in_code_units = codeItem.insns_size_in_code_units;
            accessor.insns = codeItem.insns_;
        }
        return accessor;
    }
    static fromArtMethod(artMethod) {
        const dexFile = artMethod.GetDexFile();
        const dex_pc = artMethod.GetCodeItem();
        return CodeItemInstructionAccessor.fromDexFile(dexFile, dex_pc);
    }
    get SizeOfClass() {
        return CodeItemInstructionAccessor.SIZE_OF_CodeItemInstructionAccessor + super.SizeOfClass;
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get insns_size_in_code_units() {
        return this.insns_size_in_code_units_.readU32();
    }
    get insns() {
        return this.insns_.readPointer();
    }
    set insns_size_in_code_units(insns_size_in_code_units) {
        this.insns_size_in_code_units_.writeU32(insns_size_in_code_units);
    }
    set insns(insns) {
        this.insns_.writePointer(insns);
    }
    InsnsSizeInBytes() {
        return this.insns_size_in_code_units * 2;
    }
    InstructionAt(dex_pc = 0) {
        return Instruction_1.ArtInstruction.At(this.insns.add(dex_pc));
    }
}
exports.CodeItemInstructionAccessor = CodeItemInstructionAccessor;
globalThis.fromDexFile = CodeItemInstructionAccessor.fromDexFile;
globalThis.fromArtMethod = CodeItemInstructionAccessor.fromArtMethod;
},{"../../../JSHandle":9,"./CompactDexFile":17,"./Globals":20,"./Instruction":21,"./StandardDexFile":24}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompactDexFile_CodeItem = exports.CompactDexFile = void 0;
const DexFile_1 = require("./DexFile");
class CompactDexFile extends DexFile_1.DexFile {
    constructor(dexFile) {
        super(dexFile);
    }
}
exports.CompactDexFile = CompactDexFile;
class CompactDexFile_CodeItem extends DexFile_1.DexFile_CodeItem {
    fields_ = this.CurrentHandle;
    insns_count_and_flags_ = this.CurrentHandle.add(0x2 * 1);
    insns_ = this.CurrentHandle.add(0x2 * 2);
    constructor(dex_pc) {
        super(dex_pc);
    }
    toString() {
        let disp = `CompactDexFile::CodeItem<${this.handle}>`;
        disp += `\nfields_: ${this.fields} | insns_count_and_flags_: ${this.insns_count_and_flags} | insns_: ${this.insns}`;
        return disp;
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get fields() {
        return this.fields_.readU16();
    }
    get insns_count_and_flags() {
        return this.insns_count_and_flags_.readU16();
    }
    get insns() {
        return this.insns_.readPointer();
    }
    set fields(fields) {
        this.fields_.writeU16(fields);
    }
}
exports.CompactDexFile_CodeItem = CompactDexFile_CodeItem;
},{"./DexFile":18}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexFile_CodeItem = exports.DexFile = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
const Globals_1 = require("./Globals");
class DexFile extends JSHandle_1.JSHandle {
    static Standard_InsnsOffset = 0x2 * 4 + 0x4 * 2;
    static Compact_InsnsOffset = 0x2 * 4 + 0x4 * 1;
    begin_ = this.currentHandle;
    size_ = this.begin_.add(Globals_1.PointerSize * 1);
    data_begin_ = this.size_.add(Globals_1.PointerSize * 1);
    data_size_ = this.data_begin_.add(Globals_1.PointerSize * 1);
    location_ = this.data_size_.add(Globals_1.PointerSize * 1);
    location_checksum_ = this.location_.add(Globals_1.PointerSize * 3);
    header_ = this.location_checksum_.add(0x4);
    string_ids_ = this.header_.add(Globals_1.PointerSize * 1);
    type_ids_ = this.string_ids_.add(Globals_1.PointerSize * 1);
    field_ids_ = this.type_ids_.add(Globals_1.PointerSize * 1);
    method_ids_ = this.field_ids_.add(Globals_1.PointerSize * 1);
    proto_ids_ = this.method_ids_.add(Globals_1.PointerSize * 1);
    class_defs_ = this.proto_ids_.add(Globals_1.PointerSize * 1);
    method_handles_ = this.class_defs_.add(Globals_1.PointerSize * 1);
    num_method_handles_ = this.method_handles_.add(Globals_1.PointerSize * 1);
    call_site_ids_ = this.num_method_handles_.add(Globals_1.PointerSize * 1);
    num_call_site_ids_ = this.call_site_ids_.add(Globals_1.PointerSize * 1);
    hiddenapi_class_data_ = this.num_call_site_ids_.add(Globals_1.PointerSize * 1);
    oat_dex_file_ = this.hiddenapi_class_data_.add(Globals_1.PointerSize * 1);
    container_ = this.oat_dex_file_.add(Globals_1.PointerSize * 1);
    is_compact_dex_ = this.container_.add(Globals_1.PointerSize * 1);
    hiddenapi_domain_ = this.is_compact_dex_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    get VirtualClassOffset() {
        return Globals_1.PointerSize;
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    get SizeOfClass() {
        return super.SizeOfClass + (this.hiddenapi_domain_.add(0x4).sub(this.currentHandle).toInt32()) + this.VirtualClassOffset;
    }
    toString() {
        let disp = `DexFile<${this.handle}> \n`;
        disp += `location: ${this.location} \n`;
        disp += `location_checksum: ${this.location_checksum} ( ${ptr(this.location_checksum)} ) is_compact_dex: ${this.is_compact_dex} \n`;
        disp += `begin: ${this.begin} size: ${this.size} ( ${ptr(this.size)} ) | data_begin: ${this.data_begin} data_size: ${this.data_size} ( ${ptr(this.data_size)} ) `;
        return disp;
    }
    PrettyMethod(method_idx, with_signature = true) {
        const PrettyMethodAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile12PrettyMethodEjb");
        const PrettyMethod = new NativeFunction(PrettyMethodAddr, "pointer", ["pointer", "pointer", "pointer"]);
        return new StdString_1.StdString(PrettyMethod(this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL)).disposeToString();
    }
    CalculateChecksum() {
        const CalculateChecksumAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile17CalculateChecksumEv");
        const CalculateChecksum = new NativeFunction(CalculateChecksumAddr, "uint32", ["pointer"]);
        return CalculateChecksum(this.handle);
    }
    IsReadOnly() {
        const IsReadOnlyAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile10IsReadOnlyEv");
        const IsReadOnly = new NativeFunction(IsReadOnlyAddr, "bool", ["pointer"]);
        return IsReadOnly(this.handle);
    }
    DisableWrite() {
        const DisableWriteAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile12DisableWriteEv");
        const DisableWrite = new NativeFunction(DisableWriteAddr, "bool", ["pointer"]);
        return DisableWrite(this.handle);
    }
    EnableWrite() {
        const EnableWriteAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile11EnableWriteEv");
        const EnableWrite = new NativeFunction(EnableWriteAddr, "bool", ["pointer"]);
        return EnableWrite(this.handle);
    }
    PrettyType(type_idx) {
        const PrettyTypeAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE");
        const PrettyType = new NativeFunction(PrettyTypeAddr, "pointer", ["pointer", "pointer"]);
        return new StdString_1.StdString(PrettyType(this.handle, ptr(type_idx))).disposeToString();
    }
    get begin() {
        return this.begin_.readPointer();
    }
    get size() {
        return this.size_.readU32();
    }
    get data_begin() {
        return this.data_begin_.readPointer();
    }
    get data_size() {
        return this.data_size_.readU32();
    }
    get location() {
        return new StdString_1.StdString(this.location_).toString();
    }
    get location_checksum() {
        return this.location_checksum_.readU32();
    }
    get header() {
        return this.header_.readPointer();
    }
    get string_ids() {
        return this.string_ids_.readPointer();
    }
    get type_ids() {
        return this.type_ids_.readPointer();
    }
    get field_ids() {
        return this.field_ids_.readPointer();
    }
    get method_ids() {
        return this.method_ids_.readPointer();
    }
    get proto_ids() {
        return this.proto_ids_.readPointer();
    }
    get class_defs() {
        return this.class_defs_.readPointer();
    }
    get method_handles() {
        return this.method_handles_.readPointer();
    }
    get num_method_handles() {
        return this.num_method_handles_.readU32();
    }
    get call_site_ids() {
        return this.call_site_ids_.readPointer();
    }
    get num_call_site_ids() {
        return this.num_call_site_ids_.readU32();
    }
    get hiddenapi_class_data() {
        return this.hiddenapi_class_data_.readPointer();
    }
    get oat_dex_file() {
        return this.oat_dex_file_.readPointer();
    }
    get container() {
        return this.container_.readPointer();
    }
    get is_compact_dex() {
        return this.begin.readCString() == "cdex001";
        return this.is_compact_dex_.readU8() === 1;
    }
    get hiddenapi_domain() {
        return this.hiddenapi_domain_.readPointer();
    }
    get DexInstsOffset() {
        return this.is_compact_dex ? DexFile.Compact_InsnsOffset : DexFile.Standard_InsnsOffset;
    }
}
exports.DexFile = DexFile;
class DexFile_CodeItem extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
}
exports.DexFile_CodeItem = DexFile_CodeItem;
Reflect.set(globalThis, "DexFile", DexFile);
},{"../../../../tools/StdString":39,"../../../JSHandle":9,"./Globals":20}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcRoot = void 0;
const JSHandle_1 = require("../../../JSHandle");
class GcRoot extends JSHandle_1.JSHandle {
    static Size = 0x4;
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
},{"../../../JSHandle":9}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerSize = exports.Arch = exports.kInsnsSizeBits = exports.kInsnsSizeShift = exports.kFlagPreHeaderInsnsSize = exports.kFlagPreHeaderTriesSize = exports.kFlagPreHeaderOutsSize = exports.kFlagPreHeaderInsSize = exports.kFlagPreHeaderRegisterSize = exports.kTriesSizeSizeShift = exports.kOutsSizeShift = exports.kInsSizeShift = exports.kRegistersSizeShift = exports.kBitsPerByte = void 0;
exports.kBitsPerByte = 8;
exports.kRegistersSizeShift = ptr(12);
exports.kInsSizeShift = ptr(8);
exports.kOutsSizeShift = ptr(4);
exports.kTriesSizeSizeShift = ptr(0);
exports.kFlagPreHeaderRegisterSize = ptr(0x1).shl(0);
exports.kFlagPreHeaderInsSize = ptr(0x1).shl(1);
exports.kFlagPreHeaderOutsSize = ptr(0x1).shl(2);
exports.kFlagPreHeaderTriesSize = ptr(0x1).shl(3);
exports.kFlagPreHeaderInsnsSize = ptr(0x1).shl(4);
exports.kInsnsSizeShift = 5;
exports.kInsnsSizeBits = (16 * (exports.kBitsPerByte)) - (exports.kInsnsSizeShift);
exports.Arch = Process.arch;
exports.PointerSize = Process.pointerSize;
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtInstruction = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
class ArtInstruction extends JSHandle_1.JSHandle {
    static cached_kInstructionNames = [];
    static get kInstructionNames() {
        if (ArtInstruction.cached_kInstructionNames.length > 0)
            return ArtInstruction.cached_kInstructionNames;
        const kInstructionNames_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction17kInstructionNamesE');
        let arrary_ret = [];
        let loopAddaddress = kInstructionNames_ptr;
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer().readCString());
            loopAddaddress = loopAddaddress.add(Process.pointerSize);
        }
        ArtInstruction.cached_kInstructionNames = arrary_ret;
        return arrary_ret;
    }
    static cached_kInstructionDescriptors = [];
    static get kInstructionDescriptors() {
        if (ArtInstruction.cached_kInstructionDescriptors.length > 0)
            return ArtInstruction.cached_kInstructionDescriptors;
        const kInstructionDescriptors_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction23kInstructionDescriptorsE');
        const arrary_ret = [];
        let loopAddaddress = kInstructionDescriptors_ptr;
        let counter = 0xFF;
        while (counter-- > 0) {
            arrary_ret.push(new InstructionDescriptor(loopAddaddress));
            loopAddaddress = loopAddaddress.add(Process.pointerSize);
        }
        ArtInstruction.cached_kInstructionDescriptors = arrary_ret;
        return arrary_ret;
    }
    dumpString(dexFile) {
        const DumpString_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE");
        const DumpString_func = new NativeFunction(DumpString_ptr, ["pointer", "pointer", "pointer"], ["pointer", "pointer"]);
        const result = DumpString_func(this.handle, dexFile.handle);
        return StdString_1.StdString.fromPointers(result);
    }
    dumpHex(code_units = 3) {
        const DumpHex_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction7DumpHexEm");
        const DumpHex_func = new NativeFunction(DumpHex_ptr, ["pointer", "pointer", "pointer"], ["pointer", "int"]);
        const result = DumpHex_func(this.handle, code_units);
        return StdString_1.StdString.fromPointers(result);
    }
    dumpHexLE(instr_code_units = 3) {
        const realInsLen = this.SizeInCodeUnits / 2;
        if (realInsLen > instr_code_units)
            instr_code_units = realInsLen;
        const DumpHexLE_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction9DumpHexLEEm");
        const DumpHexLE_func = new NativeFunction(DumpHexLE_ptr, ["pointer", "pointer", "pointer"], ["pointer", "int"]);
        const result = DumpHexLE_func(this.handle, instr_code_units);
        return `${realInsLen} - ${StdString_1.StdString.fromPointers(result)}`;
    }
    sizeInCodeUnitsComplexOpcode() {
        const SizeInCodeUnitsComplexOpcode_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv");
        const SizeInCodeUnitsComplexOpcode_func = new NativeFunction(SizeInCodeUnitsComplexOpcode_ptr, ["pointer"], ["pointer"]);
        return SizeInCodeUnitsComplexOpcode_func(this.handle);
    }
    static At(code) {
        return new ArtInstruction(code);
    }
    RelativeAt(offset) {
        return ArtInstruction.At(this.handle.add(offset));
    }
    Next() {
        return this.RelativeAt(this.SizeInCodeUnits);
    }
    get SizeInCodeUnits() {
        const opcode = this.Fetch16();
        let result = (ArtInstruction.kInstructionDescriptors[opcode].size_in_code_units);
        if (result < 0) {
            let ret = this.sizeInCodeUnitsComplexOpcode() * 0x2;
            return ret;
        }
        else
            return result * 0x2;
    }
    Fetch16(offset = 0) {
        return this.handle.add(offset).readU8();
    }
}
exports.ArtInstruction = ArtInstruction;
class Code extends JSHandle_1.JSHandle {
    enumMap = new Map([
        [0x00, "NOP"],
        [0x01, "MOVE"],
        [0x02, "MOVE_FROM16"],
        [0x03, "MOVE_16"],
        [0x04, "MOVE_WIDE"],
        [0x05, "MOVE_WIDE_FROM16"],
        [0x06, "MOVE_WIDE_16"],
        [0x07, "MOVE_OBJECT"],
        [0x08, "MOVE_OBJECT_FROM16"],
        [0x09, "MOVE_OBJECT_16"],
        [0x0A, "MOVE_RESULT"],
        [0x0B, "MOVE_RESULT_WIDE"],
        [0x0C, "MOVE_RESULT_OBJECT"],
        [0x0D, "MOVE_EXCEPTION"],
        [0x0E, "RETURN_VOID"],
        [0x0F, "RETURN"],
        [0x10, "RETURN_WIDE"],
        [0x11, "RETURN_OBJECT"],
        [0x12, "CONST_4"],
        [0x13, "CONST_16"],
        [0x14, "CONST"],
        [0x15, "CONST_HIGH16"],
        [0x16, "CONST_WIDE_16"],
        [0x17, "CONST_WIDE_32"],
        [0x18, "CONST_WIDE"],
        [0x19, "CONST_WIDE_HIGH16"],
        [0x1A, "CONST_STRING"],
        [0x1B, "CONST_STRING_JUMBO"],
        [0x1C, "CONST_CLASS"],
        [0x1D, "MONITOR_ENTER"],
        [0x1E, "MONITOR_EXIT"],
        [0x1F, "CHECK_CAST"],
        [0x20, "INSTANCE_OF"],
        [0x21, "ARRAY_LENGTH"],
        [0x22, "NEW_INSTANCE"],
        [0x23, "NEW_ARRAY"],
        [0x24, "FILLED_NEW_ARRAY"],
        [0x25, "FILLED_NEW_ARRAY_RANGE"],
        [0x26, "FILL_ARRAY_DATA"],
        [0x27, "THROW"],
        [0x28, "GOTO"],
        [0x29, "GOTO_16"],
        [0x2A, "GOTO_32"],
        [0x2B, "PACKED_SWITCH"],
        [0x2C, "SPARSE_SWITCH"],
    ]);
    flags = this.CurrentHandle.toInt32();
    get Option_Name() {
        return this.enumMap.get(this.flags) || "unknown";
    }
    get Option_Value() {
        return this.flags;
    }
    get Option_Value_ptr() {
        return ptr(this.Option_Value);
    }
}
class InstructionDescriptor extends JSHandle_1.JSHandle {
    verify_flags_ = this.CurrentHandle;
    format_ = this.verify_flags_.add(0x4);
    index_type_ = this.format_.add(0x1);
    flags_ = this.index_type_.add(0x1);
    size_in_code_units_ = this.flags_.add(0x1);
    toString() {
        return `InstructionDescriptor<${this.handle}> | format: ${this.format.name} | size_in_code_units_: ${this.size_in_code_units}`;
    }
    get verify_flags() {
        return this.verify_flags_.readU32();
    }
    get format() {
        return new Format(this.format_.readU8());
    }
    get index_type() {
        return new IndexType(this.index_type_.readU8());
    }
    get flags() {
        return new Flags(this.flags_.readU8());
    }
    get size_in_code_units() {
        return this.size_in_code_units_.readS8();
    }
}
class Flags extends JSHandle_1.JSHandle {
    enumMap = new Map([
        [0x01, "kBranch"],
        [0x02, "kContinue"],
        [0x04, "kSwitch"],
        [0x08, "kThrow"],
        [0x10, "kReturn"],
        [0x20, "kInvoke"],
        [0x40, "kUnconditional"],
        [0x80, "kExperimental"],
    ]);
    flags = this.CurrentHandle.toInt32();
    get name() {
        return this.enumMap.get(this.flags) || "unknown";
    }
    get value() {
        return this.flags;
    }
    get value_ptr() {
        return ptr(this.value);
    }
}
class IndexType extends JSHandle_1.JSHandle {
    enumMap = new Map([
        [0, "kIndexUnknown"],
        [1, "kIndexNone"],
        [2, "kIndexTypeRef"],
        [3, "kIndexStringRef"],
        [4, "kIndexMethodRef"],
        [5, "kIndexFieldRef"],
        [6, "kIndexFieldOffset"],
        [7, "kIndexVtableOffset"],
        [8, "kIndexMethodAndProtoRef"],
        [9, "kIndexCallSiteRef"],
        [10, "kIndexMethodHandleRef"],
        [11, "kIndexProtoRef"],
    ]);
    index_type = this.CurrentHandle.toInt32();
    get name() {
        return this.enumMap.get(this.index_type) || "unknown";
    }
    get value() {
        return this.index_type;
    }
    get value_ptr() {
        return ptr(this.value);
    }
}
class Format extends JSHandle_1.JSHandle {
    enumMap = new Map([
        [0, "k10x"],
        [1, "k12x"],
        [2, "k11n"],
        [3, "k11x"],
        [4, "k10t"],
        [5, "k20t"],
        [6, "k22x"],
        [7, "k21t"],
        [8, "k21s"],
        [9, "k21h"],
        [10, "k21c"],
        [11, "k23x"],
        [12, "k22b"],
        [13, "k22t"],
        [14, "k22s"],
        [15, "k22c"],
        [16, "k32x"],
        [17, "k30t"],
        [18, "k31t"],
        [19, "k31i"],
        [20, "k31c"],
        [21, "k35c"],
        [22, "k3rc"],
        [23, "k45cc"],
        [24, "k4rcc"],
        [25, "k51l"],
    ]);
    format = this.CurrentHandle.toInt32();
    get name() {
        return this.enumMap.get(this.format) || "unknown";
    }
    get value() {
        return this.format;
    }
    get value_ptr() {
        return ptr(this.value);
    }
}
},{"../../../../tools/StdString":39,"../../../JSHandle":9}],22:[function(require,module,exports){
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
},{"../../../JSHandle":9}],23:[function(require,module,exports){
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
},{"../../../JSHandle":9}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardDexFile_CodeItem = exports.StandardDexFile = void 0;
const DexFile_1 = require("./DexFile");
class StandardDexFile extends DexFile_1.DexFile {
    constructor(dexFile) {
        super(dexFile);
    }
}
exports.StandardDexFile = StandardDexFile;
class StandardDexFile_CodeItem extends DexFile_1.DexFile_CodeItem {
    registers_size_ = this.CurrentHandle;
    ins_size_ = this.CurrentHandle.add(0x2 * 1);
    outs_size_ = this.CurrentHandle.add(0x2 * 2);
    tries_size_ = this.CurrentHandle.add(0x2 * 3);
    debug_info_off_ = this.CurrentHandle.add(0x2 * 4);
    insns_size_in_code_units_ = this.CurrentHandle.add(0x2 * 4 + 0x4 * 1);
    insns_ = this.CurrentHandle.add(0x2 * 4 + 0x4 * 2);
    constructor(dex_pc) {
        super(dex_pc);
    }
    toString() {
        let disp = `StandardDexFile::CodeItem<${this.handle}>`;
        disp += `\nregisters_size_: ${this.registers_size} | ins_size_: ${this.ins_size} | outs_size_: ${this.outs_size} | tries_size_: ${this.tries_size} | debug_info_off_: ${this.debug_info_off} | insns_size_in_code_units_: ${this.insns_size_in_code_units} | insns_: ${this.insns}`;
        return disp;
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get registers_size() {
        return this.registers_size_.readU16();
    }
    get ins_size() {
        return this.ins_size_.readU16();
    }
    get outs_size() {
        return this.outs_size_.readU16();
    }
    get tries_size() {
        return this.tries_size_.readU16();
    }
    get debug_info_off() {
        return this.debug_info_off_.readU32();
    }
    get insns_size_in_code_units() {
        return this.insns_size_in_code_units_.readU32();
    }
    get insns() {
        return this.insns_;
    }
    set registers_size(registers_size) {
        this.registers_size_.writeU16(registers_size);
    }
    set ins_size(ins_size) {
        this.ins_size_.writeU16(ins_size);
    }
    set outs_size(outs_size) {
        this.outs_size_.writeU16(outs_size);
    }
    set tries_size(tries_size) {
        this.tries_size_.writeU16(tries_size);
    }
    set debug_info_off(debug_info_off) {
        this.debug_info_off_.writeU32(debug_info_off);
    }
    set insns_size_in_code_units(insns_size_in_code_units) {
        this.insns_size_in_code_units_.writeU32(insns_size_in_code_units);
    }
    set insns(insns) {
        this.insns_ = insns;
    }
}
exports.StandardDexFile_CodeItem = StandardDexFile_CodeItem;
},{"./DexFile":18}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./CodeItemDataAccessor");
require("./CodeItemDebugInfoAccessor");
require("./CodeItemInstructionAccessor");
require("./CompactDexFile");
require("./StandardDexFile");
require("./DexFile");
require("./Globals");
require("./GcRoot");
require("./Instruction");
require("./OatQuickMethodHeader");
require("./ObjPtr");
require("./mirror/include");
},{"./CodeItemDataAccessor":14,"./CodeItemDebugInfoAccessor":15,"./CodeItemInstructionAccessor":16,"./CompactDexFile":17,"./DexFile":18,"./GcRoot":19,"./Globals":20,"./Instruction":21,"./OatQuickMethodHeader":22,"./ObjPtr":23,"./StandardDexFile":24,"./mirror/include":32}],26:[function(require,module,exports){
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
    isVirtualClass = false;
    class_loader_ = this.currentHandle;
    component_type_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 1);
    dex_cache_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 2);
    ext_data_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 3);
    iftable_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 4);
    name_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 5);
    super_class_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 6);
    vtable_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 7);
    ifields_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8);
    methods_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8 + 0x8 * 1);
    sfields_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8 + 0x8 * 2);
    access_flags_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 1);
    class_flags_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 2);
    class_size_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 3);
    clinit_thread_id_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8 + 0x8 * 2 + 0x4 * 4);
    dex_class_def_idx_ = this.currentHandle.add(HeapReference_1.HeapReference.Size * 8 + 0x8 * 3 + 0x4 * 4);
    constructor(handle) {
        super(handle);
    }
    get SizeOfClass() {
        return super.SizeOfClass + (HeapReference_1.HeapReference.Size * 8 + 64 * 3 + 32 * 5);
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    toString() {
        return `ArtClass< ${this.handle} >`;
    }
    get class_loader() {
        return new HeapReference_1.HeapReference((handle) => new ClassLoader_1.ArtClassLoader(handle), this.class_loader_);
    }
    get component_type() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), this.component_type_);
    }
    get dex_cache() {
        return new HeapReference_1.HeapReference((handle) => new DexCache_1.DexCache(handle), this.dex_cache_);
    }
    get ext_data() {
        return new HeapReference_1.HeapReference((handle) => new ClassExt_1.ClassExt(handle), this.ext_data_);
    }
    get iftable() {
        return new HeapReference_1.HeapReference((handle) => new IfTable_1.IfTable(handle), this.iftable_);
    }
    get name() {
        return new HeapReference_1.HeapReference((handle) => new StdString_1.StdString(handle), this.name_);
    }
    get super_class() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), this.super_class_);
    }
    get vtable() {
        return new HeapReference_1.HeapReference((handle) => new NativePointer(handle), this.vtable_);
    }
    get ifields() {
        return this.ifields_.readU64().toNumber();
    }
    get methods() {
        return this.methods_.readU64().toNumber();
    }
    get sfields() {
        return this.sfields_.readU64().toNumber();
    }
    get access_flags() {
        return this.access_flags_.readU32();
    }
    get access_flags_string() {
        return PrettyAccessFlags(this.access_flags);
    }
    get class_flags() {
        return this.class_flags_.readU32();
    }
    get class_size() {
        return this.class_size_.readU32();
    }
    get clinit_thread_id() {
        return this.clinit_thread_id_.readS32();
    }
    get dex_class_def_idx() {
        return this.dex_class_def_idx_.readS32();
    }
}
exports.ArtClass = ArtClass;
globalThis.ArtClass = ArtClass;
},{"../../../../../tools/StdString":39,"../../../../Interface/art/mirror/HeapReference":5,"../../../../Object":10,"./ClassExt":28,"./ClassLoader":29,"./DexCache":30,"./IfTable":31}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const CodeItemInstructionAccessor_1 = require("../CodeItemInstructionAccessor");
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const StdString_1 = require("../../../../../tools/StdString");
const enum_1 = require("../../../../../tools/enum");
const JSHandle_1 = require("../../../../JSHandle");
const ArtClass_1 = require("./ArtClass");
const GcRoot_1 = require("../GcRoot");
const ObjPtr_1 = require("../ObjPtr");
const modifiers_1 = require("../../../../../tools/modifiers");
const DexCache_1 = require("./DexCache");
class ArtMethod extends JSHandle_1.JSHandle {
    declaring_class_ = this.CurrentHandle;
    access_flags_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size);
    dex_code_item_offset_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size + 0x4);
    dex_method_index_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size + 0x4 * 2);
    method_index_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size + 0x4 * 3);
    hotness_count_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size + 0x4 * 3 + 0x2 * 1);
    imt_index_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size + 0x4 * 3 + 0x2 * 1);
    ptr_sized_fields_;
    constructor(handle) {
        super(handle);
        this.ptr_sized_fields_ = {
            data_: this.handle.add(getArtMethodSpec().offset.jniCode),
            entry_point_from_quick_compiled_code_: this.handle.add(getArtMethodSpec().offset.quickCode)
        };
    }
    get SizeOfClass() {
        return getArtMethodSpec().size + super.SizeOfClass;
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get declaring_class() {
        return new GcRoot_1.GcRoot((handle) => new ArtClass_1.ArtClass(handle), this.declaring_class_);
    }
    get access_flags() {
        return ptr(this.access_flags_.readU32());
    }
    get access_flags_string() {
        return modifiers_1.ArtModifiers.PrettyAccessFlags(this.access_flags);
    }
    get dex_code_item_offset() {
        return this.dex_code_item_offset_.readU32();
    }
    get dex_method_index() {
        return this.dex_method_index_.readU32();
    }
    get method_index() {
        return this.method_index_.readU16();
    }
    get hotness_count() {
        return this.hotness_count_.readU16();
    }
    get imt_index() {
        return this.imt_index_.readU16();
    }
    get data() {
        return this.ptr_sized_fields_.data_.readPointer();
    }
    get entry_point_from_quick_compiled_code() {
        return this.ptr_sized_fields_.entry_point_from_quick_compiled_code_.readPointer();
    }
    prettyMethod(withSignature = true) {
        const result = new StdString_1.StdString();
        Java.api['art::ArtMethod::PrettyMethod'](result, this.handle, withSignature ? 1 : 0);
        return result.toString();
    }
    toString() {
        const PrettyJavaAccessFlagsStr = PrettyAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()));
        return `${this.handle} -> ${PrettyJavaAccessFlagsStr}${this.prettyMethod()}`;
    }
    getInfo() {
        const quickCode = this.entry_point_from_quick_compiled_code;
        const jniCode = this.data;
        const debugInfo_jniCode = DebugSymbol.fromAddress(jniCode);
        let jniCodeStr = jniCode.isNull() ? "null" : `${jniCode} -> ${debugInfo_jniCode.name} @ ${debugInfo_jniCode.moduleName}`;
        const debugInfo_quickCode = DebugSymbol.fromAddress(quickCode);
        return `quickCode: ${quickCode} -> ${debugInfo_quickCode.name} @ ${debugInfo_quickCode.moduleName} | jniCode: ${jniCodeStr} | accessFlags: ${this.access_flags} | size: ${ptr(this.SizeOfClass)}\n`;
    }
    DexInstructions() {
        return CodeItemInstructionAccessor_1.CodeItemInstructionAccessor.fromArtMethod(this);
    }
    GetObsoleteDexCache() {
        const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv");
        const GetObsoleteDexCacheFunc = new NativeFunction(GetObsoleteDexCacheAddr, 'pointer', ['pointer']);
        const ret = GetObsoleteDexCacheFunc(this.handle);
        if (ret.isNull())
            return null;
        return new ObjPtr_1.ObjPtr(ret).handle;
    }
    GetCodeItem() {
        const dexCodeItemOffset = this.dex_code_item_offset;
        const dexFile = this.GetDexFile();
        return dexFile.data_begin.add(dexCodeItemOffset);
    }
    static checkDexFile_onceFlag = true;
    GetDexFile() {
        let access_flags = this.handle.add(0x4).readU32();
        if ((access_flags & modifiers_1.ArtModifiers.kAccObsoleteMethod) != 0) {
            return new DexCache_1.DexCache(this.GetObsoleteDexCache()).dex_file;
        }
        else {
            return this.declaring_class.root.dex_cache.root.dex_file;
        }
        function checkDexFile() {
            if (!ArtMethod.checkDexFile_onceFlag)
                return;
            ArtMethod.checkDexFile_onceFlag = false;
            const artBase = Module.findBaseAddress("libart.so");
            const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv");
            Interceptor.attach(GetObsoleteDexCacheAddr, {
                onEnter(args) {
                    LOGW(`onEnter GetObsoleteDexCacheAddr -> ${args[0]} -> ${args[0].readPointer()}`);
                }, onLeave(retval) {
                    LOGW(`onLeave GetObsoleteDexCacheAddr -> ${retval} -> ${retval.readPointer()}`);
                }
            });
            const branchAddr = artBase.add(0x16C194);
            Interceptor.attach(branchAddr, {
                onEnter(args) {
                    const ctx = this.context;
                    const x0 = ctx.x0;
                    LOGW(`onEnter branchAddr -> PID:${Process.getCurrentThreadId()}-> ${x0} -> ${ptr(x0.readU32())}`);
                }
            });
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
    test() {
        LOGD(`GetInvokeType -> ${this.GetInvokeType()}`);
        LOGD(`GetRuntimeMethodName -> ${this.GetRuntimeMethodName()}`);
        LOGD(`dex_code_item_offset_ -> ${this.dex_code_item_offset} -> ${ptr(this.dex_code_item_offset)}`);
        LOGD(`dex_method_index -> ${ptr(this.dex_method_index)}`);
        LOGD(`GetRuntimeMethodName -> ${this.GetRuntimeMethodName()}`);
        LOGD(`access_flags_string -> ${this.access_flags_string}`);
        LOGD(`GetQuickenedInfo -> ${this.GetQuickenedInfo()}`);
        LOGD(`entry_point_from_quick_compiled_code -> ${this.entry_point_from_quick_compiled_code}`);
    }
    show = (num) => this.showSmali(num);
    showSmali(num = -1, info = false, loopMax = 100) {
        const accessor = this.DexInstructions();
        const dex_file = this.GetDexFile();
        let insns = accessor.InstructionAt();
        newLine();
        if (num != -1)
            LOGD(`↓accessor↓\n${accessor}\n`);
        if (info) {
            LOGD(`↓ArtMethod↓\n${this}\n`);
            LOGD(`↓dex_file↓\n${dex_file}\n`);
            if (num == -1)
                LOGD(`↓accessor↓\n${accessor}\n`);
            newLine();
        }
        let offset = 0;
        let insns_num = 0;
        let count_num = num;
        const count_insns = accessor.insns_size_in_code_units * 2;
        while (true) {
            const offStr = `[${(++insns_num).toString().padStart(3, ' ')}|${ptr(offset).toString().padEnd(5, ' ')}]`;
            LOGD(`${offStr} ${insns.handle} - ${insns.dumpHexLE()} | ${insns.dumpString(dex_file)}`);
            offset += insns.SizeInCodeUnits;
            if (count_num != -1) {
                if (--count_num <= 0)
                    break;
            }
            else {
                if (offset >= count_insns)
                    break;
            }
            insns = insns.Next();
        }
        newLine();
    }
}
exports.ArtMethod = ArtMethod;
Reflect.set(globalThis, 'ArtMethod', ArtMethod);
},{"../../../../../tools/StdString":39,"../../../../../tools/enum":41,"../../../../../tools/modifiers":44,"../../../../JSHandle":9,"../CodeItemInstructionAccessor":16,"../GcRoot":19,"../OatQuickMethodHeader":22,"../ObjPtr":23,"./ArtClass":26,"./DexCache":30}],28:[function(require,module,exports){
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
},{"../../../../Object":10}],29:[function(require,module,exports){
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
},{"../../../../Object":10}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexCache = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const StdString_1 = require("../../../../../tools/StdString");
const Object_1 = require("../../../../Object");
const DexFile_1 = require("../DexFile");
const Globals_1 = require("../Globals");
class DexCache extends Object_1.ArtObject {
    location_ = this.currentHandle.add(0);
    num_preresolved_strings_ = this.currentHandle.add(0x4);
    dex_file_ = this.currentHandle.add(0x4 * 2);
    preresolved_strings_ = this.currentHandle.add(0x4 * 2 + 0x8 * 1);
    resolved_call_sites_ = this.currentHandle.add(0x4 * 2 + 0x8 * 2);
    resolved_fields_ = this.currentHandle.add(0x4 * 2 + 0x8 * 3);
    resolved_methods_ = this.currentHandle.add(0x4 * 2 + 0x8 * 4);
    resolved_types_ = this.currentHandle.add(0x4 * 2 + 0x8 * 5);
    strings_ = this.currentHandle.add(0x4 * 2 + 0x8 * 6);
    num_resolved_call_sites_ = this.currentHandle.add(0x4 * 2 + 0x8 * 7);
    num_resolved_fields_ = this.currentHandle.add(0x4 * 3 + 0x8 * 7);
    num_resolved_method_types_ = this.currentHandle.add(0x4 * 4 + 0x8 * 7);
    num_resolved_methods_ = this.currentHandle.add(0x4 * 5 + 0x8 * 7);
    num_resolved_types_ = this.currentHandle.add(0x4 * 6 + 0x8 * 7);
    num_strings_ = this.currentHandle.add(0x4 * 7 + 0x8 * 7);
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `DexCache<P:${this.handle}|C:${this.currentHandle}>`;
        return disp;
    }
    get SizeOfClass() {
        return super.SizeOfClass + (Globals_1.PointerSize * 8 + 0x4 * 6);
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    get location() {
        return new HeapReference_1.HeapReference((handle) => new StdString_1.StdString(handle), ptr(this.location_.readU32()));
    }
    get num_preresolved_strings() {
        return this.num_preresolved_strings_.readU32();
    }
    get dex_file() {
        return new DexFile_1.DexFile(this.dex_file_.readPointer());
    }
    get preresolved_strings() {
        return this.preresolved_strings_.readPointer();
    }
    get resolved_call_sites() {
        return this.resolved_call_sites_.readPointer();
    }
    get resolved_fields() {
        return this.resolved_fields_.readPointer();
    }
    get resolved_methods() {
        return this.resolved_methods_.readPointer();
    }
    get resolved_types() {
        return this.resolved_types_.readPointer();
    }
    get strings() {
        return this.strings_.readPointer();
    }
    get num_resolved_call_sites() {
        return this.num_resolved_call_sites_.readU32();
    }
    get num_resolved_fields() {
        return this.num_resolved_fields_.readU32();
    }
    get num_resolved_method_types() {
        return this.num_resolved_method_types_.readU32();
    }
    get num_resolved_methods() {
        return this.num_resolved_methods_.readU32();
    }
    get num_resolved_types() {
        return this.num_resolved_types_.readU32();
    }
    get num_strings() {
        return this.num_strings_.readU32();
    }
}
exports.DexCache = DexCache;
Reflect.set(globalThis, "DexCache", DexCache);
},{"../../../../../tools/StdString":39,"../../../../Interface/art/mirror/HeapReference":5,"../../../../Object":10,"../DexFile":18,"../Globals":20}],31:[function(require,module,exports){
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
},{"../../../../Object":10}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":26,"./ArtMethod":27,"./ClassExt":28,"./ClassLoader":29,"./IfTable":31}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":25}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":33}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Object");
require("./JSHandle");
require("./android");
require("./machine-code");
require("./implements/include");
require("./Interface/include");
require("./Utils/include");
},{"./Interface/include":8,"./JSHandle":9,"./Object":10,"./Utils/include":12,"./android":13,"./implements/include":34,"./machine-code":36}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":2,"./android/include":35,"./tools/include":42}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./include");
globalThis.testArtMethod = () => {
    Java.perform(() => {
        var JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"));
        pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").showSmali();
    });
};
},{"./include":37}],39:[function(require,module,exports){
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
        if (!isTiny)
            Java.api.$delete(data);
    }
    static fromPointers(ptrs) {
        if (ptrs.length != 3)
            return '';
        const stdString = new StdString();
        stdString.handle.writePointer(ptrs[0]);
        stdString.handle.add(Process.pointerSize).writePointer(ptrs[1]);
        stdString.handle.add(2 * Process.pointerSize).writePointer(ptrs[2]);
        return stdString.disposeToString();
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
globalThis.StdString = StdString;
},{}],40:[function(require,module,exports){
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
},{}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
},{"./StdString":39,"./common":40,"./enum":41,"./logger":43,"./modifiers":44}],43:[function(require,module,exports){
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
},{}],44:[function(require,module,exports){
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
globalThis.PrettyAccessFlags = (access_flags) => ArtModifiers.PrettyAccessFlags(access_flags);
Reflect.set(globalThis, "ArtModifiers", ArtModifiers);
},{}]},{},[38])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9JbnRlcmZhY2UvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL0hlYXBSZWZlcmVuY2UudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9KU0hhbmRsZS50cyIsImFnZW50L2FuZHJvaWQvT2JqZWN0LnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9BcnRNZXRob2RIZWxwZXIudHMiLCJhZ2VudC9hbmRyb2lkL1V0aWxzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2FuZHJvaWQudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0NvZGVJdGVtRGF0YUFjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9Db2RlSXRlbURlYnVnSW5mb0FjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9Db2RlSXRlbUluc3RydWN0aW9uQWNjZXNzb3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0NvbXBhY3REZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9EZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9HY1Jvb3QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0dsb2JhbHMudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydWN0aW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXRRdWlja01ldGhvZEhlYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2JqUHRyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TdGFuZGFyZERleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRDbGFzcy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0FydE1ldGhvZC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzRXh0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQ2xhc3NMb2FkZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9EZXhDYWNoZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0lmVGFibGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvbWFjaGluZS1jb2RlLmpzIiwiYWdlbnQvaW5jbHVkZS50cyIsImFnZW50L21haW4udHMiLCJhZ2VudC90b29scy9TdGRTdHJpbmcudHMiLCJhZ2VudC90b29scy9jb21tb24udHMiLCJhZ2VudC90b29scy9lbnVtLnRzIiwiYWdlbnQvdG9vbHMvaW5jbHVkZS50cyIsImFnZW50L3Rvb2xzL2xvZ2dlci50cyIsImFnZW50L3Rvb2xzL21vZGlmaWVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0FB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RSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUM7UUFDYixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUM7UUFDYixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7S0FDZixDQUFDLENBQUE7SUFFTSxNQUFNLEdBQVcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUVyRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUE7SUFDckQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxD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QUFDLFdBQVcsR0FBVyxTQUFTLENBQUE7SUFDdEMsTUFBTSxDQUFDLGFBQWEsR0FBRyxDQUFDLEtBQWUsRUFBVSxFQUFFLENBQUMsUUFBUSxLQUFlLEdBQUcsQ0FBQTtJQUU5RSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUE7SUFFakMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDM0QsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxD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
