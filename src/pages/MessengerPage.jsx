import {
    useCallback,
    useEffect,
    useRef,
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

    const [mobileChatOpen, setMobileChatOpen] =
        useState(false);

    /*
     * ID повідомлень, які вже відправлялися
     * на MarkMessageAsRead.
     */
    const markedAsReadRef =
        useRef(new Set());


    // ==========================================
    // SIGNALR CALLBACKS
    // ==========================================

    const handleReceiveMessage =
        useCallback(
            (message) => {
                if (!message) {
                    return;
                }

                const messageChatId =
                    Number(
                        message.chatId
                    );

                const currentChatId =
                    Number(
                        selectedChat?.id
                    );

                const messageSenderId =
                    Number(
                        message.sender?.id ??
                        message.senderId
                    );

                const currentUserId =
                    Number(
                        user?.id
                    );

                const isOwnMessage =
                    messageSenderId ===
                    currentUserId;

                const isCurrentChat =
                    messageChatId ===
                        currentChatId &&
                    Boolean(
                        selectedChat
                    );


                // ==================================
                // ADD MESSAGE TO CURRENT CHAT
                // ==================================

                if (isCurrentChat) {
                    setMessages(
                        (previousMessages) => {
                            const safeMessages =
                                Array.isArray(
                                    previousMessages
                                )
                                    ? previousMessages
                                    : [];

                            const exists =
                                safeMessages.some(
                                    (item) =>
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            message.id
                                        )
                                );

                            if (exists) {
                                return safeMessages;
                            }

                            return [
                                ...safeMessages,
                                {
                                    ...message,

                                    /*
                                     * Власне повідомлення
                                     * НЕ вважаємо прочитаним
                                     * автоматично.
                                     *
                                     * ✓✓ з'явиться тільки після
                                     * MessageRead від отримувача.
                                     */
                                    isRead:
                                        Boolean(
                                            message.isRead
                                        )
                                }
                            ];
                        }
                    );
                }


                // ==================================
                // UPDATE UNREAD COUNT
                // ==================================

                /*
                 * Не збільшуємо unreadCount:
                 *
                 * 1. для власного повідомлення;
                 * 2. якщо повідомлення прийшло
                 *    у вже відкритий чат.
                 */
                if (
                    isOwnMessage ||
                    isCurrentChat
                ) {
                    return;
                }

                setChats(
                    (previousChats) => {
                        const safeChats =
                            Array.isArray(
                                previousChats
                            )
                                ? previousChats
                                : [];

                        return safeChats.map(
                            (chat) => {
                                if (
                                    Number(
                                        chat.id
                                    ) !==
                                    messageChatId
                                ) {
                                    return chat;
                                }

                                return {
                                    ...chat,

                                    unreadCount:
                                        (
                                            Number(
                                                chat.unreadCount
                                            ) || 0
                                        ) + 1
                                };
                            }
                        );
                    }
                );
            },
            [
                selectedChat,
                user
            ]
        );


    /*
     * Спрацьовує на комп'ютері/телефоні
     * відправника, коли отримувач
     * прочитав його повідомлення.
     */
    const handleMessageRead =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                setMessages(
                    (previousMessages) => {
                        const safeMessages =
                            Array.isArray(
                                previousMessages
                            )
                                ? previousMessages
                                : [];

                        /*
                         * Не оновлюємо повідомлення
                         * з іншого чату.
                         */
                        if (
                            selectedChat &&
                            Number(
                                data.chatId
                            ) !==
                                Number(
                                    selectedChat.id
                                )
                        ) {
                            return safeMessages;
                        }

                        return safeMessages.map(
                            (message) => {
                                if (
                                    Number(
                                        message.id
                                    ) !==
                                    Number(
                                        data.messageId
                                    )
                                ) {
                                    return message;
                                }

                                return {
                                    ...message,
                                    isRead: true
                                };
                            }
                        );
                    }
                );
            },
            [selectedChat]
        );


    const handleMessageDeletedForEveryone =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                setMessages(
                    (previousMessages) => {
                        const safeMessages =
                            Array.isArray(
                                previousMessages
                            )
                                ? previousMessages
                                : [];

                        return safeMessages.filter(
                            (message) =>
                                Number(
                                    message.id
                                ) !==
                                Number(
                                    data.messageId
                                )
                        );
                    }
                );
            },
            []
        );


    const handleMessageDeletedForMe =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                setMessages(
                    (previousMessages) => {
                        const safeMessages =
                            Array.isArray(
                                previousMessages
                            )
                                ? previousMessages
                                : [];

                        return safeMessages.filter(
                            (message) =>
                                Number(
                                    message.id
                                ) !==
                                Number(
                                    data.messageId
                                )
                        );
                    }
                );
            },
            []
        );


    const handleChatDeleted =
        useCallback(
            (chatId) => {
                setChats(
                    (previousChats) => {
                        const safeChats =
                            Array.isArray(
                                previousChats
                            )
                                ? previousChats
                                : [];

                        return safeChats.filter(
                            (chat) =>
                                Number(
                                    chat.id
                                ) !==
                                Number(
                                    chatId
                                )
                        );
                    }
                );

                setSelectedChat(
                    (previousChat) => {
                        if (
                            Number(
                                previousChat?.id
                            ) ===
                            Number(
                                chatId
                            )
                        ) {
                            return null;
                        }

                        return previousChat;
                    }
                );

                setMessages([]);

                markedAsReadRef.current.clear();

                setMobileChatOpen(false);
            },
            []
        );


    const handleChatRequestCreated =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                setChatRequests(
                    (previousRequests) => {
                        const safeRequests =
                            Array.isArray(
                                previousRequests
                            )
                                ? previousRequests
                                : [];

                        const exists =
                            safeRequests.some(
                                (request) =>
                                    request.requestId ===
                                    data.requestId
                            );

                        if (exists) {
                            return safeRequests;
                        }

                        return [
                            ...safeRequests,
                            data
                        ];
                    }
                );
            },
            []
        );


    // ==========================================
    // SIGNALR
    // ==========================================

    const {
        joinChat,
        leaveChat,
        sendMessage,
        markMessageAsRead,
        deleteMessageForEveryone,
        deleteMessageForMe
    } = useSignalR({
        token,

        onReceiveMessage:
            handleReceiveMessage,

        onMessageRead:
            handleMessageRead,

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
    // MARK MESSAGES AS READ
    // ==========================================

    useEffect(() => {
        if (
            !selectedChat ||
            !user ||
            !Array.isArray(messages) ||
            messages.length === 0
        ) {
            return;
        }

        const chatId =
            Number(
                selectedChat.id
            );


        /*
         * Як тільки відкрили чат,
         * локально прибираємо unread badge.
         */
        setChats(
            (previousChats) => {
                const safeChats =
                    Array.isArray(
                        previousChats
                    )
                        ? previousChats
                        : [];

                return safeChats.map(
                    (chat) => {
                        if (
                            Number(
                                chat.id
                            ) !== chatId
                        ) {
                            return chat;
                        }

                        return {
                            ...chat,
                            unreadCount: 0
                        };
                    }
                );
            }
        );


        const markUnreadMessages =
            async () => {
                for (
                    const message
                    of messages
                ) {
                    /*
                     * Читаємо тільки чужі
                     * повідомлення.
                     */
                    if (
                        Number(
                            message.sender?.id ??
                            message.senderId
                        ) ===
                        Number(user.id)
                    ) {
                        continue;
                    }

                    /*
                     * Якщо повідомлення вже
                     * прочитане — нічого не робимо.
                     */
                    if (message.isRead) {
                        continue;
                    }

                    /*
                     * Якщо вже відправляли
                     * MarkMessageAsRead —
                     * повторно не викликаємо.
                     */
                    if (
                        markedAsReadRef.current.has(
                            message.id
                        )
                    ) {
                        continue;
                    }

                    markedAsReadRef.current.add(
                        message.id
                    );

                    try {
                        await markMessageAsRead(
                            chatId,
                            message.id
                        );
                    } catch (error) {
                        markedAsReadRef.current.delete(
                            message.id
                        );

                        console.error(
                            "Failed to mark message as read:",
                            error
                        );
                    }
                }
            };

        markUnreadMessages();
    }, [
        selectedChat,
        messages,
        user,
        markMessageAsRead
    ]);


    // ==========================================
    // LOAD CHATS
    // ==========================================

    useEffect(() => {
        if (!token) {
            setChats([]);
            setSelectedChat(null);
            setMessages([]);
            setChatRequests([]);
            setMobileChatOpen(false);

            markedAsReadRef.current.clear();

            return;
        }

        const loadChats =
            async () => {
                try {
                    const data =
                        await getChats(token);

                    setChats(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Failed to load chats:",
                        error
                    );

                    setChats([]);
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

                    setChatRequests(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Failed to load chat requests:",
                        error
                    );

                    setChatRequests([]);
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
                        Number(
                            selectedChat.id
                        ) !==
                            Number(
                                chat.id
                            )
                    ) {
                        await leaveChat(
                            selectedChat.id
                        );
                    }


                    /*
                     * Новий чат — новий набір
                     * повідомлень, які треба
                     * позначати прочитаними.
                     */
                    markedAsReadRef.current.clear();


                    // ==================================
                    // CLEAR UNREAD BADGE IMMEDIATELY
                    // ==================================

                    const normalizedChat = {
                        ...chat,
                        unreadCount: 0
                    };

                    setChats(
                        (previousChats) => {
                            const safeChats =
                                Array.isArray(
                                    previousChats
                                )
                                    ? previousChats
                                    : [];

                            const exists =
                                safeChats.some(
                                    (item) =>
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            chat.id
                                        )
                                );

                            if (!exists) {
                                return [
                                    ...safeChats,
                                    normalizedChat
                                ];
                            }

                            return safeChats.map(
                                (item) =>
                                    Number(
                                        item.id
                                    ) ===
                                    Number(
                                        chat.id
                                    )
                                        ? {
                                            ...item,
                                            ...chat,
                                            unreadCount:
                                                0
                                        }
                                        : item
                            );
                        }
                    );


                    setSelectedChat(
                        normalizedChat
                    );

                    setMessages([]);

                    setMobileChatOpen(true);

                    await joinChat(chat.id);

                    const data =
                        await getMessages(
                            token,
                            chat.id
                        );

                    setMessages(
                        Array.isArray(data)
                            ? data.map(
                                (message) => ({
                                    ...message,

                                    isRead:
                                        Boolean(
                                            message.isRead
                                        )
                                })
                            )
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Failed to open chat:",
                        error
                    );

                    setMessages([]);
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
    // CLOSE MOBILE CHAT
    // ==========================================

    const closeMobileChat =
        useCallback(
            async () => {
                if (selectedChat) {
                    try {
                        await leaveChat(
                            selectedChat.id
                        );
                    } catch (error) {
                        console.error(
                            "Failed to leave chat:",
                            error
                        );
                    }
                }

                setSelectedChat(null);
                setMessages([]);
                setMobileChatOpen(false);

                markedAsReadRef.current.clear();
            },
            [
                selectedChat,
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
                        result?.chat;

                    if (!chat) {
                        throw new Error(
                            "Чат не був створений."
                        );
                    }


                    const existingMembers =
                        Array.isArray(
                            chat.members
                        )
                            ? chat.members
                            : [];

                    const members = [
                        ...existingMembers
                    ];


                    const hasSelectedUser =
                        members.some(
                            (member) =>
                                Number(
                                    member.id
                                ) ===
                                Number(
                                    selectedUser.id
                                )
                        );

                    if (
                        !hasSelectedUser
                    ) {
                        members.push({
                            id:
                                selectedUser.id,

                            nickname:
                                selectedUser.nickname
                        });
                    }


                    const hasCurrentUser =
                        members.some(
                            (member) =>
                                Number(
                                    member.id
                                ) ===
                                Number(
                                    user?.id
                                )
                        );

                    if (
                        !hasCurrentUser &&
                        user
                    ) {
                        members.push({
                            id:
                                user.id,

                            nickname:
                                user.nickname
                        });
                    }


                    chat = {
                        ...chat,

                        members,

                        unreadCount:
                            0
                    };


                    setChats(
                        (previousChats) => {
                            const safeChats =
                                Array.isArray(
                                    previousChats
                                )
                                    ? previousChats
                                    : [];

                            const exists =
                                safeChats.some(
                                    (item) =>
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            chat.id
                                        )
                                );

                            if (exists) {
                                return safeChats.map(
                                    (item) =>
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            chat.id
                                        )
                                            ? {
                                                ...item,
                                                ...chat,
                                                members,
                                                unreadCount:
                                                    0
                                            }
                                            : item
                                );
                            }

                            return [
                                ...safeChats,
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
                user,
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

                const members =
                    Array.isArray(
                        chat.members
                    )
                        ? chat.members
                        : [];

                const otherMember =
                    members.find(
                        (member) =>
                            Number(
                                member.id
                            ) !==
                            Number(
                                user?.id
                            )
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
                        (previousChats) => {
                            const safeChats =
                                Array.isArray(
                                    previousChats
                                )
                                    ? previousChats
                                    : [];

                            return safeChats.filter(
                                (chat) =>
                                    Number(
                                        chat.id
                                    ) !==
                                    Number(
                                        chatId
                                    )
                            );
                        }
                    );

                    setSelectedChat(null);
                    setMessages([]);
                    setMobileChatOpen(false);

                    markedAsReadRef.current.clear();
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
                        (previousRequests) => {
                            const safeRequests =
                                Array.isArray(
                                    previousRequests
                                )
                                    ? previousRequests
                                    : [];

                            return safeRequests.filter(
                                (item) =>
                                    item.requestId !==
                                    request.requestId
                            );
                        }
                    );

                    let acceptedChat =
                        result?.chat;

                    if (!acceptedChat) {
                        throw new Error(
                            "Чат не був отриманий після прийняття запиту."
                        );
                    }


                    const acceptedMembers =
                        Array.isArray(
                            acceptedChat.members
                        )
                            ? [
                                ...acceptedChat.members
                            ]
                            : [];


                    const hasCurrentUser =
                        acceptedMembers.some(
                            (member) =>
                                Number(
                                    member.id
                                ) ===
                                Number(
                                    user?.id
                                )
                        );

                    if (
                        !hasCurrentUser &&
                        user
                    ) {
                        acceptedMembers.push({
                            id:
                                user.id,

                            nickname:
                                user.nickname
                        });
                    }


                    const requestSender =
                        request.sender;

                    const hasSender =
                        acceptedMembers.some(
                            (member) =>
                                Number(
                                    member.id
                                ) ===
                                Number(
                                    requestSender?.id
                                )
                        );

                    if (
                        !hasSender &&
                        requestSender
                    ) {
                        acceptedMembers.push({
                            id:
                                requestSender.id,

                            nickname:
                                requestSender.nickname
                        });
                    }


                    acceptedChat = {
                        ...acceptedChat,

                        members:
                            acceptedMembers,

                        unreadCount:
                            0
                    };


                    setChats(
                        (previousChats) => {
                            const safeChats =
                                Array.isArray(
                                    previousChats
                                )
                                    ? previousChats
                                    : [];

                            const exists =
                                safeChats.some(
                                    (chat) =>
                                        Number(
                                            chat.id
                                        ) ===
                                        Number(
                                            acceptedChat.id
                                        )
                                );

                            if (exists) {
                                return safeChats.map(
                                    (chat) =>
                                        Number(
                                            chat.id
                                        ) ===
                                        Number(
                                            acceptedChat.id
                                        )
                                            ? {
                                                ...chat,
                                                ...acceptedChat,
                                                unreadCount:
                                                    0
                                            }
                                            : chat
                                );
                            }

                            return [
                                ...safeChats,
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
                user,
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
                        (previousRequests) => {
                            const safeRequests =
                                Array.isArray(
                                    previousRequests
                                )
                                    ? previousRequests
                                    : [];

                            return safeRequests.filter(
                                (item) =>
                                    item.requestId !==
                                    request.requestId
                            );
                        }
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


    // ==========================================
    // SAFE VALUES FOR RENDER
    // ==========================================

    const safeChats =
        Array.isArray(chats)
            ? chats
            : [];

    const safeMessages =
        Array.isArray(messages)
            ? messages
            : [];

    const safeChatRequests =
        Array.isArray(chatRequests)
            ? chatRequests
            : [];


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <MessengerLayout
            mobileChatOpen={
                mobileChatOpen
            }
            sidebar={
                <ChatSidebar
                    chats={safeChats}
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

            {safeChatRequests.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        zIndex: 1000,
                        width: "360px",
                        maxWidth:
                            "calc(100vw - 40px)",
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: "12px"
                    }}
                >
                    {safeChatRequests.map(
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
                        onBack={
                            closeMobileChat
                        }
                    />

                    <MessageList
                        messages={
                            safeMessages
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
```

### 2. `ChatsController.cs`

Тут змінений саме `GetMessages()`, щоб backend повертав **реальний `isRead`**.

```csharp
using Freegram.Data;
using Freegram.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Freegram.Hubs;
using System.Security.Claims;

namespace Freegram.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatsController : ControllerBase
{
    private readonly FreegramDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatsController(
        FreegramDbContext context,
        IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }


    // ==========================================
    // GET CURRENT USER ID
    // ==========================================

    private int GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
        {
            throw new UnauthorizedAccessException(
                "User is not authenticated."
            );
        }

        return int.Parse(userId);
    }


    // ==========================================
    // GET CHATS
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> GetChats()
    {
        var currentUserId =
            GetCurrentUserId();

        var chats =
            await _context.Chats
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .Where(c =>
                    c.Members.Any(m =>
                        m.UserId ==
                        currentUserId))
                .OrderByDescending(c =>
                    c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.IsGroup,
                    c.CreatedAt,

                    Members =
                        c.Members
                            .Where(m =>
                                m.User != null)
                            .Select(m => new
                            {
                                m.User.Id,
                                m.User.Nickname
                            })
                            .ToList(),

                    UnreadCount =
                        c.Messages
                            .Count(message =>
                                message.SenderId !=
                                    currentUserId &&

                                !message.DeletedByUsers
                                    .Any(deleted =>
                                        deleted.UserId ==
                                        currentUserId) &&

                                !message.ReadByUsers
                                    .Any(read =>
                                        read.UserId ==
                                        currentUserId))
                })
                .ToListAsync();

        return Ok(chats);
    }


    // ==========================================
    // GET MESSAGES
    // ==========================================

    [HttpGet("{chatId}/messages")]
    public async Task<IActionResult> GetMessages(
        int chatId)
    {
        var currentUserId =
            GetCurrentUserId();

        var isMember =
            await _context.ChatMembers
                .AnyAsync(m =>
                    m.ChatId == chatId &&
                    m.UserId ==
                    currentUserId);

        if (!isMember)
        {
            return Forbid();
        }

        var messages =
            await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.ReadByUsers)
                .Where(m =>
                    m.ChatId == chatId &&
                    !m.DeletedByUsers.Any(d =>
                        d.UserId ==
                        currentUserId))
                .OrderBy(m =>
                    m.CreatedAt)
                .Select(m => new
                {
                    m.Id,
                    m.ChatId,
                    m.Content,
                    m.CreatedAt,

                    Sender = new
                    {
                        m.Sender.Id,
                        m.Sender.Nickname
                    },

                    /*
                     * Якщо повідомлення моє:
                     * воно прочитане, коли його
                     * прочитав інший учасник.
                     *
                     * Якщо повідомлення чуже:
                     * воно прочитане, коли я
                     * його прочитав.
                     */
                    IsRead =
                        m.SenderId == currentUserId
                            ? m.ReadByUsers.Any(r =>
                                r.UserId !=
                                currentUserId)
                            : m.ReadByUsers.Any(r =>
                                r.UserId ==
                                currentUserId)
                })
                .ToListAsync();

        return Ok(messages);
    }


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    [HttpPost("{chatId}/messages")]
    public async Task<IActionResult> SendMessage(
        int chatId,
        [FromBody] string content)
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(content))
        {
            return BadRequest(new
            {
                message =
                    "Message content is required."
            });
        }

        var isMember =
            await _context.ChatMembers
                .AnyAsync(m =>
                    m.ChatId == chatId &&
                    m.UserId ==
                    currentUserId);

        if (!isMember)
        {
            return Forbid();
        }

        var message =
            new Message
            {
                ChatId =
                    chatId,

                SenderId =
                    currentUserId,

                Content =
                    content.Trim(),

                CreatedAt =
                    DateTime.UtcNow
            };

        _context.Messages.Add(
            message);

        await _context.SaveChangesAsync();

        var sender =
            await _context.Users
                .Where(u =>
                    u.Id ==
                    currentUserId)
                .Select(u => new
                {
                    u.Id,
                    u.Nickname
                })
                .FirstAsync();

        return Ok(new
        {
            message.Id,
            message.ChatId,
            message.Content,
            message.CreatedAt,
            Sender = sender
        });
    }


    // ==========================================
    // CREATE PRIVATE CHAT / CHAT REQUEST
    // ==========================================

    [HttpPost("private/{userId}")]
    public async Task<IActionResult> CreatePrivateChat(
        int userId)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId == userId)
        {
            return BadRequest(new
            {
                message =
                    "You cannot create a chat with yourself."
            });
        }

        var targetUser =
            await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == userId);

        if (targetUser == null)
        {
            return NotFound(new
            {
                message =
                    "User not found."
            });
        }


        // ==========================================
        // CHECK EXISTING ACTIVE CHAT
        // ==========================================

        var existingChat =
            await _context.Chats
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .Where(c =>
                    !c.IsGroup &&
                    c.Members.Any(m =>
                        m.UserId ==
                        currentUserId) &&
                    c.Members.Any(m =>
                        m.UserId ==
                        userId))
                .FirstOrDefaultAsync();

        if (existingChat != null)
        {
            return Ok(new
            {
                chat = new
                {
                    existingChat.Id,
                    existingChat.Name,
                    existingChat.IsGroup,
                    existingChat.CreatedAt,

                    Members =
                        existingChat.Members
                            .Where(m =>
                                m.User != null)
                            .Select(m => new
                            {
                                m.User.Id,
                                m.User.Nickname
                            })
                            .ToList()
                },

                pendingRequest = false
            });
        }


        // ==========================================
        // CHECK EXISTING REQUEST
        // ==========================================

        var existingRequest =
            await _context.ChatRequests
                .Include(r => r.Chat)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(r =>
                    r.SenderId ==
                    currentUserId &&
                    r.ReceiverId ==
                    userId);

        if (existingRequest != null)
        {
            var pendingChat =
                existingRequest.Chat;

            return Ok(new
            {
                chat = new
                {
                    pendingChat.Id,
                    pendingChat.Name,
                    pendingChat.IsGroup,
                    pendingChat.CreatedAt,

                    Members =
                        pendingChat.Members
                            .Where(m =>
                                m.User != null)
                            .Select(m => new
                            {
                                m.User.Id,
                                m.User.Nickname
                            })
                            .ToList()
                },

                pendingRequest = true
            });
        }


        // ==========================================
        // CREATE CHAT
        // ==========================================

        var chat =
            new Chat
            {
                Name = null,
                IsGroup = false,
                CreatedAt =
                    DateTime.UtcNow
            };

        _context.Chats.Add(chat);

        await _context.SaveChangesAsync();


        // ==========================================
        // ADD SENDER AS MEMBER
        // ==========================================

        var senderMember =
            new ChatMember
            {
                ChatId =
                    chat.Id,

                UserId =
                    currentUserId,

                JoinedAt =
                    DateTime.UtcNow
            };

        _context.ChatMembers.Add(
            senderMember);


        // ==========================================
        // CREATE REQUEST
        // ==========================================

        var request =
            new ChatRequest
            {
                ChatId =
                    chat.Id,

                SenderId =
                    currentUserId,

                ReceiverId =
                    userId,

                CreatedAt =
                    DateTime.UtcNow
            };

        _context.ChatRequests.Add(
            request);

        await _context.SaveChangesAsync();


        // ==========================================
        // LOAD CHAT WITH MEMBERS
        // ==========================================

        var createdChat =
            await _context.Chats
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .FirstAsync(c =>
                    c.Id ==
                    chat.Id);


        // ==========================================
        // SEND REALTIME REQUEST
        // ==========================================

        await _hubContext.Clients
            .User(
                userId.ToString()
            )
            .SendAsync(
                "ChatRequestCreated",
                new
                {
                    RequestId =
                        request.Id,

                    ChatId =
                        chat.Id,

                    Sender = new
                    {
                        Id =
                            currentUserId,

                        Nickname =
                            User.FindFirstValue(
                                ClaimTypes.Name)
                    }
                }
            );


        // ==========================================
        // RETURN CHAT
        // ==========================================

        return Ok(new
        {
            chat = new
            {
                createdChat.Id,
                createdChat.Name,
                createdChat.IsGroup,
                createdChat.CreatedAt,

                Members =
                    createdChat.Members
                        .Where(m =>
                            m.User != null)
                        .Select(m => new
                        {
                            m.User.Id,
                            m.User.Nickname
                        })
                        .ToList()
            },

            pendingRequest = true
        });
    }


    // ==========================================
    // GET CHAT REQUESTS
    // ==========================================

    [HttpGet("requests")]
    public async Task<IActionResult> GetChatRequests()
    {
        var currentUserId =
            GetCurrentUserId();

        var requests =
            await _context.ChatRequests
                .Include(r => r.Sender)
                .Include(r => r.Chat)
                .Where(r =>
                    r.ReceiverId ==
                    currentUserId)
                .OrderByDescending(r =>
                    r.CreatedAt)
                .Select(r => new
                {
                    RequestId =
                        r.Id,

                    ChatId =
                        r.ChatId,

                    CreatedAt =
                        r.CreatedAt,

                    Sender = new
                    {
                        r.Sender.Id,
                        r.Sender.Nickname
                    }
                })
                .ToListAsync();

        return Ok(requests);
    }


    // ==========================================
    // ACCEPT CHAT REQUEST
    // ==========================================

    [HttpPost("requests/{requestId}/accept")]
    public async Task<IActionResult> AcceptChatRequest(
        int requestId)
    {
        var currentUserId =
            GetCurrentUserId();

        var request =
            await _context.ChatRequests
                .Include(r => r.Chat)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.User)
                .Include(r => r.Sender)
                .Include(r => r.Receiver)
                .FirstOrDefaultAsync(r =>
                    r.Id == requestId);

        if (request == null)
        {
            return NotFound(new
            {
                message =
                    "Chat request not found."
            });
        }

        if (request.ReceiverId !=
            currentUserId)
        {
            return Forbid();
        }


        var alreadyMember =
            await _context.ChatMembers
                .AnyAsync(m =>
                    m.ChatId ==
                    request.ChatId &&
                    m.UserId ==
                    currentUserId);

        if (!alreadyMember)
        {
            var newMember =
                new ChatMember
                {
                    ChatId =
                        request.ChatId,

                    UserId =
                        currentUserId,

                    JoinedAt =
                        DateTime.UtcNow
                };

            _context.ChatMembers.Add(
                newMember);

            await _context.SaveChangesAsync();
        }


        _context.ChatRequests.Remove(
            request);

        await _context.SaveChangesAsync();


        var chat =
            await _context.Chats
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(c =>
                    c.Id ==
                    request.ChatId);

        if (chat == null)
        {
            return NotFound(new
            {
                message =
                    "Chat not found."
            });
        }


        await _hubContext.Clients
            .User(
                request.SenderId
                    .ToString()
            )
            .SendAsync(
                "ChatRequestAccepted",
                new
                {
                    ChatId =
                        chat.Id,

                    UserId =
                        currentUserId
                }
            );


        return Ok(new
        {
            message =
                "Chat request accepted.",

            chat = new
            {
                chat.Id,
                chat.Name,
                chat.IsGroup,
                chat.CreatedAt,

                Members =
                    chat.Members
                        .Where(m =>
                            m.User != null)
                        .Select(m => new
                        {
                            m.User.Id,
                            m.User.Nickname
                        })
                        .ToList()
            }
        });
    }


    // ==========================================
    // REJECT CHAT REQUEST
    // ==========================================

    [HttpDelete("requests/{requestId}")]
    public async Task<IActionResult> RejectChatRequest(
        int requestId)
    {
        var currentUserId =
            GetCurrentUserId();

        var request =
            await _context.ChatRequests
                .FirstOrDefaultAsync(r =>
                    r.Id == requestId);

        if (request == null)
        {
            return NotFound(new
            {
                message =
                    "Chat request not found."
            });
        }

        if (request.ReceiverId !=
            currentUserId)
        {
            return Forbid();
        }

        var chatId =
            request.ChatId;

        var senderId =
            request.SenderId;

        _context.ChatRequests.Remove(
            request);

        await _context.SaveChangesAsync();


        var chat =
            await _context.Chats
                .FirstOrDefaultAsync(c =>
                    c.Id == chatId);

        if (chat != null)
        {
            _context.Chats.Remove(chat);

            await _context.SaveChangesAsync();
        }


        await _hubContext.Clients
            .User(
                senderId.ToString()
            )
            .SendAsync(
                "ChatDeleted",
                chatId
            );

        return Ok(new
        {
            message =
                "Chat request rejected."
        });
    }


    // ==========================================
    // DELETE CHAT
    // ==========================================

    [HttpDelete("{chatId}")]
    public async Task<IActionResult> DeleteChat(
        int chatId)
    {
        var currentUserId =
            GetCurrentUserId();

        var chat =
            await _context.Chats
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c =>
                    c.Id == chatId);

        if (chat == null)
        {
            return NotFound(new
            {
                message =
                    "Chat not found."
            });
        }

        var isMember =
            chat.Members.Any(m =>
                m.UserId ==
                currentUserId);

        if (!isMember)
        {
            return Forbid();
        }


        var otherMember =
            chat.Members
                .FirstOrDefault(m =>
                    m.UserId !=
                    currentUserId);

        var otherUserId =
            otherMember?.UserId;


        var pendingRequest =
            await _context.ChatRequests
                .FirstOrDefaultAsync(r =>
                    r.ChatId ==
                    chatId);


        _context.Chats.Remove(chat);

        await _context.SaveChangesAsync();


        if (otherUserId.HasValue)
        {
            await _hubContext.Clients
                .User(
                    otherUserId.Value
                        .ToString()
                )
                .SendAsync(
                    "ChatDeleted",
                    chatId
                );
        }
        else if (pendingRequest != null)
        {
            await _hubContext.Clients
                .User(
                    pendingRequest.ReceiverId
                        .ToString()
                )
                .SendAsync(
                    "ChatDeleted",
                    chatId
                );
        }

        return Ok(new
        {
            message =
                "Chat deleted."
        });
    }
}
```

### 3. `ChatHub.cs`

Тут логіка вже була правильною, але ось повний актуальний файл:

```csharp
using Freegram.Data;
using Freegram.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Freegram.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly FreegramDbContext _context;

    public ChatHub(FreegramDbContext context)
    {
        _context = context;
    }


    public override async Task OnConnectedAsync()
    {
        var userId =
            Context.User?.FindFirstValue(
                ClaimTypes.NameIdentifier);

        var nickname =
            Context.User?.FindFirstValue(
                ClaimTypes.Name);

        Console.WriteLine(
            $"User connected: {nickname} (ID: {userId})"
        );

        await base.OnConnectedAsync();
    }


    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        var userId =
            Context.User?.FindFirstValue(
                ClaimTypes.NameIdentifier);

        var nickname =
            Context.User?.FindFirstValue(
                ClaimTypes.Name);

        Console.WriteLine(
            $"User disconnected: {nickname} (ID: {userId})"
        );

        await base.OnDisconnectedAsync(
            exception);
    }


    // ==========================================
    // JOIN CHAT
    // ==========================================

    public async Task JoinChat(int chatId)
    {
        var userId =
            GetCurrentUserId();

        var chatExists =
            await _context.Chats
                .AnyAsync(c =>
                    c.Id == chatId);

        if (!chatExists)
        {
            throw new HubException(
                "Chat not found."
            );
        }

        var isMember =
            await _context.ChatMembers
                .AnyAsync(m =>
                    m.ChatId == chatId &&
                    m.UserId == userId);

        if (!isMember)
        {
            throw new HubException(
                "You are not a member of this chat."
            );
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetGroupName(chatId)
        );

        await Clients.Caller.SendAsync(
            "JoinedChat",
            chatId
        );
    }


    // ==========================================
    // LEAVE CHAT
    // ==========================================

    public async Task LeaveChat(int chatId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetGroupName(chatId)
        );

        await Clients.Caller.SendAsync(
            "LeftChat",
            chatId
        );
    }


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    public async Task SendMessage(
        int chatId,
        string content)
    {
        var userId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new HubException(
                "Message content is required."
            );
        }

        content =
            content.Trim();

        var chat =
            await _context.Chats
                .Include(c =>
                    c.Members)
                .FirstOrDefaultAsync(c =>
                    c.Id == chatId);

        if (chat == null)
        {
            throw new HubException(
                "Chat not found."
            );
        }

        var isMember =
            chat.Members.Any(m =>
                m.UserId == userId);

        if (!isMember)
        {
            throw new HubException(
                "You are not a member of this chat."
            );
        }

        var message =
            new Message
            {
                ChatId =
                    chatId,

                SenderId =
                    userId,

                Content =
                    content,

                CreatedAt =
                    DateTime.UtcNow
            };

        _context.Messages.Add(
            message);

        await _context.SaveChangesAsync();

        var sender =
            await _context.Users
                .Where(u =>
                    u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.Nickname
                })
                .FirstAsync();

        await Clients.Group(
                GetGroupName(chatId))
            .SendAsync(
                "ReceiveMessage",
                new
                {
                    message.Id,
                    message.ChatId,
                    message.Content,
                    message.CreatedAt,

                    Sender = sender,

                    /*
                     * Нове повідомлення ніколи
                     * не є прочитаним одразу.
                     */
                    IsRead = false
                }
            );
    }


    // ==========================================
    // MARK MESSAGE AS READ
    // ==========================================

    public async Task MarkMessageAsRead(
        int chatId,
        int messageId)
    {
        var userId =
            GetCurrentUserId();

        var isMember =
            await _context.ChatMembers
                .AnyAsync(m =>
                    m.ChatId == chatId &&
                    m.UserId == userId);

        if (!isMember)
        {
            throw new HubException(
                "You are not a member of this chat."
            );
        }

        var message =
            await _context.Messages
                .FirstOrDefaultAsync(m =>
                    m.Id == messageId &&
                    m.ChatId == chatId);

        if (message == null)
        {
            throw new HubException(
                "Message not found."
            );
        }


        /*
         * Відправник не може позначити
         * власне повідомлення прочитаним
         * сам для себе.
         */
        if (message.SenderId == userId)
        {
            return;
        }


        /*
         * Перевіряємо, чи це повідомлення
         * вже було прочитане цим користувачем.
         */
        var alreadyRead =
            await _context.MessageReads
                .AnyAsync(r =>
                    r.MessageId == messageId &&
                    r.UserId == userId);

        if (alreadyRead)
        {
            return;
        }


        var messageRead =
            new MessageRead
            {
                MessageId =
                    messageId,

                UserId =
                    userId,

                ReadAt =
                    DateTime.UtcNow
            };

        _context.MessageReads.Add(
            messageRead
        );

        await _context.SaveChangesAsync();


        /*
         * Повідомляємо саме відправника,
         * що отримувач прочитав повідомлення.
         */
        await Clients.User(
                message.SenderId.ToString())
            .SendAsync(
                "MessageRead",
                new
                {
                    MessageId =
                        messageId,

                    ChatId =
                        chatId,

                    UserId =
                        userId,

                    ReadAt =
                        messageRead.ReadAt
                }
            );
    }


    // ==========================================
    // DELETE MESSAGE FOR EVERYONE
    // ==========================================

    public async Task DeleteMessageForEveryone(
        int chatId,
        int messageId)
    {
        var userId =
            GetCurrentUserId();

        var message =
            await _context.Messages
                .FirstOrDefaultAsync(m =>
                    m.Id == messageId &&
                    m.ChatId == chatId);

        if (message == null)
        {
            throw new HubException(
                "Message not found."
            );
        }

        var isMember =
            await _context.ChatMembers
                .AnyAsync(m =>
                    m.ChatId == chatId &&
                    m.UserId == userId);

        if (!isMember)
        {
            throw new HubException(
                "You are not a member of this chat."
            );
        }

        if (message.SenderId != userId)
        {
            throw new HubException(
                "You can delete for everyone only your own messages."
            );
        }

        _context.Messages.Remove(
            message);

        await _context.SaveChangesAsync();

        await Clients.Group(
                GetGroupName(chatId))
            .SendAsync(
                "MessageDeletedForEveryone",
                new
                {
                    ChatId =
                        chatId,

                    MessageId =
                        messageId
                }
            );
    }


    // ==========================================
    // DELETE MESSAGE FOR ME
    // ==========================================

    public async Task DeleteMessageForMe(
        int chatId,
        int messageId)
    {
        var userId =
            GetCurrentUserId();

        var message =
            await _context.Messages
                .FirstOrDefaultAsync(m =>
                    m.Id == messageId &&
                    m.ChatId == chatId);

        if (message == null)
        {
            throw new HubException(
                "Message not found."
            );
        }

        var isMember =
            await _context.ChatMembers
                .AnyAsync(m =>
                    m.ChatId == chatId &&
                    m.UserId == userId);

        if (!isMember)
        {
            throw new HubException(
                "You are not a member of this chat."
            );
        }

        if (message.SenderId == userId)
        {
            throw new HubException(
                "Your own messages must be deleted for everyone."
            );
        }

        var alreadyDeleted =
            await _context.DeletedMessages
                .AnyAsync(d =>
                    d.MessageId == messageId &&
                    d.UserId == userId);

        if (!alreadyDeleted)
        {
            var deletedMessage =
                new DeletedMessage
                {
                    MessageId =
                        messageId,

                    UserId =
                        userId,

                    DeletedAt =
                        DateTime.UtcNow
                };

            _context.DeletedMessages.Add(
                deletedMessage);

            await _context.SaveChangesAsync();
        }

        await Clients.Caller.SendAsync(
            "MessageDeletedForMe",
            new
            {
                ChatId =
                    chatId,

                MessageId =
                    messageId
            }
        );
    }


    // ==========================================
    // GET CURRENT USER ID
    // ==========================================

    private int GetCurrentUserId()
    {
        var userId =
            Context.User?.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
        {
            throw new HubException(
                "User is not authenticated."
            );
        }

        return int.Parse(userId);
    }


    // ==========================================
    // GROUP NAME
    // ==========================================

    private static string GetGroupName(
        int chatId)
    {
        return $"chat-{chatId}";
    }
}
