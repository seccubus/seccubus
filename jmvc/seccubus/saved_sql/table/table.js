/*
 * Copyright 2017 Petr, Frank Breedijk
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
 steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models',
	'seccubus/saved_sql/select'
).then( './views/init.ejs',
	'./views/error.ejs',
function($){
/**
 * @class Seccubus.custSQL.Table
 * @parent custSQL
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.SavedSql.Table',
{
	/*
	 * @attribute options
	 * Object holding all options
	 */
	defaults : {
		/*
		 * @attribute options.sql
		 * current SQL if "" is null
		 */
		 sql : "",
		 /*
		 * @attribute options.saveSQL
		 * function which using when save button clicked
		 */
		 saveSQL:function(sql,updateView){ console.warn('no save sql function given'); }

	}
},

/** @Prototype */
{
	init : function(){
		this.updateView();

	},
	'.edit click': function( el ){
		var as = el.closest('.asset').model();
		this.options.onEdit(as);
	},
	"#custsql_button click":function(el){
		this.updateView();
	},
	"#custsql_save click":function(el){
		this.options.sql = $('#custsql_input').val();
		var to = this;
		this.options.saveSQL(this.options.sql,function(){ to.updateView(); });
	},
	updateView : function() {
		this.options.sql = $('#custsql_input').val();
		if ( typeof this.options.sql === 'undefined' || this.options.sql === "" ) {
			this.element.html(
				this.view(
					'init',
					{ message : "no sql defined", sql: this.options.sql }
				)
			);
		} else {
            console.log(this);
			Seccubus.Models.CustSql.findAll(
				{ sql : this.options.sql },
				this.callback('dataReady')
			);
		}
		$("#sqls_selector").each(function(){
			$(this).seccubus_saved_sql_select({
				getItems:function(options){
					$('#sqls_selector').change(function(){
						if($(this).val() == "") return;
						var val = options[$(this).val()];
						$('#custsql_input').html(val);
					})
				}
			});
		});

	},
	dataReady : function(items) {
        console.log(items);
		var error = "";
		$.map(items,function(item){
			if(item.error) error = item.error;
		});

		if(!error && items.length>-1){
			head = items[0].attrs();
			delete head.error;
			head = $.map(head,function(val,key){ return key; }).reverse();
		}

		this.element.html(this.view(
			'init',
			{sql : this.options.sql, 'items':items, 'error':error }
		));
	},
	update : function(options){
		this._super(options);
		this.updateView();
	}
});

});
