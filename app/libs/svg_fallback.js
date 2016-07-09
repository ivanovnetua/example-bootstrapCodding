	//SVG Fallback
	//Documentation & Example: https://github.com/agragregra/
$(function(){Modernizr.svg||$("img[src*='svg']").attr("src",function(){return $(this).attr("src").replace(".svg",".png")})});