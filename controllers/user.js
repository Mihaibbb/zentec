const ErrorResponse = require("../handlers/error");
const axios = require("axios");
const db = require("../db");
const generateId = require("../functions/generateId");
const logger = require("../logger");
const schedule = require("node-schedule")

let currentResponse;

exports.createAppointment = async (req, res, next) => {
    const { _id, startDate, endDate, users, patients, title, income, typeIncome, notes, date, language, incomePaid } = req.body;
    console.log( new Date(startDate).getMonth(), new Date(startDate).getDate(), new Date(startDate).getHours(), new Date(startDate).getMinutes());
    console.log(users);
    try {
        // --- Sms Api for patient ---
        // Get api key
        
        sql = "SELECT * FROM ??";
        const detailsOrganisationRows = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.details`]);
        const detailsOrganisation = detailsOrganisationRows[0];
        //const smsMessageRaw = detailsOrganisation["sms_message"];
        const organisationSMS = JSON.parse(detailsOrganisation["sms_message"]);
        const apiKey = detailsOrganisation?.["api_key"];
    
        // 1 day earlier message

        let currentSmsModemId = detailsOrganisation["sms_modem_id"], totalSMS = 0;

        await Promise.all(organisationSMS.map(async sms => {

            logger.debug(sms);

            const currentSmsSchedule = sms.scheduledAt - 2;
            
            let patientsPhones = "";
            
            patients.forEach((currPatient, idx) => idx !== patients.length - 1 ? patientsPhones += `${currPatient.phone.toString().slice(0, 2) === "+4" ? currPatient.phone.toString() : `+4${currPatient.phone}`},` : patientsPhones += `${currPatient.phone.slice(0, 2) === "+4" ? currPatient.phone : `+4${currPatient.phone}`}`);
            const smsStartDate =  new Date(startDate).getTime() - (1000 * 60 * 60 * Number(currentSmsSchedule)) < new Date().getTime() ? new Date().getTime() + 1000 * 15 : new Date(startDate).getTime() - (1000 * 60 * 60 * Number(currentSmsSchedule));
            
            let smsMessage = sms.message.replaceAll("NUME_ORGANIZATIE", detailsOrganisation.name);
            smsMessage = smsMessage.replaceAll("DATA_PROGRAMARE", `${new Date(startDate).getDate() < 10 ? `0${new Date(startDate).getDate()}` : new Date(startDate).getDate()}/${new Date(startDate).getMonth() + 1 < 10 ? `0${new Date(startDate).getMonth() + 1}` : new Date(startDate).getMonth() + 1}/${new Date(startDate).getFullYear()}`);
            smsMessage = smsMessage.replaceAll("ORA_PROGRAMARE", `${new Date(startDate).getHours() + 2 < 10 ? `0${new Date(startDate).getHours() + 2}` : new Date(startDate).getHours() + 2}:${new Date(startDate).getMinutes() < 10 ? `0${new Date(startDate).getMinutes()}` : new Date(startDate).getMinutes()}`);

            smsMessage = smsMessage.replaceAll("LINK_CONFIRMARE", `${process.env.BACKEND_URL}/api/patient/confirm-appointment?organisationId=${_id}&doctorId=${users[0]}&appointmentId=${appointmentId}`);
            
            let config = {
                method: 'POST',
                url: `${process.env.SMS_URL}schedule?username=${process.env.SMS_USERNAME}&apiKey=${process.env.SMS_API}&tel=${patientsPhones}&message=${smsMessage}&modemId=${currentSmsModemId}&schedule=${new Date(smsStartDate).getFullYear()}-${new Date(smsStartDate).getMonth() + 1 < 10 ? `0${new Date(smsStartDate).getMonth() + 1}` : new Date(smsStartDate).getMonth() + 1}-${new Date(smsStartDate).getDate() < 10 ? `0${new Date(smsStartDate).getDate()}` : new Date(smsStartDate).getDate()} ${new Date(smsStartDate).getHours() < 10 ? `0${new Date(smsStartDate).getHours()}` : new Date(smsStartDate).getHours()}:${new Date(smsStartDate).getMinutes() < 10 ? `0${new Date(smsStartDate).getMinutes()}` : new Date(smsStartDate).getMinutes()}:00`,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            try {
                const response = await axios(config);
                logger.debug(response);
                if (response?.status !== "scheduled" && response?.status !== "pending") logger.debug("Error sending scheduled SMS.");
                else totalSMS++;
            } catch (e) {
                logger.debug("Error: ", e);
            }
        }));

        const appointmentId = generateId(25);
        let sql = "INSERT INTO ?? (_id, startDate, endDate, users, patients, title, income, incomePaid, typeIncome, notes, finished, confirmed, canceled, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const insertedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId, new Date(startDate), new Date(endDate), JSON.stringify(users), JSON.stringify(patients), title, income, incomePaid, typeIncome, notes, false, false, false, new Date(date), new Date()]);
        if (!insertedAppointment) return new ErrorResponse("An error occured!", 404);

        // Push message to inbox if patient didn't confirm his appointment
        const hourBeforeSend = 3; // The number of hours before the appointment, so that message can be sent to the doctor
        const dateScheduleMessageInbox = new Date(new Date(startDate).getTime() - 1000 * 60 * 60 * hourBeforeSend); // The time when the message must be sent
        const scheduleMessageInbox = schedule.scheduleJob(dateScheduleMessageInbox, async () => {
            logger.debug("Scheduling appointment...");

            try {

                const appointments = await db.query('SELECT * FROM ?? WHERE _id = ?', [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId]);
                const appointment = appointments[0];
                if (new Date(appointment.startDate).getTime() !== new Date(startDate).getTime() || new Date(appointment.date).getTime() !== new Date(date).getTime()) return; 
                if (appointment.confirmed) return;
    
                let config = {
                    method: 'POST',
                    url: `${process.env.BACKEND_URL}/api/user/push-message-inbox`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        organisationId: _id,
                        doctorId: users[0],
                        message: language === "en" ? `The patient ${patients[0]} didn't confirm his appointment on ${new Date(date).getMonth() + 1}/${new Date(date).getDate()}/${new Date(date).getFullYear()} at ${new Date(startDate).getHours}:${new Date(startDate).getMinutes()}. We recommand you to contact him as soon as possible!`
                                                   :  `Pacientul ${patients[0]} inca nu a confirmat programarea sa din data de ${new Date(date).getDate()}/${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()} la ora ${new Date(startDate).getHours}:${new Date(startDate).getMinutes()}. Va recomandam sa il contactati cat mai curand posibil!`
                    }
                };

                await axios(config);
            } catch (e) {
                logger.debug(e);
            }
            
        }); 
       
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
        logger.debug(e);
        
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }

};

