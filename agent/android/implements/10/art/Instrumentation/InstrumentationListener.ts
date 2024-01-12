import { ArtMethod } from "../mirror/ArtMethod"
import { ArtObject } from "../../../../Object"
import { JValue } from "../Type/JValue"
import { ArtThread } from "../Thread"
import { ObjPtr } from "../ObjPtr"

export interface InstrumentationListenerInterface {
    // virtual void MethodEntered(Thread* thread, Handle<mirror::Object> this_object, ArtMethod* method, uint32_t dex_pc) 
    MethodEntered(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number): void
    // virtual void MethodExited(Thread* thread, Handle<mirror::Object> this_object, ArtMethod* method, uint32_t dex_pc, const JValue& return_value)
    MethodExited(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number, return_value: JValue): void
    // virtual void MethodUnwind(Thread* thread, Handle<mirror::Object> this_object, ArtMethod* method, uint32_t dex_pc)
    MethodUnwind(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number): void
    // virtual void DexPcMoved(Thread* thread, Handle<mirror::Object> this_object, ArtMethod* method, uint32_t new_dex_pc)
    DexPcMoved(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, new_dex_pc: number): void
    // virtual void FieldRead(Thread* thread, Handle<mirror::Object> this_object, ArtMethod* method, uint32_t dex_pc, ArtField* field)
    FieldRead(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number, field: ArtObject): void
    // virtual void FieldWritten(Thread* thread, Handle<mirror::Object> this_object, ArtMethod* method, uint32_t dex_pc, ArtField* field, const JValue& field_value)
    FieldWritten(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number, field: ArtObject, field_value: JValue): void
    // virtual void ExceptionThrown(Thread* thread, Handle<mirror::Throwable> exception_object)
    ExceptionThrown(thread: ArtThread, exception_object: ObjPtr): void
    // virtual void ExceptionHandled(Thread* thread, Handle<mirror::Throwable> exception_object)
    ExceptionHandled(thread: ArtThread, exception_object: ObjPtr): void
    // virtual void Branch(Thread* thread, ArtMethod* method, uint32_t dex_pc, int32_t dex_pc_offset)
    Branch(thread: ArtThread, method: ArtMethod, dex_pc: number, dex_pc_offset: number): void
    // virtual void WatchedFramePop(Thread* thread ATTRIBUTE_UNUSED, const ShadowFrame& frame ATTRIBUTE_UNUSED)
    WatchedFramePop(thread: ArtThread, frame: ArtObject): void
}

export class InstrumentationListenerJsProxImpl implements InstrumentationListenerInterface {

    private static LOGD_ENABLE: boolean = true

    constructor() { }

    MethodEntered(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`MethodEntered: ${method.PrettyMethod(false)}`)
    }

    MethodExited(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number, return_value: JValue): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`MethodExited: ${method.PrettyMethod(false)}`)
    }

    MethodUnwind(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`MethodUnwind: ${method.PrettyMethod(false)}`)
    }

    DexPcMoved(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, new_dex_pc: number): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`DexPcMoved: ${method.PrettyMethod(false)}`)
    }

    FieldRead(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number, field: ArtObject): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`FieldRead: ${method.PrettyMethod(false)}`)
    }

    FieldWritten(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number, field: ArtObject, field_value: JValue): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`FieldWritten: ${method.PrettyMethod(false)}`)
    }

    ExceptionThrown(thread: ArtThread, exception_object: ObjPtr): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`ExceptionThrown: ${exception_object}`)
    }

    ExceptionHandled(thread: ArtThread, exception_object: ObjPtr): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`ExceptionHandled: ${exception_object}`)
    }

    Branch(thread: ArtThread, method: ArtMethod, dex_pc: number, dex_pc_offset: number): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`Branch: ${method.PrettyMethod(false)}`)
    }

    WatchedFramePop(thread: ArtThread, frame: ArtObject): void {
        if (InstrumentationListenerJsProxImpl.LOGD_ENABLE) LOGD(`WatchedFramePop: ${frame}`)
    }

}

export class InstrumentationListener {

    private virtual_ptr: NativePointer
    private calls: InstrumentationListenerInterface
    private calls_ptr: NativePointer

    // private static MaxAlloc: number = 11
    private static MaxAlloc: number = 20

