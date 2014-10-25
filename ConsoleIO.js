
if(typeof require === "function"){
	var Types = require("./Types.js");
};

(function(exports, Types){
	exports.output = function(item){
		if(item instanceof Array){
			for(var i=0, l=item.length; i<l; i++){
				console.log(Types.tojson(item[i]));
			}
		}
		else{
			console.log(Types.tojson(item));
		}
	}
})(
	typeof(exports) !== 'undefined' ? exports : window['ConsoleIO']={},
	Types
)