exports.updateAppointment = async (req, res, next) => {
    const { appointmentId, _id, startDate, endDate, users, patients, title, income, incomePaid, typeIncome, notes, date, finished, confirmed, language } = req.body;
    
    try {
        console.log(_id);
        let sql = 'UPDATE ?? SET startDate = ?, endDate = ?, users = ?, patients = ?, title = ?, income = ?, incomePaid = ?, typeIncome = ?, notes = ?, date = ?, finished = ?, confirmed = ? WHERE _id = ?';
        const updatedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, new Date(startDate), new Date(endDate), JSON.stringify(users), JSON.stringify(patients), title, income, incomePaid, typeIncome, notes, new Date(date), finished, confirmed, appointmentId]);
        if (!updatedAppointment) return res.status(200).json({ success: false, message: { en: "Appointment could not be updated!", ro: "Programarea nu a putut fi modificata!" } })
        if (confirmed) return res.status(200).json({ success: true, message: { en: "Appointment updated successfully!", ro: "Programare modificata cu succes!"}});
        
        // Push message to inbox if patient didn't confirm his appointment
        const hourBeforeSend = 3; // The number of hours before the appointment, so that message can be sent to the doctor
        const dateScheduleMessageInbox = new Date(new Date(startDate).getTime() - 1000 * 60 * 60 * hourBeforeSend); // The time when the message must be sent

        const scheduleMessageInbox = schedule.scheduleJob(dateScheduleMessageInbox, async () => {
            logger.debug("Scheduling appointment...");

            try {

                const appointments = await db.query('SELECT * FROM ?? WHERE _id = ?', [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId]);
                const appointment = appointments[0];
                if (new Date(appointment.startDate).getTime() !== new Date(startDate).getTime() || new Date(appointment.date).getTime() !== new Date(date).getTime()) return; 
                if (appointment.confirmed) return;
    
                let config = {
                    method: 'POST',
                    url: `${process.env.BACKEND_URL}/api/user/push-message-inbox`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        organisationId: _id,
                        doctorId: users[0],
                        message: language === "en" ? `The patient ${patients[0]} didn't confirm his appointment on ${new Date(date).getMonth() + 1}/${new Date(date).getDate()}/${new Date(date).getFullYear()} at ${new Date(startDate).getHours}:${new Date(startDate).getMinutes()}. We recommand you to contact him as soon as possible!`
                                                   :  `Pacientul ${patients[0]} inca nu a confirmat programarea sa din data de ${new Date(date).getDate()}/${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()} la ora ${new Date(startDate).getHours}:${new Date(startDate).getMinutes()}. Va recomandam sa il contactati cat mai curand posibil!`
                    }
                };

                await axios(config);
            } catch (e) {
                logger.debug(e);
            }
            
        }); 

        res.status(200).json({ success: true, message: { en: "Appointment updated successfully!", ro: "Programare modificata cu succes!"}})
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.removeAppointment = async (req, res, next) => {
    const { _id, appointmentId, patientId } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";

        const currentAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId]);
        if (!currentAppointment || !currentAppointment?.length) return new ErrorResponse("An error occured!", 404);


        sql = "DELETE FROM ?? WHERE _id = ?";
        const deletedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId]);

        sql = "SELECT * FROM ?? WHERE _id = ?";
        const currentPatients = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, patientId]);
        const historic = JSON.parse(currentPatients[0]?.historic);
        const newHistoric = historic.filter(appointment => {
            return new Date(currentAppointment.startDate).getTime() !== new Date(new Date(appointment.date).getFullYear(), new Date(appointment.date).getMonth(), new Date(appointment.date).getDate(), Number(appointment.startHour), Number(appointment.startMinutes())).getTime();
        });

        await db.query("UPDATE ?? SET historic = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${_id}.patients`, JSON.stringify(newHistoric), patientId]);
        
        res.status(200).json({ success: true, message: { en: "Appointment removed successfully!", ro: "Programare stearsa cu succes!"}});
        
    } catch (e) {
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.cancelAppointment = async (req, res, next) => {

    const { organisationId, scheduleId, patientId } = req.body;

    try {
        const appointmentUpdated = await db.query("UPDATE * FROM ?? SET canceled = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.schedules`, true, scheduleId]);
        if (!appointmentUpdated) return res.status(404).json({ success: false, message: { en: "Appointment couldn't be canceled!", ro: "Programarea nu a putut fi anulata!" } });

        sql = "SELECT * FROM ?? WHERE _id = ?";
        const currentPatient = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, patientId]);
        const historic = JSON.parse(currentPatient.historic);
        const newHistoric = historic.map(appointment => {
            if (new Date(currentAppointment.startDate).getTime() !== new Date(new Date(appointment.date).getFullYear(), new Date(appointment.date).getMonth(), new Date(appointment.date).getDate(), Number(appointment.startHour), Number(appointment.startMinutes())).getTime()) return {...appointment, 
                cancel: true
            }

            return appointment;
        });
        await db.query("UPDATE ?? SET historic = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${_id}.patients`, JSON.stringify(newHistoric), patientId]);
        res.status(200).json({ success: true, message: { en: "Appointment was successfully canceled!", ro: "Programarea a fost anulata cu succes!" } });
    } catch (e) {
        logger.debug("Error cancel appointment: ", e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
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
    logger.debug("Filter: ", filter);
    try {
        
        sql = "SELECT * FROM ??";
        const patientsDb = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`]);
        const schedulesDb = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`]);
        
        // Schedules made
 
        if (filter === "day") {
            const patients = await patientsDb && await patientsDb?.length && await patientsDb.filter(patient => new Date(patient.date).getFullYear() === new Date().getFullYear() &&
                                                                     new Date(patient.date).getMonth() === new Date().getMonth() &&
                                                                     new Date(patient.date).getDate() === new Date().getDate());
    
            const appointments = await schedulesDb && await schedulesDb?.length && await schedulesDb.filter(schedule => new Date(schedule.date).getFullYear() === new Date().getFullYear() &&
                                                                           new Date(schedule.date).getMonth() === new Date().getMonth() &&
                                                                            new Date(schedule.date).getDate() === new Date().getDate());
         
            let totalIncome = 0;
            await appointments && await appointments?.length && await appointments.forEach(appointment => totalIncome = totalIncome + (appointment?.income || 0)); 
            
            res.status(200).json({ success: true, schedulesDb: schedulesDb, patients: await patients?.length || 0, appointments: await appointments?.length || 0, income: totalIncome, typeIncome: await appointments && await appointments.length > 0 && await appointments[0]?.typeIncome ? await appointments[0]?.typeIncome : "LEI" });

        } else if (filter === "week") {
            const days = getWeekDays(new Date());
            
            try {
                 const patients = await patientsDb && await patientsDb?.length && await patientsDb.filter(patient => new Date(patient.date).getTime() >= new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate()).getTime() && new Date(patient.date).getTime() <= new Date(days.at(-1).getFullYear(), days.at(-1).getMonth(), days.at(-1).getDate()).getTime());
    
                const appointments = await schedulesDb && await schedulesDb.length && await schedulesDb.filter(schedule => new Date(schedule.date).getTime() >= new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate()).getTime() && new Date(schedule.date).getTime() <= new Date(days.at(-1).getFullYear(), days.at(-1).getMonth(), days.at(-1).getDate()).getTime());
                console.log(patients);
                let totalIncome = 0;
                await appointments && await appointments?.length && await appointments.forEach(appointment => totalIncome = totalIncome + (appointment?.income || 0)); 
                
                res.status(200).json({ success: true, week: days, patients: await patients?.length || 0, appointments: await appointments?.length || 0, income: totalIncome, typeIncome: await appointments && await appointments.length > 0 && await appointments[0]?.typeIncome ? await appointments[0].typeIncome : "LEI" });
                
            } catch (e) {
                res.status(404).json({ success: false, message: e });
            }

          
            
        } else if (filter === "month") {
      
            const patients = await patientsDb && await patientsDb?.length && await patientsDb.filter(patient => new Date(patient.date).getFullYear() === new Date().getFullYear() &&
                                                                     new Date(patient.date).getMonth() === new Date().getMonth());

            const appointments = await schedulesDb && await schedulesDb?.length && await schedulesDb.filter(schedule => new Date(schedule.date).getFullYear() === new Date().getFullYear() &&
                                                                           new Date(schedule.date).getMonth() === new Date().getMonth());
            let totalIncome = 0;
            await appointments && await appointments?.length && await appointments.forEach(appointment => totalIncome = totalIncome + (appointment?.income || 0)); 
            
            console.log(patients, appointments, totalIncome);
            res.status(200).json({ success: true, patients: await patients?.length || 0, appointments: await appointments?.length || 0, income: totalIncome, typeIncome: await appointments && await appointments.length > 0 && await appointments[0]?.typeIncome ? await appointments[0].typeIncome : "LEI"});
            
        }
        else if (filter === "year") {
            const patients = await patientsDb && await patientsDb?.length && await patientsDb.filter(patient => new Date(patient.date).getFullYear() === new Date().getFullYear());
    
            const appointments = await schedulesDb && await schedulesDb?.length && await schedulesDb.filter(schedule => new Date(schedule.date).getFullYear() === new Date().getFullYear());
            let totalIncome = 0;
            await appointments && await appointments?.length && await appointments.forEach(appointment => totalIncome = totalIncome + (appointment?.income || 0)); 
    
            res.status(200).json({ success: true, patients: await patients?.length || 0, appointments: await appointments?.length || 0, income: totalIncome, typeIncome: await appointments && await appointments.length > 0 && await appointments[0]?.typeIncome ? await appointments[0].typeIncome : "LEI" });
        }

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: e });
    }
    
};  

