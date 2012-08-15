module("combobox3 test", { 
	setup: function(){
        S.open("//mxui/combobox/combobox3.html");
	}
})

/*
 *  Combobox positioning tests (scrollable containers):
 *  
 *  1. Combobox appended to <div> - <div> is not positioned
 *  2. Combobox appended to <div> - <div> is positioned (absolute)
 *  3. Combobox appended to <div> inside iframe - <div> is not positioned
 *  4. Combobox appended to <div> inside iframe - <div> is positioned (absolute)
 */

/*
 *  1. Tests if dropdown opens in the correct position if
 *  the combobox is appended to a scrollable non-positioned <div>.
 */
test("Test if dropdown opens in the correct position - combobox appended to scrollable non-positioned &lt;div&gt;.", function() {
	
	S("#combobox1").exists();
	
	var comboOffset = S("#combobox1").offset(),
		comboTop = comboOffset.top,
		dropOuterHeight = parseInt( S("#combobox1_dropdown_height").val(), 10 );
		
	S("#combobox1").find("input[type=text]").click();
	S("#combobox1_dropdown").visible();
	S("#combobox1_dropdown").offset( function(offset) {
		dropBottom = offset.top + dropOuterHeight;
		return dropBottom === comboTop;
	});
	
});

/*
 *  2. Tests if dropdown opens in the correct position if
 *  the combobox is appended to a scrollable positioned (absolute) <div>.
 */
test("Tests if dropdown opens in the correct position - combobox appended to scrollable positioned (absolute) &lt;div&gt;.", function() {
	
	S("#combobox2").exists();
	
	var comboOffset = S("#combobox2").offset(),
		comboTop = comboOffset.top,
		dropOuterHeight = parseInt( S("#combobox2_dropdown_height").val(), 10 );
		
	S("#combobox2").find("input[type=text]").click();
	S("#combobox2_dropdown").visible();
	S("#combobox2_dropdown").offset( function(offset) {
		dropBottom = offset.top + dropOuterHeight;
		return Math.abs(dropBottom - comboTop) < 1;
	});
	
});

/*
 *  3. Tests if dropdowns opens in correct position if 
 *  its appended to scrollable <div> inside iframe - <div> is not positioned
 */
test("Tests if dropdown opens in the correct position - combobox appended to scrollable &lt;div&gt; inside an iframe - &lt;div&gt; is not positioned.", function() {
	
	S("#combobox1", 0).exists();
	
	var comboOffset = S("#combobox1", 0).offset(),
		comboTop = comboOffset.top,
		dropOuterHeight = parseInt( S("#combobox1_dropdown_height", 0).val(), 10 );
		
	S("#combobox1", 0).find("input[type=text]").click();
	S("#combobox1_dropdown", 0).visible();
	S("#combobox1_dropdown", 0).offset( function(offset) {
		dropBottom = offset.top + dropOuterHeight;
		return dropBottom === comboTop;
	});
	
});

/*
 *  4. Tests if dropdowns opens in correct position if
 *  it appends to scrollable <div> and <div> is positioned (absolute).
 */
test("Tests if dropdown opens in the correct position - combobox appended to scrollable &lt;div&gt; inside an iframe - &lt;div&gt; is not positioned.", function() {
	
	S("#combobox2", 0).exists();
	
	var comboOffset = S("#combobox2", 0).offset(),
		comboTop = comboOffset.top,
		dropOuterHeight = parseInt( S("#combobox2_dropdown_height", 0).val(), 10 );
		
	S("#combobox2", 0).find("input[type=text]").click();
	S("#combobox2_dropdown", 0).visible();
	S("#combobox2_dropdown", 0).offset( function(offset) {
		dropBottom = offset.top + dropOuterHeight;
		return Math.abs(dropBottom - comboTop) < 1;
	});
	
});

