
function NotificationContainer({
    notifications = []
}) {
    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {
        return null;
    }


    const getNotificationStyle =
        (type) => {
            switch (type) {
                case "success":
                    return {
                        icon: "✓",
                        iconBackground: "#dcfce7",
                        iconColor: "#16a34a"
                    };

                case "error":
                    return {
                        icon: "!",
                        iconBackground: "#fee2e2",
                        iconColor: "#dc2626"
                    };

                case "warning":
                    return {
                        icon: "!",
                        iconBackground: "#fef3c7",
                        iconColor: "#d97706"
                    };

                case "chat-request":
                    return {
                        icon: "💬",
                        iconBackground: "#dbeafe",
                        iconColor: "#2563eb"
                    };

                case "chat-request-rejected":
                    return {
                        icon: "💬",
                        iconBackground: "#fee2e2",
                        iconColor: "#dc2626"
                    };

                case "group-invitation":
                    return {
                        icon: "👥",
                        iconBackground: "#ede9fe",
                        iconColor: "#7c3aed"
                    };

                case "group-invitation-rejected":
                    return {
                        icon: "👥",
                        iconBackground: "#fee2e2",
                        iconColor: "#dc2626"
                    };

                case "info":
                default:
                    return {
                        icon: "i",
                        iconBackground: "#dbeafe",
                        iconColor: "#2563eb"
                    };
            }
        };


    return (
        <>
            <div
                style={{
                    position: "fixed",

                    top: "20px",

                    right: "20px",

                    zIndex: 3000,

                    width: "380px",

                    maxWidth:
                        "calc(100vw - 40px)",

                    display: "flex",

                    flexDirection:
                        "column",

                    gap: "10px",

                    pointerEvents: "none"
                }}
            >
                {notifications.map(
                    (
                        notification
                    ) => {
                        const style =
                            getNotificationStyle(
                                notification.type
                            );

                        return (
                            <div
                                key={
                                    notification.id
                                }

                                style={{
                                    position:
                                        "relative",

                                    display:
                                        "flex",

                                    alignItems:
                                        "flex-start",

                                    gap: "12px",

                                    padding:
                                        "15px 17px",

                                    background:
                                        "#ffffff",

                                    color:
                                        "#111827",

                                    border:
                                        "1px solid #e5e7eb",

                                    borderRadius:
                                        "15px",

                                    boxShadow:
                                        "0 10px 35px rgba(0, 0, 0, 0.16)",

                                    pointerEvents:
                                        "none",

                                    animation:
                                        "notificationAppear 0.25s ease-out",

                                    overflow:
                                        "hidden"
                                }}
                            >
                                {/* ================================= */}
                                {/* ICON */}
                                {/* ================================= */}

                                <div
                                    style={{
                                        width:
                                            "40px",

                                        height:
                                            "40px",

                                        minWidth:
                                            "40px",

                                        borderRadius:
                                            "50%",

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        background:
                                            style.iconBackground,

                                        color:
                                            style.iconColor,

                                        fontSize:
                                            "18px",

                                        fontWeight:
                                            "700",

                                        lineHeight:
                                            "1"
                                    }}
                                >
                                    {
                                        style.icon
                                    }
                                </div>


                                {/* ================================= */}
                                {/* CONTENT */}
                                {/* ================================= */}

                                <div
                                    style={{
                                        flex: 1,

                                        minWidth:
                                            0,

                                        paddingTop:
                                            "1px"
                                    }}
                                >
                                    {notification.title && (
                                        <div
                                            style={{
                                                fontSize:
                                                    "14px",

                                                fontWeight:
                                                    "700",

                                                color:
                                                    "#111827",

                                                lineHeight:
                                                    "1.35",

                                                marginBottom:
                                                    notification.message
                                                        ? "4px"
                                                        : "0"
                                            }}
                                        >
                                            {
                                                notification.title
                                            }
                                        </div>
                                    )}


                                    {notification.message && (
                                        <div
                                            style={{
                                                fontSize:
                                                    "14px",

                                                lineHeight:
                                                    "1.45",

                                                color:
                                                    "#4b5563",

                                                whiteSpace:
                                                    "pre-line",

                                                overflowWrap:
                                                    "anywhere"
                                            }}
                                        >
                                            {
                                                notification.message
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>


            {/* ===================================== */}
            {/* ANIMATIONS */}
            {/* ===================================== */}

            <style>
                {`
                    @keyframes notificationAppear {
                        from {
                            opacity: 0;
                            transform:
                                translateX(30px)
                                scale(0.96);
                        }

                        to {
                            opacity: 1;
                            transform:
                                translateX(0)
                                scale(1);
                        }
                    }

                    @media (max-width: 600px) {
                        .notification-container-mobile {
                            left: 15px;
                            right: 15px;
                            top: 15px;
                            width: auto;
                            max-width: none;
                        }
                    }
                `}
            </style>
        </>
    );
}


export default NotificationContainer;

