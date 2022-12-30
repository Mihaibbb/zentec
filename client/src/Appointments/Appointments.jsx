import "../DoctorSchedule/DoctorSchedule.css";
import './Appointments.css';
import Navigation from '../Components/Navigation/Navigation';
import Header from '../Components/Header/Header';
import { useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faAngleDown, faAngleLeft, faAngleRight, faAngleUp, faBan, faMinus, faPlus, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { useCookies } from 'react-cookie';
import CreatePatient from '../CreatePatient/CreatePatient';
import DoctorsFilter from '../Components/DoctorsFilter/DoctorsFilter';
import getContrastForText from '../Functions/Contrast';

const Appointments = ({ data }) => {

    const currDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const [cookies, setCookie] = useCookies();
    const months = cookies.language === "en" ? 
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] :
    ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

    const daysOfWeek = cookies.language === "en" ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam'];
    const [date, setDate] = useState(new Date());
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());
    const [days, setDays] = useState([date]);
    const [hourContainerHeight, setHourContainerHeight] = useState(0);
    const [filters, setFilters] = useState(cookies.language === "en" ? ['Day', 'Working Week', 'Week', 'Month', 'Year'] : ['Zi', 'Saptamana Lucratoare', 'Saptamana', 'Luna', 'An']);
    
    const [startEvent, setStartEvent] = useState(); 
    const [modifyEvent, setModifyEvent] = useState(false);
    const [startPosition, setStartPosition] = useState();
    const [lastElement, setLastElement] = useState();
    const [firstElement, setFirstElement] = useState();
    const [newDay, setNewDay] = useState();
    const [filterActive, setFilterActive] = useState(0);
    const [doctors, setDoctors] = useState(data.organisation.doctors);
    
    const [appointments, setAppointments] = useState(data.organisation.schedules);
    const [appointmentDoctorId, setAppointmentDoctorId] = useState();
    const [appointmentDateValue, setAppointmentDateValue] = useState();
    const [activeCreateAppointment, setActiveCreateAppointment] = useState(false);
    const [activeEditAppointment, setActiveEditAppointment] = useState(false);
    const [activeCreatePatient, setActiveCreatePatient] = useState(false);
    const [appointmentTitle, setAppointmentTitle] = useState("");
    const [appointmentPatient, setAppointmentPatient] = useState("");
    const [appointmentPatientData, setAppointmentPatientData] = useState();
    const [appointmentStartHour, setAppointmentStartHour] = useState("");
    const [appointmentEndHour, setAppointmentEndHour] = useState("");
    const [appointmentStartMinutes, setAppointmentStartMinutes] = useState("");
    const [appointmentEndMinutes, setAppointmentEndMinutes] = useState("");
    const [appointmentCost, setAppointmentCost] = useState("");
    const [appointmentTypeIncome, setAppointmentTypeIncome] = useState("LEI");
    const [appointmentNotes, setAppointmentNotes] = useState("");
    const [appointmentPatientsList, setAppointmentPatientsList] = useState([]);
    const [appointmentPatientPhoneNumber, setAppointmentPatientPhoneNumber] = useState("");
    const [appointmentFinished, setAppointmentFinished] = useState();
    const [appointmentConfirmed, setAppointmentConfirmed] = useState();
    const [appointmentIntervalWarning, setAppointmentIntervalWarning] = useState(false);
    const [activePlusButton, setActivePlusButton] = useState(false);
    const [activeResizing, setActiveResizing] = useState(false);

    const [dragAppointment, setDragAppointment] = useState(false);
    const [dragPosition, setDragPosition] = useState();
    const [dragGaps, setDragGaps] = useState([]);
    const [dragInitStartHour, setDragInitStartHour] = useState();
    const [dragInitStartMinutes, setDragInitStartMinutes] = useState();
    const [dragInitEndHour, setDragInitEndHour] = useState();
    const [dragInitEndMinutes, setDragInitEndMinutes] = useState();
    const [dragDataAppointment, setDragDataAppointment] = useState();
    const [inMoveDragging, setInMoveDragging] = useState(false);

    const [phoneNumberReadOnly, setPhoneNumberReadOnly] = useState(true);
    const [patientSaved, setPatientSaved] = useState(true);
    const [appointmentId, setAppointmentId] = useState();
    const [statusMessage, setStatusMessage] = useState();
    const [activeGaps, setActiveGaps] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeErrorMessage, setActiveErrorMessage] = useState();
    
    const hours = [];
    const filterRef = useRef();
    const scheduleRef = useRef();
    const doctorRef = useRef([]);
    const gapsRef = useRef([]);

    // const { startHour, endHour, gaps, doctors } = location?.state;
    const startHour = 8;
    const endHour = 20;
    const gaps = 4;
    const minutesPerGap = 60 / gaps;
    
    for (let hour = startHour; hour <= endHour; hour++)  {
        hours.push(hour);   
    }

    const location = useLocation();

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);
    
    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth <= 800) setActivePlusButton(true);
            else setActivePlusButton(false);
        });
    }, []);

    const getSchedule = (dayFormat, doctorColor, doctorObject) => {
        const gapsArr = [];
        console.log(new Date(dayFormat));
        for (let gap = 0; gap < gaps; gap++)
            gapsArr.push(gap);

        return hours.map((hour, idx) => {
            return (
                <div className={`schedule-hour ${idx === hours.length - 1 ? "inactive" : ""}`} key={idx} ref={!scheduleRef.current && idx === 0 ? scheduleRef : null}>
                    {gapsArr.map((gap, gapIdx) => {

                        const startHourGapAttr = idx + startHour < 10 ? `0${idx + startHour}` : (idx + startHour).toString(); 
                        const startMinutesGapAttr = gapIdx * minutesPerGap < 10 ? `0${gapIdx * minutesPerGap}` : gapIdx * minutesPerGap < 60 ? (gapIdx * minutesPerGap).toString() : "0";
                        
                        return (
                            <div 
                                className={`gap 
                                    ${ isInDoctorInterval(startHourGapAttr, startMinutesGapAttr, new Date(dayFormat), JSON.parse(doctorObject.schedules)) ? "" : "not-in-schedule"} 
                                    ${getContrastForText(doctorColor) === "#000" ? "dark" : ""}
                                    ${idx === hours.length - 1 ? "inactive" : ""}
                                    `} 
                                key={gapIdx} 
                                id={(idx * gaps + gapIdx).toString()}
                                style={{
                                     "--doctor-color-css": doctorColor
                                }}
                                starthour={startHourGapAttr}
                                startminutes={startMinutesGapAttr}
                                endhour={(gapIdx + 1) * minutesPerGap < 60 ? (idx + startHour < 10 ? `0${idx + startHour}` : (idx + startHour).toString()) : (idx + startHour + 1 < 10 ? `0${idx + startHour + 1}` : (idx + startHour + 1).toString())}
                                endminutes={(gapIdx + 1) * minutesPerGap < 10 ? `0${(gapIdx + 1) * minutesPerGap}` : (gapIdx + 1) * minutesPerGap < 60 ? ((gapIdx + 1) * minutesPerGap).toString() : "0"}
                                day={dayFormat.toString()}
                                doctorid={doctorObject._id.toString()}
                                ref={gapsRef} 
                                onMouseDown={(e) => initiateAppointment(e, idx, gapIdx, doctorObject, false)}
                                onMouseMove={(e) => moveAppointment(e, doctorColor, false, null, doctorObject)}
                                onMouseUp={async (e) => await createAppointment(e, JSON.parse(doctorObject.schedules))}
                                onTouchStart={e => initiateAppointment(e, idx, gapIdx)}
                                onTouchMove={e => moveAppointment(e, doctorColor)}
                                onTouchEnd={async e => await createAppointment(e, JSON.parse(doctorObject.schedules))}
                            >
                                {firstElement?.getAttribute('id') === (idx * gaps + gapIdx).toString() && 
                                firstElement?.getAttribute('day') === dayFormat.toString() && !activeResizing &&
                                doctorObject._id === appointmentDoctorId &&
                                    <p className="appointment-interval">{appointmentStartHour}:{appointmentStartMinutes < 10 ? `0${appointmentStartMinutes}` : appointmentStartMinutes} - {appointmentEndHour}:{appointmentEndMinutes < 10 ? `0${appointmentEndMinutes}` : appointmentEndMinutes}</p>
                                }
                            </div>
                        );
                    })}
                </div>
            );
        });
    };

    const initiateAppointment = (e, currHour, gap, doctorObject, editing = false) => {
        const target = e.target?.classList.contains("gap") ? e.target : e.target.parentElement;
        const day = new Date(target.getAttribute("day"));
        const dateTime = date.getTime();
        const dayTime = day.getTime();
    
       
        if (dateTime < new Date().getTime() || dayTime < new Date().getTime()) {
            setActiveErrorMessage(true);
            setTimeout(() => setActiveErrorMessage(false), 5000);
            return;
        }

        console.log(day, date);
        if (e.button === 2) return; // check for right click
        if (modifyEvent) return;
        if (editing) {
            e.target = e;
            setActiveResizing(true);
        }
        
        if (!target.classList.contains("resizeable") && target.classList.contains("created")) return initiateDragAppointment(target.getBoundingClientRect().y, target.getAttribute("starthour"), target.getAttribute("startminutes"), target.getAttribute("endhour"), target.getAttribute("endminutes"), target.getAttribute("day"));
        if (target.classList.contains('highlight') && !editing) return;
        console.log(new Date(date.getFullYear(), date.getMonth(), e.target.getAttribute('day')));
        setAppointmentDateValue(filterActive === 0 ? date : new Date(e.target.getAttribute('day')));
        setStartEvent(true);
        setStartPosition(e.clientY);
        
        setAppointmentDoctorId(doctorObject._id);
        console.log(target);
        setFirstElement(target);
        setLastElement(target);
        if (editing) return;
        setAppointmentStartHour(currHour + startHour);
        setAppointmentStartMinutes(gap * minutesPerGap);
        setAppointmentEndMinutes((gap + 1) * minutesPerGap >= 60 ? 0 : (gap + 1) * minutesPerGap);
        setAppointmentEndHour((gap + 1) * minutesPerGap >= 60 ? currHour + startHour + 1 : currHour + startHour);
 
    };

    const initiateDragAppointment = (yPos, startHour, startMinutes, endHour, endMinutes, dataGap) => {
        setDragAppointment(true);
        setDragPosition(yPos);
        
        setDragDataAppointment(new Date(dataGap));
    };

    const moveAppointment = (e, doctorColor, editing = false, gap = null, doctorObject) => {

        let target = e.target;
        while (!target.classList.contains("gap")) {
            target = target.parentElement;
        }

        if (dragAppointment) {
            moveDragAppointment(target, doctorColor, gap, doctorObject);
            return;
        }

        if (!firstElement?.classList.contains("gap")) return;

        if (parseInt(firstElement.getAttribute("id")) > parseInt(target.getAttribute("id"))) return;
        if (!startEvent || modifyEvent) return;
        // if (startPosition >= e.clientY) return;
        
        const targetDoctorId = e.target?.getAttribute("doctorid") ||  e.target.parentElement?.getAttribute("doctorid");
        const targetDay = e.target?.getAttribute("day") || e.target.parentElement?.getAttribute("day");
        const targetId = e.target?.getAttribute("id") || e.target.parentElement?.getAttribute("id");
        const targetEndHour = e.target?.getAttribute("endhour") || e.target.parentElement?.getAttribute("endhour");
        const targetEndMinutes = e.target?.getAttribute("endminutes") || e.target.parentElement?.getAttribute("endminutes");

        if (targetDoctorId !== appointmentDoctorId) return;
        if (firstElement.getAttribute("day") !== targetDay) return;

        if (e.target.classList.contains("highlight") && parseInt(e.target.getAttribute('id')) > parseInt(lastElement.getAttribute('id'))) return;
        if (e.target.parentElement.classList.contains("inactive")) return;
        const lastPos = lastElement.getBoundingClientRect();
        const currPos = e.target.getBoundingClientRect();
        console.log(firstElement);
        if (!firstElement.classList.contains('highlight')) firstElement.classList.add("highlight");
        if (!editing) {
            setAppointmentEndHour(targetEndHour);
            setAppointmentEndMinutes(targetEndMinutes);
        } 
        
        if (Number(targetId) < Number(lastElement.getAttribute('id'))) {
            for (let i = Number(targetId) + 1; i <= Number(lastElement.getAttribute('id')); i++) {
                const child = lastElement.parentElement.parentElement.querySelector(`[id="${i.toString()}"]`);
                console.log(i, lastElement.parentElement.parentElement.querySelector(`[id="${i}"]`) );
                child.classList.remove("highlight");
            }
        }
        else if (Number(targetId) > Number(firstElement.getAttribute('id'))) {
            for (let i = Number(firstElement.getAttribute('id')) + 1; i <= Number(targetId); i++) {
                const child = lastElement.parentElement.parentElement.querySelector(`[id="${i.toString()}"]`);
                console.log(i, lastElement.parentElement.parentElement.querySelector(`[id="${i}"]`) );
                child.classList.add("highlight");
                if (editing) {
                    console.log(gap);
                    const paragraphs = gap.querySelectorAll(".appointment-interval");
                    const appointmentHours = paragraphs[0];
                    const startHour = appointmentHours.split("-")[0];
                    paragraphs[0].innerText = `${startHour}- ${e.target.getAttribute('endhour')}:${e.target.getAttribute('endminutes')}`;
                }
            }
        }

        setLastElement(e.target);
    };

    const moveDragAppointment = (element, doctorColor, gap, doctorObject) => {
        const diff = element.getBoundingClientRect().y - dragPosition; 
        
        const totalGaps = document.querySelectorAll(`.gap[doctorid="${doctorObject._id.toString()}"]:not(.inactive)`);

        let startIdx = Number(element.getAttribute("id")) - 1, endIdx = Number(element.getAttribute("id")) + 1;
        while (totalGaps[startIdx].classList.contains("highlight")) startIdx--;
        while (totalGaps[endIdx].classList.contains("highlight")) endIdx++;

        if (!inMoveDragging) {
            setDragInitStartHour(Number(totalGaps[startIdx + 1].getAttribute("starthour")));
            setDragInitStartMinutes(Number(totalGaps[startIdx + 1].getAttribute("startminutes")));
            setDragInitEndHour(Number(totalGaps[endIdx - 1].getAttribute("endhour")));
            setDragInitEndMinutes(Number(totalGaps[endIdx - 1].getAttribute("endminutes")));
            setInMoveDragging(true);
        }

        // Dragging towards bottom
        if (diff >= element.clientHeight) { 
            const appointmentGaps = [element];
            
            let elementIdx = Number(element.getAttribute("id")) + 1;
            console.log(elementIdx, totalGaps);
          
            while (elementIdx < totalGaps.length && (totalGaps[elementIdx].classList.contains("highlight") && !totalGaps[elementIdx].classList.contains("resizeable-up"))) {
                appointmentGaps.push(totalGaps[elementIdx]);
                elementIdx++;
            }

            elementIdx--;

            if (elementIdx >= totalGaps.length - 1) return; 
            totalGaps[elementIdx + 1].classList = totalGaps[elementIdx].classList;
            
            if (elementIdx > 0) totalGaps[elementIdx].classList = totalGaps[elementIdx - 1].classList;
            else {
                console.log("HAHAHA");
                totalGaps[elementIdx].classList.remove("highlight");
                totalGaps[elementIdx].classList.remove("created");
                totalGaps[elementIdx].classList.remove("resizeable");
                totalGaps[elementIdx].classList.remove("resizeable-up");
            }
            
            elementIdx = Number(element.getAttribute("id")) - 1;
         
            while (elementIdx >= 0 && (totalGaps[elementIdx].classList.contains("highlight") && !totalGaps[elementIdx].classList.contains("resizeable-down"))) {
                appointmentGaps.unshift(totalGaps[elementIdx]);
                elementIdx--;
            }

            setDragGaps(appointmentGaps);

            elementIdx++;
            
            if (elementIdx < totalGaps.length - 1) totalGaps[elementIdx + 1].classList = totalGaps[elementIdx].classList;
            if (elementIdx < totalGaps.length - 1) totalGaps[elementIdx + 1].innerHTML = totalGaps[elementIdx].innerHTML;

            if (elementIdx > 0) totalGaps[elementIdx].classList = totalGaps[elementIdx - 1].classList;     
            else if (elementIdx === 0) {
                totalGaps[elementIdx].classList.remove("highlight");
                totalGaps[elementIdx].classList.remove("created");
                totalGaps[elementIdx].classList.remove("resizeable");
                totalGaps[elementIdx].classList.remove("resizeable-up");
            }
            
            if (elementIdx >= 0 && elementIdx < totalGaps.length - 1) totalGaps[elementIdx].innerHTML = "";                            
            
            setDragPosition(element.getBoundingClientRect().y);
        }

        // Dragging towards top

        if (diff <= -(element.clientHeight)) {
            const appointmentGaps = [element];

            let elementIdx = Number(element.getAttribute("id")) - 1;
        
            while (elementIdx >= 0 && (totalGaps[elementIdx].classList.contains("highlight") && !totalGaps[elementIdx].classList.contains("resizeable-down"))) {
                appointmentGaps.unshift(totalGaps[elementIdx]);
                elementIdx--;
            }

            elementIdx++;
            if (elementIdx <= 0) return;

            if (elementIdx > 0) totalGaps[elementIdx].classList = totalGaps[elementIdx + 1].classList;               
            if (elementIdx < totalGaps.length - 1) { 
                totalGaps[elementIdx - 1].classList = totalGaps[elementIdx].classList;
                totalGaps[elementIdx - 1].innerHTML = totalGaps[elementIdx].innerHTML;
            }

            if (elementIdx <= totalGaps.length - 1 && elementIdx > 0) totalGaps[elementIdx].innerHTML = "";                            
            
            
            elementIdx = Number(element.getAttribute("id")) + 1;
            
            while (elementIdx < totalGaps.length && (totalGaps[elementIdx].classList.contains("highlight") && !totalGaps[elementIdx].classList.contains("resizeable-up"))) {
                appointmentGaps.push(totalGaps[elementIdx]);
                elementIdx++;
            }
            setDragGaps(appointmentGaps);
            elementIdx--;

            if (elementIdx > 0) totalGaps[elementIdx - 1].classList = totalGaps[elementIdx].classList;
            if (elementIdx < totalGaps.length - 1) totalGaps[elementIdx].classList = totalGaps[elementIdx + 1].classList;
            else if (elementIdx === totalGaps.length - 1) {
                totalGaps[elementIdx].classList.remove("highlight");
                totalGaps[elementIdx].classList.remove("created");
                totalGaps[elementIdx].classList.remove("resizeable");
                totalGaps[elementIdx].classList.remove("resizeable-down");
            }
            
            setDragPosition(element.getBoundingClientRect().y);
        }

    };
    
    const createAppointment = async (e, doctorSchedules) => {
        if (dragAppointment) return await finishDragAppointment();
        console.log('here', firstElement, lastElement);
        const startId = Number(firstElement.getAttribute('id'));
        const endId = Number(lastElement.getAttribute('id'));
        // Array for each gap in the appointment
        const appointmentGapElements = [];

        for (let id = startId; id <= endId; id++) {
            appointmentGapElements.push(document.querySelector(`.gap[id="${id}"]`));
        }
        
        const appointmentInInterval = appointmentGapElements.every(gap => {
            const startHour = Number(gap.getAttribute("starthour"));
            const startMinutes = Number(gap.getAttribute("startminutes"));
            const day = new Date(gap.getAttribute("day"));
            console.log(day);
            return isInDoctorInterval(startHour, startMinutes, day, doctorSchedules);
        });

        // Set warning message if appointment is not in interval
        if (!appointmentInInterval) {
            setAppointmentIntervalWarning(true);
            return;
        }

        if (!startEvent || modifyEvent) return;
        setActiveCreateAppointment(true);
        setStartEvent(false);
        setStartPosition(false);        
    };

    const finishDragAppointment = async () => {
        if (!dragAppointment) return;
        setDragAppointment(false);
        setDragPosition();
        const dragFirstElement = dragGaps[0];
        const dragLastElement = dragGaps[dragGaps.length - 1];

        const dragFirstHour = Number(dragFirstElement.getAttribute("starthour"));
        const dragFirstMinutes = Number(dragFirstElement.getAttribute("startminutes"));
        const dragLastHour = Number(dragLastElement.getAttribute("endhour"));
        const dragLastMinutes = Number(dragLastElement.getAttribute("endminutes"));

        const foundAppointment = appointments.find(appointment => {
            console.log(
                sameDay(new Date(appointment.date), new Date(dragFirstElement.getAttribute("day"))),
                dragInitStartHour, Number(new Date(appointment.startDate).getHours()),
                dragInitStartMinutes === Number(new Date(appointment.startDate).getMinutes()),
                dragInitEndHour === Number(new Date(appointment.endDate).getHours()),
                dragInitEndMinutes === Number(new Date(appointment.endDate).getMinutes()),
                dragFirstElement.getAttribute("doctorid") === JSON.parse(appointment.users)[0]
            );
            
            return (
                sameDay(new Date(appointment.date), new Date(dragFirstElement.getAttribute("day"))) &&
                dragInitStartHour === Number(new Date(appointment.startDate).getHours()) &&
                dragInitStartMinutes === Number(new Date(appointment.startDate).getMinutes()) &&
                dragInitEndHour === Number(new Date(appointment.endDate).getHours()) &&
                dragInitEndMinutes === Number(new Date(appointment.endDate).getMinutes()) &&
                dragFirstElement.getAttribute("doctorid") === JSON.parse(appointment.users)[0]
            );
        });

        const appointmentDate = new Date(foundAppointment.date);
        console.log(foundAppointment);
        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...foundAppointment,
                    startDate: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), dragFirstHour, dragFirstMinutes),
                    endDate: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), dragLastHour, dragLastMinutes),
                    _id: data.organisation._id,
                    users: JSON.parse(foundAppointment.users),
                    patients: JSON.parse(foundAppointment.patients),
                    appointmentId: foundAppointment._id
                })
            };
    
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/update-appointment`, options);
            const response = await request.json();
            if (!await response.success) return;

            setStatusMessage(response.message[cookies.language]);
            setActiveEditAppointment(false);
            resetAppointmentData();
            setAppointments(currAppointments => {
                return currAppointments.map((currAppointment) => {
                    if (currAppointment._id === foundAppointment._id) return {
                        ...currAppointment,
                        startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), dragFirstHour, dragFirstMinutes),
                        endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), dragLastHour, dragLastMinutes),
                        _id: data.organisation._id,
                        appointmentId: currAppointment._id
                        
                    };

                    return currAppointment;
                });
            });
            
        } catch (e) {
            console.log(e);
        }

        setDragInitStartHour();
        setDragInitStartMinutes();
        setDragInitEndHour();
        setDragInitEndMinutes();
        setDragGaps([]);
        setInMoveDragging(false);
        
    }

    const createAppointmentNotInInterval = () => {
        setAppointmentIntervalWarning(false);
        setActiveCreateAppointment(true);
        setStartEvent(false);
        setStartPosition(false);   
    };

    const removeAppointmentNotInInterval = () => {
        setAppointmentIntervalWarning(false);
        closeCreateAppointment();
    };

    const resizeAppointment = (e) => {
        if (!startEvent || modifyEvent) return;
        setActiveResizing(false);
        setStartEvent(false);
        setStartPosition(false);
    };

    const sendAppointment = async () => {

        if (appointmentPatient.length === 0 || appointmentPatientPhoneNumber.toString().length === 0 || appointmentTitle.length === 0) {
            setErrorMessage(cookies.language === "en" ? "Fill required fields!" : "Completeaza campurile obligatorii!");
            return;
        }

        const appointmentData = {
            startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointmentStartHour, appointmentStartMinutes),
            endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointmentEndHour, appointmentEndMinutes),
            patients: [appointmentPatientData],
            users: [appointmentDoctorId],
            _id: data.organisation._id,
            title: appointmentTitle,
            income: appointmentCost,
            typeIncome: appointmentTypeIncome,
            notes: appointmentNotes,
            date: date,
            saved: !patientSaved
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(appointmentData)
        };

        const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-appointment`, options);
        const response = await request.json();
        console.log(await response);
        if (await response.success) {
            setAppointments(currAppointments => [...currAppointments, appointmentData]);
            setStatusMessage(response.message[cookies.language]);
            resetAppointmentData();
        }
    };

    const closeCreateAppointment = () => {
        console.log(firstElement, lastElement);
        if (activePlusButton) return resetAppointmentData();
        if (!firstElement || !lastElement) return;
        let currentId = parseInt(firstElement.getAttribute('id'));
        const finalId = parseInt(lastElement.getAttribute('id'));
        const currentDay = firstElement.getAttribute('day');
        while (currentId <= finalId) {
            const currentElement = document.querySelector(`.gap[id="${currentId.toString()}"][day="${currentDay}"][doctorid="${appointmentDoctorId}"]`)
            currentElement.classList.remove("highlight");
            currentId++;
        }
        
        resetAppointmentData();
    };

    const closeEditAppointment = () => {
        setActiveEditAppointment(false);
        resetAppointmentData();
    };

    const resetAppointmentData = () => {
        setActiveCreateAppointment(false);
        setAppointmentStartHour("");
        setAppointmentStartMinutes("");
        setAppointmentEndHour("");
        setAppointmentEndMinutes("");
        setAppointmentTitle("");
        setAppointmentPatient("");
        setAppointmentPatientData();
        setFirstElement(null);
        setLastElement(null);
        setAppointmentCost("");
        setAppointmentPatientsList([]);
        setAppointmentNotes("");
        setAppointmentPatientPhoneNumber("");
        setAppointmentDateValue();
        setAppointmentDoctorId();
        setAppointmentFinished();
        setAppointmentConfirmed();
        setAppointmentIntervalWarning(false);
    };

    const editAppointment = async (currentAppointmentId) => {

        const appointmentData = {
            startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointmentStartHour, appointmentStartMinutes),
            endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointmentEndHour, appointmentEndMinutes),
            patients: [appointmentPatientData],
            users: [appointmentDoctorId],
            _id: data.organisation._id,
            title: appointmentTitle,
            income: appointmentCost,
            typeIncome: appointmentTypeIncome,
            notes: appointmentNotes,
            date: date,
            appointmentId: currentAppointmentId,
            finished: appointmentFinished ? true : false,
            confirmed: appointmentConfirmed
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(appointmentData)
        };

        const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/update-appointment`, options);
        const response = await request.json();
        if (response.success) {
            setStatusMessage(response.message[cookies.language]);
            setActiveEditAppointment(false);
            resetAppointmentData();
            setAppointments(currAppointments => {
                return currAppointments.map((currAppointment) => {
                    if (currAppointment._id === currentAppointmentId) return {
                        ...currAppointment,
                        startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointmentStartHour, appointmentStartMinutes),
                        endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointmentEndHour, appointmentEndMinutes),
                        patients: [appointmentPatientData],
                        users: [appointmentDoctorId],
                        _id: data.organisation._id,
                        title: appointmentTitle,
                        income: appointmentCost,
                        typeIncome: appointmentTypeIncome,
                        notes: appointmentNotes,
                        date: date,
                        appointmentId: currentAppointmentId,
                        finished: appointmentFinished ? true : false,
                        confirmed: appointmentConfirmed
                    };

                    return currAppointment;
                });
            });
        }
    };

    const removeAppointment = async (appointmentId1) => {

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                _id: data.organisation._id,
                appointmentId: appointmentId1
            })
        };

        const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-appointment`, options);
        const response = await request.json();
        if (response.success) {
            setStatusMessage(response.message[cookies.language]);
            setActiveEditAppointment(false);
            
            setAppointments(currAppointments => {
                return currAppointments.filter(currAppointment => {
                    return currAppointment._id !== appointmentId;
                });
            });

            resetAppointmentData();
        }
    };

    const sameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    };

    useEffect(() => {
        if (document.documentElement.clientWidth <= 800) setActivePlusButton(true);
    }, []);

    useEffect(() => {
        if (!scheduleRef.current) return;
        console.log(scheduleRef.current.offsetHeight);
        setHourContainerHeight(scheduleRef.current.offsetHeight / 2);
    }, [scheduleRef]);

    useEffect(() => {
        if (month === date.getMonth() && year === date.getFullYear()) return;
        setDate(new Date(year, month, 1));
    }, [year, month]);

    useEffect(() => {
        console.log(days);
    }, [days]);

    useEffect(() => {
        console.log(appointments);
        const currentGaps = document.querySelectorAll('.gap');

        currentGaps.forEach(gap => {
            
            gap.classList.remove("highlight");
            gap.classList.remove("created");
            gap.classList.remove("resizeable");
            gap.classList.remove("resizeable-up");
            gap.classList.remove("resizeable-down");
            while (gap?.firstChild) {
                console.log(gap.firstChild);
                gap.removeChild(gap.firstChild);
                console.log('here2');
            }
        });

        console.log(days);
        console.log(appointments);
        if (filterActive === 3 || filterActive === 4) return;

        // Appointments must be filtered for each doctor -> 

        doctors.forEach(doctor => {
            
        });
       
        const currentAppointments = filterActive === 0 ? appointments.filter((appointment) => {
            console.log(appointment);
            let sameDoctor = false;
            
            const id = data.user?.userId;
            
            console.log(sameDoctor);
            return sameDay(new Date(appointment.date), date);
        }) : appointments.filter((appointment) => {
            console.log(appointment);
            return (
                days[0].getTime() <= new Date(appointment.date).getTime() && 
                new Date(appointment.date).getTime() <= days[days.length - 1].getTime()
            );
        });

        console.log(currentAppointments);
        
        currentAppointments.forEach((appointment) => {
            console.log(appointment);
            const appointmentDate = new Date(appointment.startDate);
            const startHourAppointment = appointmentDate.getHours();
            const startMinutesAppointment = appointmentDate.getMinutes();
            const doctorIdAppointment = isJSON(appointment.users) ? JSON.parse(appointment.users)[0] : appointment.users[0];
            const endHourAppointment = new Date(appointment.endDate).getHours();
            const endMinutesAppointment = new Date(appointment.endDate).getMinutes();
            let startIdx, endIdx;
            
            const doctorColor = doctors.find(doctor => doctor._id === (isJSON(appointment.users) ? JSON.parse(appointment.users)[0] : appointment.users[0]))?.color;
            console.log(doctorColor)
            currentGaps.forEach((gap, gapIdx) => {
                if (Number(gap.getAttribute('starthour')) === startHourAppointment &&
                    Number(gap.getAttribute('startminutes')) === startMinutesAppointment && 
                    (filterActive !== 0 ? sameDay(new Date(gap.getAttribute('day')), appointmentDate) : true) &&
                    gap.getAttribute("doctorid") === doctorIdAppointment
                ) {
                    startIdx = gapIdx;
                }

                if (Number(gap.getAttribute('endhour')) === endHourAppointment && 
                    Number(gap.getAttribute('endminutes')) === endMinutesAppointment && 
                    (filterActive !== 0 ? sameDay(new Date(gap.getAttribute('day')), appointmentDate) : true) &&
                    gap.getAttribute("doctorid") === doctorIdAppointment
                ) {
                    console.log(gapIdx, endHourAppointment, endMinutesAppointment);
                    endIdx = gapIdx;
                }
            });

            console.log(startIdx, endIdx);
           
            for (let i = startIdx; i <= endIdx; i++) {
                currentGaps[i].classList.add('highlight');
                currentGaps[i].classList.add('created');
                if (appointment.finished) currentGaps[i].classList.add("finished");
                currentGaps[i].addEventListener('click', () => {
                    console.log(appointment)

                    setActiveEditAppointment(true);
                    setAppointmentTitle(appointment.title);
                    setAppointmentPatient(`${JSON.parse(appointment.patients)[0].firstname} ${JSON.parse(appointment.patients)[0].lastname}`);
                    setAppointmentPatientsList([]);
                    setAppointmentPatientData(JSON.parse(appointment.patients)[0]);
                    setAppointmentStartHour(new Date(appointment.startDate).getHours() < 10 ? `0${new Date(appointment.startDate).getHours()}` : new Date(appointment.startDate).getHours());
                    setAppointmentStartMinutes(new Date(appointment.startDate).getMinutes() < 10 ? `0${new Date(appointment.startDate).getMinutes()}` : new Date(appointment.startDate).getMinutes());
                    setAppointmentEndHour(new Date(appointment.endDate).getHours() < 10 ? `0${new Date(appointment.endDate).getHours()}` : new Date(appointment.endDate).getHours());
                    setAppointmentEndMinutes(new Date(appointment.endDate).getMinutes() < 10 ? `0${new Date(appointment.endDate).getMinutes()}` : new Date(appointment.endDate).getMinutes());
                    setAppointmentCost(appointment.income);
                    setAppointmentId(appointment._id);
                    setAppointmentNotes(appointment.notes);
                    setAppointmentDoctorId(JSON.parse(appointment.users)[0]);
                    setAppointmentFinished(appointment.finished);
                    setAppointmentConfirmed(appointment.confirmed);
                });
            }

            const textElement = document.createElement('p');
            textElement.classList.add('appointment-interval');
            textElement.innerText = `${startHourAppointment < 10 ? `0${startHourAppointment}` : startHourAppointment}:${startMinutesAppointment < 10 ? `0${startMinutesAppointment}` : startMinutesAppointment} - ${endHourAppointment < 10 ? `0${endHourAppointment}` : endHourAppointment}:${endMinutesAppointment < 10 ? `0${endMinutesAppointment}` : endMinutesAppointment}`;
            textElement.style.top = 'calc(-100% + 40px)';
            textElement.style.color = getContrastForText(doctorColor);
            currentGaps[startIdx].appendChild(textElement);
            currentGaps[startIdx].classList.add("resizeable");
            currentGaps[startIdx].classList.add("resizeable-up");

            // currentGaps.forEach(gap => {

            //     gap.addEventListener("mousedown", e => {
            //         console.log(e.target);
            //         if (!e.target.classList.contains("resizeable") || !e.target.classList.contains("resizeable-up")) return;
            //         setStartEvent(true);
            //         setLastElement(e.target);
            //         setStartPosition(e.clientY);
            //         setModifyEvent(true);
            //     });

            //     gap.addEventListener("mousemove", e => {
            //         console.log(startEvent, lastElement);
            //         if (!startEvent || !lastElement) return;
            //         console.log(e.target);
            //         while (e.target && !e.target.classList.contains("gap")) {
            //             e.target = e.target?.parentElement;
            //         }
            //         console.log(e.target !== lastElement);

            //         if (e.target === lastElement) return;

            //         if (e.clientY < startPosition) {
            //             e.target.classList.add("highlight");
            //             console.log("ADD");
            //         } else {
            //             e.target.classList.remove("highlight");
            //         }
                  
            //         setStartPosition(e.target);
            //         setLastElement(e.target);
                    
                    
                   
            //     });

            //     gap.addEventListener("mouseup", e => {
            //         setStartEvent(false);
            //         setModifyEvent(false);
            //         setLastElement();
                    

            //     });
            // });    

            const titleAppointmentElement = document.createElement('p');
            titleAppointmentElement.classList.add("appointment-interval");
            titleAppointmentElement.classList.add("appointment-interval-title");
            titleAppointmentElement.innerText = `${isJSON(appointment.patients) ? JSON.parse(appointment.patients)[0].firstname : appointment.patients[0].firstname} ${isJSON(appointment.patients) ? JSON.parse(appointment.patients)[0].lastname : appointment.patients[0].lastname} -> ${appointment.title}`;
            titleAppointmentElement.style.color = getContrastForText(doctorColor);
            
            currentGaps[startIdx].appendChild(titleAppointmentElement);

            // const patientNameElement = document.createElement('p');
            // patientNameElement.classList.add("appointment-interval");
            // console.log(appointment.patients);
            // patientNameElement.innerText = `${isJSON(appointment.patients) ? JSON.parse(appointment.patients)[0].firstname : appointment.patients[0].firstname} ${isJSON(appointment.patients) ? JSON.parse(appointment.patients)[0].lastname : appointment.patients[0].lastname}`;
            // patientNameElement.style.top = 'calc(-100% + 60px)';
            // patientNameElement.style.fontSize = '20px';
            // patientNameElement.style.color = getContrastForText(doctorColor);
            // currentGaps[startIdx].appendChild(patientNameElement);

            currentGaps[endIdx].classList.add("resizeable");
            currentGaps[endIdx].classList.add("resizeable-down");
            console.log(currentGaps[startIdx]);
            const appointmentHourIdx = Number(currentGaps[startIdx].getAttribute("starthour")) - startHour;
            const appointmentGapIdx = Number(currentGaps[startIdx].getAttribute("key"));
            console.log(currentGaps[startIdx].parentElement);
            currentGaps[endIdx].addEventListener("mousedown", () => {
                console.log(currentGaps[startIdx]);
                initiateAppointment(currentGaps[startIdx], appointmentHourIdx, appointmentGapIdx, true);
            });

            currentGaps[endIdx].addEventListener("mousemove", e => {
                moveAppointment(e, true, currentGaps[startIdx]);
            });

            currentGaps[endIdx].addEventListener("mouseup", e => resizeAppointment(e));

            const activeGaps = [...currentGaps].filter(currentGap => currentGap.classList.contains("highlight") && currentGap.classList.contains("created"));

            // Hover appointment event
            console.log(activeGaps);
            activeGaps.forEach((currentGap, idx) => {
                currentGap.addEventListener("mouseover", e => {
                    let firstIdx = idx, lastIdx = idx;
                    while (!activeGaps[firstIdx].classList.contains("resizeable-up")) {
                        activeGaps[firstIdx].classList.add("mouse-over-gap");
                        if (firstIdx === 0) break;
                        firstIdx--;
                    }
                    
                    if (firstIdx >= 0) activeGaps[firstIdx].classList.add("mouse-over-gap");
                    
                    while (!activeGaps[lastIdx].classList.contains("resizeable-down")) {
                        activeGaps[lastIdx].classList.add("mouse-over-gap")
                        if (lastIdx === activeGaps.length - 1) break;
                        lastIdx++;
                    }

                    if (lastIdx <= activeGaps.length - 1) activeGaps[lastIdx].classList.add("mouse-over-gap")

                });

                currentGap.addEventListener("mouseout", e => {
                     
                    let firstIdx = idx, lastIdx = idx;
                    while (!activeGaps[firstIdx].classList.contains("resizeable-up")) {
                        activeGaps[firstIdx].classList.remove("mouse-over-gap")
                        if (firstIdx === 0) break;
                        firstIdx--;
                    }

                    if (firstIdx >= 0) activeGaps[firstIdx].classList.remove("mouse-over-gap");
                    
                    while (!activeGaps[lastIdx].classList.contains("resizeable-down")) {
                        activeGaps[lastIdx].classList.remove("mouse-over-gap")
                        if (lastIdx === activeGaps.length - 1) break;
                        lastIdx++;
                    }

                    if (lastIdx <= activeGaps.length - 1) activeGaps[lastIdx].classList.remove("mouse-over-gap")
                });
            });
            // currentGaps[startIdx].innerHTML = `<p class='appointment-interval'>${startHourAppointment < 10 ? `0${startHourAppointment}` : startHourAppointment}:${startMinutesAppointment < 10 ? `0${startMinutesAppointment}` : startMinutesAppointment}-${endHourAppointment < 10 ? `0${endHourAppointment}` : endHourAppointment}-${endMinutesAppointment < 10 ? `0${endMinutesAppointment}` : endMinutesAppointment}<br /> ${appointment.title}</p>`;
            
        });
    }, [date, appointments, filterActive, days]);

    useEffect(() => {
        if (appointmentPatient === "") {
            setAppointmentPatientsList([]);
            return;
        }
        (async () => {
            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    organisationId: data.organisation._id,
                    searchQuery: appointmentPatient
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-patient`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) setAppointmentPatientsList(response.patients);
            else setAppointmentPatientsList([]);

        })();
    }, [appointmentPatient]);

    const setWorkingWeek = () => {
        let currDate = date;
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
            console.log("unshift");
            dayIdx--;
        }

        return currWeek;
    };

    const setWeek = () => {

        let currDate = date;
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
            console.log("unshift");
            dayIdx--;
        }

        // First day (sunday) must be the last day

  
        currWeek.shift();
        const addDay = new Date(currWeek[currWeek.length - 1].getTime() + 24 * 60 * 60 * 1000);
        currWeek.push(addDay);
        return currWeek;
    };

    const getMonthData = (doctorColor) => {

        const daysInMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        console.log(new Date(date.getFullYear(), date.getMonth(), 0));
        const dayComponents = [];
        const firstDate = date;
        for (let currDay = 1; currDay <= daysInMonth; currDay++) {
            const currDate = new Date(date.getFullYear(), date.getMonth(), currDay);
            console.log(currDate);
            const currAppointments = appointments.filter((appointment, idx) => {
               
                return new Date(appointment.startDate).getDate() === currDate.getDate() && 
                new Date(appointment.startDate).getMonth() === currDate.getMonth() && currDate.getFullYear() === currDate.getFullYear();
            });
            console.log(currAppointments, currDay);
            dayComponents.push(
                <div className="month-day" key={currDay} onDoubleClick={() => {
                    setFilterActive(0);
                    setDate(currDate => new Date(currDate.getFullYear(), currDate.getMonth(), currDay));
                    setDays([date]);
                }}>
                    <p className={`day-number`} onClick={() => {
                        setFilterActive(0);
                        setDate(currDate => new Date(currDate.getFullYear(), currDate.getMonth(), currDay));
                        setDays([date]);
                    }}>{currDay}</p>
                    <div className="month-appointments">
                        {currAppointments.map((appointment, idx) => {
                            const appointmentDoctorId = isJSON(appointment.users) ? JSON.parse(appointment.users)[0] : appointment.users[0];
                            const currDoctor = data.organisation.doctors.find(doctor => doctor._id === appointmentDoctorId);
                            const currDoctorColor = currDoctor?.color;
                            return (<div style={{ "--doctor-color-css": currDoctorColor || doctorColor }} key={idx} className="month-appointment" onClick={() => {
                                setActiveEditAppointment(true);
                                setAppointmentTitle(appointment.title);
                                setAppointmentPatient(`${JSON.parse(appointment.patients)[0].firstname} ${JSON.parse(appointment.patients)[0].lastname}`);
                                setAppointmentPatientsList([]);
                                setAppointmentPatientData(appointment.patients[0]);
                                setAppointmentStartHour(new Date(appointment.startDate).getHours() < 10 ? `0${new Date(appointment.startDate).getHours()}` : new Date(appointment.startDate).getHours());
                                setAppointmentStartMinutes(new Date(appointment.startDate).getMinutes() < 10 ? `0${new Date(appointment.startDate).getMinutes()}` : new Date(appointment.startDate).getMinutes());
                                setAppointmentEndHour(new Date(appointment.endDate).getHours() < 10 ? `0${new Date(appointment.endDate).getHours()}` : new Date(appointment.endDate).getHours());
                                setAppointmentEndMinutes(new Date(appointment.endDate).getMinutes() < 10 ? `0${new Date(appointment.endDate).getMinutes()}` : new Date(appointment.endDate).getMinutes());
                                setAppointmentCost(appointment.income);
                                setAppointmentId(appointment._id);
                                setAppointmentNotes(appointment.notes);
                                setAppointmentFinished(appointment.finished);
                                setAppointmentConfirmed(appointment.confirmed);
                            }}>
                                <p>{appointment.title.substring(0, 9)}{appointment.title.length <= 10 ? "" : ".."}</p>
                                <p>{new Date(appointment.startDate).getHours()}:{new Date(appointment.startDate).getMinutes()}</p>
                              
                            </div>);
                        })}
                    </div>
                </div>
            );
        }

        return dayComponents;
    };

    const getYearData = (doctorColor) => {
        return months.map((currMonth, monthIdx) => {
            const daysInMonth = new Date(date.getFullYear(), monthIdx + 1, 0).getDate();
            const currDays = [];
            for (let currDay = 1; currDay <= daysInMonth; currDay++) 
                currDays.push(currDay);
            
            return (
                <div className="year-month-container" key={monthIdx}>
                    <p className="month-number" onClick={() => {
                        setMonth(monthIdx);
                        setDate(currDate => new Date(currDate.getFullYear(), monthIdx, 1));
                        setFilterActive(3);
                    }}>{currMonth}</p>
                    <div className="month-data" key={monthIdx}>
                        {currDays.map((currDay, dayIdx) => (
                            <div className="month-day" key={monthIdx * dayIdx + dayIdx}>
                                <p className="day-number" onClick={() => {
                                    setDate(currDate => {

                                        return new Date(currDate.getFullYear(), monthIdx, currDay);
                                    });
                                    setDays([date]);
                                    setFilterActive(0);

                              

                                }}>{currDay}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    const patientNotSaved = () => {
        setPatientSaved(false);
        setAppointmentPatientsList([]);
        setAppointmentPatientData({});
        setPhoneNumberReadOnly(false);
    };

    const patientGotSaved = () => {
        setPatientSaved(true);
        setActiveCreatePatient(true);
        setPhoneNumberReadOnly(true);
    };

    const changeActiveDoctors = (currActiveDoctors) => {
        setDoctors(currActiveDoctors);
    };

    // Checking if is json
    const isJSON = (json) => {
        
        try {
            JSON.parse(json);
        } catch (e) {
            return false;
        }

        return true;
    };

    const isInDoctorInterval = (startHour, startMinutes, dayDate, doctorSchedules) => {
        if (doctorSchedules.length === 0) return false;
        const gapStartTime = Number(startHour) * 60 + Number(startMinutes);
        const sameDayDoctorSchedules = doctorSchedules.filter(doctorSchedule => sameDay(new Date(dayDate), new Date(doctorSchedule.date)));
        if (sameDayDoctorSchedules.length === 0) return false;

        return sameDayDoctorSchedules.some(doctorSchedule => {
            const doctorScheduleStart = Number(doctorSchedule.startHour) * 60 + Number(doctorSchedule.startMinutes);
            const doctorScheduleEnd = Number(doctorSchedule.endHour) * 60 + Number(doctorSchedule.endMinutes);
            return gapStartTime >= doctorScheduleStart && gapStartTime + minutesPerGap <= doctorScheduleEnd;
        });
    };  

    return !activeCreatePatient ? (
        <div className="appointments">
            <Navigation page="appointments" />

            <div className="content">
                <Header data={data} />
                <div className="filter" ref={filterRef}>
                    {filterRef && filterRef.current && filters.map((filter, idx) => (
                        <div key={idx} className={idx === filterActive ? "active" : ""} onClick={e => {
                         
                            setFilterActive(idx);
                            if (idx === 0) setDays([date]);
                            if (idx === 1) setDays(setWorkingWeek());
                            else if (idx === 2) setDays(setWeek());
                       }}>
                            <p>{filter}</p>
                        </div>
                    ))}
                </div>
                
       
                <div className="day-title">
                    <div className="half">
                        <div className="title-btn" onClick={() => {
                            if (filterActive === 0) {
                                setDate(currDate => {
                                    const newDate = new Date(currDate.getTime() - 24 * 60 * 60 * 1000);
                                    setDays([newDate]);
                                    return newDate;
                                });
                                
                            }
                            else if (filterActive === 1 || filterActive === 2) setDays(currDays => {
                                console.log(currDays);
                                const newDays = currDays.map(currDay => {
                                    console.log(currDay);
                                    return new Date(currDay.getTime() - 7 * 24 * 60 * 60 * 1000)
                                });
                                setMonth(newDays[newDays.length - 1].getMonth());
                                return newDays;
                            });

                            else if (filterActive === 3) {
                                if (month === 0) {
                                    setMonth(11);
                                    setYear(currYear => currYear - 1);
                                }
                                else setMonth(currMonth => currMonth - 1);
                            }

                            else if (filterActive === 4) {
                                if (year < 0) return;
                                setYear(currYear => currYear - 1);
                            }
                            
                        }}>
                            <FontAwesomeIcon icon={faAngleLeft} className="title-icon" />
                        </div>
                        <p>
                            {
                                filterActive === 0 ? `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}` :
                                filterActive === 1 || filterActive === 2 ? `${days[0].getDate()} - ${days[days.length - 1].getDate()} ${months[month]} ${year}` :
                                filterActive === 3 ? `${months[month]} ${year}`:
                                filterActive === 4 ? `${year}` :
                                null
                            }
                        </p>
                        <div className="title-btn" onClick={() => {
                            if (filterActive === 0) {
                                setDate(currDate => {
                                    const newDate = new Date(currDate.getTime() + 24 * 60 * 60 * 1000);
                                    setDays([newDate]);
                                    return newDate;
                                });
                            }
                            else if (filterActive === 1 || filterActive === 2) setDays(currDays => {
                                console.log(currDays);
                                const newDays = currDays.map(currDay => {
                                    console.log(currDay);
                                    return new Date(currDay.getTime() + 7 * 24 * 60 * 60 * 1000)
                                });
                                setMonth(newDays[newDays.length - 1].getMonth());
                                return newDays;
                            }); 
                            else if (filterActive === 3) {
                                
                                if (month === 11) {
                                    setMonth(0);
                                    setYear(currYear => currYear + 1);
                                }
                                else setMonth(currMonth => currMonth + 1);

                                
                            }
                            else if (filterActive === 4) {
                                setYear(currYear => currYear + 1);
                            }
                        }}>
                            <FontAwesomeIcon icon={faAngleRight} className="title-icon" />
                        </div>
                    </div>

                    <div className="half">
                        <p className="normal-text" onClick={() => {
                           
                            setFilterActive(0);
                            setDate(new Date());
                            setDays([new Date()]);
                        }}>{cookies.langauge === "en" ? "Today" : "Astazi"}</p>
                    </div>
                </div>

                <DoctorsFilter data={data} changeValue={changeActiveDoctors} />

                <div className="options-appointments">
                    <div className="option">
                        <div className={`option-icon ${activeGaps ? "active" : ""}`} onClick={() => setActiveGaps(currStatus => !currStatus)}>
                            {activeGaps && <FontAwesomeIcon icon={faCheck} className="tick-icon" />}
                        </div>
                        <p>{cookies.language === "en" ? "Visible intervals" : "Intervale vizibile"}</p>
                    </div>
                </div>
            
                {doctors && doctors.length <= 3 && <div className="scheduler">
                    {filterActive !== 3 && filterActive !== 4 && 
                        <div className="hours">
                            {hours.map((hour, hourIdx) => (
                                <div className="hour" key={hourIdx}>
                                    <p>{hour < 10 ? `0${hour}:00` : `${hour}:00`}</p>
                                </div>
                            ))}
                        </div>
                    }

                    <div className="schedules" style={{ marginTop: hourContainerHeight }}>
                        {filterActive !== 3 && filterActive !== 4 ? doctors && doctors.length > 0 && doctors.map((doctor, idx) => (
                            
                            <div className="schedule-parent-container" key={idx}>
                                <h2 className="doctors-title">{doctor.firstname} {doctor.lastname}</h2>
                                <div className={`schedule-container ${activeGaps ? "active-gaps" : ""}`} key={idx} ref={ref => doctorRef.current[idx] = ref}>
                                    {days && days.length > 0 && days.map((day, dayIdx) => (
                                        filterActive === 0 ? (
                                            <div className={"day-container"} key={dayIdx}>
                                                {getSchedule(new Date(day), doctor.color, doctor)}
                                            </div>
                                        ) : filterActive === 1 || filterActive === 2 ? (
                                            <div key={dayIdx} className="day-of-week-container">
                                                <h2>{`${daysOfWeek[day.getDay()]} ${day.getDate()}`}</h2>
                                                <div className="day-container" >
                                                    {getSchedule(new Date(day), doctor.color, doctor)}
                                                </div>
                                            </div>
                                        ) : null
                                    
                                    ))}
                                
                                </div> 
                            </div> 
                            
                        )) : filterActive === 3 ? (
                            <div className="month-schedule">
                                {getMonthData(doctors[0].color)}
                            </div>
                        ) : filterActive === 4 ? (
                            <div className="year-schedule">
                                {getYearData(doctors[0].color)}
                            </div>
                        ) : null}
                    </div>
                    
                </div>}

                {doctors && doctors.length > 3 && 
                     <div className="scheduler flex-column">
                    

                     <div className="schedules flex-column" style={{ marginTop: hourContainerHeight }}>
                         {doctors && doctors.length > 0 && doctors.map((doctor, idx) => (
                             filterActive !== 3 && filterActive !== 4 ?
                             <div className="schedule-content" key={idx}>
                                 <div className="hours">
                                     {hours.map((hour, hourIdx) => (
                                         <div className="hour" key={hourIdx}>
                                             <p>{hour < 10 ? `0${hour}:00` : `${hour}:00`}</p>
                                         </div>
                                     ))}
                                 </div>
 
                                 <div className="schedule-parent-container flex-column">
                                     <h2 className="doctors-title">{doctor.firstname} {doctor.lastname}</h2>
                                     <div className={`schedule-container ${activeGaps ? "active-gaps" : ""}`} key={idx} ref={ref => doctorRef.current[idx] = ref}>
                                         {days && days.length > 0 && days.map((day, dayIdx) => (
                                             filterActive === 0 ? (
                                                 <div className="day-container" key={dayIdx}>
                                                     {getSchedule(day, doctor.color, doctor)}
                                                 </div>
                                             ) : filterActive === 1 || filterActive === 2 ? (
                                                 <div key={dayIdx} className="day-of-week-container">
                                                     <h2>{`${daysOfWeek[day.getDay()]} ${day.getDate()}`}</h2>
                                                     <div className="day-container" >
                                                         {getSchedule(day, doctor.color, doctor)}
                                                     </div>
                                                 </div>
                                             ) : null
                                         
                                         ))}
                                     
                                     </div> 
                                 </div> 
                             </div>
                             : filterActive === 3 ?
                             <div className="month-schedule" key={idx} ref={ref => doctorRef.current[idx] = ref}>
                                 {getMonthData(doctor.color)}
                             </div> : filterActive === 4 ?
                             <div className="year-schedule" key={idx} ref={ref => doctorRef.current[idx] = ref}>
                                 {getYearData(doctor.color)}
                             </div> : null
                         ))}
                     </div>
                     
                 </div>
                }

                <div className={`appointment-details ${activeCreateAppointment ? "active" : ""}`}>
                    <div className="appointment-details-card">
                        <div className="close-button">
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => closeCreateAppointment()} />
                        </div>

                        <h2 className="appointment-details-title">{cookies.language === "en" ? "Appointment Details" : "Detalii programare"}</h2>
                    
                        <div className="appointment-details">
                            <div className="label one-row">
                                <p>{cookies.languge === "en" ? "Title" : "Titlu"}</p>
                                <input type="text" value={appointmentTitle} onChange={e => setAppointmentTitle(e.target.value)} placeholder={cookies.language === "en" ? "Title" : "Titlu"} className="row" />
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "Patient" : "Pacient"}</p>
                                <input type="text" value={appointmentPatient} onChange={e => setAppointmentPatient(e.target.value)} placeholder={cookies.language === "en" ? "Patient" : "Pacient"} />
                                
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "Phone Number" : "Numar telefon"}</p>
                                <input type="number" className="number-input" value={appointmentPatientPhoneNumber} onChange={e => setAppointmentPatientPhoneNumber(e.target.value)} readOnly={phoneNumberReadOnly} />
                            </div>

                            <div className={`patient-list-container ${appointmentPatient.length > 0 && !appointmentPatientData ? "active" : ""}`}>
                                    {appointmentPatientsList && appointmentPatientsList.length > 0 ?
                                        <div className="patient-list">
                                            {appointmentPatientsList.map((patient, idx) => (
                                                <div className="patient-container" key={idx} onClick={() => {
                                                    console.log(patient);
                                                    setAppointmentPatient(`${patient.firstname} ${patient.lastname}`);
                                                    setAppointmentPatientsList([]);
                                                    setAppointmentPatientData(patient);
                                                    setAppointmentPatientPhoneNumber(Number(patient.phone));
                                                }}>
                                                    <FontAwesomeIcon icon={faUser} className="user-icon" />
                                                    <p>{patient.firstname} {patient.lastname} {patient.fileNumber || idx + 1}</p>
                                                </div>
                                            ))}
                                        </div> : appointmentPatient.length > 0 && !appointmentPatientData &&
                                        <div className="add-patient-container">
                                            <p className="normal-text">{cookies.language === "en" ? "No patient found." : "Niciun pacient gasit."}</p>
                                            <div className="line-patient">
                                                <p className="normal-text">{cookies.language === "en" ? "Do you want to add a new patient?" : "Doriti sa adaugati un pacient nou?"}</p>
                                                <br />
                                                <button type="button" onClick={() => patientGotSaved()}>{cookies.language === "en" ? "YES" : "DA"}</button>
                                                <button type="button" onClick={() => patientNotSaved()}>{cookies.language === "en" ? "NO" : "NU"}</button>
                                            </div>
                                        </div>
                                    }
                            </div>
           
                            <div className={`non-visible ${appointmentPatient.length > 0 && !appointmentPatientData ? "active" : ""}`} />

                            <div className="label">
                                <p>{cookies.language === "en" ? "Start Hour" : "Ora inceput"}</p>
                                <div className="label-row">
                                    <div className="input">
                                        <input type="number" onChange={e => setAppointmentStartHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={appointmentStartHour < 10 ? `0${appointmentStartHour}` : appointmentStartHour} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => (Number(appointmentStartHour) + 1 <= endHour) && setAppointmentStartHour(value => Number(value) + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => (Number(appointmentStartHour) - 1 >= startHour) && setAppointmentStartHour(value => Number(value) - 1)} />
                                        </div>

                                    </div>
                                    <div className="input">
                                        <input type="number" value={appointmentStartMinutes < 10 ? `0${appointmentStartMinutes}` : appointmentStartMinutes} onChange={e => setAppointmentStartMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"}  />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => {
                                                if (Number(appointmentStartMinutes) + minutesPerGap < 60) setAppointmentStartMinutes(value => Number(value) + minutesPerGap) 
                                                else if (Number(appointmentStartHour) < endHour) {
                                                    setAppointmentStartHour(currHour => Number(currHour) + 1);
                                                    setAppointmentStartMinutes(0);
                                                }
                                            }} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => {
                                                if (Number(appointmentStartMinutes) - minutesPerGap >= 0) setAppointmentStartMinutes(value => value - minutesPerGap);
                                                else if (Number(appointmentStartHour) > startHour) {
                                                    setAppointmentStartHour(currHour => Number(currHour) - 1);
                                                    setAppointmentStartMinutes(60 - minutesPerGap);
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "End Hour" : "Ora sfarsit"}</p>
                                <div className="label-row">
                                    <div className="input">
                                        <input type="text" placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={Number(appointmentEndHour) < 10 ? `0${Number(appointmentEndHour)}` : Number(appointmentEndHour)} onChange={e => setAppointmentEndHour(Number(e.target.value))} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => Number(appointmentEndHour) + 1 <= Number(endHour) && setAppointmentEndHour(value => Number(value) + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => Number(appointmentEndHour) - 1 >= Number(startHour) && setAppointmentEndHour(value => Number(value) - 1)} />
                                        </div>
                                    </div>

                                    <div className="input">
                                        <input type="number" placeholder={cookies.language === "en" ? "Minutes" : "Minute"} value={appointmentEndMinutes < 10 ? `0${appointmentEndMinutes}` : appointmentEndMinutes} onChange={e => setAppointmentEndMinutes(e.target.value)} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => {
                                                if (Number(appointmentEndMinutes) + minutesPerGap < 60) setAppointmentEndMinutes(value => Number(value) + minutesPerGap);
                                                else if (Number(appointmentEndHour) < endHour) {
                                                    setAppointmentEndHour(currHour => Number(currHour) + 1);
                                                    setAppointmentEndMinutes(0);
                                                }
                                            }} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => {
                                                if (Number(appointmentEndMinutes) - minutesPerGap >= 0) setAppointmentEndMinutes(value => Number(value) - minutesPerGap);
                                                else if (Number(appointmentEndHour) > startHour) {
                                                    setAppointmentEndHour(currHour => Number(currHour) - 1);
                                                    setAppointmentEndMinutes(60 - minutesPerGap);
                                                }
                                            }} />
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "Cost" : "Cost"}</p>
                                <div className="appointment-input">
                                    <div className="scale scale-left" onClick={() => setAppointmentCost(currValue => Number(currValue) - 1)}>
                                        <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                    </div>
                                    <input type="number" className="number-input" value={appointmentCost} onChange={e => setAppointmentCost(e.target.value)} placeholder={cookies.language === "en" ? "Cost" : "Cost"} />
                                    <div className="scale scale-right" onClick={() => setAppointmentCost(currValue => Number(currValue) + 1)}>
                                        <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                    </div>
                                </div>
                            </div>

                            {/* <div className="label" style={{ opacity: 0 }}>
                                <p>{cookies.language === "en" ? "Type of income" : "Moneda"}</p>
                                <select value={appointmentTypeIncome} onChange={e => setAppointmentTypeIncome(e.target.value)}>
                                    <option value="LEI">LEI</option>
                                </select>
                            </div> */}

                            {appointmentDateValue && <div className="label">
                                <p>{cookies.language === "en" ? "Date" : "Data"}</p>
                                <input type="date" value={new Date(appointmentDateValue).toISOString().substring(0, 10)} onChange={e => setAppointmentDateValue(e.target.value)}/>
                            </div>}

                            <div className="label one-row">
                                <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                                <textarea value={appointmentNotes} onChange={e => setAppointmentNotes(e.target.value)} placeholder={cookies.language === "en" ? "Notes" : "Observatii"} />
                            </div>

                        </div>

                        <button type="button" className="add-appointment" onClick={async () => await sendAppointment()}>
                            <p>{cookies.language === "en" ? "Create appointment" : "Creeaza programarea"}</p>
                        </button>

                    </div>
                </div>

                <div className={`appointment-details ${activeEditAppointment ? "active" : ""}`}>
                    <div className="appointment-details-card">
                        <div className="close-button">
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => closeEditAppointment()} />
                        </div>

                        <h2 className="appointment-details-title">{cookies.language === "en" ? "Edit appointment" : "Editare programare"}</h2>
                    
                        <div className="appointment-details">

                            <div className="label one-row">
                                <p>{cookies.languge === "en" ? "Title" : "Titlu"}</p>
                                <input type="text" value={appointmentTitle} onChange={e => setAppointmentTitle(e.target.value)} placeholder={cookies.language === "en" ? "Title" : "Titlu"} className="row" />
                            </div>
                            
                            <div className="label one-row">
                                <p>{cookies.language === "en" ? "Patient" : "Pacient"}</p>
                                <input type="text" value={appointmentPatient} onChange={e => setAppointmentPatient(e.target.value)} placeholder={cookies.language === "en" ? "Patient" : "Pacient"} />
                                {appointmentPatientsList && appointmentPatientsList.length > 0 && 
                                    <div className="patient-list">
                                        {appointmentPatientsList.map((patient, idx) => (
                                            <div className="patient-container" key={idx} onClick={() => {
                                                setAppointmentPatient(`${patient.firstname} ${patient.lastname}`);
                                                setAppointmentPatientsList([]);
                                            }}>
                                                <p>{patient.firstname} {patient.lastname} {patient.fileNumber || idx + 1}</p>
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "Start Hour" : "Ora inceput"}</p>
                                <div className="label-row">
                                    <div className="input">
                                        <input type="number" onChange={e => setAppointmentStartHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={appointmentStartHour} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => appointmentStartHour + 1 <= endHour && setAppointmentStartHour(value => value + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => appointmentStartHour - 1 >= startHour && setAppointmentStartHour(value => value - 1)} />
                                        </div>

                                    </div>
                                    <div className="input">
                                        <input type="number" value={appointmentStartMinutes} onChange={e => setAppointmentStartMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"}  />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => appointmentStartMinutes + minutesPerGap < 60 && setAppointmentStartMinutes(value => value + minutesPerGap)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => appointmentStartMinutes - minutesPerGap >= 0 && setAppointmentStartMinutes(value => value - minutesPerGap)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "End Hour" : "Ora sfarsit"}</p>
                                <div className="label-row">
                                    <div className="input">
                                        <input type="number" placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={appointmentEndHour} onChange={e => setAppointmentEndHour(Number(e.target.value))} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => Number(appointmentEndHour) + 1 <= Number(endHour) && setAppointmentEndHour(value => Number(value) + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => Number(appointmentEndHour) - 1 >= Number(startHour) && setAppointmentEndHour(value => Number(value) - 1)} />
                                        </div>
                                    </div>
                                    <div className="input">
                                        <input type="number" placeholder={cookies.language === "en" ? "Minutes" : "Minute"} value={appointmentEndMinutes} onChange={e => setAppointmentEndMinutes(e.target.value)} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => appointmentEndMinutes + minutesPerGap < 60 && setAppointmentEndMinutes(value => value + minutesPerGap)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => appointmentEndMinutes - minutesPerGap >= 0 && setAppointmentEndMinutes(value => value - minutesPerGap)}/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "Cost" : "Cost"}</p>
                                
                                <div className="appointment-input">
                                    <div className="scale scale-left" onClick={() => setAppointmentCost(currValue => currValue - 1)}>
                                        <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                    </div>
                                    <input type="number" className="number-input" value={appointmentCost} onChange={e => setAppointmentCost(e.target.value)} placeholder={cookies.language === "en" ? "Cost" : "Cost"} />
                                    <div className="scale scale-right" onClick={() => setAppointmentCost(currValue => currValue + 1)}>
                                        <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                    </div>
                                </div>
                            </div>

                            <div className="label" style={{ opacity: 0 }}>
                                <p>{cookies.language === "en" ? "Type of income" : "Moneda"}</p>
                                <select value={appointmentTypeIncome} onChange={e => setAppointmentTypeIncome(e.target.value)}>
                                    <option value="LEI">LEI</option>
                                </select>
                            </div>

                            <div className="label one-row">
                                <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                                <textarea value={appointmentNotes} onChange={e => setAppointmentNotes(e.target.value)} placeholder={cookies.language === "en" ? "Notes" : "Observatii"} />
                            </div>

                            <div className="label flex">
                                <div className="check-box" onClick={() => setAppointmentConfirmed(currStatus => !currStatus)}>
                                    <FontAwesomeIcon 
                                        icon={faCheck} 
                                        className={`check-icon ${appointmentConfirmed ? "active" : ""}`}  
                                    />
                                </div>

                                <p>{cookies.language === "en" ? "Appointment Confirmed" : "Programare Confirmata"}</p>
                            </div>

                            <div className="label flex">
                                <div className="check-box" onClick={() => setAppointmentFinished(currStatus => !currStatus)}>
                                    <FontAwesomeIcon 
                                        icon={faCheck} 
                                        className={`check-icon ${appointmentFinished ? "active" : ""}`}  
                                    />
                                </div>

                                <p>{cookies.language === "en" ? "Appointment Finished" : "Programare Finalizata"}</p>
                            </div>

                            <div className="label">
                                <button className="option-btn" onClick={async () => await removeAppointment(appointmentId)}>
                                    <FontAwesomeIcon icon={faTimes} className="option-icon" />
                                    <p>{cookies.language === "en" ? "Remove appointment" : "Sterge"}</p>
                                </button>
                            </div>

                            <div className="label">
                                <button className="option-btn">
                                    <FontAwesomeIcon icon={faBan} className="option-icon" />
                                    <p>{cookies.language === "en" ? "Cancel appointment" : "Anuleaza"}</p>
                                </button>
                            </div>

                        </div>

                        {errorMessage.length > 0 && 
                            <p className="error-message">{errorMessage}</p>
                        }

                        <button type="button" className="add-appointment" onClick={async () => await editAppointment(appointmentId)}>
                            <p>{cookies.language === "en" ? "Save changes" : "Salveaza modificarile"}</p>
                        </button>

                    </div>
                </div>

                {appointmentIntervalWarning && 
                    <div className="appointment-warning">

                        <div className="warning-card" style={{ top: `${document.documentElement.scrollTop + (document.documentElement.clientHeight) / 2}px`}}>
                            <div className="text-warning">
                                <p>
                                    {cookies.language === "en" ? "The doctor doesn't have a schedule at the chosen time." : "Medicul nu are un program la ora aleasa."} 
                                    <br />
                                    {cookies.language === "en" ? "Do you want to add the appointment anyway?" : "Doriti sa adaugati programarea oricum?"}
                                </p>
                            </div>

                            <div className="response-buttons">
                                <button type="button" onClick={() => createAppointmentNotInInterval()}>
                                    <p>{cookies.langauge === "en" ? "Yes" : "Da"}</p>
                                </button>

                                <button type="button" onClick={() => removeAppointmentNotInInterval()}>
                                    <p>{cookies.language === "en" ? "No" : "Nu"}</p>
                                </button>
                            </div>

                        </div>
                    </div>
                }

                {activePlusButton ? <div className="add-button" onClick={() => setActiveCreateAppointment(true)}>
                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                </div> : null}

           
                <div className={`error-message-button ${activeErrorMessage ? "active" : ""}`}>
                    <p>{cookies?.language === "en" ? "You can't create / edit an appointment in the past!" : "Nu puteti crea / edita o programare in trecut!"}</p>
                </div> 
             
            </div>
        </div>
    ) : <CreatePatient data={data} fromAppointments={true} />;
};

export default Appointments;