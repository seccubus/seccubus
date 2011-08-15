module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning4c.html");
	}
})

/*
 *  4. Combobox positioning tests - Combobox appended to documentElement:
 *  
 *  4a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  4b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  4c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.
 *  4d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  4e Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  4c Tests if the space above is greater than the space below and  dropdown fits in space above, 
 *  the dropdown opens above with full height.  
 */
test("4c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.", function() {
	
	S("#combobox4c").exists();
	
	S("#combobox4c").visible();	
	
	var comboOffset = S("#combobox4c").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox4c").outerHeight(),
		windowHeight = S(S.window).height();
		
	S("#combobox4c").find("input[type=text]").click();
	
	S("#combobox4c_dropdown").visible();
	
	// make sure dropdown's all items are visible
	S("#combobox4c_dropdown:contains('item0')").visible();		
	S("#combobox4c_dropdown:contains('item14')").visible();
			
	// make sure the dropdown position is right	
	S("#combobox4c_dropdown").offset( function(offset) {
		var dropTop = offset.top,
			dropOuterHeight = S("#combobox4c_dropdown").outerHeight();
			
		return Math.abs(dropTop + dropOuterHeight - comboTop) < 1;
	});
	
});


