

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import api from "../lib/api";
// import type { CrmUser } from "../lib/types";

// interface AuthContextType {
//   user: CrmUser | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (name: string, email: string, password: string) => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   login: async () => {},
//   signup: async () => {},
//   logout: () => {},
// });

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<CrmUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("crm_token");

//     if (token) {
//       api
//         .get<{ user: CrmUser }>("/auth/me")
//         .then((response) => {
//           setUser(response.data.user);
//         })
//         .catch(() => {
//           localStorage.removeItem("crm_token");
//           setUser(null);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (email: string, password: string) => {
//     const response = await api.post<{
//       token: string;
//       user: CrmUser;
//     }>("/auth/login", {
//       email,
//       password,
//     });

//     localStorage.setItem("crm_token", response.data.token);
//     setUser(response.data.user);
//   };

//   const signup = async (
//     name: string,
//     email: string,
//     password: string
//   ) => {
//     const response = await api.post<{
//       token: string;
//       user: CrmUser;
//     }>("/auth/register", {
//       name,
//       email,
//       password,
//     });

//     localStorage.setItem("crm_token", response.data.token);
//     setUser(response.data.user);
//   };

//   const logout = () => {
//     localStorage.removeItem("crm_token");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         signup,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);


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
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
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
    password: string
  ) => {
    const response = await api.post<{
      success: boolean;
      token: string;
      user: CrmUser;
    }>("/auth/register", {
      name,
      email,
      password,
    });

    console.log("REGISTER RESPONSE:", response.data);

    if (!response.data?.token) {
      throw new Error(
        "Registration succeeded but no authentication token was returned."
      );
    }

    localStorage.setItem("crm_token", response.data.token);
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);