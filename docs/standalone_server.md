# Standalone API Server

This document describes the standalone API server for task management.

## Overview

The API server is a completely independent service that runs separately from Cline. While its code lives in the Cline repository under `/standalone-server`, it:
- Has no dependencies on Cline or VSCode
- Runs as a standalone service
- Can be used by any client that follows the API

## Installation

1. Navigate to the standalone server directory:
   ```bash
   cd cline/standalone-server
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server will run on:
- HTTP API: http://localhost:7230
- WebSocket: ws://localhost:7231

## API Usage Examples

### Get API Documentation
```bash
curl http://localhost:7230/api/docs
```

### Start a Task
```bash
curl -X POST -H "Content-Type: application/json" -d '{"task": "hello matey"}' http://localhost:7230/api/task/start

# Server Response:
# Task received: { task: 'hello matey' }
```

### Stop a Task
```bash
curl -X POST http://localhost:7230/api/task/stop

# Server Response:
# Stopping task
```

## WebSocket Events

The server broadcasts the following events to all connected WebSocket clients:

1. Task Start:
```json
{
    "type": "taskStart",
    "task": {
        "task": "task content",
        "images": ["optional array of image paths"]
    }
}
```

2. Task Stop:
```json
{
    "type": "taskStop"
}
```

## Development

For development with auto-reload:
```bash
npm run dev
```

## Architecture Note

The server is designed to be completely independent:
- No VSCode or Cline dependencies
- Runs as a standalone service
- Can be used by any client that follows the API
- Lives in the Cline repo for code organization only

## Future Improvements

Potential areas for enhancement:
- Add configuration options for ports
- Implement authentication/authorization
- Add more detailed logging
- Expand API endpoints for additional functionality
