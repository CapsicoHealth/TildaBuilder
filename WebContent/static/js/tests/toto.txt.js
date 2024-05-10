import { BoardManager } from "/static/floria.v2.0/module-tables.js";


var episodeMonitoringBoardMappings = [
  { label:"Patient Name"         , field:"pt_name"                     , title: function(r) {
                                                                           var last = FloriaDate.parseDateTime(r.processLastUpdated);
                                                                           last = last==null ? "" : ", on "+last.printFriendly(true, true, false, false)+", by "+r.updatorUserId;
                                                                           return r.pt_name+" - "+r.pt_mrn
                                                                                 +"\nEpisode: "+r.epipay_id
                                                                                 +"\nStatus: "+r.epistat_id
                                                                                 +"\nStart Of Care: "+r.epipay_socstart_dt
                                                                                 +"\nCase Manager: "+(r.coordinator_clin_name==null?"N/A":r.coordinator_clin_name)
                                                                                 +"\n"
                                                                                 +"\nDx: "+r.dx_fullcode+" - "+r.dx_descr
                                                                                 +"\n"
                                                                                 +"\nReview: "+getWorkflowStatusName(r.agree, r.enroll)+last
                                                                                 ;
                                                                         }
                                                                       , formatter: function(r){
                                                                           return '<IMG class="workflowIcon" src="'+getWorkflowStatusIcon(r.agree, r.enroll, true)+'">'+r.pt_name;
                                                                         }
   ,config: { dateCol:"dt_date"
             ,idCol:"epipay_pk"
            }
  }
 ,{ label:"Age"                  , field:"epipay_pt_age_fk"            }
 ,{ label:"Branch"               , field:"branch_code"                 }
 ,{ label:"Global Risk"          , field:"score_sepsis"                , score:"SEP" }
 ,{ label:"Dx"                   , field:"dx_fullcode"                 , title:"$1", columns:["dx_descr"] }
 ,{ label:"Last Visit Days"      , field:"days_since_last_visit"       , formatter: function(r){
                                                                           var days = r.days_since_last_visit - r.gicsn_days_to_next_visit_oos;
                                                                           if (days == null || isNaN(days) == true)
                                                                            return "";
                                                                           var style = days >= 10 ? 'color:red;font-weight:bold;' : days >= 7 ? 'color:orange;' : '';
                                                                           return '<SPAN style="'+style+'">'+days+'</SPAN>';
                                                                         }
                                                                       , title: function(r) {
                                                                           return "Last Visit: "+r.gicsn_visit_vistyp_id+" on "+r.gicsn_visit_end_dt+"  ("+r.days_since_last_visit+" days ago)\n"
                                                                                +r.gicsn_count_visit_missed+" missed visits and "+r.gicsn_count_visit_resched+" rescheduled\n"
                                                                                +r.gicsn_count_assmt_tif67s+" TIFs"
                                                                                +(r.gicsn_missed_reasons == null || r.gicsn_missed_reasons.length == 0 ? "" :
                                                                                     "\n\nMissed Visits Reason(s)\n   - "+r.gicsn_missed_reasons.join("\n   - ")
                                                                                 );
                                                                         }
  }
 ,{ label:"SIRS"                 , field:"criteria_sirs_flag"          , flag:true }
];


// 1- Call a service, get a json Array
// 2- we define the meta-data (above)
// 3- call BoardManager.pain with
//     . a div
//     . the data from step 1 (it's an array of objets)
//     . meta-data mappings for the Board manager to run
//     . data dictionary for tooltips for columns
BoardManager.paint(divId, data, episodeMonitoringBoardMappings, dataDictionary);

// results in Clip0002.jpg



