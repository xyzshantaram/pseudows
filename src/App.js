class App {
    menuOpen = false;
    highestZ = 0;
    windowList = [];
    draggedElement = null;
    activeWindow = null;
    lastMousePos = {
        x: null,
        y: null
    }

    constructor() { }

    nextZ() {
        return ++this.highestZ;
    }

    addWindow(cls, width, height, args) {
        new cls(width, height, args);
    }
}
let app;