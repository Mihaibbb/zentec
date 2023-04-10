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

(async () => {
    const databases = await db.query("SHOW DATABASES");
    const realDatabases = databases.filter(database => database.Database.includes("org") && !database.Database.includes("_backup"));
    realDatabases.forEach(async currDb => {
        const dbName = currDb.Database;
        // await db.query("USE ??", [dbName]);
        // let createTableSql = 'CREATE TABLE ?? ( ';
        // createTableSql += 'id int(14) auto_increment primary key not null, ';
        // createTableSql += 'name varchar(128) not null, ';
        // createTableSql += 'color varchar(20) not null );';

        // await db.query(createTableSql, ['treatment_categories']);

        // // Treatments
        // createTableSql = 'CREATE TABLE ?? ( ';
        // createTableSql += '_id varchar(26) not null, ';
        // createTableSql += 'name varchar(128) not null, ';
        // createTableSql += 'category varchar(128) not null, ';
        // createTableSql += 'price int not null, ';
        // createTableSql += 'pricePer varchar(64) not null, ';
        // createTableSql += 'type varchar(64) not null, ';
        // createTableSql += 'color varchar(20) not null );';
        // await db.query(createTableSql, ['treatments']);

    }); 
})();


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