    constructor(functions: InstrumentationListenerInterface) {
        this.calls = functions
        this.virtual_ptr = Memory.alloc(Process.pointerSize * 2)
        this.calls_ptr = Memory.alloc(Process.pointerSize * InstrumentationListener.MaxAlloc)
        this.virtual_ptr.writePointer(this.calls_ptr)

        this.CallsRefGet(InstrumentationListenerType.kMethodEntered).
            writePointer(new NativeCallback((thread_ptr: NativePointer, this_object_ptr: NativePointer, method_ptr: NativePointer, dex_pc: NativePointer) => {
                LOGW(`kMethodEntered: ${thread_ptr} ${this_object_ptr} ${method_ptr} ${dex_pc}`)
                // const thread = new ArtThread(thread_ptr)
                // const this_object = new ObjPtr(this_object_ptr)
                // const method = new ArtMethod(method_ptr)
                // this.calls.MethodEntered(thread, this_object, method, dex_pc.toUInt32())
            }, "void", ["pointer", "pointer", "pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kMethodExited).
            writePointer(new NativeCallback((thread_ptr: NativePointer, this_object_ptr: NativePointer, method_ptr: NativePointer, dex_pc: NativePointer, return_value_ptr: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const this_object = new ObjPtr(this_object_ptr)
                const method = new ArtMethod(method_ptr)
                const return_value = new JValue(return_value_ptr)
                this.calls.MethodExited(thread, this_object, method, dex_pc.toUInt32(), return_value)
            }, "void", ["pointer", "pointer", "pointer", "pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kMethodUnwind).
            writePointer(new NativeCallback((thread_ptr: NativePointer, this_object_ptr: NativePointer, method_ptr: NativePointer, dex_pc: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const this_object = new ObjPtr(this_object_ptr)
                const method = new ArtMethod(method_ptr)
                this.calls.MethodUnwind(thread, this_object, method, dex_pc.toUInt32())
            }, "void", ["pointer", "pointer", "pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kDexPcMoved).
            writePointer(new NativeCallback((thread_ptr: NativePointer, this_object_ptr: NativePointer, method_ptr: NativePointer, dex_pc: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const this_object = new ObjPtr(this_object_ptr)
                const method = new ArtMethod(method_ptr)
                this.calls.DexPcMoved(thread, this_object, method, dex_pc.toUInt32())
            }, "void", ["pointer", "pointer", "pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kFieldRead).
            writePointer(new NativeCallback((thread_ptr: NativePointer, this_object_ptr: NativePointer, method_ptr: NativePointer, dex_pc: NativePointer, field_ptr: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const this_object = new ObjPtr(this_object_ptr)
                const method = new ArtMethod(method_ptr)
                const field = new ArtObject(field_ptr)
                this.calls.FieldRead(thread, this_object, method, dex_pc.toUInt32(), field)
            }, "void", ["pointer", "pointer", "pointer", "pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kFieldWritten).
            writePointer(new NativeCallback((thread_ptr: NativePointer, this_object_ptr: NativePointer, method_ptr: NativePointer, dex_pc: NativePointer, field_ptr: NativePointer, field_value_ptr: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const this_object = new ObjPtr(this_object_ptr)
                const method = new ArtMethod(method_ptr)
                const field = new ArtObject(field_ptr)
                const field_value = new JValue(field_value_ptr)
                this.calls.FieldWritten(thread, this_object, method, dex_pc.toUInt32(), field, field_value)
            }, "void", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kExceptionThrown).
            writePointer(new NativeCallback((thread_ptr: NativePointer, exception_object_ptr: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const exception_object = new ObjPtr(exception_object_ptr)
                this.calls.ExceptionThrown(thread, exception_object)
            }, "void", ["pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kExceptionHandled).
            writePointer(new NativeCallback((thread_ptr: NativePointer, exception_object_ptr: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const exception_object = new ObjPtr(exception_object_ptr)
                this.calls.ExceptionHandled(thread, exception_object)
            }, "void", ["pointer", "pointer"]))
        this.CallsRefGet(InstrumentationListenerType.kBranch).
            writePointer(new NativeCallback((thread_ptr: NativePointer, method_ptr: NativePointer, dex_pc: NativePointer, dex_pc_offset: NativePointer) => {
                const thread = new ArtThread(thread_ptr)
                const method = new ArtMethod(method_ptr)
                this.calls.Branch(thread, method, dex_pc.toUInt32(), dex_pc_offset.toInt32())
            }, "void", ["pointer", "pointer", "pointer", "pointer"]))
    }

    private CallsRefGet(index: InstrumentationListenerType): NativePointer {
        return this.calls_ptr.add(Process.pointerSize * index)
    }

    public get VirtualPtr(): NativePointer {
        return this.virtual_ptr
    }

}

enum InstrumentationLevel {
    kInstrumentNothing,                   // execute without instrumentation
    kInstrumentWithInstrumentationStubs,  // execute with instrumentation entry/exit stubs
    kInstrumentWithInterpreter            // execute with interpreter
};

export enum InstrumentationEvent {
    kMethodEntered = 0x1,
    kMethodExited = 0x2,
    kMethodUnwind = 0x4,
    kDexPcMoved = 0x8,
    kFieldRead = 0x10,
    kFieldWritten = 0x20,
    kExceptionThrown = 0x40,
    kBranch = 0x80,
    kWatchedFramePop = 0x200,
    kExceptionHandled = 0x400,
}

enum InstrumentationListenerType {
    kMethodEntered = 0,
    kMethodExited = 1,
    kMethodUnwind = 2,
    kDexPcMoved = 3,
    kFieldRead = 4,
    kFieldWritten = 5,
    kExceptionThrown = 6,
    kExceptionHandled = 7,
    kBranch = 8,
    kWatchedFramePop = 9,
}
