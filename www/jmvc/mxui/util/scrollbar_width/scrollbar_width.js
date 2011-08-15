steal('jquery').then(function($){
		var div = $('<div id="out"><div style="height:200px;"></div></div>').css({
				position: "absolute",
				top: "0px",
				left: "0px",
				visibility: "hidden",
				width: "100px",
				height: "100px",
				overflow: "hidden"
			}).appendTo(document.body),
			inner = $(div[0].childNodes[0]),
			w1 = inner[0].offsetWidth,
			w2;

		div.css("overflow","scroll");
		//inner.css("width","100%"); //have to set this here for chrome
		var w2 = inner[0].offsetWidth;		
		if (w2 == w1) {
			inner.css("width", "100%"); //have to set this here for chrome
			w2 = inner[0].offsetWidth;
		}
		div.remove();
		(window.Mxui || (window.Mxui = {}) ).scrollbarWidth = w1 - w2;
})
