'use strict';

module.exports = function (Publication) {
  Publication.disableRemoteMethodByName('deleteById');
  Publication.disableRemoteMethodByName('prototype.updateAttributes');
  Publication.disableRemoteMethodByName('find');
};
