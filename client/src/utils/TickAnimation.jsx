import tickAnimation from "../imgs/green-tick.mp4";
import tickAnimationWhite from "../imgs/green-tick-light-theme.mp4";
import { useCookies } from "react-cookie";
import { useState } from "react";

const TickAnimation = ({ title, animationFinished }) => {
    const [cookies, setCookie] = useCookies();
    const [theme, setTheme] = useState(cookies?.theme || "dark");
    
    return (
        <div className="video-content" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <video
                src={theme === "light" ? tickAnimationWhite : tickAnimation}
                controls={false}
                autoPlay
                playsInline
                onEnded={animationFinished}

                muted
                style={{ height: "40vh" }}
            
            />
            <h2 className="title title-video-content" style={{ margin: 0 }}>{title}</h2>
        </div> 
    );
};

export default TickAnimation;