exports.checkPatient = async (req, res, next) => {
    const { organisationId, patientId } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const patient = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (!patient || !patient?.length) return res.status(200).json({ success: false });
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

        // const phoneNumberValidation = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        // const phoneNumberSecondValidation = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;

        // if (!phone.match(phoneNumberValidation) && !phone.match(phoneNumberSecondValidation)) {
        //     res.status(200).json({ success: false, message: { en: "Please enter a valid phone number!", ro: "Va rugam introduceti un numar de telefon valid!" } });
        //     return;
        // } 

        // Verifying if unique username / email / phone number

        if (!validPhoneNumber("RO", phone)) return res.status(200).json({ success: false, message: { en: "Phone number is not valid!", ro: "Numarul de telefon nu este valid!" }});


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
        const params = [`${process.env.DB_PREFIX}org_${_id}.patients`, patientId, firstname, lastname, username, email, phone, new Date(birthdate), cnp, gender, city, county, address, JSON.stringify(doctors), new Date(), notes, fileNumber, JSON.stringify([]), JSON.stringify([])];
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
        let sql = "USE ??";
        // const organisation = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}`]);
        // if (!organisation || !organisation.length) return res.status(404).json({ success: false, message: "An error occured!" });

        if (email && email.length > 0) {
            const emailValidation = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!email.match(emailValidation)) return res.status(200).json({ success: false, message: { en: "Please enter a valid email!", ro: "Va rugam introduceti un email valid!" } });
        }

        if (!validPhoneNumber("RO", phone)) return res.status(200).json({ success: false, message: {en: "Phone number is not valid!", ro: "Numarul de telefon nu este valid!" }});

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
            sql = "SELECT * FROM ?? WHERE fileNumber = ? AND _id != ?";
            const fileNumberUsed = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, fileNumber, patientId]);
            if (await fileNumberUsed && await fileNumberUsed.length > 0) return res.status(200).json({ success: false, message: {en: "File number is already used!", ro: "Numarul de fisa este deja inregistrat!"} });
        }
        // Update every field of patient's account  
        const params = [`${process.env.DB_PREFIX}org_${organisationId}.patients`];
        sql = "UPDATE ?? SET firstname = ?, "; params.push(firstname);
        sql += "lastname = ?, "; params.push(lastname);
        sql += "username = ?, "; params.push(username);
        sql += "email = ?, "; params.push(email);
        sql += "phone = ?, "; params.push(phone);
        sql += "birthdate = ?, "; params.push(new Date(birthdate));
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
        res.status(404).json({ success: false, message: e });
    }
};

