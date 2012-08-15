module("mxui/combobox");

test("Test hideItem(1)->select(2)->1 is visible again.", function() {
		var d = $("#ajax_demo_dropdown"),
			item1 = d.find(".item:eq(1)"),
			item2 = d.find(".item:eq(2)"),
			value1 = item1.match(/dropdown_(\d+)/)[1],
			value2 = item2.match(/dropdown_(\d+)/)[1];
		
		$("#ajax_demo").controller().hideItem( value1 );
		ok( /none/.test( item1.css("display") ), "Item correctly hidden.")
		$("#ajax_demo").controller().select( value2 );
		ok( /none/.test( item1.css("display") ), "Item correctly still hidden.")	
});