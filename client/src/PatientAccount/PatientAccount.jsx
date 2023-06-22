import { faAddressBook, faAddressCard, faAngleLeft, faBarcode, faCalendar, faCheck, faCity, faDeleteLeft, faEllipsis, faEnvelope, faFilePdf, faIdBadge, faList, faMars, faMinus, faNoteSticky, faPhone, faPlus, faQrcode, faSearch, faTimes, faTooth, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import DateCustomInput from "../Components/DatePicker/DatePicker";
import { faCircleXmark, faFilePowerpoint, faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import "./PatientAccount.css";
import TickAnimation from "../utils/TickAnimation";
import { TEETH, TEETH_KIDS, TEETH_KIDS_NUMBERS } from "../utils/TeethOrder";

const PatientAccount = ({ data }) => {

    const navigation = useNavigate();
    const param = useParams();
    const location = useLocation();
   
    const [cookies, setCookie] = useCookies();
    const birthRef = useRef();
    const noVideoContentRef = useRef();
    const options = cookies.language === "en" ? ["Patient's Data", "Appointments", "Documents", "Treatment Plan", "Treatments", "Anamnesis"] : ["Datele Pacientului", "Programari", "Documente", "Plan Tratament", "Tratamente", "Anamneza"];
    
    if (!param?.id || !param?.historicPage) navigation(-1);
    console.log(param, location.state);                      
    const historicPage = Number(param?.historicPage);
  
    const [patient, setPatient] = useState(location?.state?.patient);
    console.log(patient);

    const initialFirstName = patient?.firstname;
    const initialLastName = patient?.lastname;
    const initialUsername = patient?.username || "";
    const initialPhone = patient?.phone;
    const initialEmail = patient?.email || "";
    const initialCity = patient?.city || "";
    const initialCounty = patient?.county || "";
    const initialAddress = patient?.address || "";
    const initialGender = patient?.gender || "";
    const initialFileNumber = patient?.fileNumber || "";
    const initialPIC = patient?.cnp || "";
    const initialNotes = patient?.notes || "";
    const initialBirthdate = patient?.birthdate || new Date();
    const initialDocuments = JSON.parse(patient?.documents || "[]");
    const initialInitialStatus = JSON.parse(patient?.initial_status || "[]");
    
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
    const [historic, setHistoric] = useState(JSON.parse(patient?.historic || "[]"));
    const [documents, setDocuments] = useState(initialDocuments || []);
    const [treatmentPlans, setTreatmentPlans] = useState(data.organisation.treatments_plan_patients);
    const [totalTreatmentPlans, setTotalTreatmentPlans] = useState(data.organisation.treatments_plan_patients);
    const [treatmentPlansQuery, setTreatmentPlansQuery] = useState("");

    const [treatmentsQuery, setTreatmentsQuery] = useState("");
    const [treatments, setTreatments] = useState(data.organisation.treatments_patients);
    const [totalTreatments, setTotalTreatments] = useState(data.organisation.treatments_patients);

    const [historicOption, setHistoricOption] = useState(0);
    const [errorMessage, setErrorMessage] = useState();
    const [patientMessage, setPatientMessage] = useState("");
    const [patientEdited, setPatientEdited] = useState(false);
    const [videoMessage, setVideoMessage] = useState("");
    const initialActiveOption = historicPage || location?.state?.activeOption || 0;
    const [activeOption, setActiveOption] = useState(initialActiveOption);

    const [documentMessage, setDocumentMessage] = useState("");
    const [documentRemoved, setDocumentRemoved] = useState(false);
    const [diagnostics, setDiagnostics] = useState(initialInitialStatus);
    const [totalDiagnostics, setTotalDiagnostics] = useState(initialInitialStatus);
    const [currentPageDiagnostics, setCurrentPageDiagnostics] = useState(1);
    const [currentPageTreatmentPlans, setCurrentPageTreatmentPlans] = useState(1);
    const [currentPageTreatments, setCurrentPageTreatments] = useState(1);
    const [diagnosticsQuery, setDiagnosticsQuery] = useState("");
    const [diagnoseRemoved, setDiagnoseRemoved] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
    const statusOptions = cookies?.language === "en" ? ["Initial Status", "Current Status"] : ["Status initial", "Status Actual"];
    const [activeStatusOption, setActiveStatusOption] = useState(0);
    const [toothImage, setToothImage] = useState({});
    const [toothImageCurrentStatus, setToothImageCurrentStatus] = useState({});
    const [toothImageInitialStatusKids, setToothImageInitialStatusKids] = useState({});
    const [toothImageCurrentStatusKids, setToothImageCurrentStatusKids] = useState({});
    const [diagnoseMessage, setDiagnoseMessage] = useState("");

    const perPage = 10;
    const [pages, setPages] = useState();

    const theme = useMemo(() => cookies?.theme || "dark", [cookies]);
    const currGenders = cookies.language === "en" ? ['Male', 'Female', 'Not mentioned'] : ['Masculin', 'Feminin', 'Nespecificat'];
    const currTeethTypes = cookies.language === "en" ? ['Temporary', 'Permanently', 'Mix'] : ['Temporara', 'Permanenta', 'Mixta'];
    const [teethType, setTeethType] = useState(cookies?.language === "en" ? "Permanently" : "Permanenta");

    const gendersRef = useRef([]);
    const currTeethTypeRef = useRef([]);
    const optionsTreatmentsRef = useRef([]);
    const optionsTreatmentPlansRef = useRef([]);

    const toggleGender = (idx) => {
        gendersRef.current[idx].classList.toggle("active");
        gendersRef.current.forEach((currGender, currIdx) => currIdx !== idx && currGender.classList.remove("active"));
        setGender(gendersRef.current[idx].classList.contains("active") ? currGenders[idx] : "");
    };

    const toggleTeethType = (idx) => {
        currTeethTypeRef.current[idx].classList.add("active");
        currTeethTypeRef.current.forEach((currTeethType, currIdx) => currIdx !== idx && currTeethType.classList.remove("active"));
        console.log(currTeethTypeRef.current[idx].classList.contains("active") ? currTeethTypes[idx] : "");
        setTeethType(currTeethTypeRef.current[idx].classList.contains("active") ? currTeethTypes[idx] : "");    
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
            const currPatient = response.patient[0];
            setFirstName(currPatient.firstname);
            setLastName(currPatient.lastname);
            setUsername(currPatient.username || "");
            setPhoneNumber(currPatient.phone);
            setBirthDate(new Date(currPatient?.birthdate));
            setEmail(currPatient?.email || "");
            setCity(currPatient?.city || "");
            setCounty(currPatient?.county || "");
            setAddress(currPatient?.address || "");
            setGender(currPatient?.gender || "");
            setFileNumber(currPatient?.fileNumber || "");
            setPIC(currPatient?.cnp || "");
            setNotes(currPatient?.notes || "");
            setDocuments(JSON.parse(currPatient?.documents || "[]"));
            setHistoric(JSON.parse(currPatient?.historic || "[]"))
            setPatient(response.patient[0]);
            setDiagnostics(JSON.parse(response.patient[0]?.initial_status || "[]"));
            setTotalDiagnostics(JSON.parse(response.patient[0]?.initial_status || "[]"));

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
    }, [location]);

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
        // window.addEventListener("beforeunload", e => {
        //     return "Any string value here forces a dialog box to \n" + 
        //      "appear before closing the window.";
        // }); 
    }, []);
    
    useLayoutEffect(() => {
        if (activeOption !== 5) return;
        setPages(Math.floor(totalDiagnostics.length / perPage) + (totalDiagnostics.length % perPage !== 0 ? 1 : 0));
    }, [totalDiagnostics, activeOption]);

    useLayoutEffect(() => {
        if (activeOption !== 3) return;
        setPages(Math.floor(totalTreatmentPlans.length / perPage) + (totalTreatmentPlans.length % perPage !== 0 ? 1 : 0));
    }, [totalTreatmentPlans, activeOption]);

    useLayoutEffect(() => {
        if (activeOption !== 4) return;
        setPages(Math.floor(totalTreatments.length / perPage) + (totalTreatments.length % perPage !== 0 ? 1 : 0));
    }, [totalTreatments, activeOption]);

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

    function importAll(r) {
        let images = {};
        r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
        return images;
    }

    useEffect(() => {
        if (activeOption !== 1) return;
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
        diagnoseRemoved ? window.location.reload() : navigation("/patients", { state: patientMessage });
    };

    const documentAnimationFinished = () => {
        document.body.style.background = "var(--background)";
        window.location.reload();
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

    const removeDocument = async (photoId, source, fileName) => {
        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-patient-document/${data.organisation._id}/${param?.id}/${photoId}/${source.split("/").at(-1)}`, options);
            const response = await request.json();

            if (response.success) {
                setDocumentMessage(cookies?.language === "en" ? `The file ${fileName} was removed successfully!` : `Fisierul ${fileName} a fost sters cu succes!`);
                setDocumentRemoved(true);
            }
            else console.log(response);

        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (activeOption === initialActiveOption) return;
        navigation(`/patient/${param?.id}/${activeOption}`, { state: { ...location?.state, activeOption } });
    }, [activeOption]);

    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };


        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();
                console.log(response);
                if (response.success) setToothImage(currImages => {
                    currImages[tooth] = response.tooth;
                    return currImages;
                });
            } catch (e) {
                console.log(e);
            }
        });
   
    }, []);

    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-current-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();

                if (response.success) setToothImageCurrentStatus(currImages => {
                    currImages[tooth] = response.tooth;
                    return currImages;
                });
            } catch (e) {
                console.log(e);
            }
        });
   
    }, []);

    useEffect(() => {

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH_KIDS_NUMBERS.forEach(async (tooth, idx) => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageInitialStatusKids(currImages => {
                    currImages[TEETH_KIDS[idx]] = response.tooth;
                    return currImages;
                });
            } catch (e) {
                console.log(e);
            }
        });
    }, []);

    useEffect(() => {

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH_KIDS_NUMBERS.forEach(async (tooth, idx) => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-current-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageCurrentStatusKids(currImages => {
                    currImages[TEETH_KIDS[idx]] = response.tooth;
                    return currImages;
                });
                
            } catch (e) {
                console.log(e);
            }
        });
    }, []);


    useLayoutEffect(() => {
        (async () => {
            try {
                const options = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        searchQuery: diagnosticsQuery,
                        organisationId: data.organisation._id,
                        patientId: param?.id
                    })
                };
    
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-diagnostic-initial-status`, options);
                const response = await request.json();
                if (response.success) {

                    setDiagnostics(_ => {
                        return response.initialStatus.filter((__, idx) => {
                            return (idx + 1) > perPage * (currentPageDiagnostics - 1) && (idx + 1) <= perPage * currentPageDiagnostics;
                        });
                    });
                    setTotalDiagnostics(response.initialStatus || []);
                } else {
                    setDiagnostics([]);
                    setTotalDiagnostics([]);
                }
            } catch (e) {
                console.log(e);
            }
          
        })();
    }, [diagnosticsQuery]);


    useLayoutEffect(() => {
        (async () => {
            try {
                const options = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        searchQuery: treatmentPlansQuery,
                        organisationId: data.organisation._id,
                        patientId: param?.id
                    })
                };
    
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-treatment-plan`, options);
                const response = await request.json();

                if (response.success) {

                    setTreatmentPlans(_ => {
                        return response.treatmentPlans.filter((__, idx) => {
                            return (idx + 1) > perPage * (currentPageTreatmentPlans - 1) && (idx + 1) <= perPage * currentPageTreatmentPlans;
                        });
                    });
                    setTotalTreatmentPlans(response.treatmentPlans || []);
                } else {
                    setTreatmentPlans([]);
                    setTotalTreatmentPlans([]);
                }
            } catch (e) {
                console.log(e);
            }
          
        })();
    }, [treatmentPlansQuery]);

    useLayoutEffect(() => {
        (async () => {
            try {
                const options = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        searchQuery: treatmentsQuery,
                        organisationId: data.organisation._id,
                        patientId: param?.id
                    })
                };
    
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-patient-treatment`, options);
                const response = await request.json();
                if (response.success) {
                    setTreatments(_ => {
                        return response.treatments.filter((__, idx) => {
                            return (idx + 1) > perPage * (currentPageTreatments - 1) && (idx + 1) <= perPage * currentPageTreatments;
                        });
                    });
                    setTotalTreatments(response.treatments || []);
                } else {
                    setTreatments([]);
                    setTotalTreatments([]);
                }
            } catch (e) {
                console.log(e);
            }
          
        })();
    }, [treatmentsQuery]);

    const getDiagnostics = async () => {
        try {
            const options = {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                },
                
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-diagnostics-initial-status/${data.organisation._id}/${param?.id}`, options);
            const response = await request.json();
            if (response.success) {
                setDiagnostics(currTreatments => {
                    return response.initialStatus.filter((treatment, idx) => {
                        return (idx + 1) > perPage * (currentPageDiagnostics - 1) && (idx + 1) <= perPage * currentPageDiagnostics;
                    });
                });
                setTotalDiagnostics(response.initialStatus || []);
            } else {
                setDiagnostics([]);
                setTotalDiagnostics([]);
            }
        } catch (e) {
            console.log(e);
        }
    };



    useEffect(() => {
        (async () => {
            await getDiagnostics();
        })();
    }, [location]);
    
    

    const removeDiagnostic = async (id) => {
        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-diagnostic-initial-status/${data.organisation._id}/${param?.id}/${id}`, options);
            const response = await request.json();
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setDiagnoseMessage(cookies?.language === "en" ? `Diagnose was removed successfully!` : `Diagnosticul a fost sters cu succes!`);
                setTimeout(() => setDiagnoseRemoved(true), 300);
            }
            else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const removeTreatmentPlan = async (id) => {
        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-treatment-plan/${data.organisation._id}/${id}`, options);
            const response = await request.json();
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setDiagnoseMessage(cookies?.language === "en" ? `Treatment plan was removed successfully!` : `Planul de tratament a fost sters cu succes!`);
                setTimeout(() => setDiagnoseRemoved(true), 300);
            }
            else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };


    const removeTreatment = async (id) => {
        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-patient-treatment/${data.organisation._id}/${id}`, options);
            const response = await request.json();
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setDiagnoseMessage(cookies?.language === "en" ? `Treatment was removed successfully!` : `Tratamentul a fost sters cu succes!`);
                setTimeout(() => setDiagnoseRemoved(true), 300);
            }
            else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

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
        setDiagnostics(currPatients => {
            return [...totalDiagnostics].filter((_, idx) => {
                return (idx + 1) > perPage * (currentPageDiagnostics - 1) && (idx + 1) <= perPage * currentPageDiagnostics;
            });
        });
    }, [currentPageDiagnostics]);


    useEffect(() => {
        setTreatmentPlans(_ => {
            return [...totalTreatmentPlans].filter((__, idx) => {
                return (idx + 1) > perPage * (currentPageTreatmentPlans - 1) && (idx + 1) <= perPage * currentPageTreatmentPlans;
            });
        });
    }, [currentPageTreatmentPlans]);

    useEffect(() => {
        setTreatments(_ => {
            return [...totalTreatments].filter((__, idx) => {
                return (idx + 1) > perPage * (currentPageTreatments - 1) && (idx + 1) <= perPage * currentPageTreatments;
            });
        });
    }, [currentPageTreatments]);

    const triggerOptions = (idx, element) => {
        element?.length && element[idx]?.classList?.toggle("show");
        element?.length && element.forEach((option, currIdx) => currIdx !== idx && option?.classList?.remove("show"));
    };

    const printTeeth = (teeth) => {
        let str = "";
        teeth && teeth.length && teeth.forEach(tooth => str = str + tooth + ", ");
        if (teeth && teeth.length) return str.slice(0, str.length - 2);
        return str;
    };

    const getDoctorName = (id) => {
        const doctor = data.organisation.doctors.find(doctor => doctor._id === id);
        if (!doctor) return "";
        return `${doctor?.firstname || ""} ${doctor?.lastname || ""}`;
    };

    const getTreatmentData = (id) => {
        const currTreatment = data.organisation.treatments.find(trt => trt._id === id);
        if (!currTreatment) return null;
        return currTreatment;
    };


    
    return (
        <div className="account-container patients"> 
            <Navigation />

            <div className="content" style={patientEdited ? { maxHeight: "100vh" } : {}}> 
                <Header data={data} />
              
                {patientEdited || documentRemoved || diagnoseRemoved ?
                    <TickAnimation animationFinished={patientEdited ? animationFinished : documentAnimationFinished} title={patientEdited ? videoMessage : documentRemoved ? documentMessage : diagnoseRemoved ? diagnoseMessage : ""} />
                : 
                <>
                    <div className="patient-account-details no-video-content" ref={noVideoContentRef}>
                        <div className="patient-name">
                            <FontAwesomeIcon icon={faUser} className="patient-icon" />
                            <h2>{initialFirstName} {initialLastName}</h2>

                            <div className="patient-option-icon">
                                <FontAwesomeIcon icon={faFilePowerpoint} className="icon success-icon option-icon" onClick={() => navigation(`/patient-file/${param?.id}`)} />
                                <div className="label">
                                    <p>{cookies?.language === "en" ? "Generate Patient File" : "Genereaza Fisa Pacient"}</p>
                                </div>
                            </div>

                            <div className="patient-option-icon">
                                <FontAwesomeIcon icon={faTrashCan} className="icon remove-icon option-icon" onClick={async () => await removePatient()} />
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
                            
                    </div>
                    
                    
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
                                        <FontAwesomeIcon icon={faTrashCan} className="remove-icon icon" onClick={async () => await removeFutureAppointment(new Date(historicItem?.date), historicItem?.startHour, historicItem?.startMinutes, historicItem?.endHour, historicItem?.endMinutes)} />
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
                                    <>
                                        <div className="document">
                                            <img className="document-image" loading="lazy" src={`${process.env.REACT_APP_BACKEND_URL}${document.source}`} alt="document" />
                                            <h2 className="document-name">{document.fileName}</h2>
                                            <div className="edit-container" onClick={() => window.location.replace(`/patient/${param?.id}/${document.photoId}/edit`)}>
                                                <FontAwesomeIcon icon={faPenToSquare} className="edit-icon" />
                                            </div>

                                            <div className="remove-container" onClick={async () => await removeDocument(document.photoId, document.source, document.fileName)}>
                                                <FontAwesomeIcon icon={faTrashCan} className="remove-icon icon" />
                                            </div>
                                        </div>
                            
                                    </>
                                
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
                    ) : historicPage === 3 ? (
                        <div>
                            {activeStatusOption === 0 ? <div className="search-container">
                                <input type="text" value={treatmentPlansQuery} onChange={e => setTreatmentPlansQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search treatment plan..." : "Cauta plan de tratament..."} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div> : null}


                     <div className="patients-container mg-bottom">
                        {treatmentPlans.length > 0 && <div className="first-row">
                            {windowWidth >= 600 ? <div className="column">
                                <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                
                            </div> : null}

                            <div className="column">
                                <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                            </div>

                            <div className="column">
                                <p>{cookies?.language === "en" ? "Date" : "Data"}</p>
                            </div>

                            <div className="column">
                                <p>{cookies?.language === "en" ? "Status" : "Status"}</p>
                            </div>

                            <div className="column">
                                <p>{cookies.language === "en" ? "Total" : "Total"}</p>
                            </div>

                            <div className="column">
                                <p>{cookies.language === "en" ? "Negotiated Total" : "Total negociat"}</p>
                            </div>

                            <div className="column">
                                <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                            </div>

                        </div>}

                        {treatmentPlans?.length > 0 ? treatmentPlans.map((treatmentPlan, idx) => (
                           <div className="row" key={idx}>

                                {windowWidth >= 600 ? <div className="column">
                                    <p>{(currentPageTreatmentPlans - 1) * perPage + idx + 1}</p>
                                </div> : null}

                                <div className="column">
                                    <p>{treatmentPlan.name}</p>
                                </div>

                           
                                <div className="column">
                                    <p>{new Date(treatmentPlan.date).getDate() < 10 ? `0${new Date(treatmentPlan.date).getDate()}` : new Date(treatmentPlan.date).getDate()}.{new Date(treatmentPlan.date).getMonth() + 1 < 10 ? `0${new Date(treatmentPlan.date).getMonth() + 1}` : new Date(treatmentPlan.date).getMonth() + 1}.{new Date(treatmentPlan.date).getFullYear()}</p>
                                </div>

                                <div className="column">
                                    <p>{treatmentPlan.status}</p>
                                </div>

                                <div className="column">
                                    <p>{treatmentPlan.totalPrice}</p>
                                </div>

                                <div className="column">
                                    <p>{treatmentPlan.totalNegotiated}</p>
                                </div>

                                <div className="column pressable">
                                    <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentPlansRef.current)}/>
                                    <div className="options-container" ref={ref => optionsTreatmentPlansRef.current[idx] = ref}>

                                        <div className="option" onClick={() => navigation(`/edit-treatment-plan-patient/${param?.id}/${treatmentPlan._id}`, { state: { treatmentPlan: treatmentPlan } })}>
                                            <FontAwesomeIcon icon={faUser} className="option-icon" />
                                            <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                        </div>
                                        
                                        <div className="option" onClick={() => navigation(`/document-patient-treatment-plan/${param?.id}/${treatmentPlan._id}`, { state: {treatmentPlan: treatmentPlan} })}>
                                            <FontAwesomeIcon icon={faFilePdf} className="option-icon" />
                                            <p>{cookies?.language === "en" ? "Document" : "Document"}</p>
                                        </div>

                                        <div className="option" onClick={async () => optionsTreatmentPlansRef.current[idx].classList.contains("show") ? await removeTreatmentPlan(treatmentPlan._id) : null}>
                                            <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                            <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        )) : (
                            <h2 className="center">{cookies.language === "en" ? "No treatment plan found." : "Niciun plan de tratament gasit."}</h2>
                        )}

                        {pages > 1 ? <div className="pages-container">

                            <div className="page-container" onClick={() => setCurrentPageTreatmentPlans(1)}>
                                <p>1</p>
                            </div>

                            <div className="page-input">
                                <div 
                                    className="value-container"
                                    onClick={() => currentPageTreatmentPlans > 1 ? setCurrentPageTreatmentPlans(currValue => currValue - 1) : null}
                                >
                                    <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                </div>
                                
                                <input 
                                    type="number" 
                                    placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                    value={currentPageTreatmentPlans}
                                    onChange={e => Number(e.target.value) ? setCurrentPageTreatmentPlans(Number(e.target.value)) : setCurrentPageTreatmentPlans("")}
                                />

                                <div 
                                    className="value-container"
                                    onClick={() => currentPageTreatmentPlans < pages ? setCurrentPageTreatmentPlans(currValue => currValue + 1) : null}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                </div>
                            </div>
                            <div className="page-container" onClick={() => setCurrentPageTreatmentPlans(pages)}>
                                <p>{pages}</p>
                            </div>
                        </div> : null}

                            <div className="add-button" onClick={() => navigation(`/create-treatment-plan-patient/${param?.id}`, { state: location?.state })}>
                                <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                <p>{cookies?.language === "en" ? "Add treatment plan" : "Adauga plan tratament"}</p>
                            </div>
                        </div>
                    </div>
                    ) : historicPage === 4 ? (
                        <div>
                            {activeStatusOption === 0 ? <div className="search-container">
                                <input type="text" value={treatmentsQuery} onChange={e => setTreatmentsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search treatment..." : "Cauta tratament..."} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div> : null}


                            <div className="patients-container mg-bottom">
                                {treatments.length > 0 && <div className="first-row">
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                        
                                    </div> : null}

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Treatment" : "Tratament"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Doctor" : "Medic"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Teeth" : "Dinti"}</p>
                                    </div>

                                    {/* <div className="column">
                                        <p>{cookies?.language === "en" ? "Date" : "Data"}</p>
                                    </div> */}

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Total" : "Total"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Negotiated Total" : "Total negociat"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies?.language === "en" ? "Status" : "Status"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>

                                </div>}

                                {treatments?.length > 0 ? treatments.map((treatment, idx) => (
                                    <div className="row" key={idx}>

                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{(currentPageTreatments - 1) * perPage + idx + 1}</p>
                                        </div> : null}

                                        <div className="column">
                                            <div className="square" style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: getTreatmentData(treatment.treatmentId)?.color || "#fff" }} />
                                            <p>{getTreatmentData(treatment.treatmentId)?.name || ""}</p>
                                        </div>

                                        <div className="column">
                                            <p>{getDoctorName(treatment.doctorId)}</p>
                                        </div>

                                
                                        <div className="column">
                                            <p>{printTeeth(JSON.parse(treatment.teeth))}</p>
                                        </div>


                                        {/* <div className="column">
                                            <p>{new Date(treatment.date).getDate() < 10 ? `0${new Date(treatment.date).getDate()}` : new Date(treatment.date).getDate()}.{new Date(treatment.date).getMonth() + 1 < 10 ? `0${new Date(treatment.date).getMonth() + 1}` : new Date(treatment.date).getMonth() + 1}.{new Date(treatment.date).getFullYear()}</p>
                                        </div> */}


                                        <div className="column">
                                            <p>{treatment.totalPrice}</p>
                                        </div>

                                        <div className="column">
                                            <p>{treatment.totalNegotiated}</p>
                                        </div>

                                        <div className="column">
                                            <FontAwesomeIcon className="status-icon" style={{ backgroundColor: treatment.status.toLowerCase() === "realizat" || treatment.status.toLowerCase() === "accomplished" ? "var(--success-color)" : treatment.status.toLowerCase() === "propus" || treatment.status.toLowerCase() === "proposed" ? "var(--warning-color)" : "var(--error-color)" }} icon={treatment.status.toLowerCase() === "realizat" || treatment.status.toLowerCase() === "accomplished" ? faCheck : treatment.status.toLowerCase() === "propus" || treatment.status.toLowerCase() === "proposed" ? faList : faTimes}/>
                                            <p>{treatment.status}</p>
                                        </div>

                                        <div className="column pressable">
                                            <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                            <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                                <div className="option" onClick={() => navigation(`/edit-treatment-patient/${param?.id}/${treatment.id}`, { state: { treatment: treatment } })}>
                                                    <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                    <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                                </div>

                                                <div className="option" onClick={() => navigation(`/view-treatment-sterilization/${param?.id}/${treatment.id}`, { state: { treatment: treatment } })}>
                                                    <FontAwesomeIcon icon={faBarcode} className="option-icon" />
                                                    <p>{cookies.language === "en" ? "Sterilization" : "Sterilizare"}</p>
                                                </div>
                                                
                                                <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removeTreatment(treatment.id) : null}>
                                                    <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
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

                                <div className="add-button" onClick={() => navigation(`/create-treatment-patient/${param?.id}`, { state: location?.state })}>
                                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                    <p>{cookies?.language === "en" ? "Add treatment" : "Adauga tratament"}</p>
                                </div>
                            </div>
                        </div>
                    ) : historicPage === 5 ? (
                        <div className="treatment-categories-details">

                            {statusOptions && statusOptions.length ? <div className="splitter">
                                {statusOptions.map((statusOption, idx) => (
                                    <div className={`splitter-container ${activeStatusOption === idx ? "selected" : ""}`} key={idx} onClick={() => setActiveStatusOption(idx)}>
                                        <h3>{statusOption}</h3>
                                    </div>
                                ))}
                              
                            </div> : null}

                            {activeStatusOption === 0 ? <div className="patient-account-details teeth-surfaces">
                                <div className="inputs-container">
                                    <div className="input">
                                        <div className="input-title">
                                            <FontAwesomeIcon className="icon" icon={faTooth} />
                                            <p>{cookies.language === "en" ? "Dentition Type: " : "Tipul dentitiei: "}</p>
                                        </div>
                                        
                                        <div className="options">
                                            {currTeethTypes.map((currTeethType, idx) => (
                                                <div className={`option ${currTeethType === teethType ? "active" : ""}`} key={idx} ref={ref => currTeethTypeRef.current[idx] = ref}>
                                                    <div className="circle" onClick={() => toggleTeethType(idx)}>
                                                        
                                                        <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                        
                                                    </div>
                                                    <p className="patient-gender">{currTeethType}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div> : null }
                         
                            
                            {activeStatusOption === 0 && (teethType === currTeethTypes[1] || teethType === currTeethTypes[2]) ? (
                                <div className="teeth-container">
                                    {TEETH.map((tooth, idx) => (
                                        <div className="tooth-container" key={idx}>
                                            {idx <= 15 ? <div className="hover-name">{toothImage[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImage[tooth]?.slice(2, toothImage[tooth].length) || "Normal"}</div> : null}
                                            {idx <= 15 ? <p>{tooth}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImage[tooth] || ""}.png`} />
                                            {idx > 15 ? <p>{tooth}</p> : null}
                                            {idx > 15 ? <div className="hover-name">{toothImage[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImage[tooth]?.slice(2, toothImage[tooth].length) || "Normal"}</div> : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {activeStatusOption === 0 && (teethType === currTeethTypes[0] || teethType === currTeethTypes[2]) ? (
                                <div className="teeth-container kids-teeth">
                                    {TEETH_KIDS.map((tooth, idx) => (
                                        <div className="tooth-container" key={idx}>
                                            {idx <= 9 ? <div className="hover-name">{toothImageInitialStatusKids[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImageInitialStatusKids[tooth]?.slice(2, toothImageInitialStatusKids[tooth]?.length) || "Normal"}</div>  : null}
                                            {idx <= 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageInitialStatusKids[tooth] || ""}.png`} />
                                            {idx > 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                            {idx > 9 ? <div className="hover-name">{toothImageInitialStatusKids[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImageInitialStatusKids[tooth]?.slice(2, toothImageInitialStatusKids[tooth]?.length) || "Normal"}</div>  : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {activeStatusOption === 1 ? <div className="patient-account-details teeth-surfaces">
                                <div className="inputs-container">
                                    <div className="input">
                                        <div className="input-title">
                                            <FontAwesomeIcon className="icon" icon={faTooth} />
                                            <p>{cookies.language === "en" ? "Dentition Type: " : "Tipul dentitiei: "}</p>
                                        </div>
                                        
                                        <div className="options">
                                            {currTeethTypes.map((currTeethType, idx) => (
                                                <div className={`option ${currTeethType === teethType ? "active" : ""}`} key={idx} ref={ref => currTeethTypeRef.current[idx] = ref}>
                                                    <div className="circle" onClick={() => toggleTeethType(idx)}>
                                                        
                                                        <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                        
                                                    </div>
                                                    <p className="patient-gender">{currTeethType}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div> : null }
                            
                            {activeStatusOption === 1 && (teethType === currTeethTypes[1] || teethType === currTeethTypes[2]) ? (
                                <div className="teeth-container">
                                    {TEETH.map((tooth, idx) => (
                                        <div className="tooth-container" key={idx}>
                                            {idx <= 15 ? <div className="hover-name">{toothImageCurrentStatus[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImageCurrentStatus[tooth]?.slice(2, toothImageCurrentStatus[tooth].length) || "Normal"}</div> : null}
                                            {idx <= 15 ? <p>{tooth}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatus[tooth] || ""}.png`} />
                                            {idx > 15 ? <p>{tooth}</p> : null}
                                            {idx > 15 ? <div className="hover-name">{toothImageCurrentStatus[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImageCurrentStatus[tooth]?.slice(2, toothImageCurrentStatus[tooth]?.length) || "Normal"}</div>  : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {activeStatusOption === 1 && (teethType === currTeethTypes[0] || teethType === currTeethTypes[2]) ? (
                                <div className="teeth-container kids-teeth">
                                    {TEETH_KIDS.map((tooth, idx) => (
                                        <div className="tooth-container" key={idx}>
                                            {idx <= 9 ? <div className="hover-name">{toothImageCurrentStatusKids[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImageCurrentStatusKids[tooth]?.slice(2, toothImageCurrentStatusKids[tooth]?.length) || "Normal"}</div>  : null}
                                            {idx <= 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                            <img src={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatusKids[tooth] || ""}.png`} />
                                            {idx > 9 ? <p>{TEETH_KIDS_NUMBERS[idx]}</p> : null}
                                            {idx > 9 ? <div className="hover-name">{toothImageCurrentStatusKids[tooth]?.slice(1, 2)?.toUpperCase() || ""}{toothImageCurrentStatusKids[tooth]?.slice(2, toothImageCurrentStatusKids[tooth]?.length) || "Normal"}</div>  : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {activeStatusOption === 0 ? <div className="search-container">
                                <input type="text" value={diagnosticsQuery} onChange={e => setDiagnosticsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search diagnose..." : "Cauta diagnostic..."} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div> : null}


                            {activeStatusOption === 0 ? <div className="patients-container mg-bottom">
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
                                        <p>{cookies?.language === "en" ? "Teeth" : "Dintii"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>
                                </div>}

                                {diagnostics?.length > 0 ? diagnostics.map((diagnose, idx) => (
                                    <div className="row" key={idx}>

                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{(currentPageDiagnostics - 1) * perPage + idx + 1}</p>
                                        </div> : null}

                                        <div className="column">
                                            <p>{diagnose.name}</p>
                                        </div>

                                        <div className="column">
                                            <div className="square" style={{ width: '50px', height: '20px', borderRadius: '10px', backgroundColor: diagnose.color }} />
                                        </div>

                                        <div className="column">
                                            <p>{printTeeth(diagnose.teeth)}</p>
                                        </div>

                                        <div className="column pressable">
                                            <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsTreatmentsRef.current)}/>
                                            <div className="options-container" ref={ref => optionsTreatmentsRef.current[idx] = ref}>
                                                <div className="option" onClick={async () => optionsTreatmentsRef.current[idx].classList.contains("show") ? await removeDiagnostic(diagnose.id) : null}>
                                                    <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                                </div>

                                                <div className="option" onClick={() => navigation(`/edit-diagnostic-patient/${param?.id}/${diagnose.id}`, { state: { diagnose: diagnose } })}>
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
                            </div> : null}
                            
                            {activeStatusOption === 0 ? <div className="add-button" onClick={() => navigation(`/create-diagnostic-patient/${param?.id}`)}>
                                <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                <p>{cookies?.language === "en" ? "Add diagnose" : "Adauga diagnostic"}</p>

                            </div> : null }
                        </div> 
                    ) : null} 
                </>
                
                }
                
            </div>
        </div>
    );
};

export default PatientAccount;