exports.removePatient = async (req, res, next) => {
    const { _id, patientId } = req.body;

    try {
        let sql = "DELETE FROM ?? WHERE _id = ?";
        const deletedPatient = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`, patientId]);
        if (!deletedPatient) return new ErrorResponse("An error occured!", 404);

        sql = "SELECT * FROM ??";
        const schedules = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`]);

        // The schedules that the current patient has taken a part into must be removed
        const removingSchedules = schedules.filter(schedule => {
            return JSON.parse(schedule.patients).some(patient => {
                return patient._id === patientId;
            });
        });

        removingSchedules.forEach(async removingSchedule => {
            sql = "DELETE FROM ?? WHERE _id = ?";
            await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, removingSchedule._id]);
        });
        
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
        const endLimit = new Date(new Date().getTime() + 1 * 1000 * 60 * 60 * 24);
        const startEndLimit = new Date(endLimit.getFullYear(), endLimit.getMonth(), endLimit.getDate());
        let sql = "SELECT * FROM ?? WHERE startDate >= ? AND endDate <= ?";
        const schedules = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, new Date(), startEndLimit]);
        // Adding a key of doctor's name in schedules object
        const schedulesWithDoctors = await Promise.all(schedules.map(async (schedule, idx) => {
            const doctors = JSON.parse(await schedule.users);
            let doctorFullname = "";
            sql = "SELECT * FROM ?? WHERE _id = ?";

            if (doctors.length > 1) doctors.forEach(async doctorId => {
                const foundDoctor = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.doctors`, doctorId]);
                if (foundDoctor && foundDoctor[0]) doctorFullname = `${doctorFullname}, ${foundDoctor[0]?.firstname} ${foundDoctor[0]?.lastname}`;
            })
            else {
                const foundDoctor = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.doctors`, doctors[0]]);
                doctorFullname = `${foundDoctor[0]?.firstname} ${foundDoctor[0]?.lastname}`;
            }

            return {
                ...schedule,
                doctorName: doctorFullname
            };
        }));

        res.status(200).json({ success: true, appointments: schedulesWithDoctors });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: 'An error occured.', error: e });
    }
};

