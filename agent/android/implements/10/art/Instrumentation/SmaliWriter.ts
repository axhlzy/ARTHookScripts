import { JSHandleNotImpl } from "../../../../JSHandle"
import { ArtInstruction } from "../Instruction"
import { Opcode } from "./InstructionList"

export class SmaliWriter extends JSHandleNotImpl {

    base: NativePointer
    current: NativePointer
    offset: number
    insnsMap: Map<NativePointer, NativePointer>
    insnsSize: number

    constructor(handle: NativePointer) {
        super(handle)
        this.base = handle
        this.current = handle
        this.offset = 0
        this.insnsMap = new Map()
        this.insnsSize = 0
    }

    reset(newCode: NativePointer) {
        this.current = newCode
        this.offset = newCode.sub(this.base).toInt32()
    }

    skip(nBytes: number, addInsnsSize: boolean = true): void {
        this.current = this.current.add(nBytes)
        this.offset += nBytes
        if (addInsnsSize) this.insnsSize += 1
    }

    writeInsns(insns: ArtInstruction): void {
        const insns_ptr: NativePointer = insns.current
        const insns_size: number = insns.SizeInCodeUnits
        const dst_insns_ptr: NativePointer = this.current

        Memory.copy(dst_insns_ptr, insns_ptr, insns_size)

        this.skip(insns_size, false)
        this.insnsSize += insns_size
        this.insnsMap.set(insns_ptr, dst_insns_ptr)
    }

    flush() {
        this.forEachInsns((insns: ArtInstruction) => {
            const opName: string = insns.opName
            if (opName.includes("GOTO") || opName.includes("IF_")) {
                SmaliWriter.fixRelativeBranchOffset(insns, this.insnsMap)
            }

            // if (opcode == Opcode.GOTO || opcode == Opcode.GOTO_16 || opcode == Opcode.GOTO_32 || opcode == Opcode.IF_EQ) { }

            // todo: deal with labels
        })
    }

    private forEachInsns(callback: (insns: ArtInstruction) => void): void {
        let insns: ArtInstruction = new ArtInstruction(this.base)
        while (true) {
            callback(insns)
            if (insns.current > this.current) break
            insns = insns.Next()
        }
    }

    private static fixRelativeBranchOffset(insns: ArtInstruction, insnsMap: Map<NativePointer, NativePointer>): ArtInstruction {
        const DEBUG: boolean = false
        const opcode: Opcode = insns.opcode
        if (DEBUG) {
            LOGD(`fixRelativeBranchOffset -> ${insns}`)
            insnsMap.forEach((dst, src) => {
                LOGD(`${src} -> ${dst}`)
            })
        }
        if (opcode == Opcode.GOTO || opcode == Opcode.GOTO_16 || opcode == Opcode.GOTO_32) {
            // todo: deal with gotos

        } else if (insns.opName.includes("IF_")) {
            const offset_ptr: NativePointer = insns.current.add(0x2)
            const offset_value: number = offset_ptr.readU16() * 2
            if (DEBUG) LOGD(`insns.current -> ${insns.current} -> ${insns.opName} -> ${offset_ptr.readU16()}`)
            const originalAddress: NativePointer | undefined = Array.from(insnsMap.entries())
                .find(([_, newAddress]) => newAddress.equals(insns.current))?.[0]
            if (DEBUG) LOGE(`originalAddress -> ${originalAddress}`)
            if (originalAddress !== undefined) {
                const originalWithOffset: NativePointer = originalAddress.add(offset_value)
                if (DEBUG) LOGE(`originalWithOffset -> ${originalWithOffset}`)
                const entry: [NativePointer, NativePointer] | undefined = Array.from(insnsMap.entries())
                    .find(([oldAddr, _newAddr]) => oldAddr.equals(originalWithOffset))
                if (entry !== undefined) {
                    const [, newAddress] = entry
                    if (DEBUG) LOGE(`newAddress -> ${newAddress}`)
                    const relativeOffset: number = newAddress.sub(insns.current).toInt32()
                    offset_ptr.writeU16(relativeOffset)
                } else {
                    if (DEBUG) LOGD(`New address not found in insnsMap: ${originalWithOffset}`)
                }
            } else {
                if (DEBUG) LOGD(`Original address not found for new address: ${insns.current}`)
            }
        }
        return insns
    }

    putNop(num: number = 1): void {
        for (let i = 0; i < num * 2; i++) {
            this.current.writeU8(Opcode.NOP)
            this.skip(1)
        }
    }

    putGoto(offset: number): void {

    }

    putReturn(): void {
        this.current.writeU8(Opcode.RETURN_VOID)
        this.skip(1)
        this.current.writeU8(0)
        this.skip(1)
    }

    //   HANDLER_ATTRIBUTES bool HandleConstString() {
    //     ObjPtr<mirror::String> s = ResolveString(Self(), shadow_frame_, dex::StringIndex(B()));
    //     if (UNLIKELY(s == nullptr)) {
    //       return false;  // Pending exception.
    //     }
    //     SetVRegReference(A(), s);
    //     return true;
    //   }
    // Later, you can try to hook off the HandleConstString here, and manually return a const char* if the stack is the current hook function.
    // That means the stringIndex here could have a new map to map to.
    // 1a02 3c0f       |  const-string v2, "." // string@3900
    putConstString(regIndex: number, stringIndex: number): void {
        // op 1a 
        this.current.writeU8(Opcode.CONST_STRING)
        this.skip(1)
        // reg 02
        this.current.writeU8(regIndex)
        this.skip(1)
        // string 3c0f
        this.current.writeU16(stringIndex)
        this.skip(2)
    }

    // 3900 1d00       |  if-nez v0, +29
    putIfNez(regIndex: number, offset: number): void {
        // op 39
        this.current.writeU8(Opcode.IF_NEZ)
        this.skip(1)
        // reg 00
        this.current.writeU8(regIndex)
        this.skip(1)
        // offset 1d00
        this.current.writeU16(offset)
        this.skip(2)
    }

    // 0a00            |  move-result v0
    putMoveResult(regIndex: number): void {
        // op 0a
        // reg 00
        this.current.writeU8(Opcode.MOVE_RESULT)
        this.skip(1)
        this.current.writeU8(regIndex)
        this.skip(1)
    }

    // 0c04            |  move-result-object v4
    putMoveResultObject(regIndex: number): void {
        // op 0c
        // reg 04
        this.current.writeU8(Opcode.MOVE_RESULT_OBJECT)
        this.skip(1)
        this.current.writeU8(regIndex)
        this.skip(1)
    }

    // 2200 2026       |  new-instance v0, java.lang.StringBuilder // type@TypeIndex[9760]
    putNewInstance(regIndex: number, typeIndex: number): void {
        // op 22
        // reg 00
        this.current.writeU8(Opcode.NEW_INSTANCE)
        this.skip(1)
        this.current.writeU8(regIndex)
        this.skip(1)
        // type 2026
        this.current.writeU16(typeIndex)
        this.skip(2)
    }

    // 7130 2bbd 3204  |  invoke-static {v2, v3, v4}, void com.unity3d.player.UnityPlayer.nativeUnitySendMessage(java.lang.String, java.lang.String, byte[]) // method@48427
    putInvokeStatic(regIndexs: number[], methodIndex: number): void {
        // op 71
        this.current.writeU8(Opcode.INVOKE_STATIC)
        this.skip(1)
        // reg 30
        this.current.writeU8(regIndexs.length)
        this.skip(1)
        // method 2bbd
        this.current.writeU16(methodIndex)
        this.skip(2)
    }

}