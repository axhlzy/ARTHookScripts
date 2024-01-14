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

export interface Subscriber<K, V> {
    onValueChanged: (key: K, value: V) => void
}

export class KeyValueStore<K, V> {
    private static instance: KeyValueStore<any, any>
    private subscribers: Subscriber<K, V>[] = []
    private store: Map<K, V> = new Map()

    private constructor() { }

    public static getInstance<K, V>(): KeyValueStore<K, V> {
        if (!this.instance) {
            this.instance = new KeyValueStore<K, V>()
        }
        return this.instance
    }

    public subscribe(subscriber: Subscriber<K, V>): void {
        this.subscribers.push(subscriber)
    }

    public unsubscribe(subscriber: Subscriber<K, V>): void {
        const index = this.subscribers.indexOf(subscriber)
        if (index !== -1) {
            this.subscribers.splice(index, 1)
        }
    }

    public update(key: K, value: V): void {
        this.store.set(key, value)
        for (const subscriber of this.subscribers) {
            subscriber.onValueChanged(key, value)
        }
    }

    public get(key: K): V | undefined {
        return this.store.get(key)
    }
}

class globalValueStore {

    // filterThreadId
    public static set filterThreadId(value: number) {
        KeyValueStore.getInstance<string, number>().update('filterThreadId', value)
    }

    public static get filterThreadId(): number {
        return KeyValueStore.getInstance<string, number>().get('filterThreadId') || -1
    }

    // filterTimes
    public static set filterTimes(value: number) {
        KeyValueStore.getInstance<string, number>().update('filterTimes', value)
    }

    public static get filterTimes(): number {
        return KeyValueStore.getInstance<string, number>().get('filterTimes') || 5
    }

    // CanUseMterp
    public static set CanUseMterp(value: boolean) {
        KeyValueStore.getInstance<string, boolean>().update('CanUseMterp', value)
    }

    public static get CanUseMterp(): boolean {
        return KeyValueStore.getInstance<string, boolean>().get('CanUseMterp') || false
    }

    // filterMethodName
    public static set filterMethodName(value: string) {
        KeyValueStore.getInstance<string, string>().update('filterMethodName', value)
    }

    public static get filterMethodName(): string {
        return KeyValueStore.getInstance<string, string>().get('filterMethodName') || ""
    }

    // // Interceptors
    // public static get Interceptors(): InvocationListener[] {
    //     return KeyValueStore.getInstance<string, InvocationListener[]>().get('Interceptors') || []
    // }

    // public static set Interceptors(value: InvocationListener[]) {
    //     KeyValueStore.getInstance<string, InvocationListener[]>().update('Interceptors', value)
    // }

}

setImmediate(() => {
    globalValueStore.filterThreadId = -1
    globalValueStore.filterTimes = 5
    globalValueStore.CanUseMterp = false
    globalValueStore.filterMethodName = ''
})

Reflect.set(globalThis, "globalValueStore", globalValueStore)

globalThis.setfilterThreadId = (value: number) => globalValueStore.filterThreadId = value
globalThis.setfilterTimes = (value: number) => globalValueStore.filterTimes = value
globalThis.setCanUseMterp = (value: boolean) => globalValueStore.CanUseMterp = value
globalThis.setfilterMethodName = (value: string) => globalValueStore.filterMethodName = value