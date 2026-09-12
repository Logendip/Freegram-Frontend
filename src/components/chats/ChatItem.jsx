
function ChatItem({
    chat,
    name,
    selected,
    onClick
}) {
    return (
        <button
            onClick={onClick}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                marginBottom: "4px",
                border: "none",
                borderRadius: "8px",
                background: selected
                    ? "#e9e9e9"
                    : "transparent",
                cursor: "pointer",
                textAlign: "left"
            }}
        >
            {/* Avatar */}

            <div
                style={{
                    width: "48px",
                    height: "48px",
                    minWidth: "48px",
                    borderRadius: "50%",
                    background: "#d6d6d6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "18px"
                }}
            >
                {name
                    .charAt(0)
                    .toUpperCase()}
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
                        fontWeight: "600",
                        marginBottom: "4px"
                    }}
                >
                    {name}
                </div>

                <div
                    style={{
                        fontSize: "13px",
                        color: "#777",
                        overflow: "hidden",
                        textOverflow:
                            "ellipsis",
                        whiteSpace: "nowrap"
                    }}
                >
                    {chat.isGroup
                        ? "Група"
                        : "Приватний чат"}
                </div>
            </div>
        </button>
    );
}

export default ChatItem;
