import { JSHandleNotImpl } from "../../../JSHandle"
import { ShadowFrame } from "./ShadowFrame"
import { PointerSize } from "./Globals"

export class StateAndFlags extends JSHandleNotImpl {

    private as_struct: {
        // volatile uint16_t flags;
        flags: NativePointer,
        // volatile uint16_t state;
        state: NativePointer
    }

    // AtomicInteger as_atomic_int;
    private as_atomic_int = this.handle.add(0x4)
    // volatile int32_t as_int;
    private as_int = this.handle.add(0x4)

    constructor(handle: NativePointer) {
        super(handle)
        this.as_struct = {
            flags: this.handle,
            state: this.handle
        }
    }

    toString(): string {
        let disp: string = `StateAndFlags<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t flags=${this.flags}`
        disp += `\n\t state=${this.state}`
        return disp
    }

    get flags(): number {
        return this.as_struct.flags.readU16()
    }

    get state(): number {
        return this.as_struct.state.readU16()
    }

    get as_atomic_int_value(): number {
        return this.as_atomic_int.readS32()
    }

    get as_int_value(): number {
        return this.as_int.readS32()
    }

    public static get SizeOfClass(): number {
        return 0x4 * 3
    }
}

export class RuntimeStats extends JSHandleNotImpl {

    //   // Number of objects allocated.
    //   uint64_t allocated_objects;
    allocated_objects: NativePointer = this.handle
    //   // Cumulative size of all objects allocated.
    //   uint64_t allocated_bytes;
    allocated_bytes: NativePointer = this.allocated_objects.add(0x8)

    //   // Number of objects freed.
    //   uint64_t freed_objects;
    freed_objects: NativePointer = this.allocated_bytes.add(0x8)
    //   // Cumulative size of all freed objects.
    //   uint64_t freed_bytes;
    freed_bytes: NativePointer = this.freed_objects.add(0x8)

    //   // Number of times an allocation triggered a GC.
    //   uint64_t gc_for_alloc_count;
    gc_for_alloc_count: NativePointer = this.freed_bytes.add(0x8)

    //   // Number of initialized classes.
    //   uint64_t class_init_count;
    class_init_count: NativePointer = this.gc_for_alloc_count.add(0x8)
    //   // Cumulative time spent in class initialization.
    //   uint64_t class_init_time_ns;
    class_init_time_ns: NativePointer = this.class_init_count.add(0x8)

    toString(): string {
        let disp: string = `RuntimeStats<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t allocated_objects=${this.allocated_objects}`
        disp += `\n\t allocated_bytes=${this.allocated_bytes}`
        disp += `\n\t freed_objects=${this.freed_objects}`
        disp += `\n\t freed_bytes=${this.freed_bytes}`
        disp += `\n\t gc_for_alloc_count=${this.gc_for_alloc_count}`
        disp += `\n\t class_init_count=${this.class_init_count}`
        disp += `\n\t class_init_time_ns=${this.class_init_time_ns}`
        return disp
    }

    public static get SizeOfClass(): number {
        return 0x8 * 7
    }
}

export class ManagedStack extends JSHandleNotImpl {

    // TaggedTopQuickFrame tagged_top_quick_frame_;
    private tagged_top_quick_frame_: {
        // uintptr_t tagged_sp_;
        tagged_sp_: NativePointer
    }
    // ManagedStack* link_;
    private link_: NativePointer
    // ShadowFrame* top_shadow_frame_;
    private top_shadow_frame_: NativePointer

    constructor(handle: NativePointer) {
        super(handle)
        this.tagged_top_quick_frame_ = {
            tagged_sp_: this.handle
        }
        this.link_ = this.tagged_top_quick_frame_.tagged_sp_.add(PointerSize)
        this.top_shadow_frame_ = this.link_.add(PointerSize)
    }

    toString(): string {
        let disp: string = `ManagedStack<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t tagged_sp=${this.tagged_sp}`
        disp += `\n\t link=${this.link}`
        disp += `\n\t top_shadow_frame=${this.top_shadow_frame}`
        return disp
    }

    public get link(): ManagedStack {
        return new ManagedStack(this.link_.readPointer())
    }

    public get top_shadow_frame(): ShadowFrame {
        return new ShadowFrame(this.top_shadow_frame_.readPointer())
    }

    public get tagged_sp(): NativePointer {
        return this.tagged_top_quick_frame_.tagged_sp_
    }

}