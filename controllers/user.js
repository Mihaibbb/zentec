const Organisation = require("../models/organisationModel");
const ErrorResponse = require("../handlers/error");
const axios = require("axios");
const db = require("../db");
const generateId = require("../functions/generateId");

exports.createAppointment = async (req, res, next) => {
    const { _id, startDate, endDate, users, patients, title, income, typeIncome, notes, date, language } = req.body;
    console.log( new Date(startDate).getMonth(), new Date(startDate).getDate(), new Date(startDate).getHours(), new Date(startDate).getMinutes());
    
    try {
        const appointmentId = generateId(25);
        sql = "INSERT INTO ?? (_id, startDate, endDate, users, patients, title, income, typeIncome, notes, finished, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const insertedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId, new Date(startDate), new Date(endDate), JSON.stringify(users), JSON.stringify(patients), title, income, typeIncome, notes, false, new Date(date), new Date()]);
        if (!insertedAppointment) return new ErrorResponse("An error occured!", 404);
        
        // Sms Api for patient

        // 1 day earlier message

        let patientsPhones = "";
        console.log(patients);
        patients.forEach((currPatient, idx) => idx !== patients.length - 1 ? patientsPhones += `${currPatient.phone},` : patientsPhones += currPatient.phone);

        let data = JSON.stringify({
            phone: patientsPhones,
            shortTextMessage: `Buna ziua! Clinica Zen Tec va asteapta maine la ora ${new Date(startDate).getHours()}:${new Date(startDate).getMinutes()}.`,
            startDate: new Date(startDate).getTime() - (1000 * 60 * 60 * 24),
            endDate: new Date(startDate).getTime() - (1000 * 60 * 60 * 24) + (1000 * 60 * 3)
        });

        let config = {
            method: 'post',
            url: process.env.SMS_URL,
            headers: {
                Authorization: process.env.SMS_API,
                'Content-Type': 'application/json',
            },
            data: data
        };
        
        try {
            const response = await axios(config);
            if (!response) console.log("Error sending scheduled SMS.");
            else console.log("SEND!", response);
        } catch (e) {
            console.log("Error: ", e);
        }

        // 1 hour earlier message
        console.log(new Date(startDate))

        data = JSON.stringify({
            phone: patientsPhones,
            shortTextMessage: language === "ro" ? `Buna ziua! Clinica Zen Tec va asteapta astazi la ora ${new Date(startDate).getHours()}:${new Date(startDate).getMinutes()}.` : ``,
            startDate: new Date(startDate).getTime() - (1000 * 60 * 60) - (1000 * 60 * 3),
            endDate: new Date(startDate).getTime() - (1000 * 60 * 60),
        });

        config = {
            method: 'post',
            url: process.env.SMS_URL,
            headers: {
                Authorization: process.env.SMS_API,
                'Content-Type': 'application/json',
            },
            data: data
        };

        try {
            const response = await axios(config);
            if (!response) console.log("Error sending scheduled SMS.");
            else console.log(response.data)
        } catch (e) {
            console.log("Error: ", e);
        }

        if (req.body?.saved) return res.status(200).json({ success: true, message: { en: "Appointment added successfully!", ro: "Programare adaugata cu succes!" } });
        
        // Push to patient's historic

        patients.forEach(currPatient => {
            (async () => {
                sql = "SELECT * FROM ?? WHERE _id = ?";
                const patientArr = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, currPatient._id]);
                const patient = await patientArr[0];
                console.log(patient);
                const historic = JSON.stringify([...JSON.parse(await patient.historic), {
                    startHour: new Date(startDate).getHours(),
                    startMinutes: new Date(startDate).getMinutes(),
                    endHour: new Date(endDate).getHours(),
                    endMinutes: new Date(endDate).getMinutes(),
                    date: new Date(startDate),
                    price: income,
                    typePrice: typeIncome,
                    title: title
                }]);
        
                sql = "UPDATE ?? SET historic = ? WHERE _id = ?";
                await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, historic, currPatient._id]);    
            })();
        });

        res.status(200).json({ success: true, message: { en: "Appointment added successfully!", ro: "Programare adaugata cu succes!" } });
        
    } catch (e) {
        console.log(e);
        
        res.status(404).json({ success: false, message: "An error occured!" });
    }

};

