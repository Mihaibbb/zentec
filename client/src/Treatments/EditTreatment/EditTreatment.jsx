import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Header from "../../Components/Header/Header";
import "./EditTreatment.css";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import InputColor from "react-input-color";
import TickAnimation from "../../utils/TickAnimation";
import Select from "react-select";
import TREATMENTS from "../../utils/Treatments";

const EditTreatment = ({ data }) => {

    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();
    const { id } = useParams();

    const [treatmentName, setTreatmentName] = useState("");
    const [color, setColor] = useState({});
    const [category, setCategory] = useState();
    const [categoriesNameValue, setCategoriesNameValue] = useState("");
    const [categoriesValue, setCategoriesValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [assistantAdded, setAssistantAdded] = useState(false);
    const [theme, setTheme] = useState(cookies?.theme || "dark");
    const [price, setPrice] = useState();
    const [materialPrice, setMaterialPrice] = useState();
    const [doctorPrice, setDoctorPrice] = useState();
    const [pricePer, setPricePer] = useState(0);
    const [type, setType] = useState(0);
    const [picture, setPicture] = useState("dinte.png");
    const [initialColor, setInitialColor] = useState();

    const pricePersRef = useRef([]);
    const typesRef = useRef([]);
    const picturesRef = useRef([]);
    const noVideoContentRef = useRef();

    const pricePers = cookies.language === "en" ? ["Tooth", "Dental Arch", "Session"] : ["Dinte", "Arcada", "Sedinta"];
    const types = cookies?.language === "en" ? ["General", "Specialized"] : ["General", "Specializat"];
    
    const location = useLocation();

    const categoriesOptions = useMemo(() => data.organisation?.treatment_categories.map(category => {
        return {
            value: `${category.id}`,
            label: `${category.name}`,
        };
    }), []);

    const customStyles = useMemo(() => {
        return {
        control: (base, state) => ({
            ...base,
            background: "var(--over-difference-color-2)",
            border: "none",
            borderRadius: 10,
            width: "90%",
            margin: "0 auto",
            boxShadow: "0 0 10px var(--contrast-color)",
            color: "var(--text-color)",
            marginLeft: '0px'
        }),

        option: (provided, state) => ({
            ...provided,
            color: "rgba(255, 255, 255, .85)",
            background: state.isSelected ? "var(--contrast-color)" : state.isFocused ? "var(--contrast-color-highlight)" : "initial",
            borderRadius: 10,
            fontWeight: "bold"
        }),
        
        menu: (provided, state) => ({
            ...provided,
            
            maxHeight: "300px",
            overflowX: "auto",
            background: cookies?.theme === "light" ? "var(--dark-color)" : "var(--dark-color)",
            border: "none",
            borderRadius: 10,
            boxShadow: "0 0 15px var(--dark-color)"
        }),

        singleValue: (provided) => ({
            ...provided,
            color: "var(--text-color)",
            width: "100%",
            fontWeight: "bold"
        })
    }}, []);

    const isTouchDevice = useCallback(() => {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    }, []);

    useEffect(() => {
      
        const navigationElement = document.querySelector(".navigation");
        if (!navigationElement || !navigationElement?.classList?.contains("active")) return;
        if (window.innerWidth >= 1200) return;
        navigationElement.classList.remove("active");
        document.querySelector(".header").classList.add("no-navigation");
        document.querySelector(".content").classList.add("no-navigation");
        
    }, [location]);

    useEffect(() => {
        setTheme(cookies?.theme || "dark");
    }, [cookies]);

    useEffect(() => {
        if (!id) navigate(-1);
        const currTreatment = data.organisation.treatments.find(treatment => treatment._id === id);
        if (!currTreatment) return;
        setTreatmentName(currTreatment.name);
        setInitialColor(currTreatment.color);
        setCategoriesValue(currTreatment.category);
        setCategoriesNameValue(categoriesOptions.find(category => category.value === currTreatment.category)?.label || "")
        setPrice(Number(currTreatment.price));
        setPricePer(Number(currTreatment.pricePer));
        setType(Number(currTreatment.type));
        setPicture(currTreatment.picture);
        setMaterialPrice(Number(currTreatment.materialPrice));
        setDoctorPrice(Number(currTreatment.doctorPrice));
    }, []);

    const createTreatmentCategoryRequest = async () => {

        if (!categoriesNameValue.length || !color?.hex) {
            setErrorMessage(cookies.language === "en" ? "Fill each required field!" : "Completeaza toate campurile obligatorii!");
            return;
        } 

        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                organisationId: data.organisation._id, 
                name: treatmentName, 
                category: categoriesValue, 
                price, 
                pricePer, 
                doctorPrice,
                materialPrice,
                type, 
                color: color?.hex || initialColor, 
                picture,
                _id: id,
            })
        };

        try {
            const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/edit-treatment`, options);
            const response = await request.json();
            console.log(response);
            if (response.success) {
                noVideoContentRef.current.classList.add("invisible");
                document.body.style.background = theme === "light" ? "#fff" : "#000";
                setTimeout(() => setAssistantAdded(true), 300);
            } else console.log(errorMessage);
        } catch (e) {
            console.log(e);
            setErrorMessage(e.message);
        }
    };

    const animationFinished = () => {
        document.body.style.background = "var(--background)";
        navigate("/profile", { state: { refresh: true, activeOption: 6 } });
    };

    useEffect(() => {
        if (!Object.keys(color)?.length) return;
        const elem = document?.querySelector(".input-color .option > div");
        const notDisplayableDiv =  document.querySelector(".input-color .option > div div:last-child > div:last-child")?.lastChild;
        if (!elem || !notDisplayableDiv) return;

        elem.style.left='-50px';
        notDisplayableDiv.style.display = 'none';
    }, [color]);

    return (
        <div className="create-doctor">
            <Navigation page="" />
            <div className="content" style={assistantAdded ? {maxHeight: "100vh"} : {}}>
                <Header data={data} />
                {assistantAdded ? (
                    <TickAnimation title={cookies.language === "en" ? "Changes have been saved successfully!" : "Modificarile au fost salvate cu succes!"} animationFinished={animationFinished} />
                ) : (
                <div className="no-video-content" ref={noVideoContentRef}>
                    <h2 className="title">{cookies.langauge === "en" ? "Add Treatment" : "Adauga Tratament"}</h2>
                    
                    <div className="go-back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </div>
                    
                    <div className="form">
                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Name *" : "Nume *"}</p>
                            <input type="text" value={treatmentName} onChange={e => setTreatmentName(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Category *" : "Categorie *"}</p>
                            <Select 
                                options={categoriesOptions} 
                                placeholder={categoriesNameValue} 
                                value={{ label: categoriesValue && categoriesValue.length ? categoriesNameValue : cookies.language === "en" ? "Select category..." : "Selecteaza categoria...", value: categoriesValue }}
                                styles={customStyles} 
                                onChange={e => {
                                    setCategoriesValue(e.value);
                                    setCategoriesNameValue(e.label);
                                }} 
                                readOnly={isTouchDevice()}
                            />
                        </div>

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Price ($) *" : "Pret (LEI) *"}</p>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Material's Price ($) *" : "Pret material (LEI) *"}</p>
                            <input type="number" value={materialPrice} onChange={e => setMaterialPrice(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Doctor's payment amount ($) *" : "Plata medic (LEI) *"}</p>
                            <input type="text" value={doctorPrice} onChange={e => setDoctorPrice(e.target.value)} />
                        </div>

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Price per *" : "Pret per *"}</p>
                            <div className="options">
                                {pricePers.map((currPricePer, idx) => (
                                    <div className={`option ${pricePer === idx ? "active" : ""}`} onClick={() => setPricePer(idx)} key={idx} ref={ref => pricePersRef.current[idx] = ref}>
                                        <div className="circle">
                                            
                                            <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                            
                                        </div>
                                        <p>{currPricePer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="input">
                            <p>{cookies.langauge === "en" ? "Type *" : "Tip *"}</p>
                            <div className="options">
                                {types.map((currType, idx) => (
                                    <div className={`option ${type === idx ? "active" : ""}`}  onClick={() => setType(idx)} key={idx} ref={ref => typesRef.current[idx] = ref}>
                                        <div className="circle">
                                            
                                            <FontAwesomeIcon icon={faCheck} className={`active-icon`} />
                                            
                                        </div>
                                        <p>{currType}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="input input-start input-color">
                            <div className="option treatment-category">
                                <p>{cookies.language === "en" ? "Highlight Color *" : "Culoare *"}</p>
                                <InputColor initialValue={initialColor || (cookies?.theme === "light" ? "#000" : "#fff")} onChange={setColor} />
                                
                            </div>
                        </div>

                        <div className="input one-row">
                            <p>{cookies?.langauge === "en" ? "Picture *" : "Pictograma *"}</p>
                            <div className="picture-options">
                                {TREATMENTS.map((treatment, idx) => (
                                    <div className={`treatment ${picture === treatment.source.split("/").at(-1) ? "active" : ""}`}  key={idx} onClick={() => {
                                        const source = picturesRef.current[idx].src;
                                        const pictureName = source.split("/").at(-1);
                                        setPicture(pictureName);
                                    }}>
                                        <div>
                                            <div className="circle">
                                                <FontAwesomeIcon icon={faCheck} className={`check-icon`} />
                                            </div>

                                            <p>{treatment[`name_${cookies?.language}`]}</p>
                                        </div>
                                        <img src={treatment.source} ref={ref => picturesRef.current[idx] = ref} />

                                    </div>
                                ))}
                            </div>
                        </div>


                        <button type="submit"  className="confirm-button" onClick={async () => await createTreatmentCategoryRequest()}>{cookies.language === "en" ? "Create Treatment": "Creeaza Tratament"}</button>
                        <p className="error">{errorMessage}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default EditTreatment;