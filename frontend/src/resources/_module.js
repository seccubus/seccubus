import angular from 'angular';

var resourcesModule = angular.module('seccubus.resources', ['ngResource']);
export default resourcesModule;

resourcesModule.config(['$httpProvider', ($httpProvider) => {
  $httpProvider.interceptors.push(() => {
    return {
      request: requestInterceptor,
      response: responseInterceptor
    };
  });
}]);

function requestInterceptor(config) {
  if (config.method === 'POST') {
    Object.assign(config.headers, {
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    config.originalData = config.data;
    config.data = serializeData(config.data);
  }
  return config;
}

function responseInterceptor(response) {
  var config = response.config;
  if (config.method === 'POST') {
    let data = angular.isString(response.data)
      ? JSON.parse(response.data)
      : response.data;

    if (angular.isArray(data)) {
      if (data[0].error) {
        throw data[0].error;
      } else {
        response.data = data[0];
      }
    }
  }

  if (config.transformItem) {
    let data = angular.isString(response.data)
      ? JSON.parse(response.data)
      : response.data;

    if (angular.isArray(data)) {
      data.forEach((item, index) => {
        data[index] = config.transformItem(item);
      });
      response.data = data;
    } else if (angular.isObject(data)) {
      response.data = config.transformItem(data)
    }
  }

  return response;
}

// I serialize the given Object into a key-value pair string. This
// method expects an object and will default to the toString() method.
// --
// NOTE: This is an atered version of the jQuery.param() method which
// will serialize a data collection for Form posting.
// --
// https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
function serializeData(data) {
  // If this is not an object, defer to native stringification.
  if (!angular.isObject(data)) {
    return (data == null) ? "" : data.toString();
  }

  var buffer = [];

  // Serialize each key in the object.
  for (let name in data) {
      if (!data.hasOwnProperty(name)) {
        continue;
      }
      var value = data[name];
      buffer.push(
        encodeURIComponent(name) +
        "=" +
        encodeURIComponent((value == null) ? "" : value)
      );
  }

  // Serialize the buffer and clean it up for transportation.
  return buffer.join("&").replace(/%20/g, "+");
}
