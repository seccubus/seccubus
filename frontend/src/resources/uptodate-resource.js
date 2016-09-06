import _module from './_module';

_module.factory('UpToDateResource', [
  '$resource',
  function($resource) {
    return $resource('json/UpToDate.pl');
  }
]);
