import { GcRoot } from "../../../implements/10/art/GcRoot"
import { ArtClass } from "../../../implements/10/art/mirror/ArtClass"

export interface IArtMethod {
    declaring_class: GcRoot<ArtClass>
    access_flags: NativePointer
    dex_code_item_offset: number
    dex_method_index: number
    method_index: number
    hotness_count: number
}