module splittr.timer {
    "use strict";

    export class Timer {
        private deferred: JQueryDeferred<boolean>;
        private canceled: boolean;

        private element: HTMLElement;
        private msLeft: number;
        private endTime: number;
        private time: Date;
        private hours: number;

        constructor(private $element: JQuery, private minutes: number, private seconds: number) {
            this.canceled = false;
            this.deferred = $.Deferred();

            this.element = $element.get(0);
            this.endTime = (+new Date) + 1000 * (60 * minutes + seconds) + 500;
            this.updateTimer();
        }

        cancelTimer(): void {
            this.canceled = true;
        }

        timesUp(): JQueryPromise<boolean> {
            return this.deferred.promise(true);
        }

        private twoDigits(n: number): string {
            return (n <= 9 ? "0" + n.toString() : n.toString());
        }

        private updateTimer(): void {
            this.msLeft = this.endTime - (+new Date);

            if (!this.canceled) {
                if (this.msLeft < 1000) {
                    this.element.innerHTML = "--:--";
                    this.deferred.resolve();
                } else {
                    this.time = new Date(this.msLeft);
                    this.hours = this.time.getUTCHours();
                    this.minutes = this.time.getUTCMinutes();
                    this.element.innerHTML = (this.hours ? this.hours + ':' + this.twoDigits(this.minutes) : this.minutes) + ':' + this.twoDigits(this.time.getUTCSeconds());

                    setTimeout(() => { this.updateTimer(); }, this.time.getUTCMilliseconds() + 500);
                }
            }
        }
    }
}