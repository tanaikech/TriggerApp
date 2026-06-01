/**
 * Ultimate Comprehensive Test Suite for TriggerApp v2.0.0 (Library Usage)
 *
 * Instructions:
 * 1. Ensure TriggerApp is installed as a library with identifier `TriggerApp`.
 * 2. Overwrite your current test script with this file.
 * 3. Run `runComprehensiveTests`.
 * 4. Verify all tests pass and resources are cleaned up.
 */

function runComprehensiveTests() {
  console.log(
    "Starting Ultimate Comprehensive Validation Tests for TriggerApp v2.0.0...",
  );

  TriggerApp.deleteAllTriggers();
  console.log("System Cleaned. Proceeding to tests...");

  const baseDate = new Date("2024-01-01T00:00:00.000"); // Monday

  try {
    // --- Test 1 to 3: Basic Verification ---
    runBasicTests(baseDate);

    // --- Test 4: Continuous Triggers & setMaxOutputForSimulation ---
    const testContinuous = [
      {
        ownFunctionName: "runComprehensiveTests",
        functionName: "dummyTask",
        everyDay: true,
        interval: 600,
        fromTime: "10:00",
        toTime: "15:00",
      },
    ];
    const simLimit = TriggerApp.setCustomNow(baseDate)
      .setMaxOutputForSimulation(3)
      .simulateTriggers(testContinuous);

    if (simLimit.length !== 3) {
      throw new Error(
        `Test 4 Failed. Expected exactly 3 results, got ${simLimit.length}.`,
      );
    }
    console.log("Test 4 (Continuous Triggers & Max Output): PASSED");

    // --- Test 5: Weekly Triggers & setEase ---
    const testWeekly = [
      {
        ownFunctionName: "runComprehensiveTests",
        functionName: "dummyTask",
        everyWeek: ["Wednesday", "Friday"], // Jan 1 is Mon, Wed is Jan 3.
        atTimes: ["09:00:00"],
        toDay: "2024-01-10T00:00:00.000",
      },
    ];
    const simWeekly = TriggerApp.setCustomNow(baseDate)
      .setEase(120)
      .simulateTriggers(testWeekly);

    if (
      simWeekly[0].triggerTime.getDate() !== 3 ||
      simWeekly[0].triggerTime.getHours() !== 9
    ) {
      throw new Error("Test 5 Failed. Weekly calculation failed.");
    }
    console.log("Test 5 (Weekly Triggers & Ease Threshold): PASSED");

    // --- Test 6: Pipeline from simulateTriggers to installTriggersByData ---
    const testPipeline = [
      {
        ownFunctionName: "runComprehensiveTests",
        functionName: "dummyTask3",
        everyMonth: [10],
        atTimes: ["14:00:00"],
        toDay: "2024-03-01T00:00:00.000",
      },
    ];
    const pipelineSim =
      TriggerApp.setCustomNow(baseDate).simulateTriggers(testPipeline);
    const pipelineInstall = TriggerApp.setCustomNow(
      baseDate,
    ).installTriggersByData({
      ownFunctionName: "runComprehensiveTests",
      data: pipelineSim,
    });

    if (
      !pipelineInstall["dummyTask3"] ||
      !pipelineInstall["runComprehensiveTests"]
    ) {
      throw new Error("Test 6 Failed. installTriggersByData failed.");
    }
    console.log("Test 6 (Data Installation Pipeline): PASSED");

    // --- Test 7: setScriptWaitTime & setDiffTriggerTime ---
    const testWaitObj = [
      {
        ownFunctionName: "runComprehensiveTests",
        functionName: "dummyTask4",
        atTimes: ["12:00:00"],
        everyDay: true,
        toDay: "2024-01-02T00:00:00.000",
      },
    ];
    const startMs = Date.now();
    const waitResponse = TriggerApp.setCustomNow(baseDate)
      .setScriptWaitTime(2)
      .setDiffTriggerTime(300)
      .installTriggers(testWaitObj, () => {});

    if (Date.now() - startMs < 2000)
      throw new Error("Test 7 Failed. setScriptWaitTime failed.");
    if (
      waitResponse["runComprehensiveTests"].triggerDateTime.getTime() -
        waitResponse["dummyTask4"].triggerDateTime.getTime() !==
      300000
    ) {
      throw new Error(
        "Test 7 Failed. setDiffTriggerTime calculation mismatch.",
      );
    }
    console.log("Test 7 (Thread Sleep & Custom Trigger Diff): PASSED");

    // --- Test 8: Strict Error Handling (Manual Execution) ---
    const testError = [
      {
        ownFunctionName: "runComprehensiveTests",
        functionName: "dummyTask",
        everyDay: true,
        interval: 30, // Illegally small interval
        fromTime: "10:00",
        toTime: "11:00",
      },
    ];
    let errorCaught = false;
    try {
      // Must use installTriggers without Event Object to trigger validation
      TriggerApp.setCustomNow(baseDate).installTriggers(testError, () => {});
    } catch (e) {
      errorCaught = true;
    }
    if (!errorCaught)
      throw new Error(
        "Test 8 Failed. Interval validation bypassed incorrectly.",
      );
    console.log("Test 8 (Strict Error Handling Validation): PASSED");

    // --- Test 9: Bypass Validation with Event Object ---
    // Simulating execution from an actual trigger. Validation should be bypassed.
    let bypassSuccess = false;
    try {
      TriggerApp.setEventObject({ authMode: "FULL", triggerUid: "12345" })
        .setCustomNow(baseDate)
        .installTriggers(testError, () => {});
      bypassSuccess = true;
    } catch (e) {
      bypassSuccess = false;
    }
    if (!bypassSuccess)
      throw new Error(
        "Test 9 Failed. Validation incorrectly triggered despite Event Object presence.",
      );
    console.log("Test 9 (Event Object Validation Bypass): PASSED");

    // --- Test 10: Task Collision Error (Scenario 7 from README) ---
    const testCollision = [
      {
        ownFunctionName: "runComprehensiveTests",
        functionName: "dummyTask",
        atTimes: ["10:00:00"],
        everyDay: true,
      },
      {
        ownFunctionName: "runComprehensiveTests",
        functionName: "dummyTask2",
        atTimes: ["10:00:00"], // Collision: same time
        everyDay: true,
      },
    ];
    let collisionCaught = false;
    try {
      TriggerApp.setCustomNow(baseDate).installTriggers(
        testCollision,
        () => {},
      );
    } catch (e) {
      if (
        e.message.includes(
          "The interval between the current trigger and the next trigger is small",
        )
      ) {
        collisionCaught = true;
      }
    }
    if (!collisionCaught)
      throw new Error("Test 10 Failed. Task collision error was not caught.");
    console.log("Test 10 (Task Collision Error Detection): PASSED");
  } catch (error) {
    console.error(`ULTIMATE TEST HARNESS ABORTED: ${error.message}`);
  } finally {
    TriggerApp.deleteAllTriggers();
    console.log(
      "Ultimate validation complete. All physical triggers securely deleted.",
    );
  }
}

