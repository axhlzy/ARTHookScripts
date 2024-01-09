// https://github.com/frida/frida-java-bridge/blob/main/lib/class-factory.js#L2072-L2073
// Java.Field
// this._p[0] => holder
// this._p[1] => fieldType
// this._p[2] => fieldReturnType
// this._p[3] => id ( same to handle or art field pointer)
// this._p[4] => getValue ===> using getValue function to call with id (fieldType == 1 ? static : instance)
// this._p[5] => setValue ===> using setValue function to call with id (fieldType == 1 ? static : instance)


// const clazz: Java.Wrapper = Java.use('com.google.firebase.MessagingUnityPlayerActivity')

// // protected void com.google.firebase.MessagingUnityPlayerActivity.onNewIntent(android.content.Intent)
// const method: Java.Method = clazz['onCreate']

// // private static final String EXTRA_FROM = "google.message_id";
// const field: Java.Field = clazz['EXTRA_FROM']

// // 判断是否有字段 _p
// Object.getOwnPropertyNames(clazz['EXTRA_FROM']).includes("_p")

// [MI 8::xxx ]-> var clazz = Java.use('com.google.firebase.MessagingUnityPlayerActivity')
// [MI 8::xxx ]-> clazz['EXTRA_FROM']
// {
//     "_p": [
//         "<class: com.google.firebase.MessagingUnityPlayerActivity>",
//         1,
//         {
//             "className": "java.lang.String",
//             "defaultValue": "0x0",
//             "name": "Ljava/lang/String;",
//             "size": 1,
//             "type": "pointer"
//         },
//         "0xa220d1dc",
//         "0x7ae0c04a08",
//         "0x7ae0c07ce8"
//     ]
// }

// this._p[0] => methodName
// this._p[1] => holder
// this._p[2] => type
// this._p[3] => handle
// this._p[4] => returnType
// this._p[5] => argumentTypes