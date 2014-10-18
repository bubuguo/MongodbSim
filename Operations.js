var ConsoleInterface = {};



ConsoleInterface.output = function(pData){
	if(Array.isArray(pData)){
		pData.forEach(function(r){
			console.log(tojson(r));
		});
	}
	else{
		console.log(JSON.stringify(pData));
	}
	return pData;
}

var Collection = function(){
	var _data = [];
	this._data = function(){
		return _data;
	};
};
	

Collection.prototype = {				
	save: function(record){
		var data = this._data();
		if(record._id){
			for(var i=0, length=data.length; i<length; i++){
				if(data[i]._id == record._id){
					data.splice(i ,1);
					break;
				}
			}
		}
		else{
			record._id = util.genObjectId();
		}
		this._data().push(record);
	},
	
	remove: function(criterias){
		var records = this.find(criterias)
		var data = this._data();
		for(var i=records.length; i>=0; i--){
			data.indexOf(records[i]);
			data.splice(i, 1);					
		}
	},
	
	update: function(query, update, options){
		var records = this.find(criterias);
	},
	
	
	find: function(criterias, projection){
		//http://docs.mongodb.org/manual/reference/operator/query/
		var result = this._data().filter(this.createFilterFunc(criterias));
		if(projection)
			result = result.map(this.createMapFunc(projection));
		return ConsoleInterface.output(result);
	},

	createFilterFunc: function (criterias){	
		function filterFun(item, index, ary, cris){
			if(cris === undefined)
				cris = criterias;
			for(var cri in cris){
				var opt = util.filters[cri];
				if(opt){
					return opt(item, cris[cri]);
				}
				
				if(cri == "$or"){
					return(filterFun(item, index, ary, cris[cri][0]) || filterFun(item, index, ary, cris[cri][1]));
				}
				
				var fields = cri.split('.');
				for(var i=0,l=fields.length; i<l; i++){
					if(!item.hasOwnProperty(cri))
						return false;
					item = item[cri];
				}
								
				if(util.typeof(cris[cri]) == "object"){
					if(!filterFun(item, index, ary, cris[cri]))
						return false;
				}
				else {
					var result = util.compare(item, cris[cri]);
					if(Array.isArray(result) ? result.indexOf(0)<0 : result!==0)
						return false;
				}
			};
			
			return true;
		}
		
		return filterFun;
	},
	
	createMapFunc : function(proj){
		function mapFun(obj, index, ary){
			var result = {};
			var _id = proj._id;
			if(_id === undefined)
				result._id = obj._id;
			var bIncludeMap = false;
			for(var field in proj){
				if(field == "_id")
					continue;
				bIncludeMap = (proj[field] !== 0);
				break;
			}
			
			if(bIncludeMap){ // Map is for include
				for(var field in proj){
					if(field == "_id")
						continue;
						
					var fs = field.split('.');
					var value = obj;
					for(var i=0,l=fs.length; i<l; i++){
						if(!value.hasOwnProperty(fs[i])){
							break;							
						}
						value = value[fs[i]];
					}
					
					if(i === l){
						var temp = result;
						for(var i=0,l=fs.length-1; i<l; i++){
							if(temp[fs[i]] === undefined){
								temp[fs[i]] = {};
							}
							temp = temp[fs[i]];
						} 
						temp[fs[i]] = value;
					}
				}
			}
			else{ //Map is for exclude
				for(var field in obj){
					
				}
			}
			
			return result;
			
		}
		return mapFun;
	},
};