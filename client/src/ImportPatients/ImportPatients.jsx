import "./ImportPatients.css";
import * as XLSX from "xlsx";
import { useState } from "react";
import { useCookies } from "react-cookie";
import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import { useRef } from "react";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown, faCloudArrowUp, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";

const ImportPatients = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const [excelFile, setExcelFile] = useState();
    const [excelData, setExcelData] = useState();
    const [success, setSuccess] = useState();
    const [errorMessage, setErrorMessage] = useState();
    const [errorList, setErrorList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileType = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const navigate = useNavigate();


    const uploadFileInputRef = useRef();

    const uploadPatients = async () => {
        await Promise.all(excelData.map(async (row, rowIdx) => {
            try {
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    body: JSON.stringify({
                        _id: data.organisation._id,
                        firstname: row.FirstName || row.Nume,
                        lastname: row.LastName || row.Prenume,
                        email: row.Email,
                        brithdate: new Date(row.Birthdate) || new Date(row["DataNastere"]),
                        doctors: row.Doctor || row.Medic,
                        phone: row?.Phone || row?.Telefon,
                        username: row?.Username,
                        cnp: row?.PersonalCode || row?.CNP,
                        country: row?.Country || row?.Tara,
                        city: row?.City || row?.Oras, 
                        address: row?.Address || row.Adresa,
                        gender: row.Gender || row.Gen,
                        notes: row.Notes || row.Observatii
                    })
                };
    
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-patient`, options);
                const response = await request.json();
                if (!await response.success) setErrorList(currList => [...currList, row.Email]);
            } catch (e) {
                console.log(e);
            }
        }));
    };

    const handleFile = e => {
        setSuccess();
       
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            setErrorMessage(cookies.language === "en" ? "Attach a file!" : "Atasati un fisier!");
            setErrorList([]);
            return;
        }

        if (!fileType.includes(selectedFile.type)) {
            setErrorMessage(cookies.language === "en" ? 'Please select only excel file types' : "Atasati doar fisiere excel!");
            setExcelFile(null);
            setErrorList([]);
            console.log("Error!", selectedFile.type);
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            setErrorMessage(null);
            setErrorList([]);
            setExcelFile(evt.target.result);
            handleSubmit();
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleSubmit = () => {
        if (excelFile === null) return setExcelData(null);
        const workbook = XLSX.read(excelFile, { type: "array" });
        console.log(workbook);
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(data);
        console.log(data);
        setSuccess(true);
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
            handleFile(e.dataTransfer.files);
        }
    };

    const location = useLocation();

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    return (
        <div className="import-container">
            <Navigation />
            
            <div className="content">
                <Header data={data} />

                <h2 className="title">{cookies.language === "en" ? "Import Patients" : "Importa Pacienti"}</h2>

                <div className="go-back" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>

                <input type="file" onChange={handleFile} className="file-input" ref={uploadFileInputRef} />
                
                <div className="drop-container" onClick={() => uploadFileInputRef.current.click()} onDragEnter={handleDrag}>
                    <FontAwesomeIcon icon={faCloudArrowUp} className="cloud-icon" />
                    <h2>{cookies.language === "en" ? "Select files here to upload" : "Selectati fisierele pe care doriti sa le incarcati!"}</h2>
                    { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                </div>

                {excelData && excelData.length > 0 && excelData.map((row, idx) => (
                    <div className="row" key={idx}>
                        <p>{row.firstname}</p>
                    </div>
                ))}

          
                <button type="button" className={`save-button ${success ? "show" : ""}`} onClick={async () => await uploadPatients()}>
                    <h2>{cookies.language === "en" ? "Save Patients" : "Salveaza Pacientii"}</h2>
                </button>
                
            </div>
        </div>
    );
  
};

export default ImportPatients;