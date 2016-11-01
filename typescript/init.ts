/// <reference path="types/jquery.d.ts" />
/// <reference path="types/simplepaint.d.ts" />

module splittr {
    "use strict";

    export var timerMinutes = 1;
    export var timerSeconds = 3;

    export interface ICanvasElements {
        $container: JQuery;
        $word: JQuery;
        $timer: JQuery;
        $done: JQuery;
        $canvasContainer: JQuery;
        CanvasManager: simplepaint.CanvasManager;
        image: string;
    }

    export function initialise(): void {
        let splittrManager = new SplittrManager();
    }

    export class SplittrManager {
        private slideCounter: number;
        private words: string[]

        private $slider: JQuery;
        private $help: JQuery;
        private $modal: JQuery;
        private $helpClose: JQuery;
        private $startBtn: JQuery;
        private $helpBtn: JQuery;

        private firstDrawingElements: ICanvasElements;
        private secondDrawingElements: ICanvasElements;

        private firstTimer: splittr.timer.Timer;
        private secondTimer: splittr.timer.Timer;

        constructor() {
            this.slideCounter = 0;

            this.$slider = $(".ui-slider");
            this.$help = $(".ui-help-popup");
            this.$modal = $(".ui-modal");

            this.$startBtn = this.$slider.find(".ui-start");
            this.$helpBtn = this.$slider.find(".ui-help");
            this.$helpClose = this.$help.find(".ui-close-help-popup");

            let $firstDrawingContainer = $(".ui-first-drawing");
            this.firstDrawingElements = this.findCanvasSlideElements($firstDrawingContainer);

            let $secondDrawingContainer = $(".ui-second-drawing");
            this.secondDrawingElements = this.findCanvasSlideElements($secondDrawingContainer);

            this.attachEvents();
        }

        private attachEvents(): void {
            this.$startBtn.click(() => {
                this.words = this.selectWord();
                this.goToFirstDrawing();
            });

            this.$helpBtn.click(() => {
                this.$help.addClass("show");
            });

            this.$helpClose.click(() => {
                this.$help.removeClass("show");
            });

            this.firstDrawingElements.$done.click(() => {
                this.goToSecondDrawing();
            });

            this.secondDrawingElements.$done.click(() => {
                this.goToGuess();
            });
        }

        private goToFirstDrawing(): void {
            this.slideToNext();
            this.showModal("Your word is:", this.words[0]);
            this.firstDrawingElements.$word.text(this.words[0]);

            this.firstTimer = new splittr.timer.Timer(this.firstDrawingElements.$timer, timerMinutes, timerSeconds);
            this.firstTimer.timesUp().done(() => {
                this.goToSecondDrawing();
            });
        }

        private goToSecondDrawing(): void {
            this.slideToNext();
            this.showModal("Your word is:", this.words[1]);
            this.secondDrawingElements.$word.text(this.words[1]);

            this.firstDrawingElements.image = this.firstDrawingElements.CanvasManager.getImage();
            
            this.firstTimer.cancelTimer();
            this.secondTimer = new splittr.timer.Timer(this.secondDrawingElements.$timer, timerMinutes, timerSeconds);
            this.secondTimer.timesUp().done(() => {
                this.goToGuess();
            });
        }

        private goToGuess(): void {
            this.secondTimer.cancelTimer();
            this.secondDrawingElements.image = this.secondDrawingElements.CanvasManager.getImage();

            this.displayImages();
            this.slideToNext();
        }

        private slideToNext(): void {
            this.slideCounter++;

            this.$slider.css("transform", "translateY(-" + this.slideCounter * 100 + "vh)");
        }

        private findCanvasSlideElements($drawingContainer: JQuery): ICanvasElements {
            let $drawingCanvasContainer = $drawingContainer.find(".ui-canvas-container");

            let options: ICanvasManagerOptions = {
                height: $drawingCanvasContainer.height()
            }

            return {
                $container: $drawingContainer,
                $word: $drawingContainer.find("h2"),
                $timer: $drawingContainer.find(".ui-timer"),
                $done: $drawingContainer.find(".ui-finished-drawing"),
                $canvasContainer: $drawingCanvasContainer,
                CanvasManager: new simplepaint.CanvasManager($drawingCanvasContainer, options),
                image: undefined
            }
        }

        private displayImages(): void {
            let $guess = $(".ui-guess");
            let $firstImage = $guess.find(".ui-first-image");
            let $secondImage = $guess.find(".ui-second-image");

            $firstImage.css("background-image", "url('" + this.firstDrawingElements.image + "')");
            $secondImage.css("background-image", "url('" + this.secondDrawingElements.image + "')");
        }

        private showModal(title: string, text: string): void {
            this.$modal.find(".ui-title").text(title);
            this.$modal.find(".ui-text").text(text);

            this.$modal.addClass("show");

            setTimeout(() => {
                this.$modal.removeClass("show");
            }, 2200);
        }

        private selectWord(): string[] {
            let words: string[][] = [
                ["pea", "nut"],
                ["peanut", "butter"],
                ["arm", "pit"],
                ["basket", "ball"],
                ["pan", "cake"]
            ];

            return words[Math.floor(Math.random() * words.length)];
        }
    }
}