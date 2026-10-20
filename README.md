<div align="center">

# Taskora ✳

### Make space for progress.

A thoughtful task workspace with a clean REST API. Built for focused work, clear priorities, and small wins.

[Live demo](https://taskora-api-nwq2.onrender.com) · [Features](#features) · [Quick start](#quick-start) · [API reference](#api-reference) · [Testing](#testing)

<img src="https://skillicons.dev/icons?i=nodejs,express,js,html,css,git,github,vscode&theme=light" alt="Node.js, Express, JavaScript, HTML, CSS, Git, GitHub, VS Code" />

**Code More Internship · Week 5 · Task 3**

</div>

---

## The idea

Taskora brings a little structure to everyday work. A warm neutral palette, lime accents, editorial typography, and a quiet navigation rail keep the focus on what comes next. The same Express server serves the interface and REST API.

## Features

- Create, view, edit, and delete tasks with a confirmation before deletion.
- Move tasks through **To do → In progress → Completed** using the status button.
- Set priorities, categories, descriptions, and optional due dates.
- Search titles, descriptions, and categories; combine status and priority filters.
- Sort by creation time, priority, or due date, with server-side pagination.
- Track total tasks, work in progress, completions, and completion percentage.
- Switch between light and dark themes; your preference is saved on your device.
- Responsive phone, tablet, and desktop layouts with keyboard-accessible controls.
- Consistent JSON responses, input validation, and centralized error handling.
- Local JSON storage with serialized writes and an isolated API integration test.

## Quick start

Requires **Node.js 22 or newer** and npm.

```sh
git clone https://github.com/rachit1807/taskora-api.git
cd taskora-api
npm ci
npm start
```

Open **http://localhost:3000**.

| Command | Purpose |
| --- | --- |
| `npm start` | Start the application |
| `npm run dev` | Restart automatically when server files change |
| `npm test` | Run the API integration test |

Optional environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP listening port |
| `DATA_FILE` | `data/tasks.json` | Absolute path to task storage; its parent directory must exist |

Five example tasks appear on first launch. The first write saves the task collection to disk. Data files are excluded from Git.

## Project structure

```text
taskora-api/
├── public/
│   ├── index.html                 # Workspace and task dialogs
│   ├── style.css                  # Responsive layout and themes
│   ├── app.js                     # Interface and API integration
│   └── favicon.svg
├── src/
│   ├── app.js                     # Express configuration
│   ├── server.js                  # HTTP entry point
│   ├── routes/apiRoutes.js        # Resource routes
│   ├── controllers/apiController.js
│   └── middleware/errorHandler.js
├── collections/taskora.postman_collection.json
├── test/api.test.js
├── data/                          # Local runtime data (ignored)
├── package.json
└── README.md
```

## API reference

Base URL: `http://localhost:3000/api`. Request bodies use `Content-Type: application/json`.

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/tasks` | List, search, filter, sort, and paginate tasks |
| GET | `/tasks/:id` | Retrieve one task |
| POST | `/tasks` | Create a task; returns **201** |
| PUT | `/tasks/:id` | Replace editable task fields |
| DELETE | `/tasks/:id` | Delete a task; returns **204** with no body |

### Task schema

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Server-generated UUID |
| `title` | string | Required, 1–120 characters, trimmed |
| `description` | string | Up to 2,000 characters; default empty |
| `status` | string | `todo`, `in-progress`, or `done`; default `todo` |
| `priority` | string | `low`, `medium`, or `high`; default `medium` |
| `category` | string | 1–40 characters; default `Personal` |
| `dueDate` | string | Valid `YYYY-MM-DD` date or empty string |
| `createdAt` | string | Server-generated ISO timestamp |
| `updatedAt` | string | Server-managed ISO timestamp |

`PUT` requires a title. Omitted optional fields reset to their defaults. IDs and timestamps are read-only.

### Collection query parameters

| Parameter | Accepted values / behavior |
| --- | --- |
| `search` | Case-insensitive substring in title, description, or category |
| `status` | `todo`, `in-progress`, `done` |
| `priority` | `low`, `medium`, `high` |
| `sort` | `newest` (default), `oldest`, `priority`, `dueDate` |
| `page` | Positive integer; default `1` |
| `limit` | Integer from `1` to `100`; default `9` |

Priority sorts high → low; due dates sort soonest first with undated tasks last. Overview statistics describe the entire collection, independent of filters.

```sh
curl 'http://localhost:3000/api/tasks?status=todo&priority=high&page=1&limit=6'

curl -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ship the next milestone","priority":"high","category":"Development","status":"todo"}'
```

Successful collection response:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 6, "total": 0, "pages": 0 },
  "stats": { "total": 0, "todo": 0, "inProgress": 0, "done": 0 }
}
```

Single-resource responses use `{ "success": true, "data": { ...task } }`.

### Errors

```json
{
  "success": false,
  "error": { "message": "Task not found." }
}
```

| Status | Meaning |
| --- | --- |
| 400 | Invalid fields, query parameters, or malformed JSON |
| 404 | Task or endpoint does not exist |
| 413 | Request body exceeds 32 KB |
| 500 | Unexpected server error; internal details are hidden |

## Testing

Run `npm test` to exercise creation, retrieval, replacement, filtering, pagination, deletion, invalid fields, invalid dates, malformed JSON, and missing resources. Tests use temporary storage and do not modify workspace tasks.

Import `collections/taskora.postman_collection.json` into Postman. Run the collection in order: creation stores `taskId` automatically for subsequent requests. Change `baseUrl` to target a deployed instance.

## Deployment notes

The application binds to `0.0.0.0` and respects the host-provided `PORT`.

- Build/install command: `npm ci`
- Start command: `npm start`
- Health endpoint: `/api/health`

This version is a **single shared demonstration workspace without authentication**. Visitors to a public deployment can change its tasks. JSON storage is intended for one application process; use a persistent disk or a database before relying on hosted data. Hosts with ephemeral filesystems may reset tasks on restart or redeployment. Do not store private information in the public demo.

Google Fonts supplies the optional web fonts; system fonts remain available as fallbacks. Technology icons in this README are supplied by Skill Icons.

## Author

**Rachit Tripathi** · [GitHub](https://github.com/rachit1807)
