import { faAngleLeft, faAngleRight, faEdit, faPencil, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import "./DoctorSchedule.css";

const DoctorSchedule = ({ data }) => {
    
    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();

    const [date, setDate] = useState(new Date());
    const [days, setDays] = useState([new Date()]);
    const [filterActiveIdx, setFilterActiveIdx] = useState(0);
    const [doctors, setDoctors] = useState(data.organisation.doctors || []);
    const [activeDoctors, setActiveDoctors] = useState(doctors);
    const [totalSchedules, setTotalSchedules] = useState([]);
    const [doctorQuery, setDoctorQuery] = useState("");
    const [doctorsList, setDoctorsList] = useState([]);
    
    const filters = cookies.language === "en" ? ["Working Week", "Week", "Month"] : ["Saptamana Lucratoare", "Saptamana", "Luna"];
    const months = cookies.language === "en" ? 
    ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] :
    ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    
    const weekDays = cookies.language === "en" ? 
    ["Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat.", "Sun."] :
    ["Lun.", "Mar.", "Mie.", "Joi", "Vin.", "Sam.", "Dum."];

    const workingWeekDays = cookies.language === "en" ? 
    ["Mon.", "Tue.", "Wed.", "Thu.", "Fri."] :
    ["Lun.", "Mar.", "Mie.", "Joi", "Vin."];

    useEffect(() => {
        setTotalSchedules(doctors.map(doctor => JSON.parse(doctor.schedules)));
    }, []);

    useEffect(() => {

        if (filterActiveIdx === 0) setDays(getWorkingWeek(date));
        else if (filterActiveIdx === 1) setDays(getWeek(date));
        else setDays(getMonth(date));

    }, [filterActiveIdx, date]);

    useEffect(() => {
        (async () => {
            await getSearchedDoctors();
        })();
    }, [doctorQuery]);

    const getSearchedDoctors = async () => {
        if (!doctorQuery || doctorQuery?.length === 0) {
            setDoctorsList([]);
            return;
        }

        try {
            const options = {
                method: "POST",
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
            else setDoctorsList([]);
            
        } catch (e) {
            console.log(e);
        }
    };

    const getWorkingWeek = (currDate) => {
        if (currDate.getDay() === 6) currDate = new Date(currDate.getTime() - 24 * 60 * 60 * 1000);
        if (currDate.getDay() === 0) currDate = new Date(currDate.getTime() + 24 * 60 * 60 * 1000);

        let dayIdx = currDate.getDay();
        const currWeek = [];
        currWeek.push(currDate);

        while (dayIdx < 5) {
            currDate = new Date(currDate.getTime() + 24 * 60 * 60 * 1000);
            currWeek.push(currDate);
            dayIdx++;
        } 

        currDate = date;
        if (currDate.getDay() === 6) currDate = new Date(currDate.getTime() - 24 * 60 * 60 * 1000);
        if (currDate.getDay() === 0) currDate = new Date(currDate.getTime() + 24 * 60 * 60 * 1000);
        dayIdx = currDate.getDay();
        
        while (dayIdx > 1) {
            currDate = new Date(currDate.getTime() - 24 * 60 * 60 * 1000);
            currWeek.unshift(currDate);
            dayIdx--;
        }

        return currWeek;
    };
    
    const getWeek = (currDate) => {
        if (currDate.getDay() === 6) currDate = new Date(currDate.getTime() - 24 * 60 * 60 * 1000);
        if (currDate.getDay() === 0) currDate = new Date(currDate.getTime() + 24 * 60 * 60 * 1000);

        let dayIdx = currDate.getDay();
        
        const currWeek = [];
        currWeek.push(currDate);

        while (dayIdx <= 5) {
            currDate = new Date(currDate.getTime() + 24 * 60 * 60 * 1000);
            currWeek.push(currDate);
            dayIdx++;
        } 

        currDate = date;
        if (currDate.getDay() === 6) currDate = new Date(currDate.getTime() - 24 * 60 * 60 * 1000);
        if (currDate.getDay() === 0) currDate = new Date(currDate.getTime() + 24 * 60 * 60 * 1000);
        dayIdx = currDate.getDay();
        
        while (dayIdx >= 1) {
            currDate = new Date(currDate.getTime() - 24 * 60 * 60 * 1000);
            currWeek.unshift(currDate);
            dayIdx--;
        }

        // First day (sunday) must be the last day

  
        currWeek.shift();
        const addDay = new Date(currWeek[currWeek.length - 1].getTime() + 24 * 60 * 60 * 1000);
        currWeek.push(addDay);
        return currWeek;
    };
    
    const getMonth = (currDate) => {
        const monthDays = new Date(currDate.getFullYear(), currDate.getMonth() + 1, 0).getDate();
        const currDays = [];
        for (let day = 1; day <= monthDays; day++) {
            currDays.push(new Date(currDate.getFullYear(), currDate.getMonth(), day));
        }
        return currDays;
    };

    const getNextSchedules = () => {

        if (filterActiveIdx === 0) 
            setDate(currDate => new Date(new Date(currDate).getTime() + 1000 * 60 * 60 * 24 * 5));
        else if (filterActiveIdx === 1) 
            setDate(currDate => new Date(new Date(currDate).getTime() + 1000 * 60 * 60 * 24 * 7));
        else if (filterActiveIdx === 2) 
            setDate(curr => new Date(curr.getFullYear(), curr.getMonth() + 1, 1));
    
    };

    const getPrevSchedules = () => {
        if (filterActiveIdx === 0) 
            setDate(currDate => new Date(new Date(currDate).getTime() - 1000 * 60 * 60 * 24 * 5));
        else if (filterActiveIdx === 1) 
            setDate(currDate => new Date(new Date(currDate).getTime() - 1000 * 60 * 60 * 24 * 7));
        else if (filterActiveIdx === 2) 
            setDate(curr => new Date(curr.getFullYear(), curr.getMonth() - 1, 1));

    };

    const getSchedulesForDate = (date) => {
        const totalDateSchedules = [];

        data.organisation.doctors.forEach(doctor => {
            const currSchedules = JSON.parse(doctor.schedules);
            const foundSchedule = currSchedules.find(schedule => sameDay(date, new Date(schedule.date)));
            if (foundSchedule) totalDateSchedules.push({...
                foundSchedule,
                color: doctor.color,
                name: `${doctor.firstname} ${doctor.lastname}`
            });
        });

        return totalDateSchedules;
    }

    const addInvisibleDays = () => {
        const invisibleDays = [];
        for (let i = 1; i < days[0].getDay() + 1; i++)
            invisibleDays.push(
                <div className="day-container invisible" key={i} />
            );
        
        return invisibleDays;
    }; 

    const removeActiveDoctor = (doctorId) => {
        if (activeDoctors.length === 1) return;
        setActiveDoctors(currActiveDoctors => {
            return currActiveDoctors.filter(currDoctor => currDoctor._id !== doctorId);
        });
    };

    const addActiveDoctor = (doctor) => setActiveDoctors(currActiveDoctors => [...currActiveDoctors, doctor]);

    const sameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    };

    const editScheduleDay = (date) => navigate(`/doctors-schedule/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
    

    return (
        <div className="doctor-schedule">
            <Navigation page="doctors-schedule" />
            
            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Doctors Schedule" : "Program Medici"}</h2>

                 {/* Filter for doctors */}
                <h3 className="element-title">{cookies.language === "en" ? "Doctors" : "Medici"}</h3>
                <div className="filter-container">
                    {activeDoctors && activeDoctors.length > 0 && activeDoctors.map((activeDoctor, idx) => (
                        <div className="filter-doctor" key={idx}>
                            <div className="color" style={{ backgroundColor: activeDoctor.color }}/>
                            <p>{activeDoctor.firstname} {activeDoctor.lastname}</p>
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => removeActiveDoctor(activeDoctor._id)} />
                        </div>
                    ))}

                    <input type="text" value={doctorQuery} onChange={e => setDoctorQuery(e.target.value)} />
                    
                </div>

                {doctorsList && doctorsList.length > 0 && <div className="list-of-doctors">
                    { doctorsList.map((doctor, idx) => (
                        <div className="doctor" key={idx}>
                            <div className="doctor-color" style={{ backgroundColor: doctor.color }}/>
                            <p>{doctor.firstname} {doctor.lastname}</p>
                        </div>
                    ))}
                </div>}

                <div className="schedule-container">

                    <div className="schedule-filter">
                        {filters.map((filter, idx) => (
                            <div className={`filter ${filterActiveIdx === idx ? "active" : ""}`} key={idx} onClick={() => setFilterActiveIdx(idx)}>
                                <p>{filter}</p>
                            </div>
                        ))}
                    </div>

                    <div className="first-row">
                        
                        <div className="date-title-container">
                            <FontAwesomeIcon icon={faAngleLeft} className="angle-icon" onClick={() => getPrevSchedules()} />
                            <h2 className="date-title">{
                                filterActiveIdx === 0 || filterActiveIdx === 1 ? `${days[0].getDate()} ${months[days[0].getMonth()]} - ${days[days.length - 1].getDate()} ${months[days[days.length - 1].getMonth()]} ${days[days.length - 1].getFullYear()}` :
                                filterActiveIdx === 2 ? `${months[days[0].getMonth()]} ${days[0].getFullYear()}` : 
                                null
                            }</h2>
                            <FontAwesomeIcon icon={faAngleRight} className="angle-icon" onClick={() => getNextSchedules()} />
                        </div>
                    
                        <div className="today" onClick={() => setDate(new Date())}>
                            <p>{cookies.langauge === "en" ? "Today" : "Astazi"}</p>
                        </div>
                    </div>

                    {filterActiveIdx && <div className="days-name">
                        {filterActiveIdx === 0 ? workingWeekDays.map((workingWeekDay, idx) => (
                            <div className="day-name" key={idx}>
                                <p>{workingWeekDay}</p>
                            </div>
                        )) : weekDays.map((weekDay, idx) => (
                            <div className="day-name" key={idx}>
                                <p>{weekDay}</p>
                            </div>
                        ))}
                    </div>}

                    <div className={`schedules ${filterActiveIdx === 0 ? "grid-5" : ""}`}>
                        
                        {filterActiveIdx === 2 && addInvisibleDays()}

                        {days && days.length && days.map((day, idx) => (
                            <div className={`day-container ${idx === 0 ? "first-active" : ""}`} key={idx}>
                                <div className="first-row">
                                    <div className="edit" onClick={() => navigate(`/doctors-schedule/${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`)}>
                                        <FontAwesomeIcon icon={faPencil} className="edit-icon" />
                                    </div>
                                    <p className="day">{day.getDate()}</p>
                                </div>

                                {/* <div className="schedule-card" style={{ backgroundColor: "royalblue" }}>
                                    <p className="name">Barbu Mihai</p>
                                    <p>10:25 - 11:25</p>
                                </div>

                                <div className="schedule-card" style={{ backgroundColor: "coral" }}>
                                    <p className="name">Barbu Mihai</p>
                                    <p>10:25 - 11:25</p>
                                </div>

                                <div className="schedule-card" style={{ backgroundColor: "royalblue" }}>
                                    <p className="name">Barbu Mihai</p>
                                    <p>10:25 - 11:25</p>
                                </div>

                                <div className="schedule-card" style={{ backgroundColor: "coral" }}>
                                    <p className="name">Barbu Mihai</p>
                                    <p>10:25 - 11:25</p>
                                </div> */}
                                


                                {getSchedulesForDate(day).map((schedule, scheduleIdx) => (
                                    <div className="schedule-card" key={scheduleIdx} style={{ backgroundColor: schedule.color }}>
                                        <p className="name">{schedule.name}</p>
                                        <p>{schedule.startHour < 10 ? `0${schedule.startHour}` : schedule.startHour}:{schedule.startMinutes < 10 ? `0${schedule.startMinutes}` : schedule.startMinutes} - {schedule.endHour < 10 ? `0${schedule.endHour}` : schedule.endHour}:{schedule.endMinutes < 10 ? `0${schedule.endMinutes}` : schedule.endMinutes}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedule;