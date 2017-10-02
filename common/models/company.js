'use strict';

module.exports = function (Company) {
  Company.disableRemoteMethodByName('deleteById');
  Company.disableRemoteMethodByName('prototype.updateAttributes');
};
