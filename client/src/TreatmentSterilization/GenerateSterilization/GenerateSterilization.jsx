import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Navigation from "../../Components/Navigation/Navigation";
import TickAnimation from "../../utils/TickAnimation";
import "./GenerateSterilization.css";

const GenerateSterilization = ({ data }) => {
    const navigation = useNavigate();
    const params = useParams();
    const [cookies, setCookie] = useCookies();
    if (!params?.id || !params?.treatmentId) navigation(-1);

    const patientName = `${data.organisation.patients.find(patient => patient._id === params?.id)?.firstname || ""} ${data.organisation.patients.find(patient => patient._id === params?.id)?.lastname || ""}`;
    const [activeSterilization, setActiveSterilization] = useState(0);
    const [sterilizationsAdded, setSterilizationsAdded] = useState(false);
    const [sterilizations, setSterilizations] = useState([]);
    const [sterilizationsAddDate, setSterilizationsAddDate] = useState([]);
    const [sterilizationExpireDate, setSterilizationsExpireDate] = useState([]);
    const [sterilizatiosnAssistant, setSterilizationsAssistant] = useState([]);
    const [sterilizationInstruments, setSterilizationsInstruments] = useState([]);
    const [sterilizationsBarCodes, setSterilizationsBarCodes] = useState([]);
    const [sterilizationsSarja, setSterilizationsSarja] = useState([]);
    const [activeDocument, setActiveDocument] = useState([]);

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
        if (counterInputs !== sterilizationInputsRef.current.length) return;
        setCounterInputs(curr => curr + 1);
        setActiveSterilization(curr => curr + 1);
        sterilizationInputsRef.current.at(-1).focus();
    }, [sterilizationInputsRef]);

    useEffect(() => {
        setSterilizations(currValues => [...currValues, { }]);
        setSterilizationsBarCodes(currValues => [...currValues, ""]);
        setSterilizationsAddDate(currValues => [...currValues, []]);
        setSterilizationsExpireDate(currValues => [...currValues, []]);
        setSterilizationsAssistant(currValues => [...currValues, []]);
        setSterilizationsInstruments(currValues => [...currValues, []]);
        setSterilizationsSarja(currValues => [...currValues, []]);
        setActiveDocument(currValues => [...currValues, false]);
    }, [counterSterilizations]);

    const removeSterilization = (idx) => {
        setSterilizations(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsBarCodes(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsAddDate(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsExpireDate(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsAssistant(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsInstruments(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setSterilizationsSarja(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
        setActiveDocument(currValues => currValues.filter((_, currIdx) => idx !== currIdx));
    };

    useEffect(() => {
        
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
                return currSterilizations.map(sterilization => new Date(sterilization.add_date));
            });
        });

        setSterilizationsExpireDate(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations.map(sterilization => new Date(sterilization.expire_date));
            });
        });

        setSterilizationsAssistant(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations.map(sterilization => sterilization.assistant);
            });
        });

        setSterilizationsInstruments(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations.map(sterilization => sterilization.instruments);
            });
        });

        setSterilizationsSarja(currValues => {
            return currValues.map((currValue, currIdx) => {
                if (currIdx !== idx) return currValue;
                return currSterilizations.map(sterilization => sterilization.sarja);
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

    };

    const saveChanges = () => {

    };


    return (
        <div className="account-container">
            <Navigation page=""/>
            <div className="content">
                <Header data={data} />
                { sterilizationsAdded ? (
                    <TickAnimation title={cookies?.language === "en" ? "" : ""} animationFinished={animationFinished} />
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                        <div className="go-back" onClick={() => navigation(-1)}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>
                        <div className="patient-account-details">
                            <h2 className="title">{cookies?.language === "en" ? "Create sterilizations" : "Creeaza sterilizari"}</h2>

                            <div className="patient-name" style={{ marginTop: "3rem" }}>
                                
                                <FontAwesomeIcon icon={faUser} className="patient-icon" />
                                <h2>{patientName}</h2>
                            </div>

                            {sterilizations.map((sterilization, idx) => (
                                <></>
                            ))}
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default GenerateSterilization;