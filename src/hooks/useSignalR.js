import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    HubConnectionBuilder,
    HubConnectionState
} from "@microsoft/signalr";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


export function useSignalR({
    token,
    onReceiveMessage,
    onMessageRead,
    onMessageDeletedForEveryone,
    onMessageDeletedForMe,
    onChatDeleted,
    onChatRequestCreated,
    onChatRequestAccepted,
    onGroupInvitationReceived,
    onGroupInvitationAccepted,
    onGroupMemberAdded,
    onGroupMemberRemoved
}) {
    const connectionRef =
        useRef(null);


    const callbacksRef =
        useRef({
            onReceiveMessage,
            onMessageRead,
            onMessageDeletedForEveryone,
            onMessageDeletedForMe,
            onChatDeleted,
            onChatRequestCreated,
            onChatRequestAccepted,
            onGroupInvitationReceived,
            onGroupInvitationAccepted,
            onGroupMemberAdded,
            onGroupMemberRemoved
        });


    const [
        connectionState,
        setConnectionState
    ] = useState(
        HubConnectionState.Disconnected
    );


    // ==========================================
    // UPDATE CALLBACKS
    // ==========================================

    useEffect(() => {
        callbacksRef.current = {
            onReceiveMessage,
            onMessageRead,
            onMessageDeletedForEveryone,
            onMessageDeletedForMe,
            onChatDeleted,
            onChatRequestCreated,
            onChatRequestAccepted,
            onGroupInvitationReceived,
            onGroupInvitationAccepted,
            onGroupMemberAdded,
            onGroupMemberRemoved
        };
    }, [
        onReceiveMessage,
        onMessageRead,
        onMessageDeletedForEveryone,
        onMessageDeletedForMe,
        onChatDeleted,
        onChatRequestCreated,
        onChatRequestAccepted,
        onGroupInvitationReceived,
        onGroupInvitationAccepted,
        onGroupMemberAdded,
        onGroupMemberRemoved
    ]);


    // ==========================================
    // CONNECTION
    // ==========================================

    useEffect(() => {
        if (!token) {
            return;
        }


        const connection =
            new HubConnectionBuilder()
                .withUrl(
                    `${API_BASE_URL}/hubs/chat`,
                    {
                        accessTokenFactory:
                            () => token
                    }
                )
                .withAutomaticReconnect()
                .build();


        connectionRef.current =
            connection;


        // ==========================================
        // RECEIVE MESSAGE
        // ==========================================

        connection.on(
            "ReceiveMessage",
            (data) => {
                callbacksRef.current
                    .onReceiveMessage?.(
                        data
                    );
            }
        );


        // ==========================================
        // MESSAGE READ
        // ==========================================

        connection.on(
            "MessageRead",
            (data) => {
                callbacksRef.current
                    .onMessageRead?.(
                        data
                    );
            }
        );


        // ==========================================
        // MESSAGE DELETED FOR EVERYONE
        // ==========================================

        connection.on(
            "MessageDeletedForEveryone",
            (data) => {
                callbacksRef.current
                    .onMessageDeletedForEveryone?.(
                        data
                    );
            }
        );


        // ==========================================
        // MESSAGE DELETED FOR ME
        // ==========================================

        connection.on(
            "MessageDeletedForMe",
            (data) => {
                callbacksRef.current
                    .onMessageDeletedForMe?.(
                        data
                    );
            }
        );


        // ==========================================
        // CHAT DELETED
        // ==========================================

        connection.on(
            "ChatDeleted",
            (data) => {
                callbacksRef.current
                    .onChatDeleted?.(
                        data
                    );
            }
        );


        // ==========================================
        // PRIVATE CHAT REQUEST
        // ==========================================

        connection.on(
            "ChatRequestCreated",
            (data) => {
                callbacksRef.current
                    .onChatRequestCreated?.(
                        data
                    );
            }
        );


        // ==========================================
        // PRIVATE CHAT REQUEST ACCEPTED
        // ==========================================

        connection.on(
            "ChatRequestAccepted",
            (data) => {
                callbacksRef.current
                    .onChatRequestAccepted?.(
                        data
                    );
            }
        );


        // ==========================================
        // GROUP INVITATION RECEIVED
        // ==========================================

        connection.on(
            "GroupInvitationReceived",
            (data) => {
                callbacksRef.current
                    .onGroupInvitationReceived?.(
                        data
                    );
            }
        );


        // ==========================================
        // GROUP INVITATION ACCEPTED
        // ==========================================

        connection.on(
            "GroupInvitationAccepted",
            (data) => {
                callbacksRef.current
                    .onGroupInvitationAccepted?.(
                        data
                    );
            }
        );


        // ==========================================
        // GROUP MEMBER ADDED
        // ==========================================

        connection.on(
            "GroupMemberAdded",
            (data) => {
                callbacksRef.current
                    .onGroupMemberAdded?.(
                        data
                    );
            }
        );


        // ==========================================
        // GROUP MEMBER REMOVED
        // ==========================================

        connection.on(
            "GroupMemberRemoved",
            (data) => {
                callbacksRef.current
                    .onGroupMemberRemoved?.(
                        data
                    );
            }
        );


        // ==========================================
        // CONNECTION STATE
        // ==========================================

        connection.onreconnecting(() => {
            setConnectionState(
                HubConnectionState.Reconnecting
            );
        });


        connection.onreconnected(() => {
            setConnectionState(
                HubConnectionState.Connected
            );
        });


        connection.onclose(() => {
            setConnectionState(
                HubConnectionState.Disconnected
            );
        });


        // ==========================================
        // START
        // ==========================================

        connection
            .start()
            .then(() => {
                console.log(
                    "SignalR connected:",
                    `${API_BASE_URL}/hubs/chat`
                );

                setConnectionState(
                    HubConnectionState.Connected
                );
            })
            .catch((error) => {
                console.error(
                    "SignalR connection error:",
                    error
                );

                setConnectionState(
                    HubConnectionState.Disconnected
                );
            });


        // ==========================================
        // CLEANUP
        // ==========================================

        return () => {
            connection.stop();

            connectionRef.current =
                null;
        };
    }, [token]);


    // ==========================================
    // WAIT FOR CONNECTION
    // ==========================================

    const waitForConnection =
        useCallback(
            async () => {
                const connection =
                    connectionRef.current;

                if (!connection) {
                    throw new Error(
                        "SignalR connection is not initialized."
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
                    HubConnectionState.Connecting ||
                    connection.state ===
                    HubConnectionState.Reconnecting
                ) {
                    await new Promise(
                        (resolve, reject) => {
                            const timeout =
                                setTimeout(
                                    () => {
                                        reject(
                                            new Error(
                                                "SignalR connection timeout."
                                            )
                                        );
                                    },
                                    10000
                                );


                            const check =
                                () => {
                                    if (
                                        connection.state ===
                                        HubConnectionState.Connected
                                    ) {
                                        clearTimeout(
                                            timeout
                                        );

                                        resolve();
                                    } else {
                                        setTimeout(
                                            check,
                                            100
                                        );
                                    }
                                };

                            check();
                        }
                    );

                    return connection;
                }

                throw new Error(
                    "SignalR is not connected."
                );
            },
            []
        );


    // ==========================================
    // JOIN CHAT
    // ==========================================

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


    // ==========================================
    // LEAVE CHAT
    // ==========================================

    const leaveChat =
        useCallback(
            async (chatId) => {
                const connection =
                    connectionRef.current;

                if (
                    !connection ||
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


    // ==========================================
    // SEND MESSAGE
    // ==========================================

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


    // ==========================================
    // MARK MESSAGE AS READ
    // ==========================================

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


    // ==========================================
    // DELETE MESSAGE FOR EVERYONE
    // ==========================================

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


    // ==========================================
    // DELETE MESSAGE FOR ME
    // ==========================================

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