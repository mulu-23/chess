let curBoard;
let curPlayer;
let curHeldPiece;
let curHeldPieceStartingPosition;
let highlightedSquares = [];
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let gameOver = false;

function startGame() {
    const starterPosition = [
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
    ];

    const starterPlayer = 'white';
    gameOver = false;
    loadPosition(starterPosition, starterPlayer);
    updateTurnIndicator();
}

function loadPosition(position, playerToMove) {
    curBoard = position.map(row => [...row]);
    curPlayer = playerToMove;

    document.querySelectorAll('.board__square').forEach(square => {
        square.innerHTML = '';
        square.classList.remove('board__square_check');
    });

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (position[i][j] !== '.') {
                loadPiece(position[i][j], [i + 1, j + 1]);
            }
        }
    }

    checkAndDisplayCheck();
}

function loadPiece(piece, position) {
    const squareElement = document.getElementById(`${position[0]}${position[1]}`);
    if (!squareElement) return;

    const pieceElement = document.createElement('img');
    pieceElement.classList.add('board__piece');
    pieceElement.id = piece;
    pieceElement.draggable = false;
    pieceElement.src = getPieceImageSource(piece);
    pieceElement.setAttribute('data-row', position[0] - 1);
    pieceElement.setAttribute('data-col', position[1] - 1);

    squareElement.appendChild(pieceElement);
}

function getPieceImageSource(piece) {
    switch (piece) {
        case 'R': return 'black_rook.png';
        case 'N': return 'black_knight.png';
        case 'B': return 'black_bishop.png';
        case 'Q': return 'black_queen.png';
        case 'K': return 'black_king.png';
        case 'P': return 'black_pawn.png';
        case 'r': return 'white_rook.png';
        case 'n': return 'white_knight.png';
        case 'b': return 'white_bishop.png';
        case 'q': return 'white_queen.png';
        case 'k': return 'white_king.png';
        case 'p': return 'white_pawn.png';
        default: return '';
    }
}

function showNotification(type, message) {
    const container = document.getElementById('notification-container');
    container.innerHTML = '';

    const notification = document.createElement('div');
    notification.className = `notification notification_type_${type}`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification__close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => notification.remove();

    const title = document.createElement('div');
    title.className = 'notification__title';
    
    switch(type) {
        case 'check':
            title.textContent = 'ШАХ!';
            break;
        case 'checkmate':
            title.textContent = 'ШАХ И МАТ!';
            break;
    }

    const msg = document.createElement('div');
    msg.className = 'notification__message';
    msg.textContent = message;

    notification.appendChild(closeBtn);
    notification.appendChild(title);
    notification.appendChild(msg);

    if (type === 'checkmate') {
        const button = document.createElement('button');
        button.className = 'notification__button';
        button.textContent = 'Новая игра';
        button.onclick = () => {
            notification.remove();
            startGame();
        };
        notification.appendChild(button);
    }

    container.appendChild(notification);

    if (type === 'check') {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    if (indicator) {
        const turnText = curPlayer === 'white' ? 'Ход белых' : 'Ход черных';
        indicator.textContent = turnText;
        
        if (gameOver) {
            indicator.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        } else {
            indicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }
}

function findKingPosition(color) {
    const kingChar = color === 'white' ? 'k' : 'K';
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (curBoard[i][j] === kingChar) {
                return [i, j];
            }
        }
    }
    return null;
}

function isSquareUnderAttack(position, attackingColor) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = curBoard[i][j];
            if (piece === '.') continue;
            
            const isWhitePiece = piece === piece.toLowerCase();
            const pieceColor = isWhitePiece ? 'white' : 'black';
            
            if (pieceColor === attackingColor) {
                const originalPlayer = curPlayer;
                curPlayer = attackingColor;
                
                const canAttack = validateMovement([i, j], position, true);
                
                curPlayer = originalPlayer;
                
                if (canAttack) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isKingInCheck(color) {
    const kingPos = findKingPosition(color);
    if (!kingPos) return false;
    
    const attackingColor = color === 'white' ? 'black' : 'white';
    return isSquareUnderAttack(kingPos, attackingColor);
}

function highlightKingInCheck() {
    document.querySelectorAll('.board__square').forEach(square => {
        square.classList.remove('board__square_check');
    });

    const whiteKingPos = findKingPosition('white');
    const blackKingPos = findKingPosition('black');

    if (whiteKingPos && isKingInCheck('white')) {
        const square = document.getElementById(`${whiteKingPos[0] + 1}${whiteKingPos[1] + 1}`);
        if (square) {
            square.classList.add('board__square_check');
        }
    }

    if (blackKingPos && isKingInCheck('black')) {
        const square = document.getElementById(`${blackKingPos[0] + 1}${blackKingPos[1] + 1}`);
        if (square) {
            square.classList.add('board__square_check');
        }
    }
}

function checkAndDisplayCheck() {
    highlightKingInCheck();
    
    if (isKingInCheck(curPlayer)) {
        if (isCheckmate(curPlayer)) {
            const winner = curPlayer === 'white' ? 'черные' : 'белые';
            showNotification('checkmate', `${winner} победили!`);
            gameOver = true;
            updateTurnIndicator();
        } else {
            showNotification('check', `${curPlayer === 'white' ? 'Белый' : 'Черный'} король под шахом!`);
        }
    }
}

function isCheckmate(color) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = curBoard[i][j];
            if (piece === '.') continue;
            
            const isWhitePiece = piece === piece.toLowerCase();
            const pieceColor = isWhitePiece ? 'white' : 'black';
            
            if (pieceColor === color) {
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        const startPos = [i, j];
                        const endPos = [x, y];
                        
                        if (startPos[0] === endPos[0] && startPos[1] === endPos[1]) continue;
                        
                        if (validateMovement(startPos, endPos, true)) {
                            const originalPiece = curBoard[endPos[0]][endPos[1]];
                            curBoard[endPos[0]][endPos[1]] = piece;
                            curBoard[startPos[0]][startPos[1]] = '.';
                            
                            const stillInCheck = isKingInCheck(color);
                            
                            curBoard[startPos[0]][startPos[1]] = piece;
                            curBoard[endPos[0]][endPos[1]] = originalPiece;
                            
                            if (!stillInCheck) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }
    return true;
}

function clearHighlights() {
    highlightedSquares.forEach(pos => {
        const square = document.getElementById(`${pos[0] + 1}${pos[1] + 1}`);
        if (square) {
            square.classList.remove('board__square_highlighted');
        }
    });
    highlightedSquares = [];
}

function showValidMoves(startingPosition) {
    clearHighlights();
    
    if (gameOver) return;

    const piece = curBoard[startingPosition[0]][startingPosition[1]];
    if (!piece || piece === '.') return;

    const isWhitePiece = piece === piece.toLowerCase();
    if ((isWhitePiece && curPlayer !== 'white') || (!isWhitePiece && curPlayer !== 'black')) {
        return;
    }

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const endingPosition = [i, j];
            
            if (endingPosition[0] === startingPosition[0] && endingPosition[1] === startingPosition[1]) {
                continue;
            }

            if (validateMovement(startingPosition, endingPosition, true)) {
                const piece = curBoard[startingPosition[0]][startingPosition[1]];
                const isWhitePiece = piece === piece.toLowerCase();
                const pieceColor = isWhitePiece ? 'white' : 'black';
                
                const originalPiece = curBoard[endingPosition[0]][endingPosition[1]];
                curBoard[endingPosition[0]][endingPosition[1]] = piece;
                curBoard[startingPosition[0]][startingPosition[1]] = '.';
                
                const leavesKingInCheck = isKingInCheck(pieceColor);
                
                curBoard[startingPosition[0]][startingPosition[1]] = piece;
                curBoard[endingPosition[0]][endingPosition[1]] = originalPiece;
                
                if (!leavesKingInCheck) {
                    const square = document.getElementById(`${i + 1}${j + 1}`);
                    if (square) {
                        square.classList.add('board__square_highlighted');
                        highlightedSquares.push([i, j]);
                    }
                }
            }
        }
    }
}

function setPieceHoldEvents() {
    const board = document.querySelector('.board');
    
    board.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
    
    board.addEventListener('mousedown', function(event) {
        if (event.button !== 0) return;
        if (gameOver) return;

        const piece = event.target.closest('.board__piece');
        if (!piece) return;

        event.preventDefault();

        const square = piece.parentElement;
        const pos = square.id.split('').map(Number);
        const boardPos = [pos[0] - 1, pos[1] - 1];
        
        const pieceChar = piece.id;
        const isWhitePiece = pieceChar === pieceChar.toLowerCase();
        if ((isWhitePiece && curPlayer !== 'white') || (!isWhitePiece && curPlayer !== 'black')) {
            return;
        }

        showValidMoves(boardPos);

        const pieceRect = piece.getBoundingClientRect();
        
        dragOffsetX = pieceRect.width / 2;
        dragOffsetY = pieceRect.height / 2;

        curHeldPiece = piece;
        curHeldPieceStartingPosition = boardPos;
        isDragging = true;

        piece.classList.add('board__piece_dragging');
        piece.style.position = 'fixed';
        piece.style.zIndex = '1000';
        piece.style.willChange = 'left, top';
        
        updatePiecePosition(event.clientX, event.clientY);
    });

    document.addEventListener('mousemove', function(event) {
        if (!isDragging || !curHeldPiece) return;
        
        event.preventDefault();
        updatePiecePosition(event.clientX, event.clientY);
    });

    document.addEventListener('mouseup', function(event) {
        if (!isDragging || !curHeldPiece || gameOver) return;

        curHeldPiece.style.position = '';
        curHeldPiece.style.top = '';
        curHeldPiece.style.left = '';
        curHeldPiece.style.zIndex = '';
        curHeldPiece.style.willChange = '';
        curHeldPiece.classList.remove('board__piece_dragging');

        const boardElement = document.querySelector('.board');
        const boardRect = boardElement.getBoundingClientRect();

        if (event.clientX >= boardRect.left && event.clientX <= boardRect.right &&
            event.clientY >= boardRect.top && event.clientY <= boardRect.bottom) {
            
            const mousePositionOnBoardX = event.clientX - boardRect.left;
            const mousePositionOnBoardY = event.clientY - boardRect.top;

            const squareSize = document.querySelector('.board__square').offsetWidth;
            const boardBorderSize = parseInt(getComputedStyle(boardElement).borderLeftWidth) || 0;

            const colIndex = Math.floor((mousePositionOnBoardX - boardBorderSize) / squareSize);
            const rowIndex = Math.floor((mousePositionOnBoardY - boardBorderSize) / squareSize);

            if (rowIndex >= 0 && rowIndex < 8 && colIndex >= 0 && colIndex < 8) {
                const pieceReleasePosition = [rowIndex, colIndex];

                if (!(pieceReleasePosition[0] === curHeldPieceStartingPosition[0] && 
                      pieceReleasePosition[1] === curHeldPieceStartingPosition[1])) {
                    
                    if (validateMovement(curHeldPieceStartingPosition, pieceReleasePosition, false)) {
                        movePiece(curHeldPiece, curHeldPieceStartingPosition, pieceReleasePosition);
                    } else {
                        returnPieceToStart(curHeldPiece, curHeldPieceStartingPosition);
                    }
                } else {
                    returnPieceToStart(curHeldPiece, curHeldPieceStartingPosition);
                }
            } else {
                returnPieceToStart(curHeldPiece, curHeldPieceStartingPosition);
            }
        } else {
            returnPieceToStart(curHeldPiece, curHeldPieceStartingPosition);
        }

        curHeldPiece = null;
        curHeldPieceStartingPosition = null;
        isDragging = false;
        
        clearHighlights();
    });

    function updatePiecePosition(clientX, clientY) {
        if (!curHeldPiece) return;
        
        const x = clientX - dragOffsetX;
        const y = clientY - dragOffsetY;
        
        curHeldPiece.style.left = x + 'px';
        curHeldPiece.style.top = y + 'px';
    }

    function returnPieceToStart(piece, startPosition) {
        const originalSquare = document.getElementById(`${startPosition[0] + 1}${startPosition[1] + 1}`);
        if (originalSquare) {
            originalSquare.appendChild(piece);
        }
    }
}

function movePiece(piece, startingPosition, endingPosition) {
    const boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    
    if (boardPiece !== '.') {
        if ((boardPiece === boardPiece.toUpperCase() && curPlayer === 'black') ||
            (boardPiece === boardPiece.toLowerCase() && curPlayer === 'white')) {
            
            curBoard[startingPosition[0]][startingPosition[1]] = '.';
            curBoard[endingPosition[0]][endingPosition[1]] = boardPiece;

            const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);
            
            destinationSquare.innerHTML = '';
            destinationSquare.appendChild(piece);

            piece.setAttribute('data-row', endingPosition[0]);
            piece.setAttribute('data-col', endingPosition[1]);

            curPlayer = curPlayer === 'white' ? 'black' : 'white';
            
            updateTurnIndicator();
            checkAndDisplayCheck();
        }
    }
}

function validateMovement(startingPosition, endingPosition, isHighlightCheck = false) {
    const boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    
    if (!boardPiece || boardPiece === '.') return false;

    if (!isHighlightCheck) {
        const isWhitePiece = boardPiece === boardPiece.toLowerCase();
        if ((isWhitePiece && curPlayer !== 'white') || (!isWhitePiece && curPlayer !== 'black')) {
            return false;
        }
    }

    if (endingPosition[0] < 0 || endingPosition[0] >= 8 || endingPosition[1] < 0 || endingPosition[1] >= 8) {
        return false;
    }

    switch (boardPiece) {
        case 'r':
        case 'R': return validateRookMovement(startingPosition, endingPosition);
        case 'n':
        case 'N': return validateKnightMovement(startingPosition, endingPosition);
        case 'b':
        case 'B': return validateBishopMovement(startingPosition, endingPosition);
        case 'q':
        case 'Q': return validateQueenMovement(startingPosition, endingPosition);
        case 'k':
        case 'K': return validateKingMovement(startingPosition, endingPosition);
        case 'p': return validatePawnMovement('white', startingPosition, endingPosition);
        case 'P': return validatePawnMovement('black', startingPosition, endingPosition);
        default: return false;
    }
}

function validateBishopMovement(startingPosition, endingPosition) {
    if (endingPosition[0] - endingPosition[1] === startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] === startingPosition[0] + startingPosition[1]) {
        return validatePathIsBlocked(startingPosition, endingPosition);
    }
    return false;
}

function validateRookMovement(startingPosition, endingPosition) {
    if (endingPosition[0] === startingPosition[0] || endingPosition[1] === startingPosition[1]) {
        return validatePathIsBlocked(startingPosition, endingPosition);
    }
    return false;
}

function validateKingMovement(startingPosition, endingPosition) {
    if (Math.abs(endingPosition[0] - startingPosition[0]) <= 1 && 
        Math.abs(endingPosition[1] - startingPosition[1]) <= 1) {
        return !isFriendlyPieceOnEndingPosition(endingPosition);
    }
    return false;
}

function validateQueenMovement(startingPosition, endingPosition) {
    if (endingPosition[0] - endingPosition[1] === startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] === startingPosition[0] + startingPosition[1] ||
        endingPosition[0] === startingPosition[0] || endingPosition[1] === startingPosition[1]) {
        return validatePathIsBlocked(startingPosition, endingPosition);
    }
    return false;
}

function validatePawnMovement(pawnColor, startingPosition, endingPosition) {
    const direction = pawnColor === 'black' ? 1 : -1;
    const startRow = pawnColor === 'white' ? 6 : 1;
    const isFirstMove = startingPosition[0] === startRow;

    if (endingPosition[1] === startingPosition[1]) {
        if (endingPosition[0] === startingPosition[0] + direction) {
            return !isPieceOnSquare(endingPosition);
        }
        if (isFirstMove && endingPosition[0] === startingPosition[0] + direction * 2) {
            const middlePos = [startingPosition[0] + direction, startingPosition[1]];
            return !isPieceOnSquare(endingPosition) && !isPieceOnSquare(middlePos);
        }
    }
    
    if (endingPosition[0] === startingPosition[0] + direction &&
        Math.abs(endingPosition[1] - startingPosition[1]) === 1) {
        return isEnemyPieceOnEndingPosition(endingPosition);
    }
    
    return false;
}

function validateKnightMovement(startingPosition, endingPosition) {
    const rowDiff = Math.abs(endingPosition[0] - startingPosition[0]);
    const colDiff = Math.abs(endingPosition[1] - startingPosition[1]);
    
    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        return !isFriendlyPieceOnEndingPosition(endingPosition);
    }
    return false;
}

function validatePathIsBlocked(startingPosition, endingPosition) {
    const rowDiff = endingPosition[0] - startingPosition[0];
    const colDiff = endingPosition[1] - startingPosition[1];
    
    const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
    const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);
    
    let currentRow = startingPosition[0] + rowStep;
    let currentCol = startingPosition[1] + colStep;
    
    while (currentRow !== endingPosition[0] || currentCol !== endingPosition[1]) {
        if (isPieceOnSquare([currentRow, currentCol])) {
            return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
    }
    
    return !isFriendlyPieceOnEndingPosition(endingPosition);
}

function isPieceOnSquare(position) {
    if (position[0] < 0 || position[0] >= 8 || position[1] < 0 || position[1] >= 8) return true;
    const square = document.getElementById(`${position[0] + 1}${position[1] + 1}`);
    return square && square.children.length > 0;
}

function isFriendlyPieceOnEndingPosition(endingPosition) {
    const square = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);
    if (!square || square.children.length === 0) return false;
    
    const piece = square.querySelector('.board__piece');
    if (!piece) return false;
    
    const pieceChar = piece.id;
    const isWhitePiece = pieceChar === pieceChar.toLowerCase();
    
    return (isWhitePiece && curPlayer === 'white') || (!isWhitePiece && curPlayer === 'black');
}

function isEnemyPieceOnEndingPosition(endingPosition) {
    const square = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);
    if (!square || square.children.length === 0) return false;
    
    const piece = square.querySelector('.board__piece');
    if (!piece) return false;
    
    const pieceChar = piece.id;
    const isWhitePiece = pieceChar === pieceChar.toLowerCase();
    
    return (isWhitePiece && curPlayer === 'black') || (!isWhitePiece && curPlayer === 'white');
}

startGame();
setPieceHoldEvents();
