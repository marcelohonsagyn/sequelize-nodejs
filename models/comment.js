'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
   
    static associate(models) {
      models.Comment.belongsTo(models.Product, {as: 'product', foreignKey: 'productId'})
    }
  }
  Comment.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    productId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};