exports.getPatients = async (req, res, next) => {
    const { _id } = req.body;
    console.log(req.body);
    try {
        let sql = "SELECT * FROM ??";
        const patients = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.patients`]);
        if (!await patients || !await patients.length) return res.status(200).json({ success: false, message: { en: "No patient was found!", ro: "Nu a fost gasit niciun pacient!" }});
        const sortedPatients = await patients.sort((patient1, patient2) => patient1.fileNumber - patient2.fileNumber);
        
        res.status(200).json({ success: true, patients: await sortedPatients });
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
                    (patient.cnp && (patient.PIC.toString().toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.PIC.toString().toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (`${patient.firstname.toLowerCase()} ${patient.lastname.toLowerCase()}`.search(searchQuery.toLowerCase()) !== -1 || `${patient.firstname.toLowerCase()} ${patient.lastname.toLowerCase()}`.includes(searchQuery.toLowerCase())) ||
                    (`${patient.lastname.toLowerCase()} ${patient.firstname.toLowerCase()}`.search(searchQuery.toLowerCase()) !== -1 || `${patient.lastname.toLowerCase()} ${patient.firstname.toLowerCase()}`.includes(searchQuery.toLowerCase()));
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

    if (!validPhoneNumber("RO", phone)) return res.status(200).json({ success: false, message: {en: "Phone number is not valid!", ro: "Numarul de telefon nu este valid!" }});

    if (email && email.length) {
        let sql = "SELECT * FROM ?? WHERE email = ?";
        const sameEmail = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, email]);
        if (await sameEmail.length) return res.status(200).json({ success: false, message: { en: "Email is already taken!", ro: "Email-ul este deja folosit!" } });    
    }
    
    sql = "SELECT * FROM ?? WHERE phone = ?";
    const samePhoneNumber = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, phone]);
    if (await samePhoneNumber.length) return res.status(200).json({ success: false, message: { en: "Phone number is already taken!", ro: "Numarul de telefon este deja folosit!" } })

    sql = "SELECT * FROM ?? WHERE color = ?";
    const sameColor = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, color]);
    if (await sameColor.length) return res.status(200).json({ success: false, message: { en: "Color is already taken!", ro: "Culoarea este deja folosita!" } })

    try {
        sql = "INSERT INTO ?? (_id, firstname, lastname, email, phone, color, schedules, multiple_schedules, services, smsSent, active, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const _id = generateId(25);
        const result = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, _id, firstname, lastname, email, phone, color, JSON.stringify([]), multipleSchedules, JSON.stringify([]), 0, activeDoctor, new Date()]);
        if (await result) return res.status(201).json({ success: true, message: { en: "Doctor created successfully!", ro: "Doctor a fost adaugat cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

exports.removeDoctor = async (req, res, next) => {
    const { organisationId, doctorId } = req.body;
    try {
      
             
        const schedules = await db.query("SELECT * FROM ??;", [`${process.env.DB_PREFIX}org_${organisationId}.schedules`]);
        
        schedules && schedules?.length && schedules.forEach(async schedule => {

            const users = JSON.parse(schedule.users);
            if (users.includes(doctorId)) await db.query("DELETE FROM ?? WHERE _id = ?;", [`${process.env.DB_PREFIX}org_${organisationId}.schedules`, schedule._id]);
        });

        let sql = "DELETE FROM ?? WHERE _id = ?;";
        const result = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);

        if (result) return res.status(200).json({ success: true, message: { en: "Doctor removed successfully!", ro: "Doctorul a fost sters cu succes!" } })
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: e, ro: e } });
    }
};

exports.editDoctor = async (req, res, next) => {
    const { organisationId, doctorId, firstname, lastname, email, phone, color, multipleSchedules, activeDoctor } = req.body;
 
    if (!validPhoneNumber("RO", phone)) return res.status(200).json({ success: false, message: {en: "Phone number is not valid!", ro: "Numarul de telefon nu este valid!" }});
    
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

        if (repeat) {
            const foundDate = new Date(date);
            const threeYearsInUnix = 1000 * 60 * 60 * 24 * 365
            for (let currDate = foundDate.getTime(); currDate <= foundDate.getTime() + threeYearsInUnix; currDate += 1000 * 60 * 60 * 24 * 7) {
                schedules.push({
                    startHour,
                    startMinutes,
                    endHour,
                    endMinutes,
                    repeat: false,
                    dayNumber,
                    date: new Date(currDate),
                    scheduleId: generateId(25),
                    notes
                });
            }
        }

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
    console.log("HAHHAH", req.query);
    const { organisationId, doctorId, scheduleId } = req.query;
    try {

        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        
        if (await doctors.length !== 1) return res.status(404).json({ success: false, message: { en: "Doctor doesn't exist!", ro: "Doctorul nu exista!"} });
        const schedules = JSON.parse(await doctors[0].schedules);
        const foundSchedule = await schedules.find(schedule => schedule.scheduleId === scheduleId);
        console.log(schedules);
        const updatedSchedules = await schedules.filter(schedule => {
            
            const sameTime = (
                Number(schedule.dayNumber) === Number(foundSchedule.dayNumber) &&
                Number(schedule.startHour) === Number(foundSchedule.startHour) &&
                Number(schedule.startMinutes) === Number(foundSchedule.startMinutes) &&
                Number(schedule.endHour) === Number(foundSchedule.endHour) &&
                Number(schedule.endMinutes) === Number(foundSchedule.endMinutes)
            );

            console.log(sameTime);
                
            if (sameTime && foundSchedule.repeat) return false;
            return (schedule.scheduleId !== scheduleId);
        });

        console.log(await updatedSchedules);

        sql = "UPDATE ?? SET schedules = ? WHERE _id = ?";
        const removedSchedule = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, JSON.stringify(await updatedSchedules), doctorId]);
        if (await removedSchedule) res.status(200).json({ success: true, message: { en: "Schedule removed successfully!", ro: "Program sters cu succes!" } });
        
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occurred!", ro: "A aparut o eroare!" } });
    }
};

// Edit schedule

exports.editDoctorSchedule = async (req, res, next) => {
    const { organisationId, doctorId, scheduleId, startHour, startMinutes, endHour, endMinutes, repeat, dayNumber, notes } = req.body;
    console.log("Patent");
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        if (await doctors.length !== 1) return res.status(404).json({ success: false, message: { en: "Doctor doesn't exist!", ro: "Doctorul nu exista!"} });
        let schedules = JSON.parse(await doctors[0].schedules);
        let found = false;

        for (let scheduleIdx = 0; scheduleIdx < schedules.length && !found; scheduleIdx++)
            if (schedules[scheduleIdx].scheduleId === scheduleId) 
                found = scheduleIdx;
        
        if (schedules[found].repeat && !repeat) {
            const foundDayNumber = schedules[found].dayNumber;
            const foundStartHour = schedules[found].startHour;
            const foundStartMinutes = schedules[found].startMinutes;
            const foundEndHour = schedules[found].endHour;
            const foundEndMinutes = schedules[found].endMinutes;

            schedules = schedules.filter((schedule, idx) => {
                const sameDay = schedule.dayNumber === foundDayNumber;
                const sameStartHour = schedule.startHour === foundStartHour;
                const sameStartMinutes = schedule.startMinutes === foundStartMinutes;
                const sameEndHour = schedule.endHour === foundEndHour;
                const sameEndMinutes = schedule.endMinutes === foundEndMinutes;
                return idx === found || !(sameDay && sameStartHour && sameStartMinutes && sameEndHour && sameEndMinutes);
            });

        } else if (!schedules[found].repeat && repeat) {
            const foundDate = new Date(schedules[found].date);
            const threeYearsInUnix = 1000 * 60 * 60 * 24 * 365
            for (let currDate = foundDate.getTime(); currDate <= foundDate.getTime() + threeYearsInUnix; currDate += 1000 * 60 * 60 * 24 * 7) {
                schedules.push({
                    startHour,
                    startMinutes,
                    endHour,
                    endMinutes,
                    repeat: false,
                    dayNumber,
                    date: new Date(currDate),
                    scheduleId: generateId(25),
                    notes
                });
            }
        }

        // Repeat getting idx because the idx might have suffered because of adding elements and deleting them
        found = false;
        for (let scheduleIdx = 0; scheduleIdx < schedules.length && !found; scheduleIdx++)
            if (schedules[scheduleIdx].scheduleId === scheduleId) 
                found = scheduleIdx;
        
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

exports.sendFeedback = async (req, res, next) => {
    const { from, type, feedbackMessage, applicationMessage, organisationId } = req.body;

    try {
        let sql = "INSERT INTO ?? (_id, application_message, feedback_message, username, type) VALUES (?, ?, ?, ?, ?)";
        const result = await db.query(sql, [`${process.env.DB_PREFIX}zentec.feedback`, organisationId, applicationMessage, feedbackMessage, from, type]);
        if (!result) return res.status(200).json({ success: false, message: "An error occured!", error: result });
        res.status(200).json({ success: true, message: "Feedback sent!" });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.responseSMS = async (req, res, next) => {
    const { phone, date, message } = req.body;

    try {
        const currentDatabases = await db.query("SHOW DATABASES;");
        const organisationsUnfiltered = currentDatabases.map(database => {
            if (Object.values(database)[0].includes(`${process.env.DB_PREFIX}org_`) && Object.values(database)[0].search("_backup") === -1) return Object.values(database)[0];
            return null;
        });

        const organisations = organisationsUnfiltered.filter(organisation => organisation !== null);
        organisations.forEach(async organisation => {
            let orgId = "", currIdx = organisation.length - 1;
            while (organisation[currIdx] !== "_") {
                orgId = organisation[currIdx] + orgId;
                currIdx--;
            }
            const futureSchedules = await db.query('SELECT * FROM ?? WHERE startDate > ?', [`${organisation}.schedules`, new Date(date)]);
            const patientSchedules = futureSchedules.filter(async futureSchedule => {
                const patients = JSON.parse(futureSchedule.patients);
                return patients.some(patient => {
                    return patient.phone === phone;
                });
            });

            patientSchedules.sort((patientSchedule1, patientSchedule2) => {
                return new Date(patientSchedule1.startDate).getTime() - new Date(patientSchedule2.startDate).getTime(); 
            });

            const currentDate = new Date(patientSchedules[0])
            const confirmingSchedules = patientSchedules.filter(patientSchedule => sameDate(new Date(patientSchedule.startDate), currentDate));
            confirmingSchedules.forEach(async confirmingSchedule => {
                await db.query("UPDATE ?? SET confirmed = ? WHERE _id = ?", [`${organisation}.schedules`, message.toLowerCase().includes("da"), confirmingSchedule._id]);
                const organisationDetailsRows = await db.query("SELECT * FROM ??", [`${organisation}.details`]);
                const organisationDetails = organisationDetailsRows[0];
                const currentInbox = JSON.parse(organisationDetails.inbox);
                let messageId = generateId(25);
                while (inbox.some(inboxMessage => inboxMessage.id === messageId)) messageId = generateId(25);
                const scheduleDate = `${new Date(confirmingSchedule.date).getDate() < 10 ? `0${new Date(confirmingSchedule.date).getDate()}` : new Date(confirmingSchedule.date).getDate()}/${new Date(confirmingSchedule.date).getMonth() + 1 < 10 ? `0${new Date(confirmingSchedule.date).getMonth() + 1}` : new Date(confirmingSchedule.date).getMonth() + 1}/${new Date(confirmingSchedule.date).getFullYear()}`;
                const scheduleStartHour = new Date(confirmingSchedule.startDate).getHours() < 10 ? `0${new Date(confirmingSchedule.startDate).getHours()}` : new Date(confirmingSchedule.startDate).getHours();
                const scheduleStartMinutes = new Date(confirmingSchedule.startDate).getMinutes() < 10 ? `0${new Date(confirmingSchedule.startDate).getMinutes()}` : new Date(confirmingSchedule.startDate).getMinutes();
                const scheduleEndHour = new Date(confirmingSchedule.endDate).getHours() < 10 ? `0${new Date(confirmingSchedule.endDate).getHours()}` : new Date(confirmingSchedule.endDate).getHours();
                const scheduleEndMinutes = new Date(confirmingSchedule.endDate).getMinutes() < 10 ? `0${new Date(confirmingSchedule.endDate).getMinutes()}` : new Date(confirmingSchedule.endDate).getMinutes();

                currentInbox.push({
                    doctorId,
                    doctorName,
                    message: `Pacientul ${JSON.parse(confirmingSchedule.patients)[0].firstname} ${JSON.parse(confirmingSchedule.patients)[0].lastname} a confirmat programarea din data ${scheduleDate} de la ora ${scheduleStartHour}:${scheduleStartMinutes} la ora ${scheduleEndHour}:${scheduleEndMinutes}`,
                    createdAt: new Date(),
                    id: messageId
                });

                await db.query("UPDATE ?? SET inbox = ? WHERE _id = ?", [`${organisation}.details`, JSON.stringify(currentInbox), orgId]);
                
            });

        });

        res.status(200).json({ success: true });


    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: 'An error occured!' });
    }
};

exports.responseSMSDecline = async (req, res, next) => {
    const { phone, date, message } = req.body;

    try {

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: 'An error occured!' });
    }
};


exports.addSMS = async (req, res, next) => {
    const { organisationId, scheduledAt, sms } = req.body;
    try {
        const detailsRow = await db.query("SELECT * FROM ??", [`${process.env.DB_PREFIX}org_${organisationId}.details`]);
        const details = await detailsRow[0];
        const currentSmsMessage = JSON.parse(details["sms_message"]);
        
        let newId = generateId(25);
        while (currentSmsMessage.some(smsMessage => smsMessage.id === newId)) newId = generateId(25);

        currentSmsMessage.push({
            scheduledAt,
            sms,
            id: newId
        });

        await db.query("UPDATE ?? SET sms_message = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.details`, JSON.stringify(currentSmsMessage), organisationId]);

        res.status(200).json({
            success: true,
            message: { en: 'SMS added successfuly!', ro: 'SMS adaugat cu succes!' }
        });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({
            success: false,
            message: "An error occured!"
        });
    }
};

