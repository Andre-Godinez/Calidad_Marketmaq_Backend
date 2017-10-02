'use strict';

module.exports = function (Country) {
  Country.disableRemoteMethodByName('deleteById');
  Country.disableRemoteMethodByName('prototype.updateAttributes');
};
