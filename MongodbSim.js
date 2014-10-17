<html>
	<head>
		Mongodb Sim
	</head>
	
	<body>
	<!--
		function makeIterator(array){
			var nextIndex = 0;
			
			return {
			   next: function(){
				   return nextIndex < array.length ?
					   {value: array[nextIndex++], done: false} :
					   {done: true};
			   }
			}
		}
		-->
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
								r = record[path[i]];
							}
							var result = util.compare(r, criteria);						
							return Array.isArray(result) ? result.indexOf(1)>=0 : result==1;
						}
					},
					$lt: function(criteria, path){
						return function(record){
							var r = record;
							for(var i=0, l=path.length; i<l; i++){
								r = record[path[i]];
							}
							var result = util.compare(r, criteria);						
							return Array.isArray(result) ? result.indexOf(-1)>=0 : result==-1;
						}
					},
					
					$in: function(criteria, path){
						return function(record){
							var r = record;
							for(var i=0, l=path.length; i<l; i++){
								r = record[path[i]];
							}
							for(var i=0,l=criteria.length; i<l; i++){
								var result = util.compare(r, criteria[i]);
								if(Array.isArray(result) ? result.indexOf(0)>=0 : result==0){
									return true;
								}
							}
							return false;
						}
					},
					
					keyExist: function(key, path){
						return function(record){
							var r = record
							for(var i=0, l=path.length; i<l; i++){
								r = r[path[i]];
							}
							return r.hasOwnProperty(key);
						}
					}
				},
				
				/*
					processing: If in processing, do NOT send the data to UI
				*/
			
				find: function findWithCriterias(criterias, data, path, processing){
					if(criterias === undefined)
						criterias = {};
					data = data || this._data();
					path = path || [];
					
					if(data.length == 0)
						return data;
						
					if(typeof criterias !== "object" || Array.isArray(criterias) || criterias instanceof  RegExp){ //The end node, can compare directly
						data = data.filter(function(record){
							var r = record;
							for(var i=0, l=path.length; i<l; i++){
								r = r[path[i]]
							}
							if(Array.isArray(r)){								
								var result = util.compare(r, criterias);						
								return Array.isArray(result) ? result.indexOf(0)>=0 : result==0;
							}
							else{
								return r == criterias;
							}
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
				},
				
				
				
				
				find2: function(criterias){
					return ConsoleInterface.output(this._data().filter(this.createFilterFunc(criterias)));
				},

				createFilterFunc: function (criterias){	
					function tempfun(item, index, ary, cris){
						if(cris === undefined)
							cris = criterias;
						for(var cri in cris){
							var opt = util.filters[cri];
							if(opt){
								return opt(item, cris[cri]);
							}
							
							if(cri == "$or"){
								return(tempfun(item, index, ary, cris[cri][0]) || tempfun(item, index, ary, cris[cri][1]));
							}
							
							if(!item.hasOwnProperty(cri))
								return false;
									
							if(typeof cris[cri] == "object" && !(cris[cri] instanceof RegExp)){
								if(!tempfun(item[cri], index, ary, cris[cri]))
									return false;
							}
							else {
								var result = util.compare(item[cri], cris[cri]);
								if(Array.isArray(result) ? result.indexOf(0)<0 : result!==0)
									return false;
							}
						}
						
						return true;
					}
					
					return tempfun;
				},
				
			};
			
			
			var coll = new Collection();
			coll.save({"a":"1"} );
			coll.save({"a":"12"} );
			coll.save({"a":"123", b:{a:1, b:"2"}} );
			coll.save({"a":"1", b:{a:1, b:"2"}, c:[1,2,3]} );
			coll.save({"a":"123","_id":1, b:{a:1, b:"2"}} );
			coll.save({"a":"12", b:{c:{d:9}}} );
			
			console.log("test 1");
			coll.find2();
			console.log("test 2");
			coll.find2({a:{$gt: "1"}})
			console.log("test 3");
			coll.find2({$or: [{a: "1"}, {a:"12"}]})
			console.log("test 4");
			coll.find2({c: 3})
			console.log("test 5");
			coll.find2({c: [1,2,3]})
			console.log("test 6");
			coll.find2({c:{$gt: 0}})
			
		</script>
	</body>
</html>