exports.removeSMS = async (req, res, next) => {
    const { organisationId, smsId } = req.body;

    try {
        const detailsRow = await db.query("SELECT * FROM ??", [`${process.env.DB_PREFIX}org_${organisationId}.details`]);
        const details = await detailsRow[0];
        const currentSmsMessage = JSON.parse(details["sms_message"]);

        const newSmsMessage = currentSmsMessage.filter(smsMessage => smsMessage.id === smsId);

        await db.query("UPDATE ?? SET sms_message = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.details`, JSON.stringify(newSmsMessage), organisationId]);
        
        res.status(200).json({ 
            success: true,
            message: { en: "SMS removed successfully!", ro: "SMS-ul a fost sters cu succes!" }
         });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({
            message: "An error occured!",
            success: false
        });
    }
};

exports.editSMS = async (req, res, next) => {
    const { scheduledAt, sms, organisationId, smsId } = req.body;
    try {
        const detailsRow = await db.query("SELECT * FROM ??", [`${process.env.DB_PREFIX}org_${organisationId}.details`]);
        const details = await detailsRow[0];
        const currentSmsMessage = JSON.parse(details["sms_message"]);

        const newSmsMessage = currentSmsMessage.map(smsMessage => {
            if (smsMessage.id === smsId) return {
                id: smsMessage.id,
                sms: sms,
                scheduledAt: scheduledAt
            };

            return smsMessage;
        });

        await db.query("UPDATE ?? SET sms_message = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.details`, JSON.stringify(newSmsMessage), organisationId]);
        
        res.status(200).json({ 
            success: true,
            message: { en: "SMS removed successfully!", ro: "SMS-ul a fost sters cu succes!" }
         });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({
            message: "An error occured!",
            success: false
        });
    }
};

exports.createService = async (req, res, next) => {
    const { organisationId, doctorId, serviceName, serviceColor, servicePrice } = req.body;
    
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const currentDoctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        logger.debug(currentDoctors);
        const currentDoctor = currentDoctors[0];
        const currentServices = JSON.parse(currentDoctor.services);
           
        let serviceId = generateId(25);
        while (currentServices.some(service => service.id === serviceId)) serviceId = generateId(25);

        currentServices.push({
            id: serviceId,
            color: serviceColor,
            name: serviceName,
            price: servicePrice
        });

        sql = "UPDATE ?? SET services = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, JSON.stringify(currentServices), doctorId]);

        res.status(200).json({
            success: true,
            message: {
                en: "Service created successfully!",
                ro: "Serviciul a fost creat cu succes!"
            }
        });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({ 
            message: {
                en: "Service couldn't be created!",
                ro: "Serviciul nu a putut fi creat!"
            },
            success: false,
            error: e
        });
    }
};

exports.removeService = async (req, res, next) => {
    const { doctorId, serviceId } = req.body;

    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const currentDoctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        const currentDoctor = currentDoctors[0];
        const currentServices = JSON.parse(currentDoctor.services);

        const newServices = currentServices.filter(service => service.id !== serviceId);

        sql = "UPDATE ?? SET services = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, JSON.stringify(newServices), doctorId]);

        res.status(200).json({
            success: true,
            message: {
                en: "Service removed successfully!",
                ro: "Serviciul a fost sters cu succes!"
            }
        });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({ 
            message: {
                en: "Service couldn't be removed!",
                ro: "Serviciul nu a putut fi sters!"
            },
            success: false,
            error: e
        });
    }
};

exports.editService = async (req, res, next) => {
    const { doctorId, serviceName, serviceColor, servicePrice, serviceId } = req.body;
    
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const currentDoctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        if (!currentDoctors || !currentDoctors.length) return res.status(404).json({ success: false, message: { en: "Doctor couldn't be found!", ro: "Doctorul nu a putut fi gasit!" } });
        const currentDoctor = currentDoctors[0];
        const currentServices = JSON.parse(currentDoctor.services);

        const modifiedServices = currentServices.map(service => {
            if (service.id === serviceId) return {...service,
                name: serviceName,
                color: serviceColor,
                price: servicePrice,
            };

            return service;
        });

        
        sql = "UPDATE ?? SET services = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, JSON.stringify(modifiedServices), doctorId]);

        res.status(200).json({
            success: true,
            message: {
                en: "Service edited successfully!",
                ro: "Serviciul a fost modificat cu succes!"
            }
        });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({
            message: {
                en: "Service couldn't be modified!",
                ro: "Serviciul nu a putut fi modificat!"
            },
            success: false,
            error: e
        });
    }
};

