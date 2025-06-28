const express = require('express')
const router = express.Router()
const userRoute = require('./user')
const { models } = require('mongoose')
const ProductRoute = require('./product')
const cartRoute = require('./cart')

//creates product
router.use('/user',userRoute)

//show all product
router.use('/userProduct',ProductRoute)

//show single product
router.use('/singleProduct',ProductRoute)

//update product
router.use('/update',ProductRoute)

//delete product
router.use('/delete',ProductRoute)

//cart details
router.use('/userCart',cartRoute)









module.exports = router