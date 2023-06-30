import { useState, useEffect, useRef, useMemo } from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Header from "../../Components/Header/Header";
import "../../CreateDoctor/CreateDoctor.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import InputColor from "react-input-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import tickAnimation from "../../imgs/green-tick.mp4";
import tickAnimationWhite from "../../imgs/green-tick-light-theme.mp4";
import TickAnimation from "../../utils/TickAnimation";

const CreateWork = ({ data }) => {
    const params = useParams();
    const id = params?.id;
    const editMode = useMemo(() => Number(id) >= 0 ? true : false, []);
    const currWork = useMemo(() => data.organisation.works.find(work => work.id === Number(params?.id || -1)), []);

    const [name, setName] = useState(currWork?.name || "");
    const [pricePer, setPricePer] = useState(currWork?.pricePer || "");
    const [color, setColor] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [doctorAdded, setDoctorAdded] = useState(false);

    const noVideoContentRef = useRef();
    
    
    const [cookies, setCookie] = useCookies();
    const theme = useMemo(() => cookies?.theme || "light", [cookies]);

    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        console.log(cookies);
    }, [cookies]);

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    const createDoctorRequest = async () => {

        if (!name.length || !pricePer.length) {
            setErrorMessage(cookies.language === "en" ? "Fill each field!" : "Completeaza toate campurile!");
            return;
        } 

        const options = {
            method: editMode ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                name,
                pricePer,
                color: color?.hex || (editMode ? currWork?.color : (cookies?.theme === "dark" ? "#fff" : "#000")),
                workId: Number(params?.id || -1)
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/${editMode ? "edit" : "create"}-work`, options);
            const response = await request.json();
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setDoctorAdded(true), 300);
            
             
            } else {
                console.log(response);
                setErrorMessage(await response.message[cookies.language]);
            }
        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    };

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        navigate("/profile", { state: { refresh: true, activeOption: 9 } });
    };

    return (
        <div className="create-doctor">
            <Navigation page="doctors" />
            <div className="content" style={doctorAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {doctorAdded ? (
                    <TickAnimation title={cookies.language === "en" ? `Work ${editMode ? "edited" : "added"} successfully!` : `Lucrarea a fost ${editMode ? "editata" : "adaugata"} cu succes!`} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? `${editMode ? "Edit" : "Add"} work` : `${editMode ? "Editeaza" : "Adauga"} lucrare`}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Name *" : "Nume *"}</p>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.language === "en" ? "Price per *": "Pret per *"}</p>
                            <input type="text" value={pricePer} onChange={e => setPricePer(e.target.value)} />
                        </div>

                       

                        <div className="input input-start input-color">
                            <div className="option">
                                <p>{cookies.language === "en" ? "Highlight Color: " : "Culoare: "}</p>
                                <InputColor initialValue={currWork?.color || "#fff"} onChange={setColor} onClick={() => {
                                    const elem = document.querySelector(".input-color .option > div");
                                    elem.style.left='-50px';
                                }} />
                                
                            </div>
                        </div>

                        <button type="submit"  className="confirm-button" onClick={async () => await createDoctorRequest()}>{cookies.language === "en" ? "Save": "Salveaza"}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default CreateWork;