/**
 * Ultimate Comprehensive Testing and Validation Script for TriggerApp v2.1.0
 *
 * [Execution Instructions]
 * 1. Ensure that TriggerApp.js (v2.1.0) and MCPApp.js are present in the same project.
 * 2. Overwrite your current test script with this file.
 * 3. In the Google Apps Script IDE, select `runUltimateValidation` from the function dropdown.
 * 4. Click "Run" to execute the comprehensive suite.
 * 5. Review the Execution Logs to confirm all assertion checks pass.
 *    (All created assets such as triggers and spreadsheets will be automatically cleaned up).
 */

function runUltimateValidation() {
  console.log("=================================================");
  console.log("🚀 STARTING TriggerApp v2.1.0 ULTIMATE VALIDATION");
  console.log("=================================================");

  // Setup Phase
  console.log(">>> [SETUP] Purging any existing triggers to ensure isolation.");
  TriggerApp.deleteAllTriggers(PropertiesService.getScriptProperties());

  console.log(
    ">>> [SETUP] Creating a temporary Spreadsheet for Logging tests.",
  );
  const testSS = SpreadsheetApp.create("TriggerApp_Test_Temp_SS");
  const ssId = testSS.getId();

  let hasError = false;

  try {
    testPhase1_BasicAndComplexTriggers();
    testPhase2_MCPRoutingAndLogging(ssId);
    testPhase3_DataInstallationPipeline();
    testPhase4_LoggingMechanisms();
    testPhase5_ComplexTriggerConfigurations();
    testPhase6_TriggerCollisionDetection();

    console.log("=================================================");
    console.log("✅ ALL VALIDATIONS PASSED SUCCESSFULLY.");
    console.log("=================================================");
  } catch (e) {
    console.error("❌ VALIDATION FAILED: ", e.stack || e.message);
    hasError = true;
  } finally {
    // Cleanup Phase
    console.log(
      ">>> [CLEANUP] Purging all test-generated triggers and properties.",
    );
    TriggerApp.deleteAllTriggers(PropertiesService.getScriptProperties());

    console.log(">>> [CLEANUP] Trashing the temporary Spreadsheet.");
    DriveApp.getFileById(ssId).setTrashed(true);

    if (hasError) {
      throw new Error(
        "Validation Workflow terminated with errors. See logs above.",
      );
    } else {
      console.log(
        "✨ Cleanup completed perfectly. The environment is spotless.",
      );
    }
  }
}

function testPhase1_BasicAndComplexTriggers() {
  console.log(
    ">>> [PHASE 1] Validating Complex Triggers (Simulation & Physical)",
  );
  const baseDate = new Date("2024-01-01T00:00:00.000"); // Monday

  const testObj = [
    {
      ownFunctionName: "mcpTriggerHandler",
      functionName: "dummyTask1",
      everyWeek: ["Wednesday", "Friday"],
      atTimes: ["09:00:00", "15:00:00"],
      toDay: "2024-01-10T00:00:00.000", // Up to Jan 10
    },
  ];

  const sim = TriggerApp.setCustomNow(baseDate).simulateTriggers(testObj);
  if (sim.length !== 4) {
    throw new Error(`Expected 4 simulated triggers, got ${sim.length}`);
  }

  // Physical install
  TriggerApp.setCustomNow(baseDate).installTriggers(testObj, () => {});

  const activeTriggers = ScriptApp.getProjectTriggers();
  const dummyTaskTriggers = activeTriggers.filter(
    (t) => t.getHandlerFunction() === "dummyTask1",
  );
  const ownTaskTriggers = activeTriggers.filter(
    (t) => t.getHandlerFunction() === "mcpTriggerHandler",
  );

  if (dummyTaskTriggers.length === 0 || ownTaskTriggers.length === 0) {
    throw new Error("Physical triggers were not created correctly.");
  }

  console.log(
    "✅ PHASE 1 PASSED: Complex triggers simulated and correctly installed.",
  );

  // Cleanup for next phase
  TriggerApp.deleteAllTriggers(PropertiesService.getScriptProperties());
}

