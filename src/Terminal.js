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