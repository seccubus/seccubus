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
