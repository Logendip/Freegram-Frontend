import {
    useEffect,
    useState
} from "react";

import ChatList from "./ChatList";

import {
    searchUsers,
    createGroupChat
} from "../../services/api";


function ChatSidebar({
    chats = [],
    selectedChat,
    getChatName,
    onSelectChat,
    token,
    currentUserId,
    onSelectUser,
    onGroupCreated
}) {
    const [search, setSearch] =
        useState("");

    const [users, setUsers] =
        useState([]);

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [searchError, setSearchError] =
        useState("");

    const [showGroupModal, setShowGroupModal] =
        useState(false);

    const [groupName, setGroupName] =
        useState("");

    const [groupSearch, setGroupSearch] =
        useState("");

    const [groupUsers, setGroupUsers] =
        useState([]);

    const [selectedUsers, setSelectedUsers] =
        useState([]);

    const [groupSearchLoading, setGroupSearchLoading] =
        useState(false);

    const [groupSearchError, setGroupSearchError] =
        useState("");

    const [groupCreating, setGroupCreating] =
        useState(false);

    const [groupCreateError, setGroupCreateError] =
        useState("");


    // ==========================================
    // SAFE CHATS
    // ==========================================

    const safeChats =
        Array.isArray(chats)
            ? chats
            : [];


    // ==========================================
    // FILTER CHATS
    // ==========================================

    const filteredChats =
        safeChats.filter((chat) => {
            const chatName =
                getChatName?.(chat) || "";

            return chatName
                .toLowerCase()
                .includes(
                    search
                        .toLowerCase()
                        .trim()
                );
        });


    // ==========================================
    // SEARCH USERS
    // ==========================================

    useEffect(() => {
        const query =
            search.trim();

        if (!query) {
            setUsers([]);
            setSearchError("");
            setSearchLoading(false);

            return;
        }

        const timeoutId =
            setTimeout(
                async () => {
                    try {
                        setSearchLoading(true);
                        setSearchError("");

                        const result =
                            await searchUsers(
                                token,
                                query
                            );

                        const safeUsers =
                            Array.isArray(result)
                                ? result
                                : [];

                        const filteredUsers =
                            safeUsers.filter(
                                (foundUser) =>
                                    Number(
                                        foundUser.id
                                    ) !==
                                    Number(
                                        currentUserId
                                    )
                            );

                        setUsers(
                            filteredUsers
                        );
                    } catch (error) {
                        console.error(
                            "Failed to search users:",
                            error
                        );

                        setUsers([]);

                        setSearchError(
                            "Не вдалося виконати пошук."
                        );
                    } finally {
                        setSearchLoading(false);
                    }
                },
                300
            );

        return () =>
            clearTimeout(timeoutId);
    }, [
        search,
        token,
        currentUserId
    ]);


    // ==========================================
    // SEARCH USERS FOR GROUP
    // ==========================================

    useEffect(() => {
        if (!showGroupModal) {
            return;
        }

        const query =
            groupSearch.trim();

        if (!query) {
            setGroupUsers([]);
            setGroupSearchError("");
            setGroupSearchLoading(false);

            return;
        }

        const timeoutId =
            setTimeout(
                async () => {
                    try {
                        setGroupSearchLoading(
                            true
                        );

                        setGroupSearchError("");

                        const result =
                            await searchUsers(
                                token,
                                query
                            );

                        const safeUsers =
                            Array.isArray(result)
                                ? result
                                : [];

                        const filteredUsers =
                            safeUsers.filter(
                                (foundUser) => {
                                    const userId =
                                        Number(
                                            foundUser.id
                                        );

                                    if (
                                        userId ===
                                        Number(
                                            currentUserId
                                        )
                                    ) {
                                        return false;
                                    }

                                    return true;
                                }
                            );

                        setGroupUsers(
                            filteredUsers
                        );
                    } catch (error) {
                        console.error(
                            "Failed to search group users:",
                            error
                        );

                        setGroupUsers([]);

                        setGroupSearchError(
                            "Не вдалося виконати пошук."
                        );
                    } finally {
                        setGroupSearchLoading(
                            false
                        );
                    }
                },
                300
            );

        return () =>
            clearTimeout(timeoutId);
    }, [
        groupSearch,
        token,
        currentUserId,
        showGroupModal
    ]);


    // ==========================================
    // OPEN GROUP MODAL
    // ==========================================

    const openGroupModal =
        () => {
            setShowGroupModal(true);

            setGroupName("");
            setGroupSearch("");
            setGroupUsers([]);
            setSelectedUsers([]);
            setGroupSearchError("");
            setGroupCreateError("");
        };


    // ==========================================
    // CLOSE GROUP MODAL
    // ==========================================

    const closeGroupModal =
        () => {
            if (groupCreating) {
                return;
            }

            setShowGroupModal(false);

            setGroupName("");
            setGroupSearch("");
            setGroupUsers([]);
            setSelectedUsers([]);
            setGroupSearchError("");
            setGroupCreateError("");
        };


    // ==========================================
    // TOGGLE GROUP USER
    // ==========================================

    const toggleGroupUser =
        (foundUser) => {
            if (!foundUser) {
                return;
            }

            const userId =
                Number(
                    foundUser.id
                );

            setSelectedUsers(
                (previousUsers) => {
                    const exists =
                        previousUsers.some(
                            (user) =>
                                Number(
                                    user.id
                                ) ===
                                userId
                        );

                    if (exists) {
                        return previousUsers.filter(
                            (user) =>
                                Number(
                                    user.id
                                ) !==
                                userId
                        );
                    }

                    return [
                        ...previousUsers,
                        foundUser
                    ];
                }
            );
        };


    // ==========================================
    // CREATE GROUP
    // ==========================================

    const handleCreateGroup =
        async () => {
            const trimmedName =
                groupName.trim();

            if (!trimmedName) {
                setGroupCreateError(
                    "Введіть назву групи."
                );

                return;
            }

            if (
                selectedUsers.length === 0
            ) {
                setGroupCreateError(
                    "Оберіть хоча б одного учасника."
                );

                return;
            }

            if (!token) {
                setGroupCreateError(
                    "Користувач не авторизований."
                );

                return;
            }

            try {
                setGroupCreating(true);
                setGroupCreateError("");

                const userIds =
                    selectedUsers.map(
                        (selectedUser) =>
                            Number(
                                selectedUser.id
                            )
                    );

                const result =
                    await createGroupChat(
                        token,
                        trimmedName,
                        userIds
                    );

                const createdChat =
                    result?.chat;

                if (!createdChat) {
                    throw new Error(
                        "Групу не було створено."
                    );
                }

                setShowGroupModal(false);

                setGroupName("");
                setGroupSearch("");
                setGroupUsers([]);
                setSelectedUsers([]);
                setGroupSearchError("");
                setGroupCreateError("");

                if (onGroupCreated) {
                    await onGroupCreated(
                        createdChat
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to create group:",
                    error
                );

                setGroupCreateError(
                    error.message ||
                    "Не вдалося створити групу."
                );
            } finally {
                setGroupCreating(false);
            }
        };


    const hasSearch =
        search.trim().length > 0;


    const hasGroupSearch =
        groupSearch.trim().length > 0;


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <aside
            className="freegram-chat-sidebar"
            style={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                borderRight:
                    "1px solid #e5e7eb",
                boxSizing: "border-box",
                overflow: "hidden"
            }}
        >
            <div
                style={{
                    padding:
                        "20px 18px 16px",
                    flexShrink: 0,
                    background: "#ffffff"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        marginBottom: "16px"
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "22px",
                            fontWeight: "700",
                            color: "#1f2937",
                            letterSpacing:
                                "-0.3px"
                        }}
                    >
                        Чати
                    </h2>

                    <button
                        type="button"
                        onClick={
                            openGroupModal
                        }
                        title="Створити групу"
                        style={{
                            width: "34px",
                            height: "34px",
                            borderRadius:
                                "10px",
                            border: "none",
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            background:
                                "linear-gradient(135deg, #7c3aed, #6366f1)",
                            color:
                                "#ffffff",
                            fontSize:
                                "23px",
                            fontWeight:
                                "400",
                            lineHeight: 1,
                            cursor:
                                "pointer",
                            boxShadow:
                                "0 4px 10px rgba(99,102,241,0.22)",
                            transition:
                                "transform 0.15s ease, box-shadow 0.15s ease"
                        }}
                        onMouseEnter={(
                            event
                        ) => {
                            event.currentTarget.style.transform =
                                "translateY(-1px)";

                            event.currentTarget.style.boxShadow =
                                "0 6px 14px rgba(99,102,241,0.28)";
                        }}
                        onMouseLeave={(
                            event
                        ) => {
                            event.currentTarget.style.transform =
                                "translateY(0)";

                            event.currentTarget.style.boxShadow =
                                "0 4px 10px rgba(99,102,241,0.22)";
                        }}
                    >
                        +
                    </button>
                </div>

                <div
                    style={{
                        position: "relative"
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            left: "13px",
                            top: "50%",
                            transform:
                                "translateY(-50%)",
                            color: "#9ca3af",
                            fontSize: "15px",
                            pointerEvents:
                                "none",
                            zIndex: 1
                        }}
                    >
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Пошук"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            height: "42px",
                            boxSizing:
                                "border-box",
                            padding:
                                "0 14px 0 38px",
                            border:
                                "1px solid #e5e7eb",
                            borderRadius:
                                "12px",
                            outline: "none",
                            background:
                                "#f3f4f6",
                            color: "#1f2937",
                            fontSize: "14px",
                            transition:
                                "all 0.2s ease"
                        }}
                        onFocus={(event) => {
                            event.currentTarget.style.background =
                                "#ffffff";

                            event.currentTarget.style.borderColor =
                                "#a78bfa";

                            event.currentTarget.style.boxShadow =
                                "0 0 0 3px rgba(124,58,237,0.10)";
                        }}
                        onBlur={(event) => {
                            event.currentTarget.style.background =
                                "#f3f4f6";

                            event.currentTarget.style.borderColor =
                                "#e5e7eb";

                            event.currentTarget.style.boxShadow =
                                "none";
                        }}
                    />
                </div>
            </div>

            <div
                className="freegram-sidebar-content"
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding:
                        "4px 10px 14px",
                    boxSizing:
                        "border-box"
                }}
            >
                {hasSearch ? (
                    <>
                        <div
                            style={{
                                padding:
                                    "10px 8px 8px",
                                fontSize:
                                    "11px",
                                fontWeight:
                                    "700",
                                color:
                                    "#9ca3af",
                                textTransform:
                                    "uppercase",
                                letterSpacing:
                                    "0.6px"
                            }}
                        >
                            Користувачі
                        </div>

                        {searchLoading && (
                            <div
                                style={{
                                    padding:
                                        "22px 8px",
                                    color:
                                        "#9ca3af",
                                    fontSize:
                                        "14px",
                                    textAlign:
                                        "center"
                                }}
                            >
                                Пошук...
                            </div>
                        )}

                        {!searchLoading &&
                            searchError && (
                                <div
                                    style={{
                                        margin:
                                            "4px 0",
                                        padding:
                                            "12px",
                                        borderRadius:
                                            "10px",
                                        background:
                                            "#fef2f2",
                                        color:
                                            "#dc2626",
                                        fontSize:
                                            "13px"
                                    }}
                                >
                                    {
                                        searchError
                                    }
                                </div>
                            )}

                        {!searchLoading &&
                            !searchError &&
                            users.length === 0 && (
                                <div
                                    style={{
                                        padding:
                                            "18px 8px",
                                        color:
                                            "#9ca3af",
                                        fontSize:
                                            "13px",
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    Користувачів не
                                    знайдено.
                                </div>
                            )}

                        {!searchLoading &&
                            users.map(
                                (foundUser) => (
                                    <button
                                        key={
                                            foundUser.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            onSelectUser(
                                                foundUser
                                            )
                                        }
                                        className="freegram-user-result"
                                        style={{
                                            width:
                                                "100%",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap:
                                                "11px",
                                            padding:
                                                "9px 8px",
                                            marginBottom:
                                                "3px",
                                            border:
                                                "none",
                                            borderRadius:
                                                "11px",
                                            background:
                                                "transparent",
                                            cursor:
                                                "pointer",
                                            textAlign:
                                                "left",
                                            boxSizing:
                                                "border-box",
                                            transition:
                                                "background 0.15s ease"
                                        }}
                                        onMouseEnter={(
                                            event
                                        ) => {
                                            event.currentTarget.style.background =
                                                "#f3f4f6";
                                        }}
                                        onMouseLeave={(
                                            event
                                        ) => {
                                            event.currentTarget.style.background =
                                                "transparent";
                                        }}
                                    >
                                        <div
                                            style={{
                                                width:
                                                    "46px",
                                                height:
                                                    "46px",
                                                minWidth:
                                                    "46px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    "linear-gradient(135deg, #8b5cf6, #6366f1)",
                                                color:
                                                    "#ffffff",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                fontWeight:
                                                    "700",
                                                fontSize:
                                                    "17px",
                                                boxShadow:
                                                    "0 2px 6px rgba(99,102,241,0.18)"
                                            }}
                                        >
                                            {foundUser
                                                .nickname
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </div>

                                        <div
                                            style={{
                                                minWidth:
                                                    0,
                                                flex: 1
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight:
                                                        "600",
                                                    color:
                                                        "#1f2937",
                                                    fontSize:
                                                        "14px",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap"
                                                }}
                                            >
                                                {
                                                    foundUser.nickname
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    fontSize:
                                                        "12px",
                                                    color:
                                                        "#9ca3af",
                                                    marginTop:
                                                        "4px",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap"
                                                }}
                                            >
                                                Відкрити чат
                                            </div>
                                        </div>

                                        <span
                                            style={{
                                                color:
                                                    "#c4b5fd",
                                                fontSize:
                                                    "18px"
                                            }}
                                        >
                                            ›
                                        </span>
                                    </button>
                                )
                            )}

                        <div
                            style={{
                                margin:
                                    "14px 8px 7px",
                                paddingTop:
                                    "14px",
                                borderTop:
                                    "1px solid #f0f0f0",
                                fontSize:
                                    "11px",
                                fontWeight:
                                    "700",
                                color:
                                    "#9ca3af",
                                textTransform:
                                    "uppercase",
                                letterSpacing:
                                    "0.6px"
                            }}
                        >
                            Ваші чати
                        </div>

                        {filteredChats.length > 0 ? (
                            <ChatList
                                chats={
                                    filteredChats
                                }
                                selectedChat={
                                    selectedChat
                                }
                                getChatName={
                                    getChatName
                                }
                                onSelectChat={
                                    onSelectChat
                                }
                            />
                        ) : (
                            <div
                                style={{
                                    padding:
                                        "18px 8px",
                                    color:
                                        "#9ca3af",
                                    fontSize:
                                        "13px",
                                    textAlign:
                                        "center"
                                }}
                            >
                                Чатів не знайдено.
                            </div>
                        )}
                    </>
                ) : (
                    <ChatList
                        chats={
                            filteredChats
                        }
                        selectedChat={
                            selectedChat
                        }
                        getChatName={
                            getChatName
                        }
                        onSelectChat={
                            onSelectChat
                        }
                    />
                )}
            </div>


            {/* ==================================
                CREATE GROUP MODAL
            ================================== */}

            {showGroupModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 2000,
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        padding: "20px",
                        background:
                            "rgba(15,23,42,0.45)",
                        backdropFilter:
                            "blur(4px)"
                    }}
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeGroupModal();
                        }
                    }}
                >
                    <div
                        style={{
                            width:
                                "min(460px, 100%)",
                            maxHeight:
                                "min(700px, calc(100vh - 40px))",
                            display:
                                "flex",
                            flexDirection:
                                "column",
                            background:
                                "#ffffff",
                            borderRadius:
                                "18px",
                            boxShadow:
                                "0 20px 60px rgba(0,0,0,0.22)",
                            overflow:
                                "hidden"
                        }}
                    >
                        {/* HEADER */}

                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "space-between",
                                padding:
                                    "18px 20px",
                                borderBottom:
                                    "1px solid #f0f0f0"
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize:
                                            "19px",
                                        fontWeight:
                                            "700",
                                        color:
                                            "#1f2937"
                                    }}
                                >
                                    Створити групу
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "4px",
                                        fontSize:
                                            "12px",
                                        color:
                                            "#9ca3af"
                                    }}
                                >
                                    Додайте учасників
                                    до нового чату
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeGroupModal
                                }
                                disabled={
                                    groupCreating
                                }
                                style={{
                                    width:
                                        "34px",
                                    height:
                                        "34px",
                                    border:
                                        "none",
                                    borderRadius:
                                        "10px",
                                    background:
                                        "#f3f4f6",
                                    color:
                                        "#6b7280",
                                    fontSize:
                                        "22px",
                                    lineHeight:
                                        1,
                                    cursor:
                                        groupCreating
                                            ? "default"
                                            : "pointer"
                                }}
                            >
                                ×
                            </button>
                        </div>


                        {/* CONTENT */}

                        <div
                            style={{
                                padding:
                                    "18px 20px",
                                overflowY:
                                    "auto",
                                flex: 1
                            }}
                        >
                            {/* GROUP NAME */}

                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "7px",
                                    fontSize:
                                        "13px",
                                    fontWeight:
                                        "600",
                                    color:
                                        "#374151"
                                }}
                            >
                                Назва групи
                            </label>

                            <input
                                type="text"
                                value={
                                    groupName
                                }
                                maxLength={
                                    100
                                }
                                disabled={
                                    groupCreating
                                }
                                onChange={(
                                    event
                                ) =>
                                    setGroupName(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Наприклад, Команда"
                                style={{
                                    width:
                                        "100%",
                                    height:
                                        "44px",
                                    boxSizing:
                                        "border-box",
                                    padding:
                                        "0 13px",
                                    border:
                                        "1px solid #e5e7eb",
                                    borderRadius:
                                        "11px",
                                    outline:
                                        "none",
                                    background:
                                        "#f9fafb",
                                    color:
                                        "#1f2937",
                                    fontSize:
                                        "14px"
                                }}
                            />


                            {/* SELECTED USERS */}

                            {selectedUsers.length >
                                0 && (
                                <div
                                    style={{
                                        marginTop:
                                            "16px"
                                    }}
                                >
                                    <div
                                        style={{
                                            marginBottom:
                                                "8px",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                "600",
                                            color:
                                                "#374151"
                                        }}
                                    >
                                        Учасники (
                                        {
                                            selectedUsers.length
                                        }
                                        )
                                    </div>

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            flexWrap:
                                                "wrap",
                                            gap:
                                                "7px"
                                        }}
                                    >
                                        {selectedUsers.map(
                                            (
                                                selectedUser
                                            ) => (
                                                <button
                                                    key={
                                                        selectedUser.id
                                                    }
                                                    type="button"
                                                    disabled={
                                                        groupCreating
                                                    }
                                                    onClick={() =>
                                                        toggleGroupUser(
                                                            selectedUser
                                                        )
                                                    }
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap:
                                                            "6px",
                                                        padding:
                                                            "6px 9px 6px 7px",
                                                        border:
                                                            "none",
                                                        borderRadius:
                                                            "20px",
                                                        background:
                                                            "#ede9fe",
                                                        color:
                                                            "#6d28d9",
                                                        cursor:
                                                            groupCreating
                                                                ? "default"
                                                                : "pointer",
                                                        fontSize:
                                                            "12px",
                                                        fontWeight:
                                                            "600"
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width:
                                                                "24px",
                                                            height:
                                                                "24px",
                                                            borderRadius:
                                                                "50%",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            background:
                                                                "#8b5cf6",
                                                            color:
                                                                "#ffffff",
                                                            fontSize:
                                                                "11px"
                                                        }}
                                                    >
                                                        {selectedUser
                                                            .nickname
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </span>

                                                    {
                                                        selectedUser.nickname
                                                    }

                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "15px",
                                                            opacity:
                                                                0.65
                                                        }}
                                                    >
                                                        ×
                                                    </span>
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* USER SEARCH */}

                            <div
                                style={{
                                    marginTop:
                                        "18px"
                                }}
                            >
                                <label
                                    style={{
                                        display:
                                            "block",
                                        marginBottom:
                                            "7px",
                                        fontSize:
                                            "13px",
                                        fontWeight:
                                            "600",
                                        color:
                                            "#374151"
                                    }}
                                >
                                    Додати учасників
                                </label>

                                <div
                                    style={{
                                        position:
                                            "relative"
                                    }}
                                >
                                    <span
                                        style={{
                                            position:
                                                "absolute",
                                            left:
                                                "13px",
                                            top:
                                                "50%",
                                            transform:
                                                "translateY(-50%)",
                                            color:
                                                "#9ca3af",
                                            fontSize:
                                                "14px",
                                            pointerEvents:
                                                "none"
                                        }}
                                    >
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        value={
                                            groupSearch
                                        }
                                        disabled={
                                            groupCreating
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setGroupSearch(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Пошук користувача"
                                        style={{
                                            width:
                                                "100%",
                                            height:
                                                "42px",
                                            boxSizing:
                                                "border-box",
                                            padding:
                                                "0 13px 0 37px",
                                            border:
                                                "1px solid #e5e7eb",
                                            borderRadius:
                                                "11px",
                                            outline:
                                                "none",
                                            background:
                                                "#f9fafb",
                                            color:
                                                "#1f2937",
                                            fontSize:
                                                "14px"
                                        }}
                                    />
                                </div>
                            </div>


                            {/* SEARCH RESULTS */}

                            {hasGroupSearch && (
                                <div
                                    style={{
                                        marginTop:
                                            "8px"
                                    }}
                                >
                                    {groupSearchLoading && (
                                        <div
                                            style={{
                                                padding:
                                                    "18px",
                                                textAlign:
                                                    "center",
                                                color:
                                                    "#9ca3af",
                                                fontSize:
                                                    "13px"
                                            }}
                                        >
                                            Пошук...
                                        </div>
                                    )}

                                    {!groupSearchLoading &&
                                        groupSearchError && (
                                            <div
                                                style={{
                                                    padding:
                                                        "10px",
                                                    borderRadius:
                                                        "9px",
                                                    background:
                                                        "#fef2f2",
                                                    color:
                                                        "#dc2626",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                {
                                                    groupSearchError
                                                }
                                            </div>
                                        )}

                                    {!groupSearchLoading &&
                                        !groupSearchError &&
                                        groupUsers.length ===
                                            0 && (
                                            <div
                                                style={{
                                                    padding:
                                                        "18px",
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#9ca3af",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                Користувачів
                                                не
                                                знайдено.
                                            </div>
                                        )}

                                    {!groupSearchLoading &&
                                        !groupSearchError &&
                                        groupUsers.map(
                                            (
                                                foundUser
                                            ) => {
                                                const isSelected =
                                                    selectedUsers.some(
                                                        (
                                                            selectedUser
                                                        ) =>
                                                            Number(
                                                                selectedUser.id
                                                            ) ===
                                                            Number(
                                                                foundUser.id
                                                            )
                                                    );

                                                return (
                                                    <button
                                                        key={
                                                            foundUser.id
                                                        }
                                                        type="button"
                                                        disabled={
                                                            groupCreating
                                                        }
                                                        onClick={() =>
                                                            toggleGroupUser(
                                                                foundUser
                                                            )
                                                        }
                                                        style={{
                                                            width:
                                                                "100%",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "10px",
                                                            padding:
                                                                "9px 8px",
                                                            marginBottom:
                                                                "3px",
                                                            border:
                                                                "none",
                                                            borderRadius:
                                                                "10px",
                                                            background:
                                                                isSelected
                                                                    ? "#f3f0ff"
                                                                    : "transparent",
                                                            cursor:
                                                                groupCreating
                                                                    ? "default"
                                                                    : "pointer",
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >
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
                                                                    isSelected
                                                                        ? "#7c3aed"
                                                                        : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                                                                color:
                                                                    "#ffffff",
                                                                fontWeight:
                                                                    "700",
                                                                fontSize:
                                                                    "15px"
                                                            }}
                                                        >
                                                            {foundUser
                                                                .nickname
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

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
                                                                        "600",
                                                                    color:
                                                                        "#1f2937",
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                    whiteSpace:
                                                                        "nowrap"
                                                                }}
                                                            >
                                                                {
                                                                    foundUser.nickname
                                                                }
                                                            </div>

                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "3px",
                                                                    fontSize:
                                                                        "11px",
                                                                    color:
                                                                        "#9ca3af"
                                                                }}
                                                            >
                                                                {isSelected
                                                                    ? "Вибрано"
                                                                    : "Додати до групи"}
                                                            </div>
                                                        </div>

                                                        <div
                                                            style={{
                                                                width:
                                                                    "22px",
                                                                height:
                                                                    "22px",
                                                                borderRadius:
                                                                    "6px",
                                                                border:
                                                                    isSelected
                                                                        ? "none"
                                                                        : "2px solid #d1d5db",
                                                                background:
                                                                    isSelected
                                                                        ? "#7c3aed"
                                                                        : "#ffffff",
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                color:
                                                                    "#ffffff",
                                                                fontSize:
                                                                    "14px",
                                                                fontWeight:
                                                                    "700"
                                                            }}
                                                        >
                                                            {isSelected
                                                                ? "✓"
                                                                : ""}
                                                        </div>
                                                    </button>
                                                );
                                            }
                                        )}
                                </div>
                            )}

                            {/* ERROR */}

                            {groupCreateError && (
                                <div
                                    style={{
                                        marginTop:
                                            "14px",
                                        padding:
                                            "11px 12px",
                                        borderRadius:
                                            "9px",
                                        background:
                                            "#fef2f2",
                                        color:
                                            "#dc2626",
                                        fontSize:
                                            "13px"
                                    }}
                                >
                                    {
                                        groupCreateError
                                    }
                                </div>
                            )}
                        </div>


                        {/* FOOTER */}

                        <div
                            style={{
                                display:
                                    "flex",
                                gap: "9px",
                                padding:
                                    "14px 20px",
                                borderTop:
                                    "1px solid #f0f0f0",
                                background:
                                    "#ffffff"
                            }}
                        >
                            <button
                                type="button"
                                onClick={
                                    closeGroupModal
                                }
                                disabled={
                                    groupCreating
                                }
                                style={{
                                    flex: 1,
                                    height:
                                        "42px",
                                    border:
                                        "1px solid #e5e7eb",
                                    borderRadius:
                                        "10px",
                                    background:
                                        "#ffffff",
                                    color:
                                        "#374151",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "600",
                                    cursor:
                                        groupCreating
                                            ? "default"
                                            : "pointer"
                                }}
                            >
                                Скасувати
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleCreateGroup
                                }
                                disabled={
                                    groupCreating
                                }
                                style={{
                                    flex: 1,
                                    height:
                                        "42px",
                                    border:
                                        "none",
                                    borderRadius:
                                        "10px",
                                    background:
                                        groupCreating
                                            ? "#c4b5fd"
                                            : "linear-gradient(135deg, #7c3aed, #6366f1)",
                                    color:
                                        "#ffffff",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "600",
                                    cursor:
                                        groupCreating
                                            ? "default"
                                            : "pointer",
                                    boxShadow:
                                        "0 4px 10px rgba(99,102,241,0.18)"
                                }}
                            >
                                {groupCreating
                                    ? "Створення..."
                                    : "Створити групу"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style>
                {`
                    .freegram-sidebar-content::-webkit-scrollbar {
                        width: 6px;
                    }

                    .freegram-sidebar-content::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .freegram-sidebar-content::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 10px;
                    }

                    .freegram-sidebar-content::-webkit-scrollbar-thumb:hover {
                        background: #aeb4bd;
                    }

                    @media (max-width: 768px) {
                        .freegram-chat-sidebar {
                            border-right: none !important;
                        }

                        .freegram-sidebar-content {
                            padding-left: 8px !important;
                            padding-right: 8px !important;
                        }
                    }
                `}
            </style>
        </aside>
    );
}

export default ChatSidebar;