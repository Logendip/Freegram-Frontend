
import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel
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
    onChatRequestRejected,

    onGroupInvitationReceived,
    onGroupInvitationAccepted,
    onGroupInvitationRejected,

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
            onChatRequestRejected,

            onGroupInvitationReceived,
            onGroupInvitationAccepted,
            onGroupInvitationRejected,

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
    // DEVICE / BROWSER DIAGNOSTICS
    // ==========================================

    useEffect(() => {

        console.log(
            "=========================================="
        );

        console.log(
            "📱 Freegram SignalR diagnostics"
        );

        console.log(
            "=========================================="
        );

        console.log(
            "🌐 API URL:",
            API_BASE_URL
        );

        console.log(
            "📱 User Agent:",
            navigator.userAgent
        );

        console.log(
            "📐 Screen:",
            `${window.innerWidth}x${window.innerHeight}`
        );

        console.log(
            "🌍 Online:",
            navigator.onLine
        );

        console.log(
            "📄 Visibility:",
            document.visibilityState
        );

        console.log(
            "🔐 Token exists:",
            Boolean(token)
        );

        console.log(
            "=========================================="
        );

    }, [token]);


    // ==========================================
    // ONLINE / OFFLINE DIAGNOSTICS
    // ==========================================

    useEffect(() => {

        const handleOnline = () => {

            console.log(
                "🟢 Browser/network ONLINE"
            );

        };


        const handleOffline = () => {

            console.warn(
                "🔴 Browser/network OFFLINE"
            );

        };


        const handleVisibilityChange = () => {

            console.log(
                "👁️ Page visibility changed:",
                document.visibilityState
            );

            const connection =
                connectionRef.current;

            if (connection) {

                console.log(
                    "🔌 Current SignalR state:",
                    connection.state
                );

            }

        };


        window.addEventListener(
            "online",
            handleOnline
        );

        window.addEventListener(
            "offline",
            handleOffline
        );

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        return () => {

            window.removeEventListener(
                "online",
                handleOnline
            );

            window.removeEventListener(
                "offline",
                handleOffline
            );

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

        };

    }, []);


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
            onChatRequestRejected,

            onGroupInvitationReceived,
            onGroupInvitationAccepted,
            onGroupInvitationRejected,

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
        onChatRequestRejected,

        onGroupInvitationReceived,
        onGroupInvitationAccepted,
        onGroupInvitationRejected,

        onGroupMemberAdded,
        onGroupMemberRemoved

    ]);


    // ==========================================
    // CONNECTION
    // ==========================================

    useEffect(() => {

        if (!token) {

            console.log(
                "⚠️ SignalR: no token. Connection will not start."
            );

            return;

        }


        console.log(
            "🔵 SignalR: creating connection..."
        );

        console.log(
            "🔗 SignalR URL:",
            `${API_BASE_URL}/hubs/chat`
        );


        const connection =
            new HubConnectionBuilder()

                .withUrl(
                    `${API_BASE_URL}/hubs/chat`,
                    {
                        accessTokenFactory: () => {

                            console.log(
                                "🔑 SignalR: access token requested."
                            );

                            return token;

                        }
                    }
                )

                .withAutomaticReconnect([
                    0,
                    2000,
                    5000,
                    10000,
                    30000
                ])

                .configureLogging(
                    LogLevel.Information
                )

                .build();


        connectionRef.current =
            connection;


        // ==========================================
        // RECEIVE MESSAGE
        // ==========================================

        connection.on(
            "ReceiveMessage",
            (data) => {

                console.log(
                    "💬 ReceiveMessage received:",
                    data
                );

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

                console.log(
                    "👁️ MessageRead received:",
                    data
                );

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

                console.log(
                    "🗑️ MessageDeletedForEveryone received:",
                    data
                );

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

                console.log(
                    "🗑️ MessageDeletedForMe received:",
                    data
                );

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

                console.log(
                    "🗑️ ChatDeleted received:",
                    data
                );

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

                console.log(
                    "=========================================="
                );

                console.log(
                    "🔥🔥🔥 ChatRequestCreated RECEIVED 🔥🔥🔥"
                );

                console.log(
                    "📦 Data:",
                    data
                );

                console.log(
                    "📱 Device:",
                    navigator.userAgent
                );

                console.log(
                    "🌐 Online:",
                    navigator.onLine
                );

                console.log(
                    "👁️ Visibility:",
                    document.visibilityState
                );

                console.log(
                    "🔌 SignalR state:",
                    connection.state
                );

                console.log(
                    "⏰ Time:",
                    new Date().toISOString()
                );

                console.log(
                    "=========================================="
                );


                if (
                    !callbacksRef.current
                        .onChatRequestCreated
                ) {

                    console.error(
                        "❌ onChatRequestCreated callback DOES NOT EXIST!"
                    );

                    return;

                }


                console.log(
                    "➡️ Calling onChatRequestCreated callback..."
                );


                callbacksRef.current
                    .onChatRequestCreated(
                        data
                    );


                console.log(
                    "✅ onChatRequestCreated callback called."
                );

            }
        );


        // ==========================================
        // PRIVATE CHAT REQUEST ACCEPTED
        // ==========================================

        connection.on(
            "ChatRequestAccepted",
            (data) => {

                console.log(
                    "✅ ChatRequestAccepted received:",
                    data
                );

                callbacksRef.current
                    .onChatRequestAccepted?.(
                        data
                    );

            }
        );


        // ==========================================
        // PRIVATE CHAT REQUEST REJECTED
        // ==========================================

        connection.on(
            "ChatRequestRejected",
            (data) => {

                console.log(
                    "❌ ChatRequestRejected received:",
                    data
                );

                callbacksRef.current
                    .onChatRequestRejected?.(
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

                console.log(
                    "👥 GroupInvitationReceived received:",
                    data
                );

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

                console.log(
                    "👥 GroupInvitationAccepted received:",
                    data
                );

                callbacksRef.current
                    .onGroupInvitationAccepted?.(
                        data
                    );

            }
        );


        // ==========================================
        // GROUP INVITATION REJECTED
        // ==========================================

        connection.on(
            "GroupInvitationRejected",
            (data) => {

                console.log(
                    "❌ GroupInvitationRejected received:",
                    data
                );

                callbacksRef.current
                    .onGroupInvitationRejected?.(
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

                console.log(
                    "👤 GroupMemberAdded received:",
                    data
                );

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

                console.log(
                    "👤 GroupMemberRemoved received:",
                    data
                );

                callbacksRef.current
                    .onGroupMemberRemoved?.(
                        data
                    );

            }
        );


        // ==========================================
        // RECONNECTING
        // ==========================================

        connection.onreconnecting(
            (error) => {

                console.warn(
                    "🟠 SignalR RECONNECTING..."
                );

                console.warn(
                    "Reason:",
                    error
                );

                console.warn(
                    "Current state:",
                    connection.state
                );


                setConnectionState(
                    HubConnectionState.Reconnecting
                );

            }
        );


        // ==========================================
        // RECONNECTED
        // ==========================================

        connection.onreconnected(
            (connectionId) => {

                console.log(
                    "🟢🟢🟢 SignalR RECONNECTED!"
                );

                console.log(
                    "Connection ID:",
                    connectionId
                );

                console.log(
                    "State:",
                    connection.state
                );


                setConnectionState(
                    HubConnectionState.Connected
                );

            }
        );


        // ==========================================
        // CLOSED
        // ==========================================

        connection.onclose(
            (error) => {

                console.error(
                    "🔴🔴🔴 SignalR CONNECTION CLOSED!"
                );

                console.error(
                    "Error:",
                    error
                );

                console.error(
                    "State:",
                    connection.state
                );


                setConnectionState(
                    HubConnectionState.Disconnected
                );

            }
        );


        // ==========================================
        // START CONNECTION
        // ==========================================

        console.log(
            "🚀 SignalR: starting connection..."
        );


        connection
            .start()

            .then(() => {

                console.log(
                    "=========================================="
                );

                console.log(
                    "🟢🟢🟢 SIGNALR CONNECTED SUCCESSFULLY 🟢🟢🟢"
                );

                console.log(
                    "🔗 URL:",
                    `${API_BASE_URL}/hubs/chat`
                );

                console.log(
                    "🔌 State:",
                    connection.state
                );

                console.log(
                    "📱 User Agent:",
                    navigator.userAgent
                );

                console.log(
                    "🌐 Online:",
                    navigator.onLine
                );

                console.log(
                    "👁️ Visibility:",
                    document.visibilityState
                );

                console.log(
                    "⏰ Time:",
                    new Date().toISOString()
                );

                console.log(
                    "=========================================="
                );


                setConnectionState(
                    HubConnectionState.Connected
                );

            })

            .catch((error) => {

                console.error(
                    "=========================================="
                );

                console.error(
                    "🔴🔴🔴 SIGNALR CONNECTION ERROR 🔴🔴🔴"
                );

                console.error(
                    "Error:",
                    error
                );

                console.error(
                    "Message:",
                    error?.message
                );

                console.error(
                    "Stack:",
                    error?.stack
                );

                console.error(
                    "API URL:",
                    API_BASE_URL
                );

                console.error(
                    "SignalR URL:",
                    `${API_BASE_URL}/hubs/chat`
                );

                console.error(
                    "Online:",
                    navigator.onLine
                );

                console.error(
                    "=========================================="
                );


                setConnectionState(
                    HubConnectionState.Disconnected
                );

            });


        // ==========================================
        // CLEANUP
        // ==========================================

        return () => {

            console.log(
                "🧹 SignalR: cleaning up connection..."
            );


            connection
                .stop()
                .then(() => {

                    console.log(
                        "🔌 SignalR connection stopped."
                    );

                })
                .catch((error) => {

                    console.error(
                        "❌ Error stopping SignalR:",
                        error
                    );

                });


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

                    console.error(
                        "❌ SignalR connection is not initialized."
                    );

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

                    console.log(
                        "⏳ Waiting for SignalR connection..."
                    );


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


                console.error(
                    "❌ SignalR is not connected.",
                    {
                        state:
                            connection.state
                    }
                );


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


                console.log(
                    "➡️ JoinChat:",
                    chatId
                );


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

                    console.warn(
                        "⚠️ LeaveChat skipped. SignalR is not connected."
                    );

                    return;

                }


                console.log(
                    "⬅️ LeaveChat:",
                    chatId
                );


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


                console.log(
                    "📤 SendMessage:",
                    {
                        chatId,
                        content
                    }
                );


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


                console.log(
                    "👁️ MarkMessageAsRead:",
                    {
                        chatId,
                        messageId
                    }
                );


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


                console.log(
                    "🗑️ DeleteMessageForEveryone:",
                    {
                        chatId,
                        messageId
                    }
                );


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


                console.log(
                    "🗑️ DeleteMessageForMe:",
                    {
                        chatId,
                        messageId
                    }
                );


                await connection.invoke(
                    "DeleteMessageForMe",
                    chatId,
                    messageId
                );

            },
            [waitForConnection]
        );


    // ==========================================
    // RETURN
    // ==========================================

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

