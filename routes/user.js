const router = require("express").Router();
const { 
    createAppointment,
    removeAppointment, 
    nextAppointments, 
    createPatient, 
    removePatient, 
    getDoctors, 
    getLatestSchedules, 
    getPatients, 
    updatePatient, 
    checkPatient, 
    searchPatient, 
    updateAppointment, 
    analytics, 
    createDoctor, 
    createDoctorSchedule, 
    editDoctor, 
    removeDoctor, 
    searchDoctor, 
    editDoctorSchedule, 
    removeDoctorSchedule,
    getDoctorInfo,
    getSchedulesForDay,
    sendFeedback,
    responseSMS,
    addSMS,
    removeSMS,
    editSMS,
    addService,
    removeService,
    editService,
    pushMessageInbox,
    removeMessageInbox,
    clearInbox,
    getBackups,
    restoreBackup
} = require("../controllers/user");

router.post("/create-appointment", createAppointment);
router.post("/remove-appointment", removeAppointment);
router.post("/next-appointments", nextAppointments);
router.post("/update-appointment", updateAppointment);
router.post("/create-patient", createPatient);
router.delete("/remove-patient", removePatient);
router.post("/get-doctors", getDoctors);
router.post("/get-latest-schedules", getLatestSchedules);
router.post("/analytics", analytics);
router.post("/get-patients", getPatients);
router.post("/update-patient", updatePatient);
router.post("/check-patient", checkPatient);
router.post("/search-patient", searchPatient);
router.post("/create-doctor", createDoctor);
router.post("/create-doctor-schedule", createDoctorSchedule);
router.post("/edit-doctor", editDoctor);
router.post("/remove-doctor", removeDoctor);
router.post("/doctor-info", getDoctorInfo);
router.post("/search-doctor", searchDoctor);
router.put("/edit-doctor-schedule", editDoctorSchedule);
router.delete("/remove-doctor-schedule", removeDoctorSchedule);
router.post("/get-schedules-day", getSchedulesForDay);
router.post("/send-feedback", sendFeedback);
router.post("/response-sms", responseSMS);
router.post("/add-sms", addSMS);
router.delete("/remove-sms", removeSMS);
router.put("/edit-sms", editSMS);
router.post("/add-service", addService);
router.delete("/remove-service", removeService);
router.put("/edit-service", editService);
router.post("/push-message-inbox", pushMessageInbox);
router.delete("/remove-message-inbox", removeMessageInbox);
router.delete("/clear-inbox", clearInbox);
router.get("/get-backups", getBackups);
router.put("/restore-backup", restoreBackup);

module.exports = router;
