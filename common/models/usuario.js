'use strict';

module.exports = function (Usuario) {
  Usuario.disableRemoteMethodByName('deleteById');
  Usuario.disableRemoteMethodByName('prototype.updateAttributes');
};
