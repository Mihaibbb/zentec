import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faAngleLeft, faEllipsis, faMinus, faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Navigation from "../../Components/Navigation/Navigation";
import TickAnimation from "../../utils/TickAnimation";
import "./ViewTreatmentSterilization.css";

const ViewTreatmentSterilization = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const params = useParams();
    const navigation = useNavigate();
    const location = useLocation();
    if (!params?.id || !params?.treatmentId) navigation(-1);  
    console.log(data.organisation.patients.find(patient => patient._id === params?.id));

    const patientName = `${data.organisation.patients.find(patient => patient._id === params?.id)?.firstname || ""} ${data.organisation.patients.find(patient => patient._id === params?.id)?.lastname || ""}`;
    const initialSterilziations = JSON.parse(data.organisation.treatments_patients.find(treatment => treatment.id === params?.treatmentId)?.sterilizations || "[]");
    const [sterilizations, setSterilizations] = useState(initialSterilziations);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sterilizationsQuery, setSterilizationsQuery] = useState("");
    const [currentPageSterilziations, setCurrentPageSterilizations] = useState(1);
    const [totalSterilizations, setTotalSterilizations] = useState(initialSterilziations);
    const [pages, setPages] = useState();
    const perPage = 10;
    const [sterilizationRemoved, setSterilizationRemoved] = useState(false);

    const optionsSterilizationsRef = useRef([]);
    const noVideoContentRef = useRef();

    useEffect(() => {
        const resizeEvent = (e) => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", resizeEvent);
        return () => window.removeEventListener("resize", resizeEvent);
    }, []);

    const triggerOptions = (idx, element) => {
        element?.length && element[idx]?.classList?.toggle("show");
        element?.length && element.forEach((option, currIdx) => currIdx !== idx && option?.classList?.remove("show"));
    };


    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (windowWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location, windowWidth]);

    useEffect(() => {
        setSterilizations(currPatients => {
            return [...totalSterilizations].filter((_, idx) => {
                return (idx + 1) > perPage * (currentPageSterilziations - 1) && (idx + 1) <= perPage * currentPageSterilziations;
            });
        });
    }, [currentPageSterilziations]);

    // useLayoutEffect(() => {
    //     (async () => {
    //         try {
    //             const options = {
    //                 method: 'POST',
    //                 headers: {
    //                     "Content-Type": "application/json"
    //                 },
    //                 body: JSON.stringify({
    //                     searchQuery: sterilizationsQuery,
    //                     organisationId: data.organisation._id,
    //                     patientId: params?.id
    //                 })
    //             };
    
    //             const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-treatment-patient-sterilizations`, options);
    //             const response = await request.json();

    //             if (response.success) {

    //                 setSterilizations(_ => {
    //                     return response.treatmentPlans.filter((__, idx) => {
    //                         return (idx + 1) > perPage * (currentPageSterilziations - 1) && (idx + 1) <= perPage * currentPageSterilziations;
    //                     });
    //                 });
    //                 setTotalSterilizations(response.sterilizations || []);
    //             } else {
    //                 setSterilizations([]);
    //                 setTotalSterilizations([]);
    //             }
    //         } catch (e) {
    //             console.log(e);
    //         }
          
    //     })();
    // }, [sterilizationsQuery]);

    useEffect(() => {
        setPages(Math.floor(totalSterilizations.length / perPage) + (totalSterilizations.length % perPage !== 0 ? 1 : 0));
    }, [totalSterilizations]);

    const removeSterilization = async (sterilizationId) => {

        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-treatment-patient-sterilization/${data.organisation._id}/${params?.treatmentId}/${sterilizationId}`, options);
            const response = await request.json();
            if (response.success) {
                setSterilizationRemoved(true);
                setSterilizations(currSterilizations => currSterilizations.filter((sterilization, idx) => sterilization.id !== sterilizationId));
                
            }
            else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const animationFinished = () => {
        document.body.style.background = 'var(--background)';
        window.location.reload();
    };

    return (
        <div className="account-container">
            <Navigation page="" /> 

            <div className="content" style={sterilizationRemoved ? { maxHeight: "100vh" } : {}}>
                <Header data={data} />
                {sterilizationRemoved ? (
                    <TickAnimation title={cookies?.language === "en" ? "Sterilization removed successfully!" : "Sterilizarea a fost stearsa cu succes!"} animationFinished={animationFinished}/>
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                         <div className="go-back" onClick={() => navigation(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>

                    <div className="patient-account-details">
                        <h2 className="title">{cookies?.language === "en" ? "Treatment's Sterilizations" : "Sterilizari tratamente"}</h2>

                        <div className="patient-name" style={{ marginTop: "3rem" }}>
                            
                            <FontAwesomeIcon icon={faUser} className="patient-icon" />
                            <h2>{patientName}</h2>
                        </div>

                        <div style={{ width: "100%" }}>
                            {/* {sterilizations?.length ? <div className="search-container">
                                    <input type="text" value={sterilizationsQuery} onChange={e => setSterilizationsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search treatment plan..." : "Cauta plan de tratament..."} />
                                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            </div> : null} */}


                            <div className="patients-container mg-bottom">
                                {sterilizations?.length > 0 && <div className="first-row">
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                        
                                    </div> : null}

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Assistant" : "Personal"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies?.language === "en" ? "Date" : "Data"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies?.language === "en" ? "Barcode" : "Cod bara"}</p>
                                    </div>

                                    <div className="column">
                                        <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                    </div>

                                </div>}

                                {sterilizations?.length > 0 ? sterilizations.map((sterilization, idx) => (
                                    <div className="row" key={idx}>

                                        {windowWidth >= 600 ? <div className="column">
                                            <p>{(currentPageSterilziations - 1) * perPage + idx + 1}</p>
                                        </div> : null}

                                        {windowWidth >= 400 ? <div className="column">
                                            <p>{data.organisation.assistants.find(assistant => assistant._id === sterilization.assistant)?.firstname} {data.organisation.assistants.find(assistant => assistant._id === sterilization.assistant)?.lastname}</p>
                                        </div> : null}

                                        <div className="column">
                                            <p>{new Date(sterilization.addedDate).getDate() < 10 ? `0${new Date(sterilization.addedDate).getDate()}` : new Date(sterilization.addedDate).getDate()}.{new Date(sterilization.addedDate).getMonth() + 1 < 10 ? `0${new Date(sterilization.addedDate).getMonth() + 1}` : new Date(sterilization.addedDate).getMonth() + 1}.{new Date(sterilization.addedDate).getFullYear()}</p>
                                        </div>

                                        <div className="column">
                                            <p>{sterilization.barCode}</p>
                                        </div>

                                        <div className="column pressable">
                                            <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx, optionsSterilizationsRef.current)}/>
                                            <div className="options-container" ref={ref => optionsSterilizationsRef.current[idx] = ref}>

                                                <div className="option" onClick={async () => optionsSterilizationsRef.current[idx].classList.contains("show") ? await removeSterilization(sterilization.id) : null}>
                                                    <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                    <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                )) : (
                                    <h2 className="center">{cookies.language === "en" ? "No sterilizations found." : "Nicio sterilizare gasita."}</h2>
                                )}

                                {pages > 1 ? <div className="pages-container">

                                    <div className="page-container" onClick={() => setCurrentPageSterilizations(1)}>
                                        <p>1</p>
                                    </div>

                                    <div className="page-input">
                                        <div 
                                            className="value-container"
                                            onClick={() => currentPageSterilziations > 1 ? setCurrentPageSterilizations(currValue => currValue - 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                        </div>
                                        
                                        <input 
                                            type="number" 
                                            placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                            value={currentPageSterilziations}
                                            onChange={e => Number(e.target.value) ? setCurrentPageSterilizations(Number(e.target.value)) : setCurrentPageSterilizations("")}
                                        />

                                        <div 
                                            className="value-container"
                                            onClick={() => currentPageSterilziations < pages ? setCurrentPageSterilizations(currValue => currValue + 1) : null}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                        </div>
                                    </div>
                                    <div className="page-container" onClick={() => setCurrentPageSterilizations(pages)}>
                                        <p>{pages}</p>
                                    </div>
                                </div> : null}

                                <div className="add-button" onClick={() => navigation(`/generate-sterilization/${params?.id}/${params?.treatmentId}`, { state: location?.state })}>
                                    <FontAwesomeIcon icon={faPlus} className="add-icon" />
                                    <p>{cookies?.language === "en" ? "Modify sterilizations" : "Modifica sterilizarile"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTreatmentSterilization;