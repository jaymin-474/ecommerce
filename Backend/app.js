const express = require('express')
const app = express()
const PORT = 8080
require('dotenv').config()
const connectDB = require('./DB/connectDB')
const cors = require('cors')
const morgan = require('morgan')
const routes = require('./routes/index')


// db
connectDB()
app.use(cors())
app.use(morgan('dev')) //  log HTTP requests in the console for debugging
app.use(express.json())
app.use(express.urlencoded({extended:true})) // ?


// routes
app.use(routes)

app.get("/",(req,res)=>{
    res.send("hello world!!")
})

app.listen(PORT,(req,res)=>{
    console.log(`server started at ${PORT}`)
})