import { useCookies } from 'react-cookie';
import HeaderHome from '../Components/Header_Home/Header_Home';
import './Home.css';
import mockup from "../imgs/Mockup-Zentec.webp";
import ZenLogo from "../imgs/logo_zen.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faComments, faDatabase, faHandPointUp, faHeadset } from '@fortawesome/free-solid-svg-icons';
import iphoneMockup from "../imgs/iphone_mockup.webp";
//import macbookMockup from "../imgs/mockup_macbook_test.png";

const Home = ({ data }) => {

    const [cookies, setCookies] = useCookies();
    
    return (
        <div className="home-container">
            <HeaderHome data={data}/>
            

            <div className="content">
                
                <div className="block-1">
                    <h2 className="title">
                        Manageriază-<span>ți programarile</span> <br />  
                        cu ZenTec.
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
                        cabinetului si personalului intr-un singur loc. So <span>ZEN!</span></p>
                    </div>
         
                    
                    {/* Avantajele noastre ca la bookr */}

                    <div className="block-container">
                        <img src={mockup} className="mockup" alt="zentec on all devices"  width={100} height="auto" />
                    </div>
                </div>

                <div className="block-5">
                    <h2 className="title sm-title">
                        Ce avantaje oferă <span>ZenTec?</span>
                    </h2>

                    <div className="advantages">
                        <div className="advantage">
                            <FontAwesomeIcon icon={faHeadset} className="advantage-icon"/>
                            <h2>{cookies.language === "en" ? "24/7 Support" : "Suport 24/7"}</h2>
                            <p>{cookies.language === "en" ? "" : "ZenTec este asistentul digital, la dispozitia ta 24/7, oriunde te-ai afla. In caz ca noi nu putem raspunde ZenBot te va ajuta in locul nostru."}</p>
                        </div>
                        <div className="advantage">
                            <FontAwesomeIcon icon={faComments} className="advantage-icon" />
                            <h2>{cookies.language === "en" ? "Everything's automated" : "Totul automatizat"}</h2>
                            <p>
                                {cookies.language === "en" ?
                                "Because we know how important it is for you to keep in touch with your patients, we offer you the possibility of sending personalized messages to them. from now on your patients don't forget their appointments." : 
                                "Pentru că știm cât este de important pentru tine să păstrezi legătura cu pacienții, îți oferim posibilitatea transmiterii de mesaje personalizate către aceștia.  De acum pacientii tai nu mai uita de programari."
                                }
                            </p>
                        </div>


                        <div className="advantage">
                            <FontAwesomeIcon icon={faHandPointUp} className="advantage-icon" />
                            <h2>{cookies.language === "en" ? "Easy to use" : "Simplu de utilizat"}</h2>
                            <p className="enumerate">{cookies.language === "en" ? "" : "Poti crea rapid programari simple sau recurente si poti reprograma la fel de usor dincateva clickuri"}</p>
                            <p className="enumerate">{cookies.langauge === "en" ? "" : "Ai vizibilitate a calendarului pe zile, saptamani si luni"}</p>
                            <p className="enumerate">{cookies.langauge === "en" ? "" : "Poti defini programul de lucru al doctorului si poti bloca perioade de timp din timpul zilei in care doctorul nu este disponibil"}</p>
                            <p className="enumerate">{cookies.language === "en" ? "" : "Poti asocia un pret fiecarei programari sau il poti lasa nedefinit"}</p>
                        </div>


                        <div className="advantage">
                            <FontAwesomeIcon icon={faDatabase} className="advantage-icon" />
                            <h2>{cookies.language === "en" ? "Daily Backup" : "Backup-uri zilnice"}</h2>
                            <p>{cookies.langauge === "en" ? "We offer you daily backup with a maximum of 30 days ago, in case of introduced data got corrupted. This way, you won't need to take care of your business's safety." : "Oferim backup-uri zilnice cu maxim 30 de zile in urma, in caz ca, spre exemplu, datele au fost corupte. Astfel, nu va trebuie sa iti faci nicio grija pentru siguranta afacerii tale."}</p>
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
                        <p>{cookies.language === "en" ? "We know how important it is for you to manage your business whenever you want, wherever you want, so we made our platform compatible for mobile access." : "Stim cat de important este pentru tine sa iti manager-iezi afacerea de oriunde te-ai afla, asa ca am conceput platforma noastra sa poata fi accesata de pe orice dispozitiv. De acum, poti programa de oriunde!"}</p>
                    </div>
                </div>

                <div className="block-7 final-block">
                    <div className="logo">

                    </div>
                    <h2 className="title"><span>Simplifică-ți afacerea.</span> <br /> Nu este nevoie de experiență. </h2>

                    <img src={ZenLogo} alt="logo-image" className="logo-icon" width={100} height="auto" />
                </div>


            </div>
        </div>
    );
};

export default Home;