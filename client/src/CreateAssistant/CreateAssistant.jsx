import { useState, useEffect, useRef } from "react";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import "./CreateAssistant.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import InputColor from "react-input-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import tickAnimation from "../imgs/green-tick.mp4";
import tickAnimationWhite from "../imgs/green-tick-light-theme.mp4";

const CreateAssistant = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState();
    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "dark");

    const noVideoContentRef = useRef();
    const location = useLocation();

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    useEffect(() => {
        setTheme(cookies?.theme || "dark");
    }, [cookies]);

    const createAssistantRequest = async () => {

        if (!firstname.length || !lastname.length) {
            setErrorMessage(cookies.language === "en" ? "Fill each required field!" : "Completeaza toate campurile obligatorii!");
            return;
        } 

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                firstName: firstname,
                lastName: lastname,
                email: email && email?.length > 0 ? email : "",
                phone: phone && phone?.length > 0 ? phone : "",
                language: cookies?.language || "ro"
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-assistant`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setAssistantAdded(true), 300);
            } else console.log(errorMessage);
        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    };

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        window.history.replaceState({ activeOption: 1, success: true, message: cookies.language === "en" ? "Assistant has been created successfully!" : "Personalul a fost creat cu succes!" }, "");
        navigate("/profile");
    };

    return (
        <div className="create-doctor">
            <Navigation page="doctors" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <div className="video-content" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <video
                            src={theme === "light" ? tickAnimationWhite : tickAnimation}
                            controls={false}
                            autoPlay
                            playsInline
                            onEnded={animationFinished}

                            muted
                            style={{ height: "40vh" }}
                        
                        />
                        <h2 className="title title-video-content" style={{ margin: 0 }}>{cookies.language === "en" ? "Assistant added successfully!" : "Personalul a fost adaugat cu succes!"}</h2>
                    </div>
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Add Assistant" : "Adauga Personal"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Surname *" : "Nume *"}</p>
                            <input type="text" value={firstname} onChange={e => setFirstname(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "Name *": "Prenume *"}</p>
                            <input type="text" value={lastname} onChange={e => setLastname(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>Email</p>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "Phone Number" : "Numar de telefon"}</p>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />

                        </div>

                        {/* <div className="input input-start">
                            <div className="option">
                                <div className={`box ${multipleSchedules ? "active" : ""}`} onClick={() => setMultipleSchedules(curr => !curr)}>
                                    {multipleSchedules && 
                                        <FontAwesomeIcon className="check-icon" icon={faCheck}/>
                                    }
                                </div>
                                <p>{cookies.language === "en" ? "Allow multiple schedules" : "Permite programari multiple"}</p>
                            </div>
                        </div> */}


                        <button type="submit"  className="confirm-button" onClick={async () => await createAssistantRequest()}>{cookies.language === "en" ? "Save": "Salveaza"}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default CreateAssistant;