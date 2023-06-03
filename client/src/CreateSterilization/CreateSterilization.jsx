import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import tickAnimation from "../imgs/green-tick.mp4";
import tickAnimationWhite from "../imgs/green-tick-light-theme.mp4";
import DateCustomInput from "../Components/DatePicker/DatePicker";
import "./CreateSterilization.css";
import Select from "react-select";
import TickAnimation from "../utils/TickAnimation";

const CreateSterilization = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();


    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "dark");
    const [sarja, setSarja] = useState((data.organisation.sterilizations?.length || 0) + 1);

    const noVideoContentRef = useRef();
    const location = useLocation();

    const [addDate, setAddDate] = useState(new Date());
    const currDate = new Date();
    currDate.setMonth(currDate.getMonth() + 2);

    const [expireDate, setExpireDate] = useState(new Date(currDate));
    const [openDatePickerAdd, setOpenDatePickerAdd] = useState(false);
    const [openDatePickerExpire, setOpenDatePickerExpire] = useState(false);
    const [assistantNameValue, setAssistantNameValue] = useState();
    const [assistantValue, setAssistantValue] = useState();
    const [headerElement, setHeaderElement] = useState();
    const [sterilizationInstruments, setSterilizationInstruments] = useState([]);
    const [sterilizationNameValue, setSterilizationNameValue] = useState();
    const [sterilizationValue, setSterilizationValue] = useState();
    const [quantity, setQuantity] = useState([]);
    const [multipleCodes, setMultipleCodes] = useState([]);

    const weekdayLabelsText = useMemo(() => {
        return { ro: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
    }, []);

    const assistantOptions = useMemo(() => data.organisation.assistants.map(assistant => {
        return {
            value: `${assistant._id}`,
            label: `${assistant.firstname.slice(0, 1)}. ${assistant.lastname}`
        };
    }), []);

    const sterilizationOptions = useMemo(() => data.organisation?.instruments.map(instrument => {
        return {
            value: `${instrument._id}`,
            label: `${instrument.name}`,
            iso: `${instrument.iso}`
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

    const createSterilizationRequest = async () => {

        if (quantity < 1) return setErrorMessage(cookies.langauge === "en" ? "Please provide a valid quantity!" : "Cantitatea nu este valida!"); 

        // if (!instrumentName.length || !isoCode) {
        //     setErrorMessage(cookies.language === "en" ? "Fill each required field!" : "Completeaza toate campurile obligatorii!");
        //     return;
        // } 

        if (sarja < 1 || isNaN(Number(sarja))) 
            return setErrorMessage(cookies.language === "en" ? "Please provide a good batch!" : "Sarja invalida!");
        
        if (!assistantNameValue || !assistantNameValue?.length) 
            return setErrorMessage(cookies.language === "en" ? "You must provide an assistant for the sterilization!" : "Trebuie sa adaugati un personal pentru sterilizare!");

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                addDate: new Date(addDate),
                expireDate: new Date(expireDate),
                sarja: sarja,
                assistantId: assistantValue,
                sterilizationInstruments: sterilizationInstruments,
                language: cookies?.language || "ro"
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-sterilization`, options);
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


    useEffect(() => {
        const sleepAdd = setTimeout(() => {
            if (!openDatePickerAdd) return;
            const datepickerHeaderElements = document.querySelectorAll('.MuiDayPicker-header');
            datepickerHeaderElements && datepickerHeaderElements.forEach(datepickerHeaderElement => {
                const weekdayLabels = datepickerHeaderElement.querySelectorAll(".MuiDayPicker-weekDayLabel");
                weekdayLabels && weekdayLabels.forEach((weekdayLabel, idx) => {
                    weekdayLabel.innerText = weekdayLabelsText[cookies.language][idx];
                });
            });
        }, 350);

        const sleepExpire = setTimeout(() => {
            if (!openDatePickerExpire) return;
            const datepickerHeaderElements = document.querySelectorAll('.MuiDayPicker-header');
            datepickerHeaderElements && datepickerHeaderElements.forEach(datepickerHeaderElement => {
                const weekdayLabels = datepickerHeaderElement.querySelectorAll(".MuiDayPicker-weekDayLabel");
                weekdayLabels && weekdayLabels.forEach((weekdayLabel, idx) => {
                    weekdayLabel.innerText = weekdayLabelsText[cookies.language][idx];
                });
            });
        }, 350);

        return () => {
            clearTimeout(sleepAdd);
            clearTimeout(sleepExpire);
        };

    }, [openDatePickerAdd, openDatePickerExpire]);

    useEffect(() => {
        setHeaderElement(document?.querySelector(".navigation"));
    }, [document?.querySelector(".navigation")]);


    useEffect(() => {
        setSterilizationInstruments(currInstruments => {
            return currInstruments.map((instrument, idx) => {
                return {
                    ...instrument, 
                    quantity: quantity[idx],
                    multipleCode: multipleCodes[idx]
                };
            });
        });
    }, [quantity, multipleCodes]);

    const changeDateAdd = (currDate) => setAddDate(new Date(currDate));
    const changeOpenStatusAdd = (status) => setOpenDatePickerAdd(status);

    const changeDateExpire = (currDate) => setExpireDate(new Date(currDate));
    const changeOpenStatusExpire = (status) => setOpenDatePickerExpire(status);

    const isTouchDevice = useCallback(() => {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    }, []);

    const removeInstrument = (_id) => {
        setSterilizationInstruments(currInstruments => {
            return currInstruments.filter((instrument, idx) => {
                return instrument._id !== _id;
            });
        });
    };

    return (
        <div className="create-doctor">
            <Navigation page="sterilizations" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? "Sterilization created successfully!" : "Sterilizarea a fost creata cu succes!"} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Add Sterilization" : "Adauga Sterilizare"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Adding date *" : "Data adaugare *"}</p>
                            <DateCustomInput
                                key={new Date(addDate).toISOString() + (openDatePickerAdd ? "1" : "0")} 
                                changeDate={changeDateAdd} 
                                initialDate={new Date(addDate)} 
                                future={true} 
                                past={false} 
                                label=""
                                opening={openDatePickerAdd} 
                                headerOpen={window.innerWidth >= 1200 ? (headerElement?.classList?.contains("active") ? 'desktop_active' : 'desktop_inactive') : 'mobile_active'}
                                changeOpenStatus={changeOpenStatusAdd}
                            /> 
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "Expiration date *": "Data expiare *"}</p>
                            <DateCustomInput
                                key={new Date(addDate).toISOString() + (openDatePickerExpire ? "1" : "0")} 
                                changeDate={changeDateExpire} 
                                initialDate={new Date(expireDate)} 
                                future={true} 
                                past={false} 
                                label=""
                                opening={openDatePickerExpire} 
                                headerOpen={window.innerWidth >= 1200 ? (headerElement?.classList?.contains("active") ? 'desktop_active' : 'desktop_inactive') : 'mobile_active'}
                                changeOpenStatus={changeOpenStatusExpire}
                            /> 
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "Batch *" : "Sarja *"}</p>
                            <input type="number" value={sarja} onChange={e => setSarja(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "Assistant *" : "Personal *"}</p>
                            <Select 
                                options={assistantOptions} 
                                placeholder={assistantNameValue} 
                                value={{ label: assistantValue && assistantValue.length ? assistantNameValue : cookies.language === "en" ? "Select assistant..." : "Selecteaza assistentul...", value: assistantValue }}
                                styles={customStyles} 
                                onChange={e => {
                                    setAssistantValue(e.value);
                                    setAssistantNameValue(e.label);
                                }} 
                                readOnly={isTouchDevice()}
                            />
                        </div>

                        <div className="input one-row">
                            <p>{cookies.language === "en" ? "Sterilization Instruments" : "Instrumente sterilizate"}</p>
                            <Select 
                                options={sterilizationOptions} 
                                styles={customStyles} 
                                value={{ label: cookies.language === "en" ? "Select instument..." : "Selecteaza instrumentul..." }}
                                onChange={e => {
                                    if (sterilizationInstruments.some(instrument => instrument._id === e.value))  {
                                        setTimeout(() => setErrorMessage() , 3500);
                                        return setErrorMessage(cookies.language === "en" ? "Instrument already added!" : "Instrumentul a fost deja adaugat!");
                                    }

                                    setSterilizationInstruments(currInstruments => {
                                        return [...currInstruments, {
                                            _id: e.value,
                                            name: e.label,
                                            quantity: 1,
                                            iso: e.iso,
                                            multipleCode: true
                                        }];
                                    });

                                    setQuantity(quantities => [...quantities, 1]);
                                    setMultipleCodes(codes => [...codes, true]);

                                    setSterilizationNameValue();
                                    setSterilizationValue();
                                    
                                }} 
                                readOnly={isTouchDevice()}
                            />

                            <div className="sterilization-instruments">
                                {sterilizationInstruments.length ? sterilizationInstruments.map((instrument, idx) => (
                                    <div className="schedule" key={idx}>

                                    <div className="input">
                                        <p className="title">{cookies.language === "en" ? "Name" : "Denumire"}</p>
                                        <h2>{instrument.name}</h2>
                                    </div>
            
                                    <div className="input">
                                        {idx === 0 && <p className="title">{cookies.language === "en" ? "Quantity" : "Cantitate"}</p> }
            
                                        <input type="number" min="1" className="doctor-notes" spellCheck={false} value={quantity[idx]} onChange={e => {
                                            setQuantity(currQuantities => {
                                                return currQuantities.map((currQuantity, quantityIdx) => {
                                                    if (quantityIdx !== idx) return currQuantity;
                                                    return e.target.value;
                                                });
                                            });
                                        }} />
                                    </div>
            
                                    <div className="input input-square">
                                        {idx === 0 && <p className="title">{cookies.language === "en" ? "Multiple codes" : "Coduri multiple"}</p> }
            
                                        <div className={`square ${multipleCodes[idx] ? "active" : ""}`} onClick={() => setMultipleCodes(currValues => {
                                            return currValues.map((currValue, valueIdx) => {
                                                if (valueIdx !== idx) return currValue;
                                                return !currValue;
                                            })
                                        })}>
                                            <FontAwesomeIcon icon={faCheck} className="check-icon" />
                                        </div>
                                    </div>
            
                                    <div className="input remove">
                                        {idx === 0 && <p className="title">{cookies.language === "en" ? "Remove" : "Sterge"}</p> }
            
                                        <FontAwesomeIcon className="remove-button" icon={faTimes} onClick={() => removeInstrument(instrument._id)} />
                                    </div>
                                </div>
                                )) : null}
                            </div>
                        </div>
                        
                        <p className="error">{errorMessage}</p>

                        <button type="submit"  className="confirm-button" onClick={async () => await createSterilizationRequest()}>{cookies.language === "en" ? "Create Sterilization": "Creeaza Sterilizarea"}</button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default CreateSterilization;