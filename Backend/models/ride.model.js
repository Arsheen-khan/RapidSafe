const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'captain',
    },

    pickup: {
      address: {
        type: String,
        required: true,
      },

      lat: {
        type: Number,
        required: true,
      },

      lng: {
        type: Number,
        required: true,
      },
    },

   destination: {
  address: {
    type: String,
    default: "Hospital",
  },

  lat: {
    type: Number,
    required: true,
  },

  lng: {
    type: Number,
    required: true,
  },
},
    vehicleType: {
      type: String,
      enum: ['ambulance', 'auto', 'car', 'moto'],
      default: 'ambulance',
    },

    emergencyType: {
      type: String,
    },

    fare: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },

    duration: {
      type: Number,
    },

    distance: {
      type: Number,
    },

    paymentID: {
      type: String,
    },

    orderId: {
      type: String,
    },

    signature: {
      type: String,
    },

    otp: {
      type: String,
      select: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ride', rideSchema);