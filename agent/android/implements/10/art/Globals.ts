// static constexpr size_t kBitsPerByte = 8;
export const kBitsPerByte: number = 8

// static constexpr size_t kRegistersSizeShift = 12;
export const kRegistersSizeShift: NativePointer = ptr(12)
// static constexpr size_t kInsSizeShift = 8;
export const kInsSizeShift: NativePointer = ptr(8)
// static constexpr size_t kOutsSizeShift = 4;
export const kOutsSizeShift: NativePointer = ptr(4)
// static constexpr size_t kTriesSizeSizeShift = 0;
export const kTriesSizeSizeShift: NativePointer = ptr(0)
// static constexpr uint16_t kFlagPreHeaderRegisterSize = 0x1 << 0;
export const kFlagPreHeaderRegisterSize: NativePointer = ptr(0x1).shl(0)
// static constexpr uint16_t kFlagPreHeaderInsSize = 0x1 << 1;
export const kFlagPreHeaderInsSize: NativePointer = ptr(0x1).shl(1)
// static constexpr uint16_t kFlagPreHeaderOutsSize = 0x1 << 2;
export const kFlagPreHeaderOutsSize: NativePointer = ptr(0x1).shl(2)
// static constexpr uint16_t kFlagPreHeaderTriesSize = 0x1 << 3;
export const kFlagPreHeaderTriesSize: NativePointer = ptr(0x1).shl(3)
// static constexpr uint16_t kFlagPreHeaderInsnsSize = 0x1 << 4;
export const kFlagPreHeaderInsnsSize: NativePointer = ptr(0x1).shl(4)
// static constexpr size_t kInsnsSizeShift = 5;
export const kInsnsSizeShift: number = 5
// static constexpr size_t kInsnsSizeBits = sizeof(uint16_t) * kBitsPerByte -  kInsnsSizeShift;
export const kInsnsSizeBits: number = (16 * (kBitsPerByte)) - (kInsnsSizeShift)


export const Arch = Process.arch
export const PointerSize = Process.pointerSize