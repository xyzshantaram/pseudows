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
            innerHTML: `<div style='text-align: center'><b>Pseudows by shantaram</b></div>
            <div style='text-align: center'>This program is free, open-source software under the MIT License.</div>
            <div style='text-align: center'>Copyright © 2021 Siddharth Singh</div>
            <div style='text-align: center'>version 0.6.0</div>`,
            parent: this.elem
        })
    }
}