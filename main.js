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

function createElement(args) {
    let { parent, type, className, id, innerHTML, misc, children, style } = args;
    if (!type) type = 'div';
    let elem = document.createElement(type);
    if (className) elem.className = className;
    if (id) elem.id = id;
    if (innerHTML) elem.innerHTML = innerHTML;
    if (misc) Object.assign(elem, misc);
    if (children) {
        for (let child of children) {
            elem.appendChild(child);
        }
    }
    if (style) Object.assign(elem.style, style);
    if (parent) parent.appendChild(elem);
    return elem;
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
        this.width = width;
        this.height = height;

        this.lastDraw = {}

        this.elem = createElement({
            id: args.id,
            className: 'window',
            parent: document.querySelector("#app")
        });

        this.pos = {
            x: (window.innerWidth / 2 - this.width / 2),
            y: (window.innerHeight / 2 - this.height / 2)
        }

        this.name = args.name;

        this.createTitleBar();
        this.createTaskButton();
        this.generateContent();
        this.update();

        this.elem.addEventListener('click', () => {
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
            width: this.maximized ? '100%' : this.width + 'px',
            height: this.maximized ? '95%' : this.height + 'px',
            left: this.maximized ? '0' : this.pos.x + 'px',
            top: this.maximized ? '0' : this.pos.y + 'px',
            zIndex: this.zIndex
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
        this.taskBtn = createElement({
            type: 'button',
            className: 'task-button active',
            innerHTML: this.name,
            parent: switcher
        })
        this.taskBtn.onmousedown = (e) => {
            if (e.button === 2) this.close();
            if (e.button === 0) this.toggleMinimized();
        }
    }

    bringToFront(update = true) {
        if (this.zIndex != app.highestZ) this.zIndex = app.nextZ();
        if (update) this.update();
    }

    createTitleBar() {
        this.titleBar = createElement({

            className: 'window-titlebar',
            parent: this.elem
        })

        const set = () => {
            if (!this.maximized) app.draggedElement = this;
        }

        const rm = () => {
            if (app.draggedElement === this) app.draggedElement = null;
        }

        this.titleBarName = createElement({

            misc: {
                onmousedown: set,
                onmouseup: rm
            },
            className: 'window-titlebar-name',
            innerHTML: this.name,
            parent: this.titleBar
        })

        this.titleBarButtons = createElement({

            className: 'window-titlebar-buttons',
            children: [
                this.createTitleButton('━', () => this.toggleMinimized()),
                this.createTitleButton('⬒', () => this.toggleMaximized()),
                this.createTitleButton('✕', () => this.close())
            ],
            parent: this.titleBar
        })
    }

    generateContent() { }

    toggleMinimized() {
        this.minimized = !this.minimized;
        this.elem.style.animation = `${this.minimized ? 'minimize' : 'restore'} 0.4s forwards`;
        this.taskBtn.classList[this.minimized ? 'remove' : 'add']('active');
    }

    toggleMaximized() {
        this.maximized = !this.maximized;
        this.taskBtn.classList[this.maximized ? 'add' : 'remove']('maximized');
        if (this.maximized) {
            this.preMaximize = {
                x: this.pos.x,
                y: this.pos.y,
                width: this.width,
                height: this.height
            }
            this.pos.x = 0;
            this.pos.y = 0;
        } else {
            const { width, height, x, y } = this.preMaximize;
            Object.assign(this, { height, width, pos: { x, y } });
        }
        this.bringToFront(false);
        this.update();
    }

    disableMaximize() {
        const maximize = this.titleBarButtons.querySelector(':nth-child(2)');
        maximize.setAttribute('disabled', 'disabled');
        Object.assign(maximize.style, {
            pointerEvents: 'none',
            cursor: 'not-allowed'
        });
    }

    close() {
        document.querySelector("#switcher-buttons").removeChild(this.taskBtn);
        this.elem.style.animation = 'die 0.2s forwards';
        setTimeout(() => document.querySelector('#app').removeChild(this.elem), 210);
    }
}

class About extends Window {
    generateContent() {
        let elt = createElement({

            className: 'window-frame',
            style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            },
            innerHTML: `<div><b>Pseudows by shantaram</b></div>
            <div>This program is free, open-source software under the MIT License.</div>
            <div>Copyright © 2021 Siddharth Singh</div>
            <div>version 0.4.2</div>`,
            parent: this.elem
        })
    }
}

