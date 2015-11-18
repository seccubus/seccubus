/*
 * Copyright 2015 Frank Breedijk, Petr
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
steal("funcunit/qunit",
	"./seccubus_test.js",
	'./up_to_date_test.js',
	'./config_item_test.js',
	'./workspace_test.js',
	'./scan_test.js',
	'./finding_test.js',
	'./gui_state_test.js',
	'./scanner_test.js',
	'./history_test.js',
	'./run_test.js', 
	'./event_test.js', 
	'./notification_test.js',
	'./asset_test.js',
	'./schedule_test.js',
	'./issue_test.js'
);
