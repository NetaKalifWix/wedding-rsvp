import { useState, useEffect } from "react";
import { User } from "../types";
import { jwtDecode } from "jwt-decode";
import { googleLogout } from "@react-oauth/google";

export const useAuth = () => {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

      if (Date.now() - parsedUser.loginTime < oneWeekInMs) {
        const { loginTime, ...userWithoutLoginTime } = parsedUser;
        setUser(userWithoutLoginTime);
      } else {
        localStorage.removeItem("loggedInUser");
      }
    }
  }, []);

  const handleLoginSuccess = (response: any) => {
    const decoded: any = jwtDecode(response.credential);
    const loggedInUser = {
      name: decoded.name,
      email: decoded.email,
      userID: decoded.sub,
    };

    setUser(loggedInUser);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ ...loggedInUser, loginTime: Date.now() })
    );
  };

  const handleLogout = () => {
    googleLogout();
    setUser(undefined);
    localStorage.removeItem("loggedInUser");
  };

  return { user, handleLoginSuccess, handleLogout };
};
