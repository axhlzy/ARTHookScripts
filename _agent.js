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
        LOGW(`Using loader: ${Java.classFactory.loader}`);
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
},{"../android/implements/10/art/mirror/ArtMethod":77}],3:[function(require,module,exports){
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
},{"../tools/StdString":94,"./Interface/art/mirror/HeapReference":7,"./JSHandle":11,"./Utils/SymHelper":16}],13:[function(require,module,exports){
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

},{"./functions/DefineClass":20,"./functions/ExecuteSwitchImplCpp":22,"./functions/OpenCommon":23,"./functions/init_array":26,"timers":138}],14:[function(require,module,exports){
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
},{"../implements/10/art/mirror/ArtMethod":77}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookJavaClass = void 0;
function hookJavaClass(className, callback, passMethods = []) {
    callback = (callback == undefined || callback == null) ? (_methodName, _methodSignature, _args) => {
        return {
            skipOriginal: false,
            parseValue: true
        };
    } : callback;
    Java.perform(() => {
        var javaClass;
        try {
            if (typeof className === 'string') {
                javaClass = Java.use(className);
            }
            else
                javaClass = className;
        }
        catch {
            LOGE(`NOT FOUND ${className}`);
            return;
        }
        const methods = javaClass.class.getDeclaredMethods();
        methods.forEach((method) => {
            const methodName = method.getName();
            if (methodName.includes("$") || methodName.includes('native') || methodName.includes('synchronized')) {
                LOGW(`Skip Hook -> ${className}.${methodName}`);
                return;
            }
            if (methodName.includes("$") || methodName.includes('init') || methodName.includes('ctor')) {
                LOGW(`Skip Hook -> ${className}.${methodName}`);
                return;
            }
            if (passMethods.includes(methodName))
                return;
            LOGW(`Hooking ${className}.${methodName}`);
            const methodSignature = method.getParameterTypes().map((t) => t.className).join(',');
            javaClass[methodName].overloads.forEach((originalMethod) => {
                if (originalMethod) {
                    originalMethod.implementation = function () {
                        const hookOptions = callback(methodName, methodSignature, arguments) || {};
                        if (hookOptions.before) {
                            hookOptions.before(this, arguments);
                        }
                        let returnValue;
                        if (!hookOptions.skipOriginal) {
                            returnValue = originalMethod.apply(this, arguments);
                        }
                        if (hookOptions.after) {
                            returnValue = hookOptions.after(this, arguments, returnValue);
                        }
                        if (hookOptions.parseValue) {
                            let fullMethodName = `${className}.${methodName}`;
                            const args_str = arguments.length == 0 ? '' : Array.prototype.slice.call(arguments).map(String).join("','");
                            if (returnValue) {
                                LOGD(`${fullMethodName}(\x1b[96m'${args_str}'\x1b[0m) => \x1b[93m${returnValue}\x1b[0m`);
                            }
                            else {
                                LOGD(`${fullMethodName}(\x1b[96m'${args_str}'\x1b[0m)`);
                            }
                        }
                        return returnValue;
                    };
                }
            });
        });
    });
}
exports.hookJavaClass = hookJavaClass;
Reflect.set(globalThis, 'hookJavaClass', hookJavaClass);
},{}],16:[function(require,module,exports){
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
function getSym(symName, md = "libart.so", checkNotFunction = false) {
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
Reflect.set(globalThis, "getSym", getSym);
Reflect.set(globalThis, "callSym", callSym);
},{"../../tools/functions":99,"../JSHandle":11,"../functions/SymbolManager":24}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtMethodHelper");
require("./SymHelper");
require("./JavaHooker");
},{"./ArtMethodHelper":14,"./JavaHooker":15,"./SymHelper":16}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"./machine-code":91}],20:[function(require,module,exports){
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
},{"../implements/10/art/dexfile/DexFile":65,"./DexFileManager":21}],21:[function(require,module,exports){
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
},{"./SymbolManager":24}],22:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteSwitchImplCppManager = void 0;
const SwitchImplContext_1 = require("../implements/10/art/interpreter/SwitchImplContext");
const Instrumentation_1 = require("../implements/10/art/Instrumentation/Instrumentation");
const interpreter_1 = require("../implements/10/art/interpreter/interpreter");
const common_1 = require("../../tools/common");
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
    static onValueChanged(key, value) {
        if (key != "filterThreadId" && key != "filterMethodName")
            return;
        LOGZ(`ExecuteSwitchImplCpp Got New Value -> ${key} -> ${value}`);
        if (key == "filterThreadId")
            ExecuteSwitchImplCppManager.filterThreadId = value;
        if (key == "filterMethodName")
            ExecuteSwitchImplCppManager.filterMethodName = value;
    }
    static get execute_functions() {
        return [
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_0,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_0,
        ].filter(it => it != null);
    }
    static filterThreadId = -1;
    static filterMethodName = '';
    static enableHook() {
        interpreter_1.interpreter.CanUseMterp = true;
        Instrumentation_1.Instrumentation.ForceInterpretOnly();
        ExecuteSwitchImplCppManager.execute_functions.forEach(hookAddress => {
            Interceptor.attach(hookAddress, {
                onEnter: function (args) {
                    const ctx = new SwitchImplContext_1.SwitchImplContext(args[0]);
                    if (!ctx.shadow_frame.method.methodName.includes(ExecuteSwitchImplCppManager.filterMethodName))
                        return;
                    if (ExecuteSwitchImplCppManager.filterThreadId != -1 && ExecuteSwitchImplCppManager.filterThreadId != Process.getCurrentThreadId()) {
                        const threadInfo = `${Process.getCurrentThreadId()} ${ctx.self.GetThreadName()}`;
                        const lastMethod = ctx.shadow_frame.link.method;
                        const lastMethodStr = lastMethod ? lastMethod.PrettyMethod(false) : "null";
                        const currentMethod = ctx.self.GetCurrentMethod().PrettyMethod(false);
                        LOGD(`${threadInfo} \n${lastMethodStr} -> ${currentMethod}`);
                    }
                    newLine();
                }
            });
        });
    }
}
exports.ExecuteSwitchImplCppManager = ExecuteSwitchImplCppManager;
setImmediate(() => {
    common_1.KeyValueStore.getInstance().subscribe(ExecuteSwitchImplCppManager);
});
}).call(this)}).call(this,require("timers").setImmediate)

},{"../../tools/common":95,"../Utils/SymHelper":16,"../implements/10/art/Instrumentation/Instrumentation":32,"../implements/10/art/interpreter/SwitchImplContext":73,"../implements/10/art/interpreter/interpreter":75,"timers":138}],23:[function(require,module,exports){
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
},{"./DexFileManager":21}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./DefineClass");
require("./SymbolManager");
require("./DefineClass");
require("./OpenCommon");
require("./init_array");
require("./ExecuteSwitchImplCpp");
},{"./DefineClass":20,"./ExecuteSwitchImplCpp":22,"./OpenCommon":23,"./SymbolManager":24,"./init_array":26}],26:[function(require,module,exports){
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
},{"../Utils/SymHelper":16}],27:[function(require,module,exports){
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
},{"../../../JSHandle":11,"../../../Utils/SymHelper":16,"./Globals":29}],28:[function(require,module,exports){
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
},{"../../../JSHandle":11}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtInstruction = void 0;
const JSHandle_1 = require("../../../JSHandle");
const StdString_1 = require("../../../../tools/StdString");
const SymHelper_1 = require("../../../Utils/SymHelper");
const InstructionList_1 = require("./Instrumentation/InstructionList");
const console_1 = require("console");
const DEBUG_LOG = false;
class ArtInstruction extends JSHandle_1.JSHandleNotImpl {
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
    clone() {
        var tempMemory = Memory.alloc(this.SizeInCodeUnits);
        Memory.copy(tempMemory, this.handle, this.SizeInCodeUnits);
        return ArtInstruction.At(tempMemory);
    }
    get current() {
        return this.handle;
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
    get opName_RunTime() {
        (0, console_1.assert)(this.opcode < ArtInstruction.kInstructionNames.length, `opcode ${this.opcode} out of range`);
        return ArtInstruction.kInstructionNames[this.opcode];
    }
    get opName() {
        (0, console_1.assert)(this.opcode < ArtInstruction.kInstructionNames.length, `opcode ${this.opcode} out of range`);
        return InstructionList_1.Opcode.getOpName(this.opcode);
    }
}
exports.ArtInstruction = ArtInstruction;
class InstructionDescriptor extends JSHandle_1.JSHandleNotImpl {
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
Reflect.set(globalThis, "ArtInstruction", ArtInstruction);
},{"../../../../tools/StdString":94,"../../../JSHandle":11,"../../../Utils/SymHelper":16,"./Instrumentation/InstructionList":31,"console":111}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Opcode = void 0;
class Opcode {
    static NOP = 0x00;
    static MOVE = 0x01;
    static MOVE_FROM16 = 0x02;
    static MOVE_16 = 0x03;
    static MOVE_WIDE = 0x04;
    static MOVE_WIDE_FROM16 = 0x05;
    static MOVE_WIDE_16 = 0x06;
    static MOVE_OBJECT = 0x07;
    static MOVE_OBJECT_FROM16 = 0x08;
    static MOVE_OBJECT_16 = 0x09;
    static MOVE_RESULT = 0x0a;
    static MOVE_RESULT_WIDE = 0x0b;
    static MOVE_RESULT_OBJECT = 0x0c;
    static MOVE_EXCEPTION = 0x0d;
    static RETURN_VOID = 0x0e;
    static RETURN = 0x0f;
    static RETURN_WIDE = 0x10;
    static RETURN_OBJECT = 0x11;
    static CONST_4 = 0x12;
    static CONST_16 = 0x13;
    static CONST = 0x14;
    static CONST_HIGH16 = 0x15;
    static CONST_WIDE_16 = 0x16;
    static CONST_WIDE_32 = 0x17;
    static CONST_WIDE = 0x18;
    static CONST_WIDE_HIGH16 = 0x19;
    static CONST_STRING = 0x1a;
    static CONST_STRING_JUMBO = 0x1b;
    static CONST_CLASS = 0x1c;
    static MONITOR_ENTER = 0x1d;
    static MONITOR_EXIT = 0x1e;
    static CHECK_CAST = 0x1f;
    static INSTANCE_OF = 0x20;
    static ARRAY_LENGTH = 0x21;
    static NEW_INSTANCE = 0x22;
    static NEW_ARRAY = 0x23;
    static FILLED_NEW_ARRAY = 0x24;
    static FILLED_NEW_ARRAY_RANGE = 0x25;
    static FILL_ARRAY_DATA = 0x26;
    static THROW = 0x27;
    static GOTO = 0x28;
    static GOTO_16 = 0x29;
    static GOTO_32 = 0x2a;
    static PACKED_SWITCH = 0x2b;
    static SPARSE_SWITCH = 0x2c;
    static CMPL_FLOAT = 0x2d;
    static CMPG_FLOAT = 0x2e;
    static CMPL_DOUBLE = 0x2f;
    static CMPG_DOUBLE = 0x30;
    static CMP_LONG = 0x31;
    static IF_EQ = 0x32;
    static IF_NE = 0x33;
    static IF_LT = 0x34;
    static IF_GE = 0x35;
    static IF_GT = 0x36;
    static IF_LE = 0x37;
    static IF_EQZ = 0x38;
    static IF_NEZ = 0x39;
    static IF_LTZ = 0x3a;
    static IF_GEZ = 0x3b;
    static IF_GTZ = 0x3c;
    static IF_LEZ = 0x3d;
    static UNUSED_3E = 0x3E;
    static UNUSED_3F = 0x3F;
    static UNUSED_40 = 0x40;
    static UNUSED_41 = 0x41;
    static UNUSED_42 = 0x42;
    static UNUSED_43 = 0x43;
    static AGET = 0x44;
    static AGET_WIDE = 0x45;
    static AGET_OBJECT = 0x46;
    static AGET_BOOLEAN = 0x47;
    static AGET_BYTE = 0x48;
    static AGET_CHAR = 0x49;
    static AGET_SHORT = 0x4a;
    static APUT = 0x4b;
    static APUT_WIDE = 0x4c;
    static APUT_OBJECT = 0x4d;
    static APUT_BOOLEAN = 0x4e;
    static APUT_BYTE = 0x4f;
    static APUT_CHAR = 0x50;
    static APUT_SHORT = 0x51;
    static IGET = 0x52;
    static IGET_WIDE = 0x53;
    static IGET_OBJECT = 0x54;
    static IGET_BOOLEAN = 0x55;
    static IGET_BYTE = 0x56;
    static IGET_CHAR = 0x57;
    static IGET_SHORT = 0x58;
    static IPUT = 0x59;
    static IPUT_WIDE = 0x5a;
    static IPUT_OBJECT = 0x5b;
    static IPUT_BOOLEAN = 0x5c;
    static IPUT_BYTE = 0x5d;
    static IPUT_CHAR = 0x5e;
    static IPUT_SHORT = 0x5f;
    static SGET = 0x60;
    static SGET_WIDE = 0x61;
    static SGET_OBJECT = 0x62;
    static SGET_BOOLEAN = 0x63;
    static SGET_BYTE = 0x64;
    static SGET_CHAR = 0x65;
    static SGET_SHORT = 0x66;
    static SPUT = 0x67;
    static SPUT_WIDE = 0x68;
    static SPUT_OBJECT = 0x69;
    static SPUT_BOOLEAN = 0x6a;
    static SPUT_BYTE = 0x6b;
    static SPUT_CHAR = 0x6c;
    static SPUT_SHORT = 0x6d;
    static INVOKE_VIRTUAL = 0x6e;
    static INVOKE_SUPER = 0x6f;
    static INVOKE_DIRECT = 0x70;
    static INVOKE_STATIC = 0x71;
    static INVOKE_INTERFACE = 0x72;
    static UNUSED_73 = 0x73;
    static INVOKE_VIRTUAL_RANGE = 0x74;
    static INVOKE_SUPER_RANGE = 0x75;
    static INVOKE_DIRECT_RANGE = 0x76;
    static INVOKE_STATIC_RANGE = 0x77;
    static INVOKE_INTERFACE_RANGE = 0x78;
    static UNUSED_79 = 0x79;
    static UNUSED_7A = 0x7a;
    static NEG_INT = 0x7b;
    static NOT_INT = 0x7c;
    static NEG_LONG = 0x7d;
    static NOT_LONG = 0x7e;
    static NEG_FLOAT = 0x7f;
    static NEG_DOUBLE = 0x80;
    static INT_TO_LONG = 0x81;
    static INT_TO_FLOAT = 0x82;
    static INT_TO_DOUBLE = 0x83;
    static LONG_TO_INT = 0x84;
    static LONG_TO_FLOAT = 0x85;
    static LONG_TO_DOUBLE = 0x86;
    static FLOAT_TO_INT = 0x87;
    static FLOAT_TO_LONG = 0x88;
    static FLOAT_TO_DOUBLE = 0x89;
    static DOUBLE_TO_INT = 0x8a;
    static DOUBLE_TO_LONG = 0x8b;
    static DOUBLE_TO_FLOAT = 0x8c;
    static INT_TO_BYTE = 0x8d;
    static INT_TO_CHAR = 0x8e;
    static INT_TO_SHORT = 0x8f;
    static ADD_INT = 0x90;
    static SUB_INT = 0x91;
    static MUL_INT = 0x92;
    static DIV_INT = 0x93;
    static REM_INT = 0x94;
    static AND_INT = 0x95;
    static OR_INT = 0x96;
    static XOR_INT = 0x97;
    static SHL_INT = 0x98;
    static SHR_INT = 0x99;
    static USHR_INT = 0x9a;
    static ADD_LONG = 0x9b;
    static SUB_LONG = 0x9c;
    static MUL_LONG = 0x9d;
    static DIV_LONG = 0x9e;
    static REM_LONG = 0x9f;
    static AND_LONG = 0xa0;
    static OR_LONG = 0xa1;
    static XOR_LONG = 0xa2;
    static SHL_LONG = 0xa3;
    static SHR_LONG = 0xa4;
    static USHR_LONG = 0xa5;
    static ADD_FLOAT = 0xa6;
    static SUB_FLOAT = 0xa7;
    static MUL_FLOAT = 0xa8;
    static DIV_FLOAT = 0xa9;
    static REM_FLOAT = 0xaa;
    static ADD_DOUBLE = 0xab;
    static SUB_DOUBLE = 0xac;
    static MUL_DOUBLE = 0xad;
    static DIV_DOUBLE = 0xae;
    static REM_DOUBLE = 0xaf;
    static ADD_INT_2ADDR = 0xb0;
    static SUB_INT_2ADDR = 0xb1;
    static MUL_INT_2ADDR = 0xb2;
    static DIV_INT_2ADDR = 0xb3;
    static REM_INT_2ADDR = 0xb4;
    static AND_INT_2ADDR = 0xb5;
    static OR_INT_2ADDR = 0xb6;
    static XOR_INT_2ADDR = 0xb7;
    static SHL_INT_2ADDR = 0xb8;
    static SHR_INT_2ADDR = 0xb9;
    static USHR_INT_2ADDR = 0xba;
    static ADD_LONG_2ADDR = 0xbb;
    static SUB_LONG_2ADDR = 0xbc;
    static MUL_LONG_2ADDR = 0xbd;
    static DIV_LONG_2ADDR = 0xbe;
    static REM_LONG_2ADDR = 0xbf;
    static AND_LONG_2ADDR = 0xc0;
    static OR_LONG_2ADDR = 0xc1;
    static XOR_LONG_2ADDR = 0xc2;
    static SHL_LONG_2ADDR = 0xc3;
    static SHR_LONG_2ADDR = 0xc4;
    static USHR_LONG_2ADDR = 0xc5;
    static ADD_FLOAT_2ADDR = 0xc6;
    static SUB_FLOAT_2ADDR = 0xc7;
    static MUL_FLOAT_2ADDR = 0xc8;
    static DIV_FLOAT_2ADDR = 0xc9;
    static REM_FLOAT_2ADDR = 0xca;
    static ADD_DOUBLE_2ADDR = 0xcb;
    static SUB_DOUBLE_2ADDR = 0xcc;
    static MUL_DOUBLE_2ADDR = 0xcd;
    static DIV_DOUBLE_2ADDR = 0xce;
    static REM_DOUBLE_2ADDR = 0xcf;
    static ADD_INT_LIT16 = 0xd0;
    static RSUB_INT = 0xd1;
    static MUL_INT_LIT16 = 0xd2;
    static DIV_INT_LIT16 = 0xd3;
    static REM_INT_LIT16 = 0xd4;
    static AND_INT_LIT16 = 0xd5;
    static OR_INT_LIT16 = 0xd6;
    static XOR_INT_LIT16 = 0xd7;
    static ADD_INT_LIT8 = 0xd8;
    static RSUB_INT_LIT8 = 0xd9;
    static MUL_INT_LIT8 = 0xda;
    static DIV_INT_LIT8 = 0xdb;
    static REM_INT_LIT8 = 0xdc;
    static AND_INT_LIT8 = 0xdd;
    static OR_INT_LIT8 = 0xde;
    static XOR_INT_LIT8 = 0xdf;
    static SHL_INT_LIT8 = 0xe0;
    static SHR_INT_LIT8 = 0xe1;
    static USHR_INT_LIT8 = 0xe2;
    static UNUSED_E3 = 0xe3;
    static UNUSED_E4 = 0xe4;
    static UNUSED_E5 = 0xe5;
    static UNUSED_E6 = 0xe6;
    static UNUSED_E7 = 0xe7;
    static UNUSED_E8 = 0xe8;
    static UNUSED_E9 = 0xe9;
    static UNUSED_EA = 0xea;
    static UNUSED_EB = 0xeb;
    static UNUSED_EC = 0xec;
    static UNUSED_ED = 0xed;
    static UNUSED_EE = 0xee;
    static UNUSED_EF = 0xef;
    static UNUSED_F0 = 0xf0;
    static UNUSED_F1 = 0xf1;
    static UNUSED_F2 = 0xf2;
    static UNUSED_F3 = 0xf3;
    static UNUSED_F4 = 0xf4;
    static UNUSED_F5 = 0xf5;
    static UNUSED_F6 = 0xf6;
    static UNUSED_F7 = 0xf7;
    static UNUSED_F8 = 0xf8;
    static UNUSED_F9 = 0xf9;
    static INVOKE_POLYMORPHIC = 0xfa;
    static INVOKE_POLYMORPHIC_RANGE = 0xfb;
    static INVOKE_CUSTOM = 0xfc;
    static INVOKE_CUSTOM_RANGE = 0xfd;
    static CONST_METHOD_HANDLE = 0xfe;
    static CONST_METHOD_TYPE = 0xff;
    static CONST_CLASS_JUMBO = 0x00ff;
    static CHECK_CAST_JUMBO = 0x01ff;
    static INSTANCE_OF_JUMBO = 0x02ff;
    static NEW_INSTANCE_JUMBO = 0x03ff;
    static NEW_ARRAY_JUMBO = 0x04ff;
    static FILLED_NEW_ARRAY_JUMBO = 0x05ff;
    static IGET_JUMBO = 0x06ff;
    static IGET_WIDE_JUMBO = 0x07ff;
    static IGET_OBJECT_JUMBO = 0x08ff;
    static IGET_BOOLEAN_JUMBO = 0x09ff;
    static IGET_BYTE_JUMBO = 0x0aff;
    static IGET_CHAR_JUMBO = 0x0bff;
    static IGET_SHORT_JUMBO = 0x0cff;
    static IPUT_JUMBO = 0x0dff;
    static IPUT_WIDE_JUMBO = 0x0eff;
    static IPUT_OBJECT_JUMBO = 0x0fff;
    static IPUT_BOOLEAN_JUMBO = 0x10ff;
    static IPUT_BYTE_JUMBO = 0x11ff;
    static IPUT_CHAR_JUMBO = 0x12ff;
    static IPUT_SHORT_JUMBO = 0x13ff;
    static SGET_JUMBO = 0x14ff;
    static SGET_WIDE_JUMBO = 0x15ff;
    static SGET_OBJECT_JUMBO = 0x16ff;
    static SGET_BOOLEAN_JUMBO = 0x17ff;
    static SGET_BYTE_JUMBO = 0x18ff;
    static SGET_CHAR_JUMBO = 0x19ff;
    static SGET_SHORT_JUMBO = 0x1aff;
    static SPUT_JUMBO = 0x1bff;
    static SPUT_WIDE_JUMBO = 0x1cff;
    static SPUT_OBJECT_JUMBO = 0x1dff;
    static SPUT_BOOLEAN_JUMBO = 0x1eff;
    static SPUT_BYTE_JUMBO = 0x1fff;
    static SPUT_CHAR_JUMBO = 0x20ff;
    static SPUT_SHORT_JUMBO = 0x21ff;
    static INVOKE_VIRTUAL_JUMBO = 0x22ff;
    static INVOKE_SUPER_JUMBO = 0x23ff;
    static INVOKE_DIRECT_JUMBO = 0x24ff;
    static INVOKE_STATIC_JUMBO = 0x25ff;
    static INVOKE_INTERFACE_JUMBO = 0x26ff;
    static getOpName(op) {
        const names = Object.getOwnPropertyNames(this);
        return names.find(name => this[name] === op) || 'UNKNOWN';
    }
}
exports.Opcode = Opcode;
Reflect.set(globalThis, 'OpCode', Opcode);
},{}],32:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"../../../../android":19,"./InstrumentationListener":33}],33:[function(require,module,exports){
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
},{"../../../../Object":12,"../ObjPtr":46,"../Thread":53,"../Type/JValue":55,"../mirror/ArtMethod":77}],34:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../../../../Object":12,"../Globals":29,"../mirror/ArtMethod":77}],35:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../Globals":29,"../Thread":53}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmaliWriter = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const Instruction_1 = require("../Instruction");
const InstructionList_1 = require("./InstructionList");
class SmaliWriter extends JSHandle_1.JSHandleNotImpl {
    base;
    current;
    offset;
    insnsMap;
    insnsSize;
    constructor(handle) {
        super(handle);
        this.base = handle;
        this.current = handle;
        this.offset = 0;
        this.insnsMap = new Map();
        this.insnsSize = 0;
    }
    reset(newCode) {
        this.current = newCode;
        this.offset = newCode.sub(this.base).toInt32();
    }
    skip(nBytes, addInsnsSize = true) {
        this.current = this.current.add(nBytes);
        this.offset += nBytes;
        if (addInsnsSize)
            this.insnsSize += 1;
    }
    writeInsns(insns) {
        const insns_ptr = insns.current;
        const insns_size = insns.SizeInCodeUnits;
        const dst_insns_ptr = this.current;
        Memory.copy(dst_insns_ptr, insns_ptr, insns_size);
        this.skip(insns_size, false);
        this.insnsSize += insns_size;
        this.insnsMap.set(insns_ptr, dst_insns_ptr);
    }
    flush() {
        this.forEachInsns((insns) => {
            const opName = insns.opName;
            if (opName.includes("GOTO") || opName.includes("IF_")) {
                SmaliWriter.fixRelativeBranchOffset(insns, this.insnsMap);
            }
        });
    }
    forEachInsns(callback) {
        let insns = new Instruction_1.ArtInstruction(this.base);
        while (true) {
            callback(insns);
            if (insns.current > this.current)
                break;
            insns = insns.Next();
        }
    }
    static fixRelativeBranchOffset(insns, insnsMap) {
        const DEBUG = false;
        const opcode = insns.opcode;
        if (DEBUG) {
            LOGD(`fixRelativeBranchOffset -> ${insns}`);
            insnsMap.forEach((dst, src) => {
                LOGD(`${src} -> ${dst}`);
            });
        }
        if (opcode == InstructionList_1.Opcode.GOTO || opcode == InstructionList_1.Opcode.GOTO_16 || opcode == InstructionList_1.Opcode.GOTO_32) {
        }
        else if (insns.opName.includes("IF_")) {
            const offset_ptr = insns.current.add(0x2);
            const offset_value = offset_ptr.readU16() * 2;
            if (DEBUG)
                LOGD(`insns.current -> ${insns.current} -> ${insns.opName} -> ${offset_ptr.readU16()}`);
            const originalAddress = Array.from(insnsMap.entries())
                .find(([_, newAddress]) => newAddress.equals(insns.current))?.[0];
            if (DEBUG)
                LOGE(`originalAddress -> ${originalAddress}`);
            if (originalAddress !== undefined) {
                const originalWithOffset = originalAddress.add(offset_value);
                if (DEBUG)
                    LOGE(`originalWithOffset -> ${originalWithOffset}`);
                const entry = Array.from(insnsMap.entries())
                    .find(([oldAddr, _newAddr]) => oldAddr.equals(originalWithOffset));
                if (entry !== undefined) {
                    const [, newAddress] = entry;
                    if (DEBUG)
                        LOGE(`newAddress -> ${newAddress}`);
                    const relativeOffset = newAddress.sub(insns.current).toInt32();
                    offset_ptr.writeU16(relativeOffset);
                }
                else {
                    if (DEBUG)
                        LOGD(`New address not found in insnsMap: ${originalWithOffset}`);
                }
            }
            else {
                if (DEBUG)
                    LOGD(`Original address not found for new address: ${insns.current}`);
            }
        }
        return insns;
    }
    putNop(num = 1) {
        for (let i = 0; i < num * 2; i++) {
            this.current.writeU8(InstructionList_1.Opcode.NOP);
            this.skip(1);
        }
    }
    putGoto(offset) {
    }
    putReturn() {
        this.current.writeU8(InstructionList_1.Opcode.RETURN_VOID);
        this.skip(1);
        this.current.writeU8(0);
        this.skip(1);
    }
    putConstString(regIndex, stringIndex) {
        this.current.writeU8(InstructionList_1.Opcode.CONST_STRING);
        this.skip(1);
        this.current.writeU8(regIndex);
        this.skip(1);
        this.current.writeU16(stringIndex);
        this.skip(2);
    }
    putIfNez(regIndex, offset) {
        this.current.writeU8(InstructionList_1.Opcode.IF_NEZ);
        this.skip(1);
        this.current.writeU8(regIndex);
        this.skip(1);
        this.current.writeU16(offset);
        this.skip(2);
    }
    putMoveResult(regIndex) {
        this.current.writeU8(InstructionList_1.Opcode.MOVE_RESULT);
        this.skip(1);
        this.current.writeU8(regIndex);
        this.skip(1);
    }
    putMoveResultObject(regIndex) {
        this.current.writeU8(InstructionList_1.Opcode.MOVE_RESULT_OBJECT);
        this.skip(1);
        this.current.writeU8(regIndex);
        this.skip(1);
    }
    putNewInstance(regIndex, typeIndex) {
        this.current.writeU8(InstructionList_1.Opcode.NEW_INSTANCE);
        this.skip(1);
        this.current.writeU8(regIndex);
        this.skip(1);
        this.current.writeU16(typeIndex);
        this.skip(2);
    }
    putInvokeStatic(regIndexs, methodIndex) {
        this.current.writeU8(InstructionList_1.Opcode.INVOKE_STATIC);
        this.skip(1);
        this.current.writeU8(regIndexs.length);
        this.skip(1);
        this.current.writeU16(methodIndex);
        this.skip(2);
    }
}
exports.SmaliWriter = SmaliWriter;
},{"../../../../JSHandle":11,"../Instruction":30,"./InstructionList":31}],37:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmaliInlineManager = void 0;
const interpreter_1 = require("../interpreter/interpreter");
const ArtMethod_1 = require("../mirror/ArtMethod");
const SmaliWriter_1 = require("./SmaliWriter");
const console_1 = require("console");
class SmaliInlineManager {
    static recoverMap = new Map();
    static enable() {
        SmaliInlineManager.handleException();
    }
    static convertToArtMethod(method) {
        if (method instanceof NativePointer)
            method = new ArtMethod_1.ArtMethod(method);
        if (typeof method == 'number')
            method = new ArtMethod_1.ArtMethod(ptr(method));
        if (typeof method == 'string')
            method = pathToArtMethod(method);
        (0, console_1.assert)(method instanceof ArtMethod_1.ArtMethod, "method must be ArtMethod");
        return method;
    }
    static traceSingleMethod(method) {
        method = SmaliInlineManager.convertToArtMethod(method);
        if (SmaliInlineManager.recoverMap.has(method))
            throw new Error("method already traced");
        const newSmali = SmaliInlineManager.Impl_CP(method);
        SmaliInlineManager.recoverMap.set(method, { src: method.DexInstructions().CodeItem.insns_start, new: newSmali.newStart });
        method.SetCodeItem(newSmali.newStart);
        method.DexInstructions().CodeItem.insns_size_in_code_units = newSmali.insnsSize;
    }
    static restoreSingleMethod(method) {
        method = SmaliInlineManager.convertToArtMethod(method);
        if (!SmaliInlineManager.recoverMap.has(method))
            return;
        const { src, new: _newStart } = SmaliInlineManager.recoverMap.get(method);
        method.SetCodeItem(src);
    }
    static Impl_Inline() {
    }
    static Impl_CP(method) {
        method = SmaliInlineManager.convertToArtMethod(method);
        const st = method.GetCodeItemPack();
        const allocSize = st.headerSize + st.insnsSize * 2;
        var new_smali_start = Memory.alloc(allocSize);
        Memory.copy(new_smali_start, st.headerStart, st.headerSize);
        const sw = new SmaliWriter_1.SmaliWriter(new_smali_start.add(st.headerSize));
        sw.putNop();
        method.forEachSmali((instruction, _codeItem) => {
            sw.writeInsns(instruction);
            sw.putNop();
        });
        sw.flush();
        return { newStart: new_smali_start, insnsMap: sw.insnsMap, insnsSize: sw.insnsSize / 2 };
    }
    static handleException() {
        interpreter_1.interpreter.addMoveToExceptionHandleCalledListener((ret, thread, shadowFrame, instrumentation) => {
            if (ret == NULL) {
                LOGE(`MoveToExceptionHandleCalledListener -> ${shadowFrame.toString()}`);
            }
            return ret;
        });
    }
}
exports.SmaliInlineManager = SmaliInlineManager;
setImmediate(() => { SmaliInlineManager.enable(); });
Reflect.set(globalThis, "SmaliInlineManager", SmaliInlineManager);
}).call(this)}).call(this,require("timers").setImmediate)

},{"../interpreter/interpreter":75,"../mirror/ArtMethod":77,"./SmaliWriter":36,"console":111,"timers":138}],38:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnUsedInstructionManager = void 0;
const JSHandle_1 = require("../../../../JSHandle");
const intercepter_1 = require("../../../../../tools/intercepter");
const SymHelper_1 = require("../../../../Utils/SymHelper");
const Instruction_1 = require("../Instruction");
const ShadowFrame_1 = require("../ShadowFrame");
const InstructionList_1 = require("./InstructionList");
class UnUsedInstructions extends InstructionList_1.Opcode {
}
class UnUsedInstructionManager extends JSHandle_1.JSHandleNotImpl {
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
        (0, intercepter_1.R)(sym_addr, new NativeCallback((inst_, shadow_frame_) => {
            let inst = new Instruction_1.ArtInstruction(inst_);
            let shadow_frame = new ShadowFrame_1.ShadowFrame(shadow_frame_);
            LOGD(`UnexpectedOpcode ${inst.toString()} ${shadow_frame.toString()}`);
            return;
            if (UnUsedInstructionManager.listenerMap.has(inst.opcode) && UnUsedInstructionManager.listenerMap.get(inst.opcode).length > 0) {
                UnUsedInstructionManager.listenerMap.get(inst.opcode).forEach(listener => {
                    listener(inst, shadow_frame);
                });
            }
            else {
                shadow_frame.printBackTraceWithSmali();
                UnUsedInstructionManager.mapModify.has(inst_) && inst_.writeByteArray(UnUsedInstructionManager.mapModify.get(inst_));
                shadow_frame.SetDexPC(shadow_frame.GetDexPC());
            }
        }, 'pointer', ['pointer', 'pointer']));
    }
    static mapModify = new Map();
    static ModSmaliInstruction(methodPath = "com.unity3d.player.UnityPlayer.UnitySendMessage", offset = 0x42) {
        const CurrentMethod = pathToArtMethod(methodPath);
        const dexfile = CurrentMethod.GetDexFile();
        if (dexfile.is_compact_dex)
            throw new Error("not support compact dex");
        const dexInstructions = CurrentMethod.DexInstructions();
        const ins_ptr_patch_start = dexInstructions.CodeItem.insns_start.add(offset);
        const ins_ptr_patch_len = new Instruction_1.ArtInstruction(ins_ptr_patch_start).SizeInCodeUnits;
        LOGD(`ins_ptr_patch_start ${ins_ptr_patch_start} ins_ptr_patch_len ${ins_ptr_patch_len}`);
        const ins_arr = ins_ptr_patch_start.readByteArray(ins_ptr_patch_len);
        UnUsedInstructionManager.mapModify.set(ins_ptr_patch_start, ins_arr);
        if (dexfile.IsReadOnly())
            dexfile.EnableWrite();
        ins_ptr_patch_start.writeU32(UnUsedInstructions.UNUSED_3E);
        if (ins_ptr_patch_len > 0x1) {
            for (let iterP = ins_ptr_patch_start.add(0x1); iterP < ins_ptr_patch_start.add(ins_ptr_patch_len); iterP = iterP.add(0x1)) {
                iterP.writeU8(0x0);
            }
        }
    }
    static newClass() {
        const rewardClass = Java.registerClass({
            name: "com.Test.CallbackClass",
            superClass: Java.use("java.lang.Object"),
            implements: undefined,
            methods: {
                ['OnCalled']: {
                    returnType: 'void',
                    argumentTypes: ['boolean'],
                    implementation: function (z) {
                        LOGW(`called CallbackClass -> OnCalled ${z}`);
                    }
                }
            }
        });
        return rewardClass;
    }
    static test() {
        return UnUsedInstructionManager.newClass().OnCalled.handle;
    }
}
exports.UnUsedInstructionManager = UnUsedInstructionManager;
setImmediate(() => { UnUsedInstructionManager.catchUnexpectedOpcode(); });
Reflect.set(globalThis, "UnUsedInstructionManager", UnUsedInstructionManager);
globalThis.ModSmaliInstruction = UnUsedInstructionManager.ModSmaliInstruction;
globalThis.test = () => { Java.perform(() => { LOGD(UnUsedInstructionManager.test()); }); };
globalThis.testCallSendMessage = () => {
    Java.perform(() => {
        var JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"));
    });
};
}).call(this)}).call(this,require("timers").setImmediate)

},{"../../../../../tools/intercepter":101,"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"../Instruction":30,"../ShadowFrame":48,"./InstructionList":31,"timers":138}],39:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./enum");
require("./SmaliWriter");
require("./UnUsedInstruction");
require("./InstructionList");
require("./SmalinInlineManager");
require("./Instrumentation");
require("./InstrumentationListener");
require("./InstrumentationStackFrame");
require("./InstrumentationStackPopper");
},{"./InstructionList":31,"./Instrumentation":32,"./InstrumentationListener":33,"./InstrumentationStackFrame":34,"./InstrumentationStackPopper":35,"./SmaliWriter":36,"./SmalinInlineManager":37,"./UnUsedInstruction":38,"./enum":39}],41:[function(require,module,exports){
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
},{"../../../JSHandle":11}],42:[function(require,module,exports){
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
},{"../../../../../tools/StdString":94,"../../../../JSHandle":11,"../Globals":29}],43:[function(require,module,exports){
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
},{"../../../../../tools/StdString":94,"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"../Globals":29,"./OatFile":44}],44:[function(require,module,exports){
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
},{"../../../../../tools/StdString":94,"../../../../JSHandle":11,"../Globals":29}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./OatFile");
require("./OatDexFile");
require("./MemMap");
},{"./MemMap":42,"./OatDexFile":43,"./OatFile":44}],46:[function(require,module,exports){
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
},{"../../../JSHandle":11}],47:[function(require,module,exports){
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
},{"../../../JSHandle":11}],48:[function(require,module,exports){
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
        return this.dex_pc_ptr_.isNull() ? this.dex_pc_ : this.dex_instructions_.sub(this.dex_pc_ptr_);
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
        this.dex_pc = dex_pc_v.toUInt32();
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
},{"../../../JSHandle":11,"../../../Object":12,"../../../Utils/SymHelper":16,"./Globals":29,"./Instruction":30,"./ObjPtr":46,"./Type/JValue":55,"./dexfile/CodeItemInstructionAccessor":63,"./mirror/ArtMethod":77}],49:[function(require,module,exports){
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
},{"./StackVisitor":51}],50:[function(require,module,exports){
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
},{"./StackVisitor":51}],51:[function(require,module,exports){
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
},{"../../../../../tools/StdString":94,"../../../../JSHandle":11,"../../../../Object":12,"../../../../Utils/SymHelper":16,"../Globals":29,"../OatQuickMethodHeader":41,"../QuickMethodFrameInfo":47,"../ShadowFrame":48,"../Thread":53,"../mirror/ArtMethod":77}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StackVisitor");
require("./CHAStackVisitor");
require("./CatchBlockStackVisitor");
},{"./CHAStackVisitor":49,"./CatchBlockStackVisitor":50,"./StackVisitor":51}],53:[function(require,module,exports){
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
},{"../../../../tools/StdString":94,"../../../JSHandle":11,"../../../Utils/SymHelper":16,"./Globals":29,"./Thread_Inl":54,"./mirror/ArtMethod":77}],54:[function(require,module,exports){
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
},{"../../../JSHandle":11,"./Globals":29,"./ShadowFrame":48}],55:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../../../../Object":12}],56:[function(require,module,exports){
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
},{"../../../../Object":12}],57:[function(require,module,exports){
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
},{"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JValue");
require("./jobject");
require("./JavaString");
require("./Throwable");
},{"./JValue":55,"./JavaString":56,"./Throwable":57,"./jobject":59}],59:[function(require,module,exports){
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
},{"../../../../JSHandle":11}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],61:[function(require,module,exports){
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
},{"../Globals":29,"./CodeItemInstructionAccessor":63}],62:[function(require,module,exports){
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
},{"../Globals":29,"./CodeItemDataAccessor":61}],63:[function(require,module,exports){
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
            accessor.insns = codeItem.insns_start;
            accessor.CodeItem = codeItem;
        }
        else {
            const codeItem = CodeItemInstructionAccessor.CodeItem(dexFile, dex_pc);
            accessor.insns_size_in_code_units = codeItem.insns_size_in_code_units;
            accessor.insns = codeItem.insns_start;
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
},{"../../../../JSHandle":11,"../Globals":29,"../Instruction":30,"./CompactDexFile":64,"./StandardDexFile":69}],64:[function(require,module,exports){
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
        disp += `\n\tfields: ${this.fields} | insns_count_and_flags: ${this.insns_count_and_flags} | insns: ${this.insns_start}`;
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
    set insns_count_and_flags(insns_count_and_flags) {
        this.insns_count_and_flags_.writeU16(insns_count_and_flags.toInt32());
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
    set ins_size(ins_size) {
        this.fields = ptr((ins_size << (4 * 2)) | this.fields.toUInt32());
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
    set insns_size_in_code_units(insns_size_in_code_units) {
        this.insns_count_and_flags = ptr((insns_size_in_code_units << Globals_1.kInsnsSizeShift) | this.insns_count_and_flags.toUInt32());
    }
    get extension_preheader() {
        return this.insns_count_and_flags.shl(Globals_1.kInsnsSizeShift).toUInt32();
    }
    get header_start() {
        return this.CurrentHandle;
    }
    get header_size() {
        return this.insns_.sub(this.CurrentHandle).toUInt32();
    }
    get insns_start() {
        return this.insns_;
    }
    get insns_size() {
        return this.insns_size_in_code_units * 2;
    }
}
exports.CompactDexFile_CodeItem = CompactDexFile_CodeItem;
},{"../Globals":29,"./DexFile":65}],65:[function(require,module,exports){
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
            LOGE("IsReadOnly() not supported for compact dex files \n\t rm -rf /data/app/xxx/oat first");
            return false;
        }
        let ret = !(0, SymHelper_1.callSym)("_ZNK3art7DexFile10IsReadOnlyEv", "libdexfile.so", "pointer", ["pointer"], this.handle).isNull();
        return ret;
    }
    DisableWrite() {
        if (this.is_compact_dex) {
            LOGE("DisableWrite() not supported for compact dex files \n\t rm -rf /data/app/xxx/oat first");
            return false;
        }
        let ret = !(0, SymHelper_1.callSym)("_ZNK3art7DexFile12DisableWriteEv", "libdexfile.so", "pointer", ["pointer"], this.handle).isNull();
        return ret;
    }
    EnableWrite() {
        if (this.is_compact_dex) {
            LOGE("EnableWrite() not supported for compact dex files \n\t rm -rf /data/app/xxx/oat first");
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
},{"../../../../../tools/StdString":94,"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"../Globals":29,"../Oat/OatDexFile":43,"./DexFileStructs":66,"./DexIndex":67,"./Header":68}],66:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../Globals":29,"./DexIndex":67}],67:[function(require,module,exports){
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
},{"../../../../ValueHandle":18}],68:[function(require,module,exports){
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
},{"../../../../JSHandle":11}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardDexFile_CodeItem = exports.StandardDexFile = void 0;
const DexFile_1 = require("./DexFile");
class StandardDexFile extends DexFile_1.DexFile {
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
    get insns() {
        return this.insns_;
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
    get header_start() {
        return this.CurrentHandle;
    }
    get header_size() {
        return this.insns_.sub(this.CurrentHandle).toUInt32();
    }
    get insns_start() {
        return this.insns_;
    }
    get insns_size() {
        return this.insns_size_in_code_units * 2;
    }
}
exports.StandardDexFile_CodeItem = StandardDexFile_CodeItem;
},{"./DexFile":65}],70:[function(require,module,exports){
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
},{"./CodeItemDataAccessor":61,"./CodeItemDebugInfoAccessor":62,"./CodeItemInstructionAccessor":63,"./CompactDexFile":64,"./DexFile":65,"./DexFileStructs":66,"./DexIndex":67,"./Header":68,"./StandardDexFile":69}],71:[function(require,module,exports){
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
},{"./ClassLinker":27,"./GcRoot":28,"./Globals":29,"./Instruction":30,"./Instrumentation/include":40,"./Oat/include":45,"./OatQuickMethodHeader":41,"./ObjPtr":46,"./QuickMethodFrameInfo":47,"./ShadowFrame":48,"./StackVisitor/include":52,"./Thread":53,"./Thread_Inl":54,"./Type/include":58,"./bridge":60,"./dexfile/include":70,"./interpreter/include":74,"./mirror/include":82,"./runtime/include":85}],72:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionHandler = void 0;
const intercepter_1 = require("../../../../../tools/intercepter");
const JSHandle_1 = require("../../../../JSHandle");
const SymHelper_1 = require("../../../../Utils/SymHelper");
class InstructionHandler extends JSHandle_1.JSHandleNotImpl {
    static Hook_InstructionHandler() {
        const target = (0, SymHelper_1.getSym)("_ZN3art11interpreter18InstructionHandlerILb0ELb1EE45HandlePendingExceptionWithInstrumentationImplEPKNS_15instrumentation15InstrumentationE");
        (0, intercepter_1.R)(target, new NativeCallback(() => {
            LOGD(`Called InstructionHandler()`);
            return;
        }, 'void', []));
    }
}
exports.InstructionHandler = InstructionHandler;
setImmediate(() => {
});
}).call(this)}).call(this,require("timers").setImmediate)

},{"../../../../../tools/intercepter":101,"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"timers":138}],73:[function(require,module,exports){
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
},{"../../../../JSHandle":11,"../Globals":29,"../ShadowFrame":48,"../Thread":53,"../Type/JValue":55,"../dexfile/CodeItemDataAccessor":61}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./interpreter");
require("./SwitchImplContext");
require("./InstructionHandler");
},{"./InstructionHandler":72,"./SwitchImplContext":73,"./interpreter":75}],75:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpreter = void 0;
const common_1 = require("../../../../../tools/common");
const JSHandle_1 = require("../../../../JSHandle");
const SymHelper_1 = require("../../../../Utils/SymHelper");
const intercepter_1 = require("../../../../../tools/intercepter");
const ShadowFrame_1 = require("../ShadowFrame");
class interpreter extends JSHandle_1.JSHandleNotImpl {
    static _CanUseMterp = false;
    static get CanUseMterp() {
        return interpreter._CanUseMterp;
    }
    static set CanUseMterp(value) {
        interpreter._CanUseMterp = value;
    }
    static Hook_CanUseMterp() {
        const target = (0, SymHelper_1.getSym)("_ZN3art11interpreter11CanUseMterpEv");
        Interceptor.attach(target, {
            onLeave(retval) {
                retval.replace(interpreter._CanUseMterp ? ptr(1) : NULL);
            }
        });
    }
    static Hook_AbortTransaction() {
        const target = (0, SymHelper_1.getSym)("_ZN3art11interpreter17AbortTransactionFEPNS_6ThreadEPKcz");
        try {
            (0, intercepter_1.R)(target, new NativeCallback(() => {
                LOGD(`Called AbortTransaction()`);
                return;
            }, 'void', []));
        }
        catch (error) {
        }
    }
    static Hook_AbortTransactionV() {
        const target = (0, SymHelper_1.getSym)("_ZN3art11interpreter17AbortTransactionVEPNS_6ThreadEPKcSt9__va_list");
        try {
            (0, intercepter_1.R)(target, new NativeCallback(() => {
                LOGD(`Called AbortTransactionV()`);
                return;
            }, 'void', []));
        }
        catch (error) {
        }
    }
    static Hook_MoveToExceptionHandler() {
        const target = (0, SymHelper_1.getSym)("_ZN3art11interpreter22MoveToExceptionHandlerEPNS_6ThreadERNS_11ShadowFrameEPKNS_15instrumentation15InstrumentationE");
        const target_SrcCall = new NativeFunction(target, 'pointer', ['pointer', 'pointer', 'pointer']);
        try {
            (0, intercepter_1.R)(target, new NativeCallback((self, shadow_frame, instrumentation) => {
                let ret = target_SrcCall(self, shadow_frame, instrumentation);
                const shadowFrame = new ShadowFrame_1.ShadowFrame(shadow_frame);
                return ret;
            }, 'pointer', ['pointer', 'pointer', 'pointer']));
        }
        catch (error) {
        }
    }
    static onValueChanged(key, value) {
        if (key != "CanUseMterp")
            return;
        LOGZ(`ArtInterpreter Got New Value -> ${key} -> ${value}`);
        if (key == "CanUseMterp")
            interpreter.CanUseMterp = value;
    }
    static moveToExceptionHandleCalledListeners = [];
    static addMoveToExceptionHandleCalledListener(listener) {
        interpreter.moveToExceptionHandleCalledListeners.push(listener);
    }
}
exports.interpreter = interpreter;
setImmediate(() => {
    common_1.KeyValueStore.getInstance().subscribe(interpreter);
});
setImmediate(() => {
    interpreter.Hook_CanUseMterp();
    interpreter.Hook_MoveToExceptionHandler();
});
Reflect.set(globalThis, "ArtInterpreter", interpreter);
}).call(this)}).call(this,require("timers").setImmediate)

},{"../../../../../tools/common":95,"../../../../../tools/intercepter":101,"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"../ShadowFrame":48,"timers":138}],76:[function(require,module,exports){
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
},{"../../../../../tools/StdString":94,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"./ClassExt":78,"./ClassLoader":79,"./DexCache":80,"./IfTable":81}],77:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const CodeItemInstructionAccessor_1 = require("../dexfile/CodeItemInstructionAccessor");
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const SymHelper_1 = require("../../../../Utils/SymHelper");
const modifiers_1 = require("../../../../../tools/modifiers");
const common_1 = require("../../../../../tools/common");
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
        if (typeof handle == "string")
            handle = pathToArtMethod(handle).handle;
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
    GetCodeItemPack() {
        const codeItem = this.GetCodeItem();
        const accesor = this.DexInstructions();
        const code_item = accesor.CodeItem;
        if (codeItem.isNull())
            return { headerStart: ptr(0), headerSize: 0, insnsStart: ptr(0), insnsSize: 0 };
        const headerSize = code_item.header_size;
        const insnsSize = code_item.insns_size;
        const headerStart = codeItem;
        const insnsStart = codeItem.add(headerSize);
        return { headerStart, headerSize, insnsStart, insnsSize };
    }
    SetCodeItem(codeItem) {
        this.dex_code_item_offset_.writeU32(codeItem.sub(this.GetDexFile().data_begin).toInt32());
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
        try {
            const PrettyJavaAccessFlagsStr = PrettyAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()));
            return `${PrettyJavaAccessFlagsStr}${this.PrettyMethod()}`;
        }
        catch (error) {
            return 'ERROR';
        }
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
        LOGD(`${this.methodName} @ ${this.handle}`);
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
        let index = 0;
        this.forEachSmali((insns, _codeitem) => {
            const offStr = `[${(++index).toString().padStart(3, ' ')}|${ptr(offset).toString().padEnd(5, ' ')}]`;
            LOGD(`${offStr} ${insns.handle} - ${insns.dumpHexLE()} |  ${insns.dumpString(dex_file)}`);
            offset += insns.SizeInCodeUnits;
            if (forceRet-- <= 0) {
                LOGW(`\nforce return counter -> ${forceRet}\nThere may be a loop error, check the code ...`);
                return;
            }
        });
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
    forEachSmali = (callback) => forEachSmali_static.bind(this)(this, callback);
    HookArtMethodInvoke = () => ArtMethod_Inl.HookArtMethodInvoke();
}
exports.ArtMethod = ArtMethod;
Reflect.set(globalThis, 'ArtMethod', ArtMethod);
class ArtMethod_Inl extends ArtMethod {
    static filterTimes_ptr = Memory.alloc(Process.pointerSize).writeInt(5);
    static filterThreadId_ptr = Memory.alloc(Process.pointerSize).writeInt(-1);
    static filterMethodName_ptr = Memory.alloc(Process.pointerSize * 10).writeUtf8String('');
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

