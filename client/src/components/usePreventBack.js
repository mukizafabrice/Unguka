import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const usePreventBack = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      if (!user) {
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user, navigate]);
};

export default usePreventBack;
