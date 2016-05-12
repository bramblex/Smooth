
-- module AST where

-- import Prelude
-- import Data.Generic

-- data Assign = Assign String Expression

-- data CaseBinding = CaseBinding Literal Statements

-- type Statements = Array Statement
-- data Statement = BindStat Binding
--                | AssignStat Assign

--                | CallStat Expression
--                | ReturnStat Expression

--                | IfElseStat Expression Statements Statements
--                | WhileStat Expression Statements Statements

--                | ContinueStat
--                | BreakStat

-- type Bindings = Array Binding
-- data Binding = ExprBind String Expression
--              | StatsBin String Statements

-- data Expression = Lit Literal
--                 | Val String
--                 | Lam String Expression
--                 | App Expression Expression
--                 | FFI String

--                 | LetIn Bindings Expression
--                 | IfElse Expression Expression Expression

-- data KeyValueTuple = KeyValueTuple String Expression
-- data Literal = LNum Number
--              | LStr String
--              | LBool Boolean
--              | LArr (Array Expression)
--              | LObj (Array KeyValueTuple)
--              | LRegex String
--              | LNull
--              | LUndefined

-- derive instance genericAssign :: Generic Assign
-- instance showAssign :: Show Assign where
--   show = gShow

-- derive instance genericStatement :: Generic Statement
-- instance showStatement :: Show Statement where
--   show = gShow

-- derive instance genericBinding :: Generic Binding
-- instance showBinding :: Show Binding where
--   show = gShow

-- derive instance genericExpression :: Generic Expression
-- instance showExpression :: Show Expression where
--   show = gShow

-- derive instance genericKeyValueTuple :: Generic KeyValueTuple
-- instance showKeyValueTuple :: Show KeyValueTuple where
--   show = gShow

-- derive instance genericLiteral :: Generic Literal
-- instance showLiteral :: Show Literal where
--   show = gShow
