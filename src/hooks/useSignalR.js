import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    HubConnectionState
} from "@microsoft/signalr";

import { createChatConnection } from "../services/signalr";

export function useSignalR({
    token,
    onReceiveMessage,
    onMessageRead,
    onMessageDeletedForEveryone,
    onMessageDeletedForMe,
    onChatDeleted,
    onChatRequestCreated,
    onChatRequestAccepted
}) {
    const connectionRef = useRef(null);

    const callbacksRef = useRef({
        onReceiveMessage,
        onMessageRead,
        onMessageDeletedForEveryone,
        onMessageDeletedForMe,
        onChatDeleted,
        onChatRequestCreated,
        onChatRequestAccepted
    });

    const [connectionState, setConnectionState] =
        useState(
            HubConnectionState.Disconnected
        );

    useEffect(() => {
        callbacksRef.current = {
            onReceiveMessage,
            onMessageRead,
            onMessageDeletedForEveryone,
            onMessageDeletedForMe,
            onChatDeleted,
            onChatRequestCreated,
            onChatRequestAccepted
        };
    }, [
        onReceiveMessage,
        onMessageRead,
        onMessageDeletedForEveryone,
        onMessageDeletedForMe,
        onChatDeleted,
        onChatRequestCreated,
        onChatRequestAccepted
    ]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const connection =
            createChatConnection(token);

        connectionRef.current = connection;

        connection.on(
            "ReceiveMessage",
            (message) => {
                callbacksRef.current
                    .onReceiveMessage?.(
                        message
                    );
            }
        );

        connection.on(
            "MessageRead",
            (data) => {
                callbacksRef.current
                    .onMessageRead?.(
                        data
                    );
            }
        );

        connection.on(
            "MessageDeletedForEveryone",
            (data) => {
                callbacksRef.current
                    .onMessageDeletedForEveryone?.(
                        data
                    );
            }
        );

        connection.on(
            "MessageDeletedForMe",
            (data) => {
                callbacksRef.current
                    .onMessageDeletedForMe?.(
                        data
                    );
            }
        );

        connection.on(
            "ChatDeleted",
            async (chatId) => {
                try {
                    if (
                        connection.state ===
                        HubConnectionState.Connected
                    ) {
                        await connection.invoke(
                            "LeaveChat",
                            chatId
                        );
                    }
                } catch (error) {
                    console.error(
                        "Failed to leave deleted chat:",
                        error
                    );
                }

                callbacksRef.current
                    .onChatDeleted?.(
                        chatId
                    );
            }
        );

        connection.on(
            "ChatRequestCreated",
            (data) => {
                console.log(
                    "Chat request received:",
                    data
                );

                callbacksRef.current
                    .onChatRequestCreated?.(
                        data
                    );
            }
        );

        connection.on(
            "ChatRequestAccepted",
            (data) => {
                console.log(
                    "Chat request accepted:",
                    data
                );

                callbacksRef.current
                    .onChatRequestAccepted?.(
                        data
                    );
            }
        );

        connection.onreconnecting(() => {
            console.log(
                "SignalR reconnecting..."
            );

            setConnectionState(
                HubConnectionState.Reconnecting
            );
        });

        connection.onreconnected(() => {
            console.log(
                "SignalR reconnected."
            );

            setConnectionState(
                HubConnectionState.Connected
            );
        });

        connection.onclose(() => {
            console.log(
                "SignalR connection closed."
            );

            setConnectionState(
                HubConnectionState.Disconnected
            );
        });

        const startConnection =
            async () => {
                try {
                    setConnectionState(
                        HubConnectionState.Connecting
                    );

                    await connection.start();

                    console.log(
                        "SignalR connected."
                    );

                    setConnectionState(
                        HubConnectionState.Connected
                    );
                } catch (error) {
                    console.error(
                        "SignalR connection error:",
                        error
                    );

                    setConnectionState(
                        HubConnectionState.Disconnected
                    );
                }
            };

        startConnection();

        return () => {
            connection.stop();

            connectionRef.current = null;

            setConnectionState(
                HubConnectionState.Disconnected
            );
        };
    }, [token]);

    const waitForConnection =
        useCallback(
            async () => {
                const connection =
                    connectionRef.current;

                if (!connection) {
                    throw new Error(
                        "SignalR connection does not exist."
                    );
                }

                if (
                    connection.state ===
                    HubConnectionState.Connected
                ) {
                    return connection;
                }

                if (
                    connection.state ===
                    HubConnectionState.Disconnected
                ) {
                    try {
                        setConnectionState(
                            HubConnectionState.Connecting
                        );

                        await connection.start();

                        setConnectionState(
                            HubConnectionState.Connected
                        );

                        return connection;
                    } catch (error) {
                        setConnectionState(
                            HubConnectionState.Disconnected
                        );

                        throw error;
                    }
                }

                await new Promise(
                    (
                        resolve,
                        reject
                    ) => {
                        const timeout =
                            setTimeout(() => {
                                reject(
                                    new Error(
                                        "SignalR connection timeout."
                                    )
                                );
                            }, 10000);

                        const checkConnection =
                            () => {
                                const state =
                                    connection.state;

                                if (
                                    state ===
                                    HubConnectionState.Connected
                                ) {
                                    clearTimeout(
                                        timeout
                                    );

                                    resolve();
                                    return;
                                }

                                if (
                                    state ===
                                    HubConnectionState.Disconnected
                                ) {
                                    clearTimeout(
                                        timeout
                                    );

                                    reject(
                                        new Error(
                                            "SignalR connection was disconnected."
                                        )
                                    );

                                    return;
                                }

                                setTimeout(
                                    checkConnection,
                                    100
                                );
                            };

                        checkConnection();
                    }
                );

                return connection;
            },
            []
        );

    const joinChat =
        useCallback(
            async (chatId) => {
                const connection =
                    await waitForConnection();

                await connection.invoke(
                    "JoinChat",
                    chatId
                );
            },
            [waitForConnection]
        );

    const leaveChat =
        useCallback(
            async (chatId) => {
                const connection =
                    connectionRef.current;

                if (!connection) {
                    return;
                }

                if (
                    connection.state !==
                    HubConnectionState.Connected
                ) {
                    return;
                }

                await connection.invoke(
                    "LeaveChat",
                    chatId
                );
            },
            []
        );

    const sendMessage =
        useCallback(
            async (
                chatId,
                content
            ) => {
                const connection =
                    await waitForConnection();

                await connection.invoke(
                    "SendMessage",
                    chatId,
                    content
                );
            },
            [waitForConnection]
        );

    const markMessageAsRead =
        useCallback(
            async (
                chatId,
                messageId
            ) => {
                const connection =
                    await waitForConnection();

                await connection.invoke(
                    "MarkMessageAsRead",
                    chatId,
                    messageId
                );
            },
            [waitForConnection]
        );

    const deleteMessageForEveryone =
        useCallback(
            async (
                chatId,
                messageId
            ) => {
                const connection =
                    await waitForConnection();

                await connection.invoke(
                    "DeleteMessageForEveryone",
                    chatId,
                    messageId
                );
            },
            [waitForConnection]
        );

    const deleteMessageForMe =
        useCallback(
            async (
                chatId,
                messageId
            ) => {
                const connection =
                    await waitForConnection();

                await connection.invoke(
                    "DeleteMessageForMe",
                    chatId,
                    messageId
                );
            },
            [waitForConnection]
        );

    return {
        connectionState,
        joinChat,
        leaveChat,
        sendMessage,
        markMessageAsRead,
        deleteMessageForEveryone,
        deleteMessageForMe
    };
}