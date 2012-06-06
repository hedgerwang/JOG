/**
 * @fileOverview jog/ui/simplescrolllist/simplescrolllist.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/ui/simplescrolllist/simplescrolllist_test.html
 */

var Chrome = require('jog/ui/chrome').Chrome;
var SimpleScrollList = require('jog/ui/simplescrolllist').SimpleScrollList;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var dom = require('jog/dom').dom;

(new TestCase('jog/ui/simplescrolllist/simplescrolllist.js Test'))
  .demo('demo',
  function(body) {
    var chrome = new Chrome();
    var list = new SimpleScrollList();
    chrome.appendChild(list, true);
    chrome.render(body);
    var n = 0;
    while (n++ < 500) {
      list.addContent(makeEl(n + '. ', n));
    }
  });


function makeEl(text, n) {
  var lorem = 's assumenda est, omnis dolor repellendus. Temporibus autem ' +
    'quibusdam et aut officiis debitis aut rerum necessitatibus saepe' +
    ' eveniet ut et voluptates repudiandae sint et molestiae non r' +
    's assumenda est, omnis dolor repellendus. Temporibus autem ' +
    'quibusdam et aut officiis debitis aut rerum necessitatibus saepe' +
    ' eveniet ut et voluptates repudiandae sint et molestiae non r';


  var bgUrl = (~~(Math.random() * 130));

  text += lorem.substr(
    ~~(Math.random() * 50),
    50 + ~~(Math.random() * lorem.length)
  );

  if (1 || n % 2 == 1) {
    return dom.createElement('div', 'demo-item',
      ['div', 'demo-item-header',
        ['div','demo-item-icon'],
        ['div', 'demo-item-title', 'Hedger Wang']
      ],
      ['div', 'demo-item-text', text],
      ['div',
        {
          style: 'background-image:url(/images/test/' + bgUrl + '.jpg)',
          className: 'demo-item-img'
        }
      ],
      [
        'div', 'demo-item-footer',
        'Like - Comment'
      ]
    );
  }
  return dom.createElement('div', 'demo-item',
    ['div', 'demo-item-header',
      ['div','demo-item-icon'],
      ['div', 'demo-item-title', 'Hedger Wang']
    ],
    ['div', 'demo-item-text', text],
    [
      'div', 'demo-item-footer',
      'Like - Comment'
    ]
  );
}
