'use strict';

const { QueryInterface } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      return queryInterface.addConstraint(
        'Products',{
          type: 'FOREIGN KEY',
          name: 'userid-fk-in-products',
          fields: ['userId'], 
          references: {
            table: 'Users',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }
  )},

  async down (queryInterface, Sequelize) {
    return queryInterface.removeConstraint(
      'Products',
      'userid-fk-in-products'
    )
  }
};
