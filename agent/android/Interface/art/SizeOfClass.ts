interface SizeOfClass {
    get SizeOfClass(): number // return sizeof this class struct
    get CurrentHandle(): NativePointer  // offset start base parent class
    get VirtualClassOffset(): number // return 0 means not virtual class else return PointerSize
    get VirtualTableList(): NativePointer[] // return virtual table list
}