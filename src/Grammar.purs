
module Grammar where

import Prelude

import Data.Tuple (Tuple)
import Data.List (List)
import Data.Maybe (Maybe)
import Data.Generic

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
  = DoStatLet (Tuple String Expression)
  | DoStatAssign (Tuple String Expression)
  | DoStatCall Expression

data Statement
  = StatLet (Tuple String Expression)
  | StatAss (Tuple String Expression)
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
  | MPass

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

-- derive instance genericExpression :: Generic Expression
-- derive instance genericDoStatement ::Generic  DoStatement
-- derive instance genericStatement :: Generic Statement
-- derive instance genericModuleStatement :: Generic ModuleStatement
-- derive instance genericOpType :: Generic OpType
-- derive instance genericModule :: Generic Module
-- derive instance genericProgram :: Generic Program

-- instance showExpression :: Show Expression where show = gShow
-- instance showDoStatement :: Show DoStatement where show = gShow
-- instance showStatement :: Show Statement where show = gShow
-- instance showModuleStatement :: Show ModuleStatement where show = gShow
-- instance showOpType :: Show OpType where show = gShow
-- instance showModule :: Show Module where show = gShow
-- instance showProgram :: Show Program where show = gShow
