import "../Login/Login.css";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CreateOrganisation = () => {

    const [organisationName, setOrganisationName] = useState("");
    const [smsApiKey, setSmsApiKey] = useState("");
    const [smsMessage, setSmsMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [cookies, setCookie] = useCookies();
    const [orgId, setOrgId] = useState();
    const textVariables = ["Nume Organizatie", "Data Programare", "Ora Programare", "Link Confirmare"];
    const navigate = useNavigate();

    const generateId = (length) => {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return result;
    }
    
    const createCurrentOrganisation = async () => {
        if (organisationName.length === 0 || smsApiKey.length === 0 || smsMessage.length === 0) {
            setErrorMessage(cookies.language === "en" ? "Please fill each field." : "Compleateaza fiecare camp.");
            return;
        } else if (organisationName.length < 4) {
            setErrorMessage(cookies.language === "en" ? "The Organisation name must be 4 characters at least." : "Numele de organizatie trebuie sa aiba minim 4 caractere.");
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                name: organisationName,
                adminId: cookies['user-id'],
                orgId,
                apiKey: smsApiKey,
                smsMessage
            })
        };

        const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/organisation/create`, options);
        const response = await request.json();
        if (await response.success) navigate("/dashboard", { state: { message: await response.message, success: true } });
        else setErrorMessage(cookies.language === "en" ? "An error occured!" : "A aparut o eroare!");
    };

    useEffect(() => {
        setOrgId(generateId(25));
    }, []);

    const addVariable = (textVariable) => {
        const text = textVariable.replaceAll(" ", "_");
        setSmsMessage(currMessage => `${currMessage} ${text.toUpperCase()}`);
    };

    return orgId && (
        <div className="center-container">
            <div className="image"></div>
            <div className="login-container">
                <h2 className="title">{cookies.language === "en" ? "Create Organisation" : "Creeaza o organizatie"}</h2>
                <h3>Organisation's id: {orgId}</h3>
                <div className="login-inputs">
                    <div className="input">
                        <p>{cookies.language === "en" ? "Organisation Name" : "Numele organizatiei"}</p>
                        <input type="text" placeholder={cookies.language === "en" ? "Organisation Name" : "Numele organizatiei"} value={organisationName} onChange={e => setOrganisationName(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>{cookies.language === "en" ? "SMS API Key" : "SMS Cheie API"}</p>
                        <input type="text" placeholder={cookies.language === "en" ? "Key" : "Cheie"} value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} />
                    </div>

                    <div className="input">
                        <p>{cookies.language === "en" ? "SMS General Message" : "SMS Mesaj General"}</p>
                        <textarea value={smsMessage} onChange={e => setSmsMessage(e.target.value)} />
                        <div className="text-variables">
                            <p>{cookies.language === "en" ? "Text variables:" : "Variabile Text:"}</p>
                            <div className="list">
                                {textVariables.map((textVariable, idx) => (
                                    <div className="item" key={idx} onClick={() => addVariable(textVariable)}>
                                        <p className="item-text">{textVariable}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button type="text" onClick={async () => await createCurrentOrganisation()}>
                        <p>{cookies.language === "en" ? "Create Organisation" : "Creeaza organizatia"}</p>
                    </button>

                    <p className="error-text">
                        {errorMessage}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateOrganisation;