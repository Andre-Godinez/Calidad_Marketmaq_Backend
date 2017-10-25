'use strict';

module.exports = function (Company) {
  Company.validatesUniquenessOf('urlPerfil', { message: 'La urlPerfil ya existe' });
  Company.disableRemoteMethodByName('deleteById');
  Company.disableRemoteMethodByName('prototype.updateAttributes');
};
