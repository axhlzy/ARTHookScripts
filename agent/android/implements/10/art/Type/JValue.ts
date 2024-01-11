import { JSHandleNotImpl } from "../../../../JSHandle"
import { ArtObject } from "../../../../Object"

export class JValue extends JSHandleNotImpl {

    // uint8_t z;
    private z = this.handle
    // int8_t b;
    private b = this.z.add(1)
    // uint16_t c;
    private c = this.b.add(1)
    // int16_t s;
    private s = this.c.add(2)
    // int32_t i;
    private i = this.s.add(2)
    // int64_t j;
    private j = this.i.add(4)
    // float f;
    private f = this.j.add(8)
    // double d;
    private d = this.f.add(4)
    // mirror::Object* l;
    private l = this.d.add(8)

    constructor(handle: NativePointer) {
        super(handle)
    }

    get z_(): number {
        return this.z.readU8()
    }

    get b_(): number {
        return this.b.readS8()
    }

    get c_(): number {
        return this.c.readU16()
    }

    get s_(): number {
        return this.s.readS16()
    }

    get i_(): number {
        return this.i.readS32()
    }

    get j_(): Int64 {
        return this.j.readS64()
    }

    get f_(): number {
        return this.f.readFloat()
    }

    get d_(): number {
        return this.d.readDouble()
    }

    get l_(): ArtObject {
        return new ArtObject(this.l.readPointer())
    }

    // mirror::Object** GetGCRoot() { return &l; }
    GetGCRoot(): NativePointer {
        return this.l
    }

    toString(): string {
        let disp: string = `JValue<${this.handle}>`
        if (this.handle.isNull()) return disp
        disp += `\n\t z=${this.z_}`
        disp += `\n\t b=${this.b_}`
        disp += `\n\t c=${this.c_}`
        disp += `\n\t s=${this.s_}`
        disp += `\n\t i=${this.i_}`
        disp += `\n\t j=${this.j_}`
        disp += `\n\t f=${this.f_}`
        disp += `\n\t d=${this.d_}`
        disp += `\n\t l=${this.l_}`
        return disp
    }

}