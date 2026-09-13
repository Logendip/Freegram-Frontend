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
            <aside
                className={`messenger-sidebar ${
                    mobileChatOpen
                        ? "mobile-chat-open"
                        : ""
                }`}
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

            <main
                className={`messenger-main ${
                    mobileChatOpen
                        ? "mobile-chat-open"
                        : ""
                }`}
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

            <style>
                {`
                    @media (min-width: 769px) {
                        .messenger-sidebar {
                            display: flex !important;
                            transform: none !important;
                        }

                        .messenger-main {
                            display: flex !important;
                            transform: none !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .messenger-layout {
                            position: relative;
                            width: 100%;
                            height: 100dvh;
                            overflow: hidden;
                        }

                        .messenger-sidebar {
                            position: absolute;
                            inset: 0;
                            width: 100% !important;
                            min-width: 100% !important;
                            max-width: 100% !important;
                            height: 100% !important;
                            overflow: hidden;

                            transform: translateX(0);
                            transition:
                                transform 300ms cubic-bezier(0.22, 1, 0.36, 1);

                            z-index: 2;
                        }

                        .messenger-sidebar.mobile-chat-open {
                            transform: translateX(-100%);
                        }

                        .messenger-main {
                            position: absolute;
                            inset: 0;
                            width: 100% !important;
                            min-width: 100% !important;
                            max-width: 100% !important;
                            height: 100% !important;
                            overflow: hidden;

                            transform: translateX(100%);
                            transition:
                                transform 300ms cubic-bezier(0.22, 1, 0.36, 1);

                            z-index: 1;
                        }

                        .messenger-main.mobile-chat-open {
                            transform: translateX(0);
                            z-index: 3;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .messenger-sidebar,
                        .messenger-main {
                            transition: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default MessengerLayout;