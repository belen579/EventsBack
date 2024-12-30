const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Blog = require('../models/Blog')

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


const blogController ={


    async blogRegister (req, res){
        const {title, description, user, photo}= req.body;

        let userDocument = await User.findOne({name:user._id});
        if(!userDocument){
            return res.status(400).json({message: 'User does not exist'});
        }


        const newBlog = new Blog({
            title,
            description,
            user: userDocument._id,
            photo
        });

        await newBlog.save();

        res.status(201).json(
            {
                status: 'success',
                message: 'Blog create sucessfully'
            }
        );




    },

    async getBlogs (req, res){
        try {
            const blogs = await Blog.find()
                  .populate('user', 'avatar firstname lastname '); // Populate the correct paths

            res.status(200).json({
                   status: "success",
                   blogs
            });
     } catch (error) {
            return res.status(500).json({
                   status: "error",
                   message: "Error fetching bkigs"
            });
     }
},


    };
    
    module.exports = blogController;
