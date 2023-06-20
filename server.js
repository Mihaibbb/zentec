if (process.env.NODE_MODULES !== "production") {
    require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const authRouter = require("./routes/auth");
const privateRouter = require("./routes/private");
const imagesRouter = require("./routes/images");
const adminRouter = require("./routes/admin");
const organisationRouter = require("./routes/organisation");
const userRouter = require("./routes/user");
const patientRouter = require("./routes/patient");
const connection = require("./db");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/error");
const crypto = require("crypto");
const logger = require("./logger");
const backupData = require ('./functions/backupData');


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const removeOldSchedules = require("./functions/removingOldSchedules");
const db = require("./db");

removeOldSchedules();
backupData();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/test", (req, res) => {
    res.send("Hello");
});


// (async () => {
//     const databases = await db.query("SHOW DATABASES");
//     const realDatabases = databases.filter(database => database.Database.includes("org") && !database.Database.includes("_backup"));
//     realDatabases.forEach(async currDb => {
//         const dbName = currDb.Database;
//         console.log(dbName);
//         if (dbName !== "sgdpjsrc_org_jVPdzuvfqF0nR0q2MuGue46OH") return;
//         await db.query("USE ??", [dbName]);
//         // let createTableSql = 'CREATE TABLE ?? ( ';
//         // createTableSql += 'id int(14) auto_increment primary key not null, ';
//         // createTableSql += 'name varchar(128) not null, ';
//         // createTableSql += 'color varchar(20) not null );';

//         // await db.query(createTableSql, ['treatment_categories']);

//         // // Treatments
//         // createTableSql = 'CREATE TABLE ?? ( ';
//         // createTableSql += '_id varchar(26) not null, ';
//         // createTableSql += 'name varchar(128) not null, ';
//         // createTableSql += 'category varchar(128) not null, ';
//         // createTableSql += 'price int not null, ';
//         // createTableSql += 'pricePer varchar(64) not null, ';
//         // createTableSql += 'type varchar(64) not null, ';
//         // createTableSql += 'color varchar(20) not null );';
//         // await db.query(createTableSql, ['treatments']);

//         const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [dbName]);
//         console.log(tables);
//         if (tables.every(table => Object.values(table)[0] !== "treatments")) {
//             await Promise.all(tables.map(async table => {

         
//                 if (!Object.values(table)[0].includes("details")) {
//                     await db.query("DROP TABLE ??", [Object.values(table)[0]]);
//                 } else {
//                     try {
//                         await db.query("ALTER TABLE details ADD COLUMN country varchar(128) default 'Romania', ADD COLUMN county varchar(64), ADD COLUMN city varchar(128), ADD COLUMN address varchar(128), ADD COLUMN business_address varchar(128), ADD COLUMN start_hour int(2) not null, ADD COLUMN end_hour int(2) not null");
//                     } catch (e) {
//                         console.log("EEEE", e);
//                     }
//                 }
    
//                 return null;
//             }));
    
//             let createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += '_id varchar(25) primary key not null, ';
//             createTableSql += 'firstname varchar(256) not null, ';
//             createTableSql += 'lastname varchar(256) not null, ';
//             createTableSql += 'phone varchar(16) unique not null, ';
//             createTableSql += 'birthdate date, ';
//             createTableSql += 'fileNumber int(11) unique not null, ';
//             createTableSql += 'username varchar(64), ';
//             createTableSql += 'email varchar(256), ';
//             createTableSql += 'cnp varchar(32), ';
//             createTableSql += 'gender varchar(32), ';
//             createTableSql += 'profileImage json, ';
//             createTableSql += 'address text, ';
//             createTableSql += 'doctors json, ';
//             createTableSql += 'city varchar(58), ';
//             createTableSql += 'county varchar(58), ';
//             createTableSql += 'country varchar(56), ';
//             createTableSql += 'date date not null, ';
//             createTableSql += 'notes text, ';
//             createTableSql += 'historic json, ';
//             createTableSql += 'documents json );';
    
//             await db.query(createTableSql, ['patients']);
    
