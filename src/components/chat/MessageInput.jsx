import {
    useState
} from "react";

function MessageInput({
    onSend
}) {
    const [value, setValue] =
        useState("");

    const hasValue =
        value.trim().length > 0;

    const send = async () => {
        const content =
            value.trim();

        if (!content) {
            return;
        }

        await onSend(content);

        setValue("");
    };

    const handleKeyDown = (
        event
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            send();
        }
    };

    return (
        <div
            className="freegram-message-input"
            style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "9px",
                padding: "10px 15px",
                borderTop:
                    "1px solid #e5e7eb",
                background: "#fff",
                boxSizing: "border-box"
            }}
        >
            <textarea
                value={value}
                onChange={(event) =>
                    setValue(
                        event.target.value
                    )
                }
                onKeyDown={
                    handleKeyDown
                }
                placeholder="Написати повідомлення..."
                rows={1}
                className="freegram-message-textarea"
                style={{
                    flex: 1,
                    minWidth: 0,
                    resize: "none",
                    minHeight: "42px",
                    maxHeight: "120px",
                    padding:
                        "10px 13px",
                    border:
                        "1px solid #dfe3e8",
                    borderRadius: "13px",
                    fontFamily:
                        "inherit",
                    fontSize: "14px",
                    lineHeight: "20px",
                    outline: "none",
                    background: "#f7f8fa",
                    color: "#1f2937",
                    boxSizing: "border-box",
                    transition:
                        "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 120ms ease"
                }}
                onFocus={(event) => {
                    event.currentTarget.style.background =
                        "#ffffff";

                    event.currentTarget.style.borderColor =
                        "#a78bfa";

                    event.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(124,58,237,0.09)";
                }}
                onBlur={(event) => {
                    event.currentTarget.style.background =
                        "#f7f8fa";

                    event.currentTarget.style.borderColor =
                        "#dfe3e8";

                    event.currentTarget.style.boxShadow =
                        "none";
                }}
            />

            <button
                type="button"
                onClick={send}
                disabled={!hasValue}
                aria-label="Надіслати повідомлення"
                className="freegram-send-button"
                style={{
                    width: "42px",
                    height: "42px",
                    minWidth: "42px",
                    border: "none",
                    borderRadius: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    cursor: hasValue
                        ? "pointer"
                        : "default",
                    background:
                        hasValue
                            ? "#6366f1"
                            : "#e5e7eb",
                    color: hasValue
                        ? "#ffffff"
                        : "#9ca3af",
                    opacity: hasValue
                        ? 1
                        : 0.75,
                    fontSize: "17px",
                    transition:
                        "transform 120ms ease, background-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease",
                    boxShadow:
                        hasValue
                            ? "0 4px 10px rgba(99,102,241,0.22)"
                            : "none"
                }}
            >
                ➤
            </button>

            <style>
                {`
                    .freegram-send-button:not(:disabled):hover {
                        transform: translateY(-1px);
                        box-shadow:
                            0 6px 14px rgba(99,102,241,0.28) !important;
                    }

                    .freegram-send-button:not(:disabled):active {
                        transform: scale(0.92);
                        box-shadow:
                            0 2px 5px rgba(99,102,241,0.18) !important;
                    }

                    .freegram-send-button:disabled {
                        transform: scale(1);
                    }

                    @media (max-width: 768px) {
                        .freegram-message-input {
                            padding:
                                8px 9px
                                calc(8px + env(safe-area-inset-bottom))
                                9px !important;
                            gap: 7px !important;
                        }

                        .freegram-message-textarea {
                            min-height: 44px !important;
                            border-radius: 14px !important;
                            font-size: 15px !important;
                        }

                        .freegram-send-button {
                            width: 44px !important;
                            height: 44px !important;
                            min-width: 44px !important;
                            border-radius: 14px !important;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .freegram-send-button,
                        .freegram-message-textarea {
                            transition: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default MessageInput;