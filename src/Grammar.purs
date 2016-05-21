
module Grammar where

import Data.Tuple (Tuple)
import Data.List (List)

data Expression
  = EID String
  | ELit String
  | EStat (List Statement)
  | EArr (List Expression)
  | EObj (List (Tuple String Expression))
  | ELam String Expression
  | EApp Expression Expression
  | ELetIn (Tuple String Expression) Expression
  | EWhere Expression (List (Tuple String Expression))
  | EIfElse Expression Expression Expression
  | ECaseOf Expression (List (Tuple Expression Expression))
  | EWithDo String (List DoStatement)

data DoStatement
  = DLetStat (Tuple String Expression)
  | DAssignStat (Tuple String Expression)
  | DCall Expression

data Statement
  = LetStat (Tuple String Expression)
  | CallStat Expression
  | ReturnStat Expression
  | IfElseStat Expression (List Statement) (List Statement)
  | WhileStat Expression (List Statement)
  | BreakStat
  | ContinueStat
  | SwitchStat Expression (List (Tuple Expression (List Statement)))
  | Pass

data ModuleStatement
  = MBind (Tuple String Expression)
  | MImport String (List String)
  | MImportAs String String
  | MExport (List String)
  | MOpDefin OpDefine

data OpDefine
  = OpInfixR
  | OpInfixL Int String Expression
  | OpPrefix Int String Expression
  | OpPostFix Int String Expression

newtype Module
  = Module { exports:: List String
           , imports:: List (Tuple String (List String))
           , optable:: List OpDefine
           , bindings:: List (Tuple String Expression) }

newtype Program = Program (List (Tuple String Module))
