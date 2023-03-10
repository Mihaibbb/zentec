import { faAngleDown, faAngleLeft, faAngleUp, faCheck, faTicket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import "./CreatePatient.css";
import DateCustomInput from "../Components/DatePicker/DatePicker";
import tickAnimation from "../imgs/green-tick.mp4";

const CreatePatient = ({ data, fromAppointments, patientSaved }) => {

    const location = useLocation();
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies();

    const birthRef = useRef();
    const gendersRef = useRef([]);
    const genders = cookies.language === "en" ? ['Male', 'Female', 'Not mentioned'] : ['Barbat', 'Femeie', 'Nespecificat'];
    const [doctors, setDoctors] = useState(data.organisation.doctors);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [email, setEmail] = useState(null);
    const [county, setCounty] = useState(null);
    const [city, setCity] = useState(null);
    const [address, setAddress] = useState(null);
    const [currGender, setCurrGender] = useState(null);
    const [fileNumber, setFileNumber] = useState(null);
    const [PIC, setPIC] = useState(null);
    const [notes, setNotes] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [dropMenu, setDropMenu] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    const [numberPatients, setNumberPatients] = useState();
    const [patientAdded, setPatientAdded] = useState(false);

    const noVideoContentRef = useRef();

    const doctorOptions = doctors.map(doctor => {
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
            width: "100%",
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


    const createNewPatient = async () => {
        setErrorMessage(null);
        if (firstName === "" || lastName === "" || (phoneNumber === "" && data.organisation._id !== "mGiEVgbtLezVXv9WM9k2Rc4kG")) {
            setErrorMessage(cookies.language === "en" ? "Fill every required field!" : "Completeaza fiecare camp!");
            return;
        }
        let realPhoneNumber = phoneNumber;
        console.log(birthDate);
        const birthDateJS = new Date(birthDate);
        // const phoneNumberValidation =  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        // const phoneNumberSecondValidation = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
        // if (!realPhoneNumber.match(phoneNumberValidation) && !realPhoneNumber.match(phoneNumberSecondValidation)) {
        //     setErrorMessage(cookies.language === "en" ? "Please enter a valid phone number!" : "Te rog introdu un numar de telefon valid!");
        //     console.log("error");
        // }

        const emailValidation = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (email && email.length > 0 && !email.match(emailValidation)) {
            setErrorMessage(cookies.language === "en" ? "Please enter a valid email address!" : "Te rog introdu o adresa de email valida!");
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                _id: data.organisation._id,
                firstname: firstName,
                lastname: lastName,
                username,
                email: email,
                phone: realPhoneNumber,
                birthdate: birthDate,
                cnp: PIC,
                gender: currGender,
                city,
                county,
                address,
                doctors: doctor,
                notes,
                fileNumber: fileNumber
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-patient`, options);
            const response = await request.json();
            console.log(await response);
            const success = await response.success;
            if (!await success) {
                const message = await response.message;
                console.log(await message, cookies.language);
                return setErrorMessage(await message[cookies.language]);
            }

            if (!fromAppointments) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = "#000";
                setTimeout(() => setPatientAdded(true), 300);
            }
            else patientSaved();
        } catch (e) {
            console.log(e);
        }
    };

    const getNumberOfPatients = async () => {
        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                _id: data.organisation._id
            })
        };

        const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-patients`, options);
        const response = await request.json();
        console.log(response);
        if (response.success) {
            const patientsSorted = response.patients.sort((patient1, patient2) => patient2.fileNumber - patient1.fileNumber);
            setFileNumber(patientsSorted[0].fileNumber + 1);
        }
        else setFileNumber(1);
    };

    const toggleGender = idx => {
        gendersRef.current[idx].classList.toggle("active");
        gendersRef.current.forEach((gender, currIdx) => currIdx !== idx && gender.classList.remove("active"));
        setCurrGender(gendersRef.current[idx].classList.contains("active") ? genders[idx] : "");
    };

    useEffect(() => {
        (async() => {
            await getNumberOfPatients();
        })();
    }, []);

    useEffect(() => {
        if (!birthRef.current) return;
        const today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1; //January is 0!
        const year = today.getFullYear();
        
        if (day < 10) {
           day = '0' + day;
        }
        
        if (month < 10) {
           month = '0' + month;
        } 
            
        const inputMax = `${year}-${month}-${day}`;
        const inputMin = `${year - 100}-${month}-${day}`;
        birthRef.current.setAttribute("max", inputMax);
        birthRef.current.setAttribute("min", inputMin);

    }, [birthRef]);

    useEffect(() => {
        console.log(doctor);
    }, [doctor]);


    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    const handleChangeDate = (newBirthdate) => setBirthDate(new Date(newBirthdate));

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        navigate("/patients");
    };

    return (
        <div className="create-patient">
            <Navigation page={fromAppointments ? "appointments" : "patients"} />
            <div className="content" style={patientAdded ? { maxHeight: "100vh" } : {}}>
                <Header data={data} />
                {patientAdded ? (
                    <div className="video-content" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <video
                            src={tickAnimation}
                            controls={false}
                            autoPlay
                            playsInline
                            onEnded={animationFinished}

                            muted
                            style={{ height: "40vh" }}
                        
                        />
                        <h2 className="title title-video-content" style={{ margin: 0 }}>{cookies.language === "en" ? "Patient added successfully!" : "Pacientul a fost adaugat cu succes!"}</h2>
                    </div> 
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                         <h2 className="title">{cookies.language === "en" ? "Create new patient" : "Creeaza un nou pacient"}</h2>
                
                        <div className="go-back" onClick={() => fromAppointments ? patientSaved() : navigate(-1)}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>

                        <div className="form">
                            <div className="input">
                                <p>{cookies.language === "en" ? "First Name " : "Nume "}<span className="star">*</span></p>
                                <input type="text" placeholder={cookies.language === "en" ? "First Name" : "Nume"} value={firstName} onChange={e => setFirstName(e.target.value)} required />
                            </div>

                            <div className="input">
                                <p>{cookies.language === "en" ? "Last Name " : "Prenume "}<span className="star">*</span></p>
                                <input type="text" placeholder={cookies.language === "en" ? "Last Name" : "Prenume"} value={lastName} onChange={e => setLastName(e.target.value)} required />
                            </div>

                            <div className="input">
                                <p>{cookies.language === "en" ? "Phone number " : "Numar de telefon "}<span className="star">*</span></p>
                                <input type="number" placeholder={cookies.language === "en" ? "Phone number" : "Numar de telefon"} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                            </div>

                            <div className="input">
                                <p>{cookies.language === "en" ? "Date of birth" : "Data de nastere"}</p>
                                {/* <input type="date" placeholder={cookies.language === "en" ? "Birthdate" : "Data de nastere"} ref={birthRef} value={birthDate} onChange={e => setBirthDate(e.target.value)} required /> */}
                                <DateCustomInput initialDate={null} changeDate={handleChangeDate} future={false} past={true} label={cookies.language === "en" ? "Date of birth" : "Data de nastere"} />
                            </div>

                            {/* <div className="input">
                                <p>{cookies.language === "en" ? "Doctor" : "Medic"}</p>
                                <Select options={doctorOptions} styles={customStyles} value={doctor} onChange={e => setDoctor(e)} />
                            </div> */}

                            <div className="input">
                                <p>{cookies.language === "en" ? "File Number " : "Nr. fisa "}<span className="star">*</span></p>
                                <input type="number" placeholder={cookies.language === "en" ? "File Number" : "Nr. fisa"} value={fileNumber || ""} onChange={e => setFileNumber(e.target.value)}/>
                            </div>

                            <div className="info">
                                <p>{cookies.language === "en" ? "Other fields" : "Alte campuri"}</p>
                                <FontAwesomeIcon className={`option-icon ${dropMenu ? "active" : ""}`} icon={faAngleDown} onClick={() => setDropMenu(currStatus => !currStatus)}/>
                            </div>
                        
                            {dropMenu && 
                            <>
                                <div className="input">
                                    <p>{cookies.language === "en" ? "Email" : "Adresa de email"}</p>
                                    <input type="email" placeholder={cookies.language === "en" ? "Email" : "Adresa de email"} value={email || ""} onChange={e => setEmail(e.target.value)} />
                                </div>

                                <div className="input">
                                    <p>{cookies.language === "en" ? "Country" : "Tara"}</p>
                                    <input type="text" placeholder={cookies.language === "en" ? "Country" : "Tara"} value={county || ""} onChange={e => setCounty(e.target.value)} />
                                </div>

                                <div className="input">
                                    <p>{cookies.language === "en" ? "City" : "Oras"}</p>
                                    <input type="text" placeholder={cookies.language === "en" ? "City" : "Oras"} value={city || ""} onChange={e => setCity(e.target.value)} />
                                </div>

                                <div className="input">
                                    <p>{cookies.language === "en" ? "Address" : "Adresa"}</p>
                                    <input type="text" placeholder={cookies.language === "en" ? "Address" : "Adresa"} value={address || ""} onChange={e => setAddress(e.target.value)} />
                                </div>

                                <div className="input">
                                    <p>{cookies.language === "en" ? "Gender" : "Sex"}</p>
                                    <div className="options">
                                        {genders.map((gender, idx) => (
                                            <div className="option" key={idx} ref={ref => gendersRef.current[idx] = ref}>
                                                <div className="circle" onClick={() => toggleGender(idx)}>
                                                    
                                                    <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                    
                                                </div>
                                                <p>{gender}</p>
                                            </div>
                                        ))}
                                    
                                    </div>
                                </div>
                        

                                <div className="input">
                                    <p>{cookies.language === "en" ? "PIC" : "CNP"}</p>
                                    <input placeholder={cookies.language === "en" ? "Personal Identification Code" : "Cod Numeric Personal"} value={PIC || ""} onChange={e => setPIC(e.target.value)}/>
                                </div>

                                <div className="input">
                                    <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                                    <textarea placeholder={cookies.language === "en" ? "Notes" : "Observatii"} value={notes || ""} onChange={e => setNotes(e.target.value)} />
                                </div>
                            </>
                            }

                            {errorMessage ? <p className="error">{errorMessage}</p> : null}
                            <button type="button" className="confirm-button" onClick={async () => await createNewPatient()}>{cookies.language === "en" ? "Add patient" : "Adauga pacient"}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePatient;