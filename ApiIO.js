
(function(exports){
	var makeIterator = function (array){
		var nextIndex = 0;
		return {
			next: function(){
				return nextIndex < array.length ? array[nextIndex++] : null;
			},
			hasNext: function(){
				return nextIndex < array.length;
			}
		}
	};
	
	exports.output = function(item){
		if(item instanceof Array){
			return makeIterator(item);
		}
		else{
			return item;
		}
	}
})(
	typeof(exports) !== 'undefined' ? exports : window['ApiIO']={}
)
