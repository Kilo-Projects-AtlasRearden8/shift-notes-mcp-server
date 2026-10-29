# Shift Notes MCP Server

An MCP (Model Context Protocol) server for logging nursing shift notes — tasks, handoffs, and observations — via stdio with local JSON storage and printable summaries.

Built for healthcare workers, by Asdale Dynamics, LLC. Education only. Never medical advice. Never patient data.

## What it does

This MCP server exposes four tools over stdio:

- **`log_shift_task`** — Log a shift task with type, description, and status (pending / in-progress / completed / deferred).
- **`log_handoff`** — Log a shift handoff from one role to another with a plain-language summary.
- **`log_observation`** — Log an observation (category + note), with a reminder not to include patient names or identifiers.
- **`get_shift_summary`** — Produce a printable text or JSON summary of everything logged for a shift.

## Local-first, no cloud

All data is stored in a local JSON file (`data/shift-notes.json`) in the project folder. Nothing is sent to the cloud. No API keys, no secrets, no network access required.

## Education only — never medical advice

This tool is for educational and organizational purposes only. It is not medical advice and is not a substitute for clinical judgment, facility policy, or licensed professional care.

**Do not include patient names, identifiers, or protected health information (PHI) in any logged entries.**

## How to run

```bash
# Install dependencies
npm install

# Start the MCP server on stdio
npm start
```

The server speaks the MCP protocol over stdio and can be connected to by any MCP client (Claude Desktop, Cursor, Continue, etc.).

### Example MCP client configuration

```json
{
  "mcpServers": {
    "shift-notes": {
      "command": "node",
      "args": ["/path/to/shift-notes-mcp-server/src/server.js"]
    }
  }
}
```

## Tests

```bash
npm test
```

Tests validate all four tool schemas (required fields, enums, additionalProperties, education disclaimers).

## Storage

Entries are appended to `data/shift-notes.json`. Each entry has an id, type, timestamp, shiftId, and type-specific fields. Shift IDs default to today's date (e.g. `shift-2026-10-29`).

## License

MIT License. Copyright (c) 2026 Asdale Dynamics, LLC.

## About Asdale Dynamics, LLC

Asdale Dynamics, LLC (Indiana, formed October 2026) is founded by Dylan Asdale, a registered nurse turned AI author. The LLC publishes beginner-friendly AI education, books and guides, and practical open-source tools — including MCP servers, local-LLM utilities, and agent skills.

Dylan's book *The Massive AI Manual* and hub site dylanasdale.github.io explain AI "like a friend would": plain English, step by step, never condescending.

This project is part of the LLC's healthcare-worker AI aids line: education only, never medical advice, local-first, tested, and free of secrets or personal data.
