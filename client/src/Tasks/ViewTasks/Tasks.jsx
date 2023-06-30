import { faAngleDown, faAngleUp, faCheck, faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Navigation from "../../Components/Navigation/Navigation";
import TickAnimation from "../../utils/TickAnimation";
import "./Tasks.css";

const Tasks = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();
    const [activeOption, setActiveOption] = useState(0);
    const options = cookies?.language === "en" ? ["Waiting patients", "Laboratory Works"] : ["Pacienti in asteptare", "Lucrari laborator"];
    const [patientsWaiting, setPatientsWaiting] = useState(data.organisation.patients_waiting);
    const [patientsWaitingUnfinished, setPatientsWaitingUnfinished] = useState(patientsWaiting.filter(patientWaiting => !patientWaiting.finished));
    const [patientsWaitingFinished, setPatientsWaitingFinished] = useState(patientsWaiting.filter(patientWaiting => patientWaiting.finished));
    const [worksList, setWorksList] = useState(data.organisation.list_works);
    const [worksListUnfinished, setWorksListUnfinished] = useState(worksList.filter(work => !work.finished));
    const [worksListFinished, setWorksListFinished] = useState(worksList.filter(work => work.finished));
    const [showWorksFinished, setShowWorksFinished] = useState(true);
    const [showPatientsWaitingFinished, setShowPatientswaitingFinished] = useState(true);

    const [taskRemoved, setTaskRemoved] = useState(false);
    const noVideoContentRef = useRef();
    

    const animationFinished = () => {
        document.body.style.background = 'var(--background)';
        window.location.reload();
    };

    useEffect(() => {

    }, []);

    const changeStatusWorksList = async (work, status) => {

        setWorksList(currWorksList => {
            return currWorksList.map((currWork, idx) => {
                if (currWork.id.toString() === currWork.id.toString()) return {...currWork, finished: status};
                return currWork;
            });
        });

        try {
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({...work,
                    finished: status,
                    listWorkId: Number(work.id),
                    organisationId: data.organisation._id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/update-work-list`, options);
            const response = await request.json();
            if (!response.success) console.log(response);
        } catch (e) {
            console.log(e);
        }
    };
    
    useLayoutEffect(() => {
        setPatientsWaitingUnfinished(patientsWaiting.filter(patientWaiting => !patientWaiting.finished));
        setPatientsWaitingFinished(patientsWaiting.filter(patientWaiting => patientWaiting.finished));

    }, [patientsWaiting]);

    useLayoutEffect(() => {
        setWorksListUnfinished(worksList.filter(work => !work.finished));
        setWorksListFinished(worksList.filter(work => work.finished));
    }, [worksList]);
    
    const changeStatusPatientsWaiting = async (patient, status) => {
        try {
            setPatientsWaiting(currPatients => {
                return currPatients.map((currPatient, idx) => {
                    if (currPatient.id.toString() === patient.id.toString()) return {...currPatient, finished: status};
                    return currPatient;
                });
            });

    
      
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({...patient,
                    finished: status,
                    listId: Number(patient.id),
                    organisationId: data.organisation._id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/update-patient-waiting`, options);
            const response = await request.json();
            if (!response.success) console.log(response);
           
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="sterilizations">
            <Navigation page="tasks" />
            <div className="content">
                <Header data={data} />
                {taskRemoved ? (
                    <TickAnimation title={cookies?.language === "en" ? "Task removed successfully!" : "Sarcina a fost stearsa cu success!"} animationFinished={animationFinished} />
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                        <h2 className="title">{cookies?.language === "en" ? "Tasks" : "Sarcini"}</h2>

                        <div className="splitter">
                            {options.length && options.map((option, idx) => (
                                <div className={`splitter-container ${idx === activeOption ? "selected" : ""}`} key={idx} onClick={() => setActiveOption(idx)}>
                                    <h3>{option}</h3>
                                </div>
                            ))}
                        </div>

                        <div className="tasks-container">
                            {activeOption === 0 ? (
                                <>
                                    <div className="first-row">
                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Finish" : "Finalizare"}</p>
                                        </div>
                                        <div className="label">
                                            <p>{cookies?.langauge === "en" ? "Patient" : "Pacient"}</p>
                                        </div>
                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Doctor" : "Medic"}</p>
                                        </div>
                                        <div className="label">
                                            <p>{cookies?.langauge === "en" ? "Schedule date" : "Data programarii"}</p>
                                        </div>
                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Notes": "Observatii"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Options" : "Optiuni"}</p>
                                        </div>
                                    </div>

                                    {patientsWaitingUnfinished.map((patientWaiting, idx) => (
                                        <div className="row" key={idx}>

                                            <div className="label">
                                                <div className={`circle ${patientWaiting.finished ? "finished" : ""}`} onClick={() => changeStatusPatientsWaiting(patientWaiting, !patientWaiting.finished)}>
                                                    {patientWaiting.finished ? <FontAwesomeIcon icon={faCheck} className="check-icon" /> : null}
                                                </div>
                                            </div>

                                            <div className="label">
                                                <p>{data.organisation.patients.find(patient => patient._id === patientWaiting.patientId)?.firstname || ""} {data.organisation.patients.find(patient => patient._id === patientWaiting.patientId)?.lastname}</p>
                                            </div>

                                            <div className="label">
                                                <p>{data.organisation.doctors.find(doctor => doctor._id === patientWaiting.doctorId)?.firstname} {data.organisation.doctors.find(doctor => doctor._id === patientWaiting.doctorId)?.lastname}</p>
                                            </div>
                                            
                                            <div className="label">
                                                <p>{new Date(patientWaiting.scheduleDate).getDate() < 10 ? `0${new Date(patientWaiting.scheduleDate).getDate()}` : new Date(patientWaiting.scheduleDate).getDate()}.{new Date(patientWaiting.scheduleDate).getMonth() + 1 < 10 ? `0${new Date(patientWaiting.scheduleDate).getMonth() + 1}` : new Date(patientWaiting.scheduleDate).getMonth() + 1}.{new Date(patientWaiting.scheduleDate).getFullYear()}</p>
                                            </div>

                                            <div className="label">
                                                <p>{patientWaiting.notes || "Nedefinit"}</p>
                                            </div>

                                            <div className="label" onClick={() => navigate(`/create-task/${activeOption}/0/${patientWaiting.id}`)}>
                                                <FontAwesomeIcon icon={faPencil} className="edit-icon" />
                                            </div>
                                        
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <div className="first-row">
                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Finish" : "Finalizare"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.langauge === "en" ? "Patient" : "Pacient"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Doctor" : "Medic"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.langauge === "en" ? "Type Work" : "Tip Lucrare"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Laboratory": "Laborator"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Delivery": "Predare"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Pickup": "Primire"}</p>
                                        </div>

                                        <div className="label">
                                            <p>{cookies?.language === "en" ? "Options" : "Optiuni"}</p>
                                        </div>
                                    </div>

                                    {worksListUnfinished.map((work, idx) => (
                                        <div className="row" key={idx}>
                                            <div className="label">
                                                <div className={`circle ${work.finished ? "finished" : ""}`} onClick={() => changeStatusWorksList(work, !work.finished)}>
                                                    {work.finished ? <FontAwesomeIcon icon={faCheck} className="check-icon" /> : null}
                                                </div>
                                            </div> 

                                            <div className="label">
                                                <p>{data.organisation.patients.find(patient => patient._id === work.patientId)?.firstname || ""} {data.organisation.patients.find(patient => patient._id === work.patientId)?.lastname || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{data.organisation.doctors.find(doctor => doctor._id === work.doctorId)?.firstname || ""} {data.organisation.doctors.find(doctor => doctor._id === work.doctorId)?.lastname || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{data.organisation.works.find(listWork => listWork.id.toString() === work.workId)?.name || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{data.organisation.labs.find(lab => lab.id.toString() === work.labId)?.name || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{new Date(work.delivery).getDate() < 10 ? `0${new Date(work.delivery).getDate()}` : new Date(work.delivery).getDate()}.{new Date(work.delivery).getMonth() + 1 < 10 ? `0${new Date(work.delivery).getMonth() + 1}` : new Date(work.delivery).getMonth() + 1}.${new Date(work.delivery).getFullYear()}</p>
                                            </div>
                                            <div className="label">
                                                <p>{new Date(work.term).getDate() < 10 ? `0${new Date(work.term).getDate()}` : new Date(work.term).getDate()}.{new Date(work.term).getMonth() + 1 < 10 ? `0${new Date(work.term).getMonth() + 1}` : new Date(work.term).getMonth() + 1}.${new Date(work.term).getFullYear()}</p>
                                            </div>           

                                            <div className="label" onClick={() => navigate(`/create-task/${activeOption}/0/${work.id}`)}>
                                                <FontAwesomeIcon className="edit-icon" icon={faPencil} />
                                            </div>                           
                                        </div>
                                    ))}
                                </>
                            )}
                           
                        </div>


                        <h2 className="title" style={{ marginTop: 50 }}>{cookies.language === "en" ? "Finished Tasks" : "Sarcini Completate"} <FontAwesomeIcon icon={(activeOption === 0 && showPatientsWaitingFinished && patientsWaitingFinished.length) || (activeOption === 1 && showWorksFinished && worksListFinished.length) ? faAngleUp : faAngleDown} onClick={() => activeOption === 0 ? setShowPatientswaitingFinished(curr => !curr) : setShowWorksFinished(curr => !curr) }/> </h2>
                        {activeOption === 0 && showPatientsWaitingFinished && patientsWaitingFinished.length ? 
                                <div className="tasks-container finished">

                                    <>
                                        {patientsWaitingFinished.map((patientWaiting, idx) => (
                                            <div className="row" key={idx}>

                                                <div className="label">
                                                    <div className={`circle ${patientWaiting.finished ? "finished" : ""}`} onClick={() => changeStatusPatientsWaiting(patientWaiting, !patientWaiting.finished)}>
                                                        {patientWaiting.finished ? <FontAwesomeIcon icon={faCheck} className="check-icon" /> : null}
                                                    </div>
                                                </div>

                                                <div className="label">
                                                    <p>{data.organisation.patients.find(patient => patient._id === patientWaiting.patientId)?.firstname || ""} {data.organisation.patients.find(patient => patient._id === patientWaiting.patientId)?.lastname}</p>
                                                </div>

                                                <div className="label">
                                                    <p>{data.organisation.doctors.find(doctor => doctor._id === patientWaiting.doctorId)?.firstname} {data.organisation.doctors.find(doctor => doctor._id === patientWaiting.doctorId)?.lastname}</p>
                                                </div>
                                                
                                                <div className="label">
                                                    <p>{new Date(patientWaiting.scheduleDate).getDate() < 10 ? `0${new Date(patientWaiting.scheduleDate).getDate()}` : new Date(patientWaiting.scheduleDate).getDate()}.{new Date(patientWaiting.scheduleDate).getMonth() + 1 < 10 ? `0${new Date(patientWaiting.scheduleDate).getMonth() + 1}` : new Date(patientWaiting.scheduleDate).getMonth() + 1}.{new Date(patientWaiting.scheduleDate).getFullYear()}</p>
                                                </div>

                                                <div className="label">
                                                    <p>{patientWaiting.notes || "Nedefinit"}</p>
                                                </div>

                                                <div className="label" onClick={() => navigate(`/create-task/${activeOption}/0/${patientWaiting.id}`)}>
                                                    <FontAwesomeIcon icon={faPencil} className="edit-icon" />
                                                </div>

                                                <div className="line" />
                                            
                                            </div>
                                        ))}
                                    </>
                                </div>
                            : activeOption === 1 && showWorksFinished && worksListFinished.length ? (
                                <div className="tasks-container finished">
                                    

                                    {worksListFinished.map((work, idx) => (
                                        <div className="row" key={idx}>
                                            <div className="label">
                                                <div className={`circle ${work.finished ? "finished" : ""}`} onClick={() => changeStatusWorksList(work, !work.finished)}>
                                                    {work.finished ? <FontAwesomeIcon icon={faCheck} className="check-icon" /> : null}
                                                </div>
                                            </div> 

                                            <div className="label">
                                                <p>{data.organisation.patients.find(patient => patient._id === work.patientId)?.firstname || ""} {data.organisation.patients.find(patient => patient._id === work.patientId)?.lastname || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{data.organisation.doctors.find(doctor => doctor._id === work.doctorId)?.firstname || ""} {data.organisation.doctors.find(doctor => doctor._id === work.doctorId)?.lastname || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{data.organisation.works.find(listWork => listWork.id.toString() === work.workId)?.name || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{data.organisation.labs.find(lab => lab.id.toString() === work.labId)?.name || ""}</p>
                                            </div>
                                            <div className="label">
                                                <p>{new Date(work.delivery).getDate() < 10 ? `0${new Date(work.delivery).getDate()}` : new Date(work.delivery).getDate()}.{new Date(work.delivery).getMonth() + 1 < 10 ? `0${new Date(work.delivery).getMonth() + 1}` : new Date(work.delivery).getMonth() + 1}.${new Date(work.delivery).getFullYear()}</p>
                                            </div>
                                            <div className="label">
                                                <p>{new Date(work.term).getDate() < 10 ? `0${new Date(work.term).getDate()}` : new Date(work.term).getDate()}.{new Date(work.term).getMonth() + 1 < 10 ? `0${new Date(work.term).getMonth() + 1}` : new Date(work.term).getMonth() + 1}.${new Date(work.term).getFullYear()}</p>
                                            </div>      

                                            <div className="label" onClick={() => navigate(`/create-task/${activeOption}/0/${work.id}`)}>
                                                    <FontAwesomeIcon icon={faPencil} className="edit-icon" />
                                            </div>

                                            <div className="line" />
                                
                                        </div>
                                    ))}
                                </div>
                            ) 
                            : null}

                        <div className="add-button" onClick={() => navigate(`/create-task/${activeOption}/1/0`)}>
                            <FontAwesomeIcon icon={faPlus} className="add-icon" />
                            {activeOption === 0 ? <p>{cookies?.language === "en" ? "Add patient on hold" : "Adauga pacient in asteptare"}</p> : <p>{cookies?.language === "en" ? "Add lab work" : "Adauga lucrare laborator"}</p>}
                        </div>
                    </div>
                )}
                
    
            </div>
        </div>
    );
};

export default Tasks;