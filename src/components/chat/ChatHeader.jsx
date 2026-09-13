import {
    useEffect,
    useState
} from "react";

import {
    searchUsers
} from "../../services/api";


function ChatHeader({
    name,
    isGroup,
    members,
    currentUserId,
    creatorId,
    isGroupCreator,
    token,
    onAddGroupMember,
    onRemoveGroupMember,
    onDeleteChat,
    onBack
}) {
    const [showMenu, setShowMenu] =
        useState(false);

    const [showMembers, setShowMembers] =
        useState(false);

    const [showAddMember, setShowAddMember] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [searchResults, setSearchResults] =
        useState([]);

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [addingUserId, setAddingUserId] =
        useState(null);


    // ==========================================
    // SAFE MEMBERS
    // ==========================================

    const safeMembers =
        Array.isArray(members)
            ? members
            : [];


    // ==========================================
    // GET MEMBER ID
    // ==========================================

    const getMemberId = (
        member
    ) => {
        if (!member) {
            return 0;
        }

        return Number(
            member.id ??
            member.Id ??
            member.userId ??
            member.UserId ??
            member.user?.id ??
            member.user?.Id ??
            member.User?.id ??
            member.User?.Id ??
            0
        );
    };


    // ==========================================
    // GET MEMBER NICKNAME
    // ==========================================

    const getMemberNickname = (
        member,
        fallback = "Користувач"
    ) => {
        if (!member) {
            return fallback;
        }

        const nickname =
            member.nickname ??
            member.Nickname ??
            member.user?.nickname ??
            member.user?.Nickname ??
            member.User?.nickname ??
            member.User?.Nickname ??
            "";

        if (
            typeof nickname === "string" &&
            nickname.trim()
        ) {
            return nickname.trim();
        }

        return fallback;
    };


    // ==========================================
    // NORMALIZE MEMBER
    // ==========================================

    const normalizeMember = (
        member
    ) => {
        return {
            id:
                getMemberId(
                    member
                ),

            nickname:
                getMemberNickname(
                    member
                )
        };
    };


    // ==========================================
    // SEARCH USERS
    // ==========================================

    useEffect(() => {
        if (
            !showAddMember ||
            !token ||
            !search.trim()
        ) {
            setSearchResults([]);
            setSearchLoading(false);

            return;
        }

        let cancelled = false;

        const timeout =
            setTimeout(
                async () => {
                    try {
                        setSearchLoading(
                            true
                        );

                        const data =
                            await searchUsers(
                                token,
                                search.trim()
                            );

                        if (!cancelled) {
                            setSearchResults(
                                Array.isArray(data)
                                    ? data
                                    : []
                            );
                        }
                    } catch (error) {
                        if (!cancelled) {
                            console.error(
                                "Failed to search users:",
                                error
                            );

                            setSearchResults(
                                []
                            );
                        }
                    } finally {
                        if (!cancelled) {
                            setSearchLoading(
                                false
                            );
                        }
                    }
                },
                300
            );

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [
        showAddMember,
        token,
        search
    ]);


    // ==========================================
    // BACK
    // ==========================================

    const handleBack = () => {
        setShowMenu(false);
        setShowMembers(false);
        setShowAddMember(false);
        setSearch("");
        setSearchResults([]);

        if (onBack) {
            onBack();
        }
    };


    // ==========================================
    // DELETE CHAT
    // ==========================================

    const handleDeleteChat = async () => {
        setShowMenu(false);

        const message =
            isGroup
                ? `Видалити групу "${name}" для всіх учасників?`
                : `Видалити всю переписку з "${name}"?`;

        const confirmed =
            window.confirm(
                message
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
                "Не вдалося видалити чат."
            );
        }
    };


    // ==========================================
    // REMOVE MEMBER
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
            getMemberId(
                member
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
            getMemberNickname(
                member,
                "цього користувача"
            );

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
    // ADD MEMBER
    // ==========================================

    const handleAddMember = async (
        selectedUser
    ) => {
        if (
            !selectedUser ||
            !onAddGroupMember ||
            !isGroupCreator
        ) {
            return;
        }

        const selectedUserId =
            Number(
                selectedUser.id ??
                selectedUser.Id ??
                selectedUser.userId ??
                selectedUser.UserId
            );

        const currentId =
            Number(
                currentUserId
            );

        if (
            !selectedUserId ||
            selectedUserId === currentId
        ) {
            return;
        }

        const alreadyMember =
            safeMembers.some(
                (member) =>
                    getMemberId(
                        member
                    ) === selectedUserId
            );

        if (alreadyMember) {
            alert(
                "Цей користувач вже є учасником групи."
            );

            return;
        }

        try {
            setAddingUserId(
                selectedUserId
            );

            await onAddGroupMember(
                selectedUserId
            );

            setSearch("");
            setSearchResults([]);
            setShowAddMember(false);
        } catch (error) {
            console.error(
                "Failed to add group member:",
                error
            );

            alert(
                error.message ||
                "Не вдалося додати учасника."
            );
        } finally {
            setAddingUserId(
                null
            );
        }
    };


    // ==========================================
    // TOGGLE MEMBERS
    // ==========================================

    const handleToggleMembers = () => {
        setShowMembers(
            (value) => !value
        );

        setShowAddMember(
            false
        );

        setSearch("");
        setSearchResults([]);
    };


    // ==========================================
    // TOGGLE ADD MEMBER
    // ==========================================

    const handleToggleAddMember = () => {
        setShowAddMember(
            (value) => !value
        );

        setShowMembers(
            false
        );

        setSearch("");
        setSearchResults([]);
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
                borderBottom:
                    "1px solid #ddd",
                position: "relative",
                background: "#fff",
                zIndex: 20,
                boxSizing: "border-box"
            }}
        >

            {/* =====================================
                MOBILE BACK
            ====================================== */}

            <button
                type="button"
                onClick={
                    handleBack
                }
                aria-label="Назад до чатів"
                className="mobile-back-button"
                style={{
                    display: "none",
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    border: "none",
                    borderRadius: "50%",
                    background:
                        "transparent",
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
                        textOverflow:
                            "ellipsis",
                        whiteSpace:
                            "nowrap",
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
                        ? `Група • ${safeMembers.length} учасників`
                        : "Приватний чат"}
                </div>
            </div>


            {/* =====================================
                MENU
            ====================================== */}

            <div
                style={{
                    position: "relative",
                    flexShrink: 0
                }}
            >

                <button
                    type="button"
                    onClick={() => {
                        setShowMenu(
                            (value) =>
                                !value
                        );

                        setShowMembers(
                            false
                        );

                        setShowAddMember(
                            false
                        );

                        setSearch("");
                        setSearchResults([]);
                    }}
                    aria-label="Меню чату"
                    title="Меню"
                    style={{
                        width: "40px",
                        height: "40px",
                        border: "none",
                        borderRadius:
                            "50%",
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


                {showMenu && (
                    <div
                        style={{
                            position:
                                "absolute",
                            top: "46px",
                            right: "0",
                            width:
                                isGroup
                                    ? "300px"
                                    : "220px",
                            maxWidth:
                                "calc(100vw - 24px)",
                            background:
                                "#fff",
                            border:
                                "1px solid #ddd",
                            borderRadius:
                                "10px",
                            boxShadow:
                                "0 5px 20px rgba(0,0,0,0.15)",
                            overflow:
                                "hidden",
                            zIndex: 100
                        }}
                    >

                        {isGroup ? (
                            <>

                                {/* =================================
                                    MEMBERS
                                ================================== */}

                                <button
                                    type="button"
                                    onClick={
                                        handleToggleMembers
                                    }
                                    style={{
                                        width:
                                            "100%",
                                        border:
                                            "none",
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
                                        {
                                            safeMembers.length
                                        }
                                    </span>
                                </button>


                                {/* =================================
                                    ADD MEMBER
                                ================================== */}

                                {isGroupCreator && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleToggleAddMember
                                        }
                                        style={{
                                            width:
                                                "100%",
                                            border:
                                                "none",
                                            borderTop:
                                                "1px solid #eee",
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
                                                "14px"
                                        }}
                                    >
                                        ➕ Додати учасника
                                    </button>
                                )}


                                {/* =================================
                                    SEARCH
                                ================================== */}

                                {showAddMember && (
                                    <div
                                        style={{
                                            borderTop:
                                                "1px solid #eee",
                                            padding:
                                                "12px"
                                        }}
                                    >

                                        <input
                                            type="text"
                                            value={
                                                search
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSearch(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Пошук за nickname..."
                                            autoFocus
                                            style={{
                                                width:
                                                    "100%",
                                                boxSizing:
                                                    "border-box",
                                                padding:
                                                    "9px 10px",
                                                border:
                                                    "1px solid #ddd",
                                                borderRadius:
                                                    "8px",
                                                outline:
                                                    "none",
                                                fontSize:
                                                    "14px"
                                            }}
                                        />


                                        <div
                                            style={{
                                                marginTop:
                                                    "8px",
                                                maxHeight:
                                                    "220px",
                                                overflowY:
                                                    "auto"
                                            }}
                                        >

                                            {searchLoading ? (

                                                <div
                                                    style={{
                                                        padding:
                                                            "10px",
                                                        color:
                                                            "#777",
                                                        fontSize:
                                                            "13px"
                                                    }}
                                                >
                                                    Пошук...
                                                </div>

                                            ) : search.trim() &&
                                                searchResults.length ===
                                                    0 ? (

                                                <div
                                                    style={{
                                                        padding:
                                                            "10px",
                                                        color:
                                                            "#777",
                                                        fontSize:
                                                            "13px"
                                                    }}
                                                >
                                                    Користувачів не знайдено
                                                </div>

                                            ) : (

                                                searchResults.map(
                                                    (
                                                        result,
                                                        index
                                                    ) => {

                                                        const resultId =
                                                            Number(
                                                                result.id ??
                                                                result.Id ??
                                                                result.userId ??
                                                                result.UserId
                                                            );


                                                        // =================================
                                                        // NICKNAME SEARCH RESULT
                                                        // =================================

                                                        const nickname =
                                                            (
                                                                result.nickname ??
                                                                result.Nickname ??
                                                                result.user?.nickname ??
                                                                result.user?.Nickname ??
                                                                result.User?.nickname ??
                                                                result.User?.Nickname ??
                                                                ""
                                                            ).toString().trim() ||
                                                            "Користувач";


                                                        const current =
                                                            resultId ===
                                                            Number(
                                                                currentUserId
                                                            );


                                                        const alreadyMember =
                                                            safeMembers.some(
                                                                (
                                                                    member
                                                                ) =>
                                                                    getMemberId(
                                                                        member
                                                                    ) ===
                                                                    resultId
                                                            );


                                                        if (
                                                            current ||
                                                            alreadyMember
                                                        ) {
                                                            return null;
                                                        }


                                                        return (
                                                            <button
                                                                key={
                                                                    resultId ||
                                                                    index
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAddMember(
                                                                        result
                                                                    )
                                                                }
                                                                disabled={
                                                                    addingUserId ===
                                                                    resultId
                                                                }
                                                                style={{
                                                                    width:
                                                                        "100%",
                                                                    border:
                                                                        "none",
                                                                    background:
                                                                        "transparent",
                                                                    padding:
                                                                        "9px 6px",
                                                                    textAlign:
                                                                        "left",
                                                                    cursor:
                                                                        addingUserId ===
                                                                        resultId
                                                                            ? "default"
                                                                            : "pointer",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "10px",
                                                                    borderRadius:
                                                                        "7px",
                                                                    opacity:
                                                                        addingUserId ===
                                                                        resultId
                                                                            ? 0.6
                                                                            : 1,
                                                                    boxSizing:
                                                                        "border-box"
                                                                }}
                                                            >

                                                                {/* AVATAR */}

                                                                <div
                                                                    style={{
                                                                        width:
                                                                            "32px",
                                                                        height:
                                                                            "32px",
                                                                        minWidth:
                                                                            "32px",
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
                                                                        fontWeight:
                                                                            "600",
                                                                        flexShrink:
                                                                            0
                                                                    }}
                                                                >
                                                                    {nickname
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>


                                                                {/* NICKNAME */}

                                                                <span
                                                                    style={{
                                                                        flex:
                                                                            1,
                                                                        minWidth:
                                                                            0,
                                                                        overflow:
                                                                            "hidden",
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                        fontSize:
                                                                            "14px",
                                                                        color:
                                                                            "#333",
                                                                        fontWeight:
                                                                            "500",
                                                                        display:
                                                                            "block",
                                                                        visibility:
                                                                            "visible",
                                                                        opacity:
                                                                            1
                                                                    }}
                                                                >
                                                                    {
                                                                        nickname
                                                                    }
                                                                </span>


                                                                {/* ADD */}

                                                                <span
                                                                    style={{
                                                                        marginLeft:
                                                                            "auto",
                                                                        color:
                                                                            "#7650c7",
                                                                        fontSize:
                                                                            "22px",
                                                                        lineHeight:
                                                                            "1",
                                                                        flexShrink:
                                                                            0
                                                                    }}
                                                                >
                                                                    {addingUserId ===
                                                                    resultId
                                                                        ? "..."
                                                                        : "+"}
                                                                </span>

                                                            </button>
                                                        );
                                                    }
                                                )
                                            )}

                                        </div>
                                    </div>
                                )}


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

                                                    const normalizedMember =
                                                        normalizeMember(
                                                            member
                                                        );

                                                    const memberId =
                                                        normalizedMember.id;

                                                    const nickname =
                                                        normalizedMember.nickname;

                                                    const isCurrentUser =
                                                        memberId ===
                                                        Number(
                                                            currentUserId
                                                        );

                                                    const isCreator =
                                                        memberId ===
                                                        Number(
                                                            creatorId
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


                                                            {/* NICKNAME */}

                                                            <div
                                                                style={{
                                                                    flex:
                                                                        1,
                                                                    minWidth:
                                                                        0,
                                                                    overflow:
                                                                        "hidden"
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "14px",
                                                                        fontWeight:
                                                                            "500",
                                                                        color:
                                                                            "#333",
                                                                        overflow:
                                                                            "hidden",
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                        display:
                                                                            "block"
                                                                    }}
                                                                >
                                                                    {
                                                                        nickname
                                                                    }
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


                                                            {/* CREATOR */}

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


                                                            {/* REMOVE */}

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


                                {/* =================================
                                    DELETE GROUP
                                ================================== */}

                                {isGroupCreator && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleDeleteChat
                                        }
                                        style={{
                                            width:
                                                "100%",
                                            border:
                                                "none",
                                            borderTop:
                                                "1px solid #eee",
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
                                        🗑️ Видалити групу
                                    </button>
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
                                    width:
                                        "100%",
                                    border:
                                        "none",
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
                MOBILE
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