# 当前测试环境
Pixel XL 
android-10 (aosp)
BUILD_ID=QP1A.191005.007.A3

# 期望目标

根据artmethod指针去得到与之关联的dex源文件，解析dex文件，获取该方法的smali字节码，根据上述打印的代码信息来进行进一步的操作

👇 目前考虑的两种大概可行的smali inline trace方式 👇

1. Use Trace Function 😕

   通过符号以及指令格式的模式匹配定位一些关键的trace函数 
   参考源码 [trace.h](https://android.googlesource.com/platform/art/+/refs/tags/android-10.0.0_r42/runtime/trace.h#107)

3. Inline Hook Smali 😕

   - 解释执行
      Invoke static 覆盖原字节码调用（跳转到 Java.registerClass注册的js函数，实际就是native java method 对应一个 nativeFunctionCallback），并保存原字节码，进入新的ArtMethod执行流程后，通过 [`ManagedStack`](https://cs.android.com/android/platform/superproject/+/master:art/runtime/art_method.cc;l=379?q=art_method.cc&ss=android%2Fplatform%2Fsuperproject) 拿到上级 `fragment` 并获取 `ShadowFrame` 等同于获取到了当前java函数执行的上下文, 手动去执行我们覆盖的字节码后, 修改[上一贞](https://cs.android.com/android/platform/superproject/+/master:art/runtime/interpreter/shadow_frame.h;l=440)的[寄存器值](https://cs.android.com/android/platform/superproject/+/master:art/runtime/interpreter/shadow_frame.h;l=211)，然后执行我们自己定义的static函数，通过这个函数就可以拿到上一级的所有信息, 也就是差不多inlinehook了该java函数指定位置的smail
   - 快速执行(oat模式)
      主要工作在于需要解析oat后二进制的符号信息，dump汇编的时候可用借此增加二进制的可读性，至于二进制可行性格式的inlinehook就很普通了


