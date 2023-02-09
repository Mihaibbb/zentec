const ErrorResponse = require("../handlers/error");
const generateId = require("../functions/generateId");
const bcrypt = require("bcryptjs");
const db = require("../db");
const logger = require("../logger");

exports.createOrganisation = async (req, res, next) => {
    const { name, adminId, orgId, smsLimit, smsMessage, modemId } = req.body;
    
    try {
        
        const isAdmin = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}admins.users`, adminId]);
        if (!await isAdmin.length) return new ErrorResponse("You cannot add an organisation if you are not an admin!", 404, res);
        
        await db.query("USE ??;", [`${process.env.DB_PREFIX}org_${orgId}`]);
        
        // if (!createNewOrg) return res.status(404).json({ success: false, message: { en: "This organisation could not be created!", ro: "Aceasta organizatie nu poate fi creata!" } });
        
        // Details table 

        let createTableSql = 'CREATE TABLE ?? ( ';
        createTableSql += 'name varchar(128) not null, ';
        createTableSql += 'date date not null, ';
        createTableSql += 'sms_limit int(10), ';
        createTableSql += 'sms_message json not null, ';
        createTableSql += 'sms_modem_id varchar(64) not null, ';
        createTableSql += 'inbox json not null, ';
        createTableSql += 'country varchar(128) not null, ';
        createTableSql += 'county varchar(64) not null, ';
        createTableSql += 'city varchar(128) not null, ';
        createTableSql += 'address varchar(128) not null, ';
        createTableSql += 'business_address varchar(128) not null, ';
        createTableSql += '_id varchar(25) not null )';
        
        await db.query(createTableSql, ["details"]);
        
        // Patients Table

         createTableSql = 'CREATE TABLE ?? ( ';
        createTableSql += '_id varchar(25) primary key not null, ';
        createTableSql += 'firstname varchar(256) not null, ';
        createTableSql += 'lastname varchar(256) not null, ';
        createTableSql += 'phone varchar(16) unique not null, ';
        createTableSql += 'birthdate date, ';
        createTableSql += 'fileNumber int(11) unique not null, ';
        createTableSql += 'username varchar(64), ';
        createTableSql += 'email varchar(256), ';
        createTableSql += 'cnp varchar(32), ';
        createTableSql += 'gender varchar(32), ';
        createTableSql += 'profileImage json, ';
        createTableSql += 'address text, ';
        createTableSql += 'doctors json, ';
        createTableSql += 'city varchar(58), ';
        createTableSql += 'county varchar(58), ';
        createTableSql += 'country varchar(56), ';
        createTableSql += 'date date not null, ';
        createTableSql += 'notes text, ';
        createTableSql += 'historic json )';

        await db.query(createTableSql, ['patients']);

        // Appointments table

        createTableSql = 'CREATE TABLE ?? ( ';
        createTableSql += '_id varchar(25) not null, ';
        createTableSql += 'startDate datetime not null, ';
        createTableSql += 'endDate datetime not null, ';
        createTableSql += 'title varchar(128) not null, ';
        createTableSql += 'income int, ';
        createTableSql += 'incomePaid int, '; 
        createTableSql += 'typeIncome varchar(10), ';
        createTableSql += 'patients json not null, ';
        createTableSql += 'notes text, ';
        createTableSql += 'users json not null, ';
        createTableSql += 'finished boolean not null, ';
        createTableSql += 'confirmed boolean not null, ';
        createTableSql += 'canceled boolean not null, ';
        createTableSql += 'date date not null, ';
        createTableSql += 'createdAt date not null )';

        await db.query(createTableSql, ['schedules']);

        // Users table
        
        createTableSql = 'CREATE TABLE ?? ( ';
        createTableSql += 'userId varchar(25) unique not null, ';
        createTableSql += 'name varchar(256) not null, ';
        createTableSql += 'username varchar(256) unique not null,';
        createTableSql += 'password varchar(256) not null, ';
        createTableSql += 'date date not null, ';
        createTableSql += 'profileImage json )';

        await db.query(createTableSql, ['users']);

        // Doctors table

        createTableSql = 'CREATE TABLE ?? ( ';
        createTableSql += 'id int(11) auto_increment primary key not null, ';
        createTableSql += '_id varchar(25) unique not null, ';
        createTableSql += 'firstname varchar(128) not null, ';
        createTableSql += 'lastname varchar(128) not null, ';
        createTableSql += 'email varchar(128) not null, ';
        createTableSql += 'phone varchar(16) not null, ';
        createTableSql += 'color varchar(16) not null, ';
        createTableSql += 'schedules  json not null, ';
        createTableSql += 'multiple_schedules boolean not null, ';
        createTableSql += 'services json not null, ';
        createTableSql += 'smsSent int DEFAULT 0 not null, ';
        createTableSql += 'active boolean not null, ';
        createTableSql += 'date date not null )';


        await db.query(createTableSql, ['doctors']);

        // Insert into details a row of organisation's details

        let sql = 'INSERT INTO ?? (name, date, sms_limit, sms_message, sms_modem_id, inbox, _id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const result = await db.query(sql, ['details', name, new Date(), smsLimit, JSON.stringify(smsMessage), modemId, JSON.stringify([]), orgId]);
        if (await result) return res.status(201).json({ message: { en: "Organisation created successfully!", ro: "Organizatia a fost creata cu succes!" }, success: true });
        
    } catch (e) {
        logger.debug(e);
        res.status(404).json({ success: false, message: { en: "An error occured!", ro: "A aparut o eroare!" } });
    }
};

exports.removeOrganisation = async (req, res, next) => {
    const { _id, adminId } = req.body;
    console.log("..");
    try {

        const isAdmin = await db.query("SELECT * FROM ?? WHERE _id = ?", [`${process.env.DB_PREFIX}admins.users`, adminId]);
        if (!await isAdmin.length) return new ErrorResponse("You cannot add an organisation if you are not an admin!", 404, res);
        
        let sql = 'DROP DATABASE ??';

        const result = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}`]);
        if (await result) res.status(200).json({ success: true, message: { en: "Organisation successfully removed!", ro: "Organizatia a fost stearsa cu success!" }});
        else res.status(404).json({ success: false, message: { en: "The organisation could not be removed!", ro: "Organizatia nu a putut fi stearsa!" } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occured!", ro: "A aparut o eroare!" } });
    }
};

