// Exposes the MCP server logic to incoming web requests
const doPost = (e) => {
  return TriggerApp.mcp({
    e: e,
    accessKey: "my_super_secret_key", // Security key for MCP access
    log: true, // Set to true to automatically save raw request payloads and standard logs
    spreadsheetId: "YOUR_SHEET_ID", // Required if log is true
    lock: LockService.getScriptLock(),
    properties: PropertiesService.getScriptProperties(), // MANDATORY: Preserves trigger scope isolation
  });
};

// MANDATORY: Global handler enabling LLMs to build infinite triggers
function mcpTriggerHandler(e) {
  TriggerApp.executeMcpTriggers(e, PropertiesService.getScriptProperties());
}

// Add the functions you want the AI to trigger below:
function myTask1() {
  console.log("myTask1: Executed perfectly on schedule!");
  // Optional: Append execution timestamp to your sheet to verify autonomous runs
  // SpreadsheetApp.openById("YOUR_SHEET_ID").getSheetByName("test").appendRow([new Date(), "myTask1"]);
}

function myTask2() {
  console.log("myTask2: Executed perfectly on schedule!");
  // Optional: Append execution timestamp to your sheet to verify autonomous runs
  // SpreadsheetApp.openById("YOUR_SHEET_ID").getSheetByName("test").appendRow([new Date(), "myTask2"]);
}
