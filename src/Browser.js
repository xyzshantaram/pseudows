class Browser extends Window {
    history = []
    generateContent() {
        let frame = createElement({ parent: this.elem, className: 'window-frame browser-frame' });
        let actions = createElement({ parent: frame, className: 'window-actions' });
        createElement({ // save button
            parent: actions,
            type: 'span', className: 'window-action-button', innerHTML: '<i class="fa fa-home" aria-hidden="true"></i>',
            misc: { onclick: () => this.navigate(''), title: 'Home' },
        })

        this.field = createElement({
            parent: actions,
            type: 'input', className: 'browser-field',
            misc: {
                type: 'text'
            }
        })


        createElement({
            parent: actions,
            type: 'button',
            innerHTML: 'Go'
        }).onclick = () => {
            if (this.field.value) {
                this.go();
            }
        }

        this.iframe = createElement({
            parent: frame,
            type: 'iframe',
            style: {
                width: '100%',
                height: '100%'
            }
        });

        this.navigate('');

        this.field.addEventListener('keyup', (e) => {
            if (e.key == 'Enter' && this.field.value) {
                this.go();
            }
        })

        this.field.addEventListener('input', function (e) {
            this.value = this.value.trim();
        });
    }

    navigate(url) {
        if (url == '') {
            this.iframe.src = '/src/frame.html';
            return;
        }
        if (url.includes('google.com')) {
            url = 'https://google.com/webhp?igu=1';
        }
        if (!(url.startsWith('http://') || url.startsWith('https://'))) url = 'http://' + url;
        console.log(url);
        this.iframe.src = url;
    }

    go() {
        this.navigate(this.field.value);
    }
}