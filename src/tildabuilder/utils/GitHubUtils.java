package tildabuilder.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.MergeResult;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.transport.CredentialsProvider;
import org.eclipse.jgit.transport.PushResult;
import org.eclipse.jgit.transport.RemoteRefUpdate;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.kohsuke.github.GHContent;
import org.kohsuke.github.GHFileNotFoundException;
import org.kohsuke.github.GHIssueState;
import org.kohsuke.github.GHMembership;
import org.kohsuke.github.GHMyself;
import org.kohsuke.github.GHOrganization;
import org.kohsuke.github.GHPullRequest;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.PagedIterable;

public class GitHubUtils
  {
    private GitHub _gitHub;

    public GitHubUtils(String accessToken)
      throws IOException
      {
        _gitHub = GitHub.connectUsingOAuth(accessToken);
      }

    public List<String> listOrganizations()
    throws IOException
      {
        List<String> organizationsList = new ArrayList<>();
        GHMyself myself = _gitHub.getMyself();
        PagedIterable<GHMembership> memberships = myself.listOrgMemberships();

        for (GHMembership member : memberships)
          {
            System.out.println(member.getOrganization());
          }

        return organizationsList;
      }


    public List<String> listUserRepositories()
    throws IOException
      {
        List<String> repositories = new ArrayList<>();
        for (GHRepository repo : _gitHub.getMyself().listRepositories())
          {
            repositories.add(repo.getFullName());
          }
        return repositories;
      }



    public void cloneOrPullRepository(String repoUrl, String localPath)
      {
        File localRepo = new File(localPath);
        if (localRepo.exists())
          {
            pullRepository(localPath);
          }
        else
          {
            cloneRepository(repoUrl, localPath);
          }
      }

    private static void cloneRepository(String repoUrl, String localPath)
      {
        try
          {
            Git.cloneRepository().setURI(repoUrl).setDirectory(new File(localPath)).call();
            System.out.println("Repository cloned to " + localPath);
          }
        catch (GitAPIException e)
          {
            System.err.println("Error cloning repository: " + e.getMessage());
          }
      }

    private static void pullRepository(String localPath)
      {
        try (Git git = Git.open(new File(localPath)))
          {
            git.pull().call();
            System.out.println("Repository at " + localPath + " has been updated.");
          }
        catch (Exception e)
          {
            System.err.println("Error pulling repository: " + e.getMessage());
          }
      }

    public void pushChanges(String repoDirectoryPath, String branchName, String userName, String password)
      {
        try (Git git = Git.open(new File(repoDirectoryPath)))
          {
            CredentialsProvider credentialsProvider = new UsernamePasswordCredentialsProvider(userName, password);
            Iterable<PushResult> pushResults = git.push().setCredentialsProvider(credentialsProvider).call();
            for (PushResult pushResult : pushResults)
              {
                for (RemoteRefUpdate remoteRefUpdate : pushResult.getRemoteUpdates())
                  {
                    System.out.println("Ref: " + remoteRefUpdate.getRemoteName());
                    System.out.println("Status: " + remoteRefUpdate.getStatus());
                    System.out.println("Message: " + remoteRefUpdate.getMessage());

                    if (remoteRefUpdate.getStatus() == RemoteRefUpdate.Status.REJECTED_NONFASTFORWARD)
                      {
                        System.out.println("Push rejected due to non-fast-forward update.");
                        File localFile = new File(repoDirectoryPath + "/" + "README.md");
                        String localContent = new String(Files.readAllBytes(localFile.toPath()));
                        Files.write(Paths.get(repoDirectoryPath + "/latest_local_README.md"), localContent.getBytes());
                        try
                          {
                            MergeResult mergeResult = git.merge()
                            .include(git.getRepository().findRef("refs/remotes/origin/" + branchName))
                            .call();

                            for (String filePath : mergeResult.getFailingPaths().keySet())
                              {
                                System.out.println("Conflict in file: " + filePath);


                                ObjectId remoteFileId = git.getRepository().resolve("refs/remotes/origin/" + branchName + ":" + filePath);
                                try (ObjectReader reader = git.getRepository().newObjectReader())
                                  {
                                    byte[] remoteContentBytes = reader.open(remoteFileId, Constants.OBJ_BLOB).getBytes();
                                    String remoteContent = new String(remoteContentBytes);
                                    Files.writeString(Paths.get(repoDirectoryPath, "latest_remote_" + filePath), remoteContent);
                                  }
                              }

                          }
                        catch (GitAPIException e)
                          {
                            System.out.println("Error during merge: " + e.getMessage());
                          }
                      }
                  }
              }
            System.out.println("Changes have been pushed from " + repoDirectoryPath);
          }
        catch (Exception e)
          {
            System.err.println("Error pushing changes: " + e.getMessage());
          }
      }

    public List<String> listBranches(String repoFullName)
    throws IOException
      {
        GHRepository repository = _gitHub.getRepository(repoFullName);
        return new ArrayList<>(repository.getBranches().keySet());
      }

    public void createCommit(String repoFullName, String branchName, String filePath, String content, String commitMessage)
      {
        try
          {
            GHRepository repository = _gitHub.getRepository(repoFullName);

            GHContent contentFile = null;
            try
              {
                contentFile = repository.getFileContent(filePath, branchName);
              }
            catch (GHFileNotFoundException e)
              {
                System.out.println("File not found, will attempt to create it.");
              }

            if (contentFile != null)
              {
                contentFile.update(content, commitMessage, branchName);
                System.out.println("Updated existing file: " + filePath + " in repository: " + repoFullName + " on branch: " + branchName);
              }
            else
              {
                repository.createContent()
                .path(filePath)
                .content(content)
                .message(commitMessage)
                .branch(branchName)
                .commit();
                System.out.println("Created new file: " + filePath + " in repository: " + repoFullName + " on branch: " + branchName);
              }
          }
        catch (IOException e)
          {
            System.err.println("Error during commit creation: " + e.getMessage());
            e.printStackTrace();
          }
      }

    public List<String> listOrganizationRepositories(String orgName)
    throws IOException
      {
        List<String> repositories = new ArrayList<>();
        GHOrganization org = _gitHub.getOrganization(orgName);
        for (GHRepository repo : org.listRepositories())
          {
            repositories.add(repo.getFullName());
          }
        return repositories;
      }


    public void createPullRequest(String repoFullName, String title, String headBranch, String baseBranch, String body)
    throws IOException
      {
        GHRepository repository = _gitHub.getRepository(repoFullName);
        repository.createPullRequest(title, headBranch, baseBranch, body);
        System.out.println("Pull request created in " + repoFullName + " from " + headBranch + " to " + baseBranch);
      }

    public List<GHPullRequest> listPullRequests(String repoFullName, GHIssueState state)
    throws IOException
      {
        GHRepository repository = _gitHub.getRepository(repoFullName);
        return repository.getPullRequests(state);
      }



  }