            typedef struct _ArtMethod ArtMethod;

            extern void CalledArtMethod(ArtMethod* artMethod);

            typedef guint8 jboolean;
            typedef union _StdString StdString;
            typedef struct _StdStringShort StdStringShort;
            typedef struct _StdStringLong StdStringLong;

            struct _StdStringShort {
                guint8 size;
                gchar data[(3 * sizeof (gpointer)) - sizeof (guint8)];
            };

            struct _StdStringLong {
                gsize capacity;
                gsize size;
                gchar * data;
            };

            union _StdString {
                StdStringShort s;
                StdStringLong l;
            };
            
            // std::string PrettyMethod(bool with_signature = true)
            extern void ArtPrettyMethodFunc(StdString * result, ArtMethod * method, jboolean with_signature);

            void(*it)(void* dexFile);

            extern int filterTimes;
            extern int filterThreadId;
            extern const char* filterMethodName;

            extern GHashTable *ptrHash;

            gboolean filterMethodCount(void* ptr) {
                if (ptrHash == NULL) {
                    ptrHash = g_hash_table_new_full(g_direct_hash, g_direct_equal, NULL, NULL);
                }

                guint count = GPOINTER_TO_UINT(g_hash_table_lookup(ptrHash, ptr));

                if (count >= filterTimes) {
                    // frida_log("Filter PASS (Count >= %d ) -> %p", filterTimes, ptr);
                    return FALSE;
                } else {
                    g_hash_table_insert(ptrHash, ptr, GUINT_TO_POINTER(count + 1));
                    return TRUE;
                }
            }

