var ConsoleInterface = {};



ConsoleInterface.output = function(pIterator){
	while(pIterator.hasNext()){
		var record = pIterator.next();
		console.log(tojson(record))
	}
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
		projection = projection || {};
		result = result.map(this.createMapFunc(projection));		
		return ConsoleInterface.output(util.makeAryIterator(result));
	},

	createFilterFunc: function (criterias){	
		function filterFun(item, index, ary, cris){
			if(cris === undefined)
				cris = criterias;
			for(var cri in cris){
				var temp = item;
				var opt = util.filters[cri];
				if(opt){
					return opt(temp, cris[cri], filterFun);
				}
				
				var value = cris[cri];
				if(cri.indexOf('.')==-1){
					var nextcri = "";
				}
				else{
					var nextcri = cri.substring(cri.indexOf('.')+1);
					var cri = cri.substring(0, cri.indexOf('.'));
				}
				
				if(nextcri === ""){
					if(temp.hasOwnProperty(cri)){
						temp = temp[cri];
						var result = util.compare(temp, value);
						if(Array.isArray(result) ? result.indexOf(0)>=0 : result==0)
							return true;
					}
					else if(Array.isArray(temp)){
						for(var i=0, l=temp.length; i<l; i++){
							if(temp[i].hasOwnProperty(cri)){
								var tt = temp[i][cri];
								var result = util.compare(tt, value);
								if(Array.isArray(result) ? result.indexOf(0)>=0 : result==0)
									return true;
							}
						}
					}
					return false;
				}
				else{
					if(temp.hasOwnProperty(cri)){
						temp = temp[cri];
						var ttt = {};
						ttt[nextcri] = value;
						if(filterFun(temp, index, ary, ttt))
							return true;
					}
					else if(Array.isArray(temp)){
						for(var i=0, l=temp.length; i<l; i++){
							if(temp[i].hasOwnProperty(cri)){
								var tt = temp[i][cri];
								var ttt = {};
								ttt[nextcri] = value;
								if(filterFun(tt, index, ary, ttt))
									return true;
							}
						}
					}
					return false;
				}
			}
			return true;
		}
		
		return filterFun;
	},
	
	createMapFunc : function(proj){
		function mapFun(obj, index, ary){
			var result;
			var keepId = (proj._id === 0 || proj._id === false) ? false : true;
			
			var bIncludeMap = false;
			for(var field in proj){
				if(field == "_id")
					continue;
				bIncludeMap = (proj[field] !== 0);
				break;
			}
					
			if(bIncludeMap){ // Map is for include
				result = {};
				if(keepId)
					result._id = obj._id;
				for(var field in proj){
					if(field == "_id")
						continue;
						
					var fs = field.split('.');
					var value = obj, newValue = result;
					for(var i=0,l=fs.length; i<l; i++){
						if(!value.hasOwnProperty(fs[i])){
							break;							
						}
						
						newValue = newValue[fs[i-1]] || result;
						if(!newValue.hasOwnProperty(fs[i]))
							newValue[fs[i]] = {};
						value = value[fs[i]];
					}
					
					if(i === l){
						newValue[fs[l-1]] = util.clone(value);
					}
				}
			}
			else{ //Map is for exclude
				result = util.clone(obj);
				for(var field in proj){
					var fs = field.split('.');
					var toDelProp, toDelObj = result;
					for(var i=0,l=fs.length; i<l; i++){
						toDelObj = toDelObj[fs[i-1]] || result;
						var temp = toDelObj[fs[i]];
						if(temp === undefined)
							break;
					}	
					delete toDelObj[fs[l-1]];			
				}
				if(!keepId){
					delete result._id;
				}
			}
			return result;	
		}
		return mapFun;
	},
};