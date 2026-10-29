# STATUS

## What was built

An MCP (Model Context Protocol) server for nursing shift notes, built for Asdale Dynamics, LLC.

**Tools exposed over stdio:**
- `log_shift_task` — Log a shift task (type, description, status)
- `log_handoff` — Log a shift handoff (from role, to role, summary)
- `log_observation` — Log an observation (category, note, no patient data)
- `get_shift_summary` — Printable text or JSON summary of a shift's notes

**Storage:** Local JSON file (`data/shift-notes.json`), appended entries with id, type, timestamp, shiftId. No cloud, no network, no API keys.

**Safety:** Every tool description includes the education-only disclaimer. The observation tool explicitly warns against including patient names, identifiers, or PHI.

## How to run

```bash
npm install        # install dependencies
npm start          # start MCP server on stdio
npm test           # run schema tests
```

MCP client example (Claude Desktop, Cursor, Continue, etc.):

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

## Verification results

- **Unit tests:** 10/10 passing (`npm test`)
  - 4 tool schemas validated (required fields, enums, additionalProperties, education disclaimers)
  - shift ID format, task types, task statuses, disclaimer text all verified
- **End-to-end stdio test:** initialize, tools/list, tools/call (log task), get_shift_summary all verified working over stdio with a real MCP client exchange
- **Storage:** entries correctly persisted to `data/shift-notes.json` with proper shiftId, type, taskType fields
- **No secrets, API keys, or personal data in any file**

## Known gaps

- No `initialized` notification handler (MCP clients send this after initialize; server currently ignores it, which is acceptable for basic operation)
- No data retention or rotation (shift-notes.json grows indefinitely)
- No authentication or access control (local-first tool, intended for single-user local use)
- Data directory is created on first write; no pre-existing data file required
- The `data/` directory is gitignored and not committed

## Credits

Built by Asdale Dynamics, LLC (Indiana, formed October 2026). MIT License. Copyright (c) 2026 Asdale Dynamics, LLC.
