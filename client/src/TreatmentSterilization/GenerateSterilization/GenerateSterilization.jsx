import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faAngleLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Navigation from "../../Components/Navigation/Navigation";
import SterilizationFiles from "../../SterilizationFiles/SterilizationFiles";
import TickAnimation from "../../utils/TickAnimation";
import "./GenerateSterilization.css";

const GenerateSterilization = ({ data }) => {
    const navigation = useNavigate();
    const params = useParams();
    const [cookies, setCookie] = useCookies();
    if (!params?.id || !params?.treatmentId) navigation(-1);

    const patientName = `${data.organisation.patients.find(patient => patient._id === params?.id)?.firstname || ""} ${data.organisation.patients.find(patient => patient._id === params?.id)?.lastname || ""}`;
    // const [activeSterilization, setActiveSterilization] = useState(0);
    const [sterilizationsAdded, setSterilizationsAdded] = useState(false);
    const [sterilizations, setSterilizations] = useState([]);
    const [sterilizationsAddDate, setSterilizationsAddDate] = useState([]);
    const [sterilizationsExpireDate, setSterilizationsExpireDate] = useState([]);
    const [sterilizationsAssistant, setSterilizationsAssistant] = useState([]);
    const [sterilizationsInstruments, setSterilizationsInstruments] = useState([]);
    const [sterilizationsBarCodes, setSterilizationsBarCodes] = useState([]);
    const [sterilizationsSarja, setSterilizationsSarja] = useState([]);
    const [activeDocument, setActiveDocument] = useState([]);
    const [sterilizationSelected, setSterilizationSelected] = useState(0);
    const [sterilizationsId, setSterilizationsId] = useState([]);
    const [theme, setTheme] = useState(cookies?.theme || "light");
    const [finishedAdded, setFinishedAdded] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const [counterSterilizations, setCounterSterilizations] = useState(0);
    const [counterInputs, setCounterInputs] = useState(1);
    
    const sterilizationInputsRef = useRef([]);
    const noVideoContentRef = useRef();

    const findSterilization = (barcode) => {
        const values = data.organisation.sterilizations.map(sterilization => {
            const currInstruments = JSON.parse(sterilization.sterilization_instruments);
            const instrumentsFound =  currInstruments.filter(instrument => {
                if (Number(instrument.quantity) === 1 || !instrument.multipleCode) {
                    const barCodeValue = `${new Date(sterilization.add_date).getFullYear()}${new Date(sterilization.add_date).getMonth() + 1 < 10 ? `0${new Date(sterilization.add_date).getMonth() + 1}` : new Date(sterilization.add_date).getMonth() + 1}${new Date(sterilization.add_date).getDate() < 10 ? `0${new Date(sterilization.add_date).getDate()}` : new Date(sterilization.add_date).getDate()}${sterilization.id}1`;
                    if (barCodeValue.toString() === barcode.toString()) return true;
                } else {
                    for (let quantity = 0; quantity < Number(instrument.quantity); quantity++) {
                        const barCodeValue = `${new Date(sterilization.add_date).getFullYear()}${new Date(sterilization.add_date).getMonth() + 1 < 10 ? `0${new Date(sterilization.add_date).getMonth() + 1}` : new Date(sterilization.add_date).getMonth() + 1}${new Date(sterilization.add_date).getDate() < 10 ? `0${new Date(sterilization.add_date).getDate()}` : new Date(sterilization.add_date).getDate()}${sterilization.id}${quantity}`;
                        if (barCodeValue.toString() === barcode.toString()) return true;
                    }
                }

                return false;
            });

            if (!instrumentsFound?.length) return null;

            return {...sterilization,
                instruments: JSON.stringify(instrumentsFound),
            };  
        });
        return values.filter(value => value !== null);
    };

    useLayoutEffect(() => {
        console.log(sterilizationInputsRef.current);
        if (!sterilizationInputsRef?.current?.length) return;
        if (counterInputs !== sterilizationInputsRef.current.length) return;
        setCounterInputs(curr => curr + 1);
        sterilizationInputsRef.current.at(-1).focus();
    }, [sterilizations]);

    const addSterilizations = (initSterilizations) => {
        initSterilizations && initSterilizations?.length && initSterilizations.forEach((initSterilization, idx) => {
            setSterilizations(currValues => [...currValues, { }]);
            setSterilizationsBarCodes(currValues => [...currValues, initSterilization?.barCode]);
            setSterilizationsAddDate(currValues => [...currValues, new Date(initSterilization.addDate)]);
            setSterilizationsExpireDate(currValues => [...currValues, new Date(initSterilization.expireDate)]);
            setSterilizationsAssistant(currValues => [...currValues, initSterilization.assistant]);
            setSterilizationsInstruments(currValues => [...currValues, initSterilization.instruments]);
            setSterilizationsSarja(currValues => [...currValues, initSterilization.sarja]);
            setActiveDocument(currValues => [...currValues, true]);
            setSterilizationsId(currValues => [...currValues, initSterilization.sterilizationsId]);
            setCounterInputs(curr => curr + 1);
            setSterilizationSelected(curr => curr + 1);
        });
    };

    let lastValue = useMemo(() => null, []);
    const [startScroll, setStartScroll] = useState(false);

    useLayoutEffect(() => {
        if (!finishedAdded) return;
        if (lastValue === counterSterilizations) return;
        setSterilizations(currValues => [...currValues, { }]);
        setSterilizationsBarCodes(currValues => [...currValues, ""]);
        setSterilizationsAddDate(currValues => [...currValues, ""]);
        setSterilizationsExpireDate(currValues => [...currValues, ""]);
        setSterilizationsAssistant(currValues => [...currValues, ""]);
        setSterilizationsInstruments(currValues => [...currValues, []]);
        setSterilizationsSarja(currValues => [...currValues, ""]);
        setActiveDocument(currValues => [...currValues, false]);
        setSterilizationsId(currValues => [...currValues, []]);
        if (lastValue === null) setStartScroll(true);
        lastValue = counterSterilizations;
    }, [counterSterilizations, finishedAdded]);

    useEffect(() => {
        if (!startScroll) return;
        const timer = setTimeout(() => window.scrollTo({ left: 0, top: document.documentElement.scrollHeight, behavior: "smooth" }), 350);
        return () => clearTimeout(timer);
    }, [startScroll]);

    const removeSterilization = (idx) => {
        setSterilizations(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsBarCodes(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsAddDate(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsExpireDate(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsAssistant(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsInstruments(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsSarja(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setActiveDocument(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsId(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
    };

    let lastTimeFinishedAdded = useMemo(() => false, []);
    
    useLayoutEffect(() => {
        if (lastTimeFinishedAdded) return;
        const treatment = data.organisation.treatments_patients.find(treatment => treatment.id === params?.treatmentId);
        if (!treatment) return;
        console.log("here");
        const currentSterilizations = JSON.parse(treatment?.sterilizations);
        lastTimeFinishedAdded = true;
        if (!currentSterilizations?.length) return setFinishedAdded(true);
        setFinishedAdded(true);
        addSterilizations(currentSterilizations);
    }, []);

    const changeBarCodeValue = (value, idx) => {
        setSterilizationsBarCodes(currBarCodes => {
            return currBarCodes.map((barCode, currIdx) => {
                if (currIdx !== idx) return barCode;
                return value;
            });
        });
        const currSterilizations = findSterilization(value);
        if (!currSterilizations?.length) return;

        setSterilizationsAddDate(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations[0].add_date;
            });
        });

        setSterilizationsExpireDate(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations[0].expire_date;
            });
        });

        setSterilizationsAssistant(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations[0].assistant;
            });
        });

        setSterilizationsInstruments(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations[0].instruments;
            });
        });

        setSterilizationsSarja(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations[0].sarja;
            });
        });

        setSterilizationsId(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations.map(sterilization => sterilization._id);
            });
        });

        setActiveDocument(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return true;
            });
        });
        setCounterSterilizations(currValue => currValue + 1);
    };
    
    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        return window.location.replace(`/view-treatment-sterilization/${params?.id}/${params?.treatmentId}`);
    };

    useEffect(() => {
        setTheme(cookies?.theme || "light");
    }, [cookies]);

    const saveChanges = async () => {
        try {
            const currentSterilizations = sterilizations.map((sterilization, idx) => {
                if (!activeDocument[idx]) return null;
                return {
                    addedDate: currentDate,
                    addDate: sterilizationsAddDate[idx],
                    expireDate: sterilizationsExpireDate[idx],
                    assistant: sterilizationsAssistant[idx],
                    instruments: sterilizationsInstruments[idx],
                    sarja: sterilizationsSarja[idx],
                    barCode: sterilizationsBarCodes[idx],
                    id: idx.toString(),
                    sterilizationsId: sterilizationsId[idx]
                };
            });

            const currentSterilizationsFiltered = currentSterilizations.filter(sterilization => sterilization !== null);

            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    id: params?.treatmentId,
                    sterilizations: currentSterilizationsFiltered
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/update-treatment-patient-sterilizations`, options);
            const response = await request.json();
            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                noVideoContentRef.current.classList.add("invisible");
                setSterilizationsAdded(true);
            }
        } catch (e) {
            console.log(e);
        }
    };


    return (
        <div className="account-container">
            <Navigation page=""/>
            <div className="content">
                <Header data={data} />
                { sterilizationsAdded ? (
                    <TickAnimation title={cookies?.language === "en" ? "Sterilizations added successfully!" : "Sterilizarile au fost adaugate cu succes!"} animationFinished={animationFinished} />
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                        <div className="go-back" onClick={() => navigation(`/view-treatment-sterilization/${params?.id}/${params?.treatmentId}`)}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>
                        <div className="patient-account-details">
                            <h2 className="title">{cookies?.language === "en" ? "Create sterilizations" : "Creeaza sterilizari"}</h2>

                            <div className="patient-name" style={{ marginTop: "3rem" }}>
                                
                                <FontAwesomeIcon icon={faUser} className="patient-icon" />
                                <h2>{patientName}</h2>
                            </div>

                            {sterilizations.map((sterilization, idx) => (
                                <div className={`schedule treatment-plan ${sterilizationSelected === idx ? "selected" : ""}`} key={idx} onClick={(e) => setSterilizationSelected(idx)}>
                                    
                                    <div className="input time-input">
                                        <p className="title">{cookies.language === "en" ? "Barcode" : "Cod de bare"}</p>
                                        <input type="text" className="time-input" ref={ref => sterilizationInputsRef.current[idx] = ref} value={sterilizationsBarCodes[idx]} onChange={(e) => changeBarCodeValue(e.target.value, idx)} />
                                    </div>
                                
                                    <div className="input">
                                        <p className="title">{cookies.language === "en" ? "Adding Date" : "Data de adaugare"}</p>
                                        <input type="text" className="time-input" value={`${currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : currentDate.getDate()}.${currentDate.getMonth() + 1 < 10 ? `0${currentDate.getMonth() + 1}` : currentDate.getMonth() + 1}.${currentDate.getFullYear()}`} disabled />
                                    </div>

                                    {activeDocument[idx] && sterilizationsId[idx] ? (
                                        <>
                                            {sterilizationsId[idx].map((sterilizationId, currIdx) => (
                                                <SterilizationFiles data={data} sterilizationBarCode={sterilizationsBarCodes[idx]} sterilizationId={sterilizationId} />
                                            ))}
                                        </>
                                       
                                    ) : null}
    
                                    <FontAwesomeIcon className="remove-button" icon={faTimes} onClick={() => removeSterilization(idx)} />
                                </div>
                            ))}

                            {/* <p className="error">{errorMessage}</p> */}

                        </div>

                        <div className="form" style={{ gridTemplateColumns: "1fr" }}>
                            <button type="submit" className="confirm-button" style={{ width: "90%", margin: "2rem auto" }}  onClick={async () => await saveChanges()}>{cookies.language === "en" ? "Save changes": "Salveaza modificarile"}</button>
                                                
                        </div>

                    </div>
                ) }
            </div>
        </div>
    );
};

export default GenerateSterilization;