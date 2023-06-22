import JsBarcode from "jsbarcode";
import React, { useEffect, useMemo, useState } from "react";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { useLocation, useParams } from "react-router-dom";
import sourceSansProBold from "../fonts/source-sans-pro-bold.ttf";
import sourceSansPro from "../fonts/source-sans-pro.regular.ttf";

const SterilizationFiles = ({ data : currData }) => {

    Font.register({ family: "Source-Sans-Pro-Bold", src: sourceSansProBold, fontWeight: "bold" });
    Font.register({ family: "Source-Sans-Pro", src: sourceSansPro });

    const { id } = useParams();
    const location = useLocation();
    const sterilizationData = useMemo(() => {
        return currData.organisation.sterilizations.find(sterilization => sterilization._id === id);
    }, []);

    console.log(JSON.parse(sterilizationData.sterilization_instruments))

    const sterilizationAssistant = useMemo(() => currData.organisation.assistants.find((assistant => assistant._id === sterilizationData.assistant)), [location]);
    
    const styles = StyleSheet.create({
      boldText: {
        fontSize: 8.5,
        fontFamily: "Source-Sans-Pro-Bold"
      },
      
      normalText: {
        fontSize: 8.5,

      }
    });

    const [data, setData] = useState([]);
    const [blobs, setBlobs] = useState([]);
    const [initialize, setInitialize] = useState(false);
    const [barCodes, setBarCodes] = useState([]);

    const ReactBarcode = () => {
        const barWidth = data.encodings[0].options.width;
        const barHeight = data.encodings[0].options.height;
        return (
          <div debug style={{ display: "flex", height: "200px", width: "100%" }}>
            {data.encodings[0].data.split("").map((bar, index) => {
              console.log(Number(bar));
              return (
                <div
                  debug
                  key={index}
                  style={{
                    margin: 0,
                    width: `${barWidth}px`,
                    height: `${barHeight}px`,
                    backgroundColor: Number(bar) ? "black" : "white"
                  }}
                />
              );
            })}
          </div>
        );
      };
      
      const MyBarcode = ({ barCodeData }) => {
        console.log(barCodeData);
        const barWidth = barCodeData.encodings[0].options.width;
        const barHeight = barCodeData.encodings[0].options.height;
        const barWidthRatio = barWidth / barHeight;
        const realHeight = 40;
        const heightRatio = barHeight / realHeight;
        return (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
          
              height: `${realHeight}px`,
              width: `100%`,
              justifyContent: "center",
              marginTop: 3,
              marginHorizontal: "auto",
        
            }}
          >
            {barCodeData.encodings[0].data.split("").map((bar, index) => {
              console.log(Number(bar));
              return (
                <View
                  key={index}
                  style={{
                    margin: 0,
                    
                    width: `${realHeight * barWidthRatio}px`,
                    height: `${barHeight / heightRatio}px`,
                    backgroundColor: Number(bar) ? "black" : "white"
                  }}
                />
              );
            })}
          </View>
        );
      };
    
      
      const MyDocument = ({ barCode, instrument, iso, assistant, sarja, addDate, expireDate, barCodeData }) => (
         
              <Page size={{ width: 150, height: 150 }}>
                <View style={{ width: "90%", marginHorizontal: "auto" }}>
                  <MyBarcode barCodeData={barCodeData} />
                  <Text style={[ styles.normalText, {marginHorizontal: "auto", letterSpacing: 2.2 }]}>{barCode}</Text>

                  <View 
                    style={{
                        display: "flex",
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginLeft: 3.5, 
                        marginTop: 3
                    }}>
                    <Text style={styles.normalText}>Instrument: </Text>
                    <Text style={styles.boldText}>{instrument}</Text>
                  </View>

                  <View 
                    style={{
                         display: "flex",
                        flexDirection: "row",  
                        alignItems: "center", 
                        marginLeft: 3.5, 
                        marginTop: 3
                    }}
                >
                    <Text style={styles.normalText}>Cod ISO: </Text>
                    <Text style={styles.boldText}>{iso}</Text>
                  </View>

                  <View 
                    style={{
                         display: "flex",
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginLeft: 3.5, 
                        marginTop: 3
                    }}>
                    <Text style={styles.normalText}>Sarja: </Text>
                    <Text style={styles.boldText}>{sarja}</Text>
                  </View>
                  <View 
                    style={{
                         display: "flex",
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginLeft: 3.5, 
                        marginTop: 3
                    }}>
                    <Text style={styles.normalText}>Data adaugare: </Text>
                    <Text style={styles.boldText}>{addDate}</Text>
                  </View>
                  <View 
                    style={{
                         display: "flex",
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginLeft: 3.5, 
                        marginTop: 3
                    }}>
                    <Text style={styles.normalText}>Data expirare: </Text>
                    <Text style={styles.boldText}>{expireDate}</Text>
                  </View>
                  <View 
                    style={{
                         display: "flex",
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginLeft: 3.5,                         
                        marginTop: 3
                    }}>
                    <Text style={styles.normalText}>Personal: </Text>
                    <Text style={styles.boldText}>{assistant}</Text>
                  </View>
                </View>
              </Page>
     
    );


    useEffect(() => {
        if (!sterilizationData || initialize) return;
        JSON.parse(sterilizationData.sterilization_instruments).forEach((instrument, idx) => {
            console.log(instrument);
            if (Number(instrument.quantity) === 1 || !instrument.multipleCode) {
                const barCodeValue = `${new Date(sterilizationData.add_date).getFullYear()}${new Date(sterilizationData.add_date).getMonth() + 1 < 10 ? `0${new Date(sterilizationData.add_date).getMonth() + 1}` : new Date(sterilizationData.add_date).getMonth() + 1}${new Date(sterilizationData.add_date).getDate() < 10 ? `0${new Date(sterilizationData.add_date).getDate()}` : new Date(sterilizationData.add_date).getDate()}${sterilizationData.id}1`;
                
                setData(currData => {
                    let newData = {};
                    JsBarcode(newData, barCodeValue);
                    console.log(data);
                    return [...currData, newData];
                });

                setBarCodes(currValues => [...currValues, barCodeValue]);
                
            } else {
                console.log(Number(instrument.quantity));
                for (let quantity = 0; quantity < Number(instrument.quantity); quantity++) {
                    const barCodeValue = `${new Date(sterilizationData.add_date).getFullYear()}${new Date(sterilizationData.add_date).getMonth() + 1 < 10 ? `0${new Date(sterilizationData.add_date).getMonth() + 1}` : new Date(sterilizationData.add_date).getMonth() + 1}${new Date(sterilizationData.add_date).getDate() < 10 ? `0${new Date(sterilizationData.add_date).getDate()}` : new Date(sterilizationData.add_date).getDate()}${sterilizationData.id}${quantity}`;
                    setData(currData => {
                        let newData = {};
                        JsBarcode(newData, barCodeValue);
                        return [...currData, newData];
                    });
                    setBarCodes(currValues => [...currValues, barCodeValue]);

                }
            }

        });


        // document.querySelector("body").appendChild(canvas);
        setInitialize(true);
  
    }, [sterilizationData]);


    useEffect(() => {
        console.log(data, barCodes);
    }, [data, barCodes]);

    return initialize ? (
        <div>
            <PDFViewer style={{ height: "100vh", width: "100%" }}>
                <Document>
                    {JSON.parse(sterilizationData.sterilization_instruments).map((instrument, idx) => {
                        if (Number(instrument.quantity) > 1 && instrument.multipleCode) {
                            const currSterilizations = [];
                            for (let quantity = 0; quantity < Number(instrument.quantity); quantity++)
                                currSterilizations.push(
                                    <MyDocument 
                                        barCode={barCodes[idx  + quantity]} 
                                        assistant={`${sterilizationAssistant.firstname.slice(0, 1)}. ${sterilizationAssistant.lastname}`} 
                                        iso={instrument.iso}
                                        instrument={instrument.name}
                                        sarja={sterilizationData.sarja}
                                        addDate={`${new Date(sterilizationData.add_date).getDate() < 10 ? `0${new Date(sterilizationData.add_date).getDate()}` : new Date(sterilizationData.add_date).getDate()}.${new Date(sterilizationData.add_date).getMonth() + 1 < 10 ? `0${new Date(sterilizationData.add_date).getMonth() + 1}` : new Date(sterilizationData.add_date).getMonth() + 1}.${new Date(sterilizationData.add_date).getFullYear()}`}
                                        expireDate={`${new Date(sterilizationData.expire_date).getDate() < 10 ? `0${new Date(sterilizationData.expire_date).getDate()}` : new Date(sterilizationData.expire_date).getDate()}.${new Date(sterilizationData.expire_date).getMonth() + 1 < 10 ? `0${new Date(sterilizationData.expire_date).getMonth() + 1}` : new Date(sterilizationData.expire_date).getMonth() + 1}.${new Date(sterilizationData.expire_date).getFullYear()}`}
                                        barCodeData={data[idx  + quantity]}
                                    />
                                );

                            return currSterilizations;
                        }

                        return (
                           
                            <MyDocument 
                                barCode={barCodes[idx]} 
                                assistant={`${sterilizationAssistant.firstname.slice(0, 1)}. ${sterilizationAssistant.lastname}`} 
                                iso={instrument.iso}
                                instrument={instrument.name}
                                sarja={sterilizationData.sarja}
                                addDate={`${new Date(sterilizationData.add_date).getDate() < 10 ? `0${new Date(sterilizationData.add_date).getDate()}` : new Date(sterilizationData.add_date).getDate()}.${new Date(sterilizationData.add_date).getMonth() + 1 < 10 ? `0${new Date(sterilizationData.add_date).getMonth() + 1}` : new Date(sterilizationData.add_date).getMonth() + 1}.${new Date(sterilizationData.add_date).getFullYear()}`}
                                expireDate={`${new Date(sterilizationData.expire_date).getDate() < 10 ? `0${new Date(sterilizationData.expire_date).getDate()}` : new Date(sterilizationData.expire_date).getDate()}.${new Date(sterilizationData.expire_date).getMonth() + 1 < 10 ? `0${new Date(sterilizationData.expire_date).getMonth() + 1}` : new Date(sterilizationData.expire_date).getMonth() + 1}.${new Date(sterilizationData.expire_date).getFullYear()}`}
                                barCodeData={data[idx]}
                            />
                            
                        );
                })}
                       
                </Document>
            </PDFViewer>
        </div>
    ) : <h1>Hello</h1>;
};




export default SterilizationFiles;