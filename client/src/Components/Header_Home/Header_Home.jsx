import { useCookies } from "react-cookie";
import "./Header_Home.css";
import ZenLogo from "../../imgs/logo_zen.svg";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

const HeaderHome = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const [foundUser, setFoundUser] = useState(false);
    const navigation = useNavigate();

    const headerRef = useRef();

    const userConnected = async () => {
        if (!cookies["user-id"] || !cookies["pwd"]) return;
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                hashedPassword: cookies["pwd"],
                userId: cookies["user-id"]
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login-remember`, options);
            const response = await request.json();
            if (!response.success) return;
            setFoundUser(response.admin ? "admin" : "user");
        } catch(e) {
            console.log(e);
        }
    };

    useEffect(() => {
        (async () => {
            await userConnected();
        })();
    }, []);
    

    return (
        <header ref={headerRef}>
            <div className="list">
                <div className="left-container">
                
                    <div className="items">
                        <p className="item">{cookies?.language === "en" ? "Home" : "Acasa" }</p>
                        <p className="item">{cookies?.language === "en" ? "About us" : "Despre noi"}</p>
                        <p className="item">Contact</p>
                        <p className="item">{cookies?.language === "en" ? "Support" : "Suport"}</p>
                    </div>
                </div>

                <div className="logo">
                    
                    <img src={ZenLogo} alt="Zentec Logo" width={55} height={55} />
                    <p className="logo-text">Zentec</p>
                    
                </div>
            
                {/* <p className="item">Zen news</p> */}

                <div className="right-container">
                    <div className="button" onClick={() => foundUser ? navigation("/dashboard") : navigation("/login")}>
                        {!foundUser ? 
                            <p>{cookies.language === "en" ? "Login" : "Login"}</p> :
                            <>
                                <p>{cookies.language === "en" ? "To dashboard" : "Spre dashboard"}</p>
                            </>
                        }
                    </div>
                </div>
            </div>
            
            <div className="navigation-icon" onClick={() => headerRef.current.classList.toggle("active-navigation")}>
                <div className="line" />
                <div className="line" />
                <div className="line" />
            </div>
        </header>
    );
};

export default HeaderHome;