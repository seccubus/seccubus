/*
 * jQuery YQL plugin
 *
 * Copyright (c) 2010 Gabriel Falcão
 * Copyright (c) 2010 Lincoln de Sousa
 * licensed under MIT license.
 *
 * http://github.com/gabrielfalcao/jquery-yql/raw/master/license.txt
 *
 * Version: 0.2.2
 */

(function( $ ) {
	$.extend({
		_prepareYQLQuery: function( query, params ) {
			$.each(
			params, function( key ) {
				var name = new RegExp("#\{" + key + "\}", "g");
				var value = $.trim(this);
				//if (!value.match(/^[0-9]+$/)) {
				//   value = '"' + value + '"';
				//}
				query = query.replace(name, value);
			});
			return query;
		},
		yql: function( query ) {
			var $self = this;
			var successCallback = null;
			var errorCallback = null;

			if ( typeof arguments[1] == 'object' ) {
				query = $self._prepareYQLQuery(query, arguments[1]);
				successCallback = arguments[2];
				errorCallback = arguments[3];
			} else if ( typeof arguments[1] == 'function' ) {
				successCallback = arguments[1];
				errorCallback = arguments[2];
			}

			var doAsynchronously = successCallback != null;
			var yqlJson = {
				url: "http://query.yahooapis.com/v1/public/yql",
				dataType: "jsonp",
				success: successCallback,
				async: doAsynchronously,
				data: {
					q: query,
					format: "json",
					env: 'store://datatables.org/alltableswithkeys',
					callback: "?"
				}
			}

			if ( errorCallback ) {
				yqlJson.error = errorCallback;
			}

			$.ajax(yqlJson);
			return $self.toReturn;
		}
	});
})(jQuery);