            gboolean filterThreadIdCount(GumInvocationContext *ctx) {
                if (-1 == filterThreadId) return TRUE;
                guint threadid = gum_invocation_context_get_thread_id(ctx);
                return threadid == filterThreadId;
            }

            gboolean filterMethodNameCount(ArtMethod* artMethod) {
                StdString result;
                ArtPrettyMethodFunc(&result, artMethod, TRUE);
                const char* methodName = result.l.data;
                frida_log("methodName -> %s", methodName);
                if (g_str_has_prefix(methodName, filterMethodName)) {
                    return TRUE;
                }
                return FALSE;
            }

            void onEnter(GumInvocationContext *ctx) {
                ArtMethod* artMethod = gum_invocation_context_get_nth_argument(ctx, 0);
                if (filterMethodCount(artMethod) && filterThreadIdCount(ctx) 
                    // && filterMethodNameCount(artMethod)
                ) {
                    CalledArtMethod(artMethod);
                }
            }

        `, {
            filterTimes: ArtMethod_Inl.filterTimes_ptr,
            filterThreadId: ArtMethod_Inl.filterThreadId_ptr,
            filterMethodName: ArtMethod_Inl.filterMethodName_ptr,
            ptrHash: Memory.alloc(Process.pointerSize),
            ArtPrettyMethodFunc: (0, SymHelper_1.getSym)("_ZN3art9ArtMethod12PrettyMethodEb"),
            _frida_log: new NativeCallback((message) => {
                LOGZ(message.readCString());
            }, 'void', ['pointer']),
            CalledArtMethod: new NativeCallback((artMethod) => {
                const method = new ArtMethod(artMethod);
                if (!ArtMethod_Inl.includePackage.some((pkg) => method.methodName.includes(pkg))) {
                    return;
                }
                const msg = `Called [${Process.id}|${Process.getCurrentThreadId()}] -> ${method.methodName}`;
                method.methodName == "ERROR" ? LOGE(msg) : LOGD(msg);
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
    static includePackage = [
        "com.igaworks",
        "com.hippogames",
        "com.unity3d",
        "com.google",
    ];
    static onValueChanged(key, value) {
        if (key != "filterTimes" && key != "filterThreadId" && key != "filterMethodName")
            return;
        LOGZ(`ArtMethodInvoke Got New Value -> ${key} -> ${value}`);
        if (key == "filterTimes")
            ArtMethod_Inl.filterTimes_ptr.writeInt(value);
        if (key == "filterThreadId")
            ArtMethod_Inl.filterThreadId_ptr.writeInt(value);
        if (key == "filterMethodName")
            ArtMethod_Inl.filterMethodName_ptr.writeUtf8String(value);
    }
}
function forEachSmali_static(artMethod, callback) {
    const accessor = artMethod.DexInstructions();
    const code_item = accessor.CodeItem;
    let insns = accessor.InstructionAt();
    let offset = 0;
    let last_offset = 0;
    const count_insns = accessor.insns_size_in_code_units * 2;
    while (true) {
        callback(insns, code_item);
        offset += insns.SizeInCodeUnits;
        if (last_offset == offset)
            break;
        if (offset >= count_insns)
            break;
        insns = insns.Next();
        last_offset = offset;
    }
}
setImmediate(() => {
    common_1.KeyValueStore.getInstance().subscribe(ArtMethod_Inl);
});
globalThis.HookArtMethodInvoke = ArtMethod_Inl.HookArtMethodInvoke;
globalThis.forEachSmali = forEachSmali_static;
}).call(this)}).call(this,require("timers").setImmediate)

},{"../../../../../tools/StdString":94,"../../../../../tools/common":95,"../../../../../tools/enum":98,"../../../../../tools/modifiers":103,"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"../GcRoot":28,"../Globals":29,"../OatQuickMethodHeader":41,"../Thread":53,"../dexfile/CodeItemInstructionAccessor":63,"./ArtClass":76,"./DexCache":80,"timers":138}],78:[function(require,module,exports){
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
},{"../../../../Object":12}],79:[function(require,module,exports){
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
},{"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12}],80:[function(require,module,exports){
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
},{"../../../../../tools/StdString":94,"../../../../Interface/art/mirror/HeapReference":7,"../../../../Object":12,"../dexfile/DexFile":65}],81:[function(require,module,exports){
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
},{"../../../../Object":12}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":76,"./ArtMethod":77,"./ClassExt":78,"./ClassLoader":79,"./IfTable":81}],83:[function(require,module,exports){
(function (global){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtRuntime = void 0;
const SymHelper_1 = require("../../../../Utils/SymHelper");
const JSHandle_1 = require("../../../../JSHandle");
const StdString_1 = require("../../../../../tools/StdString");
class ArtRuntime extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    static getInstance() {
        return new ArtRuntime(Java.api.artRuntime);
    }
    GetCompilerExecutable() {
        return StdString_1.StdString.fromPointers((0, SymHelper_1.callSym)("_ZNK3art7Runtime21GetCompilerExecutableEv", "libart.so", ['pointer', 'pointer', 'pointer'], ['pointer'], this.handle));
    }
}
exports.ArtRuntime = ArtRuntime;
Reflect.set(global, 'ArtRuntime', ArtRuntime);
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../../../../tools/StdString":94,"../../../../JSHandle":11,"../../../../Utils/SymHelper":16}],84:[function(require,module,exports){
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
            try {
                threadLists.push({ thread: new Thread_1.ArtThread(thread), context: context });
            }
            catch (error) {
                LOGE("ThreadList.ForEach ERROR" + error);
            }
        }, "void", ["pointer", "pointer"]), tempMemory);
        return threadLists;
    }
}
exports.ThreadList = ThreadList;
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
},{"../../../../JSHandle":11,"../../../../Utils/SymHelper":16,"../Thread":53}],85:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Runtime");
require("./ThreadList");
},{"./Runtime":83,"./ThreadList":84}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dex2oat = void 0;
const StdString_1 = require("../../../../tools/StdString");
const intercepter_1 = require("../../../../tools/intercepter");
const SymHelper_1 = require("../../../Utils/SymHelper");
class dex2oat {
    static hook_ExecAndReturnCode() {
        const target = (0, SymHelper_1.getSym)("_ZN3art17ExecAndReturnCodeERNSt3__16vectorINS0_12basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEENS5_IS7_EEEEPS7_", "libart.so");
        const srcCall = new NativeFunction(target, 'int', ['pointer', 'pointer']);
        (0, intercepter_1.R)(target, new NativeCallback((arg_vector_, error_msg_) => {
            const error_msg = new StdString_1.StdString(error_msg_[1]);
            LOGD(`ExecAndReturnCode arg_vector: ${arg_vector_} error_msg: ${error_msg.toString()}`);
            return ptr(-1);
        }, 'pointer', ['pointer', 'pointer']));
    }
    static DEX2OAT_BIN = "/system/bin/dex2oat";
    static hook_exec() {
        const target_execv = (0, SymHelper_1.getSym)("execv", "libc.so");
        const srcCall_execv = new NativeFunction(target_execv, 'int', ['pointer', 'pointer']);
        (0, intercepter_1.R)(target_execv, new NativeCallback((path, argv) => {
            const pathStr = path.readCString();
            const argvStr = argv.readCString();
            LOGD(`execv path: ${pathStr} argv: ${argvStr}`);
            if (pathStr.includes(dex2oat.DEX2OAT_BIN))
                return ptr(-1);
            return srcCall_execv(path, argv);
        }, 'pointer', ['pointer', 'pointer']));
        const target_execve = (0, SymHelper_1.getSym)("execve", "libc.so");
        const srcCall_execve = new NativeFunction(target_execve, 'int', ['pointer', 'pointer', 'pointer']);
        (0, intercepter_1.R)(target_execve, new NativeCallback((file, argv, envp) => {
            const fileStr = file.readCString();
            const argvStr = argv.readCString();
            const envpStr = envp.readCString();
            LOGD(`execve file: ${fileStr} argv: ${argvStr} envp: ${envpStr}`);
            if (fileStr.includes(dex2oat.DEX2OAT_BIN))
                return ptr(-1);
            return srcCall_execve(file, argv, envp);
        }, 'pointer', ['pointer', 'pointer', 'pointer']));
    }
}
exports.dex2oat = dex2oat;
Reflect.set(globalThis, 'dex2oat', dex2oat);
},{"../../../../tools/StdString":94,"../../../../tools/intercepter":101,"../../../Utils/SymHelper":16}],87:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./dex2oat");
},{"./dex2oat":86}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
require("./dex2oat/include");
},{"./art/include":71,"./dex2oat/include":87}],89:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":88}],90:[function(require,module,exports){
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
},{"./Interface/include":10,"./JSHandle":11,"./Object":12,"./TraceManager":13,"./Utils/include":17,"./ValueHandle":18,"./android":19,"./functions/include":25,"./implements/include":89,"./machine-code":91}],91:[function(require,module,exports){
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
},{}],92:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":4,"./android/include":90,"./tools/include":100}],93:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./include");
const JavaHooker_1 = require("./android/Utils/JavaHooker");
globalThis.testArtMethod = () => {
    Java.perform(() => {
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
Java.perform(() => {
    (0, JavaHooker_1.hookJavaClass)("com.unity3d.player.UnityWebRequest", null, ['uploadCallback']);
});
},{"./android/Utils/JavaHooker":15,"./include":92}],94:[function(require,module,exports){
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
        try {
            return pointer.add(Process.pointerSize * 2).readCString();
        }
        catch (error) {
            return 'ERROR';
        }
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
},{}],95:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyValueStore = void 0;
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
class KeyValueStore {
    static instance;
    subscribers = [];
    store = new Map();
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new KeyValueStore();
        }
        return this.instance;
    }
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }
    unsubscribe(subscriber) {
        const index = this.subscribers.indexOf(subscriber);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    }
    update(key, value) {
        this.store.set(key, value);
        for (const subscriber of this.subscribers) {
            subscriber.onValueChanged(key, value);
        }
    }
    get(key) {
        return this.store.get(key);
    }
}
exports.KeyValueStore = KeyValueStore;
class globalValueStore {
    static set filterThreadId(value) {
        KeyValueStore.getInstance().update('filterThreadId', value);
    }
    static get filterThreadId() {
        return KeyValueStore.getInstance().get('filterThreadId') || -1;
    }
    static set filterTimes(value) {
        KeyValueStore.getInstance().update('filterTimes', value);
    }
    static get filterTimes() {
        return KeyValueStore.getInstance().get('filterTimes') || 5;
    }
    static set CanUseMterp(value) {
        KeyValueStore.getInstance().update('CanUseMterp', value);
    }
    static get CanUseMterp() {
        return KeyValueStore.getInstance().get('CanUseMterp') || false;
    }
    static set filterMethodName(value) {
        KeyValueStore.getInstance().update('filterMethodName', value);
    }
    static get filterMethodName() {
        return KeyValueStore.getInstance().get('filterMethodName') || "";
    }
}
setImmediate(() => {
    globalValueStore.filterThreadId = -1;
    globalValueStore.filterTimes = 5;
    globalValueStore.CanUseMterp = false;
    globalValueStore.filterMethodName = '';
});
Reflect.set(globalThis, "globalValueStore", globalValueStore);
globalThis.setfilterThreadId = (value) => globalValueStore.filterThreadId = value;
globalThis.setfilterTimes = (value) => globalValueStore.filterTimes = value;
globalThis.setCanUseMterp = (value) => globalValueStore.CanUseMterp = value;
globalThis.setfilterMethodName = (value) => globalValueStore.filterMethodName = value;
}).call(this)}).call(this,require("timers").setImmediate)

},{"timers":138}],96:[function(require,module,exports){
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

},{"timers":138}],97:[function(require,module,exports){
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
},{}],98:[function(require,module,exports){
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
},{}],99:[function(require,module,exports){
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
},{}],100:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./dlopen");
require("./dump");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
require("./intercepter");
},{"./StdString":94,"./common":95,"./dlopen":96,"./dump":97,"./enum":98,"./intercepter":101,"./logger":102,"./modifiers":103}],101:[function(require,module,exports){
(function (global){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.A = exports.R = exports.nop = exports.bsym = void 0;
const SymHelper_1 = require("../android/Utils/SymHelper");
const bsym = (name, lib = "libart.so") => {
    const target = (0, SymHelper_1.getSym)(name, lib, false);
    const demangleStr = demangleName(name);
    const targetName = `${demangleStr.length == 0}` ? name : demangleStr;
    LOGD(`Hooking [ ${targetName} ] from ${lib} => ${target}`);
    Interceptor.attach(target, {
        onEnter(args) {
            this.args = args;
        },
        onLeave(retval) {
            LOGD(`\nCalled ${name}(${this.args.map((arg) => arg.toString()).join(', ')}) => ${retval}`);
        }
    });
};
exports.bsym = bsym;
const nop = (functionAddress) => (0, exports.R)(functionAddress, new NativeCallback(() => { LOGD(`Called NOP -> ${functionAddress}`); return; }, 'void', []));
exports.nop = nop;
const R = (functionAddress, callback) => {
    if (typeof functionAddress == 'number')
        functionAddress = ptr(functionAddress);
    if (typeof functionAddress == "string")
        functionAddress = (0, SymHelper_1.getSym)(functionAddress);
    const debugInfo = DebugSymbol.fromAddress(functionAddress);
    try {
        Interceptor.replace(functionAddress, callback);
    }
    catch (error) {
        if (error.message.indexOf("already hooked") != -1) {
            LOGE(`Enable Replace -> ${debugInfo.name} | ${debugInfo.address} <- already replaced , try to rehook`);
            Interceptor.revert(functionAddress);
            Interceptor.replace(functionAddress, callback);
        }
        else {
            LOGE(`Enable Replace -> ${debugInfo.name} | ${debugInfo.address} <- ${error}`);
        }
    }
};
exports.R = R;
const listeners = [];
const A = (functionAddress, callbacksOrProbe, data) => {
    if (typeof functionAddress == 'number')
        functionAddress = ptr(functionAddress);
    if (typeof functionAddress == "string")
        functionAddress = (0, SymHelper_1.getSym)(functionAddress);
    const debugInfo = DebugSymbol.fromAddress(functionAddress);
    try {
        listeners.push(Interceptor.attach(functionAddress, callbacksOrProbe, data));
        LOGD(`Enable Attach -> ${debugInfo.name} | ${debugInfo.address}`);
    }
    catch (error) {
        LOGE(`Enable Attach -> ${debugInfo.name} | ${debugInfo.address} <- ${error}`);
    }
};
exports.A = A;
Reflect.set(global, 'bsym', exports.bsym);
Reflect.set(global, 'nop', exports.nop);
Reflect.set(global, 'R', exports.R);
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../android/Utils/SymHelper":16}],102:[function(require,module,exports){
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
},{}],103:[function(require,module,exports){
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
},{}],104:[function(require,module,exports){
(function (global){(function (){
'use strict';

var objectAssign = require('object.assign/polyfill')();

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"object.assign/polyfill":135,"util/":107}],105:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],106:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],107:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":106,"_process":115,"inherits":105}],108:[function(require,module,exports){
(function (global){(function (){
'use strict';

var possibleNames = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

var g = typeof globalThis === 'undefined' ? global : globalThis;

module.exports = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g[possibleNames[i]] === 'function') {
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],109:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":110,"get-intrinsic":118}],110:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');
var setFunctionLength = require('set-function-length');

var $TypeError = GetIntrinsic('%TypeError%');
var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	if (typeof originalFunction !== 'function') {
		throw new $TypeError('a function is required');
	}
	var func = $reflectApply(bind, $call, arguments);
	return setFunctionLength(
		func,
		1 + $max(0, originalFunction.length - (arguments.length - 1)),
		true
	);
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":117,"get-intrinsic":118,"set-function-length":137}],111:[function(require,module,exports){
(function (global){(function (){
/*global window, global*/
var util = require("util")
var assert = require("assert")
function now() { return new Date().getTime() }

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = {}
}

var functions = [
    [log, "log"],
    [info, "info"],
    [warn, "warn"],
    [error, "error"],
    [time, "time"],
    [timeEnd, "timeEnd"],
    [trace, "trace"],
    [dir, "dir"],
    [consoleAssert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    delete times[label]
    var duration = now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function consoleAssert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"assert":104,"util":141}],112:[function(require,module,exports){
'use strict';

var hasPropertyDescriptors = require('has-property-descriptors')();

var GetIntrinsic = require('get-intrinsic');

var $defineProperty = hasPropertyDescriptors && GetIntrinsic('%Object.defineProperty%', true);
if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = false;
	}
}

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');

var gopd = require('gopd');

/** @type {(obj: Record<PropertyKey, unknown>, property: PropertyKey, value: unknown, nonEnumerable?: boolean | null, nonWritable?: boolean | null, nonConfigurable?: boolean | null, loose?: boolean) => void} */
module.exports = function defineDataProperty(
	obj,
	property,
	value
) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new $TypeError('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new $TypeError('`property` must be a string or a symbol`');
	}
	if (arguments.length > 3 && typeof arguments[3] !== 'boolean' && arguments[3] !== null) {
		throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 4 && typeof arguments[4] !== 'boolean' && arguments[4] !== null) {
		throw new $TypeError('`nonWritable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 5 && typeof arguments[5] !== 'boolean' && arguments[5] !== null) {
		throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
		throw new $TypeError('`loose`, if provided, must be a boolean');
	}

	var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
	var nonWritable = arguments.length > 4 ? arguments[4] : null;
	var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
	var loose = arguments.length > 6 ? arguments[6] : false;

	/* @type {false | TypedPropertyDescriptor<unknown>} */
	var desc = !!gopd && gopd(obj, property);

	if ($defineProperty) {
		$defineProperty(obj, property, {
			configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
			value: value,
			writable: nonWritable === null && desc ? desc.writable : !nonWritable
		});
	} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
		// must fall back to [[Set]], and was not explicitly asked to make non-enumerable, non-writable, or non-configurable
		obj[property] = value; // eslint-disable-line no-param-reassign
	} else {
		throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}
};

},{"get-intrinsic":118,"gopd":119,"has-property-descriptors":120}],113:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}],114:[function(require,module,exports){
'use strict';

var isCallable = require('is-callable');

var toStr = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

module.exports = forEach;

},{"is-callable":128}],115:[function(require,module,exports){
// Based on https://github.com/shtylman/node-process

const EventEmitter = require('events');

const process = module.exports = {};

process.nextTick = Script.nextTick;

process.title = 'Frida';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

process.EventEmitter = EventEmitter;
process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/'
};
process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};
process.umask = function () {
  return 0;
};

