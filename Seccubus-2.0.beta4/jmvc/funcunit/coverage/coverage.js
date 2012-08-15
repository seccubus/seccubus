steal('funcunit/browser/resources/jquery.js', function(){
	var data;
	$.ajax({
		url: 'coverage.json',
		dataType: 'json',
		success: function(d){
			data = d;
			var tr = [], 
				stats;
			for(var file in data.files){
				tr.push("<tr>");
				stats = data.files[file].stats;
				tr.push("<td>", "<a class='file' href='#'>", file, "</a>", "</td>");
				tr.push("<td>", stats.lines, "</td>");
				tr.push("<td>", stats.linesRun, "</td>");
				tr.push("<td>", stats.pct, "</td>");
				tr.push("</tr>");
			}
			$('#coverage').append(tr.join(""))
		}
	})
	$('#coverage').delegate('.file', 'click', function(ev){
		$("#closeButton").show();
		var fileName = $(ev.target).text();
		$.ajax({
			url: '../../'+fileName,
			dataType: 'text',
			success: function(file){
				var fileArr = file.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").split("\n"),
					tr = [],
					lines;
				for(var i=0; i<fileArr.length; i++){
					lines = data.files[fileName].lines;
					tr.push("<tr>");
					if(lines[i+1] !== null){
						tr.push("<td>", lines[i+1], "</td>");
					} else {
						tr.push("<td>", "</td>");
					}
					tr.push("<td>", "<pre>", fileArr[i], "</pre>", "</td>", "</tr>");
				}
				$('#file').show().css("display", "block").html(tr.join(""))
			}
		})
	})
	$("#closeButton").bind("click", function(){
		$("#closeButton").hide();
		$('#file').hide();
	})
})
