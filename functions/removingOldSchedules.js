const REPEATING_TIME = 1000 * 60 * 60 * 24;
const PERIOD_SCHEDULES = 1000 * 60 * 60 * 24 * 365;
const db = require("../db");

const removingDoctorsSchedules = async () => {
    
    const databases = await db.query("SHOW DATABASES");
    const organisations = await databases.filter(database => database.includes(`${process.env.DB_PREFIX}_org_`));
    await organisations.forEach(async organisation => {
            const schedules = await db.query("SELECT * FROM ??", [`${organisation}.schedules`]);
            if (!await schedules || !await schedules?.length) return;

            await schedules.forEach(schedule => {

                const users = JSON.parse(schedule.users);
                users.forEach(async user => {

                    const doctors = await db.query("SELECT * FROM ? WHERE _id = ?", [`${organisation}.doctors`, user]);
                    if (await doctors.length === 0) {
                        await db.query("DELETE FROM ?? WHERE _id = ?", [`${organisation}.schedules`, schedule._id]);
                    }

                });

            });

    });
  
};


const removingOldSchedules = () => {
    setInterval(async () => {
        const databases = await db.query("SHOW DATABASES");
        const organisations = await databases.filter(database => database.includes(`${process.env.DB_PREFIX}_org_`));

        await organisations.forEach(async organisation => {
            const schedulesDeadlineISO = new Date(new Date().getTime() - PERIOD_SCHEDULES);
            const schedulesDeadline = `${schedulesDeadlineISO.getFullYear()}-${schedulesDeadlineISO.getMonth()}-${schedulesDeadlineISO.getDate()}`;
            await db.query("DELETE FROM ?? WHERE DATE(date) > ?", [`${organisation}.schedules`, schedulesDeadline]);
        });
    }, REPEATING_TIME);
};

module.exports = removingOldSchedules;
