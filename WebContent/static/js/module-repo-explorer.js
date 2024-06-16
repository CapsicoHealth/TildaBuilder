"use strict";

import { FloriaAjax } from "/static/floria.v2.0/module-ajax.js";

export var RepoExplorer = {
      populateRepositories: function(repositories) {
        const repoList = document.getElementById("repo-list"); //can be prepended with servlet for getting all repositories list
        repoList.innerHTML = "";

        for (let i = 0; i < repositories.length; i++) {
          const repo = repositories[i];
          const row = document.createElement("tr");

          const orgCell = document.createElement("td");
          orgCell.textContent = repo.org;
          row.appendChild(orgCell);

          const repoCell = document.createElement("td");
          const repoNameSpan = document.createElement("span");
          repoNameSpan.className = repo.deletable
            ? "repo-name"
            : "repo-name disabled";
          repoNameSpan.textContent = repo.name;
          repoCell.appendChild(repoNameSpan);
          row.appendChild(repoCell);

          const actionCell = document.createElement("td");
          if (repo.branches.length > 0) {
            const dropdown = document.createElement("select");
            dropdown.className = "dropdown";
            for (let j = 0; j < repo.branches.length; j++) {
              const option = document.createElement("option");
              option.value = repo.branches[j];
              option.textContent = repo.branches[j];
              dropdown.appendChild(option);
            }
            actionCell.appendChild(dropdown);
          }

          const cloneButton = document.createElement("button");
          cloneButton.textContent = "clone";
          cloneButton.className = "action-button clone";
          actionCell.appendChild(cloneButton);

          if (repo.deletable) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "delete";
            deleteButton.className = "action-button delete";
            actionCell.appendChild(deleteButton);
          }

          row.appendChild(actionCell);
          repoList.appendChild(row);
        }
      }
      
     ,start: function()
       {
          FloriaAjax.ajaxUrl("/svc/repo/explore?ts=" + new Date(), "GET", "Cannot explore repositories"
                            , function (data) {
                                  RepoExplorer.populateRepositories(data.repositories);
                               }
                            );        
       }
};
