const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const playerNamesElement = document.getElementById("playerNames");
const currentTurnElement = document.getElementById("currentTurn");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", 
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                const pieceColorClass = square.color === 'w' ? "white" : "black";
                pieceElement.classList.add("piece", pieceColorClass);
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                        pieceElement.classList.add("dragging");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    if (draggedPiece) {
                        draggedPiece.classList.remove("dragging");
                    }
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    if (playerRole === 'b') {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        'p': '♟', // black pawn
        'r': '♜', // black rook
        'n': '♞', // black knight
        'b': '♝', // black bishop
        'q': '♛', // black queen
        'k': '♚', // black king
        'P': '♙', // white pawn
        'R': '♖', // white rook
        'N': '♘', // white knight
        'B': '♗', // white bishop
        'Q': '♕', // white queen
        'K': '♔'  // white king
    };

    return unicodePieces[piece.type + (piece.color === 'w' ? '' : '')];
};

const updatePlayerNames = (player1, player2) => {
    if (playerNamesElement) {
        playerNamesElement.textContent = `${player1} vs ${player2}`;
    } else {
        console.error("playerNamesElement is null");
    }
};

const updateCurrentTurn = () => {
    if (currentTurnElement) {
        currentTurnElement.textContent = chess.turn() === 'w' ? "White's Turn" : "Black's Turn";
    } else {
        console.error("currentTurnElement is null");
    }
};

const handleMove = (source, target) => {
    const from = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
    const to = `${String.fromCharCode(97 + target.col)}${8 - target.row}`;

    const move = {
        from,
        to
    };

    const result = chess.move(move);

    if (result) {
        socket.emit("move", result.san);
        updateCurrentTurn();
        renderBoard();
    } else {
        console.error("Invalid move:", move);
    }
};

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

socket.on("playerNames", (player1, player2) => {
    updatePlayerNames(player1, player2);
});
