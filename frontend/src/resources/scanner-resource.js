import _module from './_module';

_module.factory('ScannerResource', [
  '$resource',
  function($resource) {
    return $resource('json/getScanners.pl');
  }
]);
