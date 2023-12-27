
# 期望目标

- 根据artmethod指针去得到与之关联的dex源文件，解析dex文件，获取该方法的smali字节码，根据上述打印的代码信息来进行进一步的操作，smali inline hook ↓目前想到的两种大概可行的smali inline trace方式
参考源码 [trace.h](https://android.googlesource.com/platform/art/+/refs/tags/android-10.0.0_r42/runtime/trace.h#107)

- 通过符号以及指令格式的模式匹配定
位一些关键的trace函数 
Inlinehook smali 
1. 解释执行
   Invoke static 覆盖原字节码调用，并保存原字节码，进入新的shadowframe后，通过贞管理器拿到上级贞手动去执行我们覆盖的字节码后，修改上一贞的寄存器值，然后执行我们自己定义的static函数，通过这个函数就可以拿到上一级的所有信息(这里需要去实现一个JAVA贞回溯)
2. 快速执行(oat模式)
   需要解析oat后二进制的符号信息，增加二进制的可读性，至于二进制可行性格式的inlinehook就很普通了


