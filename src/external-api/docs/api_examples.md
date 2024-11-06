# External API Usage Examples

## Common Use Cases

### 1. Task Management Flow

Start a new task:
```http
POST /task
{
    "task": "Create a React component",
    "images": ["data:image/jpeg;base64,..."]
}
```

Monitor task status:
```http
GET /status
```

Send follow-up message:
```http
POST /message
{
    "message": "Make it responsive",
    "images": ["data:image/jpeg;base64,..."]
}
```

### 2. Tool Use Flow

When Cline suggests using a tool:
1. Monitor status for tool request
2. Approve tool use:
```http
POST /button/primary
```

Or reject with feedback:
```http
POST /message
{
    "message": "Try a different approach"
}
```

### 3. Screenshot Workflow

Capture VSCode:
```http
POST /screenshot
{
    "type": "vscode",
    "fullPage": true
}
```

Capture webpage:
```http
POST /screenshot
{
    "type": "webpage",
    "url": "http://localhost:3000",
    "fullPage": true
}
```

### 4. Configuration Management

Get current config:
```http
GET /config
```

Update config:
```http
POST /config
{
    "apiProvider": "anthropic",
    "apiModelId": "claude-3-sonnet",
    "apiKey": "your-key"
}
```

## AI Agent Integration

### 1. Basic Task Execution

```typescript
async function executeTask(task: string, images?: string[]) {
    // Start task
    await fetch('http://localhost:7777/task', {
        method: 'POST',
        body: JSON.stringify({ task, images })
    });

    // Monitor status
    while (true) {
        const status = await fetch('http://localhost:7777/status').then(r => r.json());
        if (status.data.taskStatus.active) {
            // Handle tool requests
            if (needsToolApproval(status)) {
                await fetch('http://localhost:7777/button/primary', { method: 'POST' });
            }
        } else {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
```

### 2. Visual Analysis Flow

```typescript
async function analyzeVisual(url: string) {
    // Capture screenshot
    const screenshot = await fetch('http://localhost:7777/screenshot', {
        method: 'POST',
        body: JSON.stringify({
            type: 'webpage',
            url,
            fullPage: true
        })
    }).then(r => r.json());

    // Send for analysis
    await fetch('http://localhost:7777/task', {
        method: 'POST',
        body: JSON.stringify({
            task: "Analyze this webpage",
            images: [screenshot.data.image]
        })
    });
}
```

### 3. Interactive Development

```typescript
async function developComponent(spec: string) {
    // Start development task
    await fetch('http://localhost:7777/task', {
        method: 'POST',
        body: JSON.stringify({
            task: `Create a React component: ${spec}`
        })
    });

    // Monitor and capture results
    while (true) {
        const status = await fetch('http://localhost:7777/status').then(r => r.json());
        if (status.data.taskStatus.active) {
            // Approve tool use
            if (needsToolApproval(status)) {
                await fetch('http://localhost:7777/button/primary', { method: 'POST' });
            }
            
            // Capture development results
            if (isDevelopmentComplete(status)) {
                const screenshot = await fetch('http://localhost:7777/screenshot', {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'webpage',
                        url: 'http://localhost:3000',
                        fullPage: true
                    })
                }).then(r => r.json());
                
                // Verify result
                await fetch('http://localhost:7777/message', {
                    method: 'POST',
                    body: JSON.stringify({
                        message: "Verify the component",
                        images: [screenshot.data.image]
                    })
                });
            }
        } else {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
```

## Error Handling

### 1. API Errors

```typescript
async function handleApiError(error: any) {
    if (error.status === 'error') {
        // Handle specific error types
        switch (error.error) {
            case 'Invalid parameters':
                // Fix parameters and retry
                break;
            case 'Tool execution failed':
                // Try alternative approach
                break;
            default:
                // General error handling
                break;
        }
    }
}
```

### 2. Tool Use Errors

```typescript
async function handleToolError(status: any) {
    if (status.data.taskStatus.currentAsk === 'tool') {
        // Reject tool use with feedback
        await fetch('http://localhost:7777/message', {
            method: 'POST',
            body: JSON.stringify({
                message: "This tool won't work because..."
            })
        });
    }
}
```

## Best Practices

1. Always monitor task status
2. Handle partial messages
3. Validate tool use requests
4. Capture and analyze results
5. Provide clear feedback
6. Handle errors gracefully
7. Monitor metrics
8. Use appropriate timeouts

## Tips & Tricks

1. Use the /status endpoint to track:
   - Task progress
   - Tool requests
   - UI state
   - Metrics

2. Combine screenshots with messages:
   ```typescript
   const screenshot = await captureScreenshot();
   await sendMessage("Check this result", [screenshot]);
   ```

3. Monitor browser sessions:
   ```typescript
   const status = await getStatus();
   const activeBrowser = status.browserSessions.length > 0;
   ```

4. Track metrics:
   ```typescript
   const status = await getStatus();
   const cost = status.apiMetrics.totalCost;
   ```

5. Handle long-running tasks:
   ```typescript
   const timeout = setTimeout(() => {
       fetch('http://localhost:7777/cancel', { method: 'POST' });
   }, 5 * 60 * 1000);  // 5 minutes
