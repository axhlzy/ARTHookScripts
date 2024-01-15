// // V(opcode, instruction_code, name, format, index, flags, extended_flags, verifier_flags),
// #define DEX_INSTRUCTION_LIST(V) \
//   V(0x00, NOP, "nop", k10x, kIndexNone, kContinue, 0, kVerifyNothing) \
//   V(0x01, MOVE, "move", k12x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x02, MOVE_FROM16, "move/from16", k22x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x03, MOVE_16, "move/16", k32x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x04, MOVE_WIDE, "move-wide", k12x, kIndexNone, kContinue, 0, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x05, MOVE_WIDE_FROM16, "move-wide/from16", k22x, kIndexNone, kContinue, 0, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x06, MOVE_WIDE_16, "move-wide/16", k32x, kIndexNone, kContinue, 0, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x07, MOVE_OBJECT, "move-object", k12x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x08, MOVE_OBJECT_FROM16, "move-object/from16", k22x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x09, MOVE_OBJECT_16, "move-object/16", k32x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x0A, MOVE_RESULT, "move-result", k11x, kIndexNone, kContinue, 0, kVerifyRegA) \
//   V(0x0B, MOVE_RESULT_WIDE, "move-result-wide", k11x, kIndexNone, kContinue, 0, kVerifyRegAWide) \
//   V(0x0C, MOVE_RESULT_OBJECT, "move-result-object", k11x, kIndexNone, kContinue, 0, kVerifyRegA) \
//   V(0x0D, MOVE_EXCEPTION, "move-exception", k11x, kIndexNone, kContinue, 0, kVerifyRegA) \
//   V(0x0E, RETURN_VOID, "return-void", k10x, kIndexNone, kReturn, 0, kVerifyNothing) \
//   V(0x0F, RETURN, "return", k11x, kIndexNone, kReturn, 0, kVerifyRegA) \
//   V(0x10, RETURN_WIDE, "return-wide", k11x, kIndexNone, kReturn, 0, kVerifyRegAWide) \
//   V(0x11, RETURN_OBJECT, "return-object", k11x, kIndexNone, kReturn, 0, kVerifyRegA) \
//   V(0x12, CONST_4, "const/4", k11n, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegA) \
//   V(0x13, CONST_16, "const/16", k21s, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegA) \
//   V(0x14, CONST, "const", k31i, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegA) \
//   V(0x15, CONST_HIGH16, "const/high16", k21h, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegA) \
//   V(0x16, CONST_WIDE_16, "const-wide/16", k21s, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegAWide) \
//   V(0x17, CONST_WIDE_32, "const-wide/32", k31i, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegAWide) \
//   V(0x18, CONST_WIDE, "const-wide", k51l, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegAWide) \
//   V(0x19, CONST_WIDE_HIGH16, "const-wide/high16", k21h, kIndexNone, kContinue, kRegBFieldOrConstant, kVerifyRegAWide) \
//   V(0x1A, CONST_STRING, "const-string", k21c, kIndexStringRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBString) \
//   V(0x1B, CONST_STRING_JUMBO, "const-string/jumbo", k31c, kIndexStringRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBString) \
//   V(0x1C, CONST_CLASS, "const-class", k21c, kIndexTypeRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBType) \
//   V(0x1D, MONITOR_ENTER, "monitor-enter", k11x, kIndexNone, kContinue | kThrow, kClobber, kVerifyRegA) \
//   V(0x1E, MONITOR_EXIT, "monitor-exit", k11x, kIndexNone, kContinue | kThrow, kClobber, kVerifyRegA) \
//   V(0x1F, CHECK_CAST, "check-cast", k21c, kIndexTypeRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBType) \
//   V(0x20, INSTANCE_OF, "instance-of", k22c, kIndexTypeRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegB | kVerifyRegCType) \
//   V(0x21, ARRAY_LENGTH, "array-length", k12x, kIndexNone, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x22, NEW_INSTANCE, "new-instance", k21c, kIndexTypeRef, kContinue | kThrow, kClobber, kVerifyRegA | kVerifyRegBNewInstance) \
//   V(0x23, NEW_ARRAY, "new-array", k22c, kIndexTypeRef, kContinue | kThrow, kClobber, kVerifyRegA | kVerifyRegB | kVerifyRegCNewArray) \
//   V(0x24, FILLED_NEW_ARRAY, "filled-new-array", k35c, kIndexTypeRef, kContinue | kThrow, kClobber, kVerifyRegBType | kVerifyVarArg) \
//   V(0x25, FILLED_NEW_ARRAY_RANGE, "filled-new-array/range", k3rc, kIndexTypeRef, kContinue | kThrow, kClobber, kVerifyRegBType | kVerifyVarArgRange) \
//   V(0x26, FILL_ARRAY_DATA, "fill-array-data", k31t, kIndexNone, kContinue | kThrow, kClobber, kVerifyRegA | kVerifyArrayData) \
//   V(0x27, THROW, "throw", k11x, kIndexNone, kThrow, 0, kVerifyRegA) \
//   V(0x28, GOTO, "goto", k10t, kIndexNone, kBranch | kUnconditional, 0, kVerifyBranchTarget) \
//   V(0x29, GOTO_16, "goto/16", k20t, kIndexNone, kBranch | kUnconditional, 0, kVerifyBranchTarget) \
//   V(0x2A, GOTO_32, "goto/32", k30t, kIndexNone, kBranch | kUnconditional, 0, kVerifyBranchTarget) \
//   V(0x2B, PACKED_SWITCH, "packed-switch", k31t, kIndexNone, kContinue | kSwitch, 0, kVerifyRegA | kVerifySwitchTargets) \
//   V(0x2C, SPARSE_SWITCH, "sparse-switch", k31t, kIndexNone, kContinue | kSwitch, 0, kVerifyRegA | kVerifySwitchTargets) \
//   V(0x2D, CMPL_FLOAT, "cmpl-float", k23x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x2E, CMPG_FLOAT, "cmpg-float", k23x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x2F, CMPL_DOUBLE, "cmpl-double", k23x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0x30, CMPG_DOUBLE, "cmpg-double", k23x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0x31, CMP_LONG, "cmp-long", k23x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0x32, IF_EQ, "if-eq", k22t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyRegB | kVerifyBranchTarget) \
//   V(0x33, IF_NE, "if-ne", k22t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyRegB | kVerifyBranchTarget) \
//   V(0x34, IF_LT, "if-lt", k22t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyRegB | kVerifyBranchTarget) \
//   V(0x35, IF_GE, "if-ge", k22t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyRegB | kVerifyBranchTarget) \
//   V(0x36, IF_GT, "if-gt", k22t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyRegB | kVerifyBranchTarget) \
//   V(0x37, IF_LE, "if-le", k22t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyRegB | kVerifyBranchTarget) \
//   V(0x38, IF_EQZ, "if-eqz", k21t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyBranchTarget) \
//   V(0x39, IF_NEZ, "if-nez", k21t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyBranchTarget) \
//   V(0x3A, IF_LTZ, "if-ltz", k21t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyBranchTarget) \
//   V(0x3B, IF_GEZ, "if-gez", k21t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyBranchTarget) \
//   V(0x3C, IF_GTZ, "if-gtz", k21t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyBranchTarget) \
//   V(0x3D, IF_LEZ, "if-lez", k21t, kIndexNone, kContinue | kBranch, 0, kVerifyRegA | kVerifyBranchTarget) \
//   V(0x3E, UNUSED_3E, "unused-3e", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x3F, UNUSED_3F, "unused-3f", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x40, UNUSED_40, "unused-40", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x41, UNUSED_41, "unused-41", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x42, UNUSED_42, "unused-42", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x43, UNUSED_43, "unused-43", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x44, AGET, "aget", k23x, kIndexNone, kContinue | kThrow, kLoad, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x45, AGET_WIDE, "aget-wide", k23x, kIndexNone, kContinue | kThrow, kLoad, kVerifyRegAWide | kVerifyRegB | kVerifyRegC) \
//   V(0x46, AGET_OBJECT, "aget-object", k23x, kIndexNone, kContinue | kThrow, kLoad, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x47, AGET_BOOLEAN, "aget-boolean", k23x, kIndexNone, kContinue | kThrow, kLoad, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x48, AGET_BYTE, "aget-byte", k23x, kIndexNone, kContinue | kThrow, kLoad, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x49, AGET_CHAR, "aget-char", k23x, kIndexNone, kContinue | kThrow, kLoad, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x4A, AGET_SHORT, "aget-short", k23x, kIndexNone, kContinue | kThrow, kLoad, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x4B, APUT, "aput", k23x, kIndexNone, kContinue | kThrow, kStore, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x4C, APUT_WIDE, "aput-wide", k23x, kIndexNone, kContinue | kThrow, kStore, kVerifyRegAWide | kVerifyRegB | kVerifyRegC) \
//   V(0x4D, APUT_OBJECT, "aput-object", k23x, kIndexNone, kContinue | kThrow, kStore, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x4E, APUT_BOOLEAN, "aput-boolean", k23x, kIndexNone, kContinue | kThrow, kStore, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x4F, APUT_BYTE, "aput-byte", k23x, kIndexNone, kContinue | kThrow, kStore, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x50, APUT_CHAR, "aput-char", k23x, kIndexNone, kContinue | kThrow, kStore, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x51, APUT_SHORT, "aput-short", k23x, kIndexNone, kContinue | kThrow, kStore, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x52, IGET, "iget", k22c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x53, IGET_WIDE, "iget-wide", k22c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegCFieldOrConstant, kVerifyRegAWide | kVerifyRegB | kVerifyRegCField) \
//   V(0x54, IGET_OBJECT, "iget-object", k22c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x55, IGET_BOOLEAN, "iget-boolean", k22c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x56, IGET_BYTE, "iget-byte", k22c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x57, IGET_CHAR, "iget-char", k22c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x58, IGET_SHORT, "iget-short", k22c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x59, IPUT, "iput", k22c, kIndexFieldRef, kContinue | kThrow, kStore | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x5A, IPUT_WIDE, "iput-wide", k22c, kIndexFieldRef, kContinue | kThrow, kStore | kRegCFieldOrConstant, kVerifyRegAWide | kVerifyRegB | kVerifyRegCField) \
//   V(0x5B, IPUT_OBJECT, "iput-object", k22c, kIndexFieldRef, kContinue | kThrow, kStore | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x5C, IPUT_BOOLEAN, "iput-boolean", k22c, kIndexFieldRef, kContinue | kThrow, kStore | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x5D, IPUT_BYTE, "iput-byte", k22c, kIndexFieldRef, kContinue | kThrow, kStore | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x5E, IPUT_CHAR, "iput-char", k22c, kIndexFieldRef, kContinue | kThrow, kStore | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x5F, IPUT_SHORT, "iput-short", k22c, kIndexFieldRef, kContinue | kThrow, kStore | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB | kVerifyRegCField) \
//   V(0x60, SGET, "sget", k21c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x61, SGET_WIDE, "sget-wide", k21c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegBFieldOrConstant, kVerifyRegAWide | kVerifyRegBField) \
//   V(0x62, SGET_OBJECT, "sget-object", k21c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x63, SGET_BOOLEAN, "sget-boolean", k21c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x64, SGET_BYTE, "sget-byte", k21c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x65, SGET_CHAR, "sget-char", k21c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x66, SGET_SHORT, "sget-short", k21c, kIndexFieldRef, kContinue | kThrow, kLoad | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x67, SPUT, "sput", k21c, kIndexFieldRef, kContinue | kThrow, kStore | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x68, SPUT_WIDE, "sput-wide", k21c, kIndexFieldRef, kContinue | kThrow, kStore | kRegBFieldOrConstant, kVerifyRegAWide | kVerifyRegBField) \
//   V(0x69, SPUT_OBJECT, "sput-object", k21c, kIndexFieldRef, kContinue | kThrow, kStore | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x6A, SPUT_BOOLEAN, "sput-boolean", k21c, kIndexFieldRef, kContinue | kThrow, kStore | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x6B, SPUT_BYTE, "sput-byte", k21c, kIndexFieldRef, kContinue | kThrow, kStore | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x6C, SPUT_CHAR, "sput-char", k21c, kIndexFieldRef, kContinue | kThrow, kStore | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x6D, SPUT_SHORT, "sput-short", k21c, kIndexFieldRef, kContinue | kThrow, kStore | kRegBFieldOrConstant, kVerifyRegA | kVerifyRegBField) \
//   V(0x6E, INVOKE_VIRTUAL, "invoke-virtual", k35c, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgNonZero) \
//   V(0x6F, INVOKE_SUPER, "invoke-super", k35c, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgNonZero) \
//   V(0x70, INVOKE_DIRECT, "invoke-direct", k35c, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgNonZero) \
//   V(0x71, INVOKE_STATIC, "invoke-static", k35c, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArg) \
//   V(0x72, INVOKE_INTERFACE, "invoke-interface", k35c, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgNonZero) \
//   V(0x73, UNUSED_73, "unused-73", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x74, INVOKE_VIRTUAL_RANGE, "invoke-virtual/range", k3rc, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgRangeNonZero) \
//   V(0x75, INVOKE_SUPER_RANGE, "invoke-super/range", k3rc, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgRangeNonZero) \
//   V(0x76, INVOKE_DIRECT_RANGE, "invoke-direct/range", k3rc, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgRangeNonZero) \
//   V(0x77, INVOKE_STATIC_RANGE, "invoke-static/range", k3rc, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgRange) \
//   V(0x78, INVOKE_INTERFACE_RANGE, "invoke-interface/range", k3rc, kIndexMethodRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgRangeNonZero) \
//   V(0x79, UNUSED_79, "unused-79", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x7A, UNUSED_7A, "unused-7a", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0x7B, NEG_INT, "neg-int", k12x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x7C, NOT_INT, "not-int", k12x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x7D, NEG_LONG, "neg-long", k12x, kIndexNone, kContinue, 0, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x7E, NOT_LONG, "not-long", k12x, kIndexNone, kContinue, 0, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x7F, NEG_FLOAT, "neg-float", k12x, kIndexNone, kContinue, 0, kVerifyRegA | kVerifyRegB) \
//   V(0x80, NEG_DOUBLE, "neg-double", k12x, kIndexNone, kContinue, 0, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x81, INT_TO_LONG, "int-to-long", k12x, kIndexNone, kContinue, kCast, kVerifyRegAWide | kVerifyRegB) \
//   V(0x82, INT_TO_FLOAT, "int-to-float", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegB) \
//   V(0x83, INT_TO_DOUBLE, "int-to-double", k12x, kIndexNone, kContinue, kCast, kVerifyRegAWide | kVerifyRegB) \
//   V(0x84, LONG_TO_INT, "long-to-int", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegBWide) \
//   V(0x85, LONG_TO_FLOAT, "long-to-float", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegBWide) \
//   V(0x86, LONG_TO_DOUBLE, "long-to-double", k12x, kIndexNone, kContinue, kCast, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x87, FLOAT_TO_INT, "float-to-int", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegB) \
//   V(0x88, FLOAT_TO_LONG, "float-to-long", k12x, kIndexNone, kContinue, kCast, kVerifyRegAWide | kVerifyRegB) \
//   V(0x89, FLOAT_TO_DOUBLE, "float-to-double", k12x, kIndexNone, kContinue, kCast, kVerifyRegAWide | kVerifyRegB) \
//   V(0x8A, DOUBLE_TO_INT, "double-to-int", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegBWide) \
//   V(0x8B, DOUBLE_TO_LONG, "double-to-long", k12x, kIndexNone, kContinue, kCast, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0x8C, DOUBLE_TO_FLOAT, "double-to-float", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegBWide) \
//   V(0x8D, INT_TO_BYTE, "int-to-byte", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegB) \
//   V(0x8E, INT_TO_CHAR, "int-to-char", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegB) \
//   V(0x8F, INT_TO_SHORT, "int-to-short", k12x, kIndexNone, kContinue, kCast, kVerifyRegA | kVerifyRegB) \
//   V(0x90, ADD_INT, "add-int", k23x, kIndexNone, kContinue, kAdd, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x91, SUB_INT, "sub-int", k23x, kIndexNone, kContinue, kSubtract, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x92, MUL_INT, "mul-int", k23x, kIndexNone, kContinue, kMultiply, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x93, DIV_INT, "div-int", k23x, kIndexNone, kContinue | kThrow, kDivide, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x94, REM_INT, "rem-int", k23x, kIndexNone, kContinue | kThrow, kRemainder, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x95, AND_INT, "and-int", k23x, kIndexNone, kContinue, kAnd, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x96, OR_INT, "or-int", k23x, kIndexNone, kContinue, kOr, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x97, XOR_INT, "xor-int", k23x, kIndexNone, kContinue, kXor, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x98, SHL_INT, "shl-int", k23x, kIndexNone, kContinue, kShl, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x99, SHR_INT, "shr-int", k23x, kIndexNone, kContinue, kShr, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x9A, USHR_INT, "ushr-int", k23x, kIndexNone, kContinue, kUshr, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0x9B, ADD_LONG, "add-long", k23x, kIndexNone, kContinue, kAdd, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0x9C, SUB_LONG, "sub-long", k23x, kIndexNone, kContinue, kSubtract, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0x9D, MUL_LONG, "mul-long", k23x, kIndexNone, kContinue, kMultiply, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0x9E, DIV_LONG, "div-long", k23x, kIndexNone, kContinue | kThrow, kDivide, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0x9F, REM_LONG, "rem-long", k23x, kIndexNone, kContinue | kThrow, kRemainder, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xA0, AND_LONG, "and-long", k23x, kIndexNone, kContinue, kAnd, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xA1, OR_LONG, "or-long", k23x, kIndexNone, kContinue, kOr, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xA2, XOR_LONG, "xor-long", k23x, kIndexNone, kContinue, kXor, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xA3, SHL_LONG, "shl-long", k23x, kIndexNone, kContinue, kShl, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegC) \
//   V(0xA4, SHR_LONG, "shr-long", k23x, kIndexNone, kContinue, kShr, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegC) \
//   V(0xA5, USHR_LONG, "ushr-long", k23x, kIndexNone, kContinue, kUshr, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegC) \
//   V(0xA6, ADD_FLOAT, "add-float", k23x, kIndexNone, kContinue, kAdd, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0xA7, SUB_FLOAT, "sub-float", k23x, kIndexNone, kContinue, kSubtract, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0xA8, MUL_FLOAT, "mul-float", k23x, kIndexNone, kContinue, kMultiply, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0xA9, DIV_FLOAT, "div-float", k23x, kIndexNone, kContinue, kDivide, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0xAA, REM_FLOAT, "rem-float", k23x, kIndexNone, kContinue, kRemainder, kVerifyRegA | kVerifyRegB | kVerifyRegC) \
//   V(0xAB, ADD_DOUBLE, "add-double", k23x, kIndexNone, kContinue, kAdd, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xAC, SUB_DOUBLE, "sub-double", k23x, kIndexNone, kContinue, kSubtract, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xAD, MUL_DOUBLE, "mul-double", k23x, kIndexNone, kContinue, kMultiply, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xAE, DIV_DOUBLE, "div-double", k23x, kIndexNone, kContinue, kDivide, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xAF, REM_DOUBLE, "rem-double", k23x, kIndexNone, kContinue, kRemainder, kVerifyRegAWide | kVerifyRegBWide | kVerifyRegCWide) \
//   V(0xB0, ADD_INT_2ADDR, "add-int/2addr", k12x, kIndexNone, kContinue, kAdd, kVerifyRegA | kVerifyRegB) \
//   V(0xB1, SUB_INT_2ADDR, "sub-int/2addr", k12x, kIndexNone, kContinue, kSubtract, kVerifyRegA | kVerifyRegB) \
//   V(0xB2, MUL_INT_2ADDR, "mul-int/2addr", k12x, kIndexNone, kContinue, kMultiply, kVerifyRegA | kVerifyRegB) \
//   V(0xB3, DIV_INT_2ADDR, "div-int/2addr", k12x, kIndexNone, kContinue | kThrow, kDivide, kVerifyRegA | kVerifyRegB) \
//   V(0xB4, REM_INT_2ADDR, "rem-int/2addr", k12x, kIndexNone, kContinue | kThrow, kRemainder, kVerifyRegA | kVerifyRegB) \
//   V(0xB5, AND_INT_2ADDR, "and-int/2addr", k12x, kIndexNone, kContinue, kAnd, kVerifyRegA | kVerifyRegB) \
//   V(0xB6, OR_INT_2ADDR, "or-int/2addr", k12x, kIndexNone, kContinue, kOr, kVerifyRegA | kVerifyRegB) \
//   V(0xB7, XOR_INT_2ADDR, "xor-int/2addr", k12x, kIndexNone, kContinue, kXor, kVerifyRegA | kVerifyRegB) \
//   V(0xB8, SHL_INT_2ADDR, "shl-int/2addr", k12x, kIndexNone, kContinue, kShl, kVerifyRegA | kVerifyRegB) \
//   V(0xB9, SHR_INT_2ADDR, "shr-int/2addr", k12x, kIndexNone, kContinue, kShr, kVerifyRegA | kVerifyRegB) \
//   V(0xBA, USHR_INT_2ADDR, "ushr-int/2addr", k12x, kIndexNone, kContinue, kUshr, kVerifyRegA | kVerifyRegB) \
//   V(0xBB, ADD_LONG_2ADDR, "add-long/2addr", k12x, kIndexNone, kContinue, kAdd, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xBC, SUB_LONG_2ADDR, "sub-long/2addr", k12x, kIndexNone, kContinue, kSubtract, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xBD, MUL_LONG_2ADDR, "mul-long/2addr", k12x, kIndexNone, kContinue, kMultiply, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xBE, DIV_LONG_2ADDR, "div-long/2addr", k12x, kIndexNone, kContinue | kThrow, kDivide, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xBF, REM_LONG_2ADDR, "rem-long/2addr", k12x, kIndexNone, kContinue | kThrow, kRemainder, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xC0, AND_LONG_2ADDR, "and-long/2addr", k12x, kIndexNone, kContinue, kAnd, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xC1, OR_LONG_2ADDR, "or-long/2addr", k12x, kIndexNone, kContinue, kOr, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xC2, XOR_LONG_2ADDR, "xor-long/2addr", k12x, kIndexNone, kContinue, kXor, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xC3, SHL_LONG_2ADDR, "shl-long/2addr", k12x, kIndexNone, kContinue, kShl, kVerifyRegAWide | kVerifyRegB) \
//   V(0xC4, SHR_LONG_2ADDR, "shr-long/2addr", k12x, kIndexNone, kContinue, kShr, kVerifyRegAWide | kVerifyRegB) \
//   V(0xC5, USHR_LONG_2ADDR, "ushr-long/2addr", k12x, kIndexNone, kContinue, kUshr, kVerifyRegAWide | kVerifyRegB) \
//   V(0xC6, ADD_FLOAT_2ADDR, "add-float/2addr", k12x, kIndexNone, kContinue, kAdd, kVerifyRegA | kVerifyRegB) \
//   V(0xC7, SUB_FLOAT_2ADDR, "sub-float/2addr", k12x, kIndexNone, kContinue, kSubtract, kVerifyRegA | kVerifyRegB) \
//   V(0xC8, MUL_FLOAT_2ADDR, "mul-float/2addr", k12x, kIndexNone, kContinue, kMultiply, kVerifyRegA | kVerifyRegB) \
//   V(0xC9, DIV_FLOAT_2ADDR, "div-float/2addr", k12x, kIndexNone, kContinue, kDivide, kVerifyRegA | kVerifyRegB) \
//   V(0xCA, REM_FLOAT_2ADDR, "rem-float/2addr", k12x, kIndexNone, kContinue, kRemainder, kVerifyRegA | kVerifyRegB) \
//   V(0xCB, ADD_DOUBLE_2ADDR, "add-double/2addr", k12x, kIndexNone, kContinue, kAdd, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xCC, SUB_DOUBLE_2ADDR, "sub-double/2addr", k12x, kIndexNone, kContinue, kSubtract, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xCD, MUL_DOUBLE_2ADDR, "mul-double/2addr", k12x, kIndexNone, kContinue, kMultiply, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xCE, DIV_DOUBLE_2ADDR, "div-double/2addr", k12x, kIndexNone, kContinue, kDivide, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xCF, REM_DOUBLE_2ADDR, "rem-double/2addr", k12x, kIndexNone, kContinue, kRemainder, kVerifyRegAWide | kVerifyRegBWide) \
//   V(0xD0, ADD_INT_LIT16, "add-int/lit16", k22s, kIndexNone, kContinue, kAdd | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD1, RSUB_INT, "rsub-int", k22s, kIndexNone, kContinue, kSubtract | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD2, MUL_INT_LIT16, "mul-int/lit16", k22s, kIndexNone, kContinue, kMultiply | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD3, DIV_INT_LIT16, "div-int/lit16", k22s, kIndexNone, kContinue | kThrow, kDivide | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD4, REM_INT_LIT16, "rem-int/lit16", k22s, kIndexNone, kContinue | kThrow, kRemainder | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD5, AND_INT_LIT16, "and-int/lit16", k22s, kIndexNone, kContinue, kAnd | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD6, OR_INT_LIT16, "or-int/lit16", k22s, kIndexNone, kContinue, kOr | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD7, XOR_INT_LIT16, "xor-int/lit16", k22s, kIndexNone, kContinue, kXor | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD8, ADD_INT_LIT8, "add-int/lit8", k22b, kIndexNone, kContinue, kAdd | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xD9, RSUB_INT_LIT8, "rsub-int/lit8", k22b, kIndexNone, kContinue, kSubtract | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xDA, MUL_INT_LIT8, "mul-int/lit8", k22b, kIndexNone, kContinue, kMultiply | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xDB, DIV_INT_LIT8, "div-int/lit8", k22b, kIndexNone, kContinue | kThrow, kDivide | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xDC, REM_INT_LIT8, "rem-int/lit8", k22b, kIndexNone, kContinue | kThrow, kRemainder | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xDD, AND_INT_LIT8, "and-int/lit8", k22b, kIndexNone, kContinue, kAnd | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xDE, OR_INT_LIT8, "or-int/lit8", k22b, kIndexNone, kContinue, kOr | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xDF, XOR_INT_LIT8, "xor-int/lit8", k22b, kIndexNone, kContinue, kXor | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xE0, SHL_INT_LIT8, "shl-int/lit8", k22b, kIndexNone, kContinue, kShl | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xE1, SHR_INT_LIT8, "shr-int/lit8", k22b, kIndexNone, kContinue, kShr | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xE2, USHR_INT_LIT8, "ushr-int/lit8", k22b, kIndexNone, kContinue, kUshr | kRegCFieldOrConstant, kVerifyRegA | kVerifyRegB) \
//   V(0xE3, UNUSED_E3, "unused-e3", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xE4, UNUSED_E4, "unused-e4", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xE5, UNUSED_E5, "unused-e5", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xE6, UNUSED_E6, "unused-e6", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xE7, UNUSED_E7, "unused-e7", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xE8, UNUSED_E8, "unused-e8", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xE9, UNUSED_E9, "unused-e9", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xEA, UNUSED_EA, "unused-ea", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xEB, UNUSED_EB, "unused-eb", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xEC, UNUSED_EC, "unused-ec", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xED, UNUSED_ED, "unused-ed", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xEE, UNUSED_EE, "unused-ee", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xEF, UNUSED_EF, "unused-ef", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF0, UNUSED_F0, "unused-f0", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF1, UNUSED_F1, "unused-f1", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF2, UNUSED_F2, "unused-f2", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF3, UNUSED_F3, "unused-f3", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF4, UNUSED_F4, "unused-f4", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF5, UNUSED_F5, "unused-f5", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF6, UNUSED_F6, "unused-f6", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF7, UNUSED_F7, "unused-f7", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF8, UNUSED_F8, "unused-f8", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xF9, UNUSED_F9, "unused-f9", k10x, kIndexUnknown, 0, 0, kVerifyError) \
//   V(0xFA, INVOKE_POLYMORPHIC, "invoke-polymorphic", k45cc, kIndexMethodAndProtoRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgNonZero | kVerifyRegHPrototype) \
//   V(0xFB, INVOKE_POLYMORPHIC_RANGE, "invoke-polymorphic/range", k4rcc, kIndexMethodAndProtoRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgRangeNonZero | kVerifyRegHPrototype) \
//   V(0xFC, INVOKE_CUSTOM, "invoke-custom", k35c, kIndexCallSiteRef, kContinue | kThrow, 0, kVerifyRegBCallSite | kVerifyVarArg) \
//   V(0xFD, INVOKE_CUSTOM_RANGE, "invoke-custom/range", k3rc, kIndexCallSiteRef, kContinue | kThrow, 0, kVerifyRegBCallSite | kVerifyVarArgRange) \
//   V(0xFE, CONST_METHOD_HANDLE, "const-method-handle", k21c, kIndexMethodHandleRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBMethodHandle) \
//   V(0xFF, CONST_METHOD_TYPE, "const-method-type", k21c, kIndexProtoRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBPrototype)

