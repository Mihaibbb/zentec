import "./Profile.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useCookies } from "react-cookie";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faEdit, faEllipsis, faFileArrowDown, faFileArrowUp, faMagnifyingGlass, faMinus, faPencil, faPlus, faSearch, faSortDown, faTimes, faTrashCan, faUser } from "@fortawesome/free-solid-svg-icons";
import greenTick from "../imgs/green-tick.mp4";
import greenTickWhiteTheme from "../imgs/green-tick-light-theme.mp4";
import { useRef } from "react";
import TickAnimation from "../utils/TickAnimation";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import Users from "../Users/Users";
import DoctorSchedule from "../DoctorSchedule/DoctorSchedule";

const Profile = ({ data }) => {

    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies();
    const [theme, setTheme] = useState(cookies?.theme || "dark");
    const [errorMessage, setErrorMessage] = useState(null);

    const [startHourProgram, setStartHourProgram] = useState(data.organisation.details[0].start_hour);
    const [endHourProgram, setEndHourProgram] = useState(data.organisation.details[0].end_hour);
    
    const options = cookies.language === "en" ? ["Details", "Doctors", "Doctors' Schedule", "Assistants", "Scheduled SMS", "Treatments", "Treatments Categories", "Diagnostics", "Patients' Types (dental status)", "Patient Categories", "Laboratories", "Works"] : ["Detalii", "Doctori", "Program Doctori", "Personal", "SMS-uri Programate", "Tratamente", "Categorii Tratamente", "Diagnostice", "Tipuri pacienti (status dentar)", "Categorii pacienti", "Laboratoare", "Lucrari"];
    const optionsTitle = cookies.language === "en" ? ["", "", "", ""] : ["", "", ""];
    const [activeOption, setActiveOption] = useState(window?.history?.state?.activeOption || 0);
    const [sideMenuOption, setSideMenuOption] = useState(window?.history?.state?.sideMenuOption || 0);

    const [currentSMS, setCurrentSMS] = useState(JSON.parse(data.organisation.details[0].sms_message));

    const [currentSmsMessage, setCurrentSmsMessage] = useState("");
    const [currentSmsSchedule, setCurrentSmsSchedule] = useState();

    const [currentServices, setCurrentServices] = useState([]);
    const [serviceName, setServiceName] = useState("");
    const [servicePrice, setServicePrice] = useState("");

    const [currentBackups, setCurrentBackups] = useState([]);

    const [organisationName, setOrganisationName] = useState(data.organisation.details[0].name);
    const [organisationAddress, setOrganisationAddress] = useState(data.organisation.details[0]?.address);
    const [organisationCity, setOrganisationCity] = useState(data.organisation.details[0]?.city);
    const [organisationCounty, setOrganisationCounty] = useState(data.organisation.details[0]?.county);
    const [organisationCountry, setOrganisationCountry] = useState(data.organisation.details[0]?.city);
    const users = data.organisation.users;

    const [assistants, setAssistants] = useState(data.organisation?.assistants || []);
    const [assistantsQuery, setAssistantsQuery] = useState("");
    const [categories, setCategories] = useState(data.organisation?.treatment_categories || []);
    const [treatments, setTreatments] = useState(data.organisation?.treatments);
    const [totalTreatments, setTotalTreatments] = useState(data.organisation?.treatments);
    const [diagnostics, setDiagnostics] = useState(data.organisation?.diagnostics);
    const [totalDiagnostics, setTotalDiagnostics] = useState(data.organisation.diagnostics);
    const [patientTypes, setPatientTypes] = useState(data.organisation.patient_types);
    const [totalPatientTypes, setTotalPatientTypes] = useState(data.organisation.patient_types);
    const [patientCategories, setPatientCategories] = useState(data.organisation.patient_categories);
    const [totalPatientCategories, setTotalPatientCategories] = useState(data.organisation.patient_categories);
    const [treatmentsQuery, setTreatmentsQuery] = useState("");
    const [diagnosticsQuery, setDiagnosticsQuery] = useState("");
    const [patientTypesQuery, setPatientTypesQuery] = useState("");
    const [patientCategoriesQuery, setPatientCategoriesQuery] = useState("");

    const [works, setWorks] = useState(data.organisation.works);
    const [totalWorks, setTotalWorks] = useState(data.organisation.works);
    const [labs, setLabs] = useState(data.organisation.labs);
    const [totalLabs, setTotalLabs] = useState(data.organisation.labs);
    const [labsQuery, setLabsQuery] = useState("");
    const [worksQuery, setWorksQuery] = useState("");

    const [videoStart, setVideoStart] = useState(false);
    const [patients, setPatients] = useState([]);

    const [query, setQuery] = useState("");
    const [arrowElements, setArrowElements] = useState([]);
    const [currentPageAssistants, setCurrentPageAssistants] = useState(1);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [totalAssistants, setTotalAssistants] = useState(data.organisation?.assistants);

    const [currentPageTreatments, setCurrentPageTreatments] = useState(1);
    const [currentPageDiagnostics, setCurrentPageDiagnostics] = useState(1);
    const [currentPagePatientTypes, setCurrentPagePatientTypes] = useState(1);
    const [currentPagePatientCategories, setCurrentPagePatientCategories] = useState(1);

    const perPage = 10;
    const [pages, setPages] = useState();
    
    const firstNameArrow = useRef();
    const lastNameArrow = useRef();
    const fileNumberArrow = useRef();
    const noVideoContentRef = useRef();

    const optionsRef = useRef([]);
    const optionsCategoriesRef = useRef([]);
    const optionsTreatmentsRef = useRef([]);

    const location = useLocation();
    const navigation = useNavigate();


    const getAssistants = async () => {
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
          
            
            setAssistants(currAssistants => {
                return data.organisation?.assistants && data.organisation?.assistants.filter((assistant, idx) => {
                    return (idx + 1) > perPage * (currentPageAssistants - 1) && (idx + 1) <= perPage * currentPageAssistants;
                });
            });
            
            setTotalAssistants(data.organisation.assistants || []);

        } catch (e) {
            console.log(e);
        }
    };

    const getBackups = async () => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisationId,

            })
        };

        try {

        } catch (e) {

        }
    };

    const triggerOptions = (idx, element) => {
        element?.length && element[idx]?.classList?.toggle("show");
        element?.length && element.forEach((option, currIdx) => currIdx !== idx && option?.classList?.remove("show"));
    };

    useEffect(() => {
        (async () => {
            await getAssistants();
            await getBackups();
        })();
    }, []);

    useEffect(() => {
        setTheme(cookies?.theme || 'dark');
    }, [cookies]);

    useEffect(() => {
        if (assistantsQuery === "") {
            (async () => {
                await getAssistants();
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
                    searchQuery: assistantsQuery
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-assistant`, options);
            const response = await request.json();
          
            if (response.success) {
                setAssistants(currPatients => {
                    return response.patients.filter((patient, idx) => {
                        return (idx + 1) > perPage * (currentPageAssistants - 1) && (idx + 1) <= perPage * currentPageAssistants;
                    });
                });
                setTotalAssistants(response.patients || []);
            } else {
                setAssistants([]);
                setTotalAssistants([]);
            }
        })();
    }, [assistantsQuery]);

    useEffect(() => {
        (async () => {
            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    searchQuery: treatmentsQuery
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-treatment`, options);
            const response = await request.json();
          
            if (response.success) {
                setTreatments(currTreatments => {
                    return response.treatments.filter((treatment, idx) => {
                        return (idx + 1) > perPage * (currentPageTreatments - 1) && (idx + 1) <= perPage * currentPageTreatments;
                    });
                });
                setTotalTreatments(response.treatments || []);
            } else {
                setTreatments([]);
                setTotalTreatments([]);
            }
        })();
    }, [treatmentsQuery]);

    useEffect(() => {
        (async () => {
            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    searchQuery: diagnosticsQuery,
                    organisationId: data.organisation._id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-diagnostic`, options);
            const response = await request.json();
          
            if (response.success) {
                setDiagnostics(currTreatments => {
                    return response.diagnostics.filter((treatment, idx) => {
                        return (idx + 1) > perPage * (currentPageDiagnostics - 1) && (idx + 1) <= perPage * currentPageDiagnostics;
                    });
                });
                setTotalDiagnostics(response.diagnostics || []);
            } else {
                setDiagnostics([]);
                setTotalDiagnostics([]);
            }
        })();
    }, [diagnosticsQuery]);

    useEffect(() => {
        (async () => {
            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    searchQuery: patientTypesQuery,
                    organisationId: data.organisation._id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-patient-type`, options);
            const response = await request.json();
          
            if (response.success) {
                setPatientTypes(currTreatments => {
                    return response.patientTypes.filter((treatment, idx) => {
                        return (idx + 1) > perPage * (currentPagePatientTypes - 1) && (idx + 1) <= perPage * currentPagePatientTypes;
                    });
                });
                setTotalPatientTypes(response.patientTypes || []);
            } else {
                setPatientTypes([]);
                setTotalPatientTypes([]);
            }
        })();
    }, [patientTypesQuery]);

    useEffect(() => {
        (async () => {
            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    searchQuery: patientCategoriesQuery,
                    organisationId: data.organisation._id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-patient-category`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                setPatientCategories(currTreatments => {
                    return response.patientCategories.filter((treatment, idx) => {
                        return (idx + 1) > perPage * (currentPagePatientCategories - 1) && (idx + 1) <= perPage * currentPagePatientCategories;
                    });
                });
                setTotalPatientCategories(response.patientCategories || []);
            } else {
                setPatientCategories([]);
                setTotalPatientCategories([]);
            }
        })();
    }, [patientCategoriesQuery]);

    useEffect(() => {
        setPages(Math.floor(totalAssistants.length / perPage) + (totalAssistants.length % perPage !== 0 ? 1 : 0));
    }, [totalAssistants]);

    useEffect(() => {
        setPages(Math.floor(totalTreatments.length / perPage) + (totalTreatments.length % perPage !== 0 ? 1 : 0));
    }, [totalTreatments]);

    useEffect(() => {
        setPages(Math.floor(totalDiagnostics.length / perPage) + (totalDiagnostics.length % perPage !== 0 ? 1 : 0));
    }, [totalDiagnostics]);
    
    useEffect(() => {
        setPages(Math.floor(totalPatientTypes.length / perPage) + (totalPatientTypes.length % perPage !== 0 ? 1 : 0));
    }, [totalPatientTypes]);

    useEffect(() => {
        setPages(Math.floor(totalPatientCategories.length / perPage) + (totalPatientCategories.length % perPage !== 0 ? 1 : 0));
    }, [totalPatientCategories]);

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
        const resizeEvent = () => {
            setWindowWidth(window.innerWidth);
        }

        window.addEventListener("resize", resizeEvent);
        return () => window.removeEventListener("resize", resizeEvent);
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
        setAssistants(currAssistants => {
            return [...totalAssistants].filter((assistant, idx) => {
                return (idx + 1) > perPage * (currentPageAssistants - 1) && (idx + 1) <= perPage * currentPageAssistants;
            });
        });
    }, [currentPageAssistants]);

    const changeActiveArrowAssistants = (newActiveArrow, type) => {
        console.log(arrowElements);
        if (!arrowElements || !arrowElements.length) return;
        newActiveArrow.classList.toggle("up");
        
        setAssistants(currPatients => {
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
   
    const addSMS = async () => {

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sms: currentSmsMessage,
                scheduledAt: currentSmsSchedule,
                organisationId: data.organisation._id
            })  
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/add-sms`, options);
            const response = await request.json();
            if (response.success) {

                window.history.replaceState({
                    activeOption: activeOption,
                    sideMenuOption: sideMenuOption,
                    successProfile: true,
                }, "");

                window.location.reload();
            }
        } catch (e) {
            console.log(e);
            window.history.replaceState({
                activeOption: activeOption,
                sideMenuOption: sideMenuOption,
                successProfile: false,
                message: cookies.language === "en" ? "An error ocurred!" : "A aparut o eroare!"
            }, "");

            window.location.reload();
        }
    };

    const removeSMS = async (smsId) => {

        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-sms?organisationId=${data.organisation._id}&smsId=${smsId}`, options);
            const response = await request.json();
            if (response.success) {
                window.history.replaceState({
                    activeOption: activeOption,
                    sideMenuOption: sideMenuOption,
                    successProfile: true,
                    message: cookies.language === "en" ? "SMS removed successfully!" : "SMS-ul a fost sters cu succes!"
                }, "");

                window.location.reload();
            }
            
        } catch (e) {
            console.log(e);
          

            window.history.replaceState({
                activeOption: activeOption,
                sideMenuOption: sideMenuOption,
                successProfile: false,
                message: cookies.language === "en" ? "An error ocurred!" : "A aparut o eroare!"
            }, "");

            window.location.reload();
            
        }
    };  

    const editSMS = async (smsId) => {
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sms: currentSmsMessage,
                scheduledAt: currentSmsSchedule,
                organisationId: data.organisation._id,
                smsId: smsId
            })  
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-sms`, options);
            const response = await request.json();

            if (response.success) {
                window.history.replaceState({
                    activeOption: activeOption,
                    sideMenuOption: sideMenuOption,
                    
                    successProfile: true,
                    message: cookies.language === "en" ? "SMS edited successfully!" : "SMS-ul a fost modificat cu succes!"
                }, "");

                window.location.reload();
            }
        } catch (e) {
            console.log(e);
            window.history.replaceState({
                activeOption: activeOption,
                sideMenuOption: sideMenuOption,
                successProfile: false,
                message: cookies.language === "en" ? "An error ocurred!" : "A aparut o eroare!"
            }, "");

            window.location.reload();
        }
    };
    
    const removeService = async () => {
        const options = {
            method: "DELETE",
            headers: {
                'Content-Type': "application/json"
            }
        };

        
        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-service`, options);
            const response = await request.json();
            if (response.success) {
                
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };


    const loadBackup = async (backupCategory, backupDate) => {
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                category: backupCategory,
                date: backupDate
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/restore-backup`, options);
            const response = await request.json();
            if (response.success) {
                 
            } else console.log(response);
        } catch (e) {
            console.log(e);

        }
    };

    const removeAssistant = async (_id) => {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-assistant/${data.organisation._id}/${_id}/${cookies.language}`, options);
            const response = await request.json();
            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() =>  setVideoStart(cookies.language === "en" ? "Assistant was removed successfully!" : "Personalul a fost sters cu succes!"), 300);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const logOut = () => {
        [...Object.keys(cookies)].forEach(cookie => {
            removeCookie(cookie);
        }); 

        window.location.reload();
    };

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        navigate("/profile", { state: { 
            activeOption: activeOption, 
            sideMenuOption: sideMenuOption, 
            successProfile: true
        } });
        window.history.replaceState({
            activeOption: activeOption,
            sideMenuOption: sideMenuOption,
            successProfile: true
        }, "");
        window.location.reload();
    };

    useEffect(() => {
        if (location?.state?.refresh && !window.history?.state?.refresh) {
            window.history.replaceState({
                refresh: true,
                activeOption: location?.state?.activeOption
            }, "");
            window.location.reload();
        } 
        // else window.history.replaceState({}, "");
    }, [location]);

    const removeTreatmentCategory = async (id) => {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-treatment-category/${data.organisation._id}/${id}`, options);
            const response = await request.json();

            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Category removed successfully!" : "Categoria a fost stearsa cu succes!"), 350);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const removeTreatment = async (id) => {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-treatment/${data.organisation._id}/${id}`, options);
            const response = await request.json();

            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Treatment removed successfully!" : "Tratamentul a fost sters cu succes!"), 350);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const removeDiagnostic = async (id) => {

        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-diagnostic/${data.organisation._id}/${id}`, options);
            const response = await request.json();

            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Diagnose removed successfully!" : "Diagnosticul a fost sters cu succes!"), 350);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const removePatientType = async (id) => {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-patient-type/${data.organisation._id}/${id}`, options);
            const response = await request.json();

            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Patient type removed successfully!" : "Tipul de pacient a fost sters cu succes!"), 350);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const removePatientCategory = async (id) => {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-patient-category/${data.organisation._id}/${id}`, options);
            const response = await request.json();

            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Patient category removed successfully!" : "Categoria de pacient a fost stearsa cu succes!"), 350);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const removeLab = async (labId) => {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-lab/${data.organisation._id}/${labId}`, options);
            const response = await request.json();

            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Patient category removed successfully!" : "Categoria de pacient a fost stearsa cu succes!"), 350);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const removeWork = async (workId) => {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-work/${data.organisation._id}/${workId}`, options);
            const response = await request.json();

            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Work removed successfully!" : "Lucrarea a fost stearsa cu succes!"), 350);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const saveChanges = async () => {

        if (Number(startHourProgram) >= Number(endHourProgram) || Number(startHourProgram) <= 0 || Number(startHourProgram) >= 22 || Number(endHourProgram) <= 1 || Number(endHourProgram) >= 23) 
            return setErrorMessage(cookies?.language === "en" ? "Start Hour or End Hour are not well defined." : "Ora de inceput sau sfarsit a programului nu este bine definita!"); 

        if (organisationName?.length < 3) 
            return setErrorMessage(cookies?.language === "en" ? "Organisation's name must have at least 3 characters" : "Numele organizatiei trebuie sa aiba minimum 3 caractere.");

        setErrorMessage();
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                startHour: startHourProgram,
                endHour: endHourProgram,
                organisationName,
                organisationId: data.organisation._id
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-details`, options);
            const response = await request.json();
            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setVideoStart(cookies?.language === "en" ? "Changes saved successfully!" : "Modificarile au fost salvate cu succes!"), 350);
            } else console.log(response.success);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="profile-container">
            <Navigation page="" />
            <div className="content" style={videoStart ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                
                {!videoStart ? 
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title" style={{ textAlign: "initial", marginLeft: "50px" }}>{cookies.language === "en" ? "Profile" : "Profil"}</h2>

                    <div className="options-bar">
                        {options && options.length && options.map((option, idx) => (
                            <div className={`option ${activeOption === idx ? "active" : ""}`} key={idx} onClick={() => setActiveOption(idx)}>
                                <h3>{option}</h3>
                            </div>
                        ))}
                    </div>

                    <div className="line" />
                    
                    <div className="details-container">
                        {activeOption === 0 ? (
                            <div className="account-details form">
                                <div className="account-container input profile-input">
                                    <p>{cookies.language === "en" ? "Clinic's name" : "Numele clinicii"}</p>
                                    <input type="text" value={organisationName} onChange={e => setOrganisationName(e.target.value)} />
                                </div>

                                <div className="account-flex">
                                    <div className="account-container input profile-input">
                                        <p>{cookies.language === "en" ? "Start Hour Schedule" : "Ora Inceput Program"}</p>
                                        <input type="number" value={startHourProgram} onChange={e => setStartHourProgram(e.target.value)} />
                                    </div>

                                    <div className="account-container input profile-input">
                                        <p>{cookies.language === "en" ? "End Hour Schedule" : "Ora Sfarsit Program"}</p>
                                        <input type="number" value={endHourProgram} onChange={e => setEndHourProgram(e.target.value)} />
                                    </div>
                                </div>

                                <p className="error">{errorMessage}</p>

                                <button className="save" onClick={async () => await saveChanges()}>
                                    <p>{cookies.language === "en" ? "Save changes" : "Salveaza modificarile"}</p>
                                </button>

                                <div className="users-list">
                                    <h3>{cookies.language === "en" ? "Users' list" : "Lista utilizatori"}</h3>
                                    <div className="patients-container">
                                        
                                        <div className="first-row">
                                            <div className="column">
                                                <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                            </div>
                                            <div className="column">
                                                <p>{cookies.language === "en" ? "Firstname" : "Nume"}</p>
                                            </div>
                                            <div className="column">
                                                <p>{cookies.language === "en" ? "Lastname" : "Prenume"}</p>
                                            </div>
                                            <div className="column">
                                                <p>Username</p>
                                            </div>
                                        </div>

                                        {users && users.length && users.map((user, idx) => (
                                            <div className="row" key={idx}>
                                                <div className="column">
                                                    <p>{idx + 1}</p>
                                                </div>
                                                <div className="column">
                                                    <p>{user.name.split(" ")[0]}</p>
                                                </div>
                                                <div className="column">
                                                    <p>{user.name.slice(user.name.split(" ")[0].length)}</p>
                                                </div>
                                                <div className="column">
                                                    <p>{user.username}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            

                                <button className="logout-button" type="button" onClick={() => logOut()}>
                                    <p>{cookies.language === "en" ? "Log out" : "Delogare"}</p>
                                </button> 
                            </div>
                        ) : activeOption === 1 ? (
                            <Users data={data} />
                        ) : activeOption === 2 ? (
                            <DoctorSchedule data={data} />
                        ) : activeOption === 3 ? (
                            <div className="assistants-details">
                                <h3>{cookies.language === "en" ? "Assistants List" : "Lista Personal"}</h3>

                                {patients && (patients.length > 0 || query.length > 0) && <div className="search-container">
                                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search patient..." : "Cauta pacient..."} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div>}

                            <div className="patients-container">
                                {assistants.length > 0 && <div className="first-row">
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{cookies.language === "en" ? "File Nr." : "Nr. fisa"}</p>
                                        <FontAwesomeIcon 
                                            icon={faSortDown} 
                                            ref={fileNumberArrow} 
                                            className="sort-icon"
                                            onClick={() => changeActiveArrowAssistants(fileNumberArrow?.current, "fileNumber")}
                                        />
                                    </div> : null}
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "First Name" : "Nume"}</p>
                                        <FontAwesomeIcon 
                                            icon={faSortDown} 
                                            ref={firstNameArrow} 
                                            className="sort-icon"
                                            onClick={() => changeActiveArrowAssistants(firstNameArrow?.current, "firstname")}
                                        />
                                    </div>
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Last Name" : "Prenume"}</p>
                                        <FontAwesomeIcon 
                                            icon={faSortDown} 
                                            ref={lastNameArrow} 
                                            className="sort-icon"
                                            onClick={() => changeActiveArrowAssistants(lastNameArrow?.current, "lastname")}
                                        />
                                    </div>

                                    {windowWidth >= 800 ? <div className="column">
                                        <p>{cookies.language === "en" ? "Phone" : "Telefon"}</p>
                                        
                                    </div> : null}

                                    {windowWidth >= 1000 ? <div className="column">
                                        <p>{cookies.language === "en" ? "Email" : "Email"}</p>
                                        
                                    </div> : null}

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>
                                </div>}

                        {assistants.length > 0 ? assistants.map((assistant, idx) => (
                            <div className="row" key={idx}>

                                {windowWidth >= 600 ? <div className="column">
                                    <p>{idx + 1}</p>
                                </div> : null}

                                <div className="column">
                                    <p>{assistant.firstname}</p>
                                </div>

                                <div className="column">
                                    <p>{assistant.lastname}</p>
                                </div>

                                {windowWidth >= 800 ? <div className="column">
                                    <p>{assistant?.email || "Nedefinit"}</p>
                                </div>  : null}

                                {windowWidth >= 1000 ? <div className="column">
                                    <p>{assistant?.phone || "Nedefinit"}</p>
                                </div> : null}

                                <div className="column pressable">
                                    <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsRef.current)}/>
                                    <div className="options-container" ref={ref => optionsRef.current[idx] = ref}>
                                        <div className="option" onClick={async () => optionsRef.current[idx].classList.contains("show") ? await removeAssistant(assistant._id) : null}>
                                            <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                            <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                        </div>

                                        <div className="option" onClick={() => navigation(`/assistant/${assistant._id}`, { state: { assistant: assistant } })}>
                                            <FontAwesomeIcon icon={faUser} className="option-icon" />
                                            <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <h2 className="center">{cookies.language === "en" ? "No assistant found." : "Niciun personal gasit."}</h2>
                        )}

                        {pages > 1 ? <div className="pages-container">
                            <div className="page-container" onClick={() => setCurrentPageAssistants(1)}>
                                <p>1</p>
                            </div>
                            <div className="page-input">
                                <div 
                                    className="value-container"
                                    onClick={() => currentPageAssistants > 1 ? setCurrentPageAssistants(currValue => currValue - 1) : null}
                                >
                                    <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                </div>
                                
                                <input 
                                    type="number" 
                                    placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                    value={currentPageAssistants}
                                    onChange={e => Number(e.target.value) ? setCurrentPageAssistants(Number(e.target.value)) : setCurrentPageAssistants("")}
                                />

                                <div 
                                    className="value-container"
                                    onClick={() => currentPageAssistants < pages ? setCurrentPageAssistants(currValue => currValue + 1) : null}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                </div>
                            </div>
                            <div className="page-container" onClick={() => setCurrentPageAssistants(pages)}>
                                <p>{pages}</p>
                            </div>
                    </div> : null}
                                </div>

                                <div className="add-button" onClick={() => navigate("/create-assistant")}>
                                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                    <p>{cookies?.language === "en" ? "Add assistant" : "Adauga asistent"}</p>
                                </div>
                            </div>
                        ) : activeOption === 4 ? (
                            <div className="sms-details">
                                {currentSMS.map((sms, idx) => (
                                    <div className="sms-container" key={idx}>
                                        <h2> <FontAwesomeIcon icon={faClock} className="schedule-icon" /> {cookies?.language === 'en' ? `Scheduled: ${sms.scheduledAt === "now" ? "when creating appointment" : `${sms.scheduledAt} hours before appointment`}` : `Programat: ${sms.scheduledAt === "now" ? "cand s-a adaugat programarea" : `${sms.scheduledAt}${Number(sms.scheduledAt) >= 20 ? " de" : ""} ore inaintea programarii`}`}</h2>
                                        <p>{sms.message}</p>
                                        <div className="edit-container" onClick={() => navigate(`/edit-sms/${idx}`)}>
                                            <FontAwesomeIcon icon={faPencil} className="edit-icon" />
                                            <p>{cookies?.language === "en" ? "Edit" : "Editeaza"}</p>
                                        </div>
                                        <div className="remove-container" onClick={async () => currentSMS.length === 1 ? setErrorMessage(cookies?.language === "en" ? "You must have at least one sms scheduled!" : "Trebuie sa ai minim un SMS programat!") : await removeSMS(idx)}>
                                            <FontAwesomeIcon icon={faTrashCan} className="edit-icon" />
                                            <p>{cookies?.language === "en" ? "Remove" : "Sterge"}</p>
                                        </div>
                                    </div>
                                ))}
                                 <div className="add-button" onClick={() => navigate("/add-sms")}>
                                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                    <p>{cookies?.language === "en" ? "Add SMS" : "Adauga SMS"}</p>
                                </div>
                                <p className="error">{errorMessage}</p>
                            </div>
                        ) :  activeOption === 5 ? (
                            <div className="treatment-categories-details">
                                <div className="search-container">
                                    <input type="text" value={treatmentsQuery} onChange={e => setTreatmentsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search treatment..." : "Cauta tratament..."} />
                                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                </div>

                                <div className="patients-container">
                                    {treatments.length > 0 && <div className="first-row">
                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                            
                                        </div> : null}

                                        <div className="column">
                                            <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                        </div>
                                
                                        <div className="column">
                                            <p>{cookies.language === "en" ? "Category" : "Categorie"}</p>
                                        </div>
                                        
                                        <div className="column">
                                            <p>{cookies.language === "en" ? "Price" : "Pret"}</p>
                                        </div>

                                        <div className="column">
                                            <p>{cookies?.language === "en" ? "Color" : "Culoare"}</p>
                                        </div>

                                        <div className="column">
                                            <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                        </div>
                                    </div>}

                                    {treatments?.length > 0 ? treatments.map((treatment, idx) => (
                                        <div className="row" key={idx}>

                                            {windowWidth >= 600 ? <div className="column">
                                                <p>{idx + 1}</p>
                                            </div> : null}

                                            <div className="column">
                                                <p>{treatment.name}</p>
                                            </div>

                                            <div className="column">
                                                <p>{data.organisation.treatment_categories.find(category => category.id === Number(treatment.category))?.name || ""}</p>
                                            </div>

                                            <div className="column">
                                                <p>{treatment.price} Lei</p>
                                            </div>

                                            <div className="column">
                                                <div className="square" style={{ width: '50px', height: '20px', borderRadius: '10px', backgroundColor: treatment.color }} />
                                            </div>

                                            <div className="column pressable">
                                                <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                                <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                                    <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removeTreatment(treatment._id) : null}>
                                                        <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                        <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                                    </div>

                                                    <div className="option" onClick={() => navigation(`/edit-treatment/${treatment._id}`, { state: { treatment: treatment } })}>
                                                        <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                        <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <h2 className="center">{cookies.language === "en" ? "No treatment found." : "Niciun tratament gasit."}</h2>
                                    )}

                                    {pages > 1 ? <div className="pages-container">
                                        <div className="page-container" onClick={() => setCurrentPageTreatments(1)}>
                                            <p>1</p>
                                        </div>
                                        <div className="page-input">
                                            <div 
                                                className="value-container"
                                                onClick={() => currentPageTreatments > 1 ? setCurrentPageTreatments(currValue => currValue - 1) : null}
                                            >
                                                <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                            </div>
                                            
                                            <input 
                                                type="number" 
                                                placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                                value={currentPageTreatments}
                                                onChange={e => Number(e.target.value) ? setCurrentPageTreatments(Number(e.target.value)) : setCurrentPageTreatments("")}
                                            />

                                            <div 
                                                className="value-container"
                                                onClick={() => currentPageTreatments < pages ? setCurrentPageTreatments(currValue => currValue + 1) : null}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                            </div>
                                        </div>
                                        <div className="page-container" onClick={() => setCurrentPageTreatments(pages)}>
                                            <p>{pages}</p>
                                        </div>
                                    </div> : null}
                                </div>
                                
                                <div className="add-button" onClick={() => navigate("/create-treatment")}>
                                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                    <p>{cookies?.language === "en" ? "Add treatment" : "Adauga tratament"}</p>

                                </div>
                            </div>
                        ) : activeOption === 6 ? (
                            <div className="treatment-categories-details">
                                <div className="search-container">
                                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search category..." : "Cauta categorie..."} />
                                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                </div>

                                <div className="patients-container">
                                {categories.length > 0 && <div className="first-row">
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                        
                                    </div> : null}

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                      
                                    </div>
                             
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Color" : "Culoare"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>
                                </div>}

                                {categories?.length > 0 ? categories.map((category, idx) => (
                                    <div className="row" key={idx}>

                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{category.id}</p>
                                        </div> : null}

                                        <div className="column">
                                            <p>{category.name}</p>
                                        </div>

                                        <div className="column">
                                            <div className="square" style={{ width: '50px', height: '20px', borderRadius: '10px', backgroundColor: category.color }} />
                                        </div>

                                        <div className="column pressable">
                                            <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsCategoriesRef.current)}/>
                                            <div className="options-container" ref={ref => optionsCategoriesRef.current[idx] = ref}>
                                                <div className="option" onClick={async () => optionsCategoriesRef.current[idx].classList.contains("show") ? await removeTreatmentCategory(category.id) : null}>
                                                    <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                                </div>

                                                <div className="option" onClick={() => navigation(`/edit-treatment-category/${category.id}`, { state: { category: category } })}>
                                                    <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                    <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <h2 className="center">{cookies.language === "en" ? "No category found." : "Nicio categorie gasita."}</h2>
                                )}

                                    {pages > 1 ? 
                                    <div className="pages-container">
                                        <div className="page-container" onClick={() => setCurrentPageAssistants(1)}>
                                            <p>1</p>
                                        </div>
                                        <div className="page-input">
                                            <div 
                                                className="value-container"
                                                onClick={() => currentPageAssistants > 1 ? setCurrentPageAssistants(currValue => currValue - 1) : null}
                                            >
                                                <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                            </div>
                                            
                                            <input 
                                                type="number" 
                                                placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                                value={currentPageAssistants}
                                                onChange={e => Number(e.target.value) ? setCurrentPageAssistants(Number(e.target.value)) : setCurrentPageAssistants("")}
                                            />

                                            <div 
                                                className="value-container"
                                                onClick={() => currentPageAssistants < pages ? setCurrentPageAssistants(currValue => currValue + 1) : null}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                            </div>
                                        </div>
                                        <div className="page-container" onClick={() => setCurrentPageAssistants(pages)}>
                                            <p>{pages}</p>
                                        </div>
                                    </div> : null}
                                </div>
                                
                                <div className="add-button" onClick={() => navigate("/create-treatment-category")}>
                                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                    <p>{cookies?.language === "en" ? "Add treatment category" : "Adauga categorie tratament"}</p>
                                </div>
                            </div>
                        ) : activeOption === 7 ? <div className="treatment-categories-details">
                        <div className="search-container">
                            <input type="text" value={diagnosticsQuery} onChange={e => setDiagnosticsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search diagnose..." : "Cauta diagnostic..."} />
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        </div>

                        <div className="patients-container">
                            {diagnostics.length > 0 && <div className="first-row">
                                {windowWidth >= 600 ? <div className="column">
                                    <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                    
                                </div> : null}

                                <div className="column">
                                    <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                </div>

                                <div className="column">
                                    <p>{cookies?.language === "en" ? "Color" : "Culoare"}</p>
                                </div>

                                <div className="column">
                                    <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                </div>
                            </div>}

                            {diagnostics?.length > 0 ? diagnostics.map((diagnose, idx) => (
                                <div className="row" key={idx}>

                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{idx + 1}</p>
                                    </div> : null}

                                    <div className="column">
                                        <p>{diagnose.name}</p>
                                    </div>

                                    <div className="column">
                                        <div className="square" style={{ width: '50px', height: '20px', borderRadius: '10px', backgroundColor: diagnose.color }} />
                                    </div>

                                    <div className="column pressable">
                                        <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                        <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                            <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removeDiagnostic(diagnose.id) : null}>
                                                <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                            </div>

                                            <div className="option" onClick={() => navigation(`/edit-diagnostic/${diagnose.id}`, { state: { diagnose: diagnose } })}>
                                                <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <h2 className="center">{cookies.language === "en" ? "No diagnose found." : "Niciun diagnostic gasit."}</h2>
                            )}

                            {pages > 1 ? <div className="pages-container">

                                <div className="page-container" onClick={() => setCurrentPageDiagnostics(1)}>
                                    <p>1</p>
                                </div>

                                <div className="page-input">
                                    <div 
                                        className="value-container"
                                        onClick={() => currentPageDiagnostics > 1 ? setCurrentPageDiagnostics(currValue => currValue - 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                    </div>
                                    
                                    <input 
                                        type="number" 
                                        placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                        value={currentPageDiagnostics}
                                        onChange={e => Number(e.target.value) ? setCurrentPageDiagnostics(Number(e.target.value)) : setCurrentPageDiagnostics("")}
                                    />

                                    <div 
                                        className="value-container"
                                        onClick={() => currentPageDiagnostics < pages ? setCurrentPageDiagnostics(currValue => currValue + 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                    </div>
                                </div>
                                <div className="page-container" onClick={() => setCurrentPageDiagnostics(pages)}>
                                    <p>{pages}</p>
                                </div>
                            </div> : null}
                        </div>
                        
                        
                    
                        <div className="add-button" onClick={() => navigate("/create-diagnostic")}>
                            <FontAwesomeIcon icon={faPlus} className="add-icon" />
                            <p>{cookies?.language === "en" ? "Add diagnostic" : "Adauga diagnostic"}</p>
                        </div>
                    </div> : activeOption === 8 ? (
                         <div className="treatment-categories-details">
                            <div className="search-container">
                                <input type="text" value={patientTypesQuery} onChange={e => setPatientTypesQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search patient type..." : "Cauta tip de pacient..."} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div>
    
                            <div className="patients-container">
                                {patientTypes.length > 0 && <div className="first-row">
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                        
                                    </div> : null}
    
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                    </div>
    
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>
                                </div>}
    
                                {patientTypes?.length > 0 ? patientTypes.map((patientType, idx) => (
                                    <div className="row" key={idx}>
    
                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{idx + 1}</p>
                                        </div> : null}
    
                                        <div className="column">
                                            <p>{patientType.name}</p>
                                        </div>
    
    
                                        <div className="column pressable">
                                            <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                            <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                                <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removePatientType(patientType.id) : null}>
                                                    <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                                </div>
    
                                                <div className="option" onClick={() => navigation(`/edit-patient-type/type/${patientType.id}`, { state: { patientType } })}>
                                                    <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                    <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <h2 className="center">{cookies.language === "en" ? "No patient type found." : "Niciun tip de pacient gasit."}</h2>
                                )}
    
                                {pages > 1 ? <div className="pages-container">
    
                                    <div className="page-container" onClick={() => setCurrentPagePatientTypes(1)}>
                                        <p>1</p>
                                    </div>
    
                                    <div className="page-input">
                                        <div 
                                            className="value-container"
                                            onClick={() => currentPagePatientTypes > 1 ? setCurrentPagePatientTypes(currValue => currValue - 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                        </div>
                                        
                                        <input 
                                            type="number" 
                                            placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                            value={currentPagePatientTypes}
                                            onChange={e => Number(e.target.value) ? setCurrentPagePatientTypes(Number(e.target.value)) : setCurrentPagePatientTypes("")}
                                        />
    
                                        <div 
                                            className="value-container"
                                            onClick={() => currentPagePatientTypes < pages ? setCurrentPagePatientTypes(currValue => currValue + 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                        </div>
                                    </div>
                                    <div className="page-container" onClick={() => setCurrentPagePatientTypes(pages)}>
                                        <p>{pages}</p>
                                    </div>
                                </div> : null}
                            </div>
                            
                            <div className="add-button" onClick={() => navigate("/create-patient-type/type")}>
                                <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                <p>{cookies?.language === "en" ? "Add patient type" : "Adauga tip pacient"}</p>
                            </div>
                         </div>
                    ) : activeOption === 9 ? (
                        <div className="treatment-categories-details">
                            <div className="search-container">
                                <input type="text" value={patientCategoriesQuery} onChange={e => setPatientCategoriesQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search patient category..." : "Cauta categorie de pacient..."} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div>
    
                            <div className="patients-container">
                                {patientTypes.length > 0 && <div className="first-row">
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                        
                                    </div> : null}
    
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                    </div>
    
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>
                                </div>}
    
                                {patientCategories?.length > 0 ? patientCategories.map((patientCategory, idx) => (
                                    <div className="row" key={idx}>
    
                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{idx + 1}</p>
                                        </div> : null}
    
                                        <div className="column">
                                            <p>{patientCategory.category}</p>
                                        </div>
    
    
                                        <div className="column pressable">
                                            <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                            <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                                <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removePatientCategory(patientCategory.id) : null}>
                                                    <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                                </div>
    
                                                <div className="option" onClick={() => navigation(`/edit-patient-type/category/${patientCategory.id}`, { state: { patientCategory } })}>
                                                    <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                    <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <h2 className="center">{cookies.language === "en" ? "No patient category found." : "Nicio categorie de pacient gasita."}</h2>
                                )}
    
                                {pages > 1 ? <div className="pages-container">
    
                                    <div className="page-container" onClick={() => setCurrentPagePatientCategories(1)}>
                                        <p>1</p>
                                    </div>
    
                                    <div className="page-input">
                                        <div 
                                            className="value-container"
                                            onClick={() => currentPagePatientCategories > 1 ? setCurrentPagePatientCategories(currValue => currValue - 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                        </div>
                                        
                                        <input 
                                            type="number" 
                                            placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                            value={currentPagePatientCategories}
                                            onChange={e => Number(e.target.value) ? setCurrentPagePatientCategories(Number(e.target.value)) : setCurrentPagePatientCategories("")}
                                        />
    
                                        <div 
                                            className="value-container"
                                            onClick={() => currentPagePatientCategories < pages ? setCurrentPagePatientCategories(currValue => currValue + 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                        </div>
                                    </div>
                                    <div className="page-container" onClick={() => setCurrentPagePatientCategories(pages)}>
                                        <p>{pages}</p>
                                    </div>
                                </div> : null}
                            </div>
                            
                            <div className="add-button" onClick={() => navigate("/create-patient-type/category")}>
                                <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                <p>{cookies?.language === "en" ? "Add patient category" : "Adauga categorie pacient"}</p>
                            </div>
                         </div>
                    ) : activeOption === 10 ? (
                        <div className="treatment-categories-details">
                            <div className="search-container">
                                <input type="text" value={labsQuery} onChange={e => setLabsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search laboratory..." : "Cauta laborator..."} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div>
    
                            <div className="patients-container">
                                {patientTypes.length > 0 && <div className="first-row">
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                        
                                    </div> : null}
    
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies?.language === "en" ? "City" : "Oras"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies?.language === "en" ? "County" : "Judet / Sector"}</p>
                                    </div>
                                    
                                    <div className="column">
                                        <p>{cookies?.language === "en" ? "Address" : "Adresa"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies?.language === "en" ? "Phone" : "Telefon"}</p>
                                    </div>
    
                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>
                                </div>}
    
                                {labs?.length > 0 ? labs.map((lab, idx) => (
                                    <div className="row" key={idx}>
    
                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{lab.id}</p>
                                        </div> : null}
    
                                        <div className="column">
                                            <p>{lab.name}</p>
                                        </div>

                                        <div className="column">
                                            <p>{lab.city}</p>
                                        </div>

                                        <div className="column">
                                            <p>{lab.county}</p>
                                        </div>

                                        <div className="column">
                                            <p>{lab.address}</p>
                                        </div>

                                        <div className="column">
                                            <p>{lab.phone}</p>
                                        </div>
    
                                        <div className="column pressable">
                                            <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                            <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                                <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removeLab(lab.id) : null}>
                                                    <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                                </div>
    
                                                <div className="option" onClick={() => navigation(`/create-lab/${lab.id}`, { state: { lab } })}>
                                                    <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                    <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <h2 className="center">{cookies.language === "en" ? "No laboratory found." : "Niciun laborator gasit."}</h2>
                                )}
    
                                {/* {pages > 1 ? <div className="pages-container">
    
                                    <div className="page-container" onClick={() => setCurrentPagePatientCategories(1)}>
                                        <p>1</p>
                                    </div>
    
                                    <div className="page-input">
                                        <div 
                                            className="value-container"
                                            onClick={() => currentPagePatientCategories > 1 ? setCurrentPagePatientCategories(currValue => currValue - 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                        </div>
                                        
                                        <input 
                                            type="number" 
                                            placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                            value={currentPagePatientCategories}
                                            onChange={e => Number(e.target.value) ? setCurrentPagePatientCategories(Number(e.target.value)) : setCurrentPagePatientCategories("")}
                                        />
    
                                        <div 
                                            className="value-container"
                                            onClick={() => currentPagePatientCategories < pages ? setCurrentPagePatientCategories(currValue => currValue + 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                        </div>
                                    </div>
                                    <div className="page-container" onClick={() => setCurrentPagePatientCategories(pages)}>
                                        <p>{pages}</p>
                                    </div>
                                </div> : null} */}
                            </div>
                            
                            <div className="add-button" onClick={() => navigate("/create-lab/-1")}>
                                <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                <p>{cookies?.language === "en" ? "Add laboratory" : "Adauga laborator"}</p>
                            </div>
                         </div>
                    ) : activeOption === 11 ? (
                        <div className="treatment-categories-details">
                        <div className="search-container">
                            <input type="text" value={worksQuery} onChange={e => setWorksQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search lab work..." : "Cauta lucrare laborator..."} />
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        </div>

                        <div className="patients-container">
                            {patientTypes.length > 0 && <div className="first-row">
                                {windowWidth >= 600 ? <div className="column">
                                    <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                </div> : null}

                                <div className="column">
                                    <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                </div>

                                <div className="column">
                                    <p>{cookies?.language === "en" ? "Price per" : "Pret per"}</p>
                                </div>

                                <div className="column">
                                    <p>{cookies?.language === "en" ? "Color" : "Culoare"}</p>
                                </div>

                                <div className="column">
                                    <p>{cookies?.language === "en" ? "Options" : "Optiuni"}</p>
                                </div>
                            </div>}

                            {works?.length > 0 ? works.map((work, idx) => (
                                <div className="row" key={idx}>

                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{work.id}</p>
                                    </div> : null}

                                    <div className="column">
                                        <p>{work.name}</p>
                                    </div>

                                    <div className="column">
                                        <p>{work.pricePer}</p>
                                    </div>

                                    <div className="column">
                                        <div className="square" style={{ width: '50px', height: '20px', borderRadius: '10px', backgroundColor: work.color }} />
                                    </div>


                                    <div className="column pressable">
                                        <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                        <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                            <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removeWork(work.id) : null}>
                                                <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                            </div>

                                            <div className="option" onClick={() => navigation(`/create-work/${work.id}`, { state: { work } })}>
                                                <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <h2 className="center">{cookies.language === "en" ? "No work found." : "Nicio lucrare gasita."}</h2>
                            )}

                            {/* {pages > 1 ? <div className="pages-container">

                                <div className="page-container" onClick={() => setCurrentPagePatientCategories(1)}>
                                    <p>1</p>
                                </div>

                                <div className="page-input">
                                    <div 
                                        className="value-container"
                                        onClick={() => currentPagePatientCategories > 1 ? setCurrentPagePatientCategories(currValue => currValue - 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                    </div>
                                    
                                    <input 
                                        type="number" 
                                        placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                        value={currentPagePatientCategories}
                                        onChange={e => Number(e.target.value) ? setCurrentPagePatientCategories(Number(e.target.value)) : setCurrentPagePatientCategories("")}
                                    />

                                    <div 
                                        className="value-container"
                                        onClick={() => currentPagePatientCategories < pages ? setCurrentPagePatientCategories(currValue => currValue + 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                    </div>
                                </div>
                                <div className="page-container" onClick={() => setCurrentPagePatientCategories(pages)}>
                                    <p>{pages}</p>
                                </div>
                            </div> : null} */}
                        </div>
                        
                        <div className="add-button" onClick={() => navigate("/create-work/-1")}>
                            <FontAwesomeIcon icon={faPlus} className="add-icon" />
                            <p>{cookies?.language === "en" ? "Add work" : "Adauga lucrare"}</p>
                        </div>
                     </div>
                    ) : null}
                    </div>
                    
                </div>
                : 
                   
                    <TickAnimation animationFinished={animationFinished} title={videoStart} />
                }

            </div>
        </div>
    );
};

export default Profile;