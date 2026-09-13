import ChatItem from "./ChatItem";

function ChatList({
    chats,
    selectedChat,
    getChatName,
    onSelectChat
}) {
    if (chats.length === 0) {
        return (
            <div
                style={{
                    color: "#9ca3af",
                    padding: "18px 10px",
                    textAlign: "center",
                    fontSize: "13px",
                    animation:
                        "freegramFadeIn 180ms ease-out"
                }}
            >
                Чатів поки немає.
            </div>
        );
    }

    return (
        <div
            className="freegram-chat-list"
            style={{
                animation:
                    "freegramChatListIn 220ms ease-out"
            }}
        >
            {chats.map((chat, index) => (
                <div
                    key={chat.id}
                    className="freegram-chat-list-item"
                    style={{
                        animation:
                            "freegramChatItemIn 220ms ease-out both",
                        animationDelay:
                            `${Math.min(index * 25, 150)}ms`
                    }}
                >
                    <ChatItem
                        chat={chat}
                        name={getChatName(chat)}
                        selected={
                            selectedChat?.id ===
                            chat.id
                        }
                        onClick={() =>
                            onSelectChat(chat)
                        }
                    />
                </div>
            ))}

            <style>
                {`
                    @keyframes freegramChatListIn {
                        from {
                            opacity: 0.7;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes freegramChatItemIn {
                        from {
                            opacity: 0;
                            transform: translateY(5px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .freegram-chat-list,
                        .freegram-chat-list-item {
                            animation: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default ChatList;