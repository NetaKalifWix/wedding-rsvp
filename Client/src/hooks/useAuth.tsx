import { useState, useEffect } from "react";
import { User } from "../types";
import { jwtDecode } from "jwt-decode";
import { googleLogout } from "@react-oauth/google";
import { httpRequests } from "../httpClient";

export const useAuth = () => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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

  const handleLoginSuccess = (response: any) => {
    const decoded: any = jwtDecode(response.credential);
    const loggedInUser = {
      name: decoded.name,
      email: decoded.email,
      userID: decoded.sub,
    };
    httpRequests.addUser(loggedInUser);

    setUser(loggedInUser);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ ...loggedInUser, loginTime: Date.now() })
    );
    checkAdminStatus(loggedInUser.userID);
  };

  const handleLogout = () => {
    googleLogout();
    setUser(undefined);
    setIsAdmin(false);
    localStorage.removeItem("loggedInUser");
  };

  const switchUser = (targetUser: User) => {
    // Only allow admin to switch users
    if (!isAdmin) {
      console.error("Unauthorized: Only admin can switch users");
      return;
    }

    // Update localStorage and state with the target user
    const userWithLoginTime = { ...targetUser, loginTime: Date.now() };
    localStorage.setItem("loggedInUser", JSON.stringify(userWithLoginTime));
    setUser(targetUser);

    // Check admin status for the new user (admin might switch to non-admin account)
    checkAdminStatus(targetUser.userID);
  };

  return { user, isAdmin, handleLoginSuccess, handleLogout, switchUser };
};
