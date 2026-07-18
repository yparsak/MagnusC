'use strict';

function renderDashBoard(res, page, data =  {}, options = {}) {
  const {
    title = 'Magnus'
  } = options;

  res.render('dashboard', {
    ...data,
    content: `pages/${page}`,
    title
  });
  
}

module.exports = { renderDashBoard };
