
-- module SMModule where

-- import Prelude
-- import Data.Maybe (Maybe)
-- import Data.Tuple (Tuple)
-- import Data.Generic (class Generic, gShow)

-- import SMAST

-- newtype SMOpDef = SMOpDef {_type::String, op::String, alias::String}
-- newtype SMModule = SMModule { optable:: Array (Array SMOpDef)
--                             , exports:: Array String
--                             , bindings:: Array (Tuple String SMExpression) }

-- newtype SMModule = SMModule {header:: SMModuleHeader, body:: Array (Tuple String SMExpression)}

-- data SMModuleStatement
--   = SMImport Import
--   | SMExport (Array Name)
--   | SMBind Binding
--   | SMOpDef OpDef
--   | SMClass (Array Binding)

-- derive instance genericSMModuleStatement :: Generic SMModuleStatement
-- instance showSMModuleStatement :: Show SMModuleStatement where show = gShow

-- data Import
--   = Import String (Array String)
--   | ImportOp String (Array String)
--   | ImportAs String String

-- derive instance genericImport :: Generic Import
-- instance showImport :: Show Import where show = gShow

-- data Binding
--   = Bind String SMExpression

-- derive instance genericBinding :: Generic Binding
-- instance showBinding :: Show Binding where show = gShow

-- data OpDef
--   = OpDef OpType Int String String

-- derive instance genericOpDef :: Generic OpDef
-- instance showOpDef :: Show OpDef where show = gShow

-- data OpType
--   = InfixR | InfixL | Postfix | Prefix

-- derive instance genericOpType :: Generic OpType
-- instance showOpType :: Show OpType where show = gShow

-- type Name = String

-- newtype SMModule
--   = SMModule { imports:: Array Import
--              , exports:: Array Name
--              , optable:: Array OpDef
--              , bindings:: Array Binding }

-- derive instance genericSMModule :: Generic SMModule
-- instance showSMModule :: Show SMModule where show = gShow