//             // Appointments table
    
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += '_id varchar(25) not null, ';
//             createTableSql += 'startDate datetime not null, ';
//             createTableSql += 'endDate datetime not null, ';
//             createTableSql += 'title varchar(128) not null, ';
//             createTableSql += 'income int, ';
//             createTableSql += 'incomePaid int, '; 
//             createTableSql += 'typeIncome varchar(10), ';
//             createTableSql += 'patients json not null, ';
//             createTableSql += 'notes text, ';
//             createTableSql += 'users json not null, ';
//             createTableSql += 'finished boolean not null, ';
//             createTableSql += 'confirmed boolean not null, ';
//             createTableSql += 'canceled boolean not null, ';
//             createTableSql += 'unpresented boolean not null, ';
//             createTableSql += 'date date not null, ';
//             createTableSql += 'createdAt date not null )';
    
//             await db.query(createTableSql, ['schedules']);
    
//             // Users table
            
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += 'userId varchar(25) unique not null, ';
//             createTableSql += 'name varchar(256) not null, ';
//             createTableSql += 'username varchar(256) unique not null,';
//             createTableSql += 'password varchar(256) not null, ';
//             createTableSql += 'date date not null, ';
//             createTableSql += 'profileImage json )';
    
//             await db.query(createTableSql, ['users']);
    
//             // Doctors table
    
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += 'id int(11) auto_increment primary key not null, ';
//             createTableSql += '_id varchar(25) unique not null, ';
//             createTableSql += 'firstname varchar(128) not null, ';
//             createTableSql += 'lastname varchar(128) not null, ';
//             createTableSql += 'email varchar(128) not null, ';
//             createTableSql += 'phone varchar(16) not null, ';
//             createTableSql += 'color varchar(16) not null, ';
//             createTableSql += 'schedules  json not null, ';
//             createTableSql += 'multiple_schedules boolean not null, ';
//             createTableSql += 'services json not null, ';
//             createTableSql += 'smsSent int DEFAULT 0 not null, ';
//             createTableSql += 'active boolean not null, ';
//             createTableSql += 'date date not null )';
            
//             await db.query(createTableSql, ['doctors']);
    
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += '_id varchar(25) unique not null, ';
//             createTableSql += 'firstname varchar(50) not null, ';
//             createTableSql += 'lastname varchar(50) not null, ';
//             createTableSql += 'email varchar(128), ';
//             createTableSql += 'phone varchar(16) )';
            
//             await db.query(createTableSql, ['assistants']);
    
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += 'iso int(11) not null, ';
//             createTableSql += 'name varchar(64) not null, ';
//             createTableSql += '_id varchar(25) unique not null)';
    
//             await db.query(createTableSql, ['sterilization_instruments']);
    
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += 'id int(14) auto_increment primary key not null, ';
//             createTableSql += '_id varchar(25) unique not null, ';
//             createTableSql += 'add_date date not null, ';
//             createTableSql += 'expire_date date not null, ';
//             createTableSql += 'sarja int(10) not null, ';
//             createTableSql += 'assistant varchar(25) not null, ';
//             createTableSql += 'sterilization_instruments json not null)';
    
//             await db.query(createTableSql, ['sterilizations']);
    
//             // Treatment categories
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += 'id int(14) auto_increment primary key not null, ';
//             createTableSql += 'name varchar(128) not null, ';
//             createTableSql += 'color varchar(20) not null );';
    
//             await db.query(createTableSql, ['treatment_categories']);
    
//             // Treatments
//             createTableSql = 'CREATE TABLE IF NOT EXISTS ?? ( ';
//             createTableSql += '_id varchar(26) not null, ';
//             createTableSql += 'name varchar(128) not null, ';
//             createTableSql += 'category varchar(128) not null, ';
//             createTableSql += 'price int not null, ';
//             createTableSql += 'pricePer varchar(64) not null, ';
//             createTableSql += 'type varchar(64) not null, ';
//             createTableSql += 'color varchar(20) not null );';
    
//             await db.query(createTableSql, ['treatments']);
//         }
//     }); 
// })();


console.log(__dirname);

app.use(express.static(__dirname));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/private", privateRouter);
app.use("/api/upload-image", imagesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/organisation", organisationRouter);
app.use("/api/user", userRouter);
app.use("/api/patient", patientRouter);

// Error Handler
app.use(errorHandler); 

io.on("connection", socket => {
    console.log(socket.id);
});


const port = process.env.PORT || 8000;
server.listen(port, () => console.log("Server started " + port));