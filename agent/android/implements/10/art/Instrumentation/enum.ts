export enum InterpreterHandlerTable {
    kMainHandlerTable = 0,          // Main handler table: no suspend check, no instrumentation.
    kAlternativeHandlerTable = 1,   // Alternative handler table: suspend check and/or instrumentation
    // enabled.
    kNumHandlerTables
}

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

export enum InstrumentationLevel {
    kInstrumentNothing,                   // execute without instrumentation
    kInstrumentWithInstrumentationStubs,  // execute with instrumentation entry/exit stubs
    kInstrumentWithInterpreter            // execute with interpreter
}