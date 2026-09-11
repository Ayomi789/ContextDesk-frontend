import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../lib/api";
import type { CrmUser } from "../lib/types";

interface AuthContextType {
  user: CrmUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    opts?: { organizationName?: string; inviteToken?: string }
  ) => Promise<string>;
  google: (idToken: string, opts?: { organizationName?: string; inviteToken?: string }) => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => "",
  google: async () => {},
  verify: async () => {},
  refresh: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CrmUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("crm_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<{ success: boolean; user: CrmUser }>("/auth/me")
      .then((response) => {
        console.log("AUTH /me RESPONSE:", response.data);
        setUser(response.data.user);
      })
      .catch((error) => {
        console.error("AUTH /me FAILED:", error);
        localStorage.removeItem("crm_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{
      success: boolean;
      token: string;
      user: CrmUser;
    }>("/auth/login", {
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", response.data);

    if (!response.data?.token) {
      throw new Error("Login succeeded but no authentication token was returned.");
    }

    localStorage.setItem("crm_token", response.data.token);
    setUser(response.data.user);
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    opts?: { organizationName?: string; inviteToken?: string }
  ): Promise<string> => {
    const response = await api.post<{
      success: boolean;
      user: CrmUser;
    }>("/auth/register", {
      name,
      email,
      password,
      organizationName: opts?.organizationName || undefined,
      inviteToken: opts?.inviteToken || undefined,
    });

    console.log("REGISTER RESPONSE:", response.data);

    if (!response.data?.user?.email) {
      throw new Error("Registration failed, please try again.");
    }

    return response.data.user.email;
  };

  const google = async (
    idToken: string,
    opts?: { organizationName?: string; inviteToken?: string }
  ) => {
    const response = await api.post<{
      success: boolean;
      token: string;
      user: CrmUser;
    }>("/auth/google", {
      idToken,
      organizationName: opts?.organizationName || undefined,
      inviteToken: opts?.inviteToken || undefined,
    });

    console.log("GOOGLE RESPONSE:", response.data);

    if (!response.data?.token) {
      throw new Error("Google sign-in failed, please try again.");
    }

    localStorage.setItem("crm_token", response.data.token);
    setUser(response.data.user);
  };

  const verify = async (email: string, code: string) => {
    const response = await api.post<{
      success: boolean;
      token: string;
      user: CrmUser;
    }>("/auth/verify", {
      email,
      code,
    });

    console.log("VERIFY RESPONSE:", response.data);

    if (!response.data?.token) {
      throw new Error("Verification failed, please try again.");
    }

    localStorage.setItem("crm_token", response.data.token);
    setUser(response.data.user);
  };

  const refresh = async () => {
    const response = await api.get<{
      success: boolean;
      user: CrmUser;
    }>("/auth/me");

    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        google,
        verify,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);