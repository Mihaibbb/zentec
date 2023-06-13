const ErrorResponse = require("../handlers/error");
const axios = require("axios");
const db = require("../db");
const generateId = require("../functions/generateId");
const logger = require("../logger");
const schedule = require("node-schedule");
const fs = require("fs");

const { COMPATIBLE_DIAGNOSTICS, SINGLE_DIAGNOSTICS } = require("../functions/compatibleDiagnostics");

let currentResponse;

exports.createAppointment = async (req, res) => {
    const { _id, startDate, endDate, users, patients, title, income, typeIncome, notes, date, language, incomePaid } = req.body;
    console.log( new Date(startDate).getMonth(), new Date(startDate).getDate(), new Date(startDate).getHours(), new Date(startDate).getMinutes());
    console.log(users);
    try {
        // --- Sms Api for patient ---
        // Get api key
        
        let sql = "SELECT * FROM ??";
        const detailsOrganisationRows = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.details`]);
        const detailsOrganisation = detailsOrganisationRows[0];
        //const smsMessageRaw = detailsOrganisation["sms_message"];
        const organisationSMS = JSON.parse(detailsOrganisation["sms_message"]);
        const apiKey = detailsOrganisation?.["api_key"];
        
        // 1 day earlier message

        let currentSmsModemId = detailsOrganisation["sms_modem_id"], totalSMS = 0;
        const appointmentId = generateId(25);


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

        sql = "INSERT INTO ?? (_id, startDate, endDate, users, patients, title, income, incomePaid, typeIncome, notes, finished, confirmed, canceled, unpresented, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const insertedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, appointmentId, new Date(startDate), new Date(endDate), JSON.stringify(users), JSON.stringify(patients), title, income, incomePaid, typeIncome, notes, false, false, false, false, new Date(date), new Date()]);
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

exports.updateAppointment = async (req, res) => {
    const { appointmentId, _id, startDate, endDate, users, patients, title, income, incomePaid, typeIncome, notes, date, finished, confirmed, unpresented, language } = req.body;
    
    try {
        console.log(_id);
        let sql = 'UPDATE ?? SET startDate = ?, endDate = ?, users = ?, patients = ?, title = ?, income = ?, incomePaid = ?, typeIncome = ?, notes = ?, date = ?, finished = ?, confirmed = ?, unpresented = ? WHERE _id = ?';
        const updatedAppointment = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.schedules`, new Date(startDate), new Date(endDate), JSON.stringify(users), JSON.stringify(patients), title, income, incomePaid, typeIncome, notes, new Date(date), finished, confirmed, unpresented, appointmentId]);
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

