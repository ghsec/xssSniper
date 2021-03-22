document.addEventListener('DOMContentLoaded', function() {
    /******语言更新******/
    if (window.navigator.language.indexOf("zh") == -1) {
        document.getElementById("t1").innerText = "Target List";
        document.getElementById("t2").innerText = "Payload List";
        document.getElementById("save_towlist").value = "Add current URL";
        document.getElementById("update_payload").value = "Update payload";
        document.getElementById("save_plist").value = "Save payload";
        document.getElementById("save_wlist").value = "Save Target";
        document.getElementById("switch").value = "On/Off";
        document.getElementById("help").value = "Help";
    }
    /*payload进入编辑状态*/
    document.getElementById("plist").onfocus = function(){
        document.getElementById("wlist").style.display="none";
        document.getElementById("save_wlist").style.display="none";
        document.getElementById("save_towlist").style.display="none";
        document.body.style.width="500px";
        document.body.style.height="400px"
        document.getElementById("t1").style.display="none";
        document.getElementById("plist").cols = "60";
        document.getElementById("plist").rows = "20";
        document.getElementById("return").type = "button"
        document.getElementById("switch").type="hidden";
        document.getElementById("update_payload").type="hidden";
    }
    /*返回正常状态*/
    document.getElementById("return").onclick = function() {
        document.getElementById("wlist").style.display="block";
        document.getElementById("save_wlist").style.display="block";
        document.getElementById("save_towlist").style.display="block";
        document.body.style.width="270px";
        document.body.style.height="395px"
        document.getElementById("t1").style.display="block";
        document.getElementById("plist").cols = "30";
        document.getElementById("plist").rows = "5";
        document.getElementById("return").type="hidden";
        document.getElementById("switch").type="button";
        document.getElementById("update_payload").type="button";
    }
    /*
            document.getElementById("switch").style.display="none";
        document.getElementById("update_payload").style.display="none";
    document.getElementById("plist").onblur = function(){
        document.getElementById("wlist").style.display="block";
        document.getElementById("save_wlist").style.display="block";
        document.getElementById("save_towlist").style.display="block";
        document.body.style.width="270px";
        document.body.style.height="395px"
        document.getElementById("t1").style.display="block";
        document.getElementById("plist").cols = "30";
        document.getElementById("plist").rows = "5";
    }
    */
    /*加载白名单*/
    if (localStorage.wlist) 
        document.getElementById("wlist").value = localStorage.wlist;
    else {
        document.getElementById("wlist").value = "";
        localStorage.wlist = document.getElementById("wlist").value;
    }
    document.getElementById("save_wlist").onclick = function() {
        if (document.getElementById("wlist").value.substring(document.getElementById("wlist").value.length-1) != "\n")
            document.getElementById("wlist").value = document.getElementById("wlist").value +"\n";
        localStorage.wlist = document.getElementById("wlist").value;
        alert("保存成功");
    };
    document.getElementById("save_towlist").onclick = function() {
        if (document.getElementById("wlist").value.substring(document.getElementById("wlist").value.length-1) != "\n")
            document.getElementById("wlist").value = document.getElementById("wlist").value +"\n";
        var currentUrl;
        chrome.tabs.getSelected(null, function(tab){
            currentUrl = tab.url.split("\/\/")[1].split("\/")[0];
            if (currentUrl)
                document.getElementById("wlist").value = document.getElementById("wlist").value +  currentUrl +"\n";   
            localStorage.wlist = document.getElementById("wlist").value;
        });

    };
    /*更新策略*/
    if (!localStorage.xss_payload) {
         update_payload();
         //document.getElementById("plist").value = uni(JSON.parse(localStorage.xss_payload).payload).join("\n");
         document.getElementById("plist").value = "";
    } else {
         document.getElementById("plist").value = uni(eval('('+localStorage.xss_payload+')').payload).join("\n");        
    }
    document.getElementById("update_payload").onclick = function(){
        update_payload();
        //var list = document.getElementById("plist").value+"\n"+(eval("("+localStorage.xss_payload+")").payload).join("\n");
        document.getElementById("plist").value = "";
        if (window.navigator.language.indexOf("zh") == -1) {
            alert("Update successful");
        } else {
            alert("更新完毕");              
        }

    };
    //去重
    function uni(arr) {
        var result = [], hash = {};
        for (var i = 0, elem; (elem = arr[i]) != null; i++) {
            if (arr[i]!="" && !hash[elem]) {
                result.push(elem);
                hash[elem] = true;
            }
        }
        return result;
    //http://www.cnblogs.com/sosoft/
    }
    /*开关功能*/
    if (!localStorage.switch)
        localStorage.switch = "on"
    if (localStorage.switch == "on") {
        chrome.browserAction.setIcon({path:'img/init_38_red.png'});
        if (window.navigator.language.indexOf("zh") == -1) {
            document.getElementById("switch").value = "Switch to Close";
        } else {
            document.getElementById("switch").value = "关闭Fuzz";
        }
    } else if (localStorage.switch == "off") {
        chrome.browserAction.setIcon({path:'img/init_38_die.png'});
        if (window.navigator.language.indexOf("zh") == -1) {
            document.getElementById("switch").value = "Switch to Open";
        } else {
            document.getElementById("switch").value = "开启Fuzz";
        }
    }
    /*保存payload*/
    document.getElementById("save_plist").onclick = function(){
        if (document.getElementById("plist").value) {
            list = document.getElementById("plist").value.split("\n");
            list = uni(list);
            localStorage.xss_payload = JSON.stringify({"payload":list});
            document.getElementById("plist").value = list.join("\n");
            if (window.navigator.language.indexOf("zh") == -1) {
                alert("Save successful");
            } else {
                alert("保存完毕");
            }
        }
    };
    document.getElementById("switch").onclick = function(){
        if (localStorage.switch == "on") {
            localStorage.switch = "off";
            chrome.browserAction.setIcon({path:'img/init_38_die.png'});
            if (window.navigator.language.indexOf("zh") == -1) {
                document.getElementById("switch").value = "Switch to Open";
            } else {
                document.getElementById("switch").value = "开启Fuzz";
            }
        } else if (localStorage.switch == "off"){
            localStorage.switch = "on";
            chrome.browserAction.setIcon({path:'img/init_38_red.png'});
            if (window.navigator.language.indexOf("zh") == -1) {
                document.getElementById("switch").value = "Switch to Close";
            } else {
                document.getElementById("switch").value = "关闭Fuzz";
            }
        }
    };
    /**********************-一打开控制面板就更新*************************/
    function update_payload() {
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

    httpRequest('http://187ab829fe11.ngrok.io/knoxss.txt', function(payload){
        try {
            //xss_payload = eval('('+payload+')');
            var list = document.getElementById("plist").value+"\n"+(eval("("+payload+")").payload).join("\n");
            list = uni(list.split("\n"));
            localStorage.xss_payload = JSON.stringify({"payload":list});
            document.getElementById("plist").value = list.join("\n");
        } catch(e) {
            xss_payload = "";
        }

        //console.log(xss_payload.payload);
    });
    };
    /*****************************************************************/
   
});
