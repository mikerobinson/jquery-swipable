/**
 * Author: Michael Robinson (mike.robinson@gmail.com)
 * Description: A simple swipable carousel for jQuery Mobile
 */
(function($) {
    var methods = {
        init: function() {
            return this.each(function() {
                var $this = $(this);
                var mouseStartX = 0;
                var mouseEndX = 0;
                var itemX = 0;
                var isSwiping = false;
                var swipeTolerance = 20;
                var maxWidth = 0;

                // Persistent external variables
                var data = methods.data();
                if (!data) {
                    methods.data.call($(this), {
                        currentIndex: 0
                    });
                }

                $this.swipable("render");

                // Cache the size of the stage
                maxWidth = methods.getMaxWidth.call($(this));


                /************ IPHONE *************/
                if(navigator.userAgent.indexOf("iPhone") >= 0) {
                    /**
                     * Capture the initial mousedown position to compare when moving the mouse
                     */
                    $this.bind("vmousedown", function(event) {
                        mouseStartX = event.pageX;
                        $this.find(".items")
                            .css({
                                "-webkit-transition-duration": "0"
                            });

                        itemX = methods.getX.call($this);
                    });

                    /**
                     * Capture the distance traveled when a finger moves, and move the carousel the same amount
                     */
                    $this.bind("vmousemove", function(event) {
                        mouseEndX = event.pageX;
                        var difference = mouseEndX - mouseStartX;

                        if(isSwiping) {
                            itemX += difference;

                            if(itemX > 0) itemX = 0;
                            if(itemX < -maxWidth) itemX = -maxWidth;

                            mouseStartX = event.pageX;
                            $this.find(".items")
                                .css("-webkit-transform","translate3d(" + itemX + "px, 0px, 0)");
                        } else if (Math.abs(difference) > swipeTolerance) {
                            isSwiping = true;
                        }
                    });

                    /**
                     * Determine if the carousel has moved over halfway to the next or previous slide. If so, show that slide.
                     */
                    $this.bind("vmouseup", function(event) {
                        var stage = methods.getDimensions();
                        var numItems = $this.find("div.item").length;
                        var maxSize = numItems * stage.width;

                        var left = methods.getX.call($this);
                        var index = 0;

                        if(left > 0) {
                            index = 0;
                        } else {
                            left = Math.abs(left);
                            if(left < (maxSize - stage.width)) {
                                index = Math.floor(left / stage.width);
                                if(left % stage.width > (stage.width / 2)) {
                                    index++;
                                }
                            } else {
                                index = numItems - 1;
                            }
                        }

                        isSwiping = false;

                        $this.swipable("move", index);
                    });

                    /**
                     * Prevent aggressive link loading while swiping
                     */
                    $this.find("a").bind("vmouseup vclick tap", function(event) {
                        if(isSwiping) {
                            event.preventDefault();
                        }
                    });
                } else {
                    /************ OTHER TOUCHSCREEN *************/

                    /*
                    if(methods.isEventSupported("touchstart")) {
                        $this.bind("swipeleft swiperight", function(event) {
                            var data = methods.data.call($this);
                            var index = (event.type == "swipeleft") ? data.currentIndex + 1 : data.currentIndex - 1;

                            methods.move.call($this, index);
                        });
                    }*/

                    /************ ANDROID *************/
                    /* Could not reliably get swipe gestures working on android, will revisit later */
                    $this
                        .append('<div class="next">></div>')
                        .append('<div class="previous"><</div>')

                    $this.find(".next, .previous").bind("tap", function() {
                        var data = methods.data.call($this);
                        var index = $(this).hasClass("next") ? data.currentIndex + 1 : data.currentIndex - 1;

                        methods.move.call($this, index);
                    });
                }
            });
        },
        /**
         * Render the carousel as a 3:2 ratio
         */
        getDimensions: function() {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientWidth * 0.66
            }
        },
        /**
         * Calculates the width of the rendered stage
         */
        getMaxWidth: function() {
            var $this = $(this);

            var dimensions = methods.getDimensions();
            var numItems = $this.find("div.item").length;
            var maxWidth = (numItems - 1) * dimensions.width;

            return maxWidth;
        },
        /**
         * Sizes the carousel elements to fit the screen (used for portrait & landscape)
         */
        render: function() {
            var $this = $(this);
            var stage = methods.getDimensions();

            $this
                .css("width", stage.width + "px")
                .css("height", stage.height + "px")

            $this.find(".items")
                .css("height", stage.height)
                .css("width", $this.find("div.item").length * stage.width + "px")

            $this.find("div.item").css({
                width: stage.width + "px",
                height: stage.height + "px"
            });

            $this.find(".items img").css({
                width: "100%"
            });
        },
        /**
         * Ping the carousel to re-render and re-display the current index. Good for orientation changes.
         */
        refresh: function() {
            var $this = $(this);
            var data = methods.data.call($this);
            methods.move.call($this, data.currentIndex);
            methods.render.call($this);
            maxWidth = methods.getMaxWidth.call($this);
        },
        /**
         * Move the carousel to a specific position
         * @param index
         */
        move: function(index) {
            var $this = $(this);

            if(index < 0) index = 0;
            if(index >= $this.find("div.item").length) index = $this.find("div.item").length - 1;

            var stage = methods.getDimensions();
            var newPos = -(index * stage.width);

            var data = methods.data.call($this);
            data.currentIndex = index;
            methods.data.call($this, data);

            $this.find(".items")
                .css({
                    "-webkit-transform":"translate3d(" + newPos + "px, 0px, 0)",
                    "transition-timing-function" : "ease-out",
                    "-webkit-transition-duration": "0.2s"
                });

        },
        /**
         * Calculates the items' x position based on it's current matrix location
         */
        getX: function() {
            var $this = $(this);

            // There has got to be a better way...
            var matrix = $this.find(".items")
                .css("-webkit-transform"); // matrix(1, 0, 0, 1, -541, 0)
            matrix = matrix.substring(7, matrix.length - 2);
            var matrixItems = matrix.split(",");
            var x = parseInt(matrixItems[4]);
            return x;
        },

        /**
         * Shortcut for storing data on the widget
         * @param data
         */
        data: function(data) {
            var $this = $(this);
            if(!data) {
                return $this.jqmData("swipable");
            } else {
                $this.jqmData("swipable", data);
            }
        },

        /**
         * Borrowed from http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
         * Used to detect gesture support
         */
        isEventSupported: function(eventName) {
            var TAGNAMES = {
                'select':'input','change':'input',
                'submit':'form','reset':'form',
                'error':'img','load':'img','abort':'img'
            }

            var el = document.createElement(TAGNAMES[eventName] || 'div');
            eventName = 'on' + eventName;
            var isSupported = (eventName in el);
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
            }
            el = null;
            return isSupported;
        }
    }


    $.fn.swipable = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.swipable');
        }
    }
})(jQuery)