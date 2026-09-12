
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../services/api";

function LoginPage() {
    const { login } = useAuth();

    const [isRegister, setIsRegister] =
        useState(false);

    const [nickname, setNickname] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        const trimmedNickname =
            nickname.trim();

        if (!trimmedNickname) {
            setError(
                "Введіть nickname."
            );

            return;
        }

        if (!password) {
            setError(
                "Введіть пароль."
            );

            return;
        }

        if (isRegister) {
            if (password.length < 6) {
                setError(
                    "Пароль повинен містити щонайменше 6 символів."
                );

                return;
            }

            if (
                password !==
                confirmPassword
            ) {
                setError(
                    "Паролі не збігаються."
                );

                return;
            }
        }

        try {
            setLoading(true);

            if (isRegister) {
                const response =
                    await fetch(
                        `${API_URL}/api/Auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                nickname:
                                    trimmedNickname,
                                password
                            })
                        }
                    );

                if (!response.ok) {
                    const errorText =
                        await response.text();

                    throw new Error(
                        errorText ||
                            "Не вдалося зареєструватися."
                    );
                }

                // Після успішної реєстрації
                // одразу виконуємо вхід.
                await login(
                    trimmedNickname,
                    password
                );

                return;
            }

            await login(
                trimmedNickname,
                password
            );
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                    (
                        isRegister
                            ? "Помилка реєстрації."
                            : "Помилка входу."
                    )
            );
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsRegister(
            (value) => !value
        );

        setNickname("");
        setPassword("");
        setConfirmPassword("");
        setError("");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #e0f2fe 100%)",
                padding: "20px",
                boxSizing: "border-box",
                fontFamily:
                    "Arial, sans-serif"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "40px",
                    boxSizing: "border-box",
                    boxShadow:
                        "0 20px 60px rgba(0, 0, 0, 0.12)"
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "32px"
                    }}
                >
                    <div
                        style={{
                            fontSize: "34px",
                            fontWeight: "800",
                            color: "#2563eb",
                            marginBottom: "8px"
                        }}
                    >
                        Freegram
                    </div>

                    <div
                        style={{
                            color: "#64748b",
                            fontSize: "15px"
                        }}
                    >
                        {isRegister
                            ? "Створіть свій акаунт"
                            : "Увійдіть до свого акаунта"}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        background: "#f1f5f9",
                        borderRadius: "10px",
                        padding: "4px",
                        marginBottom: "28px"
                    }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            if (
                                isRegister
                            ) {
                                switchMode();
                            }
                        }}
                        style={{
                            flex: 1,
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px",
                            cursor: "pointer",
                            background:
                                !isRegister
                                    ? "#ffffff"
                                    : "transparent",
                            color:
                                !isRegister
                                    ? "#0f172a"
                                    : "#64748b",
                            fontWeight:
                                !isRegister
                                    ? "600"
                                    : "400",
                            boxShadow:
                                !isRegister
                                    ? "0 1px 4px rgba(0,0,0,0.08)"
                                    : "none"
                        }}
                    >
                        Вхід
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (
                                !isRegister
                            ) {
                                switchMode();
                            }
                        }}
                        style={{
                            flex: 1,
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px",
                            cursor: "pointer",
                            background:
                                isRegister
                                    ? "#ffffff"
                                    : "transparent",
                            color:
                                isRegister
                                    ? "#0f172a"
                                    : "#64748b",
                            fontWeight:
                                isRegister
                                    ? "600"
                                    : "400",
                            boxShadow:
                                isRegister
                                    ? "0 1px 4px rgba(0,0,0,0.08)"
                                    : "none"
                        }}
                    >
                        Реєстрація
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                >
                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#334155"
                        }}
                    >
                        Nickname
                    </label>

                    <input
                        type="text"
                        placeholder="Введіть nickname"
                        value={nickname}
                        onChange={(event) =>
                            setNickname(
                                event.target.value
                            )
                        }
                        autoComplete="username"
                        disabled={loading}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "13px 14px",
                            marginBottom: "18px",
                            boxSizing:
                                "border-box",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "10px",
                            outline: "none",
                            fontSize: "15px"
                        }}
                    />

                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#334155"
                        }}
                    >
                        Пароль
                    </label>

                    <input
                        type="password"
                        placeholder="Введіть пароль"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        autoComplete={
                            isRegister
                                ? "new-password"
                                : "current-password"
                        }
                        disabled={loading}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "13px 14px",
                            marginBottom: "18px",
                            boxSizing:
                                "border-box",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "10px",
                            outline: "none",
                            fontSize: "15px"
                        }}
                    />

                    {isRegister && (
                        <>
                            <label
                                style={{
                                    display:
                                        "block",
                                    marginBottom:
                                        "7px",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "600",
                                    color:
                                        "#334155"
                                }}
                            >
                                Повторіть пароль
                            </label>

                            <input
                                type="password"
                                placeholder="Повторіть пароль"
                                value={
                                    confirmPassword
                                }
                                onChange={(
                                    event
                                ) =>
                                    setConfirmPassword(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                autoComplete="new-password"
                                disabled={
                                    loading
                                }
                                style={{
                                    display:
                                        "block",
                                    width:
                                        "100%",
                                    padding:
                                        "13px 14px",
                                    marginBottom:
                                        "18px",
                                    boxSizing:
                                        "border-box",
                                    border:
                                        "1px solid #cbd5e1",
                                    borderRadius:
                                        "10px",
                                    outline:
                                        "none",
                                    fontSize:
                                        "15px"
                                }}
                            />
                        </>
                    )}

                    {error && (
                        <div
                            style={{
                                padding:
                                    "11px 13px",
                                marginBottom:
                                    "18px",
                                borderRadius:
                                    "9px",
                                background:
                                    "#fef2f2",
                                color:
                                    "#dc2626",
                                fontSize:
                                    "14px"
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            border: "none",
                            borderRadius:
                                "10px",
                            padding:
                                "13px 20px",
                            background:
                                loading
                                    ? "#93c5fd"
                                    : "#2563eb",
                            color: "#ffffff",
                            fontSize:
                                "15px",
                            fontWeight:
                                "600",
                            cursor:
                                loading
                                    ? "default"
                                    : "pointer"
                        }}
                    >
                        {loading
                            ? isRegister
                                ? "Реєстрація..."
                                : "Вхід..."
                            : isRegister
                                ? "Зареєструватися"
                                : "Увійти"}
                    </button>
                </form>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "24px",
                        color: "#64748b",
                        fontSize: "14px"
                    }}
                >
                    {isRegister
                        ? "Вже маєте акаунт?"
                        : "Ще не маєте акаунта?"}

                    <button
                        type="button"
                        onClick={switchMode}
                        disabled={loading}
                        style={{
                            border: "none",
                            background:
                                "transparent",
                            color: "#2563eb",
                            fontWeight:
                                "600",
                            cursor:
                                loading
                                    ? "default"
                                    : "pointer",
                            marginLeft: "5px",
                            padding: 0,
                            fontSize: "14px"
                        }}
                    >
                        {isRegister
                            ? "Увійти"
                            : "Зареєструватися"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

