import {
    useEffect,
    useState
} from "react";

import ChatList from "./ChatList";

import {
    searchUsers
} from "../../services/api";


function ChatSidebar({
    chats = [],
    selectedChat,
    getChatName,
    onSelectChat,
    token,
    currentUserId,
    onSelectUser
}) {
    const [search, setSearch] =
        useState("");

    const [users, setUsers] =
        useState([]);

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [searchError, setSearchError] =
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


    const hasSearch =
        search.trim().length > 0;


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

            {/* ======================================
                HEADER
            ====================================== */}

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

                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "center",
                            background:
                                "linear-gradient(135deg, #7c3aed, #6366f1)",
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: "700",
                            boxShadow:
                                "0 4px 10px rgba(99,102,241,0.22)"
                        }}
                    >
                        F
                    </div>
                </div>


                {/* ==================================
                    SEARCH
                ================================== */}

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


            {/* ======================================
                CONTENT
            ====================================== */}

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
                        {/* ==========================
                            USERS TITLE
                        ========================== */}

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


                        {/* ==========================
                            LOADING
                        ========================== */}

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


                        {/* ==========================
                            ERROR
                        ========================== */}

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


                        {/* ==========================
                            NO USERS
                        ========================== */}

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


                        {/* ==========================
                            USERS
                        ========================== */}

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

                                        {/* Avatar */}

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


                                        {/* User info */}

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


                        {/* ==========================
                            CHATS TITLE
                        ========================== */}

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


                        {/* ==========================
                            FILTERED CHATS
                        ========================== */}

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


            {/* ======================================
                STYLES
            ====================================== */}

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