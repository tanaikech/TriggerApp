/**
 * GitHub  https://github.com/tanaikech/TriggerApp<br>
 * Library name
 * @type {string}
 * @const {string}
 * @readonly
 */
const appName = "TriggerApp";

/**
 * Library version
 * @type {string}
 * @const {string}
 * @readonly
 */
const version = "2.1.1";

let appLogs = [];
let appLogCallback = null;
let appProperties = null; // Holds the injected PropertiesService reference

const MCP_CONFIG_KEY = "TRIGGERAPP_MCP_CONFIGS";

/**
 * ==============================================================================
 * UTILITY & FORMATTING FUNCTIONS
 * ==============================================================================
 */

/**
 * ### Description
 * Generates a safe, uncorrupted Markdown table from an array of objects.
 * Automatically sanitizes pipe characters (|) and newlines to preserve Markdown structure.
 *
 * @param {Object[]} items The array of data objects.
 * @param {string[]} headers The display headers for the Markdown table.
 * @param {string[]} keys The corresponding object keys to extract data from.
 * @return {string} A formatted Markdown table string.
 * @private
 */
function formatMarkdownTable_(items, headers, keys) {
  if (!items || items.length === 0) return "No data available.";
  const sanitize = (val) => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    return str.replace(/\|/g, "&#124;").replace(/\n/g, "<br>");
  };

  let md = `| ${headers.join(" | ")} |\n`;
  md += `| ${headers.map(() => "---").join(" | ")} |\n`;

  items.forEach((item) => {
    md += `| ${keys.map((k) => sanitize(item[k])).join(" | ")} |\n`;
  });

  return md;
}

/**
 * ### Description
 * Internal method to securely push log entries to the session state.
 *
 * @param {string} message Primary log message.
 * @param {Object} [data=null] Additional contextual JSON-serializable data.
 * @private
 */
function addLog_(message, data = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message: message,
  };
  if (data) {
    logEntry.data = data;
  }
  appLogs.push(logEntry);
  if (appLogCallback) {
    try {
      appLogCallback(logEntry);
    } catch (e) {
      console.error("Log callback execution failed:", e);
    }
  }
}

/**
 * ==============================================================================
 * STATE MANAGEMENT FOR MCP (PERSISTENCE)
 * ==============================================================================
 */

/** @private */
function getProperties_() {
  return appProperties || PropertiesService.getScriptProperties();
}

/** @private */
function getMcpState_() {
  const str = getProperties_().getProperty(MCP_CONFIG_KEY);
  return str ? JSON.parse(str) : { standard: [], dataDriven: [] };
}

/** @private */
function saveMcpState_(state) {
  getProperties_().setProperty(MCP_CONFIG_KEY, JSON.stringify(state));
}

/**
 * ==============================================================================
 * BUILT-IN MCP SERVER TOOLS
 * ==============================================================================
 */

/**
 * Extract configuration variables securely into TriggerApp constructor values array.
 * Ensures the generated array mirrors the exact 10-key structure required by the constructor.
 * @private
 */
function extractMcpValues_(args) {
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
    "maximumOutput",
  ];
  const context = {};

  if (args.customNow) {
    const d = new Date(args.customNow);
    context.nowFixed = d;
    context.nowTimeFixed = d.getTime();
    context.now = d;
    context.nowTime = d.getTime();
  }
  if (args.diffTriggerTime !== undefined)
    context.diffTriggerTime = args.diffTriggerTime * 1000;
  if (args.ease !== undefined) context.ease = args.ease * 1000;
  if (args.wait !== undefined) context.wait = args.wait * 1000;
  if (args.triggerOffset !== undefined)
    context.triggerOffset = args.triggerOffset * 1000;
  if (args.maximumOutput !== undefined)
    context.maximumOutput = args.maximumOutput;

  return keys.map((k) => [k, context[k]]);
}

/**
 * Formats install trigger results to a readable Markdown report optimized for LLMs.
 * @private
 */
function formatTriggerResultToMarkdown_(action, result) {
  let md = `### ${action} Execution Report\n`;
  md += `**Status:** ✅ Success\n`;
  if (result.processTime !== undefined) {
    md += `**Process Time:** ${result.processTime} seconds\n\n`;
  }

  const funcKeys = Object.keys(result).filter(
    (k) => k !== "processTime" && k !== "done",
  );
  if (funcKeys.length > 0) {
    md += `| Target Function | Trigger Date Time | Unique ID | Status Message |\n`;
    md += `| --- | --- | --- | --- |\n`;
    funcKeys.forEach((func) => {
      const details = result[func];
      const time = details.triggerDateTime
        ? new Date(details.triggerDateTime).toISOString()
        : "N/A";
      const uid = details.uniqueId || "N/A";
      const msg = details.message || "Installed successfully";
      md += `| ${func} | ${time} | ${uid} | ${msg} |\n`;
    });
  }

  if (result.done) {
    md += `\n**Note:** ${result.done.message}\n`;
  }
  return md;
}

/** @private */
function mcpGetTriggersList_() {
  try {
    const res = getTriggers({ markdown: true });
    let mdText = `### Current Triggers List\n**Status:** ✅ Success\n\n${res}`;

    // Inject documentation detailing the nature and purpose of mcpTriggerHandler
    mdText += `\n\n### 💡 Understanding \`mcpTriggerHandler\``;
    mdText += `\nYou will frequently observe **\`mcpTriggerHandler\`** listed among your active project triggers. `;
    mdText += `This is normal and structurally necessary. \`mcpTriggerHandler\` acts as the core recursive orchestrator for the TriggerApp MCP architecture. `;
    mdText += `Instead of exhausting your Google Apps Script quota by forcefully installing hundreds of physical triggers for cyclical tasks, `;
    mdText += `TriggerApp dynamically schedules exactly one physical trigger for your target function and one paired trigger for \`mcpTriggerHandler\`. `;
    mdText += `Upon execution, \`mcpTriggerHandler\` autonomously reads your persisted configurations, calculates the next required timestamp, and automatically reinstalls the upcoming triggers to maintain the infinite cycle. `;
    mdText += `\n\n⚠️ **WARNING:** Do NOT manually delete \`mcpTriggerHandler\` triggers from your GAS console unless you intend to permanently sever and halt all automated continuous cycles.`;

    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdText }], isError: false },
    };
  } catch (err) {
    const mdErr = `### Current Triggers List Execution Report\n**Status:** ❌ Failed\n**Error:** ${err.stack || err.message}`;
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdErr }], isError: true },
    };
  }
}

