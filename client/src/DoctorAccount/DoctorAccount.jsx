import { useEffect } from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import InputColor from "react-input-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import "./DoctorAccount.css";

const DoctorAccount = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const { id } = useParams();
    const historicPage = Number(useParams().historicPage);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [color, setColor] = useState({});
    const [initialColor, setInitialColor] = useState(null);
    const [multipleSchedules, setMultipleSchedules] = useState();
    const [activeDoctor, setActiveDoctor] = useState();
    const [errorMessage, setErrorMessage] = useState();
    const initialHistoric = data.organisation.schedules.filter(schedule => JSON.parse(schedule.users).includes(id));
    const [historic, setHistoric] = useState(initialHistoric);
    const [historicOption, setHistoricOption] = useState(0);
   

    
    const navigate = useNavigate();

    const getDoctorInfo = async () => {
        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    doctorId: id
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/doctor-info`, options);
            const response = await request.json();
            const fetchedData = await response.doctor;
            console.log( await fetchedData.color);
            setFirstname(await fetchedData.firstname);
            setLastname(await fetchedData.lastname);
            setEmail(await fetchedData.email);
            setPhone(await fetchedData.phone);
            setInitialColor(await fetchedData.color);
            setMultipleSchedules(await fetchedData.multiple_schedules);
            setActiveDoctor(await fetchedData.active);
            
           
        } catch (e) {
            console.log(e);
            setErrorMessage(cookies.langauge === "en" ? "An error occured!" : "A aparut o eroare!");
        }
    };

    const submitEditDoctor = async () => {

        if (firstname.length < 3 || lastname.length < 3 || (!color && !color?.hex) || !phone) {
            setErrorMessage(cookies.language === "en" ? "Fill each field!" : "Completeaza toate campurile!");
            return;
        } 

        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    doctorId: id,
                    firstname,
                    lastname,
                    email : email && email?.length > 3 ? email : "",
                    phone,
                    color: color?.hex ? color.hex : initialColor,
                    multipleSchedules,
                    activeDoctor
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-doctor`, options);
            const response = await request.json();
            if (await response.success) navigate("/doctors", { state: {
                success: true,
                message: cookies.language === "en" ? "Doctor edited successfully!" : "Medicul a fost modificat cu succes!"
            } });

        } catch (e) {
            console.log(e);
            setErrorMessage(cookies.langauge === "en" ? "An error occured!" : "A aparut o eroare!");
        }
    };

    useEffect(() => {
        (async () => {
            await getDoctorInfo();
        })();
    }, []);

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
        if (historicOption === 0) {
            setHistoric(currHistoric => currHistoric.filter(appointment => false));
            initialHistoric.forEach(appointment => {
                console.log(appointment);
                if (!appointment.canceled && new Date(appointment.startDate).getTime() <= new Date().getTime()) setHistoric(currHistoric => [...currHistoric, appointment]);
            });
            
        } else if (historicOption === 1) {
            setHistoric(currHistoric => currHistoric.filter(appointment => false));
            initialHistoric.forEach(appointment => {
                if (!appointment.canceled && new Date(appointment.startDate).getTime() > new Date().getTime()) setHistoric(currHistoric => [...currHistoric, appointment]);
            });
        } else if (historicOption === 2) {
            setHistoric(currHistoric => currHistoric.filter(appointment => false));
            initialHistoric.forEach(appointment => {
                if (appointment.canceled) setHistoric(currHistoric => [...currHistoric, appointment]);
            });
        }
    
    }, [historicOption]);
    
    return initialColor && (
        <div className="doctor-account-container">
            <Navigation page="doctors" />

            <div className="content">
                <Header data={data} />

                {!historicPage ? <h2 className="title">{cookies.language === "en" ? "Edit doctor" : "Editare medic"}</h2> : null}
                
                <div className="go-back" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>

                {!historicPage ? <div className="form">
                    <div className="input">
                        <p>{cookies.langauge === "en" ? "Surname" : "Nume"}</p>
                        <input type="text" value={firstname} onChange={e => setFirstname(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>{cookies.language === "en" ? "Name": "Prenume"}</p>
                        <input type="text" value={lastname} onChange={e => setLastname(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>Email</p>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>{cookies.language === "en" ? "Phone Number" : "Numar de telefon"}</p>
                        <input type="number" value={phone} onChange={e => setPhone(e.target.value)} />

                    </div>

                    {/* <div className="input">
                        <div className="option">
                            <div className={`box ${multipleSchedules ? "active" : ""}`} onClick={() => setMultipleSchedules(curr => !curr)}>
                                {multipleSchedules && 
                                    <FontAwesomeIcon className="check-icon" icon={faCheck}/>
                                }
                            </div>
                            <p>{cookies.language === "en" ? "Allow multiple schedules" : "Permite programari multiple"}</p>
                        </div>
                    </div> */}

                    <div className="input">
                        <div className="option">
                            <p>{cookies.language === "en" ? "Highlight Color: " : "Culoare: "}</p>
                            <InputColor initialValue={initialColor} onChange={setColor} />
                            
                        </div>
                    </div>

                    <button type="submit" className="confirm-button" onClick={async () => await submitEditDoctor()}>{cookies.language === "en" ? "Save changes": "Salveaza modificarile"}</button>
                    <p className="error">{errorMessage}</p>
                </div> : null}

                {historicPage ? <div className="patient-historic">
                    <h2 className="title">{cookies.language === "en" ? "Doctor's historic" : "Istoric Medic"}</h2>
                    
                    <div className="historic-options">

                        <div className={`historic-option ${historicOption === 0 ? "active" : ""}`} onClick={() => setHistoricOption(0)}>
                            {cookies.language === "en" ? "Past appointments" : "Programari trecute"}
                        </div>

                        <div className={`historic-option ${historicOption === 1 ? "active" : ""}`} onClick={() => setHistoricOption(1)}>
                            {cookies.language === "en" ? "Future appointments" : "Programari viitoare"}
                        </div>

                        <div className={`historic-option ${historicOption === 2 ? "active" : ""}`} onClick={() => setHistoricOption(2)}>
                            {cookies.language === "en" ? "Canceled appointments" : "Programari anulate"}
                        </div>
                        
                    </div>

                    <div className="historic-container">
                        <div className="first-row">
                            <div className="col">{cookies.language === "en" ? "Title" : "Titlu"}</div>
                            <div className="col">{cookies.language === "en" ? "Patient" : "Pacient"}</div>
                            <div className="col">{cookies.language === "en" ? "Date" : "Data"}</div>
                            <div className="col">{cookies.language === "en" ? "Interval": "Interval"}</div>
                            <div className="col">{cookies.language === "en" ? "Income": "Venit"}</div>
                        </div>
                        {historic && historic.length > 0 && historic.map(historicItem => (
                            <div className="historic-item">
                                <div className="col">{historicItem.title}</div>
                                <div className="col">{JSON.parse(historicItem.patients)[0].firstname} {JSON.parse(historicItem.patients)[0].lastname}</div>
                                <div className="col">{new Date(historicItem.date).getDate() < 10 ? `0${new Date(historicItem.date).getDate()}` : new Date(historicItem.date).getDate()}/{new Date(historicItem.date).getMonth() + 1 < 10 ? `0${new Date(historicItem.date).getMonth() + 1}` : new Date(historicItem.date).getMonth() + 1}/{new Date(historicItem.date).getFullYear()}</div>
                                <div className="col">{new Date(historicItem.startDate).getHours() < 10 ? `0${new Date(historicItem.startDate).getHours()}` : new Date(historicItem.startDate).getHours()}:{new Date(historicItem.startDate).getMinutes() < 10 ? `0${new Date(historicItem.startDate).getMinutes()}` : new Date(historicItem.startDate).getMinutes()} - {new Date(historicItem.endDate).getHours() < 10 ? `0${new Date(historicItem.endDate).getHours()}` : new Date(historicItem.endDate).getHours()}:{new Date(historicItem.endDate).getMinutes() < 10 ? `0${new Date(historicItem.endDate).getMinutes()}` : new Date(historicItem.endDate).getMinutes()}</div>
                                <div className="col">{historicItem?.income || "Nedefinit"} {historicItem?.income ? historicItem?.typeIncome : ""}</div>
                            </div>
                        ))}
                    </div>
                </div> : null}
            </div>
        </div>
    );
};

export default DoctorAccount;