function noop () {}

},{"events":113}],116:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';

var concatty = function concatty(a, b) {
    var arr = [];

    for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
    }

    return arr;
};

var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
    }
    return arr;
};

var joiny = function (arr, joiner) {
    var str = '';
    for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                concatty(args, arguments)
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(
            that,
            concatty(args, arguments)
        );

    };

    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = '$' + i;
    }

    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],117:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":116}],118:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();
var hasProto = require('has-proto')();

var getProto = Object.getPrototypeOf || (
	hasProto
		? function (x) { return x.__proto__; } // eslint-disable-line no-proto
		: null
);

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

if (getProto) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('hasown');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":117,"has-proto":121,"has-symbols":122,"hasown":125}],119:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"get-intrinsic":118}],120:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);

var hasPropertyDescriptors = function hasPropertyDescriptors() {
	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
			return true;
		} catch (e) {
			// IE 8 has a broken defineProperty
			return false;
		}
	}
	return false;
};

hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!hasPropertyDescriptors()) {
		return null;
	}
	try {
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

module.exports = hasPropertyDescriptors;

},{"get-intrinsic":118}],121:[function(require,module,exports){
'use strict';

var test = {
	foo: {}
};

var $Object = Object;

module.exports = function hasProto() {
	return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
};

},{}],122:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":123}],123:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],124:[function(require,module,exports){
'use strict';

