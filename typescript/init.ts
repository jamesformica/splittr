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
        private $images: JQuery;
        private $guessText: JQuery;
        private $txtGuess: JQuery;
        private $submitGuess: JQuery;
        private $playAgain: JQuery;

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
            this.$images = this.$slider.find(".ui-guess-image");
            this.$submitGuess = this.$slider.find(".ui-submit-guess");
            this.$guessText = this.$slider.find(".ui-guess-text");
            this.$txtGuess = this.$slider.find(".ui-txt-guess");
            this.$playAgain = this.$slider.find(".ui-reset");

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

            this.$images.click((e) => {
                $(e.currentTarget).toggleClass("fullscreen");
            });

            this.$submitGuess.click(() => {
                this.checkGuess();
            });

            this.$playAgain.click(() => {
                this.slideCounter = -1;
                this.slideToNext();
                this.words = undefined;
                this.firstDrawingElements.CanvasManager.clearCanvas();
                this.secondDrawingElements.CanvasManager.clearCanvas();
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
            this.setGuessText();
            this.$submitGuess.removeClass("hidden");
            this.$txtGuess.removeClass("hidden");
            this.$playAgain.addClass("hidden");
            this.$txtGuess.val("");

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
            let $firstImage = this.$images.filter(".first");
            let $secondImage = this.$images.filter(".second");

            $firstImage.css("background-image", "url('" + this.firstDrawingElements.image + "')");
            $secondImage.css("background-image", "url('" + this.secondDrawingElements.image + "')");
        }

        private setGuessText(): void {
            this.$guessText.text("Based on the above lovely drawings, whats the full word?");
        }

        private checkGuess(): void {
            let guessVal = (<string>this.$txtGuess.val().toString()).toLowerCase().trim();

            if (guessVal != undefined && guessVal.length > 0 && this.words != undefined) {
                let matchWord = (this.words[0] + this.words[1]).toLowerCase().trim();


                if (guessVal === matchWord) {
                    this.$guessText.text("Congratulations! " + guessVal.toUpperCase() + " was the correct word!");
                } else {
                    this.$guessText.text("Bummer! You guessed " + guessVal.toUpperCase() + ", but the correct word was " + matchWord.toUpperCase());
                }

                this.$submitGuess.addClass("hidden");
                this.$txtGuess.addClass("hidden");
                this.$playAgain.removeClass("hidden");
            }
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