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
},{"../android/implements/10/art/mirror/ArtMethod":44}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNAL = void 0;
var SIGNAL;
(function (SIGNAL) {
    SIGNAL[SIGNAL["SIGHUP"] = 1] = "SIGHUP";
    SIGNAL[SIGNAL["SIGINT"] = 2] = "SIGINT";
    SIGNAL[SIGNAL["SIGQUIT"] = 3] = "SIGQUIT";
    SIGNAL[SIGNAL["SIGILL"] = 4] = "SIGILL";
    SIGNAL[SIGNAL["SIGTRAP"] = 5] = "SIGTRAP";
    SIGNAL[SIGNAL["SIGABRT"] = 6] = "SIGABRT";
    SIGNAL[SIGNAL["SIGIOT"] = 6] = "SIGIOT";
    SIGNAL[SIGNAL["SIGBUS"] = 7] = "SIGBUS";
    SIGNAL[SIGNAL["SIGFPE"] = 8] = "SIGFPE";
    SIGNAL[SIGNAL["SIGKILL"] = 9] = "SIGKILL";
    SIGNAL[SIGNAL["SIGUSR1"] = 10] = "SIGUSR1";
    SIGNAL[SIGNAL["SIGSEGV"] = 11] = "SIGSEGV";
    SIGNAL[SIGNAL["SIGUSR2"] = 12] = "SIGUSR2";
    SIGNAL[SIGNAL["SIGPIPE"] = 13] = "SIGPIPE";
    SIGNAL[SIGNAL["SIGALRM"] = 14] = "SIGALRM";
    SIGNAL[SIGNAL["SIGTERM"] = 15] = "SIGTERM";
    SIGNAL[SIGNAL["SIGSTKFLT"] = 16] = "SIGSTKFLT";
    SIGNAL[SIGNAL["SIGCHLD"] = 17] = "SIGCHLD";
    SIGNAL[SIGNAL["SIGCONT"] = 18] = "SIGCONT";
    SIGNAL[SIGNAL["SIGSTOP"] = 19] = "SIGSTOP";
    SIGNAL[SIGNAL["SIGTSTP"] = 20] = "SIGTSTP";
    SIGNAL[SIGNAL["SIGTTIN"] = 21] = "SIGTTIN";
    SIGNAL[SIGNAL["SIGTTOU"] = 22] = "SIGTTOU";
    SIGNAL[SIGNAL["SIGURG"] = 23] = "SIGURG";
    SIGNAL[SIGNAL["SIGXCPU"] = 24] = "SIGXCPU";
    SIGNAL[SIGNAL["SIGXFSZ"] = 25] = "SIGXFSZ";
    SIGNAL[SIGNAL["SIGVTALRM"] = 26] = "SIGVTALRM";
    SIGNAL[SIGNAL["SIGPROF"] = 27] = "SIGPROF";
    SIGNAL[SIGNAL["SIGWINCH"] = 28] = "SIGWINCH";
    SIGNAL[SIGNAL["SIGIO"] = 29] = "SIGIO";
    SIGNAL[SIGNAL["SIGPOLL"] = 29] = "SIGPOLL";
    SIGNAL[SIGNAL["SIGPWR"] = 30] = "SIGPWR";
    SIGNAL[SIGNAL["SIGSYS"] = 31] = "SIGSYS";
    SIGNAL[SIGNAL["SIGUNUSED"] = 31] = "SIGUNUSED";
    SIGNAL[SIGNAL["__SIGRTMIN"] = 32] = "__SIGRTMIN";
})(SIGNAL = exports.SIGNAL || (exports.SIGNAL = {}));
globalThis.readProcStatus = (tid) => {
    const statusPath = `/proc/${tid == undefined ? 'self' : tid}/status`;
    const fopenFunc = new NativeFunction(Module.findExportByName("libc.so", 'fopen'), 'pointer', ['pointer', 'pointer']);
    const fopen = fopenFunc(Memory.allocUtf8String(statusPath), Memory.allocUtf8String('r'));
    const freadFunc = new NativeFunction(Module.findExportByName("libc.so", 'fread'), 'int', ['pointer', 'size_t', 'size_t', 'pointer']);
    const buf = Memory.alloc(0x1000);
    const _fread = freadFunc(buf, 1, 0x1000, fopen);
    const fcloseFunc = new NativeFunction(Module.findExportByName("libc.so", 'fclose'), 'int', ['pointer']);
    const _fclose = fcloseFunc(fopen);
    return buf.readCString();
};
globalThis.readProcTasks = () => {
    const taskPath = '/proc/self/task';
    const opendirFunc = new NativeFunction(Module.findExportByName('libc.so', 'opendir'), 'pointer', ['pointer']);
    const readdirFunc = new NativeFunction(Module.findExportByName('libc.so', 'readdir'), 'pointer', ['pointer']);
    const dir = opendirFunc(Memory.allocUtf8String(taskPath));
    if (dir.isNull()) {
        console.error('Failed to open directory:', taskPath);
        return [];
    }
    const files = [];
    try {
        let entry = readdirFunc(dir);
        while (!entry.isNull()) {
            const fileName = entry.readCString();
            if (fileName !== '.' && fileName !== '..') {
                files.push(fileName);
            }
            entry = readdirFunc(dir);
        }
    }
    finally {
        dir.writePointer(NULL);
    }
    return files;
};
globalThis.getValueFromStatus = (key, tid) => {
    let status = readProcStatus(tid);
    let reg = new RegExp(key + ".*", "g");
    let result = status.match(reg);
    if (result == null)
        return "unknown";
    return result[0].split(":")[1].trim();
};
function getThreadName(tid) {
    let threadName = getValueFromStatus("Name", tid);
    return threadName;
}
globalThis.currentThreadName = () => {
    let tid = Process.getCurrentThreadId();
    return getThreadName(tid).toString();
};
globalThis.raise = (sign = SIGNAL.SIGSTOP) => {
    const raise = new NativeFunction(Module.findExportByName("libc.so", 'raise'), 'int', ['int']);
    return raise(sign);
};
globalThis.listThreads = (maxCountThreads = 20) => {
    let index_threads = 0;
    let current = Process.getCurrentThreadId();
    Process.enumerateThreads()
        .sort((a, b) => b.id - a.id)
        .slice(0, maxCountThreads)
        .forEach((thread) => {
        let indexText = `[${++index_threads}]`.padEnd(6, " ");
        let text = `${indexText} ${thread.id} ${thread.state} | ${getThreadName(thread.id)}`;
        current == thread.id ? LOGE(text) : LOGD(text);
    });
};
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JavaUtil");
require("./Context");
require("./Theads");
},{"./Context":1,"./JavaUtil":2,"./Theads":3}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./mirror/include");
require("./SizeOfClass");
},{"./SizeOfClass":5,"./mirror/include":9}],7:[function(require,module,exports){
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
},{"../../../JSHandle":11}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./HeapReference");
require("./IArtMethod");
},{"./HeapReference":7,"./IArtMethod":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":6}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{"./Interface/art/mirror/HeapReference":7,"./JSHandle":11,"./implements/10/art/Globals":20}],13:[function(require,module,exports){
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

},{"./start/DefineClass":57,"./start/OpenCommon":59,"timers":74}],14:[function(require,module,exports){
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
},{"../implements/10/art/mirror/ArtMethod":44}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSym = exports.callSym = void 0;
const functions_1 = require("../../tools/functions");
const JSHandle_1 = require("../JSHandle");
const SymbolManager_1 = require("../start/SymbolManager");
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
    let address = getSym(sym, md);
    if (address == null) {
        let sym_ret = SymbolManager_1.SymbolManager.SymbolFilter(null, (0, functions_1.demangleName_onlyFunctionName)(sym));
        if (sym_ret.type != "function")
            throw new Error(`symbol ${sym_ret.name} not a function [ ${sym_ret.type} ]`);
        address = sym_ret.address;
    }
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
},{"../../tools/functions":69,"../JSHandle":11,"../start/SymbolManager":60}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtMethodHelper");
require("./SymHelper");
},{"./ArtMethodHelper":14,"./SymHelper":15}],17:[function(require,module,exports){
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
},{"./machine-code":56}],18:[function(require,module,exports){
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
},{"../../../JSHandle":11,"./Globals":20}],19:[function(require,module,exports){
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
},{"../../../JSHandle":11}],20:[function(require,module,exports){
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
},{"../../../../tools/StdString":64,"../../../JSHandle":11}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OatQuickMethodHeader = void 0;
const JSHandle_1 = require("../../../JSHandle");
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
},{"../../../JSHandle":11}],23:[function(require,module,exports){
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
},{"../../../../../tools/StdString":64,"../../../../JSHandle":11,"../Globals":20,"./OatFile":24}],24:[function(require,module,exports){
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
},{"../../../../../tools/StdString":64,"../../../../JSHandle":11,"../Globals":20}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./OatFile");
require("./OatDexFile");
},{"./OatDexFile":23,"./OatFile":24}],26:[function(require,module,exports){
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
},{"../../../JSHandle":11}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickMethodFrameInfo = void 0;
const JSHandle_1 = require("../../../JSHandle");
class QuickMethodFrameInfo extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
}
exports.QuickMethodFrameInfo = QuickMethodFrameInfo;
},{"../../../JSHandle":11}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowFrame = void 0;
const JSHandle_1 = require("../../../JSHandle");
class ShadowFrame extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
}
exports.ShadowFrame = ShadowFrame;
},{"../../../JSHandle":11}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAStackVisitor = void 0;
const StackVisitor_1 = require("./StackVisitor");
class CHAStackVisitor extends StackVisitor_1.StackVisitor {
    constructor(handle) {
        super(handle);
    }
}
exports.CHAStackVisitor = CHAStackVisitor;
},{"./StackVisitor":31}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchBlockStackVisitor = void 0;
const StackVisitor_1 = require("./StackVisitor");
class CatchBlockStackVisitor extends StackVisitor_1.StackVisitor {
    constructor(handle) {
        super(handle);
    }
}
exports.CatchBlockStackVisitor = CatchBlockStackVisitor;
},{"./StackVisitor":31}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackWalkKind = exports.VRegKind = exports.StackVisitor = void 0;
const QuickMethodFrameInfo_1 = require("../QuickMethodFrameInfo");
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const StdString_1 = require("../../../../../tools/StdString");
const ArtMethod_1 = require("../mirror/ArtMethod");
const JSHandle_1 = require("../../../../JSHandle");
const Object_1 = require("../../../../Object");
const ShadowFrame_1 = require("../ShadowFrame");
const Globals_1 = require("../Globals");
const Thread_1 = require("../Thread");
class StackVisitor extends JSHandle_1.JSHandle {
    thread_ = this.CurrentHandle;
    walk_kind_ = this.thread_.add(Globals_1.PointerSize);
    cur_shadow_frame_ = this.walk_kind_.add(Globals_1.PointerSize);
    cur_quick_frame_ = this.cur_shadow_frame_.add(Globals_1.PointerSize);
    cur_quick_frame_pc_ = this.cur_quick_frame_.add(Globals_1.PointerSize);
    cur_oat_quick_method_header_ = this.cur_quick_frame_pc_.add(Globals_1.PointerSize);
    num_frames_ = this.cur_oat_quick_method_header_.add(Globals_1.PointerSize);
    cur_depth_ = this.num_frames_.add(Globals_1.PointerSize);
    current_code_info_ = this.cur_depth_.add(Globals_1.PointerSize);
    current_inline_frames_ = this.current_code_info_.add(Globals_1.PointerSize);
    context_ = this.current_inline_frames_.add(Globals_1.PointerSize);
    check_suspended_ = this.context_.add(Globals_1.PointerSize);
    constructor(handle) {
        super(handle);
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    get SizeOfClass() {
        return this.check_suspended_.add(Globals_1.PointerSize).sub(this.CurrentHandle).toInt32();
    }
    get VirtualClassOffset() {
        return Globals_1.PointerSize;
    }
    get thread() {
        return new Thread_1.ArtThread(this.thread_.readPointer());
    }
    get walk_kind() {
        return this.walk_kind_.readU32();
    }
    get cur_shadow_frame() {
        return new ShadowFrame_1.ShadowFrame(this.cur_shadow_frame_.readPointer());
    }
    get cur_quick_frame() {
        return new ArtMethod_1.ArtMethod(this.cur_quick_frame_.readPointer().readPointer());
    }
    get cur_quick_frame_pc() {
        return this.cur_quick_frame_pc_.readPointer();
    }
    get cur_oat_quick_method_header() {
        return new OatQuickMethodHeader_1.OatQuickMethodHeader(this.cur_oat_quick_method_header_.readPointer());
    }
    get num_frames() {
        return this.num_frames_.readPointer().toInt32();
    }
    get cur_depth() {
        return this.cur_depth_.readPointer().toInt32();
    }
    get current_code_info() {
        return this.current_code_info_.readPointer();
    }
    get current_inline_frames() {
        return this.current_inline_frames_.readPointer();
    }
    get context() {
        return this.context_.readPointer();
    }
    get check_suspended() {
        return this.check_suspended_.readU8() == 1;
    }
    static fromThread(thread, context, walk_kind, check_suspended = true) {
        return new StackVisitor(callSym("_ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEb", "libart.so", "pointer", ["pointer", "pointer", "int", "bool"], thread, context, walk_kind, check_suspended));
    }
    GetDexPc(abort_on_failure) {
        return callSym("_ZNK3art12StackVisitor8GetDexPcEb", "libart.so", "int", ["pointer", "int"], this.CurrentHandle, abort_on_failure);
    }
    GetMethod() {
        return new ArtMethod_1.ArtMethod(callSym("_ZNK3art12StackVisitor9GetMethodEv", "libart.so", "pointer", ["pointer"], this.CurrentHandle));
    }
    GetGPR(reg) {
        return callSym("_ZNK3art12StackVisitor6GetGPREj", "libart.so", "pointer", ["pointer", "int"], this.handle, reg);
    }
    GetVRegPairFromOptimizedCode(m, vreg, kind_lo, kind_hi, val) {
        return callSym("_ZNK3art12StackVisitor28GetVRegPairFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindES3_Pm", "libart.so", "pointer", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind_lo, kind_hi, val).isNull();
    }
    GetGPRAddress(reg) {
        return callSym("_ZNK3art12StackVisitor13GetGPRAddressEj", "libart.so", "pointer", ["pointer", "int"], this.handle, reg);
    }
    SanityCheckFrame() {
        callSym("_ZNK3art12StackVisitor16SanityCheckFrameEv", "libart.so", "void", ["pointer"], this.handle);
    }
    SetMethod(method) {
        callSym("_ZN3art12StackVisitor9SetMethodEPNS_9ArtMethodE", "libart.so", "void", ["pointer", "pointer"], this.handle, method.handle);
    }
    ComputeNumFrames(thread, walk_kind) {
        return callSym("_ZN3art12StackVisitor16ComputeNumFramesEPNS_6ThreadENS0_13StackWalkKindE", "libart.so", "int", ["pointer", "pointer", "int"], this.handle, thread, walk_kind);
    }
    WalkStack_0(include_transitions) {
        callSym("_ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE0EEEvb", "libart.so", "void", ["pointer", "bool"], this.handle, include_transitions);
    }
    WalkStack_1(include_transitions) {
        callSym("_ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE1EEEvb", "libart.so", "void", ["pointer", "bool"], this.handle, include_transitions);
    }
    GetReturnPc() {
        return callSym("_ZNK3art12StackVisitor11GetReturnPcEv", "libart.so", "pointer", ["pointer"], this.handle);
    }
    SetReturnPc(new_ret_pc) {
        callSym("_ZN3art12StackVisitor11SetReturnPcEm", "libart.so", "void", ["pointer", "pointer"], this.handle, new_ret_pc);
    }
    DescribeStack(thread) {
        callSym("_ZN3art12StackVisitor13DescribeStackEPNS_6ThreadE", "libart.so", "void", ["pointer", "pointer"], this.handle, thread.handle);
    }
    GetVRegFromOptimizedCode(m, vreg, kind, val) {
        return callSym("_ZNK3art12StackVisitor24GetVRegFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindEPj", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind, val);
    }
    GetVRegPair(m, vreg, kind_lo, kind_hi, val) {
        return callSym("_ZNK3art12StackVisitor11GetVRegPairEPNS_9ArtMethodEtNS_8VRegKindES3_Pm", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind_lo, kind_hi, val);
    }
    SetVReg(m, vreg, new_value, kind) {
        return callSym("_ZN3art12StackVisitor7SetVRegEPNS_9ArtMethodEtjNS_8VRegKindE", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, new_value, kind);
    }
    GetVReg(m, vreg, kind) {
        return callSym("_ZNK3art12StackVisitor7GetVRegEPNS_9ArtMethodEtNS_8VRegKindEPj", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind);
    }
    GetNativePcOffset() {
        return callSym("_ZN3art12StackVisitor19GetNativePcOffsetEv", "libart.so", "int", ["pointer"], this.handle);
    }
    SetVRegPair(m, vreg, new_value, kind_lo, kind_hi) {
        return callSym("_ZN3art12StackVisitor11SetVRegPairEPNS_9ArtMethodEtmNS_8VRegKindES3_", "libart.so", "int", ["pointer", "pointer", "short", "int", "int", "int"], this.handle, m.handle, vreg, new_value, kind_lo, kind_hi);
    }
    DescribeLocation() {
        return StdString_1.StdString.fromPointer(callSym("_ZNK3art12StackVisitor16DescribeLocationEv", "libart.so", "pointer", ["pointer"], this.handle));
    }
    GetCurrentQuickFrameInfo() {
        return new QuickMethodFrameInfo_1.QuickMethodFrameInfo(callSym("_ZNK3art12StackVisitor24GetCurrentQuickFrameInfoEv", "libart.so", "pointer", ["pointer"], this.handle));
    }
    IsAccessibleGPR(reg) {
        return callSym("_ZNK3art12StackVisitor15IsAccessibleGPREj", "libart.so", "bool", ["pointer", "int"], this.handle, reg);
    }
    GetFPR(reg) {
        return callSym("_ZNK3art12StackVisitor6GetFPREj", "libart.so", "pointer", ["pointer", "int"], this.handle, reg);
    }
    GetVRegPairFromDebuggerShadowFrame(vreg, kind_lo, kind_hi, val) {
        return callSym("_ZNK3art12StackVisitor34GetVRegPairFromDebuggerShadowFrameEtNS_8VRegKindES1_Pm", "libart.so", "int", ["pointer", "int", "int", "int"], this.handle, vreg, kind_lo, kind_hi, val);
    }
    GetVRegFromDebuggerShadowFrame(vreg, kind) {
        return callSym("_ZNK3art12StackVisitor30GetVRegFromDebuggerShadowFrameEtNS_8VRegKindEPj", "libart.so", "int", ["pointer", "short", "pointer"], this.handle, vreg, kind);
    }
    GetRegisterPairIfAccessible(reg_lo, reg_hi, kind_lo, val) {
        return callSym("_ZNK3art12StackVisitor27GetRegisterPairIfAccessibleEjjNS_8VRegKindEPm", "libart.so", "int", ["pointer", "int", "int", "int", "int"], this.handle, reg_lo, reg_hi, kind_lo, val);
    }
    GetRegisterIfAccessible(reg, kind, val) {
        return callSym("_ZNK3art12StackVisitor23GetRegisterIfAccessibleEjNS_8VRegKindEPj", "libart.so", "int", ["pointer", "int", "int"], this.handle, reg, kind, val);
    }
    IsAccessibleFPR(reg) {
        return callSym("_ZNK3art12StackVisitor15IsAccessibleFPREj", "libart.so", "bool", ["pointer", "int"], this.handle, reg);
    }
    GetThisObject() {
        return new Object_1.ArtObject(callSym("_ZNK3art12StackVisitor13GetThisObjectEv", "libart.so", "pointer", ["pointer"], this.handle));
    }
    GetNextMethodAndDexPc(next_method, next_dex_pc) {
        return callSym("_ZN3art12StackVisitor20GetNextMethodAndDexPcEPPNS_9ArtMethodEPj", "libart.so", "bool", ["pointer", "pointer", "pointer"], this.handle, next_method, next_dex_pc);
    }
}
exports.StackVisitor = StackVisitor;
var VRegKind;
(function (VRegKind) {
    VRegKind[VRegKind["kReferenceVReg"] = 0] = "kReferenceVReg";
    VRegKind[VRegKind["kIntVReg"] = 1] = "kIntVReg";
    VRegKind[VRegKind["kFloatVReg"] = 2] = "kFloatVReg";
    VRegKind[VRegKind["kLongLoVReg"] = 3] = "kLongLoVReg";
    VRegKind[VRegKind["kLongHiVReg"] = 4] = "kLongHiVReg";
    VRegKind[VRegKind["kDoubleLoVReg"] = 5] = "kDoubleLoVReg";
    VRegKind[VRegKind["kDoubleHiVReg"] = 6] = "kDoubleHiVReg";
    VRegKind[VRegKind["kConstant"] = 7] = "kConstant";
    VRegKind[VRegKind["kImpreciseConstant"] = 8] = "kImpreciseConstant";
    VRegKind[VRegKind["kUndefined"] = 9] = "kUndefined";
})(VRegKind = exports.VRegKind || (exports.VRegKind = {}));
;
var StackWalkKind;
(function (StackWalkKind) {
    StackWalkKind[StackWalkKind["kIncludeInlinedFrames"] = 0] = "kIncludeInlinedFrames";
    StackWalkKind[StackWalkKind["kSkipInlinedFrames"] = 1] = "kSkipInlinedFrames";
})(StackWalkKind = exports.StackWalkKind || (exports.StackWalkKind = {}));
;
},{"../../../../../tools/StdString":64,"../../../../JSHandle":11,"../../../../Object":12,"../Globals":20,"../OatQuickMethodHeader":22,"../QuickMethodFrameInfo":27,"../ShadowFrame":28,"../Thread":33,"../mirror/ArtMethod":44}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StackVisitor");
require("./CHAStackVisitor");
require("./CatchBlockStackVisitor");
},{"./CHAStackVisitor":29,"./CatchBlockStackVisitor":30,"./StackVisitor":31}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtThread = void 0;
const JSHandle_1 = require("../../../JSHandle");
class ArtThread extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
}
exports.ArtThread = ArtThread;
},{"../../../JSHandle":11}],34:[function(require,module,exports){
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
},{"./CodeItemInstructionAccessor":36}],35:[function(require,module,exports){
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
},{"../Globals":20,"./CodeItemDataAccessor":34}],36:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../Globals":20,"../Instruction":21,"./CompactDexFile":37,"./StandardDexFile":39}],37:[function(require,module,exports){
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
},{"./DexFile":38}],38:[function(require,module,exports){
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
},{"../../../../../tools/StdString":64,"../../../../JSHandle":11,"../Globals":20,"../Oat/OatDexFile":23}],39:[function(require,module,exports){
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
},{"./DexFile":38}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./CodeItemDataAccessor");
require("./CodeItemDebugInfoAccessor");
require("./CodeItemInstructionAccessor");
require("./CompactDexFile");
require("./StandardDexFile");
require("./DexFile");
},{"./CodeItemDataAccessor":34,"./CodeItemDebugInfoAccessor":35,"./CodeItemInstructionAccessor":36,"./CompactDexFile":37,"./DexFile":38,"./StandardDexFile":39}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ClassLinker");
require("./Globals");
require("./GcRoot");
require("./Instruction");
require("./OatQuickMethodHeader");
require("./QuickMethodFrameInfo");
require("./ObjPtr");
require("./Thread");
require("./ShadowFrame");
require("./dexfile/include");
require("./interpreter/include");
require("./mirror/include");
require("./Oat/include");
require("./runtime/include");
require("./StackVisitor/include");
},{"./ClassLinker":18,"./GcRoot":19,"./Globals":20,"./Instruction":21,"./Oat/include":25,"./OatQuickMethodHeader":22,"./ObjPtr":26,"./QuickMethodFrameInfo":27,"./ShadowFrame":28,"./StackVisitor/include":32,"./Thread":33,"./dexfile/include":40,"./interpreter/include":42,"./mirror/include":49,"./runtime/include":50}],42:[function(require,module,exports){

},{}],43:[function(require,module,exports){
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
},{"../../../../../tools/StdString":64,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"./ClassExt":45,"./ClassLoader":46,"./DexCache":47,"./IfTable":48}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const CodeItemInstructionAccessor_1 = require("../dexfile/CodeItemInstructionAccessor");
const modifiers_1 = require("../../../../../tools/modifiers");
const StdString_1 = require("../../../../../tools/StdString");
const enum_1 = require("../../../../../tools/enum");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
const ArtClass_1 = require("./ArtClass");
const DexCache_1 = require("./DexCache");
const GcRoot_1 = require("../GcRoot");
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
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
        let errorFlag = false;
        while (++num_local < num) {
            let indexStr = `[${num_local.toString().padStart(4, ' ')}|${ptr(code_offset).toString().padEnd(5, ' ')}]`;
            !errorFlag ? LOGD(`${indexStr} ${insns.address}\t${insns.toString()}`) : function () {
                const bt = insns.address.readByteArray(4);
                const btStr = Array.from(new Uint8Array(bt)).map((item) => item.toString(16).padStart(2, '0')).join(' ');
                LOGE(`${indexStr} ${insns.address}\t${btStr} <--- ERROR`);
            }();
            code_offset += insns.size;
            try {
                insns = Instruction.parse(insns.next);
                errorFlag = false;
            }
            catch (error) {
                insns = Instruction.parse(insns.address.add(Globals_1.PointerSize));
                errorFlag = true;
            }
        }
        newLine();
    }
}
exports.ArtMethod = ArtMethod;
Reflect.set(globalThis, 'ArtMethod', ArtMethod);
},{"../../../../../tools/StdString":64,"../../../../../tools/enum":68,"../../../../../tools/modifiers":72,"../../../../JSHandle":11,"../GcRoot":19,"../Globals":20,"../OatQuickMethodHeader":22,"../dexfile/CodeItemInstructionAccessor":36,"./ArtClass":43,"./DexCache":47}],45:[function(require,module,exports){
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
},{"../../../../Object":12}],46:[function(require,module,exports){
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
},{"../../../../Object":12}],47:[function(require,module,exports){
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
},{"../../../../../tools/StdString":64,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"../Globals":20,"../dexfile/DexFile":38}],48:[function(require,module,exports){
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
},{"../../../../Object":12}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":43,"./ArtMethod":44,"./ClassExt":45,"./ClassLoader":46,"./IfTable":48}],50:[function(require,module,exports){

},{}],51:[function(require,module,exports){
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
},{"../../../../tools/StdString":64}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./dex2oat");
},{"./dex2oat":51}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
require("./dex2oat/include");
},{"./art/include":41,"./dex2oat/include":52}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":53}],55:[function(require,module,exports){
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
},{"./Interface/include":10,"./JSHandle":11,"./Object":12,"./TraceManager":13,"./Utils/include":16,"./android":17,"./implements/include":54,"./machine-code":56,"./start/include":61}],56:[function(require,module,exports){
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
},{}],57:[function(require,module,exports){
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
},{"../implements/10/art/dexfile/DexFile":38,"./DexFileManager":58}],58:[function(require,module,exports){
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
},{"./SymbolManager":60}],59:[function(require,module,exports){
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
},{"./DexFileManager":58}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolManager = void 0;
class SymbolManager {
    static get artModule() {
        return Process.getModuleByName("libart.so");
    }
    static get artBaseAddress() {
        return Module.findBaseAddress("libart.so");
    }
    static get artSymbol() {
        return this.artModule.enumerateSymbols();
    }
    artSymbolFilter(filterStrs, excludefilterStrs) {
        return SymbolManager.symbolFilter(SymbolManager.artSymbol, filterStrs, excludefilterStrs);
    }
    static get dexDileModule() {
        return Process.getModuleByName("libdexfile.so");
    }
    static get dexfileAddress() {
        return Module.findBaseAddress("libdexfile.so");
    }
    static get dexfileSymbol() {
        return this.dexDileModule.enumerateSymbols();
    }
    dexfileSymbolFilter(filterStrs, excludefilterStrs) {
        return SymbolManager.symbolFilter(SymbolManager.dexfileSymbol, filterStrs, excludefilterStrs);
    }
    static SymbolFilter(moduleName, filterStrs, excludefilterStrs) {
        let localMd = null;
        if (moduleName == null || moduleName == undefined) {
            let syms = SymbolManager.symbolFilter(this.artSymbol, filterStrs, excludefilterStrs, false);
            if (syms == null)
                syms = SymbolManager.symbolFilter(this.dexfileSymbol, filterStrs, excludefilterStrs, false);
            if (syms == null)
                throw new Error("can not find symbol");
            return syms;
        }
        else {
            if (typeof moduleName == "string") {
                localMd = Process.getModuleByName(moduleName);
            }
            else if (moduleName instanceof Module) {
                localMd = moduleName;
            }
            return SymbolManager.symbolFilter(localMd.enumerateSymbols(), filterStrs);
        }
    }
    static symbolFilter(mds, containfilterStrs, excludefilterStrs = [], withError = true) {
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
            if (withError)
                throw new Error("can not find symbol");
            else
                LOGE("can not find symbol");
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
},{}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./DefineClass");
require("./SymbolManager");
require("./DefineClass");
require("./OpenCommon");
},{"./DefineClass":57,"./OpenCommon":59,"./SymbolManager":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":4,"./android/include":55,"./tools/include":70}],63:[function(require,module,exports){
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
globalThis.sendMessage = (a = "test_class", b = "test_function", c = "test_value") => {
    Java.perform(() => {
        const JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new(a), JavaString.$new(b), JavaString.$new(c));
    });
};
}).call(this)}).call(this,require("timers").setImmediate)

},{"./include":62,"timers":74}],64:[function(require,module,exports){
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
},{"../android/implements/10/art/Globals":20}],65:[function(require,module,exports){
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
},{}],66:[function(require,module,exports){
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

},{"timers":74}],67:[function(require,module,exports){
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
},{}],68:[function(require,module,exports){
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
},{}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demangleName_onlyFunctionName = exports.demangleName = void 0;
function demangleName(expName) {
    let demangleAddress = Module.findExportByName("libc++.so", '__cxa_demangle');
    if (demangleAddress == null)
        demangleAddress = Module.findExportByName("libunwindstack.so", '__cxa_demangle');
    if (demangleAddress == null)
        demangleAddress = Module.findExportByName("libbacktrace.so", '__cxa_demangle');
    if (demangleAddress == null)
        demangleAddress = Module.findExportByName(null, '__cxa_demangle');
    if (demangleAddress == null)
        throw Error("can not find export function -> __cxa_demangle");
    let demangle = new NativeFunction(demangleAddress, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
    let mangledName = Memory.allocUtf8String(expName);
    let outputBuffer = NULL;
    let length = NULL;
    let status = Memory.alloc(Process.pageSize);
    let result = demangle(mangledName, outputBuffer, length, status);
    if (status.readInt() === 0) {
        let resultStr = result.readUtf8String();
        return (resultStr == null || resultStr == expName) ? "" : resultStr;
    }
    else
        return "";
}
exports.demangleName = demangleName;
const demangleName_onlyFunctionName = (expName) => demangleName(expName).split("::").map(item => item.split("(")[0]);
exports.demangleName_onlyFunctionName = demangleName_onlyFunctionName;
globalThis.demangleName = demangleName;
},{}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./dlopen");
require("./dump");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
},{"./StdString":64,"./common":65,"./dlopen":66,"./dump":67,"./enum":68,"./logger":71,"./modifiers":72}],71:[function(require,module,exports){
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
},{}],72:[function(require,module,exports){
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
},{}],73:[function(require,module,exports){
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

},{}],74:[function(require,module,exports){
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

},{"process/browser.js":73,"timers":74}]},{},[63])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0NvbnRleHQudHMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9UaGVhZHMudHMiLCJhZ2VudC9KYXZhL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvSGVhcFJlZmVyZW5jZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0pTSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9PYmplY3QudHMiLCJhZ2VudC9hbmRyb2lkL1RyYWNlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvQXJ0TWV0aG9kSGVscGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9TeW1IZWxwZXIudHMiLCJhZ2VudC9hbmRyb2lkL1V0aWxzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2FuZHJvaWQudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0NsYXNzTGlua2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9HY1Jvb3QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0dsb2JhbHMudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydWN0aW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXRRdWlja01ldGhvZEhlYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2F0L09hdERleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdC9PYXRGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2JqUHRyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9RdWlja01ldGhvZEZyYW1lSW5mby50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU2hhZG93RnJhbWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9DSEFTdGFja1Zpc2l0b3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9DYXRjaEJsb2NrU3RhY2tWaXNpdG9yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TdGFja1Zpc2l0b3IvU3RhY2tWaXNpdG9yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TdGFja1Zpc2l0b3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvVGhyZWFkLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtRGF0YUFjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtRGVidWdJbmZvQWNjZXNzb3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvQ29kZUl0ZW1JbnN0cnVjdGlvbkFjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvbXBhY3REZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0RleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvU3RhbmRhcmREZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2ludGVycHJldGVyL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRDbGFzcy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0FydE1ldGhvZC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzRXh0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQ2xhc3NMb2FkZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9EZXhDYWNoZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0lmVGFibGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9ydW50aW1lL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvZGV4Mm9hdC9kZXgyb2F0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2RleDJvYXQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL21hY2hpbmUtY29kZS5qcyIsImFnZW50L2FuZHJvaWQvc3RhcnQvRGVmaW5lQ2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL3N0YXJ0L0RleEZpbGVNYW5hZ2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9zdGFydC9PcGVuQ29tbW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9zdGFydC9TeW1ib2xNYW5hZ2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9zdGFydC9pbmNsdWRlLnRzIiwiYWdlbnQvaW5jbHVkZS50cyIsImFnZW50L21haW4udHMiLCJhZ2VudC90b29scy9TdGRTdHJpbmcudHMiLCJhZ2VudC90b29scy9jb21tb24udHMiLCJhZ2VudC90b29scy9kbG9wZW4udHMiLCJhZ2VudC90b29scy9kdW1wLnRzIiwiYWdlbnQvdG9vbHMvZW51bS50cyIsImFnZW50L3Rvb2xzL2Z1bmN0aW9ucy50cyIsImFnZW50L3Rvb2xzL2luY2x1ZGUudHMiLCJhZ2VudC90b29scy9sb2dnZXIudHMiLCJhZ2VudC90b29scy9tb2RpZmllcnMudHMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLFNBQVMsY0FBYztJQUNuQixJQUFJLFdBQVcsR0FBaUIsSUFBSSxDQUFBO0lBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDVCxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQUE7SUFDN0UsQ0FBQyxDQUFDLENBQUE7SUFDRixPQUFPLFdBQVcsQ0FBQTtBQUN0QixDQUFDO0FBRUQsU0FBUyxjQUFjO0lBQ25CLElBQUksV0FBVyxHQUFXLEVBQUUsQ0FBQTtJQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ1QsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUNwRixXQUFXLEdBQUcsa0JBQWtCLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtJQUM3RSxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sV0FBVyxD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RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsR0FBUSxFQUFFLE9BQWlCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBZ0IsQ0FBQyxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBRWxJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFRLEVBQUUsT0FBaUIsUUFBUSxDQUFDLEtBQUssRUFBUSxFQUFFO1FBQzdELFFBQVEsSUFBSSxFQUFFO1lBQ1YsS0FBSyxRQUFRLENBQUMsS0FBSztnQkFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLE1BQUs7WUFDNUMsS0FBSyxRQUFRLENBQUMsR0FBRztnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLE1BQUs7WUFDNUMsS0FBSyxRQUFRLENBQUMsTUFBTTtnQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLE1BQUs7WUFDOUM7Z0JBQVMsTUFBTSxDQUFD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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiJ9
