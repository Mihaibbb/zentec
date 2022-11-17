import { faAngleDown, faAngleLeft, faAngleUp, faCheck, faPlus, faTimes, faZ } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import Select from 'react-select';
import "./EditDoctorSchedule.css";

const GAPS = 4;
const END_SCHEDULE_HOUR = 23;
const START_SCHEDULE_HOUR = 0;

const EditDoctorSchedule = ({ data }) => {

    const minutesPerGap = 60 / GAPS;

    const { date } = useParams();
    const dateJS = new Date(date);
    const day = dateJS.getDate();
    const month = dateJS.getMonth();
    const year = dateJS.getFullYear();
    const dayNumber = dateJS.getDay();

    const [schedules, setSchedules] = useState([]);
    const [editing, setEditing] = useState(false);
    const [changes, setChanges] = useState(false);
    const [doctorValue, setDoctorValue] = useState([]);
    const [startHourValue, setStartHourValue] = useState([]);
    const [startMinutesValue, setStartMinutesValue] = useState([]);
    const [endHourValue, setEndHourValue] = useState([]);
    const [endMinutesValue, setEndMinutesValue] = useState([]);
    const [notes, setNotes] = useState([]);
    const [applyToCalendarValue, setApplyToCalendarValue] = useState(false);
    const [startHourActiveMenu, setStartHourActiveMenu] = useState([]);
    const [endHourActiveMenu, setEndHourActiveMenu] = useState([]);
    const [doctorNameValue, setDoctorNameValue] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessages, setErrorMessages] = useState([]);

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();

    const doctorOptions = data.organisation.doctors.map(doctor => {
        return {
            value: `${doctor._id}`,
            label: `${doctor.firstname} ${doctor.lastname}`
        };
    });

    const customStyles = {
        control: (base, state) => ({
            ...base,
            background: "var(--dark-color)",
            border: "none",
            borderRadius: 10,
            width: "90%",
            margin: "0 auto",
            boxShadow: "0 0 10px var(--contrast-color)",
            color: "#000"
        }),

        option: (provided, state) => ({
            ...provided,
            color: "var(--text-color)",
            background: state.isSelected ? "var(--contrast-color)" : state.isFocused ? "var(--selected-color)" : "initial",
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

    const getSchedulesForDay = () => {
        const totalDateSchedules = [];

        data.organisation.doctors.forEach(doctor => {
            const currSchedules = JSON.parse(doctor.schedules);
            console.log(currSchedules);
            const foundSchedule = currSchedules.find(schedule => sameDay(new Date(date), new Date(schedule.date)));
            if (foundSchedule) totalDateSchedules.push({...
                foundSchedule,
                color: doctor.color,
                name: `${doctor.firstname} ${doctor.lastname}`,
                doctorId: doctor._id
            });
        });

        return totalDateSchedules;
    };

    const sameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    };

    useEffect(() => {
        console.log(doctorNameValue);
    }, [doctorNameValue]);

    const removeSchedule = async (scheduleId, doctorId, idx) => {
        console.log(scheduleId, doctorId);
        if (!scheduleId || !doctorId) 
            return setSchedules(currSchedules => {
                return currSchedules.filter((schedule, scheduleIdx) => scheduleIdx !== idx);
            });
    
        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-doctor-schedule?organisationId=${data.organisation._id}&doctorId=${doctorId}&scheduleId=${scheduleId}`, options);
            const response = await request.json();
            console.log(await response);
            if (await response.success) {

                setSchedules(currSchedules => {
                    return currSchedules.filter((schedule, scheduleIdx) => scheduleIdx !== idx);
                });

                setSuccessMessage(await response.message[cookies.language]);
                window.location.reload();
            }
        } catch (e) {
            console.log(e);
        }
    };
    
    const saveChanges = async () => {
        console.log(doctorValue, startHourValue, startMinutesValue, endHourValue, endMinutesValue);
        if (doctorValue && doctorValue.length && doctorValue.some(doctor => doctor === "")) return;
        if (startHourValue && startHourValue.length && startHourValue.some(hour => hour === "")) return;
        if (startMinutesValue && startMinutesValue.length && startMinutesValue.some(minutesValue => minutesValue === "")) return;
        if (endHourValue && endHourValue.length && endHourValue.some(hour => hour === "")) return;
        if (endMinutesValue && endMinutesValue.length && endMinutesValue.some(minutesValue => minutesValue === "")) return;

        let timeErrorsIdx = [];
        startHourValue.forEach((hourValue, idx) => {
            const startTime = Number(hourValue) * 60 + Number(startMinutesValue[idx]);
            const endTime = Number(endHourValue[idx]) * 60 + Number(endMinutesValue[idx]);
            if (startTime >= endTime) {
                timeErrorsIdx.push(idx);
            }
        });

        // Verify if start hour is >= end hour
        timeErrorsIdx.forEach((timeErrorIdx) => {
            setErrorMessages(currErrorMessages => {
                return [...currErrorMessages, {
                    idx: timeErrorIdx,
                    message: cookies.language === "en" ? 
                    "Start hours must not be after the end ones!" :
                    "Orele de inceput nu pot fi dupa cele de sfarsit!"
                }];
            });
        });      

        const appearedDoctors = {};
        doctorValue.forEach((doctorId, idx) => {
            if (!appearedDoctors[doctorId]) appearedDoctors[doctorId] = [idx];
            else appearedDoctors[doctorId].push(idx);
        }); 

        for (let doctorId in appearedDoctors) {
            appearedDoctors[doctorId].forEach(idx => {

            });
        }

        const currSchedules = [];

        doctorValue.forEach((currDoctorValue, idx) => {
            currSchedules.push({
                organisationId: data.organisation._id,
                doctorId: currDoctorValue,
                scheduleId: schedules.length > idx && schedules[idx]?.scheduleId ? schedules[idx].scheduleId : null,
                startHour: startHourValue[idx],
                startMinutes: startMinutesValue[idx],
                endHour: endHourValue[idx],
                endMinutes: endMinutesValue[idx],
                date: schedules.length > idx && schedules[idx]?.scheduleId ? null : dateJS,
                repeat: applyToCalendarValue[idx],
                dayNumber: dayNumber,
                notes: notes[idx]
            });
        });
        
        currSchedules.forEach((schedule, idx) => {
            (async () => {
                console.log(schedule);
                const options = {
                    method: schedule?.scheduleId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(schedule)
                };

                try {
                    const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/${schedule?.scheduleId ? "edit-doctor-schedule" : "create-doctor-schedule"}`, options);
                    const response = await request.json();
                } catch(e) {
                    console.log(e);
                }

            })();
        });

        window.location.replace("/doctors-schedule");

    };

    useEffect(() => {
        setSchedules(getSchedulesForDay());
    }, []);

    useEffect(() => {
        if (!schedules || !schedules.length) return;
        setDoctorValue([]);
        setDoctorNameValue([]);
        setStartHourValue([]);
        setStartMinutesValue([]);
        setEndHourValue([]);
        setEndMinutesValue([]);
        setNotes([]);
        setApplyToCalendarValue([]);
        setStartHourActiveMenu([]);
        setEndHourActiveMenu([]);
        setErrorMessages([]);

        schedules.forEach((schedule, idx) => {
            console.log(schedule);
            setDoctorValue(currValues => [...currValues, schedule?.doctorId || ""]);
            setDoctorNameValue(currValues => [...currValues, schedule?.name || ""]);
            setStartHourValue(currValue => [...currValue, schedule?.startHour || 0]);
            setStartMinutesValue(currValue => [...currValue, schedule?.startMinutes || 0]);
            setEndHourValue(currValue => [...currValue, schedule?.endHour || 0]);
            setEndMinutesValue(currValue => [...currValue, schedule?.endMinutes || 0]);
            setNotes(currValue => [...currValue, schedule?.notes || ""]);
            setApplyToCalendarValue(currValue => [...currValue, schedule?.repeat]);
            setStartHourActiveMenu(currValue => [...currValue, false]);
            setEndHourActiveMenu(currValue => [...currValue, false]);
            setErrorMessages(currValue => [...currValue, ""]);
        });

    }, [schedules]);

    useEffect(() => {
        console.log(doctorValue);
    }, [doctorValue]);

    const focusActiveMenu = (method1, method2, idx) => {
        console.log("focus");
        method1(currMenus => {
            console.log(currMenus);
            return currMenus.map((activeMenu, menuIdx) => {
                if (menuIdx !== idx) return activeMenu;
                return !activeMenu;
            })
        });

        method2(currMenus => {
            console.log(currMenus);
            return currMenus.map((menu) => false);
        });
    };

    const blurActiveMenu = () => {
        console.log("blur");
        setStartHourActiveMenu(currMenus => {
            return currMenus.map((menu) => false);
        });

        setEndHourActiveMenu(currMenus => {
            return currMenus.map((menu) => false);
        });
    };

    const scheduleInteractions = (idx1, idx2) => {
        return (
            (
                Number(startHourValue[idx2]) >= Number(startHourValue[idx1]) &&
                Number(startHourValue[idx2]) <= Number(endHourValue[idx1])
            ) ||
            (
                Number(endHourValue[idx2]) >= Number(startHourValue[idx1]) &&
                Number(endHourValue[idx2]) <= Number(endHourValue[idx1])
            )
        );
    };

    return (
        <div className="edit-doctors-schedule">
            <Navigation page="doctors-schedule" />

            <div className="content">
                <Header data={data} />
        
                <h2 className="title">{cookies.language === "en" ? `Schedule on ${day}.${month + 1}.${year}` : `Program in data de ${day}.${month + 1}.${year}`}</h2>
                <div className="go-back" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>

                {schedules && schedules.length === 0 && !editing && (
                    <div className="no-schedules">
                        <h2>{cookies.language === "en" ? "No schedules registered in current date!" : "Niciun program inregistrat in data curenta!"}</h2>
                    </div>
                )}

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

                {schedules && schedules.length && schedules.map((schedule, idx) => (
                    <div className="schedule" key={idx}>
                        
                        <div className="input">
                            {idx === 0 && <p className="title">{cookies.language === "en" ? "Doctor" : "Medic"}</p> }
                            <Select options={doctorOptions} placeholder={doctorNameValue[idx]} value={{ label: doctorNameValue[idx], value: doctorValue[idx] }} styles={customStyles} onChange={e => {
                               
                                setDoctorValue(currDoctors => {
                                    return currDoctors.map((currDoctorValue, doctorIdx) => {
                                        if (idx !== doctorIdx) return currDoctorValue;
                                        return e.value;
                                    });
                                });

                                setDoctorNameValue(currDoctorsName => {
                                    return currDoctorsName.map((currDoctorName, doctorIdx) => {
                                        if (idx !== doctorIdx) return currDoctorName;
                                        return e.label;
                                    });
                                });
                            }} />
                        </div>

                        <div className="input">

                            {idx === 0 && <p className="title">{cookies.language === "en" ? "Start" : "Inceput"}</p> }

                            <input 
                                type="text" 
                                className="time-input" 
                                value={`${Number(startHourValue[idx]) < 10 ? `0${startHourValue[idx]}` : startHourValue[idx]}:${startMinutesValue[idx] < 10 ? `0${startMinutesValue[idx]}` : startMinutesValue[idx]}`} 
                                onClick={() => focusActiveMenu(setStartHourActiveMenu, setEndHourActiveMenu, idx)}  

                                // onBlur={() => blurActiveMenu()}
                                readOnly
                            />

                            <div className={`hour-frame ${startHourActiveMenu[idx] ? "active" : ""}`}>
                                <div className="hour-interval">
                                    <FontAwesomeIcon 
                                        icon={faAngleDown} 
                                        className="angle-icon" 
                                        onClick={() => {
                                            setStartHourValue(currValues => {
                                                return currValues.map((currValue, valueIdx) => {
                                                    if (valueIdx !== idx) return Number(currValue);
                                                    if (Number(currValue) - 1 < START_SCHEDULE_HOUR) {
                                                        setStartMinutesValue(currMinutesValues => {
                                                            return currMinutesValues.map((value, minutesValueIdx) => {
                                                                if (minutesValueIdx !== idx) return value;
                                                                return 60 - minutesPerGap;
                                                            });
                                                        });

                                                        return END_SCHEDULE_HOUR;
                                                    }
                                                    return Number(currValue) - 1;
                                                });
                                            });

                                            
                                        }}
                                    />
                                    <p className="number">{Number(startHourValue[idx]) < 10 ? `0${startHourValue[idx]}` : startHourValue[idx]}</p>
                                    <FontAwesomeIcon 
                                        icon={faAngleUp} 
                                        className="angle-icon" 
                                        onClick={() => setStartHourValue(currValues => {
                                            return currValues.map((currValue, valueIdx) => {
                                                if (valueIdx !== idx) return Number(currValue);
                                                if (Number(currValue) + 1 > END_SCHEDULE_HOUR) {
                                                    setStartMinutesValue(currMinutesValues => {
                                                        return currMinutesValues.map((value, minutesValueIdx) => {
                                                            if (minutesValueIdx !== idx) return Number(value);
                                                            return 0;
                                                        });
                                                    });
                                                    
                                                    return START_SCHEDULE_HOUR;
                                                }

                                                return Number(currValue) + 1;
                                            });
                                        })}
                                    />

                                    <FontAwesomeIcon 
                                        icon={faTimes}
                                        className="close-icon"
                                        onClick={() => focusActiveMenu(setStartHourActiveMenu, setEndHourActiveMenu, idx)}
                                    />
                                </div>
                                <div className="differentiator">
                                    <p>:</p>
                                </div>
                                <div className="minutes-interval">
                                    <FontAwesomeIcon 
                                        icon={faAngleDown} 
                                        className="angle-icon"
                                        onClick={() => {
                                            setStartMinutesValue(currValues => {
                                                return currValues.map((currValue, valueIdx) => {
                                                    if (valueIdx !== idx) return Number(currValue);
                                                    if (Number(currValue) - minutesPerGap < 0) {
                                                        setStartHourValue(currHourValues => {
                                                            return currHourValues.map((hourValue, hourValueIdx) => {
                                                                if (hourValueIdx !== idx) return Number(hourValue);
                                                                if (Number(hourValue) === START_SCHEDULE_HOUR) return END_SCHEDULE_HOUR;
                                                                return Number(hourValue) - 1;
                                                            });
                                                        });
                                                        return 60 - minutesPerGap;
                                                    }
                                                    return Number(currValue) - minutesPerGap;
                                                });
                                            });
                                        }} 
                                    />
                                    <p className="number">{Number(startMinutesValue[idx]) < 10 ? `0${startMinutesValue[idx]}` : startMinutesValue}</p>
                                    <FontAwesomeIcon 
                                        icon={faAngleUp} 
                                        className="angle-icon" 
                                        onClick={() => {
                                            setStartMinutesValue(currValues => {
                                                return currValues.map((currValue, valueIdx) => {
                                                    if (valueIdx !== idx) return Number(currValue);
                                                    if (Number(currValue) + minutesPerGap >= 60) {
                                                        setStartHourValue(currHourValues => {
                                                            return currHourValues.map((hourValue, hourValueIdx) => {
                                                                if (hourValueIdx !== idx) return Number(hourValue);
                                                                if (Number(hourValue) === END_SCHEDULE_HOUR) return START_SCHEDULE_HOUR;
                                                                return Number(hourValue) + 1;
                                                            });
                                                        });

                                                        return 0;
                                                    }
                                                    return Number(currValue) + minutesPerGap;
                                                });
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input">
                            {idx === 0 && <p className="title">{cookies.language === "en" ? "End" : "Sfarsit"}</p> }

                            <input 
                                type="text" 
                                className="time-input" 
                                value={`${endHourValue[idx] < 10 ? `0${endHourValue[idx]}` : endHourValue[idx]}:${endMinutesValue[idx] < 10 ? `0${endMinutesValue[idx]}` : endMinutesValue[idx]}`} 
                                onClick={() => focusActiveMenu(setEndHourActiveMenu, setStartHourActiveMenu, idx)}  
                                
                                // onBlur={() => blurActiveMenu()}
                                readOnly
                            />

                            <div className={`hour-frame ${endHourActiveMenu[idx] ? "active" : ""}`}>
                                <div className="hour-interval">
                                    <FontAwesomeIcon 
                                        icon={faAngleDown} 
                                        className="angle-icon" 
                                        onClick={() => {
                                            setEndHourValue(currValues => {
                                                return currValues.map((currValue, valueIdx) => {
                                                    if (valueIdx !== idx) return Number(currValue);
                                                    if (Number(currValue) - 1 < START_SCHEDULE_HOUR) {
                                                        setEndMinutesValue(currMinutesValues => {
                                                            return currMinutesValues.map((value, minutesValueIdx) => {
                                                                if (minutesValueIdx !== idx) return Number(value);
                                                                return 60 - minutesPerGap;
                                                            });
                                                        });

                                                        return END_SCHEDULE_HOUR;
                                                    }
                                                    return Number(currValue) - 1;
                                                });
                                            });

                                            
                                        }}
                                    />
                                    <p className="number">{Number(endHourValue[idx]) < 10 ? `0${endHourValue[idx]}` : endHourValue[idx]}</p>
                                    <FontAwesomeIcon 
                                        icon={faAngleUp} 
                                        className="angle-icon" 
                                        onClick={() => setEndHourValue(currValues => {
                                            return currValues.map((currValue, valueIdx) => {
                                                if (valueIdx !== idx) return Number(currValue);
                                                if (Number(currValue) + 1 > END_SCHEDULE_HOUR) {
                                                    setEndMinutesValue(currMinutesValues => {
                                                        return currMinutesValues.map((value, minutesValueIdx) => {
                                                            if (minutesValueIdx !== idx) return value;
                                                            return 0;
                                                        });
                                                    });
                                                    
                                                    return START_SCHEDULE_HOUR;
                                                }

                                                return Number(currValue) + 1;
                                            });
                                        })}
                                    />

                                    <FontAwesomeIcon 
                                        icon={faTimes}
                                        className="close-icon"
                                        onClick={() => focusActiveMenu(setEndHourActiveMenu, setStartHourActiveMenu, idx)}
                                    />
                                    
                                </div>
                                <div className="differentiator">
                                    <p>:</p>
                                </div>
                                <div className="minutes-interval">
                                    <FontAwesomeIcon 
                                        icon={faAngleDown} 
                                        className="angle-icon"
                                        onClick={(e) => {
                                            setEndMinutesValue(currValues => {
                                                return currValues.map((currValue, valueIdx) => {
                                                    if (valueIdx !== idx) return Number(currValue);
                                                    if (Number(currValue) - minutesPerGap < 0) {
                                                        setEndHourValue(currHourValues => {
                                                            return currHourValues.map((hourValue, hourValueIdx) => {
                                                                if (hourValueIdx !== idx) return hourValue;
                                                                if (Number(hourValue) === START_SCHEDULE_HOUR) return END_SCHEDULE_HOUR;
                                                                return Number(hourValue) - 1;
                                                            });
                                                        });
                                                        return 60 - minutesPerGap;
                                                    }
                                                    return Number(currValue) - minutesPerGap;
                                                });
                                            });

                                        }} 
                                    />
                                    <p className="number">{Number(endMinutesValue[idx]) < 10 ? `0${endMinutesValue[idx]}` : endMinutesValue[idx]}</p>
                                    <FontAwesomeIcon 
                                        icon={faAngleUp} 
                                        className="angle-icon" 
                                        onClick={() => {
                                            setEndMinutesValue(currValues => {
                                                return currValues.map((currValue, valueIdx) => {
                                                    if (valueIdx !== idx) return Number(currValue);
                                                    if (Number(currValue) + minutesPerGap >= 60) {
                                                        setEndHourValue(currHourValues => {
                                                            return currHourValues.map((hourValue, hourValueIdx) => {
                                                                if (hourValueIdx !== idx) return Number(hourValue);
                                                                if (Number(hourValue) === END_SCHEDULE_HOUR) return START_SCHEDULE_HOUR;
                                                                return Number(hourValue) + 1;
                                                            });
                                                        });

                                                        return 0;
                                                    }
                                                    return Number(currValue) + minutesPerGap;
                                                });
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                        </div>


                        <div className="input">
                            {idx === 0 && <p className="title">{cookies.language === "en" ? "Notes" : "Observatii"}</p> }

                            <textarea className="doctor-notes" spellCheck={false} value={notes[idx]} onChange={e => {
                                setNotes(currNotes => {
                                    return currNotes.map((currNote, noteIdx) => {
                                        if (noteIdx !== idx) return currNote;
                                        return e.target.value;
                                    })
                                });
                            }} />
                        </div>

                        <div className="input input-square">
                            {idx === 0 && <p className="title">{cookies.language === "en" ? "Apply for calendar" : "Aplica pt tot calendarul"}</p> }

                            <div className={`square ${applyToCalendarValue[idx] ? "active" : ""}`} onClick={() => setApplyToCalendarValue(currValues => {
                                return currValues.map((currValue, valueIdx) => {
                                    if (valueIdx !== idx) return currValue;
                                    return !currValue;
                                })
                            })}>
                                <FontAwesomeIcon icon={faCheck} className="check-icon" />
                            </div>
                        </div>

                        <div className="input">
                            {idx === 0 && <p className="title">{cookies.language === "en" ? "Remove" : "Sterge"}</p> }

                            <FontAwesomeIcon className="remove-button" icon={faTimes} onClick={async () => await removeSchedule(schedule?.scheduleId, doctorValue[idx] || null, idx)} />
                        </div>
                    </div>
                ))}

                <div className="add-button">
                    <FontAwesomeIcon icon={faPlus} className="add-icon" onClick={() => {
                        setSchedules(currSchedules => [...currSchedules, {}]);
                    }} />
                </div>


                <button type="button" className={`save-button show`} onClick={async () => await saveChanges()}>
                    <p>{cookies.language === "en" ? "Save changes" : "Salveaza modificarile"}</p>
                </button>

            </div>

        </div>
    );
};

export default EditDoctorSchedule;