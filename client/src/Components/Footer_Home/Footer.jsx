import { useCookies } from "react-cookie";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faLocationDot, faMapPin, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import logo from "../../imgs/ZenLogo_black.svg";

const Footer = () => {

    const [cookies, setCookie] = useCookies();


    return (
        <footer>

            <div className="footer-container">
                <div className="logo">
                    <img src={logo} className="logo-img" width={75} />
                    <h2>enTec</h2>
                </div>
                <div className="footer-content">
                    <p className="text">
                        {cookies.language === "en" ? "Zentec has been developing since 2022. Our goal is to offer software to medical offices, easy to use, accessible to everyone, as well as very useful, simplifying the business." : "Zentec se dezvolta din anul 2022. Scopul nostru este de a oferi un software cabinetelor medicale, usor de utilizat, aceesibil pentru toata lumea, cat si foarte util, simplificand afacerea."}
                    </p>
                    <div className="social-media"></div>
                </div>
     
            </div>

            {/* <div className="footer-container">
                <h2>{cookies.langauge === "en" ? "Fast links" : "Pagini"}</h2>
                <div className="footer-content">
                    <p>{cookies.langauge === "en" ? "Home" : "Acasa"}</p>
                    <p>{cookies.language === "en" ? "About us" : "Despre noi"}</p>
                    <p>{cookies.language === "en" ? "Support" : "Suport"}</p>
                    <p>{cookies.language === "en" ? "Contact" : "Contact"}</p>
                </div>
            </div> */}

            <div className="footer-container">
                <h2>CONTACT</h2>
                <div className="footer-content">
                    {/* <div className="footer-element">
                        <FontAwesomeIcon icon={faBuilding} className="footer-icon" />
                        <p>Barbu Zentec I.F.</p>
                    </div> */}

                    <div className="footer-element">
                        <FontAwesomeIcon icon={faMapPin} className="footer-icon" />
                        <p>{cookies.language === "en" ? "Bucharest, Romania" : "Bucuresti, Romania"}</p>
                    </div>

                    <div className="footer-element">
                        <a href="mailto:zentec@zentec.ro" target="_blank">
                            <FontAwesomeIcon icon={faEnvelope}  className="footer-icon"/>
                            <p>zentec@zentec.ro</p>
                        </a>
                       
                    </div>

                    <div className="footer-element">
                        <FontAwesomeIcon icon={faPhone} className="footer-icon" />
                        <p> <a href="tel:+40760331658">+40 760 331 658</a> / <a href="tel:+40734893938">+40 734 893 938</a></p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;