var hasSymbols = require('has-symbols/shams');

module.exports = function hasToStringTagShams() {
	return hasSymbols() && !!Symbol.toStringTag;
};

},{"has-symbols/shams":123}],125:[function(require,module,exports){
'use strict';

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = require('function-bind');

/** @type {(o: {}, p: PropertyKey) => p is keyof o} */
module.exports = bind.call(call, $hasOwn);

},{"function-bind":117}],126:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],127:[function(require,module,exports){
'use strict';

var hasToStringTag = require('has-tostringtag/shams')();
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{"call-bind/callBound":109,"has-tostringtag/shams":124}],128:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var objectClass = '[object Object]';
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var ddaClass = '[object HTMLAllCollection]'; // IE 11
var ddaClass2 = '[object HTML document.all class]';
var ddaClass3 = '[object HTMLCollection]'; // IE 9-10
var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var isDDA = function isDocumentDotAll() { return false; };
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr.call(all) === toStr.call(document.all)) {
		isDDA = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr.call(value);
					return (
						str === ddaClass
						|| str === ddaClass2
						|| str === ddaClass3 // opera 12.16
						|| str === objectClass // IE 6-8
					) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

module.exports = reflectApply
	? function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	}
	: function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr.call(value);
		if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) { return false; }
		return tryFunctionObject(value);
	};

},{}],129:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = require('has-tostringtag/shams')();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};

},{"has-tostringtag/shams":124}],130:[function(require,module,exports){
'use strict';

var whichTypedArray = require('which-typed-array');

module.exports = function isTypedArray(value) {
	return !!whichTypedArray(value);
};

},{"which-typed-array":142}],131:[function(require,module,exports){
'use strict';

var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = require('./isArguments'); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;

},{"./isArguments":133}],132:[function(require,module,exports){
'use strict';

var slice = Array.prototype.slice;
var isArgs = require('./isArguments');

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : require('./implementation');

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./implementation":131,"./isArguments":133}],133:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],134:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es6-shim
var objectKeys = require('object-keys');
var hasSymbols = require('has-symbols/shams')();
var callBound = require('call-bind/callBound');
var toObject = Object;
var $push = callBound('Array.prototype.push');
var $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
var originalGetSymbols = hasSymbols ? Object.getOwnPropertySymbols : null;

// eslint-disable-next-line no-unused-vars
module.exports = function assign(target, source1) {
	if (target == null) { throw new TypeError('target must be an object'); }
	var to = toObject(target); // step 1
	if (arguments.length === 1) {
		return to; // step 2
	}
	for (var s = 1; s < arguments.length; ++s) {
		var from = toObject(arguments[s]); // step 3.a.i

		// step 3.a.ii:
		var keys = objectKeys(from);
		var getSymbols = hasSymbols && (Object.getOwnPropertySymbols || originalGetSymbols);
		if (getSymbols) {
			var syms = getSymbols(from);
			for (var j = 0; j < syms.length; ++j) {
				var key = syms[j];
				if ($propIsEnumerable(from, key)) {
					$push(keys, key);
				}
			}
		}

		// step 3.a.iii:
		for (var i = 0; i < keys.length; ++i) {
			var nextKey = keys[i];
			if ($propIsEnumerable(from, nextKey)) { // step 3.a.iii.2
				var propValue = from[nextKey]; // step 3.a.iii.2.a
				to[nextKey] = propValue; // step 3.a.iii.2.b
			}
		}
	}

	return to; // step 4
};

},{"call-bind/callBound":109,"has-symbols/shams":123,"object-keys":132}],135:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

