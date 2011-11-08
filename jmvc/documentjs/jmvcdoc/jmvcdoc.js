steal.loadedProductionCSS = true;
steal(
	'documentjs/jmvcdoc/content',
	'documentjs/jmvcdoc/nav',
	'documentjs/jmvcdoc/search',
	'jquery/dom/route',
	'steal/html'
	).then(function() {
	var pageNameArr = window.location.href.match(/docs\/(.*)\.html/),
		pageName = pageNameArr && pageNameArr[1];
		
		if ( pageName && location.hash == "" ) {
			window.location.hash = "&who=" + pageName
		}
	$.route.ready(false)
		(":who",{who: "index"})
		("/search/:search");
	
		
	$('#nav').jmvcdoc_nav();
	$("#doc").jmvcdoc_content({clientState : $.route.data});
	$("#search").jmvcdoc_search({clientState : $.route.data});
	//Doc.location = steal.root.join("jmvc/docs/")
	
	$.route.ready(false);
	if(! steal.isRhino ){
		Doc.load(function(){
			$.route.ready(true);
		});
	}
	
	
  })