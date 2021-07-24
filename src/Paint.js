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