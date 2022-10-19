import { useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import "./CreateDoctor.css";
import { useCookies } from "react-cookie";

const CreateDoctor = ({ data }) => {

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState();
    const [color, setColor] = useState();
    const [multipleSchedules, setMultipleSchedules] = useState(false);
    const [activeDoctor, setActiveDoctor] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [cookies, setCookie] = useCookies();

    const createDoctorRequest = async () => {

        if (firstname.length < 3 || lastname.length < 3 || !color || !phone || email.length < 3) {
            setErrorMessage(cookies.language === "en" ? "Fill each field!" : "Completeaza toate campurile!");
            return;
        } 

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id,
                firstname,
                lastname,
                email,
                phone,
                color: color.hex,
                activeDoctor,
                multipleSchedules
            })
        };

        try {
            const request = await fetch(``, options);

        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    };

    return (
        <div className="create-doctor">
            <Navigation page="doctors" />
            <div className="content">
                <Header data={data} />

                <div className="doctor-inputs">
                    
                </div>
            </div>
        </div>
    );
};

export default CreateDoctor;