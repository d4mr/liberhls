const { default: jwtVerify } = require('jose/jwt/verify');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/user');

module.exports = {
  validateToken: (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    let result;
    if (authorizationHeader) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
      const options = {
        expiresIn: '2d',
        issuer: 'https://pss.com'
      };
      try {
        // verify makes sure that the token hasn't expired and has been issued by us
        result = jwtVerify(token, JWT_SECRET, options);
      } catch (err) {
        if (err.code == "ERR_JWS_VERIFICATION_FAILED"){
          return next({
            status: 400,
            result: {
              error: "Invalid token"
            }
          })
        }
        else return next(err);
      }

      User.findById(result._id)
        .then(user=>{
          req.user = user;
          return next();
        })
        .catch((e)=>{
          return next(e);
        })

    } else {
      return next({ 
        error: `Authentication error. Token required.`,
        status: 401
      });
    }
  }
};