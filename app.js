// require('dotenv').config();
const express = require('express')
const compression = require('compression')
const cors = require('cors')
const supabase = require('./supabase')

const { syncModels } = require('./models/Relations')

const profileRouter = require('./routers/profileRouter')
const listingRouter = require('./routers/listingRouter')

const queryResult = require('./utils/queryResult')

const app = express()

app.set('etag', false);
app.use(cors({ origin: '*' }))
// app.use(compression());

app.use('/api/profile', profileRouter)
app.use('/api/listing', listingRouter)

app.get('/api', (req, res) => {
    try {
        return res.status(200).json(queryResult(true, 'Server Is Online'));
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(queryResult(false, err.message));
    }
})

app.get('/token', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'example@email.com',
        password: 'example-password',
    })
    return res.status(200).json(data)
})

syncModels().then(() => {
    app.listen(3000, () => {
        console.log('Listening on port 3000')
    })
})