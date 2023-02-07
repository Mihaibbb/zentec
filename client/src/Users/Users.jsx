import "../Patients/Patients.css";
import "./Users.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsis, faSearch, faCheck, faEdit, faTimes, faHistory, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons"
import { useState, useEffect } from "react"; 
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";

const Users = ({ data }) => {

    const [doctors, setDoctors] = useState([]);
    const [query, setQuery] = useState("");
    const [cookies, setCookie] = useCookies();
    const [warning, setWarning] = useState(false);
    const [doctorId, setDoctorId] = useState();
    const [message, setMessage] = useState();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigation = useNavigate();
 

    const optionsRef = useRef([]);
    const contentRef = useRef();

    const getDoctors = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: data.organisation._id
            })
        };

        const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-doctors`, options);
        const response = await request.json();
        if (!response.success) return;
        setDoctors(response.doctors);
    };     

    const removeDoctor = async (doctorId) => {
        if (!warning) return;

        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    doctorId
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-doctor`, options);
            const response = await request.json();
            setWarning(false);
            setDoctorId();
            if (await response.success) navigation("/doctors", { state: { success: true, message: await response[cookies.language], notEdit: true }});
            
        } catch (e) {
            console.log(e);
            navigation("/doctors", { state: { message: cookies.language === "en" ? "An error occured!" : "A aparut o eroare!" }, notEdit: true });
        }
    };

    const toggleActiveDoctor = async (doctorObj) => {
        console.log(doctorObj);
        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    doctorId: doctorObj._id,
                    firstname: doctorObj.firstname,
                    lastname: doctorObj.lastname,
                    phone: doctorObj.phone,
                    email: doctorObj.email,
                    multipleSchedules: doctorObj.multiple_schedules,
                    color: doctorObj.color,
                    activeDoctor: !doctorObj.active
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-doctor`, options);
            const response = await request.json();
            if (await response.success) navigation("/doctors", { state: { 
                success: true, 
                message: cookies.language === "en" ? `Doctor ${!doctorObj.active ? "activated" : "disabled"} successfully!` : `Doctor ${!doctorObj.active ? "activat" : "dezactivat"} cu succes!`,
                notEdit: true
            } })

            

        } catch (e) {
            console.log(e);
            navigation("/doctors", { state: {
                success: false,
                message: cookies.language === "en" ? "Doctor's status couldn't be changed!" : "Statusul doctorului nu a putut fi modificat!",
                notEdit: true
            }})
        }
    };

    const location = useLocation();

    useEffect(() => {
        window.addEventListener("resize", () => {
            setWindowWidth(window.innerWidth);
        });
    }, [location]);

    useEffect(() => {
       
        console.log(location?.state);
        if (window.history?.state?.message && window.history?.state?.oneTime && window?.history?.state?.success != null) {
            
            setMessage({
                success: window.history?.state?.success,
                message: window.history?.state?.message
            });

            const timer = setTimeout(() => {
                setMessage();
            }, 2500);

            return () => clearTimeout(timer);
        
            // const time = setTimeout(() =>  setMessage(), 2500);

            // return () => {
            //     clearTimeout(time);
            // };
        }
       
        if (location?.state?.message == null) return;
        const newLocationState = location?.state || {};
        newLocationState["oneTime"] = true;
        window.history.replaceState(newLocationState, '');
        window.location.reload();
    }, [location?.state]);

    useEffect(() => {
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);



    useEffect(() => {
        (async () => {
            await getDoctors();
        })();
    }, []);    

    useEffect(() => {
        (async () => {
            if (query === "") {
                await getDoctors();
                return;
            }

            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    searchQuery: query
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-doctor`, options);
            const response = await request.json();
          
            if (await response.success) setDoctors(await response.doctors || []);
            else setDoctors([]);
        })();
     
    }, [query]);


    const triggerOptions = (idx) => {
        optionsRef?.current?.length && optionsRef?.current[idx]?.classList?.toggle("show");
        optionsRef?.current?.length && optionsRef?.current.forEach((option, currIdx) => currIdx !== idx && option?.classList?.remove("show"));
    };


    return (
        <div className="patients">
            <Navigation page="doctors" />

            <div className="content">
                <Header data={data} />
                <h2 className="title">{cookies.language === "en" ? "Doctors List" : "Lista Medici"}</h2>
        
                {doctors && (doctors.length > 0 || query.length > 0) && <div className="search-container">
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search patient..." : "Cauta doctor..."} />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>}

                <div className="patients-container">

                    {doctors.length > 0 && <div className="first-row">

                        {windowWidth >= 500 ? <div className="column">
                            <p>{cookies.langauge === "en" ? "No.": "Nr."}</p>
                        </div> : null}

                        <div className="column">
                            <p>{cookies.language === "en" ? "Surname" : "Nume"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Name" : "Prenume"}</p>
                        </div>

                        {windowWidth >= 800 ? <div className="column">
                            <p>{cookies.language === "en" ? "Phone" : "Telefon"}</p>
                        </div> : null}

                        <div className="column">
                            <p>{cookies.langauge === "en" ? "Color" : "Culoare"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                        </div>

                    </div>}

                    {doctors.length > 0 ? doctors.map((doctor, idx) => (
                        <div className="row" key={idx}>
                            
                            {windowWidth >= 500 ? <div className="column">
                                <p>{idx + 1}</p>
                            </div> : null}

                            <div className="column">
                                <p>{doctor.firstname}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.lastname}</p>
                            </div>

                            {windowWidth >= 800 ? <div className="column">
                                <p>{doctor.phone}</p>
                            </div> : null}

                            <div className="column">
                                <div className="square" style={{ width: 50, height: 20, borderRadius: 10, backgroundColor: doctor.color }} />
                            </div>

                            <div className="column pressable">
                                <FontAwesomeIcon icon={faEllipsis} className="column-icon" onClick={() => triggerOptions(idx)} />
                                <div className="options-container" ref={ref => optionsRef.current[idx] = ref}>
                                    
                                    <div className="option" onClick={async () => optionsRef.current[idx].classList.contains("show") && await toggleActiveDoctor(doctor)}>
                                        <FontAwesomeIcon icon={doctor.active ? faCheck : faSquare} className="option-icon" />
                                        <p>{doctor.active ? (cookies.language === "en" ? "Disable" : "Dezactiveaza") : (cookies.language === "en" ? "Enable" : "Activeaza")}</p>
                                    </div>

                                    <div className="option" onClick={() => optionsRef.current[idx].classList.contains("show") && navigation(`/doctor/${doctor._id}/0`)}>
                                        <FontAwesomeIcon icon={faEdit} className="option-icon" />
                                        <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                    </div>

                                    <div className="option" onClick={async () => {
                                        if (!optionsRef.current[idx].classList.contains("show")) return;
                                        setWarning(cookies.language === "en" ? "Are you sure that you want to remove this doctor?" : "Sunteti sigur ca doriti sa stergeti acest doctor?");
                                        setDoctorId(doctor._id);
                                    }}>
                                        <FontAwesomeIcon icon={faTimes} className="option-icon" />
                                        <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                    </div>  

                                    <div className="option" onClick={() => optionsRef.current[idx].classList.contains("show") && navigation(`/doctor/${doctor._id}/1`)}>
                                        <FontAwesomeIcon icon={faClockRotateLeft} className="option-icon" />
                                        <p>{cookies.language === "en" ? "Historic" : "Istoric"}</p>
                                    </div>  
                                                
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div>
                            <h2 className="center">{cookies.language === "en" ? "No doctors found." : "Niciun doctor gasit."}</h2>
                        </div>
                    )}
                </div>

                <div className="add-button" onClick={() => navigation("/create-doctor")}>
                    <FontAwesomeIcon icon={faPlus} className="add-icon"/>
                </div>

                <div className={`message-container ${message?.success ? "success-message" : "error-message"} ${message ? "show" : ""}`}>
                    <p>{message?.message}</p>
                </div>

                {warning && <div className="warning-container">
                    <div className="warning-card">
                        <p>{warning}</p>
                        <div className="buttons-warning">
                            <button onClick={async () => await removeDoctor(doctorId)}>{cookies.language === "en" ? "Yes" : "Da"}</button>
                            <button onClick={() => {
                                setDoctorId();
                                setWarning(false);
                            }}>{cookies.language === "en" ? "No" : "Nu"}</button>
                        </div>
                    </div>
                </div>}


            </div>
        </div>
    );

};

export default Users; 