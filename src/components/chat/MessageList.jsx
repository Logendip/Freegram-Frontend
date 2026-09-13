import {
    useEffect,
    useRef
} from "react";

import MessageBubble from "./MessageBubble";

function MessageList({
    messages,
    currentUserId,
    onDeleteForEveryone,
    onDeleteForMe
}) {
    const bottomRef =
        useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    return (
        <div
            className="freegram-message-list"
            style={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "20px",
                paddingBottom: "28px",
                boxSizing: "border-box",
                background: "#fafafa",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling:
                    "touch"
            }}
        >
            {messages.length === 0 ? (
                <div
                    style={{
                        height: "100%",
                        minHeight: "100%",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        color: "#888",
                        fontSize: "14px",
                        animation:
                            "freegramEmptyMessageIn 220ms ease-out"
                    }}
                >
                    Повідомлень поки немає.
                </div>
            ) : (
                messages.map(
                    (
                        message,
                        index
                    ) => (
                        <div
                            key={message.id}
                            className="freegram-message-item"
                            style={{
                                animation:
                                    "freegramMessageIn 180ms ease-out both",
                                animationDelay:
                                    `${Math.min(index * 12, 100)}ms`
                            }}
                        >
                            <MessageBubble
                                message={
                                    message
                                }
                                currentUserId={
                                    currentUserId
                                }
                                onDeleteForEveryone={
                                    onDeleteForEveryone
                                }
                                onDeleteForMe={
                                    onDeleteForMe
                                }
                            />
                        </div>
                    )
                )
            )}

            <div
                ref={bottomRef}
                style={{
                    height: "1px"
                }}
            />

            <style>
                {`
                    @keyframes freegramMessageIn {
                        from {
                            opacity: 0;
                            transform:
                                translateY(7px)
                                scale(0.985);
                        }

                        to {
                            opacity: 1;
                            transform:
                                translateY(0)
                                scale(1);
                        }
                    }

                    @keyframes freegramEmptyMessageIn {
                        from {
                            opacity: 0;
                            transform: translateY(5px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .freegram-message-list::-webkit-scrollbar {
                        width: 6px;
                    }

                    .freegram-message-list::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .freegram-message-list::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 10px;
                    }

                    .freegram-message-list::-webkit-scrollbar-thumb:hover {
                        background: #b8bec7;
                    }

                    @media (max-width: 768px) {
                        .freegram-message-list {
                            padding: 14px 10px 20px !important;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .freegram-message-item,
                        .freegram-message-list > div {
                            animation: none !important;
                        }

                        .freegram-message-list {
                            scroll-behavior: auto !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default MessageList;