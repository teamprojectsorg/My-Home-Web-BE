require('dotenv').config();
const express = require('express')
const sequelize = require('./database/sequelize')

require('./models/PropertyListing')
require('./models/PropertyReview')
require('./models/PropertyImage')
require('./models/Relations')

const profileRouter = require('./routers/profileRouter')
const queryResult = require('./utils/queryResult')

const app = express()

app.set('etag', false);

app.use('/api/profile', profileRouter)

app.get('/api', (req, res) => {
    try {
        return res.status(200).json(queryResult(true, 'Server Is Online'));
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
})

app.listen(3000, async () => {
    console.log('Listening on port 80:3000')
    await sequelize.sync({ force: true })
    require('./models/PropertyListing').create()
})