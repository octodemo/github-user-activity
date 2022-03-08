import { Parser } from 'json2csv';
import { UserCommitActivity } from './github';


export function generateCommitActivityCSV(data: UserCommitActivity[]) {
  const json2csv = new Parser();

  const payload = data.map(commitActivity => {
    return {
      owner: commitActivity.owner,
      repo: commitActivity.repo,
      repositoryFullName: commitActivity.getRepository(),
      githubUser: commitActivity.user,
      commitDate: commitActivity.commitDate,
      commitUrl: commitActivity.commitUrl,
      committerName: commitActivity.commitUser,
      committerEmail: commitActivity.commitEmail,
      commitMessage: commitActivity.commitMessage,
    }
  })

  const csv = json2csv.parse(payload);
  return csv;
}