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

    const patientId = treatmentPlan?.patientId;
    const patientData = useMemo(() => {
        return currData.organisation.patients.find(patient => patient._id === patientId);
    }, []);



    const initialStatus = JSON.parse(patientData?.initial_status || "");


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
        if (!treatmentPlan || initialize || !patientData) return;
        if (!Object.keys(toothImage).length || !Object.keys(toothImageCurrentStatus).length || !Object.keys(toothImageInitialStatusKids).length || !Object.keys(toothImageCurrentStatusKids).length) return
        setInitialize(true);
  
    }, [treatmentPlan, patientData, toothImage, toothImageCurrentStatus, toothImageCurrentStatusKids, toothImageInitialStatusKids]);


    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };


        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${currData.organisation._id}/${id}/${tooth}`, options);
                const response = await request.json();
                console.log(response);
                if (response.success) setToothImage(currImages => {
                    return {...currImages, 
                        [tooth]: response.tooth
                    };
                });
            } catch (e) {
                console.log(e);
            }
        });
   
    }, [TEETH]);

    useEffect(() => {

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        TEETH_KIDS_NUMBERS.forEach(async (tooth, idx) => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${currData.organisation._id}/${id}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageInitialStatusKids(currImages => {
                    return {...currImages,
                        [TEETH_KIDS[idx]]: response.tooth
                    };
                });
            } catch (e) {
                console.log(e);
            }
        });
    }, [TEETH_KIDS, TEETH_KIDS_NUMBERS]);
    
    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };


        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-treatment-plan/${currData.organisation._id}/${id}/${treatmentPlanId}/${tooth}`, options);
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
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-treatment-plan/${currData.organisation._id}/${id}/${treatmentPlanId}/${tooth}`, options);
                const response = await request.json();
                
                if (response.success) setToothImageCurrentStatusKids(currImages => {
                    return {...currImages,
                        [TEETH_KIDS[idx]]: response.tooth
                    };
                });
            } catch (e) {
                console.log(e);
            }
        });
    }, []);

    useEffect(() => {
        console.log(toothImage, toothImageInitialStatusKids, toothImageCurrentStatus, toothImageCurrentStatusKids);
    }, [toothImage, toothImageInitialStatusKids, toothImageCurrentStatus, toothImageCurrentStatusKids]);




    return initialize ? (
        <div>
            <PDFViewer style={{ height: "100vh", width: "100%" }}>
                <Document>
                <Page size="A4"> 
                    <View style={{ width: "90%", marginHorizontal: "auto", padding: 20, flex: 1, marginTop: 30 }}>
                        <Text style={{ fontSize: 16, textAlign: "center", fontWeight: 700 }}>{cookies?.language === "en" ? "Treatment Plan" : "Plan de tratament"}</Text>
                        <Text style={{ fontSize: 16, textAlign: "center", fontWeight: 700 }}>{new Date(treatmentPlan.date).getDate() < 10 ? `0${new Date(treatmentPlan.date).getDate()}` : new Date(treatmentPlan.date).getDate()}.{new Date(treatmentPlan.date).getMonth() + 1 < 10 ? `0${new Date(treatmentPlan.date).getMonth() + 1}` : new Date(treatmentPlan.date).getMonth() + 1}.{new Date(treatmentPlan.date).getFullYear()}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 700 }}>Pacient: {patientData?.firstname || ""} {patientData?.lastname || ""}</Text>

                        <View style={{ marginTop: 50 }}>
                            <Text style={{ color: "blue", fontWeight: 700 }}>{cookies?.language === "en" ? "Initial Status" : "Status initial"}</Text>
                       

                            <View style={{ flexDirection: "row", gap: "10px", marginTop: 20 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx >= 16) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", flex: 1, fontSize: 12 }}>{tooth}</Text>
                                            <Image style={{ width: '30px' }} src={{ uri:`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImage?.[tooth] || ""}.png`, method: "GET", headers: { "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" }, body: "" }}  />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", gap: "10px" }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx < 16) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Image style={{ width: '30px' }} src={{ uri:`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImage?.[tooth] || ""}.png`, method: "GET", headers: { "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" }, body: "" }}  />
                                            <View style={{ flex: 1 }}></View>
                                            <Text style={{ textAlign: "center", fontSize: 12 }}>{tooth}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", marginTop: 50 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx >= 10) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", fontSize: 12, flex: 1 }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                            <Image style={{ width: '30px' }} source={`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageInitialStatusKids[tooth] || ""}.png`} />
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row" }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx < 10) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Image style={{ width: '30px' }} source={`${process.env.REACT_APP_URL}/teeth/pictograme_terminate_dinti/${tooth}/${tooth}${toothImageInitialStatusKids[tooth] || ""}.png`} />
                                            <View style={{ flex: 1 }}></View>
                                            <Text style={{ textAlign: "center", fontSize: 12 }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            
                        </View>

                        <View style={{ marginTop: 150 }}>
                            <Text style={{ color: "blue" }}>{cookies?.language === "en" ? "Final Status" : "Status Final"}</Text>
                            <View style={{ flexDirection: "row", marginTop: 20 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx >= TEETH.length / 2) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", fontSize: 12, flex: 1 }}>{tooth}</Text>
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
                                            <Text style={{ textAlign: "center", fontSize: 12 }}>{tooth}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", marginTop: 50 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx >= TEETH_KIDS.length / 2) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", fontSize: 12, flex: 1 }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
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
                                            <Text style={{ textAlign: "center", fontSize: 12 }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
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