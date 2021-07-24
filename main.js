function init() {
    app = new App();
    document.querySelector("#menu-open-btn").onclick = toggleMenu;
    window.addEventListener('mousemove', (e) => {
        if (app.draggedElement != null) {
            if (!app.lastMousePos.x || !app.lastMousePos.y) return;

            let d = { x: e.clientX - app.lastMousePos.x, y: e.clientY - app.lastMousePos.y };
            app.draggedElement.pos.x += d.x;
            app.draggedElement.pos.y += d.y;

            app.draggedElement.update();
        }
        app.lastMousePos = { x: e.clientX, y: e.clientY }
    });

    window.addEventListener('click', (e) => {
        let menu = document.querySelector("#menu");
        let openBtn = document.querySelector("#menu-open-btn");
        if (e.target !== menu && !menu.contains(e.target) && e.target !== openBtn) hideMenu();
        if (!matchesList(e.target,
            ['.desktop-item', '.desktop-icon', '.desktop-item.selected', '.desktop-label', '.desktop-icon > i']
        )) {
            document.querySelectorAll('.desktop-item.selected').forEach((elem) => elem.classList.remove('selected'));
        }
    })

    populateItems(apps);

    const date = document.querySelector("#switcher-clock-date");
    const time = document.querySelector("#switcher-clock-time");
    (function updateClock() {
        let cur = new Date();
        date.innerHTML = cur.toLocaleDateString();
        time.innerHTML = cur.toLocaleTimeString();
        setTimeout(updateClock, 1000);
    })();
}

window.addEventListener('DOMContentLoaded', () => init());