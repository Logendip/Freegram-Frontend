function ChatRequestCard({
    request,
    onAccept,
    onReject
}) {
    if (!request) {
        return null;
    }


    const nickname =
        request.sender?.nickname ??
        request.sender?.Nickname ??
        "Користувач";


    return (
        <div
            style={{
                background:
                    "#ffffff",

                border:
                    "1px solid #ddd",

                borderRadius:
                    "12px",

                padding:
                    "16px",

                boxShadow:
                    "0 8px 30px rgba(0,0,0,0.15)"
            }}
        >
            <div
                style={{
                    fontWeight:
                        "600",

                    fontSize:
                        "16px",

                    marginBottom:
                        "8px"
                }}
            >
                💬 Новий запит на чат
            </div>


            <div
                style={{
                    color:
                        "#555",

                    fontSize:
                        "14px",

                    lineHeight:
                        "1.5",

                    marginBottom:
                        "14px"
                }}
            >
                <strong>
                    {nickname}
                </strong>{" "}
                хоче почати з вами чат.
            </div>


            <div
                style={{
                    display:
                        "flex",

                    gap:
                        "8px"
                }}
            >
                <button
                    type="button"

                    onClick={() =>
                        onAccept?.(
                            request
                        )
                    }

                    style={{
                        flex: 1,

                        padding:
                            "9px 12px",

                        border:
                            "none",

                        borderRadius:
                            "8px",

                        cursor:
                            "pointer",

                        background:
                            "#222",

                        color:
                            "#fff",

                        fontSize:
                            "14px",

                        fontWeight:
                            "500"
                    }}
                >
                    Прийняти
                </button>


                <button
                    type="button"

                    onClick={() =>
                        onReject?.(
                            request
                        )
                    }

                    style={{
                        flex: 1,

                        padding:
                            "9px 12px",

                        border:
                            "1px solid #ddd",

                        borderRadius:
                            "8px",

                        cursor:
                            "pointer",

                        background:
                            "#fff",

                        color:
                            "#333",

                        fontSize:
                            "14px",

                        fontWeight:
                            "500"
                    }}
                >
                    Відхилити
                </button>
            </div>
        </div>
    );
}


export default ChatRequestCard;