exports.pushMessageInbox = async (req, res) => {
    const { organisationId, doctorId, message } = req.body;
    try {

        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const doctorsFound = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, doctorId]);
        const doctor = doctorsFound[0];
        const doctorName = `${doctor.firstname} ${doctor.lastname}`;

        sql = "SELECT * FROM ??";
        const detailsRows = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.details`]);
        const detailsRow = detailsRows[0];
        const inbox = JSON.parse(detailsRow.inbox);

        let messageId = generateId(25);
        while (inbox.some(inboxMessage => inboxMessage.id === messageId)) messageId = generateId(25);

        inbox.push({
            doctorId,
            doctorName,
            message,
            createdAt: new Date(),
            id: messageId
        });

        sql = "UPDATE ?? set inbox = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.details`, JSON.stringify(inbox), organisationId]);
        res.status(200).json({
            success: true,
            message: {
                en: "Inbox message sent successfully!",
                ro: "Mesajul a fost trimis cu succes!"
            }
        });
        
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ 
            success: false,
            message: {
                en: "Message couldn't be send!",
                ro: 'Mesajul nu a putut fi trimis!'
            }
        });
    }
};

exports.removeMessageInbox = async (req, res) => {
    const { inboxMessageId, organisationId } = req.params;

    try {
        let sql = "SELECT * FROM ??";
        const detailsRows = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.details`]);
        const detailsRow = await detailsRows[0];
        const inbox = JSON.parse(detailsRow.inbox);
        const newInbox = inbox.filter(message => message.id !== inboxMessageId);
        
        sql = "UPDATE ?? SET inbox = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.details`, JSON.stringify(newInbox), organisationId]);

        res.status(200).json({
            success: true,
            message: {
                en: "Inbox message was removed successfully!",
                ro: "Mesajul a fost sters cu succes!"
            }
        });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({ 
            success: false,
            message: {
                en: "Inbox message couldn't be removed!",
                ro: "Mesajul nu a putut fi sters!"
            }
        });
    }
};

exports.clearInbox = async (req, res) => {
    const { organisationId } = req.params;
    
    try {
        let sql = "SELECT * FROM ??";
        const detailsRows = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.details`]);
        const detailsRow = await detailsRows[0];
        const inbox = JSON.parse(detailsRow.inbox);
        let newInbox;
        if (req.body?.doctorId) newInbox = inbox.filter(message => message.doctorId !== req.body?.doctorId);
        else newInbox = [];

        sql = "UPDATE ?? SET inbox = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.details`, JSON.stringify(newInbox), organisationId]);

        res.status(200).json({
            success: true,
            message: {
                en: "Inbox was cleared successfully!",
                ro: "Mesajele au fost sterse cu succes!"
            }
        });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({ 
            success: false,
            message: {
                en: "Inbox messages couldn't be removed!",
                ro: "Mesajele nu au putut fi sters!"
            }
        });
    }
};

// Backups

exports.getBackups = async (req, res, next) => {
    const { category, organisationId } = req.query;
    try {
        // Show the database with the backup
        await db.query("USE ??", [`${process.env.DB_PREFIX}org_${organisationId}_backup`]);
        const tablesUnmapped = await db.query("SHOW TABLES");
        const tablesUnfiltered = tablesUnmapped.map(table => Object.values(table)[0]);
        const tables = tablesUnfiltered.filter(table => table.includes(category));
        
        res.status(200).json({ 
            success: true,
            tables: tables
        });

    } catch (e) {
        logger.debug("Backup couldn't be restored!", e);
        res.status(404).json({  
            success: false,
            message: {
                en: "Backups couldn't be fetched!",
                ro: 'Backup-urile nu au putut fi gasite!'
            },
            error: e
        });
    }
};

exports.restoreBackup = async (req, res, next) => {
    const { category, organisationId, date } = req.body;
    try {
        await db.query("TRUNCATE TABLE ??", [`${process.env.DB_PREFIX}org_${organisationId}.${category}`]);
        await db.query("INSERT INTO ?? SELECT * FROM ??", [`${process.env.DB_PREFIX}org_${organisationId}.${category}`, `${process.env.DB_PREFIX}org_${organisationId}_backup.${category}_${new Date(date)}`]);
        res.status(200).json({
            success: true,
            message: {
                en: "Backup made successfully!",
                ro: "Backup-ul a fost facut cu succes!"
            }
        });
    } catch (e) {
        logger.debug("Backup couldn't be restored!", e);
        res.status(404).json({  
            success: false,
            message: {
                en: "Backup couldn't be restored!",
                ro: 'Backup-ul nu a putut fi facut!'
            },
            error: e
        });
    }
};

exports.getStatisticsData = async (req, res, next) => {
    const { _id } = req.body; 
   
};

exports.contactForm = async (req, res, next) => {
    const { firstName, lastName, email, phoneNumber, message } = req.body;
    try {
        await db.query("INSERT INTO ?? (firstname, lastname, email, phone, message) VALUES (?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}zentec.contacts`, firstName, lastName, email, phoneNumber, message]);
        res.status(200).json({ success: true });
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ error: e, message: 'An error eccored!', success: false});
    }
};

