steal('funcunit/qunit').then('wrap',function(){

module("mxui/layout/wrap");

test("margin moves", function(){
	$("<style>.wrap {margin: 20px}</style>").appendTo(document.head)
	
	
	$('#qunit-test-area').html("<textarea class='wrap'>Here is my textarea</textarea>"+
			"<input class='wrap' type='text'/>"+
			"<select  class='wrap'><option>1</option></select>"+
			"<button type='button'  class='wrap'>try me</button>"+
			"<img src='../../../jmvc/images/phui.png'  class='wrap'/>");
	
	
	$('#qunit-test-area').find('.wrap').mxui_layout_wrap().each(function(){
		equals($(this).css("marginLeft"), '20px', "margins are moved");
		equals($(this).children(':first').css("marginLeft"), '0px', "margins are moved")
	})
})

})