exports.getOrganisationsData = async (req, res, next) => {
    const { adminId } = req.body;
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const isAdmin = await db.query(sql, [`${process.env.DB_PREFIX}admins.users`, adminId]);
        if (!isAdmin.length) return new ErrorResponse("You cannot add an organisation if you are not an admin!", 404, res);
        sql = "SHOW DATABASES;";
        const currDbs = await db.query(sql);
        const currOrganisations = await currDbs.filter(currDb => currDb.Database.search(`${process.env.DB_PREFIX}org_`) !== -1);
        const organisations = await Promise.all(await currOrganisations.map(async org => {
            const users = await db.query("SELECT * FROM ??", [`${org.Database}.users`]);
            const details = await db.query("SELECT * FROM ??", [`${org.Database}.details`]);
            const detail = await details[0];
            console.log(await detail);
            const _id = await detail._id;
            const name = await detail.name;
            const date = await detail.date;
            const smsMessage = await detail.smsMessage;
            const apiKey = await detail.apiKey;
            const schedules = await db.query("SELECT * FROM ??", [`${org.Database}.schedules`]);
            const patients = await db.query("SELECT * FROM ??", [`${org.Database}.patients`]);
            const doctors = await db.query("SELECT * FROM ??", [`${org.Database}.doctors`]);
            console.log("THIS ONE", {
                users: await users,
                _id: await _id,
                name: await name,
                date: await date,
                smsMessage: await smsMessage,
                apiKey: await apiKey,
                schedules: await schedules,
                patients: await patients,
                doctors: await doctors
            });

            return {
                users: await users,
                _id: await _id,
                name: await name,
                date: await date,
                schedules: await schedules,
                smsMessage: await smsMessage,
                apiKey: await apiKey,
                patients: await patients,
                doctors: await doctors
            };
        }));

        res.status(200).json({ success: true, organisations: organisations });
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.createUser = async (req, res, next) => {
    const { organisationId, name, username, password, adminId } = req.body;

    try {
   
        let sql = "SELECT * FROM ??";
        const isAdmin = await db.query(sql, [`${process.env.DB_PREFIX}admins.users`, adminId]);
        if (!isAdmin.length) return new ErrorResponse("You cannot add an organisation if you are not an admin!", 404, res);

        const dbs = await db.query("SHOW DATABASES");
        const foundOrganisation = await dbs.find(currDb => currDb.Database === `${process.env.DB_PREFIX}org_${organisationId}`);
        if (!await foundOrganisation) new ErrorResponse("Organisation doesn't exist!", 404, res);
        
        const userId = generateId(25);
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
        const hashPassword = await bcrypt.hash(password, salt);

        sql = "INSERT INTO ?? (userId, name, username, password, date) VALUES (?, ?, ?, ?, ?)";
        const insertedUser = await db.query(sql, [`${process.env.DB_PREFIX}org_${organisationId}.users`, userId, name, username, hashPassword, new Date()]);
        
        if (await insertedUser) res.status(201).json({ success: true, message: { en: "User created successfully!", ro: "Utilizator creat cu succes!" }});
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};

exports.removeUser = async (req, res, next) => {
    const { _id, username, adminId } = req.body;
    console.log("./");
    try {
        let sql = "SELECT * FROM ?? WHERE _id = ?";
        const isAdmin = await db.query(sql, [`${process.env.DB_PREFIX}admins.users`, adminId]);
        if (!isAdmin.length) return new ErrorResponse("You cannot add an organisation if you are not an admin!", 404, res);

        sql = "DELETE FROM ?? WHERE username = ?";
        const deletedUser = await db.query(sql, [`${process.env.DB_PREFIX}org_${_id}.users`, username]);
        console.log(await deletedUser);
        if (await deletedUser) res.status(200).json({ success: true, message: { en: "User removed successfully!", ro: "Utilizator sters cu succes!" }});
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: "An error occured." });
    }
};
