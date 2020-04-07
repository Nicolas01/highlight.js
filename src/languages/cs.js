/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
Contributor: Nicolas LLOBERA <nicolas@bananeatomic.fr>, Pieter Vantorre <pietervantorre@gmail.com>
Website: https://docs.microsoft.com/en-us/dotnet/csharp/
Category: common
*/

function(hljs) {

  var KEYWORDS = {
    keyword:
      // Normal keywords.
      'abstract as async await base bool break byte case catch char checked const continue decimal ' +
      'default delegate do double enum event explicit extern finally fixed float ' +
      'for foreach goto implicit in int interface internal is lock long new ' +
      'object operator out override params private protected public readonly ref sbyte ' +
      'sealed short sizeof stackalloc static string struct switch this throw try typeof ' +
      'uint ulong unchecked unsafe ushort using virtual void volatile while ' +
      // Contextual keywords.
      'add alias ascending async await by descending dynamic equals from get global group into join ' +
      'let nameof on orderby partial remove select set value var when where yield',
    literal:
      'true false null',
    symbol:
      'if else return'
  };

  var NUMBERS = {
    className: 'number',
    variants: [
      { begin: '\\b(0b[01\']+)' },
      { begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)(u|U|l|L|ul|UL|f|F|b|B)' },
      { begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)' }
    ],
    relevance: 0
  };

  var VERBATIM_STRING = {
    className: 'string',
    begin: '@"', end: '"',
    contains: [{ begin: '""' }]
  };
  var VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
  var SUBST = {
    className: 'subst',
    begin: '{', end: '}',
    keywords: KEYWORDS,
    contains: [
      {
        className: 'variable',
        begin: hljs.IDENT_RE
      }
    ]
  };
  var SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
  var INTERPOLATED_STRING = {
    className: 'string',
    begin: /\$"/, end: '"',
    illegal: /\n/,
    contains: [{ begin: '{{' }, { begin: '}}' }, hljs.BACKSLASH_ESCAPE, SUBST_NO_LF]
  };
  var INTERPOLATED_VERBATIM_STRING = {
    className: 'string',
    begin: /\$@"/, end: '"',
    contains: [{ begin: '{{' }, { begin: '}}' }, { begin: '""' }, SUBST]
  };
  var INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
    illegal: /\n/,
    contains: [{ begin: '{{' }, { begin: '}}' }, { begin: '""' }, SUBST_NO_LF]
  });
  var STRING = {
    variants: [
      INTERPOLATED_VERBATIM_STRING,
      INTERPOLATED_STRING,
      VERBATIM_STRING,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };

  // Type, Type?, Type[], Type<int>, Type<Type>, Type<Type<int, Type>>
  var TYPE_IDENT_RE = '[A-Z]\\w*' + '\\??(<' + hljs.IDENT_RE + '[<>a-zA-Z\\[\\]\\?\\ ,]*>)?(\\[\\])?';
  var TYPE_IDENT_MODE = {
    begin: TYPE_IDENT_RE, returnBegin: true,
    contains: [
      {
        className: 'type', // interface
        begin: 'I[A-Z]\\w*'
      },
      {
        className: 'class',
        begin: '[A-Z]\\w*'
      },
      {
        begin: '<', excludeBegin: true,
        end: '>', excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          {
            className: 'type', // interface
            begin: 'I[A-Z]\\w*',
            keywords: KEYWORDS
          },
          {
            className: 'class',
            begin: '[A-Z]\\w*',
            keywords: KEYWORDS
          }
        ]
      }
    ]
  };

  return {
    aliases: ['csharp', 'c#'],
    keywords: KEYWORDS,
    illegal: /::/,
    contains: [
      hljs.COMMENT(
        '///', '$',
        {
          contains: [
            {
              className: 'doctag',
              begin: '</?',
              end: '>',
              keywords: KEYWORDS,
              contains: [
                hljs.QUOTE_STRING_MODE,
                {
                  className: 'attribute',
                  begin: ' [a-z]+', end: '=', excludeEnd: true,
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'meta',
        begin: '#', end: '$',
        contains: [{
          className: 'meta-keyword',
          begin: '[A-Z]+'
        }]
      },
      STRING,
      NUMBERS,
      {
        beginKeywords: 'namespace', end: '{',
        contains: [{
          className: 'class', // namespace
          begin: '[A-Z]\\w*'
        }]
      },
      {
        beginKeywords: 'class interface', end: '{',
        contains: [TYPE_IDENT_MODE]
      },
      {
        // Type _varName
        // Type PropertyName
        className: 'typeandvar',
        begin: '\\b' + TYPE_IDENT_RE + ' [_a-zA-Z]\\w*', returnBegin: true,
        contains: [TYPE_IDENT_MODE]
      },
      {
        // [Attributes("")]
        className: 'attribute-re', // attribute
        begin: '^\\s*\\[', end: '\\]',
        keywords: KEYWORDS,
        contains: [
          STRING,
          TYPE_IDENT_MODE
        ]
      },
      {
        className: 'new',
        begin: 'new ', excludeBegin: true,
        end: '[\\({]', excludeEnd: true,
        keywords: KEYWORDS,
        contains: [TYPE_IDENT_MODE]
      },
      {
        // as Type
        className: 'as',
        begin: ' as ', excludeBegin: true, end: ';',
        keywords: KEYWORDS,
        contains: [TYPE_IDENT_MODE]
      },
      {
        // using
        className: 'using',
        begin: 'using', excludeBegin: true, end: '[\\(;]',
        contains: [
          {
            className: 'class',
            begin: '[A-Z]\\w*'
          }
        ]
      },
      {
        // Method<Type>(
        className: 'method-re',
        begin: '[A-Z]\\w*(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?\\(', returnBegin: true,
        contains: [
          {
            className: 'function', // method name
            begin: '[A-Z]\\w*'
          },
          {
            begin: '<', excludeBegin: true,
            end: '>', excludeEnd: true,
            keywords: KEYWORDS,
            contains: [TYPE_IDENT_MODE]
          }
        ]
      },
      {
        // (Type)
        className: 'cast',
        begin: '\\(' + TYPE_IDENT_RE + '\\)', returnBegin: true,
        contains: [
          {
            begin: '\\(', excludeBegin: true,
            end: '\\)', excludeEnd: true,
            contains: [TYPE_IDENT_MODE]
          }
        ]
      },
      {
        // variableName
        className: 'variable',
        begin: '\\b[a-z]\\w*',
        keywords: KEYWORDS
      },
      {
        // static class: Type. Type<T>.
        className: 'static',
        begin: '[A-Z]\\w*(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?\\.', returnBegin: true,
        keywords: KEYWORDS,
        contains: [TYPE_IDENT_MODE]
      }
    ]
  };
}
