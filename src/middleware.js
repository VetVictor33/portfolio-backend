require('dotenv').config();

const validate = (req, res, next) => {
    const { password } = req.body;
    if (!password) return res.status(407).json({ message: "You need to inform a password to access this resource" });
    if (password !== process.env.PASSWORD) return res.status(401).json({ message: "Incorrect password" });

    return next()
}

module.exports = validate