exports.removeAppointment = async (req, res) => {
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
            return new Date(currentAppointment.startDate).getTime() !== new Date(new Date(appointment.date).getFullYear(), new Date(appointment.date).getMonth(), new Date(appointment.date).getDate(), Number(appointment.startHour), Number(appointment.startMinutes)).getTime();
        });

        await db.query("UPDATE ?? SET historic = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${_id}.patients`, JSON.stringify(newHistoric), patientId]);
        
        res.status(200).json({ success: true, message: { en: "Appointment removed successfully!", ro: "Programare stearsa cu succes!"}});
        
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.removeFutureAppointment = async (req, res) => {
    const { organisationId, patientId, date, startHour, startMinutes, endHour, endMinutes } = req.params;
    try {


        const patientsData = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        const newPatientsHistoric = JSON.parse(patientsData[0]?.historic).filter(historicData => {
            return !(
                sameDate(new Date(historicData?.date), new Date(date)) &&
                Number(historicData.startHour) === Number(startHour) && 
                Number(historicData.startMinutes) === Number(startMinutes) && 
                Number(historicData.endHour) === Number(endHour) && 
                Number(historicData.endMinutes) === Number(endMinutes)
            );
        });

        await db.query("UPDATE ?? SET historic = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, JSON.stringify(newPatientsHistoric), patientId]);


        const totalSchedules = await db.query('SELECT * FROM ??', [`${process.env.DB_PREFIX}org_${organisationId}.schedules`]);
        const foundSchedule = totalSchedules.find(appointment => {
            const appointmentStartHour = new Date(appointment.startDate).getHours();
            const appointmentEndHour = new Date(appointment.endDate).getHours();
            const appointmentStartMinutes = new Date(appointment.startDate).getMinutes();
            const appointmentEndMinutes = new Date(appointment.endDate).getMinutes();
            const samePatient = JSON.parse(appointment.patients).some(patient => patient._id === patientId);

            return samePatient && sameDate(new Date(Number(date)), new Date(appointment.date)) && Number(startHour) === appointmentStartHour && Number(startMinutes) === appointmentStartMinutes && Number(endHour) === appointmentEndHour && Number(endMinutes) === appointmentEndMinutes;
        });

        if (!foundSchedule) return res.status(200).json({ success: false, message: "Appointment not found!" });
        await db.query("DELETE FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.schedules`, foundSchedule._id]);

        return res.status(200).json({ success: true, message: "Success!" });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.cancelAppointment = async (req, res) => {

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

exports.nextAppointments = async (req, res) => {
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

exports.analytics = async (req, res) => {
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

exports.checkPatient = async (req, res) => {
    const { organisationId, patientId } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const patient = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (!patient || !patient?.length) return res.status(200).json({ success: false });
        res.status(200).json({ success: true, patient });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false });
    }
};

exports.createPatient = async (req, res) => {
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

        sql = "INSERT INTO ?? (_id, firstname, lastname, username, email, phone, birthdate, cnp, gender, city, county, address, doctors, date, notes, fileNumber, historic, profileImage, documents, initial_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [`${process.env.DB_PREFIX}org_${_id}.patients`, patientId, firstname, lastname, username, email, phone, new Date(birthdate), cnp, gender, city, county, address, JSON.stringify(doctors), new Date(), notes, fileNumber, JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify([])];
        const insertedPatient = await db.query(sql, params);
        if (!insertedPatient) return new ErrorResponse("An error occured!", 404);
        
        res.status(200).json({ success: true, message: { en: "Patient added successfully!", ro: "Pacient a fost adaugat cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.updatePatient = async (req, res) => {

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

exports.removePatient = async (req, res) => {
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

exports.getDoctors = async (req, res) => {
    const { _id } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const doctors = db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.doctors`]);
   
        if (await doctors) res.status(200).json({ success: true, doctors: await doctors });
    } catch (e) {
        res.status(404).json({ success: false, message: { en: "An error occured!", ro: "A aparut o eroare!" }});
    }
};

exports.getLatestSchedules = async (req, res) => {
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

exports.getPatients = async (req, res) => {
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

exports.getSpecificPatient = async (req, res) => {
    const { organisationId, patientId } = req.body;
    
};

exports.searchPatient = async (req, res) => {
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

exports.createDoctor = async (req, res) => {
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

exports.removeDoctor = async (req, res) => {
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

exports.editDoctor = async (req, res) => {
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

exports.getDoctorInfo = async (req, res) => {
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

exports.searchDoctor = async (req, res) => {
    const { organisationId, searchQuery } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const doctors = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.doctors`]);

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

exports.createDoctorSchedule = async (req, res) => {

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

exports.removeDoctorSchedule = async (req, res) => {
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

exports.editDoctorSchedule = async (req, res) => {
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

exports.getSchedulesForDay = async (req, res) => {
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

exports.sendFeedback = async (req, res) => {
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

exports.responseSMS = async (req, res) => {
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
            const patientSchedules = futureSchedules.filter(futureSchedule => {
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

exports.responseSMSDecline = async (req, res) => {
    const { phone, date, message } = req.body;

    try {

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: 'An error occured!' });
    }
};


exports.addSMS = async (req, res) => {
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

exports.removeSMS = async (req, res) => {
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

exports.editSMS = async (req, res) => {
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

exports.createService = async (req, res) => {
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

exports.removeService = async (req, res) => {
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

exports.editService = async (req, res) => {
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

exports.getBackups = async (req, res) => {
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

exports.restoreBackup = async (req, res) => {
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

exports.getStatisticsData = async (req, res) => {
    const { _id } = req.body; 
   
};

exports.contactForm = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, message } = req.body;
    try {
        await db.query("INSERT INTO ?? (firstname, lastname, email, phone, message) VALUES (?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}zentec.contacts`, firstName, lastName, email, phoneNumber, message]);
        res.status(200).json({ success: true });
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ error: e, message: 'An error eccored!', success: false});
    }
};

exports.createAssistant = async (req, res) => {
    console.log(req.body);
    const { organisationId, firstName, lastName, phone, email, language } = req.body;
    try {
        const _id = generateId(25);
        const phoneUsed = await db.query("SELECT * FROM ?? WHERE phone = ? ", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, phone]);
        if (phoneUsed?.length && phone.length) return res.status(404).json({
            success: false,
            message: language === "en" ? "Phone number is already in use!" : "Numarul de telefon este folosit!"
        });

        const emailUsed = await db.query("SELECT * FROM ?? WHERE email = ? ", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, email]);

        if (emailUsed?.length && email.length) return res.status(404).json({
            success: false,
            message: language === "en" ? "Email address is already in use!" : "Adresa de email este folosita!"
        });

        const inserted = await db.query("INSERT INTO ?? (_id, firstname, lastname, phone, email) VALUES (?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, _id, firstName, lastName, phone, email]);
        if (inserted) return res.status(200).json({
            success: true,
            message: language === "en" ? "Assistant was added successfully!" : "Asistentul a fost adaugat cu succes!"
        });
    
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e});
    }
};

exports.editAssistant = async (req, res) => {
    console.log(req.body);
    const { organisationId, firstname, lastname, phone, email, _id, language } = req.body;
    try {
        const phoneUsed = await db.query("SELECT * FROM ?? WHERE phone = ? AND _id != ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, phone, _id]);
        if (phoneUsed.length && phone.length > 0) return res.status(404).json({
            success: false,
            message: language === "en" ? "Phone number is already in use!" : "Numarul de telefon este folosit!"
        });

        const emailUsed = await db.query("SELECT * FROM ?? WHERE email = ? AND _id != ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, email, _id]);

        if (emailUsed.length && email.length > 0) return res.status(404).json({
            success: false,
            message: language === "en" ? "Email address is already in use!" : "Adresa de email este folosita!"
        });

        const inserted = await db.query("UPDATE ?? SET firstname = ?, lastname = ?, phone = ?, email = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.assistants`, firstname, lastname, phone, email, _id]);
        if (inserted) return res.status(200).json({
            success: true,
            message: language === "en" ? "Modifications were made successfully!" : "Modificarile au fost salvate cu succes!"
        });

        res.status(200).json({ success: false, message: language === "en" ? "An error occured" : "A aparut o eroare!" });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.removeAssistant = async (req, res) => {
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


exports.assistantInfo = async (req, res) => {
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

exports.searchAssistant = async (req, res) => {
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

// Sterilization instrument

exports.createSterilizationInstrument = async (req, res) => {
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

exports.editSterilizationInstrument = async (req, res) => {
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

exports.removeSterilizationInstrument = async (req, res) => {
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

exports.searchSterilizationInstrument = async (req, res) => {
    const { organisationId, searchQuery } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const totalInstruments = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.sterilization_instruments`]);
        
        const searchInstruments = totalInstruments.filter((instrument, idx) => {
            return  (instrument.name.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || instrument.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (instrument.iso.toString().search(searchQuery.toLowerCase()) !== -1 || instrument.iso.toString().includes(searchQuery.toLowerCase()))
        });
        
        if (!searchInstruments || !searchInstruments.length > 0) return res.status(200).json({ success: false, message: { en: "No results", ro: "Niciun rezultat" } });
        res.status(200).json({ success: true, instruments: searchInstruments });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
         });
    }
};

// Sterilizations

exports.createSterilization = async (req, res) => {
    const { organisationId, language, addDate, expireDate, sarja, assistantId, sterilizationInstruments } = req.body;
    try {
        console.log(sterilizationInstruments);
        const _id = generateId(25);
        await db.query("INSERT INTO ?? (_id, add_date, expire_date, sarja, assistant, sterilization_instruments) VALUES (?, ?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.sterilizations`, _id, new Date(addDate), new Date(expireDate), sarja, assistantId, JSON.stringify(sterilizationInstruments)]);
        res.status(200).json({
            success: true,
            message: language === 'en' ? "Sterilization was created successfully!" : "Sterilizarea a fost creata cu succes!"
        });
        
    } catch (e) {
        console.log(e);
        res.status(404).json({ error: e, success: false, message: "An error occured!" });
    }
};

exports.removeSterilization = async (req, res) => {
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

exports.editSterilization = async (req, res) => {
    const { organisationId, _id, language, addDate, expireDate, sarja, assistantId, sterilizationInstruments } = req.body;
    try {
        await db.query("UPDATE ?? SET add_date = ?, expire_date = ?, sarja = ?, assistant = ?, sterilization_instruments = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.sterilizations`, new Date(addDate), new Date(expireDate), sarja, assistantId, JSON.stringify(sterilizationInstruments), _id]);
        res.status(200).json({
            success: true,
            message: language === "en" ? "Modifications were saved successfully!" : "Modificarile au fost salvate cu succes!"
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false,
            error: e,
            message: "An error occured!"
        });
    }
};

exports.searchSterilization = async (req, res) => {
    const { organisationId, searchQuery } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const totalSterilizations = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.sterilizations`]);
        
        const searchSterilizations = totalSterilizations.filter((sterilization, idx) => {
            const addDate = `${`${new Date(sterilization.add_date).getDate() < 10 ? "0" : ""}${new Date(sterilization.add_date).getDate()}`}.${`${new Date(sterilization.add_date).getMonth() + 1 < 10 ? "0" : ""}${new Date(sterilization.add_date).getMonth() + 1}`}.${new Date(sterilization.add_date).getFullYear()}`;
            const expireDate = `${`${new Date(sterilization.expire_date).getDate() < 10 ? "0" : ""}${new Date(sterilization.expire_date).getDate()}`}.${`${new Date(sterilization.expire_date).getMonth() + 1 < 10 ? "0" : ""}${new Date(sterilization.expire_date).getMonth() + 1}`}.${new Date(sterilization.expire_date).getFullYear()}`;
            
            return  (sterilization.assistant.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || sterilization.assistant.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (addDate.search(searchQuery) !== -1 || addDate.includes(searchQuery)) ||
                    (expireDate.search(searchQuery) !== -1 || expireDate.includes(searchQuery));
        });
        
        if (!searchSterilizations || !searchSterilizations.length > 0) return res.status(200).json({ success: false, message: { en: "No results", ro: "Niciun rezultat" } });
        res.status(200).json({ success: true, sterilizations: searchSterilizations });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
         });
    }
};

// Treatments

exports.createTreatment = async (req, res) => {
    const { organisationId, name, category, price, pricePer, doctorPrice, materialPrice, type, color, picture } = req.body;
    try {
        const _id = generateId(25);
        const sameName = await db.query("SELECT * FROM ?? WHERE name = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments`, name]);
        if (sameName?.length) return res.status(200).json({ success: false, message: { en: "Name already in use!", ro: "Nume deja folosit!" } });
        await db.query("INSERT INTO ?? (_id, name, category, price, pricePer, type, picture, color, doctorPrice, materialPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.treatments`, _id, name, category, price, pricePer, type, picture, color, doctorPrice, materialPrice]);
        res.status(200).json({ success: true, message: { en: "Treatment created successfully!", ro: "Tratamentul a fost creat cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
        });
    }
};

exports.editTreatment = async (req, res) => {
    const { organisationId, name, category, price, pricePer, type, picture, color, _id } = req.body;
    try {
        const sameName = await db.query("SELECT * FROM ?? WHERE name = ? AND _id != ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments`, name, _id]);
        if (sameName?.length) return res.status(200).json({ success: false, message: { en: "Name already in use!", ro: "Nume deja folosit!" } });
        await db.query("UPDATE ?? SET name = ?, category = ?, price = ?, pricePer = ?, type = ?, color = ?, picture = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments`, name, category, price, pricePer, type, color, picture, _id]);
        res.status(200).json({ success: true, message: { en: "Modifications saved successfully!", ro: "Modificarile au fost salvate cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
         });
    }
};

exports.removeTreatment = async (req, res) => {
    const { organisationId, treatmentId } = req.params;
    try {
        await db.query("DELETE FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments`, treatmentId]);
        res.status(200).json({ success: true, message: { en: "Treatment removed successfully!", ro: "Tratamentul a fost sters cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.searchTreatment = async (req, res) => {
    const { organisationId, searchQuery } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const totalCategories = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.treatments`]);
        
        const searchCategories = totalCategories.filter((category, idx) => {
            return (category.name.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || category.name.toLowerCase().includes(searchQuery.toLowerCase()))
        });
        
        if (!searchCategories || !searchCategories.length > 0) return res.status(200).json({ success: false, message: { en: "No results", ro: "Niciun rezultat" } });
        res.status(200).json({ success: true, treatments: searchCategories });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
         });
    }
};

exports.getTreatments = async (req, res) => {
    const { organisationId } = req.params;
    try {
        let sql = "SELECT * FROM ??";
        const totalTreatments = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.treatments`]);

        res.status(200).json({ success: true, treatments: totalTreatments });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
         });
    }
};

exports.createTreatmentCategory = async (req, res) => {
    const { organisationId, name, color } = req.body;
    try {
        const sameName = await db.query("SELECT * FROM ?? WHERE name = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatment_categories`, name]);
        if (sameName?.length) return res.status(200).json({ success: false, message: { en: "Name is already in use!", ro: "Numele este deja folosit!" } });
        
        await db.query("INSERT INTO ?? (name, color) VALUES (?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.treatment_categories`, name, color]);
        res.status(200).json({ success: true, message: { en: "Category created successfully!", ro: "Categorie creata cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.editTreatmentCategory = async (req, res) => {
    const { organisationId, name, color, id } = req.body;
    try {
        const sameName = await db.query("SELECT * FROM ?? WHERE name = ? AND id != ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatment_categories`, name, id]);
        if (sameName?.length) return res.status(200).json({ success: false, message: { en: "Name is already in use!", ro: "Numele este deja folosit!" } });
        
        await db.query("UPDATE ?? SET name = ?, color = ? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatment_categories`, name, color, id]);
        res.status(200).json({ success: true, message: { en: "Modifications saved successfully!", ro: "Modificarile au fost salvate cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.removeTreatmentCategory = async (req, res) => {
    const { organisationId, id } = req.params;
    try {
        await db.query("DELETE FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatment_categories`, id]);
        res.status(200).json({ success: true, message: { en: "Category removed successfully!", ro: "Categoria a fost stearsa cu succes!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.searchTreatmentCategory = async (req, res) => {
    const { organisationId, searchQuery } = req.body;
    try {
        let sql = "SELECT * FROM ??";
        const totalTreatments = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.treatment_categories`]);
        
        const searchTreatments = totalTreatments.filter((treatment, idx) => {
            return (
                (treatment.name.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatment.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (treatment.category.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatment.category.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        });
        
        if (!searchTreatments || !searchTreatments.length > 0) return res.status(200).json({ success: false, message: { en: "No results", ro: "Niciun rezultat" } });
        res.status(200).json({ success: true, treatments: searchTreatments });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
        });
    }
};

exports.getTreatmentCategories = async (req, res) => {
    const { organisationId } = req.params;
    try {
        let sql = "SELECT * FROM ??";
        const totalCategories = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.treatment_categories`]);
     
        res.status(200).json({ success: true, categories: totalCategories });
    } catch (e) {
        console.log(e);
        res.status(404).json({ 
            success: false,
            message: "An error occured!",
            error: e
        });
    }
};

// Patient's treatment plans

exports.createTreatmentPlan = async (req, res) => {
    const { organisationId, patientId, name, treatments, status, totalPrice, totalNegotiated, initialState, date } = req.body;

    try {
        const treatmentPlans = await db.query("SELECT * FROM ?? WHERE patientId = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, patientId]);
        let treatmentPlanId = generateId(25);
        while (inArrId(treatmentPlans, treatmentPlanId, "_id")) treatmentPlanId = generateId(25);

        await db.query("INSERT INTO ?? (_id, patientId, name, treatments, status, totalPrice, totalNegotiated, initial_state, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, treatmentPlanId, patientId, name, JSON.stringify(treatments), status, totalPrice, totalNegotiated, initialState, new Date(date)]);
        res.status(200).json({ 
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.editTreatmentPlan = async (req, res) => {
    const { organisationId, treatmentPlanId, name, treatments, status, totalPrice, totalNegotiated, initialState, date } = req.body;

    try {
        await db.query("UPDATE ?? SET name = ?, treatments = ?, status = ?, totalPrice = ?, totalNegotiated = ?, initialState = ?, date = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, name, JSON.stringify(treatments), status, totalPrice, totalNegotiated, initialState, new Date(date), treatmentPlanId]);
        res.status(200).json({ 
            success: true
        });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.removeTreatmentPlan = async (req, res) => {
    const { organisationId, treatmentPlanId } = req.params;

    try {
        await db.query("DELETE FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, treatmentPlanId]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.searchTreatmentPlan = async (req, res) => {
    const { organisationId, patientId, searchQuery } = req.body;

    try {
        let sql = "SELECT * FROM ?? WHERE patientId = ?";
        const treatmentPlans = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, patientId]);

        const filteredTreatmentPlans = await treatmentPlans && await treatmentPlans.length > 0 && await treatmentPlans.filter((treatmentPlan, idx) => {
            return (
                (treatmentPlan.name.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatmentPlan.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (treatmentPlan.status.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatmentPlan.status.toLowerCase().includes(searchQuery.toLowerCase())) || 
                (treatmentPlan.initial_status.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatmentPlan.initial_status.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (treatmentPlan.totalPrice.toString().search(searchQuery.toLowerCase()) !== -1 || treatmentPlan.totalPrice.toString().includes(searchQuery.toLowerCase())) ||
                (treatmentPlan.totalNegotiated.toString().search(searchQuery.toLowerCase()) !== -1 || treatmentPlan.totalNegotiated.toString().includes(searchQuery.toLowerCase()))
            );
        });
        
        if (!await filteredTreatmentPlans || !await filteredTreatmentPlans.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, treatmentPlans: await filteredTreatmentPlans });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
}

exports.getTreatmentPlans = async (req, res) => {
    const { organisationId, patientId } = req.params;
    try {

        const treatmentPlans = await db.query("SELECT * FROM ?? WHERE patientId = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, patientId]);
        return res.status(200).json({
            success: true,
            treatmentPlans
        });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

// Patients' treatments

exports.createPatientTreatment = async (req, res) => {
    const { organisationId, treatmentPlanId, treatmentId, doctorId, patientId, status, teeth, teethSurfaces, date, totalPrice, totalNegotiated, materialPrice, notes } = req.body;

    try {
        await db.query("INSERT INTO ?? (treatmentId, treatmentPlanId, doctorId, patientId, status, teeth, teethSurfaces, date, totalPrice, totalNegotiated, materialPrice, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_patients`, treatmentId, treatmentPlanId, doctorId, patientId, status, JSON.stringify(teeth), teethSurfaces, new Date(date), totalPrice, totalNegotiated, materialPrice, notes]);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.editPatientTreatment = async (req, res) => {
    const { organisationId, doctorId, treatmentPlanId, treatmentId, id, status, teeth, teethSurfaces, date, totalPrice, totalNegotiated, materialPrice, notes } = req.body;

    try {
        await db.query("UPDATE ?? SET treatmentId = ?, treatmentPlanId = ?, doctorId = ?, status = ?, teeth = ?, teethSurfaces = ?, date = ?, totalPrice = ?, totalNegotiated = ?, materialPrice = ?, notes = ? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_patients`, treatmentId, treatmentPlanId, doctorId, status, JSON.stringify(teeth), teethSurfaces, new Date(date), totalPrice, totalNegotiated, materialPrice, notes, id]);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.removePatientTreatment = async (req, res) => {
    const { organisationId, id } = req.params;

    try {
        await db.query("DELETE FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_patients`, id]);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.searchPatientTreatment = async (req, res) => {
    const { organisationId, patientId, searchQuery } = req.body;

    try {
        let sql = "SELECT * FROM ?? WHERE patientId = ?";
        const treatments = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.treatments_patients`, patientId]);

        const results = await Promise.all(await treatments && await treatments.length > 0 && await treatments.map(async (treatment, idx) => {
            const doctors = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.doctors`, treatment.doctorId]);
            const doctorName = `${doctors[0].firstName} ${doctors[0].lastName}`;
            const doctorNameReversed = `${doctors[0].lastName} ${doctors[0].firstName}`;

            const treatmentsInserted = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments`, treatment.treatmentId]);
            const treatmentCategory = treatmentsInserted[0].category;
            const treatmentName = treatmentsInserted[0].name;
            if (
                (doctorNameReversed.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || doctorNameReversed.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (doctorName.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (treatmentCategory.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatmentCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (treatmentName.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatmentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (treatment.status.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatment.status.toLowerCase().includes(searchQuery.toLowerCase())) || 
                (treatment.initial_status.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || treatment.initial_status.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (treatment.totalPrice.toString().search(searchQuery.toLowerCase()) !== -1 || treatment.totalPrice.toString().includes(searchQuery.toLowerCase())) ||
                (treatment.totalNegotiated.toString().search(searchQuery.toLowerCase()) !== -1 || treatment.totalNegotiated.toString().includes(searchQuery.toLowerCase()))
            ) return treatment;
            return null;
        }));

        const filteredTreatments = results.filter(result => result !== null);
        if (!filteredTreatments || !filteredTreatments.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, treatmentPlans: filteredTreatments });

    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.getPatientTreatments = async (req, res) => {
    const { organisationId, patientId } = req.params;
    
    try {
        const treatments = await db.query("SELECT * FROM ?? WHERE patientId = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_patients`, patientId]);
        res.status(200).json({ success: true, treatments });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }

};

// Diagnostics

exports.createDiagnostic = async (req, res) => {
    const { organisationId, name, color, picture } = req.body;

    try {
        await db.query("INSERT INTO ?? (name, color, picture) VALUES (?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`, name, color, picture]);
        res.status(200).json({
            success: true
        });

    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.editDiagnostic = async (req, res) => {
    const { organisationId, diagnosticId, name, color, picture } = req.body;
    try {
        await db.query("UPDATE ?? SET name = ?, color = ?, picture = ? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`, name, color, picture, diagnosticId]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.removeDiagnostic = async (req, res) => {
    const { organisationId, diagnosticId } = req.params;
    try {
        await db.query("DELETE FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`, diagnosticId]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.searchDiagnostic = async (req, res) => {
    const { organisationId, searchQuery } = req.body;
    try {
        const diagnostics = await db.query("SELECT * FROM ?? ", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`]);
        const filteredDiagnostics = await diagnostics && await diagnostics.length > 0 && await diagnostics.filter((diagnostic, idx) => {
            return (
                (diagnostic.name.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || diagnostic.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (diagnostic.id.toString().search(searchQuery.toLowerCase()) !== -1 || diagnostic.id.toString().includes(searchQuery.toLowerCase())) 
            );
        });
        
        if (!await filteredDiagnostics || !await filteredDiagnostics.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, diagnostics: await filteredDiagnostics });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.getDiagnostics = async (req, res) => {
    const { organisationId } = req.params;
    try {
        const diagnostics = await db.query("SELECT * FROM ?? ", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`]);
        res.status(200).json({ success: true, diagnostics: diagnostics });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

// Diagnostics initial_status

exports.createDiagnosticInitialStatus = async (req, res) => {
    const { organisationId, patientId, diagnosticId, teeth, teethSurfaces, notes } = req.body;
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({ success: false, reason: "invalid-patient" });
        const initialStatus = JSON.parse(patients[0].initial_status);
        let id = generateId(8);
        while (inArrId(initialStatus, id, "id")) id = generateId(8);
        
        const diagnostics = await db.query("SELECT * FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`, diagnosticId]);
        const diagnosticPicture = diagnostics[0].picture;

        initialStatus.push({
            diagnosticId,
            diagnosticPicture,
            teeth,
            teethSurfaces,
            notes,
            id
        });

        await db.query("UPDATE ?? SET initial_status = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, JSON.stringify(initialStatus), patientId])
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.editDiagnosticInitialStatus = async (req, res) => {
    const { organisationId, patientId, diagnosticId, id, teeth, teethSurfaces, notes } = req.body;
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({ success: false, reason: "invalid-patient" });
        const initialStatus = JSON.parse(patients[0].initial_status);
        const newInitialStatus = await Promise.all(initialStatus.map(async diagnostic => {
            if (diagnostic.id !== id) return diagnostic;
            const diagnostics = await db.query("SELECT * FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`, diagnostic.id]);
            const diagnosticPicture = diagnostics[0].picture;
            return {...diagnostic,
                diagnosticId,
                diagnosticPicture,
                teeth,
                teethSurfaces,
                notes
            };
        }));

        await db.query("UPDATE ?? SET initial_status = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, JSON.stringify(newInitialStatus), patientId])
        res.status(200).json({ success: true });

    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.removeDiagnosticInitialStatus = async (req, res) => {
    const { organisationId, patientId, id } = req.params;
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({ success: false, reason: "invalid-patient" });
        const initialStatus = JSON.parse(patients[0].initial_status);
        const newInitialStatus = initialStatus.filter(diagnostic => diagnostic.id !== id);

        await db.query("UPDATE ?? SET initial_status = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, JSON.stringify(newInitialStatus), patientId])
        res.status(200).json({ success: true });

    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false, 
            error: e
        });
    }
};

exports.getDiagnosticsInitialStatus = async (req, res) => {
    const { organisationId, patientId } = req.params;

    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({ success: false, reason: "invalid-patient" });
        const initialStatus = JSON.parse(patients[0].initial_status);

        res.status(200).json({ success: true, initialStatus });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false,
            error: e
        });
    }

};

exports.searchDiagnosticInitialStatus = async (req, res) => {
    const { organisationId, patientId, searchQuery } = req.body;

    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({ success: false, reason: "invalid-patient" });
        const initialStatus = JSON.parse(patients[0].initial_status);
        if (!await initialStatus || !await initialStatus.length > 0) return res.status(200).json({ success: true, initialStatus: [] });
        const results = await Promise.all(await initialStatus.map(async (diagnostic, idx) => {
            const diagnostics = await db.query("SELECT * FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`, diagnostic.id]);
            const diagnosticName = diagnostics[0].name;
            if (
                (diagnosticName.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || diagnosticName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (diagnostic.id.toString().search(searchQuery.toLowerCase()) !== -1 || diagnostic.id.toString().includes(searchQuery.toLowerCase())) 
            ) return diagnostic;
            return null;
        }));

        const filteredDiagnostics = results.filter(result => result !== null);
        
        if (!filteredDiagnostics || !filteredDiagnostics.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, initialStatus: filteredDiagnostics });

    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false,
            error: e
        });
    }
};

// Consultations

exports.createConsulation = async (req, res) => {
    const { organisationId, diagnosticId, patientId, date, teeth, teethSurfaces, notes } = req.body;

    try {
        await db.query("INSERT INTO ?? (diagnosticId, patientId, date, teeth, teethSurfaces, notes) VALUES (?, ?, ?, ?, ?, ?)", [`${process.env.DB_PREFIX}org_${organisationId}.consulations`, diagnosticId, patientId, new Date(date), JSON.stringify(teeth), teethSurfaces, notes]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false,
            error: e
        });
    }
}; 

exports.editConsultation = async (req, res) => {
    const { organisationId, diagnosticId, id, date, teeth, teethSurfaces, notes } = req.body;
    try {
        await db.query("UPDATE ?? SET diagnosticId = ?, date = ?, teeth = ?, teethSurfaces = ?, notes = ? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.consulations`, diagnosticId, new Date(date), JSON.stringify(teeth), teethSurfaces, notes, id]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false,
            error: e
        });
    }
};

exports.removeConsultation = async (req, res) => {
    const { organisationId, id } = req.params;
    try {
        await db.query("DELETE FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.consultations`, id]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false,
            error: e
        });
    }
};

exports.getPatientConsulations = async (req, res) => {
    const { organisationId, patientId } = req.params;
    try {
        const consulations = await db.query("SELECT * FROM ?? WHERE patientId = ?", [`${process.env.DB_PREFIX}org_${organisationId}.consultations`, patientId]);
        res.status(200).json({
            success: true,
            consulations
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({
            success: false,
            error: e
        });
    }
};

exports.searchPatientConsulations = async (req, res) => {
    const { organisationId, patientId, searchQuery } = req.body;

    try {
        let sql = "SELECT * FROM ?? WHERE id = ?";
        const consultations = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.consultations`, patientId]);

        
        const results = await Promise.all(await consultations && await consultations.length > 0 && await consultations.map(async (consultation, idx) => {
            const diagnostics = await db.query("SELECT * FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.diagnostics`, consultation.diagnosticId]);
            const diagnosticName = diagnostics[0].name;
            
            if (
                (diagnosticName.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || diagnosticName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (consultation.notes.toString().search(searchQuery.toLowerCase()) !== -1 || consultation.notes.toString().includes(searchQuery.toLowerCase())) 
            ) return consultation;

            return null;
        }));

        const filteredConsultations = results.map(result => result !== null);
        
        if (!filteredConsultations || !filteredConsultations.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, consultations: filteredConsultations });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

// Patient types

exports.createPatientType = async (req, res) => {
    const { organisationId, name } = req.body;

    try {
        await db.query("INSERT INTO ?? (name) VALUES (?)", [`${process.env.DB_PREFIX}org_${organisationId}.patient_types`, name]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.editPatientType = async (req, res) => {
    const { organisationId, id, name} = req.body;
    try {
        await db.query("UPDATE ?? SET name = ? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patient_types`, name, id]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.removePatientType = async (req, res) => {
    const { organisationId, id } = req.params;

    try {
        await db.query("DELETE FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patient_types`, id]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.getPatientTypes = async (req, res) => {
    const { organisationId } = req.params;

    try {
        const patientTypes = await db.query("DELETE FROM ??", [`${process.env.DB_PREFIX}org_${organisationId}.patient_types`]);
        res.status(200).json({
            success: true,
            patientTypes
        });    
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.searchPatientType = async (req, res) => {
    const { organisationId, searchQuery } = req.body;

    try {
        let sql = "SELECT * FROM ??";
        const patientTypes = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patient_types`]);

        const filteredPatientTypes = await patientTypes && await patientTypes.length > 0 && await patientTypes.filter((patientType, idx) => {
            return (
                (patientType.name.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patientType.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (patientType.id.toString().search(searchQuery.toLowerCase()) !== -1 || patientType.id.toString().includes(searchQuery.toLowerCase())) 
            );
        });
        
        if (!await filteredPatientTypes || !await filteredPatientTypes.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, patientTypes: await filteredPatientTypes });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

// Patient categories

exports.createPatientCategory = async (req, res) => {
    const { organisationId, name } = req.body;

    try {
        await db.query("INSERT INTO ?? (category) VALUES (?) ", [`${process.env.DB_PREFIX}org_${organisationId}.patient_categories`, name]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.editPatientCategory = async (req, res) => {
    const { organisationId, id, name} = req.body;
    try {
        await db.query("UPDATE ?? SET category = ? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patient_categories`, name, id]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.removePatientCategory = async (req, res) => {
    const { organisationId, id } = req.params;

    try {
        await db.query("DELETE FROM ?? WHERE id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patient_categories`, id]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.getPatientCategories = async (req, res) => {
    const { organisationId } = req.params;

    try {
        const patientCategories = await db.query("SELECT * FROM ??", [`${process.env.DB_PREFIX}org_${organisationId}.patient_categories`]);
        res.status(200).json({
            success: true,
            patientCategories
        });    
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

exports.searchPatientCategory = async (req, res) => {
    const { organisationId, searchQuery } = req.body;

    try {
        let sql = "SELECT * FROM ??";
        const patientCategories = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.patient_categories`]);

        const filteredPatientCategories = await patientCategories && await patientCategories.length > 0 && await patientCategories.filter((patientCategory, idx) => {
            return (
                (patientCategory.category.toLowerCase().search(searchQuery.toLowerCase()) !== -1 || patientCategory.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (patientCategory.id.toString().search(searchQuery.toLowerCase()) !== -1 || patientCategory.id.toString().includes(searchQuery.toLowerCase())) 
            );
        });
        
        if (!await filteredPatientCategories || !await filteredPatientCategories.length) return res.status(200).json({ success: false, message: { en: "No results found!", ro: "Nu a fost gasit niciun rezultat!" } });
        res.status(200).json({ success: true, patientCategories: await filteredPatientCategories });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e });
    }
};

// Patients' documents

exports.uploadPatientDocument = async (req, res, next) => {
    
    try {
        console.log("FILE: ", req?.file);
        if (!req?.file) return res.status(404).json({ success: false });
        next();

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.createPatientDocument = async (req, res) => {
    const { organisationId, patientId, fileSize, notes, source, fileName } = req.params;
    console.log(req.params);
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (!patients?.length) return res.status(404).json({ success: false, message: "An error occured!" });
        const photoId = generateId(8);
        const patient = patients[0];
        const patientsDocuments = JSON.parse(patient.documents);
        patientsDocuments.push({
            size: fileSize,
            source: `/uploads/${organisationId}/${patientId}/${source}`,
            notes: notes,
            fileName: fileName,
            photoId
        });

        await db.query("UPDATE ?? SET documents = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, JSON.stringify(patientsDocuments), patientId]);
        res.status(200).json({
            success: true
        });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.editPatientDocument = async (req, res) => {
    const { organisationId, patientId, notes, fileName, photoId } = req.body;
    console.log(req.body);
    try {

        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (!patients?.length) return res.status(404).json({ success: false, message: "An error occured!" });

        const patient = patients[0];
        const patientsDocuments = JSON.parse(patient.documents);
        const newPatientsDocuments = patientsDocuments.map((currDocument) => {
            if (currDocument.photoId === photoId) return {
                ...currDocument, 
                notes: notes,
                fileName: fileName
            };

            return currDocument;
        });

        await db.query("UPDATE ?? SET documents = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, JSON.stringify(newPatientsDocuments), patientId]);
        res.status(200).json({
            success: true
        });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.removePatientDocument = async (req, res) => {
    const { organisationId, patientId, photoId, source } = req.params; 

    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (!patients?.length) return res.status(404).json({ success: false, message: "An error occured!" });

        const patient = patients[0];
        const patientsDocuments = JSON.parse(patient.documents);
        const newPatientsDocuments = patientsDocuments.filter((currDocument) => {
            return currDocument.photoId !== photoId;
        });

        await db.query("UPDATE ?? SET documents = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, JSON.stringify(newPatientsDocuments), patientId]);
        fs.unlinkSync(`${process.env.CLIENT_PATH}/uploads/${organisationId}/${patientId}/${source}`);

        res.status(200).json({
            success: true
        });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.getPatientDocument = async (req, res) => {
    const { organisationId, patientId, photoId } = req.params;
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (!patients?.length) return res.status(404).json({ success: false, message: "An error occured!" });
        const patient = patients[0];
        const patientsDocuments = JSON.parse(patient.documents);

        const foundDocument = patientsDocuments.find(document => document.photoId === photoId);
        if (!foundDocument) return res.status(404).json({ success: false, message: "Document not found!" });

        res.status(200).json({ success: true, document: foundDocument })
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

exports.createPatientAdvancePayment = async (req, res) => {

};

exports.editPatientAdvancePayment = async (req, res) => {

};

exports.removePatientAdvancePayment = async (req, res) => {

};

exports.createPatientPayment = async (req, res) => {

};

exports.editPatientPayment = async (req, res) => {
    
};

exports.removePatientPayment = async (req, res) => {
    
};

exports.editDetails = async (req, res) => {
    const { organisationId, startHour, endHour, organisationName } = req.body;
    try {
        await db.query("UPDATE ?? SET start_hour = ?, end_hour = ?, name = ? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.details`, startHour, endHour, organisationName, organisationId]);
        
        res.status(200).json({
            success: true,
        });

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, error: e, message: "An error occured!" });
    }
};

// Teeth initial status

exports.getToothImageInitialStatus = async (req, res) => {
    const { organisationId, patientId, toothNumber } = req.params;
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({
            success: false, 
            message: "Invalid patient!"
        });

        const patient = patients[0];
        const diagnostics = JSON.parse(patient.initial_status);
        const toothDiagnostics = diagnostics.filter(diagnostic => diagnostic.teeth.includes(Number(toothNumber)));
        console.log(toothDiagnostics);
        if (!toothDiagnostics.length) return res.status(200).json({ success: true, tooth: '' }); // Represents the normal tooth
        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "coroana.png") && toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "implant.png")) 
            return res.status(200).json({ success: true, tooth: '_coroana_implant' });
        
        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "implant.png")) 
            return res.status(200).json({ success: true, tooth: '_implant' });
        
        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "coroana.png") && toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "extractie.png")) 
            return res.status(200).json({ success: true, tooth: '_coroana_extractie' });

        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "extractie.png")) 
            return res.status(200).json({ success: true, tooth: '_extractie' });

        const lastDiagnostic = toothDiagnostics[toothDiagnostics?.length - 1];
        const filteredCompatibleDiagnostics = COMPATIBLE_DIAGNOSTICS.filter(diagnostic => diagnostic.some(obj => obj?.originalName === lastDiagnostic?.diagnosticPicture));

        for (let diagnosticIdx = toothDiagnostics.length - 2; diagnosticIdx >= 0; diagnosticIdx--) {
            const currentDiagnostic = toothDiagnostics[diagnosticIdx];
            const foundDiagnostic = filteredCompatibleDiagnostics.find(diagnostic => diagnostic?.originalName === currentDiagnostic?.diagnosticPicture);
            if (foundDiagnostic) return res.status(200).json({ success: true, tooth: `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastDiagnostic?.diagnosticPicture)?.fileName}${foundDiagnostic?.fileName}` });
        }

        return res.status(200).json({ success: true, tooth: `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastDiagnostic?.diagnosticPicture)?.fileName}`});

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.getToothImageCurrentStatus = async (req, res) => {
    const { organisationId, patientId, toothNumber } = req.params;
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({
            success: false, 
            message: "Invalid patient!"
        });

        const patient = patients[0];
        const diagnostics = JSON.parse(patient.initial_status);
        const filteredDiagnostics = diagnostics.filter(diagnostic => diagnostic.teeth.includes(Number(toothNumber)));
        const treatmentPlans = await db.query("SELECT * FROM ?? WHERE patientId = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, patientId]);
        
        const treatments = treatmentPlans.map(treatmentPlan => {
            const currentTreatments = JSON.parse(treatmentPlan.treatments);
            return currentTreatments.filter(treatment => treatment.status === 'finished');
        });

        const filteredTreatments = treatments.filter(treatment => treatment.teeth.includes(Number(toothNumber)));
        if (filteredTreatments?.length === 0 && filteredDiagnostics?.length === 0) 
            return res.status(200).json({ success: true, tooth: '' });

        if (filteredTreatments.length === 0)            
            return res.status(200).json({ success: true, tooth: getToothInitialStatus(organisationId, patientId, toothNumber) });

        // Coroana extractie

        if (filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'extractie.png') && filteredTreatments.find(treatment => treatment.treatmentPicture === 'coroana.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_extractie' });

        if (filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'coroana.png') && filteredTreatments.find(treatment => treatment.treatmentPicture === 'extractie.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_extractie' });

        // Extractie

        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'extractie.png')) 
            return res.status(200).json({ success: true, tooth: '_extractie' });

        // Coroana implant

        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'implant.png') && filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'coroana.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_implant' });

        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'coroana.png') && filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'implant.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_implant' });

        // Implant
            
        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'implant.png')) 
            return res.status(200).json({ success: true, tooth: '_implant' });

        const lastTreatment = filteredTreatments[filteredTreatments?.length - 1];
        const filteredCompatibleDiagnostics = COMPATIBLE_DIAGNOSTICS.filter(diagnostic => diagnostic.some(obj => obj?.originalName === lastTreatment?.treatmentPicture));

        for (let treatmentIdx = filteredTreatments.length - 2; treatmentIdx >= 0; treatmentIdx--) {
            const currentTreatment = filteredTreatments[treatmentIdx];
            const foundTreatment = filteredCompatibleDiagnostics.find(diagnostic => diagnostic?.originalName === currentTreatment?.treatmentPicture);
            if (foundTreatment) return res.status(200).json({ success: true, tooth: `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastTreatment?.treatmentPicture)?.fileName}${foundTreatment?.fileName}` });
        }

        return res.status(200).json({ success: true, tooth: `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastTreatment?.treatmentPicture)?.fileName}`});

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.getToothImageTreatmentPlan = async (req, res) => {
    const { organisationId, patientId, treatmentPlanId, toothNumber } = req.params;
    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return res.status(404).json({
            success: false, 
            message: "Invalid patient!"
        });

        const patient = patients[0];
        const diagnostics = JSON.parse(patient.initial_status);
        const filteredDiagnostics = diagnostics.filter(diagnostic => diagnostic.teeth.includes(Number(toothNumber)));
        const treatmentPlans = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.treatments_plan_patients`, treatmentPlanId]);
        const treatmentPlan = treatmentPlans[0];
        const treatments = JSON.parse(treatmentPlan.treatments);
        const filteredTreatments = treatments.find(treatment => treatment.teeth.includes(Number(toothNumber)));
        if (filteredTreatments.length === 0 && filteredDiagnostics.length === 0) 
            return res.status(200).json({ success: true, tooth: '' });

        if (filteredTreatments.length === 0)            
            return res.status(200).json({ success: true, tooth: getToothInitialStatus(organisationId, patientId, toothNumber) });


        // Coroana extractie

        if (filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'extractie.png') && filteredTreatments.find(treatment => treatment.treatmentPicture === 'coroana.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_extractie' });

        if (filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'coroana.png') && filteredTreatments.find(treatment => treatment.treatmentPicture === 'extractie.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_extractie' });

        // Extractie

        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'extractie.png')) 
            return res.status(200).json({ success: true, tooth: '_extractie' });

        // Coroana implant

        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'implant.png') && filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'coroana.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_implant' });

        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'coroana.png') && filteredDiagnostics.find(diagnostic => diagnostic.diagnosticPicture === 'implant.png'))
            return res.status(200).json({ success: true, tooth: '_coroana_implant' });

        // Implant
            
        if (filteredTreatments.find(treatment => treatment.treatmentPicture === 'implant.png')) 
            return res.status(200).json({ success: true, tooth: '_implant' });


        const lastTreatment = filteredTreatments[filteredTreatments?.length - 1];
        const filteredCompatibleDiagnostics = COMPATIBLE_DIAGNOSTICS.filter(diagnostic => diagnostic.some(obj => obj?.originalName === lastTreatment?.treatmentPicture));

        for (let treatmentIdx = filteredTreatments.length - 2; treatmentIdx >= 0; treatmentIdx--) {
            const currentTreatment = filteredTreatments[treatmentIdx];
            const foundTreatment = filteredCompatibleDiagnostics.find(diagnostic => diagnostic?.originalName === currentTreatment?.treatmentPicture);
            if (foundTreatment) return res.status(200).json({ success: true, tooth: `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastTreatment?.treatmentPicture)?.fileName}${foundTreatment?.fileName}` });
        }

        return res.status(200).json({ success: true, tooth: `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastTreatment?.treatmentPicture)?.fileName}`});

    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured!", error: e });
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

const getToothInitialStatus = async (organisationId, patientId, toothNumber) => {

    try {
        const patients = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}org_${organisationId}.patients`, patientId]);
        if (patients?.length !== 1) return null;

        const patient = patients[0];
        const diagnostics = JSON.parse(patient.initial_status);
        const toothDiagnostics = diagnostics.filter(diagnostic => diagnostic.teeth.includes(Number(toothNumber)));
        if (!toothDiagnostics.length) return ''; // Represents the normal tooth
        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "coroana.png") && toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "implant.png")) 
            return '_coroana_implant';
        
        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "implant.png")) 
            return '_implant';
        
        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "coroana.png") && toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "extractie.png")) 
            return '_coroana_extractie';

        if (toothDiagnostics.find(diagnostic => diagnostic?.diagnosticPicture === "extractie.png")) 
            return '_extractie';

        const lastDiagnostic = toothDiagnostics[toothDiagnostics?.length - 1];
        const filteredCompatibleDiagnostics = COMPATIBLE_DIAGNOSTICS.filter(diagnostic => diagnostic.some(obj => obj?.originalName === lastDiagnostic?.diagnosticPicture));

        for (let diagnosticIdx = toothDiagnostics.length - 2; diagnosticIdx >= 0; diagnosticIdx--) {
            const currentDiagnostic = toothDiagnostics[diagnosticIdx];
            const foundDiagnostic = filteredCompatibleDiagnostics.find(diagnostic => diagnostic?.originalName === currentDiagnostic?.diagnosticPicture);
            if (foundDiagnostic) return `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastDiagnostic?.diagnosticPicture)?.fileName}${foundDiagnostic?.fileName}`;
        }

        return `${SINGLE_DIAGNOSTICS.find(diagnostic => diagnostic?.originalName === lastDiagnostic?.diagnosticPicture)?.fileName}`;

    } catch (e) {
        console.log(e);
    }
};