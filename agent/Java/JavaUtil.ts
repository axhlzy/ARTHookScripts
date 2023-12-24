import { ArtMethod } from "../tools/ArtMethod"

// 记录一下当前遍历出来的class便于直接使用index选择
const ArrayCurrentItems: string[] = []

interface JavaMembers {
    methods: Java.Method[]
    fields: Java.Field[]
    fields_name: string[]
}

export function getJavaMembersFromClass(className: string = "com.unity3d.player.UnityPlayer"): JavaMembers {

    const ar_methods: Java.Method[] = []
    const ar_fields: Java.Field[] = []
    const ar_fields_name: string[] = []

    Java.perform(() => {
        const clazz = Java.use(className)
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
    })
    return { "methods": ar_methods, "fields": ar_fields, "fields_name": ar_fields_name }
}

globalThis.listJavaMethods = (className: string | number = "com.unity3d.player.UnityPlayer", showInfo: boolean = true) => {
    let countFields = 0
    let countMethods = 0

    if (typeof className === "number") {
        if (className >= ArrayCurrentItems.length) {
            throw new Error(`index out of range, current length is ${ArrayCurrentItems.length}`)
        }
        className = ArrayCurrentItems[className]
    }

    const members: JavaMembers = getJavaMembersFromClass(className)
    LOGD(`\n\n${className}`)
    try {
        LOGD(`\nfields :`)
        members.fields.map((field: Java.Field, index: number) => {
            let result: string = ""
            let flag: string = ""
            let currentIndex = ++countFields
            // flag += PrettyJavaAccessFlags(getArtFieldSpec(field["_p"][3]).accessFlags)
            try {
                // static fields 
                result = `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field.value)} | ${field.fieldReturnType}`
            } catch (error) {
                // instance fields
                result = `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field)}`
            }
            return result
        }).forEach(LOGD)
        newLine()
    } catch (e) {
        LOGE(e)
    }
    try {
        LOGD(`\nmethods :`)
        members.methods.forEach((method: Java.Method) => {
            const artMethod: ArtMethod = new ArtMethod(method.handle)
            LOGD(`\n\t[${++countMethods}] ${artMethod}`)
            if (showInfo) LOGZ(`\n\t\t${artMethod.getInfo()}`)
        })
        newLine()
    } catch (e) {
        LOGE(e)
    }
}

globalThis.enumClasses = () => {
    let countClasses: number = -1
    newLine()
    ArrayCurrentItems.splice(0, ArrayCurrentItems.length)
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            ArrayCurrentItems.push(className)
            LOGD(`[${++countClasses}] ${className}`)
        },
        onComplete: function () {
            LOGZ(`\nTotal classes: ${countClasses + 1}\n`)
        }
    })
}

globalThis.findJavaClasses = (keyword: string, searchInstance = true) => {
    let countClasses: number = -1
    newLine()
    ArrayCurrentItems.splice(0, ArrayCurrentItems.length)
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            if (className.includes(keyword)) {
                ArrayCurrentItems.push(className)
                LOGD(`[${++countClasses}] ${className}`)
                if (searchInstance) {
                    const instances: any[] | void = ChooseClasses(countClasses, true)
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

globalThis.ChooseClasses = (className: string | number, retArray: boolean = false) => {
    let classNameLocal: string
    if (typeof className === "number") {
        if (className >= ArrayCurrentItems.length)
            throw new Error(`index out of range, current length is ${ArrayCurrentItems.length}`)
        classNameLocal = ArrayCurrentItems[className]
    } else {
        classNameLocal = className
    }
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

declare global {
    var listJavaMethods: (className?: string, showInfo?: boolean) => void
    var enumClasses: () => void
    var findJavaClasses: (keyword: string) => void
    var ChooseClasses: (className: string | number, retArray?: boolean) => void | any[]
}