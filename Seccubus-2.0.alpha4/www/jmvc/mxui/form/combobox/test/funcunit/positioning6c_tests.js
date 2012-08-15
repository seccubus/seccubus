module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning6c.html");
	}
})

/*
 *  6. Combobox positioning tests - Combobox appended to scrollable element:
 *  
 *  6a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  6b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  6c Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  6d Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  6c Tests if the space above is greater than the space below and  dropdown fits in space above, 
 *  the dropdown opens above with full height.  
 */
test("6c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.", function() {
	
	S("#combobox6c").exists();
	
	S("#combobox6c").visible();	
	
	var comboOffset = S("#combobox6c").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox6c").outerHeight(),
		windowHeight = S(S.window).height();
		
	S("#combobox6c").find("input[type=text]").click();
	
	S("#combobox6c_dropdown").visible();
	
	// make sure dropdown's all items are visible
	S("#combobox6c_dropdown:contains('item0')").visible();		
	S("#combobox6c_dropdown:contains('item11')").visible();
			
	// make sure the dropdown position is right	
	S("#combobox6c_dropdown").offset( function(offset) {
		var dropTop = offset.top,
			dropOuterHeight = S("#combobox6c_dropdown").outerHeight();
			
		return Math.abs(dropTop + dropOuterHeight - comboTop) < 1;
	});
	
});


