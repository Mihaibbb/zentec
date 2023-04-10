import { Routes, Route, BrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useState, useEffect } from "react";

import "./App.css";

import Home from "./Home/Home";
import Dashboard from "./Dashboard/Dashboard";
import Admin from "./Admin/Admin"; 
import Patients from "./Patients/Patients";
import Users from "./Users/Users";
import Login from "./Login/Login";
import Appointments from "./Appointments/Appointments";
import CreateOrganisation from "./CreateOrganisation/CreateOrganisation";
import CreateUser from "./CreateUser/CreateUser";
import CreatePatient from "./CreatePatient/CreatePatient";
import PatientAccount from "./PatientAccount/PatientAccount";
import CreateDoctor from "./CreateDoctor/CreateDoctor";
import DoctorAccount from "./DoctorAccount/DoctorAccount";
import DoctorSchedule from "./DoctorSchedule/DoctorSchedule";
import EditDoctorSchedule from "./EditDoctorSchedule/EditDoctorSchedule";
import ImportPatients from "./ImportPatients/ImportPatients";
import Feedback from "./Feedback/Feedback";
import Profile from "./Profile/Profile";
import Contact from "./Contact/Contact";
import Sterilizations from "./Sterilizations/Sterilizations";
import CreateAssistant from "./CreateAssistant/CreateAssistant";
import AssistantAccount from "./AssistantAccount/AssistantAccount";
import CreateInstrument from "./CreateInstrument/CreateInstrument";
import EditInstrument from "./EditInstrument/EditInstrument";
import CreateSterilization from "./CreateSterilization/CreateSterilization";
import EditSterilization from "./EditSterilization/EditSterilization";
import SterilizationFiles from "./SterilizationFiles/SterilizationFiles";
import PatientsListFile from "./PatientsListFile/PatientsListFile";
import CreateTreatmentCategory from "./CreateTreatmentCategory/CreatTreatmentCategory";
import EditTreatmentCategory from "./EditTreatmentCategory/EditTreatmentCategory";


