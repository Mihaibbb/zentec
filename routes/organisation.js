const router = require('express').Router();
const { createOrganisation, removeOrganisation, getOrganisationsData, createUser, removeUser } = require("../controllers/organisation");

router.post("/create", createOrganisation);
router.post("/remove", removeOrganisation);
router.post("/create-user", createUser);
router.post("/remove-user", removeUser);
router.post("/data", getOrganisationsData);

module.exports = router;