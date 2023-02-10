import './Navigation.css';
import logo from "../../imgs/logo_zentec3.svg";
import logoBlack from "../../imgs/logo_zentec3_black.svg";
import dashboardIcon from "../../imgs/icons/dashboard-icon.svg";
import dashboardIconBlack from "../../imgs/icons/dashboard-icon_black.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faBedPulse, faCalendarDays, faClose, faCoffee, faDashboard, faHandHoldingDollar, faHeart, faUserDoctor } from "@fortawesome/free-solid-svg-icons"
import settingsIcon from "../../imgs/icons/settings-icon.svg";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';
import patientIcon from "../../imgs/icons/patient.svg";
import patientIconBlack from "../../imgs/icons/patient_black.svg";
import patientIconActive from "../../imgs/icons/patientIconActive.svg";

import { useState, useRef, useEffect } from 'react';

const Navigation = ({ show, page }) => {

    const navigation = useNavigate();
    const [cookies, setCookie] = useCookies();
    const [closed, setClosed] = useState(false);
    const [doctorsSubmenuActive, setDoctorsSubmenuActive] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme);

    const navigationElement = useRef();
    const settingsRef = useRef();

    useEffect(() => {
        if (!settingsRef?.current) return;
        settingsRef.current.style.marginBottom = `${settingsRef.current.clientHeight}px`;
    }, [settingsRef]);

    useEffect(() => {
        setTheme(cookies?.theme);
    }, [document.cookie]);

    return (
        <div className="navigation active" ref={navigationElement}>
           
            <FontAwesomeIcon icon={faClose} className="close-icon" onClick={e => {
                
                navigationElement.current.classList.remove("active");
                document.querySelector(".header").classList.add("no-navigation");
                document.querySelector(".content").classList.add("no-navigation");
            }} />

            <div className="logo">
                <img src={theme === "light" ? logoBlack : logo} className="logo-img" />
            </div>

            <div className={`item ${page === "dashboard" ? "active" : ""}`} onClick={() => navigation("/dashboard")}>
                <img src={theme === "light" && page !== "dashboard" ? dashboardIconBlack : dashboardIcon} className="item-img" />
                <h3>{cookies.language === "en" ? "Dashboard" : "Panou de control"}</h3>
            </div>

            <div className={`item ${page === "appointments" ? "active" : ""}`} onClick={() => page === "appointments" ? window.scrollTo({ left: 0, top: 0, behavior: 'smooth' }) : navigation("/appointments")}>
                <FontAwesomeIcon icon={faCalendarDays} className="item-icon"/>
                <h3>{cookies.language === "en" ? "Appointments" : "Programari"}</h3>
            </div>

            <div className={`item ${page === "doctors" ? "active" : ""}`} onClick={() => navigation("/doctors")}>
                <FontAwesomeIcon icon={faUserDoctor} className="item-icon" />
                <h3>{cookies.language === "en" ? "Doctors" : "Medici"}</h3>
                <FontAwesomeIcon icon={faAngleDown} className={`submenu-icon ${faAngleDown}`} onClick={() => setDoctorsSubmenuActive(curr => !curr)} />
            </div>

            <div className={`sub-list ${doctorsSubmenuActive || page === "doctors-schedule" || page === "doctors" ? "active" : ""}`}>
                <div className={`item ${page === "doctors-schedule" ? "highlight" : ""}`} onClick={() => navigation("/doctors-schedule")}>
                    <div className="dot" />
                    <p>{cookies.language === "en" ? "Doctors Schedule" : "Program Doctori"}</p>
                </div>
            </div>

            <div className={`item ${page === "patients" ? "active" : ""}`} onClick={() => navigation("/patients")}>
                {/* <FontAwesomeIcon icon={faBedPulse} className="item-icon" /> */}
                <img src={page === "patients" ? patientIconActive : theme === "light" ? patientIconBlack : patientIcon} className="patient-icon" />
                <h3>{cookies.language === "en" ? "Patients" : "Pacienti"}</h3>
            </div>

            <div className={`item ${page === "income" ? "active" : ""}`} onClick={() => navigation("/income")}>
                <FontAwesomeIcon icon={faHandHoldingDollar} className="item-icon" />
                <h3>{cookies.language === "en" ? "Analytics" : "Vanzari"}</h3>
            </div>

            <div className={`item ${page === "feedback" ? "active" : ""} bottom`} onClick={() => navigation("/feedback")} ref={settingsRef}>
                <FontAwesomeIcon icon={faHeart} className="item-icon" />
                <h3>{cookies.language === "en" ? "Feedback" : "Feedback"}</h3>
            </div>
        </div>
    );
};

export default Navigation;