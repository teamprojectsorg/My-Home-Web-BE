const express = require('express');
const supa = require('../supabase')
const { validate: validateUUID } = require('uuid')
const sharp = require('sharp')
const multer = require('multer')
const path = require("path");
const fs = require('fs')
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20971520 } }).single('image')
const { body, matchedData, validationResult } = require('express-validator')

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
            include: [userProfiles, propertyImages],
            attributes: { exclude: ['updatedAt', 'deletedAt'] }
        })

        let data = listing.map(listingModel => {
            property = listingModel.get({ plain: true })
            property.createdBy = {
                userId: property.UserProfile.userId,
                firstName: property.UserProfile.firstName,
                surname: property.UserProfile.surname
            }
            property.images = property.PropertyImages.map((image) => {
                return {
                    id: image.id,
                    url: image.url,
                    description: image.description
                }
            })
            delete property.UserProfile
            delete property.PropertyImages
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
            include: [userProfiles, propertyImages],
            attributes: { exclude: ['updatedAt', 'deletedAt'] }
        })

        let data = listing.map(listingModel => {
            property = listingModel.get({ plain: true })
            property.createdBy = {
                userId: property.UserProfile.userId,
                firstName: property.UserProfile.firstName,
                surname: property.UserProfile.surname
            }
            property.images = property.PropertyImages.map((image) => {
                return {
                    id: image.id,
                    url: image.url,
                    description: image.description
                }
            })
            delete property.UserProfile
            delete property.PropertyImages
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
            include: [userProfiles, propertyImages],
            attributes: { exclude: ['updatedAt', 'deletedAt'] }
        })

        if (!listing) return res.status(400).json(queryResult(false, 'Listing Not Found'));

        property = listing.get({ plain: true })

        property.createdBy = {
            userId: property.UserProfile.userId,
            firstName: property.UserProfile.firstName,
            surname: property.UserProfile.surname
        }
        property.images = property.PropertyImages.map((image) => {
            return {
                id: image.id,
                url: image.url,
                description: image.description
            }
        })
        delete property.UserProfile
        delete property.PropertyImages
        delete property.userId

        return res.status(200).json(queryResult(true, 'Request Processed Successfully', property));

    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
});

