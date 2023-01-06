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
import Settings from "./Settings/Settings";
import CreateDoctor from "./CreateDoctor/CreateDoctor";
import DoctorAccount from "./DoctorAccount/DoctorAccount";
import DoctorSchedule from "./DoctorSchedule/DoctorSchedule";
import EditDoctorSchedule from "./EditDoctorSchedule/EditDoctorSchedule";
import ImportPatients from "./ImportPatients/ImportPatients";
import Feedback from "./Feedback/Feedback";
import Profile from "./Profile/Profile";

const App = () => {
    const [cookies, setCookie, removeCookie] = useCookies([]);
    const [language, setLanguage] = useState("en");
    const [data, setData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        // For scrolling effects

        let isScrolling;
		window.addEventListener("scroll", () => {
        	window.clearTimeout(isScrolling);
            document.querySelector("html").classList.add("active");
            isScrolling = setTimeout(() => {
     	        document.querySelector("html").classList.remove("active");
            }, 500);
		});
        
        (async () => {
            const cacheNames = await caches.keys();
            cacheNames.forEach(cacheName => caches.delete(cacheName));
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
                setData(false);
                return;
            }
            //if (await result.admin && navigation())
            console.log(await result);
            setData(await result);
            setIsAdmin(await result.admin);

        })();

    }, []);

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
                                <Route path="patient/:id" element={<PatientAccount data={data} />} />
                                <Route path="doctors" element={<Users data={data} />} />
                                <Route path="doctors-schedule" element={<DoctorSchedule data={data} />} />
                                <Route path="doctors-schedule/:date" element={<EditDoctorSchedule data={data} />} />
                                <Route path="doctor/:id" element={<DoctorAccount data={data} />} />
                                <Route path="appointments" element={<Appointments data={data} />} />
                                <Route path="import-patients" element={<ImportPatients data={data} />}/>
                                <Route path="create-patient" element={<CreatePatient data={data} />} />
                                <Route path="settings" element={<Settings data={data} />} />
                                <Route path="create-doctor" element={<CreateDoctor data={data} />} />    
                                <Route path="feedback" element={<Feedback data={data} />}/>
                                <Route path="profile" element={<Profile data={data} />} />
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


                {/*
                <Route path="statistics" element={<Statistics />} />
                <Route path="search:query" element={<Search />} />
                <Route path="admin" element={<AdminInterface />} /> */}
            </Routes>
        </BrowserRouter>
    );
};


export default App;