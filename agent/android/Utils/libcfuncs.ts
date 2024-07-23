import { PointerSize } from "../implements/10/art/Globals"
import { SIGNAL } from "../../Java/Theads"
import { SYSCALL } from "./syscalls"

export type pid_t = number
export type int = number
export type uint = number
export type long = number
export type pthread_t = long | NativePointerValue

export type uint32_t = number
// typedef uint32_t __useconds_t;
export type __useconds_t = uint32_t
// typedef __useconds_t useconds_t;
export type useconds_t = __useconds_t

// typedef struct {
//     uint32_t flags;
//     void* stack_base;
//     size_t stack_size;
//     size_t guard_size;
//     int32_t sched_policy;
//     int32_t sched_priority;
//   #ifdef __LP64__
//     char __reserved[16];
//   #endif
//   } pthread_attr_t;
export class pthread_attr_t {

    mPtr: NativePointer
    flags: number // 0x4
    stack_base: NativePointer // 0x8
    stack_size: number // 0x8
    guard_size: number // 0x8
    sched_policy: number // 0x4
    sched_priority: number // 0x4

    private flags_a: NativePointer
    private stack_base_a: NativePointer
    private stack_size_a: NativePointer
    private guard_size_a: NativePointer
    private sched_policy_a: NativePointer
    private sched_priority_a: NativePointer

    constructor(ptr: NativePointer) {
        if (ptr.isNull()) {
            this.mPtr = NULL
            this.flags = 0
            this.stack_base = NULL
            this.stack_size = 0
            this.guard_size = 0
            this.sched_policy = 0
            this.sched_priority = 0
        } else {
            this.mPtr = ptr
            this.flags_a = ptr
            this.stack_base_a = this.flags_a.add(0x4)
            this.stack_size_a = this.stack_base_a.add(PointerSize)
            this.guard_size_a = this.stack_size_a.add(PointerSize)
            this.sched_policy_a = this.guard_size_a.add(PointerSize)
            this.sched_priority_a = this.sched_policy_a.add(0x4)

            this.flags = this.flags_a.readU32()
            this.stack_base = this.stack_base_a.readPointer()
            this.stack_size = this.stack_size_a.readU32()
            this.guard_size = this.guard_size_a.readU32()
            this.sched_policy = this.sched_policy_a.readS32()
            this.sched_priority = this.sched_priority_a.readS32()
        }
    }

    toStringComplex(){
        return `pthread_attr_t { flags=${this.flags}, stack_base=${this.stack_base}, stack_size=${this.stack_size}, guard_size=${this.guard_size}, sched_policy=${this.sched_policy}, sched_priority=${this.sched_priority} }`
    }

    toString(){
        if (this.mPtr.isNull()) return "{ NULL }"
        return `{ f=${this.flags}, sb=${this.stack_base}, ss=${this.stack_size}, gs=${this.guard_size}, s_policy=${this.sched_policy}, s_priority=${this.sched_priority} }`
    }
}

export class libC {

    public static malloc(size: number): NativePointer {
        return Memory.alloc(size)
    }

    // unsigned int sleep(unsigned int __seconds);
    public static sleep(s: uint): uint {
        const sleep_f = new NativeFunction(Module.findExportByName("libc.so", 'sleep'), 'int', ['int'])
        return sleep_f(s) as uint
    }

    // int usleep(useconds_t __microseconds);
    public static usleep(ms: useconds_t): int {
        const usleep_f = new NativeFunction(Module.findExportByName("libc.so", 'usleep'), 'int', ['int'])
        return usleep_f(ms) as int
    }

    // int pause(void);
    public static pause(): int {
        const pause_f = new NativeFunction(Module.findExportByName("libc.so", 'pause'), 'int', [])
        return pause_f() as int
    }

    // long syscall(long __number, ...);
    public static syscall(__number: SYSCALL, ...value: NativePointer[]): long {
        const syscall_f = new NativeFunction(Module.findExportByName("libc.so", 'syscall'), 'int', ['int', ...'pointer'])
        LOGD(`called syscall ( ${SYSCALL[__number]}, ${value} )`)
        return syscall_f(__number, value) as long
    }

