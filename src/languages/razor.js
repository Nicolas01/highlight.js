/*
 * Language: razor
 * Requires: xml.js, cs.js
 * Author: Nicolas LLOBERA <nicolas@bananeatomic.fr>
*/

function(hljs) {

    var razor_comment = hljs.COMMENT(
        '@\\*', '\\*@', { relevance: 10 }
    );

    var razor_line = {
        begin: '@[a-zA-Z]+', returnBegin: true, end: '(</?[a-zA-Z])|$', returnEnd: true,
        className: 'razor-line',
        subLanguage: 'cs',
        contains: [
            {
                begin: '@',
                className: 'symbol'
            }
        ]
    };

    var simple_xml_bloc = {
        begin: '</?[a-zA-Z]', end: '>',
        className: 'simple-xml-block',
        subLanguage: 'xml',
        contains: [
            {
                begin: '"@\\(', excludeBegin: true, end: '\\)"', excludeEnd: true,
                className: 'razor-code-surrounded-by-parenthesis-in-xml-attr-value',
                subLanguage: 'cs'
            },
            {
                begin: '"@', excludeBegin: true, end: '"', excludeEnd: true,
                className: 'razor-code-in-xml-attr-value',
                subLanguage: 'cs'
            }
        ]
    };

    var razor_bloc = {
        begin: '((@[a-z]+)|(else))\\s?(\\(.+\\))?\\r?\\n?\\s*{', returnBegin: true, end: '^}',
        className: 'razor-block',
        subLanguage: 'cs',
        contains: [
            {
                begin: '@(code|functions)?',
                className: 'symbol'
            },
            simple_xml_bloc
        ]
    };

    var xml_bloc = hljs.inherit(simple_xml_bloc, {
        className: 'xml-block',
        contains: simple_xml_bloc.contains.concat([
            {
                begin: '@',
                className: 'symbol'
            },
            {
                begin: '@[a-z]+ (\\(.+\\))?\\r?\\n?\\s*{', returnBegin: true, end: '}',
                subLanguage: 'cs',
                contains: [
                    {
                        begin: '@[a-z]+',
                        className: 'name'
                    },
                    {
                        begin: '<[a-z]', end: '}', excludeEnd: true,
                        subLanguage: 'xml'
                    }
                ]
            }
        ])
    });

    // @page, @inject, @inherits
    var razor_directives = {
        begin: '@[a-z]+\\s', returnBegin: true, end: '$',
        className: 'razor-directives',
        subLanguage: 'cs',
        contains: [
            {
                begin: '@[a-z]+',
                className: 'name'
            }
        ]
    };

    return {
        aliases: ['razor', 'blazor'],
        keywords: '@',
        contains: [
            razor_comment,
            xml_bloc,
            razor_bloc,
            razor_directives,
            razor_line
        ]
    };
}