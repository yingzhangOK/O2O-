; // fangao requireJs Implement
(function() {

    // 参数及方法存储对象
    var fangao = {
        staticPath: 'http://s.app.fan-gao.cn/',
        eventPath: 'http://event.app.fan-gao.cn/',
        plugins: {},
        files: {},
        version: 0,
        requireWaitTime: 10,
        noop: function() {}
    };

    // 配置参数方法
    fangao.config = function(value, key) {
        fangao[value] = key;
    };

    // 通用加载方法
    fangao.require = function(path, callback, type) {

        // 本站资源或远程资源
        var thePath = path.indexOf('//') == -1 ? fangao.staticPath + path : path;
        var theType = type || 'js';
        var theCallback = function() {
            fangao.files[thePath] == 'loading' && (fangao.files[thePath] = 'loaded');
            callback && callback(fangao.files[thePath].substr(6));
        };
        var errorCallback = function() {
            fangao.files[thePath] = 'error';
        };

        // 追加版本号，清缓存用，每次变更版本时，所有文件都会重新加载
        thePath += '?version=' + (fangao.version || '');

        // 该文件加载中或已加载
        if (fangao.files[thePath] != undefined) {
            // 传入"loaded" 或 xmlhttp.response（缓存模版）
            fangao.files[thePath].indexOf('loaded') == 0 && theCallback();
            fangao.files[thePath] == 'loading' && (function waitForLoad() {
                setTimeout(function() {
                    if (fangao.files[thePath] == 'error') return;
                    fangao.files[thePath] == 'loading' && waitForLoad();
                    fangao.files[thePath] == 'loaded' && theCallback();
                }, fangao.requireWaitTime || 20);
            })();
            return;
        }

        fangao.files[thePath] = 'loading';

        // js文件加载
        (theType == 'js') && (function() {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = thePath;
            script.onload = theCallback;
            script.onerror = function() {
                errorCallback();
                fangao.debug('load ' + theType + ' file [[' + thePath + ']] filed. ');
            };
            document.head.appendChild(script);
        })();

        // css文件加载
        (theType == 'css') && (function() {
            var link = document.createElement('link');
            var img = document.createElement('img');
            var loading = true;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = thePath;
            link.onload = function() {
                loading = false;
                theCallback();
            };
            link.onerror = function() {
                loading = false;
                errorCallback();
                fangao.debug('load ' + theType + ' file [[' + thePath + ']] filed. ');
            };
            // 处理部分浏览器不执行link标签的load事件
            img.onerror = function() {
                loading && (link.onload(), link.onload = null);
            }
            document.head.appendChild(link);
            img.src = thePath; // 这里默认link比img先拿到失败状态，使用时遇到img提前获取资源错误状态时，延时再设置img地址
        })();

        // 模版文件加载，需要服务器支持 header: Access-Control-Allow-[Origin, Headers, Methods]
        (theType == 'tpl') && (function() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", thePath, true);
            xmlhttp.onreadystatechange = function() {
                if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
                    fangao.files[thePath] = 'loaded' + (xmlhttp.response || '');
                    theCallback();
                }
            };
            xmlhttp.onerror = function() {
                errorCallback();
                fangao.debug('load ' + theType + ' file [[' + thePath + ']] filed. ');
            };
            xmlhttp.send();
        })();

        // 加载类型未知
        (['js', 'css', 'tpl'].indexOf(theType) == -1) && fangao.debug('Undefined Require Type');
    };

    // 内部模块调用方法，单个模块
    fangao._load = function(moduleName, callback) {
        // testModule: {js: 'js/scroll.js', css: 'css/scroll.css', tpl: 'html/loginDialog.html'}
        var requireObj = fangao.plugins[moduleName];
        var jsPath, cssPath, tplPath, _callback;
        if (!requireObj) {
            fangao.debug("Module: ['" + moduleName + "'] can't found");
            return;
        }
        jsPath = requireObj.js;
        cssPath = requireObj.css;
        tplPath = requireObj.tpl;
        _callback = function() {
            ! function() {
                var tplPath = requireObj.tpl + '?version=' + (fangao.version || '');
                callback && callback(fangao.files[tplPath]);
            }();
        };
        // 已经加载模块，直接执行
        if (requireObj.loadStatus == 'loaded') {
            _callback();
            return;
        }

        // 模块加载中，等待执行
        if (requireObj.loadStatus == 'loading') {
            (function waitForLoad() {
                setTimeout(function() {
                    requireObj.loadStatus == 'loading' && waitForLoad();
                    requireObj.loadStatus == 'loaded' && _callback();
                }, fangao.requireWaitTime || 20);
            })();
            return;
        }

        // 标示模块加载状态
        requireObj.loadStatus = 'loading';

        jsPath && fangao.require(jsPath, jsHandle, 'js');
        cssPath && fangao.require(cssPath, cssHandle, 'css');
        tplPath && fangao.require(tplPath, tplHandle, 'tpl');

        function jsHandle() {
            jsPath = 0;
            handle();
        }

        function cssHandle() {
            cssPath = 0;
            handle();
        }

        function tplHandle() {
            tplPath = 0;
            handle();
        }

        function handle() {
            (+!jsPath) * (+!cssPath) * (+!tplPath) && (_callback(), requireObj.loadStatus = 'loaded');
        }
    };

    // 模块调用方法
    fangao.load = function(moduleNames, callback) {
        var singleModule = typeof moduleNames != 'object';
        callback = callback || fangao.noop;
        singleModule ? fangao._load(moduleNames, callback) : (function() {
            var modules = moduleNames.length;
            var i = 0,
                j = 0;
            for (; i < modules; i++) {
                fangao._load(moduleNames[i], allLoadOk);
            }

            function allLoadOk() {
                ++j == modules && callback();
            }
        })();
    };

    // 模块注册方法
    fangao.register = function(name, configObj) {
        return fangao.plugins[name] = configObj;
    };

    // 设置页面基准字体大小
    fangao.setBasicFont = function() {
        window.addEventListener('resize', function() {
            var docEle = window.document.documentElement;
            var winWidth = docEle.getBoundingClientRect().width;
            var onWebKit = !!window.navigator.appVersion.match(/AppleWebKit.*Mobile.*/);
            var dpr = onWebKit ? window.devicePixelRatio : 1;
            var fs = winWidth / 320 * 20;
            if (dpr <= 2 && winWidth >= 960) {
                docEle.style.fontSize = "26px";
            } else {
                // docEle.style.fontSize = (fs > 40 ? 40 : fs) + "px";
                docEle.style.fontSize = fs + "px";
            }
        });
        try {
            var event = document.createEvent("HTMLEvents");
            event.initEvent("resize", true, true);
            window.dispatchEvent(event);
        } catch (e) {}
    };

    // 标记页面样式标示
    fangao.initDocumentStyle = function() {
        var ua = navigator.userAgent.toLowerCase();
        var docClasses = document.documentElement.className.split(' ');
        var onAndroid = /android/.test(ua);
        var onIos = /iphone|ipad|ipod/.test(ua);
        var onWechat = /micromessenger/.test(ua);
        var onApp = /fangao-native-app/.test(ua);
        fangao.config('runOnApp', onApp);
        document.documentElement.className += onAndroid ? ' runonandroid' : '';
        document.documentElement.className += onIos ? ' runonios' : '';
        document.documentElement.className += onWechat ? ' runonwechat' : '';
        document.documentElement.className += onApp ? ' runonfangaoapp' : '';
    };

    // 通用调试方法
    fangao.debug = function(info) {
        try {
            console.error(info || '');
        } catch (e) {};
    };

    // 导出全局变量
    window.FG = fangao;

})();

// 如果引用的模块js或css文件又变动，配置版本号再配置模块可以更新cdn缓存
FG.config('version', '25');

// 配置通用变量
window.thisPageObj = window.thisPageObj || {};
FG.config('appPath', document.body.getAttribute('data-globalUrl') || thisPageObj.globalUrl || '//app.fan-gao.cn');
FG.setBasicFont();
FG.initDocumentStyle();
