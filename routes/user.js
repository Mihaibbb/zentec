const router = require("express").Router();
const upload = require("../middleware/upload");
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
    removeService,
    editService,
    pushMessageInbox,
    removeMessageInbox,
    clearInbox,
    getBackups,
    restoreBackup,
    responseSMSDecline,
    cancelAppointment,
    contactForm,
    createAssistant,
    editAssistant,
    removeAssistant,
    searchAssistant,
    createSterilization,
    editSterilization,
    removeSterilization,
    searchSterilization,
    createSterilizationInstrument,
    editSterilizationInstrument,
    removeSterilizationInstrument,
    searchSterilizationInstrument,
    assistantInfo,
    createService,
    createTreatment,
    editTreatment,
    removeTreatment,
    createTreatmentCategory,
    editTreatmentCategory,
    removeTreatmentCategory,
    searchTreatment,
    searchTreatmentCategory,
    removeFutureAppointment,
    editDetails,
    uploadPatientDocument,
    removePatientDocument,
    createPatientDocument,
    editPatientDocument,
    getPatientDocument,
    createTreatmentPlan,
    editTreatmentPlan,
    removeTreatmentPlan,
    getTreatmentPlans,
    searchTreatmentPlan,
    createPatientTreatment,
    editPatientTreatment,
    removePatientTreatment,
    getPatientTreatments,
    searchPatientTreatment,
    getTreatments,
    getTreatmentCategories,
    createConsulation,
    editConsultation,
    removeConsultation,
    searchPatientConsulations,
    getPatientConsulations,
    createDiagnostic,
    editDiagnostic,
    removeDiagnostic,
    searchDiagnostic,
    createDiagnosticInitialStatus,
    editDiagnosticInitialStatus,
    removeDiagnosticInitialStatus,
    searchDiagnosticInitialStatus,
    getDiagnosticsInitialStatus,
    createPatientCategory,
    editPatientCategory,
    removePatientCategory,
    searchPatientCategory,
    getPatientCategories,
    createPatientType,
    editPatientType,
    removePatientType,
    searchPatientType,
    getPatientTypes,
    getToothImageInitialStatus,
    getToothImageCurrentStatus,
    getToothImageTreatmentPlan,
    updateTreatmentPatientSterilization,
    removeTreatmentPatientSterilizaton,
    createPatientWaiting,
    updatePatientWaiting,
    removePatientWaiting,
    createWorkList,
    updateWorkList,
    removeWorkList,
    createWork,
    updateWork,
    removeWork,
    createLab,
    updateLab,
    removeLab
} = require("../controllers/user");

router.post("/create-appointment", createAppointment);
router.post("/remove-appointment", removeAppointment);
router.delete("/remove-future-appointment/:organisationId/:patientId/:date/:startHour/:startMinutes/:endHour/:endMinutes", removeFutureAppointment);
router.post("/cancel-appointment", cancelAppointment);
router.post("/next-appointments", nextAppointments);
router.post("/update-appointment", updateAppointment);
router.post("/create-patient", createPatient);
router.delete("/remove-patient/:organisationId/:id", removePatient);
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
router.post("/response-sms-decline", responseSMSDecline);
router.post("/add-sms", addSMS);
router.delete("/remove-sms", removeSMS);
router.put("/edit-sms", editSMS);
router.post("/create-service", createService);
router.delete("/remove-service", removeService);
router.put("/edit-service", editService);
router.post("/push-message-inbox", pushMessageInbox);
router.delete("/remove-message-inbox/:inboxMessageId/:organisationId", removeMessageInbox);
router.delete("/clear-inbox/:organisationId", clearInbox);
router.get("/get-backups", getBackups);
router.put("/restore-backup", restoreBackup);
router.post("/contact-form", contactForm);
router.post("/create-assistant", createAssistant);
router.put("/edit-assistant", editAssistant);
router.delete("/remove-assistant/:organisationId/:_id/:language", removeAssistant);
router.post("/assistant-info", assistantInfo);
router.post("/search-assistant", searchAssistant);
router.post("/create-sterilization", createSterilization);
router.put("/edit-sterilization", editSterilization);
router.post("/search-sterilization", searchSterilization);
router.delete("/remove-sterilization/:organisationId/:_id/:language", removeSterilization);
router.post("/create-sterilization-instrument", createSterilizationInstrument);
router.put("/edit-sterilization-instrument", editSterilizationInstrument);
router.delete("/remove-sterilization-instrument/:organisationId/:_id/:language", removeSterilizationInstrument);
router.post("/search-sterilization-instrument", searchSterilizationInstrument);


router.put("/edit-details", editDetails);

// Documents routes

router.post("/create-patient-document/:organisationId/:patientId/:fileSize/:notes/:source/:fileName", upload.single('file'), uploadPatientDocument, createPatientDocument);
router.put("/edit-patient-document", editPatientDocument);
router.delete("/remove-patient-document/:organisationId/:patientId/:photoId/:source", removePatientDocument);
router.get("/get-patient-document/:organisationId/:patientId/:photoId", getPatientDocument);