var lacksProperEnumerationOrder = function () {
	if (!Object.assign) {
		return false;
	}
	/*
	 * v8, specifically in node 4.x, has a bug with incorrect property enumeration order
	 * note: this does not detect the bug unless there's 20 characters
	 */
	var str = 'abcdefghijklmnopqrst';
	var letters = str.split('');
	var map = {};
	for (var i = 0; i < letters.length; ++i) {
		map[letters[i]] = letters[i];
	}
	var obj = Object.assign({}, map);
	var actual = '';
	for (var k in obj) {
		actual += k;
	}
	return str !== actual;
};

var assignHasPendingExceptions = function () {
	if (!Object.assign || !Object.preventExtensions) {
		return false;
	}
	/*
	 * Firefox 37 still has "pending exception" logic in its Object.assign implementation,
	 * which is 72% slower than our shim, and Firefox 40's native implementation.
	 */
	var thrower = Object.preventExtensions({ 1: 2 });
	try {
		Object.assign(thrower, 'xy');
	} catch (e) {
		return thrower[1] === 'y';
	}
	return false;
};

module.exports = function getPolyfill() {
	if (!Object.assign) {
		return implementation;
	}
	if (lacksProperEnumerationOrder()) {
		return implementation;
	}
	if (assignHasPendingExceptions()) {
		return implementation;
	}
	return Object.assign;
};

},{"./implementation":134}],136:[function(require,module,exports){
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

},{}],137:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var define = require('define-data-property');
var hasDescriptors = require('has-property-descriptors')();
var gOPD = require('gopd');

