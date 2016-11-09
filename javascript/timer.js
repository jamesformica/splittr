var splittr;
(function (splittr) {
    var timer;
    (function (timer) {
        "use strict";
        var Timer = (function () {
            function Timer($element, minutes, seconds) {
                this.$element = $element;
                this.minutes = minutes;
                this.seconds = seconds;
                this.canceled = false;
                this.deferred = $.Deferred();
                this.element = $element.get(0);
                this.endTime = (+new Date) + 1000 * (60 * minutes + seconds) + 500;
                this.updateTimer();
            }
            Timer.prototype.cancelTimer = function () {
                this.canceled = true;
            };
            Timer.prototype.timesUp = function () {
                return this.deferred.promise(true);
            };
            Timer.prototype.twoDigits = function (n) {
                return (n <= 9 ? "0" + n.toString() : n.toString());
            };
            Timer.prototype.updateTimer = function () {
                var _this = this;
                this.msLeft = this.endTime - (+new Date);
                if (!this.canceled) {
                    if (this.msLeft < 1000) {
                        this.element.innerHTML = "--:--";
                        this.deferred.resolve();
                    }
                    else {
                        this.time = new Date(this.msLeft);
                        this.hours = this.time.getUTCHours();
                        this.minutes = this.time.getUTCMinutes();
                        this.element.innerHTML = (this.hours ? this.hours + ':' + this.twoDigits(this.minutes) : this.minutes) + ':' + this.twoDigits(this.time.getUTCSeconds());
                        setTimeout(function () { _this.updateTimer(); }, this.time.getUTCMilliseconds() + 500);
                    }
                }
            };
            return Timer;
        }());
        timer.Timer = Timer;
    })(timer = splittr.timer || (splittr.timer = {}));
})(splittr || (splittr = {}));
