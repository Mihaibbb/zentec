import { faAngleDown, faBars, faBell, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Header.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useCookies } from 'react-cookie';

const Header = ({ data }) => {

    const navigate = useNavigate();
    const headerRef = useRef();
    const location = useLocation();
    const [cookies, setCookie] = useCookies();

    const [theme, setTheme] = useState(cookies?.theme);

    useEffect(() => {
        console.log(theme);
        setCookie('theme', theme, "/");
    }, [theme]);

    useEffect(() => {
        if (cookies?.theme === 'light') {

            document.documentElement.style.setProperty("--background", "#f7f7f7");
            document.documentElement.style.setProperty("--contrast-color", "#4659ff");
            document.documentElement.style.setProperty("--contrast-color-2", "#579AFF");
            document.documentElement.style.setProperty("--contrast-color-3", "#FF447C");
            document.documentElement.style.setProperty("--background-color", "#f5f5f5");
            document.documentElement.style.setProperty("--background-contrast", "#e5e5e5");
            document.documentElement.style.setProperty("--dark-color", "#666");
            document.documentElement.style.setProperty("--light-color", "#fff");
            document.documentElement.style.setProperty("--text-color", "#222");
            document.documentElement.style.setProperty("--text-color-2", "#000");
            document.documentElement.style.setProperty("--text-color-3", "#666");
            document.documentElement.style.setProperty("--text-color-4", "#999");
            document.documentElement.style.setProperty("--selector-color", "rgba(34, 184, 207, 0.5)");
            document.documentElement.style.setProperty("--over-color", "rgba(255, 255, 255, .2)");
            document.documentElement.style.setProperty("--over-color-2", "rgba(255, 255, 255, .6)");
            document.documentElement.style.setProperty("--over-difference-color", "rgba(0, 0, 0, .2)");
            document.documentElement.style.setProperty("--over-difference-color-2", "rgba(0, 0, 0, .075)");
            document.documentElement.style.setProperty("--over-difference-color-3", "rgba(125, 125, 255, .18)");
            document.documentElement.style.setProperty("--error-color", "crimson");
            document.documentElement.style.setProperty("--success-color", "#589858");
            document.documentElement.style.setProperty("--selected-color", "rgba(96, 61, 128, .973)");
            document.body.classList.add("light");
        } else {
            document.documentElement.style.setProperty("--background", "#080f23");
            document.documentElement.style.setProperty("--contrast-color", "#8146ff");
            document.documentElement.style.setProperty("--contrast-color-highlight", "#6f36e9");
            document.documentElement.style.setProperty("--contrast-color-2", "#579AFF");
            document.documentElement.style.setProperty("--contrast-color-3", "#FF447C");
            document.documentElement.style.setProperty("--background-color", "#192846");
            document.documentElement.style.setProperty("--background-contrast", "rgba(0, 0, 0, .6)");
            document.documentElement.style.setProperty("--dark-color", "#000");
            document.documentElement.style.setProperty("--light-color", "#fff");
            document.documentElement.style.setProperty("--text-color", "rgba(255, 255, 255, .8)");
            document.documentElement.style.setProperty("--text-color-2", "#fff");
            document.documentElement.style.setProperty("--text-color-3", "rgba(255, 255, 255, .6)");
            document.documentElement.style.setProperty("--text-color-4", "rgba(255, 255, 255, .5)");
            document.documentElement.style.setProperty("--selector-color", "rgba(10, 110, 114, 0.5)");
            document.documentElement.style.setProperty("--over-color", "rgba(0, 0, 0, .2)");
            document.documentElement.style.setProperty("--over-color-2", "rgba(0, 0, 0, .6)");
            document.documentElement.style.setProperty("--over-difference-color", "rgba(255, 255, 255, .2)");
            document.documentElement.style.setProperty("--over-difference-color-2", "rgba(255, 255, 255, .075)");
            document.documentElement.style.setProperty("--over-difference-color-3", "rgba(125, 125, 255, .18)");
            document.documentElement.style.setProperty("--error-color", "crimson");
            document.documentElement.style.setProperty("--success-color", "#589858");
            document.documentElement.style.setProperty("--selected-color", "rgba(95, 61, 128, 0.973)");
            document.body.classList.remove("light");
        }
    }, [cookies]);
    
    useEffect(() => {
        if (!headerRef?.current) return;

        if (window.scrollY > 0) headerRef?.current?.classList?.add("scrolled");
        else headerRef?.current?.classList?.remove("scrolled");

        window.addEventListener("scroll", () => {
            if (window.scrollY > 0) headerRef?.current?.classList?.add("scrolled");
            else headerRef?.current?.classList?.remove("scrolled");
        });
    }, [headerRef?.current, location]);

    return (
        <div className="header" ref={headerRef}>
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

                <div className="theme" onClick={() => setTheme(currTheme => currTheme === 'dark' ? 'light' : 'dark')}>
                    <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} style={ theme === 'light' ? { color: '#e0844f' } : {}} className="theme-icon" />
                </div>

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