var $TypeError = GetIntrinsic('%TypeError%');
var $floor = GetIntrinsic('%Math.floor%');

module.exports = function setFunctionLength(fn, length) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
		throw new $TypeError('`length` must be a positive 32-bit integer');
	}

	var loose = arguments.length > 2 && !!arguments[2];

	var functionLengthIsConfigurable = true;
	var functionLengthIsWritable = true;
	if ('length' in fn && gOPD) {
		var desc = gOPD(fn, 'length');
		if (desc && !desc.configurable) {
			functionLengthIsConfigurable = false;
		}
		if (desc && !desc.writable) {
			functionLengthIsWritable = false;
		}
	}

	if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
		if (hasDescriptors) {
			define(fn, 'length', length, true, true);
		} else {
			define(fn, 'length', length);
		}
	}
	return fn;
};

},{"define-data-property":112,"get-intrinsic":118,"gopd":119,"has-property-descriptors":120}],138:[function(require,module,exports){
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

},{"process/browser.js":136,"timers":138}],139:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"dup":106}],140:[function(require,module,exports){
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

var isArgumentsObject = require('is-arguments');
var isGeneratorFunction = require('is-generator-function');
var whichTypedArray = require('which-typed-array');
var isTypedArray = require('is-typed-array');

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBufferCopy === 'undefined') {
    return false;
  }

  if (typeof isSharedArrayBufferToString.working === 'undefined') {
    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBufferCopy;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});

},{"is-arguments":127,"is-generator-function":129,"is-typed-array":130,"which-typed-array":142}],141:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  var debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').slice(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.slice(1, -1);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = require('./support/types');

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

}).call(this)}).call(this,require('_process'))

},{"./support/isBuffer":139,"./support/types":140,"_process":115,"inherits":126}],142:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('for-each');
var availableTypedArrays = require('available-typed-arrays');
var callBind = require('call-bind');
var callBound = require('call-bind/callBound');
var gOPD = require('gopd');

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = require('has-tostringtag/shams')();

