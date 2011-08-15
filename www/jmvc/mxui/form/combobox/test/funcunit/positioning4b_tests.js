module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning4b.html");
	}
})

/*
 *  4. Combobox positioning tests - Combobox appended to documentElement:
 *  
 *  4a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  4b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  4c Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  4d Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  4b Tests that if the element can be positioned with scrolling greater than min height, 
 *  the dropdown opens bellow with height equal the space available. 
 */
test("4b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.", function() {
	
	S("#combobox4b").exists();
	
	S("#combobox4b").visible();	
	
	var comboOffset = S("#combobox4b").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox4b").outerHeight(),
		windowHeight = S(S.window).height();
		
	S("#combobox4b").find("input[type=text]").click();
	
	S("#combobox4b_dropdown").visible();	
			
	// make sure the dropdown position is right	
	S("#combobox4b_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(comboBottom - dropTop) < 1;
	});
	
	// make sure dropdown height fits space available bellow
	S("#combobox4b_dropdown").outerHeight( function(outerHeight) {
		return Math.abs(outerHeight - windowHeight + comboBottom) < 1;
	} );
	
});


