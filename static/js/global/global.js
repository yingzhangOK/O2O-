;
(function (W) {
    var G = {};
    G.app = {};
    G.logic = {};
    G.ui = {};
    G.util = {};
    G.app.common = {
        orientationDlg: null,
        resize: function (x, other) {
            var v, u, t, tes,
                s = x.document,
                r = s.documentElement,
                a = r.getBoundingClientRect().width;
            if (!v && !u) {
                var n = !!x.navigator.appVersion.match(/AppleWebKit.*Mobile.*/);
                v = x.devicePixelRatio;
                tes = x.devicePixelRatio;
                v = n ? v : 1, u = 1 / v;
            }
            if (v <= 2 && a >= 960) {
                r.style.fontSize = "26px";
            } else {
                var fs = a / 320 * 20;
                r.style.fontSize = (fs > 26 ? 26 : fs) + "px";
            }
            if (other) {
                try {
                    $('#show_all_price').css('top', (50 - $('#show_all_price').height()) / 2)
                } catch (e) {};
            }
        },
        orientationChange: function () {
            switch (window.orientation) {
            case 0: // Portrait
                try {
                    G.app.common.orientationDlg.close();
                } catch (e) {}
            case 180: // Upside-down Portrait   
                // Javascript to setup Portrait view   
                break;
            case -90: // Landscape: turned 90 degrees counter-clockwise   
            case 90: // Landscape: turned 90 degrees clockwise   
                G.app.common.orientationDlg = Dialog.alert("亲~竖屏体验更好喔...", function () {});
                // Javascript to steup Landscape view   
                break;
            }
        }
    };
    W.G = G;
})(window);