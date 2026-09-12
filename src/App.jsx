
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import MessengerPage from "./pages/MessengerPage";

function AppContent() {
    const { isAuthenticated } =
        useAuth();

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return <MessengerPage />;
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;

