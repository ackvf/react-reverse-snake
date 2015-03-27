/**
 * @jsx React.DOM
 */
var DOT = 1, SNAKE = 2, FOOD = 3;
var CELLS = ["empty", "dot", "snake", "food"];
var KEYS = {left: 37, up: 38, right: 39, down: 40};

var Game = React.createClass({
	getInitialState: function() {
		var
			startSnake = 0,
			startDot = 315,
			board = [],
			foodReadyCounterValue = 20; // number of ticks between food spawns, decrement to zero to spawn as !0 == true //TODO random intervals or increasing intervals to raise difficulty?

			board[startSnake] = SNAKE;
			board[startDot] = DOT;

		return {
			snake: [startSnake,],
			dot: startDot,
			food: null,
			board: board,
			growth: 3,
			foodReadyCounterValue: foodReadyCounterValue,
			foodReadyCounter: foodReadyCounterValue,
			gameOver: false,
			numCols: 20,
			numRows: 20,
			snakeDirection: 39 // default right
		}
	},

	componentDidMount: function() {
    this.refs.board.getDOMNode().focus();
		this.tick();
	},

	getNextIndex: function(head, snakeDirection, numRows, numCols) {
		var
			food = this.state.food,
			dot = this.state.dot,
			xy = this.toXY(head, numCols), // snake's xy
			x = xy[0],
			y = xy[1];

			if (food == head) {
				food = null;
				this.setState({food: food});
			}


		var targetXY = (food) ? this.toXY(food) : this.toXY(dot); // prioritize food over player

		var
			dirY = targetXY[1] - y, // vertical direction
			dirX = targetXY[0] - x, // horizontal ..
			dstY = Math.abs(dirY),  // vertical distance
			dstX = Math.abs(dirX);  // ..
		var nextDirection = (dstY > dstX)
															?	((dirY < 0) ? KEYS.up : KEYS.down)
															: ((dirX < 0) ? KEYS.left : KEYS.right);

    if (Math.abs(nextDirection - snakeDirection) == 2) {
    	nextDirection = (dstY < dstX)
															?	((dirY < 0) ? KEYS.up : KEYS.down)
															: ((dirX < 0) ? KEYS.left : KEYS.right);
    }

		switch (nextDirection) {
			case KEYS.up:    y -= 1; break;
			case KEYS.down:  y += 1; break;
			case KEYS.left:  x -= 1; break;
			case KEYS.right: x += 1; break;
			default: return;
		}

		this.setState({snakeDirection: nextDirection});

		return (numCols * y) + x;
	},

	getNewBoardIndex: function(dot, direction, numRows, numCols) {
		var
			xy = this.toXY(dot, numCols), // dot's xy
			x = xy[0],
			y = xy[1];

		switch (direction) {
	    case KEYS.up:    y = y <= 0 ? numRows - 1 : y - 1; break;
	    case KEYS.down:  y = y >= numRows - 1 ? 0 : y + 1; break;
	    case KEYS.left:  x = x <= 0 ? numCols - 1 : x - 1; break;
	    case KEYS.right: x = x >= numCols - 1 ? 0 : x + 1; break;
	    default: return;
	  }

		return (numCols * y) + x;
	},

	tick: React.autoBind(function() {
		var
			snake = this.state.snake;
			board = this.state.board;
			growth = this.state.growth;
			food = this.state.food;
			dot = this.state.dot;
			snakeDirection = this.state.snakeDirection;
			nextDotMove = this.nextDotMove;

		var
			numRows = this.state.numRows,
			numCols = this.state.numCols;


		if (this.nextDotMove) {
			var previous = dot;
			dot = this.getNewBoardIndex(dot, nextDotMove, numRows, numCols);

			if (board[dot] != SNAKE) { // can't pass through snake
				if (!board[dot]) { // do not pick up food
					board[previous] = null;
					board[dot] = DOT;
				}
			} else {
				dot = previous;
			}

			this.nextDotMove = null;
		}


		var
			head = this.getNextIndex(snake[0], snakeDirection, numRows, numCols);

		if (snake.indexOf(head) != -1) {
			this.setState({gameOver: true});
			alert("gameover");
			return;
		}

		if (head == dot) {
			this.setState({gameOver: true});
			alert("gameover");
			return;
		}


		// spawn new food
		if ((this.state.foodReadyCounter <= 0) && board.indexOf(FOOD) == -1) {
			this.state.foodReadyCounter = this.state.foodReadyCounterValue;

			var rx, ry, ii;
			do {
				rx = Math.floor(Math.random() * (numCols-4)) + 2; // 2 blocks away from border
				ry = Math.floor(Math.random() * (numRows-4)) + 2; // ..
				ii = ry*numCols + rx;
			} while (board[ii] != null)
			board[ii] = FOOD;
			this.setState({food: ii});
			growth += 2;
		} else if (growth) {
			growth -= 1;
		} else {
			board[snake.pop()] = null;
		}

		snake.unshift(head);
		board[head] = SNAKE;

		this.setState({
			dot: dot,
			snake: snake,
			board: board,
			growth: growth,
		});

		if (board.indexOf(FOOD) == -1) this.state.foodReadyCounter --;
		setTimeout(this.tick, 200);
	}),

	toXY: function(pos, numCols) {
		var x = pos % (numCols || this.state.numCols);
		var y = Math.floor(pos / (numCols || this.state.numCols));
		return [x,y];
	},

	keyPressed: React.autoBind(function(event) {
		var keypressed = event.nativeEvent.keyCode;
		if (keypressed >= 37 || keypressed <= 40) {
			this.nextDotMove = keypressed;
		}
	}),

	render: function() {
		var cells = [];
		var numRows = this.state.numRows;
		var numCols = this.state.numCols;
		var cellSize = 30;

		for (var row = 0; row < numRows; row++) {
			for (var col = 0; col < numCols; col++) {
				var code = this.state.board[numCols * row + col] || 0;
				var type = CELLS[code];
				cells.push(<div class={type} />);
			}
		}

		return (
				<div
					ref="board"
					class={'board' + (this.state.gameOver ? ' game-over' : '')}
          tabIndex={0}
					onKeyDown={this.keyPressed}
					style={{width: numCols * cellSize, height: numRows * cellSize}}>
					{cells}
				</div>
		);
	}
});

React.renderComponent(<Game />, document.body);