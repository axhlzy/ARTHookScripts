// enum InvokeType : uint32_t {
//     kStatic,       // <<static>>
//     kDirect,       // <<direct>>
//     kVirtual,      // <<virtual>>
//     kSuper,        // <<super>>
//     kInterface,    // <<interface>>
//     kPolymorphic,  // <<polymorphic>>
//     kCustom,       // <<custom>>
//     kMaxInvokeType = kCustom
//   };
export class InvokeType {

    static kStatic = 0
    static kDirect = 1
    static kVirtual = 2
    static kSuper = 3
    static kInterface = 4
    static kPolymorphic = 5
    static kCustom = 6
    static kMaxInvokeType = 6

    static toString(type: number): string {
        switch (type) {
            case InvokeType.kStatic:
                return "kStatic"
            case InvokeType.kDirect:
                return "kDirect"
            case InvokeType.kVirtual:
                return "kVirtual"
            case InvokeType.kSuper:
                return "kSuper"
            case InvokeType.kInterface:
                return "kInterface"
            case InvokeType.kPolymorphic:
                return "kPolymorphic"
            case InvokeType.kCustom:
                return "kCustom"
            case InvokeType.kMaxInvokeType:
                return "kMaxInvokeType"
            default:
                return "unknown"
        }
    }
}