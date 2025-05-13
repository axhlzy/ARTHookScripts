import { ArtMethod } from "../android/implements/10/art/mirror/ArtMethod"

// 记录一下当前遍历出来的class便于直接使用index选择
const arrayCurrentClassItems: string[] = []

interface JavaMembers {
    methods: Java.Method[]
    fields: Java.Field[]
    fields_name: string[]
}

var loaders = []
export function getJavaMembersFromClass(className: string = "com.unity3d.player.UnityPlayer"): JavaMembers {

    const ar_methods: Java.Method[] = []
    const ar_fields: Java.Field[] = []
    const ar_fields_name: string[] = []

    if (loaders.length == 0) {
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                loaders.push(loader)
            },
            onComplete: function () {
            }
        })
    }

    const testUseOtherClassLoader = (className: string) => {
        let retCls = null
        loaders.forEach((loader) => {
            try {
                let clz = loader.findClass(className)
                if (clz != null) retCls = cls
            } catch (error) {
                // console.log(error)
            }
        })
        return retCls
    }

    Java.perform(() => {
        let clazz: Java.Wrapper
        try {
            clazz = Java.use(className)
        } catch {
            clazz = testUseOtherClassLoader(className)
        }

        try {
            clazz.$ownMembers.forEach((name: string) => {
                try {
                    // fields
                    if (Object.getOwnPropertyNames(clazz[name]).includes("_p")) {
                        const field: Java.Field = clazz[name]
                        ar_fields.push(field)
                        ar_fields_name.push(name)
                    }
                    // methods
                    else {
                        const method: Java.Method[] = clazz[name].overloads
                        ar_methods.push(...method)
                    }
                } catch (error) {
                    // LOGE(error)
                }
            })
        } catch (error) {
            // LOGE(error)
        }
    })
    return { "methods": ar_methods, "fields": ar_fields, "fields_name": ar_fields_name }
}

globalThis.filterJavaMethods = (methodNameFilter: string, className: string | number | undefined) => {
    if (methodNameFilter == undefined || methodNameFilter == "") throw new Error("methodNameFilter can't be empty")
    className = checkNumParam(className)
    let index: number = 0
    if (className == undefined) {
        try {
            (enumClassesList(true) as Array<string>).forEach((className: string) => printMethod(className))
        } catch (error) {
            // LOGE(error)
        }
    } else {
        printMethod(className)
    }

    function printMethod(className: string) {
        const members: JavaMembers = getJavaMembersFromClass(className)
        try {
            members.methods.forEach((method: Java.Method) => {
                if (method.methodName.includes(methodNameFilter)) {
                    const artMethod: ArtMethod = new ArtMethod(method.handle)
                    LOGD(`\n\t[${++index}] ${artMethod.methodName}`)
                }
            })
        } catch (e) {
            LOGE(e)
        }
    }
}

const checkNumParam = (className: string | number): string => {
    if (typeof className === "number") {
        if (className >= arrayCurrentClassItems.length)
            throw new Error(`index out of range, current length is ${arrayCurrentClassItems.length}`)
        return arrayCurrentClassItems[className]
    }
    return className
}

globalThis.listJavaMethods = (className: string | number = "com.unity3d.player.UnityPlayer", simple: boolean = false, showSmali: boolean = false) => {
    let countFields: number = 0
    let countMethods: number = 0

    className = checkNumParam(className)

    const members: JavaMembers = getJavaMembersFromClass(className)
    LOGD(`\n\n${className}`)

    try {
        LOGD(`\n[*] Fields :`)
        members.fields.map((field: Java.Field, index: number) => {
            let flag: string = ""
            let currentIndex = ++countFields
            // flag += PrettyJavaAccessFlags(getArtFieldSpec(field["_p"][3]).accessFlags)
            try {
                // static fields 
                return `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field.value)} | ${field.fieldReturnType}`
            } catch (error) {
                // instance fields
                return `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field)}`
            }
        }).forEach(LOGD)
        newLine()
    } catch (e) {
        LOGE(e)
    }

    try {
        LOGD(`\n[*] Methods :`)
        members.methods.forEach((method: Java.Method) => {
            const artMethod: ArtMethod = new ArtMethod(method.handle)
            if (simple) {
                LOGD(`\n\t[${++countMethods}] ${artMethod.methodName}`)
            } else {
                const disp: string = artMethod.toString().split('\n').map((item, index) => index == 0 ? item : `\n\t${item}`).join('')
                LOGD(`\n\t[${++countMethods}] ${disp}`)
            }
            if (showSmali) artMethod.showSmali()
        })
        newLine()
    } catch (e) {
        LOGE(e)
    }
}

