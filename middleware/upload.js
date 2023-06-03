const fs = require("fs-extra");
const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("PARAMS: ", req.params);
        const {organisationId, patientId} = req.params; 
        const path = `./uploads/${organisationId}/${patientId}`;

        fs.mkdirsSync(path);
        cb(null, path);
    },

    filename: (req, file, cb) => {
        cb(null, req.params.source);
    }
});

const maxSize = 1000 * 1000 * 512; // 512 MB

const upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        console.log("HERE", req.file, req.params);
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