import { useCookies } from "react-cookie";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import "./Feedback.css";
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleExclamation, faComment, faEllipsis, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";
import { useEffect } from "react";

const Feedback = ({ data }) => {

    const [cookies, setCookie] = useCookies();

    const [applicationOpinion, setApplicationOpinion] = useState("");
    const [feedbackValue, setFeedbackValue] = useState("");
    const [feedbackOptionActive, setFeedbackOptionActive] = useState(0);
    const [activeSending, setActiveSending] = useState(false);
    const [message, setMessage] = useState(false);

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
                applicationMessage: applicationOpinion,
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
            } else console.log(response);

        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (!feedbackValue || !feedbackValue.length) return;
        setActiveSending(true);
    }, [feedbackValue]);

    return (
        <div className="feedback">
            <Navigation page="feedback" />
            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies?.language === "en" ? "Feedback" : "Feedback"}</h2>

                <div className="feedback-container">

                    <div className="question">
                        <h2>{cookies.language === "en" ? "What's your opinion about Zentec application?" : "Ce parere aveti despre aplicatia Zentec?"}</h2>
                        <textarea value={applicationOpinion} onChange={e => setApplicationOpinion(e.target.value)} />
                    </div>

                    <div className="question">
                        <h2>{cookies.language === "en" ? "Choose feedback's category" : "Alegeti categoria de feedback"}</h2>

                        <div className="categories">

                            {feedbackCategories.length && feedbackCategories.map((feedbackCategory, idx) => (
                                <div className={`category ${idx === feedbackOptionActive ? "active" : ""}`} key={idx} onClick={() => setFeedbackOptionActive(idx)}>
                                    <FontAwesomeIcon icon={feedbackCategory.icon} className="category-icon" />
                                    <p>{feedbackCategory.name}</p>
                                </div>
                            ))}
                            
                        </div>
                    </div>

                    <div className="question">
                        <h2>{cookies.language === "en" ? "Tell us what we can improve" : "Spune-ne ce putem imbunatati"}</h2>
                        <textarea 
                            value={feedbackValue} 
                            onChange={e => setFeedbackValue(e.target.value)}
                        />
                    </div>


                    {/* Feedback Message Response */}
                    
                    <div className={`message-response ${message ? "active" : ""}`}>
                        <div className="message-response-content">
                            <div className="row">
                                <h2>{cookies.language === "en" ? "Feedback sent!" : "Feedback-ul a fost trimis!"}</h2>
                                <FontAwesomeIcon icon={faCheck} className="message-response-icon" />
                            </div>

                            <p>{cookies.language === "en" ? "In order to make your experience with Zentec the best it can be, we value your feedback. It's an essential part of shaping the product's development." : "Pentru ca experiența cu Zentec să fie cât mai bună, apreciem feedback-ul dumneavoastră. Este o parte esentială a dezvoltării produsului."}</p>
                            
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => setMessage()}/>
                        </div>
                 
                    </div>

                    <button type="button" className={`send ${activeSending ? "" : "not-send"}`} onClick={async () => activeSending && await sendFeedback()}>
                        <p>{cookies.language === "en" ? "Send" : "Trimite"}</p>
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default Feedback;