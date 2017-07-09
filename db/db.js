'use strict';

const _ = require('lodash');
const debug = require('debug')('teamwork-analytics:db');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('./models/project');

class Db {

  constructor(connectionString) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(connectionString);
    }
  }

  updateProject(id, query) {
    debug('saving project %s', id);
    return Product.update({ id: id }, { $set: query }, {upsert: true}).exec()
    .catch((err) => {
      debug('Unable to update %s', err);
    });
  }

  saveProduct(product) {
    const data = _.cloneDeep(product);

    const now = new Date();
    const updateQuery = {
      $set: _.extend(data, {updatedAt: now}),
      $setOnInsert: {createdAt: now}
    };

    if (product.prices) {
      updateQuery['$push'] = {
        offers: {
          parentASIN: data.parentASIN,
          prices: _.clone(data.prices),
          ranks: _.clone(data.ranks),
          createdAt: now
        }
      };
      delete data.parentASIN;
      delete data.prices;
      delete data.ranks;
    }

    return Product.update({asin: data.asin}, updateQuery, {upsert: true}).exec();
  }

  saveProducts(products) {
    let data = _.cloneDeep(products);
    const now = new Date();
    data = _.map(data, o => _.extend({ updatedAt: now, createdAt: now }, o));
    return Product.collection.insertMany(data);
  }

  getProducts(query, limit) {
    return Product.find(query).limit(limit ? limit : 0).exec();
  }

  getProductsCsv() {
    return Product.findAndStreamCsv({});
  }

  purgeProductsCollection() {
    return Product.collection.remove();
  }

  saveProductsCsv() {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '');
      const csvPath = `downloads/products-${now}.csv`;
      const csvWriter = Product.findAndStreamCsv({}).pipe(fs.createWriteStream(csvPath));
      csvWriter.on('finish', () => {
        // TODO: Automate cleaning when the queues are all done
        resolve(csvPath);
      });
    });
  }

  updateProducts(query, update) {
    return Product.update(query, {$set: update}, {multi: true}).exec();
  }

  removeProductOffers(query) {
    query = query || {};
    query.$where = 'this.offers.length > 1';
    return this.getProducts(query).then(products => {
      if (products.length && products[0].offers.length > 1) {
        return Product.update({_id: products[0]._id}, {$set: {offers: [_.last(products[0].offers)]}}).exec();
      } else {
        return Promise.resolve();
      }
    });
  }

  reset() {
    return Promise.all([
      this.resetLinks()
    ]);
  }

}

module.exports = Db;
