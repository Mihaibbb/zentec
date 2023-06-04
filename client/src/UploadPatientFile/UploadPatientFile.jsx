import { faAngleLeft, faCloudArrowUp, faFile, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";
import "./UploadPatientFile.css";
import axios from "axios";
import TickAnimation from "../utils/TickAnimation";
import { faNoteSticky } from "@fortawesome/free-regular-svg-icons";

const UploadPatientFile = ({ data }) => {

    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state;

    const { id } = useParams();
    const [cookies, setCookie] = useCookies();
    const noVideoContentRef = useRef();

    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState("");
    const [customFileName, setCustomFileName] = useState("");
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [successUpload, setSuccessUpload] = useState(false);
    const [successfullyUploaded, setSuccessfullyUploaded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "dark");

    const uploadFileInputRef = useRef();

    const createFile = async () => {
        console.log(successUpload, file, fileSize);
        if (!successUpload || !fileSize) return;

        try {


            const options = {
                method: "POST",
                body: file,
            };

            const source = `${new Date().getTime()}-${fileName}`;

            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-patient-document/${data.organisation._id}/${id}/${fileSize}/${notes}/${source}/${customFileName}`, options);
            const response = await request.json();
            if (response.success) setSuccessfullyUploaded(true);
            console.log(response);
        } catch (e) {
            console.log(e);
        }
    };

    // Upload and remove file uploaded

    const handleUpload = (e) => {
        const files = e.target.files;
        if (files.length > 1) return alert("Un singur fisier trebuie incarcat!");
        
        const currFormData = new FormData();
        const currFile = e.target.files[0];
        console.log(currFile);
        currFormData.append("file", currFile, currFile.name);
        setFile(currFormData);
        console.log(currFormData);
        setFileSize(currFile.size);
        setFileName(currFile.name);
        document.body.style.background = theme === "light" ? "#fff" : "#000";
        noVideoContentRef.current.classList.add("invisible");
        setTimeout(() => setSuccessUpload(true), 300);
    };
    
    const handleRemove = () => {
        setFile(null);
        setFileSize(null);
        setSuccessUpload(false);
        setFileName("");
    };

    const handleDrag = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
      
    // triggers when file is dropped
    const handleDrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files);
        }
    };


    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        window.history.replaceState({ 
            activeOption: 2, 
            success: true, 
        }, "");
        navigate(`/patient/${id}/2`, { state: { ...location?.state, activeOption: 2 } });
    };

    return (
        <div className="import-container">
            <Navigation />
            <div className="content">
                <Header data={data} />
                {successfullyUploaded ? (
                    <TickAnimation title={cookies?.language === "en" ? "Document uploaded successfully!" : "Documentul a fost incarcat cu succes!"} animationFinished={animationFinished} />
                ) : (
                    <div className="no-video-content patient-account-details" ref={noVideoContentRef}>
                        <h2 className="title">{cookies.language === "en" ? "Create Document" : "Creeati un document"}</h2>

                        <div className="go-back" onClick={() => navigate(-1)}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>

                        <div className="inputs-container">
                            <div className="input one-row">
                                <div className="input-title">
                                    <FontAwesomeIcon className="icon" icon={faFile} />
                                    <p>{cookies.language === "en" ? "File's name" : "Nume fisier"}</p>
                                </div>
                                
                                <input 
                                    type="text" 
                                    value={customFileName} 
                                    onChange={e => setCustomFileName(e.target.value)} 
                                    placeholder={cookies?.language === "en" ? "File's name" : "Nume fisier"}
                                />
                            </div>   

                            <div className="input">
                                <div className="input-title">
                                    <FontAwesomeIcon className="icon" icon={faNoteSticky} />
                                    <p>{cookies.language === "en" ? "Notes" : "Observatii"}</p>
                                </div>
                                
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={cookies?.language === "en" ? "Notes" : "Observatii"}/>
                            </div>  
                        </div>

                        <input type="file" onChange={handleUpload} className="file-input" ref={uploadFileInputRef} />

                        <div className="drop-container" onClick={() => uploadFileInputRef.current.click()} onDragEnter={handleDrag}>
                            <FontAwesomeIcon icon={faCloudArrowUp} className="cloud-icon" />
                            <h2>{cookies.language === "en" ? "Select the file you want to upload" : "Selectati fisierul pe care doriti sa il incarcati!"}</h2>
                            { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                        </div>

                        <button type="button" className={`save-button show`} onClick={async () => successUpload && await createFile()}>
                            <h2>{cookies.language === "en" ? "Upload document" : "Incarcati documentul"}</h2>
                        </button>
                    </div>
                )}

            </div>
    
        </div>
    );
};

export default UploadPatientFile;