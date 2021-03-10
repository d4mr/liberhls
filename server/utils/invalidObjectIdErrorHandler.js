module.exports = message => {
    return err => {
        if (err.name == "CastError") {
            throw {
                error: message,
                status: 401
            };
        } else throw err;
    }
}