import { DexFile } from "../implements/10/art/dexfile/DexFile"
import { SymbolManager } from "./SymbolManager"

export class DexFileManager extends SymbolManager {

    public static dexFiles: DexFile[] = []

    constructor() {
        super()
    }

    public get dexFiles() {
        return DexFileManager.dexFiles
    }

    public addDexFile(dexFile: DexFile) {
        if (this.hasDexFile(dexFile)) return
        DexFileManager.dexFiles.push(dexFile)
    }

    public removeDexFile(dexFile: DexFile) {
        DexFileManager.dexFiles = DexFileManager.dexFiles.filter(item => item != dexFile)
    }

    public hasDexFile(dexFile: DexFile): boolean {
        return this.dexFiles.some(item => item == dexFile)
    }

}

declare global {
    var listDexFiles: (onlyAppDex?: boolean) => void
    var dumpDexFiles: (onlyAppDex?: boolean) => void
}

const showDexFileInner = (dexFile: DexFile, index?: number, dump: boolean = false) => {
    LOGD(`[${index == undefined ? "*" : index}] DexFile<${dexFile.handle}>`)
    LOGZ(`\tlocation = ${dexFile.location}`)
    LOGZ(`\tchecksum = ${dexFile.location_checksum} | is_compact_dex = ${dexFile.is_compact_dex}`)
    LOGZ(`\tbegin = ${dexFile.begin} | size = ${dexFile.size} | data_begin = ${dexFile.data_begin} | data_size = ${dexFile.data_size}`)
    if (dump && dexFile.location.endsWith(".dex")) dexFile.dump()
    newLine()

}

const iterDexFile = (dump: boolean, onlyAppDex: boolean = true) => {
    let count: number = 0
    LOGZ(`Waitting for dex files... \nInter ${DexFileManager.dexFiles.length} dex files.`)
    DexFileManager.dexFiles.forEach((item: DexFile) => {
        if (count == 0) clear()
        if (onlyAppDex) if (!item.location.includes("/data/app/")) return
        showDexFileInner(item, ++count, dump)
    })

}

globalThis.listDexFiles = (onlyAppDex: boolean = true) => {
    iterDexFile(false, onlyAppDex)
}

globalThis.dumpDexFiles = (onlyAppDex: boolean = true) => {
    iterDexFile(true, onlyAppDex)
}