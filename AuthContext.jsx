import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "ghibli_ai_user";

// NOTE: The backend currently returns a plain { id, email, message } on successful
// login/register -- there's no session token/JWT yet. This context just remembers
// that response on the client (in localStorage, so it survives a page refresh) and
// uses its presence to decide whether the user is "logged in" for routing purposes.
// This is enough to gate access to pages in the UI, but it is NOT a substitute for
// real server-side session/token validation -- add that on the backend before this
// app has anything genuinely sensitive to protect.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        try {
            if (user) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // Ignore storage errors (e.g. private browsing mode) -- auth state just
            // won't persist across a refresh in that case.
        }
    }, [user]);

    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};