var g = typeof globalThis === 'undefined' ? global : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');

var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var cache = { __proto__: null };
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			cache['$' + typedArray] = callBind(descriptor.get);
		}
	});
} else {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		var fn = arr.slice || arr.set;
		if (fn) {
			cache['$' + typedArray] = callBind(fn);
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var found = false;
	forEach(cache, function (getter, typedArray) {
		if (!found) {
			try {
				if ('$' + getter(value) === typedArray) {
					found = $slice(typedArray, 1);
				}
			} catch (e) { /**/ }
		}
	});
	return found;
};

var trySlices = function tryAllSlices(value) {
	var found = false;
	forEach(cache, function (getter, name) {
		if (!found) {
			try {
				getter(value);
				found = $slice(name, 1);
			} catch (e) { /**/ }
		}
	});
	return found;
};

module.exports = function whichTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag) {
		var tag = $slice($toString(value), 8, -1);
		if ($indexOf(typedArrays, tag) > -1) {
			return tag;
		}
		if (tag !== 'Object') {
			return false;
		}
		// node < 0.6 hits here on real Typed Arrays
		return trySlices(value);
	}
	if (!gOPD) { return null; } // unknown engine
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"available-typed-arrays":108,"call-bind":110,"call-bind/callBound":109,"for-each":114,"gopd":119,"has-tostringtag/shams":124}]},{},[93])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0NvbnRleHQudHMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9UaGVhZHMudHMiLCJhZ2VudC9KYXZhL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvSGVhcFJlZmVyZW5jZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0pTSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9PYmplY3QudHMiLCJhZ2VudC9hbmRyb2lkL1RyYWNlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvQXJ0TWV0aG9kSGVscGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9KYXZhSG9va2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9TeW1IZWxwZXIudHMiLCJhZ2VudC9hbmRyb2lkL1V0aWxzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL1ZhbHVlSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9hbmRyb2lkLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvRGVmaW5lQ2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9EZXhGaWxlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL0V4ZWN1dGVTd2l0Y2hJbXBsQ3BwLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvT3BlbkNvbW1vbi50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL1N5bWJvbE1hbmFnZXIudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvaW5pdF9hcnJheS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvQ2xhc3NMaW5rZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0djUm9vdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvR2xvYmFscy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1Y3Rpb24udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVjdGlvbkxpc3QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb24udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb25MaXN0ZW5lci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL0luc3RydW1lbnRhdGlvblN0YWNrRnJhbWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9JbnN0cnVtZW50YXRpb25TdGFja1BvcHBlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL1NtYWxpV3JpdGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVtZW50YXRpb24vU21hbGluSW5saW5lTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL1VuVXNlZEluc3RydWN0aW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVtZW50YXRpb24vZW51bS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdFF1aWNrTWV0aG9kSGVhZGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvTWVtTWFwLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvT2F0RGV4RmlsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2F0L09hdEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYmpQdHIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1F1aWNrTWV0aG9kRnJhbWVJbmZvLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TaGFkb3dGcmFtZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU3RhY2tWaXNpdG9yL0NIQVN0YWNrVmlzaXRvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU3RhY2tWaXNpdG9yL0NhdGNoQmxvY2tTdGFja1Zpc2l0b3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9TdGFja1Zpc2l0b3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1N0YWNrVmlzaXRvci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UaHJlYWQudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1RocmVhZF9JbmwudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvSlZhbHVlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UeXBlL0phdmFTdHJpbmcudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvVGhyb3dhYmxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9UeXBlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvam9iamVjdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9Db2RlSXRlbURhdGFBY2Nlc3Nvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9Db2RlSXRlbURlYnVnSW5mb0FjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtSW5zdHJ1Y3Rpb25BY2Nlc3Nvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9Db21wYWN0RGV4RmlsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9EZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0RleEZpbGVTdHJ1Y3RzLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0RleEluZGV4LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0hlYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9TdGFuZGFyZERleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvaW50ZXJwcmV0ZXIvSW5zdHJ1Y3Rpb25IYW5kbGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbnRlcnByZXRlci9Td2l0Y2hJbXBsQ29udGV4dC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvaW50ZXJwcmV0ZXIvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvaW50ZXJwcmV0ZXIvaW50ZXJwcmV0ZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRDbGFzcy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0FydE1ldGhvZC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzRXh0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQ2xhc3NMb2FkZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9EZXhDYWNoZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0lmVGFibGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9ydW50aW1lL1J1bnRpbWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L3J1bnRpbWUvVGhyZWFkTGlzdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvcnVudGltZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2RleDJvYXQvZGV4Mm9hdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9kZXgyb2F0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9tYWNoaW5lLWNvZGUuanMiLCJhZ2VudC9pbmNsdWRlLnRzIiwiYWdlbnQvbWFpbi50cyIsImFnZW50L3Rvb2xzL1N0ZFN0cmluZy50cyIsImFnZW50L3Rvb2xzL2NvbW1vbi50cyIsImFnZW50L3Rvb2xzL2Rsb3Blbi50cyIsImFnZW50L3Rvb2xzL2R1bXAudHMiLCJhZ2VudC90b29scy9lbnVtLnRzIiwiYWdlbnQvdG9vbHMvZnVuY3Rpb25zLnRzIiwiYWdlbnQvdG9vbHMvaW5jbHVkZS50cyIsImFnZW50L3Rvb2xzL2ludGVyY2VwdGVyLnRzIiwiYWdlbnQvdG9vbHMvbG9nZ2VyLnRzIiwiYWdlbnQvdG9vbHMvbW9kaWZpZXJzLnRzIiwibm9kZV9tb2R1bGVzL2Fzc2VydC9hc3NlcnQuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9hc3NlcnQvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9hdmFpbGFibGUtdHlwZWQtYXJyYXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbGwtYmluZC9jYWxsQm91bmQuanMiLCJub2RlX21vZHVsZXMvY2FsbC1iaW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbnNvbGUtYnJvd3NlcmlmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWZpbmUtZGF0YS1wcm9wZXJ0eS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ZyaWRhLXByb2Nlc3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZnVuY3Rpb24tYmluZC9pbXBsZW1lbnRhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9mdW5jdGlvbi1iaW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dldC1pbnRyaW5zaWMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ29wZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYXMtcHJvcGVydHktZGVzY3JpcHRvcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaGFzLXByb3RvL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhcy1zeW1ib2xzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhcy1zeW1ib2xzL3NoYW1zLmpzIiwibm9kZV9tb2R1bGVzL2hhcy10b3N0cmluZ3RhZy9zaGFtcy5qcyIsIm5vZGVfbW9kdWxlcy9oYXNvd24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9pcy1hcmd1bWVudHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtY2FsbGFibGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtZ2VuZXJhdG9yLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLXR5cGVkLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2ltcGxlbWVudGF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2lzQXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC5hc3NpZ24vaW1wbGVtZW50YXRpb24uanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LmFzc2lnbi9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2V0LWZ1bmN0aW9uLWxlbmd0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90aW1lcnMtYnJvd3NlcmlmeS9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC90eXBlcy5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJub2RlX21vZHVsZXMvd2hpY2gt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QUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDWCxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUM7UUFDYixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUM7UUFDYixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7S0FDZixDQUFDLENBQUE7SUFFTSxNQUFNLEdBQVcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUV0RCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUE7SUFDckQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUN0QixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FB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LENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNuQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNuQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNuQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNuQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNuQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNuQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQVFwQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUV2QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO0lBRzlCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBRXZCLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUE7SUFDbEMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQTtJQUNoQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFBO0lBQ2pDLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUE7SUFDakMsTUFBTSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQTtJQUlwQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUV2QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUN4QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtJQUM1QixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7SUFDOUIsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQTtJQUM5QixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7SUFDOUIsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDM0IsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7SUFDdEIsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDM0IsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDM0IsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDM0IsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDM0IsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDM0IsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDM0IsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7SUFDekIsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUF5QjNCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdB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QUFRLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDM0QsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMzc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIn0=
