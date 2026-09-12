import {
    useEffect,
    useState
} from "react";

import ChatList from "./ChatList";

import {
    searchUsers
} from "../../services/api";

function ChatSidebar({
    chats,
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

    const filteredChats =
        chats.filter((chat) =>
            getChatName(chat)
                .toLowerCase()
                .includes(
                    search
                        .toLowerCase()
                        .trim()
                )
        );

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
                        setSearchLoading(
                            true
                        );

                        setSearchError("");

                        const result =
                            await searchUsers(
                                token,
                                query
                            );

                        const filteredUsers =
                            result.filter(
                                (user) =>
                                    user.id !==
                                    currentUserId
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
                        setSearchLoading(
                            false
                        );
                    }
                },
                300
            );

        return () =>
            clearTimeout(
                timeoutId
            );
    }, [
        search,
        token,
        currentUserId
    ]);

    const hasSearch =
        search.trim().length > 0;

    return (
        <aside
            style={{
                width: "320px",
                minWidth: "320px",
                borderRight:
                    "1px solid #ddd",
                display: "flex",
                flexDirection:
                    "column",
                background: "#fff"
            }}
        >
            <div
                style={{
                    padding: "18px",
                    borderBottom:
                        "1px solid #eee"
                }}
            >
                <h2
                    style={{
                        margin:
                            "0 0 15px 0"
                    }}
                >
                    Чати
                </h2>

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
                            left: "13px",
                            top: "50%",
                            transform:
                                "translateY(-50%)",
                            color: "#888",
                            fontSize:
                                "15px",
                            pointerEvents:
                                "none"
                        }}
                    >
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Пошук користувачів або чатів..."
                        value={search}
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event
                                    .target
                                    .value
                            )
                        }
                        style={{
                            width: "100%",
                            boxSizing:
                                "border-box",
                            padding:
                                "11px 14px 11px 38px",
                            border:
                                "1px solid #ddd",
                            borderRadius:
                                "10px",
                            outline:
                                "none",
                            fontSize:
                                "14px"
                        }}
                    />
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding:
                        "8px"
                }}
            >
                {hasSearch ? (
                    <>
                        <div
                            style={{
                                padding:
                                    "8px 8px 10px",
                                fontSize:
                                    "12px",
                                fontWeight:
                                    "600",
                                color:
                                    "#888",
                                textTransform:
                                    "uppercase"
                            }}
                        >
                            Користувачі
                        </div>

                        {searchLoading && (
                            <div
                                style={{
                                    padding:
                                        "15px 8px",
                                    color:
                                        "#777",
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
                                        padding:
                                            "12px 8px",
                                        color:
                                            "#d32f2f",
                                        fontSize:
                                            "14px"
                                    }}
                                >
                                    {
                                        searchError
                                    }
                                </div>
                            )}

                        {!searchLoading &&
                            !searchError &&
                            users.length ===
                                0 && (
                                <div
                                    style={{
                                        padding:
                                            "12px 8px",
                                        color:
                                            "#777",
                                        fontSize:
                                            "14px",
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    Користувачів не знайдено.
                                </div>
                            )}

                        {!searchLoading &&
                            users.map(
                                (user) => (
                                    <button
                                        key={
                                            user.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            onSelectUser(
                                                user
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
                                                "12px",
                                            padding:
                                                "10px",
                                            marginBottom:
                                                "4px",
                                            border:
                                                "none",
                                            borderRadius:
                                                "10px",
                                            background:
                                                "transparent",
                                            cursor:
                                                "pointer",
                                            textAlign:
                                                "left"
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
                                                    "44px",
                                                height:
                                                    "44px",
                                                minWidth:
                                                    "44px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    "#2563eb",
                                                color:
                                                    "#fff",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                fontWeight:
                                                    "700",
                                                fontSize:
                                                    "17px"
                                            }}
                                        >
                                            {user.nickname
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </div>

                                        <div
                                            style={{
                                                minWidth:
                                                    0,
                                                flex:
                                                    1
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight:
                                                        "600",
                                                    color:
                                                        "#222",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap"
                                                }}
                                            >
                                                {
                                                    user.nickname
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    fontSize:
                                                        "13px",
                                                    color:
                                                        "#888",
                                                    marginTop:
                                                        "3px"
                                                }}
                                            >
                                                Натисніть, щоб відкрити чат
                                            </div>
                                        </div>
                                    </button>
                                )
                            )}

                        <div
                            style={{
                                margin:
                                    "14px 8px 8px",
                                borderTop:
                                    "1px solid #eee",
                                paddingTop:
                                    "12px",
                                fontSize:
                                    "12px",
                                fontWeight:
                                    "600",
                                color:
                                    "#888",
                                textTransform:
                                    "uppercase"
                            }}
                        >
                            Ваші чати
                        </div>

                        {filteredChats.length >
                        0 ? (
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
                                        "10px 8px",
                                    color:
                                        "#888",
                                    fontSize:
                                        "14px"
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
        </aside>
    );
}

export default ChatSidebar;