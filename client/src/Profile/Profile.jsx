import "./Profile.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useCookies } from "react-cookie";
import { useState } from "react";

const Profile = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const options = cookies.language === "en" ? ["Details", "Settings"] : ["Detalii", "Setari"];
    const optionsTitle = cookies.language === "en" ? ["General", "Current settings"] : ["General", "Setarile curente"];
    const [activeOption, setActiveOption] = useState(0);

    return (
        <div className="profile-container">
            <Navigation page="" />
            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Profile" : "Profil"}</h2>

                <div className="options-bar">
                    {options && options.length && options.map((option, idx) => (
                        <div className={`option ${activeOption ? "active" : ""}`}key={idx} onClick={() => setActiveOption(idx)}>
                            <h3>{option}</h3>
                        </div>
                    ))}
                </div>

                <div className="line" />
                
                <div className="details-container">
                    
                </div>

            </div>
        </div>
    );
};

export default Profile;
