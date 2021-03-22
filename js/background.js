chrome.webRequest.onHeadersReceived.addListener(function(details) {
    flag = true;

	for (var i = 0; i < details.responseHeaders.length; ++i) {
       if (details.responseHeaders[i].name == 'X-XSS-Protection'){
            details.responseHeaders[i].value = 0;
			flag = false;
        } else if (details.responseHeaders[i].name == 'x-frame-options') {
			delete details.responseHeaders[i];
			i--;
		}
    }
	if (flag) {
		details.responseHeaders.push({name:"X-XSS-Protection",value: "0"});  		
	}
    return {responseHeaders: details.responseHeaders};
}, {urls: ["<all_urls>"],types: ["main_frame", "sub_frame"]}, ['blocking', 'responseHeaders']);


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message == "xss_payload") {
        if (localStorage.xss_payload) {
            //payload_update = eval('('+localStorage.xss_payload+')');      
            payload_update = localStorage.xss_payload;           
        }

        else {
            payload_update = [
                "alert(location.href)\/\/"
            ];
        }
        sendResponse(payload_update);
    }
});
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message == "wlist") {
        if (localStorage.wlist)
            wlist = localStorage.wlist;
        else
            wlist = false;
        sendResponse(wlist);
    } else  if (message == "switch") {
        if (localStorage.switch == "on")
            Tester_switch = true;
        else
            Tester_switch = false;
        sendResponse(localStorage.switch);
    } else if (message.indexOf("notify##") == 0) {
        var msg = message.split("##")[1];
        notify("XssSniper 发现DOM异常",msg);
        /*
        chrome.notifications.create('',{
        type: 'basic',
        title: "XSS Tester 发现DOM异常",
        message: msg,
        iconUrl: "img/js_error.png",
        },function(id){console.log(id);});*/
    } else if (message.indexOf("#!@") > -1) {
        var jsonp_arr = message.split("#!@");
        if (jsonp_arr.length == 3) {
            var jsonp = jsonp_arr[1];
            var loc = jsonp_arr[2];
            if (jsonp.indexOf("?") > -1) {
                var jsonp_par = jsonp.split("?")[1];
            } else {
                return;
            }
            if (jsonp_par.indexOf("&") > -1) {
                var jsonp_para_arr = jsonp_par.split("&");
                for(var jsonp_arr_n in jsonp_para_arr){
                    if (jsonp_para_arr[jsonp_arr_n].indexOf("=") > -1) {     
                        var jsonp_arr_k = jsonp_para_arr[jsonp_arr_n].split("=")[0];
                        var jsonp_arr_v = jsonp_para_arr[jsonp_arr_n].split("=")[1];
                    } else {
                        var jsonp_arr_v = jsonp_para_arr[jsonp_arr_n];
                    }
                    if (jsonp_arr_v && jsonp_arr_v.match(/^[a-z][\w]*/i) && loc.indexOf("="+jsonp_arr_v) > -1) {
                        //必须是以字母开头的参数，才可以作为函数的名字
                        //可能是SOME
                        console.log("mayb some:"+jsonp_arr_v);
                        notify("Jsonp可能存在SOME漏洞",jsonp);
                    }
                }

            } else if (jsonp_par.indexOf("=") > -1) {
                var jsonp_arr_k = jsonp_par.split("=")[0];
                var jsonp_arr_v = jsonp_par.split("=")[1];
                if (jsonp_arr_v && loc.indexOf(jsonp_arr_v) > -1) {
                    //可能是SOME
                    console.log("mayb some");
                    notify("Jsonp可能存在SOME漏洞",jsonp);
                    sendResponse("some:"+jsonp);
                }
            }
            //////////////
            jsonp = jsonp.replace(/\=/ig,"=<img>tsst");
            httpRequest(jsonp,function(s){
                if (s.indexOf("<img>tsst") > -1) {
                    notify("Jsonp可能存在XSS",jsonp);
                    sendResponse("xss:"+jsonp);
                }
            })
        }
    }
});

function notify(t,e) {
    chrome.notifications.create('',{
    type: 'basic',
    title: t,
    message: e,
    iconUrl: "img/js_error.png",
    },function(id){console.log(id);});    
}

function httpRequest(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(xhr.responseText);
        }
    }
    xhr.send();
}
/*
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message == "switch") {
        if (localStorage.switch == "on")
            Tester_switch = true;
        else
            Tester_switch = false;
        sendResponse(localStorage.switch);
    }
});
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message == "notify") {
        if (localStorage.switch == "on")
            Tester_switch = true;
        else
            Tester_switch = false;
        sendResponse(localStorage.switch);
    }
});*/