// ref https://cs.android.com/android/platform/superproject/+/master:art/libdexfile/dex/dex_instruction_list.h,l=20,bpv=0,bpt=0?q=UNUSED_3E&ss=android%2Fplatform%2Fsuperproject

export class Opcode {
    static NOP = 0x00
    static MOVE = 0x01
    static MOVE_FROM16 = 0x02
    static MOVE_16 = 0x03
    static MOVE_WIDE = 0x04
    static MOVE_WIDE_FROM16 = 0x05
    static MOVE_WIDE_16 = 0x06
    static MOVE_OBJECT = 0x07
    static MOVE_OBJECT_FROM16 = 0x08
    static MOVE_OBJECT_16 = 0x09
    static MOVE_RESULT = 0x0a
    static MOVE_RESULT_WIDE = 0x0b
    static MOVE_RESULT_OBJECT = 0x0c
    static MOVE_EXCEPTION = 0x0d
    static RETURN_VOID = 0x0e
    static RETURN = 0x0f
    static RETURN_WIDE = 0x10
    static RETURN_OBJECT = 0x11
    static CONST_4 = 0x12
    static CONST_16 = 0x13
    static CONST = 0x14
    static CONST_HIGH16 = 0x15
    static CONST_WIDE_16 = 0x16
    static CONST_WIDE_32 = 0x17
    static CONST_WIDE = 0x18
    static CONST_WIDE_HIGH16 = 0x19
    static CONST_STRING = 0x1a
    static CONST_STRING_JUMBO = 0x1b
    static CONST_CLASS = 0x1c
    static MONITOR_ENTER = 0x1d
    static MONITOR_EXIT = 0x1e
    static CHECK_CAST = 0x1f
    static INSTANCE_OF = 0x20
    static ARRAY_LENGTH = 0x21
    static NEW_INSTANCE = 0x22
    static NEW_ARRAY = 0x23
    static FILLED_NEW_ARRAY = 0x24
    static FILLED_NEW_ARRAY_RANGE = 0x25
    static FILL_ARRAY_DATA = 0x26
    static THROW = 0x27
    static GOTO = 0x28
    static GOTO_16 = 0x29
    static GOTO_32 = 0x2a
    static PACKED_SWITCH = 0x2b
    static SPARSE_SWITCH = 0x2c
    static CMPL_FLOAT = 0x2d
    static CMPG_FLOAT = 0x2e
    static CMPL_DOUBLE = 0x2f
    static CMPG_DOUBLE = 0x30
    static CMP_LONG = 0x31
    static IF_EQ = 0x32
    static IF_NE = 0x33
    static IF_LT = 0x34
    static IF_GE = 0x35
    static IF_GT = 0x36
    static IF_LE = 0x37
    static IF_EQZ = 0x38
    static IF_NEZ = 0x39
    static IF_LTZ = 0x3a
    static IF_GEZ = 0x3b
    static IF_GTZ = 0x3c
    static IF_LEZ = 0x3d

