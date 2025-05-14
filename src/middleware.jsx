import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import BACKEND_URL from "./api/api";


export default function AuthCheck({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get("merchantToken");
    console.log("Token:", token);
    console.log("Location:", location.pathname);

    const checkAuth = async () => {
      setIsChecking(true);
      if (!token && location.pathname !== "/login") {
        setIsChecking(false);
        return navigate("/login", { state: { from: location.pathname } });;
      } else if(!token && location.pathname === "/login"){
        setIsChecking(false);
        return;
      } else {
        try {
          console.log("Checking auth...........................");
          const response = await axios.post(`${BACKEND_URL}/merchant/check`, {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status !== 200) {
            Cookies.remove("merchantToken");
            navigate("/login", { state: { from: location.pathname } });
            throw new Error("Unauthorized");
          };
          setIsChecking(false);
          return;
        } catch (err) {
          Cookies.remove("merchantToken");
          navigate("/login", { state: { from: location.pathname } });
        }
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  if (isChecking) {
    return <div className="w-full h-screen flex items-center justify-center">Loading ...</div>;
  }

  return children;
}