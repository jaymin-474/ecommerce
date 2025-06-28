const express = require('express') // if use routes in default file then use app.get 
const {signUp, login} = require('../controller/user.controller')
const router = express.Router() // if you use routes in another files then use router. express.Router.get or post

// Signup route
router.post('/register',signUp)

// Login route
router.post('/login',login)

module.exports = router