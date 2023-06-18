import { faAngleDown, faAngleLeft, faAngleUp, faCheck, faPlus, faTimes, faTooth, faZ } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Navigation from "../../Components/Navigation/Navigation";
import Select from 'react-select';
import "../../EditDoctorSchedule/EditDoctorSchedule.css";
import "../CreateTreatmentPlanPatient/CreateTreatmentPlanPatient.css";
import MultiSelect from "../../Components/MultiSelect/MultiSelect";
import { TEETH, TEETH_KIDS, TEETH_KIDS_NUMBERS } from "../../utils/TeethOrder";
import DateCustomInput from "../../Components/DatePicker/DatePicker";
import TickAnimation from "../../utils/TickAnimation";

const EditTreatmentPlanPatient = ({ data }) => {

    const [cookies, setCookie] = useCookies();

    const param = useParams();
    // const dateJS = new Date(date);
    // const day = dateJS.getDate();
    // const month = dateJS.getMonth();
    // const year = dateJS.getFullYear();
    // const dayNumber = dateJS.getDay();

    const [treatments, setTreatments] = useState([]);
    const [treatmentPlans, setTreatmentPlans] = useState(data.organisation.treatments_plan_patients.filter(plan => plan.patientId === param?.id).length);
    const [editing, setEditing] = useState(false);
    const [changes, setChanges] = useState(false);
    const [addedTreatment, setAddedTreatment] = useState(0);
  
    const [notes, setNotes] = useState([]);
    const [applyToCalendarValue, setApplyToCalendarValue] = useState(false);
    const [patientFullName, setPatientFullName] = useState(`${data.organisation.patients.find(patient => patient._id === param?.id)?.firstname || ""} ${data.organisation.patients.find(patient => patient._id === param?.id)?.lastname || ""}`);

    const [treatmentPlanName, setTreatmentPlanName] = useState(cookies.language === "en" ? `Treatment Plan - ${patientFullName} ${treatmentPlans + 1 > 1 ? treatmentPlans + 1 : ""}` : `Plan de tratament - ${patientFullName} ${treatmentPlans + 1 > 1 ? treatmentPlans + 1 : ""}`);
    const [treatmentNameValue, setTreatmentNameValue] = useState([]);
    const [treatmentPricePerValue, setTreatmentPricePerValue] = useState([]);
    const [treatmentPriceValue, setTreatmentPriceValue] = useState([]);
    const [treatmentValue, setTreatmentValue] = useState([]);
    const [teethValue, setTeethValue] = useState("");
    const [teethSelected, setTeethSelected] = useState([]);
    const [teethSurfacesValue, setTeethSurfacesValue] = useState([]);
    const [total, setTotal] = useState(parseFloat(0).toFixed(2));
    const [totalNegotiated, setTotalNegotiated] = useState(parseFloat(0).toFixed(2));
    const [totalValue, setTotalValue] = useState([]);
    const [totalNegotiatedValue, setTotalNegotiatedValue] = useState([]);
    const [profilaxionValue, setProfliaxionValue] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [dateValue, setDateValue] = useState(new Date());
    const [errorMessages, setErrorMessages] = useState([]);
    const [toothImage, setToothImage] = useState({});
    const [toothImageCurrentStatus, setToothImageCurrentStatus] = useState({});
    const [treatmentSelected, setTreatmentSelected] = useState();
    const [toothImageInitialStatusKids, setToothImageInitialStatusKids] = useState({});
    const [toothImageCurrentStatusKids, setToothImageCurrentStatusKids] = useState({});
    const currTeethTypes = cookies.language === "en" ? ['Temporary', 'Permanently', 'Mix'] : ['Temporara', 'Permanenta', 'Mixta'];
    const [teethType, setTeethType] = useState(cookies?.language === "en" ? "Permanently" : "Permanenta");
    const [statusValue, setStatusValue] = useState(cookies?.langauge === "en" ? "Planified" : "Planificat");
    const [initialStatusValue, setInitialStatusValue] = useState(cookies?.language === "en" ? "The treatment plan starts from the initial status" : "Planul de tratament incepe de la statusul initial");
    
    const [treatmentPlanCreated, setTreatmentPlanCreated] = useState(false);
    const treatmentPlanMessage = cookies?.language === "en" ? "Treatment plan was modified successfully!" : "Planul de tratament a fost modificat cu succes!";
    const currTeethTypeRef = useRef([]);
    const statusRef = useRef([]);
    const initialStatusRef = useRef([]);
    const noVideoContentRef = useRef();


    const toggleTeethType = (idx) => {
        currTeethTypeRef.current[idx].classList.add("active");
        currTeethTypeRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        setTeethType(currTeethTypeRef.current[idx].classList.contains("active") ? currTeethTypes[idx] : "");    
    };

    const toggleStatus = (idx) => {
        statusRef.current[idx].classList.add("active");
        statusRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        setStatusValue(statusRef.current[idx].classList.contains("active") ? statuses[idx] : "");    
    };

    const toggleInitialStatus = (idx) => {
        initialStatusRef.current[idx].classList.add("active");
        initialStatusRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        setInitialStatusValue(initialStatusRef.current[idx].classList.contains("active") ? statuses[idx] : "");    
    };

    const currentToothSurfaces = cookies?.language === "en" ? [
        "Vestibular (V)",
        "Lingual (L)",
        "Palatal (P)",
        "Mesial (M)",
        "Distal (D)",
        "Occlusal (O)"
    ] : [
        "Vestibulara (V)",
        "Linguala (L)",
        "Palatinala (P)",
        "Mezilala (M)",
        "Distala (D)",
        "Ocluzala (O)"
    ];

    const statuses = cookies?.language === "en" ? ["Planified", "Ongoing", "Completed"] : ["Planificat", "In derulare", "Finalizat"];
    const initialStatuses = cookies?.langauge === "en" ? ["The treatment plan starts from the initial status", "The treatment plan starts from the current status of the teeth"] : ["Planul de tratament incepe de la statusul initial", "Planul de tratament incepe de la statusul actual al danturii"];

    const navigate = useNavigate();

    const pricePerCategories = cookies.language === "en" ? ["Tooth", "Dental Arch", "Session"] : ["Dinte", "Arcada", "Sedinta"];

    const doctorOptions = data.organisation.treatments.map(treatment => {
        return {
            value: `${treatment._id}`,
            label: `${treatment.name} (${treatment.price} lei / ${pricePerCategories[Number(treatment.pricePer)]})`,
            color: treatment.color,
            price: Number(treatment.price),
            pricePer: treatment.pricePer,
            category: treatment.category
        };
    });

    const customStyles = {
        control: (base, state) => ({
            ...base,
            background: "var(--over-difference-color)",
            border: "none",
            borderRadius: 10,
            width: "90%",
            margin: "0 auto",
            boxShadow: "0 0 10px var(--contrast-color)",
            color: "#000"
        }),

        option: (provided, state) => ({
            ...provided,
            color: "rgba(255, 255, 255, .85)",
            background: state.isSelected ? "var(--contrast-color)" : state.isFocused ? "var(--contrast-color)" : "initial",
            borderRadius: 10
        }),
        
        menu: (provided, state) => ({
            ...provided,
            
            
            background: "var(--dark-color)",
            border: "none",
            borderRadius: 10,
            boxShadow: "0 0 15px var(--dark-color)"
        }),

        singleValue: (provided) => ({
            ...provided,
            color: "var(--text-color)",
            width: "100%"
        })
    };

    const removeTreatment = (idx) => {
        setTreatments(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTreatmentValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTreatmentNameValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTreatmentPriceValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTreatmentPricePerValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx))
        setProfliaxionValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTreatmentValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setNotes(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTeethValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTeethSelected(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTeethSurfacesValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTotalValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setTotalNegotiatedValue(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
        setErrorMessages(currTreatments => currTreatments.filter((_, currIdx) => currIdx !== idx));
    };
    
    const saveChanges = async () => {
        console.log(treatmentValue);

        if (treatmentValue && treatmentValue.length && treatmentValue.some(treatment => treatment === "")) return;
        console.log("past");
        const appearedTreatments = {};
        treatmentValue.forEach((treatmentId, idx) => {
            if (!appearedTreatments[treatmentId]) appearedTreatments[treatmentId] = [idx];
            else appearedTreatments[treatmentId].push(idx);
        }); 

        for (let treatmentId in appearedTreatments) {
            appearedTreatments[treatmentId].forEach(idx => {

            });
        }

        const currTreatments = [];

        treatmentValue.forEach((currTreatmentValue, idx) => {
            currTreatments.push({
                organisationId: data.organisation._id,
                treatmentId: currTreatmentValue,
                teeth: teethSelected[idx],
                teethSurfaces: teethSurfacesValue[idx],
                profilaxion: profilaxionValue[idx],
                notes: notes[idx],
                name: treatmentNameValue[idx],
                totalNegotiated: totalNegotiatedValue[idx],
                total: totalValue[idx]
            });
        });
        
  
            
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                treatments: currTreatments,
                organisationId: data.organisation._id, 
                patientId: param?.id, 
                name: treatmentPlanName, 
                status: statusValue, 
                totalPrice: total, 
                totalNegotiated: totalNegotiated, 
                initialState: initialStatusValue, 
                date: new Date(dateValue),
                treatmentPlanId: param?.treatmentPlanId
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-treatment-plan`, options);
            const response = await request.json();
            if (response.success) {
                document.body.style.background = cookies?.theme === "dark" ? "#000" : "#fff";
                noVideoContentRef.current.classList.add("invisible");
                setTreatmentPlanCreated(true);
            } else console.log(response);
        } catch(e) {
            console.log(e);
        }


        //window.history.replaceState({ fromSchedules: true }, '');
        // window.location.replace("/doctors-schedule");

    };

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        window.history.replaceState({ 
            activeOption: 3, 
            success: true, 
        }, "");
        window.location.replace(`/patient/${param?.id}/3`);
    };

    // useEffect(() => {
    //     setTreatmentPlanName(currTreatmentName => currTreatmentName + " a");
    //     setTreatmentPlanName(currTreatmentName => currTreatmentName.slice(currTreatmentName.length - 2));

    // }, []);

    useLayoutEffect(() => {
        if (!treatments || !treatments.length) return;
        // setTreatmentValue([]);
        // setTreatmentNameValue([]);
        // setTreatmentPriceValue([]);
        // setTreatmentPriceValue([]);
        
        // setNotes([]);
        // setErrorMessages([]);
        setTreatments(currTreatments => [...currTreatments, {}]);

        treatments.forEach((treatment, idx) => {
            setTreatmentValue(currValues => [...currValues, treatment?.treatmentId || ""]);
            setTreatmentNameValue(currValues => [...currValues, treatment?.name || ""]);
            setTreatmentPriceValue(currValues => [...currValues, treatment?.priceValue || ""])
            setTreatmentPricePerValue(currValues => [...currValues, treatment?.pricePerValue || ""]);

            setProfliaxionValue(currValues => [...currValues, treatment?.profilaxionValue || false]);
            setNotes(currValue => [...currValue, treatment?.notes || ""]);
            setTeethValue(currValue => [...currValue, treatment?.teethValue || ""]);
            setTeethSelected(currValue => [...currValue, treatment?.teeth || []]);
            setTeethSurfacesValue(currValue => [...currValue, treatment?.teethSurfaces || []]);
            setTotalValue(currValue => [...currValue, treatment?.total || ""]);
            setTotalNegotiatedValue(currValue => [...currValue, treatment?.totalNegotiated || ""]);
            setErrorMessages(currValue => [...currValue, treatment?.errorMessages || ""]);
        });

    }, [addedTreatment]);
    
    useEffect(() => {
        setTotal(totalValue.reduce((currTotal, currValue) => currTotal + Number(currValue), 0));
        setTotalNegotiated(totalNegotiatedValue.reduce((currTotal, currValue) => currTotal + Number(currValue), 0));
    }, [totalValue, totalNegotiatedValue]);

    useEffect(() => {
        if (treatmentSelected == null) return;
        let str = "";
        const currTeeth = teethSelected?.[treatmentSelected]?.sort((trt1, trt2) => Number(trt1) - Number(trt2));
        currTeeth.forEach(tooth => str = str + tooth + ", ");
        console.log(pricePerCategories?.[Number(treatmentPricePerValue?.[0])]?.toLowerCase(), teethSelected[0].length, Number(treatmentPriceValue[0]));
        setTeethValue(currValues => {
            return currValues.map((currValue, idx) => {
                if (idx !== treatmentSelected) return currValue;
                return str.slice(0, str.length - 2);
            });
        });

        setTotalNegotiatedValue(currValues => {
            return currValues.map((currValue, idx) => {
                if (pricePerCategories?.[Number(treatmentPricePerValue?.[idx])]?.toLowerCase() === "tooth" || pricePerCategories?.[Number(treatmentPricePerValue?.[idx])]?.toLowerCase() === "dinte") return teethSelected[idx].length * Number(treatmentPriceValue[idx]);
                return Number(treatmentPriceValue[idx]) || 0;
            });
        });

        setTotalValue(currValues => {
            return currValues.map((currValue, idx) => {
                if (pricePerCategories?.[Number(treatmentPricePerValue?.[idx])]?.toLowerCase() === "tooth" || pricePerCategories?.[Number(treatmentPricePerValue?.[idx])]?.toLowerCase() === "dinte") return teethSelected[idx].length * Number(treatmentPriceValue[idx]);
                return Number(treatmentPriceValue[idx]) || 0;
            });
        });

    }, [teethSelected]);

    const focusActiveMenu = (method1, method2, idx, statement) => {
        console.log("focus");
        method1(currMenus => {
            console.log(currMenus);
            return currMenus.map((activeMenu, menuIdx) => {
                if (menuIdx !== idx) return false;
                return !activeMenu;
            })
        });

        method2(currMenus => {
            console.log(currMenus);
            return currMenus.map((menu) => false);
        });
    };

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
        const currTreatmentPlan = location.state.treatmentPlan;
        const currTreatments = JSON.parse(currTreatmentPlan.treatments);
        setTreatmentPlanName(currTreatmentPlan.name);
        setStatusValue(currTreatmentPlan.status);
        setTotal(parseFloat(currTreatmentPlan.totalPrice).toFixed(2));
        setTotalNegotiated(parseFloat(currTreatmentPlan.totalNegotiated).toFixed(2));
        setInitialStatusValue(currTreatmentPlan.initial_status);
        setDateValue(new Date(currTreatmentPlan.date));

        setTreatmentValue([]);
        setTreatmentNameValue([]);
        setTreatmentPriceValue([]);
        setTreatmentPricePerValue([]);
        setProfliaxionValue([]);
        setNotes([]);
        setTeethValue([]);
        setTeethSelected([]);
        setTeethSurfacesValue([]);
        setTotalValue([]);
        setTotalNegotiatedValue([]);
        setErrorMessages([]);
        setTreatments([]);
        console.log(currTreatments);
        currTreatments.forEach((treatment, idx) => {
            const currTreatment = data.organisation.treatments.find(currTreatment => currTreatment._id === treatment?.treatmentId);
            const currPricePer = pricePerCategories?.[Number(currTreatment?.pricePer)]?.toLowerCase();
            const priceValue = currPricePer === "tooth" || currPricePer === "dinte" ? treatment?.teeth?.length * Number(currTreatment?.price) :  Number(currTreatment?.price);
            console.log(priceValue);

            setTreatmentValue(currValues => [...currValues, treatment?.treatmentId || ""]);
            setTreatmentNameValue(currValues => [...currValues, treatment?.name || ""]);
            setTreatmentPriceValue(currValues => [...currValues, Number(currTreatment?.price) || ""])
            setTreatmentPricePerValue(currValues => [...currValues, Number(currTreatment?.pricePer) || ""]);
            
            setProfliaxionValue(currValues => [...currValues, treatment?.profilaxion || false]);
            setNotes(currValue => [...currValue, treatment?.notes || ""]);
            // setTeethValue(currValue => [...currValue, treatment?.teeth || ""]);
            setTeethSelected(currValue => [...currValue, treatment?.teeth || []]);
            setTeethSurfacesValue(currValue => [...currValue, treatment?.teethSurfaces || []]);
            setTotalValue(currValue => [...currValue, treatment?.total || ""]);
            setTotalNegotiatedValue(currValue => [...currValue, treatment?.totalNegotiated || ""]);
            setErrorMessages(currValue => [...currValue, treatment?.errorMessages || ""]);
            setTreatments(currTreatments => [...currTreatments, {}]);
        });
    }, [location]);

    useEffect(() => {
        console.log(totalValue);
    }, [totalValue]);


    const handleChanges = (idx, values) => {
        setTeethSurfacesValue(currTeethSurfaces => {
            return currTeethSurfaces.map((teethSurface, currIdx) => {
                if (currIdx !== idx) return teethSurface;
                return values;
            })
        });
    };

    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();
                console.log(response);
                if (response.success) setToothImage(currImages => {
                    currImages[tooth] = response.tooth;
                    return currImages;
                });
            } catch (e) {
                console.log(e);
            }
        });
   
    }, [location]);

    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-current-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();

                if (response.success) setToothImageCurrentStatus(currImages => {
                    currImages[tooth] = response.tooth;
                    return currImages;
                });
            } catch (e) {
                console.log(e);
            }
        });
   
    }, [location]);

    useEffect(() => {

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH_KIDS_NUMBERS.forEach(async (tooth, idx) => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageInitialStatusKids(currImages => {
                    currImages[TEETH_KIDS[idx]] = response.tooth;
                    return currImages;
                });
            } catch (e) {
                console.log(e);
            }
        });
    }, [location]);

    useEffect(() => {

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH_KIDS_NUMBERS.forEach(async (tooth, idx) => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-current-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageCurrentStatusKids(currImages => {
                    currImages[TEETH_KIDS[idx]] = response.tooth;
                    return currImages;
                });
                
            } catch (e) {
                console.log(e);
            }
        });
    }, [location]);

    const handleChangeDate = (newBirthdate) => setDateValue(new Date(newBirthdate));

    const toggleTooth = (idx) => {
        if (treatmentSelected == null) return;
        if (teethSelected[treatmentSelected].some(tooth => tooth === idx)) return setTeethSelected(currTeethTreatments => {
            return currTeethTreatments.map((currTeethSelected, teethSelectedIdx) => {
                if (teethSelectedIdx !== treatmentSelected) return currTeethSelected;
                return currTeethSelected.filter(tooth => tooth !== idx);
            });
        });

        setTeethSelected(currTeethTreatments => {
            return currTeethTreatments.map((currTeethSelected, teethSelectedIdx) => {
                if (teethSelectedIdx !== treatmentSelected) return currTeethSelected;
                return [...currTeethSelected, idx];
            });        
        });
    };

    return (
        <div className="edit-doctors-schedule">
            <Navigation page="" />

            <div className="content">
                <Header data={data} />
                {treatmentPlanCreated ? (
                    <TickAnimation animationFinished={animationFinished} title={treatmentPlanMessage} />
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                        <h2 className="title">{cookies.language === "en" ? `Treatment Plan - ${data.organisation.patients.find(patient => patient._id === param?.id)?.firstname || ""} ${data.organisation.patients.find(patient => patient._id === param?.id)?.lastname || ""}` : `Plan de tratament - ${data.organisation.patients.find(patient => patient._id === param?.id)?.firstname || ""} ${data.organisation.patients.find(patient => patient._id === param?.id)?.lastname || ""}`}</h2>
                    
                        <div className="go-back" onClick={() => navigate(-1)}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>


                    
                        {/* {schedules && schedules.length && (
                            <div className="first-row">
                                <div className="row">
                                    <p>{cookies.language === "en" ? "Doctor" : "Medic"}</p>
                                </div>
                                <div className="row">
                                    <p>{cookies.language === "en" ? "Start" : "Inceput"}</p>
                                </div>
                                <div className="row">
                                    <p>{cookies.language === "en" ? "Stop" : "Sfarsit"}</p>
                                </div>
                                <div className="row">
                                    <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                                </div>
                                <div className="row">
                                    <p>{cookies.language === "en" ? "Apply for calendar" : "Aplica pt. tot calendarul"}</p>
                                </div>
                                <div className="row">
                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                </div>
                            </div>
                        )} */}

                            <div className="form diagnostic-patient">
                                <div className="input">
                                    <p>{cookies.langauge === "en" ? "Name *" : "Nume *"}</p>
                                    <input type="text" value={treatmentPlanName} onChange={e => setTreatmentPlanName(e.target.value)} />
                                </div>

                                <div className="input">
                                    <p>{cookies?.language === "en" ? "Date *" : "Data *"}</p>
                                    <DateCustomInput initialDate={new Date()}  changeDate={handleChangeDate} future={true} past={false} label={cookies.language === "en" ? "" : ""} /> 
                                </div>


                                    <div className="inputs-container">

                                        <div className="input">
                                            <div className="input-title">
                                                <p>{cookies.language === "en" ? "Plan status: " : "Status plan: "}</p>

                                                <div className="options">
                                                    {statuses.map((currTeethType, idx) => (
                                                        <div className={`option ${currTeethType === statusValue ? "active" : ""}`} key={idx} ref={ref => statusRef.current[idx] = ref}>
                                                            <div className="circle" onClick={() => toggleStatus(idx)}>
                                                                
                                                                <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                                
                                                            </div>
                                                            <p className="patient-gender">{currTeethType}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="inputs-container">

                                        <div className="input">
                                            <div className="input-title">
                                                <p>{cookies.language === "en" ? "Initial Status: " : "Status initial: "}</p>

                                                <div className="options flex-column">
                                                    {initialStatuses.map((currTeethType, idx) => (
                                                        <div className={`option ${currTeethType === initialStatusValue ? "active" : ""}`} key={idx} ref={ref => initialStatusRef.current[idx] = ref}>
                                                            <div className="circle" onClick={() => toggleInitialStatus(idx)}>
                                                                
                                                                <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                                
                                                            </div>
                                                            <p className="patient-gender">{currTeethType}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input">
                                        <p>{cookies.language === "en" ? "Total": "Total"}</p>
                                        <input type="number" value={parseFloat(total).toFixed(2)} disabled />
                                    </div>

                                    <div className="input">
                                        <p>{cookies.language === "en" ? "Total Negotiated": "Total Negociat"}</p>
                                        <input type="number" value={parseFloat(totalNegotiated).toFixed(2)} disabled />
                                    </div>

                                    {/* <div className="input">
                                        <p>{cookies.language === "en" ? "Notes *": "Observatii "}</p>
                                        <textarea value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                                    </div> */}
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
                                        <div className={`tooth-container ${teethSelected?.[treatmentSelected]?.find(currTooth => currTooth === tooth) ? "active" : ""}`} key={idx} onClick={() => toggleTooth(tooth)}>
                                            {idx <= 15 ? <p>{tooth}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImage[tooth] || ""}.png`} />
                                            {idx > 15 ? <p>{tooth}</p> : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {(teethType === currTeethTypes[0] || teethType === currTeethTypes[2]) ? (
                                <div className="teeth-container kids-teeth">
                                    {TEETH_KIDS.map((tooth, idx) => (
                                        <div className={`tooth-container ${teethSelected?.[treatmentSelected]?.find(currTooth => currTooth === TEETH_KIDS_NUMBERS[idx]) ? "active" : ""}`} key={idx} onClick={() => toggleTooth(TEETH_KIDS_NUMBERS[idx])}>
                                            {idx <= 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageInitialStatusKids[tooth] || ""}.png`} />
                                            {idx > 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {treatments && treatments.length === 0 && !editing ? (
                                <div className="no-schedules">
                                    <h2>{cookies.language === "en" ? "No treatments registered in current treatment plan!" : "Niciun tratament inregistrat in planul de tratament!"}</h2>
                                </div>
                            ) : null}


                        {treatments && treatments.length ? treatments.map((schedule, idx) => (
                            <div className={`schedule treatment-plan ${treatmentSelected === idx ? "selected" : ""}`} key={idx} onClick={(e) => setTreatmentSelected(idx)}>
                                
                                <div className="input">
                                    <p className="title">{cookies.language === "en" ? "Treatment" : "Tratament"}</p>
                                    <Select 
                                        options={doctorOptions} 
                                        placeholder={treatmentNameValue[idx]} 
                                        value={{ label: treatmentNameValue[idx], value: treatmentValue[idx] }} 
                                        styles={customStyles} onChange={e => { 
                                    
                                            setTreatmentValue(currDoctors => {
                                                return currDoctors.map((currDoctorValue, doctorIdx) => {
                                                    if (idx !== doctorIdx) return currDoctorValue;
                                                    return e.value;
                                                });
                                            });

                                            setTreatmentNameValue(currDoctorsName => {
                                                return currDoctorsName.map((currDoctorName, doctorIdx) => {
                                                    if (idx !== doctorIdx) return currDoctorName;
                                                    return e.label;
                                                });
                                            });

                                            setTreatmentPricePerValue(currPricePerValues => {
                                                return currPricePerValues.map((currPricePerValue, priceIdx) => {
                                                    if (idx !== priceIdx) return currPricePerValue;
                                                    return e.pricePer;
                                                });
                                            });

                                            setTreatmentPriceValue(currPriceValues => {
                                                return currPriceValues.map((currPriceValue, priceIdx) => {
                                                    if (idx !== priceIdx) return currPriceValue;
                                                    return Number(e.price);
                                                });
                                            });

                                            setTotalValue(currValues => {
                                                return currValues.map((currValue, currIdx) => {
                                                    if (idx !== currIdx) return currValue;
                                                    const price = pricePerCategories?.[Number(e.pricePer)]?.toLowerCase() === "dinte" || pricePerCategories?.[Number(e.pricePer)]?.toLowerCase() === "tooth" ? teethSelected[idx].length * Number(e.price) : Number(e.price);
                                                    
                                                    return price;
                                                });
                                            });

                                            setTotalNegotiatedValue(currValues => {
                                                return currValues.map((currValue, currIdx) => {
                                                    if (idx !== currIdx) return currValue;
                                                    const price = pricePerCategories?.[Number(e.pricePer)]?.toLowerCase() === "dinte" || pricePerCategories?.[Number(e.pricePer)]?.toLowerCase() === "tooth" ? teethSelected[idx].length * Number(e.price) : Number(e.price);
                                                    
                                                    return price;
                                                });
                                            });

                                            
                                        }} 
                                    />
                                </div>

                            
                                <div className="input">
                                    <p className="title">{cookies.language === "en" ? "Teeth" : "Dinti"}</p>
                                    <input className="time-input" type="text" value={teethValue[idx]} disabled />
                                </div>

                                <div className="input">
                                    <p className="title">{cookies.language === "en" ? "Teeth Surfaces" : "Suprafete Dinti"}</p>
                                    <MultiSelect options={currentToothSurfaces} handleChanges={(values) => handleChanges(idx, values)} defaultValue={[]} width={"100%"} />
                                </div>
                            

                                <div className="input">
                                    <p className="title">{cookies.language === "en" ? "Notes" : "Observatii"}</p>

                                    <textarea className="doctor-notes" spellCheck={false} value={notes[idx]} onChange={e => {
                                        setNotes(currNotes => {
                                            return currNotes.map((currNote, noteIdx) => {
                                                if (noteIdx !== idx) return currNote;
                                                return e.target.value;
                                            })
                                        });
                                    }} />
                                </div>

                                <div className="input">
                                    <p className="title">{cookies.language === "en" ? "Total" : "Total"}</p>
                                    <input className="time-input" type="text" value={parseFloat(totalValue[idx]).toFixed(2)} disabled />
                                    
                                    
                                </div>

                                <div className="input">
                                    <p className="title">{cookies.language === "en" ? "Total Negotiated" : "Total Negociat"}</p>
                                    <input 
                                        className="time-input no-pointer" 
                                        type="text" 
                                        value={totalNegotiatedValue[idx]} 
                                        onChange={(e) => setTotalNegotiatedValue(currValues => {
                                            return currValues.map((value, valueIdx) => {
                                                if (valueIdx !== idx) return value;
                                                return e.target.value;
                                            })
                                        })}
                                        onBlur={() => setTotalNegotiatedValue(currValues => {
                                            return currValues.map((value, valueIdx) => {
                                                if (valueIdx !== idx) return value;
                                                return parseFloat(value).toFixed(2);
                                            })
                                        })}
                                    />
                                    
                                </div>

                        

                                <div className="input input-square">
                                    <p className="title">{cookies.language === "en" ? "Profilaxion" : "Profilaxie"}</p>

                                    <div className={`square ${profilaxionValue[idx] ? "active" : ""}`} onClick={() => setProfliaxionValue(currValues => {
                                        return currValues.map((currValue, valueIdx) => {
                                            if (valueIdx !== idx) return currValue;
                                            return !currValue;
                                        })
                                    })}>
                                        <FontAwesomeIcon icon={faCheck} className="check-icon" />
                                    </div>
                                </div>


                                <FontAwesomeIcon className="remove-button" icon={faTimes} onClick={() => removeTreatment(idx)} />
                                
                            </div>
                        )) : null}

                        <div className="add-button" onClick={() => {
                            setAddedTreatment(curr => curr + 1);
                            window.scrollTo({
                                top: document.body.scrollHeight,
                                left: 0,
                                behavior: 'smooth'
                            });
                        }}>
                            <FontAwesomeIcon icon={faPlus} className="add-icon" />
                        </div>

                        <button type="button" className={`save-button show`} onClick={async () => await saveChanges()}>
                            <p>{cookies.language === "en" ? "Save changes" : "Salveaza modificarile"}</p>
                        </button>

                    </div>
                )}
              
            </div>

        </div>
    );
};

export default EditTreatmentPlanPatient;