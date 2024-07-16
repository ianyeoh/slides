import { createContext, useContext, PropsWithChildren } from "react";

export const USER_LS_KEY = "user";

const AuthContext = createContext<string>("");

interface AuthProviderProps extends PropsWithChildren {
    token: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children, token }: AuthProviderProps) {
    return (
        <AuthContext.Provider value={token}>{children}</AuthContext.Provider>
    );
}
