const httpStatus = require('http-status');
const mongoose = require("mongoose");
const APIError = require('../helpers/APIError');
const Schema = mongoose.Schema;

/**
 * Define the Slide schema
 */
const SlideSchema = new Schema({
  title: {
    content: String,
    fontColor: String,
    fontSize: String,
    fontWeight: String,
    fontStyle: String
  },
  description: {
    content: String,
    fontColor: String,
    fontSize: String,
    fontWeight: String,
    fontStyle: String
  },
  date: {
    content: String,
    fontColor: String,
    fontSize: String,
    fontWeight: String,
    fontStyle: String
  },
  time: {
    content: String,
    fontColor: String,
    fontSize: String,
    fontWeight: String,
    fontStyle: String
  },
  meta: {
    template: String,
    timeout: String,
    repeatable: Boolean,
    startDate: String,
    endDate: String
  },
  images: [
      {
          src: String
      }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Statics
 */
SlideSchema.statics = {
  /**
   * Get slide
   * @param {ObjectId} id - The objectId of slide.
   * @returns {Promise<Slide, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then(slide => {
        if (slide) {
          return slide;
        }
        const err = new APIError("No such slide exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List slides in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of slides to be skipped.
   * @param {number} limit - Limit number of slides to be returned.
   * @returns {Promise<Slide[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

module.exports = mongoose.model("Slide", SlideSchema);