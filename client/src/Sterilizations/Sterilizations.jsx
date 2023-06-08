import "./Sterilizations.css";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import { useCookies } from "react-cookie";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faFilePdf, faMinus, faPlus, faSearch, faSortDown, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import tickAnimation from "../imgs/green-tick.mp4";
import tickAnimationWhite from "../imgs/green-tick-light-theme.mp4";
import TickAnimation from "../utils/TickAnimation";

const Sterilizations = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const [options, setOptions] = useState([cookies?.language === "en" ? "Instruments" : "Instrumentar", cookies?.language === "en" ? "List" : "Lista"]);
    const [activeOption, setActiveOption] = useState(0);

    const [sterilizationsList, setSterilizationsList] = useState(data.organisation?.sterilizations || []);

    const [instruments, setInstruments] = useState(data.organisation?.sterilization_instruments || []);
    const [instrumentsQuery, setInstrumentsQuery] = useState("");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [totalInstruments, setTotalInstruments] = useState(data.organisation?.sterilization_instruments);
    const [videoStart, setVideoStart] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "dark");


    const [arrowElements, setArrowElements] = useState([]);
    const [currentPageInstruments, setCurrentPageInstruments] = useState(1);
    const [currentPageList, setCurrentPageList] = useState(1);
    const perPage = 10;
    const [instrumentsPages, setInstrumentsPages] = useState();
    const [listPages, setListPages] = useState();
    
    const firstNameArrow = useRef();
    const lastNameArrow = useRef();
    const fileNumberArrow = useRef();

    const optionsRef = useRef([]);

    const location = useLocation();
    const navigation = useNavigate();
    const noVideoContentRef = useRef();


    const getInstruments = async () => {
     
        setInstruments(_ => {
            return data.organisation?.sterilization_instruments && data.organisation?.sterilization_instruments?.length && data.organisation?.sterilization_instruments.filter((__, idx) => {
                return (idx + 1) > perPage * (currentPageInstruments - 1) && (idx + 1) <= perPage * currentPageInstruments;
            });
        });
        
        setTotalInstruments(data.organisation?.sterilization_instruments || []);
    };


    const triggerOptions = (idx) => {
        optionsRef?.current?.length && optionsRef?.current[idx]?.classList?.toggle("show");
        optionsRef?.current?.length && optionsRef?.current.forEach((option, currIdx) => currIdx !== idx && option?.classList?.remove("show"));
    };

    useEffect(() => {
        if (location.state?.refresh && !window.history?.state?.refresh) {
            window.history.replaceState({ refresh: true }, "");
            window.location.reload();
        }
    }, [location]);


    useEffect(() => {
        setTheme(cookies?.theme || 'dark');
    }, [cookies]);

    useEffect(() => {
        if (instrumentsQuery === "") {
            (async () => {
                await getInstruments();
            })();
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
                    searchQuery: instrumentsQuery
                })
            };

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/search-instruments`, options);
            const response = await request.json();
          
            if (response.success) {
                setInstruments(_ => {
                    return response.sterilization_instruments.filter((__, idx) => {
                        return (idx + 1) > perPage * (currentPageInstruments - 1) && (idx + 1) <= perPage * currentPageInstruments;
                    });
                });
                setTotalInstruments(response.sterilization_instruments || []);
            } else {
                setInstruments([]);
                setTotalInstruments([]);
            }
        })();
    }, [instrumentsQuery]);


    useEffect(() => {
        if (!instruments || ! totalInstruments) return;
        setInstrumentsPages(Math.floor(instruments.length / perPage) + (totalInstruments.length % perPage !== 0 ? 1 : 0));

    }, [totalInstruments]);

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        setWindowWidth(window.innerWidth);
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    useEffect(() => {
        if (!fileNumberArrow?.current) return;
        fileNumberArrow.current.classList.add("up");
    }, [fileNumberArrow?.current]);

    useEffect(() => {
        if (!lastNameArrow?.current) return;
        setArrowElements([fileNumberArrow?.current, firstNameArrow?.current, lastNameArrow?.current]);
    }, [lastNameArrow?.current]);

    useEffect(() => {
        setInstruments(_ => {
            return [...totalInstruments].filter((__, idx) => {
                return (idx + 1) > perPage * (currentPageInstruments - 1) && (idx + 1) <= perPage * currentPageInstruments;
            });
        });
    }, [currentPageInstruments]);

    useEffect(() => {
        const resizeEvent = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", resizeEvent);
        return () => window.removeEventListener("resize", resizeEvent);
    }, []);

    const removeInstrument = async (_id) => {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-sterilization-instrument/${data.organisation._id}/${_id}/${cookies.language}`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() =>  setVideoStart(cookies.language === "en" ? "Instrument was removed successfully!" : "Instrumentul a fost sters cu succes!"), 300);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const animationFinished = () => {
        document.body.style.background = 'var(--background)';
        navigation("/sterilizations", { state: { refresh: true } });
    };

    const removeSterilization = async (_id) => {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/remove-sterilization/${data.organisation._id}/${_id}/${cookies.language}`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() =>  setVideoStart(cookies.language === "en" ? "Sterilization was removed successfully!" : "Sterilizarea a fost stearsa cu succes!"), 300);
            } else console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    const findAssistant = (assistantId) => {
        const { firstname, lastname } = data.organisation?.assistants?.find(assistant => assistant._id === assistantId);
        if (!firstname || !lastname) return;
        return `${firstname.slice(0, 1)}. ${lastname}`;
    };
 

    return (
        <div className="sterilizations">
            <Navigation page="sterilizations" />
            <div className="content" style={videoStart ? { maxHeight: "100vh" } : {}}>
                <Header data={data} />
                {videoStart ? (
                    <TickAnimation title={videoStart} animationFinished={animationFinished} />
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies?.language === "en" ? "Sterilizations" : "Sterilizari"}</h2>
                    <div className="splitter">
                        {options.length && options.map((option, idx) => (
                            <div className={`splitter-container ${idx === activeOption ? "selected" : ""}`} key={idx} onClick={() => setActiveOption(idx)}>
                                <h3>{option}</h3>
                            </div>
                        ))}
                    </div>
    
                    {activeOption === 0 ? (
                        <>
                        {instruments && (instruments.length > 0 || instrumentsQuery.length > 0) && 
                        <div className="search-container">
                            <input type="text" value={instrumentsQuery} onChange={e => setInstrumentsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search instrument..." : "Cauta instrument..."} />
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        </div>}
    
                        <div className="patients-container">
                            {instruments.length > 0 && <div className="first-row">
                                {windowWidth >= 600 ? <div className="column">
                                    <p>{cookies.language === "en" ? "No." : "Nr."}</p>
                                </div> : null}
                                <div className="column">
                                    <p>{cookies.language === "en" ? "Name" : "Nume"}</p>
                                    
                                </div>
                                <div className="column">
                                    <p>{cookies.language === "en" ? "ISO Code" : "Cod ISO"}</p>
                                </div>
    
                                <div className="column">
                                    <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                </div>
                            </div>}
    
                            {instruments.length > 0 ? instruments.map((assistant, idx) => (
                                <div className="row" key={idx}>
    
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{idx + 1}</p>
                                    </div> : null}
    
                                    <div className="column">
                                        <p>{assistant.name}</p>
                                    </div>
    
                                    <div className="column">
                                        <p>{assistant.iso}</p>
                                    </div>
    
                                    <div className="column pressable">
                                        <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx)}/>
                                        <div className="options-container" ref={ref => optionsRef.current[idx] = ref}>
                                            <div className="option" onClick={async () => optionsRef.current[idx].classList.contains("show") ? await removeInstrument(assistant._id) : null}>
                                                <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                            </div>
    
                                            <div className="option" onClick={() => navigation(`/edit-instrument/${assistant._id}`, { state: { instrument: assistant } })}>
                                                <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <h2 className="center">{cookies.language === "en" ? "No instrument found." : "Niciun instrument gasit."}</h2>
                            )}
    
                            {instrumentsPages > 1 ? <div className="pages-container">
                                <div className="page-container" onClick={() => setCurrentPageInstruments(1)}>
                                    <p>1</p>
                                </div>
                                <div className="page-input">
                                    <div 
                                        className="value-container"
                                        onClick={() => currentPageInstruments > 1 ? setCurrentPageInstruments(currValue => currValue - 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                    </div>
                                    
                                    <input 
                                        type="number" 
                                        placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                        value={currentPageInstruments}
                                        onChange={e => Number(e.target.value) ? setCurrentPageInstruments(Number(e.target.value)) : setCurrentPageInstruments("")}
                                    />
    
                                    <div 
                                        className="value-container"
                                        onClick={() => currentPageInstruments < instrumentsPages ? setCurrentPageInstruments(currValue => currValue + 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                    </div>
                                </div>
                                <div className="page-container" onClick={() => setCurrentPageInstruments(instrumentsPages)}>
                                    <p>{instrumentsPages}</p>
                                </div>
                            </div> : null}
                        </div>
                        </>
                    ) : (
                        <>
                        {instruments && (instruments.length > 0 || instrumentsQuery.length > 0) && 
                        <div className="search-container">
                            <input type="text" value={instrumentsQuery} onChange={e => setInstrumentsQuery(e.target.value)} placeholder={cookies.language === "en" ? "Search sterilization..." : "Cauta sterilizare..."} />
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        </div>}
    
                        <div className="patients-container">
                            {sterilizationsList.length > 0 && <div className="first-row">
                                {windowWidth >= 600 ? <div className="column">
                                    <p>{cookies.language === "en" ? "Batch" : "Sarja"}</p>
                                </div> : null}
                                <div className="column">
                                    <p>{cookies.language === "en" ? "Assistant" : "Personal"}</p>
                                    
                                </div>
                                <div className="column">
                                    <p>{cookies.language === "en" ? "Add Date" : "Data adaugare"}</p>
                                </div>

                                <div className="column">
                                    <p>{cookies.language === "en" ? "Expire Date" : "Data expirare"}</p>
                                </div>
    
                                <div className="column">
                                    <p>{cookies.language === "en" ? "Options" : "Optiuni"}</p>
                                </div>
                            </div>}
    
                            {sterilizationsList?.length > 0 ? sterilizationsList.map((sterilization, idx) => (
                                <div className="row" key={idx}>
    
                                    {windowWidth >= 600 ? <div className="column">
                                        <p>{sterilization.sarja}</p>
                                    </div> : null}
    
                                    <div className="column">
                                        <p>{findAssistant(sterilization.assistant)}</p>
                                    </div>
    
                                    <div className="column">
                                        <p>{new Date(sterilization.add_date).getDate() < 10 ? `0${new Date(sterilization.add_date).getDate()}` : new Date(sterilization.add_date).getDate()}.{new Date(sterilization.add_date).getMonth() + 1 < 10 ? `0${new Date(sterilization.add_date).getMonth() + 1}` : new Date(sterilization.add_date).getMonth() + 1}.{new Date(sterilization.add_date).getFullYear()}</p>
                                    </div>
                                    
                                    <div className="column">
                                        <p>{new Date(sterilization.expire_date).getDate() < 10 ? `0${new Date(sterilization.expire_date).getDate()}` : new Date(sterilization.expire_date).getDate()}.{new Date(sterilization.expire_date).getMonth() + 1 < 10 ? `0${new Date(sterilization.expire_date).getMonth() + 1}` : new Date(sterilization.expire_date).getMonth() + 1}.{new Date(sterilization.expire_date).getFullYear()}</p>
                                    </div>
    
                                    <div className="column pressable">
                                        <FontAwesomeIcon className="column-icon" icon={faEllipsis} onClick={() => triggerOptions(idx)}/>
                                        <div className="options-container" ref={ref => optionsRef.current[idx] = ref}>
                                            <div className="option" onClick={async () => optionsRef.current[idx].classList.contains("show") ? await removeSterilization(sterilization._id) : null}>
                                                <FontAwesomeIcon icon={faTimes} className="option-icon" /> 
                                                <p>{cookies.language === "en" ? "Remove" : "Sterge"}</p>
                                            </div>
    
                                            <div className="option" onClick={() => navigation(`/edit-sterilization/${sterilization._id}`, { state: { sterilization: sterilization } })}>
                                                <FontAwesomeIcon icon={faUser} className="option-icon" />
                                                <p>{cookies.language === "en" ? "Edit" : "Editeaza"}</p>
                                            </div>

                                            <div className="option" onClick={() => navigation(`/sterilization-files/${sterilization._id}`, { state: { sterilization: sterilization } })}>
                                                <FontAwesomeIcon icon={faFilePdf} className="option-icon" />
                                                <p>{cookies.language === "en" ? "Tags" : "Etichete"}</p>
                                            </div>
                                       
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <h2 className="center">{cookies.language === "en" ? "No sterilization found." : "Nicio sterilizare gasita."}</h2>
                            )}
    
                            {listPages > 1 ? <div className="pages-container">
                                <div className="page-container" onClick={() => setCurrentPageList(1)}>
                                    <p>1</p>
                                </div>
                                <div className="page-input">
                                    <div 
                                        className="value-container"
                                        onClick={() => currentPageList > 1 ? setCurrentPageList(currValue => currValue - 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faMinus} className="value-icon" />
                                    </div>
                                    
                                    <input 
                                        type="number" 
                                        placeholder={cookies.language === "en" ? "Page's number" : "Numarul paginii"}
                                        value={currentPageList}
                                        onChange={e => Number(e.target.value) ? setCurrentPageList(Number(e.target.value)) : setCurrentPageList("")}
                                    />
    
                                    <div 
                                        className="value-container"
                                        onClick={() => currentPageList < listPages ? setCurrentPageList(currValue => currValue + 1) : null}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="value-icon" />
                                    </div>
                                </div>
                                <div className="page-container" onClick={() => setCurrentPageList(listPages)}>
                                    <p>{listPages}</p>
                                </div>
                            </div> : null}
                        </div>
                        </>
                    )}
    
                    <div className="add-button" onClick={() => activeOption === 0 ? navigation("/create-instrument") : navigation("/create-sterilization")}>
                        <FontAwesomeIcon icon={faPlus} className="add-icon" />
                    </div>
                    </div>
    
                )}
               
            </div>
        </div>
    );
};

export default Sterilizations;