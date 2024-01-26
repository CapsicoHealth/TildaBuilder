package tildabuilder.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.MergeResult;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.transport.PushResult;
import org.eclipse.jgit.transport.RemoteRefUpdate;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.kohsuke.github.GHBranch;
import org.kohsuke.github.GHCommit;
import org.kohsuke.github.GHCompare;
import org.kohsuke.github.GHContent;
import org.kohsuke.github.GHFileNotFoundException;
import org.kohsuke.github.GHIssueState;
import org.kohsuke.github.GHOrganization;
import org.kohsuke.github.GHPullRequest;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;



public class GitHubUtils {
    private static GitHub gitHub;
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Please provide your GitHub personal access token.");
            return;
        }

        String personalAccessToken = args[0];

        try {
            gitHub = GitHub.connectUsingOAuth(personalAccessToken);
            System.out.println("Connected to GitHub");

            while (true) {
                System.out.println("\nChoose an option:\n1. List My Organizations\n2. List My Repositories\n3. Select a Repository\n4. Clone a Repository\n5. Pull Changes\n6. Push Changes\n7. Exit");
                int choice = scanner.nextInt();

                switch (choice) {
                    case 1:
                        listOrganizations();
                        break;
                    case 2:
                        listRepositories();
                        break;
                    case 3:
                        GHRepository selectedRepo = selectRepository();
                        handleRepository(selectedRepo);
                        break;
                    case 4:
                        cloneRepositoryInterface();
                        return;
                    case 5:
                        pullChangesInterface();
                        break;
                    case 6:
                        pushChangesInterface();
                        break;
                    case 7:
                        System.out.println("Exiting...");
                        return;
                    default:
                        System.out.println("Invalid choice, please try again.");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    private static void listOrganizations() throws IOException {
        System.out.println("Listing organizations...");
        List<GHOrganization> organizations = new ArrayList<>();
        gitHub.getMyself().getAllOrganizations().forEach(organizations::add);
        

        for (int i = 0; i < organizations.size(); i++) {
            System.out.println((i + 1) + ": " + organizations.get(i).getLogin());
        }

        System.out.println("Select an organization (enter number) or 0 to go back:");
        int orgChoice = scanner.nextInt();

        if (orgChoice > 0 && orgChoice <= organizations.size()) {
            GHOrganization selectedOrg = organizations.get(orgChoice - 1);
            listOrganizationRepositories(selectedOrg);
        }
    }

    private static void listOrganizationRepositories(GHOrganization organization) throws IOException {
        for (GHRepository repo : organization.listRepositories()) {
            System.out.println(repo.getFullName());
        }
    }

    private static void listRepositories() throws IOException {
        for (GHRepository repo : gitHub.getMyself().listRepositories()) {
            System.out.println(repo.getFullName());
        }
    }

    private static GHRepository selectRepository() throws IOException {
        List<GHRepository> repos = new ArrayList<>();
        gitHub.getMyself().listRepositories().forEach(repos::add);

        for (int i = 0; i < repos.size(); i++) {
            System.out.println((i + 1) + ": " + repos.get(i).getFullName());
        }

        System.out.println("Enter the number of the repository:");
        int repoIndex = scanner.nextInt() - 1;

        return repos.get(repoIndex);
    }

    private static void handleRepository(GHRepository repository) throws IOException {
        System.out.println("Selected repository: " + repository.getFullName());

        while (true) {
            System.out.println("\nChoose an option:\n1. List Branches\n2. Select Branch\n3. Create a Pull Request\n4. List Open Pull Requests\n5. Go Back");
            int choice = scanner.nextInt();
            scanner.nextLine(); 

            switch (choice) {
                case 1:
                    listBranches(repository);
                    break;
                case 2:
                    String selectedBranch = selectBranch(repository);
                    handleBranch(repository, selectedBranch);
                    break;
                case 3:
                    createPullRequest(repository);
                    break;
                case 4:
                    listPullRequests(repository);
                    break;
                case 5:
                    return;
                default:
                    System.out.println("Invalid choice, please try again.");
            }
        }
    }

    private static void listBranches(GHRepository repository) throws IOException {
        repository.getBranches().forEach((branchName, branch) -> System.out.println(branchName));
    }

    private static String selectBranch(GHRepository repository) throws IOException {
        List<String> branches = new ArrayList<>();
        repository.getBranches().forEach((name, branch) -> branches.add(name));

        for (int i = 0; i < branches.size(); i++) {
            System.out.println((i + 1) + ": " + branches.get(i));
        }

        System.out.println("Enter the number of the branch:");
        int branchIndex = scanner.nextInt() - 1;

        return branches.get(branchIndex);
    }

    private static void handleBranch(GHRepository repository, String branch) throws IOException {
        System.out.println("Selected branch: " + branch);

        System.out.println("\nDo you want to commit changes to this branch? (yes/no)");
        scanner.nextLine(); 
        String response = scanner.nextLine();

        if ("yes".equalsIgnoreCase(response)) {
            commitChanges(repository, branch);
        }
    }

   private static void commitChanges(GHRepository repository, String branch) throws IOException {
        System.out.println(branch);
        System.out.println("Enter the file path (e.g., folder/file.txt):");
        String path = scanner.nextLine();

        System.out.println("Current version of the file:");
        displayFileContent(repository, branch, path);

        System.out.println("Enter the new content for the file:");
        String newContent = scanner.nextLine();

        System.out.println("New version of the file:\n" + newContent);

        System.out.println("Do you want to commit these changes? (yes/no)");
        String confirm = scanner.nextLine();

        if (!"yes".equalsIgnoreCase(confirm)) {
            System.out.println("Commit cancelled.");
            return;
        }

        System.out.println("Enter a commit message:");
        String commitMessage = scanner.nextLine();

        GHContent contentFile;
        try {
            contentFile = repository.getFileContent(path, branch);
            System.out.println("file already there");
        } catch (GHFileNotFoundException e) {
            repository.createContent()
                    .path(path)
                    .content(newContent)
                    .message(commitMessage)
                    .branch(branch)
                    .commit();
            System.out.println("Created new file: " + path + " on branch " + branch);
            return;
        }

        try {
            contentFile.update(newContent, commitMessage,branch);
            System.out.println("Updated file: " + path + " on branch " + branch);
        } catch (IOException e) {
            System.out.println(branch);
            System.out.println("Error updating file: " + e.getMessage());
        }
    }



    private static void displayFileContent(GHRepository repository, String branch, String filePath) throws IOException {
        try {
            GHContent content = repository.getFileContent(filePath, branch);
            String rawContent = content.getContent();
            System.out.println("Content of " + filePath + ":\n" + rawContent);
        } catch (IOException e) {
            System.out.println("Error fetching content for " + filePath + ": " + e.getMessage());
        }
    }

    private static void displayCommitDetails(GHRepository repository, String commitSHA) throws IOException {
        GHCommit commit = repository.getCommit(commitSHA);
        System.out.println("Commit SHA: " + commitSHA);
        System.out.println("Author: " + commit.getAuthor().getName());
        System.out.println("Date: " + commit.getCommitDate());
        System.out.println("Message: " + commit.getCommitShortInfo().getMessage());
    }

    private static String getNewCommitSHA(GHRepository repository, String branch) throws IOException {
        GHBranch ghBranch = repository.getBranch(branch);
        return ghBranch.getSHA1(); 
    }
    private static boolean isCommitAllowed(GHCompare compare) {
        return true;
    }
    private static void createPullRequest(GHRepository repository) throws IOException {
        System.out.println("Enter the head branch (with changes):");
        String head = scanner.nextLine();

        System.out.println("Enter the base branch (to merge into):");
        String base = scanner.nextLine();

        System.out.println("Enter the title for the pull request:");
        String title = scanner.nextLine();

        System.out.println("Enter a detailed description for the pull request:");
        String body = scanner.nextLine();

        GHPullRequest pullRequest = repository.createPullRequest(title, head, base, body);
        System.out.println("Pull request created: " + pullRequest.getHtmlUrl());
    }
    private static void listPullRequests(GHRepository repository) throws IOException {
        List<GHPullRequest> pullRequests = repository.getPullRequests(GHIssueState.OPEN);
        for (GHPullRequest pr : pullRequests) {
            System.out.println("PR #" + pr.getNumber() + ": " + pr.getTitle());
        }
    }
    private static void cloneRepositoryInterface() {
        System.out.println("Enter the repository URL to clone:");
        scanner.nextLine(); 
        String repoUrl = scanner.nextLine();
        System.out.println("Enter the local directory path for cloning:");
        String clonePath = scanner.nextLine();
        cloneOrPullRepository(repoUrl, clonePath);
    }

    private static void pullChangesInterface() {
        System.out.println("Enter the local repository directory path to pull changes:");
        scanner.nextLine(); 
        String repoPath = scanner.nextLine();
        System.out.println("Enter the branch name to pull from:");
        String branchName = scanner.nextLine();
        pullChanges(repoPath, branchName);
    }

    private static void pushChangesInterface() {
        System.out.println("Enter the local repository directory path to push changes:");
        scanner.nextLine(); 
        String repoPath = scanner.nextLine();

        System.out.println("Enter the branch name to push to:");
        String branchName = scanner.nextLine();

        System.out.println("Enter your GitHub username:");
        String username = scanner.nextLine();

        System.out.println("Enter your GitHub personal access token:");
        String personalAccessToken = scanner.nextLine();

        pushChanges(repoPath, branchName, username, personalAccessToken);
    }
    public static void cloneOrPullRepository(String repoUrl, String cloneDirectoryPath) {
        File repoDir = new File(cloneDirectoryPath);
        File gitDir = new File(repoDir, ".git");

        if (repoDir.exists() && gitDir.exists()) {
            System.out.println("Repository already exists locally. Pulling changes...");
            pullChanges(cloneDirectoryPath, "main"); 
        } else {
            try {
                System.out.println("Cloning " + repoUrl + " into " + cloneDirectoryPath);
                Git.cloneRepository()
                    .setURI(repoUrl)
                    .setDirectory(repoDir)
                    .call();
                System.out.println("Repository cloned successfully.");
            } catch (GitAPIException e) {
                System.out.println("Error cloning repository: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    public static void pullChanges(String repoDirectoryPath, String branchName) {
        try (Git git = Git.open(new File(repoDirectoryPath))) {
            git.checkout().setName(branchName).call();

            git.pull().call();
            System.out.println("Pulled changes from the remote repository.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void pushChanges(String repoDirectoryPath, String branchName, String username, String personalAccessToken) {
        try (Git git = Git.open(new File(repoDirectoryPath))) {
            System.out.println("Checking out branch: " + branchName);
            git.checkout().setName(branchName).call();

            UsernamePasswordCredentialsProvider credentialsProvider = new UsernamePasswordCredentialsProvider(username, personalAccessToken);

            System.out.println("Attempting to push local changes to remote repository...");
            Iterable<PushResult> pushResults = git.push()
                .setCredentialsProvider(credentialsProvider)
                .call();

            for (PushResult pushResult : pushResults) {
                for (RemoteRefUpdate remoteRefUpdate : pushResult.getRemoteUpdates()) {
                    System.out.println("Ref: " + remoteRefUpdate.getRemoteName());
                    System.out.println("Status: " + remoteRefUpdate.getStatus());
                    System.out.println("Message: " + remoteRefUpdate.getMessage());
                    
                    if (remoteRefUpdate.getStatus() == RemoteRefUpdate.Status.REJECTED_NONFASTFORWARD) {
                        System.out.println("Push rejected due to non-fast-forward update.");
                        File localFile = new File(repoDirectoryPath + "/" + "README.md");
                        String localContent = new String(Files.readAllBytes(localFile.toPath()));
                        Files.write(Paths.get(repoDirectoryPath + "/latest_local_README.md"), localContent.getBytes());
                        try {
                            MergeResult mergeResult = git.merge()
                                .include(git.getRepository().findRef("refs/remotes/origin/" + branchName))
                                .call();

                            for (String filePath : mergeResult.getFailingPaths().keySet()) {
                                System.out.println("Conflict in file: " + filePath);


                                ObjectId remoteFileId = git.getRepository().resolve("refs/remotes/origin/" + branchName + ":" + filePath);
                                try (ObjectReader reader = git.getRepository().newObjectReader()) {
                                    byte[] remoteContentBytes = reader.open(remoteFileId, Constants.OBJ_BLOB).getBytes();
                                    String remoteContent = new String(remoteContentBytes);
                                    Files.writeString(Paths.get(repoDirectoryPath, "latest_remote_" + filePath), remoteContent);
                                }
                            }

                        } catch (GitAPIException e) {
                            System.out.println("Error during merge: " + e.getMessage());
                        }
                    }
                }
            }

            System.out.println("Push operation completed.");
        } catch (Exception e) {
            System.out.println("Exception occurred during push: " + e.getMessage());
            e.printStackTrace();
        }
    }

}



