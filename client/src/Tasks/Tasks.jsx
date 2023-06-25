import { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import TickAnimation from "../utils/TickAnimation";
import "./Tasks.css";

const Tasks = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const [activeOption, setActiveOption] = useState(0);
    const options = cookies?.language === "en" ? ["Waiting patients", "Laboratory Works"] : ["Pacienti in asteptare", "Lucrari laborator"];

    const [taskRemoved, setTaskRemoved] = useState(false);
    const noVideoContentRef = useRef();
    

    const animationFinished = () => {
        document.body.style.background = 'var(--background)';
        window.location.reload();
    };

    return (
        <div className="sterilizations">
            <Navigation page="tasks" />
            <div className="content">
                <Header data={data} />
                {taskRemoved ? (
                    <TickAnimation title={cookies?.language === "en" ? "Task removed successfully!" : "Sarcina a fost stearsa cu success!"} animationFinished={animationFinished} />
                ) : (
                    <div className="no-video-content" ref={noVideoContentRef}>
                        <h2 className="title">{cookies?.language === "en" ? "Tasks" : "Sarcini"}</h2>
                        <div className="splitter">
                            {options.length && options.map((option, idx) => (
                                <div className={`splitter-container ${idx === activeOption ? "selected" : ""}`} key={idx} onClick={() => setActiveOption(idx)}>
                                    <h3>{option}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
    
            </div>
        </div>
    );
};

export default Tasks;