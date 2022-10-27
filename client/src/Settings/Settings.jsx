import "./Settings.css";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { ColorSlider } from '@react-spectrum/color';
import { parseColor } from "@react-stately/color";
import { HuePicker } from "react-color";

const Settings = ({ data }) => {
   
    const [cookies, setCookie] = useCookies();

    const initialLanguage = cookies.language;
    const initialThemeSwitch = cookies.theme === "dark";

    const [language, setLanguage] = useState(initialLanguage);
    const [themeSwitch, setThemeSwitch] = useState(initialThemeSwitch);
    const [changes, setChanges] = useState(false);

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
        changeTheme();
        changeLanguage();
        window.location.reload();
    };

    // Bigger font change

    // Turn on / off notifications

    useEffect(() => {
        if (
            themeSwitch !== initialThemeSwitch ||
            language !== initialLanguage
        ) setChanges(true);
    }, [themeSwitch, language]);

    return (
        <div className="settings">
            <Navigation page="settings" />

            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Settings" : "Setari"}</h2>
                <div className="inputs-container">
                    <div className="keys">
                       

                        <div className="row">
                            <p>{cookies.language === "en" ? "Display" : "Afisaj"}</p>
                        </div>

                        <div className="row">
                            <p>{cookies.language === "en" ? "Language" : "Limba"}</p>
                        </div>
                    </div>
                   
                    <div className="values">

                        <div className="row">

                        </div>

                        <div className="row">

                        </div>
                    </div>
                </div>

                {changes && 
                    <button className="changes-btn" onClick={async () => await submitChanges()}>{cookies.language === "en" ? "Submit changes" : "Confirma schimbarile"}</button>
                }
                
            </div>
        </div>
    );
};

export default Settings;