/** @private */
function mcpInstallTriggers_(args = {}) {
  try {
    if (!args.triggersData)
      throw new Error("triggersData parameter is missing.");

    // Force ownFunctionName to the designated standard MCP handler to ensure state recursion works.
    args.triggersData.forEach((t) => (t.ownFunctionName = "mcpTriggerHandler"));

    // Persist configuration for recursive continuous triggering
    const state = getMcpState_();
    args.triggersData.forEach((newConfig) => {
      const idx = state.standard.findIndex(
        (c) => c.functionName === newConfig.functionName,
      );
      if (idx !== -1)
        state.standard[idx] = newConfig; // Overwrite if exists
      else state.standard.push(newConfig); // Append new
    });
    saveMcpState_(state);

    const TA = new TriggerApp(extractMcpValues_(args));
    const result = TA.installTriggers(
      args.triggersData,
      null,
      "installTriggers",
    );
    const mdText = formatTriggerResultToMarkdown_("Install Triggers", result);
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdText }], isError: false },
    };
  } catch (err) {
    const mdErr = `### Install Triggers Execution Report\n**Status:** ❌ Failed\n**Error:** ${err.stack || err.message}`;
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdErr }], isError: true },
    };
  }
}

/** @private */
function mcpInstallTriggersByData_(args = {}) {
  try {
    if (!args.objectData) throw new Error("objectData parameter is missing.");

    // Force ownFunctionName
    args.objectData.ownFunctionName = "mcpTriggerHandler";

    // Persist configuration
    const state = getMcpState_();
    state.dataDriven.push(args.objectData);
    saveMcpState_(state);

    const TA = new TriggerApp(extractMcpValues_(args));
    const result = TA.installTriggersByData(
      args.objectData,
      "installTriggersByData",
    );
    const mdText = formatTriggerResultToMarkdown_(
      "Install Triggers By Data",
      result,
    );
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdText }], isError: false },
    };
  } catch (err) {
    const mdErr = `### Install Triggers By Data Execution Report\n**Status:** ❌ Failed\n**Error:** ${err.stack || err.message}`;
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdErr }], isError: true },
    };
  }
}

/** @private */
function mcpSimulateTriggers_(args = {}) {
  try {
    if (!args.triggersData)
      throw new Error("triggersData parameter is missing.");
    // Temporarily inject dummy handler for simulation purposes only
    args.triggersData.forEach((t) => (t.ownFunctionName = "mcpTriggerHandler"));

    const TA = new TriggerApp(extractMcpValues_(args));
    const result = TA.simulateTriggers(
      args.triggersData,
      null,
      "simulateTriggers",
    );

    let mdText = `### Simulate Triggers Execution Report\n**Status:** ✅ Success\n**Simulated Outputs:** ${result.length}\n\n`;
    if (result.length > 0) {
      mdText += `| Execute Function | Simulated Trigger Time |\n| --- | --- |\n`;
      result.forEach((r) => {
        const time = r.triggerTime
          ? new Date(r.triggerTime).toISOString()
          : "N/A";
        mdText += `| ${r.executeFunction} | ${time} |\n`;
      });

      // Inject raw JSON data optimized for chaining to install_triggers_by_data
      mdText += `\n\n**Raw JSON Data (Optimized for \`install_triggers_by_data\`):**\n\`\`\`json\n`;
      mdText += JSON.stringify({ data: result }, null, 2);
      mdText += `\n\`\`\`\n`;
    } else {
      mdText += "No triggers were simulated for the given conditions.";
    }

    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdText }], isError: false },
    };
  } catch (err) {
    const mdErr = `### Simulate Triggers Execution Report\n**Status:** ❌ Failed\n**Error:** ${err.stack || err.message}`;
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdErr }], isError: true },
    };
  }
}

/** @private */
function mcpDeleteAllTriggers_() {
  try {
    deleteAllTriggers();
    getProperties_().deleteProperty(MCP_CONFIG_KEY);

    const mdText = `### Delete All Triggers Execution Report\n**Status:** ✅ Success\nAll project triggers and persisted MCP configurations have been successfully purged.`;
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdText }], isError: false },
    };
  } catch (err) {
    const mdErr = `### Delete All Triggers Execution Report\n**Status:** ❌ Failed\n**Error:** ${err.stack || err.message}`;
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdErr }], isError: true },
    };
  }
}

/** @private */
function mcpDeleteTriggers_(args = {}) {
  try {
    const { functionNames = [], uniqueIds = [] } = args;
    if (functionNames.length === 0 && uniqueIds.length === 0) {
      throw new Error(
        "Either functionNames or uniqueIds must be provided to delete specific triggers.",
      );
    }
    const result = deleteTriggers({ functionNames, uniqueIds });

    // Purge deleted logic from persisted state to prevent resurrection
    const deletedFunctions = result.deletedInfo.map((i) => i.functionName);
    if (deletedFunctions.length > 0) {
      const state = getMcpState_();
      state.standard = state.standard.filter(
        (c) => !deletedFunctions.includes(c.functionName),
      );
      state.dataDriven = state.dataDriven.filter((c) => {
        c.data = c.data.filter(
          (t) => !deletedFunctions.includes(t.executeFunction),
        );
        return c.data.length > 0;
      });
      saveMcpState_(state);
    }

    let mdText = `### Delete Triggers Execution Report\n**Status:** ✅ Success\n**Deleted Count:** ${result.deletedCount}\n\n`;

    if (result.deletedCount > 0) {
      mdText += `| Target Function | Unique ID |\n| --- | --- |\n`;
      result.deletedInfo.forEach((info) => {
        mdText += `| ${info.functionName} | ${info.uniqueId} |\n`;
      });
    } else {
      mdText += "No matching triggers were found for deletion.";
    }

    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdText }], isError: false },
    };
  } catch (err) {
    const mdErr = `### Delete Triggers Execution Report\n**Status:** ❌ Failed\n**Error:** ${err.stack || err.message}`;
    return {
      jsonrpc: "2.0",
      result: { content: [{ type: "text", text: mdErr }], isError: true },
    };
  }
}

/**
 * Returns the default array of MCP items (tools) natively supported by TriggerApp.
 * @private
 */
