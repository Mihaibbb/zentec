const db = require("../db");

exports.confirmAppointment = async (req, res, next) => {
    const { organisationId, appointmentId } = req.query;
    
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const appointments = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.schedules`, appointmentId]);
        const appointment = await appointments[0];
        if (!appointment) return res.status(404).json({ success: false, message: "An error occured!" });
        sql = "UPDATE ?? SET confirmed = ? WHERE _id = ?";
        await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.schedules`, true, appointmentId]);
        res.status(200).json({ success: true, message: { en: "Appointment was confirmed", ro: "Programarea a fost confirmata!" } });
    } catch (e) {
        console.log(e);
        res.status(400).json({ success: false, message: "An error occured!", error: e });
    }
};

exports.cancelAppointment = async (req, res, next) => {

};

exports.rescheduleAppointment = async (req, res, next) => {
    
};