import { ArtMethod } from "../implements/10/art/mirror/ArtMethod"

export { }

declare global {
    var pathToArtMethod: (path: string) => ArtMethod | null
}

globalThis.pathToArtMethod = (path: string): ArtMethod | null => {
    const index: number = path.lastIndexOf(".")
    const className: string = path.substring(0, index)
    const methodName: string = path.substring(index + 1)
    let retArtMethod: ArtMethod | null = null
    Java.perform(() => {
        const clazz = Java.use(className)
        const method = clazz[methodName]
        const handle = method.handle
        retArtMethod = new ArtMethod(handle)
    })
    return retArtMethod
}