function NotificationContainer({
    notifications = [],
    onRemove
}) {
    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {
        return null;
    }


    const getIcon =
        (type) => {
            switch (type) {
                case "chat-request":
                    return "💬";

                case "chat-request-rejected":
                    return "💬";

                case "group-invitation":
                    return "👥";

                case "group-invitation-rejected":
                    return "👥";

                case "success":
                    return "✓";

                case "error":
                    return "⚠️";

                default:
                    return "🔔";
            }
        };


    return (
        <div
            style={{
                position: "fixed",

                top: "20px",

                right: "20px",

                zIndex: 3000,

                width: "360px",

                maxWidth:
                    "calc(100vw - 40px)",

                display: "flex",

                flexDirection: "column",

                gap: "10px",

                pointerEvents: "none"
            }}
        >
            {notifications.map(
                (notification) => (
                    <div
                        key={
                            notification.id
                        }

                        style={{
                            background:
                                "#ffffff",

                            color: "#222",

                            border:
                                "1px solid #ddd",

                            borderRadius:
                                "14px",

                            padding:
                                "14px 16px",

                            boxShadow:
                                "0 8px 30px rgba(0,0,0,0.18)",

                            display: "flex",

                            alignItems:
                                "flex-start",

                            gap: "10px",

                            pointerEvents:
                                "auto"
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    "20px",

                                lineHeight:
                                    "1"
                            }}
                        >
                            {getIcon(
                                notification.type
                            )}
                        </div>


                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <div
                                style={{
                                    fontWeight:
                                        "600",

                                    fontSize:
                                        "14px",

                                    marginBottom:
                                        "3px"
                                }}
                            >
                                {
                                    notification.title
                                }
                            </div>


                            <div
                                style={{
                                    fontSize:
                                        "14px",

                                    lineHeight:
                                        "1.4",

                                    color:
                                        "#555"
                                }}
                            >
                                {
                                    notification.message
                                }
                            </div>
                        </div>


                        <button
                            type="button"

                            onClick={() =>
                                onRemove?.(
                                    notification.id
                                )
                            }

                            style={{
                                border:
                                    "none",

                                background:
                                    "transparent",

                                cursor:
                                    "pointer",

                                fontSize:
                                    "16px",

                                color:
                                    "#888",

                                padding:
                                    "0"
                            }}
                        >
                            ×
                        </button>
                    </div>
                )
            )}
        </div>
    );
}


export default NotificationContainer;