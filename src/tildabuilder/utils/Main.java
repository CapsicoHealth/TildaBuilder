import java.io.IOException;
import java.util.List;
import java.util.Scanner;
import org.kohsuke.github.GHIssueState;
import org.kohsuke.github.GHPullRequest;


public class Main {
    private static Scanner scanner = new Scanner(System.in);
    private static GitHubUtils gitHubService;

    public static void main(String[] args) {
        System.out.println("Enter your GitHub personal access token:");
        String token = scanner.nextLine();

        try {
            gitHubService = new GitHubUtils(token);
            runMainMenu();
        } catch (IOException e) {
            System.err.println("Failed to connect to GitHub: " + e.getMessage());
        }
    }

    private static void runMainMenu() {
        while (true) {
            System.out.println("\nChoose an operation:\n" +
                    "1. List My Organizations\n" +
                    "2. List My Repositories\n" +
                    "3. List Organization Repositories\n" +
                    "4. Clone or Pull a Repository\n" +
                    "5. Push Changes\n" +
                    "6. Create a Commit\n" +
                    "7. Create a Pull Request\n" +
                    "8. List Pull Requests\n" +
                    "9. Merge a Pull Request\n" +
                    "10. Exit");

            int choice = getIntInput();
            scanner.nextLine(); 

            try {
                switch (choice) {
                    case 1:
                        handleListOrganizations();
                        break;
                    case 2:
                        handleListUserRepositories();
                        break;
                    case 3:
                        handleListOrganizationRepositories();
                        break;
                    case 4:
                        handleCloneOrPullRepository();
                        break;
                    case 5:
                        handlePushChanges();
                        break;
                    case 6:
                        handleCreateCommit();
                        break;
                    case 7:
                        handleCreatePullRequest();
                        break;
                    case 8:
                        handleListPullRequests();
                        break;
                    case 9:
                        System.out.println("Exiting...");
                        return;
                    default:
                        System.out.println("Invalid choice, please try again.");
                }
            } catch (IOException e) {
                System.err.println("An error occurred: " + e.getMessage());
            }
        }
    }

    private static void handleListOrganizations() throws IOException {
        List<String> organizations = gitHubService.listOrganizations();
        System.out.println("Your Organizations: " + organizations);
    }

    private static void handleListUserRepositories() throws IOException {
        List<String> userRepos = gitHubService.listUserRepositories();
        System.out.println("Your Repositories: " + userRepos);
    }

    private static void handleListOrganizationRepositories() throws IOException {
        System.out.println("Enter organization name:");
        String orgName = scanner.nextLine();
        List<String> orgRepos = gitHubService.listOrganizationRepositories(orgName);
        System.out.println("Repositories in " + orgName + ": " + orgRepos);
    }

    private static void handleCloneOrPullRepository() {
        System.out.println("Enter the repository URL:");
        String repoUrl = scanner.nextLine();
        System.out.println("Enter the local path to clone/pull the repository:");
        String localPath = scanner.nextLine();
        gitHubService.cloneOrPullRepository(repoUrl, localPath);
    }

    private static void handlePushChanges() throws IOException {
        System.out.println("Enter the local repository path:");
        String localRepoPath = scanner.nextLine();
        System.out.println("Enter the branch name:");
        String branchName = scanner.nextLine();
        System.out.println("Enter your GitHub username:");
        String username = scanner.nextLine();
        System.out.println("Enter your GitHub password/personal access token:");
        String password = scanner.nextLine();
        gitHubService.pushChanges(localRepoPath, branchName, username, password);
    }

    private static void handleCreateCommit() throws IOException {
        System.out.println("Enter repository full name (username/repo):");
        String repoFullName = scanner.nextLine();
        System.out.println("Enter the branch name:");
        String branchName = scanner.nextLine();
        System.out.println("Enter the file path:");
        String filePath = scanner.nextLine();
        System.out.println("Enter the content for the file:");
        String content = scanner.nextLine();
        System.out.println("Enter the commit message:");
        String commitMessage = scanner.nextLine();
        gitHubService.createCommit(repoFullName, branchName, filePath, content, commitMessage);
    }

    private static void handleCreatePullRequest() throws IOException {
        System.out.println("Enter repository full name (username/repo):");
        String repoFullName = scanner.nextLine();
        System.out.println("Enter the title for the pull request:");
        String title = scanner.nextLine();
        System.out.println("Enter the head branch:");
        String headBranch = scanner.nextLine();
        System.out.println("Enter the base branch:");
        String baseBranch = scanner.nextLine();
        System.out.println("Enter the body/description for the pull request:");
        String body = scanner.nextLine();
        gitHubService.createPullRequest(repoFullName, title, headBranch, baseBranch, body);
    }

    private static void handleListPullRequests() throws IOException {
        System.out.println("Enter repository full name (username/repo):");
        String repoFullName = scanner.nextLine();
        System.out.println("Enter the state (OPEN, CLOSED, ALL):");
        String stateStr = scanner.nextLine();
        GHIssueState state = GHIssueState.valueOf(stateStr.toUpperCase());
        List<GHPullRequest> pullRequests = gitHubService.listPullRequests(repoFullName, state);
        for (GHPullRequest pr : pullRequests) {
            System.out.println("PR #" + pr.getNumber() + " " + pr.getTitle() + " - " + pr.getState());
        }
    }


    private static int getIntInput() {
        while (!scanner.hasNextInt()) {
            System.out.println("That's not a valid option! Please enter a number.");
            scanner.next(); 
        }
        return scanner.nextInt();
    }
}
