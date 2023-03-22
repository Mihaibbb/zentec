import { useCookies } from 'react-cookie';
import HeaderHome from '../Components/Header_Home/Header_Home';
import './Home.css';
import mockup from "../imgs/Mockup-Zentec.webp";
import ZenLogo from "../imgs/logo_zen.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faComments, faDatabase, faExpand, faHandPointUp, faHeadset, faPause, faPlay, faUndo } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"
import iphoneMockup from "../imgs/iphone_mockup.webp";
//import macbookMockup from "../imgs/mockup_macbook_test.png";
import Footer from '../Components/Footer_Home/Footer';
import { useState } from 'react';
import { useRef } from 'react';
import zenAnimation from "../imgs/Zentec_Animation.mp4";
import zenAnimationMobile from "../imgs/Zentec_Animation_Mobile.mp4";
import { useEffect } from 'react';
import bell3d from "../imgs/bell3d.png";
import backup3d from "../imgs/backup3d.png";
import calendar3d from "../imgs/calendar3d.png";
import support3d from "../imgs/support3d.png";
import detectPowerSavingMode from '../Functions/detectLowPower';
import doctorVideo from "../imgs/videos/doctor.mp4";
import patientVideo from "../imgs/videos/pacient.mp4";
import doctorScheduleVideo from "../imgs/videos/program_doctori.mp4";
import appointmentVideo from "../imgs/videos/programare.mp4";
import { useMemo } from 'react';

