const mongoose = require('mongoose');
const Category = require('../models/Category'); 


async function seedCategories() {
    const categories = [
        { categoryName: 'Concerts' },
        { categoryName: 'Conferences' },
        { categoryName: 'Workshops' },
        { categoryName: 'Seminar' },
        { categoryName: 'Fairs' },
        { categoryName: 'Theater' },
        { categoryName: 'Cinema' },
        { categoryName: 'Art and Culture' },
        { categoryName: 'Food Events' },
        { categoryName: 'Children Events' },
        { categoryName: 'Outdoor Activities' },
        { categoryName: 'Networking' },
        { categoryName: 'Virtual Events' },

    ];

    try {
        await Category.insertMany(categories);
        console.log('Categories created successfully');
    } catch (error) {
        console.error('Error creating categories', error);
    } finally {
        mongoose.connection.close(); 
    }
};

module.exports = { seedCategories };