import { APIResponse, ScreenshotRequest, ScreenshotResponse, ImageUploadRequest, ImageUploadResponse } from '../types';
import { BrowserSession } from '../../services/browser/BrowserSession';
import * as vscode from 'vscode';

export async function handleScreenshot(
    screenshotData: ScreenshotRequest,
    browserSession: BrowserSession,
    context: vscode.ExtensionContext
): Promise<APIResponse<ScreenshotResponse>> {
    try {
        let url: string;
        if (screenshotData.type === 'vscode') {
            url = 'vscode://file' + context.extensionUri.fsPath;
        } else {
            if (!screenshotData.url) {
                throw new Error('URL is required for webpage screenshots');
            }
            url = screenshotData.url;
        }

        await browserSession.launchBrowser();
        const result = await browserSession.navigateToUrl(url);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (screenshotData.fullPage) {
            let lastHeight = 0;
            while (true) {
                const result = await browserSession.scrollDown();
                if (!result.screenshot) {
                    break;
                }
                const match = result.currentMousePosition?.match(/\d+,(\d+)/);
                if (!match) {
                    break;
                }
                const currentHeight = parseInt(match[1]);
                if (currentHeight <= lastHeight) {
                    break;
                }
                lastHeight = currentHeight;
            }
            while (await browserSession.scrollUp()) {}
        }

        return {
            status: 'success',
            data: {
                image: result.screenshot || '',
                format: 'png',
                timestamp: new Date().toISOString(),
                dimensions: { width: 900, height: 600 }
            }
        };
    } finally {
        await browserSession.closeBrowser();
    }
}

export async function handleImageUpload(
    imageData: ImageUploadRequest,
    selectedImages: string[],
    setSelectedImages: (images: string[]) => void
): Promise<APIResponse<ImageUploadResponse>> {
    const newImages = [...selectedImages, ...imageData.images];
    setSelectedImages(newImages);
    
    return {
        status: 'success',
        data: {
            uploadedImages: imageData.images
        }
    };
}
