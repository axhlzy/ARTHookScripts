interface VirtualClassType {
    offset: number,
    get Virtual(): number
}

interface SizeOfClass {
    get SizeOfClass(): number
    get CurrentHandle(): NativePointer
    get VirtualClassOffset(): number
}