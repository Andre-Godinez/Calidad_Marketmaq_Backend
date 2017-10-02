'use strict';

module.exports = function (Rank) {
  Rank.disableRemoteMethodByName('prototype.updateAttributes');
};
