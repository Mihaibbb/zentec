import "./PatientsListFile.css";
import {
    PDFViewer,
    Image,
    Page,
    Text,
    View,
    Document
  } from "@react-pdf/renderer";
import { useLocation, useParams } from "react-router-dom";

const PatientsListFile = () => {

    const location = useLocation();
    const { doctorId } = useParams();
    const appointments = location?.state?.appointments;
    console.log(appointments);
    return appointments ? (
        <PDFViewer style={{ height: "100vh", width: "100%" }}>
            <Document>
                <Page size="A4" style={{ flexDirection: "column" }}>
                    <Text style={{ textAlign: "center", marginVertical: 20 }}>Dr. {appointments?.[0]?.doctorName}</Text>
                    {appointments?.length && appointments.map((appointment, idx) => (
                        <View style={{ 
                                marginHorizontal: 16, 
                                borderTopLeftRadius: idx === 0 ? 10 : 0, 
                                borderTopRightRadius: idx === 0 ? 10 : 0, 
                                borderBottomLeftRadius: idx === appointments.length - 1 ? 10 : 0,
                                borderBottomRightRadius: idx === appointments.length - 1 ? 10 : 0,
                                borderWidth: 2, borderColor: "#000", 
                                flexDirection: "row", 
                                alignItems: "center", 
                                justifyContent: "center" 
                            }}>
                            <View style={{ flex: 2, borderRightWidth: 2, borderRightColor: "#000", padding: 12,  alignItems: "center", justifyContent: "center" }}>
                                <Text>{appointment.hour} - {appointment.finishHour}</Text>
                            </View>
                            <View style={{ flex: 5, padding: 6 }}>
                                <Text>{appointment.name}</Text>
                                <Text style={{ fontSize: 12, marginTop: 4 }}>{appointment.title || ""}</Text>
                            </View>
                        </View>
                    ))}
                </Page>
            </Document>
        </PDFViewer>
    ) : null;
};

export default PatientsListFile;