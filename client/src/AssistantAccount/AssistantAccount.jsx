import { useEffect, useRef } from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import InputColor from "react-input-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import "./AssistantAccount.css";
import tickAnimation from "../imgs/green-tick.mp4";
import tickAnimationLight from "../imgs/green-tick-light-theme.mp4";
import TickAnimation from "../utils/TickAnimation";

const AssistantAccount = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const { id } = useParams();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    const [theme, setTheme] = useState(cookies?.theme || "dark");

    const [errorMessage, setErrorMessage] = useState();
    const [assistantAdded, setAssistantAdded] = useState(false);

    const noVideoContentRef = useRef();
    
    const navigate = useNavigate();

    const getAssistantInfo = async () => {
        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    _id: id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/assistant-info`, options);
            const response = await request.json();
            const fetchedData = await response.assistant;
            console.log( await fetchedData);
            setFirstname(await fetchedData.firstname);
            setLastname(await fetchedData.lastname);
            setEmail(await fetchedData?.email || "");
            setPhone(await fetchedData?.phone || "");
        } catch (e) {
            console.log(e);
            setErrorMessage(cookies.langauge === "en" ? "An error occured!" : "A aparut o eroare!");
        }
    };

    const submitEditAssistant = async () => {

        if (firstname.length === 0 || lastname.length === 0) {
            setErrorMessage(cookies.language === "en" ? "Fill each field!" : "Completeaza toate campurile!");
            return;
        } 

        try {
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    _id: id,
                    firstname,
                    lastname,
                    email: email || "",
                    phone: phone || "",
                    language: cookies?.language || "ro"
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-assistant`, options);
            const response = await request.json();
            console.log(response);
            if (await response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                noVideoContentRef.current.classList.add("invisible");
                setTimeout(() => setAssistantAdded(true), 300);
            }

        } catch (e) {
            console.log(e);
            setErrorMessage(cookies.langauge === "en" ? "An error occured!" : "A aparut o eroare!");
        }
    };

    useEffect(() => {
        (async () => {
            await getAssistantInfo();
        })();
    }, []);

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

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        window.history.replaceState({ 
            activeOption: 1, 
            success: true, 
            message: cookies.language === "en" ? "Changes have been saved successfully!" : "Modificarile au fost salvate cu succes!" 
        }, "");
        navigate("/profile", { state: { refresh: true } });
    };
    
    return (
        <div className="doctor-account-container">
            <Navigation page="" />

            <div className="content" style={assistantAdded ? { maxHeight: "100vh" } : {}}>
                <Header data={data} />

                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? "Changes have been saved successfully!" : "Modificarile au fost salvate cu succes!"} animationFinished={animationFinished} />
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                        <h2 className="title">{cookies.language === "en" ? "Edit assistant" : "Editare personal"}</h2>
                
                        <div className="go-back" onClick={() => navigate(-1)}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>

                       <div className="form">
                            <div className="input">
                                <p>{cookies.langauge === "en" ? "Surname" : "Nume"}</p>
                                <input type="text" value={firstname} onChange={e => setFirstname(e.target.value)} />
                            </div>

                            <div className="input">
                                <p>{cookies.language === "en" ? "Name": "Prenume"}</p>
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

                            {/* <div className="input">
                                <div className="option">
                                    <div className={`box ${multipleSchedules ? "active" : ""}`} onClick={() => setMultipleSchedules(curr => !curr)}>
                                        {multipleSchedules && 
                                            <FontAwesomeIcon className="check-icon" icon={faCheck}/>
                                        }
                                    </div>
                                    <p>{cookies.language === "en" ? "Allow multiple schedules" : "Permite programari multiple"}</p>
                                </div>
                            </div> */}


                            <button type="submit" className="confirm-button" onClick={async () => await submitEditAssistant()}>{cookies.language === "en" ? "Save changes": "Salveaza modificarile"}</button>
                            <p className="error">{errorMessage}</p>
                        </div>

                      
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssistantAccount;