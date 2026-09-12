import { useState } from "react";

function MessageInput({
onSend
}) {
const [value, setValue] =
useState("");


const send = async () => {
    const content =
        value.trim();

    if (!content) {
        return;
    }

    await onSend(content);

    setValue("");
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

return (
    <div
        style={{
            display: "flex",
            gap: "10px",
            padding: "12px 15px",
            borderTop:
                "1px solid #ddd",
            background: "#fff"
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
            style={{
                flex: 1,
                resize: "none",
                padding:
                    "11px 13px",
                border:
                    "1px solid #ddd",
                borderRadius:
                    "10px",
                fontFamily:
                    "inherit",
                outline: "none"
            }}
        />

        <button
            onClick={send}
            disabled={!value.trim()}
            style={{
                padding:
                    "0 20px",
                border: "none",
                borderRadius:
                    "10px",
                cursor: value.trim()
                    ? "pointer"
                    : "default",
                background:
                    "#333",
                color: "#fff",
                opacity:
                    value.trim()
                        ? 1
                        : 0.5
            }}
        >
            ➤
        </button>
    </div>
);


}

export default MessageInput;
