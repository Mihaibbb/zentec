import { faAddressBook, faAddressCard, faAngleLeft, faCalendar, faCheck, faCity, faDeleteLeft, faEnvelope, faIdBadge, faMars, faNoteSticky, faPhone, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef, useMemo } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import DateCustomInput from "../Components/DatePicker/DatePicker";
import tickAnimationWhite from "../imgs/green-tick-light-theme.mp4";
import tickAnimation from "../imgs/green-tick.mp4";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import "./PatientAccount.css";
import TickAnimation from "../utils/TickAnimation";


const PatientAccount = ({ data }) => {


    const navigation = useNavigate();
    const param = useParams();
    const location = useLocation();
   
    const [cookies, setCookie] = useCookies();
    const birthRef = useRef();
    const noVideoContentRef = useRef();
    const options = cookies.language === "en" ? ["Patient's Data", "Appointments", "Documents", "Treatment Plan", "Treatments"] : ["Datele Pacientului", "Programari", "Documente", "Plan Tratament", "Tratamente"];
    
    if (!param?.id || !param?.historicPage) navigation(-1);
    console.log(param);                      
    const historicPage = Number(param?.historicPage);
  
    const patient = location?.state?.patient;
    console.log(patient);

    const initialFirstName = patient.firstname;
    const initialLastName = patient.lastname;
    const initialUsername = patient.username || "";
    const initialPhone = patient.phone;
    const initialEmail = patient.email || "";
    const initialCity = patient.city || "";
    const initialCounty = patient.county || "";
    const initialAddress = patient.address || "";
    const initialGender = patient.gender || "";
    const initialFileNumber = patient.fileNumber || "";
    const initialPIC = patient.cnp || "";
    const initialNotes = patient.notes || "";
    const initialBirthdate = patient.birthdate || "";
    const documents = JSON.parse(patient?.documents || "[]");
    
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [username, setUsername] = useState(initialUsername);
    const [phoneNumber, setPhoneNumber] = useState(initialPhone);
    const [birthDate, setBirthDate] = useState(initialBirthdate);
    const [email, setEmail] = useState(initialEmail);
    const [city, setCity] = useState(initialCity); 
    const [county, setCounty] = useState(initialCounty);
    const [address, setAddress] = useState(initialAddress);
    const [gender, setGender] = useState(initialGender);
    const [fileNumber, setFileNumber] = useState(initialFileNumber);
    const [PIC, setPIC] = useState(initialPIC);
    const [notes, setNotes] = useState(initialNotes);
    const [showUpdate, setShowUpdate] = useState(false);
    const [historic, setHistoric] = useState(JSON.parse(patient.historic));
    console.log(historic);
    const [historicOption, setHistoricOption] = useState(0);
    const [errorMessage, setErrorMessage] = useState();
    const [patientMessage, setPatientMessage] = useState("");
    const [patientEdited, setPatientEdited] = useState(false);
    const [videoMessage, setVideoMessage] = useState("");
    const initialActiveOption = location?.state?.activeOption || 0;
    const [activeOption, setActiveOption] = useState(initialActiveOption);

    const theme = useMemo(() => cookies?.theme || "dark", [cookies]);

    const currGenders = cookies.language === "en" ? ['Male', 'Female', 'Not mentioned'] : ['Masculin', 'Feminin', 'Nespecificat'];

    const gendersRef = useRef([]);

    const toggleGender = (idx) => {
        gendersRef.current[idx].classList.toggle("active");
        gendersRef.current.forEach((currGender, currIdx) => currIdx !== idx && currGender.classList.remove("active"));
        setGender(gendersRef.current[idx].classList.contains("active") ? currGenders[idx] : "");
    };

    const checkId = async (parameterId) => {
        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                patientId: parameterId,
                organisationId: data.organisation._id
            })
        };
        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/check-patient`, options);
            const response = await request.json();
            console.log(response);
            if (!response || !response.success) navigation(-1);
            
        } catch (e) {
            console.log(e)
        }
    };

    const updateAccount = async () => {
        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                patientId: param.id,
                organisationId: data.organisation._id,
                firstname: firstName,
                lastname: lastName,
                username: username,
                email: email,
                phone: phoneNumber,
                birthdate: birthDate !== "" ? birthDate : patient.birthdate,
                cnp: PIC,
                gender: gender,
                city,
                county,
                address,
                doctors: patient.doctors,
                notes,
                fileNumber: fileNumber
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/update-patient`, options);
            console.log(request);
            const response = await request.json();
            console.log(response.message);
            if (!response.success) setErrorMessage(response.message[cookies.language]);
            else {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => {
                    setPatientEdited(true);
                    setPatientMessage(response.message);
                    setVideoMessage(cookies?.language === "en" ? "Changes have been saved successfully!" : "Modificarile au fost salvate cu succes!");
                }, 300);
            }
        } catch(e) {
            console.log(e);
        }
    };

    const removePatient = async (patientId) => {
        const options = {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                _id: data.organisation._id,
                patientId
            })
        };
        
        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-patient`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => {
                    setPatientEdited(true);
                    setVideoMessage(cookies?.language === "en" ? "Patient removed successfully!" : "Pacientul a fost sters cu succes!");
                }, 300);
            }
        } catch (e) {
            console.log(e);
        }
   
    };

    useEffect(() => {
        (async () => {
            await checkId(param.id);
        })();
    }, []);

    useEffect(() => {
        if (
            firstName !== initialFirstName ||
            lastName !== initialLastName ||
            username !== initialUsername ||
            phoneNumber !== initialPhone ||
            email !== initialEmail ||
            city !== initialCity ||
            county !== initialCounty ||
            address !== initialAddress ||
            gender !== initialGender ||
            fileNumber !== initialFileNumber || 
            PIC !== initialPIC ||
            notes !== initialNotes ||
            (birthDate && birthDate !== "" && new Date(birthDate)?.getTime() !== new Date(initialBirthdate)?.getTime())
        ) setShowUpdate(true);
        else setShowUpdate(false);
    }, [firstName, lastName, phoneNumber, username, email, city, county, address, gender, fileNumber, PIC, notes, birthDate]);

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    useEffect(() => {
        window.addEventListener("beforeunload", e => {
            return "Any string value here forces a dialog box to \n" + 
             "appear before closing the window.";
        }); 
    }, []);

    useEffect(() => {
        if (!birthRef.current) return;
        const today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        if (day < 10) day = '0' + day;
        
        
        if (month < 10) month = '0' + month;
           
        const inputMax = `${year}-${month}-${day}`;
        const inputMin = `${year - 100}-${month}-${day}`;
        birthRef.current.setAttribute("max", inputMax);
        birthRef.current.setAttribute("min", inputMin);
        
    }, [birthRef]);

    useEffect(() => {
        if (historicOption === 0) {
            
            setHistoric(currHistoric => currHistoric.filter(appointment => false));
            JSON.parse(patient.historic).forEach(appointment => {
                const appointmentStartDate = new Date(new Date(appointment.date).getFullYear(), new Date(appointment.date).getMonth(), new Date(appointment.date).getDate(), Number(appointment.startHour), Number(appointment.startMinutes));
                if (appointmentStartDate.getTime() <= new Date().getTime() && !appointment.cancel) setHistoric(currHistoric => [...currHistoric, appointment]);
            });

        } else if (historicOption === 1) {
            setHistoric(currHistoric => currHistoric.filter(appointment => false));
            JSON.parse(patient.historic).forEach(appointment => {
                const appointmentStartDate = new Date(new Date(appointment.date).getFullYear(), new Date(appointment.date).getMonth(), new Date(appointment.date).getDate(), Number(appointment.startHour), Number(appointment.startMinutes));
                if (appointmentStartDate.getTime() > new Date().getTime() && !appointment.cancel) setHistoric(currHistoric => [...currHistoric, appointment]);
            });
        } else {
            setHistoric(currHistoric => currHistoric.filter(appointment => false));
            JSON.parse(patient.historic).forEach(appointment => {
                if (appointment.cancel) setHistoric(currHistoric => [...currHistoric, appointment]);
            });
        }
    }, [historicOption]);

    const handleChangeDate = (newBirthdate) => setBirthDate(new Date(newBirthdate));

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        navigation("/patients", { state: patientMessage });
    };
    
    const removeFutureAppointment = async (appointmentDate, appointmentStartHour, appointmentStartMinutes, appointmentEndHour, appointmentEndMinutes) => {
        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            };
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-future-appointment/${data.organisation._id}/${param?.id}/${new Date(appointmentDate).getTime()}/${appointmentStartHour}/${appointmentStartMinutes}/${appointmentEndHour}/${appointmentEndMinutes}`, options);
            const response = await request.json();
            if (response?.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => {
                    setPatientEdited(true);
                    setVideoMessage(cookies?.language === "en" ? "Appointment removed successfully!" : "Programarea a fost stearsa cu succes!");
                }, 300);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (activeOption === initialActiveOption) return;
        if (activeOption === 0) navigation(`/patient/${param?.id}/0`, { state: { ...location?.state, activeOption } });
        if (activeOption === 1) navigation(`/patient/${param?.id}/1`, { state: { ...location?.state, activeOption } });
        else if (activeOption === 2) navigation(`/patient/${param?.id}/2`, { state: {...location?.state, activeOption} });
    }, [activeOption]);
    
    return (
        <div className="account-container"> 
            <Navigation />

            <div className="content" style={patientEdited ? { maxHeight: "100vh" } : {}}> 
                <Header data={data} />
              
                {patientEdited ?
                <TickAnimation animationFinished={animationFinished} title={videoMessage} />
                : 
                <div className="patient-account-details no-video-content" ref={noVideoContentRef}>
                     <div className="patient-name">
                        <FontAwesomeIcon icon={faUser} className="patient-icon" />
                        <h2>{initialFirstName} {initialLastName}</h2>
                        <div className="patient-option-icon">
                            <FontAwesomeIcon icon={faTrashCan} className="remove-icon option-icon" onClick={async () => await removePatient()} />
                            <div className="label">
                                <p>{cookies?.language === "en" ? "Remove Patient" : "Sterge Pacient"}</p>
                            </div>
                        </div>

                       
                    </div>
                    <div className="options-bar">
                        {options && options.length && options.map((option, idx) => (
                            <div className={`option ${activeOption === idx ? "active" : ""}`} key={idx} onClick={() => setActiveOption(idx)}>
                                <h3>{option}</h3>
                            </div>
                        ))}
                    </div>
                    
                    {!historicPage ? (
                        <>
                            {/* <h2 className="title">{cookies.language === "en" ? "Patient's data" : "Date pacient"}</h2>  */}
                           
                        </>
                    ) : null}
                  
                    <div className="go-back" onClick={() => navigation("/patients")}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>

                    {historicPage === 0 ? <div className="inputs-container">
                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faUser} />
                                <p>{cookies.language === "en" ? "First name" : "Prenume"}</p>
                            </div>
                            
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                        </div>   

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faUser} />
                                <p>{cookies.language === "en" ? "Last name" : "Nume de familie"}</p>
                            </div>
                            
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}/>
                        </div>  

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faCalendar} />
                                <p>{cookies.language === "en" ? "Date of birth" : "Data de nastere"}</p>
                            </div>
                            <DateCustomInput initialDate={initialBirthdate} changeDate={handleChangeDate} future={false} past={true} label={cookies.language === "en" ? "Date of birth" : "Data de nastere"} />
                        </div>

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faPhone} />
                                <p>{cookies.language === "en" ? "Phone number" : "Numar de telefon"}</p>
                            </div>
                            
                            <input type="number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}/>
                        </div> 

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faEnvelope} />
                                <p>Email</p>
                            </div>
                            
                            <input type="text" value={email} onChange={e => setEmail(e.target.value)}/>
                        </div> 

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faUser} />
                                <p>{cookies.language === "en" ? "Username" : "Nume utilizator"}</p>
                            </div>
                            
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)}/>
                        </div> 

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faCity} />
                                <p>{cookies.language === "en" ? "City" : "Oras"}</p>
                            </div>
                            
                            <input type="text" value={city} onChange={e => setCity(e.target.value)}/>
                        </div> 

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faCity} />
                                <p>{cookies.language === "en" ? "County" : "Judet"}</p>
                            </div>
                            
                            <input type="text" value={county} onChange={e => setCounty(e.target.value)}/>
                        </div> 

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faAddressCard} />
                                <p>{cookies.language === "en" ? "Address" : "Adresa"}</p>
                            </div>
                            
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)}/>
                        </div> 

                        <div className="input">

                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faMars} />
                                <p>{cookies.language === "en" ? "Gender" : "Sex"}</p>
                            </div>
                            <div className="options">
                                {currGenders.map((currGender, idx) => (
                                    <div className={`option ${currGender === gender ? "active" : ""}`} key={idx} ref={ref => gendersRef.current[idx] = ref}>
                                        <div className="circle" onClick={() => toggleGender(idx)}>
                                            
                                            <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                            
                                        </div>
                                        <p className="patient-gender">{currGender}</p>
                                    </div>
                                ))}
                            </div>
                           
                            
                        </div>

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faIdBadge} />
                                <p>{cookies.language === "en" ? "File number" : "Numar fisa"}</p>
                            </div>
                            
                            <input type="number" value={fileNumber} onChange={e => setFileNumber(e.target.value)}/>
                        </div> 

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faAddressCard} />
                                <p>{cookies.language === "en" ? "PIC" : "CNP"}</p>
                            </div>
                            
                            <input type="number" value={PIC} onChange={e => setPIC(e.target.value)}/>
                        </div> 
                        

                        <div className="input">
                            <div className="input-title">
                                <FontAwesomeIcon className="icon" icon={faNoteSticky} />
                                <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                            </div>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} />
                        </div> 

                        
                        <button className={`update ${showUpdate ? "active" : ""}`} onClick={async () => showUpdate && await updateAccount()}>
                            <p>{cookies.language === "en" ? "Update account" : "Confirma modificarile"}</p>
                        </button>    
                     
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </div> : null} 
                        
                </div>}

                {historicPage === 1 ? <div className="patient-historic">
                    {/* <h2 className="title">{cookies.language === "en" ? "Patient's appointments" : "Programarile pacientului"}</h2>
                    <div className="patient-name">
                        <FontAwesomeIcon icon={faUser} className="patient-icon" />
                        <h2>{initialFirstName} {initialLastName}</h2>
                    </div> */}

                    <div className="historic-options">

                        <div className={`historic-option ${historicOption === 0 ? "active" : ""}`} onClick={() => setHistoricOption(0)}>
                            <p>{cookies.language === "en" ? "Past appointments" : "Programari trecute"}</p>
                        </div>

                        <div className={`historic-option ${historicOption === 1 ? "active" : ""}`} onClick={() => setHistoricOption(1)}>
                            <p>{cookies.language === "en" ? "Future appointments" : "Programari viitoare"}</p>
                        </div>

                        <div className={`historic-option ${historicOption === 2 ? "active" : ""}`} onClick={() => setHistoricOption(2)}>
                            <p>{cookies.language === "en" ? "Canceled appointments" : "Programari anulate"}</p>
                        </div>

                    </div>
                    
                    <div className="historic-container">
                        
                        <div className="first-row">
                            <div className="col">{cookies.language === "en" ? "Title" : "Titlu"}</div>
                            <div className="col">{cookies.language === "en" ? "Date" : "Data"}</div>
                            <div className="col">{cookies.language === "en" ? "Interval": "Interval"}</div>
                            <div className="col">{cookies.language === "en" ? "Price": "Cost"}</div>
                            {historicOption === 1 ? <div className="col">{cookies.language === "en" ? "Options" : "Optiuni"}</div> : null}
                        </div>

                        {historic && historic.length > 0 && historic.map(historicItem => (
                            <div className="historic-item">
                                <div className="col">{historicItem.title}</div>
                                <div className="col">{new Date(historicItem.date).getDate() < 10 ? `0${new Date(historicItem.date).getDate()}` : new Date(historicItem.date).getDate()}/{new Date(historicItem.date).getMonth() + 1 < 10 ? `0${new Date(historicItem.date).getMonth() + 1}` : new Date(historicItem.date).getMonth() + 1}/{new Date(historicItem.date).getFullYear()}</div>
                                <div className="col">{historicItem.startHour < 10 ? `0${historicItem.startHour}` : historicItem.startHour}:{historicItem.startMinutes < 10 ? `0${historicItem.startMinutes}` : historicItem.startMinutes} - {historicItem.endHour < 10 ? `0${historicItem.endHour}` : historicItem.endHour}:{historicItem.endMinutes < 10 ? `0${historicItem.endMinutes}` : historicItem.endMinutes}</div>
                                <div className="col">{historicItem?.price || "Nedefinit"} {historicItem?.price ? historicItem?.typePrice : ""}</div>
                                {historicOption === 1 ? <div className="col column pressable">
                                    <FontAwesomeIcon icon={faTrashCan} className="remove-icon" onClick={async () => await removeFutureAppointment(new Date(historicItem?.date), historicItem?.startHour, historicItem?.startMinutes, historicItem?.endHour, historicItem?.endMinutes)} />
                                </div> : null}
                            </div>
                        ))}
                    </div>
                </div> : null}

                {/* { historicPage === 2 ? 
                <>
                    <h2 className="title">{cookies.language === "en" ? "Import Patients" : "Importa Pacienti"}</h2>

                    <div className="go-back" onClick={() => navigation(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>

                    <input type="file" onChange={handleFile} className="file-input" ref={uploadFileInputRef} />
                    
                    <div className="drop-container" onClick={() => uploadFileInputRef.current.click()} onDragEnter={handleDrag}>
                        <FontAwesomeIcon icon={faCloudArrowUp} className="cloud-icon" />
                        <h2>{cookies.language === "en" ? "Select files here to upload" : "Selectati fisierele pe care doriti sa le incarcati!"}</h2>
                        { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                    </div>

                    {excelData && excelData.length > 0 && excelData.map((row, idx) => (
                        <div className="row" key={idx}>
                            <p>{row.firstname}</p>
                        </div>
                    ))}

            
                    <button type="button" className={`save-button ${success ? "show" : ""}`} onClick={async () => success && await uploadPatients()}>
                        <h2>{cookies.language === "en" ? "Save Patients" : "Salveaza Pacientii"}</h2>
                    </button>
                </> : null } */}

                {historicPage === 2 ? (
                    <>
                     {documents && documents.length ? (
                        <div className="documents-container">
                            {/* <h2 className="title">{options[historicPage]}</h2> */}
                            {documents.map((document, idx) => (
                                <div className="document">
                                    <img className="document-image" src={`${process.env.REACT_APP_BACKEND_URL}${document.source}`} alt="document" />
                                    <h2 className="document-name">{document.fileName}</h2>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="patients-container">
                            <h2 className="center">{cookies?.language === "en" ? "No documens uploaded." : "Niciun document incarcat."}</h2>
                        </div>
                    )}

                        <div className="add-button" onClick={() => navigation(`/patient/${param?.id}/upload`, { state: location?.state })}>
                            <FontAwesomeIcon icon={faPlus} className="add-icon" />
                            <p>{cookies?.language === "en" ? "Upload document" : "Incarca document"}</p>
                        </div>
                    </>
                ) : null} 

                
            </div>
        </div>
    );
};

export default PatientAccount;