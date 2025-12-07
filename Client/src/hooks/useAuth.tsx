import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { User } from "../types";
import { jwtDecode } from "jwt-decode";
import { googleLogout } from "@react-oauth/google";
import { httpRequests } from "../httpClient";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | undefined;
  isAdmin: boolean;
  isLoading: boolean;
  handleLoginSuccess: (response: any) => void;
  handleLogout: () => void;
  switchUser: (targetUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

      if (Date.now() - parsedUser.loginTime < oneWeekInMs) {
        const { loginTime, ...userWithoutLoginTime } = parsedUser;
        setUser(userWithoutLoginTime);
        checkAdminStatus(userWithoutLoginTime.userID);
      } else {
        localStorage.removeItem("loggedInUser");
      }
    }
    setIsLoading(false);
  }, []);

  const checkAdminStatus = async (userID: string) => {
    try {
      const adminStatus = await httpRequests.checkAdmin(userID);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const handleLoginSuccess = async (response: any) => {
    const decoded: any = jwtDecode(response.credential);
    const loggedInUser = {
      name: decoded.name,
      email: decoded.email,
      userID: decoded.sub,
    };
    await httpRequests.addUser(loggedInUser);

    setUser(loggedInUser);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ ...loggedInUser, loginTime: Date.now() })
    );
    checkAdminStatus(loggedInUser.userID);
    navigate("/");
  };

  const handleLogout = () => {
    googleLogout();
    setUser(undefined);
    setIsAdmin(false);
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const switchUser = (targetUser: User) => {
    if (!isAdmin) {
      console.error("Unauthorized: Only admin can switch users");
      return;
    }
    const userWithLoginTime = { ...targetUser, loginTime: Date.now() };
    localStorage.setItem("loggedInUser", JSON.stringify(userWithLoginTime));
    setUser(targetUser);
    checkAdminStatus(targetUser.userID);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        handleLoginSuccess,
        handleLogout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
