// based on nd2 standart widget to support 2+ instances at same or different pages
// set ul data-role="nd2extTabs"
// each tabs collection has to be wrapped at data-role="nd2extTabs-container"
// nd2extTabs-container has to content only tabs

;(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self === 'object' && self.self === self && self) ||
            (typeof global === 'object' && global.global === global && global);

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'Waves', 'exports' ], function($, Waves, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      factory($, Waves, exports);
      return $;
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var $ = require('jquery');
    var Waves = require('Waves');
    factory(root, Waves, root);
  // Finally, as a browser global.
  } else {
    factory(root.jQuery || root.$, root.Waves || undefined, root);
  }

}(function($, Waves, exports) {
    "use strict";

    // nd2-tabs
    $.widget("nd2.extTabs", {
        options: {
            activeTab: false,
            activeIdx: 0,
            swipe: false
        },
        _create: function() {
            var _self = this;
            var el = this.element;

            if (el.data('swipe') !== undefined) _self.option('swipe',  el.data('swipe'));
            el.addClass("nd2Tabs");

            el.find("li[data-tab]").each(function(idx) {
                $(this).addClass("nd2Tabs-nav-item");
                if ($(this).data("tab-active") && !_self.options.activeTab) {
                    $(this).addClass("nd2Tabs-active");
                    _self.option('activeIdx', parseInt(toIdx, 10));
                    _self.option('activeTab', $(this).data("tab"));
                }
            });

            // Select First if activeTab is not set
            if (!_self.options.activeTab) {
                var firstEl = el.find("li[data-tab]").first();
                if (firstEl.length > 0) {
                    firstEl.addClass("nd2Tabs-active");
                    _self.option('activeTab', firstEl.data("tab"));
                } else {
                    _self.destroyTabs();
                }
            }

            // Bind Swipe Event
            if (_self.options.swipe) {
                $(el).nextAll('[data-role=nd2extTabs-container]').on("swipeleft", function(event) {
                    _self.changeNavTab(true);
                }).on("swiperight", function(event) {
                    _self.changeNavTab(false);
                });
            }

            // Waves.js
            if (typeof Waves !== "undefined") {
                Waves.attach('.nd2Tabs-nav-item', ['waves-button', 'waves-light']);
                Waves.init();
            }

            // Bind Events
            el.on("click", ".nd2Tabs-nav-item:not('.nd2Tabs-active')", function(e) {
                e.preventDefault();
                _self.switchTab($(this), $(this).data('tab'), $(this).closest('.nd2Tabs').find(".nd2Tabs-nav-item").index($(this)[0]));
            });

            if (_self.options.activeTab) {
                _self.prepareTabs();
            }

        },
        _update: function() {},
        refresh: function() {
            return this._update();
        },
        destroyTabs: function() {
            this.element.remove();
        },
        changeNavTab: function(left) {
            var $tabs = $(this.element[0]).find('li');

            var len = $tabs.length;
            var curidx = 0;

            $tabs.each(function(idx) {
                if ($(this).hasClass("nd2Tabs-active")) {
                    curidx = idx;
                }
            });

            var nextidx = 0;
            if (left) {
                nextidx = (curidx >= len - 1) ? 0 : curidx + 1;
            } else {
                nextidx = (curidx <= 0) ? len - 1 : curidx - 1;
            }
            $tabs.eq(nextidx).click();

        },
        switchTab: function(obj, tabKey, toIdx) {
            var _self = this;

            var direction = (parseInt(toIdx, 10) > _self.options.activeIdx) ? "right" : "left";
            var directionTo = (parseInt(toIdx, 10) < _self.options.activeIdx) ? "right" : "left";

            obj.parent().find(".nd2Tabs-active").removeClass("nd2Tabs-active");

            obj.addClass('nd2Tabs-active');

            _self.option('activeIdx', parseInt(toIdx, 10));
            _self.option('activeTab', tabKey);

            // Activate Content Tab
            var oldContent = obj.parent().nextAll('[data-role=nd2extTabs-container]').find(".nd2Tabs-content-tab.nd2Tab-active");

            if (_self.element.data('swipe')){
	            oldContent.addClass("to-" + directionTo);
	            window.setTimeout(function() {
	                oldContent.removeClass("nd2Tab-active to-" + directionTo);
	            }, 400);
            } else {
            	oldContent.removeClass("nd2Tab-active");
            }

            var newContent = obj.closest('.ui-page').find(".nd2Tabs-content-tab[data-tab='" + _self.options.activeTab + "']");
        	
            if (_self.element.data('swipe')){
	            newContent.addClass("nd2Tab-active from-" + direction);
	            window.setTimeout(function() {
	                newContent.removeClass("from-" + direction);
	            }, 150);
            } else {
            	newContent.addClass("nd2Tab-active");
            }

        },
        prepareTabs: function() {
            var _self = this;
            var el = this.element;
            var tabs = el.nextAll('[data-role=nd2extTabs-container]').children();
            if (tabs.length > 0) {
                tabs.addClass("nd2Tabs-content-tab");
                var height = 0;
                tabs.each(function(idx, tab) {
                    if ($(this).data('tab') == _self.options.activeTab) {
                        $(this).addClass('nd2Tab-active');
                    }
                   // if ($(tab).height() > height) height = $(tab).height();
                });
                // set container height to max tab height
                // to remove tabs downshifting
                // while images not loaded - height is wrong
                //el.nextAll('[data-role=nd2extTabs-container]').height(height);
            } else {
                _self.destroyTabs();
            }
        }
    });

    // меняем поведение селекта jquery.mobile.1.4.5
    $.widget( "mobile.selectmenu", $.mobile.selectmenu, {
        _decideFormat: function() {
            // убираем dialog, оставляем только попап
            var self = this;

            self.menuType = "overlay";
            self.listbox.one( {
                popupafteropen: $.proxy( this, "_focusMenuItem" )
            } );
        }
    });

    // меняем поведение попапа jquery.mobile.1.4.5
    $.widget( "mobile.popup", $.mobile.popup, {
        _clampPopupWidth: function( infoOnly ) {
            var menuSize,
                windowCoordinates = {
                    x: this.window.scrollLeft(),
                    y: this.window.scrollTop(),
                    cx: ( this.window[0].innerWidth || this.window.width() ),
                    cy: ( this.window[0].innerHeight || this.window.height() )
                },
                // rectangle within which the popup must fit
                rectangle = {
                    x: this._tolerance.l*3,
                    y: windowCoordinates.y + this._tolerance.t,
                    cx: windowCoordinates.cx - this._tolerance.l*3 - this._tolerance.r*3,
                    cy: windowCoordinates.cy - this._tolerance.t - this._tolerance.b,
                    mx: windowCoordinates.cx/2
                };

            if ( !infoOnly ) {
                var content_width = this._ui.container.find('.ui-selectmenu').width();
                var content_height = this._ui.container.find('.ui-selectmenu').height();
                console.log('wh: ' + content_width + 'x' + content_height);

                // Clamp the width of the menu before grabbing its size
                this._ui.container.css( "max-width", rectangle.cx );
                this._ui.container.css( "min-width", rectangle.mx );
                // добавить ограничение по высоте, в пределах текущего экрана
                this._ui.container.css( "max-height", rectangle.cy );

                if (content_height > rectangle.cy ) this._ui.container.css("height", rectangle.cy);
                else this._ui.container.css("height", content_height);

            }

            menuSize = {
                cx: this._ui.container.outerWidth( true ),
                cy: this._ui.container.outerHeight( true )
            };

            return { rc: rectangle, menuSize: menuSize };
        }
    });

    $(document).bind("pagebeforeshow", function(e) {
        $(document).trigger("includebeforecreate");
        return $("[data-role='nd2extTabs']", e.target).extTabs();
    });
}));