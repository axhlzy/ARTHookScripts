function getApplication(): Java.Wrapper {
    let application: Java.Wrapper = null
    Java.perform(function () {
        application = Java.use("android.app.ActivityThread").currentApplication()
    })
    return application
}

function getPackageName(): string {
    let packageName: string = ''
    Java.perform(function () {
        let currentApplication = Java.use("android.app.ActivityThread").currentApplication()
        packageName = currentApplication.getApplicationContext().getPackageName()
    })
    return packageName
}

function getCacheDir(): string {
    let path: string = ''
    Java.perform(function () {
        let currentApplication = Java.use("android.app.ActivityThread").currentApplication()
        path = currentApplication.getApplicationContext().getCacheDir().getPath()
    })
    return path
}

function getFilesDir(): string {
    let path: string = ''
    Java.perform(function () {
        let currentApplication = Java.use("android.app.ActivityThread").currentApplication()
        path = currentApplication.getApplicationContext().getFilesDir().getPath()
    })
    return path
}

declare global {
    var getApplication: () => Java.Wrapper
    var getPackageName: () => string
    var getCacheDir: () => string
    var getFilesDir: () => string
}

globalThis.getApplication = getApplication
globalThis.getPackageName = getPackageName
globalThis.getCacheDir = getCacheDir
globalThis.getFilesDir = getFilesDir

export { }