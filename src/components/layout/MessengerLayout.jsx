function MessengerLayout({
    sidebar,
    children,
    mobileChatOpen
}) {
    return (
        <div
            className="messenger-layout"
            style={{
                height: "100dvh",
                width: "100%",
                display: "flex",
                background: "#fff",
                overflow: "hidden"
            }}
        >
            {/* ======================================
                SIDEBAR
            ====================================== */}

            <aside
                className={
                    `messenger-sidebar ${
                        mobileChatOpen
                            ? "mobile-chat-open"
                            : ""
                    }`
                }
                style={{
                    width: "320px",
                    minWidth: "320px",
                    height: "100%",
                    flexShrink: 0,
                    overflow: "hidden"
                }}
            >
                {sidebar}
            </aside>


            {/* ======================================
                MAIN CHAT
            ====================================== */}

            <main
                className={
                    `messenger-main ${
                        mobileChatOpen
                            ? "mobile-chat-open"
                            : ""
                    }`
                }
                style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                {children}
            </main>


            {/* ======================================
                RESPONSIVE
            ====================================== */}

            <style>
                {`
                    /*
                     * DESKTOP
                     * ----------------------------------
                     * Sidebar: 320px
                     * Chat: remaining space
                     */

                    @media (min-width: 769px) {
                        .messenger-sidebar {
                            display: flex !important;
                        }

                        .messenger-main {
                            display: flex !important;
                        }
                    }


                    /*
                     * MOBILE
                     * ----------------------------------
                     * Only one screen is visible:
                     *
                     * mobileChatOpen = false
                     * -> sidebar
                     *
                     * mobileChatOpen = true
                     * -> chat
                     */

                    @media (max-width: 768px) {

                        .messenger-layout {
                            position: relative;
                            width: 100%;
                            height: 100dvh;
                            overflow: hidden;
                        }


                        /* ==========================
                           SIDEBAR
                        ========================== */

                        .messenger-sidebar {
                            width: 100% !important;
                            min-width: 100% !important;
                            max-width: 100% !important;
                            height: 100% !important;
                            flex: 0 0 100% !important;
                            overflow: hidden;
                            display: flex;
                        }


                        .messenger-sidebar.mobile-chat-open {
                            display: none !important;
                        }


                        /* ==========================
                           CHAT
                        ========================== */

                        .messenger-main {
                            width: 100% !important;
                            min-width: 100% !important;
                            max-width: 100% !important;
                            height: 100% !important;
                            flex: 0 0 100% !important;
                            overflow: hidden;
                            display: flex;
                        }


                        /*
                         * Коли чат відкритий,
                         * він займає весь екран.
                         */

                        .messenger-main.mobile-chat-open {
                            display: flex !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default MessengerLayout;