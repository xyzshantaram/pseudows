class Minesweeper extends Window {
    generateContent() {
        let frame = createElement({ parent: this.elem, className: 'window-frame mines-frame' });
        let actions = createElement({ parent: frame, className: 'window-actions' });
        createElement({ // save button
            parent: actions,
            type: 'span', className: 'window-action-button', innerHTML: 'About...',
            misc: { onclick: () => this.showAboutNotice(), title: 'About' },
        })
        createElement({ // help button
            parent: actions,
            type: 'span', className: 'window-action-button', innerHTML: 'Help',
            misc: { onclick: () => this.showHelp(), title: 'Help' },
        })

        this.gridContainer = createElement({
            parent: frame,
            className: 'mine-grid',
        })

        this.board = new minesweeper.Board(minesweeper.generateMineArray({
            rows: 15,
            cols: 15,
            mines: 30
        }));
        this.render()
    }

    showAboutNotice() {
        createAlert('About',
            `<h3>Mines v1.0</h3>
            <div>Copyright © 2021 Siddharth Singh</div>
            <hr>
            <strong>Acknowledgements</strong>
            <div><a href='https://github.com/binaryluke/Minesweeper'>Minesweeper</a> Copyright (c) 2015 Luke Howard </div>`
        )
    }

    showHelp() {
        createAlert('Help',
            `<h3>How to play:</h3>
            <ul>
            <li> Use your mouse's left button to open tiles. </li>
            <li> Opened tiles display the number of mines in the closed areas around them. </li>
            <li> Use your mouse's right button to set flags on tiles. that you suspect contain mines. You can set an exclamation flag or a question flag. </li>
            <li> You win the game if you open all the tiles without triggering any mines. </li>
            </ul>
            `
        )
    }

    checkWon() {
        const state = this.board._state;
        switch (state) {
            case minesweeper.BoardStateEnum.LOST:
                createAlert(
                    'You lost',
                    'You lost the game.', 'error',
                    () => {
                        this.close();
                        hideAlert();
                    },
                    'Finish'
                )
                break;
            case minesweeper.BoardStateEnum.WON:
                createAlert(
                    'Congratulations!',
                    'You won!', 'error',
                    () => {
                        this.close();
                        hideAlert();
                    },
                    'Finish'
                )
                break;
            default:
                break;
        }
    }

    render() {
        this.checkWon();
        this.gridContainer.innerHTML = '';
        const grid = this.board.grid();

        const CellStateEnum = minesweeper.CellStateEnum;
        const CellFlagEnum = minesweeper.CellFlagEnum;

        for (let y = 0; y < this.board.numRows(); y++) {
            let row = createElement({ parent: this.gridContainer, className: 'mine-row' })
            for (let x = 0; x < this.board.numCols(); x++) {
                let btn = createElement({
                    parent: row, type: 'button', misc: { type: 'button' },
                    className: 'mine-tile'
                })
                let cell = grid[y][x];

                if (cell.state === CellStateEnum.CLOSED) {
                    switch (cell.flag) {
                        case CellFlagEnum.NONE:
                            btn.innerHTML = ' '
                            break;
                        case CellFlagEnum.EXCLAMATION:
                            btn.innerHTML = '<i class="fa fa-exclamation-circle"></i>'
                            break;
                        case CellFlagEnum.QUESTION:
                            btn.innerHTML = '<i class="fa fa-question-circle"></i>'
                            break;
                        case undefined:
                        default:
                            break;
                    }
                }
                else {
                    if (cell.isMine) btn.innerHTML = '<i class="fa fa-bomb"></i>'
                    else {
                        Object.assign(btn.style, {
                            boxShadow: 'none',
                            border: '1px solid slategray',
                            background: '#aaaaaa'
                        })
                        if (cell.numAdjacentMines) btn.innerHTML = cell.numAdjacentMines;
                    }
                }

                btn.onmousedown = (e) => {
                    if (e.button == 0) this.board.openCell(x, y);
                    else this.board.cycleCellFlag(x, y);
                    this.render();
                }
            }
        }
    }
}