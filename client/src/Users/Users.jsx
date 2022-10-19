import "../Patients/Patients.css";

import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsis, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react"; 
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Users = ({ data }) => {

    const [doctors, setDoctors] = useState([]);
    const [query, setQuery] = useState("");
    const [cookies, setCookie] = useCookies();
    const navigation = useNavigate();

    const getDoctors = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: data.organisation._id
            })
        };

        const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-doctors`, options);
        const response = await request.json();
        if (!response.success) return;
        setDoctors(response.doctors);
    };     

    useEffect(() => {
        (async () => {
            await getDoctors();
        })();
    }, []);    

    useEffect(() => {
        (async () => {
            if (query === "") {
                await getDoctors();
                return;
            }

            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    searchQuery: query
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-doctor`, options);
            const response = await request.json();
          
            if (await response.success) setDoctors(await response.patients || []);
            else setDoctors([]);
        })();
     
    }, [query]);

    return (
        <div className="patients">
            <Navigation page="doctors" />

            <div className="content">
                <Header data={data} />
                <h2 className="title">{cookies.language === "en" ? "Doctors" : "Doctori"}</h2>

                {doctors && <div className="search-container">
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search patient..." : "Cauta doctor..."} />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>}

                <div className="patients-container">

                    {doctors.length > 0 && <div className="first-row">

                        <div className="column">
                            <p>{cookies.langauge === "en" ? "No.": "Nr."}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Surname" : "Nume"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Name" : "Prenume"}</p>
                        </div>

                        <div className="column">
                            <p>Email</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Phone" : "Telefon"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.langauge === "en" ? "Color" : "Culoare"}</p>
                        </div>

                        <div className="column">
                            <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                        </div>

                    </div>}

                    {doctors.length > 0 ? doctors.map((doctor, idx) => (
                        <div className="row" key={idx}>
                            
                            <div className="column">
                                <p>{doctor.id}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.firstname}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.lastname}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.email}</p>
                            </div>

                            <div className="column">
                                <p>{doctor.phone}</p>
                            </div>

                            <div className="column">
                                <div className="square" style={{ backgroundColor: doctor.color }} />
                            </div>

                            <div className="column">
                                <FontAwesomeIcon className="column-icon" icon={faEllipsis}/>
                            </div>
                        </div>
                    )) : (
                        <div>
                            <h2 className="center">{cookies.language === "en" ? "No doctors found." : "Niciun doctor gasit."}</h2>
                        </div>
                    )}
                </div>

                <div className="add-button" onClick={() => navigation("/create-doctor")}>
                    <FontAwesomeIcon icon={faPlus} className="add-icon"/>
                </div>

             
            </div>
        </div>
    );

};

export default Users; 