/*
 * Copyright 2014 Frank Breedijk, Petr
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
steal("funcunit", 
	'seccubus/up_to_date/list/list_test.js', 
	// 'seccubus/config_item/create/create_test.js', 
	'seccubus/config_item/list/list_test.js', 
	'seccubus/workspace/create/create_test.js', 
	'seccubus/workspace/table/table_test.js', 
	'seccubus/scan/create/create_test.js', 
	'seccubus/scan/table/table_test.js', 
	// 'seccubus/event/create/create_test.js', 
	'seccubus/event/select/select_test.js', 
	// 'seccubus/notification/create/create_test.js', 
	'seccubus/notification/table/table_test.js',
	'seccubus/asset/create/create_test.js',
	'seccubus/asset/table/table_test.js'
	)
 .then("./seccubus_test.js");
