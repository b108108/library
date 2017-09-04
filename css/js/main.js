function List (task, expires, created){
};

List.prototype = {
	constructor : List,
	task : 0,
    expires_at : 0,
    created_at : 0,
    done : 0,
    type : 0
};

function GetJson() {
	//var jsontask=[{"task":"Book tickets for the British Museum","expires_at":1504301416,"created_at":1504079132,"done":true,"type":3},{"task":"Feed the cat","expires_at":1504301451,"created_at":1504097680,"done":false,"type":1},{"task":"Book a Holiday","expires_at":1504301376,"created_at":1504209038,"done":false,"type":2},{"task":"Pay rent for the house","expires_at":1504301329,"created_at":1504128106,"done":false,"type":1},{"task":"Deploy QA and Staging envs","expires_at":1504301311,"created_at":1504105720,"done":false,"type":2},{"task":"Ask admin to set up Wi-Fi","expires_at":1504301356,"created_at":1504053221,"done":true,"type":2},{"task":"Cath up with the UX team","expires_at":1504301286,"created_at":1504122374,"done":false,"type":2},{"task":"Buy flight tickets","expires_at":1504301293,"created_at":1504092938,"done":false,"type":3},{"task":"Book a hotel in London","expires_at":1504301454,"created_at":1504190751,"done":true,"type":3},{"task":"Visit Queen Elizabeth II","expires_at":1504301438,"created_at":1504113142,"done":true,"type":3},{"task":"Clean up the house","expires_at":1504301436,"created_at":1504073014,"done":false,"type":1}];
	//var jsontype=[{"id":3,"name":"Travel"},{"id":1,"name":"Home"},{"id":2,"name":"Work"}];

	let urls = [
	  getJSON('http://rygorh.dev.monterosa.co.uk/todo/items.php'),
	  getJSON('http://rygorh.dev.monterosa.co.uk/todo/types.php')
	];
	
	Promise.all(urls)
		.then(results => {
			var allId = [];
			var jsontype = results[1];
			var jsontask = results[0];
			
			jsontype.forEach(function(item, index){
				allId[item.id] = item.name;		
			});
			localStorage.setItem(LINEID, JSON.stringify(allId));
		
			CheckTasks(jsontask);
		    var allRecords = GetStorage(LIST);
		    if (allRecords.length!=0) {
		    	jsontask.forEach(function(item){
		    		allRecords.push(item);
		    	});
		    }
		    else {
		    	allRecords=jsontask;
		    }
			allRecords = SortBy(allRecords, "expires_at");
							
			localStorage.setItem(LIST, JSON.stringify(allRecords));
			Show();
			return true;
		})
		.catch(result => {  
			console.log(result);
		});  
}

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
};

function CheckTasks(records){
	records.forEach(function(item, index){
		item.expires_at = ShowDate(item.expires_at);
		item.created_at = ShowDate(item.created_at);
		item.type = ShowType(item.type);
	});
 	return records;
}

function Add() {
    var task = ((document.getElementById('task').value.toString())=="") ? "None" : document.getElementById('task').value.toString();
    var expires = ((document.getElementById('expires').value)=="") ? ShowDate(0) : ShowDate(document.getElementById('expires').value);
    var status = (((document.getElementById('status').value)=="") || ((document.getElementById('status').value)=='false') || ((document.getElementById('status').value)=="0")) ? false : true;
    var type = ((document.getElementById('type').value)=="") ? 'Undefined' : ShowType(parseInt((document.getElementById('type').value)));
    var currentDate = ShowDate(0);
    
    var line = {"task":task,
    			"expires_at":expires,
    			"created_at":currentDate,
    			"done":status,
    			"type":type
    };
 
    var allRecords = GetStorage(LIST);
    allRecords.push(line);    
    if (allRecords.length > 1) {
	    if (allRecords[allRecords.length-1].expires_at<allRecords[allRecords.length-2].expires_at) {
	    	allRecords=SortBy(allRecords, "expires_at");
	    }
    }    
    localStorage.setItem(LIST, JSON.stringify(allRecords));
    Show();
    return false;
}

function RemoveAll(){
 	window.localStorage.clear();
    location.reload();
    Show();
    return false;
 }
 
function Remove() {
    var id = this.getAttribute('id');
    var allRecords = GetStorage (LIST);
    allRecords.splice(id, 1);
    localStorage.setItem(LIST, JSON.stringify(allRecords)); 
    Show(); 
    return false;
} 

function GetStorage(name){
    var allRecords = new Array;
    var jsonList = localStorage.getItem(name);
    if (jsonList !== null) {
        allRecords = JSON.parse(jsonList); 
    }
    return allRecords;
}

function SortBy(records, element) {
	records.sort(function (a, b) {
	  if (a[element] > b[element]) {
	    return 1;
	  }
	  if (a[element] < b[element]) {
	    return -1;
	  }
	  return 0;
	});	
	return records;
}

function Checked() {
    var id = this.getAttribute('id');
    var allRecords = GetStorage (LIST);
    allRecords[id].done = (allRecords[id].done==true) ? false : true;
    localStorage.setItem(LIST, JSON.stringify(allRecords)); 
    Show(); 
    return false;
}

function ShowDate(element){
	if(new Date(element)!='Invalid Date'){
		date = new Date(element);
	}
	else {
		date = new Date(Date.now());
	}
	var time = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+"|"+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds();
	return time;
}

function ShowType(element){
	var allId = GetStorage(LINEID);
	var result = (allId[element]) ? allId[element] : "Undefined";	
	return result;
}

function Show() {
    var allRecords = GetStorage(LIST);
	
	if (allRecords.length!=0) { 
	 	var html = '<table class="showlist"><tr><th> Date expires </th><th> Task </th><th> Date created </th><th> Status </th><th> Type </th><th></th></tr>';
			
	    allRecords.forEach(function(item, index){
			html += '<tr><td>' + item.expires_at + '</td><td>' + item.task + '</td><td>' + item.created_at + '</td><td>';
			if (item.done==true) {
				html+='<input type="checkbox" class="status" id ="'+index+'" name="done" value=index checked>';
			}
			else {
				html+='<input type="checkbox" class="status" id ="'+index+'" name="done" value=index>';
			}
			html += '</td><td>' + item.type + '</td><td><button class="remove" id="' + index  + '">x</button></td></tr>';
	    });    
	    html += '</table>'
	 
	    document.getElementById('show-records').innerHTML = html;
	 
	    var buttons = document.getElementsByClassName('remove');
	    Array.apply(null, {length: buttons.length}).forEach(function(item,index){
	    	buttons[index].addEventListener('click', Remove);
	    });
	    
	    var checked = document.getElementsByClassName('status');    
	    Array.apply(null, {length: checked.length}).forEach(function(item,index){
	    	checked[index].addEventListener('click', Checked);
	    });
    }
}

var LIST = 'list';
var LINEID = 'lineId'; 
document.getElementById('add').addEventListener('click', Add);
document.getElementById('open').addEventListener('click', GetJson);
document.getElementById('delete').addEventListener('click', RemoveAll);
Show();