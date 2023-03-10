const getContrastForText = (hex) => {
    if (hex.length === 8) hex = hex.slice(0, 7);
    const hexColor = hex.replace("#", "");
    const [red, green, blue] = [
        parseInt(hexColor.substr(0, 2), 16), // rosu
        parseInt(hexColor.substr(2, 2), 16), // verde
        parseInt(hexColor.substr(4, 2), 16) // albastru
    ];
    
    const yiq = ((red * 299) + (green * 587) + (blue * 114)) / 1000;
    return (yiq >= 128) || hex === "#fff" || hex === "#ffffff" || hex === "#ffffff00" ? '#000' : "#fff";
};

export default getContrastForText;