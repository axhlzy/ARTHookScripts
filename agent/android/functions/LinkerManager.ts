import { callSym, getSym } from "../Utils/SymHelper"

type size_t = NativePointer

export class linkerManager {

  public static get linkerName(): string {
    return Process.arch == "arm" ? "linker" : "linker64"
  }

  public static get linkerPath(): string {
    return Process.findModuleByName(linkerManager.linkerName).path
  }

  // static inline void call_array(const char* array_name, F* functions, size_t count, bool reverse, const char* realpath)
  // https://cs.android.com/android/platform/superproject/+/master:bionic/linker/linker_soinfo.cpp;l=485
  public static get call_array_address(): NativePointer {
    try {
      return getSym("__dl__ZL10call_arrayIPFviPPcS1_EEvPKcPT_jbS5_", linkerManager.linkerName)
    } catch (error) {
      // LOGE(error)
      return NULL
    }
  }

  // static void call_function(const char* function_name, linker_ctor_function_t function, const char* realpath)
  // ref https://cs.android.com/android/platform/superproject/+/master:bionic/linker/linker_soinfo.cpp;l=460
  public static get call_function_address(): NativePointer {
    try {
      return getSym("__dl__ZL13call_functionPKcPFviPPcS2_ES0_", linkerManager.linkerName)
    } catch (error) {
      // LOGE(error)
      return NULL
    }
  }

  // https://cs.android.com/android/platform/superproject/+/master:bionic/linker/linker_soinfo.cpp;l=698?q=call_constructors&ss=android%2Fplatform%2Fsuperproject
  // __dl__ZNK6soinfo10get_sonameEv
  public static getSoName(soinfo: NativePointer): string {
    return callSym<NativePointer>(
      "__dl__ZNK6soinfo10get_sonameEv", linkerManager.linkerName,
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
  static soLoadCallbacks: Map<string, Function[]> = new Map()

  public static addOnSoLoadCallback(soName:string, call:Function) {
    if (this.soLoadCallbacks.has(soName)) {
      this.soLoadCallbacks.get(soName).push(call)
    } else {
      this.soLoadCallbacks.set(soName, [call])
    } 
  }

  // https://cs.android.com/android/platform/superproject/+/master:bionic/linker/linker_soinfo.cpp;l=513
  // __dl__ZN6soinfo17call_constructorsEv
  public static Hook_CallConstructors(maxDisplayCount: number = 10, showFiniArray: boolean = true, simMdShowOnce: boolean = true) {
    if (Process.arch == "arm") {
      linkerManager.cm_code = linkerManager.cm_include + "#define __work_around_b_24465209__ 1" + linkerManager.cm_code
    } else {
      linkerManager.cm_code = linkerManager.cm_include + "#define __LP64__ 1" + linkerManager.cm_code
    }
    linkerManager.cm = new CModule(linkerManager.cm_code, {
      get_soName: getSym("__dl__ZNK6soinfo10get_sonameEv", linkerManager.linkerName),
      onEnter_call_constructors: new NativeCallback((_ctx: CpuContext, _si: NativePointer, soName: NativePointer, init_array: NativePointer, init_array_count: number, fini_array: NativePointer, fini_array_count: number) => {
        const str_soName: string = soName.readCString()
        const md = Process.findModuleByName(str_soName)
        if (this.soLoadCallbacks.has(str_soName)) this.soLoadCallbacks.get(str_soName).forEach(call=>call(md))
        if (simMdShowOnce) {
          if (linkerManager.MapMdCalled.has(str_soName)) {
            let count: number = linkerManager.MapMdCalled.get(str_soName)!
            count++
            linkerManager.MapMdCalled.set(str_soName, count)
            return
          } else {
            linkerManager.MapMdCalled.set(str_soName, 1)
          }
        }
        LOGD(`call_constructors soName: ${str_soName} `)
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
    Interceptor.attach(getSym("__dl__ZN6soinfo17call_constructorsEv", linkerManager.linkerName),
      linkerManager.cm as NativeInvocationListenerCallbacks)
  }

  public static get_init_array_count(soinfo: NativePointer): size_t {
    const func = new NativeFunction(linkerManager.cm.get_init_array_count, 'pointer', ['pointer'])
    return func(soinfo) as size_t
  }

  public static get_init_array(soinfo: NativePointer): NativePointer[] {
    const func = new NativeFunction(linkerManager.cm.get_init_array, 'pointer', ['pointer'])
    const start: NativePointer = func(soinfo) as NativePointer
    const count: number = linkerManager.get_init_array_count(soinfo).toUInt32()
    const result: NativePointer[] = []
    for (let i = 0; i < count; i++) {
      result.push(start.add(i * Process.pointerSize).readPointer())
    }
    return result
  }

  public static get_fini_array_count(soinfo: NativePointer): size_t {
    const func = new NativeFunction(linkerManager.cm.get_fini_array_count, 'pointer', ['pointer'])
    return func(soinfo) as size_t
  }

  public static get_fini_array(soinfo: NativePointer): NativePointer[] {
    const func = new NativeFunction(linkerManager.cm.get_fini_array, 'pointer', ['pointer'])
    const start: NativePointer = func(soinfo) as NativePointer
    const count: number = linkerManager.get_fini_array_count(soinfo).toUInt32()
    const result: NativePointer[] = []
    for (let i = 0; i < count; i++) {
      result.push(start.add(i * Process.pointerSize).readPointer())
    }
    return result
  }
}

globalThis.linkerName = linkerManager.linkerName
globalThis.linkerPath = linkerManager.linkerPath
globalThis.call_array_address = linkerManager.call_array_address
globalThis.call_function_address = linkerManager.call_function_address
 

declare global {
  var linkerName: string
  var linkerPath: string
  var call_array_address: NativePointer
  var call_function_address: NativePointer
}