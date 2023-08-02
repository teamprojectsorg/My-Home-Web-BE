const express = require('express');
const { validate: validateUUID } = require('uuid')

const queryResult = require('../utils/queryResult');
const jsonErrorMiddleware = require('../middlewares/jsonErrorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const userProfiles = require('../models/UserProfile');

const router = express.Router();

router.use(authMiddleware);
router.use(express.json());
router.use(jsonErrorMiddleware);

router.get('/:userUUID', async (req, res) => {
    try {

        if (!validateUUID(req.params.userUUID)) return res.status(400).json(queryResult(false, 'Invalid Profile ID'));

        const userProfile = await userProfiles.findOne({ where: { userId: req.params.userUUID } })

        if (!userProfile) return res.status(400).json(queryResult(false, 'Profile Not Found'));

        let data = userProfile.get({ plain: true })
        delete data.id

        if (req.userId == req.params.userUUID) {
            return res.status(200).json(queryResult(true, 'Request Processed Successfully', data));
        }
        let masked = {
            firstName: data.firstName,
            surname: data.surname
        }

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', masked));

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

        if (Object.values(data).some(value => !value)) {
            return res.status(400).json(queryResult(false, 'Profile Data Incomplete or in Wrong Format'));
        }

        if (userProfiles.getAttributes().legalIdType.values.indexOf(data.legalIdType) == -1) {
            return res.status(400).json(queryResult(false, 'LegalIdType can be PASSPORT, NATIONAL_ID or LICENSE'));
        }

        const [userProfile, created] = await userProfiles.findOrCreate({ where: { userId: req.userId }, defaults: data })

        if (!created) return res.status(400).json(queryResult(false, 'Profile Already Exists'));

        let createdProfile = userProfile.get({ plain: true })
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

        Object.keys(data).map((property) => {
            if (data[property] == undefined) {
                delete data[property]
            }
            else if (!data[property]) {
                return res.status(400).json(queryResult(false, 'Profile Data in Wrong Format'));
            }
        })

        if (Object.keys(data).length < 1) {
            return res.status(400).json(queryResult(false, 'No Profile Data Provided'));
        }

        if (data.legalIdType && userProfiles.getAttributes().legalIdType.values.indexOf(data.legalIdType) == -1) {
            return res.status(400).json(queryResult(false, 'LegalIdType can be PASSPORT, NATIONAL_ID or LICENSE'));
        }

        let [affectedCount, userProfile] = await userProfiles.update(data, {
            where: {
                userId: req.userId
            },
            returning: true,
            raw: true
        })

        if (affectedCount < 1) {
            return res.status(400).json(queryResult(false, 'Profile Not Found'));
        }

        let updatedProfile = userProfile[0]
        delete updatedProfile.id

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', updatedProfile));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

module.exports = router;