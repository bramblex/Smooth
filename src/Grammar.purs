
module Grammar where

import Data.Either (Either)
import Data.Tuple (Tuple)

data Expression
  = EID String
  | ELit String
  | ERaw String
  | EArr (Array Expression)
  | EObj (Array (Tuple String Expression))
  | ELam String (Either Expression (Array Statement))
  | EApp Expression Expression
  | ELetIn (Tuple String Expression) Expression
  | EWhere Expression (Array (Tuple String Expression))
  | EIfElse Expression Expression Expression
  | ECaseOf Expression (Array (Tuple Expression Expression))
  | EWithDo String (Array DoStatement)

data DoStatement
  = DLetStat (Tuple String Expression)
  | DAssignStat (Tuple String Expression)
  | DCall Expression

data Statement
  = LetStat (Tuple String Expression)
  | CallStat Expression
  | ReturnStat Expression
  | IfElseStat Expression (Array Statement) (Array Statement)
  | WhileStat Expression (Array Statement)
  | BreakStat
  | ContinueStat
  | SwitchStat Expression (Array (Tuple Expression (Array Statement)))

data ModuleStatement
  = MBind (Tuple String Expression)
  | MImport String (Array String)
  | MImportAs String String
  | MExport (Array String)
  | MOpDefin OpDefine

data OpDefine
  = OpInfixR Int String Expression
  | OpInfixL Int String Expression
  | OpPrefix Int String Expression
  | OpPostFix Int String Expression

newtype Module
  = Module { exports:: Array String
           , imports:: Array (Tuple String (Array String))
           , optable:: Array OpDefine
           , bindings:: Array (Tuple String Expression) }

newtype Program = Program (Array (Tuple String Module))
