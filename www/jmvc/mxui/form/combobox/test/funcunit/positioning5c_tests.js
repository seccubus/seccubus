module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning5c.html");
	}
})

/*
 *  5. Combobox positioning tests - Combobox appended to positioned element:
 *  
 *  5a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  5b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  5c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.
 *  5d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  5e Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  5c Tests if the space above is greater than the space below and  dropdown fits in space above, 
 *  the dropdown opens above with full height.  
 */
test("5c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.", function() {
	
	S("#combobox5c").exists();
	
	S("#combobox5c").visible();	
	
	var comboOffset = S("#combobox5c").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox5c").outerHeight(),
		windowHeight = S(S.window).height();
		
	S("#combobox5c").find("input[type=text]").click();
	
	S("#combobox5c_dropdown").visible();
	
	// make sure dropdown's all items are visible
	S("#combobox5c_dropdown:contains('item0')").visible();		
	S("#combobox5c_dropdown:contains('item14')").visible();
			
	// make sure the dropdown position is right	
	S("#combobox5c_dropdown").offset( function(offset) {
		var dropTop = offset.top,
			dropOuterHeight = S("#combobox5c_dropdown").outerHeight();
			
		return Math.abs(dropTop + dropOuterHeight - comboTop) < 1;
	});
	
});


