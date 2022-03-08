import * as fs from 'fs';
import * as path from 'path';
import { GitHubClient, UserCommitActivity, UserRepositoryContribution } from './github';
import { generateCommitActivityCSV } from './csv'

export async function run(user: string, from?: string, verbose?: boolean) {
  const githubClient = new GitHubClient();

  try {
    console.log(`Looking for user activity for: ${user}...`);
    const contributions: UserRepositoryContribution[] = await githubClient.getUserContributions(user);
    console.log(`  ${contributions.length} repositories have been interacted with by user`);

    if (from) {
      console.log(`applying a time filter to results (from: ${from}), this may result in no commits being returned from individual repositories.`);
      console.log();
    }

    const commitData: UserCommitActivity[] = [];
    await Promise.all(contributions.map(async (contribution) => {
      const commits: UserCommitActivity[] = await githubClient.getUserRepositoryContributions(contribution, from);
      commitData.push(...commits);
      if (!!verbose) {
        displayCommitActivity(commits);
      }
    })
    );
    writeCSV(user, commitData);
  } catch (err) {
    console.error(`An error occurred whilst processing activity:`);
    console.error(err);
  }
}

function writeCSV(user: string, commitData: UserCommitActivity[]) {
  const data = generateCommitActivityCSV(commitData);
  const file = path.join(process.cwd(), `github_commit_activity_${user}.csv`);

  try {
    fs.writeFileSync(file, data);
    console.log(`Generated CSV activity report: ${file}`);
  } catch (err) {
    console.error(`Failed to write to file: ${file}`);
    console.error(err);
  }
}

function displayCommitActivity(activities: UserCommitActivity[]) {
  activities.forEach(contribution => {
    console.log(`Commit activity for '${contribution.user}':`);

    console.log(`  repository:   ${contribution.getRepository()}`);
    console.log(`  author:       ${contribution.user}`);
    console.log(`  at:           ${contribution.commitDate}`);
    console.log(`  commit`);
    console.log(`    message: ${contribution.commitMessageSingleLine}`);
    console.log(`    user:    ${contribution.commitUser}`);
    console.log(`    email:   ${contribution.commitEmail}`);
    console.log(`    url:     ${contribution.commitUrl}`);
    console.log();
  });
}
