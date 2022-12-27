import { useState, useEffect } from "react";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import "./CreateDoctor.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import InputColor from "react-input-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";

const CreateDoctor = ({ data }) => {

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState();
    const [color, setColor] = useState({});
    const [multipleSchedules, setMultipleSchedules] = useState(false);
    const [activeDoctor, setActiveDoctor] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    
    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    const createDoctorRequest = async () => {

        if (firstname.length < 3 || lastname.length < 3 || !color?.hex || !phone) {
            setErrorMessage(cookies.language === "en" ? "Fill each field!" : "Completeaza toate campurile!");
            return;
        } 

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                firstname,
                lastname,
                email: email && email?.length > 0 ? email : "",
                phone,
                color: color.hex,
                activeDoctor,
                multipleSchedules
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-doctor`, options);
            const response = await request.json();
            if (await response.success) navigate("/doctors", { state: { success: true, message: cookies.language === "en" ? "Doctor added successfully!" : "Doctorul a fost adaugat cu succes!" } });
            setErrorMessage(await response.message[cookies.language]);
        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    };

    return (
        <div className="create-doctor">
            <Navigation page="doctors" />
            <div className="content">
                <Header data={data} />
                
                <h2 className="title">{cookies.langauge === "en" ? "Add Doctor" : "Adauga Doctor"}</h2>
                
                <div className="go-back" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>
                
                <div className="form">
                    <div className="input">
                        <p>{cookies.langauge === "en" ? "Surname *" : "Nume *"}</p>
                        <input type="text" value={firstname} onChange={e => setFirstname(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>{cookies.language === "en" ? "Name *": "Prenume *"}</p>
                        <input type="text" value={lastname} onChange={e => setLastname(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>Email</p>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>{cookies.language === "en" ? "Phone Number *" : "Numar de telefon *"}</p>
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
                            <InputColor initialValue="#fff" onChange={setColor} />
                            
                        </div>
                    </div>

                    <button type="submit" onClick={async () => await createDoctorRequest()}>{cookies.language === "en" ? "Save": "Salveaza"}</button>
                    <p className="error">{errorMessage}</p>
                </div>
            </div>
        </div>
    );
};

export default CreateDoctor;