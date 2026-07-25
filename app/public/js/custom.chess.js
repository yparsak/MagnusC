// =============================================================================
// custom.chess.js
// =============================================================================

function showError(message) {
  $('#errorMessage').text(message);
  $('#overlay').removeClass('hidden');
  $('#errorModal').removeClass('hidden');
}

function closeError() {
  $('#overlay').addClass('hidden');
  $('#errorModal').addClass('hidden');
}

$(function () {
  if (!$('#board').length) {
    return;
  }

  var currentMode = 'editor';
  var eraseMode = false;

  var editorBoard = null;
  var analysisBoard = null;

  // Authoritative chess.js game for analysis mode. moveHistory/viewIndex let
  // arrow keys browse past positions without mutating `game`.
  var game = null;
  var analysisInitialFen = null;
  var moveHistory = [];
  var viewIndex = 0;

  initEditor();
  bindControls();

  function initEditor() {
    editorBoard = createEditorBoard();
    populateEnPassantOptions();
    syncFenField();
  }

  function createEditorBoard() {
    return Chessboard('board', {
      draggable: true,
      dropOffBoard: 'trash',
      sparePieces: true,
      position: 'start',
      pieceTheme: '/imgs/{piece}.png',
      onChange: onEditorBoardChange
    });
  }

  // chessboard.js fires onChange(oldPos, newPos) *before* it commits newPos
  // internally, so board.fen()/board.position() still report the stale
  // position here -- must build the FEN from the newPos argument instead.
  function onEditorBoardChange(oldPos, newPos) {
    $('#fenInput').val(buildFenFromPlacement(Chessboard.objToFen(newPos)));
  }

  function getCastlingString() {
    var castling = '';
    if ($('#castleWK').is(':checked')) castling += 'K';
    if ($('#castleWQ').is(':checked')) castling += 'Q';
    if ($('#castleBK').is(':checked')) castling += 'k';
    if ($('#castleBQ').is(':checked')) castling += 'q';
    return castling || '-';
  }

  function populateEnPassantOptions() {
    var rank = $('#turnSelect').val() === 'w' ? '6' : '3';
    var current = $('#epSelect').val();
    var $select = $('#epSelect').empty();

    $select.append($('<option>', { value: '-', text: '-' }));
    for (var file = 0; file < 8; file++) {
      var square = String.fromCharCode(97 + file) + rank;
      $select.append($('<option>', { value: square, text: square }));
    }

    if (current && $select.find('option[value="' + current + '"]').length) {
      $select.val(current);
    } else {
      $select.val('-');
    }
  }

  function buildFenFromPlacement(placement) {
    var turn = $('#turnSelect').val();
    var castling = getCastlingString();
    var ep = $('#epSelect').val() || '-';
    return [placement, turn, castling, ep, '0', '1'].join(' ');
  }

  function buildFenFromEditor() {
    return buildFenFromPlacement(editorBoard.fen());
  }

  function syncFenField() {
    $('#fenInput').val(buildFenFromEditor());
  }

  function normalizeFenInput(rawFen) {
    var parts = $.trim(rawFen || '').split(/\s+/);
    if (!parts[0]) {
      return null;
    }
    return [
      parts[0],
      parts[1] || 'w',
      parts[2] || '-',
      parts[3] || '-',
      parts[4] || '0',
      parts[5] || '1'
    ].join(' ');
  }

  function applyFenString(rawFen) {
    var normalized = normalizeFenInput(rawFen);
    if (!normalized) {
      showError('Please enter a FEN string.');
      return false;
    }

    var validation = new Chess().validate_fen(normalized);
    if (!validation.valid) {
      showError('Invalid FEN: ' + validation.error);
      return false;
    }

    var parts = normalized.split(' ');
    editorBoard.position(parts[0], false);
    $('#turnSelect').val(parts[1] === 'b' ? 'b' : 'w');
    $('#castleWK').prop('checked', parts[2].indexOf('K') !== -1);
    $('#castleWQ').prop('checked', parts[2].indexOf('Q') !== -1);
    $('#castleBK').prop('checked', parts[2].indexOf('k') !== -1);
    $('#castleBQ').prop('checked', parts[2].indexOf('q') !== -1);

    populateEnPassantOptions();
    if (parts[3] !== '-' && $('#epSelect option[value="' + parts[3] + '"]').length) {
      $('#epSelect').val(parts[3]);
    }

    syncFenField();
    return true;
  }

  function bindControls() {
    $('#turnSelect').on('change', function () {
      populateEnPassantOptions();
      syncFenField();
    });

    $('#castleWK, #castleWQ, #castleBK, #castleBQ, #epSelect').on('change', syncFenField);

    $('#fenInput').on('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFenString($(this).val());
      }
    });
    $('#fenInput').on('blur', function () {
      applyFenString($(this).val());
    });

    $('#setBoardApply').on('click', function () {
      applyFenString($('#setBoardInput').val());
    });
    $('#setBoardInput').on('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFenString($(this).val());
      }
    });

    $('#linkStartPos').on('click', function (e) {
      e.preventDefault();
      editorBoard.start(false);
      $('#turnSelect').val('w');
      $('#castleWK, #castleWQ, #castleBK, #castleBQ').prop('checked', true);
      populateEnPassantOptions();
      syncFenField();
    });

    $('#linkClearBoard').on('click', function (e) {
      e.preventDefault();
      editorBoard.clear(false);
      syncFenField();
    });

    $('#linkFlipBoard').on('click', function (e) {
      e.preventDefault();
      editorBoard.flip();
    });

    $('#linkAnalysisBoard').on('click', function (e) {
      e.preventDefault();
      startAnalysis();
    });

    $('#linkBackToEditor').on('click', function (e) {
      e.preventDefault();
      backToEditor();
    });

    $('#toolPointer').on('click', function () {
      eraseMode = false;
      $(this).addClass('active');
      $('#toolTrash').removeClass('active');
    });

    $('#toolTrash').on('click', function () {
      eraseMode = true;
      $(this).addClass('active');
      $('#toolPointer').removeClass('active');
    });

    $('#board').on('click', '.square-55d63', function () {
      if (!eraseMode || currentMode !== 'editor') {
        return;
      }
      var square = $(this).data('square');
      var position = editorBoard.position();
      if (square && position[square]) {
        delete position[square];
        editorBoard.position(position, false);
      }
    });

    $(document).on('keydown', function (e) {
      if (currentMode !== 'analysis') {
        return;
      }
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepView(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepView(1);
      }
    });

    $(window).on('resize', function () {
      if (editorBoard) editorBoard.resize();
      if (analysisBoard) analysisBoard.resize();
    });
  }

  function startAnalysis() {
    var fen = buildFenFromEditor();
    var validation = new Chess().validate_fen(fen);
    if (!validation.valid) {
      showError('Invalid position: ' + validation.error);
      return;
    }

    game = new Chess(fen);
    analysisInitialFen = fen;
    moveHistory = game.history({ verbose: true });
    viewIndex = moveHistory.length;
    currentMode = 'analysis';

    editorBoard.destroy();
    editorBoard = null;

    $('#editorControls').addClass('hidden');
    $('.edit-tools').addClass('hidden');
    $('#analysisPanel').removeClass('hidden');
    $('#fenInput').prop('readonly', true);

    analysisBoard = Chessboard('board', {
      draggable: true,
      position: game.fen(),
      pieceTheme: '/imgs/{piece}.png',
      onDragStart: onAnalysisDragStart,
      onDrop: onAnalysisDrop,
      onSnapEnd: function () {
        analysisBoard.position(game.fen());
      }
    });

    renderMoveList();
    $('#fenInput').val(game.fen());
  }

  function backToEditor() {
    var fen = game ? game.fen() : analysisInitialFen;

    analysisBoard.destroy();
    analysisBoard = null;
    game = null;
    moveHistory = [];
    viewIndex = 0;
    currentMode = 'editor';
    eraseMode = false;
    $('#toolPointer').addClass('active');
    $('#toolTrash').removeClass('active');

    $('#editorControls').removeClass('hidden');
    $('.edit-tools').removeClass('hidden');
    $('#analysisPanel').addClass('hidden');
    $('#fenInput').prop('readonly', false);

    editorBoard = createEditorBoard();
    applyFenString(fen);
  }

  function onAnalysisDragStart(source, piece) {
    if (viewIndex !== moveHistory.length || game.game_over()) {
      return false;
    }
    if ((game.turn() === 'w' && piece.charAt(0) === 'b') ||
        (game.turn() === 'b' && piece.charAt(0) === 'w')) {
      return false;
    }
  }

  function onAnalysisDrop(source, target) {
    if (viewIndex !== moveHistory.length) {
      return 'snapback';
    }
    var moveObj = game.move({ from: source, to: target, promotion: 'q' });
    if (moveObj === null) {
      return 'snapback';
    }
    moveHistory = game.history({ verbose: true });
    viewIndex = moveHistory.length;
    renderMoveList();
    $('#fenInput').val(game.fen());
  }

  function renderViewPosition() {
    var temp = new Chess(analysisInitialFen);
    for (var i = 0; i < viewIndex; i++) {
      temp.move({ from: moveHistory[i].from, to: moveHistory[i].to, promotion: moveHistory[i].promotion });
    }
    analysisBoard.position(temp.fen(), false);
    $('#fenInput').val(temp.fen());
  }

  function stepView(delta) {
    var next = viewIndex + delta;
    if (next < 0 || next > moveHistory.length) {
      return;
    }
    viewIndex = next;
    renderViewPosition();
    renderMoveList();
  }

  function renderMoveList() {
    var $list = $('#moveList').empty();

    for (var i = 0; i < moveHistory.length; i += 2) {
      var $row = $('<div>', { class: 'move-row' });
      $row.append($('<span>', { class: 'move-number', text: (i / 2 + 1) + '.' }));
      $row.append(buildMoveSpan(i));
      if (moveHistory[i + 1]) {
        $row.append(buildMoveSpan(i + 1));
      }
      $list.append($row);
    }

    $list.find('.move-san').on('click', function () {
      viewIndex = parseInt($(this).data('index'), 10);
      renderViewPosition();
      renderMoveList();
    });
  }

  function buildMoveSpan(historyIndex) {
    var $span = $('<span>', {
      class: 'move-san',
      text: moveHistory[historyIndex].san,
      'data-index': historyIndex + 1
    });
    if (viewIndex === historyIndex + 1) {
      $span.addClass('active-move');
    }
    return $span;
  }
});