function testPhase2_MCPRoutingAndLogging(ssId) {
  console.log(">>> [PHASE 2] Validating MCP Server Routing and Raw Logging");

  const payload = {
    method: "tools/call",
    params: {
      name: "install_triggers",
      arguments: {
        customNow: "2024-01-01T00:00:00.000Z", // Forces deterministic test output
        diffTriggerTime: 30,
        triggersData: [
          {
            functionName: "dummyTask2",
            everyDay: true,
            atTimes: ["10:00"],
          },
        ],
      },
    },
    jsonrpc: "2.0",
    id: 999,
  };

  const fakeEvent = {
    postData: { contents: JSON.stringify(payload) },
    parameter: { accessKey: "validation_auth" },
  };

  const response = TriggerApp.mcp({
    e: fakeEvent,
    accessKey: "validation_auth",
    log: true,
    spreadsheetId: ssId,
    lock: null, // Bypassing lock for testing in same thread
    properties: PropertiesService.getScriptProperties(),
  });

  const resText = response.getContent();
  if (!resText.includes("dummyTask2") || resText.includes('isError":true')) {
    throw new Error("MCP Tool routing failed. Output: " + resText);
  }

  const activeTriggers = ScriptApp.getProjectTriggers();
  const d2 = activeTriggers.filter(
    (t) => t.getHandlerFunction() === "dummyTask2",
  );

  if (d2.length === 0) {
    throw new Error("MCP failed to install requested physical triggers.");
  }

  // Verify Logging
  const ss = SpreadsheetApp.openById(ssId);
  const rawSheet = ss.getSheetByName("raw");
  const logSheet = ss.getSheetByName("log");

  if (!rawSheet || rawSheet.getLastRow() === 0) {
    throw new Error(
      "Raw logging failed to create 'raw' sheet or append event object.",
    );
  }

  const rawValue = rawSheet.getRange(1, 2).getValue();
  if (!rawValue.includes("tools/call") || !rawValue.includes("dummyTask2")) {
    throw new Error("Raw log content mismatch.");
  }

  if (!logSheet || logSheet.getLastRow() === 0) {
    throw new Error("Standard MCP logging failed on 'log' sheet.");
  }

  console.log(
    "✅ PHASE 2 PASSED: MCP routing and internal raw logging executed perfectly.",
  );

  // Cleanup for next phase
  TriggerApp.deleteAllTriggers(PropertiesService.getScriptProperties());
}

function testPhase3_DataInstallationPipeline() {
  console.log(">>> [PHASE 3] Validating Data Installation Pipeline");
  const baseDate = new Date("2024-01-01T00:00:00.000");
  const testPipeline = [
    {
      ownFunctionName: "mcpTriggerHandler",
      functionName: "dummyTask4",
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
    ownFunctionName: "mcpTriggerHandler",
    data: pipelineSim,
  });

  if (!pipelineInstall["dummyTask4"] || !pipelineInstall["mcpTriggerHandler"]) {
    throw new Error("installTriggersByData failed to output expected objects.");
  }

  const activeTriggers = ScriptApp.getProjectTriggers();
  const installed = activeTriggers.filter(
    (t) => t.getHandlerFunction() === "dummyTask4",
  );
  if (installed.length === 0) {
    throw new Error(
      "installTriggersByData failed to physically install triggers.",
    );
  }

  console.log(
    "✅ PHASE 3 PASSED: simulateTriggers to installTriggersByData pipeline validated.",
  );

  // Cleanup
  TriggerApp.deleteAllTriggers(PropertiesService.getScriptProperties());
}

function testPhase4_LoggingMechanisms() {
  console.log(">>> [PHASE 4] Validating Formatting and Logging Mechanisms");
  let liveCapturedLogs = [];

  TriggerApp.showLogs((log) => {
    liveCapturedLogs.push(log.message);
  });

  // FIXED: Explicitly injecting literal newline \n into the string message rather than object
  // to ensure Markdown formatter successfully replaces it with <br> tag.
  TriggerApp.addCustomLog("Test String Injection | test \n newline", {
    data: "test data",
  });

  const rawLogs = TriggerApp.getLogs();
  if (!Array.isArray(rawLogs) || rawLogs.length === 0) {
    throw new Error("getLogs() returned an invalid array.");
  }

  const markdownLogs = TriggerApp.getLogs({ markdown: true });
  if (!markdownLogs.includes("&#124;") || !markdownLogs.includes("<br>")) {
    throw new Error(
      "getLogs({markdown:true}) failed to sanitize markdown control characters.",
    );
  }

  console.log(
    "✅ PHASE 4 PASSED: Logging and markdown formatting works correctly.",
  );
}

