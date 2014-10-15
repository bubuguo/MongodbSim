<html>
	<head>
		Mongodb Sim
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
			
			
		
			var Collection = function(){
				var _data = [];
				this._data = function(){
					return _data;
				};
			};
				
			
			Collection.prototype = {
				optionsFilter: {
					$gt: function(criteria, path){
						return function(record){
							var r = record;
							for(var i=0, l=path.length; i<l; i++){
								r = record[path[i]]
							}
							return util.compare(r, criteria) > 0;
						}
					},
					$lt: function(criteria, path){
						return function(record){
							var r = record;
							for(var i=0, l=path.length; i<l; i++){
								r = record[path[i]]
							}
							return util.compare(r, criteria) < 0;
						}
					},
					
					keyExist: function(key, path){
						return function(record){
							var r = record
							for(var i=0, l=path.length; i<l; i++){
								r = record[path[i]]
							}
							return r.hasOwnProperty(key);
						}
					}
				},
				/*
					processing: If in processing, do NOT send the data to UI
				*/
			
				find: function findWithCriterias(criterias, data, path, processing){
					criterias = criterias || {};
					data = data || this._data();
					path = path || [];
					
					if(data.length == 0)
						return data;
						
					if(typeof criterias !== "object"){ //The end node, can compare directly
						data = data.filter(function(record){
							var r = record;
							for(var i=0, l=path.length; i<l; i++){
								r = record[path[i]]
							}
							return r == criterias;
						});
					}
					else{
						for(var cri in criterias){
							var opt = this.optionsFilter[cri];
							if(opt){
								data = data.filter(opt(criterias[cri], path));
							}
							else if(cri == "$or"){
								data = findWithCriterias.call(this, criterias[cri][0], data, path, true).concat(findWithCriterias.call(this, criterias[cri][1], data, path, true));
							}
							else{
								data = data.filter(this.optionsFilter.keyExist(cri, path));
								path.push(cri);
								data = findWithCriterias.call(this, criterias[cri], data, path, true);
								path.pop();
							}
						}
					}
					
					if(processing)
						return data;
					else 
						return ConsoleInterface.output(data);
				},
				
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
			coll.save({"a":"1"} );
			coll.save({"a":"12"} );
			coll.save({"a":"123", b:{a:1, b:"2"}} );
			coll.save({"a":"123","_id":1, b:{a:1, b:"2"}} );
			
			console.log("test 1");
			coll.find();
			console.log("test 2");
			coll.find({a:{$gt: "1"}})
			console.log("test 3");
			coll.find({$or: [{a: "1"}, {a:"12"}]})
			
		</script>
	</body>
</html>
