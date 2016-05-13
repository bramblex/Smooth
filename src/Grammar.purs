
module Grammar(Statement(..), Expression(..), Literal(..)) where

import Prelude (class Show, class Eq, class Ord)

import Data.Generic (class Generic, gShow, gEq, gCompare)
import Data.Either (Either())
import Data.Tuple (Tuple())

newtype Program = Program (Array Statement)

-- <stat> :=
--   <id> = <expr>
--   <id> = <expr> where { <id> = <expr>;* }
--   let <id> = <expr>
--   <expr>
--   return
--   if ( <expr> ) { <stat>;* } else { <stat>;* }
--   while ( <expr> ) { <stat>;* }
--   continue
--   break
--   switch ( <expr> ) { <lit> -> { <stat>;* };* }

data Statement = BindStat (Tuple String Expression)
               | BindWhereStat (Tuple String Expression) (Array (Tuple String Expression))
               | AssignStat (Tuple String Expression)
               | CallStat Expression
               | ReturnStat Expression
               | IfElseStat Expression (Array Statement) (Array Statement)
               | WhileStat Expression (Array Statement)
               | ContStat
               | BreakStat
               | SwitchStat Expression (Array (Tuple Literal (Array Statement)))

derive instance genericStatement :: Generic Statement
instance showStatement :: Show Statement where show = gShow
instance eqStatement :: Eq Statement where eq = gEq
instance ordStatement :: Ord Statement where compare = gCompare

-- <expr> :=
--   <id>
--   <lit>
--   \ <id> -> <expr> | { <stat>;* }
--   <expr> <expr>
--   let { <id> = <expr>;* } in <expr>
--   if <expr> then <expr> else <expr>
--   case <expr> of { <lit> -> <expr>;* }
--   with <id> do { <expr> | <id> <- <expr>;* }

data Expression = ID String
                | Lit Literal
                | Lam String (Either Expression (Array Statement))
                | App Expression Expression
                | LetIn (Array (Tuple String Expression)) Expression
                | IfElse Expression Expression Expression
                | CaseOf Expression (Array (Tuple Literal (Array Expression)))
                | WithDo String (Array (Either Expression (Tuple String Expression)))

derive instance genericExpression :: Generic Expression
instance showExpression :: Show Expression where show = gShow
instance eqExpression :: Eq Expression where eq = gEq
instance ordExpression :: Ord Expression where compare = gCompare

-- <lit> :=
--   <num>
--   <str>
--   <reg>
--   true | false
--   null
--   undefined
--   <ffi>
--   { <id> : <expr>,* }
--   [ <expr>,* ]

data Literal = LNum Number
             | LStr String
             | LReg String
             | LBool Boolean
             | LNull
             | LUndef
             | LFFI String
             | LArr (Array Expression)
             | LObj (Array (Tuple String Expression))

derive instance genericLiteral :: Generic Literal
instance showLiteral :: Show Literal where show = gShow
instance eqLiteral :: Eq Literal where eq = gEq
instance ordLiteral :: Ord Literal where compare = gCompare