const App = () => {
    const [cookies, setCookie, removeCookie] = useCookies();
    const [language, setLanguage] = useState("en");
    const [data, setData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        // For scrolling effects
      
        (async () => {
            const cacheNames = await caches?.keys();
            cacheNames && cacheNames.forEach(cacheName => caches.delete(cacheName));
        })();

        cookies.language && setLanguage(cookies.language);

        (async () => {
            if (!cookies["user-id"] || !cookies["pwd"]) {
                setData(false);
                return;
            }
            
            const [userId, password] = [cookies["user-id"], cookies["pwd"]];
            console.log(cookies);
            const options = {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    hashedPassword: password
                })
            };

            const loginRequest = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login-remember`, options);
            const result = await loginRequest.json();
            console.log(result);
            if (!await result.success) {
                removeCookie('user-id');
                removeCookie('pwd');
                removeCookie('theme');
                setData(false);
                return;
            }
            //if (await result.admin && navigation())
            console.log(await result);
            setData(await result);
            setIsAdmin(await result.admin);
            if (cookies?.theme === 'light') {

                document.documentElement.style.setProperty("--background", "#f7f7f7");
                document.documentElement.style.setProperty("--contrast-color", "rgb(46,128,251)");            
                document.documentElement.style.setProperty("--contrast-color-highlight", "rgb(53 110 196)");

                document.documentElement.style.setProperty("--contrast-color-2", "rgb(12 94 217)");
                document.documentElement.style.setProperty("--contrast-color-3", "#FF447C");
                document.documentElement.style.setProperty("--background-color", "#f5f5f5");
                document.documentElement.style.setProperty("--background-contrast", "rgba(0, 0, 0, .6)");
                document.documentElement.style.setProperty("--dark-color", "#666");
                document.documentElement.style.setProperty("--light-color", "#fff");
                document.documentElement.style.setProperty("--text-color", "#222");
                document.documentElement.style.setProperty("--text-color-2", "#000");
                document.documentElement.style.setProperty("--text-color-3", "#666");
                document.documentElement.style.setProperty("--text-color-4", "#999");
                document.documentElement.style.setProperty("--selector-color", "rgba(34, 184, 207, 0.5)");
                document.documentElement.style.setProperty("--over-color", "rgba(255, 255, 255, .2)");
                document.documentElement.style.setProperty("--over-color-2", "rgba(255, 255, 255, .6)");
                document.documentElement.style.setProperty("--over-difference-color", "rgba(0, 0, 0, .2)");
                document.documentElement.style.setProperty("--over-difference-color-2", "rgba(0, 0, 0, .075)");
                document.documentElement.style.setProperty("--over-difference-color-3", "linear-gradient(135deg, rgba(125, 125, 255, 0.18), rgba(125, 125, 255, .45))");
                document.documentElement.style.setProperty("--error-color", "crimson");
                document.documentElement.style.setProperty("--success-color", "#589858");
                document.documentElement.style.setProperty("--selected-color", "rgba(96, 61, 128, .973)");
                document.body.classList.add("light");
            }
        })();

    }, []);

    useEffect(() => {
        
        if (!window.location.href.includes("appointments") && !window.location.href.includes("profile")) {
            let isScrolling;
            const scrollEvent = () => {
                window.clearTimeout(isScrolling);
                document.querySelector("html").classList.add("active");
                isScrolling = setTimeout(() => {
                     document.querySelector("html").classList.remove("active");
                }, 500);
            };
            window.addEventListener("scroll", scrollEvent);
            return () => window.removeEventListener("scroll", scrollEvent);
        } else document.querySelector("html").classList.add("active");
    }, [window.location.href]);

    useEffect(() => {
        // Stop increasing / decreasing value of input number from scrolling on it
        document.addEventListener("wheel", (event) => {
            if (document.activeElement.type === "number"){
                document.activeElement.blur();
            }
        });   

        // Before page loads 
        //window.addEventListener("")
    }, []);

    return data !== null && (
        <BrowserRouter>
             <Routes>
                {data ? (
                    <>
                        <Route path="dashboard" element={isAdmin ? <Admin data={data} /> : <Dashboard data={data} />} />

                        {!isAdmin ? (
                            <>
                                <Route path="patients" element={<Patients data={data} />} />
                                <Route path="patient/:id/:historicPage" element={<PatientAccount data={data} />} />
                                <Route path="doctors" element={<Users data={data} />} />
                                <Route path="doctors-schedule" element={<DoctorSchedule data={data} />} />
                                <Route path="doctors-schedule/:date" element={<EditDoctorSchedule data={data} />} />
                                <Route path="doctor/:id/:historicPage" element={<DoctorAccount data={data} />} />
                                <Route path="appointments" element={<Appointments data={data} />} />
                                <Route path="import-patients" element={<ImportPatients data={data} />}/>
                                <Route path="create-patient" element={<CreatePatient data={data} />} />
                                <Route path="create-doctor" element={<CreateDoctor data={data} />} />    
                                <Route path="feedback" element={<Feedback data={data} />}/>
                                <Route path="profile" element={<Profile data={data} />} />
                                <Route path="sterilizations" element={<Sterilizations data={data} />} />
                                <Route path="create-assistant" element={<CreateAssistant data={data} />} />
                                <Route path="assistant/:id" element={<AssistantAccount data={data} />} />
                                <Route path="create-instrument" element={<CreateInstrument data={data} />} />
                                <Route path="edit-instrument/:id" element={<EditInstrument data={data} />} />
                                <Route path="create-sterilization" element={<CreateSterilization data={data} />} />
                                <Route path="edit-sterilization/:id" element={<EditSterilization data={data} />} />
                                <Route path="sterilization-files/:id" element={<SterilizationFiles data={data} />} />
                                <Route path="patients-list-file/:doctorId" element={<PatientsListFile data={data} />} />
                                <Route path="create-treatment-category" element={<CreateTreatmentCategory data={data} />} />
                                <Route path="edit-treatment-category/:id" element={<EditTreatmentCategory data={data} />} />
                            </>
                        ) : (
                            <>
                                <Route path="create-organisation" element={<CreateOrganisation />} />
                                <Route path="create-user" element={<CreateUser />}/>
                            </>
                        )}
                        <Route path="*" element={<Navigate to="/dashboard" />}/>
                    </>
                ) : (
                    <>
                        <Route path="login" element={<Login />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                )}

                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />


                {/*
                <Route path="statistics" element={<Statistics />} />
                <Route path="search:query" element={<Search />} />
                <Route path="admin" element={<AdminInterface />} /> */}
            </Routes>
        </BrowserRouter>
    );
};


export default App;