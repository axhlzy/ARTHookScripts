// jetbrains://clion/navigate/reference?project=libart&path=~/bin/aosp/art/libdexfile/dex/modifiers.h
export class ArtModifiers {

    static kAccPublic = 0x0001;  // class, field, method, ic
    static kAccPrivate = 0x0002;  // field, method, ic
    static kAccProtected = 0x0004;  // field, method, ic
    static kAccStatic = 0x0008;  // field, method, ic
    static kAccFinal = 0x0010;  // class, field, method, ic
    static kAccSynchronized = 0x0020;  // method (only allowed on natives)
    static kAccSuper = 0x0020;  // class (not used in dex)
    static kAccVolatile = 0x0040;  // field
    static kAccBridge = 0x0040;  // method (1.5)
    static kAccTransient = 0x0080;  // field
    static kAccVarargs = 0x0080;  // method (1.5)
    static kAccNative = 0x0100;  // method
    static kAccInterface = 0x0200;  // class, ic
    static kAccAbstract = 0x0400;  // class, method, ic
    static kAccStrict = 0x0800;  // method
    static kAccSynthetic = 0x1000;  // class, field, method, ic
    static kAccAnnotation = 0x2000;  // class, ic (1.5)
    static kAccEnum = 0x4000;  // class, field, ic (1.5)

    static kAccJavaFlagsMask = 0xffff;  // bits set from Java sources (low 16)

    static kAccConstructor = 0x00010000;  // method (dex only) <(cl)init>
    static kAccDeclaredSynchronized = 0x00020000;  // method (dex only)
    static kAccClassIsProxy = 0x00040000;  // class  (dex only)
    // Set to indicate that the ArtMethod is obsolete and has a different DexCache + DexFile from its

    // declaring class. This flag may only be applied to methods.
    static kAccObsoleteMethod = 0x00040000;  // method (runtime)
    // Used by a method to denote that its execution does not need to go through slow path interpreter.
    static kAccSkipAccessChecks = 0x00080000;  // method (runtime, not native)
    // Used by a class to denote that the verifier has attempted to check it at least once.
    static kAccVerificationAttempted = 0x00080000;  // class (runtime)
    static kAccSkipHiddenapiChecks = 0x00100000;  // class (runtime)
    // This is set by the class linker during LinkInterfaceMethods. It is used by a method to represent
    // that it was copied from its declaring class into another class. All methods marked kAccMiranda
    // and kAccDefaultConflict will have this bit set. Any kAccDefault method contained in the methods_
    // array of a concrete class will also have this bit set.
    static kAccCopied = 0x00100000;  // method (runtime)

    // ...

    public static PrettyAccessFlags = (access_flags: NativePointer | number): string => {
        let access_flags_local: NativePointer = NULL
        if (typeof access_flags === "number") {
            access_flags_local = ptr(access_flags)
        } else {
            access_flags_local = access_flags
        }
        if (access_flags_local.isNull()) throw new Error("access_flags is null")
        let result: string = ""
        if (!(access_flags_local.and(ArtModifiers.kAccPublic)).isNull()) {
            result += "public "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccProtected)).isNull()) {
            result += "protected "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccPrivate)).isNull()) {
            result += "private "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccFinal)).isNull()) {
            result += "final "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccStatic)).isNull()) {
            result += "static "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccAbstract)).isNull()) {
            result += "abstract "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccInterface)).isNull()) {
            result += "interface "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccTransient)).isNull()) {
            result += "transient "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccVolatile)).isNull()) {
            result += "volatile "
        }
        if (!(access_flags_local.and(ArtModifiers.kAccSynchronized)).isNull()) {
            result += "synchronized "
        }
        return result
    }
}

declare global {
    var ArtModifiers: any
    var PrettyAccessFlags: (access_flags: NativePointer | number) => string
}

globalThis.ArtModifiers = ArtModifiers
globalThis.PrettyAccessFlags = (access_flags: NativePointer | number) => ArtModifiers.PrettyAccessFlags(access_flags)