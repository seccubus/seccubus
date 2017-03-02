/*
 * Copyright 2017 Frank Breedijk, Petr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// steal model files

function base_url() {
	return "/";
} 
function api(url, method){
	method = method || 'GET';
	return method + " " + base_url() + url;
}

function create_api(url){
	return (function(attrs,success,failure) {
  		var re = new RegExp('\{(.*?)\}');
  		var m = re.exec(url);
  		while ( m ) {
  			url = url.replace(re,attrs[m[1]]);
  			m = re.exec(url)
  		}

	    return $.ajax({
            url: base_url() + url,
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(attrs),
            success : success,
            failure : failure
        })
	});
}

function update_api(url){
	return (function(id,attrs,success,failure) {
  		var re = new RegExp('\{(.*?)\}');
  		var m = re.exec(url);
  		while ( m ) {
  			url = url.replace(re,attrs[m[1]]);
  			m = re.exec(url)
  		}

	    return $.ajax({
            url: base_url() + url,
            type: 'PUT',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(attrs),
            success : success,
            failure : failure
        })
	});
}

function delete_api(url){
	return (function(id,attrs,success,failure) {
  		var re = new RegExp('\{(.*?)\}');
  		var m = re.exec(url);
  		while ( m ) {
  			url = url.replace(re,attrs[m[1]]);
  			m = re.exec(url)
  		}

	    return $.ajax({
            url: base_url() + url,
            type: 'DELETE',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(attrs),
            success : success,
            failure : failure
        })
	});
}


//$.ajaxPrefilter(function(options, orig, xhr ) {
//  if ( options.processData
//    && /^application\/json((\+|;).+)?$/i.test( options.contentType )
//    && /^(post|put|delete)$/i.test( options.type )
//  ) {       
//    options.data = JSON.stringify( orig.data );
//  }
//});

steal(
	'jquery/model', 
	'./up_to_date.js', 
	'./config_item.js',
	'./workspace.js',
	'./scan.js', 
	'./finding.js', 
	'./filter.js',
	'./status.js', 
	'./gui_state.js', 
	'./scanner.js', 
	'./history.js', 
	'./run.js',
	'./event.js',
	'./notification.js',
	'./asset.js',
	'./asset_host.js',
	'./asset2scan.js',
	'./custsql.js',
	'./savedsql.js', 
	'./issue.js',
	'./issuelink.js',
	'./severity.js'
)
