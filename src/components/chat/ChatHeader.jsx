import { useState } from "react";

function ChatHeader({
    name,
    isGroup,
    members,
    currentUserId,
    isGroupCreator,
    onRemoveGroupMember,
    onDeleteChat,
    onBack
}) {
    const [showMenu, setShowMenu] =
        useState(false);

    const [showMembers, setShowMembers] =
        useState(false);

    const safeMembers =
        Array.isArray(members)
            ? members
            : [];

    const handleBack = () => {
        setShowMenu(false);
        setShowMembers(false);

        if (onBack) {
            onBack();
        }
    };


    // ==========================================
    // DELETE PRIVATE CHAT
    // ==========================================

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


    // ==========================================
    // REMOVE GROUP MEMBER
    // ==========================================

    const handleRemoveMember = async (
        member
    ) => {
        if (
            !member ||
            !onRemoveGroupMember
        ) {
            return;
        }

        const memberId =
            Number(
                member.id ??
                member.userId ??
                member.UserId
            );

        const currentId =
            Number(
                currentUserId
            );

        if (
            !memberId ||
            memberId === currentId
        ) {
            return;
        }

        const nickname =
            member.nickname ??
            member.Nickname ??
            "цього користувача";

        const confirmed =
            window.confirm(
                `Видалити "${nickname}" з групи?`
            );

        if (!confirmed) {
            return;
        }

        try {
            await onRemoveGroupMember(
                memberId
            );
        } catch (error) {
            console.error(
                "Failed to remove group member:",
                error
            );
        }
    };


    // ==========================================
    // TOGGLE GROUP MEMBERS
    // ==========================================

    const handleToggleMembers = () => {
        setShowMembers(
            (value) => !value
        );
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
                zIndex: 20,
                boxSizing: "border-box"
            }}
        >

            {/* =====================================
                MOBILE BACK BUTTON
            ====================================== */}

            <button
                type="button"
                onClick={handleBack}
                aria-label="Назад до чатів"
                className="mobile-back-button"
                style={{
                    display: "none",
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    border: "none",
                    borderRadius: "50%",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "25px",
                    lineHeight: "1",
                    color: "#333",
                    padding: 0
                }}
            >
                ←
            </button>


            {/* =====================================
                AVATAR
            ====================================== */}

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
                    fontWeight: "bold",
                    fontSize: "17px"
                }}
            >
                {name
                    ?.charAt(0)
                    .toUpperCase()}
            </div>


            {/* =====================================
                CHAT NAME
            ====================================== */}

            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        fontWeight: "600",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "15px"
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


            {/* =====================================
                CHAT MENU
            ====================================== */}

            <div
                style={{
                    position: "relative",
                    flexShrink: 0
                }}
            >

                {/* =================================
                    MENU BUTTON
                ================================== */}

                <button
                    type="button"
                    onClick={() => {
                        setShowMenu(
                            (value) => !value
                        );

                        setShowMembers(false);
                    }}
                    aria-label="Меню чату"
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
                        color: "#555",
                        padding: 0
                    }}
                >
                    ⋮
                </button>


                {/* =================================
                    DROPDOWN MENU
                ================================== */}

                {showMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: "46px",
                            right: "0",
                            minWidth: isGroup
                                ? "260px"
                                : "220px",
                            maxWidth:
                                "calc(100vw - 24px)",
                            background: "#fff",
                            border:
                                "1px solid #ddd",
                            borderRadius: "10px",
                            boxShadow:
                                "0 5px 20px rgba(0,0,0,0.15)",
                            overflow: "hidden",
                            zIndex: 100
                        }}
                    >

                        {/* =================================
                            GROUP
                        ================================== */}

                        {isGroup ? (
                            <>
                                <button
                                    type="button"
                                    onClick={
                                        handleToggleMembers
                                    }
                                    style={{
                                        width: "100%",
                                        border: "none",
                                        background:
                                            "transparent",
                                        padding:
                                            "12px 16px",
                                        textAlign:
                                            "left",
                                        cursor:
                                            "pointer",
                                        color:
                                            "#333",
                                        fontSize:
                                            "14px",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between"
                                    }}
                                >
                                    <span>
                                        👥 Учасники
                                    </span>

                                    <span
                                        style={{
                                            color:
                                                "#777",
                                            fontSize:
                                                "12px"
                                        }}
                                    >
                                        {safeMembers.length}
                                    </span>
                                </button>


                                {/* =================================
                                    MEMBERS LIST
                                ================================== */}

                                {showMembers && (
                                    <div
                                        style={{
                                            borderTop:
                                                "1px solid #eee",
                                            maxHeight:
                                                "320px",
                                            overflowY:
                                                "auto"
                                        }}
                                    >

                                        {safeMembers.length ===
                                            0 ? (
                                            <div
                                                style={{
                                                    padding:
                                                        "14px 16px",
                                                    color:
                                                        "#777",
                                                    fontSize:
                                                        "14px"
                                                }}
                                            >
                                                Немає учасників
                                            </div>
                                        ) : (
                                            safeMembers.map(
                                                (
                                                    member,
                                                    index
                                                ) => {
                                                    const memberId =
                                                        Number(
                                                            member.id ??
                                                            member.userId ??
                                                            member.UserId
                                                        );

                                                    const nickname =
                                                        member.nickname ??
                                                        member.Nickname ??
                                                        "Користувач";

                                                    const isCurrentUser =
                                                        memberId ===
                                                        Number(
                                                            currentUserId
                                                        );

                                                    const isCreator =
                                                        memberId ===
                                                        Number(
                                                            members.find(
                                                                (
                                                                    item
                                                                ) =>
                                                                    Boolean(
                                                                        item.isCreator
                                                                    )
                                                            )?.id ??
                                                            members.find(
                                                                (
                                                                    item
                                                                ) =>
                                                                    Boolean(
                                                                        item.isCreator
                                                                    )
                                                            )?.userId
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                memberId ||
                                                                index
                                                            }
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "10px",
                                                                padding:
                                                                    "10px 12px",
                                                                borderBottom:
                                                                    index <
                                                                    safeMembers.length -
                                                                        1
                                                                        ? "1px solid #f0f0f0"
                                                                        : "none"
                                                            }}
                                                        >

                                                            {/* AVATAR */}

                                                            <div
                                                                style={{
                                                                    width:
                                                                        "34px",
                                                                    height:
                                                                        "34px",
                                                                    minWidth:
                                                                        "34px",
                                                                    borderRadius:
                                                                        "50%",
                                                                    background:
                                                                        "#e0e0e0",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    fontSize:
                                                                        "14px",
                                                                    fontWeight:
                                                                        "600"
                                                                }}
                                                            >
                                                                {nickname
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>


                                                            {/* NAME */}

                                                            <div
                                                                style={{
                                                                    flex:
                                                                        1,
                                                                    minWidth:
                                                                        0
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "14px",
                                                                        fontWeight:
                                                                            "500",
                                                                        overflow:
                                                                            "hidden",
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                        whiteSpace:
                                                                            "nowrap"
                                                                    }}
                                                                >
                                                                    {nickname}
                                                                </div>

                                                                {isCurrentUser && (
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            color:
                                                                                "#888",
                                                                            marginTop:
                                                                                "2px"
                                                                        }}
                                                                    >
                                                                        Ви
                                                                    </div>
                                                                )}
                                                            </div>


                                                            {/* CREATOR BADGE */}

                                                            {isCreator && (
                                                                <span
                                                                    style={{
                                                                        fontSize:
                                                                            "11px",
                                                                        color:
                                                                            "#777",
                                                                        whiteSpace:
                                                                            "nowrap"
                                                                    }}
                                                                >
                                                                    Creator
                                                                </span>
                                                            )}


                                                            {/* REMOVE BUTTON */}

                                                            {isGroupCreator &&
                                                                !isCurrentUser &&
                                                                !isCreator && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveMember(
                                                                                member
                                                                            )
                                                                        }
                                                                        title="Видалити з групи"
                                                                        style={{
                                                                            border:
                                                                                "none",
                                                                            background:
                                                                                "transparent",
                                                                            color:
                                                                                "#d32f2f",
                                                                            cursor:
                                                                                "pointer",
                                                                            fontSize:
                                                                                "16px",
                                                                            padding:
                                                                                "6px",
                                                                            borderRadius:
                                                                                "6px"
                                                                        }}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                )}
                                                        </div>
                                                    );
                                                }
                                            )
                                        )}

                                    </div>
                                )}
                            </>
                        ) : (

                            /* =================================
                                PRIVATE CHAT
                            ================================== */

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
                                    textAlign:
                                        "left",
                                    cursor:
                                        "pointer",
                                    color:
                                        "#d32f2f",
                                    fontSize:
                                        "14px"
                                }}
                            >
                                🗑️ Видалити переписку
                            </button>
                        )}

                    </div>
                )}
            </div>


            {/* =====================================
                MOBILE STYLES
            ====================================== */}

            <style>
                {`
                    @media (max-width: 768px) {
                        .mobile-back-button {
                            display: flex !important;
                            align-items: center;
                            justify-content: center;
                        }

                        .mobile-back-button:active {
                            background: #f0f0f0 !important;
                        }
                    }
                `}
            </style>
        </header>
    );
}

export default ChatHeader;