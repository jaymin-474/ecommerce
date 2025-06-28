const {Product} = require('../model/Product')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../model/User')


const product = async(req,res)=>{
    
    try{
        const products = await Product.find({})
        return res.status(200).json({
            message:"All Products",
            products:products
        })
    }catch(error){
        console.log(error)
        res.status(400).json({
            message :"Internal server error"})
    }
}

const addProduct = async(req,res)=>{
    try{
        let {name, price, image, description, brand, stock} = req.body
        let {token} = req.headers
        let decodedToken = jwt.verify(token,"supersecret");
        let user = await User.findOne({email:decodedToken.email});
        const product = await Product.create({
            name,
            price,
            image,
            description,
            stock,
            brand,
            user:user._id
        })
        return res.status(200).json({
            message:"product created successfully",
            product:product
            })
         
    }catch(error){
        console.log(error)
        res.status(400).json({
            message :"Internal server error"})
    }
}

const singleProduct = async(req,res)=>{
    try{
        let {id} = req.params;
        if(!id){
            return res.status(400).json({
                message:"Id not found"
            })
        }
        let {token} = req.headers;
        const decodedToken = jwt.verify(token,"supersecret")
        const user = await User.findOne({email:decodedToken.email});
        if(user){
            const product = await Product.findById(id);

            if(!product){
                res.status(400).json({
                    message:"Product not found"
                })
            }
            return res.status(200).json({
                message:"product found successfully",
                product:product
            })
        }
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"internal server error"
        })
    }
}

const updateProduct = async(req,res)=>{
    try{

        let {id} = req.params;
        let{name,price,image,description,stock,brand} = req.body;
        let {token} = req.headers;

        let decodedToken = jwt.verify(token,"supersecret");
        let user = await User.findOne({email:decodedToken.email});

        if(user){
            const productUpdated = await Product.findByIdAndUpdate(id,{
                name,
                price,
                brand,
                description,
                image,
                stock
            });  
            return res.status(200).json({
                message:"Product Updated Sucessfully",
                product : productUpdated
            })      
        }

    }catch(error){

        console.log(error);
        res.status(400).json({
            message:"Internal Server erorr"
        })
    }
}

const deleteProduct = async(req,res)=>{
    try{

        let {id} = req.params;
        let{name,price,image,description,stock,brand} = req.body;
        let {token} = req.headers;

        let decodedToken = jwt.verify(token,"supersecret");
        let user = await User.findOne({email:decodedToken.email});

        if(user){
            const productDeleted = await Product.findByIdAndDelete(id);  
            return res.status(200).json({
                message:"Product Deleted Sucessfully",
            })      
        }

    }catch(error){

        console.log(error);
        res.status(400).json({
            message:"Internal Server erorr"
        })
    }
}



module.exports = { product,addProduct,singleProduct,updateProduct,deleteProduct }