globalThis.m = globalThis.listJavaMethods

// current classloader
globalThis.enumClassesList = (ret: boolean = false) => {
    let countClasses: number = -1
    let retArray = []
    if (!ret) newLine()
    arrayCurrentClassItems.splice(0, arrayCurrentClassItems.length)
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            arrayCurrentClassItems.push(className)
            retArray.push(className)
            if (!ret) LOGD(`[${++countClasses}] ${className}`)
        },
        onComplete: function () {
        }
    })
    if (ret) return retArray
    LOGZ(`\nTotal classes: ${countClasses + 1}\n`)
}

// findJavaClasses("display",true)
globalThis.findJavaClasses = (keyword: string, depSearch: boolean = false, searchInstance = true): void => {
    let countClasses: number = -1
    newLine()
    arrayCurrentClassItems.splice(0, arrayCurrentClassItems.length)
    if (depSearch) {
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                enumClassesInner(loader)
            },
            onComplete: function () {
                // todo nothing
            }
        })
    } else {
        enumClassesInner(Java.classFactory.loader)
    }

    // enum all classloader
    function enumClassesInner(loader: Java.Wrapper) {
        (Java.classFactory as any).loader = loader
        LOGW(`Using loader: ${(Java.classFactory as any).loader}`)
        Java.enumerateLoadedClasses({
            onMatch: function (className) {
                if (className.includes(keyword)) {
                    arrayCurrentClassItems.push(className)
                    LOGD(`[${++countClasses}] ${className}`)
                    if (searchInstance) {
                        const instances: any[] | void = chooseClasses(countClasses, true)
                        let instanceCount = -1
                        if (instances != undefined && (instances as any[]).length > 0) {
                            LOGZ(`\t[${++instanceCount}] ${instances[0]}}]`)
                        }
                    }
                }
            },
            onComplete: function () {
                LOGZ(`\nTotal classes: ${countClasses + 1}\n`)
            }
        })
    }
}

globalThis.chooseClasses = (className: string | number, retArray: boolean = false) => {
    let classNameLocal: string = checkNumParam(className)
    let countClasses: number = -1
    let ret: any[] = []
    Java.perform(() => {
        try {
            Java.choose(classNameLocal, {
                onMatch: function (instance) {
                    if (retArray) {
                        ret.push(instance)
                    } else {
                        LOGD(`[${++countClasses}] ${instance}`)
                    }
                },
                onComplete: function () {
                    if (!retArray) LOGZ(`\nTotal instance: ${countClasses + 1}\n`)
                }
            })
        } catch (error) {
            // LOGE(error)
        }
    })
    if (retArray) return ret
}

globalThis.listFieldsInstance = (className: string | number, hex?:string) => {
    let classNameLocal: string = checkNumParam(className)
    let countFields: number = -1
    newLine()
    Java.perform(() => {
        try {
            Java.choose(classNameLocal, {
                onMatch: function (instance) {
                    if (hex != undefined &&  hex.includes("0x") && `${instance}`.includes(hex)) {
                        LOGD(`\n[${++countFields}] ${instance}`)
                        let index = 0
                        for (let field in instance) {
                            if (`${instance[field]}`.includes("Java.Field"))
                            LOGD(`[${++index}] ${field} : ${instance[field]}`)
                        }
                        return "stop"
                    } else {
                        LOGD(`\n[${++countFields}] ${instance}`)
                        let index = 0
                        for (let field in instance) {
                            if (`${instance[field]}`.includes("Java.Field"))
                            LOGD(`[${++index}] ${field} : ${instance[field]}`)
                        }
                    }
                },
                onComplete: function () {
                    LOGZ(`\nTotal instance: ${countFields + 1}\n`)
                }
            })
        }catch (error) {
            // LOGE(error)
        }
    })
}

globalThis.lfs = globalThis.listFieldsInstance

declare global {
    var listJavaMethods: (className: string | number, simple?: boolean, showSmali?: boolean) => void
    var m: (className: string | number) => void // alias of listJavaMethods
    var enumClassesList: (ret?: boolean) => void | Array<string>
    var findJavaClasses: (keyword: string, depSearch?: boolean, searchInstance?: boolean) => void
    var chooseClasses: (className: string | number, retArray?: boolean) => void | any[]
    var filterJavaMethods: (methodNameFilter: string, className: string | number | undefined) => void
    var listFieldsInstance: (className: string | number) => void
    var lfs : (className: string | number) => void // alias of listFieldsInstance
}