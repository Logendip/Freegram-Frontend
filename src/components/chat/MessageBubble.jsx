import {
    useEffect,
    useRef,
    useState
} from "react";

function MessageBubble({
    message,
    currentUserId,
    onDeleteForEveryone,
    onDeleteForMe
}) {
    const [showMenu, setShowMenu] =
        useState(false);

    const [
        menuPlacement,
        setMenuPlacement
    ] = useState("above");

    const bubbleRef =
        useRef(null);

    const isOwn =
        Number(message.sender?.id) ===
        Number(currentUserId);


    // ==========================================
    // DETERMINE MENU POSITION
    // ==========================================

    useEffect(() => {
        if (!showMenu) {
            return;
        }

        const updateMenuPlacement =
            () => {
                if (
                    !bubbleRef.current
                ) {
                    return;
                }

                const bubble =
                    bubbleRef.current;

                const rect =
                    bubble.getBoundingClientRect();

                // Знаходимо найближчий scroll-контейнер.
                // У нашому випадку це MessageList.
                let scrollParent =
                    bubble.parentElement;

                while (
                    scrollParent &&
                    scrollParent !==
                        document.body
                ) {
                    const style =
                        window.getComputedStyle(
                            scrollParent
                        );

                    const overflowY =
                        style.overflowY;

                    if (
                        overflowY ===
                            "auto" ||
                        overflowY ===
                            "scroll"
                    ) {
                        break;
                    }

                    scrollParent =
                        scrollParent.parentElement;
                }

                let containerTop = 0;
                let containerBottom =
                    window.innerHeight;

                if (
                    scrollParent &&
                    scrollParent !==
                        document.body
                ) {
                    const containerRect =
                        scrollParent.getBoundingClientRect();

                    containerTop =
                        containerRect.top;

                    containerBottom =
                        containerRect.bottom;
                }

                // Приблизна висота меню.
                const menuHeight = 55;

                // Відступ від bubble до меню.
                const menuGap = 6;

                const spaceAbove =
                    rect.top -
                    containerTop;

                const spaceBelow =
                    containerBottom -
                    rect.bottom;

                // Якщо зверху недостатньо місця,
                // відкриваємо меню вниз.
                if (
                    spaceAbove <
                    menuHeight + menuGap
                ) {
                    setMenuPlacement(
                        "below"
                    );
                    return;
                }

                // Якщо знизу недостатньо місця,
                // відкриваємо меню вгору.
                if (
                    spaceBelow <
                    menuHeight + menuGap
                ) {
                    setMenuPlacement(
                        "above"
                    );
                    return;
                }

                // Якщо місця достатньо з обох боків —
                // відкриваємо вгору.
                setMenuPlacement(
                    "above"
                );
            };

        updateMenuPlacement();

        window.addEventListener(
            "resize",
            updateMenuPlacement
        );

        return () => {
            window.removeEventListener(
                "resize",
                updateMenuPlacement
            );
        };
    }, [showMenu]);


    // ==========================================
    // DELETE MESSAGE
    // ==========================================

    const handleDelete = async () => {
        setShowMenu(false);

        try {
            if (isOwn) {
                if (
                    onDeleteForEveryone
                ) {
                    await onDeleteForEveryone(
                        message
                    );
                }
            } else {
                if (onDeleteForMe) {
                    await onDeleteForMe(
                        message
                    );
                }
            }
        } catch (error) {
            console.error(
                "Failed to delete message:",
                error
            );
        }
    };


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div
            style={{
                display: "flex",
                justifyContent: isOwn
                    ? "flex-end"
                    : "flex-start",
                marginBottom: "8px",
                position: "relative"
            }}
        >
            <div
                ref={bubbleRef}
                style={{
                    position:
                        "relative",
                    maxWidth: "70%"
                }}
            >
                {/* MESSAGE BUBBLE */}

                <div
                    style={{
                        padding:
                            "9px 12px",
                        borderRadius:
                            "12px",
                        background:
                            isOwn
                                ? "#d9fdd3"
                                : "#f0f0f0"
                    }}
                >
                    {!isOwn && (
                        <div
                            style={{
                                fontSize:
                                    "13px",
                                fontWeight:
                                    "600",
                                marginBottom:
                                    "3px"
                            }}
                        >
                            {
                                message
                                    .sender
                                    ?.nickname
                            }
                        </div>
                    )}

                    <div
                        style={{
                            wordBreak:
                                "break-word",
                            paddingRight:
                                isOwn
                                    ? "20px"
                                    : "0"
                        }}
                    >
                        {
                            message.content
                        }
                    </div>

                    {/* TIME + MENU */}

                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "flex-end",
                            gap: "5px",
                            fontSize:
                                "11px",
                            color:
                                "#777",
                            marginTop:
                                "4px"
                        }}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setShowMenu(
                                    (value) =>
                                        !value
                                )
                            }
                            title="Меню"
                            style={{
                                border:
                                    "none",
                                background:
                                    "transparent",
                                padding:
                                    "0",
                                margin:
                                    "0",
                                cursor:
                                    "pointer",
                                color:
                                    "#777",
                                fontSize:
                                    "16px",
                                lineHeight:
                                    "12px"
                            }}
                        >
                            ⋮
                        </button>

                        <span>
                            {new Date(
                                message.createdAt
                            ).toLocaleTimeString(
                                [],
                                {
                                    hour:
                                        "2-digit",
                                    minute:
                                        "2-digit"
                                }
                            )}
                        </span>
                    </div>
                </div>


                {/* ==================================
                    DELETE MENU
                ================================== */}

                {showMenu && (
                    <div
                        style={{
                            position:
                                "absolute",

                            right: "0",

                            ...(menuPlacement ===
                            "above"
                                ? {
                                      bottom:
                                          "calc(100% + 6px)"
                                  }
                                : {
                                      top:
                                          "calc(100% + 6px)"
                                  }),

                            minWidth:
                                "210px",

                            background:
                                "#fff",

                            border:
                                "1px solid #ddd",

                            borderRadius:
                                "9px",

                            boxShadow:
                                "0 6px 20px rgba(0,0,0,0.16)",

                            overflow:
                                "hidden",

                            // Меню має бути вище
                            // інших елементів.
                            zIndex: 1000
                        }}
                    >
                        <button
                            type="button"
                            onClick={
                                handleDelete
                            }
                            style={{
                                width:
                                    "100%",
                                border:
                                    "none",
                                background:
                                    "#fff",
                                padding:
                                    "11px 14px",
                                textAlign:
                                    "left",
                                cursor:
                                    "pointer",
                                color:
                                    "#d32f2f",
                                fontSize:
                                    "14px"
                            }}
                            onMouseEnter={(
                                event
                            ) => {
                                event.currentTarget.style.background =
                                    "#fef2f2";
                            }}
                            onMouseLeave={(
                                event
                            ) => {
                                event.currentTarget.style.background =
                                    "#fff";
                            }}
                        >
                            🗑{" "}
                            {isOwn
                                ? "Видалити для всіх"
                                : "Видалити для мене"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessageBubble;