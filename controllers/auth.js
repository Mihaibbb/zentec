const ErrorResponse = require("../handlers/error");
const bcrypt = require("bcryptjs");
const db = require("../db");

exports.login = async (req, res, next) => {
    const { username, password, rememberMe } = req.body;
    console.log("here", username);
    try {
        const dbs = await db.query("SHOW DATABASES");
        const organisationsUnfiltered = await dbs.map(currDb => {
            if (currDb.Database.search(`${process.env.DB_PREFIX}org_`) === 0 && currDb.Database.search("_backup") === -1) return currDb.Database;
            return null;
        });

        const organisations = await organisationsUnfiltered.filter(currDb => currDb !== null);
        console.log(organisations);
        let user, organisationName, isUser;
        
        await organisations && await organisations.length > 0 && await Promise.all(await organisations.map(async organisation => {
                
                const selectedUsers = await db.query('SELECT * FROM ?? WHERE username = ?', [`${organisation}.users`, username]);
                const detailsArr = await db.query("SELECT * FROM ??", `${organisation}.details`);
                const details = await detailsArr[0];
                const currUser = await selectedUsers && await selectedUsers[0];
                console.log("User found: ", currUser);
                if (await selectedUsers.length === 1 && await currUser && await currUser.password) {
                    try {
                        const samePassword = await bcrypt.compare(password, await currUser.password);
                        
                        if (samePassword) {
                            user = currUser;
                            organisationName = await details.name;
                            isUser = true;
                        }

                        
                    } catch (e) {
                        console.log("ERROR", e);
                        // return res.status(404).json({ success: false });
                       
                    }
                }
        }));

        // check if the user is admin 
        if (!user) {
            await db.query("USE ??", [`${process.env.DB_PREFIX}admins`]);
            const admins = await db.query("SELECT * FROM ??", ["users"]);
            const admin = await admins.find(currAdmin => currAdmin.username === username);
            console.log("The admin", admin);
            if (admin && admin.password && await bcrypt.compare(password, await admin.password)) {
                user = admin;
                isUser = false;
            }
        }
       
        if (!user && !organisationName) return res.status(200).json({ success: false, message: {en: "Email or password is incorrect!", ro: "Email-ul sau parola sunt incorecte!" }});
        
        const userData = {
            name: `${user.firstname} ${user.lastname}`, 
            username: user.username, 
            email: user?.email
        }; 
        
        console.log(userData);
        
        return res.status(200).json(!rememberMe ? { userData, success: true } : {userData, success: true, objectId: isUser ? user.userId : user._id, hashedPassword: user.password, type: isUser === true ? 'user' : isUser === false ?  'admin' : null } );   
    } catch (e) {
        console.log(e);
        res.status(404).json({ success: false, message: { en: "An error occured!", ro: "A aparut o eroare!" } });
    }
};

exports.loginRemember = async (req, res, next) => {
    const { userId, hashedPassword } = req.body;
    console.log(req.body);
    try {
        const dbs = await db.query("SHOW DATABASES");
        const organisationsUnfiltered = await dbs.map(currDb => {
            if (currDb.Database.search(`${process.env.DB_PREFIX}org_`) === 0 && currDb.Database.search("_backup") === -1) return currDb.Database;
            else return null;
        });
        const organisations = await organisationsUnfiltered.filter(currDb => currDb !== null);        
        console.log("ORGANISATIONS: ", organisations);

        await organisations && await organisations.length > 0 && await organisations.forEach(organisation => {
            (async () => {
                const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [organisation]);
                console.log(tables);
                const organisationData = {};

                const data = await Promise.all(tables.map(async tableRaw => {
                    const table = Object.values(tableRaw)[0];
                    const rows = await db.query("SELECT * FROM ??", [`${organisation}.${table}`]);
                    organisationData[table] = rows;
                    return 0;
                }));

                const users = await db.query("SELECT * FROM ??", [`${organisation}.users`]);
                const details = await db.query("SELECT * FROM ??", [`${organisation}.details`]);
                const row1 = await details[0];
                console.log("heree", details);
                const { _id, name, date } = await row1;
                organisationData["_id"] = _id;
                organisationData["name"] = name;
                organisationData["date"] = date;
               
                const currUser = users && users.length && users.find(user => {
                    return user.userId.toString() === userId.toString() && user.password === hashedPassword;
                });
    
                console.log("USER", currUser);
                if (currUser) {
                    const userData = {
                        name: currUser.name, 
                        username: currUser.username, 
                        userId
                    };

    
                    return res.status(200).json({ organisation: organisationData, user: userData, success: true, admin: false });
                  
                }   
            })();
        });

        const sql = 'SELECT * FROM ??';
        const admins = await db.query(sql, [`${process.env.DB_PREFIX}admins.users`]);
        const admin = await admins.find(currAdmin => currAdmin._id === userId && currAdmin.password === hashedPassword);
        if (admin) {
            const adminData = {
                name: `${admin.firstname} ${admin.lastname}`,
                email: admin.email,
                username: admin.username
            };
            console.log("admin data ", adminData);
            return res.status(200).json({ admin: adminData, success: true, admin: true });
        }
    } catch (e) {
        console.log(e);
        res.status(404).json({ message: "No user found" });

    }
};

exports.updatePassword = async (req, res, next) => {
    const { _id, userId, currPassword, newPassword } = req.body;
    try {
        const dbs = await db.query("SHOW DATABASES");
        const organisationsUnfiltered = await dbs.find(currDb => {
            return currDb.Database === `${process.env.DB_PREFIX}org_${_id}`; 
        });

        const organisation = organisationsUnfiltered.Database;  
        await db.query("USE ??", [organisation]);   
        const users = await db.query("SELECT * FROM ??", ["users"]);   
        
       
        const user = await users.find(currUser => currUser.userId === userId);
        const samePassword = await bcrypt.compare(currPassword, user.password);
        if (!samePassword) return res.status(200).json({ success: false, message: { en: "You introduced a wrong password!", ro: "Parola introdusa este gresita!" } })
        
        const newPasswordHashed = await bcrypt.hash(newPassword, process.env.SALT);
        let sql = "UPDATE ?? SET password = ? WHERE userId = ?";
        const updateUser = await db.query(sql, ['users', newPasswordHashed, userId]); 
        if (!updateUser) return res.status(200).json({ success: false, message: { en: "The password could not be updated!", ro: "Parola nu a putut fi actualizata!" } });
        
        res.status(200).json({ success: true, message: { en: "Password updated successfully!", ro: "Parola a fost actualizata cu succes!" } });
    } catch (e) {
        res.status(404).json({ message: { en: "An error occured!", ro: "A aparut o eroare" } });
    }
};


