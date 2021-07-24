class About extends Window {
    generateContent() {
        createElement({
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