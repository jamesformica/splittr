/// <reference path="types/jquery.d.ts" />
/// <reference path="types/simplepaint.d.ts" />
var splittr;
(function (splittr) {
    "use strict";
    splittr.timerMinutes = 1;
    splittr.timerSeconds = 3;
    function initialise() {
        var splittrManager = new SplittrManager();
        $.ajax({
            url: "https://fonts.googleapis.com/css?family=Comfortaa",
            type: "GET"
        }).done(function (result) {
            var style = document.createElement("style");
            style.innerHTML = result;
            document.head.appendChild(style);
        });
    }
    splittr.initialise = initialise;
    var SplittrManager = (function () {
        function SplittrManager() {
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
            var $firstDrawingContainer = $(".ui-first-drawing");
            this.firstDrawingElements = this.findCanvasSlideElements($firstDrawingContainer);
            var $secondDrawingContainer = $(".ui-second-drawing");
            this.secondDrawingElements = this.findCanvasSlideElements($secondDrawingContainer);
            this.attachEvents();
        }
        SplittrManager.prototype.attachEvents = function () {
            var _this = this;
            this.$startBtn.click(function () {
                _this.words = _this.selectWord();
                _this.goToSplash(_this.goToFirstDrawing);
            });
            this.$helpBtn.click(function () {
                _this.$help.addClass("show");
            });
            this.$helpClose.click(function () {
                _this.$help.removeClass("show");
            });
            this.firstDrawingElements.$done.click(function () {
                _this.firstTimer.cancelTimer();
                _this.goToSplash(_this.goToSecondDrawing);
            });
            this.secondDrawingElements.$done.click(function () {
                _this.secondTimer.cancelTimer();
                _this.goToSplash(_this.goToGuess);
            });
            this.$images.click(function (e) {
                $(e.currentTarget).toggleClass("fullscreen");
            });
            this.$submitGuess.click(function () {
                _this.checkGuess();
            });
            this.$playAgain.click(function () {
                _this.slideCounter = -1;
                _this.slideToNext();
                _this.words = undefined;
                _this.firstDrawingElements.CanvasManager.clearCanvas();
                _this.secondDrawingElements.CanvasManager.clearCanvas();
            });
        };
        SplittrManager.prototype.goToSplash = function (nextSlide) {
            var _this = this;
            this.slideToNext();
            setTimeout(function () {
                nextSlide.call(_this);
            }, 2500);
        };
        SplittrManager.prototype.goToFirstDrawing = function () {
            var _this = this;
            this.slideToNext();
            this.showModal("Your word is:", this.words[0]);
            this.firstDrawingElements.$word.text(this.words[0]);
            this.firstTimer = new splittr.timer.Timer(this.firstDrawingElements.$timer, splittr.timerMinutes, splittr.timerSeconds);
            this.firstTimer.timesUp().done(function () {
                _this.goToSplash(_this.goToSecondDrawing);
            });
        };
        SplittrManager.prototype.goToSecondDrawing = function () {
            var _this = this;
            this.slideToNext();
            this.showModal("Your word is:", this.words[1]);
            this.secondDrawingElements.$word.text(this.words[1]);
            this.firstDrawingElements.image = this.firstDrawingElements.CanvasManager.getImage();
            this.secondTimer = new splittr.timer.Timer(this.secondDrawingElements.$timer, splittr.timerMinutes, splittr.timerSeconds);
            this.secondTimer.timesUp().done(function () {
                _this.goToSplash(_this.goToGuess);
            });
        };
        SplittrManager.prototype.goToGuess = function () {
            this.secondDrawingElements.image = this.secondDrawingElements.CanvasManager.getImage();
            this.displayImages();
            this.setGuessText();
            this.$submitGuess.removeClass("hidden");
            this.$txtGuess.removeClass("hidden");
            this.$playAgain.addClass("hidden");
            this.$txtGuess.val("");
            this.slideToNext();
        };
        SplittrManager.prototype.slideToNext = function () {
            this.slideCounter++;
            this.$slider.css("transform", "translateY(-" + this.slideCounter * 100 + "vh)");
        };
        SplittrManager.prototype.findCanvasSlideElements = function ($drawingContainer) {
            var $drawingCanvasContainer = $drawingContainer.find(".ui-canvas-container");
            var options = {
                height: $drawingCanvasContainer.height()
            };
            return {
                $container: $drawingContainer,
                $word: $drawingContainer.find("h2"),
                $timer: $drawingContainer.find(".ui-timer"),
                $done: $drawingContainer.find(".ui-finished-drawing"),
                $canvasContainer: $drawingCanvasContainer,
                CanvasManager: new simplepaint.CanvasManager($drawingCanvasContainer, options),
                image: undefined
            };
        };
        SplittrManager.prototype.displayImages = function () {
            var $firstImage = this.$images.filter(".first");
            var $secondImage = this.$images.filter(".second");
            $firstImage.css("background-image", "url('" + this.firstDrawingElements.image + "')");
            $secondImage.css("background-image", "url('" + this.secondDrawingElements.image + "')");
        };
        SplittrManager.prototype.setGuessText = function () {
            this.$guessText.text("Based on the above lovely drawings, whats the full word?");
        };
        SplittrManager.prototype.checkGuess = function () {
            var guessVal = this.$txtGuess.val().toString().toLowerCase().trim();
            if (guessVal != undefined && guessVal.length > 0 && this.words != undefined) {
                var matchWord = (this.words[0] + this.words[1]).toLowerCase().trim();
                if (guessVal === matchWord) {
                    this.$guessText.text("Congratulations! " + guessVal.toUpperCase() + " was the correct word!");
                }
                else {
                    this.$guessText.text("Bummer! You guessed " + guessVal.toUpperCase() + ", but the correct word was " + matchWord.toUpperCase());
                }
                this.$submitGuess.addClass("hidden");
                this.$txtGuess.addClass("hidden");
                this.$playAgain.removeClass("hidden");
            }
        };
        SplittrManager.prototype.showModal = function (title, text) {
            var _this = this;
            this.$modal.find(".ui-title").text(title);
            this.$modal.find(".ui-text").text(text);
            this.$modal.addClass("show");
            setTimeout(function () {
                _this.$modal.removeClass("show");
            }, 2200);
        };
        SplittrManager.prototype.selectWord = function () {
            var words = [
                ["pea", "nut"],
                ["arm", "pit"],
                ["basket", "ball"],
                ["pan", "cake"],
                ["fire", "work"],
                ["base", "ball"],
                ["sun", "flower"],
                ["moon", "light"],
                ["foot", "ball"],
                ["rail", "road"],
                ["skate", "board"],
                ["butter", "fly"],
                ["fire", "fly"],
                ["foot", "print"],
                ["back", "bone"],
                ["eye", "ball"],
                ["key", "board"],
                ["sand", "stone"],
                ["lime", "stone"],
                ["river", "bank"],
                ["honey", "moon"],
                ["tooth", "pick"],
                ["pop", "corn"],
                ["air", "plane"],
                ["ham", "burger"],
                ["fork", "lift"],
                ["honey", "comb"],
                ["key", "hole"],
                ["black", "board"],
                ["white", "board"],
                ["black", "berry"],
                ["friend", "ship"],
                ["day", "time"],
                ["fire", "fighter"],
                ["bed", "room"],
                ["bath", "room"],
                ["car", "pool"],
                ["ball", "room"],
                ["brain", "child"],
                ["dead", "line"],
                ["rain", "bow"],
                ["bow", "tie"],
                ["water", "melon"],
                ["day", "dream"],
                ["day", "light"],
                ["up", "grade"],
                ["news", "paper"],
                ["tea", "cup"],
                ["tea", "pot"],
                ["cart", "wheel"],
                ["fish", "net"],
                ["tape", "worm"],
                ["cave", "man"],
                ["note", "book"],
                ["air", "line"],
                ["cross", "bow"],
                ["earth", "worm"],
                ["eye", "lid"],
                ["rain", "drop"],
                ["cheese", "burger"],
                ["hand", "gun"],
                ["head", "light"],
                ["can", "can"],
                ["cheese", "cake"],
                ["thunder", "bolt"],
                ["brain", "wash"],
                ["pony", "tail"],
                ["moth", "ball"],
                ["candle", "stick"],
                ["space", "walk"],
                ["horse", "fly"],
                ["table", "spoon"],
                ["stop", "light"],
                ["fish", "bowl"],
                ["tail", "gate"],
                ["tea", "spoon"],
                ["star", "fish"],
                ["fish", "hook"],
                ["short", "bread"],
                ["tool", "box"],
                ["ear", "drum"],
                ["jelly", "bean"],
                ["egg", "shell"],
                ["hair", "cut"],
                ["ear", "ring"],
                ["cat", "walk"]
            ];
            return words[Math.floor(Math.random() * words.length)];
        };
        return SplittrManager;
    }());
    splittr.SplittrManager = SplittrManager;
})(splittr || (splittr = {}));
