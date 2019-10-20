const cfgtool = require('cfgrammar-tool');
const types = cfgtool.types;
const generatorFactory = cfgtool.generator;

const Grammar = types.Grammar;
const Rule = types.Rule;
const T = types.T;
const NT = types.NT;

const rules = [];

fetch('static/source.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(source) {
    for (const pos in source) {
      if (source.hasOwnProperty(pos)) {
        const words = source[pos];
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          rules.push(Rule(pos, [T(word)]));
        }
      }
    }

    const exprGrammarShort = Grammar([
      Rule('S', [NT('NP')]),
      Rule('NP', [NT('NON_WORK_BASE')]),
      Rule('NP', [NT('NJJ')]),
      Rule('NJJ', [NT('AREAJ'), NT('N')]),
      Rule('NJJ', [NT('N')]),
      Rule('N', [NT('BASE')]),
      Rule('P', [T('in')]),
      ...rules,
    ]);

    const exprGrammarLong = Grammar([
      Rule('S', [NT('NP')]),
      Rule('NP', [NT('NON_WORK_BASE')]),
      Rule('NP', [NT('NJJ')]),
      Rule('NP', [NT('NJJ'), NT('PP')]),
      Rule('PP', [NT('P'), NT('AREAN')]),
      Rule('NJJ', [NT('JJ'), NT('AREAJ'), NT('N')]),
      Rule('NJJ', [NT('JJ'), NT('N')]),
      Rule('NJJ', [NT('N')]),
      Rule('N', [NT('BASE')]),
      Rule('JJ', [NT('ADJ')]),
      Rule('P', [T('in')]),
      Rule('P', [T('of')]),
      ...rules,
    ]);

    function generateTitle(style) {
      let maxLength;
      let minLength;
      let exprGrammar;
      if (style === 'short') {
        maxLength = 4;
        minLength = 1;
        exprGrammar = exprGrammarShort;
      } else {
        maxLength = 5;
        minLength = 4;
        exprGrammar = exprGrammarLong;
      }

      const generator = generatorFactory(exprGrammar);
      let length = null;
      let tokens = null;
      while (!tokens) {
        length =
          Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        tokens = generator(length, {
          list: true,
        });
      }
      return tokens.join(' ');
    }

    function regenerate() {
      let style = null;
      if (Math.random() < 0.5) {
        style = 'short';
      } else {
        style = 'long';
      }
      let title = generateTitle(style);
      let more = Math.random();
      let words = title.split(' ');
      while (
        style === 'short' &&
        (words.length < 5 || (more < 0.8 && words.length < 9))
      ) {
        const newTitle = generateTitle(style);
        const wordSet = new Set(newTitle.split(' '));
        const oldWords = title.split(' ');
        let duplicate = false;
        for (let i = 0; i < oldWords.length; i++) {
          if (wordSet.has(oldWords[i])) {
            duplicate = true;
            continue;
          }
        }
        if (duplicate) {
          more = Math.random();
          continue;
        } else {
          title = title + ' | ' + newTitle;
          words = title.split(' ');
          more = Math.random();
        }
      }
      document.getElementById('result').innerHTML = title;
    }
    regenerate();
    const refreshButton = document.getElementById('refresh');
    refreshButton.addEventListener('click', function() {
      regenerate();
    });
  });
