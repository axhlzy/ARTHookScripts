import { SwitchImplContext } from "../implements/10/art/interpreter/SwitchImplContext"

// https://cs.android.com/android/platform/superproject/+/android-10.0.0_r47:art/runtime/interpreter/interpreter_switch_impl-inl.h;l=2625
export class ExecuteSwitchImplCppManager {

    private constructor() {
    }

    // void art::interpreter::ExecuteSwitchImplCpp<true, false>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb0EEEvPNS0_17SwitchImplContextE
    static get execute_switch_impl_cpp_1_0() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb0EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    // void art::interpreter::ExecuteSwitchImplCpp<false, true>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb1EEEvPNS0_17SwitchImplContextE
    static get execute_switch_impl_cpp_0_1() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb1EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    // void art::interpreter::ExecuteSwitchImplCpp<true, true>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb1EEEvPNS0_17SwitchImplContextE
    static get execute_switch_impl_cpp_1_1() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb1EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    // void art::interpreter::ExecuteSwitchImplCpp<false, false>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb0EEEvPNS0_17SwitchImplContextE
    static get execute_switch_impl_cpp_0_0() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb0EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    static enableHook() {
        [
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_0,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_0,
        ]
            .filter(it => it != null)
            .forEach(hookAddress => {
                Interceptor.attach(hookAddress, {
                    onEnter: function (args) {
                        const ctx: SwitchImplContext = new SwitchImplContext(args[0])
                        LOGD(`${ctx.handle}`)
                        LOGD(`${ctx.self}`)
                        LOGD(`${ctx.self.GetCurrentMethod().PrettyMethod()}`)
                    },
                    onLeave: function (retval) {
                        // LOGD("result: " + this.ctx.result)
                        newLine()
                    }
                })
            })
    }
}