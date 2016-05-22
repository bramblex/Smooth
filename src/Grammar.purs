
module Grammar where

import Data.Tuple (Tuple)
import Data.List (List)
import Data.Maybe (Maybe)

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
  | EWithDo Expression (List DoStatement)

data DoStatement
  = DoStatLet (Tuple String Expression)
  | DoStatAssign (Tuple String Expression)
  | DoStatCall Expression

data Statement
  = StatLet (Tuple String Expression)
  | StatCall Expression
  | StatReturn Expression
  | StatIfElse Expression (List Statement) (List Statement)
  | StatWhile Expression (List Statement)
  | StatBreak
  | StatContinue
  | StatSwitch Expression (List (Tuple Expression (List Statement)))
  | StatPass

data ModuleStatement
  = MBind (Tuple String Expression)
  | MImport String (List String)
  | MImportAs String String
  | MExport (List String)
  | MOpDefine OpType Int String String

data OpType
  = OpInfixR
  | OpInfixL
  | OpPrefix
  | OpPostFix

newtype Module
  = Module { exports:: List String
           , imports:: List (Tuple (Tuple String (Maybe String)) (List String))
           , optable:: List (Tuple (Tuple OpType Int) (Tuple String String))
           , bindings:: List (Tuple String Expression) }

newtype Program = Program (List (Tuple String Module))