function saveFile(blob, name) {
    let link = createElement({
        type: 'a',
        misc: {
            href: URL.createObjectURL(blob),
            download: name || 'file.txt'
        }
    })
    link.click();
}

function evalArithmetic(string) {
    if (/[^+\-*\/\^().0-9 ]/.test(string)) throw new Error("Non-arithmetic character detected");
    while (/\^/.test(string)) {
        string = string.replace('^', '**');
    }
    return eval(string);
}

class Notepad extends Window {
    generateContent() {
        let elt = createElement({ parent: this.elem, className: 'window-frame notepad-frame' });
        let actions = createElement({ parent: elt, className: 'window-actions' });
        let ta = createElement({ parent: elt, type: 'textarea', className: 'notepad' });
        createElement({ // save button
            parent: actions,
            type: 'span', className: 'window-action-button', innerHTML: 'Save',
            misc: { onclick: () => this.save(ta.value) },
        })
        createElement({ // close button
            parent: actions,
            type: 'span', className: 'window-action-button', innerHTML: 'Close',
            misc: { onclick: this.close },
        })
    }

    save(contents) {
        let blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
        createPrompt('Save as', 'Enter a filename.', // Title, message
            (name) => saveFile(blob, name), // Success callback
            'Save', // Button alias
            (type) => createAlert('Cancelled', // Error callback
                type == ALERT_CANCELLED ? "Input cancelled." : "Empty filename.",
                'info'
            )
        );
    }

    close() {
        createConfirm('Confirm', 'Are you sure you want to exit?',
            () => super.close(), () => hideAlert(), // yes and no callbacks
            "I'm sure", "Cancel" // Button aliases
        );
    }
}

class Terminal extends Window {
    generateContent() {
        createElement({
            parent: this.elem,
            className: 'window-frame terminal-frame',
            children: [
                document.createTextNode('Pseudows cannot find ‘cmd’. Make sure you typed the name correctly, and then try again.')
            ]
        })
    }
}

class Calculator extends Window {
    static BUTTONS = [1, 2, 3, '+', 4, 5, 6, '-', 7, 8, 9, '*', 'C', 0, '^', '/'];
    constructor(width, height, args) {
        super(width, height, args);
        this.disableMaximize();
    }

    toggleMaximized() { }

    generateContent() {
        let frame = createElement({
            className: 'window-frame calculator-frame',
            parent: this.elem
        })

        this.field = createElement({
            type: 'input', className: 'calc-field',
            misc: { type: 'text' }
        })

        let container = createElement({
            parent: frame,
            className: 'calc-items',
            children: [this.field]
        })

        const that = this;
        Calculator.BUTTONS.forEach((button) => {
            let btn = createElement({
                parent: container,
                type: 'button', innerHTML: button.toString(),
                misc: { type: 'button', value: button }
            })
            if (button === 'C') btn.onclick = () => that.field.value = '';
            else btn.onclick = () => that.field.value += btn.value;
        })

        let equals = createElement({
            parent: container,
            type: 'button', className: 'calc-equals', innerHTML: '=',
            misc: { value: '=', onclick: () => this.compute(this.field) },
        })
    }

    compute(field) {
        field.value = field.value.trim();
        try {
            if (field.value) field.value = evalArithmetic(field.value);
        } catch (e) {
            field.value = e;
        }
    }
}

class InternetWanderer extends Window {
    generateContent() {
        let frame = createElement({
            parent: this.elem,
            className: 'window-frame ie-frame',
            style: { cursor: 'progress' },
            innerHTML: `
                <h1><i class='fa fa-internet-explorer'></i></h1>
                <h3>
                <div> Welcome to Wanderer!</div>
                <div> This is the first-time setup process. </div>
                <div> Press Next to continue. </div>
                </h3>
            `,
            children: [createElement({
                type: 'button',
                innerHTML: 'next',
                misc: { type: 'button', onclick: () => this.fail() }
            })]
        })
    }

    fail() {
        setTimeout(() =>
            // title, msg...
            createAlert('Error', 'An error occurred while the setup process was being started. Wanderer failed to start.',
                'error', // Dialog mode
                () => { // action callback
                    hideAlert()
                    this.close()
                },
                "OK" // button alias
            ), 1000
        );
    }
}

