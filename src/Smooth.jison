
%lex

%s INITIAL INCOMMENT

/** identifiers **/
identifier                              ("_"|{letter})({letter}|{digit}|"_")*
letter                                  {lowercase}|{uppercase}
lowercase                               [a-z]
uppercase                               [A-Z]
digit                                   [0-9]

/** strings **/
string                                  {string_double}|{string_single}
string_double                           '"'{stringitem_double}*'"'
string_single                           "'"{stringitem_single}*"'"
stringitem_double                       {stringchar_double}|{escapeseq}
stringitem_single                       {stringchar_single}|{escapeseq}
stringchar_single                       [^\\\n\']
stringchar_double                       [^\\\n\"]
escapeseq                               \\.

/** regexp **/
regexp                                  "/"{regexpitem}"/"
regexpflags                             [gimuy] *
regexpitem                              [^\\\n\/]|{escapeseq}

/** raw code **/
rawcode                                 "```"{rawcodeitem}*"```"
rawcodeitem                             [^\\]|{escapeseq}

/** numbers **/
integer                                 {decinteger}|{hexinteger}|{octinteger}
decinteger                              ([1-9]{digit}*)
hexinteger                              "0"[x|X]{hexdigit}+
octinteger                              "0"[o|O]?{octdigit}+
bininteger                              "0"[b|B]({bindigit}+)
hexdigit                                {digit}|[a-fA-F]
octdigit                                [0-7]
bindigit                                [0|1]

/** floats **/
floatnumber                             {exponentfloat}|{pointfloat}
exponentfloat                           ({digit}+|{pointfloat}){exponent}
pointfloat                              ({digit}*{fraction})|({digit}+".")
fraction                                "."{digit}+
exponent                                [e|E][\+|\-]{digit}+

/** booleans **/
boolean                                 "true"|"false"

/** null **/
null                                    "null"

/** undefined **/
undefined                               "undefined"

/** reserved **/
reserved                                {keywords}\b|{symbols}|{brackets}|{operators}

keywords                                "as"|"case"|"of"|"if"|"than"|"else"|
                                        "import"|"let"|"in"|"where"|"break"|
                                        "continue"|"export"|"return"|"switch"|
                                        "while"|"default"

symbols                                 "="|"->"|"<-"|":"|","|"\\"|"@"|";"

brackets                                "("|")"|"["|"]"|"{"|"}"

operators                               "."|
                                        "<<<"|">>>"|
                                        "*"|"/"|"%"|"**"|
                                        "+"|"-" 
                                        ">"|"<"|">="|"<="|
                                        "=="|"!="|
                                        "||"|"&&"|
                                        "$"

/** comments **/
comments                                "#"[^\n]*

/** whitespaces **/
whitespaces                             ([\ \t\f\n])+

%%

<<EOF>>                                 return 'EOF'
{whitespaces}                           /** skip **/
{comments}                              /** skip **/

{reserved}                              %{ return yytext %}
{floatnumber}                           return 'NUMBER'
{bininteger}                            %{  
                                            // parseInt to convert to base-10
                                            var i = yytext.substr(2); // binary val
                                            yytext = parseInt(i,2).toString();
                                            return 'NUMBER'
                                        %}
{integer}                               return 'NUMBER'
{boolean}                               return 'BOOLEAN'
{null}                                  return 'NULL'
{undefined}                             return 'UNDEFINED'
{string}                                return 'STRING'
{regexp}                                return 'REGEXP'

{rawcode}                               %{
                                          var str = yytext
                                              .substr(3, yytext.length-6)
                                          yytext = str
                                          return 'RAWCODE'
                                        %}
                                                
{identifier}                            return 'NAME'

/lex

%start module

%right LAMBDA IFELSE LETIN

%right '$'
%left '||' '&&'
%left '==' '!=' 
%left '>' '<' '>=' '<=' 
%left '+' '-' 
%left '*' '/' '%' '**' 
%left '<<<' '>>>'
%left '.' 

%left APPLY

%{
    var AST = require('./SmoothAST');
    var compile = require('./SmoothCompiler');
%}

%%

/**  Module **/

module
  : module_stat_list EOF
    {
      var module = AST.Module(
         $1.filter(function(s){
           return (s instanceof AST.Module.Import || s instanceof AST.Module.ImportAs)
         }),
         $1.filter(function(s){
           return (s instanceof AST.Module.Export)
         }),
         $1.filter(function(s){
           return (s instanceof AST.Module.Binding)
         }));
      return compile(module);
    }
  | EOF                                 { return '' }
  ;

module_stat_list
  : module_stat_list module_stat ';'    { $$ = $1.concat([$2]) }
  | module_stat ';'                     { $$ = [$1] }
  ;

module_stat
  : import STRING as NAME
    { $$ = AST.Module.ImportAs($2, $4) }
  | import STRING '(' name_list ')'
    { $$ = AST.Module.Import($2, $4) }
  | export '(' name_list ')'
    { $$ = AST.Module.Export($3) }
  | binding
    { $$ = AST.Module.Binding($1) }
  ;

name_list
  : name_list ',' NAME                  { $$ = $1.concat($3) }
  | NAME                                { $$ = [$1] }
  ;

argument_list
  : argument_list NAME                  { $$ = $1.concat($2) }
  | NAME                                { $$ = [$1] }
  ;

binding
  : NAME '=' expr
    { $$ = AST.Binding($1, $3) }
  | NAME argument_list '=' expr
    { $$ = AST.Binding($1, $2.reduceRight(function(expr, arg){
         return AST.Expr.Lam(arg, expr)}, $4)) }
  | binding where '{' binding_list '}'
    { $$ = AST.Binding($.name, AST.Expr.LetIn($4, $expr)) }
  ;

binding_list
  : binding_list binding ';'            { $$ = $1.concat($2) }
  | binding ';'                         { $$ = [$1] }
  ;

/** Expression **/
expr
  : atom                        { $$ = $1 }

  | '\' argument_list '->' expr %prec LAMBDA
    { $$ = $2.reduceRight(function(expr, arg){
         return AST.Expr.Lam(arg, expr)}, $4) }

  | if expr than expr else expr %prec IFELSE
    { $$ = AST.Expr.IfElse($2, $4, $6) }

  | let binding in expr %prec LETIN
    { $$ = AST.Expr.LetIn([$2], $4) }

  | case expr of '{' case_of_list '}'
    { $$ = AST.Expr.CaseOf($2, $4) }

  | '@' NAME '{' do_stat_list '}'
    {
      var last = $4.slice(-1)[0];
      var init = $4.slice(0,-1);

      if ( last.type !== 'call' ){
         parser.parseError('Parse error on line ' + (yylineno + 1) + ': The last statement in do block must be an expression' ,{});
      } else {
        $$ = init.reduceRight(function(expr, dostat){
          switch (dostat.type){
            case 'let':
              return AST.Expr.LetIn([dostat.binding], expr)
            case 'ass':
              return AST.Expr.App(
                     AST.Expr.App(AST.Expr.ID($2), dostat.expr),
                     AST.Expr.Lam(dostat.name, expr))
            case 'call':
              return AST.Expr.App(
                     AST.Expr.App(AST.Expr.ID($2), dostat.expr),
                     AST.Expr.Lam('_', expr))
          };
        }, last.expr);
      };
    }

  | atom expr %prec APPLY       { $$ = AST.Expr.App($1, $2) }
  | expr '$' expr               { $$ = AST.Expr.App($1, $3) }
  | expr '||' expr              { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '&&' expr              { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '==' expr              { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '!=' expr              { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '>' expr               { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '<' expr               { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '>=' expr              { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '<=' expr              { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '+' expr               { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '-' expr               { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '*' expr               { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '/' expr               { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '%' expr               { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '**' expr              { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '<<<' expr             { $$ = AST.Expr.Op($2, $1, $3) }
  | expr '>>>' expr             { $$ = AST.Expr.Op($2, $1, $3) }
  ;

do_stat_list
  : do_stat_list do_stat ';'     { $$ = $1.concat($2) }
  | do_stat ';'                 { $$ = [$1] }
  ;

do_stat
  : let binding                 { $$ = {type:'let', binding:$2} }
  | NAME '<-' expr              { $$ = {type:'ass', name:$1, expr:$3} }
  | expr                        { $$ = {type:'call', expr:$1} }
  ;

case_of_list
  : case_of_list case_of ';'    { $$ = $1.concat($2) }
  | case_of ';'                 { $$ = [$1] }
  ;

case_of
  : literal ':' expr            { $$ = AST.Expr.CaseOf.Case($1, $3) }
  | default ':' expr            { $$ = AST.Expr.CaseOf.Case(AST.Expr.Val('DEFAULT', 'default'), $3) }
  ;

atom
  : NAME                        { $$ = AST.Expr.ID($1) }
  | expr '.' NAME               { $$ = AST.Expr.Attr($1, $3) }
  | '(' expr ')'                { $$ = $2 }
  | '[' array_items ']'         { $$ = AST.Expr.Array($2) }
  | '{' object_items '}'        { $$ = AST.Expr.Object($2) }
  | literal                     { $$ = $1 }
  ;

literal
  : NUMBER                      { AST.Expr.Val('NUMBER', $1)}
  | STRING                      { AST.Expr.Val('STRING', $1)}
  | BOOLEAN                     { AST.Expr.Val('BOOLEAN', $1)}
  | NULL                        { AST.Expr.Val('NULL', $1)}
  | UNDEFINED                   { AST.Expr.Val('UNDEFINED', $1)}
  | RAWCODE                     { AST.Expr.Val('RAWCODE', $1)}
  | REGEXP                      { AST.Expr.Val('REGEXP', $1)}
  ;

array_items
  : array_items ',' expr              { $$ = $1.concat($3) }
  | expr                              { $$ = [$1] }
  | %empty                            { $$ = [] }
  ;

object_items
  : object_items ',' NAME ':' expr    { $$ = $1.concat([Expr.Object.KeyValue($3, $5)]) }
  | NAME ':' expr                     { $$ = [Expr.Object.KeyValue($1, $3)] }
  | %empty                            { $$ = [] }
  ;