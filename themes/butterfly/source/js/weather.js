(function (a, h, g, f, e, d, c, b) {
  b = function () {
    d = h.createElement(g);
    c = h.getElementsByTagName(g)[0];
    d.src = e;
    d.charset = "utf-8";
    d.async = 1;
    c.parentNode.insertBefore(d, c);
  };
  a["SeniverseWeatherWidgetObject"] = f;
  a[f] ||
    (a[f] = function () {
      (a[f].q = a[f].q || []).push(arguments);
    });
  a[f].l = +new Date();
  if (a.attachEvent) {
    a.attachEvent("onload", b);
  } else {
    a.addEventListener("load", b, false);
  }
})(
  window,
  document,
  "script",
  "SeniverseWeatherWidget",
  "//cdn.sencdn.com/widget2/static/js/bundle.js?t=" +
    parseInt((new Date().getTime() / 100000000).toString(), 10)
);
window.SeniverseWeatherWidget("show", {
  flavor: "slim",
  location: "WX4FBXXFKE4F",
  geolocation: true,
  language: "zh-Hans",
  unit: "c",
  theme: "auto",
  token: "3c462e8b-ce2b-4391-8296-b6bd1522ef46",
  hover: "enabled",
  container: "tp-weather-widget",
});
