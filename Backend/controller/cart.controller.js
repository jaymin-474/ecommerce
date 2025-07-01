const jwt = require("jsonwebtoken");
const { Cart } = require("../model/Cart");
const { User } = require("../model/User");
const { Product } = require("../model/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendEmail = require('../utils/userEmail');

const cart = async (req, res) => {
  try {
    const { token } = req.headers;
    const decodedToken = jwt.verify(token, "supersecret");
    const user = await User.findOne({ email: decodedToken.email }).populate({
      path: "cart",
      populate: {
        path: "products",
        model: "Product",
      },
    });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    res.status(200).json({
      message: "cart created successfully!!",
      cart: user.cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
const addToCart = async (req, res) => {
    try {

        let { token } = req.headers
        let { productID, quantity } = req.body
        let decodedToken = jwt.verify(token, "supersecret")
        let user = await User.findOne({ email: decodedToken.email })

        if (!productID || !quantity) {
            return res.status(400).json({ message: "Product or Quantity is missing!!" })
        }

        if (user) {

            const product = await Product.findById(productID)
            const cart = await Cart.findOne({ _id: user.cart_id })

            if (cart) {
                const exits = cart.products.some((p) => {
                    p.product.toString() === productID.toString()
                })

                if (exits) {
                    return res.status(409).json({ message: "go to cart" })
                }

                cart.products.push({ product: productID, quantity })
                cart.total += product.price * quantity
                await cart.save()

            } else {
                const newCart = await Cart.create({
                    products: [
                        {
                            products: productID,
                            quantity: quantity
                        }
                    ],
                    total: product.price * quantity
                })
                user.cart = newCart._id
                await user.save()
            }

            return res.status(200).json({
                message: "Product added to cart"
            })

        }

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }



    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}
*/

// new logic for add to cart
const addToCart = async (req, res) => {
  try {
    const { quantity, productID } = req.body;
    if (!quantity || !productID) {
      return res
        .status(400)
        .json({ message: "Product Or Quantity is missing!!" });
    }

    const { token } = req.headers;
    let decodedToken = jwt.verify(token, "supersecret");

    let user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const product = await Product.findById(productID);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    let cart;

    if (user.cart) {
      cart = await Cart.findById(user.cart);

      //if cart is not found even though user has cart ID
      if (!cart) {
        cart = await Cart.create({
          products: [{ product: productID, quantity }],
          total: product.price * quantity,
        });

        user.cart = cart._id;
        await user.save();
      } else {
        const exists = cart.products.some(
          (p) => p.product.toString() === productID.toString()
        );

        if (exists) {
          return res.status(409).json({ message: "Go To Cart" });
        }
        cart.products.push({ product: productID, quantity });
        cart.total += product.price * quantity;
        await cart.save();
      }
    } else {
      // First Time Cart Creation

      cart = await Cart.create({
        products: [{ product: productID, quantity }],
        total: product.price * quantity,
      });

      user.cart = cart._id;
      await user.save();
    }

    res.status(200).json({ message: "Product Added to cart" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const { token } = req.headers;

    const decodedToken = jwt.verify(token, "supersecret");
    const user = await User.findOne({ email: decodedToken.email }).populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    });

    if (!user || !user.cart) {
      return res.status(400).json({ message: "Cart not found!!" });
    }

    const cart = user.cart;
    const item = cart.products.find(
      (p) => p.product._id.toString() === productId
    );

    if (!item) {
      return res.status(400).json({ message: "Product not found!!" });
    }

    const totalPrice = item.product.price;

    // action logic
    if (action === "increase") {
      item.quantity += 1;
      cart.total += totalPrice;
    } else if (action === "decrease") {
      if (item.quantity > 1) {
        item.quantity -= 1;
        cart.total -= totalPrice;
      } else {
        cart.total -= totalPrice;
        cart.products = cart.products.filter(
          (p) => p.product._id.toString() !== productId
        );
      }
    } else if (action === "remove") {
      cart.total -= totalPrice * item.quantity;
      cart.products = cart.products.filter(
        (p) => p.product._id.toString() !== productId
      );
    } else {
      return res.status(400).json({ message: "Invalid Action" });
    }

    await cart.save();
    return res.status(200).json({ message: "Cart Updated", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const payment = async (req, res) => {
  try {
    const { token } = req.headers;
    const decodedToken = jwt.verify(token, "supersecret");
    const user = await User.findOne({ email: decodedToken.email }).populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    });
    if (!user || !user.cart || user.cart.products.length === 0) {
      return res.status(400).json({
        message: "User or Cart not found!!",
      });
    }

    //payment
    const lineItems = user.cart.products.map((item) => {
      return {
        price_data: {
          currency: "INR",
          product_data: {
            name: item.product.name,
          },
          unit_amount: item.product.price * 100,
        },
        quantity: item.quantity,
      };
    })

    const currentUrl = process.env.CLIENT_URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types:["card"],
      line_items : lineItems,
      mode:"payment",
      success_url:`${currentUrl}/success`,
      cancel_url:`${currentUrl}/cancel`
    })

    // send mail to user 
    await sendEmail(
      user.email,
      user.cart.products.map((item)=>({
        name:item.product.name,
        price:item.product.price
      }))
    )

    //empty cart
    user.cart.products=[];
    user.cart.total=0;
    await user.cart.save();
    await user.save();
    res.status(200).json({
      message:"get the payment url",
      url:session.url
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { cart, addToCart, updateCart, payment };
