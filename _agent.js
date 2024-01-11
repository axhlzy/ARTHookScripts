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
            const disp = artMethod.toString().split('\n').map((item, index) => index == 0 ? item : `\n\t${item}`).join('');
            LOGD(`\n\t[${++countMethods}] ${disp}`);
            if (showSmali)
                artMethod.showSmali();
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
},{"../android/implements/10/art/mirror/ArtMethod":65}],3:[function(require,module,exports){
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
exports.JSHandle = exports.JSHandleNotImpl = void 0;
class JSHandleNotImpl {
    handle;
    constructor(handle) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle;
    }
    toString() {
        return `JSHandle< ${this.handle} >`;
    }
    show() {
        LOGD(this.toString());
    }
}
exports.JSHandleNotImpl = JSHandleNotImpl;
class JSHandle extends JSHandleNotImpl {
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
    toString() {
        let disp = `JSHandle< ${this.handle} >`;
        return disp;
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
    klass_ = this.handle;
    monitor_ = this.handle.add(0x4);
    constructor(handle) {
        super(handle);
        this.klass_ = this.handle;
        this.monitor_ = this.handle.add(Globals_1.PointerSize);
    }
    get CurrentHandle() {
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
    toString() {
        let disp = `ArtObject< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        return disp;
    }
}
exports.ArtObject = ArtObject;
},{"./Interface/art/mirror/HeapReference":7,"./JSHandle":11,"./implements/10/art/Globals":28}],13:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceManager = void 0;
const ExecuteSwitchImplCpp_1 = require("./functions/ExecuteSwitchImplCpp");
const DefineClass_1 = require("./functions/DefineClass");
const OpenCommon_1 = require("./functions/OpenCommon");
const init_array_1 = require("./functions/init_array");
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
        OpenCommon_1.OpenCommonHookManager.getInstance().enableHook();
    }
    static Trace_DefineClass() {
        DefineClass_1.DefineClassHookManager.getInstance().enableHook();
    }
    static Trace_CallConstructors() {
        init_array_1.InitArray.Hook_CallConstructors();
    }
    static Trace_ExecuteSwitchImplCpp() {
        ExecuteSwitchImplCpp_1.ExecuteSwitchImplCppManager.enableHook();
    }
}
exports.TraceManager = TraceManager;
setImmediate(() => {
    TraceManager.Trace_DefineClass();
    TraceManager.Trace_ExecuteSwitchImplCpp();
});
}).call(this)}).call(this,require("timers").setImmediate)

},{"./functions/DefineClass":19,"./functions/ExecuteSwitchImplCpp":21,"./functions/OpenCommon":22,"./functions/init_array":25,"timers":90}],14:[function(require,module,exports){
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
globalThis.toArtMethod = globalThis.pathToArtMethod;
},{"../implements/10/art/mirror/ArtMethod":65}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSym = exports.callSym = void 0;
const functions_1 = require("../../tools/functions");
const SymbolManager_1 = require("../functions/SymbolManager");
const JSHandle_1 = require("../JSHandle");
const DEBUG_LOG = false;
function CallSymLocal(address, retType, argTypes, ...args) {
    try {
        return new NativeFunction(address, retType, argTypes)(...args);
    }
    catch (error) {
        LOGE(`CallSymLocal exception 👇 \n${error.stack}`);
        return null;
    }
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
    return CallSymLocal(getSym(sym, md), retType, argTypes, ...transformArgs(args, argTypes));
}
exports.callSym = callSym;
const Cache = new Map();
function getSym(symName, md, checkNotFunction = false) {
    if (Cache.has(symName))
        return Cache.get(symName);
    if (symName == undefined || md == null || symName == "" || md == "")
        throw new Error(`Usage: getSym(symName: string, md: string, check: boolean = false)`);
    const module = Process.getModuleByName(md);
    if (module == null)
        throw new Error(`module ${md} not found`);
    let address = module.findExportByName(symName);
    if (address == null) {
        let res = module.enumerateSymbols().filter((sym) => {
            return sym.name == symName && (checkNotFunction ? sym.type == "function" : true);
        });
        if (res.length > 1) {
            address = res[0].address;
            LOGW(`find too many symbol, just ret first | size : ${res.length}`);
            return address;
        }
        else if (res.length == 1) {
            address = res[0].address;
            return address;
        }
    }
    if (address == null) {
        let sym_ret = SymbolManager_1.SymbolManager.SymbolFilter(null, (0, functions_1.demangleName_onlyFunctionName)(symName));
        if (DEBUG_LOG)
            LOGD(`debug -> symbol ${symName} found in ${sym_ret} -> ${sym_ret.address}`);
        if (sym_ret.type != "function")
            throw new Error(`symbol ${sym_ret.name} not a function [ ${sym_ret.type} ]`);
        address = sym_ret.address;
    }
    if (DEBUG_LOG)
        LOGD(`debug -> symbol ${symName} found in ${md} -> ${address}`);
    if (address == null) {
        throw new Error(`symbol ${symName} not found`);
    }
    if (checkNotFunction) {
        const syms = module.enumerateSymbols().filter((sym) => {
            return sym.name == symName && sym.type == "object";
        });
        if (syms.length == 0) {
            throw new Error(`symbol ${symName} not found`);
        }
        else {
        }
    }
    Cache.set(symName, address);
    return address;
}
exports.getSym = getSym;
globalThis.callSym = callSym;
globalThis.getSym = getSym;
},{"../../tools/functions":85,"../JSHandle":11,"../functions/SymbolManager":23}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtMethodHelper");
require("./SymHelper");
},{"./ArtMethodHelper":14,"./SymHelper":15}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueHandle = void 0;
class ValueHandle {
    value_ = NULL;
    constructor(handle) {
        this.value_ = handle;
    }
    get value() {
        return this.value_;
    }
    get Invalid_8() {
        return this.value_ > ptr(0xff);
    }
    get Invalid_16() {
        return this.value_ > ptr(0xffff);
    }
    get Invalid_32() {
        return this.value_ > ptr(0xffffffff);
    }
    get Invalid_64() {
        return this.value_ > ptr(0xffffffffffffffff);
    }
    ReadAs64() {
        return this.value_;
    }
    ReadAs32() {
        if (this.Invalid_32) {
            return ptr(Memory.alloc(Process.pageSize).writePointer(this.value_).readU32());
        }
        return this.value_;
    }
    ReadAs16() {
        if (this.Invalid_16) {
            return ptr(Memory.alloc(Process.pageSize).writePointer(this.value_).readU16());
        }
        return this.value_;
    }
    ReadAs8() {
        if (this.Invalid_8) {
            return ptr(Memory.alloc(Process.pageSize).writePointer(this.value_).readU8());
        }
        return this.value_;
    }
}
exports.ValueHandle = ValueHandle;
},{}],18:[function(require,module,exports){
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
globalThis.D = () => { Interceptor.detachAll(); };
},{"./machine-code":77}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefineClassHookManager = void 0;
const DexFile_1 = require("../implements/10/art/dexfile/DexFile");
const DexFileManager_1 = require("./DexFileManager");
class DefineClassHookManager extends DexFileManager_1.DexFileManager {
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
    static MD = new CModule(`
        #include <stdio.h>
        #include <glib.h>
        #include <gum/gumprocess.h>
        #include <gum/guminterceptor.h>

        extern void _frida_log(const gchar * message);

        static void frida_log(const char * format, ...) {
            gchar * message;
            va_list args;
            va_start (args, format);
            message = g_strdup_vprintf (format, args);
            va_end (args);
            _frida_log (message);
            g_free (message);
        }

        extern void gotDexFile(void* dexFile);

        void(*it)(void* dexFile);

        extern GHashTable *ptrHash;

        void IterDexFile(void* callback) {
            if (ptrHash == NULL) ptrHash = g_hash_table_new_full(g_direct_hash, g_direct_equal, NULL, NULL);
            guint size = g_hash_table_size(ptrHash);
            if (size == 0) {
                frida_log("IterDexFile -> ptrHash is empty");
            } else {
                GHashTableIter iter;
                gpointer key, value;
                g_hash_table_iter_init(&iter, ptrHash);
                while (g_hash_table_iter_next(&iter, &key, &value)) {
                    ((void(*)(void*))callback)(key);
                }
            }
        }

        gboolean filterPtr(void* ptr) {
            if (ptrHash == NULL) {
                ptrHash = g_hash_table_new_full(g_direct_hash, g_direct_equal, NULL, NULL);
            }
            if (g_hash_table_contains(ptrHash, ptr)) {
                // frida_log("Filter PASS -> %p", ptr);
                return 0;
            } else {
                g_hash_table_add(ptrHash, ptr);
                return 1;
            }
        }

        void onEnter(GumInvocationContext *ctx) {
            void* dexFile = gum_invocation_context_get_nth_argument(ctx,5);
            if (filterPtr(dexFile)) {
                gotDexFile(dexFile);
            }
        }

    `, {
        ptrHash: Memory.alloc(Process.pointerSize),
        _frida_log: new NativeCallback((message) => {
            LOGZ(message.readCString());
        }, 'void', ['pointer']),
        gotDexFile: new NativeCallback((dexFile) => {
            const dex_file = new DexFile_1.DexFile(dexFile);
            DefineClassHookManager.getInstance().addDexClassFiles(dex_file);
        }, 'void', ['pointer'])
    });
    IterDexFile(callback) {
        let localCallback = NULL;
        if (callback == undefined || callback == null) {
            localCallback = new NativeCallback((dexFile) => {
                const dex_file = new DexFile_1.DexFile(dexFile);
                LOGD(`IterDexFile -> ${dexFile} | ${dex_file.location}`);
                DefineClassHookManager.getInstance().addDexClassFiles(dex_file);
            }, 'void', ['pointer']);
        }
        else {
            localCallback = new NativeCallback(callback, 'void', ['pointer']);
        }
        new NativeFunction(DefineClassHookManager.MD.IterDexFile, 'void', ['pointer'])(localCallback);
    }
    enableHook(enableLogs = false) {
        if (enableLogs) {
            LOGD(`EnableHook -> DefineClassHookManager`);
            Interceptor.attach(this.defineClassAddress, {
                onEnter: function (args) {
                    const dex_file = new DexFile_1.DexFile(args[5]);
                    DefineClassHookManager.getInstance().addDexClassFiles(dex_file);
                    if (!enableLogs)
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
                    if (!this.needShow || !enableLogs)
                        return;
                    LOGD(this.passDis);
                    LOGD(`retval [ ObjPtr<mirror::Class> ] = ${retval}`);
                    newLine();
                }
            });
        }
        else {
            Interceptor.attach(this.defineClassAddress, DefineClassHookManager.MD);
        }
    }
}
exports.DefineClassHookManager = DefineClassHookManager;
globalThis.IterDexFile = DefineClassHookManager.getInstance().IterDexFile.bind(DefineClassHookManager.getInstance());
},{"../implements/10/art/dexfile/DexFile":55,"./DexFileManager":20}],20:[function(require,module,exports){
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
},{"./SymbolManager":23}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteSwitchImplCppManager = void 0;
const SwitchImplContext_1 = require("../implements/10/art/interpreter/SwitchImplContext");
class ExecuteSwitchImplCppManager {
    constructor() {
    }
    static get execute_switch_impl_cpp_1_0() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb0EEEvPNS0_17SwitchImplContextE", "libart.so");
    }
    static get execute_switch_impl_cpp_0_1() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb1EEEvPNS0_17SwitchImplContextE", "libart.so");
    }
    static get execute_switch_impl_cpp_1_1() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb1EEEvPNS0_17SwitchImplContextE", "libart.so");
    }
    static get execute_switch_impl_cpp_0_0() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb0EEEvPNS0_17SwitchImplContextE", "libart.so");
    }
    static enableHook() {
        [
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_0,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_0,
        ]
            .filter(it => it != null)
            .forEach(hookAddress => {
            Interceptor.attach(hookAddress, {
                onEnter: function (args) {
                    const ctx = new SwitchImplContext_1.SwitchImplContext(args[0]);
                    ctx.shadow_frame.printBackTraceWithSmali();
                    newLine();
                }
            });
        });
    }
}
exports.ExecuteSwitchImplCppManager = ExecuteSwitchImplCppManager;
},{"../implements/10/art/interpreter/SwitchImplContext":62}],22:[function(require,module,exports){
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
},{"./DexFileManager":20}],23:[function(require,module,exports){
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
        if (ret.length == 0)
            if (withError)
                throw new Error("can not find symbol");
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
},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./DefineClass");
require("./SymbolManager");
require("./DefineClass");
require("./OpenCommon");
require("./init_array");
require("./ExecuteSwitchImplCpp");
},{"./DefineClass":19,"./ExecuteSwitchImplCpp":21,"./OpenCommon":22,"./SymbolManager":23,"./init_array":25}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitArray = void 0;
class InitArray {
    static get linkerName() {
        return Process.arch == "arm" ? "linker" : "linker64";
    }
    static get init_array_linker() {
        const soName = InitArray.linkerName;
        const init_array_ptr = Process.findModuleByName(soName)
            .enumerateSymbols()
            .filter(s => s.name == ".init_array")
            .map(s => s.address)[0];
        let functions = [];
        for (let i = 0; i < 100; i++) {
            let functionPtr = init_array_ptr.add(i * Process.pointerSize).readPointer();
            try {
                functionPtr.readPointer();
            }
            catch {
                break;
            }
            if (functionPtr.isNull())
                break;
            functions.push(functionPtr);
        }
        return functions;
    }
    static getSoName(soinfo) {
        return callSym("__dl__ZNK6soinfo10get_sonameEv", InitArray.linkerName, 'pointer', ['pointer'], soinfo).readCString();
    }
    static cm_include = `
    #include <stdio.h>
    #include <gum/gumprocess.h>
    #include <gum/guminterceptor.h>
    `;
    static cm_code = `
    #if defined(__LP64__)
    #define USE_RELA 1
    #endif
     
    // http://aosp.app/android-14.0.0_r1/xref/bionic/libc/include/link.h
    #if defined(__LP64__)
    #define ElfW(type) Elf64_ ## type
    #else
    #define ElfW(type) Elf32_ ## type
    #endif
     
    // http://aosp.app/android-14.0.0_r1/xref/bionic/libc/kernel/uapi/asm-generic/int-ll64.h
    typedef signed char __s8;
    typedef unsigned char __u8;
    typedef signed short __s16;
    typedef unsigned short __u16;
    typedef signed int __s32;
    typedef unsigned int __u32;
    typedef signed long long __s64;
    typedef unsigned long long __u64;
     
    // http://aosp.app/android-14.0.0_r1/xref/bionic/libc/kernel/uapi/linux/elf.h
    typedef __u32 Elf32_Addr;
    typedef __u16 Elf32_Half;
    typedef __u32 Elf32_Off;
    typedef __s32 Elf32_Sword;
    typedef __u32 Elf32_Word;
    typedef __u64 Elf64_Addr;
    typedef __u16 Elf64_Half;
    typedef __s16 Elf64_SHalf;
    typedef __u64 Elf64_Off;
    typedef __s32 Elf64_Sword;
    typedef __u32 Elf64_Word;
    typedef __u64 Elf64_Xword;
    typedef __s64 Elf64_Sxword;
     
    typedef struct dynamic {
      Elf32_Sword d_tag;
      union {
        Elf32_Sword d_val;
        Elf32_Addr d_ptr;
      } d_un;
    } Elf32_Dyn;
    typedef struct {
      Elf64_Sxword d_tag;
      union {
        Elf64_Xword d_val;
        Elf64_Addr d_ptr;
      } d_un;
    } Elf64_Dyn;
    typedef struct elf32_rel {
      Elf32_Addr r_offset;
      Elf32_Word r_info;
    } Elf32_Rel;
    typedef struct elf64_rel {
      Elf64_Addr r_offset;
      Elf64_Xword r_info;
    } Elf64_Rel;
    typedef struct elf32_rela {
      Elf32_Addr r_offset;
      Elf32_Word r_info;
      Elf32_Sword r_addend;
    } Elf32_Rela;
    typedef struct elf64_rela {
      Elf64_Addr r_offset;
      Elf64_Xword r_info;
      Elf64_Sxword r_addend;
    } Elf64_Rela;
    typedef struct elf32_sym {
      Elf32_Word st_name;
      Elf32_Addr st_value;
      Elf32_Word st_size;
      unsigned char st_info;
      unsigned char st_other;
      Elf32_Half st_shndx;
    } Elf32_Sym;
    typedef struct elf64_sym {
      Elf64_Word st_name;
      unsigned char st_info;
      unsigned char st_other;
      Elf64_Half st_shndx;
      Elf64_Addr st_value;
      Elf64_Xword st_size;
    } Elf64_Sym;
    typedef struct elf32_phdr {
      Elf32_Word p_type;
      Elf32_Off p_offset;
      Elf32_Addr p_vaddr;
      Elf32_Addr p_paddr;
      Elf32_Word p_filesz;
      Elf32_Word p_memsz;
      Elf32_Word p_flags;
      Elf32_Word p_align;
    } Elf32_Phdr;
    typedef struct elf64_phdr {
      Elf64_Word p_type;
      Elf64_Word p_flags;
      Elf64_Off p_offset;
      Elf64_Addr p_vaddr;
      Elf64_Addr p_paddr;
      Elf64_Xword p_filesz;
      Elf64_Xword p_memsz;
      Elf64_Xword p_align;
    } Elf64_Phdr;
     
    // http://aosp.app/android-14.0.0_r1/xref/bionic/linker/linker_soinfo.h
    typedef void (*linker_dtor_function_t)();
    typedef void (*linker_ctor_function_t)(int, char**, char**);
     
    #if defined(__work_around_b_24465209__)
    #define SOINFO_NAME_LEN 128
    #endif
     
    typedef struct {
      #if defined(__work_around_b_24465209__)
        char old_name_[SOINFO_NAME_LEN];
      #endif
        const ElfW(Phdr)* phdr;
        size_t phnum;
      #if defined(__work_around_b_24465209__)
        ElfW(Addr) unused0; // DO NOT USE, maintained for compatibility.
      #endif
        ElfW(Addr) base;
        size_t size;
       
      #if defined(__work_around_b_24465209__)
        uint32_t unused1;  // DO NOT USE, maintained for compatibility.
      #endif
       
        ElfW(Dyn)* dynamic;
       
      #if defined(__work_around_b_24465209__)
        uint32_t unused2; // DO NOT USE, maintained for compatibility
        uint32_t unused3; // DO NOT USE, maintained for compatibility
      #endif
       
        void* next;
        uint32_t flags_;
       
        const char* strtab_;
        ElfW(Sym)* symtab_;
       
        size_t nbucket_;
        size_t nchain_;
        uint32_t* bucket_;
        uint32_t* chain_;
       
      #if !defined(__LP64__)
        ElfW(Addr)** unused4; // DO NOT USE, maintained for compatibility
      #endif
       
      #if defined(USE_RELA)
        ElfW(Rela)* plt_rela_;
        size_t plt_rela_count_;
       
        ElfW(Rela)* rela_;
        size_t rela_count_;
      #else
        ElfW(Rel)* plt_rel_;
        size_t plt_rel_count_;
       
        ElfW(Rel)* rel_;
        size_t rel_count_;
      #endif
       
        linker_ctor_function_t* preinit_array_;
        size_t preinit_array_count_;
       
        linker_ctor_function_t* init_array_;
        size_t init_array_count_;
        linker_dtor_function_t* fini_array_;
        size_t fini_array_count_;
       
        linker_ctor_function_t init_func_;
        linker_dtor_function_t fini_func_;

        // ...

    } soinfo;

    extern void onEnter_call_constructors(GumCpuContext *ctx, soinfo* si, const char* soName, linker_ctor_function_t* init_array, size_t init_array_count, linker_dtor_function_t* fini_array, size_t fini_array_count);

    extern const char* get_soName(soinfo* si);

    linker_ctor_function_t* get_init_array(soinfo* si) {
        return si->init_array_;
    }

    size_t get_init_array_count(soinfo* si) {
        return si->init_array_count_;
    }

    linker_dtor_function_t* get_fini_array(soinfo* si) {
        return si->fini_array_;
    }

    size_t get_fini_array_count(soinfo* si) {
        return si->fini_array_count_;
    }

    void onEnter(GumInvocationContext *ctx) {
        soinfo* info = (soinfo*)gum_invocation_context_get_nth_argument(ctx,0);
        onEnter_call_constructors(ctx->cpu_context, info, get_soName(info), get_init_array(info), get_init_array_count(info), get_fini_array(info), get_fini_array_count(info));
    }

    `;
    static cm = null;
    static MapMdCalled = new Map();
    static Hook_CallConstructors(maxDisplayCount = 10, showFiniArray = true, simMdShowOnce = true) {
        if (Process.arch == "arm") {
            InitArray.cm_code = InitArray.cm_include + "#define __work_around_b_24465209__ 1" + InitArray.cm_code;
        }
        else {
            InitArray.cm_code = InitArray.cm_include + "#define __LP64__ 1" + InitArray.cm_code;
        }
        InitArray.cm = new CModule(InitArray.cm_code, {
            get_soName: getSym("__dl__ZNK6soinfo10get_sonameEv", InitArray.linkerName),
            onEnter_call_constructors: new NativeCallback((_ctx, _si, soName, init_array, init_array_count, fini_array, fini_array_count) => {
                const soNameStr = soName.readCString();
                if (simMdShowOnce) {
                    if (InitArray.MapMdCalled.has(soNameStr)) {
                        let count = InitArray.MapMdCalled.get(soNameStr);
                        count++;
                        InitArray.MapMdCalled.set(soNameStr, count);
                        return;
                    }
                    else {
                        InitArray.MapMdCalled.set(soNameStr, 1);
                    }
                }
                LOGD(`call_constructors soName: ${soNameStr} `);
                if (init_array_count != 0) {
                    LOGD(`\tinit_array: ${init_array} | init_array_count: ${init_array_count}`);
                    let detail = '';
                    let loopCount = init_array_count > maxDisplayCount ? maxDisplayCount : init_array_count;
                    for (let i = 0; i < loopCount; i++) {
                        let funcPtr = init_array.add(i * Process.pointerSize).readPointer();
                        let funcName = DebugSymbol.fromAddress(funcPtr).toString();
                        detail += `\t\t${funcName}\n`;
                    }
                    detail = detail.substring(0, detail.length - 1);
                    LOGD(`\tinit_array detail: \n${detail}`);
                    if (init_array_count > maxDisplayCount)
                        LOGZ(`\t\t... ${init_array_count - maxDisplayCount} more ...\n`);
                }
                else {
                    LOGZ(`\tinit_array_count: ${init_array_count}`);
                }
                if (showFiniArray) {
                    if (fini_array_count != 0) {
                        LOGD(`\tfini_array: ${fini_array} | fini_array_count: ${fini_array_count}`);
                        let detail = '';
                        let loopCount = fini_array_count > maxDisplayCount ? maxDisplayCount : fini_array_count;
                        for (let i = 0; i < loopCount; i++) {
                            let funcPtr = fini_array.add(i * Process.pointerSize).readPointer();
                            let funcName = DebugSymbol.fromAddress(funcPtr).toString();
                            detail += `\t\t${funcName}\n`;
                        }
                        detail = detail.substring(0, detail.length - 1);
                        LOGD(`\tfini_array detail: \n${detail}`);
                        if (fini_array_count > maxDisplayCount)
                            LOGZ(`\t\t... ${fini_array_count - maxDisplayCount} more ...\n`);
                    }
                    else {
                        LOGZ(`\tfini_array_count: ${fini_array_count}`);
                    }
                }
                LOGO(`\n-----------------------------------------------------------\n`);
            }, 'void', ['pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'int'])
        });
        Interceptor.attach(getSym("__dl__ZN6soinfo17call_constructorsEv", InitArray.linkerName), InitArray.cm);
    }
    static get_init_array_count(soinfo) {
        const func = new NativeFunction(InitArray.cm.get_init_array_count, 'pointer', ['pointer']);
        return func(soinfo);
    }
    static get_init_array(soinfo) {
        const func = new NativeFunction(InitArray.cm.get_init_array, 'pointer', ['pointer']);
        const start = func(soinfo);
        const count = InitArray.get_init_array_count(soinfo).toUInt32();
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(start.add(i * Process.pointerSize).readPointer());
        }
        return result;
    }
    static get_fini_array_count(soinfo) {
        const func = new NativeFunction(InitArray.cm.get_fini_array_count, 'pointer', ['pointer']);
        return func(soinfo);
    }
    static get_fini_array(soinfo) {
        const func = new NativeFunction(InitArray.cm.get_fini_array, 'pointer', ['pointer']);
        const start = func(soinfo);
        const count = InitArray.get_fini_array_count(soinfo).toUInt32();
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(start.add(i * Process.pointerSize).readPointer());
        }
        return result;
    }
}
exports.InitArray = InitArray;
globalThis.init_array_linker = InitArray.init_array_linker;
},{}],26:[function(require,module,exports){
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
},{"../../../JSHandle":11,"./Globals":28}],27:[function(require,module,exports){
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
},{"../../../JSHandle":11}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtInstruction = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
const DEBUG_LOG = false;
class ArtInstruction extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `ArtInstruction<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t SizeInCodeUnits=${this.SizeInCodeUnits}`;
        disp += `\n\t DumpHexLE=${this.dumpHexLE()}`;
        return disp;
    }
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
        ArtInstruction.cached_kInstructionNames = new Array(...arrary_ret);
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
        if (DEBUG_LOG)
            var index = 0;
        while (counter-- > 0) {
            arrary_ret.push(new InstructionDescriptor(loopAddaddress));
            if (DEBUG_LOG)
                LOGZ(`${++index} ${new InstructionDescriptor(loopAddaddress)}`);
            loopAddaddress = loopAddaddress.add(InstructionDescriptor.SizeOfClass);
        }
        ArtInstruction.cached_kInstructionDescriptors = new Array(...arrary_ret);
        return arrary_ret;
    }
    static cached_kInstructionDescriptorsMap = [];
    static get InstructionGroup() {
        if (ArtInstruction.cached_kInstructionDescriptorsMap.length > 0)
            return ArtInstruction.cached_kInstructionDescriptorsMap;
        let arrary_ret = [];
        ArtInstruction.kInstructionDescriptors.forEach((descriptor, index) => {
            arrary_ret.push([ArtInstruction.kInstructionNames[index], descriptor]);
        });
        ArtInstruction.cached_kInstructionDescriptorsMap = new Array(...arrary_ret);
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
        return `${realInsLen} - ${StdString_1.StdString.fromPointers(callSym("_ZNK3art11Instruction9DumpHexLEEm", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "int"], this.handle, realInsLen > instr_code_units ? realInsLen : instr_code_units))}`;
    }
    sizeInCodeUnitsComplexOpcode() {
        return callSym("_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv", "libdexfile.so", ["pointer"], ["pointer"], this.handle);
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
        if (DEBUG_LOG)
            LOGZ(`opcode: ${ptr(opcode)} ${opcode} | ${ArtInstruction.kInstructionDescriptors[opcode]} | ${ArtInstruction.kInstructionNames[opcode]}`);
        let result = (ArtInstruction.InstructionGroup[opcode][1].size_in_code_units);
        if (result < 0)
            return this.sizeInCodeUnitsComplexOpcode() * 0x2;
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
    verify_flags_ = this.handle;
    format_ = this.verify_flags_.add(0x4);
    index_type_ = this.format_.add(0x1);
    flags_ = this.index_type_.add(0x1);
    size_in_code_units_ = this.flags_.add(0x1);
    toString() {
        return `InstructionDescriptor<${this.handle}> | format: ${this.format.name} @ ${this.format.handle} | size_in_code_units: ${this.size_in_code_units} @ `;
    }
    static get SizeOfClass() {
        return ptr(0x4).add(0x1).add(0x1).add(0x1).add(0x1);
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
    format = this.CurrentHandle.toUInt32();
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
globalThis.InstructionGroup = () => { return ArtInstruction.InstructionGroup; };
},{"../../../../tools/StdString":80,"../../../JSHandle":11}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instrumentation = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
class Instrumentation extends JSHandle_1.JSHandle {
    instrumentation_stubs_installed_ = this.CurrentHandle;
    entry_exit_stubs_installed_ = this.instrumentation_stubs_installed_.add(0x1);
    interpreter_stubs_installed_ = this.entry_exit_stubs_installed_.add(0x1);
    interpret_only_ = this.interpreter_stubs_installed_.add(0x1);
    forced_interpret_only_ = this.interpret_only_.add(0x1);
    have_method_entry_listeners_ = this.forced_interpret_only_.add(0x1);
    have_method_exit_listeners_ = this.have_method_entry_listeners_.add(0x1);
    have_method_unwind_listeners_ = this.have_method_exit_listeners_.add(0x1);
    have_dex_pc_listeners_ = this.have_method_unwind_listeners_.add(0x1);
    have_field_read_listeners_ = this.have_dex_pc_listeners_.add(0x1);
    have_field_write_listeners_ = this.have_field_read_listeners_.add(0x1);
    have_exception_thrown_listeners_ = this.have_field_write_listeners_.add(0x1);
    have_watched_frame_pop_listeners_ = this.have_exception_thrown_listeners_.add(0x1);
    have_branch_listeners_ = this.have_watched_frame_pop_listeners_.add(0x1);
    have_exception_handled_listeners_ = this.have_branch_listeners_.add(0x1);
    requested_instrumentation_levels_ = this.have_exception_handled_listeners_.add(0x1);
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `Instrumentation< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        return disp;
    }
    get SizeOfClass() {
        return super.SizeOfClass + (this.requested_instrumentation_levels_.add(Globals_1.PointerSize).sub(this.CurrentHandle).toInt32());
    }
}
exports.Instrumentation = Instrumentation;
},{"../../../../JSHandle":11,"../Globals":28}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentationListener = void 0;
const JSHandle_1 = require("../../../../JSHandle");
class InstrumentationListener extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
}
exports.InstrumentationListener = InstrumentationListener;
},{"../../../../JSHandle":11}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentationStackFrame = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const Object_1 = require("../../../../Object");
const Globals_1 = require("../Globals");
const ArtMethod_1 = require("../mirror/ArtMethod");
class InstrumentationStackFrame extends JSHandle_1.JSHandle {
    this_object_ = this.CurrentHandle;
    method_ = this.this_object_.add(Globals_1.PointerSize);
    return_pc_ = this.method_.add(Globals_1.PointerSize);
    frame_id_ = this.return_pc_.add(Globals_1.PointerSize);
    interpreter_entry_ = this.frame_id_.add(Globals_1.PointerSize);
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `InstrumentationStackFrame< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        disp += `\n${this.this_object}`;
        disp += `\n${this.method}`;
        disp += `\n${this.return_pc}`;
        disp += `\n${this.frame_id}`;
        disp += `\n${this.interpreter_entry}`;
        return disp;
    }
    get SizeOfClass() {
        return super.SizeOfClass + (this.interpreter_entry_.add(0x4).sub(this.handle).toInt32());
    }
    get this_object() {
        return new Object_1.ArtObject(this.this_object_.readPointer());
    }
    get method() {
        return new ArtMethod_1.ArtMethod(this.method_.readPointer());
    }
    get return_pc() {
        return this.return_pc_.readPointer();
    }
    get frame_id() {
        return this.frame_id_.readU32();
    }
    get interpreter_entry() {
        return this.interpreter_entry_.readU8() == 1;
    }
    Dump() {
        return `Frame ${this.frame_id_} ${this.method.PrettyMethod()}:${this.return_pc_} this=${this.this_object}`;
    }
}
exports.InstrumentationStackFrame = InstrumentationStackFrame;
},{"../../../../JSHandle":11,"../../../../Object":12,"../Globals":28,"../mirror/ArtMethod":65}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentationStackPopper = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
const Thread_1 = require("../Thread");
class InstrumentationStackPopper extends JSHandle_1.JSHandle {
    self_ = this.CurrentHandle;
    instrumentation_ = this.self_.add(Globals_1.PointerSize);
    frames_to_remove_ = this.instrumentation_.add(Globals_1.PointerSize);
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `InstrumentationStackPopper< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        disp += `\n${this.self}`;
        disp += `\n${this.instrumentation}`;
        disp += `\n${this.frames_to_remove}`;
        return disp;
    }
    get SizeOfClass() {
        return super.SizeOfClass + (this.frames_to_remove_.add(0x4).sub(this.handle).toInt32());
    }
    get self() {
        return new Thread_1.ArtThread(this.self_.readPointer());
    }
    get instrumentation() {
        return this.instrumentation_.readPointer();
    }
    get frames_to_remove() {
        return this.frames_to_remove_.readU32();
    }
}
exports.InstrumentationStackPopper = InstrumentationStackPopper;
},{"../../../../JSHandle":11,"../Globals":28,"../Thread":47}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentationLevel = exports.InstrumentationEvent = exports.InterpreterHandlerTable = void 0;
var InterpreterHandlerTable;
(function (InterpreterHandlerTable) {
    InterpreterHandlerTable[InterpreterHandlerTable["kMainHandlerTable"] = 0] = "kMainHandlerTable";
    InterpreterHandlerTable[InterpreterHandlerTable["kAlternativeHandlerTable"] = 1] = "kAlternativeHandlerTable";
    InterpreterHandlerTable[InterpreterHandlerTable["kNumHandlerTables"] = 2] = "kNumHandlerTables";
})(InterpreterHandlerTable = exports.InterpreterHandlerTable || (exports.InterpreterHandlerTable = {}));
var InstrumentationEvent;
(function (InstrumentationEvent) {
    InstrumentationEvent[InstrumentationEvent["kMethodEntered"] = 1] = "kMethodEntered";
    InstrumentationEvent[InstrumentationEvent["kMethodExited"] = 2] = "kMethodExited";
    InstrumentationEvent[InstrumentationEvent["kMethodUnwind"] = 4] = "kMethodUnwind";
    InstrumentationEvent[InstrumentationEvent["kDexPcMoved"] = 8] = "kDexPcMoved";
    InstrumentationEvent[InstrumentationEvent["kFieldRead"] = 16] = "kFieldRead";
    InstrumentationEvent[InstrumentationEvent["kFieldWritten"] = 32] = "kFieldWritten";
    InstrumentationEvent[InstrumentationEvent["kExceptionThrown"] = 64] = "kExceptionThrown";
    InstrumentationEvent[InstrumentationEvent["kBranch"] = 128] = "kBranch";
    InstrumentationEvent[InstrumentationEvent["kWatchedFramePop"] = 512] = "kWatchedFramePop";
    InstrumentationEvent[InstrumentationEvent["kExceptionHandled"] = 1024] = "kExceptionHandled";
})(InstrumentationEvent = exports.InstrumentationEvent || (exports.InstrumentationEvent = {}));
var InstrumentationLevel;
(function (InstrumentationLevel) {
    InstrumentationLevel[InstrumentationLevel["kInstrumentNothing"] = 0] = "kInstrumentNothing";
    InstrumentationLevel[InstrumentationLevel["kInstrumentWithInstrumentationStubs"] = 1] = "kInstrumentWithInstrumentationStubs";
    InstrumentationLevel[InstrumentationLevel["kInstrumentWithInterpreter"] = 2] = "kInstrumentWithInterpreter";
})(InstrumentationLevel = exports.InstrumentationLevel || (exports.InstrumentationLevel = {}));
},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./enum");
require("./Instrumentation");
require("./InstrumentationListener");
require("./InstrumentationStackFrame");
require("./InstrumentationStackPopper");
},{"./Instrumentation":30,"./InstrumentationListener":31,"./InstrumentationStackFrame":32,"./InstrumentationStackPopper":33,"./enum":34}],36:[function(require,module,exports){
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
},{"../../../JSHandle":11}],37:[function(require,module,exports){
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
        if (this.handle.isNull())
            return disp;
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
        if (this.oat_file_.isNull())
            return null;
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
},{"../../../../../tools/StdString":80,"../../../../JSHandle":11,"../Globals":28,"./OatFile":38}],38:[function(require,module,exports){
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
},{"../../../../../tools/StdString":80,"../../../../JSHandle":11,"../Globals":28}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./OatFile");
require("./OatDexFile");
},{"./OatDexFile":37,"./OatFile":38}],40:[function(require,module,exports){
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
},{"../../../JSHandle":11}],41:[function(require,module,exports){
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
},{"../../../JSHandle":11}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowFrame = void 0;
const Instruction_1 = require("./Instruction");
const ArtMethod_1 = require("./mirror/ArtMethod");
const JSHandle_1 = require("../../../JSHandle");
const Object_1 = require("../../../Object");
const Globals_1 = require("./Globals");
const JValue_1 = require("./Type/JValue");
class ShadowFrame extends JSHandle_1.JSHandle {
    link_ = this.CurrentHandle;
    method_ = this.link_.add(Globals_1.PointerSize);
    result_register_ = this.method_.add(Globals_1.PointerSize);
    dex_pc_ptr_ = this.result_register_.add(Globals_1.PointerSize);
    dex_instructions_ = this.dex_pc_ptr_.add(Globals_1.PointerSize);
    number_of_vregs_ = this.dex_instructions_.add(Globals_1.PointerSize);
    dex_pc_ = this.number_of_vregs_.add(0x4);
    cached_hotness_countdown_ = this.dex_pc_.add(0x4);
    hotness_countdown_ = this.cached_hotness_countdown_.add(0x2);
    frame_flags_ = this.hotness_countdown_.add(0x2);
    vregs_ = this.frame_flags_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `ShadowFrame<${this.handle}>`;
        seeHexA(this.handle);
        if (this.handle.isNull())
            return disp;
        disp += `\n\t link_: ${this.link_}`;
        disp += `\n\t method_: ${this.method_} -> ${this.method.PrettyMethod()}`;
        disp += `\n\t result_register: ${this.result_register}`;
        disp += `\n\t dex_pc_ptr: ${this.dex_pc_ptr}`;
        disp += `\n\t dex_instructions: ${this.dex_instructions.toString().split('\n').map((item, index) => index == 0 ? item : `\n\t${item}`).join('')}`;
        disp += `\n\t number_of_vregs: ${this.number_of_vregs}`;
        disp += `\n\t dex_pc: ${this.dex_pc}`;
        disp += `\n\t cached_hotness_countdown: ${this.cached_hotness_countdown}`;
        disp += `\n\t hotness_countdown: ${this.hotness_countdown}`;
        disp += `\n\t frame_flags: ${this.frame_flags}`;
        return disp;
    }
    get link() {
        return new ShadowFrame(this.link_.readPointer());
    }
    get method() {
        return new ArtMethod_1.ArtMethod(this.method_.readPointer());
    }
    get result_register() {
        return new JValue_1.JValue(this.result_register_.readPointer());
    }
    get dex_pc_ptr() {
        return this.dex_pc_ptr_.readPointer();
    }
    get dex_instructions() {
        return new Instruction_1.ArtInstruction(this.dex_instructions_.readPointer());
    }
    get number_of_vregs() {
        return this.number_of_vregs_.readU32();
    }
    get dex_pc() {
        return this.dex_pc_.readU32();
    }
    get cached_hotness_countdown() {
        return this.cached_hotness_countdown_.readS16();
    }
    get hotness_countdown() {
        return this.hotness_countdown_.readS16();
    }
    get frame_flags() {
        return this.frame_flags_.readU32();
    }
    set dex_pc(dex_pc_) {
        this.dex_pc_.writeU32(dex_pc_);
    }
    set dex_pc_ptr(dex_pc_ptr_) {
        this.dex_pc_ptr_.writePointer(dex_pc_ptr_);
    }
    get vregs() {
        const vregs = [];
        for (let i = 0; i < this.number_of_vregs; i++) {
            vregs.push(this.vregs_.add(i * 4).readU32());
        }
        return vregs;
    }
    get vreg_refs() {
        const vreg_refs = [];
        for (let i = 0; i < this.number_of_vregs; i++) {
            vreg_refs.push(this.vregs_.add(this.number_of_vregs * 0x4 + i * Globals_1.PointerSize));
        }
        return vreg_refs;
    }
    sizeInCodeUnitsComplexOpcode() {
        return callSym("_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv", "libdexfile.so", ["pointer"], ["pointer"], this.handle);
    }
    GetThisObject() {
        return new Object_1.ArtObject(callSym("_ZNK3art11ShadowFrame13GetThisObjectEt", "libart.so", ["pointer", "uint16"], ["pointer", "uint16"], this.handle, 0));
    }
    GetThisObject_num_ins(num_ins) {
        return new Object_1.ArtObject(callSym("_ZNK3art11ShadowFrame13GetThisObjectEt", "libart.so", ["pointer", "uint16"], ["pointer", "uint16"], this.handle, num_ins));
    }
    GetDexPC() {
        return this.dex_pc_ptr_.isNull() ? this.dex_pc_ : this.dex_pc_ptr_.sub(this.dex_instructions_);
    }
    GetCachedHotnessCountdown() {
        return this.cached_hotness_countdown;
    }
    SetCachedHotnessCountdown(cached_hotness_countdown) {
        this.cached_hotness_countdown_.writeS16(cached_hotness_countdown);
    }
    GetHotnessCountdown() {
        return this.hotness_countdown;
    }
    SetHotnessCountdown(hotness_countdown) {
        this.hotness_countdown_.writeS16(hotness_countdown);
    }
    SetDexPC(dex_pc_v) {
        this.dex_pc = dex_pc_v;
        this.dex_pc_ptr = NULL;
    }
    get backTrace() {
        const backtrace = [];
        let sf = this;
        while (!sf.link.handle.isNull()) {
            backtrace.push(sf);
            sf = sf.link;
        }
        return backtrace;
    }
    printBackTrace(simple = true) {
        this.backTrace.map((sf, index) => `${index}: ${simple ? sf.method.PrettyMethod() : sf.method}`).forEach(LOGD);
    }
    printBackTraceWithSmali(simple = true, smaliLines = 3) {
        this.backTrace.forEach((sf, index) => {
            const thisMethod = sf.method;
            LOGD(`${index}: ${simple ? thisMethod.PrettyMethod() : thisMethod}`);
            const dexfile = thisMethod.GetDexFile();
            let artInstruction = sf.dex_pc_ptr.isNull() ? thisMethod.DexInstructions().InstructionAt() : new Instruction_1.ArtInstruction(sf.dex_pc_ptr);
            let counter = smaliLines;
            let disp_smali = "";
            while (--counter >= 0 && artInstruction.Next().SizeInCodeUnits > 0) {
                const offset = artInstruction.handle.sub(thisMethod.DexInstructions().insns);
                disp_smali += `\t${artInstruction.handle} ${offset} -> ${artInstruction.dumpString(dexfile)}\n`;
                artInstruction = artInstruction.Next();
            }
            LOGZ(disp_smali.trimEnd());
        });
    }
}
exports.ShadowFrame = ShadowFrame;
},{"../../../JSHandle":11,"../../../Object":12,"./Globals":28,"./Instruction":29,"./Type/JValue":48,"./mirror/ArtMethod":65}],43:[function(require,module,exports){
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
},{"./StackVisitor":45}],44:[function(require,module,exports){
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
},{"./StackVisitor":45}],45:[function(require,module,exports){
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
    toString() {
        let disp = `StackVisitor< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        disp += `\n${this.thread}`;
        disp += `\n${this.walk_kind}`;
        disp += `\n${this.cur_shadow_frame}`;
        disp += `\n${this.cur_quick_frame}`;
        disp += `\n${this.cur_quick_frame_pc}`;
        disp += `\n${this.cur_oat_quick_method_header}`;
        disp += `\n${this.num_frames}`;
        disp += `\n${this.cur_depth}`;
        disp += `\n${this.current_code_info}`;
        disp += `\n${this.current_inline_frames}`;
        disp += `\n${this.context}`;
        disp += `\n${this.check_suspended}`;
        return disp;
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
},{"../../../../../tools/StdString":80,"../../../../JSHandle":11,"../../../../Object":12,"../Globals":28,"../OatQuickMethodHeader":36,"../QuickMethodFrameInfo":41,"../ShadowFrame":42,"../Thread":47,"../mirror/ArtMethod":65}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StackVisitor");
require("./CHAStackVisitor");
require("./CatchBlockStackVisitor");
},{"./CHAStackVisitor":43,"./CatchBlockStackVisitor":44,"./StackVisitor":45}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtThread = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
const ArtMethod_1 = require("./mirror/ArtMethod");
class ArtThread extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `ArtThread<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t ThreadName=${this.GetThreadName()}`;
        try {
            disp += `\n\t CurrentMethod=${this.GetCurrentMethod().PrettyMethod(false)}`;
        }
        catch { }
        return disp;
    }
    get is_started() {
        return getSym("_ZN3art6Thread11is_started_E", "libart.so").readU8() == 1;
    }
    GetThreadName() {
        return StdString_1.StdString.from(callSym("_ZNK3art6Thread13GetThreadNameEv", "libart.so", "pointer", ["pointer"], this.CurrentHandle));
    }
    SetThreadName(name) {
        callSym("_ZN3art6Thread13SetThreadNameEPKc", "libart.so", "void", ["pointer", "pointer"], this.CurrentHandle, Memory.allocUtf8String(name));
    }
    DumpJavaStack(check_suspended = true, dump_locks = true) {
        let stdStr = new StdString_1.StdString();
        callSym("_ZNK3art6Thread13DumpJavaStackERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEEbb", "libart.so", "void", ["pointer", "bool", "bool"], this.CurrentHandle, stdStr, check_suspended, dump_locks);
        return stdStr.disposeToString();
    }
    NumberOfHeldMutexes() {
        return callSym("_ZNK3art6Thread19NumberOfHeldMutexesEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    SetClassLoaderOverride(class_loader) {
        callSym("_ZN3art6Thread22SetClassLoaderOverrideEP8_jobject", "libart.so", "void", ["pointer", "pointer"], this.CurrentHandle, class_loader.handle);
    }
    FindDebuggerShadowFrame(frame_id) {
        return callSym("_ZN3art6Thread23FindDebuggerShadowFrameEm", "libart.so", "pointer", ["pointer", "int"], this.CurrentHandle, frame_id);
    }
    Park(is_absolute = true, time = 10) {
        callSym("_ZN3art6Thread4ParkEbl", "libart.so", "void", ["pointer", "pointer", "pointer"], this.CurrentHandle, ptr(is_absolute ? 1 : 0), ptr(time));
    }
    Unpark() {
        callSym("_ZN3art6Thread6UnparkEv", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    Notify() {
        callSym("_ZN3art6Thread6NotifyEv", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    static GetNativePriority() {
        return callSym("_ZN3art6Thread17GetNativePriorityEv", "libart.so", "int", []);
    }
    CanLoadClasses() {
        return !!callSym("_ZNK3art6Thread14CanLoadClassesEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    GetCurrentMethod(dex_pc = 0, check_suspended = true, abort_on_error = true) {
        return new ArtMethod_1.ArtMethod(callSym("_ZNK3art6Thread16GetCurrentMethodEPjbb", "libart.so", "pointer", ["pointer", "pointer", "pointer", "pointer"], this.CurrentHandle, ptr(dex_pc), ptr(check_suspended ? 1 : 0), ptr(abort_on_error ? 1 : 0)));
    }
    Interrupt() {
        callSym("_ZN3art6Thread9InterruptEPS0_", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    IsInterrupted() {
        return !!callSym("_ZN3art6Thread13IsInterruptedEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    Interrupted() {
        return !!callSym("_ZN3art6Thread11InterruptedEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    IsSystemDaemon() {
        return !!callSym("_ZNK3art6Thread14IsSystemDaemonEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    static IsAotCompiler() {
        return !!callSym("_ZN3art6Thread13IsAotCompilerEv", "libart.so", "int", []);
    }
    ProtectStack(fatal_on_error = true) {
        return !!callSym("_ZN3art6Thread12ProtectStackEb", "libart.so", "int", ["pointer", "bool"], this.CurrentHandle, fatal_on_error);
    }
    UnprotectStack() {
        callSym("_ZN3art6Thread14UnprotectStackEv", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    HandleScopeContains(obj) {
        return !!callSym("_ZNK3art6Thread19HandleScopeContainsEP8_jobject", "libart.so", "int", ["pointer", "pointer"], this.CurrentHandle, obj.handle);
    }
    static Attach_3(thread_name, as_daemon, thread_peer) {
        return new ArtThread(callSym("_ZN3art6Thread6AttachEPKcbP8_jobject", "libart.so", "pointer", ["pointer", "bool", "pointer"], Memory.allocUtf8String(thread_name), as_daemon, thread_peer.handle));
    }
    static Attach_4(thread_name, as_daemon, thread_group, create_peer) {
        return new ArtThread(callSym("_ZN3art6Thread6AttachEPKcbP8_jobjectb", "libart.so", "pointer", ["pointer", "bool", "pointer", "bool"], Memory.allocUtf8String(thread_name), as_daemon, thread_group.handle, create_peer));
    }
}
exports.ArtThread = ArtThread;
},{"../../../../tools/StdString":80,"../../../JSHandle":11,"./mirror/ArtMethod":65}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JValue = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const Object_1 = require("../../../../Object");
class JValue extends JSHandle_1.JSHandleNotImpl {
    z = this.handle;
    b = this.z.add(1);
    c = this.b.add(1);
    s = this.c.add(2);
    i = this.s.add(2);
    j = this.i.add(4);
    f = this.j.add(8);
    d = this.f.add(4);
    l = this.d.add(8);
    constructor(handle) {
        super(handle);
    }
    get z_() {
        return this.z.readU8();
    }
    get b_() {
        return this.b.readS8();
    }
    get c_() {
        return this.c.readU16();
    }
    get s_() {
        return this.s.readS16();
    }
    get i_() {
        return this.i.readS32();
    }
    get j_() {
        return this.j.readS64();
    }
    get f_() {
        return this.f.readFloat();
    }
    get d_() {
        return this.d.readDouble();
    }
    get l_() {
        return new Object_1.ArtObject(this.l.readPointer());
    }
    GetGCRoot() {
        return this.l;
    }
    toString() {
        let disp = `JValue<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t z=${this.z_}`;
        disp += `\n\t b=${this.b_}`;
        disp += `\n\t c=${this.c_}`;
        disp += `\n\t s=${this.s_}`;
        disp += `\n\t i=${this.i_}`;
        disp += `\n\t j=${this.j_}`;
        disp += `\n\t f=${this.f_}`;
        disp += `\n\t d=${this.d_}`;
        disp += `\n\t l=${this.l_}`;
        return disp;
    }
}
exports.JValue = JValue;
},{"../../../../JSHandle":11,"../../../../Object":12}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JValue");
require("./jobject");
},{"./JValue":48,"./jobject":50}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobject = void 0;
const JSHandle_1 = require("../../../../JSHandle");
class jobject extends JSHandle_1.JSHandleNotImpl {
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `jobject<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        return disp;
    }
}
exports.jobject = jobject;
},{"../../../../JSHandle":11}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeItemDataAccessor = void 0;
const Globals_1 = require("../Globals");
const CodeItemInstructionAccessor_1 = require("./CodeItemInstructionAccessor");
class CodeItemDataAccessor extends CodeItemInstructionAccessor_1.CodeItemInstructionAccessor {
    registers_size_ = this.CurrentHandle.add(0x0);
    ins_size_ = this.CurrentHandle.add(0x2);
    outs_size_ = this.CurrentHandle.add(0x2 * 2);
    tries_size_ = this.CurrentHandle.add(0x2 * 3);
    constructor(insns_size_in_code_units, insns, registers_size = 0, ins_size = 0, outs_size = 0, tries_size = 0) {
        if (typeof insns_size_in_code_units == "number") {
            super(insns_size_in_code_units, insns);
            this.registers_size_.writeU16(registers_size);
            this.ins_size_.writeU16(ins_size);
            this.outs_size_.writeU16(outs_size);
            this.tries_size_.writeU16(tries_size);
        }
    }
    toString() {
        let disp = `CodeItemDataAccessor<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t registers_size_: ${this.registers_size}`;
        disp += `\n\t ins_size_: ${this.ins_size}`;
        disp += `\n\t outs_size_: ${this.outs_size}`;
        disp += `\n\t tries_size_: ${this.tries_size}`;
        return disp;
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
    static fromRef(ref_ptr) {
        const accessor = Object.create(CodeItemDataAccessor.prototype);
        accessor.handle = ref_ptr;
        accessor.registers_size_ = ref_ptr.add(0x4 + 0x4 + Globals_1.PointerSize);
        accessor.ins_size_ = accessor.registers_size_.add(0x2);
        accessor.outs_size_ = accessor.ins_size_.add(0x2);
        accessor.tries_size_ = accessor.outs_size_.add(0x2);
        accessor.insns_ = ref_ptr.add(0x4 + 0x4);
        accessor.insns_size_in_code_units_ = ref_ptr;
        return accessor;
    }
}
exports.CodeItemDataAccessor = CodeItemDataAccessor;
},{"../Globals":28,"./CodeItemInstructionAccessor":53}],52:[function(require,module,exports){
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
    toString() {
        let disp = `CodeItemDebugInfoAccessor< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        disp += `\ndex_file_: ${this.dex_file}`;
        disp += `\ndebug_info_offset_: ${this.debug_info_offset}`;
        return disp;
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
},{"../Globals":28,"./CodeItemDataAccessor":51}],53:[function(require,module,exports){
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
    CodeItem;
    insns_size_in_code_units_ = this.CurrentHandle;
    insns_ = this.CurrentHandle.add(0x4);
    constructor(insns_size_in_code_units = 0, insns = NULL) {
        if (typeof insns_size_in_code_units == "number" && insns_size_in_code_units == 0 && insns.isNull()) {
            const needAllocSize = CodeItemInstructionAccessor.SIZE_OF_CodeItemInstructionAccessor
                + CodeItemInstructionAccessor.SIZE_OF_CodeItemDataAccessor
                + CodeItemInstructionAccessor.SIZE_OF_CodeItemDebugInfoAccessor;
            super(Memory.alloc(needAllocSize));
            this.CurrentHandle.add(0x0).writeU32(insns_size_in_code_units);
            this.CurrentHandle.add(0x4).writePointer(insns);
        }
    }
    toString() {
        let disp = `CodeItemInstructionAccessor<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\tinsns_size_in_code_units: ${this.insns_size_in_code_units} | insns: ${this.insns} | insns_size_in_bytes: ${this.InsnsSizeInBytes()}`;
        disp += `\n\n\tinsns: ${this.CodeItem.toString().split('\n').map((item, index) => index == 0 ? item : `\n\t${item}`).join('')}`;
        return disp;
    }
    static CodeItem(dexFile, dex_pc) {
        return dexFile.is_compact_dex ? new CompactDexFile_1.CompactDexFile_CodeItem(dex_pc) : new StandardDexFile_1.StandardDexFile_CodeItem(dex_pc);
    }
    static fromDexFile(dexFile, dex_pc) {
        const accessor = new CodeItemInstructionAccessor();
        if (dexFile.is_compact_dex) {
            const codeItem = CodeItemInstructionAccessor.CodeItem(dexFile, dex_pc);
            accessor.insns_size_in_code_units = codeItem.insns_size_in_code_units;
            accessor.insns = codeItem.insns_;
            accessor.CodeItem = codeItem;
        }
        else {
            const codeItem = CodeItemInstructionAccessor.CodeItem(dexFile, dex_pc);
            accessor.insns_size_in_code_units = codeItem.insns_size_in_code_units;
            accessor.insns = codeItem.insns_;
            accessor.CodeItem = codeItem;
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
},{"../../../../JSHandle":11,"../Globals":28,"../Instruction":29,"./CompactDexFile":54,"./StandardDexFile":59}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompactDexFile_CodeItem = exports.CompactDexFile = void 0;
const Globals_1 = require("../Globals");
const DexFile_1 = require("./DexFile");
class CompactDexFile extends DexFile_1.DexFile {
    constructor(dexFile) {
        super(dexFile);
    }
}
exports.CompactDexFile = CompactDexFile;
class CompactDexFile_CodeItem extends DexFile_1.DexFile_CodeItem {
    fields_ = this.CurrentHandle;
    insns_count_and_flags_ = this.fields_.add(0x2);
    insns_ = this.insns_count_and_flags_.add(0x2);
    constructor(dex_pc) {
        super(dex_pc);
    }
    toString() {
        let disp = `CompactDexFile::CodeItem<${this.handle}>`;
        disp += `\n\tfields: ${this.fields} | insns_count_and_flags: ${this.insns_count_and_flags} | insns: ${this.insns}`;
        disp += `\n\tregisters_size: ${this.registers_size} | ins_size: ${this.ins_size} | outs_size: ${this.outs_size} | tries_size: ${this.tries_size}`;
        disp += `\n\tinsns_size_in_code_units: ${this.insns_size_in_code_units} | extension_preheader: ${this.extension_preheader}`;
        return disp;
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass);
    }
    get fields() {
        return ptr(this.fields_.readU16());
    }
    get insns_count_and_flags() {
        return ptr(this.insns_count_and_flags_.readU16());
    }
    get insns() {
        return this.insns_.readPointer();
    }
    set fields(fields) {
        this.fields_.writeU16(fields.toUInt32());
    }
    get registers_size() {
        return (this.fields.toUInt32() >> (4 * 3));
    }
    get ins_size() {
        return (this.fields.and(0xF00).toUInt32()) >> (4 * 2);
    }
    get outs_size() {
        return (this.fields.toUInt32() & 0xF0) >> (4 * 1);
    }
    get tries_size() {
        return (this.fields.toUInt32() & 0xF) >> (4 * 0);
    }
    get insns_size_in_code_units() {
        return this.insns_count_and_flags.shr(Globals_1.kInsnsSizeShift).toUInt32();
    }
    get extension_preheader() {
        return this.insns_count_and_flags.shl(Globals_1.kInsnsSizeShift).toUInt32();
    }
}
exports.CompactDexFile_CodeItem = CompactDexFile_CodeItem;
},{"../Globals":28,"./DexFile":55}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexFile_CodeItem = exports.DexFile = void 0;
const DexFileStructs_1 = require("./DexFileStructs");
const StdString_1 = require("../../../../../tools/StdString");
const DexIndex_1 = require("./DexIndex");
const JSHandle_1 = require("../../../../JSHandle");
const OatDexFile_1 = require("../Oat/OatDexFile");
const Globals_1 = require("../Globals");
const Header_1 = require("./Header");
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
        if (this.handle.isNull())
            return disp;
        disp += `\n\t location: ${this.location} @ ${this.location_}`;
        disp += `\n\t location_checksum: ${this.location_checksum} ( ${ptr(this.location_checksum)} ) is_compact_dex: ${this.is_compact_dex}`;
        disp += `\n\t begin: ${this.begin} size: ${this.size} ( ${ptr(this.size)} ) | data_begin: ${this.data_begin} data_size: ${this.data_size} ( ${ptr(this.data_size)} )`;
        disp += `\n\t oat_dex_file_ ${this.oat_dex_file_}`;
        disp += `\n\t string_ids: ${this.string_ids}`;
        disp += `\n\t type_ids: ${this.type_ids}`;
        disp += `\n\t field_ids: ${this.field_ids}`;
        disp += `\n\t method_ids: ${this.method_ids}`;
        disp += `\n\t proto_ids: ${this.proto_ids}`;
        disp += `\n\t class_defs: ${this.class_defs}`;
        disp += `\n\t method_handles: ${this.method_handles} num_method_handles: ${this.num_method_handles}`;
        disp += `\n\t call_site_ids: ${this.call_site_ids} num_call_site_ids: ${this.num_call_site_ids}`;
        disp += `\n\t hiddenapi_class_data: ${this.hiddenapi_class_data}`;
        disp += `\n\n${this.header}`;
        return disp;
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
        const this_ptr = this.header_.readPointer();
        return this.is_compact_dex ? new Header_1.CompactDexHeader(this_ptr) : new Header_1.StandardDexHeader(this_ptr);
    }
    get string_ids() {
        return this.string_ids_.readPointer();
    }
    StringDataByIdx(index) {
        const index_ = index instanceof DexIndex_1.DexStringIndex ? index.index : index;
        if (index_ < 0 || index_ > this.NumStringIds())
            throw new Error("index out of range");
        const string_id = this.string_ids.add(index_ * DexIndex_1.DexStringIndex.SizeOfClass).readU32();
        const string_data = this.data_begin.add(string_id);
        return DexFileStructs_1.LEB128String.from(string_data);
    }
    NumStringIds() {
        return this.header.string_ids_size;
    }
    FindStringId(string) {
        for (let i = 0; i < this.NumStringIds(); i++) {
            const string_id = this.StringDataByIdx(i);
            if (string_id.str == string)
                return i;
        }
        return -1;
    }
    get type_ids() {
        return this.type_ids_.readPointer();
    }
    NumTypeIds() {
        return this.header.type_ids_size;
    }
    GetTypeId(idx) {
        const idx_ = idx instanceof DexIndex_1.DexTypeIndex ? idx.index : idx;
        if (idx_ < 0 || idx_ > this.NumTypeIds())
            throw new Error("index out of range");
        return new DexFileStructs_1.DexTypeId(this.type_ids.add(idx_ * DexFileStructs_1.DexTypeId.SizeOfClass));
    }
    GetTypeDescriptor(type_idx) {
        return this.StringDataByIdx(this.GetTypeId(type_idx).descriptor_idx).str;
    }
    get field_ids() {
        return this.field_ids_.readPointer();
    }
    NumFieldIds() {
        return this.header.field_ids_size;
    }
    GetFieldId(idx) {
        if (idx < 0 || idx > this.header.field_ids_size)
            throw new Error("index out of range");
        return new DexFileStructs_1.DexFieldId(this.field_ids.add(idx * DexFileStructs_1.DexFieldId.SizeOfClass));
    }
    GetFieldAnnotations(anno_dir) {
        return new DexFileStructs_1.DexFieldAnnotationsItem(this.data_begin.add(anno_dir.fields_size == 0 ? NULL : anno_dir.class_annotations_off_.add(Globals_1.PointerSize)));
    }
    get proto_ids() {
        return this.proto_ids_.readPointer();
    }
    NumProtoIds() {
        return this.header.proto_ids_size;
    }
    GetProtoId(idx) {
        const idx_ = idx instanceof DexIndex_1.DexTypeIndex ? idx.index : idx;
        if (idx_ < 0 || idx_ > this.header.proto_ids_size)
            throw new Error("index out of range");
        return new DexFileStructs_1.DexProtoId(this.proto_ids.add(idx_ * DexFileStructs_1.DexProtoId.SizeOfClass));
    }
    GetShorty(proto_idx) {
        return this.StringDataByIdx(this.GetProtoId(proto_idx).shorty_idx).str;
    }
    GetReturnTypeDescriptor(proto_id) {
        return this.StringDataByIdx(proto_id.return_type_idx).str;
    }
    GetProtoParameters(proto_id) {
        return new DexFileStructs_1.DexTypeList(this.data_begin.add(proto_id.parameters_off));
    }
    get method_ids() {
        return this.method_ids_.readPointer();
    }
    GetMethodId(idx) {
        if (idx < 0 || idx > this.header.method_ids_size)
            throw new Error("index out of range");
        return new DexFileStructs_1.DexMethodId(this.method_ids.add(idx * DexFileStructs_1.DexMethodId.SizeOfClass));
    }
    get class_defs() {
        return this.class_defs_.readPointer();
    }
    GetClassDef(idx) {
        if (idx < 0 || idx > this.header.class_defs_size)
            throw new Error("index out of range");
        return new DexFileStructs_1.DexClassDef(this.class_defs.add(idx * DexFileStructs_1.DexClassDef.SizeOfClass));
    }
    GetClassDescriptor(class_def) {
        const class_idx = class_def instanceof DexFileStructs_1.DexClassDef ? class_def.class_idx.index : class_def;
        const type_id = this.type_ids.add(class_idx * DexFileStructs_1.DexClassDef.SizeOfClass).readU32();
        const type_descriptor = this.StringDataByIdx(type_id);
        return type_descriptor.str;
    }
    FindClassDef(type_idx) {
        return new DexFileStructs_1.DexClassDef(this.data_begin.add(this.header.class_defs_off).add(type_idx.index * DexFileStructs_1.DexClassDef.SizeOfClass));
    }
    GetAnnotationsDirectory(class_def) {
        return new DexFileStructs_1.DexAnnotationsDirectoryItem(this.data_begin.add(class_def.annotations_off));
    }
    GetClassAnnotationSet(anno_dir) {
        return new DexFileStructs_1.DexAnnotationSetItem(this.data_begin.add(anno_dir.class_annotations_off));
    }
    NumClassDefs() {
        return this.header.class_defs_size;
    }
    GetInterfacesList(class_def) {
        return new DexFileStructs_1.DexTypeList(this.data_begin.add(class_def.interfaces_off));
    }
    get method_handles() {
        return this.method_handles_.readPointer();
    }
    get num_method_handles() {
        return this.num_method_handles_.readU32();
    }
    NumMethodHandles() {
        return this.num_method_handles;
    }
    GetMethodHandle(idx) {
        if (idx < 0 || idx > this.num_method_handles)
            throw new Error("index out of range");
        return new DexFileStructs_1.DexMethodHandleItem(this.method_handles.add(idx * DexFileStructs_1.DexMethodHandleItem.SizeOfClass));
    }
    get call_site_ids() {
        return this.call_site_ids_.readPointer();
    }
    get num_call_site_ids() {
        return this.num_call_site_ids_.readU32();
    }
    NumCallSiteIds() {
        return this.num_call_site_ids;
    }
    GetCallSiteId(idx) {
        if (idx < 0 || idx > this.num_call_site_ids)
            throw new Error("index out of range");
        return new DexFileStructs_1.DexCallSiteIdItem(this.call_site_ids.add(idx * DexFileStructs_1.DexCallSiteIdItem.SizeOfClass));
    }
    get hiddenapi_class_data() {
        return this.hiddenapi_class_data_.readPointer();
    }
    get oat_dex_file() {
        if (this.oat_dex_file_.isNull())
            return null;
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
    PrettyMethod(method_idx, with_signature = true) {
        return StdString_1.StdString.fromPointers(callSym("_ZNK3art7DexFile12PrettyMethodEjb", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "pointer", "pointer"], this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL)).toString();
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
        return callSym("_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE", "libdexfile.so", "pointer", ["pointer", "pointer"], this.handle, type_idx.index);
    }
    static FindTryItem(try_items, tries_size, address) {
        return callSym("_ZN3art7DexFile11FindTryItemEPKNS_3dex7TryItemEjj", "libdexfile.so", "int32", ["pointer", "uint", "uint"], try_items.handle, tries_size, address);
    }
    FindStringId_(string) {
        return new DexFileStructs_1.DexStringId(callSym("_ZNK3art7DexFile12FindStringIdEPKc", "libdexfile.so", "pointer", ["pointer", "pointer"], this.handle, Memory.allocUtf8String(string)));
    }
    FindClassDef_(type_idx) {
        return callSym("_ZNK3art7DexFile12FindClassDefENS_3dex9TypeIndexE", "libdexfile.so", "pointer", ["pointer", "pointer"], this.handle, type_idx.index);
    }
    FindCodeItemOffset(class_def, method_idx) {
        return callSym("_ZNK3art7DexFile18FindCodeItemOffsetERKNS_3dex8ClassDefEj", "libdexfile.so", "uint32", ["pointer", "pointer", "uint"], this.handle, class_def.handle, method_idx);
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
},{"../../../../../tools/StdString":80,"../../../../JSHandle":11,"../Globals":28,"../Oat/OatDexFile":37,"./DexFileStructs":56,"./DexIndex":57,"./Header":58}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEB128String = exports.DexFieldAnnotationsItem = exports.DexAnnotationSetItem = exports.DexAnnotationItem = exports.DexAnnotationsDirectoryItem = exports.DexMethodHandleItem = exports.DexCallSiteIdItem = exports.DexMethodId = exports.DexProtoId = exports.DexFieldId = exports.DexTypeId = exports.DexStringId = exports.DexClassDef = exports.DexTryItem = exports.DexTypeList = exports.DexTypeItem = void 0;
const DexIndex_1 = require("./DexIndex");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
class DexTypeItem extends JSHandle_1.JSHandleNotImpl {
    type_idx_ = this.handle;
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `TypeItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t type_idx: ${this.type_idx}`;
        return disp;
    }
    get type_idx() {
        return new DexIndex_1.DexTypeIndex(this.type_idx_);
    }
    static SizeOfClass = Globals_1.PointerSize;
}
exports.DexTypeItem = DexTypeItem;
class DexTypeList extends JSHandle_1.JSHandleNotImpl {
    size_ = this.handle;
    list_ = this.size_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `TypeList<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t size: ${this.size}`;
        disp += `\n\t list: ${this.list}`;
        return disp;
    }
    get size() {
        return this.size_.readU32();
    }
    get list() {
        let list = [];
        for (let i = 0; i < this.size; i++) {
            list.push(new DexTypeItem(this.list_.add(i * DexTypeItem.SizeOfClass)));
        }
        return list;
    }
}
exports.DexTypeList = DexTypeList;
class DexTryItem extends JSHandle_1.JSHandleNotImpl {
    type_idx_ = this.handle;
    constructor(handle) {
        super(handle);
    }
    get type_idx() {
        return new DexIndex_1.DexTypeIndex(this.type_idx_);
    }
    toString() {
        let disp = `TryItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t type_idx: ${this.type_idx}`;
        return disp;
    }
}
exports.DexTryItem = DexTryItem;
class DexClassDef extends JSHandle_1.JSHandleNotImpl {
    class_idx_ = this.handle;
    pad1_ = this.class_idx_.add(DexIndex_1.DexTypeIndex.SizeOfClass);
    access_flags_ = this.pad1_.add(0x2);
    superclass_idx_ = this.access_flags_.add(0x4);
    pad2_ = this.superclass_idx_.add(DexIndex_1.DexTypeIndex.SizeOfClass);
    interfaces_off_ = this.pad2_.add(0x2);
    source_file_idx_ = this.interfaces_off_.add(0x4);
    annotations_off_ = this.source_file_idx_.add(DexIndex_1.DexStringIndex.SizeOfClass);
    class_data_off_ = this.annotations_off_.add(0x4);
    static_values_off_ = this.class_data_off_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `ClassDef<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t class_idx: ${this.class_idx}`;
        disp += `\n\t access_flags: ${this.access_flags}`;
        disp += `\n\t superclass_idx: ${this.superclass_idx}`;
        disp += `\n\t interfaces_off: ${this.interfaces_off}`;
        disp += `\n\t source_file_idx: ${this.source_file_idx}`;
        disp += `\n\t annotations_off: ${this.annotations_off}`;
        disp += `\n\t class_data_off: ${this.class_data_off}`;
        disp += `\n\t static_values_off: ${this.static_values_off}`;
        return disp;
    }
    static get SizeOfClass() {
        return DexIndex_1.DexTypeIndex.SizeOfClass + 0x2 + 0x4 + DexIndex_1.DexTypeIndex.SizeOfClass + 0x2 + 0x4 + DexIndex_1.DexStringIndex.SizeOfClass + 0x4 + 0x4 + 0x4;
    }
    get class_idx() {
        return new DexIndex_1.DexTypeIndex(this.class_idx_.readU16());
    }
    get access_flags() {
        return this.access_flags_.readU32();
    }
    get superclass_idx() {
        return new DexIndex_1.DexTypeIndex(this.superclass_idx_.readU16());
    }
    get interfaces_off() {
        return this.interfaces_off_.readU32();
    }
    get source_file_idx() {
        return new DexIndex_1.DexStringIndex(this.source_file_idx_.readU32());
    }
    get annotations_off() {
        return this.annotations_off_.readU32();
    }
    get class_data_off() {
        return this.class_data_off_.readU32();
    }
    get static_values_off() {
        return this.static_values_off_.readU32();
    }
}
exports.DexClassDef = DexClassDef;
class DexStringId extends JSHandle_1.JSHandleNotImpl {
    string_data_off_ = this.handle;
    constructor(handle) {
        super(handle);
    }
    get string_data_off() {
        return this.string_data_off_.readU32();
    }
    toString() {
        let disp = `StringId<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t string_data_off: ${this.string_data_off} -> ${ptr(this.string_data_off)}`;
        return disp;
    }
}
exports.DexStringId = DexStringId;
class DexTypeId extends JSHandle_1.JSHandleNotImpl {
    descriptor_idx_ = this.handle;
    constructor(handle) {
        super(handle);
    }
    get descriptor_idx() {
        return new DexIndex_1.DexStringIndex(this.descriptor_idx_.readU32());
    }
    toString() {
        let disp = `TypeId<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t descriptor_idx: ${this.descriptor_idx}`;
        return disp;
    }
    static get SizeOfClass() {
        return 0x4;
    }
}
exports.DexTypeId = DexTypeId;
class DexFieldId extends JSHandle_1.JSHandleNotImpl {
    class_idx_ = this.handle;
    type_idx_ = this.class_idx_.add(DexIndex_1.DexTypeIndex.SizeOfClass);
    name_idx_ = this.type_idx_.add(DexIndex_1.DexTypeIndex.SizeOfClass);
    constructor(handle) {
        super(handle);
    }
    get class_idx() {
        return new DexIndex_1.DexTypeIndex(this.class_idx_.readU16());
    }
    get type_idx() {
        return new DexIndex_1.DexTypeIndex(this.type_idx_.readU16());
    }
    get name_idx() {
        return new DexIndex_1.DexStringIndex(this.name_idx_.readU16());
    }
    static get SizeOfClass() {
        return 0x2 + 0x2 + 0x4;
    }
    toString() {
        let disp = `FieldId<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t class_idx: ${this.class_idx}`;
        disp += `\n\t type_idx: ${this.type_idx}`;
        disp += `\n\t name_idx: ${this.name_idx}`;
        return disp;
    }
}
exports.DexFieldId = DexFieldId;
class DexProtoId extends JSHandle_1.JSHandleNotImpl {
    shorty_idx_ = this.handle;
    return_type_idx_ = this.shorty_idx_.add(DexIndex_1.DexStringIndex.SizeOfClass);
    pad_ = this.return_type_idx_.add(0x2);
    parameters_off_ = this.pad_.add(0x2);
    constructor(handle) {
        super(handle);
    }
    get shorty_idx() {
        return new DexIndex_1.DexStringIndex(this.shorty_idx_.readU16());
    }
    get return_type_idx() {
        return new DexIndex_1.DexTypeIndex(this.return_type_idx_.readU16());
    }
    get parameters_off() {
        return this.parameters_off_.readU32();
    }
    static get SizeOfClass() {
        return 0x4 + 0x2 + 0x2 + 0x4;
    }
    toString() {
        let disp = `ProtoId<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t shorty_idx: ${this.shorty_idx}`;
        disp += `\n\t return_type_idx: ${this.return_type_idx}`;
        disp += `\n\t parameters_off: ${this.parameters_off}`;
        return disp;
    }
}
exports.DexProtoId = DexProtoId;
class DexMethodId extends JSHandle_1.JSHandleNotImpl {
    class_idx_ = this.handle;
    proto_idx_ = this.class_idx_.add(DexIndex_1.DexTypeIndex.SizeOfClass);
    name_idx_ = this.proto_idx_.add(DexIndex_1.DexProtoIndex.SizeOfClass);
    constructor(handle) {
        super(handle);
    }
    get class_idx() {
        return new DexIndex_1.DexTypeIndex(this.class_idx_.readU16());
    }
    get proto_idx() {
        return new DexIndex_1.DexProtoIndex(this.proto_idx_.readU16());
    }
    get name_idx() {
        return new DexIndex_1.DexStringIndex(this.name_idx_.readU32());
    }
    static get SizeOfClass() {
        return 0x2 + 0x2 + 0x4;
    }
    toString() {
        let disp = `MethodId<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t class_idx: ${this.class_idx}`;
        disp += `\n\t proto_idx: ${this.proto_idx}`;
        disp += `\n\t name_idx: ${this.name_idx}`;
        return disp;
    }
}
exports.DexMethodId = DexMethodId;
class DexCallSiteIdItem extends JSHandle_1.JSHandleNotImpl {
    data_off_ = this.handle;
    constructor(handle) {
        super(handle);
    }
    get data_off() {
        return this.data_off_.readU32();
    }
    static get SizeOfClass() {
        return 0x4;
    }
    tostring() {
        let disp = `CallSiteIdItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t data_off: ${this.data_off}`;
        return disp;
    }
}
exports.DexCallSiteIdItem = DexCallSiteIdItem;
class DexMethodHandleItem extends JSHandle_1.JSHandleNotImpl {
    method_handle_type_ = this.handle;
    reserved1_ = this.method_handle_type_.add(0x2);
    field_or_method_idx_ = this.reserved1_.add(0x2);
    reserved2_ = this.field_or_method_idx_.add(0x2);
    constructor(handle) {
        super(handle);
    }
    get method_handle_type() {
        return this.method_handle_type_.readU16();
    }
    get field_or_method_idx() {
        return this.field_or_method_idx_.readU16();
    }
    static get SizeOfClass() {
        return 0x2 + 0x2 + 0x2 + 0x2;
    }
    tostring() {
        let disp = `MethodHandleItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t method_handle_type: ${this.method_handle_type}`;
        disp += `\n\t field_or_method_idx: ${this.field_or_method_idx}`;
        return disp;
    }
}
exports.DexMethodHandleItem = DexMethodHandleItem;
class DexAnnotationsDirectoryItem extends JSHandle_1.JSHandleNotImpl {
    class_annotations_off_ = this.handle;
    fields_size_ = this.class_annotations_off_.add(0x4);
    methods_size_ = this.fields_size_.add(0x4);
    parameters_size_ = this.methods_size_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    get class_annotations_off() {
        return this.class_annotations_off_.readU32();
    }
    get fields_size() {
        return this.fields_size_.readU32();
    }
    get methods_size() {
        return this.methods_size_.readU32();
    }
    get parameters_size() {
        return this.parameters_size_.readU32();
    }
    static get SizeOfClass() {
        return 0x4 + 0x4 + 0x4 + 0x4;
    }
    toString() {
        let disp = `AnnotationsDirectoryItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t class_annotations_off: ${this.class_annotations_off}`;
        disp += `\n\t fields_size: ${this.fields_size}`;
        disp += `\n\t methods_size: ${this.methods_size}`;
        disp += `\n\t parameters_size: ${this.parameters_size}`;
    }
}
exports.DexAnnotationsDirectoryItem = DexAnnotationsDirectoryItem;
class DexAnnotationItem extends JSHandle_1.JSHandleNotImpl {
    visibility_ = this.handle;
    annotation_ = this.visibility_.add(0x1);
    constructor(handle) {
        super(handle);
    }
    get visibility() {
        return this.visibility_.readU8();
    }
    get annotation() {
        return this.annotation_.readU8();
    }
    static get SizeOfClass() {
        return 0x1 + 0x1;
    }
    toString() {
        let disp = `AnnotationItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t visibility: ${this.visibility}`;
        disp += `\n\t annotation: ${this.annotation}`;
        return disp;
    }
}
exports.DexAnnotationItem = DexAnnotationItem;
class DexAnnotationSetItem extends JSHandle_1.JSHandleNotImpl {
    size_ = this.handle;
    entries_ = this.size_.add(DexAnnotationItem.SizeOfClass);
    constructor(handle) {
        super(handle);
    }
    get size() {
        return this.size_.readU32();
    }
    get entries() {
        let entries = [];
        for (let i = 0; i < this.size; i++) {
            entries.push(this.entries_.add(i * 0x4).readU32());
        }
        return entries;
    }
    static get SizeOfClass() {
        return 0x4 + 0x4;
    }
    toString() {
        let disp = `AnnotationSetItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t size: ${this.size}`;
        disp += `\n\t entries: ${this.entries}`;
        return disp;
    }
}
exports.DexAnnotationSetItem = DexAnnotationSetItem;
class DexFieldAnnotationsItem extends JSHandle_1.JSHandleNotImpl {
    field_idx_ = this.handle;
    annotations_off_ = this.field_idx_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    get field_idx() {
        return this.field_idx_.readU32();
    }
    get annotations_off() {
        return this.annotations_off_.readU32();
    }
    static get SizeOfClass() {
        return 0x4 + 0x4;
    }
    toString() {
        let disp = `FieldAnnotationsItem<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t field_idx: ${this.field_idx}`;
        disp += `\n\t annotations_off: ${this.annotations_off}`;
        return disp;
    }
}
exports.DexFieldAnnotationsItem = DexFieldAnnotationsItem;
class LEB128String {
    handle = NULL;
    size_ = NULL;
    data_ = NULL;
    constructor(handle) {
        this.handle = handle;
        this.size_ = this.handle;
        this.data_ = this.size_.add(0x1);
    }
    static from(handle) {
        return new LEB128String(handle);
    }
    get data_ptr() {
        return this.data_;
    }
    get size() {
        return this.size_.readU8();
    }
    get str() {
        try {
            return this.data_.readCString();
        }
        catch (error) {
            return "";
        }
    }
    toString() {
        let res = this.DecodeUnsignedLeb128_TS(this.handle);
        return `${res.bytesRead} | ${res.size} | ${this.str}`;
    }
    test(times = 10000) {
        const start_TS = Date.now();
        for (let i = 0; i < times; i++) {
            this.DecodeUnsignedLeb128_TS(this.handle);
        }
        const end_TS = Date.now();
        LOGD(`DecodeUnsignedLeb128_TS (times:${times}) cost : ${end_TS - start_TS} ms`);
        const start_MD = Date.now();
        for (let i = 0; i < times; i++) {
            this.DecodeUnsignedLeb128_MD(this.handle);
        }
        const end_MD = Date.now();
        LOGD(`DecodeUnsignedLeb128_MD (times:${times}) cost : ${end_MD - start_MD} ms`);
    }
    DecodeUnsignedLeb128_TS(data) {
        let cur_ptr = data;
        let result = cur_ptr.readU8();
        cur_ptr = cur_ptr.add(1);
        if (result > 0x7f) {
            let cur = cur_ptr.readU8();
            cur_ptr = cur_ptr.add(1);
            result = (result & 0x7f) | ((cur & 0x7f) << 7);
            if (cur > 0x7f) {
                cur = cur_ptr.readU8();
                cur_ptr = cur_ptr.add(1);
                result |= (cur & 0x7f) << 14;
                if (cur > 0x7f) {
                    cur = cur_ptr.readU8();
                    cur_ptr = cur_ptr.add(1);
                    result |= (cur & 0x7f) << 21;
                    if (cur > 0x7f) {
                        cur = cur_ptr.readU8();
                        cur_ptr = cur_ptr.add(1);
                        result |= cur << 28;
                    }
                }
            }
        }
        return { size: result, bytesRead: cur_ptr };
    }
    DecodeUnsignedLeb128_MD(data) {
        const DecodeUnsignedLeb128_func = new NativeFunction(this.cmd.DecodeUnsignedLeb128, "uint32", ["pointer"]);
        const tempMem = Memory.alloc(Process.pointerSize).writePointer(data);
        const size = DecodeUnsignedLeb128_func(tempMem);
        return { size, bytesRead: tempMem.readPointer() };
    }
    static md = null;
    get cmd() {
        if (LEB128String.md == null) {
            LEB128String.md = new CModule(`
            #include <gum/gumprocess.h>
            
            uint32_t DecodeUnsignedLeb128(const uint8_t** data) {
                const uint8_t* ptr = *data;
                int result = *(ptr++);
                if (result > 0x7f) {
                    int cur = *(ptr++);
                    result = (result & 0x7f) | ((cur & 0x7f) << 7);
                    if (cur > 0x7f) {
                    cur = *(ptr++);
                    result |= (cur & 0x7f) << 14;
                    if (cur > 0x7f) {
                        cur = *(ptr++);
                        result |= (cur & 0x7f) << 21;
                        if (cur > 0x7f) {
                        cur = *(ptr++);
                        result |= cur << 28;
                        }
                    }
                    }
                }
                *data = ptr;
                return (uint32_t)(result);
            }
        `);
        }
        return LEB128String.md;
    }
}
exports.LEB128String = LEB128String;
globalThis.DexClassDef = DexClassDef;
globalThis.DexStringId = DexStringId;
globalThis.DexTypeId = DexTypeId;
globalThis.DexFieldId = DexFieldId;
globalThis.DexProtoId = DexProtoId;
globalThis.DexMethodId = DexMethodId;
},{"../../../../JSHandle":11,"../Globals":28,"./DexIndex":57}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexStringIndex = exports.DexProtoIndex = exports.DexTypeIndex = exports.DexIndex = void 0;
const ValueHandle_1 = require("../../../../ValueHandle");
class DexIndex extends ValueHandle_1.ValueHandle {
    constructor(handle) {
        handle instanceof NativePointer ? super(handle) : super(ptr(handle));
    }
    toString() {
        return `DexIndex<${this.value_}>`;
    }
}
exports.DexIndex = DexIndex;
class DexTypeIndex extends DexIndex {
    get index() {
        return this.ReadAs16().toInt32();
    }
    static get SizeOfClass() {
        return 2;
    }
    toString() {
        return `TypeIndex<${this.index}>`;
    }
}
exports.DexTypeIndex = DexTypeIndex;
class DexProtoIndex extends DexIndex {
    get index() {
        return this.ReadAs16().toInt32();
    }
    static get SizeOfClass() {
        return 2;
    }
    toString() {
        return `ProtoIndex<${this.index}>`;
    }
}
exports.DexProtoIndex = DexProtoIndex;
class DexStringIndex extends DexIndex {
    get index() {
        return this.ReadAs32().toInt32();
    }
    static get SizeOfClass() {
        return 4;
    }
    toString() {
        return `StringIndex<${this.index}>`;
    }
}
exports.DexStringIndex = DexStringIndex;
},{"../../../../ValueHandle":17}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardDexHeader = exports.CompactDexHeader = exports.DexHeader = void 0;
const JSHandle_1 = require("../../../../JSHandle");
class DexHeader extends JSHandle_1.JSHandle {
    magic_ = this.CurrentHandle;
    checksum_ = this.magic_.add(0x1 * 8);
    signature_ = this.checksum_.add(0x4);
    file_size_ = this.signature_.add(0x1 * DexHeader.kSha1DigestSize);
    header_size_ = this.file_size_.add(0x4);
    endian_tag_ = this.header_size_.add(0x4);
    link_size_ = this.endian_tag_.add(0x4);
    link_off_ = this.link_size_.add(0x4);
    map_off_ = this.link_off_.add(0x4);
    string_ids_size_ = this.map_off_.add(0x4);
    string_ids_off_ = this.string_ids_size_.add(0x4);
    type_ids_size_ = this.string_ids_off_.add(0x4);
    type_ids_off_ = this.type_ids_size_.add(0x4);
    proto_ids_size_ = this.type_ids_off_.add(0x4);
    proto_ids_off_ = this.proto_ids_size_.add(0x4);
    field_ids_size_ = this.proto_ids_off_.add(0x4);
    field_ids_off_ = this.field_ids_size_.add(0x4);
    method_ids_size_ = this.field_ids_off_.add(0x4);
    method_ids_off_ = this.method_ids_size_.add(0x4);
    class_defs_size_ = this.method_ids_off_.add(0x4);
    class_defs_off_ = this.class_defs_size_.add(0x4);
    data_size_ = this.class_defs_off_.add(0x4);
    data_off_ = this.data_size_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    static get kDexMagicSize() {
        return 4;
    }
    static get kDexVersionLen() {
        return 4;
    }
    static get kSha1DigestSize() {
        return 20;
    }
    static get kClassDefinitionOrderEnforcedVersion() {
        return 37;
    }
    get SizeOfClass() {
        return 0x70;
    }
    toString() {
        const bt_1 = this.magic_.readByteArray(DexHeader.kDexMagicSize);
        const btStr_1 = Array.from(new Uint8Array(bt_1)).map((item) => item.toString(16).padStart(2, '0')).join(' ');
        const bt_2 = this.magic_.add(DexHeader.kDexMagicSize).readByteArray(DexHeader.kDexVersionLen);
        const btStr_2 = Array.from(new Uint8Array(bt_2)).map((item) => item.toString(16).padStart(2, '0')).join(' ');
        let disp = `DexHeader<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t magic: ${this.magic.replace('\n', '')} | ${btStr_1} | ${btStr_2}`;
        disp += `\n\t checksum: ${this.checksum}`;
        disp += `\n\t signature: ${this.signature}`;
        disp += `\n\t file_size: ${this.file_size} | ${ptr(this.file_size)}`;
        disp += `\n\t header_size: ${this.header_size} | ${ptr(this.header_size)}`;
        disp += `\n\t endian_tag: ${this.endian_tag}`;
        disp += `\n\t link_size: ${this.link_size}`;
        disp += `\n\t link_off: ${this.link_off}`;
        disp += `\n\t map_off: ${this.map_off}`;
        disp += `\n\t string_ids_size: ${this.string_ids_size}`;
        disp += `\n\t string_ids_off: ${this.string_ids_off}`;
        disp += `\n\t type_ids_size: ${this.type_ids_size}`;
        disp += `\n\t type_ids_off: ${this.type_ids_off}`;
        disp += `\n\t proto_ids_size: ${this.proto_ids_size}`;
        disp += `\n\t proto_ids_off: ${this.proto_ids_off}`;
        disp += `\n\t field_ids_size: ${this.field_ids_size}`;
        disp += `\n\t field_ids_off: ${this.field_ids_off}`;
        disp += `\n\t method_ids_size: ${this.method_ids_size}`;
        disp += `\n\t method_ids_off: ${this.method_ids_off}`;
        disp += `\n\t class_defs_size: ${this.class_defs_size}`;
        disp += `\n\t class_defs_off: ${this.class_defs_off}`;
        disp += `\n\t data_size: ${this.data_size}`;
        disp += `\n\t data_off: ${this.data_off}`;
        return disp;
    }
    GetVersion() {
        return this.magic_.add(DexHeader.kDexMagicSize).readU32();
    }
    get magic() {
        return this.magic_.readCString();
    }
    get checksum() {
        return ptr(this.checksum_.readU32());
    }
    get signature() {
        return this.signature_.readU32();
    }
    get file_size() {
        return this.file_size_.readU32();
    }
    get header_size() {
        return this.header_size_.readU32();
    }
    get endian_tag() {
        return this.endian_tag_.readU32();
    }
    get link_size() {
        return this.link_size_.readU32();
    }
    get link_off() {
        return ptr(this.link_off_.readU32());
    }
    get map_off() {
        return ptr(this.map_off_.readU32());
    }
    get string_ids_size() {
        return this.string_ids_size_.readU32();
    }
    get string_ids_off() {
        return ptr(this.string_ids_off_.readU32());
    }
    get type_ids_size() {
        return this.type_ids_size_.readU32();
    }
    get type_ids_off() {
        return ptr(this.type_ids_off_.readU32());
    }
    get proto_ids_size() {
        return this.proto_ids_size_.readU32();
    }
    get proto_ids_off() {
        return ptr(this.proto_ids_off_.readU32());
    }
    get field_ids_size() {
        return this.field_ids_size_.readU32();
    }
    get field_ids_off() {
        return ptr(this.field_ids_off_.readU32());
    }
    get method_ids_size() {
        return this.method_ids_size_.readU32();
    }
    get method_ids_off() {
        return ptr(this.method_ids_off_.readU32());
    }
    get class_defs_size() {
        return this.class_defs_size_.readU32();
    }
    get class_defs_off() {
        return ptr(this.class_defs_off_.readU32());
    }
    get data_size() {
        return this.data_size_.readU32();
    }
    get data_off() {
        return ptr(this.data_off_.readU32());
    }
}
exports.DexHeader = DexHeader;
class CompactDexHeader extends DexHeader {
    feature_flags_ = this.CurrentHandle.add(0x0);
    debug_info_offsets_pos_ = this.feature_flags_.add(0x4);
    debug_info_offsets_table_offset_ = this.debug_info_offsets_pos_.add(0x4);
    debug_info_base_ = this.debug_info_offsets_table_offset_.add(0x4);
    owned_data_begin_ = this.debug_info_base_.add(0x4);
    owned_data_end_ = this.owned_data_begin_.add(0x4);
    constructor(handle) {
        super(handle);
    }
    get CurrentHandle() {
        return super.CurrentHandle.add(super.SizeOfClass);
    }
    get SizeOfClass() {
        return this.owned_data_end_.add(0x4).sub(this.CurrentHandle).toUInt32();
    }
    toString() {
        let disp = super.toString();
        disp = disp.replace('DexHeader<', 'CompactDexHeader<');
        if (this.handle.isNull())
            return disp;
        disp += `\n\t feature_flags: ${this.feature_flags}`;
        disp += `\n\t debug_info_offsets_pos: ${this.debug_info_offsets_pos}`;
        disp += `\n\t debug_info_offsets_table_offset: ${this.debug_info_offsets_table_offset}`;
        disp += `\n\t debug_info_base: ${this.debug_info_base}`;
        disp += `\n\t owned_data_begin: ${this.owned_data_begin}`;
        disp += `\n\t owned_data_end: ${this.owned_data_end}`;
        return disp;
    }
    get feature_flags() {
        return this.feature_flags_.readU32();
    }
    get debug_info_offsets_pos() {
        return this.debug_info_offsets_pos_.readU32();
    }
    get debug_info_offsets_table_offset() {
        return this.debug_info_offsets_table_offset_.readU32();
    }
    get debug_info_base() {
        return this.debug_info_base_.readU32();
    }
    get owned_data_begin() {
        return this.owned_data_begin_.readU32();
    }
    get owned_data_end() {
        return this.owned_data_end_.readU32();
    }
}
exports.CompactDexHeader = CompactDexHeader;
class StandardDexHeader extends DexHeader {
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = super.toString();
        disp = disp.replace('DexHeader<', 'StandardDexHeader<');
        if (this.handle.isNull())
            return disp;
        return disp;
    }
}
exports.StandardDexHeader = StandardDexHeader;
},{"../../../../JSHandle":11}],59:[function(require,module,exports){
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
        disp += `\n\tregisters_size: ${this.registers_size} | ins_size: ${this.ins_size} | outs_size: ${this.outs_size} | tries_size: ${this.tries_size} | debug_info_off: ${this.debug_info_off} | insns_size_in_code_units: ${this.insns_size_in_code_units} | insns: ${this.insns}`;
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
},{"./DexFile":55}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./CodeItemInstructionAccessor");
require("./CodeItemDebugInfoAccessor");
require("./CodeItemDataAccessor");
require("./StandardDexFile");
require("./CompactDexFile");
require("./DexFileStructs");
require("./DexIndex");
require("./DexFile");
require("./Header");
},{"./CodeItemDataAccessor":51,"./CodeItemDebugInfoAccessor":52,"./CodeItemInstructionAccessor":53,"./CompactDexFile":54,"./DexFile":55,"./DexFileStructs":56,"./DexIndex":57,"./Header":58,"./StandardDexFile":59}],61:[function(require,module,exports){
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
require("./Instrumentation/include");
require("./Type/include");
},{"./ClassLinker":26,"./GcRoot":27,"./Globals":28,"./Instruction":29,"./Instrumentation/include":35,"./Oat/include":39,"./OatQuickMethodHeader":36,"./ObjPtr":40,"./QuickMethodFrameInfo":41,"./ShadowFrame":42,"./StackVisitor/include":46,"./Thread":47,"./Type/include":49,"./dexfile/include":60,"./interpreter/include":63,"./mirror/include":70,"./runtime/include":71}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchImplContext = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const ShadowFrame_1 = require("../ShadowFrame");
const Globals_1 = require("../Globals");
const JValue_1 = require("../Type/JValue");
const Thread_1 = require("../Thread");
const CodeItemDataAccessor_1 = require("../dexfile/CodeItemDataAccessor");
class SwitchImplContext extends JSHandle_1.JSHandleNotImpl {
    _self = this.handle;
    _accessor = this._self.add(Globals_1.PointerSize);
    _shadow_frame = this._accessor.add(Globals_1.PointerSize);
    _result_register = this._shadow_frame.add(Globals_1.PointerSize);
    _interpret_one_instruction = this._result_register.add(Globals_1.PointerSize);
    _result = this._interpret_one_instruction.add(Globals_1.PointerSize);
    constructor(handle) {
        super(handle);
    }
    get self() {
        return new Thread_1.ArtThread(this._self.readPointer());
    }
    get accessor() {
        return CodeItemDataAccessor_1.CodeItemDataAccessor.fromRef(this._accessor.readPointer());
    }
    get shadow_frame() {
        return new ShadowFrame_1.ShadowFrame(this._shadow_frame.readPointer());
    }
    get result_register() {
        return new JValue_1.JValue(this._result_register.readPointer());
    }
    get interpret_one_instruction() {
        return !!this._interpret_one_instruction.readU8();
    }
    get result() {
        return new JValue_1.JValue(this._result.readPointer());
    }
    toString() {
        let disp = `SwitchImplContext<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t self=${this._self.readPointer()} <- ${this._self}`;
        disp += `\n\t accessor_=${this._accessor.readPointer()} <- ${this._accessor}`;
        disp += `\n\t shadow_frame_=${this._shadow_frame.readPointer()} <- ${this._shadow_frame}`;
        disp += `\n\t result_register=${this.result_register} <- ${this._result_register}`;
        disp += `\n\t interpret_one_instruction=${this.interpret_one_instruction} <- ${this._interpret_one_instruction}`;
        disp += `\n\t result_=${this._result.readPointer()} <- ${this._result}`;
        return disp;
    }
}
exports.SwitchImplContext = SwitchImplContext;
},{"../../../../JSHandle":11,"../Globals":28,"../ShadowFrame":42,"../Thread":47,"../Type/JValue":48,"../dexfile/CodeItemDataAccessor":51}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./SwitchImplContext");
},{"./SwitchImplContext":62}],64:[function(require,module,exports){
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
    class_loader_ = this.CurrentHandle;
    component_type_ = this.class_loader_.add(HeapReference_1.HeapReference.Size);
    dex_cache_ = this.component_type_.add(HeapReference_1.HeapReference.Size);
    ext_data_ = this.dex_cache_.add(HeapReference_1.HeapReference.Size);
    iftable_ = this.ext_data_.add(HeapReference_1.HeapReference.Size);
    name_ = this.iftable_.add(HeapReference_1.HeapReference.Size);
    super_class_ = this.name_.add(HeapReference_1.HeapReference.Size);
    vtable_ = this.super_class_.add(HeapReference_1.HeapReference.Size);
    ifields_ = this.vtable_.add(HeapReference_1.HeapReference.Size);
    methods_ = this.ifields_.add(0x8);
    sfields_ = this.methods_.add(0x8);
    access_flags_ = this.sfields_.add(0x8);
    class_flags_ = this.access_flags_.add(0x4);
    class_size_ = this.class_flags_.add(0x4);
    clinit_thread_id_ = this.class_size_.add(0x4);
    dex_class_def_idx_ = this.clinit_thread_id_.add(0x8);
    constructor(handle) {
        super(handle);
    }
    get SizeOfClass() {
        return (this.dex_class_def_idx_).add(0x4).sub(this.CurrentHandle).add(this.super_class.SizeOfClass).toInt32();
    }
    get CurrentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    toString() {
        let disp = `ArtClass< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t class_loader: ${this.class_loader} -> ArtClassLoader< ${this.class_loader.root.handle} >`;
        disp += `\n\t component_type: ${this.component_type} -> ArtClass< ${this.component_type.root.handle} >`;
        disp += `\n\t dex_cache: ${this.dex_cache} -> DexCache<P:${this.dex_cache.root.handle} >`;
        disp += `\n\t ext_data: ${this.ext_data}`;
        disp += `\n\t iftable: ${this.iftable}`;
        disp += `\n\t name: ${this.name} -> ${this.name_str}`;
        disp += `\n\t super_class: ${this.super_class} -> ArtClass< ${this.super_class.root.handle} >`;
        disp += `\n\t vtable: ${this.vtable}`;
        disp += `\n\t ifields: ${this.ifields} | ${ptr(this.ifields)}`;
        disp += `\n\t methods: ${this.methods} | ${ptr(this.methods)}`;
        disp += `\n\t sfields: ${this.sfields} | ${ptr(this.sfields)}`;
        disp += `\n\t access_flags: ${this.access_flags} -> ${this.access_flags_string}`;
        disp += `\n\t class_flags: ${this.class_flags}`;
        disp += `\n\t class_size: ${this.class_size}`;
        disp += `\n\t clinit_thread_id: ${this.clinit_thread_id}`;
        disp += `\n\t dex_class_def_idx: ${this.dex_class_def_idx}`;
        return disp;
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
    name_str() {
        return StdString_1.StdString.from(this.name.root.handle);
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
},{"../../../../../tools/StdString":80,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"./ClassExt":66,"./ClassLoader":67,"./DexCache":68,"./IfTable":69}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const CodeItemInstructionAccessor_1 = require("../dexfile/CodeItemInstructionAccessor");
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const modifiers_1 = require("../../../../../tools/modifiers");
const StdString_1 = require("../../../../../tools/StdString");
const enum_1 = require("../../../../../tools/enum");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
const ArtClass_1 = require("./ArtClass");
const DexCache_1 = require("./DexCache");
const GcRoot_1 = require("../GcRoot");
class ArtMethod extends JSHandle_1.JSHandle {
    declaring_class_ = this.CurrentHandle;
    access_flags_ = this.declaring_class_.add(GcRoot_1.GcRoot.Size);
    dex_code_item_offset_ = this.access_flags_.add(0x4);
    dex_method_index_ = this.dex_code_item_offset_.add(0x4);
    method_index_ = this.dex_method_index_.add(0x4);
    hotness_count_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size + 0x4 * 3 + 0x2 * 1);
    imt_index_ = this.CurrentHandle.add(GcRoot_1.GcRoot.Size + 0x4 * 3 + 0x2 * 1);
    ptr_sized_fields_;
    constructor(handle) {
        super(handle);
        try {
            this.ptr_sized_fields_ = {
                data_: this.handle.add(getArtMethodSpec().offset.jniCode),
                entry_point_from_quick_compiled_code_: this.handle.add(getArtMethodSpec().offset.quickCode)
            };
        }
        catch (error) {
            this.ptr_sized_fields_ = {
                data_: this.imt_index_.add(0x4),
                entry_point_from_quick_compiled_code_: this.imt_index_.add(0x4).add(Globals_1.PointerSize)
            };
        }
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
        return this.dex_method_index_.readU16();
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
    PrettyMethod(withSignature = true) {
        const result = new StdString_1.StdString();
        Java.api['art::ArtMethod::PrettyMethod'](result, this.handle, withSignature ? 1 : 0);
        return result.disposeToString();
    }
    toString() {
        let disp = `ArtMethod< ${this.handle} >`;
        disp += `\n\t ${this.methodName}`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t declaring_class: ${this.declaring_class} -> ArtClass< ${this.declaring_class.root.handle} >`;
        disp += `\n\t access_flags: ${this.access_flags} -> ${this.access_flags_string}`;
        disp += `\n\t dex_code_item_offset: ${this.dex_code_item_offset} | ${ptr(this.dex_code_item_offset)} -> ${this.GetCodeItem()}`;
        disp += `\n\t dex_method_index: ${this.dex_method_index_} | ${ptr(this.dex_method_index)}`;
        disp += `\n\t method_index: ${this.method_index_} | ${ptr(this.method_index)}`;
        disp += `\n\t hotness_count: ${this.hotness_count_} | ${ptr(this.hotness_count)}`;
        disp += `\n\t imt_index: ${this.imt_index_} | ${ptr(this.imt_index)}`;
        disp += `\n\t data: ${this.ptr_sized_fields_.data_} -> ${DebugSymbol.fromAddress(this.data).toString()}`;
        disp += `\n\t jniCode: ${this.ptr_sized_fields_.entry_point_from_quick_compiled_code_}  -> ${DebugSymbol.fromAddress(this.entry_point_from_quick_compiled_code).toString()}`;
        return disp;
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
    get methodName() {
        const PrettyJavaAccessFlagsStr = PrettyAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()));
        return `${PrettyJavaAccessFlagsStr}${this.PrettyMethod()}`;
    }
    HasSameNameAndSignature(other) {
        return callSym("_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_", "libart.so", 'bool', ['pointer', 'pointer'], this.handle, other.handle);
    }
    GetRuntimeMethodName() {
        return callSym("_ZN3art9ArtMethod20GetRuntimeMethodNameEv", "libart.so", 'pointer', ['pointer'], this.handle).readCString();
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
        return new ArtMethod(callSym("_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE", "libart.so", 'pointer', ['pointer', 'int'], this.handle, Process.pointerSize));
    }
    FindOverriddenMethod() {
        return callSym("_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE", "libart.so", 'pointer', ['pointer', 'int'], this.handle, Process.pointerSize);
    }
    IsOverridableByDefaultMethod() {
        return callSym("_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv", "libart.so", 'bool', ['pointer'], this.handle);
    }
    GetQuickenedInfo(dex_pc = 0) {
        return callSym("_ZN3art9ArtMethod16GetQuickenedInfoEv", "libart.so", 'int', ['pointer', 'int'], this.handle, dex_pc);
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
    showCode = (num) => {
        const debugInfo = DebugSymbol.fromAddress(this.entry_point_from_quick_compiled_code);
        debugInfo.moduleName == "base.odex" ? this.showOatAsm(num) : this.showSmali(num);
    };
    showSmali(num = -1, info = false, forceRet = 100) {
        const accessor = this.DexInstructions();
        const dex_file = this.GetDexFile();
        const code_item = this.GetCodeItem();
        let insns = accessor.InstructionAt();
        if (!this.jniCode.isNull()) {
            LOGD(`👉 ${this}`);
            LOGE(`jniCode is not null -> ${this.jniCode}`);
            return;
        }
        if (info) {
            LOGD(`↓dex_file↓\n${dex_file}\n`);
            LOGD(`👉 ${this}\n`);
            LOGD(`↓accessor↓\n${accessor}\n`);
        }
        newLine();
        LOGD(this.methodName);
        let disp_insns_info = `insns_size_in_code_units: ${accessor.insns_size_in_code_units} - ${ptr(accessor.insns_size_in_code_units)}`;
        disp_insns_info += ` | method start: ${accessor.insns} | insns start ${code_item} | DEX: ${dex_file.handle}`;
        LOGD(`\n[ ${disp_insns_info} ]\n`);
        const start_off = accessor.insns.sub(code_item).toUInt32();
        const bf = code_item.readByteArray(start_off);
        const bf_str = Array.from(new Uint8Array(bf)).map((item) => item.toString(16).padStart(2, '0')).join(' ');
        if (this.GetDexFile().is_compact_dex) {
            const item = (accessor.CodeItem);
            LOGZ(`[ ${start_off} | ${bf_str} ] -> [ fields : ${item.fields} | registers_size: ${item.registers_size} | ins_size: ${item.ins_size} | outs_size: ${item.outs_size} | tries_size: ${item.tries_size} | insns_count_and_flags: ${item.insns_count_and_flags} | insns_size_in_code_units: ${item.insns_size_in_code_units} ]\n`);
        }
        else {
            const item = CodeItemInstructionAccessor_1.CodeItemInstructionAccessor.CodeItem(dex_file, this.GetCodeItem());
            LOGZ(`[ ${start_off} | ${bf_str} ] \n[ registers_size: ${item.registers_size} | ins_size: ${item.ins_size} | outs_size: ${item.outs_size} | tries_size: ${item.tries_size} | debug_info_off: ${item.debug_info_off} | insns_size_in_code_units: ${item.insns_size_in_code_units} | insns: ${item.insns} ]\n`);
        }
        let offset = 0;
        let last_offset = 0;
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
            else if (forceRet-- <= 0) {
                LOGW(`\nforce return counter -> ${forceRet}\nThere may be a loop error, check the code ...`);
                break;
            }
            else if (last_offset == offset) {
                LOGW(`\ninsns current offset -> [ ${offset} == ${last_offset} ] <- insns last offset\nThere may be a loop error, check the code ...`);
                break;
            }
            else {
                if (offset >= count_insns)
                    break;
            }
            insns = insns.Next();
            last_offset = offset;
        }
        newLine();
    }
    showOatAsm(num = 20, info = false) {
        newLine();
        if (info)
            LOGD(`👉 ${this}\n`);
        LOGD(this.methodName);
        newLine();
        let insns = Instruction.parse(this.entry_point_from_quick_compiled_code);
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
},{"../../../../../tools/StdString":80,"../../../../../tools/enum":84,"../../../../../tools/modifiers":88,"../../../../JSHandle":11,"../GcRoot":27,"../Globals":28,"../OatQuickMethodHeader":36,"../dexfile/CodeItemInstructionAccessor":53,"./ArtClass":64,"./DexCache":68}],66:[function(require,module,exports){
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
},{"../../../../Object":12}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtClassLoader = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const Object_1 = require("../../../../Object");
class ArtClassLoader extends Object_1.ArtObject {
    packages_ = this.CurrentHandle;
    parent_ = this.packages_.add(HeapReference_1.HeapReference.Size);
    proxyCache_ = this.parent_.add(HeapReference_1.HeapReference.Size);
    padding_ = this.proxyCache_.add(HeapReference_1.HeapReference.Size);
    allocator_ = this.padding_.add(0x4);
    class_table_ = this.allocator_.add(0x8);
    constructor(handle) {
        super(handle);
    }
    get SizeOfClass() {
        return super.SizeOfClass + this.class_table_.add(0x8).sub(this.handle).toInt32();
    }
    toString() {
        let idsp = `ClassLoader<${this.handle}>`;
        if (this.handle.isNull())
            return idsp;
        idsp += `\n\t packages_: ${this.packages} | parent_: ${this.parent} | proxyCache_: ${this.proxyCache}`;
        idsp += `\n\t allocator_: ${this.allocator} | class_table_: ${this.class_table}`;
        return idsp;
    }
    get packages() {
        return new HeapReference_1.HeapReference((handle) => new Object_1.ArtObject(handle), this.packages_);
    }
    get parent() {
        return new HeapReference_1.HeapReference((handle) => new ArtClassLoader(handle), this.parent_);
    }
    get proxyCache() {
        return new HeapReference_1.HeapReference((handle) => new Object_1.ArtObject(handle), this.proxyCache_);
    }
    get allocator() {
        return new HeapReference_1.HeapReference((handle) => new Object_1.ArtObject(handle), this.allocator_);
    }
    get class_table() {
        return ptr(this.class_table_.readU32());
    }
}
exports.ArtClassLoader = ArtClassLoader;
},{"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexCache = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const StdString_1 = require("../../../../../tools/StdString");
const Object_1 = require("../../../../Object");
const DexFile_1 = require("../dexfile/DexFile");
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
        let disp = `DexCache<P:${this.handle} | C:${this.currentHandle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t location: ${this.location_str} @ ${this.location.root.handle}`;
        disp += `\n\t preresolved_strings_: ${this.preresolved_strings} | num_preresolved_strings_: ${this.num_preresolved_strings} | resolved_call_sites_: ${this.resolved_call_sites}`;
        disp += `\n\t resolved_fields_: ${this.resolved_fields} | resolved_methods_: ${this.resolved_methods} | resolved_types_: ${this.resolved_types}`;
        disp += `\n\t strings_: ${this.strings} | num_resolved_call_sites_: ${this.num_resolved_call_sites} | num_resolved_fields_: ${this.num_resolved_fields}`;
        disp += `\n\t num_resolved_method_types_: ${this.num_resolved_method_types} | num_resolved_methods_: ${this.num_resolved_methods} | num_resolved_types_: ${this.num_resolved_types}`;
        disp += `\n\t num_strings_: ${this.num_strings}`;
        return disp;
    }
    get SizeOfClass() {
        return super.SizeOfClass + this.num_strings_.add(0x4).sub(this.CurrentHandle).toInt32();
    }
    get currentHandle() {
        return this.handle.add(super.SizeOfClass).add(this.VirtualClassOffset);
    }
    get location() {
        return new HeapReference_1.HeapReference(handle => new StdString_1.StdString(handle), this.location_);
    }
    get location_str() {
        return StdString_1.StdString.from(this.location.root.handle);
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
},{"../../../../../tools/StdString":80,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"../dexfile/DexFile":55}],69:[function(require,module,exports){
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
},{"../../../../Object":12}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":64,"./ArtMethod":65,"./ClassExt":66,"./ClassLoader":67,"./IfTable":69}],71:[function(require,module,exports){

},{}],72:[function(require,module,exports){
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
},{"../../../../tools/StdString":80}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./dex2oat");
},{"./dex2oat":72}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
require("./dex2oat/include");
},{"./art/include":61,"./dex2oat/include":73}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":74}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Object");
require("./JSHandle");
require("./android");
require("./ValueHandle");
require("./machine-code");
require("./TraceManager");
require("./implements/include");
require("./Interface/include");
require("./Utils/include");
require("./functions/include");
},{"./Interface/include":10,"./JSHandle":11,"./Object":12,"./TraceManager":13,"./Utils/include":16,"./ValueHandle":17,"./android":18,"./functions/include":24,"./implements/include":75,"./machine-code":77}],77:[function(require,module,exports){
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
},{}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":4,"./android/include":76,"./tools/include":86}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./include");
globalThis.testArtMethod = () => {
    Java.perform(() => {
        const JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"));
        let method = pathToArtMethod("com.unity3d.player.UnityPlayer.UnitySendMessage");
        let dexFile = method.GetDexFile();
        method.show();
        for (let i = dexFile.NumStringIds(); i > dexFile.NumStringIds() - 20; i--) {
            LOGD(dexFile.StringDataByIdx(i).toString());
        }
        for (let i = dexFile.NumTypeIds(); i > dexFile.NumTypeIds() - 20; i--) {
            LOGD(dexFile.GetTypeDescriptor(i));
        }
        newLine();
        LOGD(dexFile.StringDataByIdx(8907).str);
        dexFile.PrettyMethod(41007);
    });
};
globalThis.sendMessage = (a = "test_class", b = "test_function", c = "test_value") => {
    Java.perform(() => {
        const JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new(a), JavaString.$new(b), JavaString.$new(c));
    });
};
},{"./include":78}],80:[function(require,module,exports){
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
    static fromPointer(ptrs) {
        return StdString.fromPointers([ptrs, ptrs.add(Process.pointerSize), ptrs.add(Process.pointerSize * 2)]);
    }
    static fromPointers(ptrs) {
        if (ptrs.length != 3)
            return '';
        return StdString.fromPointersRetInstance(ptrs).disposeToString();
    }
    static from(pointer) {
        return pointer.add(Process.pointerSize * 2).readCString();
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
        try {
            const data = this._getData()[0];
            return data.readUtf8String();
        }
        catch (error) {
            return StdString.from(this.handle.add(Process.pointerSize * 2));
        }
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
},{}],81:[function(require,module,exports){
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
},{}],82:[function(require,module,exports){
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

},{"timers":90}],83:[function(require,module,exports){
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
},{}],84:[function(require,module,exports){
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
},{}],85:[function(require,module,exports){
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
},{}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./dlopen");
require("./dump");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
},{"./StdString":80,"./common":81,"./dlopen":82,"./dump":83,"./enum":84,"./logger":87,"./modifiers":88}],87:[function(require,module,exports){
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
},{}],88:[function(require,module,exports){
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
},{}],89:[function(require,module,exports){
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

},{}],90:[function(require,module,exports){
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

},{"process/browser.js":89,"timers":90}]},{},[79])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0NvbnRleHQudHMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9UaGVhZHMudHMiLCJhZ2VudC9KYXZhL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvSGVhcFJlZmVyZW5jZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0pTSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9PYmplY3QudHMiLCJhZ2VudC9hbmRyb2lkL1RyYWNlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvQXJ0TWV0aG9kSGVscGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9TeW1IZWxwZXIudHMiLCJhZ2VudC9hbmRyb2lkL1V0aWxzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL1ZhbHVlSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9hbmRyb2lkLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvRGVmaW5lQ2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9EZXhGaWxlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL0V4ZWN1dGVTd2l0Y2hJbXBsQ3BwLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvT3BlbkNvbW1vbi50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL1N5bWJvbE1hbmFnZXIudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvaW5pdF9hcnJheS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvQ2xhc3NMaW5rZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0djUm9vdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvR2xvYmFscy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1Y3Rpb24udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb24udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb25MaXN0ZW5lci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL0luc3RydW1lbnRhdGlvblN0YWNrRnJhbWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb25TdGFja1BvcHBlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL2VudW0udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXRRdWlja01ldGhvZEhlYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2F0L09hdERleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdC9PYXRGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2JqUHRyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9RdWlja01ldGhvZEZyYW1lSW5mby50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU2hhZG93RnJhbWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9DSEFTdGFja1Zpc2l0b3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9DYXRjaEJsb2NrU3RhY2tWaXNpdG9yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TdGFja1Zpc2l0b3IvU3RhY2tWaXNpdG9yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TdGFja1Zpc2l0b3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvVGhyZWFkLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UeXBlL0pWYWx1ZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvVHlwZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UeXBlL2pvYmplY3QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvQ29kZUl0ZW1EYXRhQWNjZXNzb3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvQ29kZUl0ZW1EZWJ1Z0luZm9BY2Nlc3Nvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9Db2RlSXRlbUluc3RydWN0aW9uQWNjZXNzb3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvQ29tcGFjdERleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvRGV4RmlsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9EZXhGaWxlU3RydWN0cy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9EZXhJbmRleC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9IZWFkZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvU3RhbmRhcmREZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2ludGVycHJldGVyL1N3aXRjaEltcGxDb250ZXh0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbnRlcnByZXRlci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQXJ0Q2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRNZXRob2QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9DbGFzc0V4dC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzTG9hZGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvRGV4Q2FjaGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9JZlRhYmxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvcnVudGltZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2RleDJvYXQvZGV4Mm9hdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9kZXgyb2F0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9tYWNoaW5lLWNvZGUuanMiLCJhZ2VudC9pbmNsdWRlLnRzIiwiYWdlbnQvbWFpbi50cyIsImFnZW50L3Rvb2xzL1N0ZFN0cmluZy50cyIsImFnZW50L3Rvb2xzL2NvbW1vbi50cyIsImFnZW50L3Rvb2xzL2Rsb3Blbi50cyIsImFnZW50L3Rvb2xzL2R1bXAudHMiLCJhZ2VudC90b29scy9lbnVtLnRzIiwiYWdlbnQvdG9vbHMvZnVuY3Rpb25zLnRzIiwiYWdlbnQvdG9vbHMvaW5jbHVkZS50cyIsImFnZW50L3Rvb2xzL2xvZ2dlci50cyIsImFnZW50L3Rvb2xzL21vZGlmaWVycy50cyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsU0FBUyxjQUFjO0lBQ25CLElBQUksV0FBVyxHQUFpQixJQUFJLENBQUE7SUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNULFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtJQUM3RSxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sV0FBVyxDQUFBO0FBQ3RCLENBQUM7QUFFRCxTQUFTLGNBQWM7SUFDbkIsSUFBSSxXQUFXLEdBQVcsRUFBRSxDQUFBO0lBQzVCLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDVCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ3BGLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLGNBQWMs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QUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQTtJQUMxQixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFCLENBQUM7Q0FFSjtBQXVDRCxNQUFNLE1BQU8sU0FBUSxtQkFBUTtJQUV6QixPQUFPLEdBQXdCLElBQUksR0FBRyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQztRQUNiLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQztRQUNiLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztLQUNmLENBQUMsQ0FBQTtJQUVNLE1BQU0sR0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBRXRELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBQ3RCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUIsQ0FBQztDQUVKO0FBU0QsVUFBVSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsRUFBRSxHQUFHLE9BQU8sY0FBYyxDQUFDLGdCQUFnQixDQUFBLENBQUMsQ0FBQyxDQUFBOzs7OztBQzdiOUUsbURBQStDO0FBQy9DLHdDQUF3QztBQUV4QyxNQUFhLGVBQWdCLFNBQVEsbUJBQVE7SUFJekMsZ0NBQWdDLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUE7SUFJcEUsMkJBQTJCLEdBQWtCLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFJM0YsNEJBQTRCLEdBQWtCLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFJdkYsZUFBZSxHQUFrQixJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBSTNFLHNCQUFzQixHQUFrQixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUtyRSw0QkFBNEIsR0FBa0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUtsRiwyQkFBMkIsR0FBa0IsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUt2Riw2QkFBNkIsR0FBa0IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUt4RixzQkFBc0IsR0FBa0IsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUtuRiwwQkFBMEIsR0FBa0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUtoRiwyQkFBMkIsR0FBa0IsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUlyRixnQ0FBZ0MsR0FBa0IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUkzRixpQ0FBaUMsR0FBa0IsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUlqRyxzQkFBc0IsR0FBa0IsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUt2RixpQ0FBaUMsR0FBa0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQU12RixpQ0FBaUMsR0FBa0IsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQThDbEcsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxvQkFBb0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFBO1FBQ3RELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQWlCckMsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzFILENBQUM7Q0FFSjtBQXJKRCwwQ0FxSkM7Ozs7O0FDeEpELG1EQUErQztBQUUvQyxNQUFhLHVCQUF3QixTQUFRLG1CQUFRO0lBRWpELFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7Q0FFSjtBQU5ELDBEQU1DOzs7OztBQ1JELG1EQUErQztBQUMvQywrQ0FBOEM7QUFDOUMsd0NBQXdDO0FBQ3hDLG1EQUErQztBQUUvQyxNQUFhLHlCQUEwQixTQUFRLG1CQUFRO0lBR25ELFlBQVksR0FBa0IsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUVoRCxPQUFPLEdBQWtCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUUzRCxVQUFVLEdBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUV6RCxTQUFTLEdBQWtCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUUzRCxrQkFBa0IsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRW5FLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsOEJBQThCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUNoRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQy9CLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUMxQixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDN0IsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQzVCLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3JDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzVGLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksa0JBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDekQsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3hDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDbkMsQ0FBQztJQUVELElBQUksaUJBQWlCO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0lBUUQsSUFBSTtRQUNBLE9BQU8sU0FBUyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsU0FBUyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDOUcsQ0FBQztDQUVKO0FBOURELDhEQThEQzs7Ozs7QUNuRUQsbURBQStDO0FBQy9DLHdDQUF3QztBQUN4QyxzQ0FBcUM7QUFFckMsTUFBYSwwQkFBMkIsU0FBUSxtQkFBUTtJQUdwRCxLQUFLLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUE7SUFFekMsZ0JBQWdCLEdBQWtCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUU3RCxpQkFBaUIsR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFekUsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVywrQkFBK0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFBO1FBQ2pFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDeEIsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQ25DLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1FBQ3BDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzNGLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksa0JBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDbEQsQ0FBQztJQUVELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQzlDLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNoQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMzQyxDQUFDO0NBRUo7QUF0Q0QsZ0VBc0NDOzs7OztBQzFDRCxJQUFZLHVCQUtYO0FBTEQsV0FBWSx1QkFBdUI7SUFDL0IsK0ZBQXFCLENBQUE7SUFDckIsNkdBQTRCLENBQUE7SUFFNUIsK0ZBQWlCLENBQUE7QUFDckIsQ0FBQyxFQUxXLHVCQUF1QixHQUF2QiwrQkFBdUIsS0FBdkIsK0JBQXVCLFFBS2xDO0FBRUQsSUFBWSxvQkFXWDtBQVhELFdBQVksb0JBQW9CO0lBQzVCLG1GQUFvQixDQUFBO0lBQ3BCLGlGQUFtQixDQUFBO0lBQ25CLGlGQUFtQixDQUFBO0lBQ25CLDZFQUFpQixDQUFBO0lBQ2pCLDRFQUFpQixDQUFBO0lBQ2pCLGtGQUFvQixDQUFBO0lBQ3BCLHdGQUF1QixDQUFBO0lBQ3ZCLHVFQUFjLENBQUE7SUFDZCx5RkFBd0IsQ0FBQTtJQUN4Qiw0RkFBeUIsQ0FBQTtBQUM3QixDQUFDLEVBWFcsb0JBQW9CLEdBQXBCLDRCQUFvQixLQUFwQiw0QkFBb0IsUUFXL0I7QUFFRCxJQUFZLG9CQUlYO0FBSkQsV0FBWSxvQkFBb0I7SUFDNUIsMkZBQWtCLENBQUE7SUFDbEIsNkhBQW1DLENBQUE7SUFDbkMsMkdBQTBCLENBQUE7QUFDOUIsQ0FBQyxFQUpXLG9CQUFvQixHQUFwQiw0QkFBb0IsS0FBcEIsNEJBQW9CLFFBSS9COzs7O0FDeEJELGtCQUFlO0FBQ2YsNkJBQTBCO0FBQzFCLHFDQUFrQztBQUNsQyx1Q0FBb0M7QUFDcEMsd0NBQXFDOzs7OztBQ0pyQyxnREFBNEM7QUFNNUMsTUFBTSxxQkFBcUIsR0FBVyxVQUFVLENBQUE7QUFFaEQsTUFBTSxhQUFhLEdBQVcsQ0FBQyxxQkFBcUIsQ0FBQTtBQVlwRCxNQUFhLG9CQUFxQixTQUFRLG1CQUFRO0lBSTlDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBSXZDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUcvQixLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFMUIsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sMEJBQTBCLElBQUksQ0FBQyxpQkFBaUIsZUFBZSxJQUFJLENBQUMsU0FBUyxVQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUMzSCxDQUFDO0lBRUQsSUFBSSxpQkFBaUI7UUFDakIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUMsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFHRCx1QkFBdUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtJQUNqRCxDQUFDO0lBR0QsV0FBVztRQUNQLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDNUQsQ0FBQztJQUdELGVBQWU7UUFDWCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUE7SUFDMUIsQ0FBQztJQUtELFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQTtJQUNqRSxDQUFDO0NBRUo7QUF2REQsb0RBdURDOzs7OztBQzNFRCw4REFBMEQ7QUFDMUQsbURBQStDO0FBQy9DLHdDQUF3QztBQUN4Qyx1Q0FBbUM7QUFFbkMsTUFBYSxVQUFXLFNBQVEsbUJBQVE7SUFHcEMsU0FBUyxHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFBO0lBRTdDLGtCQUFrQixHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFbkUsNEJBQTRCLEdBQWtCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUUxRiwyQkFBMkIsR0FBa0IsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBRW5HLGlCQUFpQixHQUFrQixJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUVwRixrQkFBa0IsR0FBa0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFM0UsbUJBQW1CLEdBQWtCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRTdFLGlCQUFpQixHQUFrQixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUU1RSxtQkFBbUIsR0FBa0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFNUUsMEJBQTBCLEdBQWtCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRXJGLGFBQWEsR0FBa0IsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFL0Usb0JBQW9CLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUV6RSxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3ZGLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7SUFDMUUsQ0FBQztJQUVELElBQUksa0JBQWtCO1FBQ2xCLE9BQU8sQ0FBQyxDQUFBO0lBQ1osQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxjQUFjLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUMvQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLG1CQUFtQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDM0MsSUFBSSxJQUFJLDRCQUE0QixJQUFJLENBQUMsaUJBQWlCLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDekYsSUFBSSxJQUFJLHNDQUFzQyxJQUFJLENBQUMsMkJBQTJCLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUE7UUFDdkgsSUFBSSxJQUFJLHFDQUFxQyxJQUFJLENBQUMsMEJBQTBCLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFBO1FBQzlKLElBQUksSUFBSSwyQkFBMkIsSUFBSSxDQUFDLGdCQUFnQixNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3RGLElBQUksSUFBSSw0QkFBNEIsSUFBSSxDQUFDLGlCQUFpQixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ3pGLElBQUksSUFBSSw2QkFBNkIsSUFBSSxDQUFDLGtCQUFrQixNQUFNLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO1FBQzVGLElBQUksSUFBSSwyQkFBMkIsSUFBSSxDQUFDLGdCQUFnQixNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3RGLElBQUksSUFBSSw2QkFBNkIsSUFBSSxDQUFDLGtCQUFrQixNQUFNLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO1FBQzVGLElBQUksSUFBSSxvQ0FBb0MsSUFBSSxDQUFDLHlCQUF5QixNQUFNLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFBO1FBQ2pILElBQUksSUFBSSx1QkFBdUIsSUFBSSxDQUFDLFlBQVksTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDMUUsSUFBSSxJQUFJLDhCQUE4QixJQUFJLENBQUMsbUJBQW1CLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7UUFDL0YsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3hDLE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUQsSUFBSSxpQkFBaUI7UUFDakIsT0FBTyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDNUQsQ0FBQztJQUVELElBQUksMkJBQTJCO1FBQzNCLE9BQU8sSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBQ3RFLENBQUM7SUFFRCxJQUFJLDBCQUEwQjtRQUMxQixPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUN0RCxDQUFDO0lBR0QsSUFBSSxnQkFBZ0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDL0MsQ0FBQztJQUVELElBQUksaUJBQWlCO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2hELENBQUM7SUFFRCxJQUFJLGtCQUFrQjtRQUNsQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNqRCxDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDL0MsQ0FBQztJQUVELElBQUksa0JBQWtCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2pELENBQUM7SUFFRCxJQUFJLHlCQUF5QjtRQUN6QixPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNwRCxDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ1osT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQzNDLENBQUM7SUFFRCxJQUFJLG1CQUFtQjtRQUNuQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNsRCxDQUFDO0NBRUo7QUEvR0QsZ0NBK0dDOzs7OztBQ3BIRCw4REFBMEQ7QUFDMUQsbURBQStDO0FBQy9DLHdDQUF3QztBQUV4QyxNQUFhLE9BQVEsU0FBUSxtQkFBUTtJQUdqQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUU5QixLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUUzQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRXBDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFbkMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRXBELHFCQUFxQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRXJFLFVBQVUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUV4RCxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRTNDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFN0MsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUUvQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRWpELFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFbEQsU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUU3QyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFHeEQsY0FBYyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRTdELHNCQUFzQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUU3RCx3QkFBd0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUV2RSxhQUFhLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFOUQsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRTdELFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUYsQ0FBQztJQUVELElBQUksa0JBQWtCO1FBQ2xCLE9BQU8scUJBQVcsQ0FBQTtJQUN0QixDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0lBQzFFLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsV0FBVyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDNUMsSUFBSSxJQUFJLGtCQUFrQixJQUFJLENBQUMsUUFBUSxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUM3RCxJQUFJLElBQUksY0FBYyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNyRCxJQUFJLElBQUksK0JBQStCLElBQUksQ0FBQyxzQkFBc0IsNEJBQTRCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO1FBQ3pILElBQUksSUFBSSxrQkFBa0IsSUFBSSxDQUFDLFNBQVMsZUFBZSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDckUsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsV0FBVyxpQkFBaUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzdFLElBQUksSUFBSSxzQkFBc0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ2xELElBQUksSUFBSSxtQkFBbUIsSUFBSSxDQUFDLFVBQVUsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUN6RSxJQUFJLElBQUksOEJBQThCLElBQUksQ0FBQyxxQkFBcUIscUJBQXFCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUN6RyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDbkQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsSUFBSSxHQUFHO1FBQ0gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2xDLENBQUM7SUFFRCxJQUFJLHNCQUFzQjtRQUN0QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsSUFBSSxvQkFBb0I7UUFDcEIsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDbkQsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN4QyxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3RDLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDMUMsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN4QyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3pDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdkMsQ0FBQztJQUVELElBQUkscUJBQXFCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BELENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDNUMsQ0FBQztJQUVELElBQUkscUJBQXFCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BELENBQUM7SUFFRCxJQUFJLHVCQUF1QjtRQUN2QixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN0RCxDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ1osT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQzNDLENBQUM7SUFFRCxJQUFJLHNCQUFzQjtRQUN0QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNyRCxDQUFDO0NBRUo7QUEvSUQsMEJBK0lDOzs7O0FDbkpELHFCQUFrQjtBQUNsQix3QkFBcUI7Ozs7O0FDRHJCLGdEQUE0QztBQU01QyxNQUFhLE1BQU8sU0FBUSxtQkFBUTtJQUVoQyxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBR0QsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQzVDLENBQUM7Q0FFSjtBQWZELHdCQWVDOzs7OztBQ3JCRCxnREFBNEM7QUFJNUMsTUFBYSxvQkFBcUIsU0FBUSxtQkFBUTtJQUU5QyxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0NBRUo7QUFORCxvREFNQzs7Ozs7QUNWRCwrQ0FBOEM7QUFDOUMsa0RBQThDO0FBQzlDLGdEQUE0QztBQUM1Qyw0Q0FBMkM7QUFDM0MsdUNBQXVDO0FBQ3ZDLDBDQUFzQztBQVF0QyxNQUFhLFdBQVksU0FBUSxtQkFBUTtJQUk3QixLQUFLLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUE7SUFFekMsT0FBTyxHQUFrQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFcEQsZ0JBQWdCLEdBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUUvRCxXQUFXLEdBQWtCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBR25FLGlCQUFpQixHQUFrQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFHcEUsZ0JBQWdCLEdBQWtCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRXpFLE9BQU8sR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUV2RCx5QkFBeUIsR0FBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFaEUsa0JBQWtCLEdBQWtCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFNM0UsWUFBWSxHQUFrQixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBVzlELE1BQU0sR0FBa0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFMUQsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxlQUFlLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3BCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksZUFBZSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDbkMsSUFBSSxJQUFJLGlCQUFpQixJQUFJLENBQUMsT0FBTyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQTtRQUN4RSxJQUFJLElBQUkseUJBQXlCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUN2RCxJQUFJLElBQUksb0JBQW9CLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUM3QyxJQUFJLElBQUksMEJBQTBCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUE7UUFDakosSUFBSSxJQUFJLHlCQUF5QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDdkQsSUFBSSxJQUFJLGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDckMsSUFBSSxJQUFJLGtDQUFrQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQTtRQUN6RSxJQUFJLElBQUksMkJBQTJCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQzNELElBQUksSUFBSSxxQkFBcUIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBRS9DLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDcEQsQ0FBQztJQUVELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxlQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDMUQsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDaEIsT0FBTyxJQUFJLDRCQUFjLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDbkUsQ0FBQztJQUVELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzFDLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDakMsQ0FBQztJQUVELElBQUksd0JBQXdCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ25ELENBQUM7SUFFRCxJQUFJLGlCQUFpQjtRQUNqQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM1QyxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3RDLENBQUM7SUFFRCxJQUFJLE1BQU0sQ0FBQyxPQUFpQjtRQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNsQyxDQUFDO0lBRUQsSUFBSSxVQUFVLENBQUMsV0FBMEI7UUFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQTtRQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1NBQy9DO1FBQ0QsT0FBTyxLQUFLLENBQUE7SUFDaEIsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQTtRQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxxQkFBVyxDQUFDLENBQUMsQ0FBQTtTQUNoRjtRQUNELE9BQU8sU0FBUyxDQUFBO0lBQ3BCLENBQUM7SUFJRCw0QkFBNEI7UUFDeEIsT0FBTyxPQUFPLENBQ1YsdURBQXVELEVBQUUsZUFBZSxFQUN0RSxDQUFDLFNBQVMsQ0FBQyxFQUNYLENBQUMsU0FBUyxDQUFDLEVBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3RCLENBQUM7SUFJRCxhQUFhO1FBQ1QsT0FBTyxJQUFJLGtCQUFTLENBQUMsT0FBTyxDQUN4Qix3Q0FBd0MsRUFBRSxXQUFXLEVBQ25ELENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUNyQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFDckIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFJRCxxQkFBcUIsQ0FBQyxPQUFpQjtRQUNuQyxPQUFPLElBQUksa0JBQVMsQ0FBQyxPQUFPLENBQ3hCLHdDQUF3QyxFQUFFLFdBQVcsRUFDbkQsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQ3JCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUNyQixJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDaEMsQ0FBQztJQUdELFFBQVE7UUFDSixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ2xHLENBQUM7SUFHRCx5QkFBeUI7UUFDckIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUE7SUFDeEMsQ0FBQztJQUdELHlCQUF5QixDQUFDLHdCQUFpQztRQUN2RCxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUE7SUFDckUsQ0FBQztJQUdELG1CQUFtQjtRQUNmLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0lBQ2pDLENBQUM7SUFHRCxtQkFBbUIsQ0FBQyxpQkFBMEI7UUFDMUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFHRCxRQUFRLENBQUMsUUFBa0I7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUE7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUE7SUFDMUIsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBZ0IsSUFBSSxDQUFBO1FBQzFCLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM3QixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2xCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFBO1NBQ2Y7UUFDRCxPQUFPLFNBQVMsQ0FBQTtJQUNwQixDQUFDO0lBRU0sY0FBYyxDQUFDLFNBQWtCLElBQUk7UUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqSCxDQUFDO0lBRU0sdUJBQXVCLENBQUMsU0FBa0IsSUFBSSxFQUFFLGFBQXFCLENBQUM7UUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFlLEVBQUUsS0FBYSxFQUFFLEVBQUU7WUFDdEQsTUFBTSxVQUFVLEdBQWMsRUFBRSxDQUFDLE1BQU0sQ0FBQTtZQUN2QyxJQUFJLENBQUMsR0FBRyxLQUFLLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7WUFDcEUsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFBO1lBQ3ZDLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSw0QkFBYyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUM5SCxJQUFJLE9BQU8sR0FBVyxVQUFVLENBQUE7WUFDaEMsSUFBSSxVQUFVLEdBQVcsRUFBRSxDQUFBO1lBQzNCLE9BQU8sRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFO2dCQUNoRSxNQUFNLE1BQU0sR0FBa0IsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUMzRixVQUFVLElBQUksS0FBSyxjQUFjLENBQUMsTUFBTSxJQUFJLE1BQU0sT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUE7Z0JBQy9GLGNBQWMsR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUE7YUFDekM7WUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDOUIsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0NBRUo7QUEzTkQsa0NBMk5DOzs7OztBQ3hPRCxpREFBNkM7QUFFN0MsTUFBYSxlQUFnQixTQUFRLDJCQUFZO0lBRTdDLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7Q0FFSjtBQU5ELDBDQU1DOzs7OztBQ1JELGlEQUE2QztBQUU3QyxNQUFhLHNCQUF1QixTQUFRLDJCQUFZO0lBRXBELFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7Q0FFSjtBQU5ELHdEQU1DOzs7OztBQ1JELGtFQUE4RDtBQUM5RCxrRUFBOEQ7QUFDOUQsOERBQTBEO0FBQzFELG1EQUErQztBQUMvQyxtREFBK0M7QUFDL0MsK0NBQThDO0FBQzlDLGdEQUE0QztBQUM1Qyx3Q0FBd0M7QUFDeEMsc0NBQXFDO0FBUXJDLE1BQWEsWUFBYSxTQUFRLG1CQUFRO0lBSXRDLE9BQU8sR0FBa0IsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUUzQyxVQUFVLEdBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUV6RCxpQkFBaUIsR0FBa0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRW5FLGdCQUFnQixHQUFrQixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUV6RSxtQkFBbUIsR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFM0UsNEJBQTRCLEdBQWtCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBR3ZGLFdBQVcsR0FBa0IsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFJL0UsVUFBVSxHQUFrQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFJN0Qsa0JBQWtCLEdBQWtCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUVwRSxzQkFBc0IsR0FBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFJaEYsUUFBUSxHQUFrQixJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQTtJQUV0RSxnQkFBZ0IsR0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRWhFLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsaUJBQWlCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUNuRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQzFCLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUM3QixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtRQUNwQyxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDbkMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDdEMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUE7UUFDL0MsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzlCLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUM3QixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtRQUNyQyxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtRQUN6QyxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDM0IsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQ25DLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtJQUMxRSxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ25GLENBQUM7SUFFRCxJQUFJLGtCQUFrQjtRQUNsQixPQUFPLHFCQUFXLENBQUE7SUFDdEIsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxrQkFBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNoQixPQUFPLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDM0UsQ0FBQztJQUVELElBQUksa0JBQWtCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2pELENBQUM7SUFFRCxJQUFJLDJCQUEyQjtRQUMzQixPQUFPLElBQUksMkNBQW9CLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDcEYsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNuRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ2xELENBQUM7SUFFRCxJQUFJLGlCQUFpQjtRQUNqQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNoRCxDQUFDO0lBRUQsSUFBSSxxQkFBcUI7UUFDckIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDcEQsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFJRCxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQXFCLEVBQUUsT0FBc0IsRUFBRSxTQUF3QixFQUFFLGtCQUEyQixJQUFJO1FBQ3RILE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxDQUMzQix3RUFBd0UsRUFBRSxXQUFXLEVBQ3JGLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUNoRCxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFBO0lBQ3JELENBQUM7SUFJRCxRQUFRLENBQUMsZ0JBQXlCO1FBQzlCLE9BQU8sT0FBTyxDQUNWLG1DQUFtQyxFQUFFLFdBQVcsRUFDaEQsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUN6QixJQUFJLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUlELFNBQVM7UUFDTCxPQUFPLElBQUkscUJBQVMsQ0FBQyxPQUFPLENBQ3hCLG9DQUFvQyxFQUFFLFdBQVcsRUFDakQsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFJRCxNQUFNLENBQUMsR0FBYTtRQUNoQixPQUFPLE9BQU8sQ0FDVixpQ0FBaUMsRUFBRSxXQUFXLEVBQzlDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN6QixDQUFDO0lBTUQsNEJBQTRCLENBQUMsQ0FBWSxFQUFFLElBQWMsRUFBRSxPQUFpQixFQUFFLE9BQWlCLEVBQUUsR0FBYTtRQUMxRyxPQUFPLE9BQU8sQ0FDVix5RkFBeUYsRUFBRSxXQUFXLEVBQ3RHLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDeEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ3BFLENBQUM7SUFJRCxhQUFhLENBQUMsR0FBYTtRQUN2QixPQUFPLE9BQU8sQ0FDVix5Q0FBeUMsRUFBRSxXQUFXLEVBQ3RELFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN6QixDQUFDO0lBSUQsZ0JBQWdCO1FBQ1osT0FBTyxDQUNILDRDQUE0QyxFQUFFLFdBQVcsRUFDekQsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNwQixDQUFDO0lBSUQsU0FBUyxDQUFDLE1BQWlCO1FBQ3ZCLE9BQU8sQ0FDSCxpREFBaUQsRUFBRSxXQUFXLEVBQzlELE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDOUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbkMsQ0FBQztJQUlELGdCQUFnQixDQUFDLE1BQXFCLEVBQUUsU0FBbUI7UUFDdkQsT0FBTyxPQUFPLENBQ1YsMEVBQTBFLEVBQUUsV0FBVyxFQUN2RixLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUNwQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0lBT0QsV0FBVyxDQUFDLG1CQUE0QjtRQUNwQyxPQUFPLENBQ0gsZ0VBQWdFLEVBQUUsV0FBVyxFQUM3RSxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLEVBQzNCLElBQUksQ0FBQyxNQUFNLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBSUQsV0FBVyxDQUFDLG1CQUE0QjtRQUNwQyxPQUFPLENBQ0gsZ0VBQWdFLEVBQUUsV0FBVyxFQUM3RSxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLEVBQzNCLElBQUksQ0FBQyxNQUFNLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBSUQsV0FBVztRQUNQLE9BQU8sT0FBTyxDQUNWLHVDQUF1QyxFQUFFLFdBQVcsRUFDcEQsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNwQixDQUFDO0lBSUQsV0FBVyxDQUFDLFVBQXFCO1FBQzdCLE9BQU8sQ0FDSCxzQ0FBc0MsRUFBRSxXQUFXLEVBQ25ELE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDOUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUNoQyxDQUFDO0lBSUQsYUFBYSxDQUFDLE1BQWlCO1FBQzNCLE9BQU8sQ0FDSCxtREFBbUQsRUFBRSxXQUFXLEVBQ2hFLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDOUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbkMsQ0FBQztJQUlELHdCQUF3QixDQUFDLENBQVksRUFBRSxJQUFjLEVBQUUsSUFBYyxFQUFFLEdBQWE7UUFDaEYsT0FBTyxPQUFPLENBQ1Ysa0ZBQWtGLEVBQUUsV0FBVyxFQUMvRixLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ3BELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQy9DLENBQUM7SUFJRCxXQUFXLENBQUMsQ0FBWSxFQUFFLElBQWMsRUFBRSxPQUFpQixFQUFFLE9BQWlCLEVBQUUsR0FBYTtRQUN6RixPQUFPLE9BQU8sQ0FDVix3RUFBd0UsRUFBRSxXQUFXLEVBQ3JGLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDcEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFJRCxPQUFPLENBQUMsQ0FBWSxFQUFFLElBQWMsRUFBRSxTQUFtQixFQUFFLElBQWM7UUFDckUsT0FBTyxPQUFPLENBQ1YsOERBQThELEVBQUUsV0FBVyxFQUMzRSxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ3BELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ3JELENBQUM7SUFJRCxPQUFPLENBQUMsQ0FBWSxFQUFFLElBQWMsRUFBRSxJQUFjO1FBQ2hELE9BQU8sT0FBTyxDQUNWLGdFQUFnRSxFQUFFLFdBQVcsRUFDN0UsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUNwRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFJRCxpQkFBaUI7UUFDYixPQUFPLE9BQU8sQ0FDViw0Q0FBNEMsRUFBRSxXQUFXLEVBQ3pELEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUlELFdBQVcsQ0FBQyxDQUFZLEVBQUUsSUFBYyxFQUFFLFNBQW1CLEVBQUUsT0FBaUIsRUFBRSxPQUFpQjtRQUMvRixPQUFPLE9BQU8sQ0FDVixzRUFBc0UsRUFBRSxXQUFXLEVBQ25GLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUNqRSxDQUFDO0lBSUQsZ0JBQWdCO1FBQ1osT0FBTyxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQ2hDLDRDQUE0QyxFQUFFLFdBQVcsRUFDekQsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ3JCLENBQUM7SUFJRCx3QkFBd0I7UUFDcEIsT0FBTyxJQUFJLDJDQUFvQixDQUFDLE9BQU8sQ0FDbkMsb0RBQW9ELEVBQUUsV0FBVyxFQUNqRSxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDckIsQ0FBQztJQUlELGVBQWUsQ0FBQyxHQUFhO1FBQ3pCLE9BQU8sT0FBTyxDQUNWLDJDQUEyQyxFQUFFLFdBQVcsRUFDeEQsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUMxQixJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3pCLENBQUM7SUFJRCxNQUFNLENBQUMsR0FBYTtRQUNoQixPQUFPLE9BQU8sQ0FDVixpQ0FBaUMsRUFBRSxXQUFXLEVBQzlDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN6QixDQUFDO0lBSUQsa0NBQWtDLENBQUMsSUFBYyxFQUFFLE9BQWlCLEVBQUUsT0FBaUIsRUFBRSxHQUFhO1FBQ2xHLE9BQU8sT0FBTyxDQUNWLGdGQUFnRixFQUFFLFdBQVcsRUFDN0YsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUlELDhCQUE4QixDQUFDLElBQWMsRUFBRSxJQUFjO1FBQ3pELE9BQU8sT0FBTyxDQUNWLHlFQUF5RSxFQUFFLFdBQVcsRUFDdEYsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDaEMsQ0FBQztJQUlELDJCQUEyQixDQUFDLE1BQWdCLEVBQUUsTUFBZ0IsRUFBRSxPQUFpQixFQUFFLEdBQWE7UUFDNUYsT0FBTyxPQUFPLENBQ1YsdUVBQXVFLEVBQUUsV0FBVyxFQUNwRixLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzlDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDbEQsQ0FBQztJQUlELHVCQUF1QixDQUFDLEdBQWEsRUFBRSxJQUFjLEVBQUUsR0FBYTtRQUNoRSxPQUFPLE9BQU8sQ0FDVixrRUFBa0UsRUFBRSxXQUFXLEVBQy9FLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ2hDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBSUQsZUFBZSxDQUFDLEdBQWE7UUFDekIsT0FBTyxPQUFPLENBQ1YsMkNBQTJDLEVBQUUsV0FBVyxFQUN4RCxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQzFCLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDekIsQ0FBQztJQUlELGFBQWE7UUFDVCxPQUFPLElBQUksa0JBQVMsQ0FBQyxPQUFPLENBQ3hCLHlDQUF5QyxFQUFFLFdBQVcsRUFDdEQsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ3JCLENBQUM7SUFJRCxxQkFBcUIsQ0FBQyxXQUEwQixFQUFFLFdBQXFCO1FBQ25FLE9BQU8sT0FBTyxDQUNWLGlFQUFpRSxFQUFFLFdBQVcsRUFDOUUsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFDOUMsQ0FBQztDQUVKO0FBalpELG9DQWlaQztBQWNELElBQVksUUFXWDtBQVhELFdBQVksUUFBUTtJQUNoQiwyREFBa0IsQ0FBQTtJQUNsQiwrQ0FBWSxDQUFBO0lBQ1osbURBQWMsQ0FBQTtJQUNkLHFEQUFlLENBQUE7SUFDZixxREFBZSxDQUFBO0lBQ2YseURBQWlCLENBQUE7SUFDakIseURBQWlCLENBQUE7SUFDakIsaURBQWEsQ0FBQTtJQUNiLG1FQUFzQixDQUFBO0lBQ3RCLG1EQUFjLENBQUE7QUFDbEIsQ0FBQyxFQVhXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBV25CO0FBQUEsQ0FBQztBQU1GLElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUNyQixtRkFBeUIsQ0FBQTtJQUN6Qiw2RUFBc0IsQ0FBQTtBQUMxQixDQUFDLEVBSFcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFHeEI7QUFBQSxDQUFDOzs7O0FDbmNGLDBCQUF1QjtBQUN2Qiw2QkFBMEI7QUFDMUIsb0NBQWlDOzs7OztBQ0ZqQywyREFBdUQ7QUFDdkQsZ0RBQTRDO0FBRTVDLGtEQUE4QztBQUk5QyxNQUFhLFNBQVUsU0FBUSxtQkFBUTtJQUVuQyxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLGFBQWEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzlDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksbUJBQW1CLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFBO1FBQ2pELElBQUk7WUFDQSxJQUFJLElBQUksc0JBQXNCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFBO1NBQzlFO1FBQUMsTUFBTSxHQUFHO1FBQ1gsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBSUQsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sTUFBTSxDQUFDLDhCQUE4QixFQUFFLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUM1RSxDQUFDO0lBSU0sYUFBYTtRQUNoQixPQUFPLHFCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDekIsa0NBQWtDLEVBQUUsV0FBVyxFQUMvQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUlNLGFBQWEsQ0FBQyxJQUFZO1FBQzdCLE9BQU8sQ0FDSCxtQ0FBbUMsRUFBRSxXQUFXLEVBQ2hELE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDOUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDekQsQ0FBQztJQVFNLGFBQWEsQ0FBQyxrQkFBMkIsSUFBSSxFQUFFLGFBQXNCLElBQUk7UUFDNUUsSUFBSSxNQUFNLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUE7UUFDNUIsT0FBTyxDQUNILG1GQUFtRixFQUFFLFdBQVcsRUFDaEcsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFDbkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQzVELE9BQU8sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFJTSxtQkFBbUI7UUFDdEIsT0FBTyxPQUFPLENBQ1Ysd0NBQXdDLEVBQUUsV0FBVyxFQUNyRCxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFJTSxzQkFBc0IsQ0FBQyxZQUFxQjtRQUMvQyxPQUFPLENBQ0gsbURBQW1ELEVBQUUsV0FBVyxFQUNoRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQzlCLElBQUksQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFJTSx1QkFBdUIsQ0FBQyxRQUFnQjtRQUMzQyxPQUFPLE9BQU8sQ0FDViwyQ0FBMkMsRUFBRSxXQUFXLEVBQ3hELFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFDN0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNyQyxDQUFDO0lBSU0sSUFBSSxDQUFDLGNBQXVCLElBQUksRUFBRSxPQUFlLEVBQUU7UUFDdEQsT0FBTyxDQUNILHdCQUF3QixFQUFFLFdBQVcsRUFDckMsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDekMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ2hFLENBQUM7SUFJTSxNQUFNO1FBQ1QsT0FBTyxDQUNILHlCQUF5QixFQUFFLFdBQVcsRUFDdEMsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMzQixDQUFDO0lBSU0sTUFBTTtRQUNULE9BQU8sQ0FDSCx5QkFBeUIsRUFBRSxXQUFXLEVBQ3RDLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDM0IsQ0FBQztJQVVNLE1BQU0sQ0FBQyxpQkFBaUI7UUFDM0IsT0FBTyxPQUFPLENBQ1YscUNBQXFDLEVBQUUsV0FBVyxFQUNsRCxLQUFLLEVBQUUsRUFBRSxDQUNaLENBQUE7SUFDTCxDQUFDO0lBS00sY0FBYztRQUNqQixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQ1osbUNBQW1DLEVBQUUsV0FBVyxFQUNoRCxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFTTSxnQkFBZ0IsQ0FBQyxTQUFpQixDQUFDLEVBQUUsa0JBQTJCLElBQUksRUFBRSxpQkFBMEIsSUFBSTtRQUN2RyxPQUFPLElBQUkscUJBQVMsQ0FBQyxPQUFPLENBQ3hCLHdDQUF3QyxFQUFFLFdBQVcsRUFDckQsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQ3ZELElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDcEcsQ0FBQztJQUlNLFNBQVM7UUFDWixPQUFPLENBQ0gsK0JBQStCLEVBQUUsV0FBVyxFQUM1QyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFJTSxhQUFhO1FBQ2hCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FDWixpQ0FBaUMsRUFBRSxXQUFXLEVBQzlDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDM0IsQ0FBQztJQUlNLFdBQVc7UUFDZCxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQ1osK0JBQStCLEVBQUUsV0FBVyxFQUM1QyxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFJTSxjQUFjO1FBQ2pCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FDWixtQ0FBbUMsRUFBRSxXQUFXLEVBQ2hELEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDM0IsQ0FBQztJQUlNLE1BQU0sQ0FBQyxhQUFhO1FBQ3ZCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FDWixpQ0FBaUMsRUFBRSxXQUFXLEVBQzlDLEtBQUssRUFBRSxFQUFFLENBQ1osQ0FBQTtJQUNMLENBQUM7SUFJTSxZQUFZLENBQUMsaUJBQTBCLElBQUk7UUFDOUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUNaLGdDQUFnQyxFQUFFLFdBQVcsRUFDN0MsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUMxQixJQUFJLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBQzNDLENBQUM7SUFJTSxjQUFjO1FBQ2pCLE9BQU8sQ0FDSCxrQ0FBa0MsRUFBRSxXQUFXLEVBQy9DLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDM0IsQ0FBQztJQUlNLG1CQUFtQixDQUFDLEdBQVk7UUFDbkMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUNaLGlEQUFpRCxFQUFFLFdBQVcsRUFDOUQsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0lBSU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFtQixFQUFFLFNBQWtCLEVBQUUsV0FBb0I7UUFDaEYsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQ3hCLHNDQUFzQyxFQUFFLFdBQVcsRUFDbkQsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsRUFDekMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDNUUsQ0FBQztJQUlNLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBbUIsRUFBRSxTQUFrQixFQUFFLFlBQXFCLEVBQUUsV0FBb0I7UUFDdkcsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQ3hCLHVDQUF1QyxFQUFFLFdBQVcsRUFDcEQsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLEVBQ2pELE1BQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUMxRixDQUFDO0NBRUo7QUE5T0QsOEJBOE9DOzs7OztBQ3JQRCxtREFBc0Q7QUFDdEQsK0NBQThDO0FBRTlDLE1BQWEsTUFBTyxTQUFRLDBCQUFlO0lBRy9CLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBRWYsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRWpCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUVqQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRWpCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUVqQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRWpCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUV6QixZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQzFCLENBQUM7SUFFRCxJQUFJLEVBQUU7UUFDRixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDMUIsQ0FBQztJQUVELElBQUksRUFBRTtRQUNGLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMzQixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzNCLENBQUM7SUFFRCxJQUFJLEVBQUU7UUFDRixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDM0IsQ0FBQztJQUVELElBQUksRUFBRTtRQUNGLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMzQixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFBO0lBQzdCLENBQUM7SUFFRCxJQUFJLEVBQUU7UUFDRixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7SUFDOUIsQ0FBQztJQUVELElBQUksRUFBRTtRQUNGLE9BQU8sSUFBSSxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBR0QsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLFVBQVUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzNDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksVUFBVSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUE7UUFDM0IsSUFBSSxJQUFJLFVBQVUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFBO1FBQzNCLElBQUksSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQTtRQUMzQixJQUFJLElBQUksVUFBVSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUE7UUFDM0IsSUFBSSxJQUFJLFVBQVUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFBO1FBQzNCLElBQUksSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQTtRQUMzQixJQUFJLElBQUksVUFBVSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUE7UUFDM0IsSUFBSSxJQUFJLFVBQVUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFBO1FBQzNCLElBQUksSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQTtRQUMzQixPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FFSjtBQWpGRCx3QkFpRkM7Ozs7QUNwRkQsb0JBQWlCO0FBQ2pCLHFCQUFrQjs7Ozs7QUNEbEIsbURBQXNEO0FBRXRELE1BQWEsT0FBUSxTQUFRLDBCQUFlO0lBRXhDLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsV0FBVyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDNUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztDQUNKO0FBWEQsMEJBV0M7Ozs7O0FDWkQsd0NBQXdDO0FBQ3hDLCtFQUEyRTtBQUUzRSxNQUFhLG9CQUFxQixTQUFRLHlEQUEyQjtJQUdqRSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFN0MsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXZDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFNUMsV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUU3QyxZQUFZLHdCQUFpQyxFQUFFLEtBQXFCLEVBQUUsaUJBQXlCLENBQUMsRUFBRSxXQUFtQixDQUFDLEVBQUUsWUFBb0IsQ0FBQyxFQUFFLGFBQXFCLENBQUM7UUFDakssSUFBSSxPQUFPLHdCQUF3QixJQUFJLFFBQVEsRUFBRTtZQUM3QyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDdEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUE7WUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDeEM7SUFDTCxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLHdCQUF3QixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDekQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLElBQUksSUFBSSx5QkFBeUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3RELElBQUksSUFBSSxtQkFBbUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQzFDLElBQUksSUFBSSxvQkFBb0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzVDLElBQUksSUFBSSxxQkFBcUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzlDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sb0JBQW9CLENBQUMsNEJBQTRCLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQTtJQUNoRixDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDcEMsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNyQyxDQUFDO0lBRUQsSUFBSSxjQUFjLENBQUMsY0FBc0I7UUFDckMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLFFBQWdCO1FBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3JDLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxTQUFpQjtRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0lBRUQsSUFBSSxVQUFVLENBQUMsVUFBa0I7UUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDekMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBc0I7UUFDeEMsTUFBTSxRQUFRLEdBQXlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDcEYsUUFBUSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUE7UUFDekIsUUFBUSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcscUJBQVcsQ0FBQyxDQUFBO1FBQy9ELFFBQVEsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdEQsUUFBUSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqRCxRQUFRLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25ELFFBQVEsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDeEMsUUFBUSxDQUFDLHlCQUF5QixHQUFHLE9BQU8sQ0FBQTtRQUM1QyxPQUFPLFFBQVEsQ0FBQTtJQUNuQixDQUFDO0NBRUo7QUFuRkQsb0RBbUZDOzs7OztBQ3ZGRCxpRUFBNkQ7QUFDN0Qsd0NBQXdDO0FBRXhDLE1BQWEseUJBQTBCLFNBQVEsMkNBQW9CO0lBRy9ELFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUV2QyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFeEQsWUFBWSx3QkFBZ0MsRUFBRSxLQUFvQixFQUFFLGNBQXVCLEVBQUUsUUFBaUIsRUFBRSxTQUFrQixFQUFFLFVBQW1CLEVBQUUsV0FBMEIsSUFBSSxFQUFFLG9CQUE0QixDQUFDO1FBQ2xOLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDdkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDckMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsOEJBQThCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUNoRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLGdCQUFnQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDdkMsSUFBSSxJQUFJLHlCQUF5QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtRQUN6RCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLHlCQUF5QixDQUFDLGlDQUFpQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUE7SUFDMUYsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdkMsQ0FBQztJQUVELElBQUksaUJBQWlCO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzVDLENBQUM7SUFFRCxJQUFJLFFBQVEsQ0FBQyxRQUF1QjtRQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSSxpQkFBaUIsQ0FBQyxpQkFBeUI7UUFDM0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7Q0FFSjtBQTdDRCw4REE2Q0M7Ozs7O0FDaERELHVEQUE0RDtBQUM1RCxxREFBMEQ7QUFDMUQsd0NBQXdDO0FBQ3hDLG1EQUErQztBQUUvQyxnREFBK0M7QUFHL0MsTUFBYSwyQkFBNEIsU0FBUSxtQkFBUTtJQUUzQyxNQUFNLENBQVUsbUNBQW1DLEdBQVcsR0FBRyxHQUFHLHFCQUFXLENBQUE7SUFDL0UsTUFBTSxDQUFVLGlDQUFpQyxHQUFHLHFCQUFXLEdBQUcsR0FBRyxDQUFBO0lBQ3JFLE1BQU0sQ0FBVSw0QkFBNEIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBRXpELFFBQVEsQ0FBb0Q7SUFJbkUseUJBQXlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUk5QyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFcEMsWUFBWSwyQkFBbUMsQ0FBQyxFQUFFLFFBQXVCLElBQUk7UUFDekUsSUFBSSxPQUFPLHdCQUF3QixJQUFJLFFBQVEsSUFBSSx3QkFBd0IsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hHLE1BQU0sYUFBYSxHQUFXLDJCQUEyQixDQUFDLG1DQUFtQztrQkFDdkYsMkJBQTJCLENBQUMsNEJBQTRCO2tCQUN4RCwyQkFBMkIsQ0FBQyxpQ0FBaUMsQ0FBQTtZQUNuRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBO1lBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1lBQzlELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUNsRDtJQUNMLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsK0JBQStCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUNoRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLGlDQUFpQyxJQUFJLENBQUMsd0JBQXdCLGFBQWEsSUFBSSxDQUFDLEtBQUssMkJBQTJCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUE7UUFDakosSUFBSSxJQUFJLGdCQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQTtRQUMvSCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFTSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQWdCLEVBQUUsTUFBcUI7UUFDMUQsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLHdDQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDBDQUF3QixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzlHLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWdCLEVBQUUsTUFBcUI7UUFDN0QsTUFBTSxRQUFRLEdBQUcsSUFBSSwyQkFBMkIsRUFBRSxDQUFBO1FBQ2xELElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtZQUN4QixNQUFNLFFBQVEsR0FBNEIsMkJBQTJCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQTRCLENBQUE7WUFDMUgsUUFBUSxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQTtZQUNyRSxRQUFRLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUE7WUFDaEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7U0FDL0I7YUFBTTtZQUNILE1BQU0sUUFBUSxHQUE2QiwyQkFBMkIsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBNkIsQ0FBQTtZQUM1SCxRQUFRLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLHdCQUF3QixDQUFBO1lBQ3JFLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQTtZQUNoQyxRQUFRLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtTQUMvQjtRQUNELE9BQU8sUUFBUSxDQUFBO0lBQ25CLENBQUM7SUFFTSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQW9CO1FBQzVDLE1BQU0sT0FBTyxHQUFZLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUMvQyxNQUFNLE1BQU0sR0FBa0IsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3JELE9BQU8sMkJBQTJCLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUNuRSxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTywyQkFBMkIsQ0FBQyxtQ0FBbUMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFBO0lBQzlGLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsSUFBSSx3QkFBd0I7UUFDeEIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDbkQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsSUFBSSx3QkFBd0IsQ0FBQyx3QkFBZ0M7UUFDekQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0lBQ3JFLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFvQjtRQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNuQyxDQUFDO0lBUUQsZ0JBQWdCO1FBQ1osT0FBTyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFPRCxhQUFhLENBQUMsU0FBaUIsQ0FBQztRQUM1QixPQUFPLDRCQUFjLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDcEQsQ0FBQzs7QUF0R0wsa0VBd0dDO0FBT0QsVUFBVSxDQUFDLFdBQVcsR0FBRywyQkFBMkIsQ0FBQyxXQUFXLENBQUE7QUFDaEUsVUFBVSxDQUFDLGFBQWEsR0FBRywyQkFBMkIsQ0FBQyxhQUFhLENBQUE7Ozs7O0FDeEhwRSx3Q0FBNEM7QUFDNUMsdUNBQXFEO0FBRXJELE1BQWEsY0FBZSxTQUFRLGlCQUFPO0lBRXZDLFlBQVksT0FBc0I7UUFDOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2xCLENBQUM7Q0FFSjtBQU5ELHdDQU1DO0FBRUQsTUFBYSx1QkFBd0IsU0FBUSwwQkFBZ0I7SUFJakQsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUE7SUFHNUIsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFL0MsTUFBTSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFcEQsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyw0QkFBNEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzdELElBQUksSUFBSSxlQUFlLElBQUksQ0FBQyxNQUFNLDZCQUE2QixJQUFJLENBQUMscUJBQXFCLGFBQWEsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ2xILElBQUksSUFBSSx1QkFBdUIsSUFBSSxDQUFDLGNBQWMsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLGlCQUFpQixJQUFJLENBQUMsU0FBUyxrQkFBa0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ2pKLElBQUksSUFBSSxpQ0FBaUMsSUFBSSxDQUFDLHdCQUF3QiwyQkFBMkIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7UUFDM0gsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsSUFBSSxxQkFBcUI7UUFDckIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDckQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsSUFBSSxNQUFNLENBQUMsTUFBcUI7UUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUVELElBQVcsY0FBYztRQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFFRCxJQUFXLFFBQVE7UUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUN6RCxDQUFDO0lBRUQsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3JELENBQUM7SUFFRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDcEQsQ0FBQztJQUVELElBQVcsd0JBQXdCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyx5QkFBZSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDckUsQ0FBQztJQUdELElBQVcsbUJBQW1CO1FBQzFCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyx5QkFBZSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDckUsQ0FBQztDQUVKO0FBcEVELDBEQW9FQzs7Ozs7QUMvRUQscURBS3lCO0FBQ3pCLDhEQUEwRDtBQUMxRCx5Q0FBeUQ7QUFDekQsbURBQStDO0FBQy9DLGtEQUE4QztBQUM5Qyx3Q0FBd0M7QUFDeEMscUNBQXlFO0FBR3pFLE1BQWEsT0FBUSxTQUFRLG1CQUFRO0lBRTFCLE1BQU0sQ0FBVSxvQkFBb0IsR0FBVyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDaEUsTUFBTSxDQUFVLG1CQUFtQixHQUFXLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUd0RSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUlyQixNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUczQixLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUd4QyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUc3QyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQU1sRCxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVoRCxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBR3hELE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUduRCxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUcvQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUdqRCxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUdoRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUdsRCxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUlsRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUlsRCxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUd2RCxtQkFBbUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBRy9ELGNBQWMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLHFCQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFHOUQsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUk3RCxxQkFBcUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLHFCQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFLcEUsYUFBYSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUcvRCxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUdwRCxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMscUJBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQVV0RCxpQkFBaUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUVqRCxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxrQkFBa0I7UUFDbEIsT0FBTyxxQkFBVyxDQUFBO0lBQ3RCLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7SUFDMUUsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQTtJQUM1SCxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLFdBQVcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksa0JBQWtCLElBQUksQ0FBQyxRQUFRLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzdELElBQUksSUFBSSwyQkFBMkIsSUFBSSxDQUFDLGlCQUFpQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUNySSxJQUFJLElBQUksZUFBZSxJQUFJLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLElBQUksQ0FBQyxVQUFVLGVBQWUsSUFBSSxDQUFDLFNBQVMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUE7UUFDckssSUFBSSxJQUFJLHNCQUFzQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7UUFFbEQsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDN0MsSUFBSSxJQUFJLGtCQUFrQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDekMsSUFBSSxJQUFJLG1CQUFtQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDM0MsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDN0MsSUFBSSxJQUFJLG1CQUFtQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDM0MsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDN0MsSUFBSSxJQUFJLHdCQUF3QixJQUFJLENBQUMsY0FBYyx3QkFBd0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDcEcsSUFBSSxJQUFJLHVCQUF1QixJQUFJLENBQUMsYUFBYSx1QkFBdUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7UUFDaEcsSUFBSSxJQUFJLDhCQUE4QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtRQUNqRSxJQUFJLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDNUIsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDL0IsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixJQUFJO1lBQ0EsT0FBTyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO1NBQ2xEO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLE9BQU8sQ0FBQTtTQUNqQjtJQUNMLENBQUM7SUFFRCxJQUFJLGlCQUFpQjtRQUNqQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM1QyxDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sTUFBTSxRQUFRLEdBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDMUQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLHlCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDBCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ2pHLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDekMsQ0FBQztJQUVELGVBQWUsQ0FBQyxLQUE4QjtRQUMxQyxNQUFNLE1BQU0sR0FBVyxLQUFLLFlBQVkseUJBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO1FBQzVFLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUNyRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcseUJBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNwRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNsRCxPQUFPLDZCQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ3pDLENBQUM7SUFFRCxZQUFZO1FBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsWUFBWSxDQUFDLE1BQWM7UUFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3pDLElBQUksU0FBUyxDQUFDLEdBQUcsSUFBSSxNQUFNO2dCQUFFLE9BQU8sQ0FBQyxDQUFBO1NBQ3hDO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQTtJQUNiLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdkMsQ0FBQztJQUdELFVBQVU7UUFDTixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFBO0lBQ3BDLENBQUM7SUFHRCxTQUFTLENBQUMsR0FBMEI7UUFDaEMsTUFBTSxJQUFJLEdBQVcsR0FBRyxZQUFZLHVCQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtRQUNsRSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUE7UUFDL0UsT0FBTyxJQUFJLDBCQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLDBCQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0lBRUQsaUJBQWlCLENBQUMsUUFBK0I7UUFDN0MsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFBO0lBQzVFLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDeEMsQ0FBQztJQUdELFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFBO0lBQ3JDLENBQUM7SUFHRCxVQUFVLENBQUMsR0FBVztRQUNsQixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUN0RixPQUFPLElBQUksMkJBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsMkJBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0lBQzNFLENBQUM7SUFHRCxtQkFBbUIsQ0FBQyxRQUFxQztRQUNyRCxPQUFPLElBQUksd0NBQXVCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2hKLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDeEMsQ0FBQztJQUdELFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFBO0lBQ3JDLENBQUM7SUFHRCxVQUFVLENBQUMsR0FBMEI7UUFDakMsTUFBTSxJQUFJLEdBQVcsR0FBRyxZQUFZLHVCQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtRQUNsRSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUN4RixPQUFPLElBQUksMkJBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsMkJBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0lBQzVFLENBQUM7SUFHRCxTQUFTLENBQUMsU0FBZ0M7UUFDdEMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFBO0lBQzFFLENBQUM7SUFHRCx1QkFBdUIsQ0FBQyxRQUFvQjtRQUN4QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtJQUM3RCxDQUFDO0lBR0Qsa0JBQWtCLENBQUMsUUFBb0I7UUFDbkMsT0FBTyxJQUFJLDRCQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7SUFDeEUsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0lBR0QsV0FBVyxDQUFDLEdBQVc7UUFDbkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUE7UUFDdkYsT0FBTyxJQUFJLDRCQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLDRCQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3pDLENBQUM7SUFHRCxXQUFXLENBQUMsR0FBVztRQUNuQixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUN2RixPQUFPLElBQUksNEJBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsNEJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0lBQzlFLENBQUM7SUFHRCxrQkFBa0IsQ0FBQyxTQUErQjtRQUM5QyxNQUFNLFNBQVMsR0FBRyxTQUFTLFlBQVksNEJBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtRQUMxRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsNEJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNoRixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3JELE9BQU8sZUFBZSxDQUFDLEdBQUcsQ0FBQTtJQUM5QixDQUFDO0lBR0QsWUFBWSxDQUFDLFFBQXNCO1FBQy9CLE9BQU8sSUFBSSw0QkFBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsNEJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0lBQ3pILENBQUM7SUFHRCx1QkFBdUIsQ0FBQyxTQUFzQjtRQUMxQyxPQUFPLElBQUksNENBQTJCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7SUFDMUYsQ0FBQztJQUdELHFCQUFxQixDQUFDLFFBQXFDO1FBQ3ZELE9BQU8sSUFBSSxxQ0FBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFBO0lBQ3hGLENBQUM7SUFHRCxZQUFZO1FBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQTtJQUN0QyxDQUFDO0lBR0QsaUJBQWlCLENBQUMsU0FBc0I7UUFDcEMsT0FBTyxJQUFJLDRCQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7SUFDekUsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsSUFBSSxrQkFBa0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDN0MsQ0FBQztJQUdELGdCQUFnQjtRQUNaLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFBO0lBQ2xDLENBQUM7SUFHRCxlQUFlLENBQUMsR0FBVztRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0I7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUE7UUFDbkYsT0FBTyxJQUFJLG9DQUFtQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxvQ0FBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0lBQ2xHLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDNUMsQ0FBQztJQUVELElBQUksaUJBQWlCO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzVDLENBQUM7SUFHRCxjQUFjO1FBQ1YsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7SUFDakMsQ0FBQztJQUdELGFBQWEsQ0FBQyxHQUFXO1FBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGlCQUFpQjtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUNsRixPQUFPLElBQUksa0NBQWlCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLGtDQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7SUFDN0YsQ0FBQztJQUVELElBQUksb0JBQW9CO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ25ELENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDWixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDNUMsT0FBTyxJQUFJLHVCQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDeEMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksU0FBUyxDQUFBO1lBRTVDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7U0FDN0M7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE9BQU8sS0FBSyxDQUFBO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDL0MsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUE7SUFDM0YsQ0FBQztJQUVELElBQUksQ0FBQyxRQUFpQixFQUFFLElBQWE7UUFDakMsSUFBSSxXQUFXLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUN2QyxXQUFXLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3JFLElBQUksU0FBUyxHQUFHLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUE7UUFDOUYsSUFBSSxTQUFTLEdBQUcsSUFBSSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtRQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDM0QsSUFBSSxDQUFDLGlCQUFpQixTQUFTLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBSUQsWUFBWSxDQUFDLFVBQWtCLEVBQUUsaUJBQTBCLElBQUk7UUFDM0QsT0FBTyxxQkFBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQ2pDLG1DQUFtQyxFQUFFLGVBQWUsRUFDcEQsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUNqQyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBQ2pGLENBQUM7SUFJRCxpQkFBaUI7UUFDYixPQUFPLE9BQU8sQ0FDVix1Q0FBdUMsRUFBRSxlQUFlLEVBQ3hELFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUlELFVBQVU7UUFDTixPQUFPLE9BQU8sQ0FDVixnQ0FBZ0MsRUFBRSxlQUFlLEVBQ2pELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUlELFlBQVk7UUFDUixPQUFPLE9BQU8sQ0FDVixrQ0FBa0MsRUFBRSxlQUFlLEVBQ25ELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUlELFdBQVc7UUFDUCxPQUFPLE9BQU8sQ0FDVixpQ0FBaUMsRUFBRSxlQUFlLEVBQ2xELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUlELFVBQVUsQ0FBQyxRQUFzQjtRQUM3QixPQUFPLE9BQU8sQ0FDVixpREFBaUQsRUFBRSxlQUFlLEVBQ2xFLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUlELE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBcUIsRUFBRSxVQUFrQixFQUFFLE9BQWU7UUFDekUsT0FBTyxPQUFPLENBQ1YsbURBQW1ELEVBQUUsZUFBZSxFQUNwRSxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUNwQyxTQUFTLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBSUQsYUFBYSxDQUFDLE1BQWM7UUFDeEIsT0FBTyxJQUFJLDRCQUFXLENBQUMsT0FBTyxDQUMxQixvQ0FBb0MsRUFBRSxlQUFlLEVBQ3JELFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBSUQsYUFBYSxDQUFDLFFBQXNCO1FBQ2hDLE9BQU8sT0FBTyxDQUNWLG1EQUFtRCxFQUFFLGVBQWUsRUFDcEUsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUNqQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBSUQsa0JBQWtCLENBQUMsU0FBc0IsRUFBRSxVQUFrQjtRQUN6RCxPQUFPLE9BQU8sQ0FDViwyREFBMkQsRUFBRSxlQUFlLEVBQzVFLFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLEVBQ3hDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUNsRCxDQUFDOztBQTFkTCwwQkE0ZEM7QUFFRCxNQUFhLGdCQUFpQixTQUFRLG1CQUFRO0lBRTFDLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7Q0FFSjtBQU5ELDRDQU1DO0FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBOzs7OztBQ2hmM0MseUNBQXdFO0FBQ3hFLG1EQUFzRDtBQUN0RCx3Q0FBd0M7QUFFeEMsTUFBYSxXQUFZLFNBQVEsMEJBQWU7SUFHcEMsU0FBUyxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFBO0lBRTlDLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsWUFBWSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDN0MsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLElBQUksSUFBSSxrQkFBa0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3pDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSx1QkFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQVcsR0FBVyxxQkFBVyxDQUFBOztBQXBCNUMsa0NBc0JDO0FBRUQsTUFBYSxXQUFZLFNBQVEsMEJBQWU7SUFHcEMsS0FBSyxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFBO0lBRWxDLEtBQUssR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFbEQsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxZQUFZLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUM3QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLGNBQWMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ2pDLElBQUksSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNqQyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDL0IsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLElBQUksSUFBSSxHQUFrQixFQUFFLENBQUE7UUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUMxRTtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztDQUVKO0FBL0JELGtDQStCQztBQUVELE1BQWEsVUFBVyxTQUFRLDBCQUFlO0lBR25DLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBRS9CLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksdUJBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDM0MsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxXQUFXLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUM1QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLGtCQUFrQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDekMsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0NBRUo7QUFwQkQsZ0NBb0JDO0FBR0QsTUFBYSxXQUFZLFNBQVEsMEJBQWU7SUFHcEMsVUFBVSxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFBO0lBRXZDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyx1QkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRXJELGFBQWEsR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFbEQsZUFBZSxHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUU1RCxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsdUJBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUUxRCxlQUFlLEdBQWtCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXBELGdCQUFnQixHQUFrQixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUvRCxnQkFBZ0IsR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyx5QkFBYyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRXZGLGVBQWUsR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUvRCxrQkFBa0IsR0FBa0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFekUsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxZQUFZLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUM3QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLG1CQUFtQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDM0MsSUFBSSxJQUFJLHNCQUFzQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDakQsSUFBSSxJQUFJLHdCQUF3QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7UUFDckQsSUFBSSxJQUFJLHdCQUF3QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7UUFDckQsSUFBSSxJQUFJLHlCQUF5QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDdkQsSUFBSSxJQUFJLHlCQUF5QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDdkQsSUFBSSxJQUFJLHdCQUF3QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7UUFDckQsSUFBSSxJQUFJLDJCQUEyQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtRQUMzRCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxNQUFNLEtBQUssV0FBVztRQUNsQixPQUFPLHVCQUFZLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsdUJBQVksQ0FBQyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyx5QkFBYyxDQUFDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNySSxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLHVCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDWixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDdkMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSx1QkFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUMzRCxDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3pDLENBQUM7SUFFRCxJQUFJLGVBQWU7UUFDZixPQUFPLElBQUkseUJBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM5RCxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSSxpQkFBaUI7UUFDakIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUMsQ0FBQztDQUVKO0FBN0VELGtDQTZFQztBQUVELE1BQWEsV0FBWSxTQUFRLDBCQUFlO0lBR3BDLGdCQUFnQixHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFBO0lBRXJELFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxJQUFJLGVBQWU7UUFDZixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMxQyxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLFlBQVksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzdDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUkseUJBQXlCLElBQUksQ0FBQyxlQUFlLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFBO1FBQ3ZGLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztDQUVKO0FBcEJELGtDQW9CQztBQUVELE1BQWEsU0FBVSxTQUFRLDBCQUFlO0lBR2xDLGVBQWUsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUVwRCxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2QsT0FBTyxJQUFJLHlCQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsVUFBVSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDM0MsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLElBQUksSUFBSSx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JELE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELE1BQU0sS0FBSyxXQUFXO1FBQ2xCLE9BQU8sR0FBRyxDQUFBO0lBQ2QsQ0FBQztDQUVKO0FBeEJELDhCQXdCQztBQUVELE1BQWEsVUFBVyxTQUFRLDBCQUFlO0lBR25DLFVBQVUsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUV2QyxTQUFTLEdBQWtCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLHVCQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7SUFFeEUsU0FBUyxHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx1QkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRS9FLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksdUJBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDdEQsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSx1QkFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLHlCQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFFRCxNQUFNLEtBQUssV0FBVztRQUNsQixPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO0lBQzFCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsV0FBVyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDNUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLElBQUksSUFBSSxtQkFBbUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzNDLElBQUksSUFBSSxrQkFBa0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3pDLElBQUksSUFBSSxrQkFBa0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3pDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztDQUVKO0FBdENELGdDQXNDQztBQUVELE1BQWEsVUFBVyxTQUFRLDBCQUFlO0lBR25DLFdBQVcsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUV4QyxnQkFBZ0IsR0FBa0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMseUJBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUVsRixJQUFJLEdBQWtCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFcEQsZUFBZSxHQUFrQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUzRCxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLHlCQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3pELENBQUM7SUFFRCxJQUFJLGVBQWU7UUFDZixPQUFPLElBQUksdUJBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM1RCxDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3pDLENBQUM7SUFFRCxNQUFNLEtBQUssV0FBVztRQUNsQixPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoQyxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLFdBQVcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksb0JBQW9CLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUM3QyxJQUFJLElBQUkseUJBQXlCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUN2RCxJQUFJLElBQUksd0JBQXdCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUNyRCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FFSjtBQXhDRCxnQ0F3Q0M7QUFFRCxNQUFhLFdBQVksU0FBUSwwQkFBZTtJQUdwQyxVQUFVLEdBQWtCLElBQUksQ0FBQyxNQUFNLENBQUE7SUFFdkMsVUFBVSxHQUFrQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyx1QkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRXpFLFNBQVMsR0FBa0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsd0JBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUVqRixZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLHVCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksd0JBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDdkQsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSx5QkFBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUN2RCxDQUFDO0lBRUQsTUFBTSxLQUFLLFdBQVc7UUFDbEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUMxQixDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLFlBQVksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzdDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksbUJBQW1CLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUMzQyxJQUFJLElBQUksbUJBQW1CLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUMzQyxJQUFJLElBQUksa0JBQWtCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUN6QyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FFSjtBQXRDRCxrQ0FzQ0M7QUFFRCxNQUFhLGlCQUFrQixTQUFRLDBCQUFlO0lBRzFDLFNBQVMsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUU5QyxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFFRCxNQUFNLEtBQUssV0FBVztRQUNsQixPQUFPLEdBQUcsQ0FBQTtJQUNkLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsa0JBQWtCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUNuRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLGtCQUFrQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDekMsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0NBRUo7QUF4QkQsOENBd0JDO0FBRUQsTUFBYSxtQkFBb0IsU0FBUSwwQkFBZTtJQUc1QyxtQkFBbUIsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUVoRCxVQUFVLEdBQWtCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFN0Qsb0JBQW9CLEdBQWtCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTlELFVBQVUsR0FBa0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUV0RSxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxrQkFBa0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDN0MsQ0FBQztJQUVELElBQUksbUJBQW1CO1FBQ25CLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzlDLENBQUM7SUFFRCxNQUFNLEtBQUssV0FBVztRQUNsQixPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoQyxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLG9CQUFvQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDckQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLElBQUksSUFBSSw0QkFBNEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDN0QsSUFBSSxJQUFJLDZCQUE2QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtRQUMvRCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FFSjtBQW5DRCxrREFtQ0M7QUFFRCxNQUFhLDJCQUE0QixTQUFRLDBCQUFlO0lBR3JELHNCQUFzQixHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFBO0lBRWxELFlBQVksR0FBa0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUVsRSxhQUFhLEdBQWtCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXpELGdCQUFnQixHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUVyRSxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxxQkFBcUI7UUFDckIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDaEQsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ1osT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3ZDLENBQUM7SUFFRCxJQUFJLGVBQWU7UUFDZixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMxQyxDQUFDO0lBRUQsTUFBTSxLQUFLLFdBQVc7UUFDbEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEMsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyw0QkFBNEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzdELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksK0JBQStCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO1FBQ25FLElBQUksSUFBSSxxQkFBcUIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQy9DLElBQUksSUFBSSxzQkFBc0IsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ2pELElBQUksSUFBSSx5QkFBeUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0lBQzNELENBQUM7Q0FFSjtBQTVDRCxrRUE0Q0M7QUFFRCxNQUFhLGlCQUFrQixTQUFRLDBCQUFlO0lBR2xELFdBQVcsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUV4QyxXQUFXLEdBQWtCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXRELFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDcEMsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsTUFBTSxLQUFLLFdBQVc7UUFDbEIsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFBO0lBQ3BCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsa0JBQWtCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUNuRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDN0MsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDN0MsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0NBRUo7QUEvQkQsOENBK0JDO0FBRUQsTUFBYSxvQkFBcUIsU0FBUSwwQkFBZTtJQUc3QyxLQUFLLEdBQWtCLElBQUksQ0FBQyxNQUFNLENBQUE7SUFFbEMsUUFBUSxHQUFrQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUUvRSxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQy9CLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDUCxJQUFJLE9BQU8sR0FBYSxFQUFFLENBQUE7UUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtTQUNyRDtRQUNELE9BQU8sT0FBTyxDQUFBO0lBQ2xCLENBQUM7SUFFRCxNQUFNLEtBQUssV0FBVztRQUNsQixPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDcEIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQ3RELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksY0FBYyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDakMsSUFBSSxJQUFJLGlCQUFpQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDdkMsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0NBRUo7QUFuQ0Qsb0RBbUNDO0FBRUQsTUFBYSx1QkFBd0IsU0FBUSwwQkFBZTtJQUdoRCxVQUFVLEdBQWtCLElBQUksQ0FBQyxNQUFNLENBQUE7SUFFdkMsZ0JBQWdCLEdBQWtCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRWxFLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDcEMsQ0FBQztJQUVELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzFDLENBQUM7SUFFRCxNQUFNLEtBQUssV0FBVztRQUNsQixPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDcEIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyx3QkFBd0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQ3pELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksbUJBQW1CLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUMzQyxJQUFJLElBQUkseUJBQXlCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUN2RCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FFSjtBQS9CRCwwREErQkM7QUFFRCxNQUFhLFlBQVk7SUFFYixNQUFNLEdBQWtCLElBQUksQ0FBQTtJQUM1QixLQUFLLEdBQWtCLElBQUksQ0FBQTtJQUMzQixLQUFLLEdBQWtCLElBQUksQ0FBQTtJQUVuQyxZQUFvQixNQUFxQjtRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFxQjtRQUM3QixPQUFPLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDckIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUM5QixDQUFDO0lBRUQsSUFBSSxHQUFHO1FBQ0gsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQTtTQUNsQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxFQUFFLENBQUE7U0FDWjtJQUNMLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNuRCxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUV6RCxDQUFDO0lBT0QsSUFBSSxDQUFDLFFBQWdCLEtBQUs7UUFDdEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUM1QztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLENBQUMsa0NBQWtDLEtBQUssWUFBWSxNQUFNLEdBQUcsUUFBUSxLQUFLLENBQUMsQ0FBQTtRQUMvRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QixJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQzVDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksQ0FBQyxrQ0FBa0MsS0FBSyxZQUFZLE1BQU0sR0FBRyxRQUFRLEtBQUssQ0FBQyxDQUFBO0lBQ25GLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxJQUFtQjtRQUN2QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUE7UUFDbEIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQzdCLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRXhCLElBQUksTUFBTSxHQUFHLElBQUksRUFBRTtZQUNmLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtZQUMxQixPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUN4QixNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtZQUU5QyxJQUFJLEdBQUcsR0FBRyxJQUFJLEVBQUU7Z0JBQ1osR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtnQkFDdEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3hCLE1BQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7Z0JBRTVCLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtvQkFDWixHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFBO29CQUN0QixPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtvQkFDeEIsTUFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtvQkFFNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxFQUFFO3dCQUNaLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7d0JBQ3RCLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO3dCQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQTtxQkFDdEI7aUJBQ0o7YUFDSjtTQUNKO1FBQ0QsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFBO0lBQy9DLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxJQUFtQjtRQUN2QyxNQUFNLHlCQUF5QixHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtRQUMxRyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEUsTUFBTSxJQUFJLEdBQVcseUJBQXlCLENBQUMsT0FBTyxDQUFXLENBQUE7UUFDakUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUE7SUFDckQsQ0FBQztJQUVPLE1BQU0sQ0FBQyxFQUFFLEdBQVksSUFBSSxDQUFBO0lBR2pDLElBQWMsR0FBRztRQUNiLElBQUksWUFBWSxDQUFDLEVBQUUsSUFBSSxJQUFJLEVBQUU7WUFDekIsWUFBWSxDQUFDLEVBQUUsR0FBRyxJQUFJLE9BQU8sQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQXlCakMsQ0FBQyxDQUFBO1NBQ0Q7UUFDRCxPQUFPLFlBQVksQ0FBQyxFQUFFLENBQUE7SUFDMUIsQ0FBQzs7QUFqSUwsb0NBbUlDO0FBS0QsVUFBVSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDcEMsVUFBVSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDcEMsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDaEMsVUFBVSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDbEMsVUFBVSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDbEMsVUFBVSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7Ozs7O0FDbHJCcEMseURBQXFEO0FBRXJELE1BQWEsUUFBUyxTQUFRLHlCQUFXO0lBRXJDLFlBQVksTUFBOEI7UUFDdEMsTUFBTSxZQUFZLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDeEUsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLFlBQVksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO0lBQ3JDLENBQUM7Q0FFSjtBQVZELDRCQVVDO0FBRUQsTUFBYSxZQUFhLFNBQVEsUUFBUTtJQUV0QyxJQUFJLEtBQUs7UUFDTCxPQUFRLElBQUksQ0FBQyxRQUFRLEVBQW9CLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDdkQsQ0FBQztJQUVELE1BQU0sS0FBSyxXQUFXO1FBQ2xCLE9BQU8sQ0FBQyxDQUFBO0lBQ1osQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLGFBQWEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFBO0lBQ3JDLENBQUM7Q0FFSjtBQWRELG9DQWNDO0FBRUQsTUFBYSxhQUFjLFNBQVEsUUFBUTtJQUV2QyxJQUFJLEtBQUs7UUFDTCxPQUFRLElBQUksQ0FBQyxRQUFRLEVBQW9CLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDdkQsQ0FBQztJQUVELE1BQU0sS0FBSyxXQUFXO1FBQ2xCLE9BQU8sQ0FBQyxDQUFBO0lBQ1osQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLGNBQWMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFBO0lBQ3RDLENBQUM7Q0FFSjtBQWRELHNDQWNDO0FBRUQsTUFBYSxjQUFlLFNBQVEsUUFBUTtJQUV4QyxJQUFJLEtBQUs7UUFDTCxPQUFRLElBQUksQ0FBQyxRQUFRLEVBQW9CLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDdkQsQ0FBQztJQUVELE1BQU0sS0FBSyxXQUFXO1FBQ2xCLE9BQU8sQ0FBQyxDQUFBO0lBQ1osQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLGVBQWUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFBO0lBQ3ZDLENBQUM7Q0FFSjtBQWRELHdDQWNDOzs7OztBQ2pDRCxtREFBK0M7QUFFL0MsTUFBYSxTQUFVLFNBQVEsbUJBQVE7SUFHbkMsTUFBTSxHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFBO0lBRTFDLFNBQVMsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBRW5ELFVBQVUsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFbkQsVUFBVSxHQUFrQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBRWhGLFlBQVksR0FBa0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFdEQsV0FBVyxHQUFrQixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUV2RCxVQUFVLEdBQWtCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXJELFNBQVMsR0FBa0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFbkQsUUFBUSxHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUVqRCxnQkFBZ0IsR0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFeEQsZUFBZSxHQUFrQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRS9ELGNBQWMsR0FBa0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFN0QsYUFBYSxHQUFrQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUzRCxlQUFlLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTVELGNBQWMsR0FBa0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFN0QsZUFBZSxHQUFrQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUU3RCxjQUFjLEdBQWtCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTdELGdCQUFnQixHQUFrQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUU5RCxlQUFlLEdBQWtCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFL0QsZ0JBQWdCLEdBQWtCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRS9ELGVBQWUsR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUvRCxVQUFVLEdBQWtCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXpELFNBQVMsR0FBa0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFbkQsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELE1BQU0sS0FBSyxhQUFhO1FBQ3BCLE9BQU8sQ0FBQyxDQUFBO0lBQ1osQ0FBQztJQUVELE1BQU0sS0FBSyxjQUFjO1FBQ3JCLE9BQU8sQ0FBQyxDQUFBO0lBQ1osQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU8sRUFBRSxDQUFBO0lBQ2IsQ0FBQztJQUVELE1BQU0sS0FBSyxvQ0FBb0M7UUFDM0MsT0FBTyxFQUFFLENBQUE7SUFDYixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBRVgsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsUUFBUTtRQUNKLE1BQU0sSUFBSSxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDNUUsTUFBTSxPQUFPLEdBQVcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVILE1BQU0sSUFBSSxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUMxRyxNQUFNLE9BQU8sR0FBVyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDNUgsSUFBSSxJQUFJLEdBQVcsYUFBYSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUE7UUFDOUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLElBQUksSUFBSSxlQUFlLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxPQUFPLE1BQU0sT0FBTyxFQUFFLENBQUE7UUFDL0UsSUFBSSxJQUFJLGtCQUFrQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDekMsSUFBSSxJQUFJLG1CQUFtQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDM0MsSUFBSSxJQUFJLG1CQUFtQixJQUFJLENBQUMsU0FBUyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQTtRQUNwRSxJQUFJLElBQUkscUJBQXFCLElBQUksQ0FBQyxXQUFXLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFBO1FBQzFFLElBQUksSUFBSSxvQkFBb0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzdDLElBQUksSUFBSSxtQkFBbUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzNDLElBQUksSUFBSSxrQkFBa0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3pDLElBQUksSUFBSSxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3ZDLElBQUksSUFBSSx5QkFBeUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQ3ZELElBQUksSUFBSSx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JELElBQUksSUFBSSx1QkFBdUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ25ELElBQUksSUFBSSxzQkFBc0IsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ2pELElBQUksSUFBSSx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JELElBQUksSUFBSSx1QkFBdUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ25ELElBQUksSUFBSSx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JELElBQUksSUFBSSx1QkFBdUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ25ELElBQUksSUFBSSx5QkFBeUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQ3ZELElBQUksSUFBSSx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JELElBQUksSUFBSSx5QkFBeUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQ3ZELElBQUksSUFBSSx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JELElBQUksSUFBSSxtQkFBbUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzNDLElBQUksSUFBSSxrQkFBa0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3pDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELFVBQVU7UUFDTixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM3RCxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDdEMsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNyQyxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3hDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDWixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFFRCxJQUFJLGNBQWM7UUFDZCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDekMsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztDQUVKO0FBM01ELDhCQTJNQztBQUdELE1BQWEsZ0JBQWlCLFNBQVEsU0FBUztJQUduQyxjQUFjLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBSTNELHVCQUF1QixHQUFrQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUlyRSxnQ0FBZ0MsR0FBa0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUl2RixnQkFBZ0IsR0FBa0IsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUloRixpQkFBaUIsR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUVqRSxlQUFlLEdBQWtCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFeEUsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ3JELENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDM0UsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDbkMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUE7UUFDdEQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQ3JDLElBQUksSUFBSSx1QkFBdUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ25ELElBQUksSUFBSSxnQ0FBZ0MsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUE7UUFDckUsSUFBSSxJQUFJLHlDQUF5QyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQTtRQUN2RixJQUFJLElBQUkseUJBQXlCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUN2RCxJQUFJLElBQUksMEJBQTBCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1FBQ3pELElBQUksSUFBSSx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JELE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN4QyxDQUFDO0lBRUQsSUFBSSxzQkFBc0I7UUFDdEIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDakQsQ0FBQztJQUVELElBQUksK0JBQStCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzFELENBQUM7SUFFRCxJQUFJLGVBQWU7UUFDZixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMxQyxDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDM0MsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0NBRUo7QUF4RUQsNENBd0VDO0FBTUQsTUFBYSxpQkFBa0IsU0FBUSxTQUFTO0lBRTVDLFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ25DLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO1FBQ3ZELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FFSjtBQWJELDhDQWFDOzs7OztBQ3RVRCx1Q0FBcUQ7QUFFckQsTUFBYSxlQUFnQixTQUFRLGlCQUFPO0lBRXhDLFlBQVksT0FBc0I7UUFDOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2xCLENBQUM7Q0FFSjtBQU5ELDBDQU1DO0FBRUQsTUFBYSx3QkFBeUIsU0FBUSwwQkFBZ0I7SUFHMUQsZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUE7SUFFcEMsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUUzQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBRTVDLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFN0MsZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVqRCx5QkFBeUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVyRSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFbEQsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyw2QkFBNkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQzlELElBQUksSUFBSSx1QkFBdUIsSUFBSSxDQUFDLGNBQWMsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLGlCQUFpQixJQUFJLENBQUMsU0FBUyxrQkFBa0IsSUFBSSxDQUFDLFVBQVUsc0JBQXNCLElBQUksQ0FBQyxjQUFjLGdDQUFnQyxJQUFJLENBQUMsd0JBQXdCLGFBQWEsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzlRLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFFRCxJQUFJLGNBQWM7UUFDZCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDekMsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNuQyxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDckMsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSSx3QkFBd0I7UUFDeEIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDbkQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUN0QixDQUFDO0lBRUQsSUFBSSxjQUFjLENBQUMsY0FBc0I7UUFDckMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLFFBQWdCO1FBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3JDLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxTQUFpQjtRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0lBRUQsSUFBSSxVQUFVLENBQUMsVUFBa0I7UUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDekMsQ0FBQztJQUVELElBQUksY0FBYyxDQUFDLGNBQXNCO1FBQ3JDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFFRCxJQUFJLHdCQUF3QixDQUFDLHdCQUFnQztRQUN6RCxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUE7SUFDckUsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLEtBQW9CO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO0lBQ3ZCLENBQUM7Q0FDSjtBQXRGRCw0REFzRkM7Ozs7QUNoR0QseUNBQXNDO0FBQ3RDLHVDQUFvQztBQUNwQyxrQ0FBK0I7QUFDL0IsNkJBQTBCO0FBQzFCLDRCQUF5QjtBQUN6Qiw0QkFBeUI7QUFDekIsc0JBQW1CO0FBQ25CLHFCQUFrQjtBQUNsQixvQkFBaUI7Ozs7QUNSakIseUJBQXNCO0FBQ3RCLHFCQUFrQjtBQUNsQixvQkFBaUI7QUFDakIseUJBQXNCO0FBQ3RCLGtDQUErQjtBQUMvQixrQ0FBK0I7QUFDL0Isb0JBQWlCO0FBQ2pCLG9CQUFpQjtBQUNqQix5QkFBc0I7QUFFdEIsNkJBQTBCO0FBQzFCLGlDQUE4QjtBQUM5Qiw0QkFBeUI7QUFDekIseUJBQXNCO0FBQ3RCLDZCQUEwQjtBQUMxQixrQ0FBK0I7QUFDL0IscUNBQWtDO0FBQ2xDLDBCQUF1Qjs7Ozs7QUNqQnZCLG1EQUFzRDtBQUN0RCxnREFBNEM7QUFDNUMsd0NBQXdDO0FBQ3hDLDJDQUF1QztBQUN2QyxzQ0FBcUM7QUFDckMsMEVBQXNFO0FBRXRFLE1BQWEsaUJBQWtCLFNBQVEsMEJBQWU7SUFHMUMsS0FBSyxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFBO0lBRWxDLFNBQVMsR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRXRELGFBQWEsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRTlELGdCQUFnQixHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFckUsMEJBQTBCLEdBQWtCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFBO0lBRWxGLE9BQU8sR0FBa0IsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLENBQUE7SUFFakYsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxrQkFBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTywyQ0FBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQ3JFLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDWixPQUFPLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDNUQsQ0FBQztJQUdELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxlQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDMUQsQ0FBQztJQUVELElBQUkseUJBQXlCO1FBQ3pCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNyRCxDQUFDO0lBR0QsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO1FBQ3RELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksYUFBYSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUNoRSxJQUFJLElBQUksa0JBQWtCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzdFLElBQUksSUFBSSxzQkFBc0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDekYsSUFBSSxJQUFJLHdCQUF3QixJQUFJLENBQUMsZUFBZSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1FBQ2xGLElBQUksSUFBSSxrQ0FBa0MsSUFBSSxDQUFDLHlCQUF5QixPQUFPLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFBO1FBQ2hILElBQUksSUFBSSxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDdkUsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0NBRUo7QUF6REQsOENBeURDOzs7O0FDaEVELCtCQUE0Qjs7Ozs7QUNBNUIsa0ZBQThFO0FBQzlFLDhEQUEwRDtBQUMxRCwrQ0FBOEM7QUFDOUMsK0NBQThDO0FBQzlDLHlDQUFxQztBQUNyQyx5Q0FBcUM7QUFDckMsdUNBQW1DO0FBRW5DLE1BQWEsUUFBUyxTQUFRLGtCQUFTO0lBRW5DLGNBQWMsR0FBWSxLQUFLLENBQUE7SUFHL0IsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUE7SUFFbEMsZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFNUQsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFekQsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFbkQsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFakQsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFN0MsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFakQsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFHbkQsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFL0MsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRWpDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUVqQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFdEMsWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTFDLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUV4QyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUU3QyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXBELFlBQVksTUFBcUI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDakgsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtJQUMxRSxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxHQUFXLGFBQWEsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFBO1FBQy9DLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksc0JBQXNCLElBQUksQ0FBQyxZQUFZLHVCQUF1QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUN2RyxJQUFJLElBQUksd0JBQXdCLElBQUksQ0FBQyxjQUFjLGlCQUFpQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUN2RyxJQUFJLElBQUksbUJBQW1CLElBQUksQ0FBQyxTQUFTLGtCQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUN6RixJQUFJLElBQUksa0JBQWtCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUN6QyxJQUFJLElBQUksaUJBQWlCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN2QyxJQUFJLElBQUksY0FBYyxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNyRCxJQUFJLElBQUkscUJBQXFCLElBQUksQ0FBQyxXQUFXLGlCQUFpQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUM5RixJQUFJLElBQUksZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUNyQyxJQUFJLElBQUksaUJBQWlCLElBQUksQ0FBQyxPQUFPLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFBO1FBQzlELElBQUksSUFBSSxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUE7UUFDOUQsSUFBSSxJQUFJLGlCQUFpQixJQUFJLENBQUMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQTtRQUM5RCxJQUFJLElBQUksc0JBQXNCLElBQUksQ0FBQyxZQUFZLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7UUFDaEYsSUFBSSxJQUFJLHFCQUFxQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDL0MsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDN0MsSUFBSSxJQUFJLDBCQUEwQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtRQUN6RCxJQUFJLElBQUksMkJBQTJCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQzNELE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE9BQU8sSUFBSSw2QkFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLDRCQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ3hGLENBQUM7SUFFRCxJQUFJLGNBQWM7UUFDZCxPQUFPLElBQUksNkJBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ3BGLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksNkJBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxtQkFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUMvRSxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLDZCQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksbUJBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDOUUsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sSUFBSSw2QkFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGlCQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzVFLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksNkJBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMzRSxDQUFDO0lBRU8sUUFBUTtRQUNaLE9BQU8scUJBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDaEQsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSw2QkFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDakYsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSw2QkFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDakYsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBQzdDLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDN0MsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN2QyxDQUFDO0lBRUQsSUFBSSxtQkFBbUI7UUFDbkIsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDL0MsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3JDLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNoQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMzQyxDQUFDO0lBRUQsSUFBSSxpQkFBaUI7UUFDakIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUMsQ0FBQztDQUdKO0FBakpELDRCQWlKQztBQU1ELFVBQVUsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBOzs7OztBQzlKOUIsd0ZBQW9GO0FBSXBGLGtFQUE4RDtBQUM5RCw4REFBNkQ7QUFDN0QsOERBQTBEO0FBQzFELG9EQUFzRDtBQUN0RCxtREFBK0M7QUFHL0Msd0NBQXdDO0FBQ3hDLHlDQUFxQztBQUNyQyx5Q0FBcUM7QUFDckMsc0NBQWtDO0FBRWxDLE1BQWEsU0FBVSxTQUFRLG1CQUFRO0lBR25DLGdCQUFnQixHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFBO0lBRXBELGFBQWEsR0FBa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFckUscUJBQXFCLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRWxFLGlCQUFpQixHQUFrQixJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXRFLGFBQWEsR0FBa0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQVU5RCxjQUFjLEdBQWtCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLGVBQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDdkYsVUFBVSxHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBa0JuRixpQkFBaUIsQ0FHaEI7SUFFRCxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNiLElBQUk7WUFDQSxJQUFJLENBQUMsaUJBQWlCLEdBQUc7Z0JBQ3JCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQ3pELHFDQUFxQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQzthQUM5RixDQUFBO1NBQ0o7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLElBQUksQ0FBQyxpQkFBaUIsR0FBRztnQkFDckIsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFDL0IscUNBQXFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUM7YUFDbkYsQ0FBQTtTQUNKO0lBQ0wsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQTtJQUN0RCxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUdELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxlQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksbUJBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBR0QsSUFBSSxZQUFZO1FBQ1osT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFFRCxJQUFJLG1CQUFtQjtRQUNuQixPQUFPLHdCQUFZLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQzVELENBQUM7SUFHRCxJQUFJLG9CQUFvQjtRQUNwQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMvQyxDQUFDO0lBR0QsSUFBSSxnQkFBZ0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDM0MsQ0FBQztJQUdELElBQUksWUFBWTtRQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN2QyxDQUFDO0lBVUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3hDLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDcEMsQ0FBQztJQWtCRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDckQsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNwQixDQUFDO0lBRUQsSUFBSSxvQ0FBb0M7UUFDcEMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUNBQXFDLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDckYsQ0FBQztJQUtELFlBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSTtRQUM3QixNQUFNLE1BQU0sR0FBRyxJQUFJLHFCQUFTLEVBQUUsQ0FBQztRQUM5QixJQUFZLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdGLE9BQU8sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLEdBQVcsY0FBYyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUE7UUFDaEQsSUFBSSxJQUFJLFFBQVEsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUkseUJBQXlCLElBQUksQ0FBQyxlQUFlLGlCQUFpQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQTtRQUMxRyxJQUFJLElBQUksc0JBQXNCLElBQUksQ0FBQyxZQUFZLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7UUFDaEYsSUFBSSxJQUFJLDhCQUE4QixJQUFJLENBQUMsb0JBQW9CLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFBO1FBQzlILElBQUksSUFBSSwwQkFBMEIsSUFBSSxDQUFDLGlCQUFpQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFBO1FBQzFGLElBQUksSUFBSSxzQkFBc0IsSUFBSSxDQUFDLGFBQWEsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUE7UUFDOUUsSUFBSSxJQUFJLHVCQUF1QixJQUFJLENBQUMsY0FBYyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQTtRQUNqRixJQUFJLElBQUksbUJBQW1CLElBQUksQ0FBQyxVQUFVLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFBO1FBQ3JFLElBQUksSUFBSSxjQUFjLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQTtRQUN4RyxJQUFJLElBQUksaUJBQWlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQ0FBcUMsUUFBUSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUE7UUFDNUssT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBR0QsZUFBZTtRQUNYLE9BQU8seURBQTJCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzFELENBQUM7SUFLRCxxQkFBcUI7UUFDakIsT0FBTyxxQkFBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQ2pDLGtDQUFrQyxFQUFFLGVBQWUsRUFDbkQsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUN4RCxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2hGLENBQUM7SUFLRCxtQkFBbUI7UUFDZixPQUFPLElBQUksbUJBQVEsQ0FBQyxPQUFPLENBQ3ZCLDBDQUEwQyxFQUFFLFdBQVcsRUFDdkQsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ3JCLENBQUM7SUFFRCxXQUFXO1FBQ1AsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUE7UUFDbkQsSUFBSSxpQkFBaUIsSUFBSSxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ2pDLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUQsV0FBVztRQUNQLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBRWpELElBQUksQ0FBQyxZQUFZLEdBQUcsd0JBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUV2RCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO1NBQ3BDO2FBQU07WUFDSCxPQUFPLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3ZFO0lBQ0wsQ0FBQztJQUlPLE1BQU0sQ0FBQyxxQkFBcUIsR0FBWSxJQUFJLENBQUE7SUFDcEQsVUFBVTtRQUNOLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQTtRQUVsQyxTQUFTLFlBQVk7WUFFakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUI7Z0JBQUUsT0FBTTtZQUM1QyxTQUFTLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFBO1lBRXZDLE1BQU0sT0FBTyxHQUFrQixNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBRSxDQUFBO1lBRW5FLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSwwQ0FBMEMsQ0FBRSxDQUFBO1lBQ2pILFdBQVcsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxJQUFJO29CQUNSLElBQUksQ0FBQyxzQ0FBc0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUE7Z0JBQ3JGLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTTtvQkFDYixJQUFJLENBQUMsc0NBQXNDLE1BQU0sT0FBTyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUNuRixDQUFDO2FBQ0osQ0FBQyxDQUFBO1lBRUYsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUN4QyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRTtnQkFDM0IsT0FBTyxDQUEwQixJQUF5QjtvQkFDdEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQTBCLENBQUE7b0JBQzNDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUE7b0JBQ2pCLElBQUksQ0FBQyw2QkFBNkIsT0FBTyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ3JHLENBQUM7YUFDSixDQUFDLENBQUE7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLE1BQU0sd0JBQXdCLEdBQVcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNqSSxPQUFPLEdBQUcsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUE7SUFDOUQsQ0FBQztJQUlELHVCQUF1QixDQUFDLEtBQWdCO1FBQ3BDLE9BQU8sT0FBTyxDQUNWLGlEQUFpRCxFQUFFLFdBQVcsRUFDOUQsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUM5QixJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsQyxDQUFDO0lBS0Qsb0JBQW9CO1FBQ2hCLE9BQU8sT0FBTyxDQUNWLDJDQUEyQyxFQUFFLFdBQVcsRUFDeEQsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNsQyxDQUFDO0lBSUQsZUFBZTtRQUNYLE9BQU8sT0FBTyxDQUNWLHNDQUFzQyxFQUFFLFdBQVcsRUFDbkQsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNwQixDQUFDO0lBSUQsUUFBUSxDQUFDLEdBQWM7UUFDbkIsT0FBTyxPQUFPLENBQ1Ysa0RBQWtELEVBQUUsV0FBVyxFQUMvRCxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUNyQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUscUJBQVcsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFJRCx1QkFBdUIsQ0FBQyxLQUFhLENBQUM7UUFDbEMsT0FBTyxJQUFJLDJDQUFvQixDQUFDLE9BQU8sQ0FDbkMsOENBQThDLEVBQUUsV0FBVyxFQUMzRCxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN6QixDQUFDO0lBSUQsNEJBQTRCO1FBQ3hCLE9BQU8sT0FBTyxDQUNWLG1EQUFtRCxFQUFFLFdBQVcsRUFDaEUsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNwQixDQUFDO0lBS0QsdUJBQXVCO1FBQ25CLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxDQUN4Qiw4REFBOEQsRUFBRSxXQUFXLEVBQzNFLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUMxQyxDQUFDO0lBSUQsb0JBQW9CO1FBQ2hCLE9BQU8sT0FBTyxDQUNWLDJEQUEyRCxFQUFFLFdBQVcsRUFDeEUsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBS0QsNEJBQTRCO1FBQ3hCLE9BQU8sT0FBTyxDQUNWLG1EQUFtRCxFQUFFLFdBQVcsRUFDaEUsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNwQixDQUFDO0lBSUQsZ0JBQWdCLENBQUMsU0FBaUIsQ0FBQztRQUMvQixPQUFPLE9BQU8sQ0FBUyx1Q0FBdUMsRUFBRSxXQUFXLEVBQ3ZFLEtBQUssRUFDTCxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFDbEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM1QixDQUFDO0lBSUQsWUFBWTtRQUNSLE9BQU8scUJBQVMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUNqQyxtQ0FBbUMsRUFBRSxXQUFXLEVBQ2hELENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNyQixDQUFDO0lBSUQsV0FBVztRQUNQLE9BQU8scUJBQVMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUNqQyxrQ0FBa0MsRUFBRSxXQUFXLEVBQy9DLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNyQixDQUFDO0lBSUQsY0FBYyxDQUFDLGFBQWlDO1FBQzVDLE9BQU8sT0FBTyxDQUFnQix1Q0FBdUMsRUFBRSxXQUFXLEVBQzlFLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUNuQyxDQUFDO0lBR0QsZ0JBQWdCLENBQUMsYUFBa0M7UUFDL0MsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksY0FBYyxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDMUgsQ0FBQztJQUlELGdCQUFnQjtRQUNaLE9BQU8sT0FBTyxDQUFPLHVDQUF1QyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDaEgsQ0FBQztJQUtELE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBYztRQUNqQyxPQUFPLE9BQU8sQ0FDVix3Q0FBd0MsRUFBRSxXQUFXLEVBQ3JELEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUNsQixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDdkMsQ0FBQztJQUlELGFBQWE7UUFDVCxPQUFPLGlCQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FDOUIsb0NBQW9DLEVBQUUsV0FBVyxFQUNqRCxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsMkJBQTJCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUM5RCxJQUFJLENBQUMsNEJBQTRCLElBQUksQ0FBQyxvQkFBb0IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2xHLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUV6RCxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUE7UUFDMUQsSUFBSSxDQUFDLG1CQUFtQixJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzlDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUM1QyxJQUFJLENBQUMsdUJBQXVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUN0RCxJQUFJLENBQUMsMkNBQTJDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDLENBQUE7UUFFNUYsT0FBTyxFQUFFLENBQUE7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNqRCxDQUFDO0lBRUQsUUFBUSxHQUFHLENBQUMsR0FBWSxFQUFFLEVBQUU7UUFDeEIsTUFBTSxTQUFTLEdBQWdCLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLENBQUE7UUFDakcsU0FBUyxDQUFDLFVBQVUsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDcEYsQ0FBQyxDQUFBO0lBRUQsU0FBUyxDQUFDLE1BQWMsQ0FBQyxDQUFDLEVBQUUsT0FBZ0IsS0FBSyxFQUEyQixXQUFtQixHQUFHO1FBQzlGLE1BQU0sUUFBUSxHQUFnQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDcEUsTUFBTSxRQUFRLEdBQVksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzNDLE1BQU0sU0FBUyxHQUFrQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDbkQsSUFBSSxLQUFLLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN4QixJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1lBQ2xCLElBQUksQ0FBQywwQkFBMEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDOUMsT0FBTTtTQUNUO1FBQ0QsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsZUFBZSxRQUFRLElBQUksQ0FBQyxDQUFBO1lBQ2pDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUE7WUFDcEIsSUFBSSxDQUFDLGVBQWUsUUFBUSxJQUFJLENBQUMsQ0FBQTtTQUNwQztRQUVELE9BQU8sRUFBRSxDQUFBO1FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNyQixJQUFJLGVBQWUsR0FBVyw2QkFBNkIsUUFBUSxDQUFDLHdCQUF3QixNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFBO1FBQzFJLGVBQWUsSUFBSSxvQkFBb0IsUUFBUSxDQUFDLEtBQUssa0JBQWtCLFNBQVMsV0FBVyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDNUcsSUFBSSxDQUFDLE9BQU8sZUFBZSxNQUFNLENBQUMsQ0FBQTtRQUVsQyxNQUFNLFNBQVMsR0FBVyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNsRSxNQUFNLEVBQUUsR0FBZ0IsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUMxRCxNQUFNLE1BQU0sR0FBVyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDekgsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsY0FBYyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxHQUE0QixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQTRCLENBQUE7WUFDcEYsSUFBSSxDQUFDLEtBQUssU0FBUyxNQUFNLE1BQU0sb0JBQW9CLElBQUksQ0FBQyxNQUFNLHNCQUFzQixJQUFJLENBQUMsY0FBYyxnQkFBZ0IsSUFBSSxDQUFDLFFBQVEsaUJBQWlCLElBQUksQ0FBQyxTQUFTLGtCQUFrQixJQUFJLENBQUMsVUFBVSw2QkFBNkIsSUFBSSxDQUFDLHFCQUFxQixnQ0FBZ0MsSUFBSSxDQUFDLHdCQUF3QixNQUFNLENBQUMsQ0FBQTtTQUNsVTthQUFNO1lBQ0gsTUFBTSxJQUFJLEdBQThCLHlEQUEyQixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUE4QixDQUFBO1lBQ3ZJLElBQUksQ0FBQyxLQUFLLFNBQVMsTUFBTSxNQUFNLDBCQUEwQixJQUFJLENBQUMsY0FBYyxnQkFBZ0IsSUFBSSxDQUFDLFFBQVEsaUJBQWlCLElBQUksQ0FBQyxTQUFTLGtCQUFrQixJQUFJLENBQUMsVUFBVSxzQkFBc0IsSUFBSSxDQUFDLGNBQWMsZ0NBQWdDLElBQUksQ0FBQyx3QkFBd0IsYUFBYSxJQUFJLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQTtTQUNoVDtRQUVELElBQUksTUFBTSxHQUFXLENBQUMsQ0FBQTtRQUN0QixJQUFJLFdBQVcsR0FBVyxDQUFDLENBQUE7UUFDM0IsSUFBSSxTQUFTLEdBQVcsQ0FBQyxDQUFBO1FBQ3pCLElBQUksU0FBUyxHQUFXLEdBQUcsQ0FBQTtRQUMzQixNQUFNLFdBQVcsR0FBVyxRQUFRLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFBO1FBQ2pFLE9BQU8sSUFBSSxFQUFFO1lBQ1QsTUFBTSxNQUFNLEdBQVcsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFBO1lBQ2hILElBQUksQ0FBQyxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxNQUFNLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN4RixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQTtZQUMvQixJQUFJLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDakIsSUFBSSxFQUFFLFNBQVMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRTtvQkFBRSxNQUFLO2FBQ3REO2lCQUNJLElBQUksUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN0QixJQUFJLENBQUMsNkJBQTZCLFFBQVEsaURBQWlELENBQUMsQ0FBQTtnQkFDNUYsTUFBSzthQUNSO2lCQUNJLElBQUksV0FBVyxJQUFJLE1BQU0sRUFBRTtnQkFDNUIsSUFBSSxDQUFDLCtCQUErQixNQUFNLE9BQU8sV0FBVyx3RUFBd0UsQ0FBQyxDQUFBO2dCQUNySSxNQUFLO2FBQ1I7aUJBQ0k7Z0JBQ0QsSUFBSSxNQUFNLElBQUksV0FBVztvQkFBRSxNQUFLO2FBQ25DO1lBQ0QsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUNwQixXQUFXLEdBQUcsTUFBTSxDQUFBO1NBQ3ZCO1FBQ0QsT0FBTyxFQUFFLENBQUE7SUFDYixDQUFDO0lBRUQsVUFBVSxDQUFDLE1BQWMsRUFBRSxFQUFFLE9BQWdCLEtBQUs7UUFDOUMsT0FBTyxFQUFFLENBQUE7UUFDVCxJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDckIsT0FBTyxFQUFFLENBQUE7UUFHVCxJQUFJLEtBQUssR0FBZ0IsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtRQUNyRixJQUFJLFNBQVMsR0FBVyxDQUFDLENBQUE7UUFDekIsSUFBSSxXQUFXLEdBQVcsQ0FBQyxDQUFBO1FBQzNCLElBQUksU0FBUyxHQUFZLEtBQUssQ0FBQTtRQUM5QixPQUFPLEVBQUUsU0FBUyxHQUFHLEdBQUcsRUFBRTtZQUN0QixJQUFJLFFBQVEsR0FBVyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUE7WUFDakgsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNLEVBQUUsR0FBZ0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3RELE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDeEgsSUFBSSxDQUFDLEdBQUcsUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssS0FBSyxhQUFhLENBQUMsQ0FBQTtZQUM3RCxDQUFDLEVBQUUsQ0FBQTtZQUNILFdBQVcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFBO1lBQ3pCLElBQUk7Z0JBQ0EsS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNyQyxTQUFTLEdBQUcsS0FBSyxDQUFBO2FBQ3BCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxDQUFDLENBQUE7Z0JBQ3pELFNBQVMsR0FBRyxJQUFJLENBQUE7YUFDbkI7U0FJSjtRQUNELE9BQU8sRUFBRSxDQUFBO0lBQ2IsQ0FBQzs7QUEvZkwsOEJBaWdCQztBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQTs7Ozs7QUNwaEIvQywrQ0FBOEM7QUFJOUMsTUFBYSxRQUFTLFNBQVEsa0JBQVM7SUFFbkMsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLFlBQVksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO0lBQ3JDLENBQUM7Q0FFSjtBQVZELDRCQVVDOzs7OztBQ2RELGtGQUE4RTtBQUM5RSwrQ0FBOEM7QUFJOUMsTUFBYSxjQUFlLFNBQVEsa0JBQVM7SUFJekMsU0FBUyxHQUFrQixJQUFJLENBQUMsYUFBYSxDQUFBO0lBRTdDLE9BQU8sR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsNkJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUUvRCxXQUFXLEdBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7SUFHakUsUUFBUSxHQUFrQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyw2QkFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRWxFLFVBQVUsR0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFbEQsWUFBWSxHQUFrQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUV0RCxZQUFZLE1BQXFCO1FBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDcEYsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxlQUFlLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQTtRQUNoRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDckMsSUFBSSxJQUFJLG1CQUFtQixJQUFJLENBQUMsUUFBUSxlQUFlLElBQUksQ0FBQyxNQUFNLG1CQUFtQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDdEcsSUFBSSxJQUFJLG9CQUFvQixJQUFJLENBQUMsU0FBUyxvQkFBb0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ2hGLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSw2QkFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQy9FLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksNkJBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2xGLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixPQUFPLElBQUksNkJBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxrQkFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNqRixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLDZCQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksa0JBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDaEYsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0NBRUo7QUFyREQsd0NBcURDOzs7OztBQ3pERCxrRkFBOEU7QUFDOUUsOERBQTBEO0FBQzFELCtDQUE4QztBQUM5QyxnREFBNEM7QUFLNUMsTUFBYSxRQUFTLFNBQVEsa0JBQVM7SUFHbkMsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRXJDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRXRELFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFM0Msb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFaEUsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFaEUsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFNUQsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFN0QsZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBRTNELFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVwRCx3QkFBd0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVwRSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVoRSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUV0RSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUVqRSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUUvRCxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFeEQsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksR0FBVyxjQUFjLElBQUksQ0FBQyxNQUFNLFFBQVEsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFBO1FBQ3pFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUNyQyxJQUFJLElBQUksa0JBQWtCLElBQUksQ0FBQyxZQUFZLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDNUUsSUFBSSxJQUFJLDhCQUE4QixJQUFJLENBQUMsbUJBQW1CLGdDQUFnQyxJQUFJLENBQUMsdUJBQXVCLDRCQUE0QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtRQUNoTCxJQUFJLElBQUksMEJBQTBCLElBQUksQ0FBQyxlQUFlLHlCQUF5QixJQUFJLENBQUMsZ0JBQWdCLHVCQUF1QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7UUFDaEosSUFBSSxJQUFJLGtCQUFrQixJQUFJLENBQUMsT0FBTyxnQ0FBZ0MsSUFBSSxDQUFDLHVCQUF1Qiw0QkFBNEIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7UUFDeEosSUFBSSxJQUFJLG9DQUFvQyxJQUFJLENBQUMseUJBQXlCLDZCQUE2QixJQUFJLENBQUMsb0JBQW9CLDJCQUEyQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUNwTCxJQUFJLElBQUksc0JBQXNCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNoRCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMzRixDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0lBQzFFLENBQUM7SUFHRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksNkJBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDN0UsQ0FBQztJQUVELElBQVksWUFBWTtRQUNwQixPQUFPLHFCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFRCxJQUFJLHVCQUF1QjtRQUN2QixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFRCxJQUFJLG1CQUFtQjtRQUNuQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsSUFBSSxtQkFBbUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDbEQsQ0FBQztJQUVELElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQzlDLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNoQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUMvQyxDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQzdDLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdEMsQ0FBQztJQUVELElBQUksdUJBQXVCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ2xELENBQUM7SUFFRCxJQUFJLG1CQUFtQjtRQUNuQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsSUFBSSx5QkFBeUI7UUFDekIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDcEQsQ0FBQztJQUVELElBQUksb0JBQW9CO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQy9DLENBQUM7SUFFRCxJQUFJLGtCQUFrQjtRQUNsQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3RDLENBQUM7Q0FFSjtBQTFIRCw0QkEwSEM7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUE7Ozs7O0FDckk3QywrQ0FBOEM7QUFHOUMsTUFBYSxPQUFRLFNBQVEsa0JBQVM7SUFFbEMsWUFBWSxNQUFxQjtRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLFdBQVcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFBO0lBQ3BDLENBQUM7Q0FFSjtBQVZELDBCQVVDOzs7O0FDYkQsc0JBQW1CO0FBQ25CLHVCQUFvQjtBQUNwQixzQkFBbUI7QUFDbkIseUJBQXNCO0FBQ3RCLHFCQUFrQjs7QUNKbEI7Ozs7O0FDQUEsMkRBQXdEO0FBRXhELE1BQWEsT0FBTztJQUdoQixNQUFNLENBQUMscUJBQXFCLENBQUMsT0FBc0I7UUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUE7UUFDM0IsT0FBTyxDQUNILDJDQUEyQyxFQUFFLFdBQVcsRUFDeEQsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUNqRixDQUFBO1FBQ0QsT0FBTyxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUE7SUFDaEMsQ0FBQztDQUVKO0FBWkQsMEJBWUM7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7Ozs7QUNoQjNDLHFCQUFrQjs7OztBQ0FsQix5QkFBc0I7QUFDdEIsNkJBQTBCOzs7O0FDRDFCLHdCQUFxQjs7OztBQ0FyQixvQkFBaUI7QUFDakIsc0JBQW1CO0FBQ25CLHFCQUFrQjtBQUNsQix5QkFBc0I7QUFDdEIsMEJBQXVCO0FBQ3ZCLDBCQUF1QjtBQUV2QixnQ0FBNkI7QUFDN0IsK0JBQTRCO0FBQzVCLDJCQUF3QjtBQUN4QiwrQkFBNEI7O0FDVjVCLFNBQVMsbUJBQW1CLENBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRTtJQUN0RCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBRXBCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDaEMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV2QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtZQUNsQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkIsUUFBUSxHQUFHLElBQUksQ0FBQztLQUNqQjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDZixtQkFBbUI7Q0FDcEIsQ0FBQzs7OztBQ3JCSiw2QkFBMEI7QUFDMUIsMEJBQXVCO0FBQ3ZCLDJCQUF3Qjs7OztBQ0F4QixxQkFBa0I7QUFFbEIsVUFBVSxDQUFDLGFBQWEsR0FBRyxHQUFHLEVBQUU7SUFFNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFFZCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFFN0gsSUFBSSxNQUFNLEdBQWMsZUFBZSxDQUFDLGlEQUFpRCxDQUFDLENBQUE7UUFDMUYsSUFBSSxPQUFPLEdBQVksTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUViLEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7U0FDOUM7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuRSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDckM7UUFFRCxPQUFPLEVBQUUsQ0FBQTtRQUNULElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7SUFNL0IsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUE7QUFFRCxVQUFVLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBWSxZQUFZLEVBQUUsSUFBWSxlQUFlLEVBQUUsSUFBWSxZQUFZLEVBQUUsRUFBRTtJQUN6RyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMzSCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQTs7Ozs7QUN2Q0QsTUFBYSxTQUFTO0lBRVYsTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQTtJQUV4RCxNQUFNLENBQWU7SUFFckIsWUFBWSxPQUFzQixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7UUFDckUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7SUFDdEIsQ0FBQztJQUVPLE9BQU87UUFDWCxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUN0QyxJQUFJLENBQUMsTUFBTTtZQUFHLElBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQW1CO1FBQ2xDLE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzNHLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBWSxDQUFDLElBQXFCO1FBQ3JDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDL0IsT0FBTyxTQUFTLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUE7SUFDcEUsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBc0I7UUFDOUIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDN0QsQ0FBQztJQUVPLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxJQUFxQjtRQUN4RCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQztZQUFFLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQTtRQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFBO1FBQ2pDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDL0QsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkUsT0FBTyxTQUFTLENBQUE7SUFDcEIsQ0FBQztJQUVELGVBQWU7UUFDWCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDOUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2QsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQWtCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQWtCLENBQUE7WUFDL0QsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7U0FDL0I7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDbEU7SUFDTCxDQUFDO0lBRU8sUUFBUTtRQUNaLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDdkIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ2pGLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDekIsQ0FBQzs7QUF6REwsOEJBMERDO0FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFBOzs7O0FDNUQvQyxVQUFVLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFN0MsVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUU5QixVQUFVLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBNEIsRUFBRSxTQUFpQixJQUFJLEVBQUUsU0FBa0IsSUFBSSxFQUFFLEtBQXNCLEVBQUUsRUFBRTtJQUN6SCxJQUFJLFNBQVMsR0FBa0IsSUFBSSxDQUFBO0lBQ25DLElBQUksT0FBTyxJQUFJLElBQUksUUFBUSxFQUFFO1FBQ3pCLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDeEI7U0FBTTtRQUNILFNBQVMsR0FBRyxJQUFJLENBQUE7S0FDbkI7SUFDRCxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtRQUNuQixNQUFNLEVBQUUsTUFBTTtRQUNkLE1BQU0sRUFBRSxNQUFNO0tBQ2pCLENBQUMsRUFBRSxLQUFLLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNwRCxDQUFDLENBQUE7Ozs7OztBQ1RELE1BQU0sUUFBUSxHQUE4QjtJQUN4QyxDQUFDLEVBQUUsWUFBWTtJQUNmLE9BQU8sRUFBRSxlQUFlO0lBQ3hCLE9BQU8sRUFBRSxlQUFlO0lBQ3hCLE9BQU8sRUFBRSxlQUFlO0lBQ3hCLE9BQU8sRUFBRSxlQUFlO0lBQ3hCLE9BQU8sRUFBRSxlQUFlO0NBQzNCLENBQUE7QUFFRCxNQUFhLGFBQWE7SUFFZCxNQUFNLENBQUMsU0FBUyxHQUFZLElBQUksQ0FBQTtJQUVqQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWdCO1FBQy9CLGFBQWEsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFBO1FBSWpDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRTtZQUN4RCxPQUFPLEVBQUUsVUFBVSxJQUFJO2dCQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtnQkFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDbkMsQ0FBQztZQUNELE9BQU8sRUFBRSxVQUFVLE1BQXFCO2dCQUNwQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUM1RCxDQUFDO1NBQ0osQ0FBQyxDQUFBO1FBSUYsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLEVBQUU7WUFDcEUsT0FBTyxFQUFFLFVBQVUsSUFBSTtnQkFDbkIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7b0JBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO29CQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtvQkFDL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7aUJBQ2xDO1lBQ0wsQ0FBQztZQUNELE9BQU8sRUFBRSxVQUFVLE1BQXFCO2dCQUNwQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3pFLENBQUM7U0FDSixDQUFDLENBQUE7SUFDTixDQUFDO0lBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFjLEVBQUUsSUFBWSxFQUFFLE1BQXFCLEVBQUUsS0FBcUI7UUFDN0YsSUFBSSxhQUFhLENBQUMsU0FBUztZQUFFLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sTUFBTSxFQUFFLENBQUMsQ0FBQTtRQUVyRixJQUFJLGFBQWEsQ0FBQyxTQUFTLElBQUksU0FBUztZQUFFLE9BQU07UUFDaEQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUF1QixFQUFFLElBQVksRUFBRSxFQUFFO1lBQ3RFLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDckIsTUFBTSxFQUFFLENBQUE7Z0JBQ1osQ0FBQyxDQUFDLENBQUE7YUFDTDtZQUNELGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3hDLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVPLE1BQU0sQ0FBQyxTQUFTLEdBQWdDLElBQUksR0FBRyxFQUEwQixDQUFBO0lBRWxGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFjLEVBQUUsTUFBa0I7UUFDakUsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDbkQ7YUFBTTtZQUNILGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7U0FDaEQ7SUFDTCxDQUFDOztBQXpETCxzQ0EyREM7QUFFRCxZQUFZLENBQUMsR0FBRyxFQUFFO0lBQ2QsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM3QixDQUFDLENBQUMsQ0FBQTtBQU1GLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLE1BQWMsRUFBRSxNQUFrQixFQUFFLEVBQUU7SUFDbEUsYUFBYSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUN0RCxDQUFDLENBQUE7Ozs7OztBQ2xGRCxTQUFTLE9BQU8sQ0FBQyxTQUFpQixjQUFjO0lBQzVDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNqQixNQUFNLFFBQVEsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDdkUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUNoRCxDQUFDO0FBU0QsU0FBUyxRQUFRLENBQUMsSUFBbUIsRUFBRSxNQUFjLEVBQUUsUUFBaUIsRUFBRSxJQUFhLEVBQUUsVUFBbUIsSUFBSTtJQUM1RyxJQUFJLE1BQU0sSUFBSSxDQUFDO1FBQUUsT0FBTTtJQUV2QixJQUFJLFNBQVMsR0FBVyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0lBQ2hFLElBQUksUUFBUSxJQUFJLFNBQVMsRUFBRTtRQUN2QixTQUFTLElBQUksSUFBSSxJQUFJLElBQUksTUFBTSxNQUFNLENBQUE7S0FDeEM7U0FBTTtRQUNILFNBQVMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFBO0tBQzlCO0lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzdDLElBQUksV0FBVyxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7UUFDcEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ25DLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFFLENBQUE7UUFDOUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUMvQixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDbkIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ25CLElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSSxDQUFDLFVBQVUsTUFBTSxlQUFlLElBQUksT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNsRSxJQUFJLENBQUMsZUFBZSxTQUFTLElBQUksQ0FBQyxDQUFBO1NBQ3JDO0tBQ0o7QUFDTCxDQUFDO0FBT0QsVUFBVSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUE7QUFDM0IsVUFBVSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUE7Ozs7O0FDM0M3QixNQUFhLFVBQVU7SUFFbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUE7SUFDbEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUE7SUFDbEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUE7SUFDbkIsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFDakIsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUE7SUFDckIsTUFBTSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUE7SUFDdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUE7SUFDbEIsTUFBTSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUE7SUFFekIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFZO1FBQ3hCLFFBQVEsSUFBSSxFQUFFO1lBQ1YsS0FBSyxVQUFVLENBQUMsT0FBTztnQkFDbkIsT0FBTyxTQUFTLENBQUE7WUFDcEIsS0FBSyxVQUFVLENBQUMsT0FBTztnQkFDbkIsT0FBTyxTQUFTLENBQUE7WUFDcEIsS0FBSyxVQUFVLENBQUMsUUFBUTtnQkFDcEIsT0FBTyxVQUFVLENBQUE7WUFDckIsS0FBSyxVQUFVLENBQUMsTUFBTTtnQkFDbEIsT0FBTyxRQUFRLENBQUE7WUFDbkIsS0FBSyxVQUFVLENBQUMsVUFBVTtnQkFDdEIsT0FBTyxZQUFZLENBQUE7WUFDdkIsS0FBSyxVQUFVLENBQUMsWUFBWTtnQkFDeEIsT0FBTyxjQUFjLENBQUE7WUFDekIsS0FBSyxVQUFVLENBQUMsT0FBTztnQkFDbkIsT0FBTyxTQUFTLENBQUE7WUFDcEIsS0FBSyxVQUFVLENBQUMsY0FBYztnQkFDMUIsT0FBTyxnQkFBZ0IsQ0FBQTtZQUMzQjtnQkFDSSxPQUFPLFNBQVMsQ0FBQTtTQUN2QjtJQUNMLENBQUM7O0FBaENMLGdDQWlDQzs7Ozs7QUMzQ0QsU0FBZ0IsWUFBWSxDQUFDLE9BQWU7SUFDeEMsSUFBSSxlQUFlLEdBQXlCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtJQUNsRyxJQUFJLGVBQWUsSUFBSSxJQUFJO1FBQUUsZUFBZSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO0lBQzdHLElBQUksZUFBZSxJQUFJLElBQUk7UUFBRSxlQUFlLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLENBQUE7SUFDM0csSUFBSSxlQUFlLElBQUksSUFBSTtRQUFFLGVBQWUsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7SUFDOUYsSUFBSSxlQUFlLElBQUksSUFBSTtRQUFFLE1BQU0sS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUE7SUFDMUYsSUFBSSxRQUFRLEdBQWEsSUFBSSxjQUFjLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDckgsSUFBSSxXQUFXLEdBQWtCLE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDaEUsSUFBSSxZQUFZLEdBQWtCLElBQUksQ0FBQTtJQUN0QyxJQUFJLE1BQU0sR0FBa0IsSUFBSSxDQUFBO0lBQ2hDLElBQUksTUFBTSxHQUFrQixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxRCxJQUFJLE1BQU0sR0FBa0IsUUFBUSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBa0IsQ0FBQTtJQUNoRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDeEIsSUFBSSxTQUFTLEdBQWtCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUN0RCxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO0tBQ3RFOztRQUFNLE9BQU8sRUFBRSxDQUFBO0FBQ3BCLENBQUM7QUFoQkQsb0NBZ0JDO0FBRU0sTUFBTSw2QkFBNkIsR0FBRyxDQUFDLE9BQWUsRUFBWSxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFBaEksUUFBQSw2QkFBNkIsaUNBQW1HO0FBRTdJLFVBQVUsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBOzs7O0FDcEJ0Qyx1QkFBb0I7QUFDcEIsb0JBQWlCO0FBQ2pCLGtCQUFlO0FBQ2Ysb0JBQWlCO0FBQ2pCLGtCQUFlO0FBQ2Ysb0JBQWlCO0FBQ2pCLHVCQUFvQjs7Ozs7QUNOcEIsSUFBWSxRQU1YO0FBTkQsV0FBWSxRQUFRO0lBQ2hCLHlDQUFTLENBQUE7SUFBRSxxQ0FBTyxDQUFBO0lBQUUsMkNBQVUsQ0FBQTtJQUM5QixzQ0FBUSxDQUFBO0lBQUUsc0NBQVEsQ0FBQTtJQUFFLHNDQUFRLENBQUE7SUFBRSxzQ0FBUSxDQUFBO0lBQUUsc0NBQVEsQ0FBQTtJQUFFLHNDQUFRLENBQUE7SUFDMUQsc0NBQVEsQ0FBQTtJQUFFLHNDQUFRLENBQUE7SUFBRSxzQ0FBUSxDQUFBO0lBQUUsc0NBQVEsQ0FBQTtJQUFFLHNDQUFRLENBQUE7SUFBRSxzQ0FBUSxDQUFBO0lBQzFELHNDQUFRLENBQUE7SUFBRSxzQ0FBUSxDQUFBO0lBQUUsc0NBQVEsQ0FBQTtJQUFFLHNDQUFRLENBQUE7SUFBRSxzQ0FBUSxDQUFBO0lBQUUsc0NBQVEsQ0FBQTtJQUFFLHNDQUFRLENBQUE7SUFBRSxzQ0FBUSxDQUFBO0lBQzlFLHlDQUFVLENBQUE7SUFBRSx5Q0FBVSxDQUFBO0lBQUUseUNBQVUsQ0FBQTtJQUFFLHlDQUFVLENBQUE7SUFBRSx5Q0FBVSxDQUFBO0lBQUUseUNBQVUsQ0FBQTtJQUFFLHlDQUFVLENBQUE7SUFBRSx5Q0FBVSxDQUFBO0FBQ2xHLENBQUMsRUFOVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQU1uQjtBQUVELE1BQWEsTUFBTTtJQUVQLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtJQUMzQixNQUFNLENBQUMsV0FBVyxHQUFXLFNBQVMsQ0FBQTtJQUN0QyxNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsS0FBZSxFQUFVLEVBQUUsQ0FBQyxRQUFRLEtBQWUsR0FBRyxDQUFBO0lBRTlFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQTtJQUVqQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUMzRCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxN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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiJ9
