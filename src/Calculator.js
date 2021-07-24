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