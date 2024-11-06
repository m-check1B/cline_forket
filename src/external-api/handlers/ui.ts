import { APIResponse, ViewRequest, MessageDisplayRequest } from '../types';
import { ClineAPI } from '../../exports/cline';

export async function handleButtonPrimary(api: ClineAPI): Promise<APIResponse> {
    await api.pressPrimaryButton();
    return { status: 'success' };
}

export async function handleButtonSecondary(api: ClineAPI): Promise<APIResponse> {
    await api.pressSecondaryButton();
    return { status: 'success' };
}

export async function handleViewChange(
    viewData: ViewRequest,
    setCurrentView: (view: 'history' | 'chat') => void,
    setShowAnnouncement: (show: boolean) => void
): Promise<APIResponse> {
    setCurrentView(viewData.view);
    if (viewData.showAnnouncement !== undefined) {
        setShowAnnouncement(viewData.showAnnouncement);
    }
    return { status: 'success' };
}

export async function handleMessageDisplay(
    displayData: MessageDisplayRequest,
    expandedMessageIds: number[],
    setExpandedMessageIds: (ids: number[]) => void
): Promise<APIResponse> {
    if (displayData.expanded) {
        setExpandedMessageIds([...expandedMessageIds, displayData.messageId]);
    } else {
        setExpandedMessageIds(expandedMessageIds.filter(id => id !== displayData.messageId));
    }
    return { status: 'success' };
}