exports.updateAppointment = async (req, res, next) => {
    const { appointmentId, _id, startDate, endDate, users, patients, title, income, typeIncome, notes, date, finished } = req.body;
    
    try {
        let sql = 'UPDATE ?? SET startDate = ?, endDate = ?, users = ?, patients = ?, title = ?, income = ?, typeIncome = ?, notes = ?, date = ?, finished = ? WHERE _id = ?';
        const updatedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, new Date(startDate), new Date(endDate), JSON.stringify(users), JSON.stringify(patients), title, income, typeIncome, notes, date, finished, appointmentId]);
       
        if (!updatedAppointment) return res.status(200).json({ success: false, message: { en: "Appointment could not be updated!", ro: "Programarea nu a putut fi modificata!" } })
        
        res.status(200).json({ success: true, message: { en: "Appointment updated successfully!", ro: "Programare modificata cu succes!"}})
    } catch (e) {
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.removeAppointment = async (req, res, next) => {
    const { _id, appointmentId } = req.body;
    try {
        let sql = "DELETE FROM ?? WHERE _id = ?";
        const deletedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId]);
        if (!deletedAppointment) return new ErrorResponse("An error occured!", 404);
        
        res.status(200).json({ success: true, message: { en: "Appointment removed successfully!", ro: "Programare stearsa cu succes!"}});
        
    } catch (e) {
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.nextAppointments = async (req, res, next) => {
    const { _id } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE startDate >= ? ORDER BY startDate ASC";
        const nextAppointments = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, new Date()]);

        res.status(200).json({ success: true, appointments: await nextAppointments })
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!" });
    }
};

exports.analytics = async (req, res, next) => {
    const { filter, _id } = req.body;
    console.log(filter);
    try {
        
        sql = "SELECT * FROM ??";
        const patientsDb = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`]);
        const schedulesDb = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`]);
        
        // Schedules made
    
        if (filter === "day") {
            const patients = await patientsDb.filter(patient => new Date(patient.date).getFullYear() === new Date().getFullYear() &&
                                                                     new Date(patient.date).getMonth() === new Date().getMonth() &&
                                                                     new Date(patient.date).getDate() - 1 === new Date().getDate());
    
            const appointments = await schedulesDb.filter(schedule => new Date(schedule.createdAt).getFullYear() === new Date().getFullYear() &&
                                                                           new Date(schedule.createdAt).getMonth() === new Date().getMonth() &&
                                                                            new Date(schedule.createdAt).getDate() - 1 === new Date().getDate());
         
            let totalIncome = 0;
            await appointments.forEach(appointment => totalIncome += appointment.income); 
            
            res.status(200).json({ success: true, patients: await patients.length, appointments: await appointments.length, income: totalIncome, typeIncome: await appointments.length > 0 && await appointments[0].typeIncome ? await appointments[0].typeIncome : "LEI" });
        
        } else if (filter === "week") {
            const days = getWeekDays(new Date());

            const patients = await patientsDb.filter(patient => (new Date(patient.date).getFullYear() >= days[0].getFullYear() && new Date(patient.date).getFullYear() <= days[days.length - 1].getFullYear()) &&
                                                                (new Date(patient.date).getMonth() >= days[0].getMonth() && new Date(patient.date).getMonth() <= days[days.length - 1].getMonth()) &&
                                                                inArr(days, new Date(patient.date).getDate() - 1));
    
            const appointments = await schedulesDb.filter(schedule => (new Date(schedule.createdAt).getFullYear() >= days[0].getFullYear() && new Date(schedule.createdAt).getFullYear() <= days[days.length - 1].getFullYear()) &&
                                                                      (new Date(schedule.createdAt).getMonth() >= days[0].getMonth() && new Date(schedule.createdAt).getMonth() <= days[days.length - 1].getMonth()) &&
                                                                      inArr(days, new Date(schedule.createdAt).getDate() - 1));
            console.log(patients);
            let totalIncome = 0;
            await appointments.forEach(appointment => totalIncome += appointment.income); 
            
            res.status(200).json({ success: true, patients: await patients.length, appointments: await appointments.length, income: totalIncome, typeIncome: await appointments.length > 0 && await appointments[0].typeIncome ? await appointments[0].typeIncome : "LEI" });
            
            
        } else if (filter === "month") {
      
            const patients = await patientsDb.filter(patient => new Date(patient.date).getFullYear() === new Date().getFullYear() &&
                                                                     new Date(patient.date).getMonth() === new Date().getMonth());

            const appointments = await schedulesDb.filter(schedule => new Date(schedule.createdAt).getFullYear() === new Date().getFullYear() &&
                                                                           new Date(schedule.createdAt).getMonth() === new Date().getMonth());
            let totalIncome = 0;
            await appointments.forEach(appointment => totalIncome += appointment.income); 
            
            console.log(patients, appointments, totalIncome);
            res.status(200).json({ success: true, patients: await patients.length, appointments: await appointments.length, income: totalIncome, typeIncome: await appointments.length > 0 && await appointments[0].typeIncome ? await appointments[0].typeIncome : "LEI"});
            
        }
        else if (filter === "year") {
            const patients = await patientsDb.filter(patient => new Date(patient.date).getFullYear() === new Date().getFullYear());
    
            const appointments = await schedulesDb.filter(schedule => new Date(schedule.createdAt).getFullYear() === new Date().getFullYear());
            let totalIncome = 0;
            await appointments.forEach(appointment => totalIncome += appointment.income); 
    
            res.status(200).json({ success: true, patients: await patients.length, appointments: await appointments.length, income: totalIncome, typeIncome: await appointments.length > 0 && await appointments[0].typeIncome ? await appointments[0].typeIncome : "LEI" });
        }

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
    
};  

