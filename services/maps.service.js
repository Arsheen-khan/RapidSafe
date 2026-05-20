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

    let originCoords;
    if (typeof origin === 'object') {
        if (origin.lat != null && origin.lng != null) {
            originCoords = { lat: origin.lat, lng: origin.lng };
        } else if (origin.address) {
            originCoords = await getCoordinatesFromAddress(origin.address);
        }
    } else {
        originCoords = await getCoordinatesFromAddress(origin);
    }

    const destinationCoords =
        typeof destination === 'object'
            ? destination.lat != null && destination.lng != null
                ? { lat: destination.lat, lng: destination.lng }
                : await getCoordinatesFromAddress(destination.address)
            : await getCoordinatesFromAddress(destination);

    if (!originCoords || !destinationCoords) {
        throw new Error('Unable to resolve route coordinates');
    }

    const originPoint = `${originCoords.lng},${originCoords.lat}`;
    const destinationPoint = `${destinationCoords.lng},${destinationCoords.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${originPoint};${destinationPoint}?overview=false`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'SafeRide/1.0',
                Accept: 'application/json',
            },
        });

        const data = response.data;
        if (!data || !data.routes || data.routes.length === 0) {
            throw new Error('No routes found');
        }

        const route = data.routes[0];
        const leg = Array.isArray(route.legs) && route.legs.length > 0 ? route.legs[0] : null;
        const distanceValue = leg ? leg.distance : route.distance;
        const durationValue = leg ? leg.duration : route.duration;

        return {
            distance: { value: distanceValue },
            duration: { value: durationValue },
        };
    } catch (err) {
        console.error(err.response?.data || err.message);
        throw new Error('Unable to fetch distance and time');
    }
}

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