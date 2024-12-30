const User = require('../models/User');
const City = require('../models/City');
const Category = require('../models/Category');
const Group = require('../models/Group');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cloudinary = require("cloudinary").v2;
const Message = require('../models/Message');

cloudinary.config({
       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
       api_key: process.env.CLOUDINARY_API_KEY,
       api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userController = {
       // Register a new user
       async userRegister(req, res) {
              try {
                     const { firstname, lastname, email, password, city, dateOfBirth } = req.body;

                     // Check if user already exists
                     const userExists = await User.findOne({ email });
                     if (userExists) {
                            return res.status(409).json({ message: 'User already exists' });
                     }

                     // Validate city
                     const cityDocument = await City.findOne({ name: city });
                     if (!cityDocument) {
                            return res.status(400).json({ message: 'City does not exist' });
                     }


                     // Hash the password
                     const hashedPassword = await bcrypt.hash(password, 10);

                     // Create a new user
                     const newUser = new User({
                            firstname,
                            lastname,
                            email,
                            password: hashedPassword,
                            city: cityDocument._id,
                            dateOfBirth,
                            isAdministrator: false,
                            requiresOnboarding: true,
                            organizedEvents: 0,
                            joinedEvents: 0,
                            modifiedAt: new Date(),
                            createdAt: new Date(),
                            deletedAt: null,
                     });

                     await newUser.save();

                     res.status(201).json({ message: 'User created successfully' });
              } catch (error) {
                     console.error('Error during registration:', error);
                     res.status(500).json({ message: 'An error occurred during registration' });
              }
       },

       // User login
       async userLogin(req, res) {
              try {
                     const { email, password } = req.body;

                     const user = await User.findOne({ email });
                     if (!user) {
                            return res.status(401).json({ message: "Invalid credentials" });
                     }

                     // Compare passwords
                     const isPasswordValid = await bcrypt.compare(password, user.password);
                     if (!isPasswordValid) {
                            return res.status(401).json({ message: "Invalid credentials" });
                     }

                     // Generate JWT
                     const token = jwt.sign(
                            {
                                   email: user.email,
                                   firstname: user.firstname,
                                   isAdministrator: user.isAdministrator,
                                   requiresOnboarding: user.requiresOnboarding,
                                   userId: user._id,
                                   avatar: user.avatar,
                            },
                            process.env.SECRET
                     );

                     res.status(200).json({
                            token,
                            message: 'Login successful',
                            isAdministrator: user.isAdministrator,
                            requiresOnboarding: user.requiresOnboarding,
                     });
              } catch (error) {
                     console.error('Error during login:', error);
                     res.status(500).json({ message: 'An error occurred during login' });
              }
       },

       // Update user preferences
       async updateUserPreferences(req, res) {
              try {
                     const { city, categoryName, dayOfTheWeek } = req.body;
                     const userId = req.user.userId;

                     // Validate city
                     const cityDocument = await City.findOne({ name: city });
                     if (!cityDocument) {
                            return res.status(400).json({ message: 'City does not exist' });
                     }

                     // Validate category
                     const categoryDocument = await Category.findOne({ categoryName });
                     if (!categoryDocument) {
                            return res.status(400).json({ message: 'Preferred activity does not exist' });
                     }

                     // Update user
                     const updatedUser = await User.findByIdAndUpdate(
                            userId,
                            {
                                   preferedCity: cityDocument._id,
                                   categoryName: categoryDocument._id,
                                   dayOfTheWeek,
                                   requiresOnboarding: false,
                                   modifiedAt: new Date(),
                            },
                            { new: true }
                     );

                     if (!updatedUser) {
                            return res.status(404).json({ message: 'User not found' });
                     }

                     res.status(200).json({
                            message: 'User preferences updated successfully',
                            user: updatedUser,
                     });
              } catch (error) {
                     console.error('Error updating user preferences:', error);
                     res.status(500).json({ message: 'Error updating preferences' });
              }
       },

       // Get all users
       async getUsers(req, res) {
              try {
                     const users = await User.find()
                            .select('-password')
                            .populate('city categoryName preferedCity');

                     res.status(200).json({ users });
              } catch (error) {
                     console.error('Error fetching users:', error);
                     res.status(500).json({ message: 'Error fetching users' });
              }
       },

       // Get the logged-in user
       async getUser(req, res) {
              try {
                     const user = await User.findById(req.user.userId)
                            .select('-password')
                            .populate('city categoryName preferedCity');

                     if (!user) {
                            return res.status(404).json({ message: 'User not found' });
                     }

                     res.status(200).json({ user });
              } catch (error) {
                     console.error('Error fetching user:', error);
                     res.status(500).json({ message: 'Error fetching user' });
              }
       },

       // Forgot password
       async forgotPassword(req, res) {
              try {
                     const { email } = req.body;

                     const user = await User.findOne({ email });
                     if (!user) {
                            return res.status(404).json({ message: 'Email not found' });
                     }

                     const resetToken = jwt.sign(
                            { email: user.email },
                            process.env.SECRET,
                            { expiresIn: '1h' }
                     );

                     const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

                     const transporter = nodemailer.createTransport({
                            service: process.env.EMAIL_SERVICE,
                            auth: {
                                   user: process.env.EMAIL_USER,
                                   pass: process.env.EMAIL_PASS,
                            },
                     });

                     await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: 'Password Reset',
                            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
                     });

                     res.status(200).json({ message: 'Password reset link sent' });
              } catch (error) {
                     console.error('Error during password reset:', error);
                     res.status(500).json({ message: 'Error processing password reset' });
              }
       },
       async getUserById(req, res) {
              try {
                     const { userId } = req.params;// Obtener el userId desde los parámetros de la URL

                     // Buscar el usuario por ID
                     const user = await User.findById(userId);

                     if (!user) {
                            return res.status(404).json({ message: 'User not found' });
                     }

                     // Devolver todos los datos del usuario
                     return res.json(user);
              } catch (error) {
                     console.error('Error fetching user:', error);
                     res.status(500).json({ message: 'Internal server error' });
              }
       },


       async emailSubscribe(req, res) {
              const subscriptionHtml = `
                       <!DOCTYPE html>
                       <html lang="en">
                       <head>
                         <meta charset="UTF-8">
                         <meta name="viewport" content="width=device-width, initial-scale=1.0">
                         <title>Subscription Confirmation</title>
                       </head>
                       <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333;">
                         <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                           <div style="background-color: #4CAF50; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                             <h1 style="margin: 0;">Thank You for Subscribing!</h1>
                           </div>
                           <div style="padding: 20px; text-align: center;">
                             <h2 style="font-size: 1.5em; color: #4CAF50;">Welcome to Our Newsletter</h2>
                             <p style="font-size: 1em; line-height: 1.6; color: #555555;">Hi there,</p>
                             <p style="font-size: 1em; line-height: 1.6; color: #555555;">Thank you for subscribing to our newsletter! We're excited to have you on board. Now you're all set to receive the latest updates, tips, and exclusive offers directly in your inbox.</p>
                             
                             <p style="font-size: 1em; line-height: 1.6; color: #555555;">As a subscriber, here are a few things you can expect:</p>
                             <ul style="text-align: left; margin: 0 auto; max-width: 350px; padding-left: 15px; font-size: 1em; line-height: 1.6; color: #555555;">
                               <li><strong>Event Updates:</strong> Stay informed about the latest events happening on our website.</li>
                               <li><strong>Exclusive Tips:</strong> Receive useful tips on how to make the most of your events experience.</li>
                              
                             </ul>
                             
                             <p style="font-size: 1em; line-height: 1.6; color: #555555;">We want to make sure you don't miss out on anything important! So be sure to check your inbox regularly for exciting updates.</p>
                             
                             <div style="background-color: #f1f1f1; color: #333; text-align: center; padding: 20px; font-size: 0.9em; border-radius: 0 0 8px 8px;">
                               <p style="font-size: 0.9em;">If you have any questions or need help, feel free to <a href="mailto:support@example.com" style="color: #4CAF50;">contact us</a>.</p>
                               <p style="font-size: 0.9em;">You're receiving this email because you subscribed to our newsletter. If you'd like to unsubscribe, click <a href="#" style="color: #4CAF50;">here</a>.</p>
                             </div>
                           </div>
                         </div>
                       </body>
                       </html>
                     `;

              const transporter = nodemailer.createTransport({
                     service: process.env.EMAIL_SERVICE,
                     host: process.env.SMTP_HOST,
                     port: process.env.SMTP_PORT, // e.g., 587 for TLS, 465 for SSL, or 25 for non-secure
                     secure: process.env.SMTP_SECURE === 'true', // true for SSL, false for TLS
                     auth: {
                            user: process.env.EMAIL_USER, // Your email address
                            pass: process.env.EMAIL_PASS, // Your email password or app-specific password
                     },
              });

              try {
                     const { email } = req.body;


                     const user = await User.findOne({ email });

                     if (user && user.subscription === true) {

                            return res.status(400).json({ message: 'You are already subscribed to the newsletter' });
                     }


                     await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: 'Subscription Confirmation',
                            html: subscriptionHtml,
                     });


                     if (user) {
                            user.subscription = true;
                            await user.save();
                     }

                     res.status(200).json({ message: 'Subscription confirmation email sent' });

              } catch (error) {
                     console.error('Error during subscription request:', error);
                     res.status(500).json({ message: 'An error occurred while processing the subscription email' });
              }
       },


       async setAvatar(req, res) {
              try {
                     if (!req.file || !req.file.buffer) {
                            return res.status(400).json({ message: "No file uploaded" });
                     }

                     const { userId } = req.user; // Extract the userId from the token
                     const avatarBuffer = req.file.buffer;

                     // Upload avatar to Cloudinary
                     const result = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                   {
                                          folder: 'avatars',
                                          format: 'jpg',
                                          transformation: [{ width: 300, height: 300, crop: "fill" }],
                                   },
                                   (error, result) => {
                                          if (error) reject(error);
                                          else resolve(result);
                                   }
                            );
                            stream.end(avatarBuffer);
                     });

                     // Update the user's avatar URL in the database
                     const updatedUser = await User.findByIdAndUpdate(
                            userId,
                            { avatar: result.secure_url },
                            { new: true }
                     );

                     if (!updatedUser) {
                            return res.status(404).json({ message: "User not found" });
                     }

                     res.status(200).json({
                            message: "Avatar uploaded successfully",
                            avatarUrl: result.secure_url,
                            user: updatedUser,
                     });
              } catch (error) {
                     console.error("Error uploading avatar:", error);
                     res.status(500).json({ message: "Error uploading avatar" });
              }
       },


       async deleteUser(req, res) {
              try {

                     const { userId } = req.user;
                     console.log(userId);


                     const user = await User.findById(userId);

                     if (!user) {
                            return res.status(404).json({ message: 'User not found' });
                     }

                     console.log('User would be deleted:', userId);
                     console.log('Simulated removal from groups and events');

                     await User.findByIdAndDelete(userId);

                     const messages = await Message.find({ author: userId });
                     const messageIds = messages.map(msg => msg._id);



                     await Group.updateMany(
                            { messages: { $in: messageIds } },
                            { $pull: { messages: { $in: messageIds } } }
                     );
                     await Group.updateMany({ Users: userId }, { $pull: { Users: userId } });

                     return res.status(200).json({ message: 'User and associated data deleted successfully' });











              } catch (error) {
                     res.status(500).json({ message: "Error delete User" })
              }

       },
};

module.exports = userController;
