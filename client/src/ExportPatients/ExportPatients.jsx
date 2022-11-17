import XLSX from "sheetjs-style";
import * as FileSaver from "file-saver";

const ExportExcel = (excelData, fileName) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = {
        Sheets: {
            'Pacienti': ws
        },

        SheetNames: ['Pacienti']
    };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    
    // Downloading the excel file
    FileSaver.saveAs(data, fileName + fileExtension);
};

export default ExportExcel;