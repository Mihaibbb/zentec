import "../DoctorSchedule/DoctorSchedule.css";
import './Appointments.css';
import Navigation from '../Components/Navigation/Navigation';
import Header from '../Components/Header/Header';
import { useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faAngleDown, faAngleLeft, faAngleRight, faAngleUp, faBan, faMinus, faPlus, faTimes, faUser, faTicket } from '@fortawesome/free-solid-svg-icons';
import { useCookies } from 'react-cookie';
import CreatePatient from '../CreatePatient/CreatePatient';
import DoctorsFilter from '../Components/DoctorsFilter/DoctorsFilter';
import getContrastForText from '../Functions/Contrast';
import Select from "react-select";
import DateCustomInput from "../Components/DatePicker/DatePicker";
import ReactDOM from "react-dom";

const Appointments = ({ data }) => {

    const currDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const [cookies, setCookie] = useCookies();
    const months = cookies.language === "en" ? 
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] :
    ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

    const daysOfWeek = cookies.language === "en" ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam'];
    const [date, setDate] = useState(window.history?.state?.date || new Date());
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
    const [filterActive, setFilterActive] = useState(window.history?.state?.filterActive || 0);
    const [doctors, setDoctors] = useState(data.organisation.doctors);
    const [doctorNameValue, setDoctorNameValue] = useState();
    const [doctorValue, setDoctorValue] = useState();
    
    const [appointments, setAppointments] = useState(data.organisation.schedules);
    const [appointmentDoctorId, setAppointmentDoctorId] = useState();
    const [appointmentDateValue, setAppointmentDateValue] = useState(new Date());
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

    // State for date picker calendars are open
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openDatePickerCreateApp, setOpenDatePickerCreateApp] = useState(false);
    const [openDatePickerEditApp, setOpenDatePickerEditApp] = useState(false);

    // Dragging variables
    const [dragAppointment, setDragAppointment] = useState(false);
    const [dragPosition, setDragPosition] = useState(0);
    const [dragGaps, setDragGaps] = useState([]);
    const [dragInitStartHour, setDragInitStartHour] = useState();
    const [dragInitStartMinutes, setDragInitStartMinutes] = useState();
    const [dragInitEndHour, setDragInitEndHour] = useState();
    const [dragInitEndMinutes, setDragInitEndMinutes] = useState();
    const [dragDataAppointment, setDragDataAppointment] = useState();
    const [inMoveDragging, setInMoveDragging] = useState(false);
    const [lastDragDirection, setLastDragDirection] = useState(""); 

    // Resizing variables
    const [resizeAppointment, setResizeAppointment] = useState(false);
    const [resizePosition, setResizePosition] = useState();
    const [resizeInitStartHour, setResizeInitStartHour] = useState();
    const [resizeInitStartMinutes, setResizeInitStartMinutes] = useState();
    const [resizeInitEndHour, setResizeInitEndHour] = useState();
    const [resizeInitEndMinutes, setResizeInitEndMinutes] = useState();
    const [activeResizing, setActiveResizing] = useState(false);
    const [inMoveResizing, setInMoveResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState();

    const [phoneNumberReadOnly, setPhoneNumberReadOnly] = useState(true);
    const [patientSaved, setPatientSaved] = useState(true);
    const [appointmentId, setAppointmentId] = useState();
    const [statusMessage, setStatusMessage] = useState();
    const [activeGaps, setActiveGaps] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeErrorMessage, setActiveErrorMessage] = useState();
    const weekdayLabelsText = { ro: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']};

    const [headerElement, setHeaderElement] = useState(null);

    const doctorOptions = data.organisation.doctors.map(doctor => {
        return {
            value: `${doctor._id}`,
            label: `${doctor.firstname} ${doctor.lastname}`
        };
    });

    const customStyles = {
        control: (base, state) => ({
            ...base,
            background: "var(--dark-color)",
            border: "none",
            borderRadius: 10,
            width: "90%",
            margin: "0 auto",
            boxShadow: "0 0 10px var(--contrast-color)",
            color: "#000"
        }),

        option: (provided, state) => ({
            ...provided,
            color: "var(--text-color)",
            background: state.isSelected ? "var(--contrast-color)" : state.isFocused ? "var(--selected-color)" : "initial",
            borderRadius: 10
        }),
        
        menu: (provided, state) => ({
            ...provided,
            
            
            background: "var(--dark-color)",
            border: "none",
            borderRadius: 10,
            boxShadow: "0 0 15px var(--dark-color)"
        }),

        singleValue: (provided) => ({
            ...provided,
            color: "var(--text-color)",
            width: "100%"
        })
    };
    
    const hours = [];
    const filterRef = useRef();
    const scheduleRef = useRef();
    const doctorRef = useRef([]);
    const gapsRef = useRef([]);
    const editAppointmentRef = useRef();
    const createAppointmentRef = useRef();
    const scheduleContentRef = useRef([]);
    const scheduleContentContainerRef = useRef([]);


    // const { startHour, endHour, gaps, doctors } = location?.state;
    const startHour = 8;
    const endHour = 20;
    const gaps = 4;
    const minutesPerGap = 60 / gaps;
    
    for (let hour = startHour; hour <= endHour; hour++)  {
        hours.push(hour);   
    }

    const location = useLocation();

    function isTouchDevice() {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    }

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);
    
    useEffect(() => {

        if (document.documentElement.clientWidth <= 500) {
            setFilters(cookies.language === "en" ? ["Day"] : ["Zi"]);
        } else if (document.documentElement.clientWidth <= 800 ) {
            setFilters(cookies.language === "en" ? ["Day", "Working Week"] : ["Zi", "Saptamana Lucratoarea"]);
        } else {
            setFilters(cookies.language === "en" ? ['Day', 'Working Week', 'Week', 'Month', 'Year'] : ['Zi', 'Saptamana Lucratoare', 'Saptamana', 'Luna', 'An']);
        }
        
        if (document.documentElement.clientWidth <= 800 || isTouchDevice()) {
            setActivePlusButton(true);
        }
        else {
            setActivePlusButton(false);
        }

        window.addEventListener("resize", () => {
            if (document.documentElement.clientWidth <= 500) {
                setFilters(cookies.language === "en" ? ["Day"] : ["Zi"]);
            } else if (document.documentElement.clientWidth <= 800 ) {
                setFilters(cookies.language === "en" ? ["Day", "Working Week"] : ["Zi", "Saptamana Lucratoarea"]);
            } else {
                setFilters(cookies.language === "en" ? ['Day', 'Working Week', 'Week', 'Month', 'Year'] : ['Zi', 'Saptamana Lucratoare', 'Saptamana', 'Luna', 'An']);
            }
            
            if (document.documentElement.clientWidth <= 800 || isTouchDevice()) {
                setActivePlusButton(true);
            }
            else {
                setActivePlusButton(false);
            }
        });
    }, [location]);


   
    useEffect(() => {

        if (window.history?.state?.filterActive == null) return;
        if (filterActive === 1) setDays(setWorkingWeek());
        else if (filterActive === 2) setDays(setWeek());
        window.scrollTo(0, window.history?.state?.scrollY);
        window.history.replaceState(null, "");

    }, []);

    useEffect(() => {
        const sleep = setTimeout(() => {
            if (!openDatePicker && !openDatePickerCreateApp && !openDatePickerEditApp) return;
            const datepickerHeaderElements = document.querySelectorAll('.MuiDayPicker-header');
            console.log(datepickerHeaderElements);
            datepickerHeaderElements && datepickerHeaderElements.forEach(datepickerHeaderElement => {
                const weekdayLabels = datepickerHeaderElement.querySelectorAll(".MuiDayPicker-weekDayLabel");
                weekdayLabels && weekdayLabels.forEach((weekdayLabel, idx) => {
                    console.log(weekdayLabel, cookies.language);
                    weekdayLabel.innerText = weekdayLabelsText[cookies.language][idx];
                });
            });
        }, 500);

        return () => clearTimeout(sleep);

    }, [openDatePicker, openDatePickerCreateApp, openDatePickerEditApp]);

    useEffect(() => {
        setHeaderElement(document?.querySelector(".navigation"));
    }, [document?.querySelector(".navigation")]);


    const getSchedule = (dayFormat, doctorColor, doctorObject) => {
        const gapsArr = [];
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
                                ref={ref => gapsRef.current[idx * gapsArr.length + gapIdx] = ref} 
                                onMouseDown={(e) => !e.target.classList.contains("resizeable-down") && !e.target.parentElement.classList.contains("resizeable-down") ? initiateAppointment(e, idx, gapIdx, doctorObject, false) : null}
                                onMouseMove={(e) => moveAppointment(e, doctorColor, false, null, doctorObject)}
                                onMouseUp={async (e) => await createAppointment(e, JSON.parse(doctorObject.schedules))}
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

    useEffect(() => {
        console.log(appointmentDateValue);
    }, [appointmentDateValue]);

    const initiateAppointment = (e, currHour, gap, doctorObject, editing = false) => {

        if (isTouchDevice()) return;
        const target = e.target?.classList.contains("gap") ? e.target : e.target.parentElement;
        const initAppointmentStartHour = currHour + startHour;
        const initAppointmentStartMinutes = gap * minutesPerGap;
        const day = new Date(target.getAttribute("day"));
        const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), initAppointmentStartHour, initAppointmentStartMinutes).getTime();
        const dayTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), initAppointmentStartHour, initAppointmentStartMinutes).getTime();

        if (dayTime < new Date().getTime()) {
            setActiveErrorMessage(true);
            setTimeout(() => setActiveErrorMessage(false), 5000);
            return;
        }

        console.log(day, date);
        if (e.button === 2) return; // check for right click
        if (modifyEvent) return;
        if (editing) return initiateResizeAppointment(target.getBoundingClientRect().y, target.classList.contains("resizeable-down") ? "down" : target.classList.contains("resizeable-up") ? "up" : null,  target.getAttribute("starthour"), target.getAttribute("startminutes"), target.getAttribute("endhour"), target.getAttribute("endminutes"), target.getAttribute("day"));
        
        if (!target.classList.contains("resizeable-down") && target.classList.contains("created")) return initiateDragAppointment(target.getBoundingClientRect().y, target.getAttribute("starthour"), target.getAttribute("startminutes"), target.getAttribute("endhour"), target.getAttribute("endminutes"), target.getAttribute("day"));
        if (target.classList.contains('highlight') && !editing) return;
        if (target.classList.contains("inactive")) return;
        console.log(date, new Date(e.target.getAttribute('day')));
        setAppointmentDateValue(filterActive === 0 ? new Date(date) : new Date(e.target.getAttribute('day')));
        setStartEvent(true);
        setStartPosition(e.clientY);
        
        setAppointmentDoctorId(doctorObject._id);
        console.log(target);
        setFirstElement(target);
        setLastElement(target);
        
        setAppointmentStartHour(currHour + startHour);
        setAppointmentStartMinutes(gap * minutesPerGap);
        setAppointmentEndMinutes((gap + 1) * minutesPerGap >= 60 ? 0 : (gap + 1) * minutesPerGap);
        setAppointmentEndHour((gap + 1) * minutesPerGap >= 60 ? currHour + startHour + 1 : currHour + startHour);
        
    };

    const initiateDragAppointment = (yPos, startHour, startMinutes, endHour, endMinutes, dataGap) => {
        if (inMoveDragging) return;
        setDragAppointment(true);
        setDragPosition(yPos);
        setDragDataAppointment(new Date(dataGap));
    };

    const initiateResizeAppointment = (yPos, direction, startHour, startMinutes, endHour, endMinutes, dataGap) => {
        if (!direction) return;
        if (dragAppointment || inMoveDragging) return;
        setActiveResizing(true);
        setResizePosition(yPos);
        setResizeDirection(direction);
    };

    const moveAppointment = (e, doctorColor, editing = false, gap = null, doctorObject) => {

        let target = e.target;
        while (!target.classList.contains("gap")) target = target.parentElement;
        if (dragAppointment || activeResizing) return moveDragAppointment(target, doctorColor, gap, doctorObject, e);
        
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
                    const paragraphs = gap.querySelectorAll(".appointment-interval-title");
                    const appointmentHours = paragraphs[0];
                    const startHour = appointmentHours.split("-")[0];
                    paragraphs[0].innerText = `${startHour} - ${e.target.getAttribute('endhour')}:${e.target.getAttribute('endminutes')}`;
                }
            }
        }

        setLastElement(e.target);
    };

    const moveDragAppointment = (element, doctorColor, gap, doctorObject, event) => {
        
        const diff = element.getBoundingClientRect().y - dragPosition;
        const totalGaps = document.querySelectorAll(`.gap[doctorid="${doctorObject._id.toString()}"]:not(.inactive)`);
        
        let startIdx = Number(element.getAttribute("id")) - 1, endIdx = Number(element.getAttribute("id")) + 1;
        const initialAppointmentGaps = [element];
        
        while (totalGaps[startIdx] && totalGaps[startIdx].classList.contains("highlight") && !totalGaps[startIdx].classList.contains("resizeable-down")) {
            initialAppointmentGaps.unshift(totalGaps[startIdx]);
            startIdx--;
        }

        while (totalGaps[endIdx] && totalGaps[endIdx].classList.contains("highlight") && !totalGaps[endIdx].classList.contains("resizeable-up")) {
            initialAppointmentGaps.push(totalGaps[endIdx]);
            endIdx++;
        }

        endIdx--;
        startIdx++;

        const resizeDownDiff = totalGaps[endIdx].getBoundingClientRect().bottom - event.clientY;
        const resizeUpDiff = totalGaps[endIdx].getBoundingClientRect().top - event.clientY;

        if (!inMoveDragging) {
            setDragInitStartHour(Number(totalGaps[startIdx].getAttribute("starthour")));
            setDragInitStartMinutes(Number(totalGaps[startIdx].getAttribute("startminutes")));
            setDragInitEndHour(Number(totalGaps[endIdx].getAttribute("endhour")));
            setDragInitEndMinutes(Number(totalGaps[endIdx].getAttribute("endminutes")));
            setInMoveDragging(true);
        }

        // Dragging towards bottom
        if (diff >= element.clientHeight || (activeResizing && resizeDownDiff === 0)) { 
            if (endIdx < totalGaps.length - 1 && totalGaps[endIdx + 1].classList.contains("resizeable-up")) return;
            if (endIdx >= totalGaps.length - 1) return; 

            /* Start Resizing (to bottom) copying bottom elements */

            if (!activeResizing || resizeDirection === "down") {
                
                totalGaps[endIdx + 1].classList = totalGaps[endIdx].classList;
                if (endIdx > 0) totalGaps[endIdx].classList = totalGaps[endIdx - 1].classList;
                else {
                    totalGaps[endIdx].classList.remove("highlight");
                    totalGaps[endIdx].classList.remove("created");
                    totalGaps[endIdx].classList.remove("resizeable");
                    totalGaps[endIdx].classList.remove("resizeable-up");
                }
                endIdx++;
            }

            /* End Resizing */
         
            setLastDragDirection("down");
            setDragPosition(element.getBoundingClientRect().y);

            /* Start Resizing (to bottom) copying top elements */

            if (!activeResizing || resizeDirection === "up" ) {

                if (startIdx < totalGaps.length - 1) totalGaps[startIdx + 1].classList = totalGaps[startIdx].classList;
                if (startIdx < totalGaps.length - 1) totalGaps[startIdx + 1].innerHTML = totalGaps[startIdx].innerHTML;
            
                if (startIdx === 0 || (startIdx > 0 && totalGaps[startIdx - 1].classList.contains("resizeable-down"))) {
                    totalGaps[startIdx].classList.remove("highlight");
                    totalGaps[startIdx].classList.remove("created");
                    totalGaps[startIdx].classList.remove("resizeable");
                    totalGaps[startIdx].classList.remove("resizeable-up");
                } else if (startIdx > 0) totalGaps[startIdx].classList = totalGaps[startIdx - 1].classList;     

                
                if (startIdx >= 0 && startIdx < totalGaps.length - 1) totalGaps[startIdx].innerHTML = "";
                startIdx++;
            }

            /* End Resizing */

            const newAppointmentGaps = [totalGaps[startIdx]];
            let elementIdx = startIdx + 1;

            while (totalGaps[elementIdx] && totalGaps[elementIdx].classList.contains("highlight") && !totalGaps[elementIdx].classList.contains("resizeable-up")) {
                newAppointmentGaps.push(totalGaps[elementIdx]);
                elementIdx++;
            }

            const dragFirstElement = newAppointmentGaps[0];
            const dragLastElement = newAppointmentGaps[newAppointmentGaps.length - 1];
            
            const dragFirstHour = Number(dragFirstElement.getAttribute("starthour"));
            const dragFirstMinutes = Number(dragFirstElement.getAttribute("startminutes"));
            const dragLastHour = Number(dragLastElement.getAttribute("endhour"));
            const dragLastMinutes = Number(dragLastElement.getAttribute("endminutes"));

            const appointmentIntervalText = newAppointmentGaps[0].querySelector("p.appointment-interval-title");
            appointmentIntervalText.innerText = `${dragFirstHour < 10 ? `0${dragFirstHour}` : dragFirstHour}:${dragFirstMinutes < 10 ? `0${dragFirstMinutes}` : dragFirstMinutes} - ${dragLastHour < 10 ? `0${dragLastHour}` : dragLastHour}:${dragLastMinutes < 10 ? `0${dragLastMinutes}` : dragLastMinutes}`;
            
            console.log("old: ", initialAppointmentGaps)
            console.log("new: ", newAppointmentGaps);
            setDragGaps(newAppointmentGaps);
        }

        // Dragging towards top

        if (diff <= -(element.clientHeight) || (activeResizing && resizeUpDiff === 0)) {
            
            if (startIdx > 0 && totalGaps[startIdx - 1].classList.contains('resizeable-down')) return;
            if (startIdx <= 0) return;

            // For resizing

            if (!activeResizing || resizeDirection === "up") {

                if (startIdx > 0) totalGaps[startIdx].classList = totalGaps[startIdx + 1].classList;               
                if (startIdx < totalGaps.length - 1) { 
                    totalGaps[startIdx - 1].classList = totalGaps[startIdx].classList;
                    totalGaps[startIdx - 1].innerHTML = totalGaps[startIdx].innerHTML;
                }

                if (startIdx <= totalGaps.length - 1 && startIdx > 0) totalGaps[startIdx].innerHTML = "";            
                startIdx--;                
            }


            if (!activeResizing || resizeDirection === "down") {
                if (endIdx > 0) totalGaps[endIdx - 1].classList = totalGaps[endIdx].classList;
                
                if (endIdx === totalGaps.length - 1 || (endIdx < totalGaps.length - 1 && totalGaps[endIdx + 1].classList.contains('resizeable-up'))) {
                    totalGaps[endIdx].classList.remove("highlight");
                    totalGaps[endIdx].classList.remove("created");
                    totalGaps[endIdx].classList.remove("resizeable");
                    totalGaps[endIdx].classList.remove("resizeable-down");
                    
                } else if (endIdx < totalGaps.length - 1) totalGaps[endIdx].classList = totalGaps[endIdx + 1].classList;
            }

            const newAppointmentGaps = [totalGaps[startIdx]];
            let elementIdx = startIdx + 1;

            while (totalGaps[elementIdx] && totalGaps[elementIdx].classList.contains("highlight") && !totalGaps[elementIdx].classList.contains("resizeable-up")) {
                newAppointmentGaps.push(totalGaps[elementIdx]);
                elementIdx++;
            }

            const dragFirstElement = newAppointmentGaps[0];
            const dragLastElement = newAppointmentGaps[newAppointmentGaps.length - 1];
        
            const dragFirstHour = Number(dragFirstElement.getAttribute("starthour"));
            const dragFirstMinutes = Number(dragFirstElement.getAttribute("startminutes"));
            const dragLastHour = Number(dragLastElement.getAttribute("endhour"));
            const dragLastMinutes = Number(dragLastElement.getAttribute("endminutes"));
            const appointmentIntervalText = newAppointmentGaps[0].querySelector("p.appointment-interval-title");
            appointmentIntervalText.innerText = `${dragFirstHour < 10 ? `0${dragFirstHour}` : dragFirstHour}:${dragFirstMinutes < 10 ? `0${dragFirstMinutes}` : dragFirstMinutes} - ${dragLastHour < 10 ? `0${dragLastHour}` : dragLastHour}:${dragLastMinutes < 10 ? `0${dragLastMinutes}` : dragLastMinutes}`;
            
            console.log("old: ", initialAppointmentGaps);
            console.log("new: ", newAppointmentGaps);

            setLastDragDirection("up");
            setDragGaps(newAppointmentGaps);
            setDragPosition(element.getBoundingClientRect().y);
        }

    };
    
    const createAppointment = async (e, doctorSchedules) => {
        
        if (dragAppointment || activeResizing) return await finishDragAppointment();
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
        if (!dragAppointment && !activeResizing) return;
        if (!inMoveDragging) return;
        if (activeEditAppointment || activeCreateAppointment) return;
        setDragAppointment(false);
        setDragPosition(0);
        const dragFirstElement = dragGaps[0];
        const dragLastElement = dragGaps[dragGaps.length - 1];
        if (!dragFirstElement || !dragLastElement) return;
        
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
                dragFirstElement.getAttribute("doctorid") === (isJSON(appointment.users) ? JSON.parse(appointment.users)[0] : appointment.users[0])
            );
            
            return (
                sameDay(new Date(appointment.date), new Date(dragFirstElement.getAttribute("day"))) &&
                dragInitStartHour === Number(new Date(appointment.startDate).getHours()) &&
                dragInitStartMinutes === Number(new Date(appointment.startDate).getMinutes()) &&
                dragInitEndHour === Number(new Date(appointment.endDate).getHours()) &&
                dragInitEndMinutes === Number(new Date(appointment.endDate).getMinutes()) &&
                dragFirstElement.getAttribute("doctorid") === (isJSON(appointment.users) ? JSON.parse(appointment.users)[0] : appointment.users[0])
            );
        });

        try {
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
            if (activeResizing) {
                setActiveResizing(false);
                setResizeDirection("");
            }

            window.history.replaceState({
                scrollY: window.scrollY,
                filterActive,
                date,
                activeDoctors: doctors
            }, "");

            window.location.reload();
        } catch (e) {
            console.log(e);
            return;
        }
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

    const finishResizeAppointment = (e) => {
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

        if (Number(appointmentEndHour) > endHour || (Number(appointmentEndHour) === endHour && Number(appointmentEndMinutes) > 0)) return setErrorMessage(cookies.language === "en" ? "End hour's appointment is not in the schedule!" : "Ora de sfarsit a programarii nu este in program!");
        if (Number(appointmentStartHour) > endHour || (Number(appointmentStartHour) === endHour && Number(appointmentStartMinutes) > 0)) return setErrorMessage(cookies.language === "en" ? "Start hour's appointment is not in the schedule!" : "Ora de inceput a programarii nu este in program!");
        if (Number(appointmentEndHour) < startHour) return setErrorMessage(cookies.language === "en" ? "End hour's appointment is not in the schedule!" : "Ora de sfarsit a programarii nu este in program!");
        if (Number(appointmentStartHour) < startHour) return setErrorMessage(cookies.language === "en" ? "Start hour's appointment is not in the schedule!" : "Ora de inceput a programarii nu este in program!");

        const appointmentStartDate = new Date(new Date(appointmentDateValue).getFullYear(), new Date(appointmentDateValue).getMonth(), new Date(appointmentDateValue).getDate(), appointmentStartHour, appointmentStartMinutes);
        const appointmentEndDate = new Date(new Date(appointmentDateValue).getFullYear(), new Date(appointmentDateValue).getMonth(), new Date(appointmentDateValue).getDate(), appointmentEndHour, appointmentEndMinutes);
        
        if (appointmentStartDate.getTime() >= appointmentEndDate.getTime()) {
            setErrorMessage(cookies.language === "en" ? "Schedule's start hour must be before end hour!" : "Ora de incepere a programarii trebuie sa fie inaintea orei de finalizare!");
            return;
        }

        const appointmentData = {
            startDate: appointmentStartDate,
            endDate: appointmentEndDate,
            patients: [appointmentPatientData],
            users: [appointmentDoctorId],
            _id: data.organisation._id,
            title: appointmentTitle,
            income: appointmentCost || null,
            typeIncome: appointmentTypeIncome || null,
            notes: appointmentNotes,
            date: new Date(appointmentDateValue) || date,
            saved: !patientSaved,
            language: cookies.language
        };

        console.log(appointmentStartDate);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(appointmentData)
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-appointment`, options);
            const response = await request.json();
            console.log(await response);
            if (await response.success) {
                //setAppointments(currAppointments => [...currAppointments, appointmentData]);
                setStatusMessage(response.message[cookies.language]);
                resetAppointmentData();
                setErrorMessage("");
                window.history.replaceState({
                    scrollY: window.scrollY,
                    filterActive,
                    date,
                    activeDoctors: doctors
                }, "");
                window.location.reload();
            }
        } catch (e) {
            console.log(e);
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
        setErrorMessage("");
        resetAppointmentData();
    };

    const closeEditAppointment = () => {
        setActiveEditAppointment(false);
        resetAppointmentData();
        setErrorMessage("");
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
        setAppointmentDateValue(new Date());
        setAppointmentDoctorId();
        setAppointmentFinished();
        setAppointmentConfirmed();
        setAppointmentIntervalWarning(false);
        setAppointmentId();

        // Drag variables reset to initial values
        setDragAppointment(false);
        setDragPosition();
        setDragGaps([]);
        setDragInitStartHour();
        setDragInitStartMinutes();
        setDragInitEndHour();
        setDragInitEndMinutes();
        setDragDataAppointment();
        setDragDataAppointment();
        setInMoveDragging(false);
        setLastDragDirection("");

        // Resize variables reset to inital values
        setResizePosition("");
        setActiveResizing(false)
        setResizeDirection("");
        setDoctorValue();
        setDoctorNameValue();
    };

    const editAppointment = async (currentAppointmentId) => {

        if (Number(appointmentEndHour) > endHour || (Number(appointmentEndHour) === endHour && Number(appointmentEndMinutes) > 0)) return setErrorMessage(cookies.language === "en" ? "End hour's appointment is not in the schedule!" : "Ora de sfarsit a programarii nu este in program!");
        if (Number(appointmentStartHour) > endHour || (Number(appointmentStartHour) === endHour && Number(appointmentStartMinutes) > 0)) return setErrorMessage(cookies.language === "en" ? "Start hour's appointment is not in the schedule!" : "Ora de inceput a programarii nu este in program!");
        if (Number(appointmentEndHour) < startHour || (Number(appointmentEndHour) === startHour && Number(appointmentEndMinutes) > 0)) return setErrorMessage(cookies.language === "en" ? "End hour's appointment is not in the schedule!" : "Ora de sfarsit a programarii nu este in program!");
        if (Number(appointmentStartHour) < startHour || (Number(appointmentStartHour) === startHour && Number(appointmentStartMinutes) > 0)) return setErrorMessage(cookies.language === "en" ? "Start hour's appointment is not in the schedule!" : "Ora de inceput a programarii nu este in program!");

        const appointmentStartDate = new Date(new Date(appointmentDateValue).getFullYear(), new Date(appointmentDateValue).getMonth(), new Date(appointmentDateValue).getDate(), appointmentStartHour, appointmentStartMinutes);
        const appointmentEndDate = new Date(new Date(appointmentDateValue).getFullYear(), new Date(appointmentDateValue).getMonth(), new Date(appointmentDateValue).getDate(), appointmentEndHour, appointmentEndMinutes);

        if (appointmentStartDate.getTime() >= appointmentEndDate.getTime()) {
            setErrorMessage(cookies.language === "en" ? "Schedule's start hour must be before end hour!" : "Ora de incepere a programarii trebuie sa fie inaintea orei de finalizare!");
            return;
        }

        const appointmentData = {
            startDate: appointmentStartDate,
            endDate: appointmentEndDate,
            patients: [appointmentPatientData],
            users: [appointmentDoctorId],
            _id: data.organisation._id,
            title: appointmentTitle,
            income: appointmentCost || null,
            typeIncome: appointmentTypeIncome || null,
            notes: appointmentNotes,
            date:  new Date(appointmentDateValue) || date,
            appointmentId: currentAppointmentId,
            finished: appointmentFinished ? true : false,
            confirmed: appointmentConfirmed,
            language: cookies.language
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
        if (await response.success) {
            setStatusMessage(response.message[cookies.language]);
            setActiveEditAppointment(false);
            setAppointments(currAppointments => {
                return currAppointments.map((currAppointment) => {
                    if (currAppointment._id === currentAppointmentId) return {
                        ...currAppointment,
                        startDate: appointmentStartDate,
                        endDate: appointmentEndDate,
                        patients: [appointmentPatientData],
                        users: [appointmentDoctorId],
                        _id: data.organisation._id,
                        title: appointmentTitle,
                        income: appointmentCost || null,
                        typeIncome: appointmentTypeIncome || null,
                        notes: appointmentNotes,
                        date: date,
                        appointmentId: currentAppointmentId,
                        finished: appointmentFinished ? true : false,
                        confirmed: appointmentConfirmed
                    };

                    return currAppointment;
                });
            });
            resetAppointmentData();
            setErrorMessage("");
            window.history.replaceState({
                scrollY: window.scrollY,
                filterActive,
                date,
                activeDoctors: doctors
            }, "");
            window.location.reload();
        }
    };

    const removeAppointment = async (appointmentId1, patientId) => {

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                _id: data.organisation._id,
                appointmentId: appointmentId1,
                patientId: patientId
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
            window.history.replaceState({
                scrollY: window.scrollY,
                filterActive,
                date,
                activeDoctors: doctors
            }, "");
            window.location.reload();
        }
    };

    const cancelAppointment = async (appointmentId1, patientId) => {

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                _id: data.organisation._id,
                appointmentId: appointmentId1,
                patientId: patientId
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/cancel-appointment`, options);
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
                window.history.replaceState({
                    scrollY: window.scrollY,
                    filterActive,
                    date,
                    activeDoctors: doctors
                }, "");
                window.location.reload();
            }
        } catch (e) {
            console.log(e);
        }

       
    };
    const sameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    };


    useEffect(() => {
        if (activeEditAppointment && editAppointmentRef?.current) editAppointmentRef.current.style.marginTop = `calc(5vh + ${window.scrollY}px)`; 
        if (activeCreateAppointment && createAppointmentRef?.current) createAppointmentRef.current.style.marginTop = `calc(5vh + ${window.scrollY}px)`;
    }, [activeEditAppointment, activeCreateAppointment]);

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
       
        const currentAppointments = filterActive === 0 ? appointments.filter((appointment) => {
            console.log(appointment);
            let sameDoctor = false;
            
            const id = data.user?.userId;
            
            console.log(sameDoctor);
            return sameDay(new Date(appointment.date), date) && !appointment.canceled;
        }) : appointments.filter((appointment) => {
            console.log(appointment);
            return (
                days[0].getTime() <= new Date(appointment.date).getTime() && 
                new Date(appointment.date).getTime() <= days[days.length - 1].getTime() &&
                !appointment.canceled
            );
        });

        
        currentAppointments.forEach((appointment) => {
            const appointmentDate = new Date(appointment.startDate);
            const startHourAppointment = appointmentDate.getHours();
            const startMinutesAppointment = appointmentDate.getMinutes();
            const doctorIdAppointment = isJSON(appointment.users) ? JSON.parse(appointment.users)[0] : appointment.users[0];
            const endHourAppointment = new Date(appointment.endDate).getHours();
            const endMinutesAppointment = new Date(appointment.endDate).getMinutes();
            let startIdx, endIdx;
            const appointmentDoctor = doctors.find(doctor => doctor._id === (isJSON(appointment.users) ? JSON.parse(appointment.users)[0] : appointment.users[0]));
            const doctorColor = appointmentDoctor?.color;
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

           
            for (let i = startIdx; i <= endIdx; i++) {
                currentGaps[i].classList.add('highlight');
                currentGaps[i].classList.add('created');
                if (appointment.finished) currentGaps[i].classList.add("finished");
                currentGaps[i].addEventListener('click', () => {
                    console.log(appointment);
                    if (!sameDay( new Date(currentGaps[i].getAttribute("day")), new Date(appointment.date) )) return;
                    if (new Date(appointment.startDate).getTime() < new Date().getTime()) return;
                    setActiveEditAppointment(true);
                    setAppointmentTitle(appointment.title);
                    setAppointmentPatient(`${isJSON(appointment.patients) ? JSON.parse(appointment.patients)[0].firstname : appointment.patients[0].firstname} ${isJSON(appointment.patients) ? JSON.parse(appointment.patients)[0].lastname : appointment.patients[0].lastname}`);
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
                    setAppointmentDateValue(new Date(appointment.date));

                });
            }

            const appointmentLength = (new Date(appointment.endDate).getTime() - new Date(appointment.startDate).getTime()) / (1000 * 60 * minutesPerGap);

            const textElement2 = document.createElement('p');
            textElement2.classList.add('appointment-interval');
            const currentPatient = isJSON(appointment.patients) ? JSON.parse(appointment.patients)[0] : appointment.patients[0];
            textElement2.innerText = `${currentPatient.firstname} ${currentPatient.lastname}`;
            textElement2.innerText += cookies.langauge === "en" ? ` / File No.: ${currentPatient.fileNumber}` : ` / Nr. fisa: ${currentPatient.fileNumber}`;
            textElement2.style.top = `calc(-100% + ${gapsRef.current[0].clientHeight * (appointmentLength <= 2 ? 2 : 3)}px)`;
            
            if (appointmentLength < 2) textElement2.style.display = 'none';
            else textElement2.style.top = `calc(-100% + ${(appointmentLength / 3) * gapsRef.current[0].clientHeight}px + 12px)`;
            textElement2.style.color = getContrastForText(doctorColor);
            currentGaps[startIdx].appendChild(textElement2);
            
            const textElement = document.createElement('p');
            textElement.classList.add('appointment-interval');
            textElement.innerText = `${appointment.title}`;
            if (appointmentLength < 3) textElement.style.display = 'none';
            else  textElement.style.top = `calc(-100% + ${(appointmentLength / 3 + 1) * gapsRef.current[0].clientHeight}px + 12px)`;

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

            const titleAppointmentDivElement = document.createElement('div');
            titleAppointmentDivElement.classList.add("appointment-interval-container");
            currentGaps[startIdx].appendChild(titleAppointmentDivElement);

            ReactDOM.render(
            <>
                <p className="appointment-interval appointment-interval-title" style={appointmentLength <= 3 ? { 
                    color: getContrastForText(doctorColor), 
                    top: `calc(-100% - 20px + ${gapsRef.current[0].clientHeight}px)`
                } : {
                    color: getContrastForText(doctorColor), 
                    top: `calc(-100% - 20px + ${gapsRef.current[0].clientHeight}px)`, 
                    fontSize: '20px',
                    height: `${gapsRef.current[0].clientHeight}px`
                }}>
                    {startHourAppointment < 10 ? `0${startHourAppointment}` : startHourAppointment}:{startMinutesAppointment < 10 ? `0${startMinutesAppointment}` : startMinutesAppointment} - {endHourAppointment < 10 ? `0${endHourAppointment}` : endHourAppointment}:{endMinutesAppointment < 10 ? `0${endMinutesAppointment}` : endMinutesAppointment}
                    {appointment.confirmed ? <FontAwesomeIcon icon={faCheck} className="check-appointment-icon" style={{ marginLeft: '10px', marginRight: '10px' }}/> : null}
                </p>
            </>, titleAppointmentDivElement);

            
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
     
            currentGaps[endIdx].addEventListener("mousedown", e => {
                initiateAppointment(e, appointmentHourIdx, appointmentGapIdx, appointmentDoctor, true);
            });

            // currentGaps[startIdx].addEventListener("mousedown", e => {
            //     initiateAppointment(e, appointmentHourIdx, appointmentGapIdx, appointmentDoctor, true);
            // });

            // currentGaps[endIdx].addEventListener("mousemove", e => {
            //     moveAppointment(e, true, currentGaps[startIdx]);
            // });

            //currentGaps[endIdx].addEventListener("mouseup", e => resizeAppointment(e));

            const activeGaps = [...currentGaps].filter(currentGap => currentGap.classList.contains("highlight") && currentGap.classList.contains("created"));

            // Hover appointment event
            activeGaps.forEach((currentGap, idx) => {
                // currentGap.addEventListener("mouseover", e => {
                //     let firstIdx = idx, lastIdx = idx;
                //     while (!activeGaps[firstIdx].classList.contains("resizeable-up")) {
                //         activeGaps[firstIdx].classList.add("mouse-over-gap");
                //         if (firstIdx === 0) break;
                //         firstIdx--;
                //     }
                    
                //     if (firstIdx >= 0) activeGaps[firstIdx].classList.add("mouse-over-gap");
                    
                //     while (!activeGaps[lastIdx].classList.contains("resizeable-down")) {
                //         activeGaps[lastIdx].classList.add("mouse-over-gap")
                //         if (lastIdx === activeGaps.length - 1) break;
                //         lastIdx++;
                //     }

                //     if (lastIdx <= activeGaps.length - 1) activeGaps[lastIdx].classList.add("mouse-over-gap")

                // });

                // currentGap.addEventListener("mouseout", e => {
                     
                //     let firstIdx = idx, lastIdx = idx;
                //     while (!activeGaps[firstIdx].classList.contains("resizeable-up")) {
                //         activeGaps[firstIdx].classList.remove("mouse-over-gap")
                //         if (firstIdx === 0) break;
                //         firstIdx--;
                //     }

                //     if (firstIdx >= 0) activeGaps[firstIdx].classList.remove("mouse-over-gap");
                    
                //     while (!activeGaps[lastIdx].classList.contains("resizeable-down")) {
                //         activeGaps[lastIdx].classList.remove("mouse-over-gap")
                //         if (lastIdx === activeGaps.length - 1) break;
                //         lastIdx++;
                //     }

                //     if (lastIdx <= activeGaps.length - 1) activeGaps[lastIdx].classList.remove("mouse-over-gap")
                // });
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
    }, [appointmentPatient, activeCreatePatient]);

    useEffect(() => {
        if (!scheduleContentContainerRef || !scheduleContentContainerRef?.current) return;
        scheduleContentContainerRef.current.forEach(scheduleContentElement => {
            scheduleContentElement.style.minHeight = `${1.75 * window.innerHeight}px`;
        });

    }, [scheduleContentContainerRef]);

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
                            return (
                            <div 
                                style={{ "--doctor-color-css": currDoctorColor || doctorColor }} 
                                key={idx} 
                                className="month-appointment" 
                                onClick={() => {
                                    if (new Date(appointment.startDate).getTime() < new Date().getTime()) {
                                        setActiveErrorMessage(true);
                                        setTimeout(() => setActiveErrorMessage(false), 5000);
                                        return;
                                    }
                                  
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
                                    setAppointmentDateValue(new Date(appointment.date));
                                }
                            }>
                                <p className="patient-text" style={{ color: getContrastForText( currDoctorColor || doctorColor ) === "#000" ? "#000" : "var(--text-color)" }}>{JSON.parse(appointment.patients)[0].firstname} {JSON.parse(appointment.patients)[0].lastname}</p>
                                <p>{new Date(appointment.startDate).getHours() < 10 ? `0${new Date(appointment.startDate).getHours()}` : new Date(appointment.startDate).getHours()}:{new Date(appointment.startDate).getMinutes() < 10 ? `0${new Date(appointment.startDate).getMinutes()}` : new Date(appointment.startDate).getMinutes()}</p>
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

    const changeAppointmentDateValue = newDateValue => setAppointmentDateValue(new Date(newDateValue));
    const handlePatientSaved = () => setActiveCreatePatient(false);
    const changeDate = (currDate) => {
        setDate(new Date(currDate));
        // setOpenDatePicker(currValue => !currValue);
    }

    const handleOpenChangeCreate = (status) => setOpenDatePickerCreateApp(status);
    const handleOpenChangeEdit = (status) => setOpenDatePickerEditApp(status);

    // When pressed doctor container inside doctor filter it will scroll to the doctor's appointments

    const scrollToDoctor = (doctorId) => {
        const doctorContainer = [...scheduleContentRef.current].find(scheduleContent => {
            return scheduleContent.getAttribute("id").toString() === doctorId.toString();
        });

        console.log(doctorContainer, doctorContainer.getBoundingClientRect());
        if (doctorContainer) window.scrollTo({ 
            left: 0, 
            top: window.scrollY + doctorContainer.getBoundingClientRect().y - (0.125 * window.innerHeight), 
            behavior: 'smooth'
        });
    };
        
    return !activeCreatePatient ? (
        <div className="appointments">
            <Navigation page="appointments" />

            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Appointments" : "Programari"}</h2>


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
                        <p onClick={e => {
                            setOpenDatePicker(currValue => !currValue);
                            e.target.classList.add("clicked");
                            setTimeout(() => e.target.classList.remove("clicked"), 500);
                        }}>
                            {
                                filterActive === 0 ? `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}` :
                                filterActive === 1 || filterActive === 2 ? `${days[0].getDate()} - ${days[days.length - 1].getDate()} ${months[month]} ${year}` :
                                filterActive === 3 ? `${months[month]} ${year}`:
                                filterActive === 4 ? `${year}` :
                                null
                            }
                        </p>
                        {filterActive === 0 ? 
                            <DateCustomInput
                                key={new Date(date).toISOString() + (openDatePicker ? "1" : "0")} 
                                changeDate={changeDate} 
                                initialDate={new Date(date)} 
                                future={true} 
                                past={true} 
                                label={cookies.language === "en" ? "Appointment date" : "Data programare"} 
                                inputHidden={true}
                                opening={openDatePicker} 
                                headerOpen={window.innerWidth >= 1200 ? (headerElement?.classList?.contains("active") ? 'desktop_active' : 'desktop_inactive') : 'mobile_active'}
                            /> 
                        : null}
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
                        }}>{cookies.langauge === "en" ? "Return to curent day" : "Intoarce-te la ziua curenta"}</p>
                    </div>
                </div>
                    
                <DoctorsFilter data={data} changeValue={changeActiveDoctors} initialValue={ window.history?.state?.activeDoctors || data.organisation.doctors } scrollToDoctor={scrollToDoctor} />

                <div className="options-appointments">
                    <div className="option">
                        <div className={`option-icon ${activeGaps ? "active" : ""}`} onClick={() => setActiveGaps(currStatus => !currStatus)}>
                            {activeGaps && <FontAwesomeIcon icon={faCheck} className="tick-icon" />}
                        </div>
                        <p>{cookies.language === "en" ? "Visible intervals" : "Intervale vizibile"}</p>
                    </div>
                </div>
            
                {doctors && doctors.length <= 3 && window.innerWidth > 800 && <div className="scheduler">
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
                            
                            <div className="schedule-parent-container" key={idx} style={{ minHeight: `${window.innerHeight * 1.75}px` }} ref={ref => scheduleContentContainerRef.current[idx] = ref}>
                                <div className="doctors-title-container">
                                    <div className="doctor-color" style={{ backgroundColor: doctor.color }} />
                                    <h2 className="doctors-title" id={doctor._id} ref={ref => scheduleContentRef.current[idx] = ref}>{doctor.firstname} {doctor.lastname}</h2>
                                </div>
                                <div className={`schedule-container ${activeGaps ? "active-gaps" : ""}`} key={idx} ref={ref => doctorRef.current[idx] = ref} style={{ minHeight: `${window.innerHeight * 1.75}px` }}>
                                    {days && days.length > 0 && days.map((day, dayIdx) => (
                                        filterActive === 0 ? (
                                            <div className={"day-container"} key={dayIdx} style={{ minHeight: `${window.innerHeight * 1.75}px` }}>
                                                {getSchedule(new Date(day), doctor.color, doctor)}
                                            </div>
                                        ) : filterActive === 1 || filterActive === 2 ? (
                                            <div key={dayIdx} className="day-of-week-container" style={{ minHeight: `${window.innerHeight * 1.75}px` }}>
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

                {doctors && (doctors.length > 3 || window.innerWidth <= 800) && 
                     <div className="scheduler flex-column">
                    
                     <div className="schedules flex-column" style={{ marginTop: hourContainerHeight }}>
                         {doctors && doctors.length > 0 && doctors.map((doctor, idx) => (
                             filterActive !== 3 && filterActive !== 4 ?
                             <div className="schedule-content" key={idx} id={doctor._id} style={{ minHeight: `${window.innerHeight * 1.75}px` }} ref={ref => scheduleContentContainerRef.current[idx] = ref}>
                                 <div className="hours">
                                     {hours.map((hour, hourIdx) => (
                                         <div className="hour" key={hourIdx}>
                                             <p>{hour < 10 ? `0${hour}:00` : `${hour}:00`}</p>
                                         </div>
                                     ))}
                                 </div>
 
                                 <div className="schedule-parent-container flex-column">
                                    <div className="doctors-title-container">
                                        <div className="doctor-color" style={{ backgroundColor: doctor.color }} />
                                        <h2 className="doctors-title" id={doctor._id} ref={ref => scheduleContentRef.current[idx] = ref}>{doctor.firstname} {doctor.lastname}</h2>
                                    </div>
                                     <div className={`schedule-container ${activeGaps ? "active-gaps" : ""}`} key={idx} style={{ minHeight: `${window.innerHeight * 1.75}px` }} ref={ref => doctorRef.current[idx] = ref}>
                                         {days && days.length > 0 && days.map((day, dayIdx) => (
                                             filterActive === 0 ? (
                                                 <div className="day-container" key={dayIdx} style={{ minHeight: `${window.innerHeight * 1.75}px` }}>
                                                     {getSchedule(day, doctor.color, doctor)}
                                                 </div>
                                             ) : filterActive === 1 || filterActive === 2 ? (
                                                 <div key={dayIdx} className="day-of-week-container" style={{ minHeight: `${window.innerHeight * 1.75}px` }}>
                                                     <h2>{`${daysOfWeek[day.getDay()]} ${day.getDate()}`}</h2>
                                                     <div className="day-container" style={{ minHeight: `${window.innerHeight * 1.75}px` }}>
                                                         {getSchedule(day, doctor.color, doctor)}
                                                     </div>
                                                 </div>
                                             ) : null
                                         
                                         ))}
                                     
                                     </div> 
                                 </div> 
                             </div>
                            : filterActive === 4 ?
                             <div className="year-schedule" key={idx} ref={ref => doctorRef.current[idx] = ref}>
                                 {getYearData(doctor.color)}
                             </div> : null
                         ))}

                        { filterActive === 3 ?
                             <div className="month-schedule">
                                 {getMonthData(doctors[0].color)}
                            </div> 
                        : null}
                     </div>
                     
                 </div>
                }

                <div className={`appointment-details ${activeCreateAppointment ? "active" : ""}`}>
                    <div className="appointment-details-card" ref={createAppointmentRef}>
                        <div className="close-button">
                            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => closeCreateAppointment()} />
                        </div>

                        <h2 className="appointment-details-title">{cookies.language === "en" ? "Appointment Details" : "Detalii programare"}</h2>
                    
                        <div className="appointment-details">

                            {activePlusButton ? 
                                <div className="label one-row">
                                    <p>{cookies.language === "en" ? "Doctor" : "Medic"}</p>
                                    <Select 
                                        options={doctorOptions} 
                                        placeholder={doctorNameValue} 
                                        value={{ label: doctorNameValue, value: doctorValue }}
                                        styles={customStyles} 
                                        onChange={e => {
                                            setDoctorValue(e.value);
                                            setDoctorNameValue(e.label);
                                            setAppointmentDoctorId(e.value);
                                        }} 
                                        readOnly={isTouchDevice()}
                                    />
                                </div>
                            : null}

                            <div className="label one-row">
                                <p>{cookies.languge === "en" ? "Title" : "Titlu"}</p>
                                <input type="text" value={appointmentTitle} onChange={e => setAppointmentTitle(e.target.value)} placeholder={cookies.language === "en" ? "Title" : "Titlu"} className="row" />
                            </div>

                            <div className="label">
                                <p>{cookies.language === "en" ? "Patient" : "Pacient"}</p>
                                <input type="text" value={appointmentPatient} onChange={e => setAppointmentPatient(e.target.value)} placeholder={cookies.language === "en" ? "Patient" : "Pacient"} />
                            </div>

                            {window.innerWidth <= 800 ? <div className={`patient-list-container ${appointmentPatient.length > 0 ? "active" : ""}`}>
                                    {appointmentPatientsList && appointmentPatientsList.length > 0 ?
                                        <div className="patient-list">
                                            {appointmentPatientsList.map((patient, idx) => (
                                                <div className="patient-container" key={idx} onClick={() => {
                                                    console.log(patient);
                                                    setAppointmentPatient(`${patient.firstname} ${patient.lastname}`);
                                                    setAppointmentPatientsList([]);
                                                    setAppointmentPatientData(patient);
                                                    setAppointmentPatientPhoneNumber(patient.phone);
                                                }}>
                                                    <FontAwesomeIcon icon={faUser} className="user-icon" />
                                                    <p>{patient.firstname} {patient.lastname}</p>
                                                </div>
                                            ))}
                                        </div> : appointmentPatient.length > 0 &&
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
                            </div> : null}

                            <div className="label">
                                <p>{cookies.language === "en" ? "Phone Number" : "Numar telefon"}</p>
                                <input type="number" className="number-input" value={appointmentPatientPhoneNumber} onChange={e => setAppointmentPatientPhoneNumber(e.target.value)} readOnly={phoneNumberReadOnly} />
                            </div>

                            {window.innerWidth > 800 ? <div className={`patient-list-container ${appointmentPatient.length > 0 ? "active" : ""}`}>
                                    {appointmentPatientsList && appointmentPatientsList.length > 0 ?
                                        <div className="patient-list">
                                            {appointmentPatientsList.map((patient, idx) => (
                                                <div className="patient-container" key={idx} onClick={() => {
                                                    console.log(patient);
                                                    setAppointmentPatient(`${patient.firstname} ${patient.lastname}`);
                                                    setAppointmentPatientsList([]);
                                                    setAppointmentPatientData(patient);
                                                    setAppointmentPatientPhoneNumber(patient.phone);
                                                }}>
                                                    <FontAwesomeIcon icon={faUser} className="user-icon" />
                                                    <p>{patient.firstname} {patient.lastname}</p>
                                                </div>
                                            ))}
                                        </div> : appointmentPatient.length > 0 &&
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
                            </div> : null}
           
                            <div className={`non-visible ${appointmentPatient.length > 0 ? "active" : ""}`} />

                            {window.innerWidth >= 800 ? <div className="label">
                                <p>{cookies.language === "en" ? "Start Hour" : "Ora inceput"}</p>
                                <div className="label-row hour-label">
                                    <div className="input">
                                        <input type="number" onChange={e => setAppointmentStartHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={appointmentStartHour} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => (Number(appointmentStartHour) + 1 <= endHour) && setAppointmentStartHour(value => Number(value) + 1 < 10 ? `0${Number(value) + 1}` : Number(value) + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => (Number(appointmentStartHour) - 1 >= startHour) && setAppointmentStartHour(value => Number(value) - 1 < 10 ? `0${Number(value) - 1}` : Number(value) - 1)} />
                                        </div>

                                    </div>
                                    <div className="input">
                                        <input type="number" value={appointmentStartMinutes} onChange={e => setAppointmentStartMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"}  />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => {
                                                if (Number(appointmentStartMinutes) + minutesPerGap < 60) setAppointmentStartMinutes(value => Number(value) + minutesPerGap < 10 ? `0${Number(value) + minutesPerGap}` : Number(value) + minutesPerGap) 
                                                else if (Number(appointmentStartHour) < endHour) {
                                                    setAppointmentStartHour(currHour => Number(currHour) + 1 < 10 ? `0${Number(currHour) + 1}` : Number(currHour) + 1);
                                                    setAppointmentStartMinutes(0);
                                                }
                                            }} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => {
                                                if (Number(appointmentStartMinutes) - minutesPerGap >= 0) setAppointmentStartMinutes(value => value - minutesPerGap);
                                                else if (Number(appointmentStartHour) > startHour) {
                                                    setAppointmentStartHour(currHour => Number(currHour) - 1 < 10 ? `0${Number(currHour) - 1}` : Number(currHour) - 1);
                                                    setAppointmentStartMinutes(60 - minutesPerGap);
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div> : 
                            
                            <div className="label-row label">
                                <div className="label-column">
                                    <p>{cookies.language === "en" ? "Start Hour" : "Ora inceput"}</p>
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => (Number(appointmentStartHour) - 1 >= startHour) && setAppointmentStartHour(value => Number(value) - 1 < 10 ? `0${Number(value) - 1}` : Number(value) - 1)}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentStartHour} onChange={e => setAppointmentStartHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} />
                                        <div className="scale scale-right" onClick={() => (Number(appointmentStartHour) + 1 <= endHour) && setAppointmentStartHour(value => Number(value) + 1 < 10 ? `0${Number(value) + 1}` : Number(value) + 1)}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>

                                <div className="label-column">
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => {
                                            if (Number(appointmentStartMinutes) - minutesPerGap >= 0) setAppointmentStartMinutes(value => value - minutesPerGap);
                                            else if (Number(appointmentStartHour) > startHour) {
                                                setAppointmentStartHour(currHour => Number(currHour) - 1 < 10 ? `0${Number(currHour) - 1}` : Number(currHour) - 1);
                                                setAppointmentStartMinutes(60 - minutesPerGap);
                                            }
                                        }}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentStartMinutes} onChange={e => setAppointmentStartMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"} />
                                        <div className="scale scale-right" onClick={() => {
                                            
                                            if (Number(appointmentStartMinutes) + minutesPerGap < 60) setAppointmentStartMinutes(value => Number(value) + minutesPerGap < 10 ? `0${Number(value) + minutesPerGap}` : Number(value) + minutesPerGap) 
                                            else if (Number(appointmentStartHour) < endHour) {
                                                setAppointmentStartHour(currHour => Number(currHour) + 1 < 10 ? `0${Number(currHour) + 1}` : Number(currHour) + 1);
                                                setAppointmentStartMinutes('00');
                                            }
                                            
                                        }}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            }

                            {window.innerWidth >= 800 ? <div className="label">
                                <p>{cookies.language === "en" ? "End Hour" : "Ora sfarsit"}</p>

                                <div className="label-row hour-label">

                                    <div className="input">
                                        <input type="number" placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={appointmentEndHour} onChange={e => setAppointmentEndHour(e.target.value)} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => Number(appointmentEndHour) + 1 <= Number(endHour) && setAppointmentEndHour(value => Number(value) + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => Number(appointmentEndHour) - 1 >= Number(startHour) && setAppointmentEndHour(value => Number(value) - 1)} />
                                        </div>
                                    </div>

                                    <div className="input">
                                        <input type="number" placeholder={cookies.language === "en" ? "Minutes" : "Minute"} value={appointmentEndMinutes} onChange={e => setAppointmentEndMinutes(e.target.value)} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => {
                                                if (Number(appointmentEndMinutes) + minutesPerGap < 60) setAppointmentEndMinutes(value => Number(value) + minutesPerGap);
                                                else if (Number(appointmentEndHour) < endHour) {
                                                    setAppointmentEndHour(currHour => Number(currHour) + 1);
                                                    setAppointmentEndMinutes('00');
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
                            </div> : 
                            
                            <div className="label-row label">
                                <div className="label-column">
                                    <p>{cookies.language === "en" ? "End Hour" : "Ora sfarsit"}</p>
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => (Number(appointmentEndHour) - 1 >= startHour) && setAppointmentEndHour(value => Number(value) - 1 < 10 ? `0${Number(value) - 1}` : Number(value) - 1)}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentEndHour} onChange={e => setAppointmentEndHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} />
                                        <div className="scale scale-right" onClick={() => (Number(appointmentEndHour) + 1 <= endHour) && setAppointmentEndHour(value => Number(value) + 1 < 10 ? `0${Number(value) + 1}` : Number(value) + 1)}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>

                                <div className="label-column">
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => {
                                            if (Number(appointmentEndMinutes) - minutesPerGap >= 0) setAppointmentEndMinutes(value => value - minutesPerGap);
                                            else if (Number(appointmentEndHour) > startHour) {
                                                setAppointmentEndHour(currHour => Number(currHour) - 1 < 10 ? `0${Number(currHour) - 1}` : Number(currHour) - 1);
                                                setAppointmentEndMinutes(60 - minutesPerGap);
                                            }
                                        }}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentEndMinutes} onChange={e => setAppointmentEndMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"} />
                                        <div className="scale scale-right" onClick={() => {
                                            
                                            if (Number(appointmentEndMinutes) + minutesPerGap < 60) setAppointmentEndMinutes(value => Number(value) + minutesPerGap < 10 ? `0${Number(value) + minutesPerGap}` : Number(value) + minutesPerGap) 
                                            else if (Number(appointmentEndHour) < endHour) {
                                                setAppointmentEndHour(currHour => Number(currHour) + 1 < 10 ? `0${Number(currHour) + 1}` : Number(currHour) + 1);
                                                setAppointmentEndMinutes('00');
                                            }
                                            
                                        }}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>}

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
                                <DateCustomInput opening={openDatePickerCreateApp} changeOpenStatus={handleOpenChangeCreate} key={new Date(appointmentDateValue).toISOString()} changeDate={changeAppointmentDateValue} initialDate={new Date(appointmentDateValue)} future={true} past={false} label={cookies.language === "en" ? "Appointment date" : "Data programare"} />
                            </div>}

                            <div className="label one-row">
                                <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                                <textarea value={appointmentNotes} onChange={e => setAppointmentNotes(e.target.value)} placeholder={cookies.language === "en" ? "Notes" : "Observatii"} />
                            </div>

                        </div>

                        {errorMessage.length > 0 && 
                            <p className="error">{errorMessage}</p>
                        }

                        <button type="button" className="add-appointment" onClick={async () => await sendAppointment()}>
                            <p>{cookies.language === "en" ? "Create appointment" : "Creeaza programarea"}</p>
                        </button>

                    </div>
                </div>

                <div className={`appointment-details ${activeEditAppointment ? "active" : ""}`}>
                    <div className="appointment-details-card" ref={editAppointmentRef}>
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
                                                <p>{patient.firstname} {patient.lastname}</p>
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>

                            {window.innerWidth >= 800 ? <div className="label">
                                <p>{cookies.language === "en" ? "Start Hour" : "Ora inceput"}</p>
                                <div className="label-row hour-label">
                                    <div className="input">
                                        <input type="number" onChange={e => setAppointmentStartHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={appointmentStartHour} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => (Number(appointmentStartHour) + 1 <= endHour) && setAppointmentStartHour(value => Number(value) + 1 < 10 ? `0${Number(value) + 1}` : Number(value) + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => (Number(appointmentStartHour) - 1 >= startHour) && setAppointmentStartHour(value => Number(value) - 1 < 10 ? `0${Number(value) - 1}` : Number(value) - 1)} />
                                        </div>

                                    </div>
                                    <div className="input">
                                        <input type="number" value={appointmentStartMinutes} onChange={e => setAppointmentStartMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"}  />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => {
                                                if (Number(appointmentStartMinutes) + minutesPerGap < 60) setAppointmentStartMinutes(value => Number(value) + minutesPerGap < 10 ? `0${Number(value) + minutesPerGap}` : Number(value) + minutesPerGap) 
                                                else if (Number(appointmentStartHour) < endHour) {
                                                    setAppointmentStartHour(currHour => Number(currHour) + 1 < 10 ? `0${Number(currHour) + 1}` : Number(currHour) + 1);
                                                    setAppointmentStartMinutes(0);
                                                }
                                            }} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => {
                                                if (Number(appointmentStartMinutes) - minutesPerGap >= 0) setAppointmentStartMinutes(value => value - minutesPerGap);
                                                else if (Number(appointmentStartHour) > startHour) {
                                                    setAppointmentStartHour(currHour => Number(currHour) - 1 < 10 ? `0${Number(currHour) - 1}` : Number(currHour) - 1);
                                                    setAppointmentStartMinutes(60 - minutesPerGap);
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div> : 
                            
                            <div className="label-row label">
                                <div className="label-column">
                                    <p>{cookies.language === "en" ? "Start Hour" : "Ora inceput"}</p>
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => (Number(appointmentStartHour) - 1 >= startHour) && setAppointmentStartHour(value => Number(value) - 1 < 10 ? `0${Number(value) - 1}` : Number(value) - 1)}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentStartHour} onChange={e => setAppointmentStartHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} />
                                        <div className="scale scale-right" onClick={() => (Number(appointmentStartHour) + 1 <= endHour) && setAppointmentStartHour(value => Number(value) + 1 < 10 ? `0${Number(value) + 1}` : Number(value) + 1)}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>

                                <div className="label-column">
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => {
                                            if (Number(appointmentStartMinutes) - minutesPerGap >= 0) setAppointmentStartMinutes(value => value - minutesPerGap);
                                            else if (Number(appointmentStartHour) > startHour) {
                                                setAppointmentStartHour(currHour => Number(currHour) - 1 < 10 ? `0${Number(currHour) - 1}` : Number(currHour) - 1);
                                                setAppointmentStartMinutes(60 - minutesPerGap);
                                            }
                                        }}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentStartMinutes} onChange={e => setAppointmentStartMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"} />
                                        <div className="scale scale-right" onClick={() => {
                                            
                                            if (Number(appointmentStartMinutes) + minutesPerGap < 60) setAppointmentStartMinutes(value => Number(value) + minutesPerGap < 10 ? `0${Number(value) + minutesPerGap}` : Number(value) + minutesPerGap) 
                                            else if (Number(appointmentStartHour) < endHour) {
                                                setAppointmentStartHour(currHour => Number(currHour) + 1 < 10 ? `0${Number(currHour) + 1}` : Number(currHour) + 1);
                                                setAppointmentStartMinutes('00');
                                            }
                                            
                                        }}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            }

                            {window.innerWidth >= 800 ? <div className="label">
                                <p>{cookies.language === "en" ? "End Hour" : "Ora sfarsit"}</p>

                                <div className="label-row hour-label">

                                    <div className="input">
                                        <input type="number" placeholder={cookies.language === "en" ? "Hour" : "Ora"} value={appointmentEndHour} onChange={e => setAppointmentEndHour(e.target.value)} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => Number(appointmentEndHour) + 1 <= Number(endHour) && setAppointmentEndHour(value => Number(value) + 1)} />
                                            <FontAwesomeIcon icon={faAngleDown} className="scale-icon" onClick={() => Number(appointmentEndHour) - 1 >= Number(startHour) && setAppointmentEndHour(value => Number(value) - 1)} />
                                        </div>
                                    </div>

                                    <div className="input">
                                        <input type="number" placeholder={cookies.language === "en" ? "Minutes" : "Minute"} value={appointmentEndMinutes} onChange={e => setAppointmentEndMinutes(e.target.value)} />
                                        <div className="scale">
                                            <FontAwesomeIcon icon={faAngleUp} className="scale-icon" onClick={() => {
                                                if (Number(appointmentEndMinutes) + minutesPerGap < 60) setAppointmentEndMinutes(value => Number(value) + minutesPerGap);
                                                else if (Number(appointmentEndHour) < endHour) {
                                                    setAppointmentEndHour(currHour => Number(currHour) + 1);
                                                    setAppointmentEndMinutes('00');
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
                            </div> : 
                            
                            <div className="label-row label">
                                <div className="label-column">
                                    <p>{cookies.language === "en" ? "End Hour" : "Ora sfarsit"}</p>
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => (Number(appointmentEndHour) - 1 >= startHour) && setAppointmentEndHour(value => Number(value) - 1 < 10 ? `0${Number(value) - 1}` : Number(value) - 1)}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentEndHour} onChange={e => setAppointmentEndHour(e.target.value)} placeholder={cookies.language === "en" ? "Hour" : "Ora"} />
                                        <div className="scale scale-right" onClick={() => (Number(appointmentEndHour) + 1 <= endHour) && setAppointmentEndHour(value => Number(value) + 1 < 10 ? `0${Number(value) + 1}` : Number(value) + 1)}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>

                                <div className="label-column">
                                    <div className="appointment-input">
                                        <div className="scale scale-left" onClick={() => {
                                            if (Number(appointmentEndMinutes) - minutesPerGap >= 0) setAppointmentEndMinutes(value => value - minutesPerGap);
                                            else if (Number(appointmentEndHour) > startHour) {
                                                setAppointmentEndHour(currHour => Number(currHour) - 1 < 10 ? `0${Number(currHour) - 1}` : Number(currHour) - 1);
                                                setAppointmentEndMinutes(60 - minutesPerGap);
                                            }
                                        }}>
                                            <FontAwesomeIcon icon={faMinus} className="scale-icon" />
                                        </div>
                                        <input type="number" className="number-input" value={appointmentEndMinutes} onChange={e => setAppointmentEndMinutes(e.target.value)} placeholder={cookies.language === "en" ? "Minutes" : "Minute"} />
                                        <div className="scale scale-right" onClick={() => {
                                            
                                            if (Number(appointmentEndMinutes) + minutesPerGap < 60) setAppointmentEndMinutes(value => Number(value) + minutesPerGap < 10 ? `0${Number(value) + minutesPerGap}` : Number(value) + minutesPerGap) 
                                            else if (Number(appointmentEndHour) < endHour) {
                                                setAppointmentEndHour(currHour => Number(currHour) + 1 < 10 ? `0${Number(currHour) + 1}` : Number(currHour) + 1);
                                                setAppointmentEndMinutes('00');
                                            }
                                            
                                        }}>
                                            <FontAwesomeIcon icon={faPlus} className="scale-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>}                            <div className="label">
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

                            {appointmentDateValue && <div className="label">
                                <p>{cookies.language === "en" ? "Date" : "Data"}</p>
                                <DateCustomInput opening={openDatePickerEditApp} changeOpenStatus={handleOpenChangeEdit} key={new Date(appointmentDateValue).toISOString()}changeDate={changeAppointmentDateValue} initialDate={new Date(appointmentDateValue)} future={true} past={false} label={cookies.language === "en" ? "Appointment date" : "Data programare"} />
                            </div>}

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
                                <button className="option-btn" onClick={async () => await removeAppointment(appointmentId, appointmentPatientData._id)}>
                                    <FontAwesomeIcon icon={faTimes} className="option-icon" />
                                    <p>{cookies.language === "en" ? "Remove appointment" : "Sterge"}</p>
                                </button>
                            </div>

                            <div className="label">
                                <button className="option-btn" onClick={async () => await cancelAppointment(appointmentId, appointmentPatientData._id)}>
                                    <FontAwesomeIcon icon={faBan} className="option-icon" />
                                    <p>{cookies.language === "en" ? "Cancel appointment" : "Anuleaza"}</p>
                                </button>
                            </div>

                        </div>

                        {errorMessage.length > 0 && 
                            <p className="error">{errorMessage}</p>
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

                {activePlusButton ? <div className="add-button" onClick={() => {
                    setAppointmentDateValue(filterActive === 0 ? new Date(date) : new Date(days[0]));
                    setActiveCreateAppointment(true);
                }}>
                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                </div> : null}
           
                <div className={`error-message-button ${activeErrorMessage ? "active" : ""}`}>
                    <p>{cookies?.language === "en" ? "You can't create / edit an appointment in the past!" : "Nu puteti crea / edita o programare in trecut!"}</p>
                </div> 
             
            </div>
        </div>
    ) : <CreatePatient data={data} fromAppointments={true} patientSaved={handlePatientSaved} />;
};

export default Appointments;