// Treatment plan routes

router.post("/create-treatment-plan", createTreatmentPlan);
router.put("/edit-treatment-plan", editTreatmentPlan);
router.delete("/remove-treatment-plan/:organisationId/:treatmentPlanId", removeTreatmentPlan);
router.get("/get-treatment-plans/:organisationId/:patientId", getTreatmentPlans);
router.post("/search-treatment-plan", searchTreatmentPlan);

// Treatments patients routes

router.post("/create-patient-treatment", createPatientTreatment);
router.put("/edit-patient-treatment", editPatientTreatment);
router.delete("/remove-patient-treatment/:organisationId/:id", removePatientTreatment);
router.get("/get-patient-treatments/:organisationId/:patientId", getPatientTreatments);
router.post("/search-patient-treatment", searchPatientTreatment);


// Treatment categories routes

router.post("/create-treatment-category", createTreatmentCategory);
router.put("/edit-treatment-category", editTreatmentCategory);
router.delete("/remove-treatment-category/:organisationId/:id", removeTreatmentCategory);
router.post("/search-treatment-category", searchTreatmentCategory);
router.get("/get-treatment-categories/:organsiationId", getTreatmentCategories);

// Treatments routes

router.post("/create-treatment", createTreatment);
router.put("/edit-treatment", editTreatment);
router.delete("/remove-treatment/:organisationId/:treatmentId", removeTreatment);
router.post("/search-treatment", searchTreatment);
router.get("/get-treatments/:organisationId", getTreatments);

// Consultation routes

router.post("/create-consultation", createConsulation);
router.put("/edit-consultation", editConsultation);
router.delete("/remove-consultation/:organisationId/:id", removeConsultation);
router.post("/search-consultation", searchPatientConsulations);
router.get("/get-consultations/:organisationId/:patientId", getPatientConsulations);

// Diagnostic routes

router.post("/create-diagnostic", createDiagnostic);
router.put("/edit-diagnostic", editDiagnostic);
router.delete("/remove-diagnostic/:organisationId/:diagnosticId", removeDiagnostic);
router.post("/search-diagnostic", searchDiagnostic);
router.get("/get-diagnostics/:organisationId", getPatientConsulations);

// Initial status routes

router.post("/create-diagnostic-initial-status", createDiagnosticInitialStatus);
router.put("/edit-diagnostic-initial-status", editDiagnosticInitialStatus);
router.delete("/remove-diagnostic-initial-status/:organisationId/:patientId/:id", removeDiagnosticInitialStatus);
router.post("/search-diagnostic-initial-status", searchDiagnosticInitialStatus);
router.get("/get-diagnostics-initial-status/:organisationId/:patientId", getDiagnosticsInitialStatus);

// Patient category

router.post("/create-patient-category", createPatientCategory);
router.put("/edit-patient-category", editPatientCategory);
router.delete("/remove-patient-category/:organisationId/:id", removePatientCategory);
router.post("/search-patient-category", searchPatientCategory);
router.get("/get-patient-categories/:organisationId", getPatientCategories);

// Patient type

router.post("/create-patient-type", createPatientType);
router.put("/edit-patient-type", editPatientType);
router.delete("/remove-patient-type/:organisationId/:id", removePatientType);
router.post("/search-patient-type", searchPatientType);
router.get("/get-patient-types/:organisationId", getPatientTypes);

// Treatment teeth image

router.get("/get-tooth-image-initial-status/:organisationId/:patientId/:toothNumber", getToothImageInitialStatus);
router.get("/get-tooth-image-current-status/:organisationId/:patientId/:toothNumber", getToothImageCurrentStatus);
router.get("/get-tooth-image-treatment-plan/:organisationId/:patientId/:treatmentPlanId/:toothNumber", getToothImageTreatmentPlan);

// Treatment patient sterilizations

router.put("/update-treatment-patient-sterilizations", updateTreatmentPatientSterilization);
router.delete("/remove-treatment-patient-sterilization/:organisationId/:id/:sterilizationId", removeTreatmentPatientSterilizaton);
// router.post("/search-treatment-patient-sterilizations", searchTreatmentPatientSterilizations);

// Patients waiting

router.post("/create-patient-waiting", createPatientWaiting);
router.put("/update-patient-waiting", updatePatientWaiting);
router.delete("/remove-patient-waiting/:organisationId/:listId", removePatientWaiting);

// List Works

router.post("/create-work-list", createWorkList);
router.put("/update-work-list", updateWorkList);
router.delete("/remove-work-list/:organisationId/:listWorkId", removeWorkList);

// Works

router.post("/create-work", createWork);
router.put("/edit-work", updateWork);
router.delete("/remove-work/:organisationId/:workId", removeWork);


// Labs
router.post("/create-lab", createLab);
router.put("/edit-lab", updateLab);
router.delete("/remove-lab/:organisationId/:labId", removeLab);


module.exports = router;
