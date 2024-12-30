const User = require('../models/User');
const Group = require('../models/Group');
const mongoose = require('mongoose');
async function saveGroups(eventGroups) {
    try {
        for (const group of eventGroups) {
            const newGroup = new Group({
                Users: group.users.map(userId => mongoose.Types.ObjectId(userId)),
                interestedEvents: group.eventId.map(eventId => mongoose.Types.ObjectId(eventId)),
                messages: [],
            });
            const savedGroup = await newGroup.save();

            // Update each user to reference this group
            for (const userId of group.users) {
                await User.findByIdAndUpdate(userId, {
                    $push: { groups: savedGroup._id },
                });
            }
        }
    } catch (error) {
        console.error('Error saving groups:', error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

const groupController = {

    async create(req, res) {
        try {
            console.log('+'.repeat(60));
            console.log(" > Starting group creation process");

            // Agrupar usuarios por eventos de interés
            const usersByInterest = await User.aggregate([
                {
                    $group: {
                        _id: "$interestedEvents",
                        users: { $push: "$_id" },
                    },
                },
                {
                    $match: {
                        _id: { $ne: null },
                    },
                },
            ]);

            const allUsers = [];
            usersByInterest.forEach(event => {
                allUsers.push(...event.users);
            });

            // Barajar usuarios
            shuffleArray(allUsers);

            // Dividir en 2 grupos
            const midIndex = Math.ceil(allUsers.length / 2);
            const group1Users = allUsers.slice(0, midIndex);
            const group2Users = allUsers.slice(midIndex);

            const twoGroups = [
                { eventId: "group1", users: group1Users },
                { eventId: "group2", users: group2Users },
            ];

            console.log(' > Saving groups to the database ');
            for (const group of twoGroups) {
                // Select a valid eventId from the first user's interestedEvents array
                const firstUser = group.users[0];
                const userDoc = await User.findById(firstUser);

                if (!userDoc || !userDoc.interestedEvents.length) {
                    console.error(`No interested events found for user: ${firstUser}`);
                    continue; // Skip group creation if no valid interested events
                }

                // Select the first eventId (or use a more advanced selection logic)
                const selectedEventId = userDoc.interestedEvents[0];

                // Validate eventId
                if (!mongoose.Types.ObjectId.isValid(selectedEventId)) {
                    console.error(`Invalid eventId: ${selectedEventId}`);
                    continue; // Skip group creation if eventId is invalid
                }

                const newGroup = new Group({
                    Users: group.users.map(userId => new mongoose.Types.ObjectId(userId)),
                    interestedEvents: [new mongoose.Types.ObjectId(selectedEventId)],
                });

                const savedGroup = await newGroup.save();

                // Update users to reference this group
                for (const userId of group.users) {
                    await User.findByIdAndUpdate(userId, { $push: { groups: savedGroup._id } });
                }

                console.log(`Group ${savedGroup._id} created successfully`);
            }




            console.log('-'.repeat(60));
            return { success: true, message: "Groups created successfully" };
        } catch (error) {
            console.error("Error during group creation:", error);
            return { success: false, error: error.message };
        }
    },

    async sendMessage(req, res) {
        try {
            const { groupId } = req.params;
            const { content } = req.body;
            const userId = req.user.userId;

            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json({ error: 'Group not found.' });
            }

            if (!group.Users.includes(userId)) {
                return res.status(403).json({ error: 'You are not part of this group.' });
            }

            const message = { sender: userId, content, timestamp: new Date() };
            group.messages.push(message);
            await group.save();

            res.status(200).json({ message: 'Message sent successfully.', message });
        } catch (error) {
            res.status(500).json({ error: 'Error sending message.' });
        }
    },

    async getMessages(req, res) {
        try {
            const { groupId } = req.params;
            const group = await Group.findById(groupId).populate('messages.sender', 'firstname lastname');

            if (!group) {
                return res.status(404).json({ error: 'Group not found.' });
            }

            res.status(200).json(group.messages);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching messages.' });
        }
    },

    async eraseAll(req, res) {
        try {
            console.log('+'.repeat(60));
            console.log("\n > Result of POST/GROUP/ERASEALL ");
            console.log(`\n > > All Groups will be erased from the DB \n`);
            console.log('+'.repeat(60));

            const result = await Group.deleteMany({});
            const text_back = result.deletedCount + ' documents deleted successfully.';
            console.log(`\n ${text_back} \n`);
            console.log('-'.repeat(60));

            res.status(200).json({ text_back });
        } catch (error) {
            console.error("Error deleting groups:", error);
            res.status(500).json({ message: 'Error deleting groups.', error });
        }
    },

    async showAll(req, res) {
        try {
            const groups = await Group.find().populate('Users', 'firstname lastname _id').exec();

            console.log('+'.repeat(60));
            console.log("\n > Result of GET/GROUP/SHOWALL ");
            console.log(`\n > > All Groups available will follow \n`);
            console.log('+'.repeat(60));

            groups.forEach((group, index) => {
                console.log(`Group ${index + 1}:`);
                console.log(`  Group ID: ${group._id}`);
                console.log(`  Interested Events: ${group.interestedEvents}`);
                console.log(`  Users:`);
                group.Users.forEach(user => {
                    console.log(`    - ${user._id}`);
                });
                console.log('-'.repeat(60));
            });

            res.status(200).json(groups);
        } catch (error) {
            console.error("Error fetching groups:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    async findGroup(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ error: "User ID is required." });
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);
            const groups = await Group.find({ Users: userObjectId });

            console.log('+'.repeat(60));
            console.log("\n > Result of POST/GROUP/FINDGROUP ");
            console.log(`\n > > All Groups of ${userObjectId} will follow \n`);
            console.log('+'.repeat(60));

            groups.forEach((group, index) => {
                console.log(`Group ${index + 1}:`);
                console.log(`  Group ID: ${group._id}`);
                console.log(`  Interested Events: ${group.interestedEvents}`);
                console.log(`  Users:`);
                group.Users.forEach(user => {
                    console.log(`    - ${user._id}`);
                });
                console.log('-'.repeat(60));
            });

            res.status(200).json({ groups });
        } catch (error) {
            console.error("Error finding groups for user:", error);
            return res.status(500).json({ error: "Internal Server Error." });
        }
    },

    async findGroupById(req, res) {
        try {
            const { groupId } = req.params;

            const group = await Group.findById(groupId)
                .populate({
                    path: 'messages',
                    populate: { path: 'author', select: 'firstname lastname' },
                });

            if (!group) {
                return res.status(404).json({ error: 'Group not found.' });
            }

            res.status(200).json(group);
        } catch (error) {
            console.error('Error finding group:', error);
            res.status(500).json({ error: 'Internal Server Error.' });
        }
    }
};

module.exports = groupController;