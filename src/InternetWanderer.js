class InternetWanderer extends Window {
    generateContent() {
        this.frame = createElement({
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
        this.frame.style.cursor = 'wait';
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
