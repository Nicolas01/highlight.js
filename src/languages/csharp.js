/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
Contributor: Nicolas LLOBERA <nllobera@gmail.com>, Pieter Vantorre <pietervantorre@gmail.com>
Website: https://docs.microsoft.com/en-us/dotnet/csharp/
Category: common
*/

export default function(hljs) {
  
  var KEYWORDS = {
    keyword:
      // Normal keywords.
      'abstract as base bool break byte case catch char checked class const continue decimal ' +
      'default delegate do double enum event explicit extern finally fixed float ' +
      'for foreach goto implicit in int interface internal is lock long namespace new ' +
      'object operator out override params private protected public readonly ref sbyte ' +
      'sealed short sizeof stackalloc static string struct switch this try typeof ' +
      'uint ulong unchecked unsafe ushort using virtual void volatile while ' +
      // Contextual keywords.
      'add alias ascending async await by descending dynamic equals from get global group into join ' +
      'let nameof on orderby param partial remove select set value var when where yield ' +
      // XML doc keywords.
      'returns see summary',
    statement:
      'if else return',
    literal:
      'null false true',
    commonclass:
      'Char Console Encoding Enumerable HttpStatusCode String Task'
  };
  
  var INTERPOLATED_VERBATIM_STRING = {
    className: 'string',
    begin: '\\$@"', end: '"',
    contains: [
      { begin: '""' },
      { begin: '{{' }, { begin: '}}' },
      {
        begin: '{', excludeBegin: true,
        end: '}', excludeEnd: true,
        contains: [
          {
            className: 'var',
            begin: hljs.IDENT_RE
          }
        ]
      }
    ]
  };
  
  var INTERPOLATED_STRING = {
    className: 'string',
    begin: '\\$"', end: '"',
    contains: [
      { begin: '{{' }, { begin: '}}' },
      {
        begin: '{', excludeBegin: true,
        end: '}', excludeEnd: true,
        contains: [
          {
            className: 'var',
            begin: hljs.IDENT_RE
          }
        ]
      }
    ]
  };
  
  var VERBATIM_STRING = {
    className: 'string',
    begin: '@"', end: '"',
    contains: [{begin: '""'}]
  };
  
  var STRING = {
    variants: [
      INTERPOLATED_VERBATIM_STRING,
      INTERPOLATED_STRING,
      VERBATIM_STRING,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
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
  
  // Type, Type?, Type[], Type<int>, Type<Type>, Type<Type<int, Type>>
  //var TYPE_RE = '[A-Z]\\w*' + '\\??(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?(\\[\\])?';
  var TYPE_RE = '[A-Z]\\w*' + '\\??(<' + hljs.IDENT_RE + '[<>a-zA-Z\\[\\]\\?\\ ,]*>)?(\\[\\])?';
  var TYPE = {
    begin: TYPE_RE, returnBegin: true,
    contains: [
      {
        className: 'class',
        begin: '[A-Z]\\w*'
      },
      {
        className: 'xxx',
        begin: '<', excludeBegin: true,
        end: '>', excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
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
    name: 'C#',
    aliases: ['cs', 'c#'],
    keywords: KEYWORDS,
    contains: [
      hljs.COMMENT(
        '///', '$',
        {
          contains: [
            {
              className: 'doctag-outer',
              begin: '</?',
              end: '>',
              keywords: KEYWORDS,
              contains: [
                hljs.QUOTE_STRING_MODE,
                {
                  className: 'doctag-param-name',
                  begin: ' [a-z]+', end: '=', excludeEnd: true,
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      NUMBERS,
      /*{
        begin: 'using', excludeBegin: true,
        end: '[;{]',
        contains: [
          {
            className: 'using-declaration',
            begin: '\\(', end: '\\)'
          },
          {
            className: 'namespace',
            begin: '[A-Z]\\w*'
          }
        ]
      },*/
      {
        begin: 'namespace', excludeBegin: true,
        end: '{', excludeEnd: true,
        contains: [
          {
            className: 'namespace',
            begin: '[A-Z]\\w*'
          }
        ]
      },
      {
        begin: '\\bclass', excludeBegin: true,
        end: '{', excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          {
            className: 'class',
            begin: '[A-Z]\\w*'
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        begin: 'interface', excludeBegin: true,
        end: '{', excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          {
            className: 'interface',
            begin: 'I[A-Z]\\w*'
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // Type _varName
        // Type PropertyName
        className: 'typeandvarname',
        begin: '\\b' + TYPE_RE + ' [_a-zA-Z]\\w*', returnBegin: true,
        contains: [
          TYPE
        ]
      },
      {
        // attribute
        begin: '\\[[A-Z]\\w*', returnBegin: true,
        end: '\\]',
        keywords: KEYWORDS,
        contains: [
          STRING,
          TYPE
        ]
      },
      {
        begin: 'new ', excludeBegin: true,
        end: '[\\({]', excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          TYPE
        ]
      },
      {
        // (Type)
        begin: '\\(' + TYPE_RE + '\\)', returnBegin: true,
        contains: [
          {
            begin: '\\(', excludeBegin: true,
            end: '\\)', excludeEnd: true,
            contains: [ TYPE ]
          }
        ]
      },
      {
        // Method<Type>(
        begin: '[A-Z]\\w*(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?\\(', returnBegin: true,
        contains: [
          {
            className: 'method-name',
            begin: '[A-Z]\\w*'
          },
          {
            begin: '<', excludeBegin: true,
            end: '>', excludeEnd: true,
            keywords: KEYWORDS,
            contains: [ TYPE ]
          }
        ]
      }/*,
      {
        className: 'others',
        begin: '[a-zA-Z]\\w*'
      }*/
      /*{
        className: 'method',
        begin: '[A-Z]\\w*\\(', returnBegin: true,
        end: '[{;]',
        contains: [
          {
            begin: '[A-Z]\\w*\\(', returnBegin: true,
            contains: [
              {
                className: 'method-name',
                begin: '[A-Z]\\w*'
              }
            ]
          },
          {
            className: 'method-param',
            begin: '\\(', excludeBegin: true,
            end: '\\)', excludeEnd: true,
            contains: [
              STRING,
              TYPE,
              {
                className: 'method-param-name',
                begin: '[a-z]\\w*',
                keywords: KEYWORDS
              }
            ]
          }
        ]
      }*/
    ]
  };
}