    //   V(0x3E, UNUSED_3E, "unused-3e", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0x3F, UNUSED_3F, "unused-3f", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0x40, UNUSED_40, "unused-40", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0x41, UNUSED_41, "unused-41", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0x42, UNUSED_42, "unused-42", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0x43, UNUSED_43, "unused-43", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    static UNUSED_3E = 0x3E
    static UNUSED_3F = 0x3F
    static UNUSED_40 = 0x40
    static UNUSED_41 = 0x41
    static UNUSED_42 = 0x42
    static UNUSED_43 = 0x43

    static AGET = 0x44
    static AGET_WIDE = 0x45
    static AGET_OBJECT = 0x46
    static AGET_BOOLEAN = 0x47
    static AGET_BYTE = 0x48
    static AGET_CHAR = 0x49
    static AGET_SHORT = 0x4a
    static APUT = 0x4b
    static APUT_WIDE = 0x4c
    static APUT_OBJECT = 0x4d
    static APUT_BOOLEAN = 0x4e
    static APUT_BYTE = 0x4f
    static APUT_CHAR = 0x50
    static APUT_SHORT = 0x51
    static IGET = 0x52
    static IGET_WIDE = 0x53
    static IGET_OBJECT = 0x54
    static IGET_BOOLEAN = 0x55
    static IGET_BYTE = 0x56
    static IGET_CHAR = 0x57
    static IGET_SHORT = 0x58
    static IPUT = 0x59
    static IPUT_WIDE = 0x5a
    static IPUT_OBJECT = 0x5b
    static IPUT_BOOLEAN = 0x5c
    static IPUT_BYTE = 0x5d
    static IPUT_CHAR = 0x5e
    static IPUT_SHORT = 0x5f
    static SGET = 0x60
    static SGET_WIDE = 0x61
    static SGET_OBJECT = 0x62
    static SGET_BOOLEAN = 0x63
    static SGET_BYTE = 0x64
    static SGET_CHAR = 0x65
    static SGET_SHORT = 0x66
    static SPUT = 0x67
    static SPUT_WIDE = 0x68
    static SPUT_OBJECT = 0x69
    static SPUT_BOOLEAN = 0x6a
    static SPUT_BYTE = 0x6b
    static SPUT_CHAR = 0x6c
    static SPUT_SHORT = 0x6d
    static INVOKE_VIRTUAL = 0x6e
    static INVOKE_SUPER = 0x6f
    static INVOKE_DIRECT = 0x70
    static INVOKE_STATIC = 0x71
    static INVOKE_INTERFACE = 0x72

