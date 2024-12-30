const mongoose = require('mongoose');
const City = require('../models/City');

async function seedCities() {
    const cities = [
        { name: 'Madrid' },
        { name: 'Barcelona' },
        { name: 'Valencia' },
        { name: 'Sevilla' },
        { name: 'Zaragoza' },
        { name: 'Malaga' },
        { name: 'Murcia' },
        { name: 'Palma de Mallorca' },
        { name: 'Las Palmas de Gran Canaria' },
        { name: 'Bilbao' },
        { name: 'Alicante' },
        { name: 'Córdoba' },
        { name: 'Valladolid' },
        { name: 'Vigo' },
        { name: 'Gijón' },
        { name: 'Lleida' },
        { name: 'Granada' },
        { name: 'San Sebastián' },
        { name: 'Burgos' },
        { name: 'Almería' },
        { name: 'Salamanca' },
        { name: 'Huelva' },
        { name: 'Santiago de Compostela' },
        { name: 'Logroño' },
        { name: 'Tarragona' },
        { name: 'Toledo' },
        { name: 'Albacete' },
        { name: 'Cádiz' },
        { name: 'Mérida' },
        { name: 'Jaén' },
        { name: 'Lugo' },
        { name: 'Pontevedra' },
        { name: 'Ourense' },
        { name: 'Ceuta' },
        { name: 'Melilla' },
      
    ];

    try {
        await City.insertMany(cities);
        console.log('Cities created successfully');
    } catch (error) {
        console.error('Error creating cities:', error);
    } finally {
        mongoose.connection.close(); 
    }
}


module.exports = { seedCities };