exports.checkPatient = async (req, res, next) => {
    const { organisationId, patientId } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const patient = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (!await patient) return res.status(200).json({ success: false });
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false });
    }
};

exports.createPatient = async (req, res, next) => {
    const { _id, firstname, username, lastname, email, phone, birthdate, cnp, gender, address, doctors, fileNumber, notes, city, county } = req.body;
    try {
        console.log("phone number", phone);
    

        if (email && email.length > 0) {
            const emailValidation = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!email.match(emailValidation)) {
                res.status(200).json({ success: false, message: { en: "Please enter a valid email!", ro: "Va rugam introduceti un email valid!" } });
                return;
            }
        }

        const phoneNumberValidation = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        const phoneNumberSecondValidation = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;

        if (!phone.match(phoneNumberValidation) && !phone.match(phoneNumberSecondValidation)) {
            res.status(200).json({ success: false, message: { en: "Please enter a valid phone number!", ro: "Va rugam introduceti un numar de telefon valid!" } });
            return;
        } 

        // Verifying if unique username / email / phone number

        sql = "SELECT * FROM ?? WHERE phone = ?";
        const phoneUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, phone]);

        console.log(phoneUsed);
        if (phoneUsed && phoneUsed.length > 0) return res.status(200).json({ success: false, message: { en: "Phone number is already used!", ro: "Numarul de telefon este deja inregistrat!" } });
        
        if (email && email.length > 0) {
            sql = "SELECT * FROM ?? WHERE email = ?";
            const emailUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, email]);

            if (emailUsed && emailUsed.length > 0) return res.status(200).json({ success: false, message: { en: "Email is already used!", ro: "Email-ul este deja folosit!" } });
        }

        if (username && username.length > 0) {
            sql = "SELECT * FROM ?? WHERE username = ?";
            const usernameUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, username]);
            console.log(usernameUsed);
            if (usernameUsed && usernameUsed.length > 0) return res.status(200).json({ success: false, message: { en: "Username is already taken!", ro: "Username-ul este deja inregistrat!" } });
        }

        if (cnp && cnp.length > 0) {
            sql = "SELECT * FROM ?? WHERE cnp = ?";
            const cnpUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, cnp]);
            if (cnpUsed && cnpUsed.length > 0) return res.status(200).json({ success: false, message: {en: "PIC is already used!", ro: "CNP-ul este deja inregistrat!"} });
        }

        if (fileNumber && fileNumber.length > 0) {
            sql = "SELECT * FROM ?? WHERE fileNumber = ?";
            const fileNumberUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, fileNumber]);
            if (fileNumberUsed && fileNumberUsed.length > 0) return res.status(200).json({ success: false, message: {en: "File number is already used!", ro: "Numarul de fisa este deja inregistrat!"} });
        }

        const patientId = generateId(25);

        sql = "INSERT INTO ?? (_id, firstname, lastname, username, email, phone, birthdate, cnp, gender, city, county, address, doctors, date, notes, fileNumber, historic, profileImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [`${process.env.DB_PREFIX}org_${_id}.patients`, patientId, firstname, lastname, username, email, phone, birthdate, cnp, gender, city, county, address, JSON.stringify(doctors), new Date(), notes, fileNumber, JSON.stringify([]), JSON.stringify([])];
        const insertedPatient = await db.query(sql, params);
        if (!insertedPatient) return new ErrorResponse("An error occured!", 404);
        
        res.status(200).json({ success: true, message: { en: "Patient added successfully!", ro: "Pacient a fost adaugat cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.updatePatient = async (req, res, next) => {

    const { organisationId, patientId, firstname, username, lastname, email, phone, birthdate, cnp, gender, address, doctors, fileNumber, notes, city, county } = req.body;
    console.log(username);
    try {
        let sql = "SHOW DATABASES LIKE ??";
        const organisation = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}`]);
        if (!organisation || !organisation.length) return res.status(404).json({ success: false, message: "An error occured!" });

        if (email && email.length > 0) {
            const emailValidation = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!email.match(emailValidation)) return res.status(200).json({ success: false, message: { en: "Please enter a valid email!", ro: "Va rugam introduceti un email valid!" } });
        }

        const phoneNumberValidation = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        const phoneNumberSecondValidation = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;

        if (!phone.match(phoneNumberValidation) && !phone.match(phoneNumberSecondValidation)) 
            return res.status(200).json({ success: false, message: { en: "Please enter a valid phone number!", ro: "Va rugam introduceti un numar de telefon valid!" } });

        // Verifying if unique username / email / phone number
        sql = "SELECT * FROM ?? WHERE phone = ? AND _id != ?";

        const phoneUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, phone, patientId]);
        console.log(await phoneUsed);
        if (await phoneUsed && await phoneUsed.length > 0) return res.status(200).json({ success: false, message: { en: "Phone number is already used!", ro: "Numarul de telefon este deja inregistrat!" } });
            
        if (email && email.length > 0) {
            sql = "SELECT * FROM ?? WHERE email = ? AND _id != ?";

            const emailUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, email, patientId]);
            if (await emailUsed && await emailUsed.length > 0) return res.status(200).json({ success: false, message: { en: "Email is already used!", ro: "Email-ul este deja folosit!" } });
        }

        if (username && username.length > 0) {
            sql = "SELECT * FROM ?? WHERE username = ? AND _id != ?";
            const usernameUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, username, patientId]);
            console.log(await usernameUsed);
            if (await usernameUsed && await usernameUsed.length > 0) return res.status(200).json({ success: false, message: { en: "Username is already taken!", ro: "Username-ul este deja inregistrat!" } });
        }

        if (cnp && cnp.length > 0) {
            sql = "SELECT * FROM ?? WHERE cnp = ? AND _id != ?";
            const cnpUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, cnp, patientId]);
            if (await cnpUsed && await cnpUsed.length > 0) return res.status(200).json({ success: false, message: {en: "PIC is already used!", ro: "CNP-ul este deja inregistrat!"} });
        }

        if (fileNumber && fileNumber.length > 0) {
            sql = "SELECT * FROM ?? WHERE fileNumber = ? AND id != ?";
            const fileNumberUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, fileNumber, patientId]);
            if (await fileNumberUsed && await fileNumberUsed.length > 0) return res.status(200).json({ success: false, message: {en: "File number is already used!", ro: "Numarul de fisa este deja inregistrat!"} });
        }
        // Update every field of patient's account  
        const params = [`${process.env.DB_PREFIX}org_${organisationId}.patients`];
        sql = "UPDATE ?? SET firstname = ?, "; params.push(firstname)
        sql += "lastname = ?, "; params.push(lastname);
        sql += "username = ?, "; params.push(username);
        sql += "email = ?, "; params.push(email);
        sql += "phone = ?, "; params.push(phone);
        sql += "birthdate = ?, "; params.push(birthdate);
        sql += "cnp = ?, "; params.push(cnp);
        sql += "gender = ?, "; params.push(gender);
        sql += "city = ?, "; params.push(city);
        sql += "county = ?, "; params.push(county);
        sql += "address = ?, "; params.push(address);
        sql += "doctors = ?, "; params.push(JSON.stringify(doctors));
        sql += "notes = ?, "; params.push(notes);
        sql += "fileNumber = ? "; params.push(fileNumber);
        sql += "WHERE _id = ?"; params.push(patientId);

        const updatedPatient = await db.query(sql, params);
        if (!await updatedPatient) return new ErrorResponse("An error occured!", 404);
        
        res.status(200).json({ success: true, message: { en: "Patient updated successfully!", ro: "Pacient a fost actualizat cu succes!" } });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!" });
    }
};

exports.removePatient = async (req, res, next) => {
    const { _id, patientId } = req.body;

    try {
        let sql = "DELETE FROM ?? WHERE _id = ?";
        const deletedPatient = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, patientId]);
        
        if (!await deletedPatient) return new ErrorResponse("An error occured!", 404);
        
        res.status(200).json({ success: true, message: { en: "Patient removed successfully!", ro: "Pacientul a fost sters cu succes!" }});
        
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!"});
    }
};

exports.getDoctors = async (req, res, next) => {
    const { _id } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const doctors = db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.doctors`]);
   
        if (await doctors) res.status(200).json({ success: true, doctors: await doctors });
    } catch (e) {
        res.status(404).json({ success: false, message: { en: "An error occured!", ro: "A aparut o eroare!" }});
    }
};

