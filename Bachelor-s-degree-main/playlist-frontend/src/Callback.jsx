import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get("code");

      if (!authCode) {
        console.error("No auth code found in URL.");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/oauth2callback?code=${authCode}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Login response:", data);

        if (data.accessToken && data.userId) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("userId", data.userId);
          navigate("/dashboard");
        } else {
          console.error("Missing accessToken or userId in response");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
        navigate("/");
      }
    };

    fetchAccessToken();
  }, [navigate]);

  return <p>Logging in...</p>;
};

export default Callback;
