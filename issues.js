const shell = require('shelljs');
const fs = require('fs');


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

function isGitFolder() {
    let isGitFolder = shell.exec("git rev-parse --is-inside-work-tree", {silent: true});
    if (!isGitFolder || !fs.existsSync(".git")) {
        showError('The current folder must be the root of a git repo when running this command!');
    }
}


// Execute gh command

function gh(...args) {
    let command = `gh ${args.join('')}`;
    let result = shell.exec(command, { silent: true, stdio: "inherit" });     // silent option don't echo program output to console

    if (result.code != 0) {
        // shell.echo(`Error: command ${command} failed: invalid options \n${result.stderr}`);
        shell.echo(`Sorry! This issue or repository does not exits`);
        shell.exit(result.code);
    }

    return result.stdout.replace(/\s+$/,'');
}


// Access gh api data

function getUserLogin() {
    let command = "api 'user' --jq .login";
    return gh(command);
}

function getThisRepoIssues(state) {
    isGitFolder();
    // let command = "api repos/:owner/:repo/issues | jq '.[] | .number,.title,.body,.user.login,.assignee.login'";
    let command = `api repos/:owner/:repo/issues?state=${state} --template \"$(cat ${__dirname}/templates/repo.gotemplate)\"`;
    return gh(command);
}

function getRepoIssues(owner, repo, state) {
    let command =`api /repos/${owner}/${repo}/issues?state=${state} --template \"$(cat ${__dirname}/templates/repo.gotemplate)\"`;
    return gh(command);
}

function getIssue(owner, repo, number) {
    if (repo == ":repo")
        isGitFolder();
    let command =`api /repos/${owner}/${repo}/issues/${number} --template \"$(cat ${__dirname}/templates/issue.gotemplate)\"`;
    return gh(command);
}

function getAssignedIssuesByUser(state) {
    let command =`api /issues?state=${state} --template \"$(cat ${__dirname}/templates/assignee.gotemplate)\"`;
    return gh(command);
}

function getAssignedIssuesByOrg(org, state) {
    let command =`api /orgs/${org}/issues?state=${state} --template \"$(cat ${__dirname}/templates/assignee.gotemplate)\"`;
    return gh(command);
}

function openIssue(title, body, owner, repo) {
    isGitFolder();
    gh(`api -X POST /repos/${owner}/${repo}/issues -f title="${title}" -f body="${body}"`);
    return `A new issue has been created`;
}

function updateIssueState(owner, repo, number, state) {
    isGitFolder();
    gh(`api -X PATCH /repos/${owner}/${repo}/issues/${number} -f state=${state}`);
    return `Issue ${number} is now ${state}`;
}

function updateIssue(owner, repo, number, fields) {
    isGitFolder();
    gh(`api -X PATCH /repos/${owner}/${repo}/issues/${number} ${fields}`);
    return `Issue ${number} updated`;
}


module.exports = {
    getUserLogin,
    getThisRepoIssues,
    getRepoIssues,
    getIssue,
    getAssignedIssuesByUser,
    getAssignedIssuesByOrg,
    openIssue,
    updateIssueState,
    updateIssue,
}