
import { useState } from "react";

function ChatHeader({
    name,
    isGroup,
    onDeleteChat
}) {
    const [showMenu, setShowMenu] =
        useState(false);

    const handleDeleteChat = async () => {
        setShowMenu(false);

        const confirmed = window.confirm(
            `Видалити всю переписку з "${name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await onDeleteChat();
        } catch (error) {
            console.error(
                "Failed to delete chat:",
                error
            );

            alert(
                error.message ||
                "Не вдалося видалити переписку."
            );
        }
    };

    return (
        <header
            style={{
                height: "72px",
                minHeight: "72px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "0 20px",
                borderBottom: "1px solid #ddd",
                position: "relative",
                background: "#fff",
                zIndex: 20
            }}
        >
            {/* Avatar */}

            <div
                style={{
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    borderRadius: "50%",
                    background: "#d6d6d6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold"
                }}
            >
                {name
                    ?.charAt(0)
                    .toUpperCase()}
            </div>

            {/* Name */}

            <div
                style={{
                    flex: 1,
                    minWidth: 0
                }}
            >
                <div
                    style={{
                        fontWeight: "600",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}
                >
                    {name}
                </div>

                <div
                    style={{
                        fontSize: "13px",
                        color: "#777",
                        marginTop: "3px"
                    }}
                >
                    {isGroup
                        ? "Група"
                        : "Приватний чат"}
                </div>
            </div>

            {/* Chat menu */}

            {!isGroup && (
                <div
                    style={{
                        position: "relative"
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setShowMenu(
                                (value) => !value
                            )
                        }
                        title="Меню"
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "none",
                            borderRadius: "50%",
                            background:
                                showMenu
                                    ? "#f0f0f0"
                                    : "transparent",
                            cursor: "pointer",
                            fontSize: "24px",
                            lineHeight: "1",
                            color: "#555"
                        }}
                    >
                        ⋮
                    </button>

                    {showMenu && (
                        <div
                            style={{
                                position: "absolute",
                                top: "46px",
                                right: "0",
                                minWidth: "220px",
                                background: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                boxShadow:
                                    "0 5px 20px rgba(0,0,0,0.15)",
                                overflow: "hidden",
                                zIndex: 100
                            }}
                        >
                            <button
                                type="button"
                                onClick={
                                    handleDeleteChat
                                }
                                style={{
                                    width: "100%",
                                    border: "none",
                                    background:
                                        "transparent",
                                    padding:
                                        "12px 16px",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    color: "#d32f2f",
                                    fontSize: "14px"
                                }}
                            >
                                🗑️ Видалити переписку
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

export default ChatHeader;
