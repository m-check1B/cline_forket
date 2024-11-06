#!/bin/bash
cd webview-ui
mkdir -p src/shared
cd src/shared
ln -sf ../../../src/shared/api.ts .
ln -sf ../../../src/shared/array.ts .
ln -sf ../../../src/shared/combineApiRequests.ts .
ln -sf ../../../src/shared/combineCommandSequences.ts .
ln -sf ../../../src/shared/context-mentions.ts .
ln -sf ../../../src/shared/getApiMetrics.ts .
ln -sf ../../../src/shared/ExtensionMessage.ts .
ln -sf ../../../src/shared/HistoryItem.ts .
ln -sf ../../../src/shared/WebviewMessage.ts .
