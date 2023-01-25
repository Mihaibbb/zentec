import "./Profile.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useCookies } from "react-cookie";
import { useState } from "react";
import { useEffect } from "react";

const Profile = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const options = cookies.language === "en" ? ["Details", "Services", "Scheduled SMS", "Backups"] : ["Detalii", "Servicii", "SMS-uri Programate", "Backup-uri"];
    const optionsTitle = cookies.language === "en" ? ["", "", "", ""] : ["", "", ""];
    const [activeOption, setActiveOption] = useState(0);
    const [sideMenuOption, setSideMenuOption] = useState(0);

    const [currentSMS, setCurrentSMS] = useState(JSON.parse(data.organisation.details[0].sms_message));

    const [currentSmsMessage, setCurrentSmsMessage] = useState("");
    const [currentSmsSchedule, setCurrentSmsSchedule] = useState();

    const [currentServices, setCurrentServices] = useState([]);
    const [serviceName, setServiceName] = useState("");
    const [servicePrice, setServicePrice] = useState("");

    const [currentBackups, setCurrentBackups] = useState([]);

    const [organisationName, setOrganisationName] = useState(data.organisation.details[0].name);
    const [organisationAddress, setOrganisationAddress] = useState(data.organisation.details[0]?.address);
    const [organisationCity, setOrganisationCity] = useState(data.organisation.details[0]?.city);
    const [organisationCounty, setOrganisationCounty] = useState(data.organisation.details[0]?.county);
    const [organisationCountry, setOrganisationCountry] = useState(data.organisation.details[0]?.city);

    useEffect(() => {
        
    }, []);
   

    const addSMS = async () => {

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sms: currentSmsMessage,
                scheduledAt: currentSmsSchedule,
                organisationId: data.organisation._id
            })  
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/add-sms`, options);
            const response = await request.json();
            if (response.success) {

                window.history.replaceState({
                    activeOption: activeOption,
                    sideMenuOption: sideMenuOption,
                    successProfile: true,
                    message: cookies.language === "en" ? "SMS configured successfully!" : "SMS configurat cu succes!"
                }, "");

                window.location.reload();
            }
        } catch (e) {
            console.log(e);
            window.history.replaceState({
                activeOption: activeOption,
                sideMenuOption: sideMenuOption,
                successProfile: false,
                message: cookies.language === "en" ? "An error ocurred!" : "A aparut o eroare!"
            }, "");

            window.location.reload();
        }
    };

    const removeSMS = async (smsId) => {

        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-sms?organisationId=${data.organisation._id}&smsId=${smsId}`, options);
            const response = await request.json();
            if (response.success) {
                window.history.replaceState({
                    activeOption: activeOption,
                    sideMenuOption: sideMenuOption,
                    successProfile: true,
                    message: cookies.language === "en" ? "SMS removed successfully!" : "SMS-ul a fost sters cu succes!"
                }, "");

                window.location.reload();
            }

            console.log("Error!");

        } catch (e) {
            console.log(e);
          

            window.history.replaceState({
                activeOption: activeOption,
                sideMenuOption: sideMenuOption,
                successProfile: false,
                message: cookies.language === "en" ? "An error ocurred!" : "A aparut o eroare!"
            }, "");

            window.location.reload();
            
        }
    };  

    const editSMS = async (smsId) => {
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sms: currentSmsMessage,
                scheduledAt: currentSmsSchedule,
                organisationId: data.organisation._id,
                smsId: smsId
            })  
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-sms`, options);
            const response = await request.json();

            if (response.success) {
                window.history.replaceState({
                    activeOption: activeOption,
                    sideMenuOption: sideMenuOption,
                    successProfile: true,
                    message: cookies.language === "en" ? "SMS edited successfully!" : "SMS-ul a fost modificat cu succes!"
                }, "");

                window.location.reload();
            }
        } catch (e) {
            console.log(e);
            window.history.replaceState({
                activeOption: activeOption,
                sideMenuOption: sideMenuOption,
                successProfile: false,
                message: cookies.language === "en" ? "An error ocurred!" : "A aparut o eroare!"
            }, "");

            window.location.reload();
        }
    };

    const addService = () => {

    };
    
    const removeService = () => {

    };

    const editService = () => {

    };

    const loadBackup = () => {

    };



    return (
        <div className="profile-container">
            <Navigation page="" />
            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Profile" : "Profil"}</h2>

                <div className="options-bar">
                    {options && options.length && options.map((option, idx) => (
                        <div className={`option ${activeOption === idx ? "active" : ""}`} key={idx} onClick={() => setActiveOption(idx)}>
                            <h3>{option}</h3>
                        </div>
                    ))}
                </div>

                <div className="line" />
                
                <div className="details-container">
                    {activeOption === 0 ? (
                        <div className="account-details">
                            <div className="account-container"></div>
                            <div className="account-container"></div>
                            <div className="account-container"></div>
                            <div className="account-container"></div>
                            <div className="account-container"></div>
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
