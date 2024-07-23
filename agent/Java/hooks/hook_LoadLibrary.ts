export const hookJavaLoadLibrary = () => {
    Java.perform(() => {
        const SystemClass = Java.use('java.lang.System')
        SystemClass.loadLibrary.implementation = function(library) {
            console.log('Loading library:' + library)
            const result = this.loadLibrary(library)
            return result
        }
    })
}