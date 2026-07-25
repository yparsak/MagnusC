// =============================================================================
// analysis.chess.js
// Analysis board page only (see views/pages/analysis.ejs). Builds the game
// from the FEN handed down via window.MAGNUS_PAGE_DATA and handles
// drag-to-move, move list browsing, and arrow-key stepping.
// =============================================================================

$(function () {
  if (!$('#board').length) {
    return;
  }

  var analysisBoard = null;

  // Authoritative chess.js game. moveHistory/viewIndex let arrow keys browse
  // past positions without mutating `game`.
  var game = null;
  var analysisInitialFen = null;
  var moveHistory = [];
  var viewIndex = 0;

  initAnalysis();
  bindControls();

  function initAnalysis() {
    var pageData = window.MAGNUS_PAGE_DATA || {};
    var fen = pageData.fen;

    if (!fen || !new Chess().validate_fen(fen).valid) {
      window.location.href = '/editor';
      return;
    }

    game = new Chess(fen);
    analysisInitialFen = fen;
    moveHistory = game.history({ verbose: true });
    viewIndex = moveHistory.length;

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

  function bindControls() {
    $('#linkBackToEditor').on('click', function (e) {
      e.preventDefault();
      window.location.href = '/editor?fen=' + encodeURIComponent(game.fen());
    });

    $(document).on('keydown', function (e) {
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
      if (analysisBoard) analysisBoard.resize();
    });
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
