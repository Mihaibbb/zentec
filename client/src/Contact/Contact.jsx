import { useState } from "react";
import HeaderHome from "../Components/Header_Home/Header_Home";
import "./Contact.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLocationDot, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faInstagram, faYoutube, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";

const Contact = () => {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [message, setMessage] = useState("");

    const sendEmail = async () => {
        if (!firstName.length || !lastName.length || !email.length || !phoneNumber.length || !message.length) return;
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber,
                message: message
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/contact-form`, options);
            const response = await request.json();
            if (response.success) {
                window.history.replaceState({
                    success: true,
                    message: "Mesajul a fost trimis cu success!"
                }, "");
                window.location.reload();
            } else {
                window.history.replaceState({
                    success: false,
                    message: "A aparut o eroare!"
                }, "");
                window.location.reload();
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="contact-page">
            <HeaderHome activePage="contact" />

            <h2 className="title">Contacteaza-ne</h2>
            <p>Ai intrebari sau curiozitati? Doar scrie-ne un mesaj!</p>
            <div className="contact-container">
                <div className="contact-information">
                    <h2>Informații de contact</h2>
                    <p>Completează formularul, iar echipa noastră va reveni către tine.</p>

                    <div className="elements">
                        <a href="tel:+40734893938">
                            <div className="element">
                                <FontAwesomeIcon className="element-icon" icon={faPhone} />
                                <p>+40 734 893 938</p>
                            </div>
                        </a>
                        <a href="mailto:zentec@zentec.ro">
                            <div className="element">
                                <FontAwesomeIcon className="element-icon" icon={faEnvelope} />
                                <p>zentec@zentec.ro</p>
                            </div>
                        </a>
                        
                        <div className="element">
                            <FontAwesomeIcon className="element-icon" icon={faLocationDot} />
                            <p>Bucuresti, Romania</p>
                        </div>
                    </div>


                    <div className="social-media-container">
                        <div className="social-media-element">
                            <FontAwesomeIcon icon={faYoutube} className="social-media-icon" />
                        </div>
                        <div className="social-media-element">
                            <FontAwesomeIcon icon={faInstagram} className="social-media-icon" />
                        </div>
                        <div className="social-media-element">
                            <FontAwesomeIcon icon={faFacebookF} className="social-media-icon" />
                        </div>
                        <div className="social-media-element">
                            <FontAwesomeIcon icon={faLinkedinIn} className="social-media-icon" />
                        </div>
                    </div>

                    <div className="big-circle" />
                    
                </div>
                <div className="contact-form">
                    <div className="row">
                        <p>Nume</p>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                    </div>

                    <div className="row">
                        <p>Prenume</p>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>

                    <div className="row full-row">
                        <p>Email</p>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="row full-row">
                        <p>Telefon</p>
                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                    </div>

                    <div className="row full-row">
                        <p>Mesaj</p>
                        <textarea  rows="6" value={message} onChange={e => setMessage(e.target.value)} />
                    </div>

                    <button className="one-row" type="button" onClick={async () => await sendEmail()}>
                        <p>Trimite mesajul</p>
                    </button>
                </div>
            </div>
        </div>
    );

};

export default Contact;