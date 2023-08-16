const entitiesMap = {}; 

const jsonData = {
//     "package": "tilda.data"
//    ,"dependencies":["tilda/data/tmp/_tilda.TildaTmp.json"]
    "extraDDL":{
       "before":[]
      ,"after":["_tilda.Tilda.postgres.helpers-after.sql"]
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
            { "name":"invalidDate", "sameas":"DateDim.dt", "nullable":false, "description":"The invalid date, e.g., '1111-11-11'."  }
           ,{ "name":"minDate"    , "sameas":"DateDim.dt", "nullable":false, "description":"The min date included in the DIM"  }
           ,{ "name":"maxDate"    , "sameas":"DateDim.dt", "nullable":false, "description":"The max date included in the DIM"  }
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
         ]
     }   
  }

$(document).ready(function() {
    var graph = new joint.dia.Graph();

    var CustomLink = joint.dia.Link.extend({
        defaults: joint.util.deepSupplement({
            type: 'CustomLink',
            attrs: { 
                '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' },
            },
            z: -1,
            connector: { name: 'rounded' }
        }, joint.dia.Link.prototype.defaults)
    });

    var paper = new joint.dia.Paper({
        el: $('#paper'),
        model: graph,
        width: 1000,
        height: 1000,
        gridSize: 10,
        defaultLink: new CustomLink(),
        interactive: function(cellView) {
            if (cellView.model instanceof joint.dia.Link) {
                return { vertexAdd: false };
            }
            return true;
        }
    });

    var uml = joint.shapes.uml;

    var CustomUMLClass = uml.Class.extend({
        initialize: function() {
            this.updateRectangles();
            joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
            
            this.on('change:attributes', function() {
                this.updateRectangles();
                this.findView(paper).update();
            }, this);

            this.on('change:attributesPk', function() {
                this.updateRectangles();
                this.findView(paper).update();
            }, this);
            this.on('change:attributesFk', function() {
                this.updateRectangles();
                this.findView(paper).update();
            }, this);
        },
    });
    
    $('#entity-form').submit(function(e) {
        e.preventDefault();
    
        var entityName = $('#entity-name').val();
        var entityAttributes = $('#entity-attributes').val().split(',');
        var entityAttributesFk = $('#entity-attributes-fk').val().split(',');
        var entityAttributesPk = $('#entity-attributes-pk').val().split(',');
    
        
        var longestAttributeLength = Math.min(25, Math.max.apply(Math, entityAttributes.map(attr => attr.length)));
    
        var NewEntity = new CustomUMLClass({
            position: { x: Math.random() * 600, y: Math.random() * 400 },
            size: { width: 200 + longestAttributeLength * 10, height: 100 },  
            name: entityName,
            attributes: entityAttributes,
            attributesFk: entityAttributesFk,
            longestAttributeLength: longestAttributeLength,
            attributesPk: entityAttributesPk,
            methods: [],
        });
        

        delete availableEntities[entityName];
        graph.addCells([NewEntity]);
    });

    var link = null;

    paper.on('cell:pointerdown', function(cellView, evt, x, y) { 
        if (cellView.model.isLink()) return;
    
        var threshold = 10;
    
        var bbox = cellView.model.getBBox();
        var distance = Math.min(
            Math.abs(bbox.x - x),
            Math.abs(bbox.y - y),
            Math.abs(bbox.x + bbox.width - x),
            Math.abs(bbox.y + bbox.height - y)
        );
    
        if (distance < threshold) {
            link = new CustomLink();
    
            link.source({ x: x, y: y });
            link.target({ x: x, y: y });
            link.addTo(graph);
        }
    });

    
    
    paper.on('blank:pointermove', function(evt, x, y) {
        if (link) {
            link.target({ x: x, y: y });
        }
    });
    
    paper.on('cell:pointerup blank:pointerup', function(cellView, evt, x, y) {
        if (!link) return;
    
        var targetElement = paper.findViewsFromPoint(link.getTargetPoint())[0];
    
        if (targetElement) {

            link.target({ id: targetElement.model.id });
        }
    
        link = null;
    });
     
    paper.on('cell:contextmenu', function(cellView, evt, x, y) { 
        evt.preventDefault();

        var sourceName = cellView.model.get('name');
        
        var destinationName = prompt('Enter the name of the destination entity:');

        var destinationModel = graph.getElements().find(function(el) {
            return el.get('name') === destinationName;
        });

        if (destinationModel) {
            var link = new joint.shapes.standard.Link();
            link.source(cellView.model);
            link.target(destinationModel);
            graph.addCell(link);
        } else {
            alert('Could not find an entity with the name "' + destinationName + '"!');
        }
    });
    function removeEntityFromCanvas(entityModel) {
        populateEntityList(entityModel.attributes.name);
    
        var links = graph.getConnectedLinks(entityModel);
        links.forEach(link => {
            graph.removeCells([link]);
        });
        graph.removeCells([entityModel]);
    }

    var contextMenu = $('<ul>', { class: 'context-menu' }).appendTo(document.body);

    var currentCellView = null;
    
    function getContextOptions(cell) {
        var hideKeys = cell.get('hideKeys') ? 'Show Keys' : 'Hide Keys';
        var hideColumns = cell.get('hideColumns') ? 'Show Columns' : 'Hide Columns';
        return [hideKeys, hideColumns, 'Remove Entity from Canvas'];
    }
    
    function refreshContextMenuForCell(cell) {
        contextMenu.empty();
        var options = getContextOptions(cell);
        options.forEach(function(option) {
            $('<li>').text(option).appendTo(contextMenu).on('click', function() {
                var selectedOption = $(this).text();
                switch (selectedOption) {
                    case 'Hide Keys':
                        updateEntityAttributesDisplay('Hide Keys', cell);
                        cell.set('hideKeys', true);
                        break;
                    case 'Show Keys':
                        updateEntityAttributesDisplay('Show Keys', cell);
                        cell.set('hideKeys', false);
                        break;
                    case 'Hide Columns':
                        updateEntityAttributesDisplay('Hide Columns', cell);
                        cell.set('hideColumns', true);
                        break;
                    case 'Show Columns':
                        updateEntityAttributesDisplay('Show Columns', cell);
                        cell.set('hideColumns', false);
                        break;
                    case 'Remove Entity from Canvas':
                        removeEntityFromCanvas(cell);
                        break;
                }
                contextMenu.hide();
            });
        });
    }
    
    function updateEntityAttributesDisplay(option, cell) {
        if (cell.isLink()) return;
            if (!cell.get('originalAttributes')) {
            cell.set('originalAttributes', cell.get('attributes') || []);
            cell.set('originalAttributesFk', cell.get('attributesFk') || []);
            cell.set('originalAttributesPk', cell.get('attributesPk') || []);
        }
    
        var originalAttributes = cell.get('originalAttributes');
        var originalAttributesFk = cell.get('originalAttributesFk');
        var originalAttributesPk = cell.get('originalAttributesPk');
    
        switch (option) {
            case 'Hide Keys':
                cell.set('attributes', [...originalAttributes]);
                cell.set('attributesFk', []);
                cell.set('attributesPk', []);
                break;
            case 'Show Keys':
                if(!cell.get('hideColumns')) {
                    cell.set('attributes', [...originalAttributes]);
                }
                cell.set('attributesFk', [...originalAttributesFk]);
                cell.set('attributesPk', [...originalAttributesPk]);
                break;
            case 'Hide Columns':
                cell.set('attributes', []);
                if(!cell.get('hideKeys')) {
                    cell.set('attributesFk', [...originalAttributesFk]);
                    cell.set('attributesPk', [...originalAttributesPk]);
                }
                break;
            case 'Show Columns':
                cell.set('attributes', [...originalAttributes]);
                if(!cell.get('hideKeys')) {
                    cell.set('attributesFk', [...originalAttributesFk]);
                    cell.set('attributesPk', [...originalAttributesPk]);
                }
                break;
        }
    
        paper.findViewByModel(cell).update();
    }
    
    
    
    contextMenu.hide();
    
    paper.on('cell:pointerdblclick', function(cellView, evt, x, y) { 
        evt.stopPropagation(); 
        contextMenu.css({ left: evt.pageX, top: evt.pageY });
        
        currentCellView = cellView;
        refreshContextMenuForCell(currentCellView.model);
        contextMenu.show();
    });
    
    function populateEntityList(entityName) {
        const entityList = document.getElementById('entity-list');
        const listItem = document.createElement('li');
        listItem.textContent = entityName;
        
        listItem.addEventListener('click', function() {

            showEntityOnCanvas(entityName);
            console.log(entitiesMap);
            entityList.removeChild(listItem);
        });
        
        entityList.appendChild(listItem);
    }
    
    function showEntityOnCanvas(entityName) {
        const entityModel = entitiesMap[entityName];
        
    
        if (entityModel) {
            graph.addCells([entityModel]);
        }

        jsonData.objects.forEach(entityData => {
            if (entityData.foreign) {
                entityData.foreign.forEach(foreignKey => {
                    let sourceModel, destinationModel;
    
                    if (entityData.name === entityName) {
                        sourceModel = graph.getCell(entityModel.id);
                        destinationModel = graph.getCell(entitiesMap[foreignKey.destObject].id);
                    }
                    else if (foreignKey.destObject === entityName) {
                        sourceModel = graph.getCell(entitiesMap[entityData.name].id);
                        destinationModel = graph.getCell(entityModel.id);
                    }
                        if (sourceModel && destinationModel) {
                        var link = new joint.shapes.standard.Link();
                        link.source(sourceModel);
                        link.target(destinationModel);
                        graph.addCells([link]);
                    }
                });
            }
        });
    }
    
    function addEntityToCanvas(entityName) {
        const entity = entitiesMap[entityName];
        if (entity) {
            graph.addCells([entity]);
            
            const associatedLinks = getAssociatedLinks(entity);
            graph.addCells(associatedLinks);
            
            const listItem = [...document.querySelectorAll("#entity-names li")].find(li => li.textContent === entityName);
            if (listItem) {
                listItem.remove();
            }
        }
    }

    function getAssociatedLinks(entity) {
        return jsonData['objects'].reduce((links, entityData) => {
            if (entityData.foreign) {
                entityData.foreign.forEach(foreignKey => {
                    const sourceModel = entitiesMap[entityData.name];
                    const destinationModel = entitiesMap[foreignKey.destObject];
                    if (sourceModel && destinationModel) {
                        if (graph.getCell(sourceModel.id) && graph.getCell(destinationModel.id)) {
                            var link = new CustomLink();
                            link.source(sourceModel);
                            link.target(destinationModel);
                            links.push(link);
                        }
                    }
                });
            }
            return links;
        }, []);
    }
    
    
    function createMainEntitiesFromJson(data) {
            
        if (data.hasOwnProperty('objects')) {
            data['objects'].forEach(entityData => {
                const entityName = entityData.name;
                const allAttributes = [];
                const primaryKeyTypes = [];
    
                entityData.columns.forEach(column => {
                    let attribute = column.name;
    
                    if (column.type) {
                        attribute += `:${column.type}`;
                    } else if (column.sameAs || column.sameas) {  
                        const refString = column.sameAs || column.sameas;
                        const [refEntity, refColumn] = refString.split('.');
    
                        if (refColumn === 'refnum') {
                            attribute += ':string';  
                        } else {
                            const relatedEntity = data['objects'].find(obj => obj.name === refEntity);
                            if (relatedEntity && relatedEntity.columns) {
                                const relatedColumn = relatedEntity.columns.find(col => col.name === refColumn);
                                if (relatedColumn && relatedColumn.type) {
                                    attribute += `:${relatedColumn.type}`;
                                }
                            }
                        }
                    }
    
                    allAttributes.push(attribute);
                });
    
                const primaryKey = (entityData.primary && entityData.primary.columns) ? entityData.primary.columns : [];
                const primaryKeyAttributes = [];
                primaryKey.forEach(pk => {
                    const foundAttr = allAttributes.find(attr => attr.startsWith(pk + ":"));
                    if (foundAttr) {
                        const [pkName, pkType] = foundAttr.split(':');
                        primaryKeyAttributes.push(`${pkName}:${pkType || ''}`);
                    }
                });
    
                const longestAttributeLength = Math.min(25, Math.max.apply(Math, allAttributes.map(attr => attr.length)));
                
                const foreignKeysWithTypes = [];
                if (entityData.foreign) {
                    entityData.foreign.forEach(fk => {
                        if (fk.srcColumns && fk.srcColumns.length > 0) {
                            foreignKeysWithTypes.push(`${fk.name}:${fk.srcColumns[0]}`);
                        } else {
                            foreignKeysWithTypes.push(fk.name);
                        }
                    });
                }
                
                const NewEntity = new CustomUMLClass({
                    position: { x: Math.random() * 600, y: Math.random() * 400 },
                    size: { width: 200 + longestAttributeLength * 7, height: 100 + allAttributes.length * 15 },
                    name: entityName,
                    attributes: allAttributes,
                    attributesFk: foreignKeysWithTypes,
                    attributesPk: primaryKeyAttributes,
                    longestAttributeLength: longestAttributeLength,
                    methods: [],
                });
    
                entitiesMap[entityName] = NewEntity;
                populateEntityList(entityName);  
            });
                data['objects'].forEach(entityData => {
                if (entityData.foreign) {
                    entityData.foreign.forEach(foreignKey => {
                        const sourceModel = entitiesMap[entityData.name];
                        const destinationModel = entitiesMap[foreignKey.destObject];
    
                        if (sourceModel && destinationModel) {
                            const sourceExistsOnCanvas = graph.getCell(sourceModel.id);
                            const destinationExistsOnCanvas = graph.getCell(destinationModel.id);
    
                            if (sourceExistsOnCanvas && destinationExistsOnCanvas) {
                                const link = new joint.shapes.standard.Link();
                                link.source(sourceModel);
                                link.target(destinationModel);
                                graph.addCells([link]);
                            }
                        }
                    });
                }
            });
        }
        
    }

    createMainEntitiesFromJson(jsonData);
    paper.on('link:pointerclick', function(linkView) {
        var verticesTool = new joint.linkTools.Vertices();
        var segmentsTool = new joint.linkTools.Segments();
        var toolsView = new joint.dia.ToolsView({
            tools: [verticesTool, segmentsTool]
        });
        linkView.addTools(toolsView);
    });

});
