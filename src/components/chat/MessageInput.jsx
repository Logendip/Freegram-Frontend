import { useState } from "react";

function MessageInput({
    onSend
}) {
    const [value, setValue] = useState("");
    const [sending, setSending] = useState(false);

    const send = async () => {
        const content = value.trim();

        if (!content || sending) {
            return;
        }

        try {
            setSending(true);

            await onSend(content);

            setValue("");
        } catch (error) {
            console.error(
                "Failed to send message:",
                error
            );
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            send();
        }
    };

    const hasText = value.trim().length > 0;

    return (
        <div
            style={{
                display: "flex",
                gap: "10px",
                padding: "12px 15px",
                borderTop: "1px solid #ddd",
                background: "#fff",
                boxSizing: "border-box"
            }}
        >
            <textarea
                value={value}
                onChange={(event) =>
                    setValue(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Написати повідомлення..."
                rows={1}
                disabled={sending}
                style={{
                    flex: 1,
                    minWidth: 0,
                    resize: "none",
                    padding: "11px 13px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box"
                }}
            />

            <button
                onClick={send}
                disabled={!hasText || sending}
                style={{
                    flexShrink: 0,
                    padding: "0 20px",
                    border: "none",
                    borderRadius: "10px",
                    cursor:
                        hasText && !sending
                            ? "pointer"
                            : "default",
                    background: "#333",
                    color: "#fff",
                    opacity:
                        hasText && !sending
                            ? 1
                            : 0.5,
                    transition:
                        "transform 0.15s ease, opacity 0.15s ease"
                }}
            >
                {sending ? "..." : "➤"}
            </button>
        </div>
    );
}

export default MessageInput;