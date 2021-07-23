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
        let switcher = document.querySelector('#switcher-buttons');
        this.taskBtn = document.createElement('button');
        this.taskBtn.className = 'task-button';
        this.taskBtn.innerHTML = this.name;

        this.taskBtn.onmousedown = (e) => {
            if (e.button === 2) { // right
                this.close();
            }
            if (e.button === 0) { // left
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
            this.createTitleButton('✕', () => this.close())
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

    disableMaximize() {
        const maximize = this.titleBarButtons.querySelector(':nth-child(2)');
        maximize.setAttribute('disabled', 'disabled');
        maximize.style.pointerEvents = 'none';
        maximize.style.cursor = 'not-allowed';
    }

    close() {
        document.querySelector("#switcher-buttons").removeChild(this.taskBtn);
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
            <div>This program is free, open-source software under the MIT License.</div>
            <div>Copyright © 2021 Siddharth Singh</div>
            <div>version 0.4.1</div>
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

class ValueError extends Error {}

function evalArithmetic(string) {
    if (/[^+\-*\/\^().0-9 ]/.test(string)) throw new ValueError("Non-arithmetic character detected");
    while (/\^/.test(string)) {
        string = string.replace('^', '**');
        console.log(string)
    }
    return eval(string);
}

class Notepad extends Window {
    generateContent() {
        let elt = document.createElement('div');
        elt.className = 'window-frame notepad-frame';
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
            createConfirm('Confirm', 'Are you sure you want to exit?', () => {
                this.close();
            }, () => {
                hideAlert()
            }, "I'm sure", "Cancel");
        }

        actions.append(save, close);

        let ta = document.createElement('textarea');
        elt.appendChild(ta);
        ta.className = 'notepad';

        this.elem.appendChild(elt);
    }
}

class Terminal extends Window {
    generateContent() {
        let frame = document.createElement('div');
        frame.className = 'window-frame terminal-frame';
        let err = document.createTextNode('Pseudows cannot find ‘cmd’. Make sure you typed the name correctly, and then try again.');
        frame.append(err);
        this.elem.append(frame);
    }
}

class Calculator extends Window {

    constructor(width, height, args) {
        super(width, height, args);
        this.disableMaximize();
    }

    toggleMaximized() {}

    generateContent() {
        let frame = document.createElement('div');
        frame.className = 'window-frame calculator-frame';
        let field = document.createElement('input');
        field.type = 'text';
        field.className = 'calc-field';
        let buttons = [1, 2, 3, '+', 4, 5, 6, '-', 7, 8, 9, '*', 'C', 0, '^', '/']
        let container = document.createElement('div');
        container.className = 'calc-items';
        container.append(field)
        for (let button of buttons) {
            let btn = document.createElement('button');
            btn.value = button;
            btn.textContent = button;
            btn.type = 'button';
            if (button !== 'C') {
                btn.onclick = function() {
                    field.value += btn.value;
                }
            } else {
                btn.onclick = () => field.value = '';
            }
            container.append(btn);
        }
        let equals = document.createElement('button');
        equals.value = '=';
        equals.textContent = '=';
        equals.className = 'calc-equals';
        equals.onclick = () => {
            field.value = field.value.trim();
            try {
                if (field.value) field.value = evalArithmetic(field.value);
            } catch (e) {
                field.value = e;
            }
        }
        container.append(equals);
        frame.append(container);
        this.elem.append(frame);
    }
}

class InternetWanderer extends Window {
    generateContent() {
        let frame = document.createElement('div');
        frame.className = 'window-frame ie-frame';
        frame.style.cursor = 'progress';

        frame.innerHTML = `
            <h1><i class='fa fa-internet-explorer'></i></h1>
            <h3>
            <div> Welcome to Wanderer!</div>
            <div> This is the first-time setup process. </div>
            <div> Press Next to continue. </div>
            </h3>
        `
        let btn = document.createElement('button');
        btn.innerHTML = 'Next';

        frame.appendChild(btn);

        btn.onclick = () => {
            setTimeout(() =>
                createAlert('Error', 'An error occurred while the setup process was being started. Wanderer failed to start.', 'error', () => {
                    hideAlert();
                    this.close();
                }, "OK"),
                1000
            );
        }

        this.elem.append(frame);
    }
}

class Paint extends Window {
    generateContent() {
        let frame = document.createElement('div');
        frame.className = 'window-frame paint-frame';

        let iframe = document.createElement('iframe');
        iframe.src = 'https://jspaint.app';

        iframe.style.width = '100%';
        iframe.style.height = '100%';

        frame.append(iframe);
        this.elem.append(frame);
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

const APPS = {
    'Notepad': {
        obj: Notepad,
        width: 400,
        height: 300,
        title: 'Notepad',
        desktop: true,
        icon: '<i class="fas fa-file-alt"></i>'
    },
    'Terminal': {
        'obj': Terminal,
        width: 500,
        height: 300,
        title: 'Terminal',
        desktop: true,
        icon: '<i class="fas fa-terminal"></i>'
    },
    'Calculator': {
        'obj': Calculator,
        width: 300,
        height: 400,
        title: 'Calculator',
        desktop: true,
        icon: '<i class="fas fa-calculator"></i>'
    },
    'Internet Wanderer': {
        'obj': InternetWanderer,
        width: 800,
        height: 600,
        title: 'Internet Wanderer',
        desktop: true,
        icon: '<i class="fa fa-internet-explorer" aria-hidden="true"></i>'
    },
    'Paint': {
        'obj': Paint,
        width: 800,
        height: 600,
        title: 'Paint',
        desktop: true,
        icon: '<i class="fas fa-palette"></i>'
    },
    'About...': {
        'obj': About,
        width: 300,
        height: 200,
        title: 'About',
        desktop: true,
        icon: '<i class="fas fa-info-circle"></i>'
    },
}

function createDesktopItem(icon, label) {
    return `
        <div class='desktop-icon'>${icon}</div>
        <span class='desktop-label'>${label}</span>
    `;
}

function populateItems(apps) {
    let menuList = document.querySelector("#menu-items");
    let desktop = document.querySelector("#desktop");
    menuList.innerHTML = '';
    for (let key in apps) {
        const item = apps[key];
        const elt = document.createElement('div');
        elt.className = 'menu-item';

        let icon = item.icon || '';

        elt.innerHTML = `
            ${icon}
            <span>${key}</span>
        `
        const launch = () => {
            hideMenu();
            app.addWindow(item.obj, item.width, item.height, {
                name: item.title
            });
        }

        elt.onclick = launch;

        if (item.desktop) {
            let ditm = document.createElement('div');
            ditm.className = 'desktop-item';
            ditm.innerHTML = createDesktopItem(item.icon, item.title);
            ditm.ondblclick = launch;
            ditm.onclick = function() {
                document.querySelectorAll('.desktop-item.selected').forEach((elem) => elem.classList.remove('selected'));
                this.classList.add('selected');
            }
            desktop.appendChild(ditm);
        }
        menuList.appendChild(elt);
    }
}

function matchesList(el, selectorList) {
    for (let x of selectorList) {
        if (el.matches(x)) return true;
    }
    return false;
}

window.addEventListener('click', function(e) {
    let menu = document.querySelector("#menu");
    let openBtn = document.querySelector("#menu-open-btn");
    if (e.target !== menu && !menu.contains(e.target) && e.target !== openBtn) {
        hideMenu();
    }
    if (!matchesList(e.target, ['.desktop-item', '.desktop-icon', '.desktop-item.selected', '.desktop-label', '.desktop-icon > i'])) {
        document.querySelectorAll('.desktop-item.selected').forEach((elem) => elem.classList.remove('selected'));
    }
})

function init() {
    app = new App();
    document.querySelector("#menu-open-btn").onclick = toggleMenu;
    window.addEventListener('mousemove', mouseMove);
    populateItems(APPS);

    let dateDiv = document.querySelector("#switcher-clock-date");
    let timeDiv = document.querySelector("#switcher-clock-time");

    function updateDate() {
        let cur = new Date();
        dateDiv.innerHTML = cur.toLocaleDateString();
        timeDiv.innerHTML = cur.toLocaleTimeString();
        setTimeout(updateDate, 1000);
    }

    updateDate();
}

window.addEventListener('DOMContentLoaded', function() {
    init();
})