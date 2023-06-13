import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Header from "../../Components/Header/Header";
import "./CreateDiagnostic.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck, faTooth } from "@fortawesome/free-solid-svg-icons";
import InputColor from "react-input-color";
import TickAnimation from "../../utils/TickAnimation";
import Select from "react-select";
import DIAGNOSTICS from "../../utils/Diagnostics";
import MultiSelect from "../../Components/MultiSelect/MultiSelect";
import getTeethSurfaces from "../../utils/TeethSurfaces";
import GetToothSurfaces from "../../utils/TeethSurfaces";
import { TEETH, TEETH_KIDS, TEETH_KIDS_NUMBERS } from "../../utils/TeethOrder";

const CreateDiagnosticPatient = ({ data }) => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies();


    const [color, setColor] = useState({});


    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "light");
    const [notes, setNotes] = useState("");
    const [diagnosticNameValue, setDiagnosticNameValue] = useState("");
    const [diagnosticValue, setDiagnosticValue] = useState("");
    const pricePersRef = useRef([]);
    const typesRef = useRef([]);
    const picturesRef = useRef([]);
    const noVideoContentRef = useRef();

    const pricePers = cookies.language === "en" ? ["Tooth", "Dental Arch", "Session"] : ["Dinte", "Arcada", "Sedinta"];
    const types = cookies?.language === "en" ? ["General", "Specialized"] : ["General", "Specializat"];

    const [toothSelected, setToothSelected] = useState([]);
    const [toothSurfaces, setToothSurfaces] = useState("");
    
    const location = useLocation();

    const diagnosticOptions = useMemo(() => data.organisation?.diagnostics.map(diagnostic => {
        return {
            value: `${diagnostic.id}`,
            label: `${diagnostic.name}`,
            color: diagnostic.color
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
        setTheme(cookies?.theme || "light");
    }, [cookies]);

    useEffect(() => {
        (async () => {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    patientId: id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/check-patient`, options);
            const response = await request.json();
            if (!response.success) navigate(-1);
        })();
    }, []);

    const createTreatmentCategoryRequest = async () => {

        if (!diagnosticValue.length) return setErrorMessage(cookies.language === "en" ? "Fill each required field!" : "Completeaza toate campurile obligatorii!");

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                notes,
                teethSelected: toothSelected,
                teethSurfaces: toothSurfaces,
                patientId: id,
                diagnosticId: diagnosticValue
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-diagnostic-initial-status`, options);
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

    const currTeethTypes = cookies.language === "en" ? ['Temporary', 'Permanently', 'Mix'] : ['Temporara', 'Permanenta', 'Mixta'];
    const [teethType, setTeethType] = useState(cookies?.language === "en" ? "Permanently" : "Permanenta");

    const currTeethTypeRef = useRef([]);

 
    const toggleTeethType = (idx) => {
        currTeethTypeRef.current[idx].classList.toggle("active");
        currTeethTypeRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        console.log(currTeethTypeRef.current[idx].classList.contains("active") ? currTeethTypes[idx] : "");
        setTeethType(currTeethTypeRef.current[idx].classList.contains("active") ? currTeethTypes[idx] : "");    
    };

    if (!id) return navigate(-1);

    const diagnosticsColors = data.organisation.diagnostics.map(diagnose => diagnose.color);
    console.log(diagnosticsColors);

    const triggerToothSelected = (idx) => {
        if (toothSelected.find(teeth => teeth === idx)) 
            return setToothSelected(currToothSelected => currToothSelected.filter(teeth => teeth !== idx));
        return setToothSelected(currToothSelected => [...currToothSelected, idx]);
    };

    const handleChangeToothSurfaces = (values) => {
        const letters = values.map(value => value.at(-2));
        let word = "";
        letters.forEach(letter => word += letter);
        setToothSurfaces(word);
    };

    return (
        <div className="patients-account-details">
            <Navigation page="" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? "Diagnose created successfully!" : "Diagnosticul a fost creat cu succes!"} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Add Diagnose" : "Adauga Diagnostic"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form diagnostic-patient">
                        <div className="input">
                            <p>{cookies.language === "en" ? "Diagnose *" : "Diagnostic *"}</p>
                            <Select 
                                options={diagnosticOptions} 
                                placeholder={diagnosticNameValue} 
                                value={{ label: diagnosticNameValue && diagnosticNameValue.length ? diagnosticNameValue : cookies.language === "en" ? "Select diagnose..." : "Selecteaza diagnosticul...", value: diagnosticValue }}
                                styles={customStyles} 
                                onChange={e => {
                                    setDiagnosticValue(e.value);
                                    setDiagnosticNameValue(e.label);
                                }} 
                                readOnly={isTouchDevice()}
                            />
                        </div>


                        <div className="input">
                            <p>{cookies?.language === "en" ? "Tooth Surfaces" : "Suprafete dinte"}</p>
                            <MultiSelect options={GetToothSurfaces()} handleChanges={handleChangeToothSurfaces} />
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                            <textarea placeholder={cookies.language === "en" ? "Notes" : "Observatii"} value={notes || ""} onChange={e => setNotes(e.target.value)} />
                        </div>


                       
                    </div>

                    <div className="patient-account-details teeth-surfaces">
                                <div className="inputs-container">
                                    <div className="input">
                                        <div className="input-title">
                                            <FontAwesomeIcon className="icon" icon={faTooth} />
                                            <p>{cookies.language === "en" ? "Dentition Type: " : "Tipul dentitiei: "}</p>
                                        </div>
                                        
                                        <div className="options">
                                            {currTeethTypes.map((currTeethType, idx) => (
                                                <div className={`option ${currTeethType === teethType ? "active" : ""}`} key={idx} ref={ref => currTeethTypeRef.current[idx] = ref}>
                                                    <div className="circle" onClick={() => toggleTeethType(idx)}>
                                                        
                                                        <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                        
                                                    </div>
                                                    <p className="patient-gender">{currTeethType}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                         
                            
                        {(teethType === currTeethTypes[1] || teethType === currTeethTypes[2]) ? (
                                <div className="teeth-container">
                                    {TEETH.map((tooth, idx) => (
                                        <div className={`tooth-container ${toothSelected.find(teeth => teeth === tooth) ? "active" : ""}`} key={idx} onClick={() => triggerToothSelected(tooth)}>
                                            {idx <= 15 ? <p>{tooth}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}.png`} />
                                            {idx > 15 ? <p>{tooth}</p> : null}
                                        </div>
                                    ))}
                                </div>
                            ): null}

                            {(teethType === currTeethTypes[0] || teethType === currTeethTypes[2]) ? (
                                <div className="teeth-container kids-teeth">
                                    {TEETH_KIDS.map((tooth, idx) => (
                                        <div className={`tooth-container ${toothSelected.find(teeth => teeth === TEETH_KIDS_NUMBERS[idx]) ? "active" : ""}`} onClick={() => triggerToothSelected(TEETH_KIDS_NUMBERS[idx])} key={idx}>
                                            {idx <= 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}.png`} />
                                            {idx > 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            <div className="form diagnostic-patient">
                                <button type="submit"  className="confirm-button" onClick={async () => await createTreatmentCategoryRequest()}>{cookies.language === "en" ? "Add Diagnose": "Adauga Diagnostic"}</button>
                                <p className="error">{errorMessage}</p>
                            </div>
                        </div>
                )}
            </div>
        </div>
    );
};

export default CreateDiagnosticPatient;