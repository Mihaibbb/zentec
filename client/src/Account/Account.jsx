import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import "./Account.css";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const Account = () => {

    const location = useLocation();

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");

    }, [location]);

    return (
        <div className="account">
            <Navigation />
            <div className="content">
                <Header />
            </div>
        </div>
    );
};

export default Account;