import { useCookies } from "react-cookie";

const GetToothSurfaces = () => {
    const [cookies, setCookie] = useCookies();

    return cookies?.language === "en" ? [
        "Vestibular (V)",
        "Lingual (L)",
        "Palatal (P)",
        "Mesial (M)",
        "Distal (D)",
        "Occlusal (O)"
    ] : [
        "Vestibulara (V)",
        "Linguala (L)",
        "Palatinala (P)",
        "Mezilala (M)",
        "Distala (D)",
        "Ocluzala (O)"
    ];
};

export default GetToothSurfaces;