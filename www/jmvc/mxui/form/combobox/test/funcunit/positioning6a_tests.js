module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning6a.html");
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
 *  6a Tests that if the element can be positioned without scrolling below target, 
 *  the dropdown opens bellow the target with full height.
 */
test("6a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.", function() {
	
	S("#combobox6a").exists();
	
	S("#combobox6a").visible();
	
	var comboOffset = S("#combobox6a").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox6a").outerHeight();
		
	S("#combobox6a").find("input[type=text]").click();
	
	S("#combobox6a_dropdown").visible();
	
	// make sure dropdown's all items are visible
	S("#combobox6a_dropdown:contains('item0')").visible();		
	S("#combobox6a_dropdown:contains('item5')").visible();
	
	// make sure the dropdown position is right
	S("#combobox6a_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(comboBottom - dropTop) < 1;
	});
	
});
