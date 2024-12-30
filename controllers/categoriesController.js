const Category = require('../models/Category');

const categoriesController = {
          async getCategories(req, res) {
                    try {
                              const categories = await Category.find();
                              res.status(200).json(categories);
                    } catch (error) {
                              console.error('Error getting categories:', error);
                              res.status(500).json({ message: 'Error getting categories', error });
                    }
          }

};

module.exports = categoriesController;