exports.getLatestSchedules = async (req, res, next) => {
    const { _id } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE startDate >= ?";
        const schedules = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, new Date()]);
    

        res.status(200).json({ success: true, schedules: await schedules });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: 'An error occured.' });
    }
};

exports.getPatients = async (req, res, next) => {
    const { _id } = req.body;
    console.log(req.body);
    try {
        let sql = "SELECT * FROM ??";
        const patients = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`]);
        if (!await patients || !await patients.length) return res.status(200).json({ success: false, message: { en: "No patient was found!", ro: "Nu a fost gasit niciun pacient!" }});
        res.status(200).json({ success: true, patients: await patients });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.getSpecificPatient = async (req, res, next) => {
    const { organisationId, patientId } = req.body;
    
};

exports.searchPatient = async (req, res, next) => {
    const { organisationId, searchQuery } = req.body;
    console.log(searchQuery);
    try {
        let sql = "SELECT * FROM ??";
        const totalPatients = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`]);
        
        const searchedPatients = await totalPatients.filter((patient, idx) => {
            return  (patient.firstname.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (patient.lastname.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.lastname.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (patient.phone.toString().toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.phone.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (patient.username && (patient.username.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.username.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.email && (patient.email.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.email.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.country && (patient.country.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.country.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.city && (patient.city.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.city.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.county && (patient.county.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.county.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.address && (patient.address.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.address.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.fileNumber && (patient.fileNumber.toString().toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.fileNumber.toString().toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.cnp && (patient.PIC.toString().toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.PIC.toString().toLowerCase().includes(searchQuery.toLowerCase())));
        });
        console.log(await searchedPatients);
        if (!await searchedPatients || !await searchedPatients.length > 0) return res.status(200).json({ success: false, message: { en: "No results", ro: "Niciun rezultat" } });
        res.status(200).json({ success: true, patients: await searchedPatients });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

// Doctors

exports.createDoctor = async (req, res, next) => {
    const { organisationId, firstname, lastname, email, phone, color, multipleSchedules, activeDoctor } = req.body;

    let sql = "SELECT * FROM ?? WHERE email = ?";
    const sameEmail = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, email]);
    if (await sameEmail.length) return res.status(200).json({ success: false, message: { en: "Email is already taken!", ro: "Email-ul este deja folosit!" } })

    sql = "SELECT * FROM ?? WHERE phone = ?";
    const samePhoneNumber = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, phone]);
    if (await samePhoneNumber.length) return res.status(200).json({ success: false, message: { en: "Phone number is already taken!", ro: "Numarul de telefon este deja folosit!" } })

    sql = "SELECT * FROM ?? WHERE color = ?";
    const sameColor = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, color]);
    if (await sameColor.length) return res.status(200).json({ success: false, message: { en: "Color is already taken!", ro: "Culoarea este deja folosita!" } })

    try {
        sql = "INSERT INTO ?? (_id, firstname, lastname, email, phone, color, schedules, multiple_schedules, active, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const _id = generateId(25);
        const result = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, _id, firstname, lastname, email, phone, color, JSON.stringify([]), multipleSchedules, activeDoctor, new Date()]);
        if (await result) return res.status(201).json({ success: true, message: { en: "Doctor created successfully!", ro: "Doctor a fost adaugat cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

exports.removeDoctor = async (req, res, next) => {
    const { organisationId, doctorId } = req.body;
    try {
        let sql = "DELETE FROM ?? WHERE _id = ?";
        const result = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        if (await result) return res.status(200).json({ success: true, message: { en: "Doctor removed successfully!", ro: "Doctorul a fost sters cu succes!" } })
    } catch (e) {
        console.log(e);
    }
};

exports.editDoctor = async (req, res, next) => {
    const { organisationId, doctorId, firstname, lastname, email, phone, color, multipleSchedules, activeDoctor } = req.body;
    console.log(activeDoctor);
    try {
        let sql = "UPDATE ?? ";
        sql += 'SET firstname = ?, ';
        sql += 'lastname = ?, ';
        sql += 'email = ?, ';
        sql += 'phone = ?, ';
        sql += 'color = ?, ';
        sql += 'multiple_schedules = ?, ';
        sql += 'active = ? ';
        sql += 'WHERE _id = ?';

        const result = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, firstname, lastname, email, phone, color, multipleSchedules, activeDoctor, doctorId]);
        console.log(await result);
        if (await result) return res.status(200).json({ success: true, message: { en: "Doctor edited successfully!", ro: "Doctor a fost editat cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

exports.getDoctorInfo = async (req, res, next) => {
    const { organisationId, doctorId } = req.body;

    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        if (await doctors.length !== 1) return res.status(200).json({ success: false, message: { en: "The doctor was not found!", ro: "Medicul nu a fost gasit!" } });

        res.status(200).json({ success: true, doctor: await doctors[0] });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occured!", ro: "A aparut o eroare!" } });
    }
};

exports.searchDoctor = async (req, res, next) => {
    const { organisationId, searchQuery } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const doctors = await db.query(sql, `${process.env.DB_PREFIX}org_${organisationId}.doctors`);

        const filteredDoctors = await doctors && await doctors.length > 0 && await doctors.filter((doctor, idx) => {
            return  (doctor.firstname.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || doctor.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (doctor.lastname.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || doctor.lastname.toLowerCase().includes(searchQuery.toLowerCase())) || 
                    (doctor.email.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || doctor.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (doctor.phone.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || doctor.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (doctor.color.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || doctor.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (doctor.id.toString().search(searchQuery.toLowerCase()) !== -1 || doctor.id.toString().includes(searchQuery.toLowerCase()) );
        });
        
        console.log("HAHA", await filteredDoctors);
        if (!await filteredDoctors || !await filteredDoctors.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, doctors: await filteredDoctors });
        
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    };
};

// Create a schedule for doctor

exports.createDoctorSchedule = async (req, res, next) => {

    const { organisationId, doctorId, startHour, startMinutes, endHour, endMinutes, date, repeat, dayNumber, notes } = req.body;
    try {
        let sql = "SElECT * FROM ?? WHERE _id = ?";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        if (await doctors.length !== 1) return res.status(404).json({ success: false, message: { en: "Doctor doesn't exist!", ro: "Doctorul nu exista!"} });
        const schedules = JSON.parse(await doctors[0].schedules);

        let scheduleId = generateId(25);
        while (inArrId(schedules, scheduleId, "scheduleId")) scheduleId = generateId(25);
        
        schedules.push({
            startHour,
            startMinutes,
            endHour,
            endMinutes,
            date: new Date(date),
            repeat,
            dayNumber,
            scheduleId,
            notes
        });

        sql = "UPDATE ?? SET schedules = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, JSON.stringify(schedules), doctorId]);
        return res.status(201).json({ success: true, message: { en: "Schedule modified successfully!", ro: "Programul a fost modificat cu succes!" } });
    
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

// Remove schedule

exports.removeDoctorSchedule = async (req, res, next) => {
    const { organisationId, doctorId, scheduleId } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        if (await doctors.length !== 1) return res.status(404).json({ success: false, message: { en: "Doctor doesn't exist!", ro: "Doctorul nu exista!"} });
        const schedules = JSON.parse(await doctors[0].schedules);

        const updatedSchedules = schedules.filter(schedule => schedule.scheduleId !== scheduleId);
        sql = "UPDATE ?? SET schedules = ? WHERE _id = ?";
        const removedSchedule = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, JSON.stringify(updatedSchedules), doctorId]);
        if (await removedSchedule) res.status(200).json({ success: true, message: { en: "Schedule removed successfully!", ro: "Program sters cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

// Edit schedule

exports.editDoctorSchedule = async (req, res, next) => {
    const { organisationId, doctorId, scheduleId, startHour, startMinutes, endHour, endMinutes, repeat, dayNumber, notes } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        if (await doctors.length !== 1) return res.status(404).json({ success: false, message: { en: "Doctor doesn't exist!", ro: "Doctorul nu exista!"} });
        const schedules = JSON.parse(await doctors[0].schedules);
        let found = false;
        for (let scheduleIdx = 0; scheduleIdx < schedules.length && !found; scheduleIdx++) {
            if (schedules[scheduleIdx].scheduleId === scheduleId) {
                found = scheduleIdx;
            }
        }

        schedules[found] = {
            startHour,
            startMinutes,
            endHour,
            endMinutes,
            repeat,
            dayNumber,
            date: new Date(schedules[found].date),
            scheduleId,
            notes
        };

        sql = "UPDATE ?? SET schedules = ? WHERE _id = ?";
        const updatedSchedule = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, JSON.stringify(schedules), doctorId]);
        if (await updatedSchedule) res.status(200).json({ success: true, message: { en: "Schedule updated successfully!", ro: "Programul a fost editat!" } });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

exports.getSchedulesForDay = async (req, res, next) => {
    const { day, month, year, organisationId } = req.body;

    try {
        let sql = "SELECT * FROM ??";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`]);
        const schedules = await Promise.all(await doctors.map(doctor => {
            const doctorSchedules = JSON.parse(doctor.schedules);
            return doctorSchedules.filter(schedule => sameDate(new Date(schedule.date), new Date(year, month, day)));
        }));

        const finalFormSchedules = [];
        schedules.forEach(scheduleArr => {
            scheduleArr.length > 0 && scheduleArr.forEach(schedule => finalFormSchedules.push(schedule));
        });

        console.log(finalFormSchedules);

        res.status(200).json({ success: true, schedules: finalFormSchedules });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occured!", ro: "A aparut o eroare!" } });
    }
};

exports.getStatisticsData = async (req, res, next) => {
    const { _id } = req.body; 
    
};

const encryptData = (data) => {

};

const sameDate = (date1, date2) => {
    console.log("DATE1", date1.getDate(), date2.getDate());
    return date1.getDate() == date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
};

const getWeekDays = (date) => {
    const arr = [new Date(date)];
    const currDay = date.getDay();
    let day = currDay;
    day++;
    while (day <= 7) {
        const currDate = new Date(date);
        currDate.setDate(date.getDate() + (day - currDay));
        arr.push(currDate);
        day++;
    }

    day = currDay;
    day--;
    while (day >= 1) {
        const currDate = new Date();
        currDate.setDate(date.getDate() - (currDay - day));
        arr.unshift(currDate);
        day--;
    }
    console.log(arr);
    return arr;
};

const inArr = (arr, number) => {
    return arr.some(day => day.getDate() === Number(number));
};

const inArrId = (arr, id, key) => {
    return arr.some(element => element[key] === id);
};