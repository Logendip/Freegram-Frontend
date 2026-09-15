
function ConfirmationModal({
    open,
    title,
    message,
    confirmText = "Підтвердити",
    cancelText = "Скасувати",
    danger = false,
    onConfirm,
    onCancel
}) {
    if (!open) {
        return null;
    }


    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
    };


    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };


    return (
        <div
            style={{
                position: "fixed",

                inset: 0,

                zIndex: 3000,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                padding: "20px",

                background:
                    "rgba(0, 0, 0, 0.45)",

                backdropFilter:
                    "blur(5px)",

                animation:
                    "confirmationOverlayAppear 0.18s ease-out"
            }}

            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    handleCancel();
                }
            }}
        >
            <div
                style={{
                    width: "100%",

                    maxWidth: "440px",

                    background: "#ffffff",

                    borderRadius: "18px",

                    padding: "24px",

                    boxShadow:
                        "0 24px 70px rgba(0, 0, 0, 0.28)",

                    animation:
                        "confirmationModalAppear 0.2s ease-out"
                }}

                onMouseDown={(event) => {
                    event.stopPropagation();
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        display: "flex",

                        alignItems: "center",

                        gap: "12px",

                        marginBottom: "16px"
                    }}
                >
                    <div
                        style={{
                            width: "42px",

                            height: "42px",

                            minWidth: "42px",

                            borderRadius: "50%",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            background: danger
                                ? "#fee2e2"
                                : "#f3f4f6",

                            color: danger
                                ? "#dc2626"
                                : "#374151",

                            fontSize: "20px",

                            fontWeight: "700"
                        }}
                    >
                        {danger ? "!" : "?"}
                    </div>


                    <h3
                        style={{
                            margin: 0,

                            color: "#111827",

                            fontSize: "19px",

                            fontWeight: "700"
                        }}
                    >
                        {title}
                    </h3>
                </div>


                {/* MESSAGE */}

                <div
                    style={{
                        color: "#4b5563",

                        fontSize: "15px",

                        lineHeight: "1.55",

                        marginBottom: "24px",

                        whiteSpace: "pre-line"
                    }}
                >
                    {message}
                </div>


                {/* BUTTONS */}

                <div
                    style={{
                        display: "flex",

                        justifyContent: "flex-end",

                        gap: "10px"
                    }}
                >
                    <button
                        type="button"

                        onClick={handleCancel}

                        style={{
                            border: "1px solid #d1d5db",

                            background: "#ffffff",

                            color: "#374151",

                            borderRadius: "10px",

                            padding: "10px 16px",

                            fontSize: "14px",

                            fontWeight: "600",

                            cursor: "pointer",

                            transition:
                                "background 0.15s ease"
                        }}

                        onMouseEnter={(event) => {
                            event.currentTarget.style.background =
                                "#f3f4f6";
                        }}

                        onMouseLeave={(event) => {
                            event.currentTarget.style.background =
                                "#ffffff";
                        }}
                    >
                        {cancelText}
                    </button>


                    <button
                        type="button"

                        onClick={handleConfirm}

                        style={{
                            border: "none",

                            background: danger
                                ? "#dc2626"
                                : "#2563eb",

                            color: "#ffffff",

                            borderRadius: "10px",

                            padding: "10px 16px",

                            fontSize: "14px",

                            fontWeight: "600",

                            cursor: "pointer",

                            transition:
                                "opacity 0.15s ease"
                        }}

                        onMouseEnter={(event) => {
                            event.currentTarget.style.opacity =
                                "0.88";
                        }}

                        onMouseLeave={(event) => {
                            event.currentTarget.style.opacity =
                                "1";
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>


            <style>
                {`
                    @keyframes confirmationOverlayAppear {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes confirmationModalAppear {
                        from {
                            opacity: 0;
                            transform:
                                translateY(12px)
                                scale(0.97);
                        }

                        to {
                            opacity: 1;
                            transform:
                                translateY(0)
                                scale(1);
                        }
                    }
                `}
            </style>
        </div>
    );
}


export default ConfirmationModal;
