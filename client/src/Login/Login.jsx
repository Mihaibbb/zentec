import "./Login.css";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Login = () => {
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [cookies, setCookie, removeCookie] = useCookies([]);
    const navigation = useNavigate();

    const tryLogin = async () => {
        console.log(username, password);
        if (!username || !password) {
            setErrorMessage("An error occured.");
            return;
        }
        if (username.length === 0 || password.length === 0) {
            setErrorMessage("Please fill each field.");
            return;
        }
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                rememberMe
            })
        };

        try {
           
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, options);
            const res = await request.json();

            if (!await res.success) {
                console.log(res);
                setErrorMessage(res.message[cookies?.language ? cookies.language : "en"]);
                return;
            }

            if (await res.objectId && await res.hashedPassword) {
                setCookie('user-id', await res.objectId);
                setCookie('pwd', await res.hashedPassword);
                setCookie('language', 'ro');
                setCookie('theme', 'dark');
                window.location.reload();
            } 

            console.log(await res.type);
        

        } catch (e) {
            console.log(e);
        }
      
    };

    return (
        <div className="center-container">
            <div className="image"></div>
            <div className="login-container">
                <h2 className="title">Log in to your account!</h2>
                <div className="login-inputs">
                    <div className="input">
                        <p>Username</p>
                        <input type="text" placeholder="Username..." value={username} onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>Password</p>
                        <input type="password" placeholder="Password..." value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    {/* <div className="input">
                        <input type="checkbox" checked={rememberMe} onClick={() => setRememberMe(currRememberMe => !currRememberMe)}/>
                        <p>Remember Me</p>
                    </div> */}

                    <button type="text" onClick={async () => await tryLogin()}>
                        <p>Log in</p>
                    </button>

                    <p className="error-text">{errorMessage}</p>
                </div>
            </div>
        </div>
    );
};

export default Login;