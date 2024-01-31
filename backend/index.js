const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { clearScreenDown } = require("readline");
const { CLIENT_RENEG_LIMIT } = require("tls");

app.use(express.json());
app.use(cors(
    {
        origin: ["https://mer-nweb.vercel.app"],
        methods: ["POST", "GET"],
        credentials: true
    }
));

// database connection with mongoDB
mongoose.connect("mongodb+srv://nguynin7233:0945070559@cluster0.qcdfjmu.mongodb.net/?retryWrites=true&w=majority")

// API creation

app.get("/", (req, res) => {
    res.send("Express App is Running")
})

// Image storage engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage })

// creating upload endpoint for image
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

//schema for creating products

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
        // id tăng lên 1 đơn vị sau mỗi lần add
    }
    else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    })
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name,
    })
})

//Create API for deleting Products

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for getting all products

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products)
})


//shema creating for user model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

//creating endpoint for registering the user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found same email address" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })

})


// creating endpoint for user login

app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    }
    else {
        res.json({ success: false, errors: "Wrong Email Id" })
    }
})



// creating endpoint for newcollection data
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})


// creating endpoint for popular in women section

app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4); //lay 4 tam anh
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})



app.get('/allproducts/:ObjectId', async (req, res) => {
    const ObjectId = req.params.ObjectId;
    const products = await Product.findById(ObjectId);
    console.log("Get Id Product");
    res.send(products)
})

app.put('/editproduct/:ObjectId', async (req, res) => {
    const ObjectId = req.params.ObjectId;
    const updatedProductDetails = req.body; // Assuming you send updated details in the request body
    const product = await Product.findByIdAndUpdate(ObjectId, updatedProductDetails, { new: true });
    console.log('Product is updated:');
    res.send(product)

})


// creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    console.log(auth - token);
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" })
    }
    else {
        try {
            const data = jwt.verify(token, 'secrect_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ erorrs: "Please authenticate using a valid token" })
        }
    }
}
// creating endpoint for adding products in cartdata
// app.post('/addtocart', fetchUser, async (req, res) => {
//     console.log("Added", req.body.itemId);
//     let userData = await Users.findOne({ _id: req.user.id });
//     userData.cartData[req.body.itemId] += 1;
//     await Users.findByIdAndUpdate({ _id: req.user.id }, { cartData: userData });
//     res.send("Added")

// })
// // creating ending for removing product in cartdata
// app.post('/removefromcart', fetchUser, async (req, res) => {
//     console.log("Removed", req.body.itemId);
//     let userData = await Users.findOne({ _id: req.user.id });
//     if (userData.cartData[req.body.itemId] > 0)
//         userData.cartData[req.body.itemId] -= 1;
//     await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData });
//     res.send("Removed")
// })



// Creating API for getting checkout products
const Payment = mongoose.model('Payment', {
    name: String,
    phoneNumber: String,
    address: String,
    paymentMethod: String,
    cartItems: [{ id: String, new_price: Number, image: String, category: String, date: Date }],
});

app.post('/api/Payment', async (req, res) => {
    console.log(req.body);
    try {
        const newPayment = new Payment({
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            cartItems: req.body.cartItems,
        });

        await newPayment.save();

        return res.status(201).json({ message: 'Payment successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});





app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port" + port);
    }
    else {
        console.log("Error : " + port);
    }
})




