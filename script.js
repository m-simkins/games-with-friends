function Player() {
  const player = { name: "", mark: "", points: 0, active: false }
  
  return {
    getEntries: () => Object.entries(player),
    setValue: (key, value) => player[key] = value,
    getValue: (key) => player[key],
    clearPoints: () => player.points = 0,
    addPoint: () => player.points++,
    losePoint: () => player.points--,
    isActive: () => player.active,
    toggleActive: () => player.active = !player.active,
  }
};

function Board() {
  const board = [];
  return {
    buildBoard: (rows, cols) => {
      if (!cols) cols = rows;
      for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) row.push("");
        board.push(row);
      }
    },
    getBoard: () => board,
    markBoard: (row, col, mark) => board[row][col] = mark,
    clearBoard: () => {
      for (let i = 0; i < board.length; i++) {
        const newRow = [];
        for (let j = 0; j < board[i].length; j++) newRow.push("");
        board.shift();
        board.push(newRow);        
      };
    }
  };
};

function ticTacToe() {
  const defaultMarks = ["X", "O"];
  const board = Board();
  let message;
  function resolveTurn(row, col, player) {
    if (playerWinsRound(row, col, player)) {
      player.addPoint();
      console.log(player.getValue("name"), player.getValue("points"));
      message = `${player.getValue("name")} wins! play again?`
      return "win";
    } else if (boardIsFull()) {
      message = "it's a draw. play again?"
      return "draw";
    } else {
      return "";
    }
  };
  function playerWinsRound(row, col, player) {
    const playerMark = player.getValue("mark");
    const boardArr = board.getBoard();
    const checkedLines = [[],[],[],[]];
    const isAWinner = [];
    for (let i = 0; i < boardArr.length; i++) {
      checkedLines[0].push(boardArr[row][i]);
      checkedLines[1].push(boardArr[i][col]);
      checkedLines[2].push(boardArr[i][i]);
      checkedLines[3].push(boardArr[i][boardArr.length - 1 - i]);
    }
    checkedLines.forEach((line) => {
      isAWinner.push(line.every((mark) => mark === playerMark));
    })
    return isAWinner.indexOf(true) !== -1
  };
  function boardIsFull() {
    const checks = [];
    board.getBoard().forEach((row) => checks.push(row.every((mark) => mark !== "")));
    return checks.every((check) => check === true);
  };
  return {
    getDefaultMarks: () => defaultMarks,
    getBoard: board.getBoard,
    clearBoard: board.clearBoard,
    buildBoard: (players) => board.buildBoard(players.length + 1),
    takeTurn: (row, col, player) => {
      if (board.getBoard()[row][col] === "") {
        board.markBoard(row, col, player.getValue("mark"));
        return resolveTurn(row, col, player);
      } else {
        return "invalid";
      }
    },
    getMessage: () => message,
    setMessage: (newMessage) => message = newMessage,
  }

};

function State() {
  const defaultGame = ticTacToe();
  const defaultMarks = defaultGame.getDefaultMarks();
  const players = [];
  let game = defaultGame;
  let turnResult = "";
  let activePlayer;

  function changeActivePlayer() {
    const i = players.indexOf(activePlayer);
    activePlayer.toggleActive();
    activePlayer = i === players.length - 1 ? players[0] : players[i + 1];
    activePlayer.toggleActive();
  }

  function setPlayerDefaults() {
    defaultMarks.forEach((mark) => {
      const player = Player();
      player.setValue("name",`player${mark}`);
      player.setValue("mark",`${mark.toUpperCase()}`);
      players.push(player);
    });
  };

  function startNextTurn() {
    changeActivePlayer();
    game.setMessage(`it's ${activePlayer.getValue("name")}'s turn`);
  }
  
  return {
    getPlayers: () => players,
    addPlayer: (player) => players.push(player),
    resetPlayers: () => players.length = 0,
    getActivePlayer: () => activePlayer,
    getGame: () => game,
    setGame: (chosenGame) => game = chosenGame,
    getBoard: game.getBoard,
    getTurnResult: () => turnResult,
    getMessage: game.getMessage,
    initDefaultState: () => {
      game = defaultGame;
      setPlayerDefaults();
      game.buildBoard(players);
    },
    startGame : () => {
      activePlayer = players[0];
      game.setMessage(`it's ${activePlayer.getValue("name")}'s turn`);
    },
    takeTurn: (row, col) => {
      turnResult = game.takeTurn(row, col, activePlayer);
      if (turnResult === "") startNextTurn();
    },
    startNewRound: () => {
      game.clearBoard();
      startNextTurn();  
    }
  }
};

