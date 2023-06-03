import { faClockRotateLeft, faEllipsis, faFileArrowDown, faFileArrowUp, faMinus, faPlus, faSearch, faSortDown, faSortUp, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import ExportExcel from "../ExportPatients/ExportPatients";
import "./Patients.css";

const Patients = ({ data }) => {
    
    const [patients, setPatients] = useState([]);
    const [totalPatients, setTotalPatients] = useState([]);
    const [patientsExportData, setPatientsExportData] = useState([]);
    const [query, setQuery] = useState("");
    const [arrowElements, setArrowElements] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const patientsPerPage = 10;
    const [pages, setPages] = useState();
    
    const firstNameArrow = useRef();
    const lastNameArrow = useRef();
    const fileNumberArrow = useRef();

    const optionsRef = useRef([]);

    const location = useLocation();
    const navigation = useNavigate();
    const [cookies, setCookie] = useCookies();

    const getPatients = async () => {
        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                _id: data.organisation._id
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-patients`, options);
            const response = await request.json();
            console.log(await response);
            if (!await response.success) return;
            
            setPatients(currPatients => {
                return response.patients.filter((patient, idx) => {
                    return (idx + 1) > patientsPerPage * (currentPage - 1) && (idx + 1) <= patientsPerPage * currentPage;
                });
            });
            
            setTotalPatients(await response.patients);

        } catch (e) {
            console.log(e);
        }
    };



    const triggerOptions = (idx) => {
        optionsRef?.current?.length && optionsRef?.current[idx]?.classList?.toggle("show");
        optionsRef?.current?.length && optionsRef?.current.forEach((option, currIdx) => currIdx !== idx && option?.classList?.remove("show"));
    };

    useEffect(() => {
        (async () => {
            await getPatients();
        })();
    }, []);

    useEffect(() => {
        if (query === "") {
            (async () => {
                await getPatients();
            })();
            return;
        }
        (async () => {
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

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-patient`, options);
            const response = await request.json();
          
            if (response.success) {
                setPatients(currPatients => {
                    return response.patients.filter((patient, idx) => {
                        return (idx + 1) > patientsPerPage * (currentPage - 1) && (idx + 1) <= patientsPerPage * currentPage;
                    });
                });
                setTotalPatients(response.patients || []);
            } else {
                setPatients([]);
                setTotalPatients([]);
            }
        })();
    }, [query]);

    useEffect(() => {
        if (!patients || !patients?.length) return;
        if (!totalPatients || !totalPatients?.length) return;

        setPatientsExportData(totalPatients.map((currPatient, idx) => {
            if (cookies.language === "en") {
                return {
                    FirstName: currPatient.firstname,
                    LastName: currPatient.lastname,
                    Email: currPatient.email,
                    BirthDate: `${new Date(currPatient.birthdate).getDate()}-${new Date(currPatient.birthdate).getMonth() + 1}-${new Date(currPatient.birthdate).getFullYear()}`,
                    Phone: currPatient?.phone || "", 
                    Username: currPatient?.username || "",
                    PersonalCode: currPatient?.cnp || "",
                    Gender: currPatient?.gender || "",
                    address: currPatient?.address || "",
                    City: currPatient?.city || "",
                    Country: currPatient?.country || "",
                    Notes: currPatient?.notes || ""
                };
            }

            return {
                Nume: currPatient.firstname,
                Prenume: currPatient.lastname,
                Email: currPatient.email,
                DataNastere: `${new Date(currPatient.birthdate).getDate()}-${new Date(currPatient.birthdate).getMonth() + 1}-${new Date(currPatient.birthdate).getFullYear()}`,
                Telefon: currPatient?.phone || "", 
                Username: currPatient?.username || "",
                CNP: currPatient?.cnp || "",
                Gen: currPatient?.gender || "",
                Adresa: currPatient?.address || "",
                Oras: currPatient?.city || "",
                Tara: currPatient?.country || "",
                Observatii: currPatient?.notes || ""
            };
        }));
        console.log(patients);

    }, [patients]);

    useEffect(() => {
        setPages(Math.floor(totalPatients.length / patientsPerPage) + (totalPatients.length % patientsPerPage !== 0 ? 1 : 0));

    }, [totalPatients]);

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        setWindowWidth(window.innerWidth);
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);


    useEffect(() => {
        window.addEventListener("resize", () => {
            setWindowWidth(window.innerWidth);
        });
    }, [location]);

    useEffect(() => {
        if (!fileNumberArrow?.current) return;
        fileNumberArrow.current.classList.add("up");
    }, [fileNumberArrow?.current]);

    useEffect(() => {
        if (!lastNameArrow?.current) return;
        setArrowElements([fileNumberArrow?.current, firstNameArrow?.current, lastNameArrow?.current]);
    }, [lastNameArrow?.current]);

    useEffect(() => {
        console.log(arrowElements);
    }, [arrowElements]);

    useEffect(() => {
        console.log(pages);
    }, [pages]);

    useEffect(() => {
        setPatients(currPatients => {
            return [...totalPatients].filter((patient, idx) => {
                return (idx + 1) > patientsPerPage * (currentPage - 1) && (idx + 1) <= patientsPerPage * currentPage;
            });
        });
    }, [currentPage]);

    const changeActiveArrow = (newActiveArrow, type) => {
        console.log(arrowElements);
        if (!arrowElements || !arrowElements.length) return;
        newActiveArrow.classList.toggle("up");
        
        setPatients(currPatients => {
            if (type === "fileNumber") return [...currPatients].sort((patient1, patient2) => newActiveArrow.classList.contains("up") ? patient1.fileNumber - patient2.fileNumber : patient2.fileNumber - patient1.fileNumber);
            
            return [...currPatients].sort((patient1, patient2) => {
                if (patient1[type] < patient2[type]) return newActiveArrow.classList.contains("up") ? -1 : 1;
                if (patient1[type] > patient2[type]) return newActiveArrow.classList.contains("up") ? 1 : -1;
                return 0;
            });

        });

        arrowElements.forEach(arrowElement => {
            if (arrowElement !== newActiveArrow) {
                arrowElement.classList.remove("up");
            }
        });
    };

    return (
        <div className="patients">
            <Navigation page="patients" />

            <div className="content">
                <Header data={data} />
                {location.state?.message && <div className="message">{location.state?.message[cookies['language']]}</div>}
                <h2 className="title">{cookies.language === "en" ? "Patients" : "Pacienti"}</h2>

                {patients && (patients.length > 0 || query.length > 0) && <div className="search-container">
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search patient..." : "Cauta pacient..."} />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>}

                <div className="excel-container">
                    <div className="button" onClick={() => navigation("/import-patients")}>
                        <FontAwesomeIcon icon={faFileArrowUp} className="excel-icon" />
                        <p>{cookies.language === "en" ? "Import Patients" : "Importa pacienti"}</p>
                    </div>
                    <div className="button" onClick={() => ExportExcel(patientsExportData, cookies.language === "en" ? "Patients" : "Pacienti")}>
                        <FontAwesomeIcon icon={faFileArrowDown} className="excel-icon" />
                        <p>{cookies.language === "en" ? "Export Patients" : "Exporta pacienti"}</p>
                    </div>
                </div>
                
                <div className="patients-container">
                    {patients.length > 0 && <div className="first-row">
                        {windowWidth >= 600 ? <div className="column">
                            <p>{cookies.language === "en" ? "File Nr." : "Nr. fisa"}</p>
                            <FontAwesomeIcon 
                                icon={faSortDown} 
                                ref={fileNumberArrow} 
                                className="sort-icon"
                                onClick={() => changeActiveArrow(fileNumberArrow?.current, "fileNumber")}
                            />
                        </div> : null}
                        <div className="column">
                            <p>{cookies.language === "en" ? "First Name" : "Nume"}</p>
                            <FontAwesomeIcon 
                                icon={faSortDown} 
                                ref={firstNameArrow} 
                                className="sort-icon"
                                onClick={() => changeActiveArrow(firstNameArrow?.current, "firstname")}
                            />
                        </div>
                        <div className="column">
                            <p>{cookies.language === "en" ? "Last Name" : "Prenume"}</p>
                            <FontAwesomeIcon 
                                icon={faSortDown} 
                                ref={lastNameArrow} 
                                className="sort-icon"
                                onClick={() => changeActiveArrow(lastNameArrow?.current, "lastname")}
                            />
                        </div>

                        {windowWidth >= 800 ? <div className="column">
                            <p>{cookies.language === "en" ? "Phone" : "Telefon"}</p>
                            
                        </div> : null}

                        <div className="column">
                            <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                        </div>
                    </div>}

                    {patients.length > 0 ? patients.map((patient, idx) => (
                        <div className="row" key={idx}>

                            {windowWidth >= 600 ? <div className="column">
                                <p>{patient.fileNumber}</p>
                            </div> : null}

                            <div className="column">
                                <p>{patient.firstname}</p>
                            </div>

                            <div className="column">
                                <p>{patient.lastname}</p>
                            </div>

                            {windowWidth >= 800 ? <div className="column">
                                <p>{patient.phone}</p>
                            </div>  : null}

                            <div className="column pressable">
                                <button type="button" onClick={() => navigation(`/patient/${patient._id}/0`, { state: { patient: patient } })}>
                                    <p>{cookies?.language === "en" ? "View profile" : "Vezi profil"}</p>
                                </button>
                            </div>

                            {/* <div className="column pressable">
                                <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx)}/>
                                <div className="options-container" ref={ref => optionsRef.current[idx] = ref}>
                                    <div className="option" onClick={async () => optionsRef.current[idx].classList.contains("show") ? await removePatient(patient._id) : null}>
                                        <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                        <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                    </div>

                                    <div className="option" onClick={() => navigation(`/patient/${patient._id}/0`, { state: { patient: patient } })}>
                                        <FontAwesomeIcon icon={faUser} className="option-icon" />
                                        <p>{cookies.language === "en" ? "Patient Data" : "Date pacient"}</p>
                                    </div>

                                    <div className="option" onClick={() => navigation(`/patient/${patient._id}/1`, { state: { patient: patient } })}>
                                        <FontAwesomeIcon icon={faClockRotateLeft} className="option-icon" />
                                        <p>{cookies.language === "en" ? "Schedules" : "Programari"}</p>
                                    </div>
                                </div>
                            </div> */}


                        </div>
                    )) : (
                        <h2 className="center">{cookies.language === "en" ? "No patient found." : "Niciun pacient gasit."}</h2>
                    )}

                    {pages > 1 ? <div className="pages-container">
                        <div className="page-container" onClick={() => setCurrentPage(1)}>
                            <p>1</p>
                        </div>
                        <div className="page-input">
                            <div 
                                className="value-container"
                                onClick={() => currentPage > 1 ? setCurrentPage(currValue => currValue - 1) : null}
                            >
                                <FontAwesomeIcon icon={faMinus} className="value-icon" />
                            </div>
                            
                            <input 
                                type="number" 
                                placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                value={currentPage}
                                onChange={e => Number(e.target.value) ? setCurrentPage(Number(e.target.value)) : setCurrentPage("")}
                            />

                            <div 
                                className="value-container"
                                onClick={() => currentPage < pages ? setCurrentPage(currValue => currValue + 1) : null}
                            >
                                <FontAwesomeIcon icon={faPlus} className="value-icon" />
                            </div>
                        </div>
                        <div className="page-container" onClick={() => setCurrentPage(pages)}>
                            <p>{pages}</p>
                        </div>
                    </div> : null}
                </div>

                <div className="add-button" onClick={() => navigation("/create-patient")}>
                    <FontAwesomeIcon icon={faPlus} className="add-icon"/>
                </div>
            </div>
        </div>
    );

   
};

export default Patients;