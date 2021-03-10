const Router = require('express-promise-router');
const router = new Router();

const upload = require('./upload');


router.use('/upload', upload);

module.exports = router;
