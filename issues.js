const shell = require('shelljs');
const fs = require('fs');
const path = require('path');


// Check environment

/**
 * Show an error and exit the process.
 * @param {number} error code error 
 */
function showError(error) {
    if (error) {
      console.error(`Error!: ${error}`);
      process.exit(1); 
    }
}

/**
 * Check is current folder is under control version
 */
function isGitFolder() {
    let isGitFolder = shell.exec("git rev-parse --is-inside-work-tree", {silent: true});
    if (!isGitFolder || !fs.existsSync(".git")) {
        showError('The current folder must be the root of a git repo when running this command!');
    }
}


// Execute gh command

/**
 * Makes a GitHub API request and return the result or exit the process if it fails
 * @param  {...any} args arguments for the request 
 * @returns {string} response
 */
function gh(...args) {
    let command = `gh ${args.join('')}`;
    let result = shell.exec(command, { silent: true, stdio: "inherit" });     // silent option don't echo program output to console

    if (result.code != 0) {
        shell.echo(`Sorry! This issue or repository does not exits`);
        shell.exit(result.code);
    }

    return result.stdout.replace(/\s+$/,'');
}


// Access gh api data

/**
 * Ask GitHUb API who is logged
 * @returns {string} response
 */
function getUserLogin() {
    let command = "api 'user' --jq .login";
    return gh(command);
}

/**
 * Ask GitHUb API for the current repo issues
 * @param {string} state state of the issues the request is looking for
 * @returns {string} response
 */
function getThisRepoIssues(state) {
    isGitFolder();
    let command = `api repos/:owner/:repo/issues?state=${state} --template \"$(cat ${path.join(__dirname, 'templates', 'repo.gotemplate')})\"`;
    return gh(command);
}

/**
 * Ask GitHUb API for issues of an specific owner, repo and state
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} state 
 * @returns {string} response
 */
function getRepoIssues(owner, repo, state) {
    let command =`api /repos/${owner}/${repo}/issues?state=${state} --template \"$(cat ${path.join(__dirname, 'templates', 'repo.gotemplate')})\"`;
    return gh(command);
}

/**
 * Ask GitHUb API for an specific issue from its id of an specific owner and repo
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} number 
 * @returns {string} response
 */
function getIssue(owner, repo, number) {
    if (repo == ":repo")
        isGitFolder();
    let command =`api /repos/${owner}/${repo}/issues/${number} --template \"$(cat ${path.join(__dirname, 'templates', 'issue.gotemplate')})\"`;
    return gh(command);
}

/**
 * Get the assigned issues of a user
 * @param {string} state the states of the issues the request is asking for
 * @returns {string} response
 */
function getAssignedIssuesByUser(state) {
    let command =`api /issues?state=${state} --template \"$(cat ${path.join(__dirname, 'templates', 'assignee.gotemplate')})\"`;
    return gh(command);
}

/**
 * Get the assigned issues in an organization
 * @param {string} org 
 * @param {string} state 
 * @returns {string} response
 */
function getAssignedIssuesByOrg(org, state) {
    let command =`api /orgs/${org}/issues?state=${state} --template \"$(cat ${path.join(__dirname, 'templates', 'assignee.gotemplate')})\"`;
    return gh(command);
}

/**
 * Open a new issue with some params
 * @param {string} title 
 * @param {string} body 
 * @param {string} owner 
 * @param {string*} repo 
 * @returns {string} successful message
 */
function openIssue(title, body, owner, repo) {
    isGitFolder();
    gh(`api -X POST /repos/${owner}/${repo}/issues -f title="${title}" -f body="${body}"`);
    return `A new issue has been created`;
}

/**
 * Update an issue state from an id
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} number 
 * @param {string} state 
 * @returns {string} response
 */
function updateIssueState(owner, repo, number, state) {
    isGitFolder();
    gh(`api -X PATCH /repos/${owner}/${repo}/issues/${number} -f state=${state}`);
    return `Issue ${number} is now ${state}`;
}

/**
 * Update an issue fields from an id 
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} number 
 * @param {string} fields 
 * @returns {string} response
 */
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