const express = require('express')
const { Product } = require('../model/Product')
//const { }
const router = express.Router()
const {product, addProduct, singleProduct , updateProduct, deleteProduct} = require("../controller/product.controller")


// Task 1 -> see all the product
router.get('/products',product)

//Task 2 -> add product
router.post('/add-product',addProduct)

//Task 3 -> see single product
router.get('/product/:id', singleProduct) 

//Task 4 -> update product
router.put('/edit/:id', updateProduct)

//Task 4 -> delete product
router.delete('/edit/:id',deleteProduct)




module.exports = router;