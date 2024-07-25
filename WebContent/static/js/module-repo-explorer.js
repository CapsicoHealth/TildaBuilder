"use strict";

import { FloriaAjax } from "/static/floria.v2.0/module-ajax.js";

export var RepoExplorer = {
  populateRepositories: function(repositories) {
    const repoList = document.getElementById("repo-list");
    repoList.innerHTML = "";

    for (let i = 0; i < repositories.length; i++) {
      const repo = repositories[i];
      const row = document.createElement("tr");

      const orgCell = document.createElement("td");
      orgCell.textContent = repo.org;
      row.appendChild(orgCell);

      const repoCell = document.createElement("td");
      const repoNameSpan = document.createElement("span");
      repoNameSpan.className = repo.deletable ? "repo-name" : "repo-name disabled";
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

      cloneButton.onclick = function() {

        const repoPath = `https://github.com/${repo.name}.git`;
        const repoPathElement = document.createElement("span");
        repoPathElement.className = "repo-path";
        repoPathElement.textContent = repoPath;
        actionCell.appendChild(repoPathElement);

        // Create input for directory path
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter directory path";
        actionCell.appendChild(input);

        // Create submit button for directory path
        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit";
        submitButton.className = "action-button submit";
        actionCell.appendChild(submitButton);

        submitButton.onclick = function() {
          const directoryPath = input.value;
          if (directoryPath) {
            console.log(`Cloning repository ${repo.name} to ${directoryPath}`);
            // Make an AJAX request to clone the repository
            FloriaAjax.ajaxUrl(
              "/svc/repo/localtest",
              "POST",
              "Cannot clone repository",
              function(response) {
                console.log(`Repository cloned successfully: ${response}`);
              },
               null,
                {
                    "repoUrl": repoPath,
                    "directoryPath": directoryPath
                }
            );
          } else {
            alert("Please enter a directory path.");
          }
        };
      };

      if (repo.deletable) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "delete";
        deleteButton.className = "action-button delete";
        actionCell.appendChild(deleteButton);
      }

      row.appendChild(actionCell);
      repoList.appendChild(row);
    }
  },

  start: function() {
    FloriaAjax.ajaxUrl(
      "/svc/repo/github/explore?ts=" + new Date(),
      "GET",
      "Cannot explore repositories",
      function(data) {
        RepoExplorer.populateRepositories(data.repositories);
      }
    );
  }
};
