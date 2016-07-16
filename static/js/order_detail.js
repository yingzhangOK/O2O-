;
$(function () {
    var _body = $('body');
    var runOnApp = _body.attr('data-runOnApp');
    var globalUrl = _body.attr('data-globalUrl');
    var cancelMsg = _body.attr('data-cancelMsg');

    window.choicePayType = choicePayType;
    window.cancelOrder = cancelOrder;
    window.OrderStateUpdate = OrderStateUpdate;
    //支付方式选择
    function choicePayType(id, price) {
        var order_id = id;
        var money = price;
        $(".choice_sub span").html("合计：" + money + "元");
        $(".component_choice").show().attr("id", order_id);
    }
    $(".choice_item").on("click", function () {
        $(".choice_radio").removeClass("choice_active")
        $(this).children(".choice_radio").addClass("choice_active");
    });

    runOnApp && $(".pay_btn").on("click", function () {
        var order_id = $(".component_choice").attr("id");
        var type = $(".choice_active").attr("itemtype");
        if (type == 'UnionPay') {
            (function () {
                var requestUrl = globalUrl + "weixin.php?mod=main&act=UnionPay&order_id=" + order_id;
                var pay_info, tempForm;
                $.getJSON(requestUrl, function (data) {
                    if (data.errCode == 1000) {
                        pay_info = data.payment_info;
                        tempForm = document.createElement("form");
                        tempForm.name = "order";
                        tempForm.method = "post";

                        var hideInput = undefined;
                        //装载表单内容
                        for (var item in pay_info) {
                            if (item == 'url') {
                                url = pay_info[item];
                            } else {
                                hideInput = document.createElement("input");
                                hideInput.setAttribute('type', 'text');
                                hideInput.setAttribute('value', pay_info[item]);
                                hideInput.setAttribute('name', item);
                                tempForm.appendChild(hideInput);
                            }
                        }
                        tempForm.action = url;
                        document.body.appendChild(tempForm);
                        tempForm.submit();
                        document.body.removeChild(tempForm);
                    } else {
                        Dialog.alert(data.errMsg);
                    }
                });
            })();
            return;
        }
        if (type != "arrival") {
            var url = globalUrl + "weixin.php?mod=main&act=" + type + "&order_id=" + order_id;
            location.href = url;
        } else {
            alert("暂无");
        }
    });

    $(".close_choice").on("click", function () {
        $(".component_choice").hide();
    });
    //订单取消
    function cancelOrder(orderId) {
        Dialog.confirm({
            content: cancelMsg || "亲~您确定要取消这个饭单吗？",
            buttons: {
                "confirm": {
                    title: "确定",
                    click: function () {
                        $.ajax({
                            type: 'POST',
                            url: globalUrl + 'json.php?mod=main&act=cancelorder',
                            data: {
                                order_id: orderId
                            },
                            dataType: 'json',
                            success: function (data) {
                                if (data.errCode == 0) {
                                    Dialog.alert("饭单已成功取消，欢迎再次选购饭高午餐~(如已支付,退款2-5个工作日到账)", function () {
                                        location.href = location.href;
                                    });
                                } else {
                                    Dialog.alert(data.errMsg, function () {});
                                }
                            },
                            error: function (xhr, type) {
                                Dialog.alert("…(⊙_⊙;)… 您网络不太好，请重试~", function () {

                                });
                            }
                        });
                    }
                }
            }
        });
    }

    function OrderStateUpdate(self, id) {
        var id = id;
        var self = self;
        Dialog.confirm({
            content: '您是否确认领餐',
            buttons: {
                "close": {
                    "title": "取消",
                    "click": function () {}
                },
                "confirm": {
                    "title": "<span style='color: #ff0000;'>确认领餐</span>",
                    "click": function () {
                        $.ajax({
                            url: globalUrl + "json.php?mod=main&act=OrderStateUpdate",
                            type: "POST",
                            dataType: "json",
                            data: {
                                "id": id
                            },
                            success: function (result) {
                                if (result.errCode == '-1') {
                                    alert(result.errMsg);
                                } else {
                                    self.className = "grey";
                                    self.innerHTML = "已领取";
                                }
                            },
                            error: function (xhr, type) {
                                Dialog.alert("…(⊙_⊙;)… 您网络不太好，请重试~", function () {});
                            }
                        });
                    }
                }
            }
        });
    }

});
