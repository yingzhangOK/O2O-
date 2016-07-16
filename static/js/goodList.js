(function() {
    var $body = $('body');

    // app点击页面隐藏购物车
    (function () {
        var maxWinHeight = $(window).height();
        var hideCart = false;
        $(window).on('resize', function() {
            var _winHeight = $(window).height();
            hideCart = _winHeight < maxWinHeight - 10; // 打开cart会有border占位
        }).on('touchstart', function () {
            window.api && hideCart && api.execScript({
                name: 'root',
                script: '$("#shoppingCartTab").triggerHandler("touchend")'
            });
        });
    })();

    FastClick.attach(document.body);

    // 部分分餐点跳转到第三方平台
    $body.hasClass('stopEvent') && (function() {
        $body.removeClass('stopEvent');
        FG.register('guideTo3rdPlatform', {
            css: 'mod/main/goodList-otherPlatform.css',
            js: 'mod/main/goodList-otherPlatform.js'
        });
        $('.activityEntry, .signEntry, .adv_specil, .mod_item_info, .goods_cart').addClass('stopEvent');
        $('.banner_jump').each(function(i, t) {
            $(t).attr('jump') && $(t).attr('jump').indexOf('http://event.fan-gao.cn') != 0 && $(t).addClass('stopEvent');
        })
        FG.load('guideTo3rdPlatform');
    })();

    //14:00-18:00之间，晚餐在第一张显示
    (function() {
        var date = new Date();
        var hour = date.getHours();
        if (hour >= 14 && hour < 18) {
            $("#dinner_top").show();
            $("#dinner_bottom").hide();
        }
    })();

    // 轮播
    (function() {
        new Swiper('.swiper-container', {
            direction: 'horizontal',
            pagination: '.swiper-pagination',
            autoplay: 4000,
            autoplayDisableOnInteraction: false,
            loop: true
        });
    })();

    // 页面传递过来的变量
    var globalUrl = thisPageObj.globalUrl;
    var allGoodIds = eval(thisPageObj.allGoodIds);
    var runOnApp = thisPageObj.runOnApp;
    var regionId = thisPageObj.regionId;
    var onlyTuan = thisPageObj.onlyTuan;
    var tomorrowBook = thisPageObj.tomorrowBook;
    var dataMobile = thisPageObj.dataMobile;
    var kitchenId = thisPageObj.kitchenId;

    // 提交限制变量
    var canSubmit = 0;

    // 购物车滑动，其他交互的地方需要调整此区域的位置
    var myscroll = new IScroll(".goods_cart_list");

    // 无地址提示
    !regionId && $('.EntryCtn .doOnlyHasRegion').on('click', function(event) {
        event.preventDefault();
        Dialog.alert('请在顶部先选择所在位置~');
    });

    // 百度统计订单确认按钮
    $('#order').on('click', function() {
        window._hmt.push(['_trackEvent', '套餐列表-确认订餐', '套餐列表-确认订餐']);
    });

    // 领取满减券
    $('.get_full_cut').tap(function() {
        $.ajax({
            type: 'POST',
            url: globalUrl + 'json.php?mod=main&act=get_full_cut',
            dataType: 'json',
            success: function(data) {
                if (data.errCode == 0) {
                    Dialog.alert("领取成功，支付时自动扣除", function() {});
                    $.ajax({
                        type: 'POST',
                        url: globalUrl + 'json.php?mod=main&act=send_full_cut_wx_msg',
                        dataType: 'json',
                        success: function(data) {
                            return;
                        },
                        error: function(xhr, type) {
                            Dialog.alert("…(⊙_⊙;)… 您网络不太好，请重试~", function() {});
                        }
                    });
                } else {
                    if (runOnApp) {
                        if (data.errCode == -1001) {
                            api.execScript({
                                name: 'root',
                                script: 'LoginShow();'
                            });
                        } else {
                            alert(data['errMsg']);
                        }
                    } else {
                        Dialog.alert(data.errMsg, function() {});
                    }
                }
            },
            error: function(xhr, type) {
                Dialog.alert("…(⊙_⊙;)… 您网络不太好，请重试~", function() {});
            }
        });
    });

    // 单个菜品数量增减
    $('.buy_item_btn_reduce').tap(function() {
        window._hmt.push(['_trackEvent', '套餐列表-套餐移除', '套餐列表-套餐移除']);
        var $t = $(this).parent().find('.reduce');
        var id = $t.attr('data-id');
        id && dec(id);
        id && runOnApp && (function() {
            var name = $t.attr('data-name');
            var id = $t.attr('data-id');
            var num = $t.parent().find('input').val();
            var price = $t.attr('data-price');
            api.execScript({
                name: 'root',
                script: 'updateAppCart("' + id + '","' + name + '","' + price + '","' + num + '")'
            });

        })();
        // 减少至零，收起增减按钮区域
        if ($t.parent().children('input').val() <= 0) {
            $t.parent().removeClass('mod_item_count_active');
        }
    });

    // 单个菜品数量加减
    $('.buy_item_btn_plus').tap(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var allOff = $(this).attr('data-empty') == 'true';
        var name = $(this).attr('data-name');
        _hmt.push(['_trackEvent', '套餐列表-套餐添加' + (allOff ? '-售罄后' : ''), '套餐列表-套餐添加' + (allOff ? '-售罄-' + name : '')]);
        if (!regionId) {
            $('.area_top_tip').trigger('tap');
            return;
        }
        var $t = $(this).parent().find('.plus'),
            id = $t.attr('data-id'),
            first_limit = $t.attr('data-first'),
            second_limit = $t.attr('data-second');

        // 小苹果,每人先点一份
        if (parseInt($t.attr('data-price')) <= 0 && $t.attr('data-name') == '鲜切水果' && parseInt($t.parent().find('input').val()) > 0) {
            Dialog.alert('亲~每人限送一份哦~~');
            return false;
        }

        id && add(id, second_limit, $t);

        if (!runOnApp) {
            //APP不显示动画
            //购物车添加动画
            var target = $('.icon_dot').offset(),
                targetX = target.left,
                targetY = target.top,
                current = $(this).offset(),
                currentX = current.left,
                currentY = current.top;
            var point = $(this).find('.icon-fly-dot').eq(-1).clone();
            $(this).append(point);
            $(this).find('.icon-fly-dot').eq(-2).css({
                width: '15px',
                height: '15px',
                zIndex: '1',
                left: targetX - currentX,
                top: targetY - currentY,
                visibility: 'hidden'
            });
        }

        $(this).find('.icon-fly-dot').eq(-7).remove();

        id && runOnApp && (function() {
            var name = $t.attr('data-name');
            var id = $t.attr('data-id');
            var num = $t.parent().find('input').val();
            var price = $t.attr('data-price');
            api.execScript({
                name: 'root',
                script: 'updateAppCart("' + id + '","' + name + '","' + price + '","' + num + '")'
            });
        })();
    });

    // 某些站点只允许团餐，显示tip提醒
    var showOnlyTuanTip = true;

    function add(id, second_limit, el) {
        var $t = el;
        var is_cf = $t.attr('data-iscf');
        var first_limit = $t.attr('data-first');
        var type = $t.attr('type');
        if (!regionId) {
            $('.area_top_tip').trigger('tap');
            // 设定滚动坐标，不然弹出输入键盘顶部会出现一个空白高度
            setTimeout(function() {
                $body.prop('data-scrollTop', $body.scrollTop()).scrollTop(0);
            }, 200);
            _hmt.push(['_trackEvent', '送餐地址-初始化', '送餐地址-初始化']);
            return false;
        }

        onlyTuan && showOnlyTuanTip && Dialog.alert('此配送点目前只支持<span style="color: #E24E4E;">10份以上</span>的订单，不满10份可召集小伙伴拼单~~', function() {
            showOnlyTuanTip = false;
        });

        var count = $("#item_count_" + id).val();
        count = parseInt(count);

        if (count >= second_limit && type == 0) {
            Dialog.alert('太火爆~此套餐仅剩' + second_limit + '份');
            return false;
        }

        if (setShoppingCart(id, 1)) {
            $("#item_count_" + id).val(count + 1);
            //去掉动画
            //$.os.ios && runOnApp && (goods_cart_mask.css('display') == 'none') && addAnimation(id);
            showBuy(count + 1);

            // 多于10份跳转
            if (getCartCount() >= 10) {
                Dialog.alert('亲~满10份以上，可享VIP送餐上门服务和超多优惠', function() {
                    // var href = globalUrl + "weixin.php?mod=main&act=order";
                    var href = globalUrl + "weixin.php?mod=tuan&act=Index";
                    if (runOnApp) {
                        var callback = "openLinkWindow('" + href + "');";
                        // 调用root窗口里的打开新窗口方法打开此链接
                        api.execScript({
                            name: 'root',
                            script: callback
                        });
                    } else {
                        $('.tuanEntry img').trigger('click');
                    }
                });
            }
            // 展示减少按钮
            $t.parent().addClass('mod_item_count_active');
        }
    }

    function dec(id) {
        if (setShoppingCart(id, 0)) {
            var count = $("#item_count_" + id).val();
            count = parseInt(count) - 1;
            if (count < 0) {
                count = 0;
            }
            $("#item_count_" + id).val(count);
            canSubmit = 0;
            showBuy();
        }
    }

    // 获得购物车套餐数量
    function getCartCount() {
        // 下面实现团餐提示
        var allCount = 0;
        $("input[id^=item_count]").each(function() {
            if ($(this).attr("goodtype") == 0) {
                allCount += parseInt($(this).val());
            }
        });
        return allCount;
    }

    // 购物车新增元素动画效果
    //function addAnimation(id) {
    //    var pic = $('#good_pic_' + id);
    //    tmp = pic.clone().appendTo('body'),
    //        pos = pic.offset();
    //    tmp.attr('id', 'good_pic_tmp_' + id);
    //    tmp.css({
    //        zIndex: 901,
    //        position: 'absolute',
    //        width: pic.width(),
    //        height: pic.height(),
    //        top: pos.top,
    //        left: pos.left
    //    });
    //    tmp.animate({
    //        top: $('#show_icon').offset().top,
    //        left: '10px',
    //        width: '25px',
    //        height: '25px'
    //    }, 500, 'ease', function() {
    //        tmp.remove();
    //    });
    //}

    function showBuy() {
        var showAllPrice = 0;
        var html = '';
        var sum = 0;
        for (var good in allGoodIds) {

            var price = parseInt($("#price_" + allGoodIds[good]).val());
            var count = $("#item_count_" + allGoodIds[good]).val();

            //计算点餐总数量
            sum += count;
            showAllPrice += price * count;

            if (count > 0) {
                var $t = $("#item_count_" + allGoodIds[good]).parent().find('.plus');
                var id = $t.attr('data-id');
                var first_limit = $t.attr('data-first');
                var second_limit = $t.attr('data-second');
                var name = $t.attr('data-name');
                var dataPrice = $t.attr('data-price');
                // console.log(name);

                html += '<li class="line1px">';
                html += '   <a href="javascript:;">';
                html += '<div class="goods_cart_info" data-id="' + id + '" data-name="' + name + '" data-price="' + dataPrice + '"';
                html += '       data-first="' + first_limit + '" data-second="' + second_limit + '">';
                html += '   <div class="goods_cart_list_item">';
                html += '       <p class="goods_cart_list_name">' + $("#name_" + allGoodIds[good]).val() + '</p>';
                html += '       <p class="goods_cart_list_price">' + (price / 100).toFixed(2) + '</p>';
                html += '   </div>';
                html += '   <div class="goods_cart_list_count">';
                html += '       <div class="goods_cart_list_reduce">-</div>';
                html += '       <div class="goods_cart_list_count_num">' + count + '</div>';
                html += '       <div class="goods_cart_list_plus">+</div>';
                html += '   </div>';
                html += '</div>';
                html += '</a>';
                html += '</li>';
                canSubmit = 1;
            }
        }

        showAllPrice = showAllPrice / 100;
        //如果数量减为0
        if (sum <= 0) {
            showOrHideGoodsList('hidden');
        }

        if (showAllPrice > 15) { // 限制单点小食或例汤
            $("#show_icon").addClass("icon_dot_on");
            $("#order").removeClass("btn_cart_disable");
        } else {
            $("#show_icon").removeClass("icon_dot_on");
            $("#order").addClass("btn_cart_disable");
        }


        $("#show_all_price").html("&yen;" + showAllPrice.toFixed(2));
        $("#cart_list_show").html(html);

        //注册点击事件
        registTapEvent();
    }

    // 注册点击事件
    function registTapEvent() {

        //点击购物车减号
        $(".goods_cart_list_reduce").die().live("tap", function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.event.cancelBubble = true;
            var listCount = $(this).parent();
            var $t = listCount.parent();
            var id = $t.attr('data-id');
            var num = listCount.find('.goods_cart_list_count_num').html() - 1;
            id && dec(id);
            id && runOnApp && (function() {
                var name = $t.attr('data-name');
                var price = $t.attr('data-price');
                api.execScript({
                    name: 'root',
                    script: 'updateAppCart("' + id + '","' + name + '","' + price + '","' + num + '")'
                });
            })();
            //增加抽屉动画
            if (num <= 0) {
                var item = $("#item_count_" + id).parent().find('.plus');
                item.parent().removeClass('mod_item_count_active');
            }
        });

        //点击购物车加号
        $(".goods_cart_list_plus").die().live("tap", function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.event.cancelBubble = true;
            var listCount = $(this).parent();
            var $t = listCount.parent();
            var id = $t.attr('data-id');
            var num = listCount.find('.goods_cart_list_count_num').html() - 1;
            if (!regionId) {
                $('.area_top_tip').trigger('tap');
                return;
            }
            var first_limit = $t.attr('data-first');
            var second_limit = $t.attr('data-second');

            // 小苹果,没人先点一份
            if (parseInt($t.attr('data-price')) <= 0 && $t.attr('data-name') == '鲜切水果' && parseInt($t.parent().find('input').val()) > 0) {
                Dialog.alert('亲~每人限送一份哦~~');
                return false;
            }
            id && add(id, second_limit, $("#item_count_" + id).parent().find('.plus'));
            id && runOnApp && (function() {
                var name = $t.attr('data-name');
                var id = $t.attr('data-id');
                var price = $t.attr('data-price');
                api.execScript({
                    name: 'root',
                    script: 'updateAppCart("' + id + '","' + name + '","' + price + '","' + num + '")'
                });
            })();
        });
    }

    function setShoppingCart(param_id, type) {
        var id = param_id;
        var count = parseInt($("#item_count_" + id).val());
        if (type == 1) {
            count += 1;
        } else {
            if (count === 0) {
                return false;
            }
            count -= 1;
        }
        var state = false;
        $.ajax({
            type: 'POST',
            url: globalUrl + 'json.php?mod=main&act=setShoppingCart',
            data: {
                id: id,
                count: count
            },
            dataType: 'json',
            timeout: 3000,
            async: false,
            success: function(data) {
                if (data.errCode == -1001) {
                    api.execScript({
                        name: 'root',
                        script: 'LoginShow();'
                    });
                    return;
                }
                if (data['errCode'] == 0) {
                    state = true;
                } else {
                    alert(data['errMsg'])
                }
            },
            error: function(xhr, type) {
                Dialog.alert("…(⊙_⊙;)… 您网络不太好，请重试~", function() {});
            }
        });
        return state;
    }
    var $cart_list = $("#cart_list");
    var goods_cart_mask = $(".goods_cart_mask");
    showBuy();

    // 显示或隐藏购物详情
    function showOrHideGoodsList(flag) {
        // 没点套餐的时候 不展示
        if ($('#cart_list_show').find('li').length === 0) {
            return false;
        }
        if (goods_cart_mask.css('display') == 'none' && flag !== 'hidden') {

            $cart_list.removeClass('goods-cart-down');
            $cart_list.addClass('goods-cart-up');

            goods_cart_mask.removeClass('goods-cart-mask-hide');
            goods_cart_mask.css('display', 'block');
            goods_cart_mask.addClass('goods-cart-mask-show');
            myscroll.refresh();
            //myscroll._resize();
            _hmt.push(['_trackEvent', '套餐列表-查看购物车', '套餐列表-查看购物车']);
        } else {
            $cart_list.removeClass('goods-cart-up');
            $cart_list.addClass('goods-cart-down');

            goods_cart_mask.removeClass('goods-cart-mask-show');
            goods_cart_mask.addClass('goods-cart-mask-hide');

            //延迟480毫秒  防止有时闪屏
            setTimeout(function() {
                goods_cart_mask.css('display', 'none');
            }, 450);
        }
    }
    $("#goods_cart_price").tap(function(e) {
        e.preventDefault();
        e.stopPropagation();
        showOrHideGoodsList();
    });
    $(".goods_cart_mask").tap(function(e) {
        //点击遮罩
        if (e.target.className.indexOf("goods_cart_mask") >= 0) {
            e.preventDefault();
            e.stopPropagation();
            $("#goods_cart_price").triggerHandler('tap');
        }
    });
    $(".goods_cart_mask").on("touchmove", function(e) {
        e.preventDefault();
    });
    // 确认订餐按钮
    $("#order").tap(function() {

        // 当不满30的时候,自动帮用户领取10元券,并提示用户点汤和小时可立减10元
        try {
            var allPrice = parseInt($('#show_all_price').html().replace('¥', ''));

            // 订单总价为0的时候,点击确认订餐不跳转
            if (allPrice < 15) {
                Dialog.alert('订单满15免费起送哦~');
                return false;
            }
            if (tomorrowBook) {
                submitOrder();
                return false;
            }
            if (allPrice >= 25 && allPrice < 30) {
                //增加小食选择提醒
                $(".buy_mask").show();
            } else {
                submitOrder();
            }
        } catch (e) {}
    });

    // 提交订单
    function submitOrder() {
        if (canSubmit == 1) {
            //增加订餐日期提醒
            var nowDate = new Date(),
                nowDay = nowDate.getDay(),
                nowHours = nowDate.getHours(),
                nowTime = nowDate.getTime();
            if (tomorrowBook) {
                // 预订明日增加alert提示,避免用户以为点的是今天的餐
                Dialog.confirm({
                    content: '您确认预订<span style="color:#E24E4E;">' + (nowHours >= 14 ? '后天' : '明天') + ' (周' + '日一二三四五六'.charAt(new Date().getDay() + (nowHours >= 14 ? 2 : 1)) + ')</span>的午餐吗?',
                    buttons: {
                        "confirm": {
                            "title": '我要订' + (nowHours >= 14 ? '明天' : '今天') + '的',
                            "click": function() {
                                _hmt.push(['_trackEvent', '预订明日-取消下单', '预订明日-取消下单']);
                                window.location.href = globalUrl + "weixin.php?mod=main&act=goodList&from=indexIcon";
                            }
                        },
                        "close": {
                            "title": "确认预订",
                            "click": function() {
                                //验证绑定
                                checkLockPhone(dataMobile);
                                _hmt.push(['_trackEvent', '预订明日-确定下单', '预订明日-确定下单']);
                            }
                        }
                    }
                });
                return;

            }

            if (false) {
                //nowTime >= 1443542400000 && nowTime <= 1444147200000
                //节假日手动处理
                Dialog.confirm({
                    content: '元旦休息中，您的订单将于<span style="color:#E24E4E;">1月4日（周一）中午</span>配送...',
                    buttons: {
                        "confirm": {
                            "title": "我再考虑下",
                            "click": function() {
                                _hmt.push(['_trackEvent', '节假日点餐-取消下单', '节假日点餐-取消下单']);
                            }
                        },
                        "close": {
                            "title": "预订工作午餐",
                            "click": function() {
                                //验证绑定
                                checkLockPhone(dataMobile);
                                _hmt.push(['_trackEvent', '节假日点餐-确定下单', '节假日点餐-确定下单']);
                            }
                        }
                    }
                });
            } else if (nowDay > 5 || nowDay == 0 || (nowDay == 5 && nowHours >= 14)) {
                //仅周末可订餐
                if (nowDay == 0 && nowHours > 20) {
                    checkLockPhone(dataMobile);
                } else {
                    Dialog.confirm({
                        content: '<span style="color:#E24E4E;">周末暂不送餐！</span>您的订单将在周一中午配送...',
                        buttons: {
                            "confirm": {
                                "title": "我再考虑下",
                                "click": function() {
                                    _hmt.push(['_trackEvent', '周末点餐-取消下单', '周末点餐-取消下单']);
                                }
                            },
                            "close": {
                                "title": "预订周一午餐",
                                "click": function() {
                                    //验证绑定
                                    checkLockPhone(dataMobile);
                                    _hmt.push(['_trackEvent', '周末点餐-确定下单', '周末点餐-确定下单']);
                                }
                            }
                        }
                    });
                }
            } else {
                //获取下时间
                var text = checkTime();
                var infoText = '';
                var trackText, confirmText = '预订午餐',
                    cancelText = '我再考虑下';
                if (nowHours >= 0 && nowHours < 14) {
                    if (text) {
                        confirmText = '确认下单';
                        cancelText = '看看别的';
                        trackText = '第二批配送';
                        infoText = '您的餐将在<span style="color:#E24E4E;">12:00~12:30</span>左右送达...';
                    } else {
                        //验证绑定
                        checkLockPhone(dataMobile);
                        return;
                    }
                } else if (nowHours >= 14) {
                    confirmText = '预订明日午餐';
                    trackText = '下午点餐';
                    if (text) {
                        infoText = '<span style="color:#E24E4E;">暂不提供晚餐</span>，您的订单将在明天中午配送...';
                    } else {
                        infoText = '<span style="color:#E24E4E;">暂不提供晚餐</span>，您的订单将在明天中午配送...';
                    }
                }
                //提示语
                Dialog.confirm({
                    content: infoText,
                    buttons: {
                        "confirm": {
                            "title": cancelText,
                            "click": function() {
                                _hmt.push(['_trackEvent', trackText + '-取消下单', trackText + '-取消下单']);
                            }
                        },
                        "close": {
                            "title": confirmText,
                            "click": function() {
                                //验证绑定
                                checkLockPhone(dataMobile);
                                _hmt.push(['_trackEvent', trackText + '确认下单', trackText + '-确认下单']);
                            }
                        }
                    }
                });
            }
        } else {
            Dialog.alert("亲~请点击➕选择套餐哦~", function() {});
            _hmt.push(['_trackEvent', '确认订餐-没选择套餐', '确认订餐-没选择套餐']);
        }

        //验证手机号绑定并跳转
        function checkLockPhone(data) {
            var redirectUrl = globalUrl + 'weixin.php?mod=';
            redirectUrl += data !== 'bind' ? 'mobilebind&act=gotobind&from=indexIcon' : "main&act=order&from=indexIcon";
            window.location.href = redirectUrl;
        }
    }

    // 是否有第二批配送的套餐
    function checkTime() { // 指定某个套餐
        var items = $('.mod_item_count');
        var second_time = null;
        var text = [];
        for (var i = 0; i < items.length; i++) {
            var input_val = parseInt($(items[i]).children('input').val());
            var first_limit = parseInt($(items[i]).children('.plus').attr('data-first'));
            var second_limit = parseInt($(items[i]).children('.plus').attr('data-second'));
            var is_cf = parseInt($(items[i]).children('.plus').attr('data-iscf'));
            var name = $(items[i]).children('.plus').attr('data-name');
            if (input_val > 0 && input_val > first_limit && input_val <= second_limit) {
                if (is_cf == '0') {
                    second_time = true;
                    text.push(name);
                };
            }
        };
        if (second_time) {
            return text;
        } else {
            return false;
        }
    }

    // 当前正在点的套餐是否有第二批配送
    function isBatch2(item) { // 指定某个套餐
        var input_val = parseInt($(item).children('input').val());
        var first_limit = parseInt($(item).children('.plus').attr('data-first'));
        var is_cf = parseInt($(item).children('.plus').attr('data-iscf'));
        var name = $(item).children('.plus').attr('data-name');
        if (input_val >= first_limit) {
            if (is_cf == '0') {
                return true
            };
        }
        return false;
    }

    /**倒计时*/
    setTimeout(function() {
        $("#wait_time").animate({
            opacity: 0
        }, 1000, 'ease-out', function() {
            $("#wait_time").hide();
        });
    }, 2000);
    $("#jump").on("click", function() {
        $("#wait_time").hide();
    });

    // 明日订购
    $(".tom_btn div, .good-list-fixed, .chicken_sold_out, .salad_sold_out").on("click", function(event) {
        $(".tom_mask").hide();
        event.stopPropagation();
        event.preventDefault();
        setTimeout(function() {
            var href = globalUrl + 'weixin.php?mod=main&act=goodList&tomorrow_book=1&is_yuding=1&from=indexIcon';
            //runOnApp ? window.location.href = href : ($('#a-click').attr('href', href),$('#span-click').triggerHandler('click'));
            if (runOnApp) {
                var callback = "openLinkWindow('" + href + "');";
                // 调用root窗口里的打开新窗口方法打开此链接
                api.execScript({
                    name: 'root',
                    script: callback
                });
            } else {

                window.location.href = href;
            }
        }, 300);
    });

    $(".tom_xx").on("click", function() {
        $(".tom_mask").hide();
    });

    // 商品大图增加加入购物车功能
    var img_mask_scroll = new IScroll("#img_mask");
    $(".mod_img_top").on("click", function(event) {
        if ($(event.target).hasClass('good-list-fixed')) {
            window._hmt.push(['_trackEvent', '套餐列表-售罄后', '套餐列表-售罄后-预订-{{$good.name}}']);
        } else {
            window._hmt.push(['_trackEvent', '套餐列表-点击套餐图片', '套餐列表-点击套餐图片']);
        }
        //移除上一张图
        $(".goods_info_img").children("img").attr('src', "");
        var retina_src = $(this).children('img').attr("retina-src");
        var id = $(this).parent().parent().find(".reduce").data("id");
        var downImg = new Image();
        $(downImg).on("load", function() {
            $(".goods_info_img").children("img").attr('src', retina_src);
            //刷新滚动
            setTimeout(function() {
                img_mask_scroll.refresh();
            }, 0);
        });
        downImg.src = retina_src;
        $('.img_mask').show().animate({
            opacity: 1
        }, 500, 'ease', function() {});
        $(".goods_info_img").children("img").attr('src', retina_src);
        $(".goods_info_img").children("a").data('id', id);
    });

    $(".img_mask").on("tap", ".trigger_add", function() {
        var id = $(this).data("id");
        $("#plus_" + id).parent().parent().find(".buy_item_btn_plus").triggerHandler("tap");
        $(".close_img_mask").triggerHandler("tap");
    });

    $(".close_img_mask").on("tap", function() {
        $('.img_mask').animate({
            opacity: 0
        }, 500, 'ease', function() {}).hide();
    });

    // 修复安卓滑动时候，触发外层闪动
    $(".main_wrap").on("touchmove", function(event) {
        if (!$(".img_mask").is(":hidden")) {
            event.preventDefault();
        }
    });

    // 活动跳转限制
    $(".jump315").on("click", function() {
        if (!regionId) {
            $('.area_top_tip').triggerHandler('tap');
            return false;
        }
        if (dataMobile !== 'bind') {
            window.location.href = globalUrl + 'weixin.php?mod=mobilebind&act=gotobind&from=indexIcon';
            return false;
        };
    });

    // 清除app页面选择的商品数据
    function clearAppCart() {
        var arr = $(".mod_item_count");
        for (var i = 0; i < arr.length; i++) {
            if ($(arr[i]).hasClass('mod_item_count_active')) {
                $(arr[i]).removeClass("mod_item_count_active");
                $(arr[i]).find('input').val(0);
            }
        }
    }

    // smallApple限制
    $(".smallApple").on("click", function() {
        var nowDate = new Date(),
            nowDay = nowDate.getDay(),
            nowHours = nowDate.getHours();
        if (nowDay >= 1 && nowDay <= 5) {
            if (nowHours > 0 && nowHours < 14) {
                window.location.href = globalUrl + 'weixin.php?mod=main&act=goodList&tomorrow_book=1&from=indexIcon';
            } else if (nowHours >= 14 && nowHours <= 23) {
                $body.scrollTop($('#goodList').offset().top);
            }
        } else if (nowDay == 0) {
            $body.scrollTop($('#goodList').offset().top);
        }
    });

    //增加小食例汤提醒
    $('.buy_container .buy_item').on('click', function() {
        $(".buy_checkbox").removeClass("active");
        $(this).find('.buy_checkbox').addClass("active");
    });
    $(".buy_gray").on("click", function() {
        $(".buy_mask").hide();
        submitOrder();
    });
    $(".buy_yellow").on("click", function() {
        $(".buy_mask").hide();
        var id = $(".buy_checkbox.active").data('id');
        //加购物车
        if (setShoppingCart(id, 1)) {
            //领取饭票
            $.ajax({
                type: 'POST',
                url: globalUrl + 'json.php?mod=main&act=get_full_cut',
                data: {
                    money: 10
                },
                dataType: 'json',
                success: function(data) {
                    submitOrder();
                },
                error: function(xhr, type) {
                    Dialog.alert("…(⊙_⊙;)… 您当前网络不太好，请重试~", function() {});
                }
            });
        }
    });

    // 新用户弹窗
    // $body.attr('data-isNewUser') == 1 && $body.attr('data-couponForNewUser') == 1 && (function() {
    thisPageObj.isNewUser == 1 && thisPageObj.couponForNewUser == 1 && (function() {
        var dialogHtml = [
            '<div id="new_user_get_dialog">',
            '   <div class="outer">',
            '       <div class="inner"><div class="get"></div><img src="http://i1.app.fan-gao.cn/static/img/new_user_get.jpg"></div>',
            '       <div class="inner last"><div class="ok"></div><img src="http://i1.app.fan-gao.cn/static/img/new_user_get_ok.jpg"></div>',
            '   </div>',
            '</div>'
        ].join('');
        var $dialog = $(dialogHtml);
        var $animteDom = $dialog.find('.outer').css({
            paddingLeft: $(window).width() * (1 - 0.777) / 2
        });
        $dialog.find('.inner').css({
            "width": $(window).width() * 0.777 + 'px',
            "height": $(window).width() * 0.777 * (623 / 366) + 'px'
        });
        $('body').append($dialog);

        $animteDom.find('.get').on('click', function() {
            $(this).off();
            var requestUrl = '/json.php?mod=newuseractivity&act=getNewUserCoupons';
            $.getJSON(requestUrl, function(data) {
                !data.errCode && $animteDom.animate({
                    translate3d: (0.8885 * $(window).width() - $animteDom.width()) + 'px,0, 0'
                }, 500, 'ease-out');
                data.errCode && Dialog.alert(data.errMsg, function() {
                    $animteDom.find('.ok').click();
                });
            });
        });
        $animteDom.find('.ok').on('click', function() {
            $('#new_user_get_dialog').animate({
                opacity: 0
            }, function() {
                $(this).remove();
            });
        });
    })();
    //点击banner
    $(".banner_jump").on("click", function(e) {
        var href = $(this).attr("jump");
        //x套餐需要选地址
        if (href.indexOf("xpackage") >= 0 && !regionId) {
            $('.area_top_tip').triggerHandler('tap');
            return false;
        }

        if (runOnApp) {
            var callback = "openLinkWindow('" + href + "');";
            // 调用root窗口里的打开新窗口方法打开此链接
            api.execScript({
                name: 'root',
                script: callback
            });
        } else {
            window.location.href = href;
        }
    });
    //点击x套餐
    $("#xpackage").on("click", function() {
        if (!regionId) {
            $('.area_top_tip').triggerHandler('tap');
            return false;
        }
        var href = "http://app.fan-gao.cn/weixin.php?mod=main&act=xpackage&x=4319418560";
        if (runOnApp) {
            var callback = "openLinkWindow('" + href + "');";
            // 调用root窗口里的打开新窗口方法打开此链接
            api.execScript({
                name: 'root',
                script: callback
            });
        } else {
            window.location.href = href;
        }
    });

    //统计启动页和banner的点击量
    $('#startUp, .swiper-slide').on('tap', function() {

        var dataId = $(this).data('id');
        $.ajax({
            type: 'POST',
            url: globalUrl + 'json.php?mod=main&act=counting',
            data: {
                id: dataId
            },
            dataType: 'json',
            success: function() {
                //统计点击数量，不需要回调方法
            },
            error: function() {}
        });
    });

    // 地址切换功能
    FG.require('mod/main/goodList-pickAddress.js', function() {
        $('.area_top_tip').css('height', 0).show().animate({
            height: (runOnApp ? 0 : '2rem')
        });
    });

    // 微信下旋转屏幕会有页面部分区域黑屏的现象，暂时重绘处理
    $(window).on('orientationchange', function() {
        var nowScroll = $(window).scrollTop() / $body.height();
        $body.addClass('none');
        setTimeout(function() {
            $body.removeClass('none');
            $(window).scrollTop(nowScroll * $body.height());
        }, 0);
    });

    // 临时加上餐品额外说明
    $('.mod_item_name').each(function(i, el) {
      var infoStr = i < 6 ? '(含配菜、小菜、米饭各一份)' : '(含米饭一份)';
      i < 7 && $(el).css('position', 'relative').append('<span style="position: absolute; right: 0; top: 0; font-size: 0.6rem; color: #f55365;">' + infoStr + '</span>');
    });

})();
