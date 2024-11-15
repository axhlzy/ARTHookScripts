# 当前测试环境
Pixel XL 
android-10 (aosp)
BUILD_ID=QP1A.191005.007.A3

`_代码中大部分是写死的结构体偏移，不能兼容不同版本的安卓，测试建议用安卓10_`

# 期望目标

根据artmethod指针去得到与之关联的dex源文件，解析dex文件，获取该方法的smali字节码，根据上述打印的代码信息来进行进一步的操作

👇 目前考虑的四种大概可行的smali inline trace方式 👇

0. Use JDB 😀

   REF: [jvmti doc](https://docs.oracle.com/javase/8/docs/platform/jvmti/jvmti.html) | 
   REF: [android source jvmti.h](https://cs.android.com/android/platform/superproject/main/+/main:art/openjdkjvmti/include/jvmti.h;l=1002) | 
   REF: [frida jvmti](https://github.com/frida/frida-java-bridge/blob/a3b0de51451dd38e9dfcbaa1fbc744745bab9579/lib/jvmti.js) | 
   REF: [how to start jdwp thread](https://github.com/axhlzy/Il2CppHookScripts/blob/fe5ea00c7930135246b37333d63c21786c3fe82b/Il2cppHook/agent/plugin/jdwp/jdwp.ts#L257) |
   REF: [jdwp protocol](https://github.com/IOActive/jdwp-shellifier)

2. Use Trace Function 😕

   通过符号以及指令格式的模式匹配定位一些关键的trace函数 
   参考源码 [trace.h](https://android.googlesource.com/platform/art/+/refs/tags/android-10.0.0_r42/runtime/trace.h#107)

3. Inline Hook Smali 😕

   - 解释执行
     
      Invoke static 覆盖原字节码调用（跳转到 Java.registerClass注册的js函数，实际就是native java method 对应一个 nativeFunctionCallback），并保存原字节码，进入新的ArtMethod执行流程后，通过 [`ManagedStack`](https://cs.android.com/android/platform/superproject/+/master:art/runtime/art_method.cc;l=379?q=art_method.cc&ss=android%2Fplatform%2Fsuperproject) 拿到上级 `fragment` 并获取 `ShadowFrame` 等同于获取到了当前java函数执行的上下文, 手动去执行我们覆盖的字节码后, 修改[上一贞](https://cs.android.com/android/platform/superproject/+/master:art/runtime/interpreter/shadow_frame.h;l=440)的[寄存器值](https://cs.android.com/android/platform/superproject/+/master:art/runtime/interpreter/shadow_frame.h;l=211)，然后执行我们自己定义的static函数，通过这个函数就可以拿到上一级的所有信息, 也就是差不多inlinehook了该java函数指定位置的smail， 关于禁止oat [turbodex](https://github.com/asLody/TurboDex/blob/master/project/turbodex/turbodex/src/main/jni/core/FastLoadDex.cpp#L13) (修改dex以后，还有一些dex缓存需要处理) 
     
   - 快速执行(oat模式)
     
      主要工作在于需要解析oat后二进制的符号信息，dump汇编的时候可用借此增加二进制的可读性，至于二进制可行性格式的inlinehook就很普通了

4. 自定义smali解释器
  具体的实现可以参考 [vmInterpret](https://github.com/maoabc/nmmp/blob/master/nmmvm/nmmvm/src/main/cpp/vm/InterpC-portable.cpp#L1065C17-L1065C18)，或者把它移植过来，像qbdi那样导出一些函数用作frida bridge，完全代理系统原有的art smali解释器以获得最佳的流程控制能力以及跨不同版本的安卓代码兼容性

5. node调试执行
   简单的想法是按照frida官网文档中关于调试js/ts的流程为关键js函数下断点 (--runtime=v8 --debug)，但是如果我们使用Intercpter.attach以后，断点下在onEnter或者onLeave中，即实现了类似于调试器断点的感觉，这里涉及到另一个问题，如何像lldb一样进行单步调试，我的想法大致分为两种：
   
   ① 使用 [stalker](https://frida.re/docs/stalker/) CP原汇编并执行
   
   ② 使用 [QBDI](https://github.com/QBDI/QBDI) 完全代理模拟执行
   
   ③ 使用大佬现成的方案 [Dwarf](https://github.com/iGio90/Dwarf)
   
   上述两种调试器方式我们都可以把断点下的更仔细，实现单步执行的效果，但是实测稳定性欠佳
   
   至于 `Dwarf` 我实测也是感觉断点稳定性欠佳
   

---

### 还想做的一些事情

- 处理一些常见的时机
  1. DefineClass
  2. OpenCommon
  3. OpenMemory
     ...

- 处理一些ART运行时的关键函数
  1. ExecuteMterpImpl / ExecuteSwitchImpl - ExecuteSwitchImplCpp
  2. doInvoke
     ...

- 从调用逻辑上来看
   java -> java |
   java -> oat |
   oat -> java |
   oat -> oat |
   java -> native |
   native -> java 

- 中间顺带处理一下dex2oat对dex优化流程的尝试


### 效果图

  ```
   [AOSP on msm8996::com.xxx.xxx ]->  pathToArtMethod("com.unity3d.player.UnityPlayer.addPhoneCallListener").showSmali()
   ↓dex_file↓
   DexFile<0xe8ffe520>
            location: /data/app/com.gzcc.xbzc-s_aRcJlPwvVinch43dmvmw==/base.apk!classes4.dex
            location_checksum: 545562129 ( 0x20849e11 ) is_compact_dex: false
            begin: 0xc771b808 size: 7865800 ( 0x7805c8 ) | data_begin: 0xc771b808 data_size: 7865800 ( 0x7805c8 )
            oat_dex_file_ 0xe8ffe578
   
   👉 0xd1413f7c -> protected void com.unity3d.player.UnityPlayer.addPhoneCallListener()
   quickCode: 0xef450581 -> art_quick_to_interpreter_bridge @ libart.so | jniCode: null | accessFlags: 0x18080004 | size: 0x1c
   
   [  1|0x0  ] 0xc7dcf1ac - 1 - 1210            | const/4 v0, #+1
   [  2|0x2  ] 0xc7dcf1ae - 2 - eb30 0803       | iput-boolean-quick v0, v3, thing@776
   [  3|0x6  ] 0xc7dcf1b2 - 2 - e530 ec02       | iget-object-quick v0, v3, // offset@748
   [  4|0xa  ] 0xc7dcf1b6 - 2 - e531 e402       | iget-object-quick v1, v3, // offset@740
   [  5|0xe  ] 0xc7dcf1ba - 2 - 1302 2000       | const/16 v2, #+32
   [  6|0x12 ] 0xc7dcf1be - 3 - e930 1401 1002  | invoke-virtual-quick {v0, v1, v2},  // vtable@276
   [  7|0x18 ] 0xc7dcf1c4 - 1 - 7300            | return-void-no-barrier

  // 解析 offset@748
  // 解析 vtable@276
   ```



showOatAsm
![showSmali](https://github.com/axhlzy/ARTHookScripts/blob/master/imgs/showOatAsm.png)

showSmali
![showOatAsm](https://github.com/axhlzy/ARTHookScripts/blob/master/imgs/showSmali.png)

dumpDexFiles
![dumpDexFiles](https://github.com/axhlzy/ARTHookScripts/blob/master/imgs/dumpDexFiles.png)

printBackTraceWithSmali
![printBackTraceWithSmali](https://github.com/axhlzy/ARTHookScripts/blob/master/imgs/printBackTraceWithSmali.png)

--- 

# Ref
- [frida-smali-trace](https://github.com/SeeFlowerX/frida-smali-trace)