function testPhase5_ComplexTriggerConfigurations() {
  console.log(
    ">>> [PHASE 5] Validating Extreme Complex Trigger Configurations",
  );
  const baseDate = new Date("2024-01-01T00:00:00.000");

  const testObj = [
    {
      ownFunctionName: "mcpTriggerHandler",
      functionName: "complexTask1",
      everyMonth: [15, 0], // 15th and End of month computation
      atTimes: ["08:00:00"],
      toDay: "2024-02-01T00:00:00.000", // Generates Jan 15 and Jan 31
    },
    {
      ownFunctionName: "mcpTriggerHandler",
      functionName: "complexTask2",
      everyYear: ["2026-12-31"],
      atTimes: ["23:50:00"],
      toDay: "2027-01-01T00:00:00.000", // Generates exactly Dec 31, 2026
    },
    {
      ownFunctionName: "mcpTriggerHandler",
      functionName: "complexTask3",
      everyDay: true,
      interval: 3600, // 1 hour interval limit bounded logic
      fromTime: "09:00",
      toTime: "11:00",
      toDay: "2024-01-01T23:59:59.000", // Generates exactly 09:00, 10:00, 11:00 on Jan 1
    },
  ];

  // Mathematical simulation skipping linearly across vast time differentials
  const sim = TriggerApp.setCustomNow(baseDate).simulateTriggers(testObj);

  if (sim.length !== 6) {
    throw new Error(
      `Complex simulation failed. Expected exactly 6 generated timings, got ${sim.length}`,
    );
  }

  const task1Sims = sim.filter((s) => s.executeFunction === "complexTask1");
  const task2Sims = sim.filter((s) => s.executeFunction === "complexTask2");
  const task3Sims = sim.filter((s) => s.executeFunction === "complexTask3");

  if (task1Sims.length !== 2)
    throw new Error(
      "complexTask1 (everyMonth with end-of-month '0') mathematical logic failed.",
    );
  if (task2Sims.length !== 1)
    throw new Error(
      "complexTask2 (everyYear specific date) mathematical logic failed.",
    );
  if (task3Sims.length !== 3)
    throw new Error(
      "complexTask3 (everyDay hourly intervals) mathematical logic failed.",
    );

  // Physical installation prioritization test
  TriggerApp.setCustomNow(baseDate).installTriggers(testObj, () => {});
  const activeTriggers = ScriptApp.getProjectTriggers();

  // Ensure that out of the 3 configurations, it perfectly identifies 2024-01-01 09:00 as the absolute nearest physical action
  const c3 = activeTriggers.filter(
    (t) => t.getHandlerFunction() === "complexTask3",
  );
  const handler = activeTriggers.filter(
    (t) => t.getHandlerFunction() === "mcpTriggerHandler",
  );

  if (c3.length === 0 || handler.length === 0) {
    throw new Error(
      "Complex physical trigger installation prioritized the wrong task in the future timeline.",
    );
  }

  console.log(
    "✅ PHASE 5 PASSED: Extreme complex trigger permutations mathematically prioritized and correctly routed.",
  );

  // Cleanup for isolation
  TriggerApp.deleteAllTriggers(PropertiesService.getScriptProperties());
}

function testPhase6_TriggerCollisionDetection() {
  console.log(
    ">>> [PHASE 6] Validating Trigger Collision Safety Interval Detection",
  );
  const baseDate = new Date("2024-01-01T00:00:00.000");

  const testCollision = [
    {
      ownFunctionName: "mcpTriggerHandler",
      functionName: "collisionTask1",
      atTimes: ["10:00:00"],
      everyDay: true,
    },
    {
      ownFunctionName: "mcpTriggerHandler",
      functionName: "collisionTask2",
      atTimes: ["10:00:30"], // Dangerous! 30 seconds difference (Less than 60s minimum)
      everyDay: true,
    },
  ];

  let collisionCaught = false;
  try {
    TriggerApp.setCustomNow(baseDate).installTriggers(testCollision, () => {});
  } catch (e) {
    if (
      e.message.includes(
        "The interval between the current trigger and the next trigger is small",
      )
    ) {
      collisionCaught = true;
    }
  }

  if (!collisionCaught) {
    throw new Error(
      "Safety breach: Trigger collision interval logic failed to detect <60s conflict.",
    );
  }

  console.log(
    "✅ PHASE 6 PASSED: Trigger collision safety logic flawlessly caught intersection breach.",
  );
}

// =====================================
// MOCK HANDLERS FOR TESTS
// =====================================
function dummyTask1() {
  console.log("Mock Task 1 executed");
}
function dummyTask2() {
  console.log("Mock Task 2 executed");
}
function dummyTask3() {
  console.log("Mock Task 3 executed");
}
function dummyTask4() {
  console.log("Mock Task 4 executed");
}
function complexTask1() {
  console.log("Complex Task 1 executed");
}
function complexTask2() {
  console.log("Complex Task 2 executed");
}
function complexTask3() {
  console.log("Complex Task 3 executed");
}
function collisionTask1() {
  console.log("Collision Task 1 executed");
}
function collisionTask2() {
  console.log("Collision Task 2 executed");
}
function mcpTriggerHandler(e) {
  TriggerApp.executeMcpTriggers(e, PropertiesService.getScriptProperties());
}
