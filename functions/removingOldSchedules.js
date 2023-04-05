const REPEATING_TIME = 1000 * 60 * 60 * 24;
const PERIOD_SCHEDULES = 1000 * 60 * 60 * 24 * 365;
const db = require("../db");
const logger = require("../logger");

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
        console.log(databases);
        const organisations = await databases.filter(database => Object.values(database)[0].includes(`${process.env.DB_PREFIX}org_`) && !Object.values(database)[0].includes('_backup'));
        logger.debug(organisations);

        organisations && organisations.length && organisations.forEach(async organisation => {
            const currentOrg = Object.values(organisation)[0];
            const schedulesDeadlineISO = new Date(new Date().getTime() - PERIOD_SCHEDULES);
            const schedulesDeadline = `${schedulesDeadlineISO.getFullYear()}-${schedulesDeadlineISO.getMonth() + 1}-${schedulesDeadlineISO.getDate()}`;
            await db.query("DELETE FROM ?? WHERE date < ?", [`${currentOrg}.schedules`, schedulesDeadline]);
        });

    }, 1000 * 30);
};

module.exports = removingOldSchedules;
