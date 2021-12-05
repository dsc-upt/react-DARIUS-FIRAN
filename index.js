import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

function Square(props) {
    let squareClassName = null
    if (props.isWinnerSquare) {
        squareClassName = 'winner-square'
    } else {
        squareClassName = 'square'
    }

    return (
        <button className={squareClassName}
                onClick={props.onClick}
        >
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        let isWinnerSquare = false
        if (this.props.winnerSquares && this.props.winnerSquares.includes(i)) {
            isWinnerSquare = true;
        }
        return <Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            isWinnerSquare={isWinnerSquare}
        />
    }

    render() {
        const board = []
        for (let i = 0; i < 3; i++) {
            const row = []
            for (let j = 0; j < 3; j++) {
                row.push(this.renderSquare(i*3 + j))
            }
            board.push(<div className="board-row">{row}</div>)
        }

        return board
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            reverseHistory: false,
        }

        this.reverseHistory = this.reverseHistory.bind(this);
    }

    handleClick(i) {
        const locations = [
            [1, 1],
            [2, 1],
            [3, 1],
            [1, 2],
            [2, 2],
            [3, 2],
            [1, 3],
            [2, 3],
            [3, 3]
        ];

        const history = this.state.history.slice(0, this.state.stepNumber + 1)
        const current = history[history.length - 1]
        const squares = current.squares.slice()

        if (calculateWinner(squares, false) || squares[i]) {
            return
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O'
        this.setState({
            history: history.concat([{
                squares: squares,
                locations: locations[i]
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        })
    }

    reverseHistory() {
        this.setState({
            reverseHistory: !this.state.reverseHistory,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    render() {
        const history = this.state.history
        const current = history[this.state.stepNumber]
        const winner = calculateWinner(current.squares, false)
        const winnerSquares = calculateWinner(current.squares, true)
        const reverseHistory = this.state.reverseHistory;

        const steps = reverseHistory ? history.slice().reverse() : history
        const moves = steps.map((step, index, array) => {
            const move = this.state.reverseHistory ? (array.length - index - 1) : index;
            let desc = move ?
                'Go to move #' + move + ' -> ' + history[move].locations : 'Go to game start'
            if (move === this.state.stepNumber) {
                desc = <b>{ desc }</b>
            }
            return (
                <li key={ move }>
                    <button onClick={() => this.jumpTo(move)}>
                        { desc }
                    </button>
                </li>
            )
        })

        const noFreeSquares = current.squares.every((val) => (val != null))
        let status
        if (winner) {
            status = 'Winner: ' + winner
        } else if (noFreeSquares) {
            status = 'It\'s a draw!'
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={ current.squares }
                        onClick={(i) => this.handleClick(i)}
                        winnerSquares={winnerSquares}
                    />
                </div>
                <div className="game-info">
                    <div>{ status }</div>
                    <div>
                        <button onClick={this.reverseHistory}>
                            Reverse History
                        </button>
                    </div>
                    <ol>{ moves }</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);


function calculateWinner(squares, winners) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            if (winners) {
                return [a, b, c]
            }
            return squares[a];
        }
    }
    return null;
}