exports.createAssistant = async (req, res, next) => {
    const { organisationId, firstName, lastName, phoneNumber, email, language } = req.body;
    try {
        const _id = generateId(25);
        const phoneUsed = await db.query("SELECT * FROM ?? WHERE phone = ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, phone]);
        if (phoneUsed?.length) return res.status(404).json({
            success: false,
            message: language === "en" ? "Phone number is already in use!" : "Numarul de telefon este folosit!"
        });

        const emailUsed = await db.query("SELECT * FROM ?? WHERE email = ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, email]);

        if (emailUsed?.length) return res.status(404).json({
            success: false,
            message: language === "en" ? "Email address is already in use!" : "Adresa de email este folosita!"
        });

        const inserted = await db.query("INSERT INTO ?? (_id, firstname, lastname, phone, email) VALUES (?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, _id, firstName, lastName, phoneNumber, email]);
        if (inserted) return res.status(200).json({
            success: true,
            message: language === "en" ? "Assistant was added successfully!" : "Asistentul a fost adaugat cu succes!"
        });
    
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e});
    }
};

exports.editAssistant = async (req, res, next) => {
    const { organisationId, firstName, lastName, phoneNumber, email, _id, language } = req.body;
    try {
        const phoneUsed = await db.query("SELECT * FROM ?? WHERE phone = ? AND _id != ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, phone, _id]);
        if (phoneUsed && phone > 0) return res.status(404).json({
            success: false,
            message: language === "en" ? "Phone number is already in use!" : "Numarul de telefon este folosit!"
        });

        const emailUsed = await db.query("SELECT * FROM ?? WHERE email = ? AND _id != ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, email, _id]);


        if (emailUsed && email.length > 0) return res.status(404).json({
            success: false,
            message: language === "en" ? "Email address is already in use!" : "Adresa de email este folosita!"
        });

        const inserted = await db.query("UPDATE ?? SET firstname = ?, lastname = ?, phone = ?, email = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, firstName, lastName, phoneNumber, email, _id]);
        if (inserted) return res.status(200).json({
            success: true,
            message: language === "en" ? "Modifications were made successfully!" : "Modificarile au fost salvate cu succes!"
        });

        res.status(200).json({ success: false, message: language === "en" ? "An error occured" : "A aparut o eroare!" });

    } catch (e) {
        logger.debug(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.removeAssistant = async (req, res, next) => {
    const { organisationId, _id, language } = req.params;

    try {
        await db.query("DELETE FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, _id]);
        res.status(200).json({
            success: true,
            message: language === "en" ? "Assistant removed successfully!" : "Asistentul a fost sters cu succes!"
        })
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.assistantInfo = async (req, res, next) => {
    const { organisationId, _id } = req.body;
    try {
        const assistants = await db.query('SELECT * FROM ?? WHERE _id = ?', [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, _id]);
        if (assistants && assistants?.length === 1) return res.status(200).json({ success: true, assistant: assistants[0] });
        res.status(200).json({ success: false, message: "Assistant not found!" });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!" });
    }
};

exports.searchAssistant = async (req, res, next) => {
    const { organisationId, searchQuery } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const totalAssistants = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.assistants`]);
        
        const searchAssistants = await totalAssistants.filter((patient, idx) => {
            return  (patient.firstname.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (patient.lastname.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.lastname.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (patient.phone && (patient.phone.toString().toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.phone.toString().toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (patient.email && (patient.email.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patient.email.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                    (`${patient.firstname.toLowerCase()} ${patient.lastname.toLowerCase()}`.search(searchQuery.toLowerCase()) !== -1 || `${patient.firstname.toLowerCase()} ${patient.lastname.toLowerCase()}`.includes(searchQuery.toLowerCase())) ||
                    (`${patient.lastname.toLowerCase()} ${patient.firstname.toLowerCase()}`.search(searchQuery.toLowerCase()) !== -1 || `${patient.lastname.toLowerCase()} ${patient.firstname.toLowerCase()}`.includes(searchQuery.toLowerCase()));
        });
        
        if (!searchAssistants || !searchAssistants.length > 0) return res.status(200).json({ success: false, message: { en: "No results", ro: "Niciun rezultat" } });
        res.status(200).json({ success: true, assistants: searchAssistants });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
         });
    }
};


exports.createSterilizationInstrument = async (req, res, next) => {
    const { organisationId, isoCode, name, language } = req.body;

    try {

        const _id = generateId(25);
        await db.query("INSERT INTO ?? (iso, name, _id) VALUES (?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.sterilization_instruments`, isoCode, name, _id]);
        res.status(200).json({ 
            success: true, 
            message: language === "en" ? "Sterilization instrument has been added successfully!" : "Instrumentul de sterilizare a fost adaugat cu success!" 
        });
    
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.editSterilizationInstrument = async (req, res, next) => {
    try {
        const { organisationId, isoCode, name, language, _id } = req.body;
        await db.query("UPDATE ?? SET name = ?, iso = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.sterilization_instruments`, name, isoCode, _id]);
        res.status(200).json({
            success: true,
            message: language === "en" ? "Modifications were saved successfully!" : "Modificarile au fost salvate cu succes!"
        });
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.removeSterilizationInstrument = async (req, res, next) => {
    const { organisationId, _id, language } = req.params;
    try {
        await db.query("DELETE FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.sterilization_instruments`, _id]);
        res.status(200).json({
            success: true,
            message: language === "en" ? "Sterilization instrument was removed successfully!" : "Instrumentul de sterilizare a fost sters cu succes!"
        });
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.createSterilization = async (req, res, next) => {
    const { organisationId, language, addDate, expireDate, sarja, assistantId, sterilizationInstruments } = req.body;
    try {
        const _id = generateId(25);
        await db.query("INSERT INTO ?? (_id, add_date, expire_date, sarja, assistant, sterilization_instruments) VALUES (?, ?, ?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.sterilizations`, _id, new Date(addDate), new Date(expireDate), sarja, assistantId, JSON.stringify(sterilizationInstruments)]);
        res.status(200).json({
            success: true,
            message: language === 'en' ? "Sterilization was created successfully!" : "Sterilizarea a fost creata cu succes!"
        });
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ error: e, success: false, message: "An error occured!" });
    }
};

exports.removeSterilization = async (req, res, next) => {
    const { organisationId, _id, language } = req.params;
    try {
        await db.query("DELETE FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.sterilizations`, _id]);
        res.status(200).json({
            success: true,
            message: language === 'en' ? "Sterilization was removed successfully!" : "Sterilizarea a fost stearsa cu succes!"
        });
    } catch (e) {
        logger.debug(e);
        res.status(404).json({
            success: false,
            error: e,
            message: "An error occured!"
        });
    }
};

exports.editSterilization = async (req, res, next) => {
    const { organisationId, _id, language, addDate, expireDate, sarja, assistantId, sterilizationInstruments } = req.body;
    try {
        await db.query("UPDATE ?? SET add_date = ?, expire_date = ?, sarja = ?, assistant = ?, sterilization_instruments = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.sterilizations`, new Date(addDate), new Date(expireDate), sarja, assistantId, JSON.stringify(sterilizationInstruments), _id]);
        res.status(200).json({
            success: true,
            message: language === "en" ? "Modifications were saved successfully!" : "Modificarile au fost salvate cu succes!"
        });
    } catch (e) {
        logger.debug(e);
        res.status(404).json({
            success: false,
            error: e,
            message: "An error occured!"
        });
    }
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

const validPhoneNumber = (system, phoneNumber) => {
    if (system === "RO") {
        let currentPhoneNumber = phoneNumber.replace(/\(|\)|\s+|-/g, "");
        return currentPhoneNumber.length > 9 && currentPhoneNumber.match(/^(?:(?:(?:00\s?|\+)40\s?|0)(?:7\d{2}\s?\d{3}\s?\d{3}|(21|31)\d{1}\s?\d{3}\s?\d{3}|((2|3)[3-7]\d{1})\s?\d{3}\s?\d{3}|(8|9)0\d{1}\s?\d{3}\s?\d{3}))$/);
    }
};

const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));
    return arr.filter((_, index) => results[index]);  
};

