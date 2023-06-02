const fs = require("fs-extra");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const {organisationId, patientId} = req.params; 
        const path = `../uploads/${organisationId}/${patientId}`;
        fs.mkdirsSync(path);
        cb(null, path);
    },

    filename: (req, file, cb) => {
        const extension = file.originalname.split(".")[file.originalname.split(".").length - 1];
        cb(null, `${req.params?.fileName}.${extension}`);
    }
});

const maxSize = 1000 * 1000 * 512; // 512 MB

const upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
    
        // Set the filetypes, it is optional
        const filetypes = /jpeg|jpg|png|pdf/;
        // let mimetype = filetypes.test(file.mimetype);
        
        let extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (extname) return cb(null, true);
        
      
        cb("Error: File upload only supports the " + "following filetypes - " + filetypes);
    } 
  
});

module.exports = upload;