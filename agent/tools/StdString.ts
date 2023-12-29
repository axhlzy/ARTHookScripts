import { PointerSize } from "../android/implements/10/art/Globals"

export class StdString {

    private static STD_STRING_SIZE = 3 * Process.pointerSize

    handle: NativePointer

    constructor(mPtr: NativePointer = Memory.alloc(StdString.STD_STRING_SIZE)) {
        this.handle = mPtr
    }

    private dispose(): void {
        const [data, isTiny] = this._getData()
        if (!isTiny) (Java as any).api.$delete(data)
    }

    static fromPointer(ptrs: NativePointer): string {
        return StdString.fromPointers([ptrs, ptrs.add(PointerSize), ptrs.add(PointerSize * 2)])
    }

    static fromPointers(ptrs: NativePointer[]): string {
        if (ptrs.length != 3) return ''
        return StdString.fromPointersRetInstance(ptrs).disposeToString()
    }

    static fromPointersRetInstance(ptrs: NativePointer[]): StdString {
        if (ptrs.length != 3) return new StdString()
        const stdString = new StdString()
        stdString.handle.writePointer(ptrs[0])
        stdString.handle.add(Process.pointerSize).writePointer(ptrs[1])
        stdString.handle.add(2 * Process.pointerSize).writePointer(ptrs[2])
        return stdString
    }

    disposeToString(): string {
        const result = this.toString()
        this.dispose()
        return result
    }

    toString(): string {
        const data: NativePointer = this._getData()[0] as NativePointer
        return data.readCString()
    }

    private _getData(): [NativePointer, boolean] {
        const str = this.handle
        const isTiny = (str.readU8() & 1) === 0
        const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer()
        return [data, isTiny]
    }
}

Reflect.set(globalThis, 'StdString', StdString)