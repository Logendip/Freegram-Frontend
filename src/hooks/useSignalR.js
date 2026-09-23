
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
        useRef({});


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
    // DIAGNOSTICS
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
    // ONLINE / OFFLINE
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
                "👁️ Page visibility:",
                document.visibilityState
            );

            const connection =
                connectionRef.current;

            if (connection) {

                console.log(
                    "🔌 SignalR state:",
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
    // SIGNALR CONNECTION
    // ==========================================

    useEffect(() => {

        if (!token) {

            console.log(
                "⚠️ SignalR: no token."
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
                    "💬 ReceiveMessage:",
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
                    "👁️ MessageRead:",
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
                    "🗑️ MessageDeletedForEveryone:",
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
                    "🗑️ MessageDeletedForMe:",
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
                    "🗑️ ChatDeleted:",
                    data
                );

                callbacksRef.current
                    .onChatDeleted?.(
                        data
                    );

            }
        );


        // ==========================================
        // PRIVATE CHAT REQUEST CREATED
        // ==========================================

        connection.on(
            "ChatRequestCreated",
            (data) => {

                console.log(
                    "=========================================="
                );

                console.log(
                    "🔥 ChatRequestCreated RECEIVED"
                );

                console.log(
                    "📦 Data:",
                    data
                );

                console.log(
                    "=========================================="
                );


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

                console.log(
                    "✅ ChatRequestAccepted:",
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
                    "❌ ChatRequestRejected:",
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
                    "=========================================="
                );

                console.log(
                    "🔥🔥🔥 GROUP INVITATION RECEIVED 🔥🔥🔥"
                );

                console.log(
                    "📦 Invitation data:",
                    data
                );

                console.log(
                    "📱 Device:",
                    navigator.userAgent
                );

                console.log(
                    "🌍 Online:",
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
                    "Callback exists:",
                    Boolean(
                        callbacksRef.current
                            .onGroupInvitationReceived
                    )
                );

                console.log(
                    "=========================================="
                );


                const callback =
                    callbacksRef.current
                        .onGroupInvitationReceived;


                if (!callback) {

                    console.error(
                        "❌ onGroupInvitationReceived callback DOES NOT EXIST!"
                    );

                    return;

                }


                console.log(
                    "➡️ Calling onGroupInvitationReceived..."
                );


                try {

                    callback(data);

                    console.log(
                        "✅ onGroupInvitationReceived executed successfully."
                    );

                } catch (error) {

                    console.error(
                        "❌ ERROR INSIDE onGroupInvitationReceived:",
                        error
                    );

                }

            }
        );


        // ==========================================
        // GROUP INVITATION ACCEPTED
        // ==========================================

        connection.on(
            "GroupInvitationAccepted",
            (data) => {

                console.log(
                    "👥 GroupInvitationAccepted:",
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
                    "❌ GroupInvitationRejected:",
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
                    "👤 GroupMemberAdded:",
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
                    "👤 GroupMemberRemoved:",
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
                    "🟠 SignalR RECONNECTING...",
                    error
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


                setConnectionState(
                    HubConnectionState.Disconnected
                );

            }
        );


        // ==========================================
        // START
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
                    "🔴 SIGNALR CONNECTION ERROR"
                );

                console.error(
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


            if (
                connection.state !==
                HubConnectionState.Disconnected
            ) {

                connection
                    .stop()
                    .catch(
                        (error) => {

                            console.error(
                                "❌ Error stopping SignalR:",
                                error
                            );

                        }
                    );

            }


            if (
                connectionRef.current ===
                connection
            ) {

                connectionRef.current =
                    null;

            }

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

                    console.log(
                        "⏳ Waiting for SignalR..."
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

                                        return;

                                    }


                                    if (
                                        connection.state ===
                                            HubConnectionState.Disconnected
                                    ) {

                                        clearTimeout(
                                            timeout
                                        );

                                        reject(
                                            new Error(
                                                "SignalR disconnected."
                                            )
                                        );

                                        return;

                                    }


                                    setTimeout(
                                        check,
                                        100
                                    );

                                };


                            check();

                        }
                    );


                    return connection;

                }


                throw new Error(
                    `SignalR is not connected. State: ${connection.state}`
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
                        "⚠️ LeaveChat skipped."
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
