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

function toggleMenu() {
    const menu = document.querySelector("#menu");
    menu.style.display = app.menuOpen ? 'none' : 'flex';
    app.menuOpen = !app.menuOpen;
}

function hideMenu() {
    app.menuOpen = true;
    toggleMenu();
}

function matchesList(el, selectorList) {
    for (let x of selectorList) if (el.matches(x)) return true;
    return false;
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