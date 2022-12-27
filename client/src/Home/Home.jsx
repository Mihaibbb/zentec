import { useCookies } from 'react-cookie';
import HeaderHome from '../Components/Header_Home/Header_Home';
import './Home.css';

const Home = ({ data }) => {

    const [cookies, setCookies] = useCookies();
    
    return (
        <div className="home-container">
            <HeaderHome data={data}/>
            

            <div className="content">
                <div className="block-1">
                    <h2 className="title">
                        Cabinetul <span>tau</span> <br />  
                        de la A la <span>ZEN</span>
                    </h2>

                    <p className="description"></p>

                    <button type="button">
                        <p>{cookies?.language === "en" ? "Test Zentec - it's free!" : "Testează Zentec - e moca!"}</p>
                    </button>
                    <p className="sm-text">{cookies?.language === "en" ? "No credit card required" : "Fără card de credit"}</p>
                </div>
                
                <div className="block-2">
                    {/* Videoclip cu prezentare Zentec / 3 ecrane laptop, mobil, tableta cu screenshot din aplicatie */}
                </div>

                <div className="block-3">
                    {/* Rating-uri / testimoniale */}
                </div>

                <div className="block-4">
                    <h2 className="title">
                        Afacerea <span>ta</span> <br />
                        gestionata intr-un singur <span>loc</span>
                    </h2>
                    
                    {/* Avantajele noastre */}
                </div>

                <div className="block-5">
                    <h2 className="title">
                        CE STIE SA FACA <span>ZENTEC</span>?
                    </h2>

                    <p>Sa iti dea tie si afacerii tale o stare ZEN 😌</p>

                    {/* Patru cadrane ca la invideo.io cu ce ofera zentec*/}
                </div>

                <div className="block-6">
                    {/* Cadranul cu mobil de la invideo.io */}
                </div>

                <div className="block-7">
                    
                </div>


            </div>
        </div>
    );
};

export default Home;