    // int brk(void* _Nonnull __addr);
    public static brk(addr: NativePointer): int {
        const brk_f = new NativeFunction(Module.findExportByName("libc.so", 'brk'), 'int', ['pointer'])
        return brk_f(addr) as int
    }

    // ps1 -> adb shell kill -SIGSTOP $(adb shell pidof com.xxx.xxx)
    // ps1 -> adb shell kill -SIGCONT $(adb shell pidof com.xxx.xxx)
    // int raise(int __signal);
    public static raise = (sign: SIGNAL | int = SIGNAL.SIGSTOP): int => {
        const raise = new NativeFunction(Module.findExportByName("libc.so", 'raise')!, 'int', ['int'])
        return raise(sign) as int
    }

    // int kill(pid_t __pid, int __signal);
    public static kill(pid: pid_t, sign: SIGNAL | int = SIGNAL.SIGSTOP): number {
        const kill = new NativeFunction(Module.findExportByName("libc.so", 'kill')!, 'int', ['int', 'int'])
        return kill(pid, sign) as int
    }

    // int pthread_kill(pthread_t __pthread, int __signal);
    public static pthread_kill(pid: pid_t, sign: SIGNAL | int = SIGNAL.SIGSTOP): int {
        const pthread_kill = new NativeFunction(Module.findExportByName("libc.so", 'pthread_kill')!, 'int', ['int', 'int'])
        return pthread_kill(pid, sign) as int
    }

    // __noreturn void exit(int __status);
    public static exit(status: int): void {
        const exit = new NativeFunction(Module.findExportByName("libc.so", 'exit')!, 'void', ['int'])
        exit(status)
    }

    // pid_t  fork(void);
    public static fork(): pid_t {
        const fork = new NativeFunction(Module.findExportByName("libc.so", 'fork')!, 'int', [])
        return fork() as pid_t
    }

    // pid_t  gettid(void) __attribute_const__;
    public static gettid(): pid_t {
        const gettid = new NativeFunction(Module.findExportByName("libc.so", 'gettid')!, 'int', [])
        return gettid() as pid_t
    }

    // pid_t  getpid(void);
    public static getpid(): pid_t {
        const getpid = new NativeFunction(Module.findExportByName("libc.so", 'getpid')!, 'int', [])
        return getpid() as pid_t
    }

    // pid_t  getppid(void);
    public static getppid(): pid_t {
        const getppid = new NativeFunction(Module.findExportByName("libc.so", 'getppid')!, 'int', [])
        return getppid() as pid_t
    }

    // uid_t getuid(void);
    public static getuid(): pid_t {
        const getuid = new NativeFunction(Module.findExportByName("libc.so", 'getuid')!, 'int', [])
        return getuid() as pid_t
    }

    // gid_t getgid(void);
    public static getgid(): pid_t {
        const getgid = new NativeFunction(Module.findExportByName("libc.so", 'getgid')!, 'int', [])
        return getgid() as pid_t
    }

    // void* _Nullable calloc(size_t __item_count, size_t __item_size) __mallocfunc __BIONIC_ALLOC_SIZE(1,2) __wur;
    public static calloc(num: number, size: number): NativeReturnValue {
        const calloc = new NativeFunction(Module.findExportByName("libc.so", 'calloc')!, 'pointer', ['int', 'int'])
        return calloc(num, size)
    }

    // void free(void* _Nullable __ptr);
    public static free(ptr: NativePointer): void {
        const free = new NativeFunction(Module.findExportByName("libc.so", 'free')!, 'void', ['pointer'])
        free(ptr)
    }

    // char* _Nullable getenv(const char* _Nonnull __name);
    public static getenv(name: string): string | null {
        const getenv = new NativeFunction(Module.findExportByName("libc.so", 'getenv')!, 'pointer', ['pointer'])
        try {
            return ptr(getenv(Memory.allocUtf8String(name)) as number).readUtf8String()
        } catch (error) {
            return null
        }
    }

    // const char* _Nullable getprogname(void) __INTRODUCED_IN(21);
    public static getprogname(): string | null {
        const getprogname = new NativeFunction(Module.findExportByName("libc.so", 'getprogname')!, 'pointer', [])
        try {
            return ptr(getprogname() as number).readUtf8String()
        } catch (error) {
            return null
        }
    }


}
