export class StdString {

    private static STD_STRING_SIZE = 3 * Process.pointerSize

    handle: NativePointer

    constructor(mPtr: NativePointer = Memory.alloc(StdString.STD_STRING_SIZE)) {
        this.handle = mPtr
    }

    dispose() {
        const [data, isTiny] = this._getData();
        if (!isTiny) {
            (Java as any).api.$delete(data);
        }
    }

    disposeToString() {
        const result = this.toString()
        this.dispose()
        return result
    }

    toString() {
        const data: NativePointer = this._getData()[0] as NativePointer
        return data.readUtf8String()
    }

    _getData() {
        const str = this.handle
        const isTiny = (str.readU8() & 1) === 0
        const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer()
        return [data, isTiny]
    }
}

declare global {
    var StdString: any
}

globalThis.StdString = StdString