function Elements() {
  function LabelInputPair(inputName) {
    const pair = document.createElement("div");
    pair.classList.add(`${inputName}-input-label-pair`, "input-label-pair");
    const label = document.createElement("label");
    label.classList.add(`${inputName}-label`);
    label.innerText = `${inputName}`;
    const input = document.createElement("input");
    input.classList.add(`${inputName}-input`, "player-input");
    input.name = `${inputName}`;
    pair.append(label, input);
    return pair;
  }

  const PlayerInputCard = (player) => {
    const card = document.createElement("div");
    card.classList.add("player-input-card");
    for (let i = 0; i < player.getEntries().length; i++) {
      const entry = player.getEntries()[i];
      if (typeof entry[1] === "string") card.append(LabelInputPair(entry[0]));
    }
    return card;
  }

  const PlayerDisplayCard = (player) => {
    const card = document.createElement("div");
    card.classList.add("player-display-card");
    for (let i = 0; i < player.getEntries().length; i++) {
      const entry = player.getEntries()[i];
      if (typeof entry[1] !== "boolean") {
        const display = document.createElement("p");
        display.classList.add(`${entry[0]}-display`);
        display.innerText = `${entry[1]}`;
        card.append(display);
      }
    }
    return card;
  }

  const SetupButton = (text) => {
    const button = document.createElement("button");
    button.id = `${text.replace(" ","-")}-button`;
    button.classList.add("setup-button");
    button.innerText = text;
    return button;
  }

  const Board = (board) => {
    const container = document.createElement("div");
    container.id = "board";
    for (let i = 0; i < board.length; i++) {

      for (let j = 0; j < board[i].length; j++) {
        const button = document.createElement("button");
        button.classList.add("board-button");
        button.dataset.row = [i];
        button.dataset.col = [j];
        button.innerText = board[i][j];
        button.disabled = true;
        container.append(button);
      }
    }
    container.style.gridTemplateColumns = `repeat(${board[0].length}, 1fr)`;
    return container;
  }

  return {
    PlayerInputCard,
    PlayerDisplayCard,
    SetupButton,
    Board,
  }
};

function Listeners() {
  const elem = Elements();
  const state = State();
  const players = state.getPlayers();
  const board = state.getBoard();
  
  const takeTurn = (e) => {
    const row = e.target.dataset.row;
    const col = e.target.dataset.col;
    state.takeTurn(row, col);
    e.target.innerText = board[row][col];
    if (state.getTurnResult() === "win") endRound();
    document.getElementById("message").innerText = state.getMessage();
  }

  function endRound() {
    const playAgainButton = elem.SetupButton("play again");
    playAgainButton.addEventListener("click", playAgain);  
    document.getElementById("setup").append(playAgainButton);
    document.getElementById("play-again-button").focus();
    const pointsDisplays = Array.from(document.getElementsByClassName("points-display"));
    pointsDisplays.forEach((display, index) => display.innerText = `${players[index].getValue("points")}`);
  }

  const savePlayers = () => {
    state.resetPlayers();
    const inputCards = Array.from(document.getElementsByClassName("player-input-card"));
    inputCards.forEach((card) => {
      const player = Player();
      const inputs = Array.from(card.getElementsByTagName("input"));
      inputs.forEach(input => {
        player.setValue(input.name, input.value);
      });
      state.addPlayer(player);
    });
    setUpDisplay();
  };
  
  const startGame = (e) => {
    state.startGame();
    Array.from(document.getElementsByClassName("board-button")).forEach(button => {
      button.disabled = false
      button.addEventListener("click", takeTurn);
    });
    document.getElementById("message").innerText = state.getMessage();
    e.target.remove();
  }

  const playAgain = (e) => {
    state.startNewRound();
    const boardButtons = Array.from(document.getElementsByClassName("board-button"));
    boardButtons.forEach(button => {
      button.innerText = "";
    });
    document.getElementById("message").innerText = state.getMessage();
    e.target.remove();
  }

  function setUpDisplay() {
    document.getElementById("save-players-button").remove();
    const startGameButton = elem.SetupButton("start game");
    startGameButton.addEventListener("click", startGame);  
    document.getElementById("setup").append(startGameButton);
    document.getElementById("start-game-button").focus();
    displayPlayers();
    document.body.append(elem.Board(board));
  }

  function displayPlayers() {
    const playersDisplay = document.getElementById("players");
    playersDisplay.innerHTML = "";
    players.forEach((player, index) => {
      const card = elem.PlayerDisplayCard(player);
      card.id = `${index}-display-card`;
      playersDisplay.append(card);
    });
  }

  return {
    getState: () => state,
    savePlayers,
    startGame,
    takeTurn,
    playAgain,
  }
}

(() => {
  const listen = Listeners();
  const elem = Elements();
  const state = listen.getState();
  const players = state.getPlayers();

  state.initDefaultState();

  const playersDisplay = document.getElementById("players");
  players.forEach(player => playersDisplay.append(elem.PlayerInputCard(player)));

  const savePlayersButton = elem.SetupButton("save players");
  savePlayersButton.addEventListener("click", listen.savePlayers);

  document.getElementById("setup").append(savePlayersButton);

})();