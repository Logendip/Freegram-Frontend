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
    rejectChatRequest,
    getGroupInvitations,
    acceptGroupInvitation,
    ignoreGroupInvitation,
    addGroupMember,
    removeGroupMember
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


    const [chats, setChats] =
        useState([]);

    const [selectedChat, setSelectedChat] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [chatRequests, setChatRequests] =
        useState([]);

    const [groupInvitations, setGroupInvitations] =
        useState([]);

    const [mobileChatOpen, setMobileChatOpen] =
        useState(false);


    const markedAsReadRef =
        useRef(new Set());


    // ==========================================
    // SIGNALR - RECEIVE MESSAGE
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
                                    isRead:
                                        Boolean(
                                            message.isRead
                                        )
                                }
                            ];
                        }
                    );
                }


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


    // ==========================================
    // MESSAGE READ
    // ==========================================

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


    // ==========================================
    // MESSAGE DELETED FOR EVERYONE
    // ==========================================

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


    // ==========================================
    // MESSAGE DELETED FOR ME
    // ==========================================

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


    // ==========================================
    // CHAT / GROUP DELETED
    // ==========================================

    const handleChatDeleted =
        useCallback(
            (data) => {
                const deletedChatId =
                    Number(
                        data?.chatId ??
                        data?.ChatId ??
                        data
                    );

                if (!deletedChatId) {
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

                        return safeChats.filter(
                            (chat) =>
                                Number(
                                    chat.id
                                ) !==
                                deletedChatId
                        );
                    }
                );


                setSelectedChat(
                    (previousChat) => {
                        if (
                            Number(
                                previousChat?.id
                            ) !==
                            deletedChatId
                        ) {
                            return previousChat;
                        }

                        return null;
                    }
                );


                setSelectedChat(
                    (previousChat) => {
                        if (
                            Number(
                                previousChat?.id
                            ) ===
                            deletedChatId
                        ) {
                            setMessages([]);
                            setMobileChatOpen(false);
                            markedAsReadRef.current.clear();

                            return null;
                        }

                        return previousChat;
                    }
                );
            },
            []
        );


    // ==========================================
    // PRIVATE CHAT REQUEST CREATED
    // ==========================================

    const handleChatRequestCreated =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                const normalizedRequest = {
                    ...data,

                    requestId:
                        Number(
                            data.requestId ??
                            data.RequestId ??
                            data.id ??
                            data.Id
                        ),

                    chatId:
                        Number(
                            data.chatId ??
                            data.ChatId
                        ),

                    sender:
                        data.sender ??
                        data.Sender
                };

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
                                    Number(
                                        request.requestId
                                    ) ===
                                    Number(
                                        normalizedRequest.requestId
                                    )
                            );

                        if (exists) {
                            return safeRequests;
                        }

                        return [
                            ...safeRequests,
                            normalizedRequest
                        ];
                    }
                );
            },
            []
        );


    // ==========================================
    // GROUP INVITATION RECEIVED
    // ==========================================

    const handleGroupInvitationReceived =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                const normalizedInvitation = {
                    ...data,

                    invitationId:
                        Number(
                            data.invitationId ??
                            data.InvitationId ??
                            data.id ??
                            data.Id
                        ),

                    chatId:
                        Number(
                            data.chatId ??
                            data.ChatId
                        ),

                    chatName:
                        data.chatName ??
                        data.ChatName ??
                        "Група",

                    createdAt:
                        data.createdAt ??
                        data.CreatedAt,

                    sender:
                        data.sender ??
                        data.Sender
                };

                if (
                    !normalizedInvitation.invitationId
                ) {
                    return;
                }

                setGroupInvitations(
                    (previousInvitations) => {
                        const safeInvitations =
                            Array.isArray(
                                previousInvitations
                            )
                                ? previousInvitations
                                : [];

                        const exists =
                            safeInvitations.some(
                                (invitation) =>
                                    Number(
                                        invitation.invitationId
                                    ) ===
                                    Number(
                                        normalizedInvitation.invitationId
                                    )
                            );

                        if (exists) {
                            return safeInvitations;
                        }

                        return [
                            ...safeInvitations,
                            normalizedInvitation
                        ];
                    }
                );
            },
            []
        );


    // ==========================================
    // GROUP INVITATION ACCEPTED
    // ==========================================

    const handleGroupInvitationAccepted =
        useCallback(
            () => {
                // Existing group creator
                // receives GroupMemberAdded
                // when a member joins.
            },
            []
        );


    // ==========================================
    // GROUP MEMBER ADDED
    // ==========================================

    const handleGroupMemberAdded =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                const chatData =
                    data.chat ??
                    data.Chat;

                const chatId =
                    Number(
                        data.chatId ??
                        data.ChatId ??
                        chatData?.id ??
                        chatData?.Id
                    );

                const addedUser =
                    data.user ??
                    data.User;

                const addedUserId =
                    Number(
                        addedUser?.id ??
                        addedUser?.Id ??
                        addedUser?.userId ??
                        addedUser?.UserId
                    );

                const currentUserId =
                    Number(
                        user?.id
                    );

                if (
                    !chatId ||
                    !addedUserId
                ) {
                    return;
                }


                // ==================================
                // CURRENT USER WAS ADDED
                // ==================================

                if (
                    addedUserId ===
                    currentUserId &&
                    chatData
                ) {
                    const normalizedMembers =
                        Array.isArray(
                            chatData.members ??
                            chatData.Members
                        )
                            ? [
                                ...(chatData.members ??
                                    chatData.Members)
                            ]
                            : [];

                    const normalizedChat = {
                        ...chatData,

                        id:
                            Number(
                                chatData.id ??
                                chatData.Id
                            ),

                        name:
                            chatData.name ??
                            chatData.Name ??
                            "Група",

                        isGroup:
                            true,

                        creatorId:
                            Number(
                                chatData.creatorId ??
                                chatData.CreatorId
                            ),

                        members:
                            normalizedMembers,

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
                                        chatId
                                );

                            if (exists) {
                                return safeChats.map(
                                    (chat) =>
                                        Number(
                                            chat.id
                                        ) ===
                                        chatId
                                            ? {
                                                ...chat,
                                                ...normalizedChat
                                            }
                                            : chat
                                );
                            }

                            return [
                                ...safeChats,
                                normalizedChat
                            ];
                        }
                    );

                    return;
                }


                // ==================================
                // ANOTHER USER WAS ADDED
                // ==================================

                const normalizedUser = {
                    id:
                        addedUserId,

                    nickname:
                        addedUser?.nickname ??
                        addedUser?.Nickname ??
                        "Користувач"
                };


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
                                    chatId
                                ) {
                                    return chat;
                                }

                                const currentMembers =
                                    Array.isArray(
                                        chat.members
                                    )
                                        ? chat.members
                                        : [];

                                const exists =
                                    currentMembers.some(
                                        (member) =>
                                            Number(
                                                member.id ??
                                                member.userId ??
                                                member.UserId
                                            ) ===
                                            addedUserId
                                    );

                                if (exists) {
                                    return chat;
                                }

                                return {
                                    ...chat,

                                    members: [
                                        ...currentMembers,
                                        normalizedUser
                                    ]
                                };
                            }
                        );
                    }
                );


                setSelectedChat(
                    (previousChat) => {
                        if (
                            !previousChat ||
                            Number(
                                previousChat.id
                            ) !==
                            chatId
                        ) {
                            return previousChat;
                        }

                        const currentMembers =
                            Array.isArray(
                                previousChat.members
                            )
                                ? previousChat.members
                                : [];

                        const exists =
                            currentMembers.some(
                                (member) =>
                                    Number(
                                        member.id ??
                                        member.userId ??
                                        member.UserId
                                    ) ===
                                    addedUserId
                            );

                        if (exists) {
                            return previousChat;
                        }

                        return {
                            ...previousChat,

                            members: [
                                ...currentMembers,
                                normalizedUser
                            ]
                        };
                    }
                );
            },
            [user]
        );


    // ==========================================
    // GROUP MEMBER REMOVED
    // ==========================================

    const handleGroupMemberRemoved =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                const chatId =
                    Number(
                        data.chatId ??
                        data.ChatId
                    );

                const removedUserId =
                    Number(
                        data.userId ??
                        data.UserId
                    );

                const currentUserId =
                    Number(
                        user?.id
                    );

                if (
                    !chatId ||
                    !removedUserId
                ) {
                    return;
                }


                if (
                    removedUserId ===
                    currentUserId
                ) {
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
                                    chatId
                            );
                        }
                    );

                    setSelectedChat(
                        (previousChat) => {
                            if (
                                Number(
                                    previousChat?.id
                                ) ===
                                chatId
                            ) {
                                setMessages([]);
                                setMobileChatOpen(false);
                                markedAsReadRef.current.clear();

                                return null;
                            }

                            return previousChat;
                        }
                    );

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
                                    chatId
                                ) {
                                    return chat;
                                }

                                if (
                                    !Array.isArray(
                                        chat.members
                                    )
                                ) {
                                    return chat;
                                }

                                return {
                                    ...chat,

                                    members:
                                        chat.members.filter(
                                            (member) =>
                                                Number(
                                                    member.id ??
                                                    member.userId ??
                                                    member.UserId
                                                ) !==
                                                removedUserId
                                        )
                                };
                            }
                        );
                    }
                );


                setSelectedChat(
                    (previousChat) => {
                        if (
                            !previousChat ||
                            Number(
                                previousChat.id
                            ) !==
                            chatId
                        ) {
                            return previousChat;
                        }

                        if (
                            !Array.isArray(
                                previousChat.members
                            )
                        ) {
                            return previousChat;
                        }

                        return {
                            ...previousChat,

                            members:
                                previousChat.members.filter(
                                    (member) =>
                                        Number(
                                            member.id ??
                                            member.userId ??
                                            member.UserId
                                        ) !==
                                        removedUserId
                                )
                        };
                    }
                );
            },
            [user]
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
            null,

        onGroupInvitationReceived:
            handleGroupInvitationReceived,

        onGroupInvitationAccepted:
            handleGroupInvitationAccepted,

        onGroupMemberAdded:
            handleGroupMemberAdded,

        onGroupMemberRemoved:
            handleGroupMemberRemoved
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
                    if (
                        Number(
                            message.sender?.id ??
                            message.senderId
                        ) ===
                        Number(user.id)
                    ) {
                        continue;
                    }

                    if (message.isRead) {
                        continue;
                    }

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
            setGroupInvitations([]);
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
                            ? data.map(
                                (request) => ({
                                    ...request,

                                    requestId:
                                        Number(
                                            request.requestId ??
                                            request.RequestId ??
                                            request.id ??
                                            request.Id
                                        )
                                })
                            )
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
    // LOAD GROUP INVITATIONS
    // ==========================================

    useEffect(() => {
        if (!token) {
            setGroupInvitations([]);

            return;
        }

        const loadGroupInvitations =
            async () => {
                try {
                    const data =
                        await getGroupInvitations(
                            token
                        );

                    const normalized =
                        Array.isArray(data)
                            ? data.map(
                                (invitation) => ({
                                    ...invitation,

                                    invitationId:
                                        Number(
                                            invitation.invitationId ??
                                            invitation.InvitationId ??
                                            invitation.id ??
                                            invitation.Id
                                        ),

                                    chatId:
                                        Number(
                                            invitation.chatId ??
                                            invitation.ChatId
                                        ),

                                    chatName:
                                        invitation.chatName ??
                                        invitation.ChatName ??
                                        "Група",

                                    sender:
                                        invitation.sender ??
                                        invitation.Sender
                                })
                            )
                            : [];

                    setGroupInvitations(
                        normalized
                    );
                } catch (error) {
                    console.error(
                        "Failed to load group invitations:",
                        error
                    );

                    setGroupInvitations([]);
                }
            };

        loadGroupInvitations();
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

                    markedAsReadRef.current.clear();

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

                    await joinChat(
                        chat.id
                    );

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
    // GROUP CREATED
    // ==========================================

    const handleGroupCreated =
        useCallback(
            async (createdChat) => {
                if (
                    !createdChat ||
                    !token
                ) {
                    return;
                }

                const groupId =
                    Number(
                        createdChat.id ??
                        createdChat.Id
                    );

                if (!groupId) {
                    return;
                }

                const members =
                    Array.isArray(
                        createdChat.members
                    )
                        ? createdChat.members
                        : Array.isArray(
                            createdChat.Members
                        )
                            ? createdChat.Members
                            : [];

                const groupChat = {
                    ...createdChat,

                    id:
                        groupId,

                    name:
                        createdChat.name ??
                        createdChat.Name ??
                        "Група",

                    isGroup:
                        true,

                    creatorId:
                        Number(
                            createdChat.creatorId ??
                            createdChat.CreatorId
                        ),

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
                                (chat) =>
                                    Number(
                                        chat.id
                                    ) ===
                                    groupId
                            );

                        if (exists) {
                            return safeChats.map(
                                (chat) =>
                                    Number(
                                        chat.id
                                    ) ===
                                    groupId
                                        ? {
                                            ...chat,
                                            ...groupChat,
                                            unreadCount:
                                                0
                                        }
                                        : chat
                            );
                        }

                        return [
                            ...safeChats,
                            groupChat
                        ];
                    }
                );

                await openChat(
                    groupChat
                );
            },
            [
                token,
                openChat
            ]
        );


    // ==========================================
    // ACCEPT GROUP INVITATION
    // ==========================================

    const handleAcceptGroupInvitation =
        useCallback(
            async (invitation) => {
                if (
                    !token ||
                    !invitation
                ) {
                    return;
                }

                try {
                    const result =
                        await acceptGroupInvitation(
                            token,
                            invitation.invitationId
                        );


                    setGroupInvitations(
                        (previousInvitations) => {
                            const safeInvitations =
                                Array.isArray(
                                    previousInvitations
                                )
                                    ? previousInvitations
                                    : [];

                            return safeInvitations.filter(
                                (item) =>
                                    Number(
                                        item.invitationId
                                    ) !==
                                    Number(
                                        invitation.invitationId
                                    )
                            );
                        }
                    );


                    let acceptedChat =
                        result?.chat;

                    if (!acceptedChat) {
                        throw new Error(
                            "Групу не було отримано після прийняття запрошення."
                        );
                    }


                    const members =
                        Array.isArray(
                            acceptedChat.members
                        )
                            ? [
                                ...acceptedChat.members
                            ]
                            : [];


                    const hasCurrentUser =
                        members.some(
                            (member) =>
                                Number(
                                    member.id ??
                                    member.userId ??
                                    member.UserId
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


                    acceptedChat = {
                        ...acceptedChat,

                        id:
                            Number(
                                acceptedChat.id ??
                                acceptedChat.Id
                            ),

                        name:
                            acceptedChat.name ??
                            acceptedChat.Name ??
                            invitation.chatName ??
                            "Група",

                        isGroup:
                            true,

                        creatorId:
                            Number(
                                acceptedChat.creatorId ??
                                acceptedChat.CreatorId
                            ),

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
                        "Failed to accept group invitation:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося приєднатися до групи."
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
    // IGNORE GROUP INVITATION
    // ==========================================

    const handleIgnoreGroupInvitation =
        useCallback(
            async (invitation) => {
                if (
                    !token ||
                    !invitation
                ) {
                    return;
                }

                try {
                    await ignoreGroupInvitation(
                        token,
                        invitation.invitationId
                    );

                    setGroupInvitations(
                        (previousInvitations) => {
                            const safeInvitations =
                                Array.isArray(
                                    previousInvitations
                                )
                                    ? previousInvitations
                                    : [];

                            return safeInvitations.filter(
                                (item) =>
                                    Number(
                                        item.invitationId
                                    ) !==
                                    Number(
                                        invitation.invitationId
                                    )
                            );
                        }
                    );
                } catch (error) {
                    console.error(
                        "Failed to ignore group invitation:",
                        error
                    );

                    alert(
                        error.message ||
                        "Не вдалося проігнорувати запрошення."
                    );
                }
            },
            [token]
        );


    // ==========================================
    // ADD GROUP MEMBER
    // ==========================================

    const handleAddGroupMember =
        useCallback(
            async (userId) => {
                if (
                    !token ||
                    !selectedChat ||
                    !selectedChat.isGroup
                ) {
                    return;
                }

                const currentUserId =
                    Number(
                        user?.id
                    );

                const targetUserId =
                    Number(
                        userId
                    );

                if (
                    !targetUserId ||
                    targetUserId ===
                        currentUserId
                ) {
                    return;
                }

                const isCreator =
                    Number(
                        selectedChat.creatorId
                    ) ===
                    currentUserId;

                if (!isCreator) {
                    throw new Error(
                        "Тільки Creator може додавати учасників."
                    );
                }

                try {
                    await addGroupMember(
                        token,
                        selectedChat.id,
                        targetUserId
                    );
                } catch (error) {
                    console.error(
                        "Failed to add group member:",
                        error
                    );

                    throw error;
                }
            },
            [
                token,
                selectedChat,
                user
            ]
        );


    // ==========================================
    // REMOVE GROUP MEMBER
    // ==========================================

    const handleRemoveGroupMember =
        useCallback(
            async (userId) => {
                if (
                    !token ||
                    !selectedChat ||
                    !selectedChat.isGroup
                ) {
                    return;
                }

                const currentUserId =
                    Number(
                        user?.id
                    );

                const targetUserId =
                    Number(
                        userId
                    );

                if (
                    !targetUserId ||
                    targetUserId ===
                        currentUserId
                ) {
                    return;
                }

                const isCreator =
                    Number(
                        selectedChat.creatorId
                    ) ===
                    currentUserId;

                if (!isCreator) {
                    return;
                }

                try {
                    await removeGroupMember(
                        token,
                        selectedChat.id,
                        targetUserId
                    );
                } catch (error) {
                    console.error(
                        "Failed to remove group member:",
                        error
                    );

                    throw error;
                }
            },
            [
                token,
                selectedChat,
                user
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
                                    member.id ??
                                    member.userId
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
                                    member.id ??
                                    member.userId
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


                    await openChat(
                        chat
                    );
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
                                member.id ??
                                member.userId ??
                                member.UserId
                            ) !==
                            Number(
                                user?.id
                            )
                    );

                return (
                    otherMember?.nickname ??
                    otherMember?.Nickname ??
                    chat.name ??
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
    // DELETE CHAT / GROUP
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

                const chatId =
                    selectedChat.id;


                if (
                    selectedChat.isGroup &&
                    Number(
                        selectedChat.creatorId
                    ) !==
                        Number(
                            user?.id
                        )
                ) {
                    throw new Error(
                        "Тільки Creator може видалити групу."
                    );
                }


                try {
                    await leaveChat(
                        chatId
                    );

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
                user,
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
                                    Number(
                                        item.requestId
                                    ) !==
                                    Number(
                                        request.requestId
                                    )
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
                                    member.id ??
                                    member.userId ??
                                    member.UserId
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
                                    member.id ??
                                    member.userId ??
                                    member.UserId
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
                                    Number(
                                        item.requestId
                                    ) !==
                                    Number(
                                        request.requestId
                                    )
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
    // SAFE VALUES
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

    const safeGroupInvitations =
        Array.isArray(groupInvitations)
            ? groupInvitations
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
                    onGroupCreated={
                        handleGroupCreated
                    }
                />
            }
        >

            {/* =====================================
                PRIVATE CHAT REQUESTS
            ====================================== */}

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


            {/* =====================================
                GROUP INVITATIONS
            ====================================== */}

            {safeGroupInvitations.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        top:
                            safeChatRequests.length > 0
                                ? "200px"
                                : "20px",
                        right: "20px",
                        zIndex: 999,
                        width: "360px",
                        maxWidth:
                            "calc(100vw - 40px)",
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: "12px"
                    }}
                >
                    {safeGroupInvitations.map(
                        (invitation) => (
                            <div
                                key={
                                    invitation.invitationId
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
                                    Запрошення до групи
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
                                            invitation
                                                .sender
                                                ?.nickname
                                        }
                                    </strong>{" "}
                                    запросив вас до групи{" "}
                                    <strong>
                                        {
                                            invitation
                                                .chatName
                                        }
                                    </strong>
                                    .
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
                                            handleAcceptGroupInvitation(
                                                invitation
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
                                        Приєднатися
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleIgnoreGroupInvitation(
                                                invitation
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
                                        Ігнорувати
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}


            {/* =====================================
                CHAT
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

                        members={
                            selectedChat.members ?? []
                        }

                        currentUserId={
                            user?.id
                        }

                        creatorId={
                            selectedChat.creatorId
                        }

                        isGroupCreator={
                            Boolean(
                                selectedChat.isGroup &&
                                Number(
                                    selectedChat.creatorId
                                ) ===
                                    Number(
                                        user?.id
                                    )
                            )
                        }

                        token={
                            token
                        }

                        onAddGroupMember={
                            handleAddGroupMember
                        }

                        onRemoveGroupMember={
                            handleRemoveGroupMember
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
                        color:
                            "#777",
                        background:
                            "#fafafa",
                        fontSize:
                            "16px"
                    }}
                >
                    Виберіть чат
                </div>
            )}

        </MessengerLayout>
    );
}


export default MessengerPage;