    //   V(0x73, UNUSED_73, "unused-73", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    static UNUSED_73 = 0x73

    static INVOKE_VIRTUAL_RANGE = 0x74
    static INVOKE_SUPER_RANGE = 0x75
    static INVOKE_DIRECT_RANGE = 0x76
    static INVOKE_STATIC_RANGE = 0x77
    static INVOKE_INTERFACE_RANGE = 0x78

    //   V(0x79, UNUSED_79, "unused-79", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0x7A, UNUSED_7A, "unused-7a", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    static UNUSED_79 = 0x79
    static UNUSED_7A = 0x7a

    static NEG_INT = 0x7b
    static NOT_INT = 0x7c
    static NEG_LONG = 0x7d
    static NOT_LONG = 0x7e
    static NEG_FLOAT = 0x7f
    static NEG_DOUBLE = 0x80
    static INT_TO_LONG = 0x81
    static INT_TO_FLOAT = 0x82
    static INT_TO_DOUBLE = 0x83
    static LONG_TO_INT = 0x84
    static LONG_TO_FLOAT = 0x85
    static LONG_TO_DOUBLE = 0x86
    static FLOAT_TO_INT = 0x87
    static FLOAT_TO_LONG = 0x88
    static FLOAT_TO_DOUBLE = 0x89
    static DOUBLE_TO_INT = 0x8a
    static DOUBLE_TO_LONG = 0x8b
    static DOUBLE_TO_FLOAT = 0x8c
    static INT_TO_BYTE = 0x8d
    static INT_TO_CHAR = 0x8e
    static INT_TO_SHORT = 0x8f
    static ADD_INT = 0x90
    static SUB_INT = 0x91
    static MUL_INT = 0x92
    static DIV_INT = 0x93
    static REM_INT = 0x94
    static AND_INT = 0x95
    static OR_INT = 0x96
    static XOR_INT = 0x97
    static SHL_INT = 0x98
    static SHR_INT = 0x99
    static USHR_INT = 0x9a
    static ADD_LONG = 0x9b
    static SUB_LONG = 0x9c
    static MUL_LONG = 0x9d
    static DIV_LONG = 0x9e
    static REM_LONG = 0x9f
    static AND_LONG = 0xa0
    static OR_LONG = 0xa1
    static XOR_LONG = 0xa2
    static SHL_LONG = 0xa3
    static SHR_LONG = 0xa4
    static USHR_LONG = 0xa5
    static ADD_FLOAT = 0xa6
    static SUB_FLOAT = 0xa7
    static MUL_FLOAT = 0xa8
    static DIV_FLOAT = 0xa9
    static REM_FLOAT = 0xaa
    static ADD_DOUBLE = 0xab
    static SUB_DOUBLE = 0xac
    static MUL_DOUBLE = 0xad
    static DIV_DOUBLE = 0xae
    static REM_DOUBLE = 0xaf
    static ADD_INT_2ADDR = 0xb0
    static SUB_INT_2ADDR = 0xb1
    static MUL_INT_2ADDR = 0xb2
    static DIV_INT_2ADDR = 0xb3
    static REM_INT_2ADDR = 0xb4
    static AND_INT_2ADDR = 0xb5
    static OR_INT_2ADDR = 0xb6
    static XOR_INT_2ADDR = 0xb7
    static SHL_INT_2ADDR = 0xb8
    static SHR_INT_2ADDR = 0xb9
    static USHR_INT_2ADDR = 0xba
    static ADD_LONG_2ADDR = 0xbb
    static SUB_LONG_2ADDR = 0xbc
    static MUL_LONG_2ADDR = 0xbd
    static DIV_LONG_2ADDR = 0xbe
    static REM_LONG_2ADDR = 0xbf
    static AND_LONG_2ADDR = 0xc0
    static OR_LONG_2ADDR = 0xc1
    static XOR_LONG_2ADDR = 0xc2
    static SHL_LONG_2ADDR = 0xc3
    static SHR_LONG_2ADDR = 0xc4
    static USHR_LONG_2ADDR = 0xc5
    static ADD_FLOAT_2ADDR = 0xc6
    static SUB_FLOAT_2ADDR = 0xc7
    static MUL_FLOAT_2ADDR = 0xc8
    static DIV_FLOAT_2ADDR = 0xc9
    static REM_FLOAT_2ADDR = 0xca
    static ADD_DOUBLE_2ADDR = 0xcb
    static SUB_DOUBLE_2ADDR = 0xcc
    static MUL_DOUBLE_2ADDR = 0xcd
    static DIV_DOUBLE_2ADDR = 0xce
    static REM_DOUBLE_2ADDR = 0xcf
    static ADD_INT_LIT16 = 0xd0
    static RSUB_INT = 0xd1
    static MUL_INT_LIT16 = 0xd2
    static DIV_INT_LIT16 = 0xd3
    static REM_INT_LIT16 = 0xd4
    static AND_INT_LIT16 = 0xd5
    static OR_INT_LIT16 = 0xd6
    static XOR_INT_LIT16 = 0xd7
    static ADD_INT_LIT8 = 0xd8
    static RSUB_INT_LIT8 = 0xd9
    static MUL_INT_LIT8 = 0xda
    static DIV_INT_LIT8 = 0xdb
    static REM_INT_LIT8 = 0xdc
    static AND_INT_LIT8 = 0xdd
    static OR_INT_LIT8 = 0xde
    static XOR_INT_LIT8 = 0xdf
    static SHL_INT_LIT8 = 0xe0
    static SHR_INT_LIT8 = 0xe1
    static USHR_INT_LIT8 = 0xe2

