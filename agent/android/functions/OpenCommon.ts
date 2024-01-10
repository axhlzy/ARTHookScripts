
// std::unique_ptr<DexFile> DexFileLoader::OpenCommon(
//     std::shared_ptr<DexFileContainer> container,
//     const uint8_t* base,
//     size_t size,
//     const std::string& location,
//     std::optional<uint32_t> location_checksum,
//     const OatDexFile* oat_dex_file,
//     bool verify,
//     bool verify_checksum,
//     std::string* error_msg,
//     DexFileLoaderErrorCode* error_code)

import { DexFileManager } from "./DexFileManager";

// https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_file_loader.cc;l=417?q=OpenCommon&ss=android%2Fplatform%2Fsuperproject

export class OpenCommonHookManager extends DexFileManager {

    private static instance: OpenCommonHookManager = null

    private constructor() {
        super()
    }

    public static getInstance(): OpenCommonHookManager {
        if (OpenCommonHookManager.instance == null) {
            OpenCommonHookManager.instance = new OpenCommonHookManager()
        }
        return OpenCommonHookManager.instance
    }

    public get openCommonAddress() {
        return this.dexfileSymbolFilter(["DexFileLoader", "OpenCommon"], ["ArtDexFileLoader"]).address
    }

    // todo 这里有点问题 晚点结合ida瞅瞅
    public enableHook() {
        LOGD(`EnableHook -> OpenCommonHookManager`)
        Interceptor.attach(this.openCommonAddress, {
            onEnter: function (this: InvocationContext, args: InvocationArguments) {
                let disp: string = `DexFileLoader::OpenCommon(\n`
                disp += `\tDexFileLoader instance = ${args[0]}\n`
                disp += `\tstd::shared_ptr<DexFileContainer> container = ${args[1]}\n`
                disp += `\tconst uint8_t* base = ${args[2]}\n`
                disp += `\tsize_t size = ${args[3]}\n`
                disp += `\tconst std::string& location = ${args[4]}\n`
                disp += `\tstd::optional<uint32_t> location_checksum = ${args[5]}\n`
                disp += `\tconst OatDexFile* oat_dex_file = ${args[6]}\n`
                disp += `\tbool verify = ${args[7]}\n`
                disp += `\tbool verify_checksum = ${args[8]}\n`
                disp += `\tstd::string* error_msg = ${args[9]}\n`
                disp += `\tDexFileLoaderErrorCode* error_code = ${args[10]}\n`
                disp += `)`
                this.passDis = disp
            },
            onLeave: function (this: InvocationContext, retval: InvocationReturnValue) {
                // retval: std::unique_ptr<DexFile>
                LOGD(this.passDis)
                LOGD(`retval [std::unique_ptr<DexFile>]: ${retval}`)
                newLine()
            }
        })

    }

}