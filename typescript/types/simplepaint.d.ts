/// <reference path="jquery.d.ts" />

interface ICanvasManagerOptions {
    height?: number,
    colours?: string[],
    brushSizes?: number[]
}

declare namespace simplepaint {
    class CanvasManager {
        constructor($container: JQuery, options?: ICanvasManagerOptions);

        getImage(): string;

        clearCanvas(): void;
    }
}