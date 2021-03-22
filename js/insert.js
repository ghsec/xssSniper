//(function(){
/*
@ 0kee team 与 360src的合作版本
修复了开关不能控制jsonp的bug
增加了json警报的去重
增加攻击列表的功能

*/
	var wlist,Tester_switch,xss_payload;
	jsonp_xsstester();
	chrome.runtime.sendMessage("switch",function(s){
		if (s == "on") {	
			Tester_switch = true;
		}
		else {
			Tester_switch = false;
		}
	});

	chrome.runtime.sendMessage("wlist",function(s){
			wlist =  s;
	});
	chrome.runtime.sendMessage("xss_payload",function(s){
		if (s)	{
			//xss_payload =  s;  
			xss_payload = eval('('+s+')').payload;
			//console.log(xss_payload);
		}             
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
			//console.log("frame_err_report:"+ window['vultest_frameerr']);
		}
	});
	window.addEventListener('load', function(e) {setTimeout(function(){
	if (!Tester_switch)
		return;
	//检查是否在白名单里
	wlists = wlist.split("\n");
	var flag =false;
	for (wdomain in wlists) {
		//if (wlists[wdomain].indexOf("*") > -1) {
			if (wlists[wdomain] == "") {
				continue;
			}
			reg_wdomain = wlists[wdomain].replace(/\./g,"\\.");
			reg_wdomain = reg_wdomain.replace("*",".*");
			var reg_wdomain = new RegExp(reg_wdomain,"i");
			if (reg_wdomain.test(location.hostname)) {
				var flag =true;
				break;
			}
		//}
	}
	if (!flag) {
		return;
	}
	/*
	if (wlist.indexOf(location.hostname+'\n')<0)
		return;
	try{
		if (location.pathname != top.location.pathname)
			return;
	} catch(e) {return;};
*/
	if (top == this) {
		/*顶层网页执行内容*/
		echo_bannner();
		/*xss_payload = [
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
		function notify(msg) {
			chrome.runtime.sendMessage("notify##"+msg,function(s){
					//wlist =  s; 
			});			
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
					console.log("Testing URL:"+xss_testurl);
					xss_testfrm(xss_testurl);
					kv = vars.split("&");
				}
			}
		} else { /*只存在一个参数的情况*/
			for (var i=0;i < xss_payload.length;i++) {
				var xss_testurl = location.href + xss_payload[i];
				console.log("Testing URL:"+xss_testurl);
				xss_testfrm(xss_testurl);
			}
		}
		if (tagBall == "?") {
			for(var i=0;i < xss_payload.length;i++) {
				var xss_testurl = location.href + "#" + xss_payload[i];
				console.log("Testing URL:"+xss_testurl); 
				xss_testfrm(xss_testurl);		
			}
		}
		} else /*不存在参数的情况*/
			for(var i=0;i < xss_payload.length;i++) {
					var xss_testurl = location.href + tagBall + xss_payload[i];
					console.log("Testing URL:"+xss_testurl); 
					xss_testfrm(xss_testurl);		
			}

	} else {
			if (top.window['vultest_selferr'] != window['vultest_frameerr']) {
				//top.document.body.style.border = '14px solid #A500CC';
				console.warn("Catch Diff Error:"+location.href);
				console.log("frame_err_report:"+ window['vultest_frameerr']);
				notify(location.href+"\n"+window['vultest_frameerr']);
			}
			top.setTimeout(function(){
				try {top.document.body.removeChild(top.document.getElementById(unescape(location.href)));}
				catch (e) {};
					
			},4000);
			
	}
	},1000)});
