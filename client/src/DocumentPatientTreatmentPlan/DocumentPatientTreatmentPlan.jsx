import JsBarcode from "jsbarcode";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  PDFViewer,
  Image,
  Page,
  Text,
  View,
  Document
} from "@react-pdf/renderer";
import { useLocation, useParams } from "react-router-dom";
import { TEETH, TEETH_KIDS, TEETH_KIDS_NUMBERS } from "../utils/TeethOrder";
import { useCookies } from "react-cookie";

const DocumentPatientTreatment = ({ data : currData }) => {

    const { id, treatmentPlanId } = useParams();
    const location = useLocation();
    const treatmentPlan = useMemo(() => {
        return currData.organisation.treatments_plan_patients.find(treatmentPlan => treatmentPlan._id === treatmentPlanId);
    }, []);

    const patientId = treatmentPlan.patientId;
    const patientData = useMemo(() => {
        return currData.organisation.patients.find(patient => patient._id === patientId);
    }, []);
    const initialStatus = JSON.parse(patientData.initial_status);


    const [data, setData] = useState([]);
    const [blobs, setBlobs] = useState([]);
    const [initialize, setInitialize] = useState(false);
    const [barCodes, setBarCodes] = useState([]);
    const [cookies, setCookie] = useCookies();

    const [toothImage, setToothImage] = useState({});
    const [toothImageCurrentStatus, setToothImageCurrentStatus] = useState({});
    const [toothImageInitialStatusKids, setToothImageInitialStatusKids] = useState({});
    const [toothImageCurrentStatusKids, setToothImageCurrentStatusKids] = useState({});



    useEffect(() => {
        if (!treatmentPlan || initialize) return;
   


        setInitialize(true);
  
    }, [treatmentPlan]);


    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };


        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${id}/${tooth}`, options);
                const response = await request.json();
                console.log(response);
                if (response.success) setToothImage(currImages => {
                    currImages[tooth] = response.tooth;
                    return currImages;
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
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${id}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageInitialStatusKids(currImages => {
                    currImages[TEETH_KIDS[idx]] = response.tooth;
                    return currImages;
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


        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-treatment-plan/${data.organisation._id}/${id}/${treatmentPlanId}/${tooth}`, options);
                const response = await request.json();
                console.log(response);
                if (response.success) setToothImageCurrentStatus(currImages => {
                    currImages[tooth] = response.tooth;
                    return currImages;
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
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-treatment-plan/${data.organisation._id}/${id}/${treatmentPlanId}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageCurrentStatusKids(currImages => {
                    currImages[TEETH_KIDS[idx]] = response.tooth;
                    return currImages;
                });
            } catch (e) {
                console.log(e);
            }
        });
    }, []);

    return initialize ? (
        <div>
            <PDFViewer style={{ height: "100vh", width: "100%" }}>
                <Document>
                <Page size="A4"> 
                    <View style={{ width: "90%", marginHorizontal: "auto" }}>
                        <Text style={{ textAlign: "center" }}>{cookies?.language === "en" ? "Treatment Plan" : "Plan de tratament"}</Text>
                        <Text>Pacient: {patientData.firstname} {patientData.lastname}</Text>
                        <Text style={{ textAlign: "center" }}>{new Date(treatmentPlan.date).getDate() < 10 ? `0${new Date(treatmentPlan.date).getDate()}` : new Date(treatmentPlan.date).getDate()}.{new Date(treatmentPlan.date).getMonth() + 1 < 10 ? `0${new Date(treatmentPlan.date).getMonth() + 1}` : new Date(treatmentPlan.date).getMonth() + 1}.{new Date(treatmentPlan.date).getFullYear()}</Text>

                        <View>
                            <Text style={{ color: "var(--contrast-color)" }}>{cookies?.language === "en" ? "Initial Status" : "Status initial"}</Text>
                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx >= TEETH.length / 2) return null;
                                    return (
                                        <View>
                                            <Text>{tooth}</Text>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImage[tooth] || ""}.png`} />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx < TEETH.length / 2) return null;
                                    return (
                                        <View>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImage[tooth] || ""}.png`} />
                                            <Text>{tooth}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx >= TEETH_KIDS.length / 2) return null;
                                    return (
                                        <View>
                                            <Text>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageInitialStatusKids[tooth] || ""}.png`} />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx < TEETH_KIDS.length / 2) return null;
                                    return (
                                        <View>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageInitialStatusKids[tooth] || ""}.png`} />
                                            <Text>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            
                        </View>

                        <View>
                            <Text style={{ color: "var(--contrast-color)" }}>{cookies?.language === "en" ? "Final Status" : "Status Final"}</Text>
                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx >= TEETH.length / 2) return null;
                                    return (
                                        <View>
                                            <Text>{tooth}</Text>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatus[tooth] || ""}.png`} />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx < TEETH.length / 2) return null;
                                    return (
                                        <View>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatus[tooth] || ""}.png`} />
                                            <Text>{tooth}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx >= TEETH_KIDS.length / 2) return null;
                                    return (
                                        <View>
                                            <Text>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatusKids[tooth] || ""}.png`} />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", flex: 1 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx < TEETH_KIDS.length / 2) return null;
                                    return (
                                        <View>
                                            <Image source={`${process.env.REACT_APP_BACKEND_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageCurrentStatusKids[tooth] || ""}.png`} />
                                            <Text>{TEETH_KIDS_NUMBERS[idx]}</Text>
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
    ) : <h1>Hello</h1>;
};


export default DocumentPatientTreatment;