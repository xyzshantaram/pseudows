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

    constructor() {}

    nextZ() {
        return ++this.highestZ;
    }

    addWindow(cls, width, height, args) {
        new cls(width, height, args);
    }
}

let app;

class Window {
    hasChanged = true;
    width = 300;
    height = 240;
    zIndex = 1;
    minimized = false;
    maximized = false;

    constructor(width, height, args) {
        this.zIndex = app.nextZ();
        console.log(this.zIndex)
        this.width = width;
        this.height = height;

        this.lastDraw = {}

        this.elem = document.createElement('div');
        if (args.id) {
            this.elem.id = args.id;
        }
        if (args.name) {
            this.name = args.name;
        } else {
            throw new Error("No name provided for new window");
        }
        this.elem.className = 'window';

        this.pos = {
            x: (window.innerWidth / 2 - this.width / 2),
            y: (window.innerHeight / 2 - this.height / 2)
        }

        this.createTitleBar();
        this.createTaskButton();
        this.generateContent();

        document.querySelector("#app").appendChild(this.elem);
        this.update();

        this.elem.addEventListener('click', () => {
            console.log(this.zIndex, app.highestZ)
            if (this.zIndex != app.highestZ) {
                this.zIndex = app.nextZ();
                this.update();
            }
            app.activeWindow = this;
        })

        this.elem.style.animation = 'grow 0.2s forwards';
    }

    update() {
        let styles = {
            zIndex: this.zIndex
        }

        if (!this.maximized) {
            styles = {
                width: this.width + 'px',
                height: this.height + 'px',
                left: this.pos.x + 'px',
                top: this.pos.y + 'px',
                ...styles
            }
        } else {
            styles = {
                width: '100%',
                height: '95%',
                top: '0',
                left: '0'
            }
        }
        Object.assign(this.elem.style, styles);
    }

    createTitleButton(name, fn) {
        let btn = document.createElement('button');
        btn.innerHTML = name;
        btn.onclick = fn;
        return btn;
    }

    createTaskButton() {
        let switcher = document.querySelector('#switcher');
        this.taskBtn = document.createElement('button');
        this.taskBtn.className = 'task-button';
        this.taskBtn.innerHTML = this.name;

        this.taskBtn.onmousedown = (e) => {
            if (e.button === 2) {
                this.close();
            }
            if (e.button === 0) {
                this.toggleMinimized();
            }
        }

        switcher.appendChild(this.taskBtn);
        this.taskBtn.classList.add('active');
    }

    createTitleBar() {
        this.titleBar = document.createElement('div');
        this.titleBar.className = 'window-titlebar';

        const set = () => {
            if (!this.maximized) app.draggedElement = this;
        }

        const rm = () => {
            if (app.draggedElement === this) app.draggedElement = null;
        }

        this.titleBarName = document.createElement('div');
        this.titleBarName.onmousedown = set;
        this.titleBarName.onmouseup = rm;
        this.titleBarName.className = 'window-titlebar-name';
        this.titleBarName.innerHTML = this.name;

        this.titleBarButtons = document.createElement('div');
        this.titleBarButtons.className = 'window-titlebar-buttons';
        this.titleBarButtons.append(
            this.createTitleButton('━', () => this.toggleMinimized()),
            this.createTitleButton('⬒', () => this.toggleMaximized()),
            this.createTitleButton('❌', () => this.close())
        );
        this.titleBar.append(this.titleBarName, this.titleBarButtons);
        this.elem.appendChild(this.titleBar);
    }

    generateContent() {}

    toggleMinimized() {
        this.minimized = !this.minimized;
        if (this.minimized) {
            this.elem.style.animation = 'minimize 0.4s forwards';
            this.minimizedFrom = {
                x: this.pos.x,
                y: this.pos.y
            }
            this.taskBtn.classList.remove('active');
        } else {
            this.elem.style.animation = 'restore 0.4s forwards';
            this.taskBtn.classList.add('active');
        }
        if (this.zIndex != app.highestZ) {
            this.zIndex = app.nextZ();
            this.update();
        }
    }

