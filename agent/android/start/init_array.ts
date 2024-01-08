type size_t = NativePointer

export class InitArray {

    static get linkerName(): string {
        return Process.arch == "arm" ? "linker" : "linker64"
    }

    static get init_array_linker(): NativePointer[] {
        const soName: string = InitArray.linkerName
        const init_array_ptr: NativePointer = Process.findModuleByName(soName)
            .enumerateSymbols()
            .filter(s => s.name == ".init_array")
            .map(s => s.address)[0]
        let functions = []
        for (let i = 0; i < 100; i++) {
            let functionPtr: NativePointer = init_array_ptr.add(i * Process.pointerSize).readPointer()
            try {
                functionPtr.readPointer() // Trigger an exception to exit the loop
            } catch {
                break
            }
            if (functionPtr.isNull()) break
            functions.push(functionPtr)
        }
        return functions
    }

    // https://cs.android.com/android/platform/superproject/+/master:bionic/linker/linker_soinfo.cpp;l=698?q=call_constructors&ss=android%2Fplatform%2Fsuperproject
    // __dl__ZNK6soinfo10get_sonameEv
    private static getSoName(soinfo: NativePointer): string {
        return callSym<NativePointer>(
            "__dl__ZNK6soinfo10get_sonameEv", InitArray.linkerName,
            'pointer', ['pointer'],
            soinfo).readCString()
    }

    static cm_include: string = `
    #include <stdio.h>
    #include <gum/gumprocess.h>
    #include <gum/guminterceptor.h>
    `

    static cm_code: string = `
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

    `
    static cm: CModule = null
    static MapMdCalled = new Map<string, number>()

    // https://cs.android.com/android/platform/superproject/+/master:bionic/linker/linker_soinfo.cpp;l=513
    // __dl__ZN6soinfo17call_constructorsEv
    static Hook_CallConstructors(maxDisplayCount: number = 10, showFiniArray: boolean = true, simMdShowOnce: boolean = true) {
        if (Process.arch == "arm") {
            InitArray.cm_code = InitArray.cm_include + "#define __work_around_b_24465209__ 1" + InitArray.cm_code
        } else {
            InitArray.cm_code = InitArray.cm_include + "#define __LP64__ 1" + InitArray.cm_code
        }
        InitArray.cm = new CModule(InitArray.cm_code, {
            get_soName: getSym("__dl__ZNK6soinfo10get_sonameEv", InitArray.linkerName),
            onEnter_call_constructors: new NativeCallback((_ctx: CpuContext, _si: NativePointer, soName: NativePointer, init_array: NativePointer, init_array_count: number, fini_array: NativePointer, fini_array_count: number) => {
                const soNameStr: string = soName.readCString()
                if (simMdShowOnce) {
                    if (InitArray.MapMdCalled.has(soNameStr)) {
                        let count: number = InitArray.MapMdCalled.get(soNameStr)!
                        count++
                        InitArray.MapMdCalled.set(soNameStr, count)
                        return
                    } else {
                        InitArray.MapMdCalled.set(soNameStr, 1)
                    }
                }
                LOGD(`call_constructors soName: ${soNameStr} `)
                if (init_array_count != 0) {
                    LOGD(`\tinit_array: ${init_array} | init_array_count: ${init_array_count}`)
                    let detail: string = ''
                    let loopCount: number = init_array_count > maxDisplayCount ? maxDisplayCount : init_array_count
                    for (let i = 0; i < loopCount; i++) {
                        let funcPtr: NativePointer = init_array.add(i * Process.pointerSize).readPointer()
                        let funcName: string = DebugSymbol.fromAddress(funcPtr).toString()
                        detail += `\t\t${funcName}\n`
                    }
                    detail = detail.substring(0, detail.length - 1)
                    LOGD(`\tinit_array detail: \n${detail}`)
                    if (init_array_count > maxDisplayCount) LOGZ(`\t\t... ${init_array_count - maxDisplayCount} more ...\n`)
                } else {
                    LOGZ(`\tinit_array_count: ${init_array_count}`)
                }
                if (showFiniArray) {
                    if (fini_array_count != 0) {
                        LOGD(`\tfini_array: ${fini_array} | fini_array_count: ${fini_array_count}`)
                        let detail: string = ''
                        let loopCount: number = fini_array_count > maxDisplayCount ? maxDisplayCount : fini_array_count
                        for (let i = 0; i < loopCount; i++) {
                            let funcPtr: NativePointer = fini_array.add(i * Process.pointerSize).readPointer()
                            let funcName: string = DebugSymbol.fromAddress(funcPtr).toString()
                            detail += `\t\t${funcName}\n`
                        }
                        detail = detail.substring(0, detail.length - 1)
                        LOGD(`\tfini_array detail: \n${detail}`)
                        if (fini_array_count > maxDisplayCount) LOGZ(`\t\t... ${fini_array_count - maxDisplayCount} more ...\n`)
                    } else {
                        LOGZ(`\tfini_array_count: ${fini_array_count}`)
                    }
                }
                LOGO(`\n-----------------------------------------------------------\n`)
            }, 'void', ['pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'int'])
        })
        Interceptor.attach(getSym("__dl__ZN6soinfo17call_constructorsEv", InitArray.linkerName), InitArray.cm as NativeInvocationListenerCallbacks)
    }

    static get_init_array_count(soinfo: NativePointer): size_t {
        const func = new NativeFunction(InitArray.cm.get_init_array_count, 'pointer', ['pointer'])
        return func(soinfo) as size_t
    }

    static get_init_array(soinfo: NativePointer): NativePointer[] {
        const func = new NativeFunction(InitArray.cm.get_init_array, 'pointer', ['pointer'])
        const start: NativePointer = func(soinfo) as NativePointer
        const count: number = InitArray.get_init_array_count(soinfo).toUInt32()
        const result: NativePointer[] = []
        for (let i = 0; i < count; i++) {
            result.push(start.add(i * Process.pointerSize).readPointer())
        }
        return result
    }

    static get_fini_array_count(soinfo: NativePointer): size_t {
        const func = new NativeFunction(InitArray.cm.get_fini_array_count, 'pointer', ['pointer'])
        return func(soinfo) as size_t
    }

    static get_fini_array(soinfo: NativePointer): NativePointer[] {
        const func = new NativeFunction(InitArray.cm.get_fini_array, 'pointer', ['pointer'])
        const start: NativePointer = func(soinfo) as NativePointer
        const count: number = InitArray.get_fini_array_count(soinfo).toUInt32()
        const result: NativePointer[] = []
        for (let i = 0; i < count; i++) {
            result.push(start.add(i * Process.pointerSize).readPointer())
        }
        return result
    }
}

declare global {
    var init_array_linker: NativePointer[]
}

globalThis.init_array_linker = InitArray.init_array_linker