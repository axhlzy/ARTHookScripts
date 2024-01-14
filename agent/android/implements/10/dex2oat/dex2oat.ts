import { StdString } from "../../../../tools/StdString"
import { R } from "../../../../tools/intercepter"
import { getSym } from "../../../Utils/SymHelper"

type int = number

export class dex2oat {

    // https://cs.android.com/android/platform/superproject/+/android-10.0.0_r47:art/runtime/exec_utils.cc;l=33
    // int ExecAndReturnCode(std::vector<std::string>& arg_vector, std::string* error_msg)
    // _ZN3art17ExecAndReturnCodeERNSt3__16vectorINS0_12basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEENS5_IS7_EEEEPS7_
    static hook_ExecAndReturnCode() {
        const target: NativePointer = getSym("_ZN3art17ExecAndReturnCodeERNSt3__16vectorINS0_12basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEENS5_IS7_EEEEPS7_", "libart.so")
        const srcCall: (arg_vector: NativePointer, error_msg: NativePointer) => int = new NativeFunction(target, 'int', ['pointer', 'pointer']) as any
        // Interceptor.attach(target, {
        //     onEnter: function(args) {
        //         const arg_vector = args[0]
        //         const error_msg = new StdString(args[1])
        //         LOGD(`ExecAndReturnCode arg_vector: ${arg_vector} error_msg: ${error_msg.toString()}`)
        //     }
        // })
        R(target, new NativeCallback((arg_vector_: NativePointer, error_msg_: NativePointer) => {
            const error_msg = new StdString(error_msg_[1])
            LOGD(`ExecAndReturnCode arg_vector: ${arg_vector_} error_msg: ${error_msg.toString()}`)
            // return srcCall(arg_vector, error_msg)
            return ptr(-1)
        }, 'pointer', ['pointer', 'pointer']))
    }

    // ref https://github.com/asLody/TurboDex/blob/master/project/turbodex/turbodex/src/main/jni/core/FastLoadDex.cpp#L27
    // #define DEX2OAT_BIN "/system/bin/dex2oat"
    private static DEX2OAT_BIN = "/system/bin/dex2oat"
    // int execv(const char* __path, cha __argr* const*v);
    // int execve(const char* __file, char* const* __argv, char* const* __envp);
    static hook_exec() {
        const target_execv: NativePointer = getSym("execv", "libc.so")
        const srcCall_execv: (path: NativePointer, argv: NativePointer) => int = new NativeFunction(target_execv, 'int', ['pointer', 'pointer']) as any
        R(target_execv, new NativeCallback((path: NativePointer, argv: NativePointer) => {
            const pathStr = path.readCString()
            const argvStr = argv.readCString()
            LOGD(`execv path: ${pathStr} argv: ${argvStr}`)
            if (pathStr.includes(dex2oat.DEX2OAT_BIN)) return ptr(-1)
            return srcCall_execv(path, argv)
        }, 'pointer', ['pointer', 'pointer']))

        const target_execve: NativePointer = getSym("execve", "libc.so")
        const srcCall_execve: (file: NativePointer, argv: NativePointer, envp: NativePointer) => int = new NativeFunction(target_execve, 'int', ['pointer', 'pointer', 'pointer']) as any
        R(target_execve, new NativeCallback((file: NativePointer, argv: NativePointer, envp: NativePointer) => {
            const fileStr = file.readCString()
            const argvStr = argv.readCString()
            const envpStr = envp.readCString()
            LOGD(`execve file: ${fileStr} argv: ${argvStr} envp: ${envpStr}`)
            if (fileStr.includes(dex2oat.DEX2OAT_BIN)) return ptr(-1)
            return srcCall_execve(file, argv, envp)
        }, 'pointer', ['pointer', 'pointer', 'pointer']))

    }

}

Reflect.set(globalThis, 'dex2oat', dex2oat)