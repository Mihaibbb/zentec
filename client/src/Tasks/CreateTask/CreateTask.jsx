import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "../../Components/Navigation/Navigation";
import "./CreateTask.css";
import Select from "react-select";
import DateCustomInput from "../../Components/DatePicker/DatePicker";
import TickAnimation from "../../utils/TickAnimation";
import Header from "../../Components/Header/Header";
import { useCallback } from "react";

const CreateTask = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const [taskAdded, setTaskAdded] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const noVideoContentRef = useRef();
    const params = useParams();
    if (params?.activeOption === null || params?.createMode === null) navigate(-1);
    const createMode = Number(params?.createMode);
    const activeOption = Number(params?.activeOption);

    const taskData = !createMode ? (activeOption === 0 ? data.organisation.patients_waiting.find(waiting => Number(waiting.id) === Number(params?.taskId)) : data.organisation.list_works.find(work => Number(work.id) === Number(params?.taskId))) : {};

    const [doctorNameValue, setDoctorNameValue] = useState(taskData?.doctorId ? `${data.organisation.doctors.find(doctor => doctor._id === taskData?.doctorId)?.firstname} ${data.organisation.doctors.find(doctor => doctor._id === taskData?.doctorId)?.lastname}` : "");
    const [doctorValue, setDoctorValue] = useState(taskData?.doctorId || "");
    const [patientNameValue, setPatientNameValue] = useState(taskData?.patientId ? `${data.organisation.patients.find(patient => patient._id === taskData?.patientId)?.firstname} ${data.organisation.patients.find(patient => patient._id === taskData?.patientId)?.lastname}` : "");
    const [patientValue, setPatientValue] = useState(taskData?.patientId || "");
    const [appointmentDate, setAppointmentDate] = useState(new Date(taskData?.scheduleDate || new Date()));
    const [notes, setNotes] = useState(taskData?.notes || "");
    const [workNameValue, setWorkNameValue] = useState(taskData?.workId ? (data.organisation.works.find(work => work.id.toString() === taskData?.workId.toString())?.name) : "");
    const [workValue, setWorkValue] = useState(taskData?.workId || "");
    const [pickupDate, setPickupDate] = useState(new Date(taskData?.term || new Date()));
    const [deliveryDate, setDeliveryDate] = useState(new Date(taskData?.delivery || new Date()));
    const [labNameValue, setLabNameValue] = useState(taskData?.labId ? data.organisation.labs.find(lab => Number(lab.id) === Number(taskData?.labId))?.name : "");
    const [labValue, setLabValue] = useState(taskData?.labId || "");
    const [animationName, setAnimationName] = useState("");

    const doctorsOptions = data.organisation.doctors.map(doctor => {
        return {
            label: `${doctor.firstname} ${doctor.lastname}`,
            value: doctor._id
        };
    });

    const patientsOptions = data.organisation.patients.map(patient => {
        return {
            label: `${patient.firstname} ${patient.lastname} (${cookies?.language === "en" ? `File no: ${patient.fileNumber}` : `Nr. fisa: ${patient.fileNumber}`}) - ${patient.phone}`,
            value: patient._id,
            fileNumber: patient.fileNumber,
            phone: patient.phone
        };
    });

    const labsOptions = data.organisation.labs.map(lab => {
        return {
            label: `${lab.name}`,
            value: `${lab.id}`
        };
    });

    const animationFinished = () => {
        window.location.replace("/tasks");
    };

    const worksOptions = data.organisation.works.map(work => {
        return {
            label: `${work.name}`,
            value: `${work.id}`,
            color: `${work.color}`
        };
    });

    const isTouchDevice = useCallback(() => {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    }, []);

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

    const createPatientWaiting = async () => {
        try {
            const options = {
                method: createMode ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    patientId: patientValue,
                    doctorId: doctorValue,
                    notes: notes,
                    scheduleDate: appointmentDate,
                    finished: taskData?.finished != null ? taskData?.finished : false,
                    listId: Number(taskData?.id || -1)
                })  
            };

            console.log(taskData?.finished);

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/${createMode ? "create" : "update"}-patient-waiting`, options);
            const response = await request.json();
            if (response.success) {
                setAnimationName(cookies?.language === "en" ? `Patient on hold ${createMode ? "created" : "updated"} successfully!` : `Pacientul in astepare a fost ${createMode ? "adaugat" : "modificat"} cu succes!`);
                setTaskAdded(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const createLabWork = async () => {
        try {
            const options = {
                method: createMode ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    patientId: patientValue,
                    doctorId: doctorValue,
                    labId: labValue,
                    workId: workValue,
                    delivery: new Date(deliveryDate),
                    term: new Date(pickupDate),
                    listWorkId: Number(taskData?.id || -1),
                    finished: taskData?.finished != null ? taskData?.finished : false
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/${createMode ? "create" : "update"}-work-list`, options);
            const response = await request.json();
            if (response.success) {
                setAnimationName(cookies?.language === "en" ? `Laboratory work ${createMode ? "created" : "updated"} successfully!` : `Lucrare laborator a fost ${createMode ? "adaugata" : "modificata"} cu success!`);
                setTaskAdded(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="create-doctor">
            <Navigation page="tasks" />
            <div className="content" style={taskAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {taskAdded ? (
                    <TickAnimation title={animationName} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? `${createMode ? "Add" : "Edit"} ${activeOption === 0 ? "patient in waiting" : "laboratory work"}` : `${createMode ? "Adauga" : "Editeaza"} ${activeOption === 0 ? "pacient in asteptare" : "lucrare laborator"}`}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Patient *" : "Pacient *"}</p>
                            <Select 
                                options={patientsOptions}
                                placeholder={patientNameValue}
                                value={{ label: patientNameValue && patientNameValue.length ? patientNameValue : (cookies?.language === "en" ? "Select patient..." : "Selecteaza pacientul..."),  value: patientValue }}
                                onChange={e => {
                                    setPatientNameValue(e.label);
                                    setPatientValue(e.value);
                                }} 
                                styles={customStyles}
                                readOnly={isTouchDevice()}
                            />
                        </div>

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Doctor *" : "Medic *"}</p>
                            <Select 
                                options={doctorsOptions}
                                placeholder={doctorNameValue}
                                value={{ label: doctorNameValue && doctorNameValue.length ? doctorNameValue : (cookies?.language === "en" ? "Select doctor..." : "Selecteaza medicul..."),  value: doctorValue }}
                                onChange={e => {
                                    setDoctorNameValue(e.label);
                                    setDoctorValue(e.value);
                                }} 
                                styles={customStyles}
                                readOnly={isTouchDevice()}
                            />
                        </div>

                        {activeOption === 0 ? 
                         <div className="input">
                            <p>{cookies?.language === "en" ? "Notes" : "Observatii"}</p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} />
                        </div> : (
                            <div className="input">
                                <p>{cookies?.language === "en" ? "Laboratory" : "Laborator"}</p>
                                <Select 
                                    options={labsOptions}
                                    styles={customStyles}
                                    readOnly={isTouchDevice()}
                                    placeholder={labNameValue}
                                    value={{ label: labNameValue && labNameValue.length ? labNameValue : (cookies?.language === "en" ? "Select laboratory..." : "Selecteaza laboratorul..."), value: labValue }}
                                    onChange={e => {
                                        setLabNameValue(e.label);
                                        setLabValue(e.value);
                                    }}
                                />
                            </div>
                        )}

                        {activeOption === 0 ? (
                           <div className="input">
                           <p>{cookies.language === "en" ? "Appointment date *": "Data programare *"}</p>
                           <DateCustomInput 
                               initialDate={appointmentDate} 
                               future={true} 
                               past={false} 
                               changeDate={(currDate) => setAppointmentDate(new Date(currDate))}
                               label={cookies?.language === "en" ? "Appointment date" : "Data programare"}
                           />
                        </div>
                        ) : (
                            <div className="input">
                                <p>{cookies?.language === "en" ? "Work type" : "Tip lucrare"}</p>
                                <Select 
                                    options={worksOptions}
                                    styles={customStyles}
                                    readOnly={isTouchDevice()}
                                    placeholder={workNameValue}
                                    value={{ label: workNameValue && workNameValue.length ? workNameValue : (cookies?.language === "en" ? "Select work type.." : "Selecteaza tip lucrare.."), value: workValue }}
                                    onChange={e => {
                                        setWorkNameValue(e.label);
                                        setWorkValue(e.value);
                                    }}
                                />
                            </div>
                        )}

                        {activeOption === 0 ? <div className="input" style={{ opacity: 0, userSelect: "none", cursor: "initial" }}>
                            <p>{cookies.language === "en" ? "Appointment date *": "Data programare *"}</p>
                            <DateCustomInput 
                                initialDate={appointmentDate} 
                                future={true} 
                                past={false} 
                                changeDate={(currDate) => setAppointmentDate(new Date(currDate))}
                                label={cookies?.language === "en" ? "Appointment date" : "Data programare"}
                            />
                        </div> : null}

                        {activeOption === 1 ? (
                            <>
                                <div className="input">
                                    <p>{cookies?.language === "en" ? "Delivery Date" : "Termen Predare"}</p>
                                    <DateCustomInput 
                                        initialDate={deliveryDate}
                                        changeDate={(currDate) => setDeliveryDate(new Date(currDate))}
                                        future={true}
                                        past={false}
                                        label={cookies?.language === "en" ? "Delivery date" : "Termen predare"}
                                    />
                                </div>

                                <div className="input">
                                    <p>{cookies?.language === "en" ? "Pickup Date" : "Termen Primire"}</p>
                                    <DateCustomInput 
                                        initialDate={pickupDate}
                                        changeDate={(currDate) => setPickupDate(new Date(currDate))}
                                        future={true}
                                        past={false}
                                        label={cookies?.language === "en" ? "Pickup date" : "Termen primire"}
                                    />
                                </div>
                            </>
                        ) : null}
                        

                        <button type="submit"  className="confirm-button" onClick={async () => activeOption === 0 ? await createPatientWaiting() : await createLabWork()}>{cookies.language === "en" ? "Save": "Salveaza"}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default CreateTask;