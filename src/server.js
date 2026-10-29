"use strict";

const z = require("zod");
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  InitializeRequestSchema,
  InitializeResultSchema,
  ServerCapabilitiesSchema,
} = require("../node_modules/@modelcontextprotocol/sdk/dist/cjs/types.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  appendEntry,
  getEntriesByShift,
  EDUCATION_DISCLAIMER,
  TASK_TYPES,
  TASK_STATUSES,
  defaultShiftId,
} = require("./storage");

const SERVER_NAME = "shift-notes-mcp-server";
const SERVER_VERSION = "1.0.0";

const { Protocol } = require("../node_modules/@modelcontextprotocol/sdk/dist/cjs/shared/protocol.js");

class ShiftNotesServer extends Protocol {
  constructor() {
    super({ capabilities: { tools: {} } });

    this.setRequestHandler(InitializeRequestSchema, async (request) => ({
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
    }));

    this.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "log_shift_task",
          description:
            "Log a shift task (education only, not medical advice). " +
            EDUCATION_DISCLAIMER,
          inputSchema: {
            type: "object",
            properties: {
              shiftId: {
                type: "string",
                description:
                  "Optional shift identifier. Defaults to today's date-based shift id.",
              },
              timestamp: {
                type: "string",
                description:
                  "Optional ISO-8601 timestamp. Defaults to the current time.",
              },
              type: {
                type: "string",
                enum: TASK_TYPES,
                description: "Category of the task.",
              },
              description: {
                type: "string",
                description: "Plain-language description of the task.",
              },
              status: {
                type: "string",
                enum: TASK_STATUSES,
                description: "Current status of the task.",
              },
            },
            required: ["type", "description", "status"],
            additionalProperties: false,
          },
        },
        {
          name: "log_handoff",
          description:
            "Log a shift handoff (education only, not medical advice). " +
            EDUCATION_DISCLAIMER,
          inputSchema: {
            type: "object",
            properties: {
              shiftId: {
                type: "string",
                description:
                  "Optional shift identifier. Defaults to today's date-based shift id.",
              },
              timestamp: {
                type: "string",
                description:
                  "Optional ISO-8601 timestamp. Defaults to the current time.",
              },
              fromRole: {
                type: "string",
                description: "Role handing off (e.g. outgoing nurse).",
              },
              toRole: {
                type: "string",
                description: "Role receiving the handoff (e.g. incoming nurse).",
              },
              summary: {
                type: "string",
                description: "Plain-language handoff summary.",
              },
            },
            required: ["fromRole", "toRole", "summary"],
            additionalProperties: false,
          },
        },
        {
          name: "log_observation",
          description:
            "Log an observation (education only, not medical advice). " +
            EDUCATION_DISCLAIMER +
            " Do not include patient names, identifiers, or protected health information.",
          inputSchema: {
            type: "object",
            properties: {
              shiftId: {
                type: "string",
                description:
                  "Optional shift identifier. Defaults to today's date-based shift id.",
              },
              timestamp: {
                type: "string",
                description:
                  "Optional ISO-8601 timestamp. Defaults to the current time.",
              },
              category: {
                type: "string",
                description: "Observation category (e.g. mobility, intake, skin).",
              },
              note: {
                type: "string",
                description: "Plain-language observation note without patient data.",
              },
            },
            required: ["category", "note"],
            additionalProperties: false,
          },
        },
        {
          name: "get_shift_summary",
          description:
            "Produce a printable text summary of a shift's logged notes (education only, not medical advice).",
          inputSchema: {
            type: "object",
            properties: {
              shiftId: {
                type: "string",
                description:
                  "Optional shift identifier. Defaults to today's date-based shift id.",
              },
              format: {
                type: "string",
                enum: ["text", "json"],
                description: "Output format. Defaults to text.",
              },
            },
            required: [],
            additionalProperties: false,
          },
        },
      ],
    }));

    this.setRequestHandler(CallToolRequestSchema, async (request) => {      const { name, arguments: args } = request.params;

      if (name === "log_shift_task") {
const entry = appendEntry("task", {
        shiftId: args.shiftId,
        timestamp: args.timestamp,
        taskType: args.type,
        description: args.description,
        status: args.status,
      });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { ok: true, entryId: entry.id, entry },
                null,
                2
              ),
            },
          ],
        };
      }

      if (name === "log_handoff") {
        const entry = appendEntry("handoff", {
          shiftId: args.shiftId,
          timestamp: args.timestamp,
          fromRole: args.fromRole,
          toRole: args.toRole,
          summary: args.summary,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { ok: true, entryId: entry.id, entry },
                null,
                2
              ),
            },
          ],
        };
      }

      if (name === "log_observation") {
        const entry = appendEntry("observation", {
          shiftId: args.shiftId,
          timestamp: args.timestamp,
          category: args.category,
          note: args.note,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { ok: true, entryId: entry.id, entry },
                null,
                2
              ),
            },
          ],
        };
      }

      if (name === "get_shift_summary") {
        const shiftId = args.shiftId || defaultShiftId();
        const format = args.format || "text";
        const entries = getEntriesByShift(shiftId);

        const tasks = entries.filter((e) => e.type === "task");
        const handoffs = entries.filter((e) => e.type === "handoff");
        const observations = entries.filter((e) => e.type === "observation");

        const summaryText = [
          `Shift Notes Summary — ${shiftId}`,
          `Generated: ${new Date().toISOString()}`,
          "",
          `Tasks (${tasks.length}):`,
          ...tasks.map(
            (e) =>
              `  - [${e.status}] ${e.timestamp} ${e.taskType}: ${e.description}`
          ),
          "",
          `Handoffs (${handoffs.length}):`,
          ...handoffs.map(
            (e) => `  - ${e.timestamp} ${e.fromRole} -> ${e.toRole}: ${e.summary}`
          ),
          "",
          `Observations (${observations.length}):`,
          ...observations.map(
            (e) => `  - ${e.timestamp} ${e.category}: ${e.note}`
          ),
          "",
          EDUCATION_DISCLAIMER,
          "",
        ].join("\n");

        if (format === "json") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    ok: true,
                    shiftId,
                    generatedAt: new Date().toISOString(),
                    counts: {
                      tasks: tasks.length,
                      handoffs: handoffs.length,
                      observations: observations.length,
                    },
                    entries,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: summaryText,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  assertRequestHandlerCapability() {
    // Capabilities already declared in constructor
  }
}

async function main() {
  const server = new ShiftNotesServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal server error:", err);
    process.exit(1);
  });
}

module.exports = { ShiftNotesServer };
