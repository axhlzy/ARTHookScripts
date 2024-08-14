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
const arrayCurrentClassItems = [];
var loaders = [];
function getJavaMembersFromClass(className = "com.unity3d.player.UnityPlayer") {
    const ar_methods = [];
    const ar_fields = [];
    const ar_fields_name = [];
    if (loaders.length == 0) {
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                loaders.push(loader);
            },
            onComplete: function () {
            }
        });
    }
    const testUseOtherClassLoader = (className) => {
        let retCls = null;
        loaders.forEach((loader) => {
            try {
                let clz = loader.findClass(className);
                if (clz != null)
                    retCls = cls;
            }
            catch (error) {
            }
        });
        return retCls;
    };
    Java.perform(() => {
        let clazz;
        try {
            clazz = Java.use(className);
        }
        catch {
            clazz = testUseOtherClassLoader(className);
        }
        try {
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
        }
        catch (error) {
        }
    });
    return { "methods": ar_methods, "fields": ar_fields, "fields_name": ar_fields_name };
}
exports.getJavaMembersFromClass = getJavaMembersFromClass;
globalThis.filterJavaMethods = (methodNameFilter, className) => {
    if (methodNameFilter == undefined || methodNameFilter == "")
        throw new Error("methodNameFilter can't be empty");
    className = checkNumParam(className);
    let index = 0;
    if (className == undefined) {
        try {
            enumClassesList(true).forEach((className) => printMethod(className));
        }
        catch (error) {
        }
    }
    else {
        printMethod(className);
    }
    function printMethod(className) {
        const members = getJavaMembersFromClass(className);
        try {
            members.methods.forEach((method) => {
                if (method.methodName.includes(methodNameFilter)) {
                    const artMethod = new ArtMethod_1.ArtMethod(method.handle);
                    LOGD(`\n\t[${++index}] ${artMethod.methodName}`);
                }
            });
        }
        catch (e) {
            LOGE(e);
        }
    }
};
const checkNumParam = (className) => {
    if (typeof className === "number") {
        if (className >= arrayCurrentClassItems.length)
            throw new Error(`index out of range, current length is ${arrayCurrentClassItems.length}`);
        return arrayCurrentClassItems[className];
    }
    return className;
};
globalThis.listJavaMethods = (className = "com.unity3d.player.UnityPlayer", simple = false, showSmali = false) => {
    let countFields = 0;
    let countMethods = 0;
    className = checkNumParam(className);
    const members = getJavaMembersFromClass(className);
    LOGD(`\n\n${className}`);
    try {
        LOGD(`\n[*] Fields :`);
        members.fields.map((field, index) => {
            let flag = "";
            let currentIndex = ++countFields;
            try {
                return `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field.value)} | ${field.fieldReturnType}`;
            }
            catch (error) {
                return `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field)}`;
            }
        }).forEach(LOGD);
        newLine();
    }
    catch (e) {
        LOGE(e);
    }
    try {
        LOGD(`\n[*] Methods :`);
        members.methods.forEach((method) => {
            const artMethod = new ArtMethod_1.ArtMethod(method.handle);
            if (simple) {
                LOGD(`\n\t[${++countMethods}] ${artMethod.methodName}`);
            }
            else {
                const disp = artMethod.toString().split('\n').map((item, index) => index == 0 ? item : `\n\t${item}`).join('');
                LOGD(`\n\t[${++countMethods}] ${disp}`);
            }
            if (showSmali)
                artMethod.showSmali();
        });
        newLine();
    }
    catch (e) {
        LOGE(e);
    }
};
globalThis.enumClassesList = (ret = false) => {
    let countClasses = -1;
    let retArray = [];
    if (!ret)
        newLine();
    arrayCurrentClassItems.splice(0, arrayCurrentClassItems.length);
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            arrayCurrentClassItems.push(className);
            retArray.push(className);
            if (!ret)
                LOGD(`[${++countClasses}] ${className}`);
        },
        onComplete: function () {
        }
    });
    if (ret)
        return retArray;
    LOGZ(`\nTotal classes: ${countClasses + 1}\n`);
};
globalThis.findJavaClasses = (keyword, depSearch = false, searchInstance = true) => {
    let countClasses = -1;
    newLine();
    arrayCurrentClassItems.splice(0, arrayCurrentClassItems.length);
    if (depSearch) {
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                enumClassesInner(loader);
            },
            onComplete: function () {
            }
        });
    }
    else {
        enumClassesInner(Java.classFactory.loader);
    }
    function enumClassesInner(loader) {
        Java.classFactory.loader = loader;
        LOGW(`Using loader: ${Java.classFactory.loader}`);
        Java.enumerateLoadedClasses({
            onMatch: function (className) {
                if (className.includes(keyword)) {
                    arrayCurrentClassItems.push(className);
                    LOGD(`[${++countClasses}] ${className}`);
                    if (searchInstance) {
                        const instances = chooseClasses(countClasses, true);
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
globalThis.chooseClasses = (className, retArray = false) => {
    let classNameLocal = checkNumParam(className);
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
},{"../android/implements/10/art/mirror/ArtMethod":83}],3:[function(require,module,exports){
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
exports.hookJavaLoadLibrary = void 0;
const hookJavaLoadLibrary = () => {
    Java.perform(() => {
        const SystemClass = Java.use('java.lang.System');
        SystemClass.loadLibrary.implementation = function (library) {
            console.log('Loading library:' + library);
            const result = this.loadLibrary(library);
            return result;
        };
    });
};
exports.hookJavaLoadLibrary = hookJavaLoadLibrary;
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./hook_LoadLibrary");
},{"./hook_LoadLibrary":4}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JavaUtil");
require("./Context");
require("./Theads");
require("./hooks/include");
},{"./Context":1,"./JavaUtil":2,"./Theads":3,"./hooks/include":5}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./mirror/include");
require("./SizeOfClass");
},{"./SizeOfClass":7,"./mirror/include":11}],9:[function(require,module,exports){
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
},{"../../../JSHandle":13}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./HeapReference");
require("./IArtMethod");
},{"./HeapReference":9,"./IArtMethod":10}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":8}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{"../tools/StdString":100,"./Interface/art/mirror/HeapReference":9,"./JSHandle":13,"./Utils/SymHelper":18}],15:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceManager = void 0;
const ExecuteSwitchImplCpp_1 = require("./functions/ExecuteSwitchImplCpp");
const DefineClass_1 = require("./functions/DefineClass");
const OpenCommon_1 = require("./functions/OpenCommon");
const LinkerManager_1 = require("./functions/LinkerManager");
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
        LinkerManager_1.linkerManager.Hook_CallConstructors();
    }
    static Trace_ExecuteSwitchImplCpp() {
        ExecuteSwitchImplCpp_1.ExecuteSwitchImplCppManager.enableHook();
    }
    static TraceArtMethodInvoke() {
        HookArtMethodInvoke();
    }
    static TraceException() {
        logSoLoad();
        Process.setExceptionHandler((exception) => {
            LOGE(`TYPE:${exception.type} | NCONTEXT: ${exception.nativeContext} | ADDRESS: ${exception.address} { ${DebugSymbol.fromAddress(exception.address)} }`);
            PrintStackTraceNative(exception.context, '', false, true);
        });
    }
}
exports.TraceManager = TraceManager;
setImmediate(() => {
    Process.setExceptionHandler((exception) => {
        LOGE(`\nCatch Exception:\nTYPE:${exception.type} | NCONTEXT: ${exception.nativeContext} | ADDRESS: ${exception.address} { ${DebugSymbol.fromAddress(exception.address)} }`);
        PrintStackTraceNative(exception.context, '', false, true);
        return true;
    });
});
}).call(this)}).call(this,require("timers").setImmediate)

},{"./functions/DefineClass":25,"./functions/ExecuteSwitchImplCpp":27,"./functions/LinkerManager":28,"./functions/OpenCommon":29,"timers":144}],16:[function(require,module,exports){
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
},{"../implements/10/art/mirror/ArtMethod":83}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demangleName = exports.getSym = exports.callSym = void 0;
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
globalThis.demangleName = demangleName;
},{"../../tools/functions":105,"../JSHandle":13,"../functions/SymbolManager":30}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintStackTraceNative = exports.hookThread = void 0;
const libcfuncs_1 = require("./libcfuncs");
const hookThread = () => {
    LOGW(`MAIN Thread ID : ${Process.id}`);
    const addr_pthread_create = Module.findExportByName("libc.so", "pthread_create");
    const func_pthread_create = new NativeFunction(addr_pthread_create, "int", ["pointer", "pointer", "pointer", "pointer"]);
    Interceptor.attach(addr_pthread_create, {
        onEnter: function (args) {
            const __pthread_ptr = args[0];
            this.__pthread_ptr = __pthread_ptr;
            const __attr = new libcfuncs_1.pthread_attr_t(args[1]);
            this.__attr = __attr;
            const __start_routine = new NativeFunction(args[2], "pointer", ["pointer"]);
            this.__start_routine = __start_routine;
            const __debugInfo = __start_routine.isNull() ? 'NULL' : DebugSymbol.fromAddress(__start_routine);
            this.__debugInfo = __debugInfo;
            const __data = args[3];
            this.__data = __data;
        }, onLeave: function () {
            try {
                const pid = libcfuncs_1.libC.getpid();
                let pid_des = `${pid}`;
                try {
                    pid_des += ` [ ${getThreadName(pid)} ] `;
                }
                catch { }
                const pid_target = this.__pthread_ptr.readPointer().add(0x10).readU32();
                let pid_target_des = `${pid_target}`;
                try {
                    pid_target_des += ` [ ${getThreadName(pid_target)} ] `;
                }
                catch { }
                LOGW(`\ntid : ${pid_des} -> ${pid_target_des}`);
                LOGD(`pthread_create:\n\t__pthread_ptr=${this.__pthread_ptr}\n\t__attr=${this.__attr}\n\t__start_routine=${this.__debugInfo} @ ${this.__start_routine}\n\t__data=${this.__data}`);
                (0, exports.PrintStackTraceNative)(this.context, '\t');
            }
            catch (e) {
            }
        }
    });
    return;
    const addr_pthread_setname_np = Module.findExportByName("libc.so", "pthread_setname_np");
    const func_pthread_setname_np = new NativeFunction(addr_pthread_setname_np, "int", ["pointer", "pointer"]);
    Interceptor.attach(addr_pthread_setname_np, {
        onEnter: function (args) {
            const __pthread = args[0];
            const __name = args[1].readCString();
            LOGD(`pthread_setname_np: __pthread=${__pthread}, __name=${__name}`);
        }
    });
    const addr_pthread_exit = Module.findExportByName("libc.so", "pthread_exit");
    const func_pthread_exit = new NativeFunction(addr_pthread_exit, "void", ["pointer"]);
    Interceptor.attach(addr_pthread_exit, {
        onEnter: function (args) {
            const __return_value = args[0];
            LOGD(`pthread_exit: ${libcfuncs_1.libC.gettid()} { ${getThreadName()} } | __return_value=${__return_value}`);
        }
    });
    const addr_fork = Module.findExportByName("libc.so", "fork");
    const func_fork = new NativeFunction(addr_fork, "int", []);
    Interceptor.attach(addr_fork, {
        onEnter: function (args) {
            LOGE(`fork: ${libcfuncs_1.libC.gettid()} { ${getThreadName()} }`);
            (0, exports.PrintStackTraceNative)(this.context);
        }
    });
    const addr_vfork = Module.findExportByName("libc.so", "vfork");
    const func_vfork = new NativeFunction(addr_vfork, "int", []);
    Interceptor.attach(addr_vfork, {
        onEnter: function (args) {
            LOGE(`vfork: ${libcfuncs_1.libC.gettid()} { ${getThreadName()} }`);
            (0, exports.PrintStackTraceNative)(this.context);
        }
    });
    const addr_pause = Module.findExportByName("libc.so", 'pause');
    const func_pause = new NativeFunction(addr_pause, 'int', []);
    Interceptor.attach(addr_pause, {
        onEnter: function (args) {
            LOGD(`pause: ${libcfuncs_1.libC.gettid()} { ${getThreadName()} }`);
        }
    });
    const addr_pthread_kill = Module.findExportByName("libc.so", 'pthread_kill');
    const func_pthread_kill = new NativeFunction(addr_pthread_kill, 'int', ['pointer', 'int']);
    Interceptor.attach(addr_pthread_kill, {
        onEnter: function (args) {
            const __pthread = args[0];
            const __signal = args[1];
            LOGD(`pthread_kill: __pthread=${__pthread}, __signal=${__signal} | ${libcfuncs_1.libC.gettid()} { ${getThreadName()} }`);
        }
    });
    const addr_kill = Module.findExportByName("libc.so", 'kill');
    const func_kill = new NativeFunction(addr_kill, 'int', ['pointer', 'int']);
    Interceptor.attach(func_kill, {
        onEnter: function (args) {
            const __pthread = args[0];
            const __signal = args[1];
            LOGD(`func_kill: __pid=${__pthread}, __signal=${__signal} | ${libcfuncs_1.libC.gettid()} { ${getThreadName()} }`);
        }
    });
    const addr_pthread_detach = Module.findExportByName("libc.so", 'pthread_detach');
    const func_pthread_detach = new NativeFunction(addr_pthread_detach, 'int', ['pointer']);
    Interceptor.attach(addr_pthread_detach, {
        onEnter: function (args) {
            const __pthread = args[0];
            LOGD(`pthread_detach: __pthread=${__pthread} | ${libcfuncs_1.libC.gettid()} { ${getThreadName()} }`);
        }
    });
    const addr_pthread_join = Module.findExportByName("libc.so", 'pthread_join');
    const func_pthread_join = new NativeFunction(addr_pthread_join, 'int', ['pointer', 'pointer']);
    Interceptor.attach(addr_pthread_join, {
        onEnter: function (args) {
            const __pthread = args[0];
            const __value_ptr = args[1];
            LOGD(`pthread_join: __pthread=${__pthread}, __value_ptr=${__value_ptr} | ${libcfuncs_1.libC.gettid()} { ${getThreadName()} }`);
        }
    });
};
exports.hookThread = hookThread;
function getThreadName(tid = libcfuncs_1.libC.gettid()) {
    let threadName = "unknown";
    try {
        const file = new File("/proc/self/task/" + tid + "/comm", "r");
        threadName = file.readLine().toString().trimEnd();
        file.close();
    }
    catch (e) {
        throw e;
    }
    return threadName;
}
const PrintStackTraceNative = (ctx, pandingStart = '', fuzzy = false, demangle = false, retText = false, slice = 6) => {
    const stacks = Thread.backtrace(ctx, fuzzy ? Backtracer.FUZZY : Backtracer.ACCURATE);
    const tmpText = stacks
        .slice(0, slice)
        .map(DebugSymbol.fromAddress)
        .map((sym, index) => `${pandingStart}[ ${index} ] ${sym}`)
        .map((str) => {
        if (demangle && str.includes('!') && str.includes('+')) {
            const sym_src = str.slice(str.indexOf('!') + 1, str.indexOf('+'));
            let sym = demangleName(sym_src);
            sym == '' ? sym_src : sym;
            return str.slice(0, str.indexOf('!') + 1) + sym + str.slice(str.indexOf('+') - 2);
        }
        return str;
    })
        .join("\n");
    return !retText ? LOGZ(tmpText) : tmpText;
};
exports.PrintStackTraceNative = PrintStackTraceNative;
globalThis.hookThread = exports.hookThread;
globalThis.getThreadName = getThreadName;
globalThis.PrintStackTraceNative = exports.PrintStackTraceNative;
},{"./libcfuncs":21}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtMethodHelper");
require("./SymHelper");
require("./JavaHooker");
require("./libcfuncs");
require("./ThreadHooker");
require("./syscalls");
},{"./ArtMethodHelper":16,"./JavaHooker":17,"./SymHelper":18,"./ThreadHooker":19,"./libcfuncs":21,"./syscalls":22}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.libC = exports.pthread_attr_t = void 0;
const Globals_1 = require("../implements/10/art/Globals");
const Theads_1 = require("../../Java/Theads");
const syscalls_1 = require("./syscalls");
class pthread_attr_t {
    mPtr;
    flags;
    stack_base;
    stack_size;
    guard_size;
    sched_policy;
    sched_priority;
    flags_a;
    stack_base_a;
    stack_size_a;
    guard_size_a;
    sched_policy_a;
    sched_priority_a;
    constructor(ptr) {
        if (ptr.isNull()) {
            this.mPtr = NULL;
            this.flags = 0;
            this.stack_base = NULL;
            this.stack_size = 0;
            this.guard_size = 0;
            this.sched_policy = 0;
            this.sched_priority = 0;
        }
        else {
            this.mPtr = ptr;
            this.flags_a = ptr;
            this.stack_base_a = this.flags_a.add(0x4);
            this.stack_size_a = this.stack_base_a.add(Globals_1.PointerSize);
            this.guard_size_a = this.stack_size_a.add(Globals_1.PointerSize);
            this.sched_policy_a = this.guard_size_a.add(Globals_1.PointerSize);
            this.sched_priority_a = this.sched_policy_a.add(0x4);
            this.flags = this.flags_a.readU32();
            this.stack_base = this.stack_base_a.readPointer();
            this.stack_size = this.stack_size_a.readU32();
            this.guard_size = this.guard_size_a.readU32();
            this.sched_policy = this.sched_policy_a.readS32();
            this.sched_priority = this.sched_priority_a.readS32();
        }
    }
    toStringComplex() {
        return `pthread_attr_t { flags=${this.flags}, stack_base=${this.stack_base}, stack_size=${this.stack_size}, guard_size=${this.guard_size}, sched_policy=${this.sched_policy}, sched_priority=${this.sched_priority} }`;
    }
    toString() {
        if (this.mPtr.isNull())
            return "{ NULL }";
        return `{ f=${this.flags}, sb=${this.stack_base}, ss=${this.stack_size}, gs=${this.guard_size}, s_policy=${this.sched_policy}, s_priority=${this.sched_priority} }`;
    }
}
exports.pthread_attr_t = pthread_attr_t;
class libC {
    static malloc(size) {
        return Memory.alloc(size);
    }
    static sleep(s) {
        const sleep_f = new NativeFunction(Module.findExportByName("libc.so", 'sleep'), 'int', ['int']);
        return sleep_f(s);
    }
    static usleep(ms) {
        const usleep_f = new NativeFunction(Module.findExportByName("libc.so", 'usleep'), 'int', ['int']);
        return usleep_f(ms);
    }
    static pause() {
        const pause_f = new NativeFunction(Module.findExportByName("libc.so", 'pause'), 'int', []);
        return pause_f();
    }
    static syscall(__number, ...value) {
        const syscall_f = new NativeFunction(Module.findExportByName("libc.so", 'syscall'), 'int', ['int', ...'pointer']);
        LOGD(`called syscall ( ${syscalls_1.SYSCALL[__number]}, ${value} )`);
        return syscall_f(__number, value);
    }
    static brk(addr) {
        const brk_f = new NativeFunction(Module.findExportByName("libc.so", 'brk'), 'int', ['pointer']);
        return brk_f(addr);
    }
    static raise = (sign = Theads_1.SIGNAL.SIGSTOP) => {
        const raise = new NativeFunction(Module.findExportByName("libc.so", 'raise'), 'int', ['int']);
        return raise(sign);
    };
    static kill(pid, sign = Theads_1.SIGNAL.SIGSTOP) {
        const kill = new NativeFunction(Module.findExportByName("libc.so", 'kill'), 'int', ['int', 'int']);
        return kill(pid, sign);
    }
    static pthread_kill(pid, sign = Theads_1.SIGNAL.SIGSTOP) {
        const pthread_kill = new NativeFunction(Module.findExportByName("libc.so", 'pthread_kill'), 'int', ['int', 'int']);
        return pthread_kill(pid, sign);
    }
    static exit(status) {
        const exit = new NativeFunction(Module.findExportByName("libc.so", 'exit'), 'void', ['int']);
        exit(status);
    }
    static fork() {
        const fork = new NativeFunction(Module.findExportByName("libc.so", 'fork'), 'int', []);
        return fork();
    }
    static gettid() {
        const gettid = new NativeFunction(Module.findExportByName("libc.so", 'gettid'), 'int', []);
        return gettid();
    }
    static getpid() {
        const getpid = new NativeFunction(Module.findExportByName("libc.so", 'getpid'), 'int', []);
        return getpid();
    }
    static getppid() {
        const getppid = new NativeFunction(Module.findExportByName("libc.so", 'getppid'), 'int', []);
        return getppid();
    }
    static getuid() {
        const getuid = new NativeFunction(Module.findExportByName("libc.so", 'getuid'), 'int', []);
        return getuid();
    }
    static getgid() {
        const getgid = new NativeFunction(Module.findExportByName("libc.so", 'getgid'), 'int', []);
        return getgid();
    }
    static calloc(num, size) {
        const calloc = new NativeFunction(Module.findExportByName("libc.so", 'calloc'), 'pointer', ['int', 'int']);
        return calloc(num, size);
    }
    static free(ptr) {
        const free = new NativeFunction(Module.findExportByName("libc.so", 'free'), 'void', ['pointer']);
        free(ptr);
    }
    static getenv(name) {
        const getenv = new NativeFunction(Module.findExportByName("libc.so", 'getenv'), 'pointer', ['pointer']);
        try {
            return ptr(getenv(Memory.allocUtf8String(name))).readUtf8String();
        }
        catch (error) {
            return null;
        }
    }
    static getprogname() {
        const getprogname = new NativeFunction(Module.findExportByName("libc.so", 'getprogname'), 'pointer', []);
        try {
            return ptr(getprogname()).readUtf8String();
        }
        catch (error) {
            return null;
        }
    }
}
exports.libC = libC;
},{"../../Java/Theads":3,"../implements/10/art/Globals":35,"./syscalls":22}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSCALL = void 0;
var SYSCALL;
(function (SYSCALL) {
    SYSCALL[SYSCALL["__NR_io_setup"] = 0] = "__NR_io_setup";
    SYSCALL[SYSCALL["__NR_io_destroy"] = 1] = "__NR_io_destroy";
    SYSCALL[SYSCALL["__NR_io_submit"] = 2] = "__NR_io_submit";
    SYSCALL[SYSCALL["__NR_io_cancel"] = 3] = "__NR_io_cancel";
    SYSCALL[SYSCALL["__NR_io_getevents"] = 4] = "__NR_io_getevents";
    SYSCALL[SYSCALL["__NR_setxattr"] = 5] = "__NR_setxattr";
    SYSCALL[SYSCALL["__NR_lsetxattr"] = 6] = "__NR_lsetxattr";
    SYSCALL[SYSCALL["__NR_fsetxattr"] = 7] = "__NR_fsetxattr";
    SYSCALL[SYSCALL["__NR_getxattr"] = 8] = "__NR_getxattr";
    SYSCALL[SYSCALL["__NR_lgetxattr"] = 9] = "__NR_lgetxattr";
    SYSCALL[SYSCALL["__NR_fgetxattr"] = 10] = "__NR_fgetxattr";
    SYSCALL[SYSCALL["__NR_listxattr"] = 11] = "__NR_listxattr";
    SYSCALL[SYSCALL["__NR_llistxattr"] = 12] = "__NR_llistxattr";
    SYSCALL[SYSCALL["__NR_flistxattr"] = 13] = "__NR_flistxattr";
    SYSCALL[SYSCALL["__NR_removexattr"] = 14] = "__NR_removexattr";
    SYSCALL[SYSCALL["__NR_lremovexattr"] = 15] = "__NR_lremovexattr";
    SYSCALL[SYSCALL["__NR_fremovexattr"] = 16] = "__NR_fremovexattr";
    SYSCALL[SYSCALL["__NR_getcwd"] = 17] = "__NR_getcwd";
    SYSCALL[SYSCALL["__NR_lookup_dcookie"] = 18] = "__NR_lookup_dcookie";
    SYSCALL[SYSCALL["__NR_eventfd2"] = 19] = "__NR_eventfd2";
    SYSCALL[SYSCALL["__NR_epoll_create1"] = 20] = "__NR_epoll_create1";
    SYSCALL[SYSCALL["__NR_epoll_ctl"] = 21] = "__NR_epoll_ctl";
    SYSCALL[SYSCALL["__NR_epoll_pwait"] = 22] = "__NR_epoll_pwait";
    SYSCALL[SYSCALL["__NR_dup"] = 23] = "__NR_dup";
    SYSCALL[SYSCALL["__NR_dup3"] = 24] = "__NR_dup3";
    SYSCALL[SYSCALL["__NR3264_fcntl"] = 25] = "__NR3264_fcntl";
    SYSCALL[SYSCALL["__NR_inotify_init1"] = 26] = "__NR_inotify_init1";
    SYSCALL[SYSCALL["__NR_inotify_add_watch"] = 27] = "__NR_inotify_add_watch";
    SYSCALL[SYSCALL["__NR_inotify_rm_watch"] = 28] = "__NR_inotify_rm_watch";
    SYSCALL[SYSCALL["__NR_ioctl"] = 29] = "__NR_ioctl";
    SYSCALL[SYSCALL["__NR_ioprio_set"] = 30] = "__NR_ioprio_set";
    SYSCALL[SYSCALL["__NR_ioprio_get"] = 31] = "__NR_ioprio_get";
    SYSCALL[SYSCALL["__NR_flock"] = 32] = "__NR_flock";
    SYSCALL[SYSCALL["__NR_mknodat"] = 33] = "__NR_mknodat";
    SYSCALL[SYSCALL["__NR_mkdirat"] = 34] = "__NR_mkdirat";
    SYSCALL[SYSCALL["__NR_unlinkat"] = 35] = "__NR_unlinkat";
    SYSCALL[SYSCALL["__NR_symlinkat"] = 36] = "__NR_symlinkat";
    SYSCALL[SYSCALL["__NR_linkat"] = 37] = "__NR_linkat";
    SYSCALL[SYSCALL["__NR_renameat"] = 38] = "__NR_renameat";
    SYSCALL[SYSCALL["__NR_umount2"] = 39] = "__NR_umount2";
    SYSCALL[SYSCALL["__NR_mount"] = 40] = "__NR_mount";
    SYSCALL[SYSCALL["__NR_pivot_root"] = 41] = "__NR_pivot_root";
    SYSCALL[SYSCALL["__NR_nfsservctl"] = 42] = "__NR_nfsservctl";
    SYSCALL[SYSCALL["__NR3264_statfs"] = 43] = "__NR3264_statfs";
    SYSCALL[SYSCALL["__NR3264_fstatfs"] = 44] = "__NR3264_fstatfs";
    SYSCALL[SYSCALL["__NR3264_truncate"] = 45] = "__NR3264_truncate";
    SYSCALL[SYSCALL["__NR3264_ftruncate"] = 46] = "__NR3264_ftruncate";
    SYSCALL[SYSCALL["__NR_fallocate"] = 47] = "__NR_fallocate";
    SYSCALL[SYSCALL["__NR_faccessat"] = 48] = "__NR_faccessat";
    SYSCALL[SYSCALL["__NR_chdir"] = 49] = "__NR_chdir";
    SYSCALL[SYSCALL["__NR_fchdir"] = 50] = "__NR_fchdir";
    SYSCALL[SYSCALL["__NR_chroot"] = 51] = "__NR_chroot";
    SYSCALL[SYSCALL["__NR_fchmod"] = 52] = "__NR_fchmod";
    SYSCALL[SYSCALL["__NR_fchmodat"] = 53] = "__NR_fchmodat";
    SYSCALL[SYSCALL["__NR_fchownat"] = 54] = "__NR_fchownat";
    SYSCALL[SYSCALL["__NR_fchown"] = 55] = "__NR_fchown";
    SYSCALL[SYSCALL["__NR_openat"] = 56] = "__NR_openat";
    SYSCALL[SYSCALL["__NR_close"] = 57] = "__NR_close";
    SYSCALL[SYSCALL["__NR_vhangup"] = 58] = "__NR_vhangup";
    SYSCALL[SYSCALL["__NR_pipe2"] = 59] = "__NR_pipe2";
    SYSCALL[SYSCALL["__NR_quotactl"] = 60] = "__NR_quotactl";
    SYSCALL[SYSCALL["__NR_getdents64"] = 61] = "__NR_getdents64";
    SYSCALL[SYSCALL["__NR3264_lseek"] = 62] = "__NR3264_lseek";
    SYSCALL[SYSCALL["__NR_read"] = 63] = "__NR_read";
    SYSCALL[SYSCALL["__NR_write"] = 64] = "__NR_write";
    SYSCALL[SYSCALL["__NR_readv"] = 65] = "__NR_readv";
    SYSCALL[SYSCALL["__NR_writev"] = 66] = "__NR_writev";
    SYSCALL[SYSCALL["__NR_pread64"] = 67] = "__NR_pread64";
    SYSCALL[SYSCALL["__NR_pwrite64"] = 68] = "__NR_pwrite64";
    SYSCALL[SYSCALL["__NR_preadv"] = 69] = "__NR_preadv";
    SYSCALL[SYSCALL["__NR_pwritev"] = 70] = "__NR_pwritev";
    SYSCALL[SYSCALL["__NR3264_sendfile"] = 71] = "__NR3264_sendfile";
    SYSCALL[SYSCALL["__NR_pselect6"] = 72] = "__NR_pselect6";
    SYSCALL[SYSCALL["__NR_ppoll"] = 73] = "__NR_ppoll";
    SYSCALL[SYSCALL["__NR_signalfd4"] = 74] = "__NR_signalfd4";
    SYSCALL[SYSCALL["__NR_vmsplice"] = 75] = "__NR_vmsplice";
    SYSCALL[SYSCALL["__NR_splice"] = 76] = "__NR_splice";
    SYSCALL[SYSCALL["__NR_tee"] = 77] = "__NR_tee";
    SYSCALL[SYSCALL["__NR_readlinkat"] = 78] = "__NR_readlinkat";
    SYSCALL[SYSCALL["__NR3264_fstatat"] = 79] = "__NR3264_fstatat";
    SYSCALL[SYSCALL["__NR3264_fstat"] = 80] = "__NR3264_fstat";
    SYSCALL[SYSCALL["__NR_sync"] = 81] = "__NR_sync";
    SYSCALL[SYSCALL["__NR_fsync"] = 82] = "__NR_fsync";
    SYSCALL[SYSCALL["__NR_fdatasync"] = 83] = "__NR_fdatasync";
    SYSCALL[SYSCALL["__NR_sync_file_range2"] = 84] = "__NR_sync_file_range2";
    SYSCALL[SYSCALL["__NR_sync_file_range"] = 84] = "__NR_sync_file_range";
    SYSCALL[SYSCALL["__NR_timerfd_create"] = 85] = "__NR_timerfd_create";
    SYSCALL[SYSCALL["__NR_timerfd_settime"] = 86] = "__NR_timerfd_settime";
    SYSCALL[SYSCALL["__NR_timerfd_gettime"] = 87] = "__NR_timerfd_gettime";
    SYSCALL[SYSCALL["__NR_utimensat"] = 88] = "__NR_utimensat";
    SYSCALL[SYSCALL["__NR_acct"] = 89] = "__NR_acct";
    SYSCALL[SYSCALL["__NR_capget"] = 90] = "__NR_capget";
    SYSCALL[SYSCALL["__NR_capset"] = 91] = "__NR_capset";
    SYSCALL[SYSCALL["__NR_personality"] = 92] = "__NR_personality";
    SYSCALL[SYSCALL["__NR_exit"] = 93] = "__NR_exit";
    SYSCALL[SYSCALL["__NR_exit_group"] = 94] = "__NR_exit_group";
    SYSCALL[SYSCALL["__NR_waitid"] = 95] = "__NR_waitid";
    SYSCALL[SYSCALL["__NR_set_tid_address"] = 96] = "__NR_set_tid_address";
    SYSCALL[SYSCALL["__NR_unshare"] = 97] = "__NR_unshare";
    SYSCALL[SYSCALL["__NR_futex"] = 98] = "__NR_futex";
    SYSCALL[SYSCALL["__NR_set_robust_list"] = 99] = "__NR_set_robust_list";
    SYSCALL[SYSCALL["__NR_get_robust_list"] = 100] = "__NR_get_robust_list";
    SYSCALL[SYSCALL["__NR_nanosleep"] = 101] = "__NR_nanosleep";
    SYSCALL[SYSCALL["__NR_getitimer"] = 102] = "__NR_getitimer";
    SYSCALL[SYSCALL["__NR_setitimer"] = 103] = "__NR_setitimer";
    SYSCALL[SYSCALL["__NR_kexec_load"] = 104] = "__NR_kexec_load";
    SYSCALL[SYSCALL["__NR_init_module"] = 105] = "__NR_init_module";
    SYSCALL[SYSCALL["__NR_delete_module"] = 106] = "__NR_delete_module";
    SYSCALL[SYSCALL["__NR_timer_create"] = 107] = "__NR_timer_create";
    SYSCALL[SYSCALL["__NR_timer_gettime"] = 108] = "__NR_timer_gettime";
    SYSCALL[SYSCALL["__NR_timer_getoverrun"] = 109] = "__NR_timer_getoverrun";
    SYSCALL[SYSCALL["__NR_timer_settime"] = 110] = "__NR_timer_settime";
    SYSCALL[SYSCALL["__NR_timer_delete"] = 111] = "__NR_timer_delete";
    SYSCALL[SYSCALL["__NR_clock_settime"] = 112] = "__NR_clock_settime";
    SYSCALL[SYSCALL["__NR_clock_gettime"] = 113] = "__NR_clock_gettime";
    SYSCALL[SYSCALL["__NR_clock_getres"] = 114] = "__NR_clock_getres";
    SYSCALL[SYSCALL["__NR_clock_nanosleep"] = 115] = "__NR_clock_nanosleep";
    SYSCALL[SYSCALL["__NR_syslog"] = 116] = "__NR_syslog";
    SYSCALL[SYSCALL["__NR_ptrace"] = 117] = "__NR_ptrace";
    SYSCALL[SYSCALL["__NR_sched_setparam"] = 118] = "__NR_sched_setparam";
    SYSCALL[SYSCALL["__NR_sched_setscheduler"] = 119] = "__NR_sched_setscheduler";
    SYSCALL[SYSCALL["__NR_sched_getscheduler"] = 120] = "__NR_sched_getscheduler";
    SYSCALL[SYSCALL["__NR_sched_getparam"] = 121] = "__NR_sched_getparam";
    SYSCALL[SYSCALL["__NR_sched_setaffinity"] = 122] = "__NR_sched_setaffinity";
    SYSCALL[SYSCALL["__NR_sched_getaffinity"] = 123] = "__NR_sched_getaffinity";
    SYSCALL[SYSCALL["__NR_sched_yield"] = 124] = "__NR_sched_yield";
    SYSCALL[SYSCALL["__NR_sched_get_priority_max"] = 125] = "__NR_sched_get_priority_max";
    SYSCALL[SYSCALL["__NR_sched_get_priority_min"] = 126] = "__NR_sched_get_priority_min";
    SYSCALL[SYSCALL["__NR_sched_rr_get_interval"] = 127] = "__NR_sched_rr_get_interval";
    SYSCALL[SYSCALL["__NR_restart_syscall"] = 128] = "__NR_restart_syscall";
    SYSCALL[SYSCALL["__NR_kill"] = 129] = "__NR_kill";
    SYSCALL[SYSCALL["__NR_tkill"] = 130] = "__NR_tkill";
    SYSCALL[SYSCALL["__NR_tgkill"] = 131] = "__NR_tgkill";
    SYSCALL[SYSCALL["__NR_sigaltstack"] = 132] = "__NR_sigaltstack";
    SYSCALL[SYSCALL["__NR_rt_sigsuspend"] = 133] = "__NR_rt_sigsuspend";
    SYSCALL[SYSCALL["__NR_rt_sigaction"] = 134] = "__NR_rt_sigaction";
    SYSCALL[SYSCALL["__NR_rt_sigprocmask"] = 135] = "__NR_rt_sigprocmask";
    SYSCALL[SYSCALL["__NR_rt_sigpending"] = 136] = "__NR_rt_sigpending";
    SYSCALL[SYSCALL["__NR_rt_sigtimedwait"] = 137] = "__NR_rt_sigtimedwait";
    SYSCALL[SYSCALL["__NR_rt_sigqueueinfo"] = 138] = "__NR_rt_sigqueueinfo";
    SYSCALL[SYSCALL["__NR_rt_sigreturn"] = 139] = "__NR_rt_sigreturn";
    SYSCALL[SYSCALL["__NR_setpriority"] = 140] = "__NR_setpriority";
    SYSCALL[SYSCALL["__NR_getpriority"] = 141] = "__NR_getpriority";
    SYSCALL[SYSCALL["__NR_reboot"] = 142] = "__NR_reboot";
    SYSCALL[SYSCALL["__NR_setregid"] = 143] = "__NR_setregid";
    SYSCALL[SYSCALL["__NR_setgid"] = 144] = "__NR_setgid";
    SYSCALL[SYSCALL["__NR_setreuid"] = 145] = "__NR_setreuid";
    SYSCALL[SYSCALL["__NR_setuid"] = 146] = "__NR_setuid";
    SYSCALL[SYSCALL["__NR_setresuid"] = 147] = "__NR_setresuid";
    SYSCALL[SYSCALL["__NR_getresuid"] = 148] = "__NR_getresuid";
    SYSCALL[SYSCALL["__NR_setresgid"] = 149] = "__NR_setresgid";
    SYSCALL[SYSCALL["__NR_getresgid"] = 150] = "__NR_getresgid";
    SYSCALL[SYSCALL["__NR_setfsuid"] = 151] = "__NR_setfsuid";
    SYSCALL[SYSCALL["__NR_setfsgid"] = 152] = "__NR_setfsgid";
    SYSCALL[SYSCALL["__NR_times"] = 153] = "__NR_times";
    SYSCALL[SYSCALL["__NR_setpgid"] = 154] = "__NR_setpgid";
    SYSCALL[SYSCALL["__NR_getpgid"] = 155] = "__NR_getpgid";
    SYSCALL[SYSCALL["__NR_getsid"] = 156] = "__NR_getsid";
    SYSCALL[SYSCALL["__NR_setsid"] = 157] = "__NR_setsid";
    SYSCALL[SYSCALL["__NR_getgroups"] = 158] = "__NR_getgroups";
    SYSCALL[SYSCALL["__NR_setgroups"] = 159] = "__NR_setgroups";
    SYSCALL[SYSCALL["__NR_uname"] = 160] = "__NR_uname";
    SYSCALL[SYSCALL["__NR_sethostname"] = 161] = "__NR_sethostname";
    SYSCALL[SYSCALL["__NR_setdomainname"] = 162] = "__NR_setdomainname";
    SYSCALL[SYSCALL["__NR_getrlimit"] = 163] = "__NR_getrlimit";
    SYSCALL[SYSCALL["__NR_setrlimit"] = 164] = "__NR_setrlimit";
    SYSCALL[SYSCALL["__NR_getrusage"] = 165] = "__NR_getrusage";
    SYSCALL[SYSCALL["__NR_umask"] = 166] = "__NR_umask";
    SYSCALL[SYSCALL["__NR_prctl"] = 167] = "__NR_prctl";
    SYSCALL[SYSCALL["__NR_getcpu"] = 168] = "__NR_getcpu";
    SYSCALL[SYSCALL["__NR_gettimeofday"] = 169] = "__NR_gettimeofday";
    SYSCALL[SYSCALL["__NR_settimeofday"] = 170] = "__NR_settimeofday";
    SYSCALL[SYSCALL["__NR_adjtimex"] = 171] = "__NR_adjtimex";
    SYSCALL[SYSCALL["__NR_getpid"] = 172] = "__NR_getpid";
    SYSCALL[SYSCALL["__NR_getppid"] = 173] = "__NR_getppid";
    SYSCALL[SYSCALL["__NR_getuid"] = 174] = "__NR_getuid";
    SYSCALL[SYSCALL["__NR_geteuid"] = 175] = "__NR_geteuid";
    SYSCALL[SYSCALL["__NR_getgid"] = 176] = "__NR_getgid";
    SYSCALL[SYSCALL["__NR_getegid"] = 177] = "__NR_getegid";
    SYSCALL[SYSCALL["__NR_gettid"] = 178] = "__NR_gettid";
    SYSCALL[SYSCALL["__NR_sysinfo"] = 179] = "__NR_sysinfo";
    SYSCALL[SYSCALL["__NR_mq_open"] = 180] = "__NR_mq_open";
    SYSCALL[SYSCALL["__NR_mq_unlink"] = 181] = "__NR_mq_unlink";
    SYSCALL[SYSCALL["__NR_mq_timedsend"] = 182] = "__NR_mq_timedsend";
    SYSCALL[SYSCALL["__NR_mq_timedreceive"] = 183] = "__NR_mq_timedreceive";
    SYSCALL[SYSCALL["__NR_mq_notify"] = 184] = "__NR_mq_notify";
    SYSCALL[SYSCALL["__NR_mq_getsetattr"] = 185] = "__NR_mq_getsetattr";
    SYSCALL[SYSCALL["__NR_msgget"] = 186] = "__NR_msgget";
    SYSCALL[SYSCALL["__NR_msgctl"] = 187] = "__NR_msgctl";
    SYSCALL[SYSCALL["__NR_msgrcv"] = 188] = "__NR_msgrcv";
    SYSCALL[SYSCALL["__NR_msgsnd"] = 189] = "__NR_msgsnd";
    SYSCALL[SYSCALL["__NR_semget"] = 190] = "__NR_semget";
    SYSCALL[SYSCALL["__NR_semctl"] = 191] = "__NR_semctl";
    SYSCALL[SYSCALL["__NR_semtimedop"] = 192] = "__NR_semtimedop";
    SYSCALL[SYSCALL["__NR_semop"] = 193] = "__NR_semop";
    SYSCALL[SYSCALL["__NR_shmget"] = 194] = "__NR_shmget";
    SYSCALL[SYSCALL["__NR_shmctl"] = 195] = "__NR_shmctl";
    SYSCALL[SYSCALL["__NR_shmat"] = 196] = "__NR_shmat";
    SYSCALL[SYSCALL["__NR_shmdt"] = 197] = "__NR_shmdt";
    SYSCALL[SYSCALL["__NR_socket"] = 198] = "__NR_socket";
    SYSCALL[SYSCALL["__NR_socketpair"] = 199] = "__NR_socketpair";
    SYSCALL[SYSCALL["__NR_bind"] = 200] = "__NR_bind";
    SYSCALL[SYSCALL["__NR_listen"] = 201] = "__NR_listen";
    SYSCALL[SYSCALL["__NR_accept"] = 202] = "__NR_accept";
    SYSCALL[SYSCALL["__NR_connect"] = 203] = "__NR_connect";
    SYSCALL[SYSCALL["__NR_getsockname"] = 204] = "__NR_getsockname";
    SYSCALL[SYSCALL["__NR_getpeername"] = 205] = "__NR_getpeername";
    SYSCALL[SYSCALL["__NR_sendto"] = 206] = "__NR_sendto";
    SYSCALL[SYSCALL["__NR_recvfrom"] = 207] = "__NR_recvfrom";
    SYSCALL[SYSCALL["__NR_setsockopt"] = 208] = "__NR_setsockopt";
    SYSCALL[SYSCALL["__NR_getsockopt"] = 209] = "__NR_getsockopt";
    SYSCALL[SYSCALL["__NR_shutdown"] = 210] = "__NR_shutdown";
    SYSCALL[SYSCALL["__NR_sendmsg"] = 211] = "__NR_sendmsg";
    SYSCALL[SYSCALL["__NR_recvmsg"] = 212] = "__NR_recvmsg";
    SYSCALL[SYSCALL["__NR_readahead"] = 213] = "__NR_readahead";
    SYSCALL[SYSCALL["__NR_brk"] = 214] = "__NR_brk";
    SYSCALL[SYSCALL["__NR_munmap"] = 215] = "__NR_munmap";
    SYSCALL[SYSCALL["__NR_mremap"] = 216] = "__NR_mremap";
    SYSCALL[SYSCALL["__NR_add_key"] = 217] = "__NR_add_key";
    SYSCALL[SYSCALL["__NR_request_key"] = 218] = "__NR_request_key";
    SYSCALL[SYSCALL["__NR_keyctl"] = 219] = "__NR_keyctl";
    SYSCALL[SYSCALL["__NR_clone"] = 220] = "__NR_clone";
    SYSCALL[SYSCALL["__NR_execve"] = 221] = "__NR_execve";
    SYSCALL[SYSCALL["__NR3264_mmap"] = 222] = "__NR3264_mmap";
    SYSCALL[SYSCALL["__NR3264_fadvise64"] = 223] = "__NR3264_fadvise64";
    SYSCALL[SYSCALL["__NR_swapon"] = 224] = "__NR_swapon";
    SYSCALL[SYSCALL["__NR_swapoff"] = 225] = "__NR_swapoff";
    SYSCALL[SYSCALL["__NR_mprotect"] = 226] = "__NR_mprotect";
    SYSCALL[SYSCALL["__NR_msync"] = 227] = "__NR_msync";
    SYSCALL[SYSCALL["__NR_mlock"] = 228] = "__NR_mlock";
    SYSCALL[SYSCALL["__NR_munlock"] = 229] = "__NR_munlock";
    SYSCALL[SYSCALL["__NR_mlockall"] = 230] = "__NR_mlockall";
    SYSCALL[SYSCALL["__NR_munlockall"] = 231] = "__NR_munlockall";
    SYSCALL[SYSCALL["__NR_mincore"] = 232] = "__NR_mincore";
    SYSCALL[SYSCALL["__NR_madvise"] = 233] = "__NR_madvise";
    SYSCALL[SYSCALL["__NR_remap_file_pages"] = 234] = "__NR_remap_file_pages";
    SYSCALL[SYSCALL["__NR_mbind"] = 235] = "__NR_mbind";
    SYSCALL[SYSCALL["__NR_get_mempolicy"] = 236] = "__NR_get_mempolicy";
    SYSCALL[SYSCALL["__NR_set_mempolicy"] = 237] = "__NR_set_mempolicy";
    SYSCALL[SYSCALL["__NR_migrate_pages"] = 238] = "__NR_migrate_pages";
    SYSCALL[SYSCALL["__NR_move_pages"] = 239] = "__NR_move_pages";
    SYSCALL[SYSCALL["__NR_rt_tgsigqueueinfo"] = 240] = "__NR_rt_tgsigqueueinfo";
    SYSCALL[SYSCALL["__NR_perf_event_open"] = 241] = "__NR_perf_event_open";
    SYSCALL[SYSCALL["__NR_accept4"] = 242] = "__NR_accept4";
    SYSCALL[SYSCALL["__NR_recvmmsg"] = 243] = "__NR_recvmmsg";
    SYSCALL[SYSCALL["__NR_arch_specific_syscall"] = 244] = "__NR_arch_specific_syscall";
    SYSCALL[SYSCALL["__NR_wait4"] = 260] = "__NR_wait4";
    SYSCALL[SYSCALL["__NR_prlimit64"] = 261] = "__NR_prlimit64";
    SYSCALL[SYSCALL["__NR_fanotify_init"] = 262] = "__NR_fanotify_init";
    SYSCALL[SYSCALL["__NR_fanotify_mark"] = 263] = "__NR_fanotify_mark";
    SYSCALL[SYSCALL["__NR_name_to_handle_at"] = 264] = "__NR_name_to_handle_at";
    SYSCALL[SYSCALL["__NR_open_by_handle_at"] = 265] = "__NR_open_by_handle_at";
    SYSCALL[SYSCALL["__NR_clock_adjtime"] = 266] = "__NR_clock_adjtime";
    SYSCALL[SYSCALL["__NR_syncfs"] = 267] = "__NR_syncfs";
    SYSCALL[SYSCALL["__NR_setns"] = 268] = "__NR_setns";
    SYSCALL[SYSCALL["__NR_sendmmsg"] = 269] = "__NR_sendmmsg";
    SYSCALL[SYSCALL["__NR_process_vm_readv"] = 270] = "__NR_process_vm_readv";
    SYSCALL[SYSCALL["__NR_process_vm_writev"] = 271] = "__NR_process_vm_writev";
    SYSCALL[SYSCALL["__NR_kcmp"] = 272] = "__NR_kcmp";
    SYSCALL[SYSCALL["__NR_finit_module"] = 273] = "__NR_finit_module";
    SYSCALL[SYSCALL["__NR_sched_setattr"] = 274] = "__NR_sched_setattr";
    SYSCALL[SYSCALL["__NR_sched_getattr"] = 275] = "__NR_sched_getattr";
    SYSCALL[SYSCALL["__NR_renameat2"] = 276] = "__NR_renameat2";
    SYSCALL[SYSCALL["__NR_seccomp"] = 277] = "__NR_seccomp";
    SYSCALL[SYSCALL["__NR_getrandom"] = 278] = "__NR_getrandom";
    SYSCALL[SYSCALL["__NR_memfd_create"] = 279] = "__NR_memfd_create";
    SYSCALL[SYSCALL["__NR_bpf"] = 280] = "__NR_bpf";
    SYSCALL[SYSCALL["__NR_execveat"] = 281] = "__NR_execveat";
    SYSCALL[SYSCALL["__NR_userfaultfd"] = 282] = "__NR_userfaultfd";
    SYSCALL[SYSCALL["__NR_membarrier"] = 283] = "__NR_membarrier";
    SYSCALL[SYSCALL["__NR_mlock2"] = 284] = "__NR_mlock2";
    SYSCALL[SYSCALL["__NR_copy_file_range"] = 285] = "__NR_copy_file_range";
    SYSCALL[SYSCALL["__NR_preadv2"] = 286] = "__NR_preadv2";
    SYSCALL[SYSCALL["__NR_pwritev2"] = 287] = "__NR_pwritev2";
    SYSCALL[SYSCALL["__NR_pkey_mprotect"] = 288] = "__NR_pkey_mprotect";
    SYSCALL[SYSCALL["__NR_pkey_alloc"] = 289] = "__NR_pkey_alloc";
    SYSCALL[SYSCALL["__NR_pkey_free"] = 290] = "__NR_pkey_free";
    SYSCALL[SYSCALL["__NR_statx"] = 291] = "__NR_statx";
    SYSCALL[SYSCALL["__NR_io_pgetevents"] = 292] = "__NR_io_pgetevents";
    SYSCALL[SYSCALL["__NR_rseq"] = 293] = "__NR_rseq";
    SYSCALL[SYSCALL["__NR_kexec_file_load"] = 294] = "__NR_kexec_file_load";
    SYSCALL[SYSCALL["__NR_clock_gettime64"] = 403] = "__NR_clock_gettime64";
    SYSCALL[SYSCALL["__NR_clock_settime64"] = 404] = "__NR_clock_settime64";
    SYSCALL[SYSCALL["__NR_clock_adjtime64"] = 405] = "__NR_clock_adjtime64";
    SYSCALL[SYSCALL["__NR_clock_getres_time64"] = 406] = "__NR_clock_getres_time64";
    SYSCALL[SYSCALL["__NR_clock_nanosleep_time64"] = 407] = "__NR_clock_nanosleep_time64";
    SYSCALL[SYSCALL["__NR_timer_gettime64"] = 408] = "__NR_timer_gettime64";
    SYSCALL[SYSCALL["__NR_timer_settime64"] = 409] = "__NR_timer_settime64";
    SYSCALL[SYSCALL["__NR_timerfd_gettime64"] = 410] = "__NR_timerfd_gettime64";
    SYSCALL[SYSCALL["__NR_timerfd_settime64"] = 411] = "__NR_timerfd_settime64";
    SYSCALL[SYSCALL["__NR_utimensat_time64"] = 412] = "__NR_utimensat_time64";
    SYSCALL[SYSCALL["__NR_pselect6_time64"] = 413] = "__NR_pselect6_time64";
    SYSCALL[SYSCALL["__NR_ppoll_time64"] = 414] = "__NR_ppoll_time64";
    SYSCALL[SYSCALL["__NR_io_pgetevents_time64"] = 416] = "__NR_io_pgetevents_time64";
    SYSCALL[SYSCALL["__NR_recvmmsg_time64"] = 417] = "__NR_recvmmsg_time64";
    SYSCALL[SYSCALL["__NR_mq_timedsend_time64"] = 418] = "__NR_mq_timedsend_time64";
    SYSCALL[SYSCALL["__NR_mq_timedreceive_time64"] = 419] = "__NR_mq_timedreceive_time64";
    SYSCALL[SYSCALL["__NR_semtimedop_time64"] = 420] = "__NR_semtimedop_time64";
    SYSCALL[SYSCALL["__NR_rt_sigtimedwait_time64"] = 421] = "__NR_rt_sigtimedwait_time64";
    SYSCALL[SYSCALL["__NR_futex_time64"] = 422] = "__NR_futex_time64";
    SYSCALL[SYSCALL["__NR_sched_rr_get_interval_time64"] = 423] = "__NR_sched_rr_get_interval_time64";
    SYSCALL[SYSCALL["__NR_pidfd_send_signal"] = 424] = "__NR_pidfd_send_signal";
    SYSCALL[SYSCALL["__NR_io_uring_setup"] = 425] = "__NR_io_uring_setup";
    SYSCALL[SYSCALL["__NR_io_uring_enter"] = 426] = "__NR_io_uring_enter";
    SYSCALL[SYSCALL["__NR_io_uring_register"] = 427] = "__NR_io_uring_register";
    SYSCALL[SYSCALL["__NR_open_tree"] = 428] = "__NR_open_tree";
    SYSCALL[SYSCALL["__NR_move_mount"] = 429] = "__NR_move_mount";
    SYSCALL[SYSCALL["__NR_fsopen"] = 430] = "__NR_fsopen";
    SYSCALL[SYSCALL["__NR_fsconfig"] = 431] = "__NR_fsconfig";
    SYSCALL[SYSCALL["__NR_fsmount"] = 432] = "__NR_fsmount";
    SYSCALL[SYSCALL["__NR_fspick"] = 433] = "__NR_fspick";
    SYSCALL[SYSCALL["__NR_pidfd_open"] = 434] = "__NR_pidfd_open";
    SYSCALL[SYSCALL["__NR_clone3"] = 435] = "__NR_clone3";
    SYSCALL[SYSCALL["__NR_close_range"] = 436] = "__NR_close_range";
    SYSCALL[SYSCALL["__NR_openat2"] = 437] = "__NR_openat2";
    SYSCALL[SYSCALL["__NR_pidfd_getfd"] = 438] = "__NR_pidfd_getfd";
    SYSCALL[SYSCALL["__NR_faccessat2"] = 439] = "__NR_faccessat2";
    SYSCALL[SYSCALL["__NR_process_madvise"] = 440] = "__NR_process_madvise";
    SYSCALL[SYSCALL["__NR_epoll_pwait2"] = 441] = "__NR_epoll_pwait2";
    SYSCALL[SYSCALL["__NR_mount_setattr"] = 442] = "__NR_mount_setattr";
    SYSCALL[SYSCALL["__NR_quotactl_fd"] = 443] = "__NR_quotactl_fd";
    SYSCALL[SYSCALL["__NR_landlock_create_ruleset"] = 444] = "__NR_landlock_create_ruleset";
    SYSCALL[SYSCALL["__NR_landlock_add_rule"] = 445] = "__NR_landlock_add_rule";
    SYSCALL[SYSCALL["__NR_landlock_restrict_self"] = 446] = "__NR_landlock_restrict_self";
    SYSCALL[SYSCALL["__NR_memfd_secret"] = 447] = "__NR_memfd_secret";
    SYSCALL[SYSCALL["__NR_process_mrelease"] = 448] = "__NR_process_mrelease";
    SYSCALL[SYSCALL["__NR_futex_waitv"] = 449] = "__NR_futex_waitv";
    SYSCALL[SYSCALL["__NR_set_mempolicy_home_node"] = 450] = "__NR_set_mempolicy_home_node";
    SYSCALL[SYSCALL["__NR_cachestat"] = 451] = "__NR_cachestat";
    SYSCALL[SYSCALL["__NR_fchmodat2"] = 452] = "__NR_fchmodat2";
    SYSCALL[SYSCALL["__NR_map_shadow_stack"] = 453] = "__NR_map_shadow_stack";
    SYSCALL[SYSCALL["__NR_futex_wake"] = 454] = "__NR_futex_wake";
    SYSCALL[SYSCALL["__NR_futex_wait"] = 455] = "__NR_futex_wait";
    SYSCALL[SYSCALL["__NR_futex_requeue"] = 456] = "__NR_futex_requeue";
    SYSCALL[SYSCALL["__NR_statmount"] = 457] = "__NR_statmount";
    SYSCALL[SYSCALL["__NR_listmount"] = 458] = "__NR_listmount";
    SYSCALL[SYSCALL["__NR_lsm_get_self_attr"] = 459] = "__NR_lsm_get_self_attr";
    SYSCALL[SYSCALL["__NR_lsm_set_self_attr"] = 460] = "__NR_lsm_set_self_attr";
    SYSCALL[SYSCALL["__NR_lsm_list_modules"] = 461] = "__NR_lsm_list_modules";
    SYSCALL[SYSCALL["__NR_syscalls"] = 462] = "__NR_syscalls";
    SYSCALL[SYSCALL["__NR_fcntl"] = 25] = "__NR_fcntl";
    SYSCALL[SYSCALL["__NR_statfs"] = 43] = "__NR_statfs";
    SYSCALL[SYSCALL["__NR_fstatfs"] = 44] = "__NR_fstatfs";
    SYSCALL[SYSCALL["__NR_truncate"] = 45] = "__NR_truncate";
    SYSCALL[SYSCALL["__NR_ftruncate"] = 46] = "__NR_ftruncate";
    SYSCALL[SYSCALL["__NR_lseek"] = 62] = "__NR_lseek";
    SYSCALL[SYSCALL["__NR_sendfile"] = 71] = "__NR_sendfile";
    SYSCALL[SYSCALL["__NR_newfstatat"] = 79] = "__NR_newfstatat";
    SYSCALL[SYSCALL["__NR_fstat"] = 80] = "__NR_fstat";
    SYSCALL[SYSCALL["__NR_mmap"] = 222] = "__NR_mmap";
    SYSCALL[SYSCALL["__NR_fadvise64"] = 223] = "__NR_fadvise64";
    SYSCALL[SYSCALL["__NR_fcntl64"] = 25] = "__NR_fcntl64";
    SYSCALL[SYSCALL["__NR_statfs64"] = 43] = "__NR_statfs64";
    SYSCALL[SYSCALL["__NR_fstatfs64"] = 44] = "__NR_fstatfs64";
    SYSCALL[SYSCALL["__NR_truncate64"] = 45] = "__NR_truncate64";
    SYSCALL[SYSCALL["__NR_ftruncate64"] = 46] = "__NR_ftruncate64";
    SYSCALL[SYSCALL["__NR_llseek"] = 62] = "__NR_llseek";
    SYSCALL[SYSCALL["__NR_sendfile64"] = 71] = "__NR_sendfile64";
    SYSCALL[SYSCALL["__NR_fstatat64"] = 79] = "__NR_fstatat64";
    SYSCALL[SYSCALL["__NR_fstat64"] = 80] = "__NR_fstat64";
    SYSCALL[SYSCALL["__NR_mmap2"] = 222] = "__NR_mmap2";
    SYSCALL[SYSCALL["__NR_fadvise64_64"] = 223] = "__NR_fadvise64_64";
})(SYSCALL = exports.SYSCALL || (exports.SYSCALL = {}));
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{"./machine-code":97}],25:[function(require,module,exports){
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
},{"../implements/10/art/dexfile/DexFile":71,"./DexFileManager":26}],26:[function(require,module,exports){
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
},{"./SymbolManager":30}],27:[function(require,module,exports){
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
                    ctx.shadow_frame.printBackTraceWithSmali();
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

},{"../../tools/common":101,"../Utils/SymHelper":18,"../implements/10/art/Instrumentation/Instrumentation":38,"../implements/10/art/interpreter/SwitchImplContext":79,"../implements/10/art/interpreter/interpreter":81,"timers":144}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkerManager = void 0;
const SymHelper_1 = require("../Utils/SymHelper");
class linkerManager {
    static get linkerName() {
        return Process.arch == "arm" ? "linker" : "linker64";
    }
    static get linkerPath() {
        return Process.findModuleByName(linkerManager.linkerName).path;
    }
    static get call_array_address() {
        try {
            return (0, SymHelper_1.getSym)("__dl__ZL10call_arrayIPFviPPcS1_EEvPKcPT_jbS5_", linkerManager.linkerName);
        }
        catch (error) {
            return NULL;
        }
    }
    static get call_function_address() {
        try {
            return (0, SymHelper_1.getSym)("__dl__ZL13call_functionPKcPFviPPcS2_ES0_", linkerManager.linkerName);
        }
        catch (error) {
            return NULL;
        }
    }
    static getSoName(soinfo) {
        return (0, SymHelper_1.callSym)("__dl__ZNK6soinfo10get_sonameEv", linkerManager.linkerName, 'pointer', ['pointer'], soinfo).readCString();
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
    static soLoadCallbacks = new Map();
    static addOnSoLoadCallback(soName, call) {
        if (this.soLoadCallbacks.has(soName)) {
            this.soLoadCallbacks.get(soName).push(call);
        }
        else {
            this.soLoadCallbacks.set(soName, [call]);
        }
    }
    static Hook_CallConstructors(maxDisplayCount = 10, showFiniArray = true, simMdShowOnce = true) {
        if (Process.arch == "arm") {
            linkerManager.cm_code = linkerManager.cm_include + "#define __work_around_b_24465209__ 1" + linkerManager.cm_code;
        }
        else {
            linkerManager.cm_code = linkerManager.cm_include + "#define __LP64__ 1" + linkerManager.cm_code;
        }
        linkerManager.cm = new CModule(linkerManager.cm_code, {
            get_soName: (0, SymHelper_1.getSym)("__dl__ZNK6soinfo10get_sonameEv", linkerManager.linkerName),
            onEnter_call_constructors: new NativeCallback((_ctx, _si, soName, init_array, init_array_count, fini_array, fini_array_count) => {
                const str_soName = soName.readCString();
                const md = Process.findModuleByName(str_soName);
                if (this.soLoadCallbacks.has(str_soName))
                    this.soLoadCallbacks.get(str_soName).forEach(call => call(md));
                if (simMdShowOnce) {
                    if (linkerManager.MapMdCalled.has(str_soName)) {
                        let count = linkerManager.MapMdCalled.get(str_soName);
                        count++;
                        linkerManager.MapMdCalled.set(str_soName, count);
                        return;
                    }
                    else {
                        linkerManager.MapMdCalled.set(str_soName, 1);
                    }
                }
                LOGD(`call_constructors soName: ${str_soName} `);
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
        Interceptor.attach((0, SymHelper_1.getSym)("__dl__ZN6soinfo17call_constructorsEv", linkerManager.linkerName), linkerManager.cm);
    }
    static get_init_array_count(soinfo) {
        const func = new NativeFunction(linkerManager.cm.get_init_array_count, 'pointer', ['pointer']);
        return func(soinfo);
    }
    static get_init_array(soinfo) {
        const func = new NativeFunction(linkerManager.cm.get_init_array, 'pointer', ['pointer']);
        const start = func(soinfo);
        const count = linkerManager.get_init_array_count(soinfo).toUInt32();
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(start.add(i * Process.pointerSize).readPointer());
        }
        return result;
    }
    static get_fini_array_count(soinfo) {
        const func = new NativeFunction(linkerManager.cm.get_fini_array_count, 'pointer', ['pointer']);
        return func(soinfo);
    }
    static get_fini_array(soinfo) {
        const func = new NativeFunction(linkerManager.cm.get_fini_array, 'pointer', ['pointer']);
        const start = func(soinfo);
        const count = linkerManager.get_fini_array_count(soinfo).toUInt32();
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(start.add(i * Process.pointerSize).readPointer());
        }
        return result;
    }
}
exports.linkerManager = linkerManager;
globalThis.linkerName = linkerManager.linkerName;
globalThis.linkerPath = linkerManager.linkerPath;
globalThis.call_array_address = linkerManager.call_array_address;
globalThis.call_function_address = linkerManager.call_function_address;
},{"../Utils/SymHelper":18}],29:[function(require,module,exports){
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
},{"./DexFileManager":26}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolManager = void 0;
const common_1 = require("../../tools/common");
const logger_1 = require("../../tools/logger");
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
            if (common_1.DEBUG)
                (0, logger_1.LOGW)(`find too many symbol, just ret first | size : ${ret.length}`);
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
},{"../../tools/common":101,"../../tools/logger":108}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whenSoLoad = exports.logSoLoad = exports.waitSoLoad = void 0;
const Globals_1 = require("../implements/10/art/Globals");
const common_1 = require("../../tools/common");
const libcfuncs_1 = require("../Utils/libcfuncs");
const waitSoLoad = (soName, sleepS = 10) => {
    (0, exports.whenSoLoad)(soName, () => { libcfuncs_1.libC.sleep(sleepS); });
};
exports.waitSoLoad = waitSoLoad;
const logSoLoad = () => (0, exports.whenSoLoad)(undefined);
exports.logSoLoad = logSoLoad;
var mapCalled = new Map();
const whenSoLoad = (soName, fun_enter, fun_leave, callOnce = true) => {
    const callback = {
        onEnter: function (args) {
            this.path = '';
            try {
                this.path = String(args[0].readCString());
                LOGD(this.path);
            }
            catch (error) {
                if (common_1.DEBUG)
                    LOGE(error);
            }
            if (checkOnce(callOnce, this.path) && this.path != undefined && this.path.includes(soName) && fun_enter != undefined)
                fun_enter(soName);
        },
        onLeave: function (_retval) {
            if (checkOnce(callOnce, this.path) && this.path != undefined && this.path.includes(soName) && fun_leave != undefined)
                fun_leave(soName);
        },
    };
    function checkOnce(callOnce, path) {
        if (callOnce) {
            if (mapCalled.has(path))
                return false;
            else {
                mapCalled.set(path, true);
                return true;
            }
        }
    }
    const dlopen = Module.findExportByName(null, "dlopen");
    const android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    const MEM = Memory.alloc(Globals_1.PointerSize);
    if (dlopen != null)
        Interceptor.attach(dlopen, callback, MEM.writeInt(0));
    if (android_dlopen_ext != null)
        Interceptor.attach(android_dlopen_ext, callback, MEM.writeInt(1));
};
exports.whenSoLoad = whenSoLoad;
globalThis.logSoLoad = exports.logSoLoad;
globalThis.waitSoLoad = exports.waitSoLoad;
globalThis.whenSoLoad = exports.whenSoLoad;
},{"../../tools/common":101,"../Utils/libcfuncs":21,"../implements/10/art/Globals":35}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./DefineClass");
require("./SymbolManager");
require("./DefineClass");
require("./OpenCommon");
require("./LinkerManager");
require("./ExecuteSwitchImplCpp");
require("./dlopen");
},{"./DefineClass":25,"./ExecuteSwitchImplCpp":27,"./LinkerManager":28,"./OpenCommon":29,"./SymbolManager":30,"./dlopen":31}],33:[function(require,module,exports){
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
},{"../../../JSHandle":13,"../../../Utils/SymHelper":18,"./Globals":35}],34:[function(require,module,exports){
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
},{"../../../JSHandle":13}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
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
},{"../../../../tools/StdString":100,"../../../JSHandle":13,"../../../Utils/SymHelper":18,"./Instrumentation/InstructionList":37,"console":117}],37:[function(require,module,exports){
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
},{}],38:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"../../../../android":24,"./InstrumentationListener":39}],39:[function(require,module,exports){
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
},{"../../../../Object":14,"../ObjPtr":52,"../Thread":59,"../Type/JValue":61,"../mirror/ArtMethod":83}],40:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../../../../Object":14,"../Globals":35,"../mirror/ArtMethod":83}],41:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../Globals":35,"../Thread":59}],42:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../Instruction":36,"./InstructionList":37}],43:[function(require,module,exports){
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

},{"../interpreter/interpreter":81,"../mirror/ArtMethod":83,"./SmaliWriter":42,"console":117,"timers":144}],44:[function(require,module,exports){
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

},{"../../../../../tools/intercepter":107,"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"../Instruction":36,"../ShadowFrame":54,"./InstructionList":37,"timers":144}],45:[function(require,module,exports){
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
},{}],46:[function(require,module,exports){
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
},{"./InstructionList":37,"./Instrumentation":38,"./InstrumentationListener":39,"./InstrumentationStackFrame":40,"./InstrumentationStackPopper":41,"./SmaliWriter":42,"./SmalinInlineManager":43,"./UnUsedInstruction":44,"./enum":45}],47:[function(require,module,exports){
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
},{"../../../JSHandle":13}],48:[function(require,module,exports){
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
},{"../../../../../tools/StdString":100,"../../../../JSHandle":13,"../Globals":35}],49:[function(require,module,exports){
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
},{"../../../../../tools/StdString":100,"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"../Globals":35,"./OatFile":50}],50:[function(require,module,exports){
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
},{"../../../../../tools/StdString":100,"../../../../JSHandle":13,"../Globals":35}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./OatFile");
require("./OatDexFile");
require("./MemMap");
},{"./MemMap":48,"./OatDexFile":49,"./OatFile":50}],52:[function(require,module,exports){
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
},{"../../../JSHandle":13}],53:[function(require,module,exports){
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
},{"../../../JSHandle":13}],54:[function(require,module,exports){
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
            LOGZ(disp_smali);
            disp_smali = `\t---------- smaliLines:${smaliLines} ----------\n`;
            while (--counter >= 0 && artInstruction.Next().SizeInCodeUnits > 0) {
                const offset = artInstruction.handle.sub(thisMethod.DexInstructions().insns);
                disp_smali += `\t${artInstruction.handle} ${offset} -> ${artInstruction.dumpString(dexfile)}\n`;
                artInstruction = artInstruction.Next();
            }
            LOGN(disp_smali);
        });
    }
}
exports.ShadowFrame = ShadowFrame;
globalThis.ShadowFrame = ShadowFrame;
},{"../../../JSHandle":13,"../../../Object":14,"../../../Utils/SymHelper":18,"./Globals":35,"./Instruction":36,"./ObjPtr":52,"./Type/JValue":61,"./dexfile/CodeItemInstructionAccessor":69,"./mirror/ArtMethod":83}],55:[function(require,module,exports){
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
},{"./StackVisitor":57}],56:[function(require,module,exports){
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
},{"./StackVisitor":57}],57:[function(require,module,exports){
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
},{"../../../../../tools/StdString":100,"../../../../JSHandle":13,"../../../../Object":14,"../../../../Utils/SymHelper":18,"../Globals":35,"../OatQuickMethodHeader":47,"../QuickMethodFrameInfo":53,"../ShadowFrame":54,"../Thread":59,"../mirror/ArtMethod":83}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StackVisitor");
require("./CHAStackVisitor");
require("./CatchBlockStackVisitor");
},{"./CHAStackVisitor":55,"./CatchBlockStackVisitor":56,"./StackVisitor":57}],59:[function(require,module,exports){
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
},{"../../../../tools/StdString":100,"../../../JSHandle":13,"../../../Utils/SymHelper":18,"./Globals":35,"./Thread_Inl":60,"./mirror/ArtMethod":83}],60:[function(require,module,exports){
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
},{"../../../JSHandle":13,"./Globals":35,"./ShadowFrame":54}],61:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../../../../Object":14}],62:[function(require,module,exports){
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
},{"../../../../Object":14}],63:[function(require,module,exports){
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
},{"../../../../Interface/art/mirror/HeapReference":9,"../../../../Object":14}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JValue");
require("./jobject");
require("./JavaString");
require("./Throwable");
},{"./JValue":61,"./JavaString":62,"./Throwable":63,"./jobject":65}],65:[function(require,module,exports){
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
},{"../../../../JSHandle":13}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],67:[function(require,module,exports){
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
},{"../Globals":35,"./CodeItemInstructionAccessor":69}],68:[function(require,module,exports){
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
},{"../Globals":35,"./CodeItemDataAccessor":67}],69:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../Globals":35,"../Instruction":36,"./CompactDexFile":70,"./StandardDexFile":75}],70:[function(require,module,exports){
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
},{"../Globals":35,"./DexFile":71}],71:[function(require,module,exports){
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
},{"../../../../../tools/StdString":100,"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"../Globals":35,"../Oat/OatDexFile":49,"./DexFileStructs":72,"./DexIndex":73,"./Header":74}],72:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../Globals":35,"./DexIndex":73}],73:[function(require,module,exports){
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
},{"../../../../ValueHandle":23}],74:[function(require,module,exports){
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
},{"../../../../JSHandle":13}],75:[function(require,module,exports){
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
},{"./DexFile":71}],76:[function(require,module,exports){
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
},{"./CodeItemDataAccessor":67,"./CodeItemDebugInfoAccessor":68,"./CodeItemInstructionAccessor":69,"./CompactDexFile":70,"./DexFile":71,"./DexFileStructs":72,"./DexIndex":73,"./Header":74,"./StandardDexFile":75}],77:[function(require,module,exports){
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
},{"./ClassLinker":33,"./GcRoot":34,"./Globals":35,"./Instruction":36,"./Instrumentation/include":46,"./Oat/include":51,"./OatQuickMethodHeader":47,"./ObjPtr":52,"./QuickMethodFrameInfo":53,"./ShadowFrame":54,"./StackVisitor/include":58,"./Thread":59,"./Thread_Inl":60,"./Type/include":64,"./bridge":66,"./dexfile/include":76,"./interpreter/include":80,"./mirror/include":88,"./runtime/include":91}],78:[function(require,module,exports){
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

},{"../../../../../tools/intercepter":107,"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"timers":144}],79:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../Globals":35,"../ShadowFrame":54,"../Thread":59,"../Type/JValue":61,"../dexfile/CodeItemDataAccessor":67}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./interpreter");
require("./SwitchImplContext");
require("./InstructionHandler");
},{"./InstructionHandler":78,"./SwitchImplContext":79,"./interpreter":81}],81:[function(require,module,exports){
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
    try {
        interpreter.Hook_CanUseMterp();
        interpreter.Hook_MoveToExceptionHandler();
    }
    catch (error) {
    }
});
Reflect.set(globalThis, "ArtInterpreter", interpreter);
}).call(this)}).call(this,require("timers").setImmediate)

},{"../../../../../tools/common":101,"../../../../../tools/intercepter":107,"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"../ShadowFrame":54,"timers":144}],82:[function(require,module,exports){
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
},{"../../../../../tools/StdString":100,"../../../../Interface/art/mirror/HeapReference":9,"../../../../Object":14,"./ClassExt":84,"./ClassLoader":85,"./DexCache":86,"./IfTable":87}],83:[function(require,module,exports){
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
    showOatAsm(num = -1, info = false) {
        newLine();
        if (info)
            LOGD(`👉 ${this}\n`);
        LOGD(this.methodName);
        const debugSymbol = DebugSymbol.fromAddress(this.data);
        LOGZ(`[ ${debugSymbol} ]`);
        newLine();
        let insns = Instruction.parse(this.data);
        let num_local = 0;
        let code_offset = 0;
        let errorFlag = false;
        while (++num_local < (num == -1 ? 20 : getSymSize(debugSymbol))) {
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
        function getSymSize(debugSymbol) {
            return 20;
            if (debugSymbol.name != null) {
            }
        }
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

},{"../../../../../tools/StdString":100,"../../../../../tools/common":101,"../../../../../tools/enum":104,"../../../../../tools/modifiers":109,"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"../GcRoot":34,"../Globals":35,"../OatQuickMethodHeader":47,"../Thread":59,"../dexfile/CodeItemInstructionAccessor":69,"./ArtClass":82,"./DexCache":86,"timers":144}],84:[function(require,module,exports){
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
},{"../../../../Object":14}],85:[function(require,module,exports){
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
},{"../../../../Interface/art/mirror/HeapReference":9,"../../../../Object":14}],86:[function(require,module,exports){
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
},{"../../../../../tools/StdString":100,"../../../../Interface/art/mirror/HeapReference":9,"../../../../Object":14,"../dexfile/DexFile":71}],87:[function(require,module,exports){
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
},{"../../../../Object":14}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":82,"./ArtMethod":83,"./ClassExt":84,"./ClassLoader":85,"./IfTable":87}],89:[function(require,module,exports){
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

},{"../../../../../tools/StdString":100,"../../../../JSHandle":13,"../../../../Utils/SymHelper":18}],90:[function(require,module,exports){
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
},{"../../../../JSHandle":13,"../../../../Utils/SymHelper":18,"../Thread":59}],91:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Runtime");
require("./ThreadList");
},{"./Runtime":89,"./ThreadList":90}],92:[function(require,module,exports){
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
},{"../../../../tools/StdString":100,"../../../../tools/intercepter":107,"../../../Utils/SymHelper":18}],93:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./dex2oat");
},{"./dex2oat":92}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
require("./dex2oat/include");
},{"./art/include":77,"./dex2oat/include":93}],95:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":94}],96:[function(require,module,exports){
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
},{"./Interface/include":12,"./JSHandle":13,"./Object":14,"./TraceManager":15,"./Utils/include":20,"./ValueHandle":23,"./android":24,"./functions/include":32,"./implements/include":95,"./machine-code":97}],97:[function(require,module,exports){
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
},{}],98:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":6,"./android/include":96,"./tools/include":106}],99:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./include");
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
},{"./include":98}],100:[function(require,module,exports){
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
},{}],101:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDuplicateOBJ = exports.KeyValueStore = exports.DEBUG = void 0;
exports.DEBUG = false;
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
var arrayMap = new Map();
const filterDuplicateOBJ = (objstr, maxCount = 10) => {
    if (arrayMap.has(objstr)) {
        arrayMap.set(objstr, arrayMap.get(objstr) + 1);
        if (arrayMap.get(objstr) > maxCount) {
            arrayMap.delete(objstr);
            return false;
        }
    }
    else
        arrayMap.set(objstr, 1);
    return true;
};
exports.filterDuplicateOBJ = filterDuplicateOBJ;
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

},{"timers":144}],102:[function(require,module,exports){
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

},{"timers":144}],103:[function(require,module,exports){
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
},{}],104:[function(require,module,exports){
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
},{}],105:[function(require,module,exports){
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
},{}],106:[function(require,module,exports){
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
},{"./StdString":100,"./common":101,"./dlopen":102,"./dump":103,"./enum":104,"./intercepter":107,"./logger":108,"./modifiers":109}],107:[function(require,module,exports){
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

},{"../android/Utils/SymHelper":18}],108:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGW = exports.Logger = exports.LogColor = void 0;
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
exports.LOGW = Logger.LOGW;
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
},{}],109:[function(require,module,exports){
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
},{}],110:[function(require,module,exports){
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

},{"object.assign/polyfill":141,"util/":113}],111:[function(require,module,exports){
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

},{}],112:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],113:[function(require,module,exports){
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

},{"./support/isBuffer":112,"_process":121,"inherits":111}],114:[function(require,module,exports){
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

},{}],115:[function(require,module,exports){
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

},{"./":116,"get-intrinsic":124}],116:[function(require,module,exports){
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

},{"function-bind":123,"get-intrinsic":124,"set-function-length":143}],117:[function(require,module,exports){
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

},{"assert":110,"util":147}],118:[function(require,module,exports){
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

},{"get-intrinsic":124,"gopd":125,"has-property-descriptors":126}],119:[function(require,module,exports){
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

},{}],120:[function(require,module,exports){
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

},{"is-callable":134}],121:[function(require,module,exports){
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

},{"events":119}],122:[function(require,module,exports){
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

},{}],123:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":122}],124:[function(require,module,exports){
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

},{"function-bind":123,"has-proto":127,"has-symbols":128,"hasown":131}],125:[function(require,module,exports){
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

},{"get-intrinsic":124}],126:[function(require,module,exports){
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

},{"get-intrinsic":124}],127:[function(require,module,exports){
'use strict';

var test = {
	foo: {}
};

var $Object = Object;

module.exports = function hasProto() {
	return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
};

},{}],128:[function(require,module,exports){
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

},{"./shams":129}],129:[function(require,module,exports){
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

},{}],130:[function(require,module,exports){
'use strict';

var hasSymbols = require('has-symbols/shams');

module.exports = function hasToStringTagShams() {
	return hasSymbols() && !!Symbol.toStringTag;
};

},{"has-symbols/shams":129}],131:[function(require,module,exports){
'use strict';

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = require('function-bind');

/** @type {(o: {}, p: PropertyKey) => p is keyof o} */
module.exports = bind.call(call, $hasOwn);

},{"function-bind":123}],132:[function(require,module,exports){
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

},{}],133:[function(require,module,exports){
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

},{"call-bind/callBound":115,"has-tostringtag/shams":130}],134:[function(require,module,exports){
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

},{}],135:[function(require,module,exports){
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

},{"has-tostringtag/shams":130}],136:[function(require,module,exports){
'use strict';

var whichTypedArray = require('which-typed-array');

module.exports = function isTypedArray(value) {
	return !!whichTypedArray(value);
};

},{"which-typed-array":148}],137:[function(require,module,exports){
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

},{"./isArguments":139}],138:[function(require,module,exports){
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

},{"./implementation":137,"./isArguments":139}],139:[function(require,module,exports){
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

},{}],140:[function(require,module,exports){
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

},{"call-bind/callBound":115,"has-symbols/shams":129,"object-keys":138}],141:[function(require,module,exports){
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

},{"./implementation":140}],142:[function(require,module,exports){
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

},{}],143:[function(require,module,exports){
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

},{"define-data-property":118,"get-intrinsic":124,"gopd":125,"has-property-descriptors":126}],144:[function(require,module,exports){
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

},{"process/browser.js":142,"timers":144}],145:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"dup":112}],146:[function(require,module,exports){
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

},{"is-arguments":133,"is-generator-function":135,"is-typed-array":136,"which-typed-array":148}],147:[function(require,module,exports){
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

},{"./support/isBuffer":145,"./support/types":146,"_process":121,"inherits":132}],148:[function(require,module,exports){
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

},{"available-typed-arrays":114,"call-bind":116,"call-bind/callBound":115,"for-each":120,"gopd":125,"has-tostringtag/shams":130}]},{},[99])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0NvbnRleHQudHMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9UaGVhZHMudHMiLCJhZ2VudC9KYXZhL2hvb2tzL2hvb2tfTG9hZExpYnJhcnkudHMiLCJhZ2VudC9KYXZhL2hvb2tzL2luY2x1ZGUudHMiLCJhZ2VudC9KYXZhL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvSGVhcFJlZmVyZW5jZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvSW50ZXJmYWNlL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0pTSGFuZGxlLnRzIiwiYWdlbnQvYW5kcm9pZC9PYmplY3QudHMiLCJhZ2VudC9hbmRyb2lkL1RyYWNlTWFuYWdlci50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvQXJ0TWV0aG9kSGVscGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9KYXZhSG9va2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9TeW1IZWxwZXIudHMiLCJhZ2VudC9hbmRyb2lkL1V0aWxzL1RocmVhZEhvb2tlci50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvVXRpbHMvbGliY2Z1bmNzLnRzIiwiYWdlbnQvYW5kcm9pZC9VdGlscy9zeXNjYWxscy50cyIsImFnZW50L2FuZHJvaWQvVmFsdWVIYW5kbGUudHMiLCJhZ2VudC9hbmRyb2lkL2FuZHJvaWQudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9EZWZpbmVDbGFzcy50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL0RleEZpbGVNYW5hZ2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvRXhlY3V0ZVN3aXRjaEltcGxDcHAudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9MaW5rZXJNYW5hZ2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9mdW5jdGlvbnMvT3BlbkNvbW1vbi50cyIsImFnZW50L2FuZHJvaWQvZnVuY3Rpb25zL1N5bWJvbE1hbmFnZXIudHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9kbG9wZW4udHMiLCJhZ2VudC9hbmRyb2lkL2Z1bmN0aW9ucy9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9DbGFzc0xpbmtlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvR2NSb290LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9HbG9iYWxzLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVjdGlvbi50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL0luc3RydWN0aW9uTGlzdC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL0luc3RydW1lbnRhdGlvbi50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL0luc3RydW1lbnRhdGlvbkxpc3RlbmVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVtZW50YXRpb24vSW5zdHJ1bWVudGF0aW9uU3RhY2tGcmFtZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvSW5zdHJ1bWVudGF0aW9uL0luc3RydW1lbnRhdGlvblN0YWNrUG9wcGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVtZW50YXRpb24vU21hbGlXcml0ZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9TbWFsaW5JbmxpbmVNYW5hZ2VyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVtZW50YXRpb24vVW5Vc2VkSW5zdHJ1Y3Rpb24udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydW1lbnRhdGlvbi9lbnVtLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9JbnN0cnVtZW50YXRpb24vaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2F0UXVpY2tNZXRob2RIZWFkZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdC9NZW1NYXAudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09hdC9PYXREZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXQvT2F0RmlsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2F0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L09ialB0ci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvUXVpY2tNZXRob2RGcmFtZUluZm8udHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1NoYWRvd0ZyYW1lLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TdGFja1Zpc2l0b3IvQ0hBU3RhY2tWaXNpdG9yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9TdGFja1Zpc2l0b3IvQ2F0Y2hCbG9ja1N0YWNrVmlzaXRvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU3RhY2tWaXNpdG9yL1N0YWNrVmlzaXRvci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvU3RhY2tWaXNpdG9yL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1RocmVhZC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvVGhyZWFkX0lubC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvVHlwZS9KVmFsdWUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvSmF2YVN0cmluZy50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvVHlwZS9UaHJvd2FibGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L1R5cGUvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvVHlwZS9qb2JqZWN0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtRGF0YUFjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvZGVJdGVtRGVidWdJbmZvQWNjZXNzb3IudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvQ29kZUl0ZW1JbnN0cnVjdGlvbkFjY2Vzc29yLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0NvbXBhY3REZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL0RleEZpbGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvRGV4RmlsZVN0cnVjdHMudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvRGV4SW5kZXgudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2RleGZpbGUvSGVhZGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9kZXhmaWxlL1N0YW5kYXJkRGV4RmlsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvZGV4ZmlsZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbnRlcnByZXRlci9JbnN0cnVjdGlvbkhhbmRsZXIudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L2ludGVycHJldGVyL1N3aXRjaEltcGxDb250ZXh0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbnRlcnByZXRlci9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbnRlcnByZXRlci9pbnRlcnByZXRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0FydENsYXNzLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQXJ0TWV0aG9kLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQ2xhc3NFeHQudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9DbGFzc0xvYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0RleENhY2hlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvSWZUYWJsZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L3J1bnRpbWUvUnVudGltZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvcnVudGltZS9UaHJlYWRMaXN0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9ydW50aW1lL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvZGV4Mm9hdC9kZXgyb2F0LnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2RleDJvYXQvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL21hY2hpbmUtY29kZS5qcyIsImFnZW50L2luY2x1ZGUudHMiLCJhZ2VudC9tYWluLnRzIiwiYWdlbnQvdG9vbHMvU3RkU3RyaW5nLnRzIiwiYWdlbnQvdG9vbHMvY29tbW9uLnRzIiwiYWdlbnQvdG9vbHMvZGxvcGVuLnRzIiwiYWdlbnQvdG9vbHMvZHVtcC50cyIsImFnZW50L3Rvb2xzL2VudW0udHMiLCJhZ2VudC90b29scy9mdW5jdGlvbnMudHMiLCJhZ2VudC90b29scy9pbmNsdWRlLnRzIiwiYWdlbnQvdG9vbHMvaW50ZXJjZXB0ZXIudHMiLCJhZ2VudC90b29scy9sb2dnZXIudHMiLCJhZ2VudC90b29scy9tb2RpZmllcnMudHMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIm5vZGVfbW9kdWxlcy9hc3NlcnQvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2F2YWlsYWJsZS10eXBlZC1hcnJheXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FsbC1iaW5kL2NhbGxCb3VuZC5qcyIsIm5vZGVfbW9kdWxlcy9jYWxsLWJpbmQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29uc29sZS1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZmluZS1kYXRhLXByb3BlcnR5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZnJpZGEtcHJvY2Vzcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mdW5jdGlvbi1iaW5kL2ltcGxlbWVudGF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2Z1bmN0aW9uLWJpbmQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ2V0LWludHJpbnNpYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nb3BkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhcy1wcm9wZXJ0eS1kZXNjcmlwdG9ycy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYXMtcHJvdG8vaW5kZXguanMiLCJub2RlX21vZHVsZXMvaGFzLXN5bWJvbHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaGFzLXN5bWJvbHMvc2hhbXMuanMiLCJub2RlX21vZHVsZXMvaGFzLXRvc3RyaW5ndGFnL3NoYW1zLmpzIiwibm9kZV9tb2R1bGVzL2hhc293bi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2lzLWFyZ3VtZW50cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1jYWxsYWJsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1nZW5lcmF0b3ItZnVuY3Rpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtdHlwZWQtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWtleXMvaW1wbGVtZW50YXRpb24uanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWtleXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWtleXMvaXNBcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LmFzc2lnbi9pbXBsZW1lbnRhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QuYXNzaWduL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9zZXQtZnVuY3Rpb24tbGVuZ3RoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L3R5cGVzLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy93aGljaC10eXBlZC1hcnJheS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsU0FBUyxjQUFjO0lBQ25CLElBQUksV0FBVyxHQUFpQixJQUFJLENBQUE7SUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNULFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtJQUM3RSxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sV0FBVyxDQUFBO0FBQ3RCLENBQUM7QUFFRCxTQUFTLGNBQWM7SUFDbkIsSUFBSSxXQUFXLEdBQVcsRUFBRSxDQUFBO0lBQzVCLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDVCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ3BGLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQzdFLENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxXQUFXLENBQUE7QUFDdEIsQ0FBQztBQUVELFNBQVMsV0FBVztJQUNoQixJQUFJLElBQUksR0FBVyxFQUFFLENBQUE7SUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNULElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDcEYsSUFBSSxHQUFHLGtCQUFrQixDQUFDLHFC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LElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBR00sTUFBTSxDQUFDLElBQUk7UUFDZCxNQUFNLElBQUksR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUN2RixPQUFPLElBQUksRUFBVyxDQUFBO0lBQzFCLENBQUM7SUFHTSxNQUFNLENBQUMsTUFBTTtRQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMzRixPQUFPLE1BQU0sRUFBVyxDQUFBO0lBQzVCLENBQUM7SUFHTSxNQUFNLENBQUMsTUFBTTtRQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMzRixPQUFPLE1BQU0sRUFBVyxDQUFBO0lBQzVCLENBQUM7SUFHTSxNQUFNLENBQUMsT0FBTztRQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUM3RixPQUFPLE9BQU8sRUFBVyxDQUFBO0lBQzdCLENBQUM7SUFHTSxNQUFNLENBQUMsTUFBTTtRQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMzRixPQUFPLE1BQU0sRUFBVyxDQUFBO0lBQzVCLENBQUM7SUFHTSxNQUFNLENBQUMsTUFBTTtRQUNoQixNQUFNLE1BQU0sR0FB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QTtJQUN4Qix1RUFBMEIsQ0FBQTtJQUMxQix1RUFBMEIsQ0FBQTtJQUMxQixpRUFBdUIsQ0FBQTtJQUN2QiwrREFBc0IsQ0FBQTtJQUN0QiwrREFBc0IsQ0FBQTtJQUN0QixxREFBaUIsQ0FBQTtJQUNqQix5REFBbUIsQ0FBQTtJQUNuQixxREFBaUIsQ0FBQTtJQUNqQix5REFBbUIsQ0FBQTtJQUNuQixxREFBaUIsQ0FBQTtJQUNqQiwyREFBb0IsQ0FBQTtJQUNwQiwyREFBb0IsQ0FBQTtJQUNwQiwyREFBb0IsQ0FBQTtJQUNwQiwyREFBb0IsQ0FBQTtJQUNwQix5REFBbUIsQ0FBQTtJQUNuQix5REFBbUIsQ0FBQTtJQUNuQixtREFBZ0IsQ0FBQTtJQUNoQix1REFBa0IsQ0FBQTtJQUNsQix1REFBa0IsQ0FBQTtJQUNsQixxREFBaUIsQ0FBQTtJQUNqQixxREFBaUIsQ0FBQTtJQUNqQiwyREFBb0IsQ0FBQTtJQUNwQiwyREFBb0IsQ0FBQTtJQUNwQixtREFBZ0IsQ0FBQTtJQUNoQiwrREFBc0IsQ0FBQTtJQUN0QixtRUFBd0IsQ0FBQTtJQUN4QiwyREFBb0IsQ0FBQTtJQUNwQiwyREFBb0IsQ0FBQTtJQUNwQiwyREFBb0IsQ0FBQTtJQUNwQixtREFBZ0IsQ0FBQTtJQUNoQixtREFBZ0IsQ0FBQTtJQUNoQixxREFBaUIsQ0FBQTtJQUNqQixpRUFBdUIsQ0FBQTtJQUN2QixpRUFBdUIsQ0FBQTtJQUN2Qix5REFBbUIsQ0FBQTtJQUNuQixxREFBaUIsQ0FBQTtJQUNqQix1REFBa0IsQ0FBQTtJQUNsQixxREFBaUIsQ0FBQTtJQUNqQix1REFBa0IsQ0FBQTtJQUNsQixxREFBaUIsQ0FBQTtJQUNqQix1REFBa0IsQ0FBQTtJQUNsQixxREFBaUIsQ0FBQTtJQUNqQix1REFBa0IsQ0FBQTtJQUNsQix1REFBa0IsQ0FBQTtJQUNsQiwyREFBb0IsQ0FBQTtJQUNwQixpRUFBdUIsQ0FBQTtJQUN2Qix1RUFBMEIsQ0FBQTtJQUMxQiwyREFBb0IsQ0FBQTtJQUNwQixtRUFBd0IsQ0FBQTtJQUN4QixxREFBaUIsQ0FB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QUE0QixDQUFBO0lBQzVCLDJFQUE0QixDQUFBO0lBQzVCLHlFQUEyQixDQUFBO0lBQzNCLHVFQUEwQixDQUFBO0lBQzFCLGlFQUF1QixDQUFBO0lBQ3ZCLGlGQUErQixDQUFBO0lBQy9CLHVFQUEwQixDQUFBO0lBQzFCLCtFQUE4QixDQUFBO0lBQzlCLHFGQUFpQyxDQUFBO0lBQ2pDLDJFQUE0QixDQUFBO0lBQzVCLHFGQUFpQyxDQUFBO0lBQ2pDLGlFQUF1QixDQUFBO0lBQ3ZCLGlHQUF1QyxDQUFBO0lBQ3ZDLDJFQUE0QixDQUFBO0lBQzVCLHFFQUF5QixDQUFBO0lBQ3pCLHFFQUF5QixDQUFBO0lBQ3pCLDJFQUE0QixDQUFBO0lBQzVCLDJEQUFvQixDQUFBO0lBQ3BCLDZEQUFxQixDQUFBO0lBQ3JCLHFEQUFpQixDQUFBO0lBQ2pCLHlEQUFtQixDQUFBO0lBQ25CLHVEQUFrQixDQUFBO0lBQ2xCLHFEQUFpQixDQUFBO0lBQ2pCLDZEQUFxQixDQUFBO0lBQ3JCLHFEQUFpQixDQUFBO0lBQ2pCLCtEQUFzQixDQUFBO0lBQ3RCLHVEQUFrQixDQUFBO0lBQ2xCLCtEQUFzQixDQUFBO0lBQ3RCLDZEQUFxQixDQUFBO0lBQ3JCLHVFQUEwQixDQUFBO0lBQzFCLGlFQUF1QixDQUFBO0lBQ3ZCLG1FQUF3QixDQUFBO0lBQ3hCLCtEQUFzQixDQUFBO0lBQ3RCLHVGQUFrQyxDQUFBO0lBQ2xDLDJFQUE0QixDQUFBO0lBQzVCLHFGQUFpQyxDQUFBO0lBQ2pDLGlFQUF1QixDQUFBO0lBQ3ZCLHlFQUEyQixDQUFBO0lBQzNCLCtEQUFzQixDQUFBO0lBQ3RCLHVGQUFrQyxDQUFBO0lBQ2xDLDJEQUFvQixDQUFBO0lBQ3BCLDJEQUFvQixDQUFBO0lBQ3BCLHlFQUEyQixDQUFBO0lBQzNCLDZEQUFxQixDQUFBO0lBQ3JCLDZEQUFxQixDQUFBO0lBQ3JCLG1FQUF3QixDQUFBO0lBQ3hCLDJEQUFvQixDQUFBO0lBQ3BCLDJEQUFvQixDQUFBO0lBQ3BCLDJFQUE0QixDQUFBO0lBQzVCLDJFQUE0QixDQUFBO0lBQzVCLHlF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QUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFCLENBQUM7Q0FFSjtBQXVDRCxNQUFNLE1BQU8sU0FBUSxtQkFBUTtJQUV6QixPQUFPLEdBQXdCLElBQUksR0FBRyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUNYLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztRQUNaLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQztRQUNiLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQztRQUNiLENBQUMs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TUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQTtJQUM5QixNQUFNLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFBO0lBQ3BDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3BCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3BCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3BCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3BCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3BCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBUXBCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBRXZCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7SUFHOUIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFFdkIsTUFBTSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQTtJQUNsQyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFBO0lBQ2hDLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUE7SUFDakMsTUFBTSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQTtJQUNqQyxNQUFNLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFBO0lBSXBDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBRXZCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3BCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7SUFDOUIsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQTtJQUM5QixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7SUFDOUIsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQTtJQUM5QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMzQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUN6QixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUMxQixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQXlCM0IsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7SUFDdkIsTUFBTSxDQUFD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QUUsQ0FBQyxRQUFRLEtBQWUsR0FBRyxDQUFBO0lBRTlFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQTtJQUVqQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUMzRCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBUSxFQUFRLEVBQUUsQ0FBQyxHQUFHLENB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDM3NCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiJ9
