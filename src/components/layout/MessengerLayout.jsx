function MessengerLayout({
    sidebar,
    children
}) {
    return (
        <div
            style={{
                height: "100vh",
                width: "100%",
                display: "flex",
                background: "#fff",
                overflow: "hidden"
            }}
        >
            {sidebar}

            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                {children}
            </main>
        </div>
    );
}

export default MessengerLayout;