import JsBarcode from "jsbarcode";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  PDFViewer,
  Image,
  Page,
  Text,
  View,
  Document,
  Font,
  StyleSheet
} from "@react-pdf/renderer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TEETH, TEETH_KIDS, TEETH_KIDS_NUMBERS } from "../utils/TeethOrder";
import { useCookies } from "react-cookie";
import sourceSansProBold from "../fonts/source-sans-pro-bold.ttf";
import sourceSansPro  from "../fonts/source-sans-pro.semibold.ttf";
import sourceSansProRegular from "../fonts/source-sans-pro.regular.ttf";
import { fontWeight } from "@mui/system";


const GeneratePatientFile = ({ data }) => {

    Font.register({ family: "Source-Sans-Pro-Bold", src: sourceSansProBold, fontWeight: "bold" });
    Font.register({ family: "Source-Sans-Pro", src: sourceSansPro });
    Font.register({ family: "Source-Sans-Pro-Regular", src: sourceSansProRegular });


    const params = useParams();
    const id = params?.id;
    const location = useLocation();
    const navigate = useNavigate();
    if (!id) navigate(-1);

    const [initialize, setInitialize] = useState(false);
    const [cookies, setCookie] = useCookies();
    const patientData = data.organisation.patients.find(patient => patient._id === id);
    const [treatments, setTreatments] = useState(data.organisation.treatments_patients.filter(treatment => treatment.patientId === id));


    const styles = StyleSheet.create({
        boldText: {
            fontSize: 26,
            textAlign: "center",
            fontFamily: "Source-Sans-Pro-Bold",
            marginVertical: 8
        },

        normalText: {
            fontSize: 13,
            fontFamily: "Source-Sans-Pro-Bold",
        },

        normalLightText: {
            fontSize: 13,
            fontFamily: "Source-Sans-Pro-Regular",
            fontWeight: 300
        },

        smallText: {
            fontSize: 12,
            fontFamily: "Source-Sans-Pro",
            fontWeight: 300,
            flex: 1,
            
            // textAlign: "center"
        },

        personalDataWrapper: {
            flexDirection: "row",
            gap: 16,
            marginTop: 30
        },

        personalDataContainer: {
            flex: 1,
            gap: 8  
        },
        
        dataRow: {
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            
        },

        table: {
            borderWidth: 1,
            borderColor: "black"
        },  

        row: {
            flexDirection: "row",

        },

        cell: {
            flex: 1,
            borderWidth: 1,
            borderColor: "black",
            justifyContent: 'center',
            alignItems: 'center'
        }


    });

    const [currentDoctors, setCurrentDoctors] = useState(JSON.parse(patientData?.doctors || "[]"));
    const [toothImageCurrentStatus, setToothImageCurrentStatus] = useState({});
    const [toothImageCurrentStatusKids, setToothImageCurrentStatusKids] = useState({});

    // useEffect(() => {
    //     if (window.location.href.includes("/patient-file")) document.body.style.overflow = 'hidden';
    //     else document.body.style.overflow = 'auto';
    // }, [location]);


    useEffect(() => {


        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };


        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-current-status/${data.organisation._id}/${id}/${tooth}`, options);
                const response = await request.json();
                console.log(response);
                if (response.success) setToothImageCurrentStatus(currImages => {
                    return {...currImages, 
                        [tooth]: response.tooth
                    };
                });
            } catch (e) {
                console.log(e);
            }
        });
   
    }, []);

    useEffect(() => {

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH_KIDS_NUMBERS.forEach(async (tooth, idx) => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-current-status/${data.organisation._id}/${id}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageCurrentStatusKids(currImages => {
                    return {...currImages,
                        [TEETH_KIDS[idx]]: response.tooth
                    };
                }); else console.log(response);

            } catch (e) {
                console.log(e);
            }
        });
    }, []);


    const printTooth = (currentTeeth) => {
        if (!currentTeeth?.length) return "";
        let str = "";
        currentTeeth.forEach(tooth => str = str + `${tooth}, `);
        return str.slice(0, -2);
    }

    const currentDate = new Date();

    return (
        <div>
            <PDFViewer style={{ height: "100vh", width: "100%" }}>
                <Document>
                <Page size="A4"> 
                    <View style={{ width: "90%", marginHorizontal: "auto", padding: 20, flex: 1, marginTop: 30 }}>
                        <Text style={[styles.normalText, { marginLeft: "auto", marginBottom: "16px", fontSize: 14 }]}>{cookies?.language === "en" ? `Generated at ${currentDate.getMonth() + 1 < 10 ? `0${currentDate.getMonth() + 1}` : currentDate.getMonth() + 1}.${currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : currentDate.getDate()}.${currentDate.getFullYear()}` : `Generat in data ${currentDate.getMonth() + 1 < 10 ? `0${currentDate.getMonth() + 1}` : currentDate.getMonth() + 1}.${currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : currentDate.getDate()}.${currentDate.getFullYear()}`}</Text>
                        <Text style={styles.boldText}>{cookies?.language === "en" ? "Patient File" : "Fisa Pacient"}</Text>
                        <Text style={[styles.normalText, { textAlign: "center", fontSize: 20 }]}>{patientData?.firstname || ""} {patientData?.lastname || ""}</Text>
                        <Text style={[styles.normalText, { marginTop: 20, fontSize: 16 }]}>{cookies?.language === "en" ? "Personal Data": "Date Personale"}</Text>
                        <View style={styles.personalDataWrapper}>
                            <View style={styles.personalDataContainer}>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "File Number: " : "Nr. fisa: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.fileNumber || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "First Name: " : "Nume: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.firstname || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Last Name: " : "Prenume: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.lastname || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Gender: " : "Sex: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.gender || "-"}</Text>
                                </View>
                                
                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Country: " : "Tara: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.country || "-"}</Text>
                                </View>
                            
                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "County: " : "Judet: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.county || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "City: " : "Oras: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.city || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Address: " : "Adresa: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.address || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "PIC: " : "CNP: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.cnp || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Doctor(s): " : "Medic(i): "}</Text>
                                    <Text style={styles.smallText}>{currentDoctors.includes("null") ? "-" : currentDoctors}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Birthdate: " : "Data de nastere: "}</Text>
                                    <Text style={styles.smallText}>{new Date(patientData.birthdate).getDate() < 10 ? `0${new Date(patientData.birthdate).getDate()}` : new Date(patientData.birthdate).getDate()}.{new Date(patientData.birthdate).getMonth() + 1 < 10 ? `0${new Date(patientData.birthdate).getMonth() + 1}` : new Date(patientData.birthdate).getMonth() + 1}.{new Date(patientData.birthdate).getFullYear()}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Added in: " : "Adaugat in: "}</Text>
                                    <Text style={styles.smallText}>{new Date(patientData.date).getDate() < 10 ? `0${new Date(patientData.date).getDate()}` : new Date(patientData.date).getDate()}.{new Date(patientData.date).getMonth() + 1 < 10 ? `0${new Date(patientData.date).getMonth() + 1}` : new Date(patientData.date).getMonth() + 1}.{new Date(patientData.date).getFullYear()}</Text>
                                </View>
                                
                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Notes: " : "Observatii: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.notes || "-"}</Text>
                                </View>
                    
                            </View>

                            <View style={styles.personalDataContainer}>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Phone: " : "Telefon: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.phone || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Email: " : "Email: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.email || "-"}</Text>
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={[styles.normalText, { flex: 1 }]}>{cookies?.language === "en" ? "Username: " : "Username: "}</Text>
                                    <Text style={styles.smallText}>{patientData?.username || "-"}</Text>
                                </View>
                           
                            </View>
                        </View>

                        <View style={{ marginTop: 50 }}>
                            <Text style={{ color: "#8146ff", fontFamily: "Source-Sans-Pro-Bold", marginBottom: 20 }}>{cookies?.language === "en" ? "Treatments" : "Tratamente"}</Text>
                            <View style={styles.table}>
                                <View style={styles.row}>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{cookies?.langauge === "en" ? "Date" : "Data"}</Text>
                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{cookies?.langauge === "en" ? "Treatment" : "Tratament"}</Text>
                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{cookies?.langauge === "en" ? "Teeth" : "Dinti"}</Text>
                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{cookies?.langauge === "en" ? "Negotiated Price ($)" : "Pret Negociat (Lei)"}</Text>

                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{cookies?.langauge === "en" ? "Paid ($)" : "Platit (Lei)"}</Text>
                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{cookies?.langauge === "en" ? "Amount Due ($)" : "Suma datorata (Lei)"}</Text>
                                    </View>

                                </View>
                                {treatments && treatments?.length ? treatments.map((treatment, idx) => (
                                     <View style={styles.row}>

                                        <View style={styles.cell}>
                                            <Text style={styles.normalLightText}>{new Date(treatment.date).getDate() < 10 ? `0${new Date(treatment.date).getDate()}` : new Date(treatment.date).getDate()}.{new Date(treatment.date).getMonth() + 1 < 10 ? `0${new Date(treatment.date).getMonth() + 1}` : new Date(treatment.date).getMonth() + 1}.{new Date(treatment.date).getFullYear()}</Text>
                                        </View>

                                        <View style={styles.cell}>
                                            <Text style={styles.normalLightText}>{data.organisation.treatments.find(currentTreatment => currentTreatment._id === treatment.treatmentId)?.name || ""}</Text>
                                        </View>
                                        
                                        <View style={styles.cell}>
                                            <Text style={styles.normalLightText}>{printTooth(JSON.parse(treatment?.teeth || ""))}</Text>
                                        </View>

                                        <View style={styles.cell}>
                                            <Text style={styles.normalLightText}>{parseFloat(treatment.totalNegotiated).toFixed(2)}</Text>
                                        </View>

                                        <View style={styles.cell}>
                                            <Text style={styles.normalLightText}>{parseFloat(treatment?.totalPaid || 0).toFixed(2)}</Text>
                                        </View>
                                        
                                        <View style={styles.cell}>
                                            <Text style={styles.normalLightText}>{parseFloat(parseFloat(treatment.totalNegotiated).toFixed(2) - parseFloat(treatment?.totalPaid || 0).toFixed(2)).toFixed(2)} </Text>
                                        </View>

                                    </View>
                                )) : null}

                               
                                <View style={styles.row}>

                                    

                                    <View style={[styles.cell, { flex: 3.05 }]}>
                                        <Text style={styles.normalText}>{cookies?.langauge === "en" ? "Total: " : "Total: "}</Text>
                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{parseFloat(treatments.reduce((accumulator, treatment) => accumulator + treatment.totalNegotiated, 0)).toFixed(2)}</Text>
                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{parseFloat(treatments.reduce((accumulator, treatment) => accumulator + (treatment?.totalPaid || 0), 0)).toFixed(2)}</Text>
                                    </View>

                                    <View style={styles.cell}>
                                        <Text style={styles.normalText}>{parseFloat(treatments.reduce((accumulator, treatment) => accumulator + (treatment.totalNegotiated - (treatment?.totalPaid || 0)), 0)).toFixed(2)}</Text>
                                    </View>

                                </View>

                            </View>
                        </View>

                        <View style={{ marginTop: 160 }}>
                            <Text style={{ color: "#8146ff", fontFamily: "Source-Sans-Pro-Bold" }}>{cookies?.language === "en" ? "Actual Status" : "Status Actual"}</Text>
                            <View style={{ flexDirection: "row", marginTop: 20 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx >= TEETH.length / 2) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", fontSize: 12, flex: 1, fontFamily: "Source-Sans-Pro" }}>{tooth}</Text>
                                            <Image style={{ width: '30px' }} source={`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatus[tooth] || ""}.png`} />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row" }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx < TEETH.length / 2) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Image style={{ width: '30px' }} source={`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatus[tooth] || ""}.png`} />
                                            <View style={{ flex: 1 }}></View>
                                            <Text style={{ textAlign: "center", fontSize: 12, fontFamily: "Source-Sans-Pro" }}>{tooth}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", marginTop: 50 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx >= TEETH_KIDS.length / 2) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", fontSize: 12, flex: 1, fontFamily: "Source-Sans-Pro" }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                            <Image style={{ width: '30px' }} source={`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatusKids[tooth] || ""}.png`} />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row"}}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx < TEETH_KIDS.length / 2) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Image style={{ width: '30px' }} source={`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatusKids[tooth] || ""}.png`} />
                                            <View style={{ flex: 1 }}></View>
                                            <Text style={{ textAlign: "center", fontSize: 12, fontFamily: "Source-Sans-Pro" }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </Page>
                       
                </Document>
            </PDFViewer>
        </div>
    );
};


export default GeneratePatientFile;