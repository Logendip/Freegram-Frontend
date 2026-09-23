function MessengerLayout({
    sidebar,
    children,
    mobileChatOpen
}) {
    return (
        <div className="messenger-layout">

            <aside
                className={`messenger-sidebar ${
                    mobileChatOpen
                        ? "is-hidden-mobile"
                        : ""
                }`}
            >
                {sidebar}
            </aside>

            <main
                className={`messenger-main ${
                    mobileChatOpen
                        ? "is-open-mobile"
                        : ""
                }`}
            >
                {children}
            </main>

            <style>
                {`
                    * {
                        box-sizing: border-box;
                    }

                    .messenger-layout {
                        width: 100%;
                        height: 100dvh;

                        display: flex;

                        position: relative;

                        overflow: hidden;

                        background: #ffffff;
                    }

                    /* ==========================================
                       SIDEBAR
                    ========================================== */

                    .messenger-sidebar {
                        width: 320px;
                        min-width: 320px;
                        max-width: 320px;

                        height: 100%;

                        flex: 0 0 320px;

                        display: flex;

                        position: relative;

                        overflow: hidden;

                        z-index: 2;
                    }

                    /* ==========================================
                       MAIN CHAT
                    ========================================== */

                    .messenger-main {
                        flex: 1 1 auto;

                        width: auto;
                        min-width: 0;
                        max-width: none;

                        height: 100%;
                        min-height: 0;

                        display: flex;
                        flex-direction: column;

                        position: relative;

                        overflow: hidden;

                        z-index: 1;
                    }

                    /* ==========================================
                       TABLET / DESKTOP
                    ========================================== */

                    @media (min-width: 769px) {

                        .messenger-layout {
                            display: flex;
                        }

                        .messenger-sidebar {
                            display: flex;
                        }

                        .messenger-main {
                            display: flex;
                        }
                    }

                    /* ==========================================
                       MOBILE
                    ========================================== */

                    @media (max-width: 768px) {

                        .messenger-layout {
                            width: 100vw;
                            height: 100dvh;

                            min-width: 0;
                            min-height: 0;

                            display: block;

                            position: relative;

                            overflow: hidden;
                        }

                        /* --------------------------------------
                           SIDEBAR
                        -------------------------------------- */

                        .messenger-sidebar {
                            width: 100vw;
                            min-width: 100vw;
                            max-width: 100vw;

                            height: 100dvh;

                            position: absolute;

                            inset: 0;

                            display: flex;

                            flex: none;

                            overflow: hidden;

                            transform: translateX(0);

                            transition:
                                transform 280ms
                                cubic-bezier(0.22, 1, 0.36, 1);

                            z-index: 2;
                        }

                        .messenger-sidebar.is-hidden-mobile {
                            transform: translateX(-100%);
                        }

                        /* --------------------------------------
                           MAIN CHAT
                        -------------------------------------- */

                        .messenger-main {
                            width: 100vw;
                            min-width: 100vw;
                            max-width: 100vw;

                            height: 100dvh;
                            min-height: 0;

                            position: absolute;

                            inset: 0;

                            display: flex;

                            flex: none;

                            overflow: hidden;

                            transform: translateX(100%);

                            transition:
                                transform 280ms
                                cubic-bezier(0.22, 1, 0.36, 1);

                            z-index: 1;
                        }

                        .messenger-main.is-open-mobile {
                            transform: translateX(0);

                            z-index: 3;
                        }
                    }

                    /* ==========================================
                       SMALL PHONES
                    ========================================== */

                    @media (max-width: 480px) {

                        .messenger-layout {
                            width: 100vw;
                            height: 100dvh;
                        }

                        .messenger-sidebar,
                        .messenger-main {
                            width: 100vw;
                            min-width: 100vw;
                            max-width: 100vw;

                            height: 100dvh;
                        }
                    }

                    /* ==========================================
                       VERY SMALL PHONES
                    ========================================== */

                    @media (max-width: 360px) {

                        .messenger-sidebar,
                        .messenger-main {
                            width: 100vw;
                            min-width: 100vw;
                            max-width: 100vw;
                        }
                    }

                    /* ==========================================
                       REDUCE MOTION
                    ========================================== */

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