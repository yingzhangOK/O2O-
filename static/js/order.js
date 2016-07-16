;$(function() {

    // 设备横竖屏幕探测，依赖于zepto，global，dialog
    (function(x) {
        x.addEventListener("resize", function() {
            G.app.common.resize(x, true);
        });
        G.app.common.resize(x, true);
        window.onload = function() {
            G.app.common.resize(x, true);
            FastClick.attach(document.body);
        }
        window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", G.app.common.orientationChange, false);
    })(window);

    // copy from static/js/index.js
    var _body = $('body');
    var WH = $(window).height();

    //环境切换
    var globalUrl = _body.attr('data-globalUrl'); //'{{$__host__}}';
    var pay_type_default = _body.attr('data-payTypeDefault'); // '{{if isset($data.pay_type_default)}}{{$data.pay_type_default}}{{else}}0{{/if}}';
    var allPriceHere = _body.attr('data-allPriceHere'); // '{{$data.allPrice|string_format:"%.2f"}}';
    var is_3rd_delivery = _body.attr('data-is3rdDelivery'); // '{{if $data.is_3rd_delivery eq 1}}';
    var sent2upstair = _body.attr('data-sent2upstair'); // '{{if $data.sent2upstair eq 1}}';
    var third_d_fee = _body.attr('data-thirdDfee'); // '{{$data.third_d_fee}}';
    var dct_all_total_price = _body.attr('data-dctAllTotalPrice'); // '{{$data.dct_all.total_price}}';
    var runOnApp = _body.attr('data-runOnApp'); // '{{if !empty($__IS_APP__)}}true{{/if}}'
    var dct_all_did = _body.attr('data-dctAllDid'); //  '{{$data.dct_all.did}}';
    var dct_all_isdbook = _body.attr('data-dctAllIsdbook'); //  '{{$data.dct_all.isdbook}}';
    var dct_all_dvalue = _body.attr('data-dctAllDvalue'); //  '{{$data.dct_all.dvalue}}';

    /* 阻止事件穿透 */
    FastClick.attach(document.body);

    // 初始化套餐组合 预付码的情况
    if (pay_type_default == 4) {
        $('#sku_booking_view').hide();
        $(".dct_coupons").hide();
    }

    /* 支付方式选择 */
    var $pay_list = $('.order_payway_cont');
    $('.pay_select').tap(function() {
        $pay_list.find('.pay_select').removeClass('status_on');
        $(this).addClass('status_on');
        if ($(this).attr("v") == 4) {
            //如果是预购码隐藏优惠券
            $(".order_dct li:not(.dct_dish)").hide();
            $("#show_all_price").html('￥' + allPriceHere);
        } else {
            $(".order_dct li").show();
            //触发选择的饭票重新计算总价
            $(".dct-selected-bk").triggerHandler("tap");
        }
        // 支付切换，预售码的时候隐藏套餐组合
        if ($(this).attr('id') == 'pay_ygpay') {
            $('#sku_booking_view').hide();
            $(".combination_status").html('').removeAttr('status');
            $('.combination span').removeClass('active').html("添加");
        } else {
            $('#sku_booking_view').show();
        }
    });

    /* 优惠组合 */
    $(".combination span").on("click", function() {
        if ($(this).hasClass("active")) {
            $('#pay_ygpay').show();
            $(this).removeClass("active").html("添加");
            $(".combination_status").html("").removeAttr("status");

            if ($(".dct-selected-bk").length > 0) {
                $(".dct-selected-bk").triggerHandler("tap");
            } else {
                // 修复order_dct里面的所有优惠
                var otherMoney = 0;
                if ($('.order_dct li').length >= 0) {
                    var LiItems = $('.order_dct li');
                    for (var i = 0; i < LiItems.length; i++) {
                        otherMoney = otherMoney + parseFloat($(LiItems[i]).data('m'));
                    }
                }
                // 订单总价处理
                var total_price = dct_all_total_price || 0;
                var tmp_ps = 0;
                var p = total_price - tmp_ps - otherMoney;
                p = (p < 0 || total_price === 0) ? 0 : p;
                if (is_3rd_delivery) {
                    total_price = (dct_all_total_price + third_d_fee) || 0;
                    p = p - parseFloat(third_d_fee);
                    if (parseFloat(p) >= 30) {
                        $("#transport_fee .order_cur_price").html('<span class="yang">￥</span>0.00');
                    } else {
                        p = p + parseFloat(third_d_fee);
                        $("#transport_fee .order_cur_price").html('<span class="yang">￥</span>4.00');
                    }
                }
                // 优惠组合加价
                if ($(".combination_status").attr("status") == 1) {
                    p = p + parseFloat($(".combination_goods").children(".order_cur_price_w").attr("price"));
                }
                $pay_total_show.text('￥' + p.toFixed(2));
                $pay_total_show.attr('tmp_total', p);
                $order_dct.attr('total', tmp_ps);
            }
        } else {
            $('#pay_ygpay').hide();
            var stroe_price = parseFloat($(".combination_goods").children(".order_cur_price_w").attr("price")) + parseFloat($("#show_all_price").html().slice(1, $("#show_all_price").html().length));
            is_3rd_delivery && (stroe_price = stroe_price + 4);
            $(this).addClass("active").html("取消");
            $(".combination_status").html("已购买").attr("status", 1);
            $("#show_all_price").html("￥" + stroe_price.toFixed(2));
        }
    });

    /* 代金卷弹出层 */
    var $dct_win = $('.dct-win');
    var $dct_close = $('.dct-close');
    var $dct_coupons = $('.dct_coupons');
    var $dct_list = $('.dct-list');
    var $order_dct = $('.order_dct');
    var $pay_total_show = $('.goods_cart_price_num');
    $dct_win.css('top', -5000).show().css('top', -1 * ($dct_win.height() + 10)).hide();

    function show_coupon_selector() {
        $dct_win.show().animate({
            top: 0
        }, 500, 'ease', function() {});
        _hmt.push(['_trackEvent', '订单确认', '打开优惠券']);
    }

    function hide_coupon_selector() {
        $dct_win.animate({
            top: -1 * $dct_win.height()
        }, 500, 'ease', function() {
            $dct_win.hide();
        });
    }

    $dct_close.tap(function() {
        var s = $dct_win.attr('state');
        if (s == null || s == 0) {
            show_coupon_selector();
            $dct_win.attr('state', 1);
        } else {
            hide_coupon_selector()
            $dct_win.attr('state', 0);
        }
    });

    $dct_coupons.tap(function() {
        show_coupon_selector();
        $dct_win.attr('state', 1);
    });

    $dct_list.find('li').on('tap', function(e) {
        //过滤不可用饭票
        if ($(this).hasClass("dct-selected-gray")) {
            return;
        }
        //预订优惠，签到饭票升值
        $(".zzMoney").remove();
        var ZZmoney = 0;
        if ($(this).attr('t') == 'prize' && $(this).attr('v') == dct_all_did && dct_all_isdbook == 1) {
            ZZmoney = dct_all_dvalue;
            $(".order_dct").append('<li class="zzMoney" t="dish" v="0" data-m="' + dct_all_dvalue + '"><span>预订优惠</span><i class="arrow_right fr" style="padding:7px;"></i><strong>-￥' + dct_all_dvalue + '</strong></li>')
        } else {
            ZZmoney = 0;
            $(".zzMoney").remove();
        }
        //修复order_dct里面的所有优惠
        var otherMoney = 0;
        if ($('.order_dct li').length >= 2) {
            var LiItems = $('.order_dct li');
            for (var i = 1; i < LiItems.length; i++) {
                otherMoney = otherMoney + parseFloat($(LiItems[i]).attr('data-m'));
            }
        }
        // 订单总价处理
        var total_price = (dct_all_total_price + third_d_fee) || 0;
        var tmp_ps = parseFloat($(this).attr('p'));
        var p = total_price - tmp_ps - otherMoney;
        p = (p < 0 || total_price === 0) ? 0 : p;
        if (is_3rd_delivery) {
            //达达配送费30元优惠处理
            //减掉配送费用
            p = p - parseFloat(third_d_fee);
            if (parseFloat(p) >= 30) {
                $("#transport_fee .order_cur_price").html('<span class="yang">￥</span>0.00');
            } else {
                p = p + parseFloat(third_d_fee);
                $("#transport_fee .order_cur_price").html('<span class="yang">￥</span>4.00');
            }
        } //优惠组合加价
        if ($(".combination_status").attr("status") == 1) {
            p = p + parseFloat($(".combination_goods").children(".order_cur_price_w").attr("price"));
        }
        $pay_total_show.text('￥' + p.toFixed(2));
        $pay_total_show.attr('tmp_total', p);
        $order_dct.attr('total', tmp_ps); // 优惠劵列表处理
        $dct_coupons.attr('v', $(this).attr('v'));
        $dct_list.find('li').removeClass('dct-selected-bk');
        $(this).addClass('dct-selected-bk');
        $dct_coupons.find('strong').text('-￥' + tmp_ps.toFixed(2));
        hide_coupon_selector();
        $dct_win.attr('state', 0);
        $dct_coupons.find('span').text($(this).attr('data-name'));
    });

    $('#submit').tap(function() {
        _hmt.push(['_trackEvent', '订单确认', '提交订单']);
        submit(this);
    });

    /* 提交订单 */
    function submit(e) {
        var buyInfos = _body.attr('data-buyInfos'); // '{{if !empty($data.buyInfos)}}true{{/if}}';
        if (!buyInfos)
            return;
        var username = $.trim($("#username").val());
        var mobile = $.trim($("#mobile").attr('value'));
        var address = $.trim($("#address").val());
        var dis_id = $.trim($('#address_name').attr('v'));
        var is_shop = $.trim($('#address_name').attr('is_shop'));
        var address_name = $.trim($('#address_name').val());
        var pay_type = $('.status_on').attr('v');
        var validMsg = false,
            validField = null;
        var floor = $.trim($("#address_floor").val()) || 0;
        var expected_dt = $("#address_time span").text() || 0;
        if (username === '') {
            validField = $("#username");
            validMsg = '请输入用餐人姓名~方便我们送餐~';
        } else if (validMsg = valid_name(username)) {
            validField = $("#username");
        }

        var tomorrow_book = _body.attr('data-tomorrowBook'); // '{{$data.tomorrow_book}}',
        var is_booking = _body.attr('data-isBooking'); // '{{if isset({{$data.is_booking}})}}{{$data.is_booking}}{{else}}0{{/if}}',
        var goods_id = _body.attr('data-goodsId'); // '{{$data.buyInfos[0]["id"]}}',
        var is_extvalue = _body.attr('data-isExtvalue'); // '{{if isset({{$data.is_extvalue}})}}{{$data.is_extvalue}}{{else}}0{{/if}}',
        var is_christmas = _body.attr('data-isChristmas'); // '{{if isset({{$data.is_christmas}})}}{{$data.is_christmas}}{{else}}0{{/if}}',
        var is_act38 = _body.attr('data-isAct38'); // '{{if isset({{$data.is_act38}})}}{{$data.is_act38}}{{else}}0{{/if}}',
        var sp = _body.attr('data-sp'); // '{{$data.sp}}',
        var exvalue_id = _body.attr('data-exvalueId'); // '{{$data.exvalue_id}}',
        var snack_id = _body.attr('data-snackId'); // '{{$data.snack_id}}',
        var x = _body.attr('data-x'); // '{{$data.x}}',

        // 楼层验证数字
        if (sent2upstair) {
            if (floor) {
                var reg = new RegExp('^[0-9]*$');
                if (!reg.test(floor)) {
                    validMsg = '请输入楼层数，仅限数字~';
                    validField = $("#address_floor");
                }
            } else {
                validMsg = '请输入楼层数，仅限数字~';
                validField = $("#address_floor");
            }
        }

        // 第三方配送验证
        if (is_3rd_delivery && address === '') {
            validField = $("#address");
            validMsg = '请输入具体楼层门牌号~方便我们送餐~';
        }
        if (validMsg) {
            Dialog.alert(validMsg, function() {
                validField.focus();
            });
            return false;
        }

        /* 获取优惠信息 start */
        var dct_v = {};
        $order_dct.find('li').each(function() {
            var tmp_type = $(this).attr('t');
            var tmp_v = $(this).attr('v');
            if (tmp_type.length > 0 && tmp_v.length > 0) dct_v[tmp_type] = tmp_v;
        });

        /* 获取优惠信息 end */
        if (is_shop == 1) address = '';
        var $th = $(e);
        var s = $th.attr("s");
        if (s == 1) {
            $th.attr("s", "");
            $('#loading_mask').show();
            $('#loading').css('marginTop', -98 + $(document.body).scrollTop()).show();
            //优惠组合
            var sku_booking = $(".combination_status").attr("status") == 1 ? $(".combination_status").attr("id") : 0;
            $.ajax({
                type: 'POST',
                url: globalUrl + 'json.php?mod=main&act=ordersubmit',
                data: {
                    username: username,
                    mobile: mobile,
                    address: address,
                    is_shop: is_shop,
                    dis_id: dis_id,
                    paytype: pay_type,
                    address_name: address_name,
                    dct_v: dct_v,
                    tomorrow_book: tomorrow_book,
                    is_booking: is_booking,
                    goods_id: goods_id,
                    is_extvalue: is_extvalue,
                    is_christmas: is_christmas,
                    sku_booking: sku_booking,
                    is_act38: is_act38,
                    sp: sp,
                    exvalue_id: exvalue_id,
                    snack_id: snack_id,
                    'x': x,
                    floor: floor,
                    expected_dt: expected_dt
                },
                dataType: 'json',
                success: function(data) {
                    if (data.errCode == 0 || data.errCode == -11) {
                        // 清除goodlist页面的购物车商品信息
                        runOnApp && api.execScript({
                            name: 'root',
                            frameName: 'goodList',
                            script: 'clearAppCart();'
                        });

                        // 订单支付处理
                        if (data.pay_type == 1) {
                            WechatPay(data.orderId);
                        } else if (data.pay_type == 3) {
                            !runOnApp && (location.href = globalUrl + "weixin.php?mod=main&act=Alipay&order_id=" + data.orderId);
                            buyInfos && (function() {
                                $('#loading_mask').hide();
                                $('#loading').hide();
                                $('#pay_btn').attr('data-act', 'Alipay');
                                $('#pay_btn').attr('data-id', data.orderId);
                                $('#pay_btn').triggerHandler('click');
                            })();
                        } else if (data.pay_type == 4 && data.errCode == 0) {
                            location.href = globalUrl + "weixin.php?mod=main&act=ygPay&order_id=" + data.orderId;
                        } else {
                            location.href = globalUrl + "weixin.php?mod=main&act=orderList";
                        }
                    } else if (data.errCode == 100) {
                        // 订单已经支付成功,直接跳转到订单详情
                        location.href = globalUrl + "weixin.php?mod=main&act=orderDetail&id=" + data.orderId;
                    } else if (data.errCode == -2003) {
                        $('#loading_mask').hide();
                        $('#loading').hide();
                        Dialog.alert(data.errMsg, function() {
                            location.href = globalUrl + "weixin.php?mod=main&act=goodList";
                        });
                    } else {
                        $('#loading_mask').hide();
                        $('#loading').hide();
                        Dialog.alert(data.errMsg);
                    }
                },
                error: function(xhr, type) {
                    $('#loading_mask').hide();
                    $('#loading').hide();
                    Dialog.alert("…(⊙_⊙;)… 您网络不太好，请重试~", function() {
                        $th.attr("s", 1);
                        $th.text('确认下单');
                    });
                }
            });
        }
    }

    function valid_name(input_name) {
        if (!input_name.match(/^([\u4E00-\u9FA5])*$/)) {
            return '请输入中文姓名，方便送餐哦~'
        } else if (input_name.length < 2) {
            return '姓名一般是2个字及以上，请输入真实姓名方便送餐哦~'
        }
        return false;
    }

    function valid_mobile(input_phone) {
        if (!input_phone.match(/^0?(13[0-9]|15[012356789]|18[0-9]|14[57]|170|177)[0-9]{8}$/)) {
            return '手机号错误，请输入真实的手机号方便送餐哦~';
        }
        return false;
    } /* 微信支付 */
    function WechatPay(order_id) {
        !runOnApp && $.ajax({
            url: globalUrl + "json.php?mod=main&act=wxPay&ajax=ajax",
            type: "POST",
            dataType: "json",
            timeout: 10000,
            data: {
                "order_id": order_id
            },
            success: function(result) {
                // 测试站点支付判断
                if (result.errCode == 110111111) {
                    location.href = globalUrl + "weixin.php?mod=main&act=orderDetail&id=" + order_id;
                }
                // 正式站支付判断
                if (result.errCode == 0) {
                    $('#loading').hide();
                    wx.ready(function() {
                        wx.chooseWXPay({
                            timestamp: result.pay.timeStamp,
                            nonceStr: result.pay.nonceStr,
                            package: result.pay.package,
                            signType: result.pay.signType,
                            paySign: result.pay.paySign,
                            success: function(res) {
                                $('#loading_mask').hide();
                                $.ajax({
                                    type: "post",
                                    url: globalUrl + 'json.php?mod=main&act=OrderSuccess',
                                    data: {
                                        order_id: order_id
                                    },
                                    dataType: 'json',
                                    success: function(data) {
                                        if (data.is_first_order) {
                                            window.location.href = globalUrl + 'weixin.php?mod=newuseractivity&act=orderSuccessGuideView&sendType=' + data.send_type;
                                            return;
                                        }
                                        // 是否是预订订单
                                        if (data.is_jump == 'ok') {
                                            location.href = data.jump_url + "&id=" + order_id;
                                        } else {
                                            location.href = globalUrl + "weixin.php?mod=main&act=orderDetail&id=" + order_id;
                                        }
                                    },
                                    error: function() {}
                                });
                            },
                            cancel: function() {
                                $('#loading_mask').hide();
                                $('#loading').hide();
                                $.ajax({
                                    type: "post",
                                    url: globalUrl + 'json.php?mod=main&act=OrderPayError',
                                    data: {
                                        order_id: order_id
                                    },
                                    dataType: 'json',
                                    success: function(data) {
                                        location.href = globalUrl + "weixin.php?mod=main&act=orderDetail&id=" + order_id;
                                    },
                                    error: function() {}
                                });
                            },
                            fail: function() {
                                $('#loading_mask').hide();
                                $('#loading').hide();
                                $.ajax({
                                    type: "post",
                                    url: globalUrl + 'json.php?mod=main&act=OrderPayError',
                                    data: {
                                        order_id: order_id
                                    },
                                    dataType: 'json',
                                    success: function(data) {
                                        location.href = globalUrl + "weixin.php?mod=main&act=orderDetail&id=" + order_id;
                                    },
                                    error: function() {}
                                });
                            }
                        });
                    });
                } else {
                    $('#loading_mask').hide();
                    $('#loading').hide();
                    Dialog.alert(result.errMsg);
                }
            }
        });
        runOnApp && (function() {
            $('#loading_mask').hide();
            $('#loading').hide();
            $('#pay_btn').attr('data-act', 'wxPay');
            $('#pay_btn').attr('data-id', order_id);
            $('#pay_btn').triggerHandler('click');
        })();
    }
    // 测试点日期
    $("#address_time span").on("click", function() {
        $("#time_mask").show();
    });
    $(".date_item").on("click", function() {
        $(".date_span").removeClass("active");
        $(this).children("span").addClass("active");
        $("#address_time span").html($(this).text());
        $("#time_mask").hide();
    });
});
