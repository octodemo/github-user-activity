import { run } from './userCommitActivity';

import { program } from 'commander';

program.name('github-user-commit-activity');
program.version(require('../package.json').version);
program.requiredOption('-u, --user <user>', 'The GitHub user name to get the activity for');
program.option('-f --from <from>', 'The time to get commits from in the form YYYY-MM-ddTHH:mm:SS or YYYY-MM-DD');
program.option('-v --verbose', 'Show verbose activity', false);

program.parse(process.argv);
const opts = program.opts();

async function execute() {
  try {
    run(opts.user, opts.from, opts.verbose);
  } catch (err: Error | any) {
    console.log(err.stack);
    console.error(err.message);
    console.error();
    program.help({ error: true });
  }
}

execute();