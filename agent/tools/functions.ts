export function demangleName(expName: string) {
    let demangleAddress: NativePointer | null = Module.findExportByName("libc++.so", '__cxa_demangle')
    if (demangleAddress == null) demangleAddress = Module.findExportByName("libunwindstack.so", '__cxa_demangle')
    if (demangleAddress == null) demangleAddress = Module.findExportByName("libbacktrace.so", '__cxa_demangle')
    if (demangleAddress == null) demangleAddress = Module.findExportByName(null, '__cxa_demangle')
    if (demangleAddress == null) throw Error("can not find export function -> __cxa_demangle")
    let demangle: Function = new NativeFunction(demangleAddress, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'])
    let mangledName: NativePointer = Memory.allocUtf8String(expName)
    let outputBuffer: NativePointer = NULL
    let length: NativePointer = NULL
    let status: NativePointer = Memory.alloc(Process.pageSize)
    let result: NativePointer = demangle(mangledName, outputBuffer, length, status) as NativePointer
    if (status.readInt() === 0) {
        let resultStr: string | null = result.readUtf8String()
        return (resultStr == null || resultStr == expName) ? "" : resultStr
    } else return ""
}

export const demangleName_onlyFunctionName = (expName: string): string[] => demangleName(expName).split("::").map(item => item.split("(")[0])

globalThis.demangleName = demangleName

declare global {
    var demangleName: (expName: string) => string
}