const nodeEmailer = require('nodemailer');

const sendEmail = async(userEmail,productArray)=>{

    const transpoter = nodeEmailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.NODE_EMAIL,
            pass:process.env.NODE_PASS
        }
    });

    //prepare product details in text format
    const productDetails = productArray.map((product,index)=>{
        `${index +1}.Name: ${product.name}.Price: ${product.price} `
    })

    // setup mail content 
    const mailoptions = {
        from: process.env.NODE_EMAIL,
        to: userEmail,
        subject:"Your order details",
        text:`Thanks for your purchase ! \n\n here is ypur Prodect Details ${productDetails}`
    }
    try{

        await transpoter.sendMail(mailoptions);
    }catch(e){
        console.log(e);
    }
}

module.exports = sendEmail ;