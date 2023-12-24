globalThis.clear = () => console.log('\x1Bc')

globalThis.cls = () => clear()

globalThis.seeHexA = (addr: NativePointer | number, length: number = 0x40, header: boolean = true, color: any | undefined) => {
    let localAddr: NativePointer = NULL
    if (typeof addr == "number") {
        localAddr = ptr(addr)
    } else {
        localAddr = addr
    }
    LOG(hexdump(localAddr, {
        length: length,
        header: header,
    }), color == undefined ? LogColor.WHITE : color)
}

declare global {
    var clear: () => void
    var cls: () => void
    var seeHexA: (addr: NativePointer, length?: number, header?: boolean, color?: any | undefined) => void
}

export { }