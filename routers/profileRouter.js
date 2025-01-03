const express = require('express');
const supa = require('../supabase')
const { validate: validateUUID } = require('uuid')
const sharp = require('sharp')
const multer = require('multer')
const path = require("path");
const fs = require('fs')
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20971520 } }).single('avatar')
const { body, matchedData, validationResult } = require('express-validator')

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

        let userProfile

        if (req.userId == req.params.userUUID) {
            userProfile = await userProfiles.findOne({ where: { userId: req.params.userUUID }, attributes: { exclude: ['updatedAt', 'deletedAt'] } })
        }
        else {
            userProfile = await userProfiles.findOne({ where: { userId: req.params.userUUID }, attributes: ['userId', 'firstName', 'surname', 'avatarUrl', 'createdAt'] })
        }

        if (!userProfile) return res.status(400).json(queryResult(false, 'Profile Not Found'));

        let data = userProfile.get({ plain: true })

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', data));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.post('/',
    body('firstName').isString().notEmpty().withMessage('First Name is required'),
    body('surname').isString().notEmpty().withMessage('Surname is required'),
    body('residence').isString().notEmpty().withMessage('Residence is required'),
    body('area').isString().notEmpty().withMessage('Area is required'),
    body('legalId').isString().notEmpty().withMessage('Legal ID is required'),
    body('legalIdType').isString().notEmpty().isIn(['PASSPORT', 'NATIONAL_ID', 'LICENSE']).withMessage('Legal ID Type must be PASSPORT, NATIONAL_ID, or LICENSE'),
    body('phoneNumber').isString().notEmpty().withMessage('Phone Number is required'),
    body('email').isEmail().withMessage('Email is required'),
    async (req, res) => {
        try {
            let result = validationResult(req)
            if (!result.isEmpty()) {
                return res.status(400).json(queryResult(false, 'Invalid Input', result));
            }

            const data = matchedData(req)
            data.userId = req.userId

            const [userProfile, created] = await userProfiles.findOrCreate({ where: { userId: req.userId }, defaults: data })

            if (!created) return res.status(400).json(queryResult(false, 'Profile Already Exists'));

            let createdProfile = userProfile.get({ plain: true })
            delete createdProfile.deletedAt
            delete createdProfile.updatedAt

            return res.status(200).json(queryResult(true, 'Request Processed Successfully', createdProfile));

        }
        catch (err) {
            console.log(err);
            return res.status(500).json(queryResult(false, err.message));
        }
    });

router.put('/',
    body('firstName').optional().isString().notEmpty().withMessage('First Name is required'),
    body('surname').optional().isString().notEmpty().withMessage('Surname is required'),
    body('residence').optional().isString().notEmpty().withMessage('Residence is required'),
    body('area').optional().isString().notEmpty().withMessage('Area is required'),
    body('legalId').optional().isString().notEmpty().withMessage('Legal ID is required'),
    body('legalIdType').optional().isString().notEmpty().isIn(['PASSPORT', 'NATIONAL_ID', 'LICENSE']).withMessage('Legal ID Type must be PASSPORT, NATIONAL_ID, or LICENSE'),
    body('phoneNumber').optional().isString().notEmpty().withMessage('Phone Number is required'),
    body('email').optional().isEmail().withMessage('Email is required'),
    async (req, res) => {
        try {

            let result = validationResult(req)
            if (!result.isEmpty()) {
                return res.status(400).json(queryResult(false, 'Invalid Input', result));
            }

            const data = matchedData(req)
            if (Object.keys(data).length < 1) {
                return res.status(400).json(queryResult(false, 'No Profile Data Provided'));
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
            delete updatedProfile.deletedAt
            delete updatedProfile.updatedAt

            return res.status(200).json(queryResult(true, 'Request Processed Successfully', updatedProfile));

        }
        catch (err) {
            console.log(err);
            return res.status(500).json(queryResult(false, err.message));
        }
    });

router.post('/uploadavatar', async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) return res.status(500).json(queryResult(false, err.message));

            let file = req.file

            if (!file) return res.status(400).json(queryResult(false, 'No File Received'));

            const filetypes = /jpeg|jpg|png/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (!(extname && mimetype)) return res.status(400).json(queryResult(false, 'Only JPEG and PNG is supported'));

            let avatar = await sharp('uploads/' + file.filename).toFormat("jpeg", { mozjpeg: true, quality: 60, force: true }).toBuffer()

            const { error } = await supa
                .storage
                .from('avatars')
                .upload('public/' + req.userId, avatar, {
                    contentType: 'image/jpg',
                    upsert: true
                })

            if (error) return res.status(500).json(queryResult(false, error.message, error));

            const url = supa
                .storage
                .from('avatars')
                .getPublicUrl('public/' + req.userId).data.publicUrl

            let [affectedCount, userProfile] = await userProfiles.update({ avatarUrl: url }, {
                where: {
                    userId: req.userId
                },
                returning: true,
                raw: true
            })

            if (affectedCount < 1) return res.status(400).json(queryResult(false, 'Profile Not Found'));

            fs.rmSync('uploads/' + file.filename)

            let updatedProfile = userProfile[0]
            delete updatedProfile.deletedAt
            delete updatedProfile.updatedAt

            return res.status(200).json(queryResult(true, 'Request Processed Successfully', updatedProfile));
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
})

// router.delete('/', async (req, res) => {
//     try {

//         await userProfiles.destroy({ where: { userId: req.userId }, individualHooks: true })

//         await supa.auth.admin.deleteUser(req.userId, true)

//         // await supa.storage.from('avatars').remove(['public/' + req.userId])

//         return res.status(200).json(queryResult(true, 'Request Processed Successfully'));

//     }
//     catch (err) {
//         console.log(err);
//         return res.status(500).json(queryResult(false, err.message));
//     }
// });

module.exports = router;