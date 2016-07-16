;
(function (W) {
    var probe = {
        support: function (key) {
            var bln = true;
            switch (key) {
            case "boxshadow":
                bln = this.supportBoxShadow();
                break;
            default:
                break;
            }
            return bln;
        },
        //是否支持BoxShadow
        supportBoxShadow: function () {
            var $testDiv = $("<div style=\"box-shadow:inset 0px -1px 1px  -1px #b2b2b2;\"></div>");
            try {
                if ($testDiv.css("box-shadow")) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
    }
    var Dialog = {
        /**
         * Alert弹出框 三种调用方式
         * 1. widget.alert(msg);  基础弹出框，msg：消息内容
         * 2. widget.alert(msg,callback);  回调弹出框，msg：消息内容  callback：点击确定的回调内容
         * 3. widget.alert(opt);  回调弹出框，msg：消息内容  callback：点击确定的回调内容
         */
        alert: function (options, callback) {
            var self = this;
            var closebtn = {
                "title": "关闭",
                "click": function () {}
            }
            var opt = {
                title: null,
                content: null,
                buttons: {
                    "close": {
                        "title": "关闭",
                        "click": function () {}
                    }
                }
            };
            if (typeof (options) == "string") {
                opt.content = options;
                if (callback) {
                    closebtn.click = callback;
                    opt = $.extend(true, opt, {
                        buttons: {
                            "close": closebtn
                        }
                    });
                }
            } else {
                opt = $.extend(true, opt, options);
            }
            return self.dialog(opt);
        },
        confirm: function (options, callback) {
            var self = this;
            var confirmbtn = {
                "title": "确定",
                "click": function () {}
            }
            var opt = {
                title: null,
                content: null,
                buttons: {
                    "confirm": {
                        "title": "确定",
                        "click": function () {}
                    },
                    "close": {
                        "title": "取消",
                        "click": function () {}
                    }
                }
            };
            if (typeof (options) == "string") {
                opt.content = options;
                if (callback) {
                    confirmbtn.click = callback;
                    opt = $.extend(true, opt, {
                        buttons: {
                            "confirm": confirmbtn
                        }
                    });
                }
            } else {
                opt = $.extend(true, opt, options);
            }
            return self.dialog(opt);
        },
        //基础对话框
        dialog: function (options) {
            var self = this;
            //获取dialog随机ID   
            var id = "dialog_" + (new Date()).getTime();
            var opt = {
                title: null,
                content: null,
                zindex: 4200,
                bgcolor: "#000",
                opacity: 0.7,
                topOffset: 0,
                width: "280",
                zoom: 1,
                loadDefaultCss: true,
                className: false, //用户自定义的Class名称，会覆盖style的定位
                buttons: {
                    "close": {
                        "title": "关闭",
                        "click": function () {}
                    }
                }
            };
            opt = $.extend(true, opt, options);
            opt.id = id;
            if ((String(opt.width)).indexOf("%") < 0) {
                opt.width = opt.width + "px";
            }
            if (opt.loadDefaultCss == true) {
                this.loadDialogCss();
            }
            //遮罩
            // var  $mask=$("<div id=\""+id+"_cover\"   style=\"z-index:"+opt.zindex+";background-color:"+opt.bgcolor+";position:fixed;left:0;top:0;width:100%;height:100%;filter:alpha(opacity="+(opt.opacity*100)+");opacity:"+opt.opacity+";_position:absolute;_top:expression(eval(document.compatMode && document.compatMode=='CSS1Compat') ? documentElement.scrollTop+(document.documentElement.clientHeight-this.offsetHeight)/2:document.body.scrollTop+(document.body.clientHeight - this.clientHeight)/2); \"><iframe style=\"position:fixed;_position:absolute;width:100%;height:100%;border:none;filter:alpha(opacity=0);opacity:0;left:0;top:0;z-index:-1;\"  src=\"about:blank\"></iframe></div>");           
            var $mask = $("<div id=\"" + id + "_cover\"  class=dialog_mk></div>"); //修改为zepto定义，以解决兼容问题
            $mask.css({
                "z-index": opt.zindex,
                "background-color": opt.bgcolor,
                "position": "fixed",
                "left": 0,
                "top": 0,
                "width": "100%",
                "height": "100%",
                "opacity": opt.opacity
            })
            $("body").append($mask);
            //对话框结构定义
            var $dialog = $("<div id=\"" + id + "\" class=\"m_dialog\"  style=\"zoom:" + opt.zoom + ";width:" + opt.width + ";z-index:" + parseInt(opt.zindex + 1) + ";top:50%;left:50%;position:fixed;_position:absolute;_top:expression(eval(document.compatMode && document.compatMode=='CSS1Compat') ? documentElement.scrollTop+(document.documentElement.clientHeight - this.offsetHeight)/2+this.offsetHeight/2:document.body.scrollTop+(document.body.clientHeight - this.clientHeight)/2);\"></div>");
            //如果用户自己传了div的className，则不用style定位，而直接用用户传的css名称
            if (opt.className) {
                $dialog = $("<div id=\"" + id + "\" class=\"m_dialog " + opt.className + "\"  ></div>");
            }
            var $head = $("<header></header>");
            var $body = $("<section></section>");
            if (probe.support("boxshadow")) {
                $body.css("box-shadow", "inset 0px -1px 1px  -1px #b2b2b2");
            } else {
                $body.css("border-bottom", "1px solid #b2b2b2");
            }
            var $footer = $("<footer></footer>");
            //关闭对话框
            var closeDialog = function () {
                    $dialog.remove();
                    //解决tap的点透问题，背景延迟600ms消失。
                    $mask.animate({
                        opacity: 0
                    }, 600, 'ease-out', function () {
                        $mask.remove();
                    });
                }
                //head 标题部分
            if (opt.title) {
                $head.append($("<h2>" + opt.title + "</h2>"));
            }
            $dialog.append($head);
            //内容部分
            if (opt.content) {
                $body.append(opt.content);
            }
            $dialog.append($body);
            //按钮部分 ：按钮重新排序
            var newButtons = new Array();
            $.each(opt.buttons, function (key, btn) {
                if (key.toLowerCase() != "close") {
                    btn.key = key;
                    newButtons.push(btn);
                }
            });
            if (opt.buttons["close"]) {
                var btn = opt.buttons["close"];
                btn.key = "close";
                newButtons.push(btn);
            }
            //对话框底部按钮事件绑定
            var ibtnWidth = parseFloat((100 - newButtons.length) / newButtons.length);
            $.each(newButtons, function (key, btn) {
                var $btn = $("<a href=\"javascript:;\" style=\"width:" + ibtnWidth + "%\" data-key=\"" + key + "\">" + btn.title + "</a>");
                if (btn.key != "close") {
                    //$btn.addClass("m_dialog_confirm");
                    if (probe.support("boxshadow")) {
                        $btn.css("box-shadow", "inset -1px 0px 1px -1px #b2b2b2");
                    } else {
                        $btn.css("border-right", "1px solid #b2b2b2");
                    }
                }
                if ($.os.ios) { //如果是IOS用tap   
                    $btn.on('touchend', function (e) { // tap会有击穿问题
                        e.stopPropagation();
                        e.preventDefault();
                        if (btn.click) {
                            if (btn.click() == false) {} else {
                                closeDialog();
                            }
                        }
                    });
                } else { //如果是其他Android等用click  (tap在低端的android下有bug，多次上下滚动，导致tap无效)
                    $btn.click(function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        if (btn.click) {
                            if (btn.click() == false) {} else {
                                closeDialog();
                            }
                        }
                    });
                }
                $footer.append($btn);
            });
            $dialog.append($footer);
            $("body").append($dialog);
            //弹出窗口最大高度，比可是区域少40 
            var fixDialog = function () {
                    var maxHeight = $(window).height() - 40;
                    if ($dialog.height() > maxHeight) { //如果已经到了最大高度，就绝对定位，允许窗口撑开，使用窗口滚动条
                        var mTop = -(maxHeight / 2) + $(window).scrollTop();
                        if ($.os.ios) { //如果是IOS用背景不修改
                            $dialog.css({
                                'margin-left': -($dialog.width() / 2) + "px",
                                'margin-top': mTop + "px",
                                "position": "absolute"
                            });
                        } else { //如果不是IOS ，则背景Mask修改为absolute ,以修复部分手机dialog偏移的bug
                            $mask.css("position", "absolute");
                            $(window).on("scroll", function () {
                                var newHeight = $(window).height() + $(window).scrollTop();
                                $mask.css("height", newHeight + "px");
                            });
                            var left = ($(window).width() - $dialog.width()) / 2;
                            var style = "width:" + opt.width + ";z-index:" + parseInt(opt.zindex + 1) + ";position:absolute;top:" + ($(window).scrollTop() + 20) + "px;left:" + left + "px;";
                            $dialog.attr("style", style);
                        }
                    } else { //正常的对话框 alert，confirm的效果
                        $dialog.css({
                            'margin-left': -($dialog.width() / 2) + "px",
                            'margin-top': -($dialog.height() / 2) + "px"
                        });
                    }
                }
                //如果用户传了自己的class，就不在重新定位
            if (opt.className == false) {
                fixDialog();
                $(window).on("resize", function () {
                    fixDialog();
                });
                //横屏竖屏切换的时候，重新定位对话框
                $(window).on("orientationchange", function () {
                    fixDialog();
                }, false);
            }
            //dialog.close = closeDialog;
            return {
                $mask: $mask,
                $dialog: $dialog,
                close: closeDialog
            };
        },
        show: function () {},
        //显示Loading框
        showLoading: function (options) {
            //加载Loading的Style
            this.loadLoadingCSS();
            var opt = {
                zindex: 4100,
                bgcolor: "#ccc",
                opacity: 0.5
            };
            opt = $.extend(true, opt, options);
            var id = "m_loading";
            if ($("#" + id).length == 0) {
                var $mask = $("<div id=\"" + id + "_cover\"   style=\"z-index:" + opt.zindex + ";background-color:" + opt.bgcolor + ";position:fixed;left:0;top:0;width:100%;height:100%;filter:alpha(opacity=" + (opt.opacity * 100) + ");opacity:" + opt.opacity + ";_position:absolute;_top:expression(eval(document.compatMode && document.compatMode=='CSS1Compat') ? documentElement.scrollTop+(document.documentElement.clientHeight-this.offsetHeight)/2:document.body.scrollTop+(document.body.clientHeight - this.clientHeight)/2); \"><iframe style=\"position:fixed;_position:absolute;width:100%;height:100%;border:none;filter:alpha(opacity=0);opacity:0;left:0;top:0;z-index:-1;\"  src=\"about:blank\"></iframe></div>");
                var $dialog = $("<div id=\"" + id + "\"   style=\"background-color:#999;width:106px;height:106px;margin-left:-53px;margin-top:-53px;-moz-border-radius: 8px;-webkit-border-radius: 8px;border-radius:8px; z-index:" + parseInt(opt.zindex + 1) + ";top:50%;left:50%;position:fixed;_position:absolute;_top:expression(eval(document.compatMode && document.compatMode=='CSS1Compat') ? documentElement.scrollTop+(document.documentElement.clientHeight - this.offsetHeight)/2+this.offsetHeight/2:document.body.scrollTop+(document.body.clientHeight - this.clientHeight)/2);\"></div>");
                //if (probe.support("boxshadow")){
                //$dialog.append("<div class=\"m_loader\" >Loading...</div>");
                //}else{
                $dialog.append("<div style=\"margin-top:41px;margin-left:15px;color:#666\">Loading...</div>");
                //}
                $("body").append($mask).append($dialog);
            } else {
                $("#" + id + "_cover").show();
                $("#" + id).show();
            }
        },
        //隐藏Loading框
        hideLoading: function () {
            $("#m_loading").hide();
            $("#m_loading_cover").hide();
        },
        //加载Loding用到的CSS
        loadLoadingCSS: function () {
            var style = ".m_loader {margin: 4em auto;font-size: 12px;width: 1em;height: 1em;border-radius: 50%;position: relative;text-indent: -9999em;-webkit-animation: m_load5 1.1s infinite ease;animation: m_load5 1.1s infinite ease;}" +
                " @-webkit-keyframes m_load5 {0%,100% {box-shadow: 0em -2.6em 0em 0em #ffffff, 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.5), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7);}" +
                " 12.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0em #ffffff, 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5);}" +
                " 25% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.5), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7), 2.5em 0em 0 0em #ffffff, 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);} " +
                " 37.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5), 2.5em 0em 0 0em rgba(255, 255, 255, 0.7), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);}" +
                " 50% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.5), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.7), 0em 2.5em 0 0em #ffffff, -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);} " +
                " 62.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.5), 0em 2.5em 0 0em rgba(255, 255, 255, 0.7), -1.8em 1.8em 0 0em #ffffff, -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);} " +
                " 75% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.5), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.7), -2.6em 0em 0 0em #ffffff, -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);} " +
                " 87.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.5), -2.6em 0em 0 0em rgba(255, 255, 255, 0.7), -1.8em -1.8em 0 0em #ffffff;} }" +
                " @keyframes m_load5 {0%,100% { box-shadow: 0em -2.6em 0em 0em #ffffff, 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.5), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7);} " +
                " 12.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0em #ffffff, 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5);} " +
                " 25% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.5), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7), 2.5em 0em 0 0em #ffffff, 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);}" +
                " 37.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5), 2.5em 0em 0 0em rgba(255, 255, 255, 0.7), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);}" +
                " 50% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.5), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.7), 0em 2.5em 0 0em #ffffff, -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);} " +
                " 62.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.5), 0em 2.5em 0 0em rgba(255, 255, 255, 0.7), -1.8em 1.8em 0 0em #ffffff, -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);}" +
                " 75% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.5), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.7), -2.6em 0em 0 0em #ffffff, -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);}" +
                " 87.5% {box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.5), -2.6em 0em 0 0em rgba(255, 255, 255, 0.7), -1.8em -1.8em 0 0em #ffffff;}}";
            this.loadCss("mobi_loading_style", style);
        },
        //加载Dialog用到的css
        loadDialogCss: function () {
            var style = ".m_dialog {color:#000;background-color:#fff; text-align:center;-moz-border-radius: 8px;-webkit-border-radius: 8px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;}" +
                " .m_dialog header{font-weight:bold;margin-top:10px;line-height:20px;text-align:center;font-family:Arial,Helvetica,sans-serif;height:auto;width:auto;}" +
                " .m_dialog footer{height:40px;padding:0px 0px;width:auto;}" +
                " .m_dialog footer a{display:block;color:#007afe;float:left;text-align:center;height:40px;line-height:36px;font-weight:bold;text-decoration: none;font-family:Arial,Helvetica,sans-serif;font-size:14px; }" +
                " .m_dialog footer a:hover{text-decoration:none;}" +
                " .m_dialog footer button{border:none;background:none;}" +
                " .m_dialog section{padding:20px;overflow-x:hidden;text-align:center;font-family:Arial,Helvetica,sans-serif;font-weight:normal;height:auto;line-height:18px;width:auto;}";
            this.loadCss("mobi_dialog_style", style);
        },
        loadCss: function (id, style) {
            if ($("#" + id).length == 0) {
                var newStyle = $("<style id=\"" + id + "\">" + style + "</style>");
                $("head").append(newStyle);
            }
        }
    };
    W.Dialog = Dialog;
})(window);