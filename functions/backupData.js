const db = require("../db");
const logger = require("../logger");

const TIME_PERIOD = 1000 * 60 * 60 * 24;

const currentOrganisations = async () => {

    const dbs = await db.query("SHOW DATABASES");
    const organisationsUnfiltered = dbs.map(currDb => {
        if (currDb.Database.search(`${process.env.DB_PREFIX}org_`) === 0 && currDb.Database.search("_backup") === -1) return currDb.Database;
        return null;
    });

    return organisationsUnfiltered.filter(currDb => currDb !== null);
};

const removeOldOrganisationsBackup = async () => {
    try {
        const dbs = await db.query("SHOW DATABASES");
        const organisationsUnfiltered = dbs.map(currDb => {
            if (currDb.Database.search(`${process.env.DB_PREFIX}org_`) === 0 && currDb.Database.search("_backup") !== -1) return currDb.Database;
            return null;
        });

        if (!organisationsUnfiltered || !organisationsUnfiltered?.length) return;

        const organisations = organisationsUnfiltered.filter(org => org !== null);

        organisations.forEach(async currDb => {
            try {
                await db.query("USE ??;", [currDb]);
                const currentTablesUnmapped = await db.query("SHOW TABLES");
                const currentTables = currentTablesUnmapped.map(table => Object.values(table)[0]);
    
                currentTables.forEach(async table => {
                    let currentIdx = table.length - 1;
                    while (table[currentIdx] !== "_") currentIdx--;
                    logger.debug(currDb, table, currentIdx);
                    const tableDate = new Date( Number( table.slice(currentIdx) ) );
                    if (new Date().getTime() - tableDate.getTime() >= 1000 * 60 * 60 * 24 * 30) {
                        try {
                            await db.query("DROP TABLE ??", [`${currDb}.${table}`]);
                        } catch (e) {
                            logger.debug("Backup table couldn't be removed", e);
                        }
                    }
                });
            } catch (e) {
                logger.debug('Error removing backup data', e);
            }
            
        });
        
    
    } catch (e) {
        logger.debug(e);
    }
};

const backupPatients = async () => {
    try {
    
        const organisations = await currentOrganisations();

        organisations.forEach(async organisation => { 
            try {
                await db.query("USE ??", [organisation]);
                const newBackupTime = new Date().getTime();
                await db.query("CREATE TABLE ?? SELECT * FROM ??", [`${organisation}_backup.patients_${newBackupTime}`, `${organisation}.patients`]);            
            } catch (e) {
                logger.debug(e);
            }
        });
        
    } catch (e) {
        logger.debug(e);
    }
};

const backupDoctors = async () => {
    try {
    
        const organisations = await currentOrganisations();

        organisations.forEach(async organisation => { 
            try {
                await db.query("USE ??", [organisation]);
                const newBackupTime = new Date().getTime();
                await db.query("CREATE TABLE ?? SELECT * FROM ??", [`${organisation}_backup.doctors_${newBackupTime}`, `${organisation}.doctors`]);            
            } catch (e) {
                logger.debug(e);
            }
        });
        
    } catch (e) {
        logger.debug(e);
    }
};

const backupSchedules = async () => {
    try {
        const organisations = await currentOrganisations();

        organisations.forEach(async organisation => { 
            try {
                await db.query("USE ??", [organisation]);
                const newBackupTime = new Date().getTime();
                await db.query("CREATE TABLE ?? SELECT * FROM ??", [`${organisation}_backup.schedules_${newBackupTime}`, `${organisation}.schedules`]);            
            } catch (e) {
                logger.debug(e);
            }
        });
    } catch (e) {
        logger.debug(e);
    }
};


const backupData = () => {
    setInterval(async () => {
        await removeOldOrganisationsBackup();
        await backupPatients();
        await backupDoctors();
        await backupSchedules();
    }, TIME_PERIOD);
};

module.exports = backupData;
