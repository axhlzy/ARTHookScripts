export class SymbolManager {

    get artModule(): Module {
        return Process.getModuleByName("libart.so")!
    }

    get artBaseAddress(): NativePointer {
        return Module.findBaseAddress("libart.so")
    }

    get artSymbol(): ModuleSymbolDetails[] {
        return this.artModule.enumerateSymbols()
    }

    public artSymbolFilter(filterStrs: string[], excludefilterStrs?: string[]): ModuleSymbolDetails {
        return SymbolManager.symbolFilter(this.artSymbol, filterStrs, excludefilterStrs)
    }

    get dexDileModule(): Module {
        return Process.getModuleByName("libdexfile.so")
    }

    get dexfileAddress(): NativePointer {
        return Module.findBaseAddress("libdexfile.so")
    }

    get dexfileSymbol(): ModuleSymbolDetails[] {
        return this.dexDileModule.enumerateSymbols()
    }

    public dexfileSymbolFilter(filterStrs: string[], excludefilterStrs?: string[]): ModuleSymbolDetails {
        return SymbolManager.symbolFilter(this.dexfileSymbol, filterStrs, excludefilterStrs)
    }

    private SymbolFilter(module: Module | string, filterStrs: string[]): ModuleSymbolDetails {
        let localMd: Module = null
        if (typeof module == "string") {
            localMd = Process.getModuleByName(module)!
        } else if (module instanceof Module) {
            localMd = module
        }
        return SymbolManager.symbolFilter(localMd.enumerateSymbols(), filterStrs)
    }

    private static symbolFilter(mds: ModuleSymbolDetails[], containfilterStrs: string[], excludefilterStrs: string[] = []): ModuleSymbolDetails {
        let ret = mds.filter((item: ModuleSymbolDetails) => {
            return containfilterStrs.every((filterStr: string) => {
                return item.name.indexOf(filterStr) != -1
            })
        })
        ret = ret.filter((item: ModuleSymbolDetails) => {
            return excludefilterStrs.every((filterStr: string) => {
                return item.name.indexOf(filterStr) == -1
            })
        })
        if (ret.length == 0) {
            throw new Error("can not find symbol")
        }
        if (ret.length > 1) {
            LOGW(`find too many symbol, just ret first | size : ${ret.length}`)
            if (ret.length < 5) {
                ret.forEach((item: ModuleSymbolDetails) => {
                    LOGZ(JSON.stringify(item))
                })
            }
        }
        return ret[0]
    }

}