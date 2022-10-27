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
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [color, setColor] = useState({});
    const [initialColor, setInitialColor] = useState(null);
    const [multipleSchedules, setMultipleSchedules] = useState();
    const [activeDoctor, setActiveDoctor] = useState();
    const [errorMessage, setErrorMessage] = useState();
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

        if (firstname.length < 3 || lastname.length < 3 || (!color && !color?.hex) || !phone || email.length < 3) {
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
                    email,
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
    
    return initialColor && (
        <div className="doctor-account-container">
            <Navigation page="doctors" />

            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Edit doctor" : "Editare medic"}</h2>
                
                <div className="go-back" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>

                <div className="form">
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

                    <div className="input">
                        <div className="option">
                            <div className={`box ${multipleSchedules ? "active" : ""}`} onClick={() => setMultipleSchedules(curr => !curr)}>
                                {multipleSchedules && 
                                    <FontAwesomeIcon className="check-icon" icon={faCheck}/>
                                }
                            </div>
                            <p>{cookies.language === "en" ? "Allow multiple schedules" : "Permite programari multiple"}</p>
                        </div>
                    </div>

                    <div className="input">
                        <div className="option">
                            <p>{cookies.language === "en" ? "Highlight Color: " : "Culoare: "}</p>
                            <InputColor initialValue={initialColor} onChange={setColor} />
                            
                        </div>
                    </div>

                    <button type="submit" onClick={async () => await submitEditDoctor()}>{cookies.language === "en" ? "Save modifications": "Salveaza modificarile"}</button>
                    <p className="error">{errorMessage}</p>
                </div>
            </div>
        </div>
    );
};

export default DoctorAccount;