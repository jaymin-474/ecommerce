const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {cart,addToCart,updateCart,payment} = require('../controller/cart.controller')

// route to get cart 
router.get('/cart',cart)

// route to get cart 
router.post('/addToCart',addToCart)

// route to get cart 
router.post('/updateCart',updateCart)

//stripe
router.post("/payment",payment)




module.exports = router;