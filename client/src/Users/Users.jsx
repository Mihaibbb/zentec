import "../Patients/Patients.css";
import "./Users.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsis, faSearch, faCheck, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons"
import { useState, useEffect } from "react"; 
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";

const Users = ({ data }) => {

    const [doctors, setDoctors] = useState([]);
    const [query, setQuery] = useState("");
    const [cookies, setCookie] = useCookies();
    const [warning, setWarning] = useState(false);
    const [doctorId, setDoctorId] = useState();
    const navigation = useNavigate();

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
            if (await response.success) navigation("/doctors", { state: { success: true, message: await response[cookies.language]  }});
            await getDoctors();
            
        } catch (e) {
            console.log(e);
            navigation("/doctors", { state: { message: cookies.language === "en" ? "An error occured!" : "A aparut o eroare!" } });
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
                message: cookies.language === "en" ? `Doctor ${!doctorObj.active ? "activated" : "disabled"} successfully!` : `Doctor ${!doctorObj.active ? "activat" : "dezactivat"} cu succes!`
            } })

            await getDoctors();

        } catch (e) {
            console.log(e);
            navigation("/doctors", { state: {
                success: false,
                message: cookies.language === "en" ? "Doctor's status couldn't be changed!" : "Statusul doctorului nu a putut fi modificat!"
            }})
        }
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

                        <div className="column">
                            <p>{cookies.langauge === "en" ? "No.": "Nr."}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Surname" : "Nume"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Name" : "Prenume"}</p>
                        </div>

                        

                        <div className="column">
                            <p>{cookies.language === "en" ? "Phone" : "Telefon"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.langauge === "en" ? "Color" : "Culoare"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                        </div>

                    </div>}

                    {doctors.length > 0 ? doctors.map((doctor, idx) => (
                        <div className="row" key={idx}>
                            
                            <div className="column">
                                <p>{idx + 1}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.firstname}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.lastname}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.phone}</p>
                            </div>

                            <div className="column">
                                <div className="square" style={{ width: 50, height: 20, borderRadius: 10, backgroundColor: doctor.color }} />
                            </div>

                            <div className="column">
                                <div className="option-container" onClick={async () => await toggleActiveDoctor(doctor)}>
                                    <FontAwesomeIcon icon={doctor.active ? faCheck : faSquare} className="option-icon" />
                                </div>
                                <div className="option-container" onClick={() => navigation(`/doctor/${doctor._id}`)}>
                                    <FontAwesomeIcon icon={faEdit} className="option-icon" />
                                </div>
                                <div className="option-container" onClick={async () => {
                                    setWarning(cookies.language === "en" ? "Are you sure that you want to remove this doctor?" : "Sunteti sigur ca doriti sa stergeti acest doctor?");
                                    setDoctorId(doctor._id);
                                }}>
                                    <FontAwesomeIcon icon={faTimes} className="option-icon" />
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