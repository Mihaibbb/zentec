import { useState, useEffect, useRef } from "react";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import "./EditTreatmentCategory.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import tickAnimation from "../imgs/green-tick.mp4";
import tickAnimationWhite from "../imgs/green-tick-light-theme.mp4";
import InputColor from "react-input-color";

const EditTreatmentCategory = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const location = useLocation();
    const category = location?.state?.category;
    const navigate = useNavigate();
    const { id } = useParams();

    const [categoryName, setCategoryName] = useState(category?.name || "");
    const [color, setColor] = useState(category?.color || {});

    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "dark");
    
    const noVideoContentRef = useRef();

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    useEffect(() => {
        setTheme(cookies?.theme || "dark");
    }, [cookies]);

    const editTreatmentCategoryRequest  = async () => {

        if (!categoryName.length || !color?.hex) {
            setErrorMessage(cookies.language === "en" ? "Fill each required field!" : "Completeaza toate campurile obligatorii!");
            return;
        } 

        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                name: categoryName,
                color: color?.hex,
                language: cookies?.language || "ro",
                id: id
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-treatment-category`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setAssistantAdded(true), 300);
            } else console.log(errorMessage);
        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    };

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        navigate("/profile", { state: { refresh: true, activeOption: 6 } });
    };

    useEffect(() => {
        if (!Object.keys(color)?.length) return;
        const elem = document?.querySelector(".input-color .option > div");
        const notDisplayableDiv =  document.querySelector(".input-color .option > div div:last-child > div:last-child")?.lastChild;
        if (!elem || !notDisplayableDiv) return;

        elem.style.left='-50px';
        console.log(notDisplayableDiv);
        notDisplayableDiv.style.display = 'none';
    }, [color]);

    return (
        <div className="create-doctor">
            <Navigation page="sterilizations" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <div className="video-content" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <video
                            src={theme === "light" ? tickAnimationWhite : tickAnimation}
                            controls={false}
                            autoPlay
                            playsInline
                            onEnded={animationFinished}

                            muted
                            style={{ height: "40vh" }}
                        
                        />
                        <h2 className="title title-video-content" style={{ margin: 0 }}>{cookies.language === "en" ? "Modifications saved successfully!" : "Modificarile au fost salvate cu succes!"}</h2>
                    </div>
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Add Treatment Categoru" : "Adauga Categorie Tratament"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Name *" : "Nume *"}</p>
                            <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} />
                        </div>

                        <div className="input input-start input-color">
                            <div className="option treatment-category">
                                <p>{cookies.language === "en" ? "Highlight Color *" : "Culoare *"}</p>
                                <InputColor initialValue={cookies?.theme === "light" ? "#000" : "#fff"} onChange={setColor} />
                                
                            </div>
                        </div>


                        <button type="submit"  className="confirm-button" onClick={async () => await editTreatmentCategoryRequest()}>{cookies.language === "en" ? "Save": "Salveaza"}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default EditTreatmentCategory;