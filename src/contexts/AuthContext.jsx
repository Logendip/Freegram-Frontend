
import {
    createContext,
    useContext,
    useState
} from "react";

import { loginUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = async (
        nickname,
        password
    ) => {
        const data = await loginUser(
            nickname,
            password
        );

        setToken(data.token);

        setUser({
            id: data.id,
            nickname: data.nickname
        });

        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}

