"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";
import { FloriaTreeView, FloriaTreeNode } from './module-treeview.js';


var schema = /* ===========================================================================
* Copyright (C) 2015 CapsicoHealth Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

{
  "name":"TILDA"
 ,"package": "tilda.data"
 ,"dependencies":["tilda/data/tmp/_tilda.TildaTmp.json"]
 ,"documentation": {
     "description": [
         "This schema contains a number of tables and views to support Tilda functionality.<BR>"
        ,"<B>Copyright (c) 2015, CapsicoHealth Inc., All rights reserved.</B>"
      ]
   }
 ,"extraDDL":{
     "before":["_tilda.Tilda.postgres.helpers-before.sql"]
    ,"after":["_tilda.Tilda.postgres.helpers-after.sql","_tilda.Tilda.postgres.helpers-after1.sql","_tilda.Tilda.postgres.helpers-after2.sql"]
   }
  
 ,"enumerations": [

    { "name": "ZoneInfo",
      "description": "blah blah",
      "id"    : { "type": "STRING", "size":  5  },
      "value" : { "type": "STRING", "size":  50 }
    }
   ]

 ,"objects":[
    { "name": "Key"
     ,"occ": false
     ,"description": "The table to keep track of unique keys across distributed objects/tables"
     ,"columns":[
        { "name": "refnum"        , "type": "LONG"       , "nullable": false,                          "invariant": true, "description": "The primary key for this record" },
        { "name": "name"          , "type": "STRING"     , "nullable": false, "size": 128,             "invariant": true, "description": "The name of the table/object tracked" },
        { "name": "max"           , "type": "LONG"       , "nullable": false,                                             "description": "The pre-allocated max RefNum for this table/object." },
        { "name": "count"         , "type": "INTEGER"    , "nullable": false,                                             "description": "The size of the pre-allocation required by this table/object." },
        
        { "name": "created"       , "type": "DATETIME"   , "nullable": false,          "mode": "AUTO", "invariant": true, "description": "The timestamp for when the record was created.",
                                    "values": [ { "name": "Creation", "value": "NOW", "description": "Creation time"    , "default": "CREATE"} ]
        },
        { "name": "createdETL"    , "type": "DATETIME"   , "nullable": true ,          "mode": "CALCULATED",              "description": "The timestamp for when the record was ETL-created."},
        { "name": "lastUpdated"   , "type": "DATETIME"   , "nullable": false,          "mode": "AUTO",                    "description": "The timestamp for when the record was last updated.",
                                    "values": [ { "name": "Update"  , "value": "NOW", "description": "Last updated time", "default": "ALWAYS"} ]
        },
        { "name": "lastUpdatedETL", "type": "DATETIME"   , "nullable": true ,          "mode": "CALCULATED",              "description": "The timestamp for when the record was last ETL-updated."},
        { "name": "deleted"       , "type": "DATETIME"   , "nullable": true ,                                             "description": "The timestamp for when the record was deleted." }
      ],
      "primary": { "columns": ["refnum"], "autogen": false },
      "indices":[ 
      	{ "name": "Name"     , "columns": ["name"],                          "db": true },
      	{ "name": "AllByName"                     , "orderBy": ["name asc"], "db": false, "subWhere": "deleted is null" } 
      ]
    }



   ,{ "name":"Catalog"
     ,"occ":true
     ,"description":"Master catalog information"
     ,"columns":[
         { "name":"schemaName"        , "type":"STRING(128)"  , "nullable":false, "invariant":true, "description":"The name of the schema this column is defined in."  }
        ,{ "name":"tableViewName"     , "type":"STRING(128)"  , "nullable":false, "invariant":true, "description":"The name of the primary table/view this column is defined in."  }
        ,{ "name":"columnName"        , "type":"STRING(128)"  , "nullable":false, "invariant":true, "description":"The name of the column."  }
        ,{ "name":"type"              , "type":"STRING(128)"  , "nullable":false,                   "description":"The type of the column."  }
        ,{ "name":"nullable"          , "type":"BOOLEAN"      , "nullable":true ,                   "description":"Whether the collumn is a nullable or not null."  }
        ,{ "name":"collection"        , "type":"BOOLEAN"      , "nullable":true ,                   "description":"Whether the collumn is a collection/array."  }
        ,{ "name":"description"       , "type":"STRING(32000)", "nullable":false,                   "description":"The description of the column."  }
        ,{ "name":"tableViewName2"    , "type":"STRING(128)"  , "nullable":true ,                   "description":"The name of the secondary table/view (a derived view, a realized table), if applicable."   }
        ,{ "name":"aggregate"         , "type":"STRING(128)"  , "nullable":true ,                   "description":"The aggregate type of the column, if any."  }
        ,{ "name":"title"             , "type":"STRING(128)"  , "nullable":true ,                   "description":"The title of the formula/expression that may be associated with this column."  }
        ,{ "name":"formula"           , "type":"STRING(32000)", "nullable":true ,                   "description":"The expression/formula that may be associated with this column."  }
        ,{ "name":"measure"           , "type":"BOOLEAN"      , "nullable":true ,                   "description":"Whether this column is a formula defined as a measure or not."  }
        ,{ "name":"htmlDoc"           , "type":"STRING(32000)", "nullable":true ,                   "description":"Pre-rendered html fragment with the full documentation for this formula."  }
        ,{ "name":"referencedColumns" , "type":"STRING[]"     , "nullable":true ,                   "description":"The list of columns this formula depends on."  }
        ,{ "name":"referencedFormulas", "type":"STRING[]"     , "nullable":true ,                   "description":"The list of columns this formula depends on."  }
       ]
     ,"primary": { "autogen": true }
     ,"indices":[
         { "name": "Column"     , "columns": ["schemaName", "tableViewName" , "columnName"], "db": true }
        ,{ "name": "RefColumns" , "orderBy": ["referencedColumns"], "db": true }
        ,{ "name": "RefFormulas", "orderBy": ["referencedFormulas"], "db": true }
      ]
     ,"outputMaps":[
          { "name": "", "columns": ["*"], "outTypes":["CSV","JSON"] }
         ,{ "name": "Simple", "columns": ["schemaName", "tableViewName", "columnName", "type", "nullable", "collection", "description", "aggregate", "measure", "formula", "referencedColumns", "referencedFormulas"], "outTypes":["CSV","JSON"] }
       ]       
    }
    
   ,{ "name":"CatalogFormulaResult"
     ,"occ":true
     ,"description":"Master formula result information, if applicable. Some formulas may not yield an enumeratable value (e.g., returning a date)"
     ,"columns":[
         { "name":"formulaRefnum", "sameas":"Catalog.refnum",                        "invariant": true, "description":"The parent formula."  }
        ,{ "name":"value"        , "type":"STRING" , "nullable":false, "size":  100, "invariant": true, "description":"The result value."  }
        ,{ "name":"description"  , "type":"STRING" , "nullable":false, "size":32000,                    "description":"The description of the result value."  }
       ]
     ,"primary": { "autogen": false, "columns":["formulaRefnum" , "value"] }
     ,"foreign": [
         { "name":"Formula",  "srcColumns":["formulaRefnum"   ], "destObject": "Catalog" }
       ]
     ,"indices":[
       ]
    }
    

/*
   ,{ "name":"Measure"
     ,"occ":true
     ,"description":"Master Measure information"
     ,"columns":[
         { "name":"schema"  , "type":"STRING" , "nullable":false, "size":   64,  "description":"The Schema where the measure is defined."  }
        ,{ "name":"name"    , "type":"STRING" , "nullable":false, "size":   64,  "description":"The name of the measure."  }
       ]
     ,"primary": { "autogen": true }
     ,"indices":[
         { "name": "Measure", "columns": ["schema", "name"], "db": true }
      ]
    }

   ,{ "name":"MeasureFormula"
     ,"occ":true
     ,"description":"Master Measure information"
     ,"columns":[
         { "name":"measureRefnum"   , "sameas":"Measure.refnum", "invariant":true , "description":"The measure."         }
        ,{ "name":"formulaRefnum"   , "sameas":"Formula.refnum", "invariant": true, "description":"The parent formula."  }
       ]
     ,"primary": { "autogen": false, "columns": ["measureRefnum", "formulaRefnum"] }
     ,"foreign": [
         { "name":"Measure",  "srcColumns":["measureRefnum"], "destObject": "Measure" }
        ,{ "name":"Formula",  "srcColumns":["formulaRefnum"], "destObject": "Formula" }
       ]
     ,"indices":[
      ]
    }

   ,{ "name":"FormulaDependency"
     ,"occ":true
     ,"description":"Master formula dependency information"
     ,"columns":[
         { "name":"formulaRefnum"   , "sameas":"Formula.refnum", "invariant": true, "description":"The parent formula."  }
        ,{ "name":"dependencyRefnum", "sameas":"Formula.refnum", "invariant": true, "description":"The dependent formula."   }
       ]
     ,"primary": { "autogen":  false, "columns":["formulaRefnum" , "dependencyRefnum"] }
     ,"foreign": [
         { "name":"Formula1",  "srcColumns":["formulaRefnum"   ], "destObject": "Formula" }
        ,{ "name":"Formula2",  "srcColumns":["dependencyRefnum"], "destObject": "Formula" }
       ]
     ,"indices":[
       ]
    }
*/


   ,{ "name": "MaintenanceLog"
     ,"occ": true
     ,"lc":"WORM"
     ,"description": "Maintenance information"
     ,"columns":[
         { "name":"type"       , "type":"STRING(64)"    , "nullable":false, "description":"The type of maintenance, e.g., Migration, Reorg..."
                               , "values": [ { "name":"Migration", "description": "A migration operation" }
                                            ,{ "name":"Optimize" , "description": "A vaccuum/reorg operation typically"   }
                                           ]
         }
        ,{ "name":"schemaName" , "type":"STRING(128)"   , "nullable":false, "description":"The name of the schema for the resource."   }
        ,{ "name":"objectName" , "type":"STRING(1024)"  , "nullable":true , "description":"The name of the resource."   }
        ,{ "name":"objectType" , "type":"STRING(128)"   , "nullable":true , "description":"The type of the resource."
                               , "values": [ { "name":"Schema"    , "description": "A schema"        }
                                            ,{ "name":"Table"     , "description": "A table"         }
                                            ,{ "name":"View"      , "description": "A view"          }
                                            ,{ "name":"Column"    , "description": "A column"        }
                                            ,{ "name":"Index"     , "description": "An index."       }
                                            ,{ "name":"ForeignKey", "description": "An foreign key." }
                                            ,{ "name":"PrimaryKey", "description": "An primary key." }
                                            ,{ "name":"Function"  , "description": "A function"      }
                                            ,{ "name":"Procedure" , "description": "A procedure"     }
                                            ,{ "name":"Script"    , "description": "A script"        }
                                           ]
         }
        ,{ "name":"action"     , "type":"STRING(64)"    , "nullable":true , "description":"The name of the maintenance resource to track."
                               , "values": [ { "name":"Execute" , "description":"Execute" }
                                            ,{ "name":"Create"  , "description":"Create"  }
                                            ,{ "name":"Update"  , "description":"Update"  }
                                            ,{ "name":"Drop"    , "description":"Drop"    }
                                            ,{ "name":"Rename"  , "description":"Rename"  }
                                            ,{ "name":"Comment" , "description":"Comment" }
                                            ,{ "name":"Optimize", "description":"Optimize"}
                                            ,{ "name":"Vacuum"  , "description":"Vacuum"  }
                                            ,{ "name":"Reorg"   , "description":"Reorg"   }
                                            ,{ "name":"Cluster" , "description":"Cluster" }
                                            ,{ "name":"Access"  , "description":"Access Control" }
                                            ,{ "name":"Catalog" , "description":"Catalog" }
                                           ]
         }
        ,{ "name":"startTime"  , "type":"DATETIME"       , "nullable":false, "description":"The timestamp for when the refill started."        }
        ,{ "name":"endTime"    , "type":"DATETIME"       , "nullable":true , "description":"The timestamp for when the refill ended."          }
        ,{ "name":"statement"  , "type":"STRING(8388608)", "nullable":true , "description":"The value of the maintenance resource to track."  }
        ,{ "name":"descr"      , "type":"STRING(2048)"   , "nullable":true , "description":"The name of the maintenance resource to track."   }
       ]
     ,"primary": { "autogen": true }
     ,"indices":[
         { "name": "SchemaObjectStart", "columns": ["schemaName", "objectName"], "orderBy": ["startTime desc"], "db": true }
        ,{ "name": "TypeStart"        , "columns": ["type"], "orderBy": ["startTime desc"], "db": true }
       ]
    }

   ,{ "name":"TransPerf"
     ,"occ":true
     ,"description":"Performance logs for the Tilda framework"
     ,"columns":[
          { "name":"startPeriod"           , "type":"DATETIME"   , "nullable":false,             "invariant": true, "description":"The timestamp for when the record was created." }
         ,{ "name":"endPeriod"             , "type":"DATETIME"   , "nullable":false,                                "description":"The timestamp for when the record was created." }
         ,{ "name":"commitNano"            , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"commitCount"           , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"rollbackNano"          , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"rollbackCount"         , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"savepointSetNano"      , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"savepointSetCount"     , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"savepointCommitNano"   , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"savepointCommitCount"  , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"savepointRollbackNano" , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"savepointRollbackCount", "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"statementCloseNano"    , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"statementCloseCount"   , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"connectionCloseNano"   , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"connectionCloseCount"  , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"connectionGetNano"     , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"connectionGetCount"    , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaSetterNano"       , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaSetterCount"      , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaToStringNano"     , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaToStringCount"    , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaToJsonNano"       , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaToJsonCount"      , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaToCsvNano"        , "type":"LONG"       , "nullable":false, "default":"0",                 "description":"Blah..." }
         ,{ "name":"tildaToCsvCount"       , "type":"INTEGER"    , "nullable":false, "default":"0",                 "description":"Blah..." }
       ],
      "primary": { "columns": ["startPeriod"], "autogen": false },
      "indices":[ 
       ]
    }

   ,{ "name": "RefillPerf", "occ": true,
      "description": "Performance logs for the Tilda Refills",
      "columns":[
         { "name":"schemaName"    , "type":"STRING"  , "nullable":false, "size": 64, "invariant": true, "description":"The name of the schema tracked"                    }
        ,{ "name":"objectName"    , "type":"STRING"  , "nullable":false, "size": 64, "invariant": true, "description":"The name of the table/object tracked"              }
        ,{ "name":"startDateIncr" , "type":"DATE"    , "nullable":true ,             "invariant": true, "description":"The date passed in for incremental refills."       }
        ,{ "name":"startTime"     , "type":"DATETIME", "nullable":false,             "invariant": true, "description":"The timestamp for when the refill started."        }
        ,{ "name":"endTime"       , "type":"DATETIME", "nullable":false,             "invariant": true, "description":"The timestamp for when the refill ended."          }
        ,{ "name":"timeInsertSec" , "type":"LONG"    , "nullable":false,                                "description":"The time, in seconds, the inserts took."       }
        ,{ "name":"timeDeleteSec" , "type":"LONG"    , "nullable":false,                                "description":"The time, in seconds, the deletes took."       }
        ,{ "name":"timeAnalyzeSec", "type":"LONG"    , "nullable":false,                                "description":"The time, in seconds, the analyze took."      }
        ,{ "name":"timeTotalSec"  , "type":"LONG"    , "nullable":false, "default":"0",                 "description":"The time, in seconds, the analyze took."      }
        ,{ "name":"insertCount"   , "type":"LONG"    , "nullable":false,                                "description":"The count of inserted rows."                       }
        ,{ "name":"deleteCount"   , "type":"LONG"    , "nullable":false,                                "description":"The count of rows deleted."                        }
       ]
     ,"primary": { "columns": ["schemaName", "objectName", "startTime"], "autogen": false }
     ,"indices":[ 
        { "name": "SchemaByObjectStart", "columns": ["schemaName"], "orderBy": ["objectName", "startTime desc"], "db": true },
        { "name": "SchemaObjectByStart", "columns": ["schemaName", "objectName"], "orderBy": ["startTime desc"], "db": false }
      ]
    }






   ,{ "name": "Mapping",
      "description": "Generalized Mapping table",
      "columns":[
         { "name": "type"       , "type": "STRING", "nullable": false, "size":   10, "invariant": true, "description": "The type this mapping is for" }
        ,{ "name": "src"        , "type": "STRING", "nullable": false, "size": 1024, "invariant": true, "description": "The source value for this mapping" }
        ,{ "name": "dst"        , "type": "STRING", "nullable": false, "size": 1024, "invariant": true, "description": "The the destination (mapped) value for this mapping." }
       ],
      "indices":[ 
         { "name": "TypeSrcDst", "columns": ["type", "src", "dst"], "db": true }
       ]
    }


   ,{
      "name": "Connection",
      "description": "Tilda DB Connections Configurations.",
      "columns": [
		{ "name": "active",     "type": "BOOLEAN",    "nullable": true,                 "description": "Status Flag"                                },
        { "name": "id",         "type": "STRING",     "nullable": false, "size": 15,    "description": "Connection ID",        "invariant": true    },
        { "name": "driver",     "type": "STRING",     "nullable": false, "size": 100,   "description": "DB Driver"                                  },
        { "name": "db",         "type": "STRING",     "nullable": false, "size": 200,   "description": "DB Url"                                     },
        { "name": "user",       "type": "STRING",     "nullable": false, "size": 30,    "description": "DB User"                                    },
        { "name": "pswd",       "type": "STRING",     "nullable": false, "size": 40,    "description": "DB Password"                                },
        { "name": "initial",    "type": "INTEGER",    "nullable": false,                "description": "Minimum Connections"                        },
        { "name": "max",        "type": "INTEGER",    "nullable": false,                "description": "Maximum Connections"                        },
        { "name": "schemas",    "type": "STRING[]",   "nullable": false,                "description": "Schemas"                                    }
      ],
      "primary": { "columns": ["id"], "autogen": false },
      "indices": [
         { "name": "AllById", "orderBy": ["id asc"], "db": true }
      ],
      "queries": [
        {
          "name": "Active",
          "description": "All Active Connections",
          "from": [],
          "wheres": [
            { "db":"*", "clause":"active IS NOT false" }
          ],
          "orderBy": ["id asc"]
        }
      ]
      
    }
    
   ,{ "name":"Job"
     ,"description":"Jobs details"
     ,"tzFk": false
     ,"columns":[
          { "name":"name"                             , "type":"STRING"  , "nullable": false, "size": 250,  "description":"Name" }
         ,{ "name":"type"                             , "type":"STRING"  , "nullable": true , "size": 250,  "description":"Job type" }
         ,{ "name":"userId"                           , "type":"STRING"  , "nullable": true , "size": 250,  "description":"Job user Id" }
         ,{ "name":"dataStart"                        , "type":"DATETIME", "nullable": true ,               "description":"StartTime" }
         ,{ "name":"dataEnd"                          , "type":"DATETIME", "nullable": true ,               "description":"StartTime" }
         ,{ "name":"start"                            , "type":"DATETIME", "nullable": false,               "description":"StartTime" }
         ,{ "name":"end"                              , "type":"DATETIME", "nullable": true ,               "description":"EndTime" }
         ,{ "name":"status"                           , "type":"BOOLEAN" , "nullable": true ,               "description":"Status" }
         ,{ "name":"msg"                              , "type":"STRING"  , "nullable": true , "size":8192,  "description":"Message details" }
        ]
     ,"primary": { "autogen": true }
     ,"indices":[ 
          { "name":"JobName", "columns":["name"], "orderBy":["start desc"] }
         ,{ "name":"JobType", "columns":["type"], "orderBy":["start desc"] }
        ]         
     ,"queries": [
        {
          "name": "MostRecent",
          "description": "Most recent jobs, which may or may not have completed yet",
          "from": [],
          "wheres": [
            { "db":"*", "clause":"name=?()" }
          ],
          "orderBy": ["start desc"]
        }
      ]
    }
   ,{ "name":"JobPart"
     ,"description":"Job part details"
     ,"tzFk": false
     ,"columns":[
          { "name":"jobRefnum"                        , "sameAs":"Job.refnum" ,                                 "description":"Parent Job Refnum" }       
         ,{ "name":"name"                             , "type":"STRING"       , "nullable": false, "size": 250, "description":"Job part name" }
         ,{ "name":"type"                             , "type":"STRING"       , "nullable": true , "size": 250, "description":"Job part type" }
         ,{ "name":"dataStart"                        , "type":"DATETIME"     , "nullable": true ,              "description":"Job part data start" }
         ,{ "name":"dataEnd"                          , "type":"DATETIME"     , "nullable": true ,              "description":"Job part data end" }
         ,{ "name":"start"                            , "type":"DATETIME"     , "nullable": false,              "description":"Job part execution start" }
         ,{ "name":"end"                              , "type":"DATETIME"     , "nullable": true ,              "description":"Job part execution end" }
         ,{ "name":"recordsCount"                     , "type":"INTEGER"      , "nullable": true ,              "description":"count of database or file or ... records." }
         ,{ "name":"status"                           , "type":"BOOLEAN"      , "nullable": true ,              "description":"Status flag, i.e., success=true and failure-false" }
       ]
     ,"primary": { "autogen": true }
     ,"foreign": [
         { "name":"Job",  "srcColumns":["jobRefnum"], "destObject": "Job" }
       ]
     ,"indices":[ 
         { "name":"Job"        , "columns":["jobRefnum"], "orderBy":["start desc"] }
        ,{ "name":"JobPartName", "columns":["name"]     , "orderBy":["start desc"] }
        ,{ "name":"JobPartType", "columns":["type"]     , "orderBy":["start desc"] }
       ]         
    }
   ,{ "name":"JobPartMessage"
     ,"description":"Job part message details"
     ,"columns":[
          { "name":"jobRefnum"                        , "sameAs":"Job.refnum"     ,                                 "description":"Parent Job Refnum" }       
         ,{ "name":"jobPartRefnum"                    , "sameAs":"JobPart.refnum" , "nullable": true ,              "description":"Parent Job Part Refnum" }       
         ,{ "name":"notify"                           , "type":"BOOLEAN"          , "nullable": false,              "description":"Notification flag" }
         ,{ "name":"msg"                              , "type":"STRING"           , "nullable": false, "size":8192, "description":"Message details" }
       ]
     ,"primary": { "autogen": true }
     ,"foreign": [
         { "name":"Job",  "srcColumns":["jobRefnum"], "destObject": "Job" }
        ,{ "name":"JobPart",  "srcColumns":["jobPartRefnum"], "destObject": "JobPart" }
       ]
     ,"indices":[ 
         { "name":"Job"        , "columns":["jobRefnum"], "orderBy":["created desc"] }
        ,{ "name":"JobPart"    , "columns":["jobPartRefnum"], "orderBy":["created desc"] }
       ]         
    }
    
    
    
    
    
    
   ,{ "name":"ObjectPerf"
     ,"occ":true
     ,"description":"Performance logs for the Tilda framework"
     ,"columns":[
         { "name":"schemaName"   , "type":"STRING"  , "nullable":false, "size": 64, "invariant":true, "description":"The name of the schema tracked" }
        ,{ "name":"objectName"   , "type":"STRING"  , "nullable":false, "size": 64, "invariant":true, "description":"The name of the table/object tracked" }
        ,{ "name":"startPeriod"  , "type":"DATETIME", "nullable":false,             "invariant":true, "description":"The timestamp for when the record was created." }
        ,{ "name":"endPeriod"    , "type":"DATETIME", "nullable":false,                               "description":"The timestamp for when the record was created." }
        ,{ "name":"selectNano"   , "type":"LONG"    , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"selectCount"  , "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"selectRecords", "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"insertNano"   , "type":"LONG"    , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"insertCount"  , "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"insertRecords", "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"updateNano"   , "type":"LONG"    , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"updateCount"  , "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"updateRecords", "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"deleteNano"   , "type":"LONG"    , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"deleteCount"  , "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
        ,{ "name":"deleteRecords", "type":"INTEGER" , "nullable":false, "default":"0",                "description":"Blah..." }
       ]
     ,"primary":{ "columns":["schemaName", "objectName", "startPeriod"], "autogen":false }
     ,"indices":[ 
         { "name":"SchemaByObjectStart", "columns":["schemaName"              ], "orderBy":["objectName", "startPeriod desc"], "db":true  }
        ,{ "name":"SchemaObjectByStart", "columns":["schemaName", "objectName"], "orderBy":["startPeriod desc"              ], "db":false }
      ]
    }
    


    
    
    
    

    ,{ "name": "FailedDependencyDDLScripts"
      ,"description": "A dummy Table created to generate JavaCode to handle results from the Tilda.getDependenciesDDLs() function output."
      ,"columns":[
           { "name":"srcSchemaName", "type":"STRING" , "nullable":false, "size":   100, "description":"The result value."  }
          ,{ "name":"srcTVName"    , "type":"STRING" , "nullable":false, "size":   100, "description":"The result value."  }
          ,{ "name":"seq"          , "type":"INTEGER", "nullable":false               , "description":"The blah"           }
          ,{ "name":"depSchemaName", "type":"STRING" , "nullable":false, "size":   100, "description":"The result value."  }
          ,{ "name":"depViewName"  , "type":"STRING" , "nullable":false, "size":   100, "description":"The result value."  }
          ,{ "name":"restoreScript", "type":"STRING" , "nullable":false, "size":500000, "description":"The result value."  }
       ]
      ,"indices":[
           { "name": "DepedencySequence", "columns": ["srcSchemaName" , "srcTVName", "created", "seq"], "db": true }
       ]
     }    


   ,{ "name": "DateDim"
     ,"description": "The Date dimension, capturing pre-calculated metrics on dates"
     ,"columns":[
          { "name":"dt"            , "type":"DATE"   , "nullable":false, "invariant":true, "description":"The Date date"  }
         ,{ "name":"epoch"         , "type":"LONG"   , "nullable":false,             "description":"The epoch date"  }
         ,{ "name":"dayName"       , "type":"STRING" , "nullable":true , "size":255, "description":"Day name (i.e., Monday, Tuesday...) of the date"  }
         ,{ "name":"dayOfWeek"     , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 day of the week (Monday=1 to Sunday=7) of the date"  }
         ,{ "name":"dayOfMonth"    , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 day of the month (starting with 1) of the date"  }
         ,{ "name":"dayOfQuarter"  , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 day of the quarter (starting with 1) of the date"  }
         ,{ "name":"dayOfYear"     , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 day of the year (starting with 1) of the date"  }
         ,{ "name":"weekOfMonth"   , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 week of the month (starting with 1) of the date"  }
         ,{ "name":"weekOfYear"    , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 week of the year (starting with 1) of the date"  }
         ,{ "name":"month"         , "type":"DATE"   , "nullable":true ,             "description":"Month-truncated date."  }
         ,{ "name":"monthOfYear"   , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 month of the year (starting with 1) of the date"  }
         ,{ "name":"monthName"     , "type":"STRING" , "nullable":true , "size":255, "description":"Month name (i.e., January, February...) of the date."  }
         ,{ "name":"monthNameShort", "type":"STRING" , "nullable":true , "size":255, "description":"Monday short name (i.e., Jan, Feb...) of the date."  }
         ,{ "name":"quarterOfYear" , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 quarter of the year (starting with 1) of the date."  }
         ,{ "name":"quarterName"   , "type":"STRING" , "nullable":true , "size":255, "description":"Quarter name (i.e., Q1, Q2...) of the date."  }
         ,{ "name":"year"          , "type":"INTEGER", "nullable":true ,             "description":"ISO 8601 year (1.e., 2018) of the date."  }
         ,{ "name":"mmyyyy"        , "type":"STRING" , "nullable":true , "size":  6, "description":"The mmyyyy printable version of a date."  }
         ,{ "name":"mmddyyyy"      , "type":"STRING" , "nullable":true , "size":  8, "description":"The mmddyyyy printable version of a date."  }
         ,{ "name":"yyyymmdd"      , "type":"STRING" , "nullable":true , "size":  8, "description":"The yyyymmdd sortable printable version of a date."  }
         ,{ "name":"isWeekend"     , "type":"INTEGER", "nullable":true ,             "description":"1 if this is a weekend day, 0 otherwise."  }
         ,{ "name":"isBusinessDay" , "type":"INTEGER", "nullable":true ,             "description":"1 if this is a business day, 0 otherwise."  }
         ,{ "name":"isHoliday"     , "type":"INTEGER", "nullable":true ,             "description":"1 if this is a holiday, 0 otherwise."  }
         ,{ "name":"holidayName"   , "type":"STRING" , "nullable":true , "size":255, "description":"The name of the holiday if applicable."  }
      ]
     ,"primary": { "autogen": false, "columns": ["dt"] } 
    }

   ,{ "name": "DateLimitDim"
     ,"occ":false
     ,"description": "A single row for min, max and invalid dates for the Date_Dim"
     ,"columns":[
          { "name":"invalidDate", "sameas":"DateDim.dt", "nullable":false, "description":"The invalid date"  }
         ,{ "name":"minDate"    , "sameas":"DateDim.dt", "nullable":false, "description":"The min date"  }
         ,{ "name":"maxDate"    , "sameas":"DateDim.dt", "nullable":false, "description":"The max date"  }
      ]
     ,"foreign": [
          { "name":"InvalidDt" , "srcColumns":["invalidDate" ], "destObject": "DateDim" }
         ,{ "name":"MinDt"     , "srcColumns":["minDate"     ], "destObject": "DateDim" }
         ,{ "name":"MaxDt"     , "srcColumns":["maxDate"     ], "destObject": "DateDim" }
       ]
     ,"indices": [ 
          { "name":"InvalidDate"  , "columns": ["invalidDate"] }
       ]
    }
  ]
    
    
 ,"views": [
     { "name": "FormulaResultView"
      ,"description": "A view of formulas and their values."
      ,"columns":[
          { "sameas": "CatalogFormulaResult.formulaRefnum"}
         ,{ "sameas": "CatalogFormulaResult.value"        }
         ,{ "sameas": "CatalogFormulaResult.description"  }
         ,{ "sameas": "Catalog.schemaName"         }
         ,{ "sameas": "Catalog.tableViewName"      }
         ,{ "sameas": "Catalog.columnName"         }
        ]
      ,"subWhereX":{
          "clause":["Catalog.deleted is null and CatalogFormulaResult.deleted is null"
                   ]
         ,"description":["Active columns/formulas and their result values"]
        }
     }    

/*
    ,{ "name": "FormulaDependencyView"
      ,"description": "A view of formulas and their direct dependencies."
      ,"columns":[
          { "sameas": "FormulaDependency.formulaRefnum"    }
         ,{ "sameas": "Formula.location"                   }
         ,{ "sameas": "Formula.name"                       }
         ,{ "sameas": "Formula.referencedColumns"          }
         ,{ "sameas": "FormulaDependency.dependencyRefnum" }
         ,{ "sameas": "Formula.name"                       , "name":"dependentFormulaName"}
         ,{ "sameas": "Formula.location"                   , "name":"dependentFormulaLocation"}
         ,{ "sameas": "Formula.referencedColumns"          , "name":"dependentReferencedColumns"}
        ]
      ,"subWhereX":{
          "clause":["Formula.deleted is null"
                   ]
         ,"description":["Active formulas and their sub-formulas"]
        }
     }

    ,{ "name": "FormulaDependencyFullView"
      ,"dbOnly": true
      ,"description": "A view of formulas and their full hierarchical formula dna column dependencies."
      ,"columns":[
          { "sameas": "FormulaDependencyView.formulaRefnum"                                             }
         ,{ "sameas": "FormulaDependencyView.location"                   , "name":"formulaLocation"     }
         ,{ "sameas": "FormulaDependencyView.name"                       , "name":"formulaName"         }
         ,{ "sameas": "FormulaDependencyView.dependentReferencedColumns" , "name":"formulaDependencies" }
         ,{ "sameas": "FormulaDependencyView.referencedColumns"          , "name":"columnDependencies"  }
        ]
      ,"subWhereX":{
          "clause":["Formula.deleted is null"
                   ]
         ,"description":["Active formulas and their full hierarchical dependent formulas and columns"]
        }
     }    
     

    ,{ "name": "MeasureFormulaView"
      ,"description": "A view of formulas and their dependencies."
      ,"columns":[
          { "sameas": "MeasureFormula.measureRefnum"                    }
         ,{ "sameas": "Measure.schema"      , "name":"measureSchema"    }
         ,{ "sameas": "Measure.name"        , "name":"measureName"      }
         ,{ "sameas": "Formula.refnum"      , "name":"formulaRefnum"    }
         ,{ "sameas": "Formula.location"    , "name":"formulaLocation"  }
         ,{ "sameas": "Formula.location2"   , "name":"formulaLocation2" }
         ,{ "sameas": "Formula.name"        , "name":"formulaName"      }
         ,{ "sameas": "Formula.title"              }
         ,{ "sameas": "Formula.description"        }
         ,{ "sameas": "Formula.type"               }
         ,{ "sameas": "Formula.formula"            }
        ]
      ,"subWhereX":{
          "clause":["Formula.deleted is null and Measure.deleted is null"
                   ]
         ,"description":["Active formulas and their sub-formulas"]
        }
     }       
*/
     
     
    ,{ "name": "JobView"
      ,"description": "A view of the job data."
      ,"columns":[
          { "sameas": "Job.refnum"            , "name":"jobRefnum"           }
         ,{ "sameas": "Job.name"              , "name":"jobName"             }
         ,{ "sameas": "Job.type"              , "name":"jobType"             }
         ,{ "sameas": "Job.userId"            , "name":"jobUserId"           }
         ,{ "sameas": "Job.dataStart"         , "name":"jobDataStart"        }
         ,{ "sameas": "Job.dataEnd"           , "name":"jobDataEnd"          }
         ,{ "sameas": "Job.start"             , "name":"jobStart"            }
         ,{ "sameas": "Job.end"               , "name":"jobEnd"              }
         ,{ "sameas": "Job.status"            , "name":"jobStatus"           }
         ,{ "sameas": "Job.msg"               , "name":"jobMsg"              }
         ,{ "sameas": "JobPart.name"          , "name":"jobPartName"         }
         ,{ "sameas": "JobPart.type"          , "name":"jobPartType"         }
         ,{ "sameas": "JobPart.dataStart"     , "name":"jobPartDataStart"    }
         ,{ "sameas": "JobPart.dataEnd"       , "name":"jobPartDataEnd"      }
         ,{ "sameas": "JobPart.start"         , "name":"jobPartStart"        }
         ,{ "sameas": "JobPart.end"           , "name":"jobPartEnd"          }
         ,{ "sameas": "JobPart.recordsCount"  , "name":"jobPartRecordsCount" }
         ,{ "sameas": "JobPart.status"        , "name":"jobPartStatus"       }
         ,{ "sameas": "JobPartMessage.notify" , "name":"jobPartNotify"       }
         ,{ "sameas": "JobPartMessage.msg"    , "name":"jobPartMessage"      }
        ]
     }

   ]
   
   
 ,"migrations":{
      "renames":[
//         { "object":"Catalog"             , "oldNames":["Formula"] }
//        ,{ "object":"CatalogFormulaResult", "oldNames":["FormulaResult"] }
       ]
   }   
};



function makeDescription(obj)
 {
   if (obj.description != null && typeof obj.description == "string")
    return obj.description;
   if (obj.description != null && Array.isArray(obj.description) == true)
    return obj.description.join(" ");
   else if (obj.descriptionX != null && Array.isArray(obj.descriptionX) == true)
    return obj.descriptionX.join(" ");
   return "";
 }

//  constructor(id, label, description, type, data = {}, onClickFunc = null) {


function convertSchemaToTreeNodes(schema)
 {
   let rootNode = new FloriaTreeNode('schema_'+schema.name, schema.name, makeDescription(schema), null, schema, function(node, open) {
       // do nothing
    });
    
   let subNode = new FloriaTreeNode('schema_package_'+schema.name, "package", "Schema package definition", "pack", schema.package, function(node, open) {
   });
   rootNode.addSubNode(subNode);

   subNode = new FloriaTreeNode('schema_dependencies_'+schema.name, "dependencies", "Schema dependencies", null, schema.dependencies, function(node, open) {
       // Bring up "schema picker editor" to set/update/add/remove the list of dependencies
       
   });
   rootNode.addSubNode(subNode);
   
   subNode = new FloriaTreeNode('schema_description_'+schema.nam, "documentation", "Schema description/documentation", null, schema?.documentation?.description, function(node, open) {
       // Bring up "HTML editor" to set/update the schema documentation
    
      var myTextarea = document.getElementById('editor-container');
      let html = schema?.documentation?.description;
      var htmlString = html.join("");
      
      
  
      myTextarea.style.position = 'absolute';
      myTextarea.style.right = '0'; 
      myTextarea.style.top = '0'; 
      myTextarea.style.width = '800px';
      myTextarea.style.height = '400px';
      myTextarea.value = htmlString;


      let seditor = sceditor.create(myTextarea, {
          format: 'html', // Set the editor format to HTML
          //Other configuration options go here
      });
	  var editor = sceditor.instance(myTextarea);

	  var editortext = editor.getBody();
	  FloriaDOM.addEvent(editortext, 'keyup', (editortext, event, target) => {
        console.log("Waited three seconds");
        schema.documentation.description = editor.val();
      }, 3000, true);
      
      //sceditor.instance(myTextarea).destroy();
      
     
	
      
      //alert(schema?.documentation?.description);
      
   });
   rootNode.addSubNode(subNode);
   
   subNode = new FloriaTreeNode('schema_extraDDL_'+schema.name, "extra DDLs", "Additional DDL files/definitions", null, schema.extraDDL, function(node, open) {
       // Bring up "extra DDL definition" to set/update/add/remove the list of dependencies
       // may require uploading those extra DDL files
       // These are SQL, so would benefit from SQL editor
       // .....
  	    var jsonDataAfter = [];
	    var jsonDataBefore = [];
	
	    function deleteRow(type, index) {
		    var arrayToModify = type === 'after' ? jsonDataAfter : jsonDataBefore;
		    arrayToModify[index].deleted = true;
		    updateTable();
		}
	    function insertRow(type, index) {
		    
		    var arrayToModify = type === 'after' ? jsonDataAfter : jsonDataBefore;
		
		    var itemName = ""; 
		
		    var newData = {order: index + 1, dbType: 'postgres', name: itemName};
		
		    arrayToModify.splice(index + 1, 0, newData);
		
		    for (var i = index + 2; i < arrayToModify.length; i++) {
		        arrayToModify[i].order = i;
		    }
		
		    updateTable();
		}

		function createRow(type, data, index) {
		    var row = document.createElement("tr");
		
		    var orderCell = document.createElement("td");
		    orderCell.innerText = data.order;
		    row.appendChild(orderCell);
		
		    var typeCell = document.createElement("td");
		    var typeDropdown = document.createElement("select");
		    var option1 = document.createElement("option");
		    option1.value = "postgres";
		    option1.text = "Postgres";
		    typeDropdown.add(option1);
		    var option2 = document.createElement("option");
		    option2.value = "mysql";
		    option2.text = "MySQL";
		    typeDropdown.add(option2);
		    typeDropdown.value = data.dbType;
		    typeCell.appendChild(typeDropdown);
		    row.appendChild(typeCell);
		
		    var nameCell = document.createElement("td");
		    var nameInput = document.createElement("input");
		    nameInput.value = data.name;
		    nameInput.placeholder = 'Script name';
		    nameInput.style.border = 'none';
		    nameInput.style.borderBottom = '1px dashed grey';
		    nameInput.onfocus = function() {
		        this.style.border = 'none';
		        this.style.borderBottom = '1px solid blue';
		    }
		    nameInput.onblur = function() {
		        this.style.border = 'none';
		        this.style.borderBottom = '1px dashed grey';
		        this.style.placeholder
		    }
		    nameInput.onchange = function() {
		        var arrayToModify = type === 'after' ? jsonDataAfter : jsonDataBefore;
		        arrayToModify[index].name = this.value;
		    };
		    typeDropdown.onchange = function() {
			    var arrayToModify = type === 'after' ? jsonDataAfter : jsonDataBefore;
			    arrayToModify[index].dbType = this.value;
			};
		    nameCell.appendChild(nameInput);
		    row.appendChild(nameCell);
		
		    if (data.deleted) {
		        typeDropdown.disabled = true;
		        nameInput.disabled = true;
		        row.style.backgroundColor = '#d3d3d3';
		    }
		
		    var actionCell = document.createElement("td");
			var deleteButton = document.createElement("button");
			
			var deleteImg = document.createElement("img");
			deleteImg.src = data.deleted ? "/static/img/cross_icon.png" : "/static/img/cross_icon.png";
			deleteImg.style.height = '15px';  
			deleteImg.style.width = '15px';   
			deleteButton.appendChild(deleteImg);
			
			deleteButton.dataset.type = type;
			deleteButton.dataset.index = index;
			deleteButton.onclick = function() {
			    if (data.deleted) {
			        var arrayToModify = type === 'after' ? jsonDataAfter : jsonDataBefore;
			        arrayToModify[index].deleted = false;
			        updateTable();
			    } else {
			        deleteRow(this.dataset.type, parseInt(this.dataset.index));
			    }
			};
		    actionCell.appendChild(deleteButton);
		
		    if (!data.deleted) {
		    var insertButton = document.createElement("button");
		    var insertImg = document.createElement("img");
		    insertImg.src = "/static/img/add.gif";
		    insertImg.style.height = '15px';
		    insertImg.style.width = '15px';
		
		    insertButton.appendChild(insertImg);
		
		    insertButton.dataset.type = type;
		    insertButton.dataset.index = index;
		    insertButton.onclick = function() {
		        insertRow(this.dataset.type, parseInt(this.dataset.index));
		    };
		    actionCell.appendChild(insertButton);
		}
		
		    row.appendChild(actionCell);
		
		    return row;
		}




		function updateTable() {
	        var tableBody = document.getElementById("table-body");
	        tableBody.innerHTML = ""; 
	
	        for (var i = 0; i < jsonDataAfter.length; i++) {
	            tableBody.appendChild(createRow('after', jsonDataAfter[i], i));
	        }
	
	        for (var i = 0; i < jsonDataBefore.length; i++) {
	            tableBody.appendChild(createRow('before', jsonDataBefore[i], i));
	        }
	    }
		
		
       var tableContainer = document.getElementById("table-container");
    
	    // Clear the container
	    tableContainer.innerHTML = "";
	
	    // Create a new table
	    var table = document.createElement("table");
	
	    // Add table header
	    var header = table.createTHead();
	    var row = header.insertRow(0);
	    var orderHeader = document.createElement("th");
	    orderHeader.innerText = "Order";
	    row.appendChild(orderHeader);
	    var typeHeader = document.createElement("th");
	    typeHeader.innerText = "Type";
	    row.appendChild(typeHeader);
	    var nameHeader = document.createElement("th");
	    nameHeader.innerText = "Name";
	    row.appendChild(nameHeader);
	    var actionHeader = document.createElement("th");
	    actionHeader.innerText = "Action";
	    row.appendChild(actionHeader);
	    
	    // Add table body
	    var body = table.createTBody();
	    body.id = "table-body"; 
	    tableContainer.appendChild(table);
		let ddl = schema?.extraDDL;

	    for (let i = 0; i < ddl.after.length; i++){
	        var value = ddl.after[i];
	        var parts = value.split('.');
	        var db = parts[2];
	        var name = parts[3];
	        jsonDataAfter.push({order: i, dbType: db, name: name,deleted:false});
	    }
	
	    for (let i = 0; i < ddl.before.length; i++){
	        var value = ddl.before[i];
	        var parts = value.split('.');
	        var db = parts[2];
	        var name = parts[3];
	        jsonDataBefore.push({order: i, dbType: db, name: name,deleted:false});
	    }
	
	    updateTable();
	    
	    
   });
   rootNode.addSubNode(subNode);

   let objectNode = new FloriaTreeNode('schema_objects_'+schema.name, "objects", "Schema Objects", null, schema.objects, function(node, open) {
       // do nothing
    });
   rootNode.addSubNode(objectNode);
   if (schema.objects != null)
    for (var i = 0; i < schema.objects.length; ++i)
     {
       var o = schema.objects[i];
       if (o==null)
        continue;
       let objectSubNode = new FloriaTreeNode('schema_'+schema.name+"_object_"+o.name, o.name, makeDescription(o), null, o, function(node, open) {
          // Open up object editor... whatever that is. For now, just print.
          alert("Selected Object '"+node.label+"' -> '"+node.data.name+"'.")
       });
       objectNode.addSubNode(objectSubNode);
     }
   
   let viewNode = new FloriaTreeNode('schema_views_'+schema.name, "views", "Schema Views", null, schema.views, function(node, open) {
       // do nothing
    });
   rootNode.addSubNode(viewNode);
   if (schema.views != null)
    for (var i = 0; i < schema.views.length; ++i)
     {
       var v = schema.views[i];
       if (v==null)
        continue;
       let viewSubNode = new FloriaTreeNode('schema_'+schema.name+"_view_"+v.name, v.name, makeDescription(v), null, v, function(node, open) {
          // Open up object editor... whatever that is. For now, just print.
          alert("Selected View '"+node.label+"' -> '"+node.data.name+"'.")
       });
       viewNode.addSubNode(viewSubNode);
     }
       
   subNode = new FloriaTreeNode('schema_migrations_'+schema.name, "migrations", "Schema migration definitions", null, schema.migrations, function(node, open) {
       // Bring up "migrations" editor
   });
   rootNode.addSubNode(subNode);
   
   return rootNode;
 }


export function setupTree(treeDivId, searchDivId)
 {
   const rootNodes = [schema].map(data => convertSchemaToTreeNodes(data));
   const treeView = new FloriaTreeView(rootNodes);

   treeView.render(treeDivId);
   
   const searchBar = document.getElementById(searchDivId);
   searchBar.addEventListener('input', (event) => {
     const searchText = event.target.value;
     treeView.search(searchText);
   });
 }



//const iterations = 1000;
//let start, end;
// start = performance.now();
// for (let i = 0; i < iterations; i++) {
//   treeViewWrapper.draw();
// }
// end = performance.now();
// console.log(`New render function took ${end - start} milliseconds over ${iterations} iterations`);
