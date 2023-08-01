const queryResult = require('../utils/queryResult')

function jsonErrorMiddleware(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error(err);
        return res.status(400).json(queryResult(false, err.message));
    }
    if (err) {
        console.log(err)
    }
    next();
}

module.exports = jsonErrorMiddleware