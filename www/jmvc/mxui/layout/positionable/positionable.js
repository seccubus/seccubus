steal.plugins('jquery/controller').then(function($){
    
	
	$.Controller("Mxui.Layout.Positionable",
    {
		listensTo : ["show",'move'],
		iframe: false,
		keep : false //keeps it where it belongs
    },
    {
       /**
        * 
        * @param {Object} element
        * @param {Object} options
        * 		my
        *       at
        *       of
        */
	   init : function(element, options){
           this.element.css("position","absolute");
           if(!this.options.keep){
		   	this.element[0].parentNode.removeChild(this.element[0])
            document.body.appendChild(this.element[0]);
		   }
       },
       show : function(el, ev, position){
		   this.move.apply(this, arguments)
           //clicks elsewhere should hide
       },
	   move : function(el, ev, positionFrom){
   			
			var options  = $.extend({},this.options);
			    options.of= positionFrom || options.of;
			if(!options.of)	return;
			var target = $( options.of ),
				collision = ( options.collision || "flip" ).split( " " ),
				offset = options.offset ? options.offset.split( " " ) : [ 0, 0 ],
				targetWidth,
				targetHeight,
				basePosition;
		
			if ( options.of.nodeType === 9 ) {
				targetWidth = target.width();
				targetHeight = target.height();
				basePosition = { top: 0, left: 0 };
			} else if ( options.of.scrollTo && options.of.document ) {
				targetWidth = target.width();
				targetHeight = target.height();
				basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
			} else if ( options.of.preventDefault ) {
				// force left top to allow flipping
				options.at = "left top";
				targetWidth = targetHeight = 0;
				basePosition = { top: options.of.pageY, left: options.of.pageX };
			} else if (options.of.top){
				options.at = "left top";
				targetWidth = targetHeight = 0;
				basePosition = { top: options.of.top, left: options.of.left };
				
			}else {
				targetWidth = target.outerWidth();
				targetHeight = target.outerHeight();
				if(false){
					var to = target.offset();
					
					var eo =this.element.parent().children(":first").offset();
					
					basePosition = {
						left: to.left - eo.left,
						top: to.top -eo.top
					}
				}else{
					basePosition = target.offset();
				}
				
			}
		
			// force my and at to have valid horizontal and veritcal positions
			// if a value is missing or invalid, it will be converted to center 
			$.each( [ "my", "at" ], function() {
				var pos = ( options[this] || "" ).split( " " );
				if ( pos.length === 1) {
					pos = horizontalPositions.test( pos[0] ) ?
						pos.concat( [verticalDefault] ) :
						verticalPositions.test( pos[0] ) ?
							[ horizontalDefault ].concat( pos ) :
							[ horizontalDefault, verticalDefault ];
				}
				pos[ 0 ] = horizontalPositions.test( pos[0] ) ? pos[ 0 ] : horizontalDefault;
				pos[ 1 ] = verticalPositions.test( pos[1] ) ? pos[ 1 ] : verticalDefault;
				options[ this ] = pos;
			});
		
			// normalize collision option
			if ( collision.length === 1 ) {
				collision[ 1 ] = collision[ 0 ];
			}
		
			// normalize offset option
			offset[ 0 ] = parseInt( offset[0], 10 ) || 0;
			if ( offset.length === 1 ) {
				offset[ 1 ] = offset[ 0 ];
			}
			offset[ 1 ] = parseInt( offset[1], 10 ) || 0;
		
			if ( options.at[0] === "right" ) {
				basePosition.left += targetWidth;
			} else if (options.at[0] === horizontalDefault ) {
				basePosition.left += targetWidth / 2;
			}
		
			if ( options.at[1] === "bottom" ) {
				basePosition.top += targetHeight;
			} else if ( options.at[1] === verticalDefault ) {
				basePosition.top += targetHeight / 2;
			}
		
			basePosition.left += offset[ 0 ];
			basePosition.top += offset[ 1 ];
			
			
			var elem = this.element,
				elemWidth = elem.outerWidth(),
				elemHeight = elem.outerHeight(),
				position = $.extend( {}, basePosition ),
				over,
				myOffset,
				atOffset;

			if ( options.my[0] === "right" ) {
				position.left -= elemWidth;
			} else if ( options.my[0] === horizontalDefault ) {
				position.left -= elemWidth / 2;
			}
	
			if ( options.my[1] === "bottom" ) {
				position.top -= elemHeight;
			} else if ( options.my[1] === verticalDefault ) {
				position.top -= elemHeight / 2;
			}
	
			$.each( [ "left", "top" ], function( i, dir ) {
				if ( $.ui.position[ collision[i] ] ) {
					$.ui.position[ collision[i] ][ dir ]( position, {
						targetWidth: targetWidth,
						targetHeight: targetHeight,
						elemWidth: elemWidth,
						elemHeight: elemHeight,
						offset: offset,
						my: options.my,
						at: options.at
					});
				}
			});
	
			// if elem is hidden, show it before setting offset
			var visible = elem.is(":visible")
			if(!visible){
				elem.css("opacity", 0)
					.show()
				
			}
			elem.offset( $.extend( position, { using: options.using } ) )
			if(!visible){
				elem.css("opacity", 1)
					.hide();
			}
	   }
   })
   
   
   
/*
 * jQuery UI Position 1.8rc2
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Position
 */


$.ui = $.ui || {};

var horizontalPositions = /left|center|right/,
	horizontalDefault = "center",
	verticalPositions = /top|center|bottom/,
	verticalDefault = "center",
	_position = $.fn.position;

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var win = $( window ),
				over = position.left + data.elemWidth - win.width() - win.scrollLeft();
			position.left = over > 0 ? position.left - over : Math.max( 0, position.left );
		},
		top: function( position, data ) {
			var win = $( window ),
				over = position.top + data.elemHeight - win.height() - win.scrollTop();
			position.top = over > 0 ? position.top - over : Math.max( 0, position.top );
		}
	},

	flip: {
		left: function( position, data ) {
			if ( data.at[0] === "center" ) {
				return;
			}
			var win = $( window ),
				over = position.left + data.elemWidth - win.width() - win.scrollLeft(),
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				offset = -2 * data.offset[ 0 ];
			position.left += position.left < 0 ?
				myOffset + data.targetWidth + offset :
				over > 0 ?
					myOffset - data.targetWidth + offset :
					0;
		},
		top: function( position, data ) {
			if ( data.at[1] === "center" ) {
				return;
			}
			var win = $( window ),
				over = position.top + data.elemHeight - win.height() - win.scrollTop(),
				myOffset = data.my[ 1 ] === "top" ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					-data.targetHeight,
				offset = -2 * data.offset[ 1 ];
			position.top += position.top < 0 ?
				myOffset + data.targetHeight + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		}
	}
};


   
   
   
});


