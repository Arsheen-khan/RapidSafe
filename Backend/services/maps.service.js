const axios = require('axios');
const captainModel = require('../models/captain.model');

async function getCoordinatesFromAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'SafeRide/1.0',
            Accept: 'application/json',
        },
    });

    const data = response.data;
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Unable to fetch coordinates');
    }

    const location = data[0];
    return {
        ltd: parseFloat(location.lat),
        lng: parseFloat(location.lon),
    };
}

module.exports.getAddressCoordinate = async (address) => {
    if (!address) {
        throw new Error('Address is required');
    }

    return getCoordinatesFromAddress(address);
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {

        const originCoords =
            typeof origin === "object"
                ? `${origin.lng},${origin.lat}`
                : origin;

        const destinationCoords =
            typeof destination === "object"
                ? `${destination.lng},${destination.lat}`
                : destination;

        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${originCoords};${destinationCoords}` +
            `?overview=false`;

        console.log("OSRM URL:", url);

        const response = await axios.get(url);

        if (
            response.data &&
            response.data.routes &&
            response.data.routes.length > 0
        ) {

            const route = response.data.routes[0];

            return {
                distance: {
                    value: route.distance
                },

                duration: {
                    value: route.duration
                }
            };

        } else {
            throw new Error("No route found");
        }

    } catch (err) {

        console.log(err.message);

        throw new Error("Unable to fetch distance and time");
    }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(input)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'SafeRide/1.0',
                Accept: 'application/json',
            },
        });

        const suggestions = Array.isArray(response.data)
            ? response.data.map((item) => item.display_name).filter(Boolean)
            : [];

        return suggestions;
    } catch (err) {
        console.error(err.response?.data || err.message);
        throw new Error('Unable to fetch suggestions');
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {

    // radius in km


    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ ltd, lng ], radius / 6371 ]
            }
        }
    });

    return captains;


}