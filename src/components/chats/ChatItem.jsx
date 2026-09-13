function ChatItem({
    chat,
    name = "Приватний чат",
    selected = false,
    onClick
}) {
    if (!chat) {
        return null;
    }

    const safeName =
        name || "Приватний чат";

    const firstLetter =
        safeName
            .charAt(0)
            .toUpperCase();

    const handleClick = () => {
        if (onClick) {
            onClick(chat);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`freegram-chat-item ${
                selected
                    ? "freegram-chat-item-selected"
                    : ""
            }`}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "11px",
                padding: "10px 9px",
                marginBottom: "3px",
                border: "none",
                borderRadius: "12px",
                background: selected
                    ? "#f1f0ff"
                    : "transparent",
                cursor: "pointer",
                textAlign: "left",
                boxSizing: "border-box",
                transition:
                    "background 160ms ease, transform 120ms ease",
                WebkitTapHighlightColor:
                    "transparent"
            }}
        >
            {/* Avatar */}

            <div
                style={{
                    width: "46px",
                    height: "46px",
                    minWidth: "46px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    color: "#ffffff",
                    fontSize: "17px",
                    fontWeight: "700",
                    boxShadow:
                        "0 2px 7px rgba(99,102,241,0.18)"
                }}
            >
                {firstLetter}
            </div>


            {/* Chat information */}

            <div
                style={{
                    minWidth: 0,
                    flex: 1
                }}
            >
                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1f2937",
                        overflow: "hidden",
                        textOverflow:
                            "ellipsis",
                        whiteSpace: "nowrap"
                    }}
                >
                    {safeName}
                </div>

                <div
                    style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "#9ca3af",
                        overflow: "hidden",
                        textOverflow:
                            "ellipsis",
                        whiteSpace: "nowrap"
                    }}
                >
                    {chat.isGroup
                        ? "Груповий чат"
                        : "Приватний чат"}
                </div>
            </div>


            {/* Arrow */}

            <span
                style={{
                    flexShrink: 0,
                    color: selected
                        ? "#8b5cf6"
                        : "#c4b5fd",
                    fontSize: "20px",
                    lineHeight: 1,
                    transition:
                        "transform 160ms ease"
                }}
            >
                ›
            </span>


            <style>
                {`
                    .freegram-chat-item:hover {
                        background: #f3f4f6 !important;
                    }

                    .freegram-chat-item-selected:hover {
                        background: #ebe9fe !important;
                    }

                    .freegram-chat-item:active {
                        transform: scale(0.985);
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .freegram-chat-item {
                            transition: none !important;
                        }
                    }
                `}
            </style>
        </button>
    );
}

export default ChatItem;