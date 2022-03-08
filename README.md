# github-user-activity

A command line tool to generate a report of user commit activity in GitHub.


## GitHub Permissions
To use this tool to effectively view all the necessary contibutions of one or more users on a GHES instance the
user whose token is being used to run the tool must be an organization member on all the organizations.

The easiest way to achieve this is to use the `ghe-org-admin-promote` command from an admin SSH session;

```
ghe-org-admin-promote -u <username> -v
```

This will make the specified user and organization admin on ALL the organizations in the GHES instance so that the necessary visibility is provided for the APIs to return all results.


## Configuration

To configure this application you can create a `.env` file with the GitHub base URL for the APIs and a Personal Access Token, this will be loaded from the current working directory when running the application;

```
GITHUB_ENTERPRISE_SERVER_URL=https://<GitHub Enterprise Server>/api/v3
GITHUB_ACCESS_TOKEN=ghp_xxx
```

Alternatively you can just specify these values as environment variables under the expected names;

* `GITHUB_ENTERPRISE_SERVER_URL`: e.g. https://<GitHub Enterprise Server>/api/v3
* `GITHUB_ACCESS_TOKEN`: e.g. `ghp_xxx`


## Running the application
The repository has three standalone executables that you can use to generate a CSV report of the user commit activity. Select the appropriate executable for your OS:

* `github-user-commit-activity-linux-x64` Linux x64
* `github-user-commit-activity-mac-x64` MacOS x64
* `github-user-commit-activity-windows.exe` for Windows x64

With a populated `.env` file (see [above](#configuration) for details), you can run the application to generate a CSV report using the following options;

* `-u` `--user`: to provide the user handle that you want to generate the report for
* `-f` `--from`: An optional from date to filter results since a specific time in the form `YYYY-MM-DDTHH:mm:SS`, you can just specify the `YYYY-MM-DD` as a short hand.
* `-v` `--verbsoe`: To show verbose logging information


Once the application completes it will generate a CSV file for the commits (taking into account the from time if specified) and print the path to the file.