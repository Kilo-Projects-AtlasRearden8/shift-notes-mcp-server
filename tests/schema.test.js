"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");

const {
  EDUCATION_DISCLAIMER,
  TASK_TYPES,
  TASK_STATUSES,
  defaultShiftId,
  sanitizeString,
} = require("../src/storage");

const { ShiftNotesServer } = require("../src/server");

function getToolsList() {
  const server = new ShiftNotesServer();
  const handler = server._requestHandlers.get("tools/list");
  return handler({ method: "tools/list", params: {} }, {});
}

describe("Tool Schema Validation", () => {
  it("should have exactly 4 tools", async () => {
    const result = await getToolsList();
    assert.strictEqual(result.tools.length, 4);
  });

  it("should have log_shift_task tool with correct schema", async () => {
    const result = await getToolsList();
    const tool = result.tools.find((t) => t.name === "log_shift_task");

    assert.ok(tool, "log_shift_task tool should exist");
    assert.strictEqual(tool.name, "log_shift_task");
    assert.ok(tool.description.includes("education only"));
    assert.ok(tool.description.includes(EDUCATION_DISCLAIMER));

    const schema = tool.inputSchema;
    assert.strictEqual(schema.type, "object");
    assert.ok(schema.required.includes("type"));
    assert.ok(schema.required.includes("description"));
    assert.ok(schema.required.includes("status"));
    assert.ok(!schema.required.includes("shiftId"));
    assert.ok(!schema.required.includes("timestamp"));
    assert.strictEqual(schema.additionalProperties, false);

    assert.deepStrictEqual(schema.properties.type.enum, TASK_TYPES);
    assert.deepStrictEqual(schema.properties.status.enum, TASK_STATUSES);
  });

  it("should have log_handoff tool with correct schema", async () => {
    const result = await getToolsList();
    const tool = result.tools.find((t) => t.name === "log_handoff");

    assert.ok(tool, "log_handoff tool should exist");
    assert.strictEqual(tool.name, "log_handoff");
    assert.ok(tool.description.includes("education only"));

    const schema = tool.inputSchema;
    assert.strictEqual(schema.type, "object");
    assert.ok(schema.required.includes("fromRole"));
    assert.ok(schema.required.includes("toRole"));
    assert.ok(schema.required.includes("summary"));
    assert.ok(!schema.required.includes("shiftId"));
    assert.ok(!schema.required.includes("timestamp"));
    assert.strictEqual(schema.additionalProperties, false);
  });

  it("should have log_observation tool with correct schema", async () => {
    const result = await getToolsList();
    const tool = result.tools.find((t) => t.name === "log_observation");

    assert.ok(tool, "log_observation tool should exist");
    assert.strictEqual(tool.name, "log_observation");
    assert.ok(tool.description.includes("education only"));
    assert.ok(tool.description.includes("Do not include patient names"));

    const schema = tool.inputSchema;
    assert.strictEqual(schema.type, "object");
    assert.ok(schema.required.includes("category"));
    assert.ok(schema.required.includes("note"));
    assert.ok(!schema.required.includes("shiftId"));
    assert.ok(!schema.required.includes("timestamp"));
    assert.strictEqual(schema.additionalProperties, false);
  });

  it("should have get_shift_summary tool with correct schema", async () => {
    const result = await getToolsList();
    const tool = result.tools.find((t) => t.name === "get_shift_summary");

    assert.ok(tool, "get_shift_summary tool should exist");
    assert.strictEqual(tool.name, "get_shift_summary");
    assert.ok(tool.description.includes("education only"));

    const schema = tool.inputSchema;
    assert.strictEqual(schema.type, "object");
    assert.ok(!schema.required.includes("shiftId"));
    assert.ok(!schema.required.includes("format"));
    assert.strictEqual(schema.additionalProperties, false);
    assert.deepStrictEqual(schema.properties.format.enum, ["text", "json"]);
  });

  it("defaultShiftId should return date-based shift id", () => {
    const shiftId = defaultShiftId();
    assert.ok(shiftId.startsWith("shift-"));
    assert.ok(/\d{4}-\d{2}-\d{2}/.test(shiftId));
  });

  it("TASK_TYPES should contain expected values", () => {
    assert.ok(TASK_TYPES.includes("medication"));
    assert.ok(TASK_TYPES.includes("procedure"));
    assert.ok(TASK_TYPES.includes("assessment"));
    assert.ok(TASK_TYPES.includes("documentation"));
    assert.ok(TASK_TYPES.includes("communication"));
    assert.ok(TASK_TYPES.includes("other"));
  });

  it("TASK_STATUSES should contain expected values", () => {
    assert.ok(TASK_STATUSES.includes("pending"));
    assert.ok(TASK_STATUSES.includes("in-progress"));
    assert.ok(TASK_STATUSES.includes("completed"));
    assert.ok(TASK_STATUSES.includes("deferred"));
  });

  it("EDUCATION_DISCLAIMER should be present", () => {
    assert.ok(EDUCATION_DISCLAIMER.length > 0);
    assert.ok(EDUCATION_DISCLAIMER.includes("Education only"));
    assert.ok(EDUCATION_DISCLAIMER.includes("not medical advice"));
    assert.ok(EDUCATION_DISCLAIMER.includes("patient names"));
  });

  it("sanitizeString should trim whitespace", () => {
    assert.strictEqual(sanitizeString("  hello  "), "hello");
    assert.strictEqual(sanitizeString("hello"), "hello");
  });
});