function getDefaultMcpItems_() {
  const commonProperties = {
    customNow: {
      type: "string",
      description:
        "Optional. ISO string to override the current date time context.",
    },
    diffTriggerTime: {
      type: "number",
      description:
        "Optional. Offset difference in seconds between trigger functions.",
    },
    ease: {
      type: "number",
      description: "Optional. Ease wait time in seconds during calculation.",
    },
    wait: {
      type: "number",
      description: "Optional. Script wait time in seconds.",
    },
    triggerOffset: {
      type: "number",
      description: "Optional. Trigger offset time in seconds.",
    },
    maximumOutput: {
      type: "number",
      description: "Optional. Max simulation outputs.",
    },
  };

  const triggersDataSchema = {
    type: "array",
    description: "Array of trigger configuration objects.",
    items: {
      type: "object",
      properties: {
        functionName: {
          type: "string",
          description: "The core work function to execute.",
        },
        atTimes: {
          type: "array",
          items: { type: "string" },
          description: "Specific times e.g., ['09:00', '15:30'].",
        },
        everyDay: {
          type: "boolean",
          description: "Set true to repeat daily at atTimes.",
        },
        everyWeek: {
          type: "array",
          items: { type: "string" },
          description: "Weekdays e.g., ['Monday'].",
        },
        everyMonth: {
          type: "array",
          items: { type: "number" },
          description: "Days of month e.g., [1, 15].",
        },
        everyYear: {
          type: "array",
          items: { type: "string" },
          description: "Specific dates e.g., ['2026-06-02'].",
        },
        interval: {
          type: "number",
          description: "Interval in seconds.",
        },
        fromTime: {
          type: "string",
          description: "Start time for continuous triggers e.g., '09:00'.",
        },
        toTime: {
          type: "string",
          description: "End time for continuous triggers e.g., '18:00'.",
        },
        toDay: {
          type: "string",
          description: "Limit trigger creation until this date (yyyy-mm-dd).",
        },
      },
      required: ["functionName"],
    },
  };

  return [
    {
      type: "initialize",
      value: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "TriggerApp_Native_MCP_Server", version: version },
      },
    },
    {
      type: "tools/list",
      function: mcpGetTriggersList_,
      value: {
        name: "get_triggers_list",
        description:
          "Get a Markdown formatted table containing the list of all active time-driven triggers mapped to the current Google Apps Script project. Includes important documentation regarding structural handlers.",
        inputSchema: { type: "object", properties: {} },
      },
    },
    {
      type: "tools/list",
      function: mcpDeleteAllTriggers_,
      value: {
        name: "delete_all_triggers",
        description:
          "Purge and delete all time-driven triggers natively bound to the current Google Apps Script project. It also wipes the persisted state configurations. IMPORTANT: After executing this tool, you MUST use the 'get_triggers_list' tool to verify the updated state of the triggers.",
        inputSchema: { type: "object", properties: {} },
      },
    },
    {
      type: "tools/list",
      function: mcpDeleteTriggers_,
      value: {
        name: "delete_triggers",
        description:
          "Delete specific time-driven triggers mapped to the current project by their function names or unique IDs. IMPORTANT: After executing this tool, you MUST use the 'get_triggers_list' tool to verify the updated state of the triggers.",
        inputSchema: {
          type: "object",
          properties: {
            functionNames: {
              type: "array",
              items: { type: "string" },
              description:
                "List of handler function names whose associated triggers should be deleted.",
            },
            uniqueIds: {
              type: "array",
              items: { type: "string" },
              description: "List of unique trigger IDs to be deleted.",
            },
          },
        },
      },
    },
    {
      type: "tools/list",
      function: mcpInstallTriggers_,
      value: {
        name: "install_triggers",
        description:
          "Create and install new time-driven triggers using extensive TriggerApp parameters. IMPORTANT: After executing this tool, you MUST use the 'get_triggers_list' tool to verify that the triggers were successfully installed.",
        inputSchema: {
          type: "object",
          properties: {
            ...commonProperties,
            triggersData: triggersDataSchema,
          },
          required: ["triggersData"],
        },
      },
    },
    {
      type: "tools/list",
      function: mcpSimulateTriggers_,
      value: {
        name: "simulate_triggers",
        description:
          "Simulate trigger calculation timings without actually installing them.",
        inputSchema: {
          type: "object",
          properties: {
            ...commonProperties,
            triggersData: triggersDataSchema,
          },
          required: ["triggersData"],
        },
      },
    },
    {
      type: "tools/list",
      function: mcpInstallTriggersByData_,
      value: {
        name: "install_triggers_by_data",
        description:
          "Install triggers directly from simulated output data objects. IMPORTANT: After executing this tool, you MUST use the 'get_triggers_list' tool to verify that the triggers were successfully installed.",
        inputSchema: {
          type: "object",
          properties: {
            ...commonProperties,
            objectData: {
              type: "object",
              description:
                "Object containing raw data array. The handler injection is managed automatically.",
              properties: {
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      triggerTime: {
                        type: "string",
                        description:
                          "ISO 8601 string representing the exact execution time.",
                      },
                      executeFunction: {
                        type: "string",
                        description: "The target function to execute.",
                      },
                    },
                    required: ["triggerTime", "executeFunction"],
                  },
                },
              },
              required: ["data"],
            },
          },
          required: ["objectData"],
        },
      },
    },
  ];
}

/**
 * ==============================================================================
 * CORE API METHODS
 * ==============================================================================
 */

/**
 * ### Description
 * Executes all persisted configurations saved by the MCP Server.
 * This MUST be called inside a global function named `mcpTriggerHandler` in the client script.
 *
 * @param {Object} e Event object passed from the time-driven trigger.
 * @param {GoogleAppsScript.Properties.Properties} [properties=null] Inject PropertiesService to prevent library scope issues.
 */
function executeMcpTriggers(e, properties = null) {
  addLog_("Executing MCP-persisted triggers via executeMcpTriggers.");
  if (properties) {
    appProperties = properties;
  }
  const state = getMcpState_();

  try {
    if (state.standard && state.standard.length > 0) {
      addLog_(`Re-installing ${state.standard.length} standard MCP triggers.`);
      setEventObject(e).installTriggers(state.standard);
    }

    if (state.dataDriven && state.dataDriven.length > 0) {
      addLog_(
        `Re-installing ${state.dataDriven.length} data-driven MCP triggers.`,
      );
      state.dataDriven.forEach((obj) => {
        setEventObject(e).installTriggersByData(obj);
      });
    }
  } catch (error) {
    addLog_("Critical error during executeMcpTriggers: " + error.message);
    throw error;
  }
}

/**
 * ### Description
 * Set a callback function to handle and output logs in real-time during execution.
 *
 * @param {Function} callback Callback function receiving the log object.
 * @return {this}
 */
function showLogs(callback) {
  if (typeof callback === "function") {
    appLogCallback = callback;
  }
  return this;
}

/**
 * ### Description
 * Add a custom log entry to the TriggerApp log stream.
 * Useful for debugging or interleaving user logs with framework logs.
 *
 * @param {string} message The custom log message.
 * @param {Object} [data=null] Optional contextual JSON-serializable data.
 * @return {this}
 */