/**
 * Helper to run the basic test cases.
 */
function runBasicTests(baseDate) {
  const testObj1 = [
    {
      ownFunctionName: "runComprehensiveTests",
      functionName: "dummyTask",
      everyMonth: [15],
      atTimes: ["09:00:00"],
      toDay: "2024-02-01T00:00:00.000",
    },
  ];

  const sim = TriggerApp.setCustomNow(baseDate).simulateTriggers(testObj1);
  if (sim.length !== 1) throw new Error("Basic Test 1 Failed.");
  console.log("Test 1 (Simulation): PASSED");

  const inst = TriggerApp.setCustomNow(baseDate).installTriggers(
    testObj1,
    () => {},
  );
  if (!inst["dummyTask"]) throw new Error("Basic Test 2 Failed.");
  console.log("Test 2 (Installation): PASSED");

  const offsetSim = TriggerApp.setCustomNow(baseDate)
    .setTriggerOffsetTime(15)
    .simulateTriggers(testObj1);
  if (offsetSim[0].triggerTime.getSeconds() !== 15)
    throw new Error("Basic Test 3 Failed.");
  console.log("Test 3 (Offset Calculation): PASSED");
}

// Mock target functions
function dummyTask() {
  return true;
}
function dummyTask2() {
  return true;
}
function dummyTask3() {
  return true;
}
function dummyTask4() {
  return true;
}
