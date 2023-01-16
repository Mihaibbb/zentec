import { faAngleDown, faBars, faBell, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import accountImage from "../../imgs/account-image.jpeg";
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = ({ data }) => {

    const navigate = useNavigate();

    console.log(data);
    return (
        <div className="header">
            <div className="searchbar-container">
                <div className="searchbar">
                    
                        <FontAwesomeIcon icon={faSearch}  className="search-icon"/>
                    <input type="text" placeholder="Search here..." />
                </div>
            </div>
         

            <div className="account-details">

                <FontAwesomeIcon icon={faBars} className="navigation-icon" onClick={() => {
                    document.querySelector(".navigation").classList.add("active");
                    document.querySelector('.header').classList.remove("no-navigation");
                    document.querySelector(".content").classList.remove("no-navigation");
                }} />

                <div className="notifications">
                    <FontAwesomeIcon icon={faBell} className="notification-icon" />
                    <div className="notification-signal" />
                </div>
                {/* <div className="account-photo">
                    <FontAwesomeIcon icon={faUser} className="account-icon" />
                </div> */}

                <div className="account-name-container" onClick={() => navigate("/profile")}>
                    <p className="account-name">{data.user.name.split(" ")[0][0].toUpperCase()}{data.user.name.split(" ")[1][0].toUpperCase()}</p>
                </div>

                {/* <FontAwesomeIcon icon={faAngleDown} className="account-info-icon" /> */}
            </div>  
        </div>
    );
};

export default Header;