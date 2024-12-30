const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');

const usersRouter = require('./routes/usersRouter');
const eventsRouter = require('./routes/eventsRouter');
const citiesRouter = require('./routes/citiesRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const groupRouter = require('./routes/groupRouter');
const photosRouter = require('./routes/photosRouter');
const blogRouter = require('./routes/blogsRouter');
const Message = require('./models/Message');
const Group = require('./models/Group');
const User = require('./models/User');
const groupController = require('./controllers/groupController');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://rojo-frontend.onrender.com'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }
});

// Socket.IO configuration
io.on('connection', (socket) => {
    // Join a group
    socket.on('joinGroup', async (groupId) => {
        socket.join(groupId);

        // Fetch chat history
        try {
            const group = await Group.findById(groupId)
                .populate({
                    path: 'messages',
                    populate: {
                        path: 'author',
                        select: 'firstname lastname',
                    },
                });

            if (group) {
                socket.emit('chatHistory', group.messages);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    });

    // Leave a group
    socket.on('leaveGroup', (groupId) => {
        socket.leave(groupId);
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ groupId, content, userId }, callback) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(groupId)) {
                return callback({ error: 'Invalid groupId.' });
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.log('Invalid userId:', userId);
                return callback({ error: 'Invalid userId.' });
            }

            // Create a new message
            const message = new Message({
                group: new mongoose.Types.ObjectId(groupId),
                author: new mongoose.Types.ObjectId(userId),
                content,
            });
            await message.save();

            // Populate the author details
            const populatedMessage = await Message.findById(message._id).populate('author', 'firstname lastname');

            // Update the group's message list
            await Group.findByIdAndUpdate(groupId, { $push: { messages: message._id } });

            // Emit the populated message to all users in the group
            io.to(groupId).emit('receiveMessage', {
                groupId,
                content: populatedMessage.content,
                author: populatedMessage.author,
                timestamp: populatedMessage.timestamp,
                sender: socket.id,
            });

            callback({ success: true });
        } catch (err) {
            console.error('Error sending message:', err);
            callback({ error: 'Internal server error.' });
        }
    });
});

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors({
    origin: ['http://localhost:5173', 'https://rojo-frontend.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

const upload = multer({ dest: 'uploads/' });

// MongoDB connection
const mongoDB = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_SERVER}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

async function main() {
    try {
        if (process.env.NODE_ENV !== 'test') {
            await mongoose.connect(mongoDB);
            console.log('Connected to MongoDB');
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
main();

// Routers
app.use('/', usersRouter);
app.use('/events', eventsRouter);
app.use('/cities', citiesRouter);
app.use('/categories', categoriesRouter);
app.use('/groups', groupRouter);
app.use('/photos', photosRouter);
app.use('/forgotpassword', usersRouter);
app.use('/blogs', blogRouter);

const port = process.env.PORT ||  3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Uncomment the cron job if needed
// cron.schedule('*/2 * * * *', () => {
//   console.log('Executing user grouping task every 2 minutes...');
//   groupController.create();
// });

// Uncomment the cron job if needed
// cron.schedule('*/4 * * * *', () => {
//   console.log('Executing user grouping task every 4 minutes...');
//   groupController.eraseAll();
// });

module.exports = { app };
