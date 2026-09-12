import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    getChats,
    getMessages,
    createPrivateChat,
    deleteChat,
    getChatRequests,
    acceptChatRequest,
    rejectChatRequest
} from "../services/api";

import { useAuth } from "../contexts/AuthContext";

import { useSignalR } from "../hooks/useSignalR";

import MessengerLayout from "../components/layout/MessengerLayout";

import ChatSidebar from "../components/chats/ChatSidebar";

import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";


function MessengerPage() {
    const { user, token } = useAuth();

    const [chats, setChats] = useState([]);

    const [selectedChat, setSelectedChat] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [chatRequests, setChatRequests] =
        useState([]);


    // ==========================================
    // SIGNALR CALLBACKS
    // ==========================================

    const handleReceiveMessage =
        useCallback((message) => {
            setMessages(
                (previousMessages) => {
                    const exists =
                        previousMessages.some(
                            (item) =>
                                item.id ===
                                message.id
                        );

                    if (exists) {
                        return previousMessages;
                    }

                    return [
                        ...previousMessages,
                        message
                    ];
                }
            );
        }, []);


    const handleMessageDeletedForEveryone =
        useCallback((data) => {
            setMessages(
                (previousMessages) =>
                    previousMessages.filter(
                        (message) =>
                            message.id !==
                            data.messageId
                    )
            );
        }, []);


    const handleMessageDeletedForMe =
        useCallback((data) => {
            setMessages(
                (previousMessages) =>
                    previousMessages.filter(
                        (message) =>
                            message.id !==
                            data.messageId
                    )
            );
        }, []);


    const handleChatDeleted =
        useCallback((chatId) => {
            setChats(
                (previousChats) =>
                    previousChats.filter(
                        (chat) =>
                            chat.id !==
                            chatId
                    )
            );

            setSelectedChat(
                (previousChat) => {
                    if (
                        previousChat?.id ===
                        chatId
                    ) {
                        return null;
                    }

                    return previousChat;
                }
            );

            setMessages([]);
        }, []);


    const handleChatRequestCreated =
        useCallback((data) => {
            setChatRequests(
                (previousRequests) => {
                    const exists =
                        previousRequests.some(
                            (request) =>
                                request.requestId ===
                                data.requestId
                        );

                    if (exists) {
                        return previousRequests;
                    }

                    return [
                        ...previousRequests,
                        data
                    ];
                }
            );
        }, []);


    // ==========================================
    // SIGNALR
    // ==========================================

    const {
        joinChat,
        leaveChat,
        sendMessage,
        deleteMessageForEveryone,
        deleteMessageForMe
    } = useSignalR({
        token,

        onReceiveMessage:
            handleReceiveMessage,

        onMessageDeletedForEveryone:
            handleMessageDeletedForEveryone,

        onMessageDeletedForMe:
            handleMessageDeletedForMe,

        onChatDeleted:
            handleChatDeleted,

        onChatRequestCreated:
            handleChatRequestCreated,

        onChatRequestAccepted:
            null
    });


    // ==========================================
    // LOAD CHATS
    // ==========================================

    useEffect(() => {
        if (!token) {
            setChats([]);
            setSelectedChat(null);
            setMessages([]);
            setChatRequests([]);

            return;
        }

        const loadChats =
            async () => {
                try {
                    const data =
                        await getChats(token);

                    setChats(data);
                } catch (error) {
                    console.error(
                        "Failed to load chats:",
                        error
                    );
                }
            };

        loadChats();
    }, [token]);


    // ==========================================
    // LOAD CHAT REQUESTS
    // ==========================================

    useEffect(() => {
        if (!token) {
            setChatRequests([]);

            return;
        }

        const loadChatRequests =
            async () => {
                try {
                    const data =
                        await getChatRequests(
                            token
                        );

                    setChatRequests(data);
                } catch (error) {
                    console.error(
                        "Failed to load chat requests:",
                        error
                    );
                }
            };

        loadChatRequests();
    }, [token]);


    // ==========================================
    // OPEN CHAT
    // ==========================================

    const openChat =
        useCallback(
            async (chat) => {
                if (!chat || !token) {
                    return;
                }

                try {
                    if (
                        selectedChat &&
                        selectedChat.id !==
                            chat.id
                    ) {
                        await leaveChat(
                            selectedChat.id
                        );
                    }

                    setSelectedChat(chat);
                    setMessages([]);

                    await joinChat(chat.id);

                    const data =
                        await getMessages(
                            token,
                            chat.id
                        );

                    setMessages(data);
                } catch (error) {
                    console.error(
                        "Failed to open chat:",
                        error
                    );
                }
            },
            [
                token,
                selectedChat,
                joinChat,
                leaveChat
            ]
        );


    // ==========================================
    // SELECT USER
    // ==========================================

    const handleSelectUser =
        useCallback(
            async (selectedUser) => {
                if (
                    !selectedUser ||
                    !token
                ) {
                    return;
                }

                try {
                    const result =
                        await createPrivateChat(
                            token,
                            selectedUser.id
                        );

                    let chat =
                        result.chat;

                    if (!chat) {
                        throw new Error(
                            "Чат не був створений."
                        );
                    }

                    // ==================================
                    // FIX:
                    // Одразу додаємо вибраного користувача
                    // до members, якщо його там немає.
                    // Завдяки цьому ім'я показується
                    // одразу, без перезавантаження.
                    // ==================================

                    const hasSelectedUser =
                        chat.members?.some(
                            (member) =>
                                member.id ===
                                selectedUser.id
                        );

                    if (!hasSelectedUser) {
                        chat = {
                            ...chat,

                            members: [
                                ...(chat.members || []),

                                {
                                    id:
                                        selectedUser.id,

                                    nickname:
                                        selectedUser.nickname
                                }
                            ]
                        };
                    }

                    setChats(
                        (previousChats) => {
                            const exists =
                                previousChats.some(
                                    (item) =>
                                        item.id ===
                                        chat.id
                                );

                            if (exists) {
                                return previousChats.map(
                                    (item) =>
                                        item.id ===
                                        chat.id
                                            ? chat
                                            : item
                                );
                            }

                            return [
                                ...previousChats,
                                chat
                            ];
                        }
                    );

                    await openChat(chat);
                } catch (error) {
                    console.error(
                        "Failed to open private chat:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося відкрити чат."
                    );
                }
            },
            [
                token,
                openChat
            ]
        );


    // ==========================================
    // GET CHAT NAME
    // ==========================================

    const getChatName =
        useCallback(
            (chat) => {
                if (!chat) {
                    return "";
                }

                if (chat.isGroup) {
                    return (
                        chat.name ||
                        "Група"
                    );
                }

                const otherMember =
                    chat.members?.find(
                        (member) =>
                            Number(member.id) !==
                            Number(user?.id)
                    );

                return (
                    otherMember?.nickname ||
                    chat.name ||
                    "Приватний чат"
                );
            },
            [user]
        );


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const handleSendMessage =
        useCallback(
            async (content) => {
                if (
                    !selectedChat ||
                    !content?.trim()
                ) {
                    return;
                }

                try {
                    await sendMessage(
                        selectedChat.id,
                        content.trim()
                    );
                } catch (error) {
                    console.error(
                        "Failed to send message:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося відправити повідомлення."
                    );
                }
            },
            [
                selectedChat,
                sendMessage
            ]
        );


    // ==========================================
    // DELETE MESSAGE FOR EVERYONE
    // ==========================================

    const handleDeleteForEveryone =
        useCallback(
            async (message) => {
                if (
                    !message ||
                    !selectedChat
                ) {
                    return;
                }

                try {
                    await deleteMessageForEveryone(
                        selectedChat.id,
                        message.id
                    );
                } catch (error) {
                    console.error(
                        "Failed to delete message for everyone:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося видалити повідомлення."
                    );
                }
            },
            [
                selectedChat,
                deleteMessageForEveryone
            ]
        );


    // ==========================================
    // DELETE MESSAGE FOR ME
    // ==========================================

    const handleDeleteForMe =
        useCallback(
            async (message) => {
                if (
                    !message ||
                    !selectedChat
                ) {
                    return;
                }

                try {
                    await deleteMessageForMe(
                        selectedChat.id,
                        message.id
                    );
                } catch (error) {
                    console.error(
                        "Failed to delete message for me:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося видалити повідомлення."
                    );
                }
            },
            [
                selectedChat,
                deleteMessageForMe
            ]
        );


    // ==========================================
    // DELETE CHAT
    // ==========================================

    const handleDeleteChat =
        useCallback(
            async () => {
                if (
                    !selectedChat ||
                    !token
                ) {
                    return;
                }

                if (selectedChat.isGroup) {
                    return;
                }

                const chatId =
                    selectedChat.id;

                try {
                    await leaveChat(chatId);

                    await deleteChat(
                        token,
                        chatId
                    );

                    setChats(
                        (previousChats) =>
                            previousChats.filter(
                                (chat) =>
                                    chat.id !==
                                    chatId
                            )
                    );

                    setSelectedChat(null);
                    setMessages([]);
                } catch (error) {
                    console.error(
                        "Failed to delete chat:",
                        error
                    );

                    throw error;
                }
            },
            [
                selectedChat,
                token,
                leaveChat
            ]
        );


    // ==========================================
    // ACCEPT CHAT REQUEST
    // ==========================================

    const handleAcceptChatRequest =
        useCallback(
            async (request) => {
                if (!token || !request) {
                    return;
                }

                try {
                    const result =
                        await acceptChatRequest(
                            token,
                            request.requestId
                        );

                    setChatRequests(
                        (previousRequests) =>
                            previousRequests.filter(
                                (item) =>
                                    item.requestId !==
                                    request.requestId
                            )
                    );

                    const acceptedChat =
                        result.chat;

                    if (!acceptedChat) {
                        throw new Error(
                            "Чат не був отриманий після прийняття запиту."
                        );
                    }

                    setChats(
                        (previousChats) => {
                            const exists =
                                previousChats.some(
                                    (chat) =>
                                        chat.id ===
                                        acceptedChat.id
                                );

                            if (exists) {
                                return previousChats.map(
                                    (chat) =>
                                        chat.id ===
                                        acceptedChat.id
                                            ? acceptedChat
                                            : chat
                                );
                            }

                            return [
                                ...previousChats,
                                acceptedChat
                            ];
                        }
                    );

                    await openChat(
                        acceptedChat
                    );
                } catch (error) {
                    console.error(
                        "Failed to accept chat request:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося прийняти запит."
                    );
                }
            },
            [
                token,
                openChat
            ]
        );


    // ==========================================
    // REJECT CHAT REQUEST
    // ==========================================

    const handleRejectChatRequest =
        useCallback(
            async (request) => {
                if (!token || !request) {
                    return;
                }

                try {
                    await rejectChatRequest(
                        token,
                        request.requestId
                    );

                    setChatRequests(
                        (previousRequests) =>
                            previousRequests.filter(
                                (item) =>
                                    item.requestId !==
                                    request.requestId
                            )
                    );
                } catch (error) {
                    console.error(
                        "Failed to reject chat request:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося видалити запит."
                    );
                }
            },
            [token]
        );


    return (
        <MessengerLayout
            sidebar={
                <ChatSidebar
                    chats={chats}
                    selectedChat={
                        selectedChat
                    }
                    getChatName={
                        getChatName
                    }
                    onSelectChat={
                        openChat
                    }
                    token={token}
                    currentUserId={
                        user?.id
                    }
                    onSelectUser={
                        handleSelectUser
                    }
                />
            }
        >

            {/* ======================================
                CHAT REQUESTS
            ====================================== */}

            {chatRequests.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        zIndex: 1000,
                        width: "360px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}
                >
                    {chatRequests.map(
                        (request) => (
                            <div
                                key={
                                    request.requestId
                                }
                                style={{
                                    background:
                                        "#ffffff",
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "12px",
                                    padding:
                                        "16px",
                                    boxShadow:
                                        "0 8px 30px rgba(0,0,0,0.15)"
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight:
                                            "600",
                                        marginBottom:
                                            "8px"
                                    }}
                                >
                                    Новий запит на чат
                                </div>

                                <div
                                    style={{
                                        color:
                                            "#555",
                                        marginBottom:
                                            "14px"
                                    }}
                                >
                                    <strong>
                                        {
                                            request
                                                .sender
                                                ?.nickname
                                        }
                                    </strong>{" "}
                                    хоче почати з вами чат.
                                </div>

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        gap:
                                            "8px"
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleAcceptChatRequest(
                                                request
                                            )
                                        }
                                        style={{
                                            flex:
                                                1,
                                            padding:
                                                "9px 12px",
                                            border:
                                                "none",
                                            borderRadius:
                                                "8px",
                                            cursor:
                                                "pointer",
                                            background:
                                                "#222",
                                            color:
                                                "#fff"
                                        }}
                                    >
                                        Залишити чат
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRejectChatRequest(
                                                request
                                            )
                                        }
                                        style={{
                                            flex:
                                                1,
                                            padding:
                                                "9px 12px",
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "8px",
                                            cursor:
                                                "pointer",
                                            background:
                                                "#fff",
                                            color:
                                                "#333"
                                        }}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* ======================================
                MAIN MESSENGER
            ====================================== */}

            {selectedChat ? (
                <>
                    <ChatHeader
                        name={getChatName(
                            selectedChat
                        )}
                        isGroup={
                            selectedChat.isGroup
                        }
                        onDeleteChat={
                            handleDeleteChat
                        }
                    />

                    <MessageList
                        messages={
                            messages
                        }
                        currentUserId={
                            user?.id
                        }
                        onDeleteForEveryone={
                            handleDeleteForEveryone
                        }
                        onDeleteForMe={
                            handleDeleteForMe
                        }
                    />

                    <MessageInput
                        onSend={
                            handleSendMessage
                        }
                    />
                </>
            ) : (
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        color: "#777",
                        background:
                            "#fafafa",
                        fontSize: "16px"
                    }}
                >
                    Виберіть чат
                </div>
            )}
        </MessengerLayout>
    );
}

export default MessengerPage;