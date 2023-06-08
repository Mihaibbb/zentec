import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Header from "../../Components/Header/Header";
import "../CreatePatientType/CreatePatientType.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import TickAnimation from "../../utils/TickAnimation";

const EditPatientTypes = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();
    const { id, pageName } = useParams();
    if (!pageName || !id) navigate(-1);

    const [patientType, setPatientType] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "light");
    const noVideoContentRef = useRef();

    const location = useLocation();
   
    const isTouchDevice = useCallback(() => {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    }, []);

    useEffect(() => {
        if (pageName === "category") {
            setPatientType(data.organisation.patient_categories.find(category => category.id === Number(id)).category);
        } else if (pageName === "type") {
            setPatientType(data.organisation.patient_types.find(type => type.id === Number(id)).name);
        }

    }, []);

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    useEffect(() => {
        setTheme(cookies?.theme || "light");
    }, [cookies]);

    const createTreatmentCategoryRequest = async () => {

        if (!patientType.length) {
            setErrorMessage(cookies.language === "en" ? "Fill each required field!" : "Completeaza toate campurile obligatorii!");
            return;
        } 

        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id, 
                name: patientType,
                id
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-patient-${pageName}`, options);
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
        navigate("/profile", { state: { refresh: true, activeOption: pageName === "category" ? 9 : 8 } });
    };



    return (
        <div className="create-doctor">
            <Navigation page="" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? `Modifications have been saved successfully!` : "Modificarile au fost salvate cu succes!"} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? `Edit patient ${pageName}` : `Modifica ${pageName === "category" ? "Categoria" : "Tipul"} de pacient`}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Name *" : "Nume *"}</p>
                            <input type="text" value={patientType} onChange={e => setPatientType(e.target.value)} />
                        </div>


                        <button type="submit"  className="confirm-button" onClick={async () => await createTreatmentCategoryRequest()}>{cookies.language === "en" ? `Save changes`: `Salveaza modificarile`}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default EditPatientTypes;