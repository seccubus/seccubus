module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning5a.html");
	}
})

/*
 *  5. Combobox positioning tests - Combobox appended to positioned element:
 *  
 *  5a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  5b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  5c Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  5d Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  5a Tests that if the element can be positioned without scrolling below target, 
 *  the dropdown opens bellow the target with full height.
 */
test("5a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.", function() {
	
	S("#combobox5a").exists();
	
	S("#combobox5a").visible();
	
	var comboOffset = S("#combobox5a").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox5a").outerHeight();
		
	S("#combobox5a").find("input[type=text]").click();
	
	S("#combobox5a_dropdown").visible();
	
	// make sure dropdown's all items are visible
	S("#combobox5a_dropdown:contains('item0')").visible();		
	S("#combobox5a_dropdown:contains('item5')").visible();
	
	// make sure the dropdown position is right
	S("#combobox5a_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(comboBottom - dropTop) < 1;
	});
	
});
