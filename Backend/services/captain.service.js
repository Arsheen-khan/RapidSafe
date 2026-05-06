const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
    firstname,
    lastname,
    email,
    password,
    ambulanceType,
    plate,
    capacity,
    driverLicense,
    hospitalName,
    hospitalAddress
}) => {

    if (!firstname || !email || !password || !ambulanceType || !plate || !capacity || !driverLicense || !hospitalName) {
        throw new Error('All fields are required');
    }

    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        ambulance: {
            type: ambulanceType,
            plate,
            capacity
        },
        driverLicense,
        hospital: {
            name: hospitalName,
            address: hospitalAddress
        }
    });

    return captain;
}