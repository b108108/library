const LIST = 'list';
const LINEID = 'lineId'; 

function GetType() {
	getJSON('http://rygorh.dev.monterosa.co.uk/todo/types.php')
	.then(result => {
		let allId = [];
		result.forEach(function(item, index){
			allId[item.id] = item.name;
			typeSelect = add_element.type;
			let newOption = new Option(item.name, item.id);
		    typeSelect.options[typeSelect.options.length]=newOption;
		});
		localStorage.setItem(LINEID, JSON.stringify(allId));
		Show();
	})
	.catch(result => {  
		console.log(result);
	});
}

function GetTasks() {
	getJSON('http://rygorh.dev.monterosa.co.uk/todo/items.php')
	.then(result => {		
		CheckTasks(result)
	    let allRecords = GetStorage(LIST);
	    if (allRecords.length!=0) {
	    	result.forEach(function(item){
	    		allRecords.push(item);
	    	});
	    }
	    else {
	    	allRecords=result;
	    }
		allRecords = SortBy(allRecords, "expires_at");
						
		localStorage.setItem(LIST, JSON.stringify(allRecords));
		Show();		
	})
	.catch(result => {  
		console.log(result);
	});
}

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      let status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
};

function Open(){
	GetTasks();		
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
    let task = ((document.getElementById('task').value.toString())=="") ? "None" : document.getElementById('task').value.toString();
    let expires = ((document.getElementById('expires').value)=="") ? ShowDate(0) : ShowDate(document.getElementById('expires').value);
    let status = ((document.getElementById('status').value)=="Active") ? false : true;
    let type = ShowType(parseInt(document.getElementById('type').value));
    let currentDate = ShowDate(0);
    
    let line = {"task":task,
    			"expires_at":expires,    			
    			"created_at":currentDate,
    			"done":status,
    			"type":type
    };
 
    let allRecords = GetStorage(LIST);
    
    allRecords.unshift(line);
    if (allRecords.length > 1) {
	    allRecords = SortBy(allRecords, "expires_at");
    }    
    localStorage.setItem(LIST, JSON.stringify(allRecords));
    Show();
}

function RemoveAll(){
 	localStorage.removeItem(LIST);
    location.reload();
    Show();
 }
 
function Remove() {
    let id = this.getAttribute('id');
    let allRecords = GetStorage (LIST);
    if (allRecords.length==1) {
    	RemoveAll();
    }
    else {
    	allRecords.splice(id, 1);
    	localStorage.setItem(LIST, JSON.stringify(allRecords));
        Show();
    }
} 

function GetStorage(name){
    let allRecords = new Array;
    let jsonList = localStorage.getItem(name);
    if (jsonList !== null) {
        allRecords = JSON.parse(jsonList); 
    }
    return allRecords;
}

function SortBy(records, element) {
	records.sort(function (a, b) {
	  if (a[element] < b[element]) {
	    return 1;
	  }
	  if (a[element] > b[element]) {
	    return -1;
	  }
	  return 0;
	});	
	return records;
}

function Checked() {
    let id = this.getAttribute('id');
    let allRecords = GetStorage (LIST);
    allRecords[id].done = (allRecords[id].done==true) ? false : true;
    localStorage.setItem(LIST, JSON.stringify(allRecords)); 
    Show();
}

function ShowDate(element){
	if((new Date(element)!='Invalid Date') && (element!=0)){
		date = new Date(element);
	}
	else {
		date = new Date();
	}
	let time = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+"|"+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds();
	return time;
}

function ShowType(element){
	let allId = GetStorage(LINEID);
	let result = (allId[element]) ? allId[element] : "Undefined";	
	return result;
}

function Show() {
    let allRecords = GetStorage(LIST);
	
	if (allRecords.length!=0) { 
	 	let html = '<table class="showlist"><tr><th> Date expires </th><th> Task </th><th> Date created </th><th> Status </th><th> Type </th><th></th></tr>';
			
	    allRecords.forEach(function(item, index){
	    	if (item.done==true) {
	    		html += '<tr class="hide">';
	    	}
	    	else {
	    		html += '<tr class="show">';
	    	}
	    	html += '<td>' + item.expires_at + '</td><td>' + item.task + '</td><td>' + item.created_at + '</td><td>';
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
	 
	    let buttons = document.getElementsByClassName('remove');
	    Array.apply(null, {length: buttons.length}).forEach(function(item,index){
	    	buttons[index].addEventListener('click', Remove);
	    });
	    
	    let checked = document.getElementsByClassName('status');    
	    Array.apply(null, {length: checked.length}).forEach(function(item,index){
	    	checked[index].addEventListener('click', Checked);
	    });
    }
}
