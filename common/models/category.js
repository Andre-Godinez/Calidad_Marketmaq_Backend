'use strict';

module.exports = function (Category) {
  Category.disableRemoteMethodByName('deleteById');
  Category.disableRemoteMethodByName('prototype.updateAttributes');
};
