import "./Settings.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import InputColor from "react-input-color";
import { ColorSlider } from '@react-spectrum/color';
import { parseColor } from "@react-stately/color";
import { HuePicker } from "react-color";

const Settings = ({ data }) => {
    console.log(data);
    const [cookies, setCookie] = useCookies();

    const doctor = data.doctors.find(currDoctor => currDoctor.userId === cookies['user-id']);
    const type = doctor.type;
    const initialLanguage = cookies.language;
    const initialThemeSwitch = cookies.theme === "dark";
    const initialDoctorColor = doctor.color;

    const [language, setLanguage] = useState(initialLanguage);
    const [themeSwitch, setThemeSwitch] = useState(initialThemeSwitch);
   
    const [doctorColor, setDoctorColor] = useState(initialDoctorColor);
    const [changes, setChanges] = useState(false);


    const changeDoctorColor = async () => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                color: doctorColor,
                userId: cookies['user-id'],
                organisationId: data.organisation._id
            })
        };

        const request = await fetch(`${process.env.REACT_APP_BACKGROUND_URL}/api/user/change-color`, options);
        const response = await request.json();
        if (!await response.success) return;
    }

    const changeTheme = () => {
        if (!themeSwitch) 
            setCookie("theme", "light");
        else 
            setCookie("theme", "dark");
    };

    const changeLanguage = () => {
        setCookie("language", language.toLowerCase());
    };

    const submitChanges = async () => {
        if (!changes) return;
        if (type.toLowerCase() === "doctor") await changeDoctorColor();
        changeTheme();
        changeLanguage();
        window.location.reload();
    };

    // Bigger font change

    // Turn on / off notifications

    useEffect(() => {
        if (
            doctorColor !== initialDoctorColor ||
            themeSwitch !== initialThemeSwitch ||
            language !== initialLanguage
        ) setChanges(true);
    }, [doctorColor, themeSwitch, language]);

    return (
        <div className="settings">
            <Navigation page="settings" />

            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Settings" : "Setari"}</h2>
                <div className="inputs-container">
                    <div className="keys">
                        {type.toLowerCase() === "doctor" && 
                            <div className="row">
                                <p>{cookies.language === "en" ? "Color" : "Culoare"}</p>
                            </div>
                        }

                        <div className="row">
                            <p>{cookies.language === "en" ? "Display" : "Afisaj"}</p>
                        </div>

                        <div className="row">
                            <p>{cookies.language === "en" ? "Language" : "Limba"}</p>
                        </div>
                    </div>
                   
                    <div className="values">
                        {type.toLowerCase() === "doctor" && <div className="row">
                            <div className="circle" style={{ background: doctorColor }} />
                            <HuePicker color={doctorColor} onChange={(e) => setDoctorColor(e.hex)} />
                        </div>}

                        <div className="row">

                        </div>

                        <div className="row"></div>
                    </div>
                </div>

                {changes && 
                    <button className="changes-btn">{cookies.language === "en" ? "Submit changes" : "Confirma schimbarile"}</button>
                }
                
            </div>
        </div>
    );
};

export default Settings;