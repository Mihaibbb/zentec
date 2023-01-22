import "./Profile.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useCookies } from "react-cookie";
import { useState } from "react";
import { useEffect } from "react";

const Profile = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const options = cookies.language === "en" ? ["Details", "Services", "Scheduled SMS"] : ["Detalii", "Servicii", "SMS-uri Programate"];
    const optionsTitle = cookies.language === "en" ? ["General", "Doctors' Services"] : ["General", "Servicii Doctori"];
    const [activeOption, setActiveOption] = useState(0);

    const [currentSMS, setCurrentSMS] = useState(JSON.parse(data.organisation.details[0].sms_message));
    const [smsMessages, setSMSMessages] = useState([]);
    const [smsSchedules, setSmsSchedules] = useState([]);
    const [currentSmsMesage, setCurrentSmsMessage] = useState("");
    const [currentSmsSchedule, setCurrentSmsSchedule] = useState();

    useEffect(() => {

    }, []);
   

    const addSMS = () => {
        try {

        } catch (e) {

        }
    };

    const removeSMS = () => {

    };

    return (
        <div className="profile-container">
            <Navigation page="" />
            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Profile" : "Profil"}</h2>

                <div className="options-bar">
                    {options && options.length && options.map((option, idx) => (
                        <div className={`option ${activeOption ? "active" : ""}`} key={idx} onClick={() => setActiveOption(idx)}>
                            <h3>{option}</h3>
                        </div>
                    ))}
                </div>

                <div className="line" />
                
                <div className="details-container">
                    {activeOption === 0 ? (
                        <div className="account-details">

                        </div>
                    ) : activeOption === 1 ? (
                        <div className="services-details">
                        </div>
                    ) : (
                        <div className="sms-details">

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
