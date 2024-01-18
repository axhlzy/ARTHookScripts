interface HookOptions {
    before?: (instance: any, args: IArguments) => void
    after?: (instance: any, args: IArguments, returnValue?: any) => any
    skipOriginal?: boolean
    parseValue?: boolean
}

export interface MethodCallback {
    (methodName: string, methodSignature: string, args: IArguments): HookOptions | void
}

/**
 * @example
 * hookJavaClass("com.unity3d.player.UnityWebRequest", null, ['uploadCallback'])
 */
export function hookJavaClass(className: string | Java.Wrapper, callback?: MethodCallback, passMethods: Array<string> = []) {
    callback = (callback == undefined || callback == null) ? (_methodName, _methodSignature, _args) => {
        return {
            skipOriginal: false,
            parseValue: true
        }
    } : callback
    Java.perform(() => {
        var javaClass: any
        try {
            if (typeof className === 'string') {
                javaClass = Java.use(className)
            } else javaClass = className
        } catch {
            LOGE(`NOT FOUND ${className}`)
            return
        }
        const methods = javaClass.class.getDeclaredMethods()

        methods.forEach((method: any) => {
            const methodName: string = method.getName()
            if (methodName.includes("$") || methodName.includes('native') || methodName.includes('synchronized')) {
                LOGW(`Skip Hook -> ${className}.${methodName}`)
                return
            }
            if (methodName.includes("$") || methodName.includes('init') || methodName.includes('ctor')) {
                LOGW(`Skip Hook -> ${className}.${methodName}`)
                return
            }
            if (passMethods.includes(methodName)) return

            LOGW(`Hooking ${className}.${methodName}`)
            const methodSignature = method.getParameterTypes().map((t: any) => t.className).join(',')

            javaClass[methodName].overloads.forEach((originalMethod: Java.Method) => {
                if (originalMethod) {
                    originalMethod.implementation = function () {
                        const hookOptions: HookOptions = callback(methodName, methodSignature, arguments) || {}

                        if (hookOptions.before) {
                            hookOptions.before(this, arguments)
                        }

                        let returnValue: any
                        if (!hookOptions.skipOriginal) {
                            returnValue = originalMethod.apply(this, arguments)
                        }

                        if (hookOptions.after) {
                            returnValue = hookOptions.after(this, arguments, returnValue)
                        }

                        if (hookOptions.parseValue) {
                            let fullMethodName = `${className}.${methodName}`
                            const args_str: string = arguments.length == 0 ? '' : Array.prototype.slice.call(arguments).map(String).join("','")
                            if (returnValue) {
                                LOGD(`${fullMethodName}(\x1b[96m'${args_str}'\x1b[0m) => \x1b[93m${returnValue}\x1b[0m`)
                            } else {
                                LOGD(`${fullMethodName}(\x1b[96m'${args_str}'\x1b[0m)`)
                            }
                        }

                        return returnValue
                    }
                }
            })

        })
    })
}

Reflect.set(globalThis, 'hookJavaClass', hookJavaClass)