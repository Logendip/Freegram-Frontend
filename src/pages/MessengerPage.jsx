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

import { useNotifications } from "../hooks/useNotifications";

import MessengerLayout from "../components/layout/MessengerLayout";

import ChatSidebar from "../components/chats/ChatSidebar";

import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

import NotificationContainer
    from "../components/notifications/NotificationContainer";

import ChatRequestCard
    from "../components/notifications/ChatRequestCard";

import GroupInvitationCard
    from "../components/notifications/GroupInvitationCard";

import ConfirmationModal
    from "../components/notifications/ConfirmationModal";


function MessengerPage() {
    const { user, token } = useAuth();


    // ==========================================
    // STATE
    // ==========================================

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


    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    const {
        notifications,
        notify,
        removeNotification,
        clearNotifications
    } = useNotifications();


    // ==========================================
    // MODAL
    // ==========================================

    const [modal, setModal] =
        useState({
            open: false,
            title: "",
            message: "",
            type: "info",
            confirmText: "Підтвердити",
            onConfirm: null
        });


    // ==========================================
    // MODAL HELPERS
    // ==========================================

    const closeModal =
        useCallback(() => {
            setModal({
                open: false,
                title: "",
                message: "",
                type: "info",
                confirmText: "Підтвердити",
                onConfirm: null
            });
        }, []);


    const showInfoModal =
        useCallback(
            ({
                title,
                message
            }) => {
                setModal({
                    open: true,
                    title,
                    message,
                    type: "info",
                    confirmText: "Зрозуміло",
                    onConfirm: null
                });
            },
            []
        );


    const showConfirmModal =
        useCallback(
            ({
                title,
                message,
                confirmText = "Підтвердити",
                onConfirm,
                danger = false
            }) => {
                setModal({
                    open: true,
                    title,
                    message,
                    type:
                        danger
                            ? "danger"
                            : "confirm",
                    confirmText,
                    onConfirm
                });
            },
            []
        );


    // ==========================================
    // READ MESSAGE TRACKING
    // ==========================================

    const markedAsReadRef =
        useRef(new Set());


    // ==========================================
    // NORMALIZE MEMBER
    // ==========================================

    const normalizeMember =
        useCallback(
            (member) => {
                if (!member) {
                    return null;
                }

                const id =
                    Number(
                        member.id ??
                        member.Id ??
                        member.userId ??
                        member.UserId
                    );

                if (!id) {
                    return null;
                }

                return {
                    ...member,

                    id,

                    nickname:
                        member.nickname ??
                        member.Nickname ??
                        "Користувач"
                };
            },
            []
        );


    // ==========================================
    // NORMALIZE MEMBERS
    // ==========================================

    const normalizeMembers =
        useCallback(
            (members) => {
                if (!Array.isArray(members)) {
                    return [];
                }

                return members
                    .map(normalizeMember)
                    .filter(Boolean);
            },
            [normalizeMember]
        );


    // ==========================================
    // NORMALIZE CHAT
    // ==========================================

    const normalizeChat =
        useCallback(
            (chat) => {
                if (!chat) {
                    return null;
                }

                const id =
                    Number(
                        chat.id ??
                        chat.Id
                    );

                if (!id) {
                    return null;
                }

                return {
                    ...chat,

                    id,

                    name:
                        chat.name ??
                        chat.Name ??
                        "",

                    isGroup:
                        Boolean(
                            chat.isGroup ??
                            chat.IsGroup
                        ),

                    creatorId:
                        Number(
                            chat.creatorId ??
                            chat.CreatorId
                        ) || null,

                    createdAt:
                        chat.createdAt ??
                        chat.CreatedAt,

                    members:
                        normalizeMembers(
                            chat.members ??
                            chat.Members
                        ),

                    unreadCount:
                        Number(
                            chat.unreadCount ??
                            chat.UnreadCount ??
                            0
                        )
                };
            },
            [normalizeMembers]
        );


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
                        message.chatId ??
                        message.ChatId
                    );

                const currentChatId =
                    Number(
                        selectedChat?.id
                    );

                const messageSenderId =
                    Number(
                        message.sender?.id ??
                        message.sender?.Id ??
                        message.senderId ??
                        message.SenderId
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

                            const messageId =
                                Number(
                                    message.id ??
                                    message.Id
                                );

                            const exists =
                                safeMessages.some(
                                    (item) =>
                                        Number(
                                            item.id ??
                                            item.Id
                                        ) ===
                                        messageId
                                );

                            if (exists) {
                                return safeMessages;
                            }

                            return [
                                ...safeMessages,
                                {
                                    ...message,

                                    id:
                                        messageId,

                                    chatId:
                                        messageChatId,

                                    isRead:
                                        Boolean(
                                            message.isRead ??
                                            message.IsRead
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

                const messageId =
                    Number(
                        data.messageId ??
                        data.MessageId
                    );

                const chatId =
                    Number(
                        data.chatId ??
                        data.ChatId
                    );

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
                            chatId !==
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
                                    messageId
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

                const messageId =
                    Number(
                        data.messageId ??
                        data.MessageId
                    );

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
                                messageId
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

                const messageId =
                    Number(
                        data.messageId ??
                        data.MessageId
                    );

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
                                messageId
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

                        setMessages([]);

                        setMobileChatOpen(
                            false
                        );

                        markedAsReadRef.current.clear();

                        return null;
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
                        ) || null,

                    sender:
                        data.sender ??
                        data.Sender,

                    createdAt:
                        data.createdAt ??
                        data.CreatedAt
                };


                if (
                    !normalizedRequest.requestId
                ) {
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
    // PRIVATE CHAT REQUEST ACCEPTED
    // ==========================================

    const handleChatRequestAccepted =
        useCallback(
            async (data) => {
                if (!data) {
                    return;
                }

                const chatData =
                    data.chat ??
                    data.Chat;

                const normalizedChat =
                    normalizeChat(
                        chatData
                    );

                if (!normalizedChat) {
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

                        const exists =
                            safeChats.some(
                                (chat) =>
                                    Number(
                                        chat.id
                                    ) ===
                                    Number(
                                        normalizedChat.id
                                    )
                            );

                        if (exists) {
                            return safeChats.map(
                                (chat) =>
                                    Number(
                                        chat.id
                                    ) ===
                                    Number(
                                        normalizedChat.id
                                    )
                                        ? {
                                            ...chat,
                                            ...normalizedChat,
                                            unreadCount:
                                                0
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


                notify({
                    type: "success",
                    title: "Запит прийнято",
                    message:
                        "Користувач прийняв ваше запрошення до чату.",
                    duration: 4000
                });
            },
            [
                normalizeChat,
                notify
            ]
        );


    // ==========================================
    // PRIVATE CHAT REQUEST REJECTED
    // ==========================================

    const handleChatRequestRejected =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                const message =
                    data.message ??
                    data.Message ??
                    "Користувач відхилив ваше запрошення.";

                notify({
                    type: "warning",
                    title: "Запрошення відхилено",
                    message,
                    duration: 5000
                });
            },
            [notify]
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
            (data) => {
                if (!data) {
                    return;
                }

                const userData =
                    data.user ??
                    data.User;

                const nickname =
                    userData?.nickname ??
                    userData?.Nickname ??
                    "Користувач";

                const groupName =
                    data.groupName ??
                    data.GroupName ??
                    "групи";

                notify({
                    type: "success",
                    title: "Запрошення прийнято",
                    message:
                        `${nickname} приєднався до групи ${groupName}.`,
                    duration: 5000
                });
            },
            [notify]
        );


    // ==========================================
    // GROUP INVITATION REJECTED
    // ==========================================

    const handleGroupInvitationRejected =
        useCallback(
            (data) => {
                if (!data) {
                    return;
                }

                const nickname =
                    data.nickname ??
                    data.Nickname ??
                    "Користувач";

                const groupName =
                    data.groupName ??
                    data.GroupName ??
                    "групи";

                showInfoModal({
                    title:
                        "Запрошення відхилено",

                    message:
                        `${nickname} відмовився приєднатися до групи "${groupName}".`
                });
            },
            [showInfoModal]
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

                const addedUserNickname =
                    addedUser?.nickname ??
                    addedUser?.Nickname ??
                    "Користувач";

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


                if (
                    addedUserId ===
                    currentUserId &&
                    chatData
                ) {
                    const normalizedChat =
                        normalizeChat(
                            chatData
                        );

                    if (!normalizedChat) {
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


                const normalizedUser = {
                    id:
                        addedUserId,

                    nickname:
                        addedUserNickname
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
                                    normalizeMembers(
                                        chat.members
                                    );

                                const exists =
                                    currentMembers.some(
                                        (member) =>
                                            Number(
                                                member.id
                                            ) ===
                                            addedUserId
                                    );

                                if (exists) {
                                    return {
                                        ...chat,
                                        members:
                                            currentMembers
                                    };
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
                            normalizeMembers(
                                previousChat.members
                            );

                        const exists =
                            currentMembers.some(
                                (member) =>
                                    Number(
                                        member.id
                                    ) ===
                                    addedUserId
                            );

                        if (exists) {
                            return {
                                ...previousChat,
                                members:
                                    currentMembers
                            };
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
            [
                user,
                normalizeChat,
                normalizeMembers
            ]
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

                                setMobileChatOpen(
                                    false
                                );

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

                                return {
                                    ...chat,

                                    members:
                                        normalizeMembers(
                                            chat.members
                                        ).filter(
                                            (member) =>
                                                Number(
                                                    member.id
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

                        return {
                            ...previousChat,

                            members:
                                normalizeMembers(
                                    previousChat.members
                                ).filter(
                                    (member) =>
                                        Number(
                                            member.id
                                        ) !==
                                        removedUserId
                                )
                        };
                    }
                );
            },
            [
                user,
                normalizeMembers
            ]
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
            handleChatRequestAccepted,

        onChatRequestRejected:
            handleChatRequestRejected,

        onGroupInvitationReceived:
            handleGroupInvitationReceived,

        onGroupInvitationAccepted:
            handleGroupInvitationAccepted,

        onGroupInvitationRejected:
            handleGroupInvitationRejected,

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
                            ) !==
                            chatId
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
                    const senderId =
                        Number(
                            message.sender?.id ??
                            message.sender?.Id ??
                            message.senderId ??
                            message.SenderId
                        );

                    if (
                        senderId ===
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

            clearNotifications();

            closeModal();

            markedAsReadRef.current.clear();

            return;
        }

        const loadChats =
            async () => {
                try {
                    const data =
                        await getChats(token);

                    const normalized =
                        Array.isArray(data)
                            ? data
                                .map(
                                    normalizeChat
                                )
                                .filter(
                                    Boolean
                                )
                            : [];

                    setChats(
                        normalized
                    );
                } catch (error) {
                    console.error(
                        "Failed to load chats:",
                        error
                    );

                    setChats([]);

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            "Не вдалося завантажити список чатів.",
                        duration: 5000
                    });
                }
            };

        loadChats();
    }, [
        token,
        normalizeChat,
        notify,
        clearNotifications,
        closeModal
    ]);


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
                                        ),

                                    chatId:
                                        Number(
                                            request.chatId ??
                                            request.ChatId
                                        ) || null,

                                    sender:
                                        request.sender ??
                                        request.Sender,

                                    createdAt:
                                        request.createdAt ??
                                        request.CreatedAt
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            "Не вдалося завантажити запити на чати.",
                        duration: 5000
                    });
                }
            };

        loadChatRequests();
    }, [
        token,
        notify
    ]);


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
                                        invitation.Sender,

                                    createdAt:
                                        invitation.createdAt ??
                                        invitation.CreatedAt
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            "Не вдалося завантажити запрошення до груп.",
                        duration: 5000
                    });
                }
            };

        loadGroupInvitations();
    }, [
        token,
        notify
    ]);


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

                    const normalizedChat =
                        normalizeChat(
                            chat
                        );

                    if (!normalizedChat) {
                        return;
                    }

                    normalizedChat.unreadCount = 0;


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
                                            normalizedChat.id
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
                                        normalizedChat.id
                                    )
                                        ? {
                                            ...item,
                                            ...normalizedChat,
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
                        normalizedChat.id
                    );


                    const data =
                        await getMessages(
                            token,
                            normalizedChat.id
                        );

                    setMessages(
                        Array.isArray(data)
                            ? data.map(
                                (message) => ({
                                    ...message,

                                    id:
                                        Number(
                                            message.id ??
                                            message.Id
                                        ),

                                    chatId:
                                        Number(
                                            message.chatId ??
                                            message.ChatId
                                        ),

                                    isRead:
                                        Boolean(
                                            message.isRead ??
                                            message.IsRead
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося відкрити чат.",
                        duration: 5000
                    });
                }
            },
            [
                token,
                selectedChat,
                joinChat,
                leaveChat,
                normalizeChat,
                notify
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

                const groupChat =
                    normalizeChat(
                        createdChat
                    );

                if (!groupChat) {
                    return;
                }

                groupChat.isGroup = true;
                groupChat.unreadCount = 0;


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
                                        groupChat.id
                                    )
                            );

                        if (exists) {
                            return safeChats.map(
                                (chat) =>
                                    Number(
                                        chat.id
                                    ) ===
                                    Number(
                                        groupChat.id
                                    )
                                        ? {
                                            ...chat,
                                            ...groupChat
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
                openChat,
                normalizeChat
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
                        (previousInvitations) =>
                            previousInvitations.filter(
                                (item) =>
                                    Number(
                                        item.invitationId
                                    ) !==
                                    Number(
                                        invitation.invitationId
                                    )
                            )
                    );


                    const acceptedChat =
                        normalizeChat(
                            result?.chat
                        );

                    if (!acceptedChat) {
                        throw new Error(
                            "Групу не було отримано після прийняття запрошення."
                        );
                    }

                    acceptedChat.isGroup = true;
                    acceptedChat.unreadCount = 0;


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
                                                ...acceptedChat
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося приєднатися до групи.",
                        duration: 5000
                    });
                }
            },
            [
                token,
                openChat,
                normalizeChat,
                notify
            ]
        );


    // ==========================================
    // REJECT GROUP INVITATION
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
                        (previousInvitations) =>
                            previousInvitations.filter(
                                (item) =>
                                    Number(
                                        item.invitationId
                                    ) !==
                                    Number(
                                        invitation.invitationId
                                    )
                            )
                    );
                } catch (error) {
                    console.error(
                        "Failed to reject group invitation:",
                        error
                    );

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося відхилити запрошення.",
                        duration: 5000
                    });
                }
            },
            [
                token,
                notify
            ]
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


                    // ==================================
                    // REQUEST WAS SENT
                    // ==================================

                    if (!chat) {
                        showInfoModal({
                            title:
                                "Запрошення надіслано",

                            message:
                                "Запрошення на чат надіслано. Очікуємо на відповідь користувача."
                        });

                        return;
                    }


                    chat =
                        normalizeChat(
                            chat
                        );

                    if (!chat) {
                        throw new Error(
                            "Некоректні дані чату."
                        );
                    }


                    chat.unreadCount = 0;


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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося відправити запрошення.",
                        duration: 5000
                    });
                }
            },
            [
                token,
                openChat,
                normalizeChat,
                notify,
                showInfoModal
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
                    otherMember?.nickname ??
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося відправити повідомлення.",
                        duration: 5000
                    });
                }
            },
            [
                selectedChat,
                sendMessage,
                notify
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося видалити повідомлення.",
                        duration: 5000
                    });
                }
            },
            [
                selectedChat,
                deleteMessageForEveryone,
                notify
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося видалити повідомлення.",
                        duration: 5000
                    });
                }
            },
            [
                selectedChat,
                deleteMessageForMe,
                notify
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
                        (previousChats) =>
                            previousChats.filter(
                                (chat) =>
                                    Number(
                                        chat.id
                                    ) !==
                                    Number(
                                        chatId
                                    )
                            )
                    );


                    setSelectedChat(null);

                    setMessages([]);

                    setMobileChatOpen(
                        false
                    );

                    markedAsReadRef.current.clear();
                } catch (error) {
                    console.error(
                        "Failed to delete chat:",
                        error
                    );

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося видалити чат.",
                        duration: 5000
                    });
                }
            },
            [
                selectedChat,
                token,
                user,
                leaveChat,
                notify
            ]
        );


    // ==========================================
    // REQUEST DELETE CHAT
    // ==========================================

    const handleRequestDeleteChat =
        useCallback(
            () => {
                if (
                    !selectedChat ||
                    !token
                ) {
                    return;
                }

                const chatName =
                    getChatName(
                        selectedChat
                    );

                showConfirmModal({
                    title:
                        "Видалити чат?",

                    message:
                        `Видалити всю переписку з "${chatName}"?`,

                    confirmText:
                        "Видалити",

                    danger:
                        true,

                    onConfirm:
                        async () => {
                            closeModal();

                            await handleDeleteChat();
                        }
                });
            },
            [
                selectedChat,
                token,
                getChatName,
                showConfirmModal,
                closeModal,
                handleDeleteChat
            ]
        );


    // ==========================================
    // ACCEPT CHAT REQUEST
    // ==========================================

    const handleAcceptChatRequest =
        useCallback(
            async (request) => {
                if (
                    !token ||
                    !request
                ) {
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
                                    Number(
                                        item.requestId
                                    ) !==
                                    Number(
                                        request.requestId
                                    )
                            )
                    );


                    const acceptedChat =
                        normalizeChat(
                            result?.chat
                        );

                    if (!acceptedChat) {
                        throw new Error(
                            "Чат не був отриманий після прийняття запиту."
                        );
                    }

                    acceptedChat.unreadCount = 0;


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
                                                ...acceptedChat
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

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося прийняти запит.",
                        duration: 5000
                    });
                }
            },
            [
                token,
                openChat,
                normalizeChat,
                notify
            ]
        );


    // ==========================================
    // REJECT CHAT REQUEST
    // ==========================================

    const handleRejectChatRequest =
        useCallback(
            async (request) => {
                if (
                    !token ||
                    !request
                ) {
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
                                    Number(
                                        item.requestId
                                    ) !==
                                    Number(
                                        request.requestId
                                    )
                            )
                    );
                } catch (error) {
                    console.error(
                        "Failed to reject chat request:",
                        error
                    );

                    notify({
                        type: "error",
                        title: "Помилка",
                        message:
                            error.message ||
                            "Не вдалося відхилити запит.",
                        duration: 5000
                    });
                }
            },
            [
                token,
                notify
            ]
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

    const safeNotifications =
        Array.isArray(notifications)
            ? notifications
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
                    chats={
                        safeChats
                    }

                    selectedChat={
                        selectedChat
                    }

                    getChatName={
                        getChatName
                    }

                    onSelectChat={
                        openChat
                    }

                    token={
                        token
                    }

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
                NOTIFICATIONS
            ====================================== */}

            <NotificationContainer
                notifications={
                    safeNotifications
                }

                onRemove={
                    removeNotification
                }
            />


            {/* =====================================
                CUSTOM MODAL
            ====================================== */}

            <ConfirmationModal
                open={
                    modal.open
                }

                title={
                    modal.title
                }

                message={
                    modal.message
                }

                confirmText={
                    modal.confirmText
                }

                info={
                    modal.type === "info"
                }

                danger={
                    modal.type === "danger"
                }

                onConfirm={
                    modal.onConfirm
                }

                onCancel={
                    closeModal
                }
            />


            {/* =====================================
                PRIVATE CHAT REQUESTS
            ====================================== */}

            {safeChatRequests.length > 0 && (
                <div
                    style={{
                        position:
                            "fixed",

                        top:
                            "20px",

                        right:
                            "20px",

                        zIndex:
                            1500,

                        width:
                            "360px",

                        maxWidth:
                            "calc(100vw - 40px)",

                        display:
                            "flex",

                        flexDirection:
                            "column",

                        gap:
                            "12px",

                        pointerEvents:
                            "none"
                    }}
                >
                    {safeChatRequests.map(
                        (request) => (
                            <div
                                key={
                                    request.requestId
                                }

                                style={{
                                    pointerEvents:
                                        "auto"
                                }}
                            >
                                <ChatRequestCard
                                    request={
                                        request
                                    }

                                    onAccept={
                                        handleAcceptChatRequest
                                    }

                                    onReject={
                                        handleRejectChatRequest
                                    }
                                />
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
                        position:
                            "fixed",

                        top:
                            safeChatRequests.length > 0
                                ? "230px"
                                : "20px",

                        right:
                            "20px",

                        zIndex:
                            1400,

                        width:
                            "360px",

                        maxWidth:
                            "calc(100vw - 40px)",

                        display:
                            "flex",

                        flexDirection:
                            "column",

                        gap:
                            "12px",

                        pointerEvents:
                            "none"
                    }}
                >
                    {safeGroupInvitations.map(
                        (invitation) => (
                            <div
                                key={
                                    invitation.invitationId
                                }

                                style={{
                                    pointerEvents:
                                        "auto"
                                }}
                            >
                                <GroupInvitationCard
                                    invitation={
                                        invitation
                                    }

                                    onAccept={
                                        handleAcceptGroupInvitation
                                    }

                                    onReject={
                                        handleIgnoreGroupInvitation
                                    }
                                />
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
                        name={
                            getChatName(
                                selectedChat
                            )
                        }

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
                            handleRequestDeleteChat
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

                        display:
                            "flex",

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