    toggleMaximized() {
        if (!this.maximized) {
            this.elem.classList.add('maximized');
            this.preMaximizePos = {
                x: this.pos.x,
                y: this.pos.y
            }
            this.preMaximizeWidth = this.width;
            this.preMaximizeHeight = this.height;

            this.pos = {
                x: 0,
                y: 0
            }
        } else {
            this.elem.classList.remove('maximized');
            this.width = this.preMaximizeWidth;
            this.height = this.preMaximizeHeight;

            this.pos = {
                x: this.preMaximizePos.x,
                y: this.preMaximizePos.y
            }
        }
        this.maximized = !this.maximized;
        this.update();
        if (this.zIndex != app.highestZ) {
            this.zIndex = app.nextZ();
            this.update();
        }
    }

    close() {
        document.querySelector("#switcher").removeChild(this.taskBtn);
        this.elem.style.animation = 'die 0.2s forwards';
        setTimeout(() => document.querySelector('#app').removeChild(this.elem), 210);
    }
}

class About extends Window {
    generateContent() {
        let elt = document.createElement('div');
        elt.className = 'window-frame';
        Object.assign(elt.style, {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        })
        elt.innerHTML = `
            <div><b>Pseudows by shantaram</b></div>
            <div>version 0.0.1</div>
        `;

        this.elem.appendChild(elt);
    }
}

function saveFile(blob, name) {
    let blobUrl = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = blobUrl;
    link.download = name || 'file.txt';
    link.click();
}

class Notepad extends Window {
    generateContent() {
        let elt = document.createElement('div');
        elt.className = 'window-frame';
        let actions = document.createElement('div');
        actions.className = 'window-actions';
        elt.appendChild(actions);

        let save = document.createElement('span');
        save.className = 'window-action-button';
        save.innerHTML = 'Save';
        save.onclick = () => {
            let blob = new Blob([ta.value], {
                type: "text/plain;charset=utf-8"
            });
            createPrompt('Save as', 'Enter a filename.', function(name) {
                saveFile(blob, name);
            }, 'Save', function(type) {
                createAlert('Cancelled', type == ALERT_CANCELLED ? "Input cancelled." : "Empty filename.", 'info');
            });

        }

        let close = document.createElement('span');
        close.className = 'window-action-button';
        close.innerHTML = 'Close';
        close.onclick = () => {
            this.close();
        }

        actions.append(save, close);

        Object.assign(elt.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            padding: '0'
        })

        let ta = document.createElement('textarea');
        elt.appendChild(ta);
        ta.className = 'notepad';

        this.elem.appendChild(elt);
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function toggleMenu() {
    const menu = document.querySelector("#menu");
    menu.style.display = app.menuOpen ? 'none' : 'flex';
    app.menuOpen = !app.menuOpen;
}

function hideMenu() {
    app.menuOpen = true;
    toggleMenu();
}

function mouseMove(e) {
    if (app.draggedElement != null) {
        if (!(app.lastMousePos.x && app.lastMousePos.y)) return;
        let d = {
            x: e.clientX - app.lastMousePos.x,
            y: e.clientY - app.lastMousePos.y
        }

        app.draggedElement.pos.x += d.x;
        app.draggedElement.pos.y += d.y;

        app.draggedElement.update();
    }

    app.lastMousePos = {
        x: e.clientX,
        y: e.clientY
    }
}

function populateMenu(types) {
    let list = document.querySelector("#menu-items");
    list.innerHTML = '';
    for (let key in types) {
        let elt = document.createElement('div');
        elt.className = 'menu-item';
        elt.innerHTML = key;

        elt.onclick = function() {
            hideMenu();
            app.addWindow(types[key].obj, types[key].width, types[key].height, {
                name: types[key].title
            })
        }
        list.appendChild(elt);
    }
}

const TYPES = {
    'Notepad': {
        obj: Notepad,
        width: 400,
        height: 300,
        'title': 'Notepad'
    },
    'About...': {
        'obj': About,
        width: 300,
        height: 200,
        'title': 'About'
    }
}

window.addEventListener('click', function(e) {
    let menu = document.querySelector("#menu");
    let openBtn = document.querySelector("#menu-open-btn");
    if (e.target !== menu && !menu.contains(e.target) && e.target !== openBtn) {
        hideMenu();
    }
})

function init() {
    app = new App();
    document.querySelector("#menu-open-btn").onclick = toggleMenu;
    window.addEventListener('mousemove', mouseMove);
    populateMenu(TYPES);

    window.onresize = function() {
        init();
    }
}

window.addEventListener('DOMContentLoaded', function() {
    init();
})