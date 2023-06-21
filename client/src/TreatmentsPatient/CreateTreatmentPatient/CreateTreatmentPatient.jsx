import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Header from "../../Components/Header/Header";
import "../../DiagnosticPatient/CreateDiagnosticPatient/CreateDiagnostic.css";
import "./CreateTreatmentPatient.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck, faTooth } from "@fortawesome/free-solid-svg-icons";
import TickAnimation from "../../utils/TickAnimation";
import Select from "react-select";
import MultiSelect from "../../Components/MultiSelect/MultiSelect";
import GetToothSurfaces from "../../utils/TeethSurfaces";
import { TEETH, TEETH_KIDS, TEETH_KIDS_NUMBERS } from "../../utils/TeethOrder";
import DateCustomInput from "../../Components/DatePicker/DatePicker";

const CreateTreatmentPatient = ({ data }) => {

    const { id } = useParams();

    if (!id) navigate(-1);


    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies();


    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "light");
    const [notes, setNotes] = useState("");
    const [doctorNameValue, setDoctorNameValue] = useState("");
    const [treatmentNameValue, setTreatmentNameValue] = useState("");
    const [treatmentValue, setTreatmentValue] = useState("");
    const [treatmentPlanValue, setTreatmentPlanValue] = useState("");
    const [treatmentPlanNameValue, setTreatmentPlanNameValue] = useState("");
    const [treatmentPlanTreatments, setTreatmentPlanTreatments] = useState([]);
    const [treatmentPlanTreatmentNameValue, setTreatmentPlanTreatmentNameValue] = useState("");
    const [treatmentPlanTreatmentValue, setTreatmentPlanTreatmentValue] = useState("");
    const [treatmentPlanTreatmentActive, setTreatmentPlanActive] = useState();
    const [total, setTotal] = useState("");
    const [totalNegotiated, setTotalNegotiated] = useState("");
    const [materialPrice, setMaterialPrice] = useState(0);
    const [treatmentType, setTreatmentType] = useState(cookies?.language === "en" ? "Treatment" : "Tratament");
    const [activeToothSurfaces, setActiveToothSurfaces] = useState(false);
    const [date, setDate] = useState(new Date());
    const [currStatus, setCurrStatus] = useState(cookies?.language === "en" ? "Realizat" : "Realizat");
    const [currStatusIdx, setCurrStatusIdx] = useState(0);

    const currTreatmentTypeRef = useRef([]);

    const [doctorValue, setDoctorValue] = useState("");
    
    const noVideoContentRef = useRef();
    const [objToothSurfaces, setObjToothSurfaces] = useState([]);

  
    const [toothSelected, setToothSelected] = useState([]);
    const [toothSurfaces, setToothSurfaces] = useState("");
    const [activeTooth, setActiveTooth] = useState("");


    const currTeethTypes = cookies.language === "en" ? ['Temporary', 'Permanently', 'Mix'] : ['Temporara', 'Permanenta', 'Mixta'];
    const treatmentTypes = cookies.language === "en" ? ['Treatment', 'Treatment Plan'] : ["Tratament", "Plan de tratament"];
    const statusTypes = cookies?.language === "en" ? ["Accomplished", "Proposed", "Unrealized"] : ["Realizat", "Propus", "Nerealizat"];
    
    const [teethType, setTeethType] = useState(cookies?.language === "en" ? "Permanently" : "Permanenta");
    const currTeethTypeRef = useRef([]);
    const currStatusTypeRef = useRef([]);
    const location = useLocation();
    const pricePerCategories = cookies.language === "en" ? ["Tooth", "Dental Arch", "Session"] : ["Dinte", "Arcada", "Sedinta"];


    const treatmentsOptions = useMemo(() => data.organisation?.treatments.map(treatment => {
        return {
            value: `${treatment._id}`,
            label: `${treatment.name} (${treatment.price} LEI / ${pricePerCategories[Number(treatment.pricePer)]})`,
            color: treatment.color
        };
    }));
    

    const treatmentPlansOptions = useMemo(() => data.organisation?.treatments_plan_patients.map(treatmentPlan => {
        return {
            value: `${treatmentPlan._id}`,
            label: `${treatmentPlan.name}`
        };
    }));

    const doctorsOptions = useMemo(() => data.organisation?.doctors.map(doctor => {
        return {
            value: `${doctor._id}`,
            label: `${doctor.firstname} ${doctor.lastname}`
        };
    }));

    const customStyles = useMemo(() => {
        return {
        control: (base, state) => ({
            ...base,
            background: "var(--over-difference-color-2)",
            border: "none",
            borderRadius: 10,
            width: "90%",
            margin: "0 auto",
            boxShadow: state.isFocused ? "0 0 10px var(--contrast-color)" : "initial",
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

    const isTouchDevice = () => {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    };

    useLayoutEffect(() => {
      
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
        if (!treatmentPlanTreatmentValue.length && !treatmentValue.length) return setErrorMessage(cookies?.language === "en" ? "Select a treatment!" : "Selecteaza un tratament!");
        if (!doctorValue.length) return setErrorMessage(cookies.language === "en" ? "Fill each required field!" : "Completeaza toate campurile obligatorii!");
        if (!activeTooth.length) return setErrorMessage(cookies?.language === "en" ? "Select minimum a teeth!" : "Selecteaza cel putin un dinte!");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                notes,
                teeth: toothSelected,
                teethSurfaces: toothSurfaces,
                patientId: id,
                doctorId: doctorValue,
                treatmentPlanId: treatmentType !== 'Plan de tratament' && treatmentType !== 'Treatment Plan' ? null : treatmentPlanValue,
                treatmentId: treatmentType !== 'Plan de tratament' && treatmentType !== 'Treatment Plan' ? treatmentValue: treatmentPlanTreatmentValue,
                status: currStatus,
                totalPrice: total,
                totalNegotiated: totalNegotiated,
                materialPrice: materialPrice,
                notes: notes,
                date: new Date(date),
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-patient-treatment`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                // noVideoContentRef.current.classList.add("invisible");
                // document.body.style.background = theme === "light" ? "#fff" : "#000";
                // setAssistantAdded(true);
                return window.location.replace(`/patient/${id}/4`);

            } else console.log(errorMessage);
        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    };

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        window.location.replace(`/patient/${id}/4`);
    };
 
    const toggleTeethType = (idx) => {
        currTeethTypeRef.current[idx].classList.add("active");
        currTeethTypeRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        setTeethType(currTeethTypeRef.current[idx].classList.contains("active") ? currTeethTypes[idx] : "");    
    };

    const toggleTreatmentTypes = (idx) => {
        currTreatmentTypeRef.current[idx].classList.add("active");
        currTreatmentTypeRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        setTreatmentType(currTreatmentTypeRef.current[idx].classList.contains("active") ? treatmentTypes[idx] : "");    
    };  
    
    const toggleStatusTypes = (idx) => {
        currStatusTypeRef.current[idx].classList.add("active");
        currStatusTypeRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        setCurrStatus(currStatusTypeRef.current[idx].classList.contains("active") ? statusTypes[idx] : "");    
    };  
 

    const triggerToothSelected = (idx) => {
        if (treatmentType === 'Plan de tratament' || treatmentType === 'Treatment Plan') return;
        if (toothSelected.find(teeth => teeth === idx)) 
            return setToothSelected(currToothSelected => currToothSelected.filter(teeth => teeth !== idx));
        return setToothSelected(currToothSelected => [...currToothSelected, idx]);
    };

    useEffect(() => {
        if (treatmentType !== 'Plan de tratament' && treatmentType !== 'Treatment Plan') return;
        // setToothSelected();
    }, []);

    useEffect(() => {
        if (treatmentPlanValue.length === 0) return;
        if (treatmentType !== 'Plan de tratament' && treatmentType !== 'Treatment Plan') return;
        const currTreatmentPlan = data.organisation.treatments_plan_patients.find(treatmentPlan => treatmentPlan._id === treatmentPlanValue);
        const currTreatments = JSON.parse(currTreatmentPlan.treatments);
        setTreatmentPlanTreatments(currTreatments);
    }, [treatmentPlanValue, treatmentType]);

    useEffect(() => {

    }, []);

    const handleChangeToothSurfaces = (values) => {
        const letters = values.map(value => value.at(-2));
        let word = "";
        letters.forEach(letter => word += letter);
        setToothSurfaces(word);
    };

    useEffect(() => {
        let currStr = "";
        toothSelected && toothSelected.length && toothSelected.forEach((tooth, idx) => idx === 0 ? currStr += tooth : currStr = currStr + ", " + tooth);
   
        setActiveTooth(currStr);
    }, [toothSelected]);

    useEffect(() => {
        if (treatmentPlanTreatments.length === 0 || !treatmentPlanTreatmentValue?.length) return setActiveToothSurfaces(false);
        if (treatmentType !== 'Plan de tratament' && treatmentType !== 'Treatment Plan') return setActiveToothSurfaces(false);

        const currTreatmentPlan = data.organisation.treatments_plan_patients.find(treatmentPlan => treatmentPlan._id === treatmentPlanValue);

        if (!currTreatmentPlan) return;
        const currTreatment = JSON.parse(currTreatmentPlan.treatments).find(treatment => treatment.treatmentId === treatmentPlanTreatmentValue);
        if (!currTreatment) return;
        setToothSelected(currTreatment.teeth);
        handleChangeToothSurfaces(currTreatment.teethSurfaces);
        setObjToothSurfaces(currTreatment.teethSurfaces);
        setActiveToothSurfaces(true);

        setTotal(parseFloat(currTreatment.total).toFixed(2));
        setTotalNegotiated(parseFloat(currTreatment.totalNegotiated).toFixed(2));
    }, [treatmentPlanValue, treatmentType, treatmentPlanTreatmentValue]);

    useEffect(() => {
        if (treatmentType === 'Plan de tratament' || treatmentType === 'Treatment Plan') return;
        if (!treatmentValue?.length) return;
        const currTreatment = data.organisation.treatments.find(treatment => treatment._id === treatmentValue);
        if (!currTreatment) return;
        const currPricePer = pricePerCategories[Number(currTreatment.pricePer)].toLowerCase();
        setTotal(currPricePer === "tooth" || currPricePer === "dinte" ? parseFloat(currTreatment.price).toFixed(2) * toothSelected.length : parseFloat(currTreatment.price).toFixed(2));
        setTotalNegotiated(currPricePer === "tooth" || currPricePer === "dinte" ? parseFloat(currTreatment.price).toFixed(2) * toothSelected.length : parseFloat(currTreatment.price).toFixed(2));
    }, [treatmentType, treatmentValue]);

    useEffect(() => {
        if (treatmentType === 'Plan de tratament' || treatmentType === 'Treatment Plan') return;
        if (!treatmentValue?.length) return;
        const currTreatment = data.organisation.treatments.find(treatment => treatment._id === treatmentValue);
        if (!currTreatment) return;
        const currPricePer = pricePerCategories[Number(currTreatment.pricePer)].toLowerCase();
        if (currPricePer !== "tooth" && currPricePer !== "dinte") return;
        setTotal(parseFloat(currTreatment.price).toFixed(2) * toothSelected.length);
        setTotalNegotiated(parseFloat(currTreatment.price).toFixed(2) * toothSelected.length);
    }, [toothSelected]);


    useEffect(() => {
        console.log(objToothSurfaces);
    }, [objToothSurfaces]);

    return (
        <div className="patients-account-details">
            <Navigation page="" />
            <div className="content" style={assistantAdded ? { maxHeight: "100vh" } : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? "Treatment added successfully!" : "Tratamentul a fost adaugat cu succes!"} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Add Treatment" : "Adauga Tratament"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form diagnostic-patient">



                        <div className="input one-row">
                            <p>{cookies.language === "en" ? "Treatment *" : "Tratament *"}</p>
                            <div className="inputs-container">
                                    <div className="input">
                                        {/* <div className="input-title">
                                            <p>{cookies.language === "en" ? "Dentition Type: " : "Tipul dentitiei: "}</p>
                                        </div> */}
                                        
                                        <div className="options">
                                            {treatmentTypes.map((currTeethType, idx) => (
                                                <>
                                                    <div className={`option ${currTeethType === treatmentType ? "active" : ""}`} key={idx} ref={ref => currTreatmentTypeRef.current[idx] = ref}>
                                                        <div className="circle" onClick={() => toggleTreatmentTypes(idx)}>
                                                            
                                                            <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                            
                                                        </div>
                                                        <p className="patient-gender">{currTeethType}</p>
                                                    </div>
                                                    {idx === 0 ? (
                                                          <Select 
                                                            options={treatmentsOptions} 
                                                            placeholder={treatmentNameValue} 
                                                            value={{ label: treatmentNameValue && treatmentNameValue.length ? treatmentNameValue : (cookies.language === "en" ? "Select treatment..." : "Selecteaza tratamentul..."), value: treatmentValue }}
                                                            styles={customStyles} 
                                                            onChange={e => {
                                                                setTreatmentValue(e.value);
                                                                setTreatmentNameValue(e.label);
                                                                
                                                            }} 
                                                            readOnly={isTouchDevice()}
                                                        />
                                                    ) : (
                                                        <Select 
                                                            options={treatmentPlansOptions} 
                                                            placeholder={treatmentPlanNameValue} 
                                                            value={{ label: treatmentPlanNameValue && treatmentPlanNameValue.length ? treatmentPlanNameValue : (cookies.language === "en" ? "Select treatment plan..." : "Selecteaza planul de tratament..."), value: treatmentPlanValue }}
                                                            styles={customStyles} 
                                                            onChange={e => {
                                                                setTreatmentPlanValue(e.value);
                                                                setTreatmentPlanNameValue(e.label);
                                                            }} 
                                                            readOnly={isTouchDevice()}
                                                        />
                                                    )}

                                                    {idx === 1 && treatmentPlanTreatments.length ? (
                                                        <Select 
                                                            options={treatmentPlanTreatments.map(treatment => {
                                                                return { value: treatment.treatmentId, label: treatment.name };
                                                            })} 
                                                            placeholder={treatmentPlanTreatmentNameValue} 
                                                            value={{ label: treatmentPlanTreatmentNameValue && treatmentPlanTreatmentNameValue.length ? treatmentPlanTreatmentNameValue : (cookies.language === "en" ? "Select treatment..." : "Selecteaza tratament..."), value: treatmentPlanTreatmentValue }}
                                                            styles={customStyles} 
                                                            onChange={e => {
                                                                setTreatmentPlanTreatmentValue(e.value);
                                                                setTreatmentPlanTreatmentNameValue(e.label);
                                                            }} 
                                                            readOnly={isTouchDevice()}
                                                        />
                                                    ) : null}
                                                
                                                </>
                                               
                                            ))}
                                        </div>

                                    </div>
                                </div>
                         
                        </div>


                        <div className="input">
                            <p>{cookies?.language === "en" ? "Selected tooth" : "Dintii selectati"}</p>
                            <input type="text" value={activeTooth} disabled />
                        </div>




                        <div className="input">
                            <p>{cookies?.language === "en" ? "Tooth Surfaces" : "Suprafete dinte"}</p>
                            {activeToothSurfaces ? (
                                <div className="aaa">
                                   <MultiSelect options={GetToothSurfaces()} handleChanges={handleChangeToothSurfaces} defaultValue={objToothSurfaces}  />

                                </div>
                               
                            ) : <MultiSelect options={GetToothSurfaces()} handleChanges={handleChangeToothSurfaces} defaultValue={[]}  />
                            }
                        </div>



                        <div className="input">
                            <p>{cookies?.language === "en" ? "Doctor *" : "Medic *"}</p>
                            <Select 
                                options={doctorsOptions}
                                placeholder={doctorNameValue}
                                value={{ label: doctorNameValue && doctorNameValue.length ? doctorNameValue : (cookies?.language === "en" ? "Selecteaza doctor..." : "Selecteaza medicul..."),  value: doctorValue }}
                                onChange={e => {
                                    setDoctorNameValue(e.label);
                                    setDoctorValue(e.value);
                                }} 
                                styles={customStyles}
                                readOnly={isTouchDevice()}
                            />
                        </div>

                        <div className="input">
                            <p>{cookies?.language === "en" ? "Material Price" : "Pret Material"}</p>
                            <input type="number" value={materialPrice} onChange={(e) => setMaterialPrice(e.target.value)} onBlur={() => setMaterialPrice(currValue => parseFloat(currValue).toFixed(2))} />
                        </div>

                        <div className="input">
                            <p>{cookies?.language === "en" ? "Total *" : "Total *"}</p>
                            <input type="number" value={total} disabled />
                        </div>


                        <div className="input">
                            <p>{cookies?.language === "en" ? "Total Negotiated *" : "Total Negociat *"}</p>
                            <input type="number" value={totalNegotiated} onChange={(e) => setTotalNegotiated(e.target.value)} onBlur={() => setTotalNegotiated(currValue => parseFloat(currValue).toFixed(2))} />
                        </div>


                        <div className="input">
                            <p>{cookies?.language === "en" ? "" : ""}</p>
                            <Select 
                                options={statusTypes.map((status, idx) => {
                                    return { value: idx, label: status };
                                })} 
                                placeholder={treatmentPlanTreatmentNameValue} 
                                value={{ label: currStatus && currStatus ? currStatus : (cookies.language === "en" ? "Select status..." : "Selecteaza statusul curent..."), value: currStatusIdx }}
                                styles={customStyles} 
                                onChange={e => {
                                    setCurrStatusIdx(e.value);
                                    setCurrStatus(e.label);
                                }} 

                                readOnly={isTouchDevice()}
                            />
                        </div>

                        <div className="input">
                            <p></p>
                            <DateCustomInput initialDate={date} changeDate={(newDate) => setDate(new Date(newDate))} future={true} past={false} />
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
                            <button type="submit"  className="confirm-button" onClick={async () => await createTreatmentCategoryRequest()}>{cookies.language === "en" ? "Add Treatment": "Adauga Tratament"}</button>
                            <p className="error">{errorMessage}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateTreatmentPatient;