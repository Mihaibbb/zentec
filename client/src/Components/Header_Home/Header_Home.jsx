import { useCookies } from "react-cookie";
import "./Header_Home.css";
import ZenLogo from "../../imgs/logo_zen.svg";

const HeaderHome = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    

    return (
        <header>
            <div className="left-container">
               

                <div className="items">
                    <p className="item">{cookies?.language === "en" ? "Home" : "Acasa" }</p>
                    <p className="item">{cookies?.language === "en" ? "About us" : "Despre noi"}</p>
                    <p className="item">Contact</p>
                    <p className="item">{cookies?.language === "en" ? "Support" : "Suport"}</p>
                </div>
            </div>

            <div className="logo">
                
                <img src={ZenLogo} alt="Zentec Logo" width={55} height={55} />
                    <p className="logo-text">Zentec</p>
                
                </div>
            
        
          
            {/* <p className="item">Zen news</p> */}

            <div className="right-container">
                <div className="button">
                    <p>Login</p>
                </div>
            </div>
        </header>
    );
};

export default HeaderHome;