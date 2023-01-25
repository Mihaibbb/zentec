import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./DoctorsFilter.css";

const DoctorsFilter = ({ data, changeValue, initialValue, scrollToDoctor=null }) => {

    const [activeDoctors, setActiveDoctors] = useState(initialValue || data.organisation.doctors);
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

    window.addEventListener('click', async e => {
        if (doctorsList.length === 0) return;
        const selectionInput = document.querySelector("input.selection-input");
        let target = e.target, sameParent = false;
        while (target?.parentElement && !target?.classList.contains('content') && !sameParent) {
            if (target === document.querySelector(".doctors-filter .filter-container")) sameParent = true;
            target = target?.parentElement;
        }
    
        if (e.target === selectionInput) e.preventDefault();
        else if (!sameParent) {
            setDoctorsList([]);
            setTriggerDoctorInput(currStatus => !currStatus);
        } 

    });
    
    return (
        <div className="doctors-filter">
            <h3 className="element-title">{cookies.language === "en" ? "Doctors" : "Medici"}</h3>
                <div className="filter-container">
                    {activeDoctors && activeDoctors.length > 0 && activeDoctors.map((activeDoctor, idx) => (
                        <div className="filter-doctor" key={idx} onClick={e => e.target.tagName.toLowerCase() !== "svg" && e.target.tagName.toLowerCase() !== "path"  && scrollToDoctor && scrollToDoctor(activeDoctor._id)}>
                            <div className="color" style={{ backgroundColor: activeDoctor.color }}/>
                            <p>{activeDoctor.firstname} {activeDoctor.lastname}</p>
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => removeActiveDoctor(activeDoctor._id)} />
                        </div>
                    ))}

                    <input 
                        type="text"
                        value={doctorQuery}
                        onFocus={async () => doctorQuery.length > 0 ? setDoctorsList(await searchDoctor(doctorQuery)) : setDoctorsList(data.organisation.doctors)}
                        onClick={async () => {
                            const currDoctors =  await searchDoctor(doctorQuery);
                            triggerDoctorInput ? setDoctorsList([]) : (doctorQuery.length > 0 ? setDoctorsList(currDoctors) : setDoctorsList(data.organisation.doctors));
                            setTriggerDoctorInput(currStatus => !currStatus);
                        }}
                        className="selection-input"
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