    //   V(0xE3, UNUSED_E3, "unused-e3", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xE4, UNUSED_E4, "unused-e4", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xE5, UNUSED_E5, "unused-e5", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xE6, UNUSED_E6, "unused-e6", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xE7, UNUSED_E7, "unused-e7", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xE8, UNUSED_E8, "unused-e8", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xE9, UNUSED_E9, "unused-e9", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xEA, UNUSED_EA, "unused-ea", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xEB, UNUSED_EB, "unused-eb", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xEC, UNUSED_EC, "unused-ec", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xED, UNUSED_ED, "unused-ed", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xEE, UNUSED_EE, "unused-ee", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xEF, UNUSED_EF, "unused-ef", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF0, UNUSED_F0, "unused-f0", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF1, UNUSED_F1, "unused-f1", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF2, UNUSED_F2, "unused-f2", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF3, UNUSED_F3, "unused-f3", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF4, UNUSED_F4, "unused-f4", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF5, UNUSED_F5, "unused-f5", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF6, UNUSED_F6, "unused-f6", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF7, UNUSED_F7, "unused-f7", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF8, UNUSED_F8, "unused-f8", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    //   V(0xF9, UNUSED_F9, "unused-f9", k10x, kIndexUnknown, 0, 0, kVerifyError) \
    static UNUSED_E3 = 0xe3
    static UNUSED_E4 = 0xe4
    static UNUSED_E5 = 0xe5
    static UNUSED_E6 = 0xe6
    static UNUSED_E7 = 0xe7
    static UNUSED_E8 = 0xe8
    static UNUSED_E9 = 0xe9
    static UNUSED_EA = 0xea
    static UNUSED_EB = 0xeb
    static UNUSED_EC = 0xec
    static UNUSED_ED = 0xed
    static UNUSED_EE = 0xee
    static UNUSED_EF = 0xef
    static UNUSED_F0 = 0xf0
    static UNUSED_F1 = 0xf1
    static UNUSED_F2 = 0xf2
    static UNUSED_F3 = 0xf3
    static UNUSED_F4 = 0xf4
    static UNUSED_F5 = 0xf5
    static UNUSED_F6 = 0xf6
    static UNUSED_F7 = 0xf7
    static UNUSED_F8 = 0xf8
    static UNUSED_F9 = 0xf9

