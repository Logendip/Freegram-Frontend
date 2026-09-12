import {
    HubConnectionBuilder,
    LogLevel
} from "@microsoft/signalr";

import { API_URL } from "./api";

export function createChatConnection(
    token
) {
    return new HubConnectionBuilder()
        .withUrl(
            `${API_URL}/hubs/chat`,
            {
                accessTokenFactory: () =>
                    token
            }
        )
        .withAutomaticReconnect()
        .configureLogging(
            LogLevel.Information
        )
        .build();
}