// import the jsonwebtoken

const jwt = require('jsonwebtoken');

const generate = (res, user_id) => {
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
});

    res.cookie('jwt', token,{
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 20 * 24 * 60 * 1000
    } )

}

module.exports = generate;