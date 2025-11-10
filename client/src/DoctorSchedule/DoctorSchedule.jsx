import { faAngleLeft, faAngleRight, faEdit, faPencil, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import DoctorsFilter from "../Components/DoctorsFilter/DoctorsFilter";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import "./DoctorSchedule.css";
import getContrastForText from "../Functions/Contrast";

const tryParse = (request) => {
    let response;
    try {
        response = JSON.parse(request);
    } catch (e) {
        return request;
    }

    return response;
}

const DoctorSchedule = ({ data }) => {
    
    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();

    const [date, setDate] = useState(new Date());
    const [days, setDays] = useState([new Date()]);
    const [filterActiveIdx, setFilterActiveIdx] = useState(0);
    const [doctors, setDoctors] = useState(data.organisation?.doctors || []);
    const [activeDoctors, setActiveDoctors] = useState(doctors);
    const [totalSchedules, setTotalSchedules] = useState([]);

    const daysRef = useRef([]);
    
    const filters = window.innerWidth > 800 ? (cookies.language === "en" ? ["Working Week", "Week", "Month"] : ["Saptamana Lucratoare", "Saptamana", "Luna"]) : (cookies.language === "en" ? ["Working Week", "Week"] : ["Saptamana Lucratoare", "Saptamana"]);
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
        setTotalSchedules(doctors.map(doctor => tryParse(doctor.schedules)));
    }, []);

    useEffect(() => {
        const monthDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        daysRef.current = Array(filterActiveIdx === 0 ? 5 : filterActiveIdx === 1 ? 7 : monthDays);
        
        if (filterActiveIdx === 0) setDays(getWorkingWeek(date));
        else if (filterActiveIdx === 1) setDays(getWeek(date));
        else setDays(getMonth(date));

    }, [filterActiveIdx, date]);

    useEffect(() => {
        console.log(daysRef?.current);
        if (!daysRef?.current) return;

         // For scrolling effects

        let isScrolling;
        daysRef.current.forEach(dayRef => {
            dayRef.addEventListener("scroll", () => {
                window.clearTimeout(isScrolling);
                dayRef.classList.add("active");
                isScrolling = setTimeout(() => {
                    dayRef.classList.remove("active");
                }, 500);
            });
        });

    }, [daysRef]);

    useEffect(() => {
        console.log(daysRef?.current);
        if (!daysRef?.current || !daysRef?.current?.length) return;
        console.log(daysRef.current.length);
        daysRef?.current.forEach(dayRef => {
            if (!dayRef) return;
            console.log(dayRef);
            dayRef.addEventListener("mouseover", () => {
                dayRef.classList.add("active-scroll");
            });

            dayRef.addEventListener("mouseout", () => {
                dayRef.classList.remove("active-scroll");
            });
        });
     

    }, [daysRef?.current]);
    

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

        activeDoctors.forEach(doctor => {
            console.log(doctor);
            const currSchedules = tryParse(doctor.schedules);
            console.log(currSchedules);
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
        for (let i = 1; i < (days[0].getDay() === 0 ? 7 : days[0].getDay()); i++)
            invisibleDays.push(
                <div className="day-container invisible" key={i} />
            );
        
        return invisibleDays;
    }; 

    const sameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    };

    const changeActiveDoctors = (newActiveDoctors) => {
        setActiveDoctors(newActiveDoctors);
    };

    const editScheduleDay = (date) => navigate(`/doctors-schedule/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
    
    const location = useLocation();

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    return (
        <div className="doctor-schedule" style={{ display: "block" }}>
               
                    <h2 className="title" style={{ marginTop: "50px" }}>{cookies.language === "en" ? "Doctors Schedule" : "Program Medici"}</h2>

                        {/* Filter for doctors */}
                        <DoctorsFilter data={data} changeValue={changeActiveDoctors} />
                        
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
                                        filterActiveIdx === 0 || filterActiveIdx === 1 ? `${days[0].getDate()}${days[0].getMonth() !== days[days.length - 1].getMonth() ? ` ${months[days[0].getMonth()]}` : ""}${days[0].getFullYear() !== days[days.length - 1].getFullYear() ? ` ${days[0].getFullYear()}` : ""} - ${days[days.length - 1].getDate()} ${months[days[days.length - 1].getMonth()]} ${days[days.length - 1].getFullYear()}` :
                                        filterActiveIdx === 2 ? `${months[days[0].getMonth()]} ${days[0].getFullYear()}` : 
                                        null
                                    }</h2>
                                    <FontAwesomeIcon icon={faAngleRight} className="angle-icon" onClick={() => getNextSchedules()} />
                                </div>
                            
                                <div className="today" onClick={() => setDate(new Date())}>
                                    <p>{cookies.langauge === "en" ? "Return to curent day" : "Intoarce-te la ziua curenta"}</p>
                                </div>
                            </div>

                            {window.innerWidth < 800 ? 
                                <div className="doctors-schedule-container">
                                    {filterActiveIdx !== null && <div className="days-name">
                                        {filterActiveIdx === 0 ? workingWeekDays.map((workingWeekDay, idx) => (
                                            <div className="day-name" key={idx}>
                                                <p>{workingWeekDay}</p>
                                            </div>
                                        )) : weekDays.map((weekDay, idx) => (
                                            <div className="day-name" key={idx}>
                                                <p>{weekDay}</p>
                                            </div>
                                        ))}
                                        </div>
                                    }
        
                                    <div className={`schedules ${filterActiveIdx === 0 ? "grid-5" : ""}`}>
                                        
                                        {filterActiveIdx === 2 && addInvisibleDays()}
                
                                        {days && days.length && days.map((day, idx) => (
                                            <div className={`day-container ${idx === 0 ? "first-active" : ""}`} key={idx} idx={idx} ref={ref => daysRef.current[idx] = ref}>
                                                <div className="first-row">
                                                    <div className="edit" style={{ opacity: 0 }}>
                                                        <FontAwesomeIcon icon={faPencil} className="edit-icon" />
                                                    </div>
                                                    <p className="day">{day.getDate()}</p>
                                                </div>
                
                                                {getSchedulesForDate(day).map((schedule, scheduleIdx) => (
                                                    <div className="schedule-card" key={scheduleIdx} style={{ backgroundColor: schedule.color }} onClick={() => navigate(`/doctors-schedule/${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`)}>
                                                        <p className="name" style={{ color: getContrastForText(schedule.color) }}>{schedule.name}</p>
                                                        <p style={{ color: getContrastForText(schedule.color) }}>{schedule.startHour < 10 ? `0${schedule.startHour}` : schedule.startHour}:{schedule.startMinutes < 10 ? `0${schedule.startMinutes}` : schedule.startMinutes} - {schedule.endHour < 10 ? `0${schedule.endHour}` : schedule.endHour}:{schedule.endMinutes < 10 ? `0${schedule.endMinutes}` : schedule.endMinutes}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div> : 
                                <>
                                    {filterActiveIdx !== null && <div className="days-name">
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
                                            <div className={`day-container ${idx === 0 ? "first-active" : ""}`} key={idx} idx={idx} ref={ref => daysRef.current[idx] = ref}>
                                                <div className="first-row">
                                                    <div className="edit" onClick={() => window.innerWidth >= 1000 && navigate(`/doctors-schedule/${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`)}>
                                                        <FontAwesomeIcon icon={faPencil} className="edit-icon" />
                                                    </div>
                                                    <p className="day">{day.getDate()}</p>
                                                </div>


                                                {getSchedulesForDate(day).map((schedule, scheduleIdx) => (
                                                    <div className="schedule-card" key={scheduleIdx} style={{ backgroundColor: schedule.color }} onClick={() => window.innerWidth >= 1000 && navigate(`/doctors-schedule/${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`)}>
                                                        <p className="name" style={{ color: getContrastForText(schedule.color) }}>{schedule.name}</p>
                                                        <p style={{ color: getContrastForText(schedule.color) }}>{schedule.startHour < 10 ? `0${schedule.startHour}` : schedule.startHour}:{schedule.startMinutes < 10 ? `0${schedule.startMinutes}` : schedule.startMinutes} - {schedule.endHour < 10 ? `0${schedule.endHour}` : schedule.endHour}:{schedule.endMinutes < 10 ? `0${schedule.endMinutes}` : schedule.endMinutes}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            }

                                    
                        </div>
        </div>
    );
};

export default DoctorSchedule;