function addCustomLog(message, data = null) {
  addLog_(message, data);
  return this;
}

/**
 * ### Description
 * Retrieve all accumulated logs generated during the current script execution process.
 *
 * [Usage Options]
 * - getLogs(): Returns the raw array of log objects.
 * - getLogs({ markdown: true }): Returns a rendered Markdown table of the logs.
 *
 * @param {Object} [options={}] Configuration options.
 * @param {boolean} [options.markdown=false] If true, returns a Markdown formatted string.
 * @return {Object[]|string} Array of log entries or a Markdown formatted string.
 */
function getLogs(options = {}) {
  if (options && options.markdown) {
    return formatMarkdownTable_(
      appLogs,
      ["Timestamp", "Message", "Data"],
      ["timestamp", "message", "data"],
    );
  }
  return appLogs;
}

/**
 * ### Description
 * Retrieves a list of all current GAS project triggers securely mapped to this script.
 *
 * [Usage Options]
 * - getTriggers(): Returns the raw JSON array of active triggers.
 * - getTriggers({ markdown: true }): Returns a rendered Markdown table of the triggers.
 *
 * @param {Object} [options={}] Configuration options.
 * @param {boolean} [options.markdown=false] If true, returns a Markdown formatted string.
 * @return {Object[]|string} Array of trigger objects or a Markdown formatted string.
 */
function getTriggers(options = {}) {
  const triggers = ScriptApp.getProjectTriggers().map((t) => ({
    uniqueId: t.getUniqueId(),
    handlerFunction: t.getHandlerFunction(),
    eventType: t.getEventType().toString(),
    triggerSource: t.getTriggerSource().toString(),
  }));

  if (options && options.markdown) {
    return formatMarkdownTable_(
      triggers,
      ["Unique ID", "Handler Function", "Event Type", "Trigger Source"],
      ["uniqueId", "handlerFunction", "eventType", "triggerSource"],
    );
  }
  return triggers;
}

/**
 * ### Description
 * Delete specific project triggers of the current Google Apps Script project.
 *
 * @param {Object} options Options for deleting triggers.
 * @param {string[]} [options.functionNames] Array of function names whose triggers should be deleted.
 * @param {string[]} [options.uniqueIds] Array of unique IDs of triggers that should be deleted.
 * @return {Object} Result containing the number of deleted triggers and their info.
 */
function deleteTriggers(options = {}) {
  addLog_("Executing 'deleteTriggers'.", { options });
  const { functionNames = [], uniqueIds = [] } = options;
  const deletedInfo = [];

  if (!Array.isArray(functionNames) || !Array.isArray(uniqueIds)) {
    throw new Error("functionNames and uniqueIds must be arrays.");
  }

  const nameSet = new Set(functionNames);
  const idSet = new Set(uniqueIds);

  ScriptApp.getProjectTriggers().forEach((t) => {
    const fName = t.getHandlerFunction();
    const uId = t.getUniqueId();
    if (nameSet.has(fName) || idSet.has(uId)) {
      ScriptApp.deleteTrigger(t);
      deletedInfo.push({ functionName: fName, uniqueId: uId });
    }
  });

  addLog_(`Successfully deleted ${deletedInfo.length} triggers.`, {
    deletedInfo,
  });
  return { deletedCount: deletedInfo.length, deletedInfo };
}

/**
 * ### Description
 * Delete all project triggers of the current Google Apps Script project.
 *
 * @param {GoogleAppsScript.Properties.Properties} [properties=null] Inject PropertiesService if wiping states mapped to a client script.
 * @return {null}
 */
function deleteAllTriggers(properties = null) {
  if (properties) {
    appProperties = properties;
  }
  addLog_(
    "Executing 'deleteAllTriggers'. System will remove all existing script triggers.",
  );
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
    "maximumOutput",
  ];
  const values = keys.map((k) => [k, null]);
  const result = new TriggerApp(values).deleteAllTriggers_();
  getProperties_().deleteProperty(MCP_CONFIG_KEY); // Ensures client states are wiped
  addLog_("All project triggers have been successfully deleted.");
  return result;
}

/**
 * ### Description
 * MCP Server integration wrapper. Handles HTTP requests seamlessly leveraging the bundled MCPApp.
 * Exposes internal TriggerApp manipulation tools automatically.
 *
 * @param {Object} args Configuration dictionary for the MCP server.
 * @return {GoogleAppsScript.Content.TextOutput} Processed JSON-RPC response ready for client return.
 */
function mcp(args = {}) {
  addLog_("TriggerApp.mcp() initialization started.", {
    argumentsKeys: Object.keys(args),
  });

  const {
    e,
    accessKey = null,
    log = false,
    spreadsheetId = null,
    lock = null,
    properties = null, // Accept DI for client script
    items = [],
    serverResponse = null,
    functions = {},
  } = args;

  if (properties) {
    appProperties = properties;
  }

  if (!e) {
    const errMsg =
      "Fatal Error: Event object 'e' is strictly required to execute TriggerApp.mcp().";
    addLog_(errMsg);
    throw new Error(errMsg);
  }

  if (
    log === true &&
    typeof spreadsheetId === "string" &&
    spreadsheetId.trim() !== ""
  ) {
    try {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      let rawSheet = ss.getSheetByName("raw");
      if (!rawSheet) {
        rawSheet = ss.insertSheet("raw");
      }
      rawSheet.appendRow([new Date(), JSON.stringify(e)]);
      addLog_("Raw event object successfully logged to 'raw' sheet.");
    } catch (err) {
      addLog_("Failed to log raw request to spreadsheet.", {
        error: err.stack || err.message,
      });
      console.error("Failed to log raw request:", err);
    }
  }

  if (typeof MCPApp === "undefined") {
    const errMsg =
      "Fatal Error: MCPApp class not found in the global scope. Ensure MCPApp is correctly bundled within the TriggerApp project context.";
    addLog_(errMsg);
    throw new Error(errMsg);
  }

  // Merge default native MCP tools with user-provided tools
  let mergedItems = getDefaultMcpItems_();
  if (Array.isArray(items) && items.length > 0) {
    const hasUserInit = items.some((i) => i.type === "initialize");
    if (hasUserInit) {
      mergedItems = mergedItems.filter((i) => i.type !== "initialize");
    }
    mergedItems = mergedItems.concat(items);
  }

  addLog_(
    `Instantiating bundled MCPApp class object with ${mergedItems.length} tool definitions.`,
  );
  const mcpAppOptions = { accessKey, log, spreadsheetId, lock: !!lock };
  const mcpInstance = new MCPApp(mcpAppOptions);

  if (lock) {
    mcpInstance.setServices({ lock });
    addLog_("LockService successfully bound to MCPApp instance.");
  }

  const serverObj = {
    eventObject: e,
    items: mergedItems,
    serverResponse,
    functions,
  };

  try {
    addLog_("Executing MCP server routing workflow.");
    const response = mcpInstance.server(serverObj);
    addLog_("MCP server workflow executed successfully.");
    return response;
  } catch (error) {
    addLog_("Execution failure during MCP server routing.", {
      stack: error.stack || String(error),
    });
    throw error;
  }
}

