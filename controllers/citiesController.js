const City = require('../models/City');


const citiesController = {
    async getCities(req, res) {
        try {
            const cities = await City.find();
            res.status(200).json(cities);
        } catch (error) {
            console.error('Error getting cities:', error);
            res.status(500).json({ message: 'Error getting cities', error });
        }
    }

};

module.exports = citiesController;