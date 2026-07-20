'use strict';

function renderPage(res, template, page, data =  {}, options = {}) {
  const {
    title = 'Magnus'
  } = options;

  res.render(template, {
    ...data,
    options,
    title
  });

}

module.exports = { renderPage };

