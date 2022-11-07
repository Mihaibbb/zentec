const router = require("express").Router();

const { confirmAppointment } = require("../controllers/patient");

router.put("/confirm-appointment", confirmAppointment);

module.exports = router;