//console.log(top == this && Tester_switch);
function jsonp_xsstester(){
	if (top == this ) {
		//if (wlist.indexOf(location.hostname+'\n')<0)  return;
		//console.log("x2");
		var jsonp = new Array();
		var Mu = new MutationObserver(function(d) {
		    d.forEach(function(f) {	
		        var e = f.addedNodes;
		        for (var g = 0; g < e.length; g++) {
		        	var j = e[g];
		        	//console.log(j.src);
		            if (j.src && j.tagName.toLowerCase() == "script") {
		            	if (j.src.indexOf("?") > 1) {
		            		if (r_log(j.src)) {
		            			var t = Date.parse(new Date())/1000 - r_log(j.src) 
		            			if (t < (3600*12)) { //时间间隔小于24小时就不报警
		            				return;
		            			}
		            		}
		            		//w_log(j.src);
		            		chrome.runtime.sendMessage("wlist",function(s){
								wlist =  s;
								if (wlist.indexOf(location.hostname+'\n')<0)
									return;
								//设置定时器，弹出告警，否则无法获取开关延迟
								setTimeout(function(){
									if (!Tester_switch) {
										return;
									}
									w_log(j.src);//在确认开关之后再写入
									chrome.runtime.sendMessage("jsonp#!@"+j.src+"#!@"+location.href,function(s){
										if (s.match(/^some\:/i))	{
				                			//jsonp.push(j.src);
				                			s = s.replace(/^some\:/,"");	
				                			console.info("JsonP BUG:"+s);
										} else if (s.match(/^xss\:/i)) {
											s = s.replace(/^xss\:/,"");	
											console.info("JsonP bug:"+s);
										}             
									});	
								},1000);
							});                	            		
		            	}
		            };
		        };
		    });
		});
		Mu.observe(document, {
		    subtree: true,
		    childList: true
		});
	}		
}
function echo_bannner() {
	console.log("%cXssSniper 正在运行","font-size:large");
	//console.log("%c3D Text"," text-shadow: 0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15);font-size:5em")
	console.log("%c", "padding:20px 300px;line-height:70px;background:url('http://p1.qhimg.com/d/inn/f8b85ba8/0kee_l4.png') no-repeat;");
}




function w_log(url){
	var timestamp = Date.parse(new Date())/1000;
	hash = md5(url);
	var log = new Object;
	//log.hash = timestamp;
	log[hash] = timestamp;
	localStorage.log = JSON.stringify(log)
}

function r_log(url) {
	if (!localStorage.log)
		return false;
	hash = md5(url);
	var log = JSON.parse(localStorage.log);
	if (log[hash]) {
		return log[hash];
	} else {
		return false;
	}
}


