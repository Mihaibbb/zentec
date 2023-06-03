import { useState, useEffect, useRef } from "react";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import "./CreateInstrument.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import tickAnimation from "../imgs/green-tick.mp4";
import tickAnimationWhite from "../imgs/green-tick-light-theme.mp4";
import TickAnimation from "../utils/TickAnimation";

const CreateInstrument = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();

    const [instrumentName, setInstrumentName] = useState("");
    const [isoCode, setIsoCode] = useState(1);

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

    const createInstrumentRequest = async () => {
        if (isNaN(Number(isoCode)) || parseInt(isoCode) < 1) return setErrorMessage(cookies.language === "en" ? "ISO code must be positive!" : "Codul ISO trebuie sa fie pozitiv!");

        if (!instrumentName.length || !isoCode) {
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
                name: instrumentName,
                isoCode: isoCode,
                language: cookies?.language || "ro"
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-sterilization-instrument`, options);
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
        navigate("/sterilizations", { state: { refresh: true } });
    };

    return (
        <div className="create-doctor">
            <Navigation page="sterilizations" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? "Instrument added successfully!" : "Instrumentul a fost adaugat cu succes!"} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Add Instrument" : "Adauga Instrument"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Name *" : "Nume *"}</p>
                            <input type="text" value={instrumentName} onChange={e => setInstrumentName(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "ISO Code *": "Cod ISO *"}</p>
                            <input type="number" min={1} value={isoCode} onChange={e => setIsoCode(e.target.value)} />
                        </div>


                        <button type="submit"  className="confirm-button" onClick={async () => await createInstrumentRequest()}>{cookies.language === "en" ? "Save": "Salveaza"}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default CreateInstrument;