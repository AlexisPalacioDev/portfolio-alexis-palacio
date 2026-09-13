# task-pulse

A task log that Claude Code sessions write to on their own.

The source of truth is an append-only event log at `~/.task-pulse/events.jsonl`.
The web app is a reader — it never owns the data.

```
~/.task-pulse/events.jsonl   append-only, durable, no server required
        ▲
        │  bin/tp.mjs  (the write path — a hook and Claude call this)
        │
        └──────────────▶  Next.js app  (the read path — derives tasks, shows them)
```

## Why an event log instead of a tasks table

Several Claude Code sessions can run at once. A mutable `tasks.json` means
read-modify-write with no lock, which corrupts the file the first time two
sessions overlap. An `appendFile` under 4 KB resolves to a single `O_APPEND`
`write(2)`, which the kernel serialises — concurrent writers cannot interleave.

Tasks are *derived* from events (`src/core/domain/task-projection.ts`):
`startedAt` is the first event, `finishedAt` is the completing one, and the
duration is the difference. Durations are measured, never estimated.

## Usage

```bash
npm run dev        # read the log at http://localhost:3000

node bin/tp.mjs start    --title "Fix 413" --summary "Whisper got the whole video" --project anai-backend
node bin/tp.mjs progress --task tp_abc123  --note "Extract mono mp3 first"
node bin/tp.mjs done     --task tp_abc123  --outcome "Merged to test"
node bin/tp.mjs open     # tasks started and not yet completed, as JSON
```

`start` prints the new task id on stdout.

## Pushing work to the team board

`bin/board-sync.mjs` copies completed tasks onto the Supabase-backed team
kanban. The board's UI creates one task at a time and then wants it dragged
into a column, which does not scale past a handful.

```bash
node bin/board-sync.mjs login --email you@example.com   # stores a refresh token, 0600
node bin/board-sync.mjs board                           # developers and categories
node bin/board-sync.mjs status                          # what is not on the board yet
node bin/board-sync.mjs sync --dry-run                  # preview, writes nothing
node bin/board-sync.mjs sync                            # create them
node bin/board-sync.mjs push batch.json                 # upload a curated batch
```

`sync` skips anything already recorded in `~/.task-pulse/board-synced.json`, so
running it twice is safe. Categories are matched by the keyword rules in
`~/.task-pulse/board-config.json` — edit that file rather than the script.

Use `push` when the titles and descriptions were written by hand instead of
lifted from the log; it accepts an array of
`{title, description, completed_at, category_id?, phase?}`.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `TASK_PULSE_HOME` | `~/.task-pulse` | Directory holding the log |
| `TASK_PULSE_EVENTS` | `$TASK_PULSE_HOME/events.jsonl` | Full path to the log, overrides the above |
| `BOARD_SYNC_PASSWORD` | — | Non-interactive login for `board-sync` |

| File | Purpose |
|---|---|
| `~/.task-pulse/board-config.json` | Board URL, key, developer name, category rules |
| `~/.task-pulse/board-auth.json` | Refresh token, `0600`. Never the password |
| `~/.task-pulse/board-synced.json` | Log task id → board task id, so `sync` never duplicates |

## Deploying later

`src/core/ports/event-store.ts` is the seam. Swapping `JsonlEventStore` for a
Postgres-backed store changes one implementation and no callers. That is the
whole reason the port exists.