    //   V(0xFA, INVOKE_POLYMORPHIC, "invoke-polymorphic", k45cc, kIndexMethodAndProtoRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgNonZero | kVerifyRegHPrototype) \
    //   V(0xFB, INVOKE_POLYMORPHIC_RANGE, "invoke-polymorphic/range", k4rcc, kIndexMethodAndProtoRef, kContinue | kThrow | kInvoke, 0, kVerifyRegBMethod | kVerifyVarArgRangeNonZero | kVerifyRegHPrototype) \
    //   V(0xFC, INVOKE_CUSTOM, "invoke-custom", k35c, kIndexCallSiteRef, kContinue | kThrow, 0, kVerifyRegBCallSite | kVerifyVarArg) \
    //   V(0xFD, INVOKE_CUSTOM_RANGE, "invoke-custom/range", k3rc, kIndexCallSiteRef, kContinue | kThrow, 0, kVerifyRegBCallSite | kVerifyVarArgRange) \
    //   V(0xFE, CONST_METHOD_HANDLE, "const-method-handle", k21c, kIndexMethodHandleRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBMethodHandle) \
    //   V(0xFF, CONST_METHOD_TYPE, "const-method-type", k21c, kIndexProtoRef, kContinue | kThrow, 0, kVerifyRegA | kVerifyRegBPrototype)
    static INVOKE_POLYMORPHIC = 0xfa
    static INVOKE_POLYMORPHIC_RANGE = 0xfb
    static INVOKE_CUSTOM = 0xfc
    static INVOKE_CUSTOM_RANGE = 0xfd
    static CONST_METHOD_HANDLE = 0xfe
    static CONST_METHOD_TYPE = 0xff

