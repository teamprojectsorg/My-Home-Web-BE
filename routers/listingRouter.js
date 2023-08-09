const express = require('express');
const { validate: validateUUID } = require('uuid')
const { body, matchedData, validationResult, check } = require('express-validator')

const queryResult = require('../utils/queryResult');
const jsonErrorMiddleware = require('../middlewares/jsonErrorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const userProfiles = require('../models/UserProfile');
const propertyListings = require('../models/PropertyListing')
const propertyImages = require('../models/PropertyImage')
const propertyReviews = require('../models/PropertyReview');

const router = express.Router();

router.use(express.json());
router.use(jsonErrorMiddleware);

router.get('/mylisting', authMiddleware, async (req, res) => {
    try {

        const listing = await propertyListings.findAll({
            where: {
                userId: req.userId
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [userProfiles]
        })

        let data = listing.map(listingModel => {
            property = listingModel.get({ plain: true })
            property.createdBy = {
                userId: property.UserProfile.userId,
                firstName: property.UserProfile.firstName,
                surname: property.UserProfile.surname
            }
            delete property.UserProfile
            delete property.userId
            return property
        })

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', data));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.get('/', async (req, res) => {
    try {

        const listing = await propertyListings.findAll({
            order: [
                ['createdAt', 'DESC']
            ],
            include: [userProfiles]
        })

        let data = listing.map(listingModel => {
            property = listingModel.get({ plain: true })
            property.createdBy = {
                userId: property.UserProfile.userId,
                firstName: property.UserProfile.firstName,
                surname: property.UserProfile.surname
            }
            delete property.UserProfile
            delete property.userId
            return property
        })

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', data));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.get('/:listingUUID', async (req, res) => {
    try {

        if (!validateUUID(req.params.listingUUID)) return res.status(400).json(queryResult(false, 'Invalid Listing ID'));

        const listing = await propertyListings.findOne({
            where: {
                id: req.params.listingUUID
            },
            include: [userProfiles]
        })

        if (!listing) return res.status(400).json(queryResult(false, 'Listing Not Found'));

        let data = listing.get({ plain: true })
        data.createdBy = {
            userId: data.UserProfile.userId,
            firstName: data.UserProfile.firstName,
            surname: data.UserProfile.surname
        }
        delete data.UserProfile
        delete data.userId

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', data));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.post('/', authMiddleware, [
    body('isAvailable').exists().isBoolean(),
    body('location').exists().isString().notEmpty(),
    body('area').exists().isString().notEmpty(),
    body('listingType').isString().notEmpty().isIn(['SALE', 'RENT', 'LEASE']),
    body('squareFeet').exists().isInt({ min: 0 }),
    body('details').exists().isString().notEmpty(),
    body('highlights').isArray().custom((value) => {
        if (!Array.isArray(value)) {
            throw new Error('Highlights must be an array.');
        }
        if (value.some((item) => typeof item !== 'string')) {
            throw new Error('Each highlight must be a string.');
        }
        return true;
    }),
    body('price').exists().isInt({ min: 0 })
],
    async (req, res) => {
        try {

            let result = validationResult(req)
            if (!result.isEmpty()) {
                return res.status(400).json(queryResult(false, 'Invalid Input', result));
            }

            const data = matchedData(req)
            data.userId = req.userId
            data.sold = false

            let createdListing = await propertyListings.create(data)
            createdListing = createdListing.get({ plain: true })
            delete createdListing.userId

            return res.status(200).json(queryResult(true, 'Request Processed Successfully', createdListing));

        }
        catch (err) {
            console.log(err);
            return res.status(500).json(queryResult(false, err.message));
        }
    });

router.put('/:listingUUID', authMiddleware, [
    body('isAvailable').optional().isBoolean(),
    body('location').optional().isString().notEmpty(),
    body('area').optional().isString().notEmpty(),
    body('listingType').isString().notEmpty().isIn(['SALE', 'RENT', 'LEASE']),
    body('squareFeet').optional().isInt({ min: 0 }),
    body('details').optional().isString().notEmpty(),
    body('highlights').optional().isArray().custom((value) => {
        if (!Array.isArray(value)) {
            throw new Error('Highlights must be an array.');
        }
        if (value.some((item) => typeof item !== 'string')) {
            throw new Error('Each highlight must be a string.');
        }
        return true;
    }),
    body('price').optional().isInt({ min: 0 }),
    body('sold').optional().isBoolean(),
],
    async (req, res) => {
        try {

            let result = validationResult(req)
            if (!result.isEmpty()) {
                return res.status(400).json(queryResult(false, 'Invalid Input', result));
            }

            const data = matchedData(req)
            if (Object.keys(data).length < 1) {
                return res.status(400).json(queryResult(false, 'No Listing Data Provided'));
            }

            let [affectedCount, listing] = await propertyListings.update(data, {
                where: {
                    userId: req.userId,
                    id: req.params.listingUUID
                },
                returning: true,
                raw: true
            })

            if (affectedCount < 1) {
                return res.status(400).json(queryResult(false, 'Listing Not Found Or Not Owned By User'));
            }

            let updatedListing = listing[0]
            delete updatedListing.userId

            return res.status(200).json(queryResult(true, 'Request Processed Successfully', updatedListing));

        }
        catch (err) {
            console.log(err);
            return res.status(500).json(queryResult(false, err.message));
        }
    });

router.delete('/:listingUUID', authMiddleware, async (req, res) => {
    try {

        if (!validateUUID(req.params.listingUUID)) return res.status(400).json(queryResult(false, 'Invalid Listing ID'));

        let deleted = await propertyListings.destroy({ where: { userId: req.userId, id: req.params.listingUUID } })

        if (!deleted) return res.status(400).json(queryResult(false, 'Listing Not Found'));

        return res.status(200).json(queryResult(true, 'Request Processed Successfully'));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

module.exports = router;