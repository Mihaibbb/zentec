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
import { useLocation, useParams } from "react-router-dom";
import { TEETH, TEETH_KIDS, TEETH_KIDS_NUMBERS } from "../utils/TeethOrder";
import { useCookies } from "react-cookie";
import sourceSansProBold from "../fonts/source-sans-pro-bold.ttf";
import sourceSansPro  from "../fonts/source-sans-pro.semibold.ttf";

const DocumentPatientTreatment = ({ data : currData }) => {

    Font.register({ family: "Source-Sans-Pro-Bold", src: sourceSansProBold, fontWeight: "bold" });
    Font.register({ family: "Source-Sans-Pro", src: sourceSansPro });

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

    const styles = StyleSheet.create({
        boldText: {
            fontSize: 16,
            textAlign: "center",
            fontFamily: "Source-Sans-Pro-Bold"
        },

        normalText: {
            fontSize: 14,
            fontFamily: "Source-Sans-Pro"
        }
    });

    return initialize ? (
        <div>
            <PDFViewer style={{ height: "100vh", width: "100%" }}>
                <Document>
                <Page size="A4"> 
                    <View style={{ width: "90%", marginHorizontal: "auto", padding: 20, flex: 1, marginTop: 30 }}>
                        <Text style={styles.boldText}>{cookies?.language === "en" ? "Treatment Plan" : "Plan de tratament"}</Text>
                        <Text style={styles.boldText}>{new Date(treatmentPlan.date).getDate() < 10 ? `0${new Date(treatmentPlan.date).getDate()}` : new Date(treatmentPlan.date).getDate()}.{new Date(treatmentPlan.date).getMonth() + 1 < 10 ? `0${new Date(treatmentPlan.date).getMonth() + 1}` : new Date(treatmentPlan.date).getMonth() + 1}.{new Date(treatmentPlan.date).getFullYear()}</Text>
                        <Text style={styles.normalText}>Pacient: {patientData?.firstname || ""} {patientData?.lastname || ""}</Text>

                        <View style={{ marginTop: 50 }}>
                            <Text style={{ color: "#8146ff", fontFamily: "Source-Sans-Pro-Bold" }}>{cookies?.language === "en" ? "Initial Status" : "Status initial"}</Text>
                       

                            <View style={{ flexDirection: "row", gap: "10px", marginTop: 20 }}>
                                {TEETH.map((tooth, idx) => {
                                    if (idx >= 16) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", flex: 1, fontSize: 12, fontFamily: "Source-Sans-Pro" }}>{tooth}</Text>
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
                                            <Text style={{ textAlign: "center", fontSize: 12, fontFamily: "Source-Sans-Pro" }}>{tooth}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: "row", marginTop: 50 }}>
                                {TEETH_KIDS.map((tooth, idx) => {
                                    if (idx >= 10) return <></>;
                                    return (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ textAlign: "center", fontSize: 12, flex: 1, fontFamily: "Source-Sans-Pro" }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
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
                                            <Text style={{ textAlign: "center", fontSize: 12, fontFamily: "Source-Sans-Pro" }}>{TEETH_KIDS_NUMBERS[idx]}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            
                        </View>

                        <View style={{ marginTop: 150 }}>
                            <Text style={{ color: "#8146ff", fontFamily: "Source-Sans-Pro-Bold" }}>{cookies?.language === "en" ? "Final Status" : "Status Final"}</Text>
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
    ) : <h1>Hello</h1>;
};


export default DocumentPatientTreatment;