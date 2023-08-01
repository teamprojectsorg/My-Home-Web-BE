const express = require('express');

const queryResult = require('../utils/queryResult');
const jsonErrorMiddleware = require('../middlewares/jsonErrorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const userProfiles = require('../models/UserProfile');

const router = express.Router();

router.use(authMiddleware);
router.use(express.json());
router.use(jsonErrorMiddleware);

router.get('/', async (req, res) => {
    try {

        const userProfile = await userProfiles.findOne({ where: { userId: req.userId } })

        if (!userProfile) return res.status(400).json(queryResult(false, 'Profile Not Registered'));

        let data = userProfile.get({ plain: true })
        delete data.userId
        delete data.id

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', data));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.post('/', async (req, res) => {
    try {

        const data = {
            userId: req.userId,
            firstName: req.body.firstName,
            surname: req.body.surname,
            residence: req.body.residence,
            area: req.body.area,
            legalId: req.body.legalId,
            legalIdType: req.body.legalIdType,
            phoneNumber: req.body.phoneNumber
        }

        if (Object.values(data).some(value => value == null)) {
            return res.status(400).json(queryResult(false, 'Profile Data Incomplete'));
        }

        if (userProfiles.getAttributes().legalIdType.values.indexOf(data.legalIdType) == -1) {
            return res.status(400).json(queryResult(false, 'LegalIdType can be PASSPORT, NATIONAL_ID or LICENSE'));
        }

        const [userProfile, created] = await userProfiles.findOrCreate({ where: { userId: req.userId }, defaults: data })

        if (!created) return res.status(400).json(queryResult(false, 'Profile Already Exists'));

        let createdProfile = userProfile.get({ plain: true })
        delete createdProfile.userId
        delete createdProfile.id

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', createdProfile));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.put('/', async (req, res) => {
    try {

        const data = {
            firstName: req.body.firstName,
            surname: req.body.surname,
            residence: req.body.residence,
            area: req.body.area,
            legalId: req.body.legalId,
            legalIdType: req.body.legalIdType,
            phoneNumber: req.body.phoneNumber
        }

        if (Object.values(data).every(value => value == null)) {
            return res.status(400).json(queryResult(false, 'No Profile Data Provided'));
        }

        if (data.legalIdType && userProfiles.getAttributes().legalIdType.values.indexOf(data.legalIdType) == -1) {
            return res.status(400).json(queryResult(false, 'LegalIdType can be PASSPORT, NATIONAL_ID or LICENSE'));
        }

        await userProfiles.update(data, {
            where: {
                userId: req.userId
            }
        })

        return res.status(200).json(queryResult(true, 'Request Processed Successfully'));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

module.exports = router;