/**
 * ### Description
 * Give the event object from the time-driven trigger.
 *
 * @param {Object} object Event object from trigger.
 * @return {this}
 */
function setEventObject(object = null) {
  this.eventObj = object || null;
  return this;
}

/**
 * ### Description
 * When this method is used, the custom current date time can be used.
 * If this is not used, the current date time is used.
 *
 * @param {Date} dateObj Event object from trigger.
 * @return {this}
 */
function setCustomNow(dateObj = null) {
  if (!dateObj) {
    throw new Error("Please set the date object.");
  }
  this.nowFixed = dateObj;
  this.nowTimeFixed = dateObj.getTime();
  this.now = dateObj;
  this.nowTime = dateObj.getTime();
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 60 seconds.
 * Difference of trigger time between "ownFunctionName" and "functionName".
 *
 * @param {Number} diffTriggerTime Trigger offset time.
 * @return {this}
 */
function setDiffTriggerTime(diffTriggerTime = 60) {
  this.diffTriggerTime = diffTriggerTime * 1000;
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 0 s.
 *
 * @param {Number} easeTime Number.
 * @return {this}
 */
function setEase(easeTime = 0) {
  this.ease = easeTime * 1000;
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 0 s.
 *
 * @param {Number} waitTime Wait time.
 * @return {this}
 */
function setScriptWaitTime(waitTime = 0) {
  this.wait = waitTime * 1000;
  return this;
}

/**
 * ### Description
 * Unit is second. Default value is 0.
 *
 * @param {Number} triggerOffset Trigger offset time.
 * @return {this}
 */
function setTriggerOffsetTime(triggerOffset = 0) {
  this.triggerOffset = triggerOffset * 1000;
  return this;
}

/**
 * ### Description
 * Default value is 20. When the simulation of triggers is run, set the maximum number of results.
 *
 * @param {Number} maximumOutput Maximum number of results for the trigger simulation.
 * @return {this}
 */
function setMaxOutputForSimulation(maximumOutput = 20) {
  this.maximumOutput = maximumOutput;
  return this;
}

/**
 * ### Description
 * This is the main method of this library.
 *
 * @param {Object[]} object Array including the objects for installing the time-driven triggers.
 * @param {Function} callback Callback function from process.
 * @return {Object} Return value.
 */
function installTriggers(object, callback) {
  addLog_("Executing 'installTriggers'.", { object });
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
  ];
  const values = keys.map((k) => [k, this[k]]);
  const TA = new TriggerApp(values);
  const result = TA.installTriggers(object, callback, "installTriggers");
  addLog_("'installTriggers' execution complete.", {
    processTime: result.processTime,
  });
  return result;
}

/**
 * ### Description
 * This method installs the tasks given by data output from simulateTriggers method as the time-driven trigger.
 *
 * @param {Object} object including the own function name and the array objects for installing the time-driven triggers.
 * @return {Object} Return value.
 */
function installTriggersByData(object) {
  addLog_("Executing 'installTriggersByData'.");
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
  ];
  const values = keys.map((k) => [k, this[k]]);
  const TA = new TriggerApp(values);
  const result = TA.installTriggersByData(object, "installTriggersByData");
  addLog_("'installTriggersByData' execution complete.");
  return result;
}

/**
 * ### Description
 * This method can simulate the time-driven triggers by inputting the actual object for the setTriggers method.
 *
 * @param {Object[]} object Array including the objects for checking the time-driven triggers.
 * @param {Function} callback Callback function from process.
 * @return {Object[]} Return values including the information of the time-driven triggers.
 */
function simulateTriggers(object, callback) {
  addLog_("Executing 'simulateTriggers'.");
  const keys = [
    "eventObj",
    "nowFixed",
    "nowTimeFixed",
    "now",
    "nowTime",
    "ease",
    "wait",
    "triggerOffset",
    "diffTriggerTime",
    "maximumOutput",
  ];
  const values = keys.map((k) => [k, this[k]]);
  const TA = new TriggerApp(values);
  const result = TA.simulateTriggers(object, callback, "simulateTriggers");
  addLog_("'simulateTriggers' execution complete.", {
    simulationCount: result.length,
  });
  return result;
}

class TriggerApp {
  constructor(values) {
    const now = new Date();
    const nowTime = now.getTime();
    const nowFixed = new Date();
    const nowTimeFixed = nowFixed.getTime();

    this.infiniteDateObj = new Date();
    this.infiniteDateObj.setFullYear(this.infiniteDateObj.getFullYear() + 100);
    this.infiniteDateTime = this.infiniteDateObj.getTime();

    const defaultValues = {
      now,
      nowTime,
      nowFixed,
      nowTimeFixed,
      ease: 0,
      wait: 0,
      triggerOffset: 0,
      diffTriggerTime: 60000,
      maximumOutput: 20,
    };

    values.forEach(([key, val]) => {
      this[key] = val ?? defaultValues[key];
    });

    this.timezone = Session.getScriptTimeZone();
    this.dateKeys = [
      "atTimes",
      "everyWeek",
      "everyMonth",
      "everyYear",
      "everyDay",
    ];
    this.weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    this.minimumIntervalToNextTrigger = 60; // Unit is second.
  }

  installTriggers(object, callback, type) {
    const startTime = Date.now();
    const responseObj = {};
    const { triggerDateTimeObject, message } = this.getTriggerDateTimeObject_(
      object,
      callback,
      type,
    );

    if (triggerDateTimeObject && !message) {
      const { obj, triggerDateTime } = triggerDateTimeObject;
      const installedTrigger1 = this.installTrigger_(
        obj.functionName,
        triggerDateTime,
      );

      responseObj[obj.functionName] = {
        triggerDateTime,
        triggerSourceId: installedTrigger1.getTriggerSourceId(),
        uniqueId: installedTrigger1.getUniqueId(),
        scriptExecutedTime: this.now,
      };

      if (obj.toDayTime > this.nowTimeFixed) {
        const triggerDateTimeWithDiff = new Date(
          triggerDateTime.getTime() + this.diffTriggerTime,
        );
        const installedTrigger2 = this.installTrigger_(
          obj.ownFunctionName,
          triggerDateTimeWithDiff,
        );

        responseObj[obj.ownFunctionName] = {
          triggerDateTime: triggerDateTimeWithDiff,
          triggerSourceId: installedTrigger2.getTriggerSourceId(),
          uniqueId: installedTrigger2.getUniqueId(),
          scriptExecutedTime: this.now,
        };
      } else {
        responseObj[obj.ownFunctionName] = {
          message: `"${obj.ownFunctionName}" is not installed as the time-driven trigger. Because there is no the next trigger task.`,
          scriptExecutedTime: this.now,
        };
      }
    } else {
      responseObj.done = { message: "All trigger tasks were finished." };
    }

    responseObj.processTime = (Date.now() - startTime) / 1000;
    return responseObj;
  }

  installTriggersByData(object, type) {
    const startTime = Date.now();
    const responseObj = {};
    this.sleepIfRequired_();

    if (!object?.ownFunctionName || !object?.data) {
      throw new Error("Invalid object.");
    }

    const tasks = object.data
      .map((o) => {
        if (!o.triggerTime || !o.executeFunction) {
          throw new Error("Invalid object.");
        }
        const triggerTimeMs =
          o.triggerTime instanceof Date
            ? o.triggerTime.getTime()
            : new Date(o.triggerTime).getTime();
        return { ...o, triggerTime: triggerTimeMs };
      })
      .sort((a, b) => a.triggerTime - b.triggerTime);

    if (type === "installTriggersByData") {
      const functionList = [
        object.ownFunctionName,
        ...new Set(tasks.map((t) => t.executeFunction)),
      ];
      this.deleteTriggers_(functionList);
    }

    const nextTask = tasks.find((t) => t.triggerTime > this.nowTime);

    if (nextTask) {
      const triggerDateTime = new Date(nextTask.triggerTime);
      const { executeFunction } = nextTask;
      const installedTrigger1 = this.installTrigger_(
        executeFunction,
        triggerDateTime,
      );

      responseObj[executeFunction] = {
        triggerDateTime,
        triggerSourceId: installedTrigger1.getTriggerSourceId(),
        uniqueId: installedTrigger1.getUniqueId(),
        scriptExecutedTime: this.now,
      };

      const taskIndex = tasks.findIndex((t) => t === nextTask);
      const isNotLast = taskIndex !== tasks.length - 1;

      if (isNotLast) {
        const triggerDateTimeWithDiff = new Date(
          triggerDateTime.getTime() + this.diffTriggerTime,
        );
        const installedTrigger2 = this.installTrigger_(
          object.ownFunctionName,
          triggerDateTimeWithDiff,
        );
        responseObj[object.ownFunctionName] = {
          triggerDateTime: triggerDateTimeWithDiff,
          triggerSourceId: installedTrigger2.getTriggerSourceId(),
          uniqueId: installedTrigger2.getUniqueId(),
          scriptExecutedTime: this.now,
        };
      } else {
        responseObj[executeFunction].lastTask = true;
        responseObj[executeFunction].message = "This task is the last task.";
      }
    } else {
      responseObj.done = { message: "All trigger tasks were finished." };
    }

    responseObj.processTime = (Date.now() - startTime) / 1000;
    return responseObj;
  }

  simulateTriggers(ar, callback, type) {
    if (callback) callback("### Start trigger simulation");
    const hasInfinite = ar.some((o) => !o.hasOwnProperty("toDay"));
    const maxOutput = hasInfinite ? this.maximumOutput : -1;

    this.eventObj = "dummy";
    const result = [];
    let nextDate;

    do {
      const res = this.getTriggerDateTimeObject_(ar, callback, type);
      nextDate = res.triggerDateTimeObject?.triggerDateTime || null;

      if (nextDate) {
        this.setCustomNow_(nextDate);
        const retObj = {
          triggerTime: nextDate,
          executeFunction: res.triggerDateTimeObject.obj.functionName,
        };
        result.push(retObj);
        if (callback) callback(retObj);
      }

      if (maxOutput !== -1 && result.length >= maxOutput) break;
    } while (nextDate);

    let msg = "### End trigger simulation";
    if (maxOutput > 0)
      msg += "\n### Forced stopped calculation because of infinite triggers.";
    if (callback) callback(msg);

    return result;
  }

  sleepIfRequired_() {
    if (this.wait > 0) Utilities.sleep(this.wait);
  }

  setCustomNow_(now) {
    this.nowFixed = now;
    this.nowTimeFixed = now.getTime();
    this.now = now;
    this.nowTime = now.getTime();
    return this;
  }

  getTriggerDateTimeObject_(object, callback, type) {
    this.sleepIfRequired_();

    const ar = JSON.parse(JSON.stringify(object));
    this.objectErrorCheck_(ar, type);

    const candidates = ar.reduce((arr, obj) => {
      const isContinuous = obj.fromTime && obj.toTime && obj.interval;
      const triggerTime = isContinuous
        ? this.continuousTriggers_(obj, callback)
        : this.pointTriggers_(obj, callback);

      if (!triggerTime) return arr;

      const isAfterNow = triggerTime.getTime() > this.nowTimeFixed;
      const isBeforeToDay =
        !obj.toDayTime || triggerTime.getTime() < obj.toDayTime;

      if (isAfterNow && isBeforeToDay) {
        arr.push({ obj, triggerDateTime: triggerTime });
      }
      return arr;
    }, []);

    if (candidates.length > 0) {
      candidates.sort(
        (a, b) => a.triggerDateTime.getTime() - b.triggerDateTime.getTime(),
      );

      const checkInterval = candidates.some((cand, i, arr) => {
        if (i < arr.length - 1) {
          const diff =
            arr[i + 1].triggerDateTime.getTime() -
            cand.triggerDateTime.getTime();
          return diff <= this.minimumIntervalToNextTrigger * 1000;
        }
        return false;
      });

      if (checkInterval) {
        throw new Error(
          "The interval between the current trigger and the next trigger is small.",
        );
      }

      return { triggerDateTimeObject: candidates[0] };
    }

    return { message: "There are no tasks for installing." };
  }

  objectErrorCheck_(ar, type) {
    if (!ar || !Array.isArray(ar)) {
      throw new Error(
        "Please input an array including object for using this library.",
      );
    }

    if (type === "installTriggers") {
      const functionsToDelete = ar
        .flatMap((obj) => [obj.ownFunctionName, obj.functionName])
        .filter(Boolean);
      if (functionsToDelete.length > 0) {
        this.deleteTriggers_([...new Set(functionsToDelete)]);
      }
    }

    ar.forEach((obj) => {
      if (!this.eventObj) {
        if (
          !obj.atTimes &&
          !obj.everyDay &&
          !obj.everyWeek &&
          !obj.everyMonth &&
          !obj.everyYear
        ) {
          throw new Error(
            "Please set date time values of atTimes, everyWeek, everyMonth, everyYear.",
          );
        }
        if (!obj.functionName) {
          throw new Error(
            "Please set the work function name of the function you want to execute by the time-driven trigger.",
          );
        }
        if (!obj.ownFunctionName) {
          throw new Error(
            "Please set the function name of function using TriggerApp of this library.",
          );
        }
        if (obj.interval < this.minimumIntervalToNextTrigger) {
          throw new Error(
            `Your inputted interval (${obj.interval} seconds) between the current trigger and the next trigger is smaller than ${this.minimumIntervalToNextTrigger} seconds. Please modify it.`,
          );
        }
        if (obj.interval <= 90) {
          this.diffTriggerTime = 30000;
        }
      }

      if (obj.toDay) {
        const toDayObj = new Date(obj.toDay);
        obj.toDayTime = toDayObj.getTime();
        obj.toDayObj = toDayObj;
        if (!this.eventObj && this.nowTime > obj.toDayTime) {
          throw new Error("'toDay' is smaller than current date.");
        }
      } else {
        obj.toDayObj = this.infiniteDateObj;
        obj.toDayTime = this.infiniteDateTime;
      }

      if (obj.fromDay) {
        const fromDayObj = new Date(obj.fromDay);
        obj.fromDayTime = fromDayObj.getTime();
        obj.fromDayObj = fromDayObj;
      }

      const sortedObj = this.sortInputObject_(obj);
      this.dateKeys.forEach((k) => {
        if (sortedObj[k] !== undefined) obj[k] = sortedObj[k];
      });
    });
  }

  continuousTriggers_(obj, callback) {
    const {
      everyDay,
      everyWeek,
      everyMonth,
      everyYear,
      interval,
      fromDay,
      fromTime,
      toTime,
      fromDayObj,
      fromDayTime,
      toDay,
      toDayTime,
    } = obj;

    this.now = new Date(this.nowFixed.getTime());
    this.nowTime = this.nowTimeFixed;

    if (fromDay && this.nowTime < fromDayTime) {
      this.now = new Date(fromDayObj.getTime());
      this.nowTime = fromDayTime;
    } else {
      obj.fromDay = this.now;
    }

    const fromTimeUnix = this.convTimeStrToObjWithOffset_(fromTime).getTime();
    const toTimeUnix = this.convTimeStrToObjWithOffset_(toTime).getTime();

    const dateObj = [];
    for (let t1 = fromTimeUnix; t1 <= toTimeUnix; t1 += interval * 1000) {
      dateObj.push(Utilities.formatDate(new Date(t1), this.timezone, "HH:mm"));
    }

    const nextDateTimes = this.getNextDateTime_(obj, dateObj);
    const temp1 = this.convTimeStrToObjWithOffset_(fromTime);
    const temp2 = this.convTimeStrToObjWithOffset_(toTime);

    if (temp1.getTime() > temp2.getTime()) {
      throw new Error("Value of fromTime is larger than that of toTime.");
    }

    if (everyDay && !everyWeek && !everyMonth && !everyYear) {
      if (callback) callback("Detected 'everyDay' trigger.");
      return nextDateTimes.everyDay;
    } else if (!everyDay && everyWeek && !everyMonth && !everyYear) {
      if (callback) callback("Detected 'everyWeek' trigger.");
      return nextDateTimes.everyWeek;
    } else if (!everyDay && !everyWeek && everyMonth && !everyYear) {
      if (callback) callback("Detected 'everyMonth' trigger.");
      return nextDateTimes.everyMonth;
    } else if (!everyDay && !everyWeek && !everyMonth && everyYear) {
      if (callback) callback("Detected 'everyYear' trigger.");

      const isYearValid = everyYear.every((e) => {
        const t = new Date(e).getTime();
        const afterFrom = fromDay ? fromDayTime < t : true;
        const beforeTo = toDay ? t < toDayTime : true;
        return afterFrom && beforeTo;
      });

      if (!this.eventObj && !isYearValid) {
        throw new Error(
          "Values of 'everyYear' are out of range of 'fromDay' and 'toDay'.",
        );
      }
      return nextDateTimes.everyYear;
    }
    throw new Error(
      "The required values are not included in the inputted object.",
    );
  }

  pointTriggers_(obj, callback) {
    const {
      atTimes,
      everyDay,
      everyWeek,
      everyMonth,
      everyYear,
      fromDay,
      fromDayTime,
      fromDayObj,
    } = obj;

    this.now = new Date(this.nowFixed.getTime());
    this.nowTime = this.nowTimeFixed;

    if (fromDay && this.nowTime < fromDayTime) {
      this.now = new Date(fromDayObj.getTime());
      this.nowTime = fromDayTime;
    } else {
      obj.fromDay = this.now;
    }

    if (atTimes) {
      const nextDateTimes = this.getNextDateTime_(obj, atTimes);
      if (!everyDay && !everyWeek && !everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes' trigger.");
        return nextDateTimes.atTimes;
      } else if (everyDay && !everyWeek && !everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes and everyDay' trigger.");
        return nextDateTimes.everyDay;
      } else if (!everyDay && everyWeek && !everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes and everyWeek' trigger.");
        return nextDateTimes.everyWeek;
      } else if (!everyDay && !everyWeek && everyMonth && !everyYear) {
        if (callback) callback("Detected 'atTimes and everyMonth' trigger.");
        return nextDateTimes.everyMonth;
      } else if (!everyDay && !everyWeek && !everyMonth && everyYear) {
        if (callback) callback("Detected 'atTimes and everyYear' trigger.");
        return nextDateTimes.everyYear;
      }
    }
    throw new Error(
      "The required values are not included in the inputted object.",
    );
  }

  installTrigger_(functionName, dateTimeObj) {
    addLog_(
      `Committing new ScriptApp trigger mapping to function: "${functionName}" at ${dateTimeObj.toISOString()}`,
    );
    return ScriptApp.newTrigger(functionName)
      .timeBased()
      .at(dateTimeObj)
      .create();
  }

  deleteAllTriggers_() {
    ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
    return null;
  }

  deleteTriggers_(functionList) {
    if (!functionList || functionList.length === 0) return null;
    const funcs = new Set(functionList);
    ScriptApp.getProjectTriggers().forEach((t) => {
      if (funcs.has(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
    });
    return null;
  }

  convTimeStrToObjWithOffset_(s, offset = 0) {
    const temp = new Date(this.nowTime + offset);
    const [hours, mins, secs = 0] = s.split(":").map(Number);
    temp.setHours(hours, mins, secs, 0);
    return temp;
  }

  sortInputObject_(obj) {
    return this.dateKeys.reduce((o, k) => {
      if (k in obj && obj[k] !== undefined) {
        const v = obj[k];
        if (k === "atTimes") {
          o[k] = [...v].sort((a, b) => {
            const t1 = this.convTimeStrToObjWithOffset_(a).getTime();
            const t2 = this.convTimeStrToObjWithOffset_(b).getTime();
            return t1 - t2;
          });
        } else if (k === "everyWeek") {
          o[k] = [...v].sort(
            (a, b) => this.weekDays.indexOf(a) - this.weekDays.indexOf(b),
          );
        } else if (k === "everyMonth") {
          o[k] = [...v].sort((a, b) => a - b);
        } else if (k === "everyYear") {
          o[k] = [...v]
            .map((e) => new Date(e))
            .sort((a, b) => a.getTime() - b.getTime());
        } else if (k === "everyDay") {
          o[k] = v;
        }
      }
      return o;
    }, {});
  }

  static addMonths_(date) {
    const d = date.getDate();
    date.setMonth(date.getMonth() + 1);
    if (date.getDate() !== d) {
      date.setDate(0);
    }
  }

  getNextDateTime_(obj, setTimeValues = ["00:00"]) {
    if (!Array.isArray(setTimeValues) || setTimeValues.length === 0) {
      setTimeValues = ["00:00"];
    }

    const rawValues = this.dateKeys.reduce((o, k) => {
      const v = obj[k];
      if (v === undefined || !(k in obj)) return o;

      const thresholdTime = this.nowTime + this.ease;

      if (k === "atTimes") {
        const dates = v.map((e) => this.convTimeStrToObjWithOffset_(e));
        const nextTime = dates.find((e) => e.getTime() > thresholdTime);

        if (!nextTime) {
          const t1 = new Date(this.nowTime);
          t1.setDate(t1.getDate() + 1);
          t1.setHours(dates[0].getHours(), dates[0].getMinutes(), 0, 0);
          o[k] = t1;
        } else {
          o[k] = nextTime;
        }
      } else if (k === "everyWeek") {
        const dates = v
          .flatMap((dayStr) => {
            return setTimeValues.map((tt) => {
              const temp = new Date(this.nowTime);
              const targetDay = this.weekDays.indexOf(dayStr);
              let daysToAdd = (7 - temp.getDay() + targetDay) % 7;
              temp.setDate(temp.getDate() + daysToAdd);
              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);

              if (temp.getTime() <= this.nowTime) {
                temp.setDate(temp.getDate() + 7);
              }
              return temp;
            });
          })
          .sort((a, b) => a.getTime() - b.getTime());

        const nextTime = dates.find((e) => e.getTime() > thresholdTime);
        if (!nextTime)
          throw new Error(
            "Current date time is out of range of the trigger date time.",
          );
        o[k] = nextTime;
      } else if (k === "everyMonth") {
        const dates = v
          .flatMap((dayNum) => {
            return setTimeValues.map((tt) => {
              const temp = new Date(this.nowTime);
              const td = temp.getDate();
              if (td > dayNum) TriggerApp.addMonths_(temp);
              temp.setDate(dayNum);
              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);

              if (temp.getTime() <= this.nowTime) {
                TriggerApp.addMonths_(temp);
                temp.setDate(dayNum);
              }
              return temp;
            });
          })
          .sort((a, b) => a.getTime() - b.getTime());

        const nextTime = dates.find((e) => e.getTime() > thresholdTime);
        if (!nextTime)
          throw new Error(
            "Current date time is out of range of the trigger date time.",
          );
        o[k] = nextTime;
      } else if (k === "everyYear") {
        const dates = v
          .flatMap((dateStr) => {
            const ee = new Date(dateStr);
            let t1y = ee.getFullYear();
            const t1m = ee.getMonth();
            const t1d = ee.getDate();
            const nowYear = this.now.getFullYear();

            if (t1y < nowYear) t1y = nowYear;

            return setTimeValues.map((tt) => {
              const temp = new Date(this.nowTime);
              const t2y = temp.getFullYear();
              const t2m = temp.getMonth();
              const t2d = temp.getDate();

              if (t2y > t1y) temp.setFullYear(temp.getFullYear() + 1);
              else temp.setFullYear(t1y);

              if (t2m > t1m) TriggerApp.addMonths_(temp);
              else temp.setMonth(t1m);

              if (t2d > t1d) temp.setDate(temp.getDate() + 1);
              else temp.setDate(t1d);

              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);

              if (temp.getTime() <= this.nowTime) {
                temp.setFullYear(temp.getFullYear() + 1);
              }
              return temp;
            });
          })
          .sort((a, b) => a.getTime() - b.getTime());

        const nextTime = dates.find((e) => e.getTime() > thresholdTime);
        if (!nextTime)
          throw new Error(
            "Current date time is out of range of the trigger date time.",
          );
        o[k] = nextTime;
      } else if (k === "everyDay" && v === true) {
        const dates = setTimeValues
          .map((tt) => {
            const temp = new Date(this.nowTime);
            const [hours, mins, secs = 0] = tt.split(":").map(Number);
            temp.setHours(hours, mins, secs, 0);
            return temp;
          })
          .sort((a, b) => a.getTime() - b.getTime());

        let nextTime = dates.find((e) => e.getTime() > thresholdTime);

        if (!nextTime) {
          const nextDayDates = setTimeValues
            .map((tt) => {
              const temp = new Date(this.nowTime);
              temp.setDate(temp.getDate() + 1);
              const [hours, mins, secs = 0] = tt.split(":").map(Number);
              temp.setHours(hours, mins, secs, 0);
              return temp;
            })
            .sort((a, b) => a.getTime() - b.getTime());

          nextTime = nextDayDates.find((e) => e.getTime() > thresholdTime);
        }
        if (nextTime) o[k] = nextTime;
      }

      return o;
    }, {});

    if (this.triggerOffset > 0) {
      this.dateKeys.forEach((key) => {
        if (rawValues[key]) {
          rawValues[key].setTime(rawValues[key].getTime() + this.triggerOffset);
        }
      });
    }

    return rawValues;
  }
}
