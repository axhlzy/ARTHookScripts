/**
    #define SIGHUP 1
    #define SIGINT 2
    #define SIGQUIT 3
    #define SIGILL 4
    #define SIGTRAP 5
    #define SIGABRT 6
    #define SIGIOT 6
    #define SIGBUS 7
    #define SIGFPE 8
    #define SIGKILL 9
    #define SIGUSR1 10
    #define SIGSEGV 11
    #define SIGUSR2 12
    #define SIGPIPE 13
    #define SIGALRM 14
    #define SIGTERM 15
    #define SIGSTKFLT 16
    #define SIGCHLD 17
    #define SIGCONT 18
    #define SIGSTOP 19
    #define SIGTSTP 20
    #define SIGTTIN 21
    #define SIGTTOU 22
    #define SIGURG 23
    #define SIGXCPU 24
    #define SIGXFSZ 25
    #define SIGVTALRM 26
    #define SIGPROF 27
    #define SIGWINCH 28
    #define SIGIO 29
    #define SIGPOLL SIGIO
    #define SIGPWR 30
    #define SIGSYS 31
    #define SIGUNUSED 31
    #define __SIGRTMIN 32
 */
export enum SIGNAL {
    SIGHUP = 1,
    SIGINT = 2,
    SIGQUIT = 3,
    SIGILL = 4,
    SIGTRAP = 5,
    SIGABRT = 6,
    SIGIOT = 6,
    SIGBUS = 7,
    SIGFPE = 8,
    SIGKILL = 9,
    SIGUSR1 = 10,
    SIGSEGV = 11,
    SIGUSR2 = 12,
    SIGPIPE = 13,
    SIGALRM = 14,
    SIGTERM = 15,
    SIGSTKFLT = 16,
    SIGCHLD = 17,
    SIGCONT = 18,
    SIGSTOP = 19,
    SIGTSTP = 20,
    SIGTTIN = 21,
    SIGTTOU = 22,
    SIGURG = 23,
    SIGXCPU = 24,
    SIGXFSZ = 25,
    SIGVTALRM = 26,
    SIGPROF = 27,
    SIGWINCH = 28,
    SIGIO = 29,
    SIGPOLL = 29,
    SIGPWR = 30,
    SIGSYS = 31,
    SIGUNUSED = 31,
    __SIGRTMIN = 32,
}

globalThis.readProcStatus = (tid?: number): string => {
    const statusPath = `/proc/${tid == undefined ? 'self' : tid}/status`
    const fopenFunc = new NativeFunction(Module.findExportByName("libc.so", 'fopen')!, 'pointer', ['pointer', 'pointer'])
    const fopen = fopenFunc(Memory.allocUtf8String(statusPath), Memory.allocUtf8String('r'))
    const freadFunc = new NativeFunction(Module.findExportByName("libc.so", 'fread')!, 'int', ['pointer', 'size_t', 'size_t', 'pointer'])
    const buf: NativePointer = Memory.alloc(0x1000)
    const _fread = freadFunc(buf, 1, 0x1000, fopen)
    const fcloseFunc = new NativeFunction(Module.findExportByName("libc.so", 'fclose')!, 'int', ['pointer'])
    const _fclose = fcloseFunc(fopen) as number
    // (Java as any).api.$delete(buf)
    return buf.readCString()
}

globalThis.readProcTasks = (): string[] => {
    const taskPath = '/proc/self/task'

    const opendirFunc = new NativeFunction(Module.findExportByName('libc.so', 'opendir')!, 'pointer', ['pointer'])
    const readdirFunc = new NativeFunction(Module.findExportByName('libc.so', 'readdir')!, 'pointer', ['pointer'])

    const dir: NativePointer = opendirFunc(Memory.allocUtf8String(taskPath)) as NativePointer
    if (dir.isNull()) {
        console.error('Failed to open directory:', taskPath)
        return []
    }
    const files: string[] = []
    try {
        // 读取目录项
        let entry = readdirFunc(dir) as NativePointer
        while (!entry.isNull()) {
            const fileName = entry.readCString()
            if (fileName !== '.' && fileName !== '..') {
                files.push(fileName)
            }
            entry = readdirFunc(dir) as NativePointer
        }
    } finally {
        // Memory.writeInt(dir, 0)
        dir.writePointer(NULL)
    }
    return files
};


globalThis.getValueFromStatus = (key: string, tid?: number): string => {
    let status: string = readProcStatus(tid)
    let reg = new RegExp(key + ".*", "g")
    let result = status.match(reg)
    if (result == null) return "unknown"
    return result[0].split(":")[1].trim()
}

function getThreadName(tid: number) {
    let threadName: string = getValueFromStatus("Name", tid)

    // try {
    //     const file = new File("/proc/self/task/" + tid + "/comm", "r")
    //     threadName = (file as any).readLine().toString().trimEnd()
    //     file.close()
    // } catch (e) { throw e }

    // var threadNamePtr: NativePointer = Memory.alloc(0x40)
    // var tid_p: NativePointer = Memory.alloc(PointerSize).writePointer(ptr(tid))
    // var pthread_getname_np = new NativeFunction(Module.findExportByName("libc.so", 'pthread_getname_np')!, 'int', ['pointer', 'pointer', 'int'])
    // pthread_getname_np(ptr(tid), threadNamePtr, 0x40)
    // threadName = threadNamePtr.readCString()!

    return threadName
}

// Java.scheduleOnMainThread(()=>{LOGD(currentThreadName())})
// Java.perform(()=>{LOGD(currentThreadName())})
globalThis.currentThreadName = (): string => {
    let tid = Process.getCurrentThreadId()
    return getThreadName(tid).toString()
}

// raise 以后当前进程所有线程都被暂停了，所以只能使用gdb llvm 或者是使用其他的方式(adb)恢复
// ps1 -> adb shell kill -SIGSTOP $(adb shell pidof com.xxx.xxx)
// ps1 -> adb shell kill -SIGCONT $(adb shell pidof com.xxx.xxx)
globalThis.raise = (sign: SIGNAL = SIGNAL.SIGSTOP): number => {
    const raise = new NativeFunction(Module.findExportByName("libc.so", 'raise')!, 'int', ['int'])
    return raise(sign) as number
}

globalThis.listThreads = (maxCountThreads: number = 20) => {
    let index_threads: number = 0
    let current = Process.getCurrentThreadId()
    Process.enumerateThreads()
        .sort((a, b) => b.id - a.id)
        .slice(0, maxCountThreads)
        .forEach((thread: ThreadDetails) => {
            let indexText = `[${++index_threads}]`.padEnd(6, " ")
            let text = `${indexText} ${thread.id} ${thread.state} | ${getThreadName(thread.id)}`
            // let ctx = thread.context
            current == thread.id ? LOGE(text) : LOGD(text)
        })
}

declare global {
    var currentThreadName: () => string
    var raise: (sign?: SIGNAL) => number
    var listThreads: (maxCountThreads?: number) => void
    var readProcStatus: (tid?: number) => string
    var readProcTasks: () => string[]
    var getValueFromStatus: (key: string, tid?: number) => string
}