const Home = ({ data }) => {

    const [cookies, setCookies] = useCookies();
    const [videoEnded, setVideoEnded] = useState(performance.navigation.type === 0 ? false : true);
    const currentVideoSource = window.innerWidth / window.innerHeight >= 1.3 * (9 / 16) ? zenAnimation : zenAnimationMobile;
    const videoRef = useRef();
    const tutorialVideosRef = useRef([]);

    const [videosStatus, setVideosStatus] = useState([]);


    useEffect(() => {
        if (!tutorialVideosRef || !tutorialVideosRef?.current) return;
        setVideosStatus(tutorialVideosRef.current.map(video => "playing"));
        tutorialVideosRef.current.forEach(video => {
            video.playbackRate = 1.2;
        });
    }, [tutorialVideosRef]);
   

    const handleVideoEnded = () => {
        console.log("ENDED!");
    
        document.body.style.opacity = 0;
        setTimeout(() => {
            setVideoEnded(true);
        }, 350);
        setTimeout(() => {
            document.body.style.opacity = 1;
            document.body.style.background = 'var(--background)';

        }, 650);
    };

    const startVideo = () => {
        detectPowerSavingMode().then(result => {
            if (result) {
                document.body.style.background = 'var(--background)';
                return setVideoEnded(true);
            }
        });

        videoRef.current.playbackRate = 1.5;
        document.body.style.background = '#D9D8D9';
    }


    
    return !videoEnded ? (
        <div style={{ width: "100%", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <video
            src={currentVideoSource}
            controls={false}
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            onCanPlay={startVideo}
            ref={videoRef}
            muted
            style={{ width: "100%", height: "100%" }}
        
            />
        </div>
      
        
    ) : (
        <div className="home-container">
            <HeaderHome data={data}/>
            
            <div className="content">
                
                <div className="block-1">
                    <h2 className="title">
                        Digitalizează-ți cabinetul <span></span> <br />  
                        cu <span>ZenTec</span>
                    </h2>

                    <p className="description">{cookies.language === "en" ? "ZenTec is a software designed for medical cabients, easy to use, which simplifies handling with appointments." : "ZenTec este o platformă destinată cabinetelor medicale, ce este intuitivă și ușor de folosit, simplificând gestionarea pacienților, cât și a programarilor."}</p>

                    <button type="button">
                        <p>{cookies?.language === "en" ? "Contact us" : "Contactează-ne"}</p>
                    </button>

                    {/* <p className="sm-text">{cookies?.language === "en" ? "No credit card required" : "Fără card de credit"}</p> */}
                </div>
                
                <div className="block-2">
                    {/* Videoclip cu prezentare Zentec / 3 ecrane laptop, mobil, tableta cu screenshot din aplicatie */}

                    <img src={mockup} className="mockup" alt="zentec on all devices" width={100} height="auto" />
                </div>

                <div className="block-3">
                    {/* Rating-uri / testimoniale */}
                </div>


                <div className="block-4">
                
                    <div className="block-container">
                        <h2>
                            Afacerea ta
                            gestionată intr-un <span>singur loc</span>
                    </h2>
                        <p>Am conceput ZenTec special pentru a veni în ajutorul medicilor si asistentelor care
                        au nevoie de cel mai simplu soft pentru automatizarea programarilor, gestionarea
                        Fcabinetului si personalului intr-un singur loc. So <span>ZEN!</span></p>
                    </div>
         
                    
                    {/* Avantajele noastre ca la bookr */}

                    <div className="block-container">
                        <img src={mockup} className="mockup" alt="zentec on all devices"  width={100} height="auto" />
                    </div>
                </div>

                <div className="block-5">
                    <h2 className="title sm-title">
                        Cabinetul <span>tău</span><br />
                        de la A la <span>ZEN</span>
                    </h2>

                    <div className="advantages">

                        <div className="advantage">
                            <img src={bell3d} className="advantage-icon" />
                            <h2>{cookies.language === "en" ? "Automation and Personalization" : "Automatizat si personalizat"}</h2>
                            <p>
                                {cookies.language === "en" ?
                                "Because we know how important it is for you to keep in touch with your patients, we offer you the possibility of sending personalized messages to them. from now on your patients don't forget their appointments." : 
                                "Pentru că știm cât este de important pentru tine să păstrezi legătura cu pacienții, îți oferim posibilitatea transmiterii de mesaje personalizate către aceștia.  De acum pacientii tai nu mai uita de programari."
                                }
                            </p>
                        </div>

                        <div className="advantage">
                            <img src={calendar3d} className="advantage-icon" />
                            <h2>{cookies.language === "en" ? "Easy to use" : "Simplu de utilizat"}</h2>
                            <p className="enumerate">{cookies.language === "en" ? "" : "Poti crea rapid programari simple sau recurente si poti reprograma la fel de usor din cateva clickuri"}</p>
                            <p className="enumerate">{cookies.langauge === "en" ? "" : "Ai vizibilitate a calendarului pe zile, saptamani si luni"}</p>
                            <p className="enumerate">{cookies.langauge === "en" ? "" : "Poti defini programul de lucru al doctorului si poti bloca perioade de timp din timpul zilei in care doctorul nu este disponibil"}</p>
                            <p className="enumerate">{cookies.language === "en" ? "" : "Poti asocia un pret fiecarei programari sau il poti lasa nedefinit"}</p>
                        </div>

                        <div className="advantage">
                            <img src={support3d} className="advantage-icon"/>
                            <h2>{cookies.language === "en" ? "We are with you, 24/7 😊" : "Suntem cu tine oriunde, 24/7 😊"}</h2>
                            <p>{cookies.language === "en" ? "ZenTec is your digital assistant, at your disposal 24/7, wherever you are. Mobile, laptop, tablet or desktop? Zentec is available on any device with any operating system." : "ZenTec este asistentul digital, la dispozitia ta 24/7, oriunde te-ai afla. Mobil, laptop, tableta sau Desktop? Zentec este disponibil pe orice dispozitiv cu orice sistem de operare."}</p>
                        </div>

                        <div className="advantage">
                            <img src={backup3d} className="advantage-icon" />
                            <h2>{cookies.language === "en" ? "Daily Backup" : "Backup-uri zilnice"}</h2>
                            <p>{cookies.langauge === "en" ? "We offer security through daily backups for the practice data. Thus, you won't have to worry about the safety of your data." : " Oferim securitate prin backup-uri zilnice pentru datele cabinetului. Astfel, nu vei avea nicio grija pentru siguranța datelor."}</p>
                        </div>


                    </div>

                    {/* <p className="description">Sa iti dea tie si afacerii tale o stare ZEN 😌</p> */}

                    {/* Patru cadrane ca la invideo.io cu ce ofera zentec*/}
                </div>

                <h2 className="title sm-title">
                    Aplicația <span>mobilă</span>
                </h2>


                <div className="block-6">
                  

                    {/* Cadranul cu mobil de la invideo.io */}
                    {window.innerWidth >= 1100 ? 
                        <>
                            <div className="block-container">
                                <h2>Gestionează <br /> din mers</h2>
                            </div>
                            <div className="block-container">
                                <img src={iphoneMockup} className="mockup-img" alt="zentec on mobile" width={100} height="auto" />
                            </div>
                        </> : 
                        <>
                            <div className="block-container">
                                <img src={iphoneMockup} className="mockup-img" alt="zentec on mobile" width={100} height="auto" />
                            </div>
                            <div className="block-container">
                                <h2>Gestionează din mers</h2>
                            </div>
                        </>
                    }
                    
                    <div className="block-container">
                        <p className="highlight">{cookies.language === "en" ? "The easiest way to manage your business is on your phone.  " : "Cel mai usor mod de a-ti gestiona afacerea este pe telefon."}</p>
                        <p>{cookies.language === "en" ? "We know how important it is for you to manage your business whenever you want, wherever you want, so we made our platform compatible for mobile access." : "Stim cat de important este pentru tine sa iti administrezi afacerea de oriunde te-ai afla, asa ca am conceput platforma noastra sa poata fi accesata de pe orice dispozitiv. De acum, poti programa de oriunde!"}</p>
                    </div>
                </div>

                <div className="block-5">
                    
                    <h2 className="title sm-title">
                        Hai să vezi cum <br />
                        îți simplificăm <span>cabinetul</span>
                    </h2>

                    <div className="advantages videos-container">

                        <div className="advantage">
                            {/* <img src={bell3d} className="advantage-icon" /> */}
                            <h2>{cookies.language === "en" ? "Add appointment" : "Adaugare programare"}</h2>
                            <div className="video-container">
                                <video 
                                    src={appointmentVideo} 
                                    
                                    controls={false}
                                    muted
                                    style={{ width: "100%", height: "100%", borderRadius: '20px' }}
                                    ref={ref => tutorialVideosRef.current[0] = ref}
                                    onEnded={() => setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 0) return "ended";
                                            return currStatus;
                                        });
                                    })}
                                    onClick={() => {
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 0) {
                                                    if (currStatus === "playing") return "paused";
                                                    else return "playing";
                                                }
                                                return currStatus;
                                            });
                                        });
                                    }}
                                />

                                {<div className="play-button" onClick={(e) => {
                                    if (videosStatus[0] === "paused") tutorialVideosRef.current[0].pause(); 
                                    else if(videosStatus[0] === "playing") tutorialVideosRef.current[0].play();
                                    else {
                                        tutorialVideosRef.current[0].pause();
                                        tutorialVideosRef.current[0].currentTime = 0;
                                        tutorialVideosRef.current[0].play();
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 0) return "playing";
                                                return currStatus;
                                            });
                                        });
                                    }
                                
                                    setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 0) {
                                                if (currStatus === "playing") return "paused";
                                                else return "playing";
                                            }
                                            return currStatus;
                                        });
                                    });
                                }}>
                                    <FontAwesomeIcon icon={videosStatus?.[0] === "paused" ? faPause : videosStatus?.[0] === "playing" ? faPlay : faUndo} className="play-icon" />
                                </div>}

                                <div className="fullscreen-button" onClick={() => {
                                    if (tutorialVideosRef.current[0].requestFullscreen) {
                                        tutorialVideosRef.current[0].requestFullscreen();
                                      } else if (tutorialVideosRef.current[0].webkitRequestFullscreen) { /* Safari */
                                        tutorialVideosRef.current[0].webkitRequestFullscreen();
                                      } else if (tutorialVideosRef.current[0].msRequestFullscreen) { /* IE11 */
                                        tutorialVideosRef.current[0].msRequestFullscreen();
                                      }

                                }}>
                                    <FontAwesomeIcon icon={faExpand} className="fullscreen-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="advantage">
                            {/* <img src={calendar3d} className="advantage-icon" /> */}
                            <h2>{cookies.language === "en" ? "Add patient" : "Adaugare pacient"}</h2>
                            <div className="video-container">
                                <video 
                                    src={appointmentVideo} 
                                    onEnded={() => setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 1) return "ended";
                                            return currStatus;
                                        });
                                    })}
                                    playsInline 
                                    controls={false}
                                    muted
                                    style={{ width: "100%", height: "100%", borderRadius: '20px' }}
                                    ref={ref => tutorialVideosRef.current[1] = ref}
                                    onClick={() => {
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 1) {
                                                    if (currStatus === "playing") return "paused";
                                                    else return "playing";
                                                }
                                                return currStatus;
                                            });
                                        });
                                    }}
                                />

                                {<div className="play-button" onClick={(e) => {
                                    if (videosStatus[1] === "paused") tutorialVideosRef.current[1].pause(); 
                                    else if(videosStatus[1] === "playing") tutorialVideosRef.current[1].play();
                                    else {
                                        tutorialVideosRef.current[1].pause();
                                        tutorialVideosRef.current[1].currentTime = 0;
                                        tutorialVideosRef.current[1].play();
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 1) return "playing";
                                                return currStatus;
                                            });
                                        });
                                    }
                                
                                    setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 1) {
                                                if (currStatus === "playing") return "paused";
                                                else return "playing";
                                            }
                                            return currStatus;
                                        });
                                    });
                                }}>
                                    <FontAwesomeIcon icon={videosStatus?.[1] === "paused" ? faPause : videosStatus?.[1] === "playing" ? faPlay : faUndo} className="play-icon" />
                                </div>}

                                <div className="fullscreen-button" onClick={() => {
                                    if (tutorialVideosRef.current[1].requestFullscreen) {
                                        tutorialVideosRef.current[1].requestFullscreen();
                                      } else if (tutorialVideosRef.current[1].webkitRequestFullscreen) { /* Safari */
                                        tutorialVideosRef.current[1].webkitRequestFullscreen();
                                      } else if (tutorialVideosRef.current[1].msRequestFullscreen) { /* IE11 */
                                        tutorialVideosRef.current[1].msRequestFullscreen();
                                      }

                                }}>
                                    <FontAwesomeIcon icon={faExpand} className="fullscreen-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="advantage">
                            {/* <img src={support3d} className="advantage-icon"/> */}
                            <h2>{cookies.language === "en" ? "Add doctor" : "Adaugare doctor"}</h2>
                            <div className="video-container">
                                <video 
                                    src={appointmentVideo} 
                                     
                                    onEnded={() => setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 2) return "ended";
                                            return currStatus;
                                        });
                                    })}
                                    playsInline 
                                    controls={false}
                                    muted
                                    style={{ width: "100%", height: "100%", borderRadius: '20px' }}
                                    ref={ref => tutorialVideosRef.current[2] = ref}
                                    onClick={() => {
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 2) {
                                                    if (currStatus === "playing") return "paused";
                                                    else return "playing";
                                                }
                                                return currStatus;
                                            });
                                        });
                                    }}
                                />

                                {<div className="play-button" onClick={(e) => {
                                    if (videosStatus[2] === "paused") tutorialVideosRef.current[2].pause(); 
                                    else if(videosStatus[2] === "playing") tutorialVideosRef.current[2].play();
                                    else {
                                        tutorialVideosRef.current[2].pause();
                                        tutorialVideosRef.current[2].currentTime = 0;
                                        tutorialVideosRef.current[2].play();
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 2) return "playing";
                                                return currStatus;
                                            });
                                        });
                                    }
                                
                                    setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 2) {
                                                if (currStatus === "playing") return "paused";
                                                else return "playing";
                                            }
                                            return currStatus;
                                        });
                                    });
                                }}>
                                    <FontAwesomeIcon icon={videosStatus?.[2] === "paused" ? faPause : videosStatus?.[2] === "playing" ? faPlay : faUndo} className="play-icon" />
                                </div>}

                                <div className="fullscreen-button" onClick={() => {
                                    if (tutorialVideosRef.current[2].requestFullscreen) {
                                        tutorialVideosRef.current[2].requestFullscreen();
                                      } else if (tutorialVideosRef.current[2].webkitRequestFullscreen) { /* Safari */
                                        tutorialVideosRef.current[2].webkitRequestFullscreen();
                                      } else if (tutorialVideosRef.current[2].msRequestFullscreen) { /* IE11 */
                                        tutorialVideosRef.current[2].msRequestFullscreen();
                                      }

                                }}>
                                    <FontAwesomeIcon icon={faExpand} className="fullscreen-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="advantage">
                            {/* <img src={backup3d} className="advantage-icon" /> */}
                            <h2>{cookies.language === "en" ? "Add doctor's schedule" : "Adaugare program doctor"}</h2>
                            <div className="video-container">
                                <video 
                                    src={appointmentVideo} 
                                     
                                    onEnded={() => setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 3) return "ended";
                                            return currStatus;
                                        });
                                    })}
                                    playsInline 
                                    controls={false}
                                    muted
                                    style={{ width: "100%", height: "100%", borderRadius: '20px' }}
                                    ref={ref => tutorialVideosRef.current[3] = ref}
                                    onClick={() => {
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 3) {
                                                    if (currStatus === "playing") return "paused";
                                                    else return "playing";
                                                }
                                                return currStatus;
                                            });
                                        });
                                    }}
                                />

                                {<div className="play-button" onClick={(e) => {
                                    if (videosStatus[3] === "paused") tutorialVideosRef.current[3].pause(); 
                                    else if(videosStatus[3] === "playing") tutorialVideosRef.current[3].play();
                                    else {
                                        tutorialVideosRef.current[3].pause();
                                        tutorialVideosRef.current[3].currentTime = 0;
                                        tutorialVideosRef.current[3].play();
                                        setVideosStatus(currStatuses => {
                                            return currStatuses.map((currStatus, idx) => {
                                                if (idx === 3) return "playing";
                                                return currStatus;
                                            });
                                        });
                                    }
                                
                                    setVideosStatus(currStatuses => {
                                        return currStatuses.map((currStatus, idx) => {
                                            if (idx === 3) {
                                                if (currStatus === "playing") return "paused";
                                                else return "playing";
                                            }
                                            return currStatus;
                                        });
                                    });
                                }}>
                                    <FontAwesomeIcon icon={videosStatus?.[3] === "paused" ? faPause : videosStatus?.[3] === "playing" ? faPlay : faUndo} className="play-icon" />
                                </div>}

                                <div className="fullscreen-button" onClick={() => {
                                    if (tutorialVideosRef.current[3].requestFullscreen) {
                                        tutorialVideosRef.current[3].requestFullscreen();
                                      } else if (tutorialVideosRef.current[3].webkitRequestFullscreen) { /* Safari */
                                        tutorialVideosRef.current[3].webkitRequestFullscreen();
                                      } else if (tutorialVideosRef.current[3].msRequestFullscreen) { /* IE11 */
                                        tutorialVideosRef.current[3].msRequestFullscreen();
                                      }

                                }}>
                                    <FontAwesomeIcon icon={faExpand} className="fullscreen-icon" />
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* <p className="description">Sa iti dea tie si afacerii tale o stare ZEN 😌</p> */}

                    {/* Patru cadrane ca la invideo.io cu ce ofera zentec*/}
                </div>
                
                <div className="fixed-icon-container">
                    <a href="https://wa.me/+40734893938" target="_blank">
                        <FontAwesomeIcon icon={faWhatsapp} className="fixed-icon" />
                    </a>
                </div>


                <div className="block-7 final-block">
                    <div className="logo">

                    </div>
                    <h2 className="title"><span>Simplifică-ți afacerea.</span> <br /> Nu este nevoie de experiență. </h2>

                    <img src={ZenLogo} alt="logo-image" className="logo-icon" width={100} height="auto" />
                </div>


            </div>

            <Footer />

        </div>
    );
};

export default Home;