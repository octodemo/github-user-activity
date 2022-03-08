import { Octokit } from '@octokit/rest';
import { RequestHeaders, RequestParameters } from '@octokit/types';

import * as config from './config';

export class GitHubClient {
  private octokit: Octokit

  constructor() {
    this.octokit = new Octokit({
      auth: config.getGitHubAccessToken(),
      baseUrl: config.getGitHubUrl()
    });
  }

  async getUserContributions(username: string): Promise<UserRepositoryContribution[]> {
    const results: UserQueryResult = await this.octokit.graphql({
      query: USER_QUERY,
      username: username
    });

    function extractContribution(data: UserQueryResult): UserQueryRepositoryContribution[] {
      return data.user.repositoriesContributedTo.nodes;
    }

    const data: UserQueryRepositoryContribution[] = await this.getPaginatedQuery<UserQueryResult, UserQueryRepositoryContribution>(
      USER_QUERY,
      { username: username },
      'user.repositoriesContributedTo.pageInfo',
      extractContribution
    );

    return data.map(val => {
      return new UserRepositoryContribution(username, val);
    });
  }

  async getUserRepositoryContributions(contribution: UserRepositoryContribution, from?: string): Promise<UserCommitActivity[]> {
    const params = {
      owner: contribution.owner,
      repo: contribution.repo,
      author: contribution.username,
      per_page: 100,
    }

    if (from) {
      params['since'] = from;
    }

    return this.octokit.paginate('GET /repos/:owner/:repo/commits', params)
      // @ts-ignore
      .then((commits: UserContribution[]) => {
        const results: UserCommitActivity[] = [];
        if (commits) {
          commits.forEach(commit => {
            results.push(new UserCommitActivity(contribution.owner, contribution.repo, commit));
          })
        }

        if (results.length === 0) {
          console.log(`No commits found in repository ${contribution.owner}/${contribution.repo} for '${contribution.username}'`);
        }

        return results;
      });
  }

  async getPaginatedQuery<T, Y>(
    query: string,
    parameters: Object,
    pageInfoPath: string,
    extractResultsFn: (val: T) => Y[],
    headers?): Promise<Y[]> {

    const octokit = this.octokit
      , results: Y[] = []
      , queryParameters = Object.assign({ cursor: null }, parameters)
      ;

    let hasNextPage = false;
    do {
      const graphqlParameters = buildGraphQLParameters(query, parameters, headers)
        , queryResult = await octokit.graphql(graphqlParameters)
        ;

      // @ts-ignore
      const extracted: Y = extractResultsFn(queryResult);
      // @ts-ignore
      results.push(...extracted);

      const pageInfo = getObject(queryResult, ...pageInfoPath.split('.'));
      hasNextPage = pageInfo ? pageInfo.hasNextPage : false;
      if (hasNextPage) {
        queryParameters.cursor = pageInfo.endCursor;
      }
    } while (hasNextPage);

    return results;
  }
}

function buildGraphQLParameters(query: string, parameters?: Object, headers?: RequestHeaders): RequestParameters {
  const result: RequestParameters = {
    ...(parameters || {}),
    query: query,
  };

  if (headers) {
    result.headers = headers;
  }

  return result;
}

function getObject(target, ...path) {
  if (target !== null && target !== undefined) {
    const value = target[path[0]];

    if (path.length > 1) {
      return getObject(value, ...path.slice(1));
    } else {
      return value;
    }
  }
  return null;
}

export class UserCommitActivity {

  readonly owner: String;

  readonly repo: string;

  readonly data: UserContribution;

  constructor(owner: string, repo: string, data: UserContribution) {
    this.owner = owner;
    this.repo = repo;
    this.data = data;
  }

  getRepository() {
    return `${this.owner}/${this.repo}`;
  }

  get commitUser(): string {
    return this.data.commit.committer.name;
  }

  get commitDate() {
    return this.data.commit.committer.date;
  }

  get commitEmail(): string {
    return this.data.commit.committer.email;
  }

  get user(): string {
    return this.data.author.login;
  }

  get commitUrl(): string {
    return this.data.html_url;
  }

  get commitMessage(): string {
    return this.data.commit.message
  }

  get commitMessageSingleLine(): string {
    const lines = this.commitMessage.split('\n');
    if (lines.length === 1) {
      return lines[0];
    } else {
      return `${lines[0]}...`;
    }
  }
}

export type UserContribution = {
  sha: string,
  node_id: string,
  commit: {
    author: {
      name: string,
      email: string,
      date: string
    },
    committer: {
      name: string,
      email: string,
      date: string
    },
    message: string,
    tree: {
      sha: string,
      url: string
    },
    url: string,
  },
  url: string,
  html_url: string,
  author: {
    login: string,
    id: number,
    node_id: string
  }
}

const USER_QUERY = `
  query userContributions($username: String! $cursor: String) {
    user(login: $username) {
      login
      email
      databaseId
      createdAt

      repositoriesContributedTo(first: 100 after: $cursor) {
        totalCount

        pageInfo {
          hasNextPage
          endCursor
        }

        nodes {
          id
          owner {
            login
          }
          name
        }
      }
    }
  }
`;

export class UserRepositoryContribution {

  readonly username: string;
  readonly owner: string
  readonly repo: string

  constructor(username: string, contribution: UserQueryRepositoryContribution) {
    this.username = username;
    this.owner = contribution.owner.login;
    this.repo = contribution.name;
  }
}

export type PageInfo = {
  hasNextPage: boolean,
  endCursor: string
}

export type UserQueryRepositoryContribution = {
  id: string,
  owner: {
    login: string
  },
  name: string
}

export type UserQueryResult = {
  user: {
    login: string,
    email: string,
    databaseId: number,
    createdAt: string,
    repositoriesContributedTo: {
      totalCount: number,
      pageInfo: PageInfo,
      nodes: UserQueryRepositoryContribution[]
    }
  }
}