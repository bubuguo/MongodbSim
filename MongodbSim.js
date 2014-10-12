<html>
	<head>
	</head>
	
	<body>
		
		<script>
			//TODO: Make it a input/output module in Node environment
			var ConsoleInterface = {};
			ConsoleInterface.output = function(pData){
				if(Array.isArray(pData)){
					pData.forEach(function(r){
						console.log(JSON.stringify(r))
					});
				}
				else{
					console.log(JSON.stringify(pData));
				}
				return pData;
			}
			
			var util = {};
			//Return a 16 bits id
			util.genUuid = function(){
				return Math.random()*10e16.toString();
			};
			
			//TODO: make it into record prototype?
			util.equal = function(obj1, obj2){
				if(typeof obj1 !== typeof obj2)
					return false;
				
				switch(typeof obj1){
					case "number": 
					case "boolean": 
						return obj1 == obj2;
					case "string":
						return obj1.substr() == obj2.substr();
					case "object":
						var i, count1=0, count2=0;
						for(i in obj1) count1++;
						for(i in obj2) count2++;
						if(count1 !== count2)
							return false;
							
						for(i in obj1){
							if(obj2[i]){
								if(!util.equal(obj1[i], obj2[i]))
									return false;
							}
							else{
								return false;
							}
						}
						return true;
					default:
						return false;				
				}
				
			};
			
			util.compare = function(obj1, obj2){
				if(typeof obj1 !== typeof obj2)
					return NaN;
				
				switch(typeof obj1){
					case "number": 
					case "boolean": 
						return obj1==obj2?0:obj1<obj2?-1:1;
					case "string":
						return obj1.localeCompare(obj2);
					case "object":
						var i, count1=0, count2=0;
						for(i in obj1) count1++;
						for(i in obj2) count2++;
//						if(count1 !== count2)
//							return NaN;
						
						
						for(i in obj2){
							if(obj1[i]){
								var r = util.compare(obj1[i], obj2[i]);
								if(r)
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
			
			
		
			var Collection = function(){
				var _data = [];
				this._data = function(){
					return _data;
				};
			};
				
			
			Collection.prototype = {
			
				//TODO: use this to replace find
				createFilterChain: function(filters, data, path) {				
					var funcs = {
						$gt: function(predicate){
							return function(item){
								return util.compare(item, predicate) > 0;
							}
						},
						$default: function(key, path, value){
							return function(item){
								var o = item;
								for(var i=0,l=path.length-1; i<l; i++){
									o = o[path[i]]
								}
								return (o.hasOwnProperty(key)) && (value?o[key]==value:true);
							}
						}
					};
					
					filters = filters || {};
					path = path || [];
					data = data || this._data();
					
					for(var filter in filters){
						var fun = funcs[filter];
						if(fun){
							data = data.filter(fun(filters[filter]));
						}
						else{
							path.push(filter);
							var bEnd = typeof filters[filter] !== "object";
							if(bEnd){
								data = data.filter(funcs.$default(filter, path, filters[filter]));
							}
							else{
								//data = data.filter(function(){return false});
								data = data.filter(funcs.$default(filter, path));
								data = this.createFilterChain(filters[filter], data, path);
							}
							path.pop();
						}
					}
					
					if(path.length == 0)
						return ConsoleInterface.output(data);
					else
						return data;
				},
			
				// has many defects need revise 
				find: function(filters){
					var funcs = {
						$gt: function(predicate){
							return function(item){
								return util.compare(item, predicate) > 0;
							}
						},
						$equal: function(predicate){
							return function(item){
								return util.compare(item, predicate) == 0;
							}
						}
					};
					
					var data = this._data();
					if(filters){
						for(var f in filters){
							var fun = funcs[f];
							if(fun){
								var filter = fun(filters[f]);
							}
							else{
								var criteria = {};
								criteria[f] = filters[f];
								var filter = funcs['$equal'](criteria);
							}
							
							data = data.filter(filter);
						}
					}
					return ConsoleInterface.output(data);
				},
				
				//TODO: Complex objects are always unequal, it will have performance issue
				/*distinct: function(){
					var distinctData = [];
					var data = this._data();
					data.forEach(function(pRecord){
						var sRecord = JSON.stringify(pRecord)
						for(var i=0, length=strfy.length; i<length; i++){
							//Seems JSON.stringify new String() every time so use substr to do the comparing
							if(sRecord.substr() == strfy[i].substr())
								break;
						}
						if(i == length){
							strfy.push(sRecord);
						}
					});
					return ConsoleInterface.output(strfy.map(function(item){return JSON.parse(item)}));
				},*/
				
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
						record._id = util.genUuid();
					}
					this._data().push(record);
				}
			};
			
			
			var coll = new Collection();
			coll.save({"a":"123"} );
			coll.save({"a":"123"} );
			coll.save({"a":"123","_id":1, b:{a:1, b:"2"}} );
			coll.save({"a":"123","_id":1, b:{a:1, b:"2"}} );
			
			console.log(util.equal({"a":"123","_id":1, b:{a:1, b:"2"}}, {"a":"123","_id":1, b:{a:1, b:"4"}}));
			
		</script>
	</body>
</html>
