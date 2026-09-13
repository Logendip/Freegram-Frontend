import {
    useEffect,
    useRef
} from "react";

import MessageBubble from "./MessageBubble";

function MessageList({
    messages = [],
    currentUserId,
    onDeleteForEveryone,
    onDeleteForMe
}) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    const safeMessages = Array.isArray(messages)
        ? messages
        : [];

    return (
        <div
            style={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "20px",
                paddingBottom: "28px",
                boxSizing: "border-box",
                background: "#fafafa"
            }}
        >
            {safeMessages.length === 0 ? (
                <div
                    style={{
                        height: "100%",
                        minHeight: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#888"
                    }}
                >
                    Повідомлень поки немає.
                </div>
            ) : (
                safeMessages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
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
                ))
            )}

            <div
                ref={bottomRef}
                style={{
                    height: "1px"
                }}
            />
        </div>
    );
}

export default MessageList;