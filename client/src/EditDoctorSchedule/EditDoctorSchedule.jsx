import { faAngleLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import Select from 'react-select';
import "./EditDoctorSchedule.css";

const EditDoctorSchedule = ({ data }) => {


    const { date } = useParams();
    const dateJS = new Date(date);
    const day = dateJS.getDate();
    const month = dateJS.getMonth();
    const year = dateJS.getFullYear();

    const [schedules, setSchedules] = useState([]);
    const [editing, setEditing] = useState(false);
    const [changes, setChanges] = useState(false);
    const [doctorValue, setDoctorValue] = useState([]);
    const [startHourValue, setStartHourValue] = useState([]);
    const [startMinutesValue, setStartMinutesValue] = useState([]);
    const [endHourValue, setEndHourValue] = useState([]);
    const [endMinutesValue, setEndMinutesValue] = useState([]);
    const [notes, setNotes] = useState([]);

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
            background: state.isSelected ? "var(--contrast-color)" : state.isFocused ? "var(--selector-color)" : "initial"
        }),
        
        menu: (provided, state) => ({
            ...provided,
            
            
            background: "var(--dark-color)",
            border: "none",
        }),

        singleValue: (provided) => ({
            ...provided,
            color: "var(--text-color)"
        })
    };

    const getSchedulesForDay = () => {
        const totalDateSchedules = [];

        data.organisation.doctors.forEach(doctor => {
            const currSchedules = JSON.parse(doctor.schedules);
            const foundSchedule = currSchedules.find(schedule => sameDay(date, new Date(schedule.date)));
            if (foundSchedule) totalDateSchedules.push({...
                foundSchedule,
                color: doctor.color,
                name: `${doctor.firstname} ${doctor.lastname}`
            });
        });

        return totalDateSchedules;
    };

    const sameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    };

    const removeSchedule = (idx) => {
        
    };
    
    const saveChanges = () => {
        if (doctorValue && doctorValue.length && doctorValue.some(doctor => doctor === "")) return;
        if (startHourValue && startHourValue.length && startHourValue.some(hour => hour === "")) return;
        if (startMinutesValue && startMinutesValue.length && startMinutesValue.some(minutesValue => minutesValue === "")) return;
        if (endHourValue && endHourValue.length && endHourValue.some(hour => hour === "")) return;
        if (endMinutesValue && endMinutesValue.length && endMinutesValue.some(minutesValue => minutesValue === "")) return;

        navigate(-1);
    };

    useEffect(() => {
        setSchedules(getSchedulesForDay());
    }, []);

    useEffect(() => {
        if (!schedules || !schedules.length) return;
        setDoctorValue([]);
        setStartHourValue([]);
        setStartMinutesValue([]);
        setEndHourValue([]);
        setEndMinutesValue([]);
        setNotes([]);

        schedules.forEach((schedule, idx) => {
            setDoctorValue(currValues => [...currValues, schedule?.name || ""]);
            setStartHourValue(currValue => [...currValue, schedule?.startHour || 0]);
            setStartMinutesValue(currValue => [...currValue, schedule?.startMinutes || 0]);
            setEndHourValue(currValue => [...currValue, schedule?.endHour || 0]);
            setEndMinutesValue(currValue => [...currValue, schedule?.endMinutes || 0]);
            setNotes(currValue => [...currValue, schedule?.notes || ""]);
        });

    }, [schedules]);


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

                {schedules && schedules.length && (
                    <div className="first-row">

                    </div>
                )}

                {schedules && schedules.length && schedules.map((schedule, idx) => (
                    <div className="schedule" key={idx}>

                        <div className="input">
                            <Select options={doctorOptions} styles={customStyles} onChange={e => {
                               
                                setDoctorValue(currDoctors => {
                                    return currDoctors.map((currDoctorValue, doctorIdx) => {
                                        if (idx !== doctorIdx) return currDoctorValue;
                                        return e.value;
                                    })
                                })
                            }} />
                        </div>

                        <div className="input">
                            <input type="number" className="time-input" value={startHourValue[idx]} onChange={e => {
                                setStartHourValue(currData => {
                                    return currData.map((startHour, hourIdx) => {
                                        if (hourIdx !== idx) return startHour;
                                        return e.target.value;
                                    })
                                })
                            }} />
                        </div>

                        <div className="input">
                            <input type="number" className="time-input" value={startMinutesValue[idx]} onChange={e => {
                                setStartMinutesValue(currData => {
                                    return currData.map((minutesValue, minutesIdx) => {
                                        if (minutesIdx !== idx) return minutesValue;
                                        return e.target.value;
                                    })
                                })
                            }} />
                        </div>

                        <div className="input">
                            <input type="number" className="time-input" value={endHourValue[idx]} onChange={e => {
                                setEndHourValue(currData => {
                                    return currData.map((endHour, hourIdx) => {
                                        if (hourIdx !== idx) return endHour;
                                        return e.target.value;
                                    })
                                })
                            }} />
                        </div>

                        <div className="input">
                            <input type="number" className="time-input" value={endMinutesValue[idx]} onChange={e => {
                                setEndMinutesValue(currData => {
                                    return currData.map((endMinutes, minuteIdx) => {
                                        if (minuteIdx !== idx) return endMinutes;
                                        return e.target.value;
                                    })
                                })
                            }} />
                        </div>

                        <div className="input">
                            <textarea className="doctor-notes" value={notes[idx]} onChange={e => {
                                setNotes(currNotes => {
                                    return currNotes.map((currNote, noteIdx) => {
                                        if (noteIdx !== idx) return currNote;
                                        return e.target.value;
                                    })
                                });
                            }} />
                        </div>
                    </div>
                ))}

                <div className="add-button">
                    <FontAwesomeIcon icon={faPlus} className="add-icon" onClick={() => {
                        setSchedules(currSchedules => [...currSchedules, {}]);

                    }}/>
                </div>


                <button type="button" className={`save-button show`} onClick={() => saveChanges()}>
                    <p>{cookies.language === "en" ? "Save changes" : "Salveaza modificarile"}</p>
                </button>
            

            </div>

        </div>
    );
};

export default EditDoctorSchedule;