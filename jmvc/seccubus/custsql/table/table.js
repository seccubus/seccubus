/*
 * Copyright 2013 Frank Breedijk
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
	'seccubus/custsql/select'
).then( './views/init.ejs',
	'./views/error.ejs',
function($){
/**
 * @class Seccubus.custSQL.Table
 * @parent custSQL
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.Custsql.Table',
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
		 saveSQL:function(sql,updateView){ $.warn('no save sql function given'); }

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
	"{Seccubus.Models.Asset} destroyed" : function(Asset, ev, asset) {
		this.updateView();
	},
	"{Seccubus.Models.Asset} created" : function(Asset, ev, asset){
		this.updateView();
	},
	"#custsql_button click":function(el){
		this.updateView();
	},
	"#custsql_save click":function(el){
		this.options.sql = $('#custsql_input').val();
		this.options.saveSQL(this.options.sql,this.options.updateView);
	},
	"{Seccubus.Models.Asset} updated" : function(Asset, ev, asset){
		asset.elements(this.element)
			.html(this.view('asset', asset) );
	},
	updateView : function() {
		this.options.sql = $('#custsql_input').val();
		if ( this.options.sql == "" ) {
			this.element.html(
				this.view(
					'init',
					{ message : "no sql defined", sql: this.options.sql }
				)
			);
		} else {
			Seccubus.Models.custsql.findAll(
				{ sql : this.options.sql },
				this.callback('dataReady')
			);
		}
		$("#sqls_selector").each(function(){ 
			$(this).seccubus_custsql_select({
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
		var error = "";
		var head = [];
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
			{sql : this.options.sql, 'items':items, 'error':error,'head':head }
		));
		if(head.length>-1){
			head.map(function(atName){
				items[0].removeAttr(atName);	
			});
			
		}
	},
	update : function(options){
		this._super(options);
		this.updateView(); 
	}
});

});