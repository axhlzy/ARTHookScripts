(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getApplication() {
    let application = null;
    Java.perform(function () {
        application = Java.use("android.app.ActivityThread").currentApplication();
    });
    return application;
}
function getPackageName() {
    let packageName = '';
    Java.perform(function () {
        let currentApplication = Java.use("android.app.ActivityThread").currentApplication();
        packageName = currentApplication.getApplicationContext().getPackageName();
    });
    return packageName;
}
function getCacheDir() {
    let path = '';
    Java.perform(function () {
        let currentApplication = Java.use("android.app.ActivityThread").currentApplication();
        path = currentApplication.getApplicationContext().getCacheDir().getPath();
    });
    return path;
}
function getFilesDir() {
    let path = '';
    Java.perform(function () {
        let currentApplication = Java.use("android.app.ActivityThread").currentApplication();
        path = currentApplication.getApplicationContext().getFilesDir().getPath();
    });
    return path;
}
globalThis.getApplication = getApplication;
globalThis.getPackageName = getPackageName;
globalThis.getCacheDir = getCacheDir;
globalThis.getFilesDir = getFilesDir;
},{}],2:[function(require,module,exports){
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
},{"../android/implements/10/art/mirror/ArtMethod":35}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JavaUtil");
require("./Context");
},{"./Context":1,"./JavaUtil":2}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./mirror/include");
require("./SizeOfClass");
},{"./SizeOfClass":4,"./mirror/include":8}],6:[function(require,module,exports){
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
},{"../../../JSHandle":10}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./HeapReference");
require("./IArtMethod");
},{"./HeapReference":6,"./IArtMethod":7}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":5}],10:[function(require,module,exports){
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
    get VirtualTableList() {
        if (this.VirtualClassOffset === Process.pointerSize) {
            const vtable = this.handle.readPointer();
            const vtableList = [];
            let i = 0;
            while (true) {
                const vtableItem = vtable.add(i * Process.pointerSize).readPointer();
                if (vtableItem.isNull())
                    break;
                vtableList.push(vtableItem);
                i++;
            }
            return vtableList;
        }
        return [];
    }
    VirtualTablePrint() {
        this.VirtualTableList.map((item, index) => `[${index}] ${item}`).forEach(LOGD);
    }
    show() {
        LOGD(this.toString());
    }
}
exports.JSHandle = JSHandle;
},{}],11:[function(require,module,exports){
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
},{"./Interface/art/mirror/HeapReference":6,"./JSHandle":10,"./implements/10/art/Globals":19}],12:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceManager = void 0;
const DefineClass_1 = require("./start/DefineClass");
const OpenCommon_1 = require("./start/OpenCommon");
class TraceManager {
    static startTrace(name) {
        console.log("startTrace", name);
    }
    static stopTrace(name) {
        console.log("stopTrace", name);
    }
    static TraceJava2Java() {
    }
    static TraceJava2Native() {
    }
    static TraceNative2Java() {
    }
    static TraceNative2Native() {
    }
    static Trace_OpenCommon() {
        setImmediate(() => { OpenCommon_1.OpenCommonHookManager.getInstance().enableHook(); });
    }
    static Trace_DefineClass() {
        setImmediate(() => { DefineClass_1.DefineClassHookManager.getInstance().enableHook(); });
    }
}
exports.TraceManager = TraceManager;
}).call(this)}).call(this,require("timers").setImmediate)

},{"./start/DefineClass":49,"./start/OpenCommon":51,"timers":65}],13:[function(require,module,exports){
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
},{"../implements/10/art/mirror/ArtMethod":35}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSym = exports.callSym = void 0;
const JSHandle_1 = require("../JSHandle");
function callSymLocal(address, retType, argTypes, ...args) {
    return new NativeFunction(address, retType, argTypes)(...args);
}
function transformArgs(args, argTypes) {
    return args.map((arg, index) => {
        if (argTypes[index] == "int")
            return parseInt(arg.toString());
        if (arg instanceof NativePointer)
            return arg;
        if (arg instanceof JSHandle_1.JSHandle)
            return arg.handle;
        if (typeof arg === "number")
            return arg;
        if (typeof arg === "string")
            return Memory.allocUtf8String(arg);
        return ptr(arg);
    });
}
function callSym(sym, md, retType, argTypes, ...args) {
    const address = getSym(sym, md);
    return callSymLocal(address, retType, argTypes, ...transformArgs(args, argTypes));
}
exports.callSym = callSym;
function getSym(symName, md, check = false) {
    if (symName == undefined || md == null || symName == "" || md == "") {
        throw new Error(`Usage: getSym(symName: string, md: string, check: boolean = false)`);
    }
    const module = Process.getModuleByName(md);
    if (module == null) {
        throw new Error(`module ${md} not found`);
    }
    const address = module.findExportByName(symName);
    if (address == null) {
        throw new Error(`symbol ${symName} not found`);
    }
    if (check) {
        const syms = module.enumerateSymbols().filter((sym) => {
            return sym.name == symName && sym.type == "object";
        });
        if (syms.length == 0) {
            throw new Error(`symbol ${symName} not found`);
        }
        else {
        }
    }
    return address;
}
exports.getSym = getSym;
globalThis.callSym = callSym;
globalThis.getSym = getSym;
},{"../JSHandle":10}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtMethodHelper");
require("./SymHelper");
},{"./ArtMethodHelper":13,"./SymHelper":14}],16:[function(require,module,exports){
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
},{"./machine-code":48}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassLinker = void 0;
const JSHandle_1 = require("../../../JSHandle");
const Globals_1 = require("./Globals");
class ClassLinker extends JSHandle_1.JSHandle {
    boot_class_path_ = this.CurrentHandle;
    boot_dex_files_ = this.boot_class_path_.add(Globals_1.PointerSize);
    dex_caches_ = this.boot_dex_files_.add(Globals_1.PointerSize);
    class_loaders_ = this.dex_caches_.add(Globals_1.PointerSize);
    boot_class_table_ = this.class_loaders_.add(Globals_1.PointerSize);
    new_class_roots_ = this.boot_class_table_.add(Globals_1.PointerSize);
    new_bss_roots_boot_oat_files_ = this.new_class_roots_.add(Globals_1.PointerSize);
    failed_dex_cache_class_lookups_ = this.new_bss_roots_boot_oat_files_.add(Globals_1.PointerSize);
    class_roots_ = this.failed_dex_cache_class_lookups_.add(Globals_1.PointerSize);
    static kFindArrayCacheSize = ptr(16);
    find_array_class_cache_ = this.class_roots_.add(0x4);
    find_array_class_cache_next_victim_ = this.find_array_class_cache_.add(0x4);
    init_done_ = this.find_array_class_cache_next_victim_.add(Globals_1.PointerSize);
    log_new_roots_ = this.init_done_.add(Globals_1.PointerSize);
    fast_class_not_found_exceptions_ = this.log_new_roots_.add(Globals_1.PointerSize);
    quick_resolution_trampoline_ = this.fast_class_not_found_exceptions_.add(Globals_1.PointerSize);
    quick_imt_conflict_trampoline_ = this.quick_resolution_trampoline_.add(Globals_1.PointerSize);
    quick_generic_jni_trampoline_ = this.quick_imt_conflict_trampoline_.add(Globals_1.PointerSize);
    quick_to_interpreter_bridge_trampoline_ = this.quick_generic_jni_trampoline_.add(Globals_1.PointerSize);
    image_pointer_size_ = this.quick_to_interpreter_bridge_trampoline_.add(Globals_1.PointerSize);
    cha_ = this.image_pointer_size_.add(Globals_1.PointerSize);
    constructor(handle) {
        super(handle);
    }
    get CurrentHandle() {
        return this.handle;
    }
    get SizeOfClass() {
        return this.cha_.add(Globals_1.PointerSize).sub(this.handle).toInt32();
    }
    toString() {
        let disp = `ClassLinker<${this.handle}>`;
        return disp;
    }
    IsReadOnly() {
        return callSym("_ZNK3art7DexFile10IsReadOnlyEv", "libdexfile.so", "bool", ["pointer"], this.handle);
    }
    LookupClass(descriptor, class_loader) {
        return callSym("_ZN3art11ClassLinker11LookupClassEPNS_6ThreadEPKcNS_6ObjPtrINS_6mirror11ClassLoaderEEE", "libart.so", "pointer", ["pointer", "pointer", "pointer"], this.handle, Memory.allocUtf8String(descriptor), class_loader);
    }
}
exports.ClassLinker = ClassLinker;
},{"../../../JSHandle":10,"./Globals":19}],18:[function(require,module,exports){
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
},{"../../../JSHandle":10}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
        const kInstructionNames_ptr = getSym('_ZN3art11Instruction17kInstructionNamesE', 'libdexfile.so', true);
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
        const kInstructionDescriptors_ptr = getSym('_ZN3art11Instruction23kInstructionDescriptorsE', 'libdexfile.so', true);
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
        return StdString_1.StdString.fromPointers(callSym("_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "pointer"], this, dexFile));
    }
    dumpHex(code_units = 3) {
        return StdString_1.StdString.fromPointers(callSym("_ZNK3art11Instruction7DumpHexEm", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "pointer"], this.handle, code_units));
    }
    dumpHexLE(instr_code_units = 3) {
        const realInsLen = this.SizeInCodeUnits / 2;
        const result = callSym("_ZNK3art11Instruction9DumpHexLEEm", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "int"], this.handle, realInsLen > instr_code_units ? realInsLen : instr_code_units);
        return `${realInsLen} - ${StdString_1.StdString.fromPointers(result)}`;
    }
    sizeInCodeUnitsComplexOpcode() {
        return callSym("_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv", "libdexfile.so", ["pointer", "pointer"], ["pointer"], this.handle);
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
},{"../../../../tools/StdString":56,"../../../JSHandle":10}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OatDexFile = void 0;
const StdString_1 = require("../../../../../tools/StdString");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
const OatFile_1 = require("./OatFile");
class OatDexFile extends JSHandle_1.JSHandle {
    oat_file_ = this.CurrentHandle;
    dex_file_location_ = this.oat_file_.add(Globals_1.PointerSize);
    canonical_dex_file_location_ = this.dex_file_location_.add(Globals_1.PointerSize * 3);
    dex_file_location_checksum_ = this.canonical_dex_file_location_.add(Globals_1.PointerSize * 3);
    dex_file_pointer_ = this.dex_file_location_checksum_.add(Globals_1.PointerSize);
    lookup_table_data_ = this.dex_file_pointer_.add(Globals_1.PointerSize);
    method_bss_mapping_ = this.lookup_table_data_.add(Globals_1.PointerSize);
    type_bss_mapping_ = this.method_bss_mapping_.add(Globals_1.PointerSize);
    string_bss_mapping_ = this.type_bss_mapping_.add(Globals_1.PointerSize);
    oat_class_offsets_pointer_ = this.string_bss_mapping_.add(Globals_1.PointerSize);
    lookup_table_ = this.oat_class_offsets_pointer_.add(Globals_1.PointerSize);
    dex_layout_sections_ = this.lookup_table_.add(Globals_1.PointerSize);
    constructor(handle) {
        super(handle);
    }
    get SizeOfClass() {
        return this.dex_layout_sections_.add(Globals_1.PointerSize).sub(this.CurrentHandle).toInt32();
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    get VirtualClassOffset() {
        return 0;
    }
    toString() {
        let disp = `OatDexFile<${this.handle}>`;
        disp += `\n\t oat_file = ${this.oat_file_}`;
        disp += `\n\t dex_file_location = ${this.dex_file_location} @ ${this.dex_file_location_}`;
        disp += `\n\t canonical_dex_file_location = ${this.canonical_dex_file_location} @ ${this.canonical_dex_file_location_}`;
        disp += `\n\t dex_file_location_checksum = ${this.dex_file_location_checksum} | ${ptr(this.dex_file_location_checksum)} @ ${this.dex_file_location_checksum_}`;
        disp += `\n\t dex_file_pointer = ${this.dex_file_pointer} @ ${this.dex_file_pointer_}`;
        disp += `\n\t lookup_table_data = ${this.lookup_table_data} @ ${this.lookup_table_data_}`;
        disp += `\n\t method_bss_mapping = ${this.method_bss_mapping} @ ${this.method_bss_mapping_}`;
        disp += `\n\t type_bss_mapping = ${this.type_bss_mapping} @ ${this.type_bss_mapping_}`;
        disp += `\n\t string_bss_mapping = ${this.string_bss_mapping} @ ${this.string_bss_mapping_}`;
        disp += `\n\t oat_class_offsets_pointer = ${this.oat_class_offsets_pointer} @ ${this.oat_class_offsets_pointer_}`;
        disp += `\n\t lookup_table = ${this.lookup_table} @ ${this.lookup_table_}`;
        disp += `\n\t dex_layout_sections = ${this.dex_layout_sections} @ ${this.dex_layout_sections_}`;
        return disp;
    }
    get oat_file() {
        return new OatFile_1.OatFile(this.oat_file_.readPointer());
    }
    get dex_file_location() {
        return new StdString_1.StdString(this.dex_file_location_).toString();
    }
    get canonical_dex_file_location() {
        return new StdString_1.StdString(this.canonical_dex_file_location_).toString();
    }
    get dex_file_location_checksum() {
        return this.dex_file_location_checksum_.readUInt();
    }
    get dex_file_pointer() {
        return this.dex_file_pointer_.readPointer();
    }
    get lookup_table_data() {
        return this.lookup_table_data_.readPointer();
    }
    get method_bss_mapping() {
        return this.method_bss_mapping_.readPointer();
    }
    get type_bss_mapping() {
        return this.type_bss_mapping_.readPointer();
    }
    get string_bss_mapping() {
        return this.string_bss_mapping_.readPointer();
    }
    get oat_class_offsets_pointer() {
        return this.oat_class_offsets_pointer_.readU32();
    }
    get lookup_table() {
        return this.lookup_table_.readPointer();
    }
    get dex_layout_sections() {
        return this.dex_layout_sections_.readPointer();
    }
}
exports.OatDexFile = OatDexFile;
},{"../../../../../tools/StdString":56,"../../../../JSHandle":10,"../Globals":19,"./OatFile":22}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OatFile = void 0;
const StdString_1 = require("../../../../../tools/StdString");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
class OatFile extends JSHandle_1.JSHandle {
    location_ = this.currentHandle;
    vdex_ = this.location_.add(Globals_1.PointerSize * 3);
    begin_ = this.vdex_.add(Globals_1.PointerSize);
    end_ = this.begin_.add(Globals_1.PointerSize);
    data_bimg_rel_ro_begin_ = this.end_.add(Globals_1.PointerSize);
    data_bimg_rel_ro_end_ = this.data_bimg_rel_ro_begin_.add(Globals_1.PointerSize);
    bss_begin_ = this.data_bimg_rel_ro_end_.add(Globals_1.PointerSize);
    bss_end_ = this.bss_begin_.add(Globals_1.PointerSize);
    bss_methods_ = this.bss_end_.add(Globals_1.PointerSize);
    bss_roots_ = this.bss_methods_.add(Globals_1.PointerSize);
    is_executable_ = this.bss_roots_.add(Globals_1.PointerSize);
    vdex_begin_ = this.is_executable_.add(Globals_1.PointerSize);
    vdex_end_ = this.vdex_begin_.add(Globals_1.PointerSize);
    oat_dex_files_storage_ = this.vdex_end_.add(Globals_1.PointerSize);
    oat_dex_files_ = this.oat_dex_files_storage_.add(Globals_1.PointerSize);
    secondary_lookup_lock_ = this.oat_dex_files_.add(Globals_1.PointerSize);
    secondary_oat_dex_files_ = this.secondary_lookup_lock_.add(Globals_1.PointerSize);
    string_cache_ = this.secondary_oat_dex_files_.add(Globals_1.PointerSize);
    uncompressed_dex_files_ = this.string_cache_.add(Globals_1.PointerSize);
    constructor(handle) {
        super(handle);
    }
    get SizeOfClass() {
        return this.uncompressed_dex_files_.add(Globals_1.PointerSize).sub(this.CurrentHandle).toInt32();
    }
    get VirtualClassOffset() {
        return Globals_1.PointerSize;
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    toString() {
        let disp = `OatFile<${this.handle}>`;
        disp += `\n\tlocation_: ${this.location} @ ${this.location_}`;
        disp += `\n\tbegin: ${this.begin} | end: ${this.end}`;
        disp += `\n\tdata_bimg_rel_ro_begin: ${this.data_bimg_rel_ro_begin} | data_bimg_rel_ro_end: ${this.data_bimg_rel_ro_end}`;
        disp += `\n\tbss_begin: ${this.bss_begin} | bss_end: ${this.bss_end}`;
        disp += `\n\tbss_methods: ${this.bss_methods} | bss_roots: ${this.bss_roots}`;
        disp += `\n\tis_executable: ${this.is_executable}`;
        disp += `\n\tvdex_begin: ${this.vdex_begin} | vdex_end: ${this.vdex_end}`;
        disp += `\n\toat_dex_files_storage: ${this.oat_dex_files_storage} | oat_dex_files: ${this.oat_dex_files}`;
        return disp;
    }
    get location() {
        return new StdString_1.StdString(this.location_).toString();
    }
    get begin() {
        return this.begin_.readPointer();
    }
    get end() {
        return this.end_.readPointer();
    }
    get data_bimg_rel_ro_begin() {
        return this.data_bimg_rel_ro_begin_.readPointer();
    }
    get data_bimg_rel_ro_end() {
        return this.data_bimg_rel_ro_end_.readPointer();
    }
    get bss_begin() {
        return this.bss_begin_.readPointer();
    }
    get bss_end() {
        return this.bss_end_.readPointer();
    }
    get bss_methods() {
        return this.bss_methods_.readPointer();
    }
    get bss_roots() {
        return this.bss_roots_.readPointer();
    }
    get is_executable() {
        return this.is_executable_.readU8() === 1;
    }
    get vdex_begin() {
        return this.vdex_begin_.readPointer();
    }
    get vdex_end() {
        return this.vdex_end_.readPointer();
    }
    get oat_dex_files_storage() {
        return this.oat_dex_files_storage_.readPointer();
    }
    get oat_dex_files() {
        return this.oat_dex_files_.readPointer();
    }
    get secondary_lookup_lock() {
        return this.secondary_lookup_lock_.readPointer();
    }
    get secondary_oat_dex_files() {
        return this.secondary_oat_dex_files_.readPointer();
    }
    get string_cache() {
        return this.string_cache_.readPointer();
    }
    get uncompressed_dex_files() {
        return this.uncompressed_dex_files_.readPointer();
    }
}
exports.OatFile = OatFile;
},{"../../../../../tools/StdString":56,"../../../../JSHandle":10,"../Globals":19}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./OatFile");
require("./OatDexFile");
},{"./OatDexFile":21,"./OatFile":22}],24:[function(require,module,exports){
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
},{"../../../JSHandle":10}],25:[function(require,module,exports){
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
},{"./CodeItemInstructionAccessor":27}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeItemDebugInfoAccessor = void 0;
const CodeItemDataAccessor_1 = require("./CodeItemDataAccessor");
const Globals_1 = require("../Globals");
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
},{"../Globals":19,"./CodeItemDataAccessor":25}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeItemInstructionAccessor = void 0;
const StandardDexFile_1 = require("./StandardDexFile");
const CompactDexFile_1 = require("./CompactDexFile");
const Globals_1 = require("../Globals");
const JSHandle_1 = require("../../../../JSHandle");
const Instruction_1 = require("../Instruction");
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
},{"../../../../JSHandle":10,"../Globals":19,"../Instruction":20,"./CompactDexFile":28,"./StandardDexFile":30}],28:[function(require,module,exports){
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
},{"./DexFile":29}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexFile_CodeItem = exports.DexFile = void 0;
const StdString_1 = require("../../../../../tools/StdString");
const JSHandle_1 = require("../../../../JSHandle");
const OatDexFile_1 = require("../Oat/OatDexFile");
const Globals_1 = require("../Globals");
class DexFile extends JSHandle_1.JSHandle {
    static Standard_InsnsOffset = 0x2 * 4 + 0x4 * 2;
    static Compact_InsnsOffset = 0x2 * 4 + 0x4 * 1;
    v_table = this.handle;
    begin_ = this.currentHandle;
    size_ = this.begin_.add(Globals_1.PointerSize * 1);
    data_begin_ = this.size_.add(Globals_1.PointerSize * 1);
    data_size_ = this.data_begin_.add(Globals_1.PointerSize * 1);
    location_ = this.data_size_.add(Globals_1.PointerSize * 1);
    location_checksum_ = this.location_.add(Globals_1.PointerSize * 3);
    header_ = this.location_checksum_.add(0x4).add(0x4);
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
        let disp = `DexFile<${this.handle}>`;
        disp += `\n\t location: ${this.location}`;
        disp += `\n\t location_checksum: ${this.location_checksum} ( ${ptr(this.location_checksum)} ) is_compact_dex: ${this.is_compact_dex}`;
        disp += `\n\t begin: ${this.begin} size: ${this.size} ( ${ptr(this.size)} ) | data_begin: ${this.data_begin} data_size: ${this.data_size} ( ${ptr(this.data_size)} )`;
        disp += `\n\t oat_dex_file_ ${this.oat_dex_file_}`;
        return disp;
    }
    PrettyMethod(method_idx, with_signature = true) {
        return new StdString_1.StdString(callSym("_ZNK3art7DexFile12PrettyMethodEjb", "libdexfile.so", "pointer", ["pointer", "pointer", "pointer"], this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL)).disposeToString();
    }
    CalculateChecksum() {
        return callSym("_ZNK3art7DexFile17CalculateChecksumEv", "libdexfile.so", "uint32", ["pointer"], this.handle);
    }
    IsReadOnly() {
        return callSym("_ZNK3art7DexFile10IsReadOnlyEv", "libdexfile.so", "bool", ["pointer"], this.handle);
    }
    DisableWrite() {
        return callSym("_ZNK3art7DexFile12DisableWriteEv", "libdexfile.so", "bool", ["pointer"], this.handle);
    }
    EnableWrite() {
        return callSym("_ZNK3art7DexFile11EnableWriteEv", "libdexfile.so", "bool", ["pointer"], this.handle);
    }
    PrettyType(type_idx) {
        return callSym("_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE", "libdexfile.so", "pointer", ["pointer", "pointer"], this.handle, ptr(type_idx));
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
        try {
            return new StdString_1.StdString(this.location_).toString();
        }
        catch (error) {
            return "ERROR";
        }
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
        return new OatDexFile_1.OatDexFile(this.oat_dex_file_.readPointer());
    }
    get container() {
        return this.container_.readPointer();
    }
    get is_compact_dex() {
        try {
            return this.begin.readCString() == "cdex001";
            return this.is_compact_dex_.readU8() === 1;
        }
        catch (error) {
            return false;
        }
    }
    get hiddenapi_domain() {
        return this.hiddenapi_domain_.readPointer();
    }
    get DexInstsOffset() {
        return this.is_compact_dex ? DexFile.Compact_InsnsOffset : DexFile.Standard_InsnsOffset;
    }
    dump(fileName, path) {
        let dexLocation = this.location;
        dexLocation = dexLocation.substring(dexLocation.lastIndexOf("/") + 1);
        let localName = fileName == undefined ? `${this.begin}_${this.size}_${dexLocation}` : fileName;
        let localPath = path == undefined ? getFilesDir() : path;
        dumpMem(this.begin, this.size, localName, localPath, false);
        LOGZ(`\t[SaveTo] => ${localPath}/${localName}`);
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
},{"../../../../../tools/StdString":56,"../../../../JSHandle":10,"../Globals":19,"../Oat/OatDexFile":21}],30:[function(require,module,exports){
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
},{"./DexFile":29}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./CodeItemDataAccessor");
require("./CodeItemDebugInfoAccessor");
require("./CodeItemInstructionAccessor");
require("./CompactDexFile");
require("./StandardDexFile");
require("./DexFile");
},{"./CodeItemDataAccessor":25,"./CodeItemDebugInfoAccessor":26,"./CodeItemInstructionAccessor":27,"./CompactDexFile":28,"./DexFile":29,"./StandardDexFile":30}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ClassLinker");
require("./Globals");
require("./GcRoot");
require("./Instruction");
require("./runtime/OatQuickMethodHeader");
require("./ObjPtr");
require("./dexfile/include");
require("./interpreter/include");
require("./mirror/include");
require("./Oat/include");
require("./runtime/include");
},{"./ClassLinker":17,"./GcRoot":18,"./Globals":19,"./Instruction":20,"./Oat/include":23,"./ObjPtr":24,"./dexfile/include":31,"./interpreter/include":33,"./mirror/include":40,"./runtime/OatQuickMethodHeader":41,"./runtime/include":42}],33:[function(require,module,exports){

},{}],34:[function(require,module,exports){
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
},{"../../../../../tools/StdString":56,"../../../../Interface/art/mirror/HeapReference":6,"../../../../Object":11,"./ClassExt":36,"./ClassLoader":37,"./DexCache":38,"./IfTable":39}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const OatQuickMethodHeader_1 = require("../runtime/OatQuickMethodHeader");
const modifiers_1 = require("../../../../../tools/modifiers");
const StdString_1 = require("../../../../../tools/StdString");
const enum_1 = require("../../../../../tools/enum");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
const ArtClass_1 = require("./ArtClass");
const DexCache_1 = require("./DexCache");
const GcRoot_1 = require("../GcRoot");
const CodeItemInstructionAccessor_1 = require("../dexfile/CodeItemInstructionAccessor");
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
    get jniCode() {
        return this.data;
    }
    get entry_point_from_quick_compiled_code() {
        return this.ptr_sized_fields_.entry_point_from_quick_compiled_code_.readPointer();
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
    PrettyJavaAccessFlags() {
        return StdString_1.StdString.fromPointers(callSym("_ZN3art21PrettyJavaAccessFlagsEj", "libdexfile.so", ['pointer', 'pointer', 'pointer'], ['pointer', 'uint32'], this, this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()));
    }
    GetObsoleteDexCache() {
        return new DexCache_1.DexCache(callSym("_ZN3art9ArtMethod19GetObsoleteDexCacheEv", "libart.so", 'pointer', ['pointer'], this.handle));
    }
    GetCodeItem() {
        const dexCodeItemOffset = this.dex_code_item_offset;
        if (dexCodeItemOffset == 0)
            return ptr(0);
        const dexFile = this.GetDexFile();
        return dexFile.data_begin.add(dexCodeItemOffset);
    }
    GetDexCache() {
        let access_flags = this.handle.add(0x4).readU32();
        if ((access_flags & modifiers_1.ArtModifiers.kAccObsoleteMethod) != 0) {
            return this.GetObsoleteDexCache();
        }
        else {
            return new DexCache_1.DexCache(this.declaring_class.root.dex_cache.root.handle);
        }
    }
    static checkDexFile_onceFlag = true;
    GetDexFile() {
        return this.GetDexCache().dex_file;
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
        return callSym("_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_", "libart.so", 'bool', ['pointer', 'pointer'], this.handle, other.handle);
    }
    GetRuntimeMethodName() {
        return callSym("_ZN3art9ArtMethod20GetRuntimeMethodNameEv", "libart.so", 'pointer', ['pointer'], this.handle);
    }
    SetNotIntrinsic() {
        return callSym("_ZN3art9ArtMethod15SetNotIntrinsicEv", "libart.so", 'void', ['pointer'], this.handle);
    }
    CopyFrom(src) {
        return callSym("_ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE", "libart.so", 'void', ['pointer', 'pointer', 'int'], this.handle, src.handle, Globals_1.PointerSize);
    }
    GetOatQuickMethodHeader(pc = 0) {
        return new OatQuickMethodHeader_1.OatQuickMethodHeader(callSym("_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm", "libart.so", 'pointer', ['pointer', 'pointer'], this.handle, pc));
    }
    FindObsoleteDexClassDefIndex() {
        return callSym("_ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv", "libart.so", 'int', ['pointer'], this.handle);
    }
    GetSingleImplementation() {
        return callSym("_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE", "libart.so", 'pointer', ['pointer', 'int'], this.handle, Process.pointerSize);
    }
    FindOverriddenMethod() {
        return callSym("_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE", "libart.so", 'pointer', ['pointer', 'int'], this.handle, Process.pointerSize);
    }
    IsOverridableByDefaultMethod() {
        return callSym("_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv", "libart.so", 'bool', ['pointer'], this.handle);
    }
    GetQuickenedInfo(dex_pc = 0) {
        return callSym("_ZN3art9ArtMethod16GetQuickenedInfoEv", "libart.so", 'int', ['pointer', 'int'], this, dex_pc);
    }
    JniShortName() {
        return StdString_1.StdString.fromPointers(callSym("_ZN3art9ArtMethod12JniShortNameEv", "libart.so", ['pointer', 'pointer', 'pointer'], ['pointer'], this.handle));
    }
    JniLongName() {
        return StdString_1.StdString.fromPointers(callSym("_ZN3art9ArtMethod11JniLongNameEv", "libart.so", ['pointer', 'pointer', 'pointer'], ['pointer'], this.handle));
    }
    RegisterNative(native_method) {
        return callSym("_ZN3art9ArtMethod14RegisterNativeEPKv", "libart.so", 'pointer', ['pointer', 'pointer'], this.handle, native_method);
    }
    RegisterNativeJS(native_method) {
        return this.RegisterNative(new NativeCallback(native_method, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']));
    }
    UnregisterNative() {
        return callSym("_ZN3art9ArtMethod16UnregisterNativeEv", "libart.so", 'void', ['pointer'], this.handle);
    }
    static NumArgRegisters(shorty) {
        return callSym("_ZN3art9ArtMethod15NumArgRegistersEPKc", "libart.so", 'int', ['pointer'], Memory.allocUtf8String(shorty));
    }
    GetInvokeType() {
        return enum_1.InvokeType.toString(callSym("_ZN3art9ArtMethod13GetInvokeTypeEv", "libart.so", 'int', ['pointer'], this.handle));
    }
    test() {
        LOGD(`GetInvokeType -> ${this.GetInvokeType()}`);
        LOGD(`GetRuntimeMethodName -> ${this.GetRuntimeMethodName()}`);
        LOGD(`dex_code_item_offset_ -> ${this.dex_code_item_offset} -> ${ptr(this.dex_code_item_offset)}`);
        LOGD(`dex_method_index -> ${ptr(this.dex_method_index)}`);
        LOGD(`GetRuntimeMethodName -> ${this.GetRuntimeMethodName()}`);
        LOGD(`access_flags_string -> ${this.access_flags_string}`);
        LOGD(`JniShortName -> ${this.JniShortName()}`);
        LOGD(`JniLongName -> ${this.JniLongName()}`);
        LOGD(`GetQuickenedInfo -> ${this.GetQuickenedInfo()}`);
        LOGD(`entry_point_from_quick_compiled_code -> ${this.entry_point_from_quick_compiled_code}`);
        newLine();
        LOGD(this.GetDexFile());
        LOGD(this.GetDexFile().oat_dex_file);
        LOGD(this.GetDexFile().oat_dex_file.oat_file);
    }
    show = (num) => {
        const debugInfo = DebugSymbol.fromAddress(this.entry_point_from_quick_compiled_code);
        debugInfo.moduleName == "base.odex" ? this.showOatAsm(num) : this.showSmali(num);
    };
    showSmali(num = -1, info = false) {
        const accessor = this.DexInstructions();
        const dex_file = this.GetDexFile();
        let insns = accessor.InstructionAt();
        if (!this.jniCode.isNull()) {
            LOGD(`👉 ${this}`);
            LOGE(`jniCode is not null -> ${this.jniCode}`);
            return;
        }
        LOGD(`↓dex_file↓\n${dex_file}\n`);
        LOGD(`👉 ${this}\n${this.getInfo()}`);
        if (info)
            LOGD(`↓accessor↓\n${accessor}\n`);
        let offset = 0;
        let insns_num = 0;
        let count_num = num;
        const count_insns = accessor.insns_size_in_code_units * 2;
        while (true) {
            const offStr = `[${(++insns_num).toString().padStart(3, ' ')}|${ptr(offset).toString().padEnd(5, ' ')}]`;
            LOGD(`${offStr} ${insns.handle} - ${insns.dumpHexLE()} | ${insns.dumpString(dex_file)}`);
            offset += insns.SizeInCodeUnits;
            if (count_num != -1) {
                if (--count_num <= 0 || ptr(offset).isNull())
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
    showOatAsm(num = 20) {
        let insns = Instruction.parse(this.entry_point_from_quick_compiled_code);
        newLine();
        LOGD(`👉 ${this}\n${this.getInfo()}`);
        LOGD(`↓insns↓\n`);
        let num_local = 0;
        let code_offset = 0;
        while (++num_local < num) {
            let indexStr = `[${num_local.toString().padStart(4, ' ')}|${ptr(code_offset).toString().padEnd(5, ' ')}]`;
            LOGD(`${indexStr} ${insns.address}\t${insns.toString()}`);
            code_offset += insns.size;
            insns = Instruction.parse(insns.next);
        }
        newLine();
    }
}
exports.ArtMethod = ArtMethod;
Reflect.set(globalThis, 'ArtMethod', ArtMethod);
},{"../../../../../tools/StdString":56,"../../../../../tools/enum":60,"../../../../../tools/modifiers":63,"../../../../JSHandle":10,"../GcRoot":18,"../Globals":19,"../dexfile/CodeItemInstructionAccessor":27,"../runtime/OatQuickMethodHeader":41,"./ArtClass":34,"./DexCache":38}],36:[function(require,module,exports){
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
},{"../../../../Object":11}],37:[function(require,module,exports){
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
},{"../../../../Object":11}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexCache = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const StdString_1 = require("../../../../../tools/StdString");
const Object_1 = require("../../../../Object");
const DexFile_1 = require("../dexfile/DexFile");
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
        disp += `\nlocation: ${ptr(this.location_.readU32()).add(Globals_1.PointerSize * 2).readCString()}`;
        disp += `\npreresolved_strings_: ${this.preresolved_strings} | num_preresolved_strings_: ${this.num_preresolved_strings} | resolved_call_sites_: ${this.resolved_call_sites}`;
        disp += `\nresolved_fields_: ${this.resolved_fields} | resolved_methods_: ${this.resolved_methods} | resolved_types_: ${this.resolved_types}`;
        disp += `\nstrings_: ${this.strings} | num_resolved_call_sites_: ${this.num_resolved_call_sites} | num_resolved_fields_: ${this.num_resolved_fields}`;
        disp += `\nnum_resolved_method_types_: ${this.num_resolved_method_types} | num_resolved_methods_: ${this.num_resolved_methods} | num_resolved_types_: ${this.num_resolved_types}`;
        disp += `\nnum_strings_: ${this.num_strings}`;
        return disp;
    }
    get SizeOfClass() {
        return super.SizeOfClass + (Globals_1.PointerSize * 8 + 0x4 * 6);
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    get location() {
        return new HeapReference_1.HeapReference(handle => new StdString_1.StdString(handle), this.location_);
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
},{"../../../../../tools/StdString":56,"../../../../Interface/art/mirror/HeapReference":6,"../../../../Object":11,"../Globals":19,"../dexfile/DexFile":29}],39:[function(require,module,exports){
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
},{"../../../../Object":11}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":34,"./ArtMethod":35,"./ClassExt":36,"./ClassLoader":37,"./IfTable":39}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OatQuickMethodHeader = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const kShouldDeoptimizeMask = 0x80000000;
const kCodeSizeMask = ~kShouldDeoptimizeMask;
class OatQuickMethodHeader extends JSHandle_1.JSHandle {
    vmap_table_offset_ = this.handle.add(0);
    code_size_ = this.handle.add(4);
    code_ = this.handle.add(8);
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `${this.handle} -> vmap_table_offset: ${this.vmap_table_offset} code_size: ${this.code_size} code: ${this.code}`;
    }
    get vmap_table_offset() {
        return this.vmap_table_offset_.readU32();
    }
    get code_size() {
        return this.code_size_.readU32();
    }
    get code() {
        return this.code_.readPointer();
    }
    GetOptimizedCodeInfoPtr() {
        return this.code.sub(this.vmap_table_offset_);
    }
    GetCodeSize() {
        return ptr(this.code_size).and(kCodeSizeMask).toUInt32();
    }
    GetCodeSizeAddr() {
        return this.code_size_;
    }
    IsOptimized() {
        return this.GetCodeSize() != 0 && this.vmap_table_offset != 0;
    }
}
exports.OatQuickMethodHeader = OatQuickMethodHeader;
},{"../../../../JSHandle":10}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./OatQuickMethodHeader");
},{"./OatQuickMethodHeader":41}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dex2oat = void 0;
const StdString_1 = require("../../../../tools/StdString");
class dex2oat {
    static GetCompilerExecutable(runtime) {
        const str = new StdString_1.StdString();
        callSym("_ZNK3art7Runtime21GetCompilerExecutableEv", "libart.so", ['pointer', 'pointer', 'pointer'], ['pointer', 'pointer'], runtime, str.handle);
        return str.disposeToString();
    }
}
exports.dex2oat = dex2oat;
Reflect.set(globalThis, 'dex2oat', dex2oat);
},{"../../../../tools/StdString":56}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./dex2oat");
},{"./dex2oat":43}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
require("./dex2oat/include");
},{"./art/include":32,"./dex2oat/include":44}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":45}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Object");
require("./JSHandle");
require("./android");
require("./machine-code");
require("./TraceManager");
require("./implements/include");
require("./Interface/include");
require("./Utils/include");
require("./start/include");
},{"./Interface/include":9,"./JSHandle":10,"./Object":11,"./TraceManager":12,"./Utils/include":15,"./android":16,"./implements/include":46,"./machine-code":48,"./start/include":53}],48:[function(require,module,exports){
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
},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefineClassHookManager = void 0;
const DexFile_1 = require("../implements/10/art/dexfile/DexFile");
const DexFileManager_1 = require("./DexFileManager");
class DefineClassHookManager extends DexFileManager_1.DexFileManager {
    static enableLogs = false;
    static instance = null;
    constructor() {
        super();
    }
    static getInstance() {
        if (DefineClassHookManager.instance == null) {
            DefineClassHookManager.instance = new DefineClassHookManager();
        }
        return DefineClassHookManager.instance;
    }
    get defineClassAddress() {
        return this.artSymbolFilter(["ClassLinker", "DefineClass", "Thread", "DexFile"]).address;
    }
    dexClassFiles = [];
    addDexClassFiles(dexFile) {
        if (this.hasDexFile(dexFile))
            return;
        this.dexClassFiles.push(dexFile);
        this.dexClassFiles.forEach((item) => {
            if (this.dexFiles.some((retItem) => retItem.location == item.location))
                return;
            this.dexFiles.push(item);
        });
    }
    enableHook() {
        LOGD(`EnableHook -> DefineClassHookManager`);
        Interceptor.attach(this.defineClassAddress, {
            onEnter: function (args) {
                const dex_file = new DexFile_1.DexFile(args[5]);
                DefineClassHookManager.getInstance().addDexClassFiles(dex_file);
                if (!DefineClassHookManager.enableLogs)
                    return;
                let disp = `ClassLinker::DefineClass(\n`;
                disp += `\tClassLinker* instance = ${args[0]}\n`;
                disp += `\tThread* self = ${args[1]}\n`;
                disp += `\tconst char* descriptor = ${args[2]} | ${args[2].readCString()}\n`;
                disp += `\tsize_t hash = ${args[3]}\n`;
                disp += `\tHandle<mirror::ClassLoader> class_loader = ${args[4]}\n`;
                disp += `\tconst DexFile& dex_file = ${args[5]}\n`;
                disp += `\tconst dex::ClassDef& dex_class_def = ${args[6]}\n`;
                disp += `)`;
                this.passDis = disp;
                this.needShow = !DefineClassHookManager.getInstance().hasDexFile(dex_file);
            },
            onLeave: function (retval) {
                if (!this.needShow || !DefineClassHookManager.enableLogs)
                    return;
                LOGD(this.passDis);
                LOGD(`retval [ ObjPtr<mirror::Class> ] = ${retval}`);
                newLine();
            }
        });
    }
}
exports.DefineClassHookManager = DefineClassHookManager;
},{"../implements/10/art/dexfile/DexFile":29,"./DexFileManager":50}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexFileManager = void 0;
const SymbolManager_1 = require("./SymbolManager");
class DexFileManager extends SymbolManager_1.SymbolManager {
    static dexFiles = [];
    constructor() {
        super();
    }
    get dexFiles() {
        return DexFileManager.dexFiles;
    }
    addDexFile(dexFile) {
        if (this.hasDexFile(dexFile))
            return;
        DexFileManager.dexFiles.push(dexFile);
    }
    removeDexFile(dexFile) {
        DexFileManager.dexFiles = DexFileManager.dexFiles.filter(item => item != dexFile);
    }
    hasDexFile(dexFile) {
        return this.dexFiles.some(item => item == dexFile);
    }
}
exports.DexFileManager = DexFileManager;
const showDexFileInner = (dexFile, index, dump = false) => {
    LOGD(`[${index == undefined ? "*" : index}] DexFile<${dexFile.handle}>`);
    LOGZ(`\tlocation = ${dexFile.location}`);
    LOGZ(`\tchecksum = ${dexFile.location_checksum} | is_compact_dex = ${dexFile.is_compact_dex}`);
    LOGZ(`\tbegin = ${dexFile.begin} | size = ${dexFile.size} | data_begin = ${dexFile.data_begin} | data_size = ${dexFile.data_size}`);
    if (dump && dexFile.location.endsWith(".dex"))
        dexFile.dump();
    newLine();
};
const iterDexFile = (dump, onlyAppDex = true) => {
    let count = 0;
    LOGZ(`Waitting for dex files... \nInter ${DexFileManager.dexFiles.length} dex files.`);
    DexFileManager.dexFiles.forEach((item) => {
        if (count == 0)
            clear();
        if (onlyAppDex)
            if (!item.location.includes("/data/app/"))
                return;
        showDexFileInner(item, ++count, dump);
    });
};
globalThis.listDexFiles = (onlyAppDex = true) => {
    iterDexFile(false, onlyAppDex);
};
globalThis.dumpDexFiles = (onlyAppDex = true) => {
    iterDexFile(true, onlyAppDex);
};
},{"./SymbolManager":52}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenCommonHookManager = void 0;
const DexFileManager_1 = require("./DexFileManager");
class OpenCommonHookManager extends DexFileManager_1.DexFileManager {
    static instance = null;
    constructor() {
        super();
    }
    static getInstance() {
        if (OpenCommonHookManager.instance == null) {
            OpenCommonHookManager.instance = new OpenCommonHookManager();
        }
        return OpenCommonHookManager.instance;
    }
    get openCommonAddress() {
        return this.dexfileSymbolFilter(["DexFileLoader", "OpenCommon"], ["ArtDexFileLoader"]).address;
    }
    enableHook() {
        LOGD(`EnableHook -> OpenCommonHookManager`);
        Interceptor.attach(this.openCommonAddress, {
            onEnter: function (args) {
                let disp = `DexFileLoader::OpenCommon(\n`;
                disp += `\tDexFileLoader instance = ${args[0]}\n`;
                disp += `\tstd::shared_ptr<DexFileContainer> container = ${args[1]}\n`;
                disp += `\tconst uint8_t* base = ${args[2]}\n`;
                disp += `\tsize_t size = ${args[3]}\n`;
                disp += `\tconst std::string& location = ${args[4]}\n`;
                disp += `\tstd::optional<uint32_t> location_checksum = ${args[5]}\n`;
                disp += `\tconst OatDexFile* oat_dex_file = ${args[6]}\n`;
                disp += `\tbool verify = ${args[7]}\n`;
                disp += `\tbool verify_checksum = ${args[8]}\n`;
                disp += `\tstd::string* error_msg = ${args[9]}\n`;
                disp += `\tDexFileLoaderErrorCode* error_code = ${args[10]}\n`;
                disp += `)`;
                this.passDis = disp;
            },
            onLeave: function (retval) {
                LOGD(this.passDis);
                LOGD(`retval [std::unique_ptr<DexFile>]: ${retval}`);
                newLine();
            }
        });
    }
}
exports.OpenCommonHookManager = OpenCommonHookManager;
},{"./DexFileManager":50}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolManager = void 0;
class SymbolManager {
    get artModule() {
        return Process.getModuleByName("libart.so");
    }
    get artBaseAddress() {
        return Module.findBaseAddress("libart.so");
    }
    get artSymbol() {
        return this.artModule.enumerateSymbols();
    }
    artSymbolFilter(filterStrs, excludefilterStrs) {
        return SymbolManager.symbolFilter(this.artSymbol, filterStrs, excludefilterStrs);
    }
    get dexDileModule() {
        return Process.getModuleByName("libdexfile.so");
    }
    get dexfileAddress() {
        return Module.findBaseAddress("libdexfile.so");
    }
    get dexfileSymbol() {
        return this.dexDileModule.enumerateSymbols();
    }
    dexfileSymbolFilter(filterStrs, excludefilterStrs) {
        return SymbolManager.symbolFilter(this.dexfileSymbol, filterStrs, excludefilterStrs);
    }
    SymbolFilter(module, filterStrs) {
        let localMd = null;
        if (typeof module == "string") {
            localMd = Process.getModuleByName(module);
        }
        else if (module instanceof Module) {
            localMd = module;
        }
        return SymbolManager.symbolFilter(localMd.enumerateSymbols(), filterStrs);
    }
    static symbolFilter(mds, containfilterStrs, excludefilterStrs = []) {
        let ret = mds.filter((item) => {
            return containfilterStrs.every((filterStr) => {
                return item.name.indexOf(filterStr) != -1;
            });
        });
        ret = ret.filter((item) => {
            return excludefilterStrs.every((filterStr) => {
                return item.name.indexOf(filterStr) == -1;
            });
        });
        if (ret.length == 0) {
            throw new Error("can not find symbol");
        }
        if (ret.length > 1) {
            LOGW(`find too many symbol, just ret first | size : ${ret.length}`);
            if (ret.length < 5) {
                ret.forEach((item) => {
                    LOGZ(JSON.stringify(item));
                });
            }
        }
        return ret[0];
    }
}
exports.SymbolManager = SymbolManager;
},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./DefineClass");
require("./SymbolManager");
require("./DefineClass");
require("./OpenCommon");
},{"./DefineClass":49,"./OpenCommon":51,"./SymbolManager":52}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":3,"./android/include":47,"./tools/include":61}],55:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./include");
globalThis.testArtMethod = () => {
    Java.perform(() => {
        const JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"));
        pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage").show();
    });
};
setImmediate(() => {
});
globalThis.testRegisterJavaClass = () => {
    Java.performNow(() => {
        const newClass = Java.registerClass({
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
                        LOGD("onReward");
                    }
                },
                ['toString']: {
                    returnType: 'java.lang.String',
                    argumentTypes: [],
                    implementation: function () {
                        return `val -> ${this.a.value} ${this.b.value} ${this.c.value}`;
                    }
                }
            }
        });
        LOGD(newClass.onReward);
    });
};
globalThis.sendMessage = (a = "test_class", b = "test_function", c = "test_value") => {
    Java.perform(() => {
        const JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new(a), JavaString.$new(b), JavaString.$new(c));
    });
};
}).call(this)}).call(this,require("timers").setImmediate)

},{"./include":54,"timers":65}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdString = void 0;
const Globals_1 = require("../android/implements/10/art/Globals");
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
    static fromPointer(ptrs) {
        return StdString.fromPointers([ptrs, ptrs.add(Globals_1.PointerSize), ptrs.add(Globals_1.PointerSize * 2)]);
    }
    static fromPointers(ptrs) {
        if (ptrs.length != 3)
            return '';
        return StdString.fromPointersRetInstance(ptrs).disposeToString();
    }
    static fromPointersRetInstance(ptrs) {
        if (ptrs.length != 3)
            return new StdString();
        const stdString = new StdString();
        stdString.handle.writePointer(ptrs[0]);
        stdString.handle.add(Process.pointerSize).writePointer(ptrs[1]);
        stdString.handle.add(2 * Process.pointerSize).writePointer(ptrs[2]);
        return stdString;
    }
    disposeToString() {
        const result = this.toString();
        this.dispose();
        return result;
    }
    toString() {
        const data = this._getData()[0];
        return data.readCString();
    }
    _getData() {
        const str = this.handle;
        const isTiny = (str.readU8() & 1) === 0;
        const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer();
        return [data, isTiny];
    }
}
exports.StdString = StdString;
Reflect.set(globalThis, 'StdString', StdString);
},{"../android/implements/10/art/Globals":19}],57:[function(require,module,exports){
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
},{}],58:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dlopenManager = void 0;
const MAP_RTLD = {
    0: "RTLD_LOCAL",
    0x00001: "RTLD_LAZY    ",
    0x00002: "RTLD_NOW     ",
    0x00004: "RTLD_NOLOAD  ",
    0x00100: "RTLD_GLOBAL  ",
    0x01000: "RTLD_NODELETE"
};
class dlopenManager {
    static needLog_G = true;
    static init(needLog) {
        dlopenManager.needLog_G = needLog;
        Interceptor.attach(Module.findExportByName(null, "dlopen"), {
            onEnter: function (args) {
                this.name_p = args[0].readCString();
                this.flag_p = args[1].toInt32();
            },
            onLeave: function (retval) {
                dlopenManager.onSoLoad(this.name_p, this.flag_p, retval);
            }
        });
        Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
            onEnter: function (args) {
                if (args[0] !== undefined && args[0] != null) {
                    this.name_p = args[0].readCString();
                    this.flag_p = args[1].toInt32();
                    this.info_p = args[2].toInt32();
                }
            },
            onLeave: function (retval) {
                dlopenManager.onSoLoad(this.name_p, this.flag_p, retval, this.info_p);
            }
        });
    }
    static onSoLoad(soName, flag, retval, _info) {
        if (dlopenManager.needLog_G)
            LOGD(`dlopen: ${flag} -> ${MAP_RTLD[flag]} | ${soName}`);
        if (dlopenManager.callbacks == undefined)
            return;
        dlopenManager.callbacks.forEach((actions, name) => {
            if (soName.indexOf(name) !== -1) {
                actions.forEach(action => {
                    action();
                });
            }
            dlopenManager.callbacks.delete(name);
        });
    }
    static callbacks = new Map();
    static registSoLoadCallBack(soName, action) {
        if (dlopenManager.callbacks.has(soName)) {
            dlopenManager.callbacks.get(soName).push(action);
        }
        else {
            dlopenManager.callbacks.set(soName, [action]);
        }
    }
}
exports.dlopenManager = dlopenManager;
setImmediate(() => {
    dlopenManager.init(false);
});
globalThis.addSoLoadCallBack = (soName, action) => {
    dlopenManager.registSoLoadCallBack(soName, action);
};
}).call(this)}).call(this,require("timers").setImmediate)

},{"timers":65}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dump_so(soName = "libil2cpp.so") {
    const module = Process.getModuleByName(soName);
    LOGE(getLine(30));
    LOGW("[name]:" + module.name);
    LOGW("[base]:" + module.base);
    LOGW("[size]:" + module.size);
    LOGW("[path]:" + module.path);
    LOGE(getLine(30));
    const fileName = `${module.name}_${module.base}_${ptr(module.size)}.so`;
    dump_mem(module.base, module.size, fileName);
}
function dump_mem(from, length, fileName, path, withLog = true) {
    if (length <= 0)
        return;
    let savedPath = path == undefined ? getFilesDir() : path;
    if (fileName == undefined) {
        savedPath += `/${from}_${length}.bin`;
    }
    else {
        savedPath += '/' + fileName;
    }
    const file_handle = new File(savedPath, "wb");
    if (file_handle && file_handle != null) {
        Memory.protect(from, length, 'rwx');
        let libso_buffer = from.readByteArray(length);
        file_handle.write(libso_buffer);
        file_handle.flush();
        file_handle.close();
        if (withLog) {
            LOGZ(`\nDump ${length} bytes from ${from} to ${from.add(length)}`);
            LOGD(`Saved to -> ${savedPath}\n`);
        }
    }
}
globalThis.dumpSo = dump_so;
globalThis.dumpMem = dump_mem;
},{}],60:[function(require,module,exports){
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
},{}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./dlopen");
require("./dump");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
},{"./StdString":56,"./common":57,"./dlopen":58,"./dump":59,"./enum":60,"./logger":62,"./modifiers":63}],62:[function(require,module,exports){
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
},{}],63:[function(require,module,exports){
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
},{}],64:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],65:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":64,"timers":65}]},{},[55])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0NvbnRleHQudHMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9JbnRlcmZhY2UvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL0hlYXBSZWZlcmVuY2UudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9KU0hhbmRsZS50cyIsImFnZW50L2FuZHJvaWQvT2JqZWN0LnRzIiwiYWdlbnQvYW5kcm9pZC9UcmFjZU1hbmFnZXIudHMiLCJhZ2VudC9hbmRyb2lkL1V0aWxzL0FydE1ldGhvZEhlbHBlci50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvU3ltSGVscGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9hbmRyb2lkLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9DbGFzc0xpbmtlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvR2NSb290LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9HbG9iYWxzLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVjdGlvbi50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2F0L09hdERleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdC9PYXRGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2JqUHRyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtRGF0YUFjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtRGVidWdJbmZvQWNjZXNzb3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvQ29kZUl0ZW1JbnN0cnVjdGlvbkFjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvbXBhY3REZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0RleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvU3RhbmRhcmREZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2ludGVycHJldGVyL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRDbGFzcy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0FydE1ldGhvZC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzRXh0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQ2xhc3NMb2FkZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9EZXhDYWNoZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0lmVGFibGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9ydW50aW1lL09hdFF1aWNrTWV0aG9kSGVhZGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9ydW50aW1lL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvZGV4Mm9hdC9kZXgyb2F0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2RleDJvYXQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL21hY2hpbmUtY29kZS5qcyIsImFnZW50L2FuZHJvaWQvc3RhcnQvRGVmaW5lQ2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL3N0YXJ0L0RleEZpbGVNYW5hZ2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9zdGFydC9PcGVuQ29tbW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9zdGFydC9TeW1ib2xNYW5hZ2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9zdGFydC9pbmNsdWRlLnRzIiwiYWdlbnQvaW5jbHVkZS50cyIsImFnZW50L21haW4udHMiLCJhZ2VudC90b29scy9TdGRTdHJpbmcudHMiLCJhZ2VudC90b29scy9jb21tb24udHMiLCJhZ2VudC90b29scy9kbG9wZW4udHMiLCJhZ2VudC90b29scy9kdW1wLnRzIiwiYWdlbnQvdG9vbHMvZW51bS50cyIsImFnZW50L3Rvb2xzL2luY2x1ZGUudHMiLCJhZ2VudC90b29scy9sb2dnZXIudHMiLCJhZ2VudC90b29scy9tb2RpZmllcnMudHMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6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QUFBO0lBQzNCLE1BQU0sQ0FBQyxXQUFXLEdBQVcsU0FBUyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxLQUFlLEVBQVUsRUFBRSxDQUFDLFFBQVEsS0FBZSxHQUFHLENBQUE7SUFFOUUsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFBO0lBRWpDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzNELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFRLEVBQUUsT0FBaUIsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFnQixDQUFDLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFbEksTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQVEsRUFBRSxPQUFpQixRQUFRLENBQUMsS0FBSyxFQUFRLEVBQUU7UUFDN0QsUUFBUSxJQUFJLEVBQUU7WUFDVixLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQUMsTUFBSztZQUM1QyxLQUFLLFFBQVEsQ0FBQyxHQUFHO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQUMsTUFBSztZQUM1QyxLQUFLLFFBQVEsQ0FBQyxNQUFNO2dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQUMsTUFBSztZQUM5QztnQkFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFBQyxNQUFLO1NBQ3RFO0lBQ0wsQ0FBQyxDQUFBO0lBRUQsTUFBTSxDQUFDLGNBQWMsR0FBRyxHQUFTLEVBQUU7UUFDL0IsSUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFBO1FBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtTQUNwRjtRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO1NBQ3BGO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7U0FDcEY7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtTQUNwRjtRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDNUIsQ0FBQyxDQUFBO0lBS0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLE1BQWMsRUFBRSxVQUFrQixHQUFHLEVBQUUsRUFBRTtRQUN2RCxJQUFJLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDMUIsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUE7UUFDaEMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJO1lBQUUsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyRSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFO1lBQUUsTUFBTSxJQUFJLE9BQU8sQ0FBQTtRQUMzRSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDaEMsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQyxDQUFBO0lBR0QsTUFBTSxDQUFDLGNBQWMsR0FBRyxDQUFDLElBQVksRUFBRSxRQUFrQixRQUFRLENBQUMsS0FBSyxFQUFFLFVBQWtCLEdBQUcsRUFBRSxTQUFpQixDQUFDLENBQUMsRUFBRSxTQUFrQixLQUFLLEVBQVUsRUFBRTtRQUNwSixJQUFJLElBQUksSUFBSSxTQUFTO1lBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNoQyxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUN0QyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3JDLElBQUksVUFBVSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQ3JDLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTtZQUNoQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUNyQyxJQUFJLEtBQUssR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFBO1lBQzdCLElBQUksTUFBTSxFQUFFO2dCQUNSLElBQUksR0FBRyxLQUFLLENBQUE7YUFDZjtZQUNELEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1NBQ2pFO2FBQU07WUFDSCxHQUFHLElBQUksSUFBSSxDQUFBO1NBQ2Q7UUFDRCxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQTtRQUN6QixPQUFPLEdBQUcsQ0FBQTtJQUNkLENBQUMsQ0FBQTs7QUFoRkwsd0JBaUZDO0FBRUQsSUFBSyxtQkFVSjtBQVZELFdBQUssbUJBQW1CO0lBQ3BCLDJGQUF1QixDQUFBO0lBQ3ZCLDJGQUF1QixDQUFBO0lBQ3ZCLDJGQUF1QixDQUFBO0lBQ3ZCLHVGQUFxQixDQUFBO0lBQ3JCLHFGQUFvQixDQUFBO0lBQ3BCLHFGQUFvQixDQUFBO0lBQ3BCLHVGQUFxQixDQUFBO0lBQ3JCLHVGQUFxQixDQUFBO0lBQ3JCLHlGQUFzQixDQUFBO0FBQzFCLENBQUMsRUFWSSxtQkFBbUIsS0FBbkIsbUJBQW1CLFFBVXZCO0FBRUQsTUFBTSxPQUFPLEdBQVcsS0FBSyxDQUFBO0FBQzdCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQTtBQUV4QixVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxNQUFjLE9BQU8sRUFBRSxXQUFnQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO0lBQzFJLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixJQUFJLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLHFCQUFxQixDQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQTtRQUMvSSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7S0FDbkc7U0FBTTtRQUNILElBQUksR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDOzs7OztrQ0FLSSxRQUFRLE1BQU0sR0FBRzs7U0FFMUMsRUFBRSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUscUJBQXFCLENBQUUsRUFBRSxDQUFDLENBQUE7UUFFekYsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0tBQ3RGO0FBQ0wsQ0FBQyxDQUFBO0FBNEJELFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQTtBQUMzQixVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7QUFDN0IsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO0FBQzdCLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQTtBQUM3QixVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7QUFDN0IsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO0FBQzdCLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQTtBQUM3QixVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7QUFDN0IsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO0FBQzdCLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQTtBQUM3QixVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7QUFDN0IsVUFBVSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFBO0FBQ25DLFVBQVUsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQTtBQUNuQyxVQUFVLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUE7QUFDakQsVUFBVSxDQUFDLE9BQU8sR0FBRyxDQUFDLFFBQWdCLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDNUUsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7Ozs7O0FDcEs5QixNQUFhLFlBQVk7SUFFckIsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7SUFDM0IsTUFBTSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7SUFDNUIsTUFBTSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7SUFDOUIsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7SUFDM0IsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7SUFDMUIsTUFBTSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztJQUNqQyxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztJQUMxQixNQUFNLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztJQUM3QixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztJQUM5QixNQUFNLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztJQUM1QixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztJQUM5QixNQUFNLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztJQUM3QixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztJQUM5QixNQUFNLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztJQUMvQixNQUFNLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUV6QixNQUFNLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDO0lBRWxDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO0lBQ3BDLE1BQU0sQ0FBQyx3QkFBd0IsR0FBRyxVQUFVLENBQUM7SUFDN0MsTUFBTSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztJQUlyQyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDO0lBRXZDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLENBQUM7SUFFekMsTUFBTSxDQUFDLHlCQUF5QixHQUFHLFVBQVUsQ0FBQztJQUM5QyxNQUFNLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxDQUFDO0lBSzVDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBSXhCLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLFlBQW9DLEVBQVUsRUFBRTtRQUMvRSxJQUFJLGtCQUFrQixHQUFrQixJQUFJLENBQUE7UUFDNUMsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7WUFDbEMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO1NBQ3pDO2FBQU07WUFDSCxrQkFBa0IsR0FBRyxZQUFZLENBQUE7U0FDcEM7UUFDRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtRQUN4RSxJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUE7UUFDdkIsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzdELE1BQU0sSUFBSSxTQUFTLENBQUE7U0FDdEI7UUFDRCxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDaEUsTUFBTSxJQUFJLFlBQVksQ0FBQTtTQUN6QjtRQUNELElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM5RCxNQUFNLElBQUksVUFBVSxDQUFBO1NBQ3ZCO1FBQ0QsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzVELE1BQU0sSUFBSSxRQUFRLENBQUE7U0FDckI7UUFDRCxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDN0QsTUFBTSxJQUFJLFNBQVMsQ0FBQTtTQUN0QjtRQUNELElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUMvRCxNQUFNLElBQUksV0FBVyxDQUFBO1NBQ3hCO1FBQ0QsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hFLE1BQU0sSUFBSSxZQUFZLENBQUE7U0FDekI7UUFDRCxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDaEUsTUFBTSxJQUFJLFlBQVksQ0FBQTtTQUN6QjtRQUNELElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUMvRCxNQUFNLElBQUksV0FBVyxDQUFBO1NBQ3hCO1FBQ0QsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDbkUsTUFBTSxJQUFJLGVBQWUsQ0FBQTtTQUM1QjtRQUNELE9BQU8sTUFBTSxDQUFBO0lBQ2pCLENBQUMsQ0FBQTs7QUFuRkwsb0NBb0ZDO0FBTUQsVUFBVSxDQUFDLGlCQUFpQixHQUFHLENBQUMsWUFBb0MsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFBO0FBRXJILE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQTs7QUM3RnJEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIn0=
