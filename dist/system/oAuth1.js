System.register(['aurelia-framework', './authUtils', './storage', './popup', './baseConfig'], function (_export) {
  'use strict';

  var inject, authUtils, Storage, Popup, BaseConfig, OAuth1;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_aureliaFramework) {
      inject = _aureliaFramework.inject;
    }, function (_authUtils) {
      authUtils = _authUtils['default'];
    }, function (_storage) {
      Storage = _storage.Storage;
    }, function (_popup) {
      Popup = _popup.Popup;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }],
    execute: function () {
      OAuth1 = (function () {
        function OAuth1(storage, popup, config) {
          _classCallCheck(this, _OAuth1);

          this.storage = storage;
          this.config = config.current;
          this.popup = popup;
          this.client = this.config.client;
          this.defaults = {
            url: null,
            name: null,
            popupOptions: null,
            redirectUri: null,
            authorizationEndpoint: null
          };
          this.current = {};
        }

        _createClass(OAuth1, [{
          key: 'open',
          value: function open(options, userData) {
            var _this = this;

            this.current = authUtils.extend({}, this.defaults, options);

            var serverUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.current.url) : this.current.url;

            if (this.config.platform !== 'mobile') {
              this.popup = this.popup.open('', this.current.name, this.current.popupOptions, this.current.redirectUri);
            }

            return this.client.post(serverUrl).then(function (response) {
              if (_this.config.platform === 'mobile') {
                _this.popup = _this.popup.open([_this.defaults.authorizationEndpoint, _this.buildQueryString(response)].join('?'), _this.defaults.name, _this.defaults.popupOptions, _this.defaults.redirectUri);
              } else {
                _this.popup.popupWindow.location = [_this.defaults.authorizationEndpoint, _this.buildQueryString(response)].join('?');
              }

              var popupListener = _this.config.platform === 'mobile' ? _this.popup.eventListener(_this.defaults.redirectUri) : _this.popup.pollPopup();

              return popupListener.then(function (result) {
                return _this.exchangeForToken(result, userData);
              });
            });
          }
        }, {
          key: 'exchangeForToken',
          value: function exchangeForToken(oauthData, userData) {
            var data = authUtils.extend({}, userData, oauthData);
            var exchangeForTokenUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.current.url) : this.current.url;
            var credentials = this.config.withCredentials ? 'include' : 'same-origin';

            return this.client.post(exchangeForTokenUrl, data, { credentials: credentials });
          }
        }, {
          key: 'buildQueryString',
          value: function buildQueryString(obj) {
            var str = [];

            authUtils.forEach(obj, function (value, key) {
              return str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            });

            return str.join('&');
          }
        }]);

        var _OAuth1 = OAuth1;
        OAuth1 = inject(Storage, Popup, BaseConfig)(OAuth1) || OAuth1;
        return OAuth1;
      })();

      _export('OAuth1', OAuth1);
    }
  };
});