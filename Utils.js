var util = {};

util.genObjectId = function(){
	return new ObjectId();
};
			
util.compare = function compare(obj1, obj2){

	//when try to compare a array element
	if(Array.isArray(obj1) && !Array.isArray(obj2)){
		var r=[];
		for(var i=0,l=obj1.length; i<l; i++){
			r[i] = compare(obj1[i], obj2);
		}
		return r;
	}
	
	if(obj2 instanceof RegExp){
		return obj2.test(obj1) ? 0 : NaN;
	}

	if(typeof obj1 !== typeof obj2)
		return NaN;
	
	switch(typeof obj1){
		case "number": 
		case "boolean": 
			return obj1==obj2?0:obj1<obj2?-1:1;
		case "string":
			return obj1.localeCompare(obj2);
		case "function": 
			return obj1==obj2?0:NaN;
		case "object":
			var i, count1=0, count2=0;
			for(i in obj1) count1++;
			for(i in obj2) count2++;
			if(count1 !== count2)
				return NaN;
							
			for(i in obj2){
				if(obj1[i]){
					var r = util.compare(obj1[i], obj2[i]);
					if(r !== 0)
						return r;
				}
				else{
					return NaN;
				}
			}
			return 0;
		default:
			return NaN;				
	}
};
util.filters = {
	$gt: function(item, criteria){
		var result = util.compare(item, criteria);						
		return Array.isArray(result) ? result.indexOf(1)>=0 : result==1;
	},
	$lt: function(item, criteria){
		var result = util.compare(item, criteria);						
		return Array.isArray(result) ? result.indexOf(-1)>=0 : result==-1;
	
	},
	
	$in: function(item, criteria){
		for(var i=0,l=criteria.length; i<l; i++){
			var result = util.compare(item, criteria[i]);
			if(Array.isArray(result) ? result.indexOf(0)>=0 : result==0){
				return true;
			}
		}
		return false;
	},

};

util.typeof = function(obj){
	var type = typeof obj;
	if(type !== "object"){
		return type;						
	}
	else if(obj instanceof RegExp){
		return "regexp";
	}
	else if(Array.isArray(obj)){
		return "array";
	}
	return type;
};