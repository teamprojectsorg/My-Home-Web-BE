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
const UserProfile = require('../models/UserProfile');

const router = express.Router();

router.use(authMiddleware);
router.use(express.json());
router.use(jsonErrorMiddleware);

router.get('/:listingUUID', async (req, res) => {
    try {

        if (!validateUUID(req.params.listingUUID)) return res.status(400).json(queryResult(false, 'Invalid Listing ID'));

        const listing = await propertyListings.findOne({
            where: {
                id: req.params.listingUUID
            },
            include: [
                {
                    model: userProfiles
                },
                {
                    model: propertyImages
                }
            ]
        })

        if (!listing) return res.status(400).json(queryResult(false, 'Listing Not Found'));

        let data = listing.get({ plain: true })
        data.createdBy = {
            userId: data.UserProfile.userId,
            firstName: data.UserProfile.firstName,
            surname: data.UserProfile.surname
        }
        delete data.UserProfile

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', data));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.post('/', [
    body('isAvailable').exists().isBoolean(),
    body('location').exists().isString().notEmpty(),
    body('area').exists().isString().notEmpty(),
    body('forRent').exists().isBoolean(),
    body('forSale').exists().isBoolean(),
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

            const createdListing = await propertyListings.create(data)

            return res.status(200).json(queryResult(true, 'Request Processed Successfully', createdListing));

        }
        catch (err) {
            console.log(err);
            return res.status(500).json(queryResult(false, err.message));
        }
    });

router.put('/:listingUUID', [
    body('isAvailable').optional().isBoolean(),
    body('location').optional().isString().notEmpty(),
    body('area').optional().isString().notEmpty(),
    body('forRent').optional().isBoolean(),
    body('forSale').optional().isBoolean(),
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
                raw: true,
                include: [UserProfile]
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

module.exports = router;