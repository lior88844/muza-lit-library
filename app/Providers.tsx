import { WebStorageStateStore } from "oidc-client-ts";
import { useMemo } from "react";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  const cognitoAuthConfig = useMemo<AuthProviderProps>(
    () => ({
      authority: import.meta.env.VITE_COGNITO_AUTHORITY || "",
      client_id: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
      redirect_uri:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "http://localhost:5173/auth/callback",
      post_logout_redirect_uri:
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:5173",
      response_type: "code",
      scope: "email openid profile",
      automaticSilentRenew: true,
      loadUserInfo: true,
      stateStore:
        typeof window !== "undefined"
          ? new WebStorageStateStore({
              store: window.localStorage,
            })
          : undefined,
    }),
    []
  );
  return (
    <AuthProvider {...cognitoAuthConfig}>
      {children}
      <ToastContainer />
    </AuthProvider>
  );
}