    static CONST_CLASS_JUMBO = 0x00ff
    static CHECK_CAST_JUMBO = 0x01ff
    static INSTANCE_OF_JUMBO = 0x02ff
    static NEW_INSTANCE_JUMBO = 0x03ff
    static NEW_ARRAY_JUMBO = 0x04ff
    static FILLED_NEW_ARRAY_JUMBO = 0x05ff
    static IGET_JUMBO = 0x06ff
    static IGET_WIDE_JUMBO = 0x07ff
    static IGET_OBJECT_JUMBO = 0x08ff
    static IGET_BOOLEAN_JUMBO = 0x09ff
    static IGET_BYTE_JUMBO = 0x0aff
    static IGET_CHAR_JUMBO = 0x0bff
    static IGET_SHORT_JUMBO = 0x0cff
    static IPUT_JUMBO = 0x0dff
    static IPUT_WIDE_JUMBO = 0x0eff
    static IPUT_OBJECT_JUMBO = 0x0fff
    static IPUT_BOOLEAN_JUMBO = 0x10ff
    static IPUT_BYTE_JUMBO = 0x11ff
    static IPUT_CHAR_JUMBO = 0x12ff
    static IPUT_SHORT_JUMBO = 0x13ff
    static SGET_JUMBO = 0x14ff
    static SGET_WIDE_JUMBO = 0x15ff
    static SGET_OBJECT_JUMBO = 0x16ff
    static SGET_BOOLEAN_JUMBO = 0x17ff
    static SGET_BYTE_JUMBO = 0x18ff
    static SGET_CHAR_JUMBO = 0x19ff
    static SGET_SHORT_JUMBO = 0x1aff
    static SPUT_JUMBO = 0x1bff
    static SPUT_WIDE_JUMBO = 0x1cff
    static SPUT_OBJECT_JUMBO = 0x1dff
    static SPUT_BOOLEAN_JUMBO = 0x1eff
    static SPUT_BYTE_JUMBO = 0x1fff
    static SPUT_CHAR_JUMBO = 0x20ff
    static SPUT_SHORT_JUMBO = 0x21ff
    static INVOKE_VIRTUAL_JUMBO = 0x22ff
    static INVOKE_SUPER_JUMBO = 0x23ff
    static INVOKE_DIRECT_JUMBO = 0x24ff
    static INVOKE_STATIC_JUMBO = 0x25ff
    static INVOKE_INTERFACE_JUMBO = 0x26ff

    static getOpName(op: number): string {
        const names = Object.getOwnPropertyNames(this)
        return names.find(name => this[name] === op) || 'UNKNOWN'
    }

}

Reflect.set(globalThis, 'OpCode', Opcode)