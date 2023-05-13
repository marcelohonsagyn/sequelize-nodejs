'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addConstraint(
      'Comments',{
        type: 'FOREIGN KEY',
        name: 'product-fk-in-comments',
        fields: ['productId'], 
        references: {
          table: 'Products',
          field: 'id'
        },
        onDelete: 'CASCADE'
      }
)},

  async down (queryInterface, Sequelize) {
    return queryInterface.removeConstraint(
      'Comments',
      'product-fk-in-comments'
    )
  }
};
