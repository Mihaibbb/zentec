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
    removeDoctorSchedule 
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
router.post("/search-doctor", searchDoctor);
router.post("/edit-doctor-schedule", editDoctorSchedule);
router.post("/remove-doctor-schedule", removeDoctorSchedule);


module.exports = router;