router.post('/', authMiddleware, [
    body('location').exists().isString().notEmpty(),
    body('area').exists().isString().notEmpty(),
    body('listingType').isString().notEmpty().isIn(['SALE', 'RENT', 'LEASE']),
    body('listingCategory').isString().notEmpty().isIn(['LAND', 'HOUSE']),
    body('squareFeet').if(body('listingCategory').isIn(['LAND'])).exists().isInt({ min: 0 }),
    body('bedrooms').if(body('listingCategory').isIn(['HOUSE'])).exists().isInt({ min: 0 }),
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
    body('images').isArray().custom((value) => {
        if (!Array.isArray(value)) {
            throw new Error('Images must be an array.');
        }
        if (value.some((item) => typeof item !== 'object')) {
            throw new Error('Each image must be an object.');
        }
        if (value.some((item) => !validateUUID(item.id))) {
            throw new Error('Each image must have an id.');
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
            data.isAvailable = true
            data.sold = false

            let images = [...data.images]
            delete data.images

            let createdListing = await propertyListings.create(data)
            createdListing = createdListing.get({ plain: true })
            delete createdListing.userId
            delete createdListing.deletedAt
            delete createdListing.updatedAt

            for (const image of images) {
                await propertyImages.update({ propertyListingId: createdListing.id, description: image.description }, { where: { id: image.id, propertyListingId: null } })
            }

            return res.status(200).json(queryResult(true, 'Request Processed Successfully'));

        }
        catch (err) {
            console.log(err);
            return res.status(500).json(queryResult(false, err.message));
        }
    });

// router.put('/', authMiddleware, [
//     body('location').optional().exists().isString().notEmpty(),
//     body('area').optional().exists().isString().notEmpty(),
//     body('listingType').optional().isString().notEmpty().isIn(['SALE', 'RENT', 'LEASE']),
//     body('listingCategory').optional().isString().notEmpty().isIn(['LAND', 'HOUSE']),
//     body('squareFeet').if(body('listingCategory').isIn(['LAND'])).exists().isInt({ min: 0 }),
//     body('bedrooms').if(body('listingCategory').isIn(['HOUSE'])).exists().isInt({ min: 0 }),
//     body('details').optional().exists().isString().notEmpty(),
//     body('highlights').optional().isArray().custom((value) => {
//         if (!Array.isArray(value)) {
//             throw new Error('Highlights must be an array.');
//         }
//         if (value.some((item) => typeof item !== 'string')) {
//             throw new Error('Each highlight must be a string.');
//         }
//         return true;
//     }),
//     body('images').optional().isArray().custom((value) => {
//         if (!Array.isArray(value)) {
//             throw new Error('Images must be an array.');
//         }
//         if (value.some((item) => typeof item !== 'object')) {
//             throw new Error('Each image must be an object.');
//         }
//         if (value.some((item) => !validateUUID(item.id))) {
//             throw new Error('Each image must have an id.');
//         }
//         return true;
//     }),
//     body('price').optional().exists().isInt({ min: 0 })
// ],
//     async (req, res) => {
//         try {

//             let result = validationResult(req)
//             if (!result.isEmpty()) {
//                 return res.status(400).json(queryResult(false, 'Invalid Input', result));
//             }

//             const data = matchedData(req)
//             data.userId = req.userId
//             data.isAvailable = true
//             data.sold = false

//             let images = [...data.images]
//             delete data.images



//             let createdListing = await propertyListings.create(data)
//             createdListing = createdListing.get({ plain: true })
//             delete createdListing.userId
//             delete createdListing.deletedAt
//             delete createdListing.updatedAt

//             for (const image of images) {
//                 await propertyImages.update({ propertyListingId: createdListing.id, description: image.description }, { where: { id: image.id } })
//             }

//             return res.status(200).json(queryResult(true, 'Request Processed Successfully', createdListing));

//         }
//         catch (err) {
//             console.log(err);
//             return res.status(500).json(queryResult(false, err.message));
//         }
//     });

// router.put('/:listingUUID', authMiddleware, [
//     body('isAvailable').optional().isBoolean(),
//     body('location').optional().isString().notEmpty(),
//     body('area').optional().isString().notEmpty(),
//     body('listingType').optional().isString().notEmpty().isIn(['SALE', 'RENT', 'LEASE']),
//     body('squareFeet').optional().isInt({ min: 0 }),
//     body('details').optional().isString().notEmpty(),
//     body('highlights').optional().isArray().custom((value) => {
//         if (!Array.isArray(value)) {
//             throw new Error('Highlights must be an array.');
//         }
//         if (value.some((item) => typeof item !== 'string')) {
//             throw new Error('Each highlight must be a string.');
//         }
//         return true;
//     }),
//     body('price').optional().isInt({ min: 0 }),
//     body('sold').optional().isBoolean(),
// ],
//     async (req, res) => {
//         try {

//             let result = validationResult(req)
//             if (!result.isEmpty()) {
//                 return res.status(400).json(queryResult(false, 'Invalid Input', result));
//             }

//             const data = matchedData(req)
//             if (Object.keys(data).length < 1) {
//                 return res.status(400).json(queryResult(false, 'No Listing Data Provided'));
//             }

//             let [affectedCount, listing] = await propertyListings.update(data, {
//                 where: {
//                     userId: req.userId,
//                     id: req.params.listingUUID
//                 },
//                 returning: true,
//                 raw: true
//             })

//             if (affectedCount < 1) {
//                 return res.status(400).json(queryResult(false, 'Listing Not Found Or Not Owned By User'));
//             }

//             let updatedListing = listing[0]
//             delete updatedListing.userId
//             delete updatedListing.deletedAt
//             delete updatedListing.updatedAt

//             return res.status(200).json(queryResult(true, 'Request Processed Successfully', updatedListing));

//         }
//         catch (err) {
//             console.log(err);
//             return res.status(500).json(queryResult(false, err.message));
//         }
//     });

router.post('/:listingUUID/thumbnail', authMiddleware, async (req, res) => {
    try {
        if (!validateUUID(req.params.listingUUID)) return res.status(400).json(queryResult(false, 'Invalid Listing ID'));

        upload(req, res, async (err) => {
            if (err) return res.status(500).json(queryResult(false, err.message));

            let file = req.file

            if (!file) return res.status(400).json(queryResult(false, 'No File Received'));

            const filetypes = /jpeg|jpg|png/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (!(extname && mimetype)) {
                fs.rmSync('uploads/' + file.filename)

                return res.status(400).json(queryResult(false, 'Only JPEG and PNG is supported'))
            }

            let compressed = await sharp('uploads/' + file.filename).toFormat("jpeg", { mozjpeg: true, quality: 60, force: true }).toBuffer()

            const { error } = await supa
                .storage
                .from('listingImages')
                .upload('public/' + req.params.listingUUID, compressed, {
                    contentType: 'image/jpg',
                })

            if (error) return res.status(500).json(queryResult(false, error.message));

            const url = supa
                .storage
                .from('listingImages')
                .getPublicUrl('public/' + req.params.listingUUID).data.publicUrl

            let [affectedCount, userProfile] = propertyListings.update({ thumbnail: url }, {
                where: {
                    id: req.params.listingUUID,
                    userId: req.userId
                },
                returning: true,
                raw: true
            })

            if (affectedCount < 1) return res.status(400).json(queryResult(false, 'Listing Not Found Or Not Owned By User'));

            fs.rmSync('uploads/' + file.filename)

            let updatedProfile = userProfile[0]
            delete updatedProfile.deletedAt
            delete updatedProfile.updatedAt

            fs.rmSync('uploads/' + file.filename)
            console.log('done with image', image.id)
            return res.status(200).json(queryResult(true, 'Request Processed Successfully', updatedProfile));
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
})

router.post('/image', authMiddleware, async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) return res.status(500).json(queryResult(false, err.message));

            let file = req.file

            if (!file) return res.status(400).json(queryResult(false, 'No File Received'));

            const filetypes = /jpeg|jpg|png/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (!(extname && mimetype)) {
                fs.rmSync('uploads/' + file.filename)

                return res.status(400).json(queryResult(false, 'Only JPEG and PNG is supported'))
            }

            let image = await propertyImages.create({ userId: req.userId }, { raw: true })

            let compressed = await sharp('uploads/' + file.filename).toFormat("jpeg", { mozjpeg: true, quality: 60, force: true }).toBuffer()

            const { error } = await supa
                .storage
                .from('listingImages')
                .upload('public/' + image.id, compressed, {
                    contentType: 'image/jpg',
                })

            if (error) return res.status(500).json(queryResult(false, error.message));

            const url = supa
                .storage
                .from('listingImages')
                .getPublicUrl('public/' + image.id).data.publicUrl

            await propertyImages.update({ url }, {
                where: {
                    id: image.id
                }
            })

            fs.rmSync('uploads/' + file.filename)
            console.log('done with image', image.id)

            return res.status(200).json(queryResult(true, 'Request Processed Successfully', { id: image.id }));
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
})

// router.delete('/:listingUUID/image/:imageUUID', authMiddleware, async (req, res) => {
//     try {

//         if (!validateUUID(req.params.listingUUID)) return res.status(400).json(queryResult(false, 'Invalid Listing ID'));
//         if (!validateUUID(req.params.imageUUID)) return res.status(400).json(queryResult(false, 'Invalid Image ID'));

//         let deleted = await propertyListings.destroy({ where: { userId: req.userId, id: req.params.imageUUID, propertyListingId: req.params.listingUUID } })

//         if (!deleted) return res.status(400).json(queryResult(false, 'Listing Or Image Not Found'));

//         return res.status(200).json(queryResult(true, 'Request Processed Successfully'));

//     }
//     catch (err) {
//         console.log(err);
//         return res.status(500).json(queryResult(false, err.message));
//     }
// });

// router.delete('/:listingUUID', authMiddleware, async (req, res) => {
//     try {

//         if (!validateUUID(req.params.listingUUID)) return res.status(400).json(queryResult(false, 'Invalid Listing ID'));

//         let deleted = await propertyListings.destroy({ where: { userId: req.userId, id: req.params.listingUUID } })

//         if (!deleted) return res.status(400).json(queryResult(false, 'Listing Not Found'));

//         return res.status(200).json(queryResult(true, 'Request Processed Successfully'));

//     }
//     catch (err) {
//         console.log(err);
//         return res.status(500).json(queryResult(false, err.message));
//     }
// });

module.exports = router;