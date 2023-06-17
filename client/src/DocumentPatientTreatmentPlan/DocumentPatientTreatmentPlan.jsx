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
    const treatmentPlanData = useMemo(() => {
        return currData.organisation.treatments_plan_patients.find(treatmentPlan => treatmentPlan._id === treatmentPlanId);
    }, []);

    const patientId = treatmentPlanData.patientId;
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
        if (!treatmentPlanData || initialize) return;
   


        setInitialize(true);
  
    }, [treatmentPlanData]);


    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };


        TEETH.forEach(async tooth => {
            try {
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
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
                const request = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-tooth-image-initial-status/${data.organisation._id}/${param?.id}/${tooth}`, options);
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
                        <Text style={{ textAlign: "center" }}></Text>
                    
                    </View>
                </Page>
                       
                </Document>
            </PDFViewer>
        </div>
    ) : <h1>Hello</h1>;
};


export default DocumentPatientTreatment;