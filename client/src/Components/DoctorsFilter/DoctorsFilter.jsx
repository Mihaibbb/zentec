import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./DoctorsFilter.css";

const DoctorsFilter = ({ data, changeValue }) => {

    const [activeDoctors, setActiveDoctors] = useState(data.organisation.doctors);
    const [doctorsList, setDoctorsList] = useState([]);
    const [triggerDoctorInput, setTriggerDoctorInput] = useState(false);
    const [doctorQuery, setDoctorQuery] = useState("");
    const [cookies, setCookie] = useCookies();

    const searchDoctor = async (doctorQuery) => {
        if (doctorQuery === "") return;
        try {
            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    searchQuery: doctorQuery
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-doctor`, options);
            const response = await request.json();

            if (await response.success) setDoctorsList(await response.doctors);
            
        } catch (e) {
            console.log(e);
        }
    };

    const removeActiveDoctor = (doctorId) => {
        if (activeDoctors.length === 1) return;
        setActiveDoctors(currActiveDoctors => {
            return currActiveDoctors.filter(currDoctor => currDoctor._id !== doctorId);
        });
        setDoctorQuery("");
        setDoctorsList([]);
    };

    const addActiveDoctor = (doctor) => {
        setActiveDoctors(currActiveDoctors => [...currActiveDoctors, doctor]);
        setDoctorsList([]);
        setDoctorQuery("");
    }

    const isActiveDoctor = (doctor, currDoctorsList) => {
        return currDoctorsList.some(currDoctor => currDoctor._id === doctor._id);
    };
    
    useEffect(() => {
        changeValue(activeDoctors);
    }, [activeDoctors]);

    useEffect(() => {
        (async () => {
            await searchDoctor(doctorQuery);
        })();
    }, [doctorQuery]);
    
    return (
        <div className="doctors-filter">
            <h3 className="element-title">{cookies.language === "en" ? "Doctors" : "Medici"}</h3>
                <div className="filter-container">
                    {activeDoctors && activeDoctors.length > 0 && activeDoctors.map((activeDoctor, idx) => (
                        <div className="filter-doctor" key={idx}>
                            <div className="color" style={{ backgroundColor: activeDoctor.color }}/>
                            <p>{activeDoctor.firstname} {activeDoctor.lastname}</p>
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => removeActiveDoctor(activeDoctor._id)} />
                        </div>
                    ))}

                    <input 
                        type="text"
                        value={doctorQuery}
                        onFocus={() => setDoctorsList(data.organisation.doctors)}
                        onClick={() => {
                            triggerDoctorInput ? setDoctorsList([]) : setDoctorsList(data.organisation.doctors);
                            setTriggerDoctorInput(currStatus => !currStatus);
                        }}
                        onChange={e => setDoctorQuery(e.target.value)} 
                        placeholder={cookies.language === "en" ? "Search for a doctor..." : "Cauta un doctor..."}
                    />
                    
                </div>

                {doctorsList && doctorsList.length > 0 && <div className="list-of-doctors">
                    { doctorsList.map((doctor, idx) => (
                        <div className={`doctor ${isActiveDoctor(doctor, activeDoctors) ? "active" : ""}`} key={idx} onClick={() => !isActiveDoctor(doctor, activeDoctors) ? addActiveDoctor(doctor) : removeActiveDoctor(doctor._id)}>
                            <div className="doctor-color" style={{ backgroundColor: doctor.color }}/>
                            <p>{doctor.firstname} {doctor.lastname}</p>
                        </div>
                    ))}
                </div>}
        </div>
    );

};

export default DoctorsFilter;