module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning4e.html");
	}
})

/*
 *  4. Combobox positioning tests - Combobox appended to documentElement:
 *  
 *  4a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  4b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  4c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.
 *  4d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  4e Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fit the space avaialble.
 */

/*
 *  4e Tests if the space above is less than the space below
 *  and the dropdown doesnt fit the space available
 *  the dropdown opens bellow to fit the space avaialble.
 */
test("4e Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble.", function() {
	
	S("#combobox4e").exists();
	
	S("#combobox4e").visible();	
	
	var comboOffset = S("#combobox4e").offset(),
		comboTop = comboOffset.top,
		comboOuterHeight = S("#combobox4e").outerHeight(),
		comboBottom = comboTop + comboOuterHeight,
		windowHeight = S(S.window).height();
		
	S("#combobox4e").find("input[type=text]").click();
	
	S("#combobox4e_dropdown").visible();
			
	// make sure the dropdown position is right	
	S("#combobox4e_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(dropTop - comboBottom) < 1;
	});
	
	S("#combobox4e_dropdown").outerHeight( function(outerHeight) {
		return Math.abs(windowHeight - comboBottom - outerHeight) < 1;
	});	
	
});


