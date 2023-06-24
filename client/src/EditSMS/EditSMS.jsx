import { useCookies } from "react-cookie";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
// import "./Feedback.css";
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck, faCircleExclamation, faClock, faComment, faEllipsis, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditSMS = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigation = useNavigate();

    const [applicationOpinion, setApplicationOpinion] = useState("");
    const [feedbackValue, setFeedbackValue] = useState("");
    const [feedbackOptionActive, setFeedbackOptionActive] = useState(0);
    const [activeSending, setActiveSending] = useState(false);
    const [message, setMessage] = useState(false);
    const location = useLocation();
    const params = useParams();
    const id = params?.id;
    if (!id) navigation(-1);
    const textVariables = [`"Nume Organizatie"`, "Data Programare", "Ora Programare", "Link Confirmare"];

    const sms = JSON.parse(data.organisation.details[0].sms_message)[Number(id)];
    const [smsMessage, setSmsMessage] = useState(sms.message);
    const [smsScheduled, setSmsScheduled] = useState(sms.scheduledAt);
    const scheduledAt = sms.scheduledAt;
    const smsOptions = cookies?.language === "en" ? ["At the moment of creating the appointment", " hours before the appointment"] : ["In momentul crearii programarii", " ore inaintea programarii"];

    const [activeOption, setActiveOption] = useState(smsScheduled === "now" ? 0 : 1);
    

    const feedbackCategories = [
        {
            type: 'bug',
            name: cookies.language === "en" ? "Bug report" : "Raporteaza problema",
            icon: faCircleExclamation
        },

        {
            type: 'sugestion',
            name: cookies.language === "en" ? "Sugestions" : "Sugestii",
            icon: faComment
        },

        {
            type: 'appreciation',
            name: cookies.language === "en" ? "Appreciations" : "Aprecieri",
            icon: faFaceSmile
        },

        {
            type: 'other',
            name: cookies.language === "en" ? "Something else" : "Altele",
            icon: faEllipsis
        }
    ];

    const sendFeedback = async () => {
        if (!feedbackValue || !feedbackValue.length) return;
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                applicationMessage: applicationOpinion || "",
                feedbackMessage: feedbackValue,
                type: feedbackCategories[feedbackOptionActive].type,
                from: data.user.name 
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/send-feedback`, options);
            const response = await request.json();
            if (response.success) {
                setMessage(true);
                setApplicationOpinion("");
                setFeedbackValue("");
                setFeedbackOptionActive(0);
                setActiveSending(false);
                window.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: 'smooth'
                });
            } else console.log(response);

        } catch (e) {
            console.log(e);
        }
    };

    const saveChanges = async () => {

        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                smsId: Number(id),
                scheduledAt: activeOption === 1 ? smsScheduled : "now",
                sms: smsMessage
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-sms`, options);
            const response = await request.json();
            if (response.success) {
                window.history.replaceState({
                    activeOption: 2,
                    sideMenuOption: true,
                    successProfile: true,
                    message: cookies.language === "en" ? "SMS edited successfully!" : "SMS-ul a fost editat cu succes!"
                }, "");

                window.location.replace(`/profile`);
            }
        } catch (e) {   
            console.log(e);
        }
    };

    useEffect(() => {
        if (!feedbackValue || !feedbackValue.length) return setActiveSending(false);
        setActiveSending(true);
    }, [feedbackValue]);

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);


    const addVariable = (textVariable) => {
        const text = textVariable.replaceAll(" ", "_");
        setSmsMessage(currMessage => `${currMessage} ${text.toUpperCase()}`);
    };


    return (
        <div className="feedback">
            <Navigation page="feedback" />
            <div className="content">
                <Header data={data} />

                <div className="go-back" onClick={() => navigation(-1)}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>

                <h2 className="title">{cookies?.language === "en" ? "Edit SMS" : "Editeaza SMS"}</h2>

                <div className="feedback-container">

                    {/* <div className="question">
                        <h2>{cookies.language === "en" ? "What's your opinion about Zentec application?" : "Ce parere aveti despre aplicatia Zentec?"}</h2>
                        <textarea value={applicationOpinion} onChange={e => setApplicationOpinion(e.target.value)} />
                    </div> */}

                    <h2><FontAwesomeIcon icon={faClock} className="schedule-icon" /> {cookies?.language === 'en' ? `Scheduled: ${scheduledAt === "now" ? "when creating appointment" : `${scheduledAt} hours before appointment`}` : `Programat: ${scheduledAt === "now" ? "cand s-a adaugat programarea" : `${scheduledAt}${Number(scheduledAt) >= 20 ? " de" : ""} ore inaintea programarii`}`}</h2>

                        <div className="patient-account-details form">
                        <div className="inputs-container">

                            <div className="input">
                                <div className="input-title">
                                    <p>{cookies.language === "en" ? "SMS will be sent: " : "SMS-ul va fi trimis: "}</p>

                                  
                                </div>

                                <div className="options column">
                                        {smsOptions.map((option, idx) => (
                                            <div className={`option ${idx === activeOption ? "active" : ""}`} key={idx}>
                                                
                                                <div className="circle" onClick={() => {
                                                    setActiveOption(idx);
                                                }}>
                                                    <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                                </div>
                                                {idx === 1 ? <input type="number" value={smsScheduled} min={1} onChange={(e) => setSmsScheduled(e.target.value)} disabled={activeOption !== 1} /> : null}
                                                <p className="patient-gender">{option}</p>
                                            </div>
                                        ))}
                                    </div>
                            </div>
                            </div>
                        </div>
                   
                       
                    <div className="input">
                        <div className="question">
                            <h2>{cookies.language === "en" ? "SMS Message" : "Mesaj SMS"}</h2>
                            <textarea 
                                value={smsMessage} 
                                onChange={e => setSmsMessage(e.target.value)}
                            />
                        </div>
                        <div className="text-variables">
                            <p>{cookies.language === "en" ? "Text variables:" : "Variabile Text:"}</p>
                            <div className="list">
                                {textVariables.map((textVariable, idx) => (
                                    <div className="item" key={idx} onClick={() => addVariable(textVariable)}>
                                        <p className="item-text">{textVariable}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  

                    
                    {/* Feedback Message Response */}
                    
                    {/* <div className={`message-response ${message ? "active" : ""}`}>
                        <div className="message-response-content">
                            <div className="row">
                                <h2>{cookies.language === "en" ? "Feedback sent!" : "Feedback-ul a fost trimis!"}</h2>
                                <FontAwesomeIcon icon={faCheck} className="message-response-icon" />
                            </div>

                            <p>{cookies.language === "en" ? "In order to make your experience with Zentec the best it can be, we value your feedback. It's an essential part of shaping the product's development." : "Pentru ca experiența cu Zentec să fie cât mai bună, apreciem feedback-ul dumneavoastră. Este o parte esentială a dezvoltării produsului."}</p>
                            
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => setMessage()}/>
                        </div>
                 
                    </div> */}

                    <button type="button" className={`send feedback-button`} onClick={async () => await saveChanges()}>
                        <p>{cookies.language === "en" ? "Send" : "Trimite"}</p>
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default EditSMS;