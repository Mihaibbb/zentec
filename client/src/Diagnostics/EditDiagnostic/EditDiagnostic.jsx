import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Header from "../../Components/Header/Header";
import "./EditDiagnostic.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import InputColor from "react-input-color";
import TickAnimation from "../../utils/TickAnimation";
import Select from "react-select";
import DIAGNOSTICS from "../../utils/Diagnostics";

const EditDiagnostic = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();
    const { id } = useParams();

    const [treatmentName, setTreatmentName] = useState("");
    const [color, setColor] = useState({});
    const [category, setCategory] = useState();
    const [categoriesNameValue, setCategoriesNameValue] = useState("");
    const [categoriesValue, setCategoriesValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "dark");
    const [price, setPrice] = useState();
    const [materialPrice, setMaterialPrice] = useState();
    const [doctorPrice, setDoctorPrice] = useState();
    const [pricePer, setPricePer] = useState(0);
    const [type, setType] = useState(0);
    const [picture, setPicture] = useState("dinte.png");
    const [initialColor, setInitialColor] = useState();

    const pricePersRef = useRef([]);
    const typesRef = useRef([]);
    const picturesRef = useRef([]);
    const noVideoContentRef = useRef();

    const pricePers = cookies.language === "en" ? ["Tooth", "Dental Arch", "Session"] : ["Dinte", "Arcada", "Sedinta"];
    const types = cookies?.language === "en" ? ["General", "Specialized"] : ["General", "Specializat"];
    
    const location = useLocation();

    const categoriesOptions = useMemo(() => data.organisation?.treatment_categories.map(category => {
        return {
            value: `${category.id}`,
            label: `${category.name}`,
        };
    }), []);

    const customStyles = useMemo(() => {
        return {
        control: (base, state) => ({
            ...base,
            background: "var(--over-difference-color-2)",
            border: "none",
            borderRadius: 10,
            width: "90%",
            margin: "0 auto",
            boxShadow: "0 0 10px var(--contrast-color)",
            color: "var(--text-color)",
            marginLeft: '0px'
        }),

        option: (provided, state) => ({
            ...provided,
            color: "rgba(255, 255, 255, .85)",
            background: state.isSelected ? "var(--contrast-color)" : state.isFocused ? "var(--contrast-color-highlight)" : "initial",
            borderRadius: 10,
            fontWeight: "bold"
        }),
        
        menu: (provided, state) => ({
            ...provided,
            
            maxHeight: "300px",
            overflowX: "auto",
            background: cookies?.theme === "light" ? "var(--dark-color)" : "var(--dark-color)",
            border: "none",
            borderRadius: 10,
            boxShadow: "0 0 15px var(--dark-color)"
        }),

        singleValue: (provided) => ({
            ...provided,
            color: "var(--text-color)",
            width: "100%",
            fontWeight: "bold"
        })
    }}, []);

    const isTouchDevice = useCallback(() => {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
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
        setTheme(cookies?.theme || "dark");
    }, [cookies]);

    useEffect(() => {
        if (!id) navigate(-1);
        const currDiagnostic = data.organisation.diagnostics.find(diagnostic => diagnostic.id === Number(id));
        console.log(currDiagnostic);
        if (!currDiagnostic) return;
        setTreatmentName(currDiagnostic.name);
        setInitialColor(currDiagnostic.color);
        setPicture(currDiagnostic.picture);

    }, []);

    const createTreatmentCategoryRequest = async () => {

        if (!treatmentName.length) {
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
                name: treatmentName, 
                color: color?.hex || initialColor, 
                picture,
                diagnosticId: id,
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-diagnostic`, options);
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
        navigate("/profile", { state: { refresh: true, activeOption: 6 } });
    };

    useEffect(() => {
        if (!Object.keys(color)?.length) return;
        const elem = document?.querySelector(".input-color .option > div");
        const notDisplayableDiv =  document.querySelector(".input-color .option > div div:last-child > div:last-child")?.lastChild;
        if (!elem || !notDisplayableDiv) return;

        elem.style.left='-50px';
        notDisplayableDiv.style.display = 'none';
    }, [color]);

    return (
        <div className="create-doctor">
            <Navigation page="" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? "Changes have been saved successfully!" : "Modificarile au fost salvate cu succes!"} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Edit Diagnose" : "Editeaza Diagnostic"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Name *" : "Nume *"}</p>
                            <input type="text" value={treatmentName} onChange={e => setTreatmentName(e.target.value)} />
                        </div>

                        <div className="input input-start input-color">
                            <div className="option treatment-category">
                                <p>{cookies.language === "en" ? "Highlight Color *" : "Culoare *"}</p>
                                <InputColor initialValue={initialColor || (cookies?.theme === "light" ? "#000" : "#fff")} onChange={setColor} />
                                
                            </div>
                        </div>

                        <div className="input one-row">
                            <p>{cookies?.langauge === "en" ? "Picture *" : "Pictograma *"}</p>
                            <div className="picture-options">
                                {DIAGNOSTICS.map((treatment, idx) => (
                                    <div className={`treatment ${picture === treatment.source.split("/").at(-1) ? "active" : ""}`}  key={idx} onClick={() => {
                                        const source = picturesRef.current[idx].src;
                                        const pictureName = source.split("/").at(-1);
                                        setPicture(pictureName);
                                    }}>
                                        <div>
                                            <div className="circle">
                                                <FontAwesomeIcon icon={faCheck} className={`check-icon`} />
                                            </div>

                                            <p>{treatment[`name_${cookies?.language}`]}</p>
                                        </div>
                                        <img src={treatment.source} ref={ref => picturesRef.current[idx] = ref} />

                                    </div>
                                ))}
                            </div>
                        </div>


                        <button type="submit"  className="confirm-button" onClick={async () => await createTreatmentCategoryRequest()}>{cookies.language === "en" ? "Save": "Salveaza"}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default EditDiagnostic;