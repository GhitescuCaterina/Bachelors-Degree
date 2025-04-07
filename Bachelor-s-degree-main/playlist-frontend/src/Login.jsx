import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Login.css';
import logo from './assets/logo.png';
import motto from './assets/motto.png';
import musicBar from './assets/music-bar.png';

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            navigate('/dashboard');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");

        if (authCode) {
            fetch(`http://localhost:8080/oauth2callback?code=${authCode}`)
                .then(response => response.json())
                .then(data => {
                    if (data.accessToken && data.userId) {
                        localStorage.setItem("accessToken", data.accessToken);
                        localStorage.setItem("userId", data.userId);
                        navigate("/dashboard");
                    } else {
                        console.error("Login failed: ", data);
                    }
                })
                .catch(error => console.error("Error during login: ", error));
        }
    }, [navigate]);

    const handleLogin = () => {
        window.location.href = "http://localhost:8080/auth";
    };

    return (
        <div className="login-container">
            <div className="image-section">
                <img className="logo" src={logo} alt="App Logo" />
                <img src={musicBar} alt="Music Bar" className="music-bar" />
                <img className="motto" src={motto} alt="App Motto" />
            </div>
            <div className="login-content">
                <h1>Welcome to Youtube Playlist Conversation</h1>
                <p>This is an application that allows you to communicate through your YouTube Playlist with the people you love.</p>
                <button className="login-button" onClick={handleLogin}>Login with Google</button>
            </div>
        </div>
    );
};

export default Login;