function md5(value_s) {
	var hex_chr = "0123456789abcdef"; 
	function rhex(num) 
	{ 
	str = ""; 
	for(j = 0; j <= 3; j++) 
	str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) + 
	hex_chr.charAt((num >> (j * 8)) & 0x0F); 
	return str; 
	} 
	function str2blks_MD5(str) 
	{ 
	nblk = ((str.length + 8) >> 6) + 1; 
	blks = new Array(nblk * 16); 
	for(i = 0; i < nblk * 16; i++) blks[i] = 0; 
	for(i = 0; i < str.length; i++) 
	blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8); 
	blks[i >> 2] |= 0x80 << ((i % 4) * 8); 
	blks[nblk * 16 - 2] = str.length * 8; 
	return blks; 
	} 
	function add(x, y) 
	{ 
	var lsw = (x & 0xFFFF) + (y & 0xFFFF); 
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16); 
	return (msw << 16) | (lsw & 0xFFFF); 
	} 
	function rol(num, cnt) 
	{ 
	return (num << cnt) | (num >>> (32 - cnt)); 
	} 
	function cmn(q, a, b, x, s, t) 
	{ 
	return add(rol(add(add(a, q), add(x, t)), s), b); 
	} 
	function ff(a, b, c, d, x, s, t) 
	{ 
	return cmn((b & c) | ((~b) & d), a, b, x, s, t); 
	} 
	function gg(a, b, c, d, x, s, t) 
	{ 
	return cmn((b & d) | (c & (~d)), a, b, x, s, t); 
	} 
	function hh(a, b, c, d, x, s, t) 
	{ 
	return cmn(b ^ c ^ d, a, b, x, s, t); 
	} 
	function ii(a, b, c, d, x, s, t) 
	{ 
	return cmn(c ^ (b | (~d)), a, b, x, s, t); 
	} 
	function MD5(str) 
	{ 
	x = str2blks_MD5(str); 
	var a = 1732584193; 
	var b = -271733879; 
	var c = -1732584194; 
	var d = 271733878; 
	for(i = 0; i < x.length; i += 16) 
	{ 
	var olda = a; 
	var oldb = b; 
	var oldc = c; 
	var oldd = d; 
	a = ff(a, b, c, d, x[i+ 0], 7 , -680876936); 
	d = ff(d, a, b, c, x[i+ 1], 12, -389564586); 
	c = ff(c, d, a, b, x[i+ 2], 17, 606105819); 
	b = ff(b, c, d, a, x[i+ 3], 22, -1044525330); 
	a = ff(a, b, c, d, x[i+ 4], 7 , -176418897); 
	d = ff(d, a, b, c, x[i+ 5], 12, 1200080426); 
	c = ff(c, d, a, b, x[i+ 6], 17, -1473231341); 
	b = ff(b, c, d, a, x[i+ 7], 22, -45705983); 
	a = ff(a, b, c, d, x[i+ 8], 7 , 1770035416); 
	d = ff(d, a, b, c, x[i+ 9], 12, -1958414417); 
	c = ff(c, d, a, b, x[i+10], 17, -42063); 
	b = ff(b, c, d, a, x[i+11], 22, -1990404162); 
	a = ff(a, b, c, d, x[i+12], 7 , 1804603682); 
	d = ff(d, a, b, c, x[i+13], 12, -40341101); 
	c = ff(c, d, a, b, x[i+14], 17, -1502002290); 
	b = ff(b, c, d, a, x[i+15], 22, 1236535329); 
	a = gg(a, b, c, d, x[i+ 1], 5 , -165796510); 
	d = gg(d, a, b, c, x[i+ 6], 9 , -1069501632); 
	c = gg(c, d, a, b, x[i+11], 14, 643717713); 
	b = gg(b, c, d, a, x[i+ 0], 20, -373897302); 
	a = gg(a, b, c, d, x[i+ 5], 5 , -701558691); 
	d = gg(d, a, b, c, x[i+10], 9 , 38016083); 
	c = gg(c, d, a, b, x[i+15], 14, -660478335); 
	b = gg(b, c, d, a, x[i+ 4], 20, -405537848); 
	a = gg(a, b, c, d, x[i+ 9], 5 , 568446438); 
	d = gg(d, a, b, c, x[i+14], 9 , -1019803690); 
	c = gg(c, d, a, b, x[i+ 3], 14, -187363961); 
	b = gg(b, c, d, a, x[i+ 8], 20, 1163531501); 
	a = gg(a, b, c, d, x[i+13], 5 , -1444681467); 
	d = gg(d, a, b, c, x[i+ 2], 9 , -51403784); 
	c = gg(c, d, a, b, x[i+ 7], 14, 1735328473); 
	b = gg(b, c, d, a, x[i+12], 20, -1926607734); 
	a = hh(a, b, c, d, x[i+ 5], 4 , -378558); 
	d = hh(d, a, b, c, x[i+ 8], 11, -2022574463); 
	c = hh(c, d, a, b, x[i+11], 16, 1839030562); 
	b = hh(b, c, d, a, x[i+14], 23, -35309556); 
	a = hh(a, b, c, d, x[i+ 1], 4 , -1530992060); 
	d = hh(d, a, b, c, x[i+ 4], 11, 1272893353); 
	c = hh(c, d, a, b, x[i+ 7], 16, -155497632); 
	b = hh(b, c, d, a, x[i+10], 23, -1094730640); 
	a = hh(a, b, c, d, x[i+13], 4 , 681279174); 
	d = hh(d, a, b, c, x[i+ 0], 11, -358537222); 
	c = hh(c, d, a, b, x[i+ 3], 16, -722521979); 
	b = hh(b, c, d, a, x[i+ 6], 23, 76029189); 
	a = hh(a, b, c, d, x[i+ 9], 4 , -640364487); 
	d = hh(d, a, b, c, x[i+12], 11, -421815835); 
	c = hh(c, d, a, b, x[i+15], 16, 530742520); 
	b = hh(b, c, d, a, x[i+ 2], 23, -995338651); 
	a = ii(a, b, c, d, x[i+ 0], 6 , -198630844); 
	d = ii(d, a, b, c, x[i+ 7], 10, 1126891415); 
	c = ii(c, d, a, b, x[i+14], 15, -1416354905); 
	b = ii(b, c, d, a, x[i+ 5], 21, -57434055); 
	a = ii(a, b, c, d, x[i+12], 6 , 1700485571); 
	d = ii(d, a, b, c, x[i+ 3], 10, -1894986606); 
	c = ii(c, d, a, b, x[i+10], 15, -1051523); 
	b = ii(b, c, d, a, x[i+ 1], 21, -2054922799); 
	a = ii(a, b, c, d, x[i+ 8], 6 , 1873313359); 
	d = ii(d, a, b, c, x[i+15], 10, -30611744); 
	c = ii(c, d, a, b, x[i+ 6], 15, -1560198380); 
	b = ii(b, c, d, a, x[i+13], 21, 1309151649); 
	a = ii(a, b, c, d, x[i+ 4], 6 , -145523070); 
	d = ii(d, a, b, c, x[i+11], 10, -1120210379); 
	c = ii(c, d, a, b, x[i+ 2], 15, 718787259); 
	b = ii(b, c, d, a, x[i+ 9], 21, -343485551); 
	a = add(a, olda); 
	b = add(b, oldb); 
	c = add(c, oldc); 
	d = add(d, oldd); 
	} 
	return rhex(a) + rhex(b) + rhex(c) + rhex(d); 
	}
	return MD5(value_s);
}