class Paint extends Window {
    generateContent() {
        createElement({
            parent: this.elem,
            className: 'window-frame paint-frame',
            children: [
                createElement({
                    type: 'iframe', style: { 'width': '100%', 'height': '100%' },
                    misc: { src: 'https://jspaint.app' }
                })
            ]
        });
    }
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
        if (!app.lastMousePos.x || !app.lastMousePos.y) return;
        let d = { x: e.clientX - app.lastMousePos.x, y: e.clientY - app.lastMousePos.y };

        app.draggedElement.pos.x += d.x;
        app.draggedElement.pos.y += d.y;

        app.draggedElement.update();
    }

    app.lastMousePos = { x: e.clientX, y: e.clientY }
}

const APPS = {
    'Notepad': {
        title: 'Notepad',
        obj: Notepad, width: 400, height: 300,
        desktop: true, icon: '<i class="fas fa-file-alt"></i>'
    },
    'Terminal': {
        title: 'Terminal',
        'obj': Terminal, width: 500, height: 300,
        desktop: true, icon: '<i class="fas fa-terminal"></i>'
    },
    'Calculator': {
        title: 'Calculator',
        'obj': Calculator, width: 300, height: 400,
        desktop: true, icon: '<i class="fas fa-calculator"></i>'
    },
    'Internet Wanderer': {
        title: 'Internet Wanderer',
        'obj': InternetWanderer, width: 800, height: 600,
        desktop: true, icon: '<i class="fa fa-internet-explorer" aria-hidden="true"></i>'
    },
    'Paint': {
        title: 'Paint',
        'obj': Paint, width: 800, height: 600,
        desktop: true, icon: '<i class="fas fa-palette"></i>'
    },
    'About...': {
        title: 'About',
        'obj': About, width: 300, height: 200,
        desktop: true, icon: '<i class="fas fa-info-circle"></i>'
    },
}

function populateItems(apps) {

    const createDesktopItem = (icon, label) => `<div class='desktop-icon'>${icon}</div> <span class='desktop-label'>${label}</span>`;
    let menuList = document.querySelector("#menu-items");
    let desktop = document.querySelector("#desktop");
    menuList.innerHTML = '';

    const setSelectedDitm = (ditm) => {
        document.querySelectorAll('.desktop-item.selected').forEach((elem) => elem.classList.remove('selected'));
        ditm.classList.add('selected');
    }

    for (let key in apps) {
        const item = apps[key];
        const icon = item.icon || '';

        const launch = () => {
            hideMenu();
            app.addWindow(item.obj, item.width, item.height, { name: item.title });
        }

        const elt = createElement({
            parent: menuList,
            className: 'menu-item', innerHTML: ` ${icon} <span>${key}</span> `,
            misc: { onclick: launch }
        })

        if (item.desktop) {
            const ditm = createElement({
                parent: desktop,
                className: 'desktop-item', innerHTML: createDesktopItem(item.icon, item.title),
                misc: { ondblclick: launch, onclick: () => setSelectedDitm(ditm) }
            })
        }
    }
}

function matchesList(el, selectorList) {
    for (let x of selectorList) if (el.matches(x)) return true;
    return false;
}

window.addEventListener('click', function (e) {
    let menu = document.querySelector("#menu");
    let openBtn = document.querySelector("#menu-open-btn");
    if (e.target !== menu && !menu.contains(e.target) && e.target !== openBtn) hideMenu();
    if (!matchesList(e.target,
        ['.desktop-item', '.desktop-icon', '.desktop-item.selected', '.desktop-label', '.desktop-icon > i']
    )) {
        document.querySelectorAll('.desktop-item.selected').forEach((elem) => elem.classList.remove('selected'));
    }
})

function init() {
    app = new App();
    document.querySelector("#menu-open-btn").onclick = toggleMenu;
    window.addEventListener('mousemove', mouseMove);

    populateItems(APPS);

    const date = document.querySelector("#switcher-clock-date");
    const time = document.querySelector("#switcher-clock-time");

    function updateClock() {
        let cur = new Date();
        date.innerHTML = cur.toLocaleDateString();
        time.innerHTML = cur.toLocaleTimeString();
        setTimeout(updateClock, 1000);
    }

    updateClock();
}

window.addEventListener('DOMContentLoaded', () => init());