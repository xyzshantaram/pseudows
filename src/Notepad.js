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