'use strict';

module.exports = function (Brand) {
  Brand.disableRemoteMethodByName('deleteById');
  Brand.disableRemoteMethodByName('prototype.updateAttributes');
  Brand.disableRemoteMethodByName('find');
};
