const { program } = require('commander');
const { version, description } = require('./package.json');
const fs = require('fs');
const shell = require('shelljs');
const { Octokit } = require("@octokit/core");
// const spawn = require('child_process').spawn;

const octokit = new Octokit({
    aut: "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"
});


// Command line options

program
    .name("gh issues")
    .version(version)
    .description(description)
    .usage('[options]')
    .option('-r, --repo <name>', 'specify repo name')
    .option('-o, --org <name>', 'specify organization name')
    .option('-s, --state <state>', 'specify issue state [open|closed|all], default state is open', "open")
    .option('-a, --assigned', 'get issues assigned to user', false)
    .option('-c, --open', 'open an issue')
    .option('-t, --title <title>', 'set title')
    .option('-b, --body <body>', 'set body', '')
    // .option('-u, --user <name>', 'specify user of repo')
    // .option('-l, --list', 'list all this repo issues')
  
program.parse(process.argv);
const options = program.opts();


// Check environment

function showError(error) {
    if (error) {
      console.error(`Error!: ${error}`);
      process.exit(1); 
    }
}

if (!shell.which('git'))
    showError('Sorry, this extension requires git installed!');

if (!shell.which('gh'))
    showError('Sorry, this extension requires GitHub Cli (gh) installed!');

let isGitFolder = shell.exec("git rev-parse --is-inside-work-tree", {silent: true});
if (!isGitFolder || !fs.existsSync(".git")) {
    showError('The current folder must be the root of a git repo when running this command!');
}


// Execute gh command

function gh(...args) {
    let command = `gh ${args.join('')}`;
    let result = shell.exec(command, { silent: true, stdio: "inherit" });     // silent option don't echo program output to console

    if (result.code != 0) {
        shell.echo(`Error: command ${command} failed: invalid options`);
        shell.exit(result.code);
    }

    return result.stdout.replace(/\s+$/,'');
}

// Access gh api data

function getUserLogin() {
    let command = "api 'user' --jq .login";
    return gh(command);
}

function getThisRepoIssues() {
    // let command = "api repos/:owner/:repo/issues | jq '.[] | .number,.title,.body,.user.login,.assignee.login'";
    let command = "api repos/:owner/:repo/issues --template \"$(cat templates/repo.gotemplate)\"";
    console.log(gh(command));
}

function getRepoIssues(owner, repo, state) {
    let command =`api /repos/${owner}/${repo}/issues?state=${state} --template \"$(cat templates/repo.gotemplate)\"`;
    console.log(gh(command));
}

function getAssignedIssuesByUser(state) {
    let command =`api /issues?state=${state} --template \"$(cat templates/repo.gotemplate)\"`;
    console.log(gh(command));
}

function getAssignedIssuesByOrg(org, state) {
    let command =`api /orgs/${org}/issues?state=${state} --template \"$(cat templates/org.gotemplate)\"`;
    console.log(gh(command));
}

async function openIssue(title, body, owner, repo) {
    let command=`api -X POST /repos/${owner}/${repo}/issues -f title="${title}" -f body="${body}"`;
    console.log(gh(command));
}


// Choose what to execute

if (options.repo) {
    if (options.user) {
        console.log(`GET ISSUES OF ${options.user} - ${options.repo}`);
        getRepoIssues(options.user, options.repo, options.state);
    }
    else if (options.org) {
        console.log(`GET ISSUES OF ${options.org} - ${options.repo}`);
        getRepoIssues(options.org, options.repo, options.state);
    }
    else {
        // This option uses auth user
        console.log(`GET ISSUES OF ${getUserLogin()} - ${options.repo}`);
        getRepoIssues(getUserLogin(), options.repo, options.state);
    }
}
else if (options.assigned) {
    console.log(`Assigned issues`)
    getAssignedIssuesByUser(options.state)
}
else if (options.org) {
    console.log(`Assigned issues in org`)
    getAssignedIssuesByOrg(options.org, options.state)
}
else if (options.user) {
    getRepoIssues()
}
else if (options.open && options.title) {
    console.log(`Open issue`)

    openIssue(options.title, options.body, ":owner", ":repo");
}
else {
    console.log('GET ISSUES OF THIS REPO');
    getThisRepoIssues();
}

