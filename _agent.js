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
},{"../android/implements/10/art/mirror/ArtMethod":71}],3:[function(require,module,exports){
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
    static fromRef(factory, ref) {
        return new HeapReference(factory, ref);
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
const StdString_1 = require("../tools/StdString");
const SymHelper_1 = require("./Utils/SymHelper");
const JSHandle_1 = require("./JSHandle");
class ArtField extends JSHandle_1.JSHandle {
}
class ArtObject extends JSHandle_1.JSHandle {
    klass_ = this.handle;
    monitor_ = this.klass_.add(0x4);
    constructor(handle) {
        super(handle);
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
        return this.monitor_.readU32();
    }
    simpleDisp() {
        if (this.handle.isNull())
            return `ArtObject<${this.handle}>`;
        const prettyTypeOf = this.PrettyTypeOf();
        let disp = `ArtObject<${this.handle}> <- ${prettyTypeOf}`;
        return disp;
    }
    toString() {
        let disp = `ArtObject< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        return disp;
    }
    sizeInCodeUnitsComplexOpcode() {
        return (0, SymHelper_1.callSym)("_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv", "libdexfile.so", ["pointer"], ["pointer"], this.handle);
    }
    static PrettyTypeOf(obj) {
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZN3art6mirror6Object12PrettyTypeOfENS_6ObjPtrIS1_EE", "libart.so", ["pointer", "pointer", "pointer"], ["pointer"], obj.handle)).toString();
    }
    PrettyTypeOf() {
        try {
            return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZN3art6mirror6Object12PrettyTypeOfEv", "libart.so", ["pointer", "pointer", "pointer"], ["pointer"], this.handle)).toString();
        }
        catch (error) {
            return 'ERROR -> PrettyTypeOf';
        }
    }
    static CopyObject(dest, src, num_bytes) {
        return new ArtObject((0, SymHelper_1.callSym)("_ZN3art6mirror6Object10CopyObjectENS_6ObjPtrIS1_EES3_m", "libart.so", ["pointer"], ["pointer", "pointer", "int"], dest.handle, src.handle, num_bytes));
    }
    Clone(self) {
        return new ArtObject((0, SymHelper_1.callSym)("_ZN3art6mirror6Object5CloneEPNS_6ThreadE", "libart.so", ["pointer"], ["pointer", "pointer"], this.handle, self.handle));
    }
    FindFieldByOffset(offset) {
        return new ArtField((0, SymHelper_1.callSym)("_ZN3art6mirror6Object17FindFieldByOffsetENS_12MemberOffsetE", "libart.so", ["pointer"], ["pointer", "int"], this.handle, offset));
    }
    static GenerateIdentityHashCode() {
        return (0, SymHelper_1.callSym)("_ZN3art6mirror6Object24GenerateIdentityHashCodeEv", "libart.so", ["int"], []);
    }
}
exports.ArtObject = ArtObject;
globalThis.ArtObject = ArtObject;
},{"../tools/StdString":88,"./Interface/art/mirror/HeapReference":7,"./JSHandle":11,"./Utils/SymHelper":15}],13:[function(require,module,exports){
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
    static TraceArtMethodInvoke() {
        HookArtMethodInvoke();
    }
}
exports.TraceManager = TraceManager;
setImmediate(() => {
    TraceManager.Trace_DefineClass();
});
}).call(this)}).call(this,require("timers").setImmediate)

},{"./functions/DefineClass":19,"./functions/ExecuteSwitchImplCpp":21,"./functions/OpenCommon":22,"./functions/init_array":25,"timers":98}],14:[function(require,module,exports){
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
},{"../implements/10/art/mirror/ArtMethod":71}],15:[function(require,module,exports){
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
        throw error;
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
},{"../../tools/functions":93,"../JSHandle":11,"../functions/SymbolManager":23}],16:[function(require,module,exports){
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
exports.getArtMethodSpec = exports.getArtRuntimeSpec = void 0;
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
function getArtRuntimeSpec(api = Java.api) {
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
exports.getArtRuntimeSpec = getArtRuntimeSpec;
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
globalThis.getArtRuntimeSpec = getArtRuntimeSpec;
globalThis.D = () => { Interceptor.detachAll(); };
},{"./machine-code":85}],19:[function(require,module,exports){
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
},{"../implements/10/art/dexfile/DexFile":61,"./DexFileManager":20}],20:[function(require,module,exports){
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
const SymHelper_1 = require("../Utils/SymHelper");
class ExecuteSwitchImplCppManager {
    constructor() { }
    static get execute_switch_impl_cpp_1_0() {
        return (0, SymHelper_1.getSym)("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb0EEEvPNS0_17SwitchImplContextE", "libart.so");
    }
    static get execute_switch_impl_cpp_0_1() {
        return (0, SymHelper_1.getSym)("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb1EEEvPNS0_17SwitchImplContextE", "libart.so");
    }
    static get execute_switch_impl_cpp_1_1() {
        return (0, SymHelper_1.getSym)("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb1EEEvPNS0_17SwitchImplContextE", "libart.so");
    }
    static get execute_switch_impl_cpp_0_0() {
        return (0, SymHelper_1.getSym)("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb0EEEvPNS0_17SwitchImplContextE", "libart.so");
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
                    const threadInfo = `${Process.getCurrentThreadId()} ${ctx.self.GetThreadName()}`;
                    const lastMethod = ctx.shadow_frame.link.method;
                    const lastMethodStr = lastMethod ? lastMethod.PrettyMethod(false) : "null";
                    const currentMethod = ctx.self.GetCurrentMethod().PrettyMethod(false);
                    LOGD(`${threadInfo} \n${lastMethodStr} -> ${currentMethod}`);
                    newLine();
                }
            });
        });
    }
}
exports.ExecuteSwitchImplCppManager = ExecuteSwitchImplCppManager;
},{"../Utils/SymHelper":15,"../implements/10/art/interpreter/SwitchImplContext":68}],22:[function(require,module,exports){
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
const SymHelper_1 = require("../Utils/SymHelper");
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
        return (0, SymHelper_1.callSym)("__dl__ZNK6soinfo10get_sonameEv", InitArray.linkerName, 'pointer', ['pointer'], soinfo).readCString();
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
            get_soName: (0, SymHelper_1.getSym)("__dl__ZNK6soinfo10get_sonameEv", InitArray.linkerName),
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
        Interceptor.attach((0, SymHelper_1.getSym)("__dl__ZN6soinfo17call_constructorsEv", InitArray.linkerName), InitArray.cm);
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
},{"../Utils/SymHelper":15}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassLinker = void 0;
const SymHelper_1 = require("../../../Utils/SymHelper");
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
        return (0, SymHelper_1.callSym)("_ZNK3art7DexFile10IsReadOnlyEv", "libdexfile.so", "bool", ["pointer"], this.handle);
    }
    LookupClass(descriptor, class_loader) {
        return (0, SymHelper_1.callSym)("_ZN3art11ClassLinker11LookupClassEPNS_6ThreadEPKcNS_6ObjPtrINS_6mirror11ClassLoaderEEE", "libart.so", "pointer", ["pointer", "pointer", "pointer"], this.handle, Memory.allocUtf8String(descriptor), class_loader);
    }
}
exports.ClassLinker = ClassLinker;
},{"../../../JSHandle":11,"../../../Utils/SymHelper":15,"./Globals":28}],27:[function(require,module,exports){
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
const SymHelper_1 = require("../../../Utils/SymHelper");
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
        const kInstructionNames_ptr = (0, SymHelper_1.getSym)('_ZN3art11Instruction17kInstructionNamesE', 'libdexfile.so', true);
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
        const kInstructionDescriptors_ptr = (0, SymHelper_1.getSym)('_ZN3art11Instruction23kInstructionDescriptorsE', 'libdexfile.so', true);
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
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "pointer"], this, dexFile));
    }
    dumpHex(code_units = 3) {
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZNK3art11Instruction7DumpHexEm", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "pointer"], this.handle, code_units));
    }
    dumpHexLE(instr_code_units = 3) {
        const realInsLen = this.SizeInCodeUnits / 2;
        return `${realInsLen} - ${StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZNK3art11Instruction9DumpHexLEEm", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "int"], this.handle, realInsLen > instr_code_units ? realInsLen : instr_code_units))}`;
    }
    sizeInCodeUnitsComplexOpcode() {
        return (0, SymHelper_1.callSym)("_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv", "libdexfile.so", ["pointer"], ["pointer"], this.handle);
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
    get opcode() {
        return this.Fetch16();
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
},{"../../../../tools/StdString":88,"../../../JSHandle":11,"../../../Utils/SymHelper":15}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instrumentation = void 0;
const InstrumentationListener_1 = require("./InstrumentationListener");
const android_1 = require("../../../../android");
const SymHelper_1 = require("../../../../Utils/SymHelper");
const JSHandle_1 = require("../../../../JSHandle");
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
    static get Instance() {
        const handle_ref = Java.api.artRuntime.add((0, android_1.getArtRuntimeSpec)().offset.instrumentation);
        return new Instrumentation(handle_ref);
    }
    toString() {
        let disp = `Instrumentation< ${this.handle} >`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t instrumentation_stubs_installed=${this.instrumentation_stubs_installed}`;
        disp += `\n\t entry_exit_stubs_installed=${this.entry_exit_stubs_installed}`;
        disp += `\n\t interpreter_stubs_installed=${this.interpreter_stubs_installed}`;
        disp += `\n\t interpret_only=${this.interpret_only}`;
        disp += `\n\t forced_interpret_only=${this.forced_interpret_only}`;
        disp += `\n\t have_method_entry_listeners=${this.have_method_entry_listeners}`;
        disp += `\n\t have_method_exit_listeners=${this.have_method_exit_listeners}`;
        disp += `\n\t have_method_unwind_listeners=${this.have_method_unwind_listeners}`;
        disp += `\n\t have_dex_pc_listeners=${this.have_dex_pc_listeners}`;
        disp += `\n\t have_field_read_listeners=${this.have_field_read_listeners}`;
        disp += `\n\t have_field_write_listeners=${this.have_field_write_listeners}`;
        disp += `\n\t have_exception_thrown_listeners=${this.have_exception_thrown_listeners}`;
        disp += `\n\t have_watched_frame_pop_listeners=${this.have_watched_frame_pop_listeners}`;
        disp += `\n\t have_branch_listeners=${this.have_branch_listeners}`;
        disp += `\n\t have_exception_handled_listeners=${this.have_exception_handled_listeners}`;
        disp += `\n\t requested_instrumentation_levels=${this.requested_instrumentation_levels}`;
        return disp;
    }
    get instrumentation_stubs_installed() {
        return this.instrumentation_stubs_installed_.readU8() == 1;
    }
    get entry_exit_stubs_installed() {
        return this.entry_exit_stubs_installed_.readU8() == 1;
    }
    get interpreter_stubs_installed() {
        return this.interpreter_stubs_installed_.readU8() == 1;
    }
    get interpret_only() {
        return this.interpret_only_.readU8() == 1;
    }
    get forced_interpret_only() {
        return this.forced_interpret_only_.readU8() == 1;
    }
    get have_method_entry_listeners() {
        return this.have_method_entry_listeners_.readU8() == 1;
    }
    get have_method_exit_listeners() {
        return this.have_method_exit_listeners_.readU8() == 1;
    }
    get have_method_unwind_listeners() {
        return this.have_method_unwind_listeners_.readU8() == 1;
    }
    get have_dex_pc_listeners() {
        return this.have_dex_pc_listeners_.readU8() == 1;
    }
    get have_field_read_listeners() {
        return this.have_field_read_listeners_.readU8() == 1;
    }
    get have_field_write_listeners() {
        return this.have_field_write_listeners_.readU8() == 1;
    }
    get have_exception_thrown_listeners() {
        return this.have_exception_thrown_listeners_.readU8() == 1;
    }
    get have_watched_frame_pop_listeners() {
        return this.have_watched_frame_pop_listeners_.readU8() == 1;
    }
    get have_branch_listeners() {
        return this.have_branch_listeners_.readU8() == 1;
    }
    get have_exception_handled_listeners() {
        return this.have_exception_handled_listeners_.readU8() == 1;
    }
    get requested_instrumentation_levels() {
        return this.requested_instrumentation_levels_;
    }
    static ForceInterpretOnly() {
        Instrumentation.Instance.interpret_only_.writeU8(1);
        Instrumentation.Instance.forced_interpret_only_.writeU8(1);
    }
    static AddListener(listener, events) {
        (0, SymHelper_1.callSym)("_ZN3art15instrumentation15Instrumentation11AddListenerEPNS0_23InstrumentationListenerEj", "libart.so", 'void', ['pointer', 'pointer', 'int'], Instrumentation.Instance.handle, new InstrumentationListener_1.InstrumentationListener(listener).VirtualPtr, events);
    }
}
exports.Instrumentation = Instrumentation;
globalThis.Instrumentation = Instrumentation;
},{"../../../../JSHandle":11,"../../../../Utils/SymHelper":15,"../../../../android":18,"./InstrumentationListener":31}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentationEvent = exports.InstrumentationListener = exports.InstrumentationListenerJsProxImpl = void 0;
const ArtMethod_1 = require("../mirror/ArtMethod");
const Object_1 = require("../../../../Object");
const JValue_1 = require("../Type/JValue");
const Thread_1 = require("../Thread");
const ObjPtr_1 = require("../ObjPtr");
class InstrumentationListenerJsProxImpl {
    static LOGD_ENABLE = true;
    constructor() { }
    MethodEntered(thread, this_object, method, dex_pc) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`MethodEntered: ${method.PrettyMethod(false)}`);
    }
    MethodExited(thread, this_object, method, dex_pc, return_value) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`MethodExited: ${method.PrettyMethod(false)}`);
    }
    MethodUnwind(thread, this_object, method, dex_pc) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`MethodUnwind: ${method.PrettyMethod(false)}`);
    }
    DexPcMoved(thread, this_object, method, new_dex_pc) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`DexPcMoved: ${method.PrettyMethod(false)}`);
    }
    FieldRead(thread, this_object, method, dex_pc, field) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`FieldRead: ${method.PrettyMethod(false)}`);
    }
    FieldWritten(thread, this_object, method, dex_pc, field, field_value) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`FieldWritten: ${method.PrettyMethod(false)}`);
    }
    ExceptionThrown(thread, exception_object) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`ExceptionThrown: ${exception_object}`);
    }
    ExceptionHandled(thread, exception_object) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`ExceptionHandled: ${exception_object}`);
    }
    Branch(thread, method, dex_pc, dex_pc_offset) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`Branch: ${method.PrettyMethod(false)}`);
    }
    WatchedFramePop(thread, frame) {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE)
            LOGD(`WatchedFramePop: ${frame}`);
    }
}
exports.InstrumentationListenerJsProxImpl = InstrumentationListenerJsProxImpl;
class InstrumentationListener {
    virtual_ptr;
    calls;
    calls_ptr;
    static MaxAlloc = 20;
    constructor(functions) {
        this.calls = functions;
        this.virtual_ptr = Memory.alloc(Process.pointerSize * 2);
        this.calls_ptr = Memory.alloc(Process.pointerSize * InstrumentationListener.MaxAlloc);
        this.virtual_ptr.writePointer(this.calls_ptr);
        this.CallsRefGet(InstrumentationListenerType.kMethodEntered).
            writePointer(new NativeCallback((thread_ptr, this_object_ptr, method_ptr, dex_pc) => {
            LOGW(`kMethodEntered: ${thread_ptr} ${this_object_ptr} ${method_ptr} ${dex_pc}`);
        }, "void", ["pointer", "pointer", "pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kMethodExited).
            writePointer(new NativeCallback((thread_ptr, this_object_ptr, method_ptr, dex_pc, return_value_ptr) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const this_object = new ObjPtr_1.ObjPtr(this_object_ptr);
            const method = new ArtMethod_1.ArtMethod(method_ptr);
            const return_value = new JValue_1.JValue(return_value_ptr);
            this.calls.MethodExited(thread, this_object, method, dex_pc.toUInt32(), return_value);
        }, "void", ["pointer", "pointer", "pointer", "pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kMethodUnwind).
            writePointer(new NativeCallback((thread_ptr, this_object_ptr, method_ptr, dex_pc) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const this_object = new ObjPtr_1.ObjPtr(this_object_ptr);
            const method = new ArtMethod_1.ArtMethod(method_ptr);
            this.calls.MethodUnwind(thread, this_object, method, dex_pc.toUInt32());
        }, "void", ["pointer", "pointer", "pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kDexPcMoved).
            writePointer(new NativeCallback((thread_ptr, this_object_ptr, method_ptr, dex_pc) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const this_object = new ObjPtr_1.ObjPtr(this_object_ptr);
            const method = new ArtMethod_1.ArtMethod(method_ptr);
            this.calls.DexPcMoved(thread, this_object, method, dex_pc.toUInt32());
        }, "void", ["pointer", "pointer", "pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kFieldRead).
            writePointer(new NativeCallback((thread_ptr, this_object_ptr, method_ptr, dex_pc, field_ptr) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const this_object = new ObjPtr_1.ObjPtr(this_object_ptr);
            const method = new ArtMethod_1.ArtMethod(method_ptr);
            const field = new Object_1.ArtObject(field_ptr);
            this.calls.FieldRead(thread, this_object, method, dex_pc.toUInt32(), field);
        }, "void", ["pointer", "pointer", "pointer", "pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kFieldWritten).
            writePointer(new NativeCallback((thread_ptr, this_object_ptr, method_ptr, dex_pc, field_ptr, field_value_ptr) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const this_object = new ObjPtr_1.ObjPtr(this_object_ptr);
            const method = new ArtMethod_1.ArtMethod(method_ptr);
            const field = new Object_1.ArtObject(field_ptr);
            const field_value = new JValue_1.JValue(field_value_ptr);
            this.calls.FieldWritten(thread, this_object, method, dex_pc.toUInt32(), field, field_value);
        }, "void", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kExceptionThrown).
            writePointer(new NativeCallback((thread_ptr, exception_object_ptr) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const exception_object = new ObjPtr_1.ObjPtr(exception_object_ptr);
            this.calls.ExceptionThrown(thread, exception_object);
        }, "void", ["pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kExceptionHandled).
            writePointer(new NativeCallback((thread_ptr, exception_object_ptr) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const exception_object = new ObjPtr_1.ObjPtr(exception_object_ptr);
            this.calls.ExceptionHandled(thread, exception_object);
        }, "void", ["pointer", "pointer"]));
        this.CallsRefGet(InstrumentationListenerType.kBranch).
            writePointer(new NativeCallback((thread_ptr, method_ptr, dex_pc, dex_pc_offset) => {
            const thread = new Thread_1.ArtThread(thread_ptr);
            const method = new ArtMethod_1.ArtMethod(method_ptr);
            this.calls.Branch(thread, method, dex_pc.toUInt32(), dex_pc_offset.toInt32());
        }, "void", ["pointer", "pointer", "pointer", "pointer"]));
    }
    CallsRefGet(index) {
        return this.calls_ptr.add(Process.pointerSize * index);
    }
    get VirtualPtr() {
        return this.virtual_ptr;
    }
}
exports.InstrumentationListener = InstrumentationListener;
var InstrumentationLevel;
(function (InstrumentationLevel) {
    InstrumentationLevel[InstrumentationLevel["kInstrumentNothing"] = 0] = "kInstrumentNothing";
    InstrumentationLevel[InstrumentationLevel["kInstrumentWithInstrumentationStubs"] = 1] = "kInstrumentWithInstrumentationStubs";
    InstrumentationLevel[InstrumentationLevel["kInstrumentWithInterpreter"] = 2] = "kInstrumentWithInterpreter";
})(InstrumentationLevel || (InstrumentationLevel = {}));
;
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
var InstrumentationListenerType;
(function (InstrumentationListenerType) {
    InstrumentationListenerType[InstrumentationListenerType["kMethodEntered"] = 0] = "kMethodEntered";
    InstrumentationListenerType[InstrumentationListenerType["kMethodExited"] = 1] = "kMethodExited";
    InstrumentationListenerType[InstrumentationListenerType["kMethodUnwind"] = 2] = "kMethodUnwind";
    InstrumentationListenerType[InstrumentationListenerType["kDexPcMoved"] = 3] = "kDexPcMoved";
    InstrumentationListenerType[InstrumentationListenerType["kFieldRead"] = 4] = "kFieldRead";
    InstrumentationListenerType[InstrumentationListenerType["kFieldWritten"] = 5] = "kFieldWritten";
    InstrumentationListenerType[InstrumentationListenerType["kExceptionThrown"] = 6] = "kExceptionThrown";
    InstrumentationListenerType[InstrumentationListenerType["kExceptionHandled"] = 7] = "kExceptionHandled";
    InstrumentationListenerType[InstrumentationListenerType["kBranch"] = 8] = "kBranch";
    InstrumentationListenerType[InstrumentationListenerType["kWatchedFramePop"] = 9] = "kWatchedFramePop";
})(InstrumentationListenerType || (InstrumentationListenerType = {}));
},{"../../../../Object":12,"../ObjPtr":42,"../Thread":49,"../Type/JValue":51,"../mirror/ArtMethod":71}],32:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../../../../Object":12,"../Globals":28,"../mirror/ArtMethod":71}],33:[function(require,module,exports){
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
        disp += `\n${this.frames_to_remove}`;
        return disp;
    }
    get SizeOfClass() {
        return super.SizeOfClass + (this.frames_to_remove_.add(0x4).sub(this.handle).toInt32());
    }
    get self() {
        return new Thread_1.ArtThread(this.self_.readPointer());
    }
    get frames_to_remove() {
        return this.frames_to_remove_.readU32();
    }
}
exports.InstrumentationStackPopper = InstrumentationStackPopper;
},{"../../../../JSHandle":11,"../Globals":28,"../Thread":49}],34:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnUsedInstruction = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const SymHelper_1 = require("../../../../Utils/SymHelper");
const Instruction_1 = require("../Instruction");
const ShadowFrame_1 = require("../ShadowFrame");
var UnUsedInstructions;
(function (UnUsedInstructions) {
    UnUsedInstructions[UnUsedInstructions["UNUSED_3E"] = 62] = "UNUSED_3E";
    UnUsedInstructions[UnUsedInstructions["UNUSED_3F"] = 63] = "UNUSED_3F";
    UnUsedInstructions[UnUsedInstructions["UNUSED_40"] = 64] = "UNUSED_40";
    UnUsedInstructions[UnUsedInstructions["UNUSED_41"] = 65] = "UNUSED_41";
    UnUsedInstructions[UnUsedInstructions["UNUSED_42"] = 66] = "UNUSED_42";
    UnUsedInstructions[UnUsedInstructions["UNUSED_43"] = 67] = "UNUSED_43";
    UnUsedInstructions[UnUsedInstructions["UNUSED_79"] = 121] = "UNUSED_79";
    UnUsedInstructions[UnUsedInstructions["UNUSED_7A"] = 122] = "UNUSED_7A";
    UnUsedInstructions[UnUsedInstructions["UNUSED_F3"] = 243] = "UNUSED_F3";
    UnUsedInstructions[UnUsedInstructions["UNUSED_F4"] = 244] = "UNUSED_F4";
    UnUsedInstructions[UnUsedInstructions["UNUSED_F5"] = 245] = "UNUSED_F5";
    UnUsedInstructions[UnUsedInstructions["UNUSED_F6"] = 246] = "UNUSED_F6";
    UnUsedInstructions[UnUsedInstructions["UNUSED_F7"] = 247] = "UNUSED_F7";
    UnUsedInstructions[UnUsedInstructions["UNUSED_F8"] = 248] = "UNUSED_F8";
    UnUsedInstructions[UnUsedInstructions["UNUSED_F9"] = 249] = "UNUSED_F9";
})(UnUsedInstructions || (UnUsedInstructions = {}));
class UnUsedInstruction extends JSHandle_1.JSHandleNotImpl {
    static listenerMap = new Map();
    static registerListener(opcode, listener) {
        if (!this.listenerMap.has(opcode)) {
            this.listenerMap.set(opcode, []);
        }
        this.listenerMap.get(opcode).push(listener);
    }
    static removeListener(opcode) {
        this.listenerMap.delete(opcode);
    }
    static catchUnexpectedOpcode() {
        const sym_addr = (0, SymHelper_1.getSym)("_ZN3art11interpreter16UnexpectedOpcodeEPKNS_11InstructionERKNS_11ShadowFrameE", "libart.so");
        const src_function = new NativeFunction(sym_addr, 'pointer', ['pointer', 'pointer']);
        Interceptor.replace(sym_addr, new NativeCallback((inst_, shadow_frame_) => {
            let inst = new Instruction_1.ArtInstruction(inst_);
            let shadow_frame = new ShadowFrame_1.ShadowFrame(shadow_frame_);
            if (UnUsedInstruction.listenerMap.has(inst.opcode) && UnUsedInstruction.listenerMap.get(inst.opcode).length > 0) {
                UnUsedInstruction.listenerMap.get(inst.opcode).forEach(listener => {
                    listener(inst, shadow_frame);
                });
            }
            else {
                shadow_frame.printBackTraceWithSmali();
                LOGD(`UnexpectedOpcode ${inst.toString()} ${shadow_frame.toString()}`);
                UnUsedInstruction.lastInsPtr.writePointer(UnUsedInstruction.lastInsValue);
                UnUsedInstruction.lastInsPtr.writePointer(UnUsedInstruction.lastInsValue);
            }
        }, 'pointer', ['pointer', 'pointer']));
    }
    static lastInsPtr = NULL;
    static lastInsValue = NULL;
    static ModSmaliInstruction(ptr, dexfile) {
        if (dexfile.IsReadOnly())
            dexfile.EnableWrite();
        UnUsedInstruction.lastInsValue = ptr.readPointer();
        UnUsedInstruction.lastInsPtr = ptr;
        ptr.writeU32(0x3E);
    }
    static newClass() {
        const rewardClass = Java.registerClass({
            name: "com.Test.CallbackClass",
            superClass: Java.use("java.lang.Object"),
            implements: undefined,
            methods: {
                ['onReward']: {
                    returnType: 'void',
                    argumentTypes: ['boolean'],
                    implementation: function (z) {
                        LOGW(`called CallbackClass -> onReward ${z}`);
                    }
                }
            }
        });
        return rewardClass;
    }
    static test() {
        return UnUsedInstruction.newClass().onReward.handle;
    }
}
exports.UnUsedInstruction = UnUsedInstruction;
setImmediate(() => { UnUsedInstruction.catchUnexpectedOpcode(); });
globalThis.ModSmaliInstruction = UnUsedInstruction.ModSmaliInstruction;
globalThis.test = () => { Java.perform(() => { LOGD(UnUsedInstruction.test()); }); };
}).call(this)}).call(this,require("timers").setImmediate)

},{"../../../../JSHandle":11,"../../../../Utils/SymHelper":15,"../Instruction":29,"../ShadowFrame":44,"timers":98}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./enum");
require("./UnUsedInstruction");
require("./Instrumentation");
require("./InstrumentationListener");
require("./InstrumentationStackFrame");
require("./InstrumentationStackPopper");
},{"./Instrumentation":30,"./InstrumentationListener":31,"./InstrumentationStackFrame":32,"./InstrumentationStackPopper":33,"./UnUsedInstruction":34,"./enum":35}],37:[function(require,module,exports){
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
},{"../../../JSHandle":11}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemMap = void 0;
const StdString_1 = require("../../../../../tools/StdString");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
class MemMap extends JSHandle_1.JSHandleNotImpl {
    name_ = this.handle;
    begin_ = this.name_.add(Globals_1.PointerSize * 3);
    size_ = this.begin_.add(Globals_1.PointerSize);
    base_begin_ = this.size_.add(Globals_1.PointerSize);
    base_size_ = this.base_begin_.add(Globals_1.PointerSize);
    prot_ = this.base_size_.add(Globals_1.PointerSize);
    reuse_ = this.prot_.add(Globals_1.PointerSize);
    already_unmapped_ = this.reuse_.add(Globals_1.PointerSize);
    redzone_size_ = this.already_unmapped_.add(Globals_1.PointerSize);
    toString() {
        let disp = `MemMap<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t name = ${this.name} @ ${this.name_}`;
        disp += `\n\t begin = ${this.begin} @ ${this.begin_}`;
        disp += `\n\t size = ${this.size} | ${ptr(this.size)} @ ${this.size_}`;
        disp += `\n\t base_begin = ${this.base_begin} @ ${this.base_begin_}`;
        disp += `\n\t base_size = ${this.base_size} | ${ptr(this.base_size)} @ ${this.base_size_}`;
        disp += `\n\t prot = ${this.prot} | ${ptr(this.prot)} @ ${this.prot_}`;
        disp += `\n\t reuse = ${this.reuse} @ ${this.reuse_}`;
        disp += `\n\t already_unmapped = ${this.already_unmapped} @ ${this.already_unmapped_}`;
        disp += `\n\t redzone_size = ${this.redzone_size} | ${ptr(this.redzone_size)} @ ${this.redzone_size_}`;
        return disp;
    }
    get name() {
        return new StdString_1.StdString(this.name_).toString();
    }
    get begin() {
        return this.begin_.readPointer();
    }
    get size() {
        return this.size_.toInt32();
    }
    get base_begin() {
        return this.base_begin_.readPointer();
    }
    get base_size() {
        return this.base_size_.toInt32();
    }
    get prot() {
        return this.prot_.toInt32();
    }
    get reuse() {
        return this.reuse_.toInt32() != 0;
    }
    get already_unmapped() {
        return this.already_unmapped_.toInt32() != 0;
    }
    get redzone_size() {
        return this.redzone_size_.toInt32();
    }
}
exports.MemMap = MemMap;
},{"../../../../../tools/StdString":88,"../../../../JSHandle":11,"../Globals":28}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OatDexFile = void 0;
const StdString_1 = require("../../../../../tools/StdString");
const JSHandle_1 = require("../../../../JSHandle");
const SymHelper_1 = require("../../../../Utils/SymHelper");
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
    static OpenWithElfFile(zip_fd, elf_file, vdex_file, location, abs_dex_location) {
        return (0, SymHelper_1.callSym)("_ZN3art7OatFile15OpenWithElfFileEiPNS_7ElfFileEPNS_8VdexFileERKNSt3__112basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEEPKcPSB_", "libart.so", "pointer", ["int", "pointer", "pointer", "pointer", "pointer"], zip_fd, elf_file, vdex_file, location, abs_dex_location);
    }
    static Open(zip_fd, filename, location, executable, low_4gb, abs_dex_location, reservation) {
        return (0, SymHelper_1.callSym)("_ZN3art7OatFile4OpenEiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEES9_bbPKcPNS_6MemMapEPS7_", "libart.so", "pointer", ["int", "pointer", "pointer", "bool", "bool", "pointer", "pointer"], zip_fd, filename, location, executable, low_4gb, abs_dex_location, reservation);
    }
    static Open2(zip_fd, vdex_fd, oat_fd, oat_location, executable, low_4gb, abs_dex_location, reservation) {
        return (0, SymHelper_1.callSym)("_ZN3art7OatFile4OpenEiiiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbPKcPNS_6MemMapEPS7_", "libart.so", "pointer", ["int", "int", "int", "pointer", "bool", "bool", "pointer", "pointer"], zip_fd, vdex_fd, oat_fd, oat_location, executable, low_4gb, abs_dex_location, reservation);
    }
}
exports.OatDexFile = OatDexFile;
class OatDexFile_Inl extends OatDexFile {
    static hookOpen_1() {
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art7OatFile4OpenEiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEES9_bbPKcPNS_6MemMapEPS7_", "libart.so"), {
            onEnter: function (args) {
                LOGD(`OatDexFile::Open(\n\tzip_fd=${args[0]}, \n\tfilename=${new StdString_1.StdString(args[1])}, \n\tlocation=${new StdString_1.StdString(args[2])}, \n\texecutable=${args[3]}, \n\tlow_4gb=${args[4]}, \n\tabs_dex_location=${new StdString_1.StdString(args[5])}, \n\treservation=${args[6]}`);
            }
        });
    }
    static hookOpen_2() {
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art7OatFile4OpenEiiiRKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbPKcPNS_6MemMapEPS7_", "libart.so"), {
            onEnter: function (args) {
                LOGD(`OatDexFile::Open(\n\tzip_fd=${args[0]}, \n\tvdex_fd=${args[1]}, \n\toat_fd=${args[2]}, \n\toat_location=${new StdString_1.StdString(args[3])}, \n\texecutable=${args[4]}, \n\tlow_4gb=${args[5]}, \n\tabs_dex_location=${new StdString_1.StdString(args[6])}, \n\treservation=${args[7]}`);
            }
        });
    }
    static hookOpenWithElfFile() {
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art7OatFile15OpenWithElfFileEiPNS_7ElfFileEPNS_8VdexFileERKNSt3__112basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEEPKcPSB_", "libart.so"), {
            onEnter: function (args) {
                LOGD(`OatDexFile::OpenWithElfFile(\n\tzip_fd=${args[0]}, \n\telf_file=${args[1]}, \n\tvdex_file=${args[2]}, \n\tlocation=${new StdString_1.StdString(args[3])}, \n\tabs_dex_location=${new StdString_1.StdString(args[4])})`);
            }
        });
    }
    static hookOpen_3() {
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art11OatFileBase11OpenOatFileINS_10ElfOatFileEEEPS0_iiiRKNSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESC_bbbPKcPNS_6MemMapEPSA_", "libart.so"), {
            onEnter: function (args) {
                LOGD(`OatDexFile::OpenOatFile(\n\tzip_fd=${args[0]}, \n\tvdex_filename=${new StdString_1.StdString(args[1])}, \n\telf_filename=${new StdString_1.StdString(args[2])}, \n\tlocation=${new StdString_1.StdString(args[3])}, \n\twritable=${args[4]}, \n\texecutable=${args[5]}, \n\tlow_4gb=${args[6]}, \n\tabs_dex_location=${new StdString_1.StdString(args[7])}, \n\treservation=${args[8]}`);
            }
        });
    }
    static hookOpen_4() {
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art13DlOpenOatFile4LoadERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEbbbPNS_6MemMapEPS7_", "libart.so"), {
            onEnter: function (args) {
                LOGD(`DlOpenOatFile::Load(\n\telf_filename=${new StdString_1.StdString(args[1])}, \n\twritable=${args[2]}, \n\texecutable=${args[3]}, \n\tlow_4gb=${args[4]}, \n\treservation=${args[5]}`);
                args[2] = ptr(1);
            }
        });
    }
    static hookOpen_5() {
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art10ElfOatFile4LoadEibbbPNS_6MemMapEPNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEE", "libart.so"), {
            onEnter: function (args) {
                LOGD(`OatDexFile::Load(\n\telf_filename=${new StdString_1.StdString(args[1])}, \n\twritable=${args[2]}, \n\texecutable=${args[3]}, \n\tlow_4gb=${args[4]}, \n\treservation=${args[5]}`);
                args[2] = ptr(1);
            }
        });
    }
}
},{"../../../../../tools/StdString":88,"../../../../JSHandle":11,"../../../../Utils/SymHelper":15,"../Globals":28,"./OatFile":40}],40:[function(require,module,exports){
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
},{"../../../../../tools/StdString":88,"../../../../JSHandle":11,"../Globals":28}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./OatFile");
require("./OatDexFile");
require("./MemMap");
},{"./MemMap":38,"./OatDexFile":39,"./OatFile":40}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectReference = exports.ObjPtr = void 0;
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
class ObjectReference extends JSHandle_1.JSHandle {
    reference_ = this.handle;
    static SizeOfClass = 0x4;
    constructor(handle) {
        super(handle);
    }
    get reference() {
        return ptr(this.reference_.readU32());
    }
}
exports.ObjectReference = ObjectReference;
},{"../../../JSHandle":11}],43:[function(require,module,exports){
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
},{"../../../JSHandle":11}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowFrame = void 0;
const CodeItemInstructionAccessor_1 = require("./dexfile/CodeItemInstructionAccessor");
const SymHelper_1 = require("../../../Utils/SymHelper");
const Instruction_1 = require("./Instruction");
const ArtMethod_1 = require("./mirror/ArtMethod");
const JSHandle_1 = require("../../../JSHandle");
const Object_1 = require("../../../Object");
const ObjPtr_1 = require("./ObjPtr");
const Globals_1 = require("./Globals");
const JValue_1 = require("./Type/JValue");
class ShadowFrame extends JSHandle_1.JSHandle {
    link_ = this.CurrentHandle;
    method_ = this.link_.add(Globals_1.PointerSize);
    result_register_ = this.method_.add(Globals_1.PointerSize);
    dex_pc_ptr_ = this.result_register_.add(Globals_1.PointerSize);
    dex_instructions_ = this.dex_pc_ptr_.add(Globals_1.PointerSize);
    lock_count_data_ = this.dex_instructions_.add(Globals_1.PointerSize);
    number_of_vregs_ = this.lock_count_data_.add(Globals_1.PointerSize);
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
        if (this.handle.isNull())
            return disp;
        disp += `\n\t link_: ${this.link_}`;
        disp += `\n\t method_: ${this.method_} -> ${this.method.PrettyMethod()}`;
        disp += `\n\t result_register: ${this.result_register}`;
        disp += `\n\t dex_pc_ptr: ${this.dex_pc_ptr}`;
        disp += `\n\t dex_instructions: ${this.dex_instructions.toString().split('\n').map((item, index) => index == 0 ? item : `\n\t${item}`).join('')}`;
        disp += `\n\t number_of_vregs: ${this.NumberOfVRegs}`;
        disp += `\n\t dex_pc: ${this.dex_pc} | GetDexPC: ${this.GetDexPC()}`;
        disp += `\n\t cached_hotness_countdown: ${this.cached_hotness_countdown}`;
        disp += `\n\t hotness_countdown: ${this.hotness_countdown}`;
        disp += `\n\t frame_flags: ${this.frame_flags}`;
        disp += `\n\t vregs_: ${this.vregs_}`;
        return disp;
    }
    get link() {
        return new ShadowFrame(this.link_.readPointer());
    }
    get method() {
        if (this.method_.isNull())
            return null;
        try {
            return new ArtMethod_1.ArtMethod(this.method_.readPointer());
        }
        catch (error) {
            return null;
        }
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
    get lock_count_data() {
        return this.lock_count_data_.readPointer();
    }
    get NumberOfVRegs() {
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
    get DexInstructions() {
        return CodeItemInstructionAccessor_1.CodeItemInstructionAccessor.fromDexFile(this.method.GetDexFile(), this.dex_instructions_);
    }
    get vregs() {
        const vregs = [];
        for (let i = 0; i < this.NumberOfVRegs; i++) {
            vregs.push(this.vregs_.add(i * 4).readInt());
        }
        return vregs;
    }
    get vreg_refs() {
        const vreg_refs = [];
        for (let i = 0; i < this.NumberOfVRegs; i++) {
            vreg_refs.push(this.GetVRegReference(i));
        }
        return vreg_refs;
    }
    SetVRegReference(i, val) {
        this.vregs_.add(this.NumberOfVRegs * 0x4 + i * Globals_1.PointerSize).writePointer(val.handle);
    }
    GetVRegReference(i) {
        let ref = new ObjPtr_1.ObjectReference(this.vregs_.add(this.NumberOfVRegs * 0x4 + i * ObjPtr_1.ObjectReference.SizeOfClass)).reference;
        return new Object_1.ArtObject(ref);
    }
    GetVReg(i) {
        return this.vregs_.add(i * 4).readU32();
    }
    SetVReg(i, val) {
        this.vregs_.add(i * 4).writeU32(val);
    }
    GetVRegFloat(i) {
        return this.vregs_.add(i * 4).readFloat();
    }
    SetVRegFloat(i, val) {
        this.vregs_.add(i * 4).writeFloat(val);
    }
    GetVRegLong(i) {
        return this.vregs_.add(i * 4).readS64();
    }
    SetVRegLong(i, val) {
        this.vregs_.add(i * 4).writeS64(val);
    }
    GetVRegDouble(i) {
        return this.vregs_.add(i * 4).readDouble();
    }
    SetVRegDouble(i, val) {
        this.vregs_.add(i * 4).writeDouble(val);
    }
    sizeInCodeUnitsComplexOpcode() {
        return (0, SymHelper_1.callSym)("_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv", "libdexfile.so", ["pointer"], ["pointer"], this.handle);
    }
    GetThisObject() {
        return new Object_1.ArtObject((0, SymHelper_1.callSym)("_ZNK3art11ShadowFrame13GetThisObjectEt", "libart.so", ["pointer", "uint16"], ["pointer", "uint16"], this.handle, 0));
    }
    GetThisObject_num_ins(num_ins) {
        return new Object_1.ArtObject((0, SymHelper_1.callSym)("_ZNK3art11ShadowFrame13GetThisObjectEt", "libart.so", ["pointer", "uint16"], ["pointer", "uint16"], this.handle, num_ins));
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
            const ins_size = thisMethod.DexInstructions().CodeItem.ins_size;
            let disp_smali = '';
            disp_smali += '\t' + sf.vregs.map((vreg, index) => index < ins_size ? `p${index}=${vreg}` : `v${index}=${vreg}`).join(', ') + '\n';
            disp_smali += '\t' + sf.vreg_refs.map((vreg, index) => sf.vregs[index] != 0 ? (index < ins_size ? `p${index}=${vreg.simpleDisp()}` : `v${index}=${vreg.simpleDisp()}`) : "null").join('\n\t') + '\n';
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
globalThis.ShadowFrame = ShadowFrame;
},{"../../../JSHandle":11,"../../../Object":12,"../../../Utils/SymHelper":15,"./Globals":28,"./Instruction":29,"./ObjPtr":42,"./Type/JValue":51,"./dexfile/CodeItemInstructionAccessor":59,"./mirror/ArtMethod":71}],45:[function(require,module,exports){
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
},{"./StackVisitor":47}],46:[function(require,module,exports){
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
},{"./StackVisitor":47}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackWalkKind = exports.VRegKind = exports.StackVisitor = void 0;
const QuickMethodFrameInfo_1 = require("../QuickMethodFrameInfo");
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const StdString_1 = require("../../../../../tools/StdString");
const SymHelper_1 = require("../../../../Utils/SymHelper");
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
        return new StackVisitor((0, SymHelper_1.callSym)("_ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEb", "libart.so", "pointer", ["pointer", "pointer", "int", "bool"], thread, context, walk_kind, check_suspended));
    }
    GetDexPc(abort_on_failure) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor8GetDexPcEb", "libart.so", "int", ["pointer", "int"], this.CurrentHandle, abort_on_failure);
    }
    GetMethod() {
        return new ArtMethod_1.ArtMethod((0, SymHelper_1.callSym)("_ZNK3art12StackVisitor9GetMethodEv", "libart.so", "pointer", ["pointer"], this.CurrentHandle));
    }
    GetGPR(reg) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor6GetGPREj", "libart.so", "pointer", ["pointer", "int"], this.handle, reg);
    }
    GetVRegPairFromOptimizedCode(m, vreg, kind_lo, kind_hi, val) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor28GetVRegPairFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindES3_Pm", "libart.so", "pointer", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind_lo, kind_hi, val).isNull();
    }
    GetGPRAddress(reg) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor13GetGPRAddressEj", "libart.so", "pointer", ["pointer", "int"], this.handle, reg);
    }
    SanityCheckFrame() {
        (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor16SanityCheckFrameEv", "libart.so", "void", ["pointer"], this.handle);
    }
    SetMethod(method) {
        (0, SymHelper_1.callSym)("_ZN3art12StackVisitor9SetMethodEPNS_9ArtMethodE", "libart.so", "void", ["pointer", "pointer"], this.handle, method.handle);
    }
    ComputeNumFrames(thread, walk_kind) {
        return (0, SymHelper_1.callSym)("_ZN3art12StackVisitor16ComputeNumFramesEPNS_6ThreadENS0_13StackWalkKindE", "libart.so", "int", ["pointer", "pointer", "int"], this.handle, thread, walk_kind);
    }
    WalkStack_0(include_transitions) {
        (0, SymHelper_1.callSym)("_ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE0EEEvb", "libart.so", "void", ["pointer", "bool"], this.handle, include_transitions);
    }
    WalkStack_1(include_transitions) {
        (0, SymHelper_1.callSym)("_ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE1EEEvb", "libart.so", "void", ["pointer", "bool"], this.handle, include_transitions);
    }
    GetReturnPc() {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor11GetReturnPcEv", "libart.so", "pointer", ["pointer"], this.handle);
    }
    SetReturnPc(new_ret_pc) {
        (0, SymHelper_1.callSym)("_ZN3art12StackVisitor11SetReturnPcEm", "libart.so", "void", ["pointer", "pointer"], this.handle, new_ret_pc);
    }
    DescribeStack(thread) {
        (0, SymHelper_1.callSym)("_ZN3art12StackVisitor13DescribeStackEPNS_6ThreadE", "libart.so", "void", ["pointer", "pointer"], this.handle, thread.handle);
    }
    GetVRegFromOptimizedCode(m, vreg, kind, val) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor24GetVRegFromOptimizedCodeEPNS_9ArtMethodEtNS_8VRegKindEPj", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind, val);
    }
    GetVRegPair(m, vreg, kind_lo, kind_hi, val) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor11GetVRegPairEPNS_9ArtMethodEtNS_8VRegKindES3_Pm", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind_lo, kind_hi, val);
    }
    SetVReg(m, vreg, new_value, kind) {
        return (0, SymHelper_1.callSym)("_ZN3art12StackVisitor7SetVRegEPNS_9ArtMethodEtjNS_8VRegKindE", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, new_value, kind);
    }
    GetVReg(m, vreg, kind) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor7GetVRegEPNS_9ArtMethodEtNS_8VRegKindEPj", "libart.so", "int", ["pointer", "pointer", "short", "int", "int"], this.handle, m.handle, vreg, kind);
    }
    GetNativePcOffset() {
        return (0, SymHelper_1.callSym)("_ZN3art12StackVisitor19GetNativePcOffsetEv", "libart.so", "int", ["pointer"], this.handle);
    }
    SetVRegPair(m, vreg, new_value, kind_lo, kind_hi) {
        return (0, SymHelper_1.callSym)("_ZN3art12StackVisitor11SetVRegPairEPNS_9ArtMethodEtmNS_8VRegKindES3_", "libart.so", "int", ["pointer", "pointer", "short", "int", "int", "int"], this.handle, m.handle, vreg, new_value, kind_lo, kind_hi);
    }
    DescribeLocation() {
        return StdString_1.StdString.fromPointer((0, SymHelper_1.callSym)("_ZNK3art12StackVisitor16DescribeLocationEv", "libart.so", "pointer", ["pointer"], this.handle));
    }
    GetCurrentQuickFrameInfo() {
        return new QuickMethodFrameInfo_1.QuickMethodFrameInfo((0, SymHelper_1.callSym)("_ZNK3art12StackVisitor24GetCurrentQuickFrameInfoEv", "libart.so", "pointer", ["pointer"], this.handle));
    }
    IsAccessibleGPR(reg) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor15IsAccessibleGPREj", "libart.so", "bool", ["pointer", "int"], this.handle, reg);
    }
    GetFPR(reg) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor6GetFPREj", "libart.so", "pointer", ["pointer", "int"], this.handle, reg);
    }
    GetVRegPairFromDebuggerShadowFrame(vreg, kind_lo, kind_hi, val) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor34GetVRegPairFromDebuggerShadowFrameEtNS_8VRegKindES1_Pm", "libart.so", "int", ["pointer", "int", "int", "int"], this.handle, vreg, kind_lo, kind_hi, val);
    }
    GetVRegFromDebuggerShadowFrame(vreg, kind) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor30GetVRegFromDebuggerShadowFrameEtNS_8VRegKindEPj", "libart.so", "int", ["pointer", "short", "pointer"], this.handle, vreg, kind);
    }
    GetRegisterPairIfAccessible(reg_lo, reg_hi, kind_lo, val) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor27GetRegisterPairIfAccessibleEjjNS_8VRegKindEPm", "libart.so", "int", ["pointer", "int", "int", "int", "int"], this.handle, reg_lo, reg_hi, kind_lo, val);
    }
    GetRegisterIfAccessible(reg, kind, val) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor23GetRegisterIfAccessibleEjNS_8VRegKindEPj", "libart.so", "int", ["pointer", "int", "int"], this.handle, reg, kind, val);
    }
    IsAccessibleFPR(reg) {
        return (0, SymHelper_1.callSym)("_ZNK3art12StackVisitor15IsAccessibleFPREj", "libart.so", "bool", ["pointer", "int"], this.handle, reg);
    }
    GetThisObject() {
        return new Object_1.ArtObject((0, SymHelper_1.callSym)("_ZNK3art12StackVisitor13GetThisObjectEv", "libart.so", "pointer", ["pointer"], this.handle));
    }
    GetNextMethodAndDexPc(next_method, next_dex_pc) {
        return (0, SymHelper_1.callSym)("_ZN3art12StackVisitor20GetNextMethodAndDexPcEPPNS_9ArtMethodEPj", "libart.so", "bool", ["pointer", "pointer", "pointer"], this.handle, next_method, next_dex_pc);
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
},{"../../../../../tools/StdString":88,"../../../../JSHandle":11,"../../../../Object":12,"../../../../Utils/SymHelper":15,"../Globals":28,"../OatQuickMethodHeader":37,"../QuickMethodFrameInfo":43,"../ShadowFrame":44,"../Thread":49,"../mirror/ArtMethod":71}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StackVisitor");
require("./CHAStackVisitor");
require("./CatchBlockStackVisitor");
},{"./CHAStackVisitor":45,"./CatchBlockStackVisitor":46,"./StackVisitor":47}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtThread = void 0;
const Thread_Inl_1 = require("./Thread_Inl");
const SymHelper_1 = require("../../../Utils/SymHelper");
const StdString_1 = require("../../../../tools/StdString");
const ArtMethod_1 = require("./mirror/ArtMethod");
const JSHandle_1 = require("../../../JSHandle");
const Globals_1 = require("./Globals");
class ArtThread extends JSHandle_1.JSHandle {
    tls32_;
    tls64_;
    tlsPtr_;
    interpreter_cache_;
    wait_mutex_;
    wait_cond_;
    wait_monitor_;
    debug_disallow_read_barrier_;
    poison_object_cookie_;
    checkpoint_overflow_;
    custom_tls_;
    is_runtime_thread_;
    constructor(handle) {
        super(handle);
        return;
        this.tls32_ = {
            state_and_flags: this.handle,
            suspend_count: this.tls32_.state_and_flags.add(0x4 * 3),
            debug_suspend_count: this.tls32_.suspend_count.add(0x4),
            thin_lock_thread_id: this.tls32_.debug_suspend_count.add(0x4),
            tid: this.tls32_.thin_lock_thread_id.add(0x4),
            daemon: this.tls32_.tid.add(0x4),
            throwing_OutOfMemoryError: this.tls32_.daemon.add(0x4),
            no_thread_suspension: this.tls32_.throwing_OutOfMemoryError.add(0x4),
            thread_exit_check_count: this.tls32_.no_thread_suspension.add(0x4),
            handling_signal_: this.tls32_.thread_exit_check_count.add(0x4),
            is_transitioning_to_runnable: this.tls32_.handling_signal_.add(0x4),
            ready_for_debug_invoke: this.tls32_.is_transitioning_to_runnable.add(0x4),
            debug_method_entry_: this.tls32_.ready_for_debug_invoke.add(0x4),
            is_gc_marking: this.tls32_.debug_method_entry_.add(0x4),
            interrupted: this.tls32_.is_gc_marking.add(0x4),
            park_state_: this.tls32_.interrupted.add(0x4),
            weak_ref_access_enabled: this.tls32_.park_state_.add(0x4),
            disable_thread_flip_count: this.tls32_.weak_ref_access_enabled.add(0x4),
            user_code_suspend_count: this.tls32_.disable_thread_flip_count.add(0x4),
            force_interpreter_count: this.tls32_.user_code_suspend_count.add(0x4),
            use_mterp: this.tls32_.force_interpreter_count.add(0x4)
        };
        this.tls64_ = {
            trace_clock_base: this.tls32_.use_mterp.add(0x4),
            stats: new Thread_Inl_1.RuntimeStats(this.tls32_.use_mterp.add(0x8))
        };
        this.tlsPtr_ = {
            card_table: this.tls64_.stats.handle.add(Thread_Inl_1.RuntimeStats.SizeOfClass),
            exception: this.tlsPtr_.card_table.add(Globals_1.PointerSize),
            stack_end: this.tlsPtr_.exception.add(Globals_1.PointerSize),
            managed_stack: this.tlsPtr_.stack_end.add(Globals_1.PointerSize),
            suspend_trigger: this.tlsPtr_.managed_stack.add(Globals_1.PointerSize),
            jni_env: this.tlsPtr_.suspend_trigger.add(Globals_1.PointerSize),
            tmp_jni_env: this.tlsPtr_.jni_env.add(Globals_1.PointerSize),
            self: this.tlsPtr_.tmp_jni_env.add(Globals_1.PointerSize),
            opeer: this.tlsPtr_.self.add(Globals_1.PointerSize),
            jpeer: this.tlsPtr_.opeer.add(Globals_1.PointerSize),
            stack_begin: this.tlsPtr_.jpeer.add(Globals_1.PointerSize),
            stack_size: this.tlsPtr_.stack_begin.add(Globals_1.PointerSize),
            DepsOrStackTraceSample: {
                verifier_deps: this.tlsPtr_.stack_size.add(Globals_1.PointerSize),
                stack_trace_sample: this.tlsPtr_.stack_size.add(Globals_1.PointerSize)
            },
            wait_next: this.tlsPtr_.DepsOrStackTraceSample.stack_trace_sample.add(Globals_1.PointerSize),
            monitor_enter_object: this.tlsPtr_.wait_next.add(Globals_1.PointerSize),
            top_handle_scope: this.tlsPtr_.monitor_enter_object.add(Globals_1.PointerSize),
            class_loader_override: this.tlsPtr_.top_handle_scope.add(Globals_1.PointerSize),
            long_jump_context: this.tlsPtr_.class_loader_override.add(Globals_1.PointerSize),
            instrumentation_stack: this.tlsPtr_.long_jump_context.add(Globals_1.PointerSize),
            debug_invoke_req: this.tlsPtr_.instrumentation_stack.add(Globals_1.PointerSize),
            single_step_control: this.tlsPtr_.debug_invoke_req.add(Globals_1.PointerSize),
            stacked_shadow_frame_record: this.tlsPtr_.single_step_control.add(Globals_1.PointerSize),
            deoptimization_context_stack: this.tlsPtr_.stacked_shadow_frame_record.add(Globals_1.PointerSize),
            frame_id_to_shadow_frame: this.tlsPtr_.deoptimization_context_stack.add(Globals_1.PointerSize),
            name: this.tlsPtr_.frame_id_to_shadow_frame.add(Globals_1.PointerSize),
            pthread_self: this.tlsPtr_.name.add(Globals_1.PointerSize),
            last_no_thread_suspension_cause: this.tlsPtr_.pthread_self.add(Globals_1.PointerSize),
            checkpoint_function: this.tlsPtr_.last_no_thread_suspension_cause.add(Globals_1.PointerSize),
            active_suspend_barriers: this.tlsPtr_.checkpoint_function.add(Globals_1.PointerSize),
            thread_local_start: this.tlsPtr_.active_suspend_barriers.add(Globals_1.PointerSize),
            thread_local_pos: this.tlsPtr_.thread_local_start.add(Globals_1.PointerSize),
            thread_local_end: this.tlsPtr_.thread_local_pos.add(Globals_1.PointerSize),
            thread_local_limit: this.tlsPtr_.thread_local_end.add(Globals_1.PointerSize),
            thread_local_objects: this.tlsPtr_.thread_local_limit.add(Globals_1.PointerSize),
            jni_entrypoints: this.tlsPtr_.thread_local_objects.add(Globals_1.PointerSize),
            quick_entrypoints: this.tlsPtr_.jni_entrypoints.add(Globals_1.PointerSize),
            mterp_current_ibase: this.tlsPtr_.quick_entrypoints.add(Globals_1.PointerSize),
            rosalloc_runs: this.tlsPtr_.mterp_current_ibase.add(Globals_1.PointerSize),
            thread_local_alloc_stack_top: this.tlsPtr_.rosalloc_runs.add(Globals_1.PointerSize),
            thread_local_alloc_stack_end: this.tlsPtr_.thread_local_alloc_stack_top.add(Globals_1.PointerSize),
            held_mutexes: this.tlsPtr_.thread_local_alloc_stack_end.add(Globals_1.PointerSize),
            flip_function: this.tlsPtr_.held_mutexes.add(Globals_1.PointerSize),
            method_verifier: this.tlsPtr_.flip_function.add(Globals_1.PointerSize),
            thread_local_mark_stack: this.tlsPtr_.method_verifier.add(Globals_1.PointerSize),
            async_exception: this.tlsPtr_.thread_local_mark_stack.add(Globals_1.PointerSize)
        };
        this.interpreter_cache_ = this.tlsPtr_.async_exception.add(Globals_1.PointerSize);
        this.wait_mutex_ = this.interpreter_cache_.add(16);
        this.wait_cond_ = this.wait_mutex_.add(Globals_1.PointerSize);
        this.wait_monitor_ = this.wait_cond_.add(Globals_1.PointerSize);
        this.debug_disallow_read_barrier_ = this.wait_monitor_.add(Globals_1.PointerSize);
        this.poison_object_cookie_ = this.debug_disallow_read_barrier_.add(1);
        this.checkpoint_overflow_ = this.poison_object_cookie_.add(7 + Globals_1.PointerSize);
        this.custom_tls_ = this.checkpoint_overflow_.add(Globals_1.PointerSize);
        this.is_runtime_thread_ = this.custom_tls_.add(Globals_1.PointerSize);
    }
    toString() {
        let disp = `ArtThread<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t ThreadName=${this.GetThreadName()}`;
        disp += `\n\t is_started=${this.is_started}`;
        return disp;
    }
    get tls_ptr_managed_stack() {
        return new Thread_Inl_1.ManagedStack(this.tlsPtr_.managed_stack.readPointer());
    }
    get tls_ptr_stack_begin() {
        return this.tlsPtr_.stack_begin.readPointer();
    }
    get tls_ptr_stack_size() {
        return this.tlsPtr_.stack_size.readPointer().toInt32();
    }
    get tls_ptr_stack_end() {
        return this.tlsPtr_.stack_end.readPointer();
    }
    get tls_ptr_name() {
        return this.tlsPtr_.name.readCString();
    }
    get tls_ptr_self() {
        return new ArtThread(this.tlsPtr_.self.readPointer());
    }
    get tls_ptr_jni_env() {
        return this.tlsPtr_.jni_env.readPointer();
    }
    get is_started() {
        return (0, SymHelper_1.getSym)("_ZN3art6Thread11is_started_E", "libart.so").readU8() == 1;
    }
    GetThreadName() {
        return StdString_1.StdString.from((0, SymHelper_1.callSym)("_ZNK3art6Thread13GetThreadNameEv", "libart.so", "pointer", ["pointer"], this.CurrentHandle));
    }
    SetThreadName(name) {
        (0, SymHelper_1.callSym)("_ZN3art6Thread13SetThreadNameEPKc", "libart.so", "void", ["pointer", "pointer"], this.CurrentHandle, Memory.allocUtf8String(name));
    }
    DumpJavaStack(check_suspended = true, dump_locks = true) {
        let stdStr = new StdString_1.StdString();
        (0, SymHelper_1.callSym)("_ZNK3art6Thread13DumpJavaStackERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEEbb", "libart.so", "void", ["pointer", "bool", "bool"], this.CurrentHandle, stdStr, check_suspended, dump_locks);
        return stdStr.disposeToString();
    }
    NumberOfHeldMutexes() {
        return (0, SymHelper_1.callSym)("_ZNK3art6Thread19NumberOfHeldMutexesEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    SetClassLoaderOverride(class_loader) {
        (0, SymHelper_1.callSym)("_ZN3art6Thread22SetClassLoaderOverrideEP8_jobject", "libart.so", "void", ["pointer", "pointer"], this.CurrentHandle, class_loader.handle);
    }
    FindDebuggerShadowFrame(frame_id) {
        return (0, SymHelper_1.callSym)("_ZN3art6Thread23FindDebuggerShadowFrameEm", "libart.so", "pointer", ["pointer", "int"], this.CurrentHandle, frame_id);
    }
    Park(is_absolute = true, time = 10) {
        (0, SymHelper_1.callSym)("_ZN3art6Thread4ParkEbl", "libart.so", "void", ["pointer", "pointer", "pointer"], this.CurrentHandle, ptr(is_absolute ? 1 : 0), ptr(time));
    }
    Unpark() {
        (0, SymHelper_1.callSym)("_ZN3art6Thread6UnparkEv", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    Notify() {
        (0, SymHelper_1.callSym)("_ZN3art6Thread6NotifyEv", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    static GetNativePriority() {
        return (0, SymHelper_1.callSym)("_ZN3art6Thread17GetNativePriorityEv", "libart.so", "int", []);
    }
    CanLoadClasses() {
        return !!(0, SymHelper_1.callSym)("_ZNK3art6Thread14CanLoadClassesEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    GetCurrentMethod(dex_pc = 0, check_suspended = true, abort_on_error = true) {
        return new ArtMethod_1.ArtMethod((0, SymHelper_1.callSym)("_ZNK3art6Thread16GetCurrentMethodEPjbb", "libart.so", "pointer", ["pointer", "pointer", "pointer", "pointer"], this.CurrentHandle, ptr(dex_pc), ptr(check_suspended ? 1 : 0), ptr(abort_on_error ? 1 : 0)));
    }
    Interrupt() {
        (0, SymHelper_1.callSym)("_ZN3art6Thread9InterruptEPS0_", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    IsInterrupted() {
        return !!(0, SymHelper_1.callSym)("_ZN3art6Thread13IsInterruptedEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    Interrupted() {
        return !!(0, SymHelper_1.callSym)("_ZN3art6Thread11InterruptedEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    IsSystemDaemon() {
        return !!(0, SymHelper_1.callSym)("_ZNK3art6Thread14IsSystemDaemonEv", "libart.so", "int", ["pointer"], this.CurrentHandle);
    }
    static IsAotCompiler() {
        return !!(0, SymHelper_1.callSym)("_ZN3art6Thread13IsAotCompilerEv", "libart.so", "int", []);
    }
    ProtectStack(fatal_on_error = true) {
        return !!(0, SymHelper_1.callSym)("_ZN3art6Thread12ProtectStackEb", "libart.so", "int", ["pointer", "bool"], this.CurrentHandle, fatal_on_error);
    }
    UnprotectStack() {
        (0, SymHelper_1.callSym)("_ZN3art6Thread14UnprotectStackEv", "libart.so", "void", ["pointer"], this.CurrentHandle);
    }
    HandleScopeContains(obj) {
        return !!(0, SymHelper_1.callSym)("_ZNK3art6Thread19HandleScopeContainsEP8_jobject", "libart.so", "int", ["pointer", "pointer"], this.CurrentHandle, obj.handle);
    }
    static Attach_3(thread_name, as_daemon, thread_peer) {
        return new ArtThread((0, SymHelper_1.callSym)("_ZN3art6Thread6AttachEPKcbP8_jobject", "libart.so", "pointer", ["pointer", "bool", "pointer"], Memory.allocUtf8String(thread_name), as_daemon, thread_peer.handle));
    }
    static Attach_4(thread_name, as_daemon, thread_group, create_peer) {
        return new ArtThread((0, SymHelper_1.callSym)("_ZN3art6Thread6AttachEPKcbP8_jobjectb", "libart.so", "pointer", ["pointer", "bool", "pointer", "bool"], Memory.allocUtf8String(thread_name), as_daemon, thread_group.handle, create_peer));
    }
}
exports.ArtThread = ArtThread;
},{"../../../../tools/StdString":88,"../../../JSHandle":11,"../../../Utils/SymHelper":15,"./Globals":28,"./Thread_Inl":50,"./mirror/ArtMethod":71}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedStack = exports.RuntimeStats = exports.StateAndFlags = void 0;
const JSHandle_1 = require("../../../JSHandle");
const ShadowFrame_1 = require("./ShadowFrame");
const Globals_1 = require("./Globals");
class StateAndFlags extends JSHandle_1.JSHandleNotImpl {
    as_struct;
    as_atomic_int = this.handle.add(0x4);
    as_int = this.handle.add(0x4);
    constructor(handle) {
        super(handle);
        this.as_struct = {
            flags: this.handle,
            state: this.handle
        };
    }
    toString() {
        let disp = `StateAndFlags<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t flags=${this.flags}`;
        disp += `\n\t state=${this.state}`;
        return disp;
    }
    get flags() {
        return this.as_struct.flags.readU16();
    }
    get state() {
        return this.as_struct.state.readU16();
    }
    get as_atomic_int_value() {
        return this.as_atomic_int.readS32();
    }
    get as_int_value() {
        return this.as_int.readS32();
    }
    static get SizeOfClass() {
        return 0x4 * 3;
    }
}
exports.StateAndFlags = StateAndFlags;
class RuntimeStats extends JSHandle_1.JSHandleNotImpl {
    allocated_objects = this.handle;
    allocated_bytes = this.allocated_objects.add(0x8);
    freed_objects = this.allocated_bytes.add(0x8);
    freed_bytes = this.freed_objects.add(0x8);
    gc_for_alloc_count = this.freed_bytes.add(0x8);
    class_init_count = this.gc_for_alloc_count.add(0x8);
    class_init_time_ns = this.class_init_count.add(0x8);
    toString() {
        let disp = `RuntimeStats<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t allocated_objects=${this.allocated_objects}`;
        disp += `\n\t allocated_bytes=${this.allocated_bytes}`;
        disp += `\n\t freed_objects=${this.freed_objects}`;
        disp += `\n\t freed_bytes=${this.freed_bytes}`;
        disp += `\n\t gc_for_alloc_count=${this.gc_for_alloc_count}`;
        disp += `\n\t class_init_count=${this.class_init_count}`;
        disp += `\n\t class_init_time_ns=${this.class_init_time_ns}`;
        return disp;
    }
    static get SizeOfClass() {
        return 0x8 * 7;
    }
}
exports.RuntimeStats = RuntimeStats;
class ManagedStack extends JSHandle_1.JSHandleNotImpl {
    tagged_top_quick_frame_;
    link_;
    top_shadow_frame_;
    constructor(handle) {
        super(handle);
        this.tagged_top_quick_frame_ = {
            tagged_sp_: this.handle
        };
        this.link_ = this.tagged_top_quick_frame_.tagged_sp_.add(Globals_1.PointerSize);
        this.top_shadow_frame_ = this.link_.add(Globals_1.PointerSize);
    }
    toString() {
        let disp = `ManagedStack<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t tagged_sp=${this.tagged_sp}`;
        disp += `\n\t link=${this.link}`;
        disp += `\n\t top_shadow_frame=${this.top_shadow_frame}`;
        return disp;
    }
    get link() {
        return new ManagedStack(this.link_.readPointer());
    }
    get top_shadow_frame() {
        return new ShadowFrame_1.ShadowFrame(this.top_shadow_frame_.readPointer());
    }
    get tagged_sp() {
        return this.tagged_top_quick_frame_.tagged_sp_;
    }
}
exports.ManagedStack = ManagedStack;
},{"../../../JSHandle":11,"./Globals":28,"./ShadowFrame":44}],51:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../../../../Object":12}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaString = void 0;
const Object_1 = require("../../../../Object");
class JavaString extends Object_1.ArtObject {
    count_ = this.CurrentHandle;
    hash_code_ = this.count_.add(0x4);
    str_data_;
    constructor(handle) {
        super(handle);
        this.str_data_ = {
            data_: this.hash_code_.add(0x4),
            entry_point_from_quick_compiled_code_: this.hash_code_.add(0x4)
        };
    }
    toString() {
        let disp = `JavaString<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t count_=${this.count_} <- ${this.count}`;
        disp += `\n\t hash_code_=${this.hash_code_} <- ${this.hash_code}`;
        disp += `\n\t str_data_=${this.str_data_.data_} -> '${this.value}'`;
        return disp;
    }
    get count() {
        return this.count_.readS32();
    }
    get hash_code() {
        return this.hash_code_.readU32();
    }
    get value_ptr() {
        return this.str_data_.data_;
    }
    get value() {
        return this.value_ptr.readCString();
    }
    static caseToJavaString(artObject) {
        return new JavaString(artObject.handle);
    }
}
exports.JavaString = JavaString;
},{"../../../../Object":12}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throwable = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const Object_1 = require("../../../../Object");
class Throwable extends Object_1.ArtObject {
    backtrace_ = this.CurrentHandle;
    cause_ = this.backtrace_.add(HeapReference_1.HeapReference.Size);
    detail_message_ = this.cause_.add(HeapReference_1.HeapReference.Size);
    stack_trace_ = this.detail_message_.add(HeapReference_1.HeapReference.Size);
    suppressed_exceptions_ = this.stack_trace_.add(HeapReference_1.HeapReference.Size);
    toString() {
        let disp = `Throwable<${this.handle}>`;
        if (this.handle.isNull())
            return disp;
        disp += `\n\t backtrace_=${this.backtrace_} <- ${this.backtrace.root}`;
        disp += `\n\t cause_=${this.cause_} <- ${this.cause.root}`;
        disp += `\n\t detail_message_=${this.detail_message_} <- ${this.detail_message.root}`;
        disp += `\n\t stack_trace_=${this.stack_trace_} <- ${this.stack_trace.root}`;
        disp += `\n\t suppressed_exceptions_=${this.suppressed_exceptions_} <- ${this.suppressed_exceptions.root}`;
        return disp;
    }
    get backtrace() {
        return new HeapReference_1.HeapReference((handle) => new Object_1.ArtObject(handle), this.backtrace_);
    }
    get cause() {
        return new HeapReference_1.HeapReference((handle) => new Throwable(handle), this.cause_);
    }
    get detail_message() {
        return new HeapReference_1.HeapReference((handle) => new Object_1.ArtObject(handle), this.detail_message_);
    }
    get stack_trace() {
        return new HeapReference_1.HeapReference((handle) => new Object_1.ArtObject(handle), this.stack_trace_);
    }
    get suppressed_exceptions() {
        return new HeapReference_1.HeapReference((handle) => new Object_1.ArtObject(handle), this.suppressed_exceptions_);
    }
}
exports.Throwable = Throwable;
},{"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JValue");
require("./jobject");
require("./JavaString");
require("./Throwable");
},{"./JValue":51,"./JavaString":52,"./Throwable":53,"./jobject":55}],55:[function(require,module,exports){
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
},{"../../../../JSHandle":11}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],57:[function(require,module,exports){
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
        Reflect.defineProperty(accessor, 'insns_', ref_ptr.add(0x4 + 0x4));
        Reflect.defineProperty(accessor, 'insns_size_in_code_units_', ref_ptr);
        return accessor;
    }
}
exports.CodeItemDataAccessor = CodeItemDataAccessor;
},{"../Globals":28,"./CodeItemInstructionAccessor":59}],58:[function(require,module,exports){
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
},{"../Globals":28,"./CodeItemDataAccessor":57}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeItemInstructionAccessor = void 0;
const StandardDexFile_1 = require("./StandardDexFile");
const CompactDexFile_1 = require("./CompactDexFile");
const JSHandle_1 = require("../../../../JSHandle");
const Instruction_1 = require("../Instruction");
const Globals_1 = require("../Globals");
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
},{"../../../../JSHandle":11,"../Globals":28,"../Instruction":29,"./CompactDexFile":60,"./StandardDexFile":65}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompactDexFile_CodeItem = exports.CompactDexFile = void 0;
const DexFile_1 = require("./DexFile");
const Globals_1 = require("../Globals");
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
},{"../Globals":28,"./DexFile":61}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexFile_CodeItem = exports.DexFile = void 0;
const DexFileStructs_1 = require("./DexFileStructs");
const Header_1 = require("./Header");
const StdString_1 = require("../../../../../tools/StdString");
const DexIndex_1 = require("./DexIndex");
const SymHelper_1 = require("../../../../Utils/SymHelper");
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
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZNK3art7DexFile12PrettyMethodEjb", "libdexfile.so", ["pointer", "pointer", "pointer"], ["pointer", "pointer", "pointer"], this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL)).toString();
    }
    CalculateChecksum() {
        return (0, SymHelper_1.callSym)("_ZNK3art7DexFile17CalculateChecksumEv", "libdexfile.so", "uint32", ["pointer"], this.handle);
    }
    IsReadOnly() {
        if (this.is_compact_dex) {
            LOGE("EnableWrite() not supported for compact dex files");
            return false;
        }
        let ret = !(0, SymHelper_1.callSym)("_ZNK3art7DexFile10IsReadOnlyEv", "libdexfile.so", "pointer", ["pointer"], this.handle).isNull();
        return ret;
    }
    DisableWrite() {
        if (this.is_compact_dex) {
            LOGE("EnableWrite() not supported for compact dex files");
            return false;
        }
        let ret = !(0, SymHelper_1.callSym)("_ZNK3art7DexFile12DisableWriteEv", "libdexfile.so", "pointer", ["pointer"], this.handle).isNull();
        return ret;
    }
    EnableWrite() {
        if (this.is_compact_dex) {
            LOGE("EnableWrite() not supported for compact dex files");
            return false;
        }
        let ret = !(0, SymHelper_1.callSym)("_ZNK3art7DexFile11EnableWriteEv", "libdexfile.so", "pointer", ["pointer"], this.handle).isNull();
        return ret;
    }
    PrettyType(type_idx) {
        return (0, SymHelper_1.callSym)("_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE", "libdexfile.so", "pointer", ["pointer", "pointer"], this.handle, type_idx.index);
    }
    static FindTryItem(try_items, tries_size, address) {
        return (0, SymHelper_1.callSym)("_ZN3art7DexFile11FindTryItemEPKNS_3dex7TryItemEjj", "libdexfile.so", "int32", ["pointer", "uint", "uint"], try_items.handle, tries_size, address);
    }
    FindStringId_(string) {
        return new DexFileStructs_1.DexStringId((0, SymHelper_1.callSym)("_ZNK3art7DexFile12FindStringIdEPKc", "libdexfile.so", "pointer", ["pointer", "pointer"], this.handle, Memory.allocUtf8String(string)));
    }
    FindClassDef_(type_idx) {
        return (0, SymHelper_1.callSym)("_ZNK3art7DexFile12FindClassDefENS_3dex9TypeIndexE", "libdexfile.so", "pointer", ["pointer", "pointer"], this.handle, type_idx.index);
    }
    FindCodeItemOffset(class_def, method_idx) {
        return (0, SymHelper_1.callSym)("_ZNK3art7DexFile18FindCodeItemOffsetERKNS_3dex8ClassDefEj", "libdexfile.so", "uint32", ["pointer", "pointer", "uint"], this.handle, class_def.handle, method_idx);
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
},{"../../../../../tools/StdString":88,"../../../../JSHandle":11,"../../../../Utils/SymHelper":15,"../Globals":28,"../Oat/OatDexFile":39,"./DexFileStructs":62,"./DexIndex":63,"./Header":64}],62:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../Globals":28,"./DexIndex":63}],63:[function(require,module,exports){
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
},{"../../../../ValueHandle":17}],64:[function(require,module,exports){
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
},{"../../../../JSHandle":11}],65:[function(require,module,exports){
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
},{"./DexFile":61}],66:[function(require,module,exports){
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
},{"./CodeItemDataAccessor":57,"./CodeItemDebugInfoAccessor":58,"./CodeItemInstructionAccessor":59,"./CompactDexFile":60,"./DexFile":61,"./DexFileStructs":62,"./DexIndex":63,"./Header":64,"./StandardDexFile":65}],67:[function(require,module,exports){
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
require("./Thread_Inl");
require("./ShadowFrame");
require("./bridge");
require("./dexfile/include");
require("./interpreter/include");
require("./mirror/include");
require("./Oat/include");
require("./runtime/include");
require("./StackVisitor/include");
require("./Instrumentation/include");
require("./Type/include");
},{"./ClassLinker":26,"./GcRoot":27,"./Globals":28,"./Instruction":29,"./Instrumentation/include":36,"./Oat/include":41,"./OatQuickMethodHeader":37,"./ObjPtr":42,"./QuickMethodFrameInfo":43,"./ShadowFrame":44,"./StackVisitor/include":48,"./Thread":49,"./Thread_Inl":50,"./Type/include":54,"./bridge":56,"./dexfile/include":66,"./interpreter/include":69,"./mirror/include":76,"./runtime/include":79}],68:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../Globals":28,"../ShadowFrame":44,"../Thread":49,"../Type/JValue":51,"../dexfile/CodeItemDataAccessor":57}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./SwitchImplContext");
},{"./SwitchImplContext":68}],70:[function(require,module,exports){
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
},{"../../../../../tools/StdString":88,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"./ClassExt":72,"./ClassLoader":73,"./DexCache":74,"./IfTable":75}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const CodeItemInstructionAccessor_1 = require("../dexfile/CodeItemInstructionAccessor");
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const SymHelper_1 = require("../../../../Utils/SymHelper");
const modifiers_1 = require("../../../../../tools/modifiers");
const StdString_1 = require("../../../../../tools/StdString");
const enum_1 = require("../../../../../tools/enum");
const JSHandle_1 = require("../../../../JSHandle");
const Globals_1 = require("../Globals");
const ArtClass_1 = require("./ArtClass");
const Thread_1 = require("../Thread");
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
        if (this.handle.isNull())
            return 'NULL';
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
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZN3art21PrettyJavaAccessFlagsEj", "libdexfile.so", ['pointer', 'pointer', 'pointer'], ['pointer', 'uint32'], this, this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()));
    }
    GetObsoleteDexCache() {
        return new DexCache_1.DexCache((0, SymHelper_1.callSym)("_ZN3art9ArtMethod19GetObsoleteDexCacheEv", "libart.so", 'pointer', ['pointer'], this.handle));
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
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_", "libart.so", 'bool', ['pointer', 'pointer'], this.handle, other.handle);
    }
    GetRuntimeMethodName() {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod20GetRuntimeMethodNameEv", "libart.so", 'pointer', ['pointer'], this.handle).readCString();
    }
    SetNotIntrinsic() {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod15SetNotIntrinsicEv", "libart.so", 'void', ['pointer'], this.handle);
    }
    CopyFrom(src) {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE", "libart.so", 'void', ['pointer', 'pointer', 'int'], this.handle, src.handle, Globals_1.PointerSize);
    }
    GetOatQuickMethodHeader(pc = 0) {
        return new OatQuickMethodHeader_1.OatQuickMethodHeader((0, SymHelper_1.callSym)("_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm", "libart.so", 'pointer', ['pointer', 'pointer'], this.handle, pc));
    }
    FindObsoleteDexClassDefIndex() {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv", "libart.so", 'int', ['pointer'], this.handle);
    }
    GetSingleImplementation() {
        return new ArtMethod((0, SymHelper_1.callSym)("_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE", "libart.so", 'pointer', ['pointer', 'int'], this.handle, Process.pointerSize));
        Java.perform(() => {
            var jstr = Java.use("java.lang.String");
            Java.use("com.bytedance.applog.util.i").a(jstr.$new("123"));
        });
    }
    Invoke(self, args, result, shorty) {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod6InvokeEPNS_6ThreadEPjjPNS_6JValueEPKc", "libart.so", 'void', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer'], this.handle, this.CurrentHandle, args, args.length, result.handle, Memory.allocUtf8String(shorty));
    }
    FindOverriddenMethod() {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE", "libart.so", 'pointer', ['pointer', 'int'], this.handle, Process.pointerSize);
    }
    IsOverridableByDefaultMethod() {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv", "libart.so", 'bool', ['pointer'], this.handle);
    }
    GetQuickenedInfo(dex_pc = 0) {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod16GetQuickenedInfoEv", "libart.so", 'int', ['pointer', 'int'], this.handle, dex_pc);
    }
    JniShortName() {
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZN3art9ArtMethod12JniShortNameEv", "libart.so", ['pointer', 'pointer', 'pointer'], ['pointer'], this.handle));
    }
    JniLongName() {
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZN3art9ArtMethod11JniLongNameEv", "libart.so", ['pointer', 'pointer', 'pointer'], ['pointer'], this.handle));
    }
    RegisterNative(native_method) {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod14RegisterNativeEPKv", "libart.so", 'pointer', ['pointer', 'pointer'], this.handle, native_method);
    }
    RegisterNativeJS(native_method) {
        return this.RegisterNative(new NativeCallback(native_method, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']));
    }
    UnregisterNative() {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod16UnregisterNativeEv", "libart.so", 'void', ['pointer'], this.handle);
    }
    static NumArgRegisters(shorty) {
        return (0, SymHelper_1.callSym)("_ZN3art9ArtMethod15NumArgRegistersEPKc", "libart.so", 'int', ['pointer'], Memory.allocUtf8String(shorty));
    }
    GetInvokeType() {
        return enum_1.InvokeType.toString((0, SymHelper_1.callSym)("_ZN3art9ArtMethod13GetInvokeTypeEv", "libart.so", 'int', ['pointer'], this.handle));
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
class ArtMethod_Inl extends ArtMethod {
    static HookArtMethodInvoke() {
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art9ArtMethod6InvokeEPNS_6ThreadEPjjPNS_6JValueEPKc", "libart.so"), new CModule(`

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

        extern void CalledArtMethod(void* artMethod);

        void(*it)(void* dexFile);

        extern GHashTable *ptrHash;

        gboolean filterPtr(void* ptr) {
            if (ptrHash == NULL) {
                ptrHash = g_hash_table_new_full(g_direct_hash, g_direct_equal, NULL, NULL);
            }

            guint count = GPOINTER_TO_UINT(g_hash_table_lookup(ptrHash, ptr));

            if (count >= 5) {
                // frida_log("Filter PASS (Count >= 5) -> %p", ptr);
                return FALSE;
            } else {
                g_hash_table_insert(ptrHash, ptr, GUINT_TO_POINTER(count + 1));
                return TRUE;
            }
        }

        void onEnter(GumInvocationContext *ctx) {
            void* artMethod = gum_invocation_context_get_nth_argument(ctx, 0);
            if (filterPtr(artMethod)) {
                CalledArtMethod(artMethod);
            }
        }

        `, {
            ptrHash: Memory.alloc(Process.pointerSize),
            _frida_log: new NativeCallback((message) => {
                LOGZ(message.readCString());
            }, 'void', ['pointer']),
            CalledArtMethod: new NativeCallback((artMethod) => {
                const method = new ArtMethod(artMethod);
                LOGD(`Called -> ${method.methodName}`);
            }, 'void', ['pointer'])
        }));
        return;
        Interceptor.attach((0, SymHelper_1.getSym)("_ZN3art9ArtMethod6InvokeEPNS_6ThreadEPjjPNS_6JValueEPKc", "libart.so"), {
            onEnter: function (args) {
                const artMethod = new ArtMethod(args[0]);
                const thread = new Thread_1.ArtThread(args[1]);
                LOGD(`ArtMethod::Invoke -> ${artMethod.methodName}`);
            }
        });
    }
}
globalThis.HookArtMethodInvoke = ArtMethod_Inl.HookArtMethodInvoke;
},{"../../../../../tools/StdString":88,"../../../../../tools/enum":92,"../../../../../tools/modifiers":96,"../../../../JSHandle":11,"../../../../Utils/SymHelper":15,"../GcRoot":27,"../Globals":28,"../OatQuickMethodHeader":37,"../Thread":49,"../dexfile/CodeItemInstructionAccessor":59,"./ArtClass":70,"./DexCache":74}],72:[function(require,module,exports){
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
},{"../../../../Object":12}],73:[function(require,module,exports){
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
},{"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12}],74:[function(require,module,exports){
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
},{"../../../../../tools/StdString":88,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"../dexfile/DexFile":61}],75:[function(require,module,exports){
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
},{"../../../../Object":12}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":70,"./ArtMethod":71,"./ClassExt":72,"./ClassLoader":73,"./IfTable":75}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtRuntime = void 0;
const JSHandle_1 = require("../../../../JSHandle");
class ArtRuntime extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    static getInstance() {
        return new ArtRuntime(Java.api.artRuntime);
    }
}
exports.ArtRuntime = ArtRuntime;
},{"../../../../JSHandle":11}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuspendReason = exports.ThreadList = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const SymHelper_1 = require("../../../../Utils/SymHelper");
const Thread_1 = require("../Thread");
class ThreadList extends JSHandle_1.JSHandleNotImpl {
    constructor() {
        const value = Java.api.artThreadList;
        super(value);
    }
    toString() {
        let disp = `ThreadList<${Java.api.artThreadList}>`;
        if (this.handle.isNull())
            return disp;
        return disp;
    }
    static SuspendAll(cause = "SuspendAll", long_suspend = false) {
        Java.perform(() => {
            (0, SymHelper_1.callSym)("_ZN3art10ThreadList10SuspendAllEPKcb", "libart.so", "void", ["pointer", "pointer", "pointer"], Java.api.artThreadList, Memory.allocUtf8String(cause), long_suspend == true ? ptr(1) : NULL);
        });
    }
    static ResumeAll() {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList9ResumeAllEv", "libart.so", "void", ["pointer"], Java.api.artThreadList);
    }
    static Register(self) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList8RegisterEPNS_6ThreadE", "libart.so", "void", ["pointer", "pointer"], Java.api.artThreadList, self.handle);
    }
    static WaitForOtherNonDaemonThreadsToExit() {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList34WaitForOtherNonDaemonThreadsToExitEv", "libart.so", "void", ["pointer"], Java.api.artThreadList);
    }
    static ReleaseThreadId(self, id) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList15ReleaseThreadIdEPNS_6ThreadEj", "libart.so", "void", ["pointer", "pointer", "int"], Java.api.artThreadList, self, id);
    }
    static Contains(thread) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList8ContainsEPNS_6ThreadE", "libart.so", "bool", ["pointer", "pointer"], Java.api.artThreadList, thread.handle);
    }
    static VisitRootsForSuspendedThreads(visitor) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList29VisitRootsForSuspendedThreadsEPNS_11RootVisitorE", "libart.so", "void", ["pointer", "pointer"], Java.api.artThreadList, visitor);
    }
    static SuspendThreadByThreadId(thread_id, reason = SuspendReason.kForUserCode, timed_out = NULL) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList23SuspendThreadByThreadIdEjNS_13SuspendReasonEPb", "libart.so", "pointer", ["pointer", "pointer", "pointer", "pointer"], Java.api.artThreadList, ptr(thread_id), ptr(reason), timed_out);
    }
    static Unregister(self) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList10UnregisterEPNS_6ThreadE", "libart.so", "void", ["pointer", "pointer"], Java.api.artThreadList, self.handle);
    }
    static FindThreadByThreadId(thread_id) {
        return new Thread_1.ArtThread((0, SymHelper_1.callSym)("_ZN3art10ThreadList20FindThreadByThreadIdEj", "libart.so", "pointer", ["pointer", "pointer"], Java.api.artThreadList, ptr(thread_id)));
    }
    static SuspendAllForDebugger() {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList21SuspendAllForDebuggerEv", "libart.so", "void", ["pointer"], Java.api.artThreadList);
    }
    static ResumeAllForDebugger() {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList20ResumeAllForDebuggerEv", "libart.so", "void", ["pointer"], Java.api.artThreadList);
    }
    static UndoDebuggerSuspensions() {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList23UndoDebuggerSuspensionsEv", "libart.so", "void", ["pointer"], Java.api.artThreadList);
    }
    static Dump(os, dump_native_stack = true) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList4DumpERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEEb", "libart.so", "void", ["pointer", "pointer", "pointer"], Java.api.artThreadList, os, ptr(dump_native_stack ? 1 : 0));
    }
    static DumpNativeStacks(os) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList16DumpNativeStacksERNSt3__113basic_ostreamIcNS1_11char_traitsIcEEEE", "libart.so", "void", ["pointer", "pointer"], Java.api.artThreadList, os);
    }
    static ForEach(callback, context) {
        return (0, SymHelper_1.callSym)("_ZN3art10ThreadList7ForEachEPFvPNS_6ThreadEPvES3_", "libart.so", "void", ["pointer", "pointer", "pointer"], Java.api.artThreadList, callback, context);
    }
    static get ThreadLists() {
        const tempMemory = Memory.alloc(Process.pointerSize);
        const threadLists = new Array();
        ThreadList.ForEach(new NativeCallback((thread, context) => {
            threadLists.push({ thread: new Thread_1.ArtThread(thread), context: context });
        }, "void", ["pointer", "pointer"]), tempMemory);
        return threadLists;
    }
}
exports.ThreadList = ThreadList;
globalThis.ThreadList = ThreadList;
var SuspendReason;
(function (SuspendReason) {
    SuspendReason[SuspendReason["kInternal"] = 0] = "kInternal";
    SuspendReason[SuspendReason["kForDebugger"] = 1] = "kForDebugger";
    SuspendReason[SuspendReason["kForUserCode"] = 2] = "kForUserCode";
})(SuspendReason = exports.SuspendReason || (exports.SuspendReason = {}));
globalThis.SuspendAll = ThreadList.SuspendAll;
globalThis.ResumeAll = ThreadList.ResumeAll;
globalThis.ThreadLists = ThreadList.ThreadLists.map((item) => item.thread.toString());
globalThis.SuspendThreadByThreadId = ThreadList.SuspendThreadByThreadId;
},{"../../../../JSHandle":11,"../../../../Utils/SymHelper":15,"../Thread":49}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Runtime");
require("./ThreadList");
},{"./Runtime":77,"./ThreadList":78}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dex2oat = void 0;
const StdString_1 = require("../../../../tools/StdString");
const SymHelper_1 = require("../../../Utils/SymHelper");
class dex2oat {
    static GetCompilerExecutable(runtime) {
        const str = new StdString_1.StdString();
        (0, SymHelper_1.callSym)("_ZNK3art7Runtime21GetCompilerExecutableEv", "libart.so", ['pointer', 'pointer', 'pointer'], ['pointer', 'pointer'], runtime, str.handle);
        return str.disposeToString();
    }
}
exports.dex2oat = dex2oat;
Reflect.set(globalThis, 'dex2oat', dex2oat);
},{"../../../../tools/StdString":88,"../../../Utils/SymHelper":15}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./dex2oat");
},{"./dex2oat":80}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
require("./dex2oat/include");
},{"./art/include":67,"./dex2oat/include":81}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":82}],84:[function(require,module,exports){
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
},{"./Interface/include":10,"./JSHandle":11,"./Object":12,"./TraceManager":13,"./Utils/include":16,"./ValueHandle":17,"./android":18,"./functions/include":24,"./implements/include":83,"./machine-code":85}],85:[function(require,module,exports){
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
},{}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":4,"./android/include":84,"./tools/include":94}],87:[function(require,module,exports){
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
},{"./include":86}],88:[function(require,module,exports){
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
},{}],89:[function(require,module,exports){
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
},{}],90:[function(require,module,exports){
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

},{"timers":98}],91:[function(require,module,exports){
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
},{}],92:[function(require,module,exports){
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
},{}],93:[function(require,module,exports){
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
},{}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./dlopen");
require("./dump");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
},{"./StdString":88,"./common":89,"./dlopen":90,"./dump":91,"./enum":92,"./logger":95,"./modifiers":96}],95:[function(require,module,exports){
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
},{}],96:[function(require,module,exports){
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
},{}],97:[function(require,module,exports){
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

},{}],98:[function(require,module,exports){
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

},{"process/browser.js":97,"timers":98}]},{},[87])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0NvbnRleHQudHMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9UaGVhZHMudHMiLCJhZ2VudC9KYXZhL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvSGVhcFJlZmVyZW5jZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0pTSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9PYmplY3QudHMiLCJhZ2VudC9hbmRyb2lkL1RyYWNlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvQXJ0TWV0aG9kSGVscGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9TeW1IZWxwZXIudHMiLCJhZ2VudC9hbmRyb2lkL1V0aWxzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL1ZhbHVlSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9hbmRyb2lkLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvRGVmaW5lQ2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9EZXhGaWxlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL0V4ZWN1dGVTd2l0Y2hJbXBsQ3BwLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvT3BlbkNvbW1vbi50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL1N5bWJvbE1hbmFnZXIudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvaW5pdF9hcnJheS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvQ2xhc3NMaW5rZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0djUm9vdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvR2xvYmFscy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1Y3Rpb24udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb24udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb25MaXN0ZW5lci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL0luc3RydW1lbnRhdGlvblN0YWNrRnJhbWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb25TdGFja1BvcHBlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL1VuVXNlZEluc3RydWN0aW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVtZW50YXRpb24vZW51bS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdFF1aWNrTWV0aG9kSGVhZGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvTWVtTWFwLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvT2F0RGV4RmlsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2F0L09hdEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYmpQdHIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1F1aWNrTWV0aG9kRnJhbWVJbmZvLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TaGFkb3dGcmFtZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU3RhY2tWaXNpdG9yL0NIQVN0YWNrVmlzaXRvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU3RhY2tWaXNpdG9yL0NhdGNoQmxvY2tTdGFja1Zpc2l0b3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9TdGFja1Zpc2l0b3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UaHJlYWQudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1RocmVhZF9JbmwudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvSlZhbHVlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UeXBlL0phdmFTdHJpbmcudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvVGhyb3dhYmxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UeXBlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvam9iamVjdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9Db2RlSXRlbURhdGFBY2Nlc3Nvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9Db2RlSXRlbURlYnVnSW5mb0FjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtSW5zdHJ1Y3Rpb25BY2Nlc3Nvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9Db21wYWN0RGV4RmlsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9EZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0RleEZpbGVTdHJ1Y3RzLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0RleEluZGV4LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0hlYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9TdGFuZGFyZERleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvaW50ZXJwcmV0ZXIvU3dpdGNoSW1wbENvbnRleHQudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2ludGVycHJldGVyL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRDbGFzcy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0FydE1ldGhvZC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzRXh0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQ2xhc3NMb2FkZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9EZXhDYWNoZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0lmVGFibGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9ydW50aW1lL1J1bnRpbWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L3J1bnRpbWUvVGhyZWFkTGlzdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvcnVudGltZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2RleDJvYXQvZGV4Mm9hdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9kZXgyb2F0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9tYWNoaW5lLWNvZGUuanMiLCJhZ2VudC9pbmNsdWRlLnRzIiwiYWdlbnQvbWFpbi50cyIsImFnZW50L3Rvb2xzL1N0ZFN0cmluZy50cyIsImFnZW50L3Rvb2xzL2NvbW1vbi50cyIsImFnZW50L3Rvb2xzL2Rsb3Blbi50cyIsImFnZW50L3Rvb2xzL2R1bXAudHMiLCJhZ2VudC90b29scy9lbnVtLnRzIiwiYWdlbnQvdG9vbHMvZnVuY3Rpb25zLnRzIiwiYWdlbnQvdG9vbHMvaW5jbHVkZS50cyIsImFnZW50L3Rvb2xzL2xvZ2dlci50cyIsImFnZW50L3Rvb2xzL21vZGlmaWVycy50cyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsU0FBUyxj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LE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFRLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFRLEVBQUUsT0FBaUIsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFnQixDQUFDLEVBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFbEksTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQVEsRUFBRSxPQUFpQixRQUFRLENBQUMsS0FB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b0MsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFBO0FBRXJILE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQTs7QUM3RnJEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIn0=
