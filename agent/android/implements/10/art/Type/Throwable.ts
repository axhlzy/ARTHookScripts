import { HeapReference } from "../../../../Interface/art/mirror/HeapReference"
import { ArtObject } from "../../../../Object"

export class Throwable extends ArtObject {

    // HeapReference<Object> backtrace_;
    private backtrace_: NativePointer = this.CurrentHandle
    // HeapReference<Throwable> cause_;
    private cause_: NativePointer = this.backtrace_.add(HeapReference.Size)
    // HeapReference<String> detail_message_;
    private detail_message_: NativePointer = this.cause_.add(HeapReference.Size)
    // HeapReference<Object> stack_trace_;
    private stack_trace_: NativePointer = this.detail_message_.add(HeapReference.Size)
    // HeapReference<Object> suppressed_exceptions_;
    private suppressed_exceptions_: NativePointer = this.stack_trace_.add(HeapReference.Size)

    toString(): string {
        let disp: string = `Throwable<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t backtrace_=${this.backtrace_} <- ${this.backtrace.root}`
        disp += `\n\t cause_=${this.cause_} <- ${this.cause.root}`
        disp += `\n\t detail_message_=${this.detail_message_} <- ${this.detail_message.root}`
        disp += `\n\t stack_trace_=${this.stack_trace_} <- ${this.stack_trace.root}`
        disp += `\n\t suppressed_exceptions_=${this.suppressed_exceptions_} <- ${this.suppressed_exceptions.root}`
        return disp
    }

    get backtrace(): HeapReference<ArtObject> {
        return new HeapReference((handle) => new ArtObject(handle), this.backtrace_)
    }

    get cause(): HeapReference<Throwable> {
        return new HeapReference((handle) => new Throwable(handle), this.cause_)
    }

    get detail_message(): HeapReference<ArtObject> {
        return new HeapReference((handle) => new ArtObject(handle), this.detail_message_)
    }

    get stack_trace(): HeapReference<ArtObject> {
        return new HeapReference((handle) => new ArtObject(handle), this.stack_trace_)
    }

    get suppressed_exceptions(): HeapReference<ArtObject> {
        return new HeapReference((handle) => new ArtObject(handle), this.suppressed_exceptions_)
    }

}