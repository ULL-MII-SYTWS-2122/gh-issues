const { program } = require('commander');
const { version, description } = require('./package.json');
const fs = require('fs');
const shell = require('shelljs');

const goTemplates = ["repo", "issue", "assignee"];
let templates = {};

// ( () => {
//     goTemplates.forEach(temp => {
//         // await fs.readFile(`templates/${temp}.gotemplate`, (err, data) => {
//         //     templates[temp] = data.toString();
//         //     console.log(templates[temp]);
//         // });
//         templates[temp] = fs.readFileSync(`templates/${temp}.gotemplate`).toString();
//         // console.log(templates[temp]);
//     });
// }) ();


// Command line options

program
    .name("gh issues")
    .version(version)
    .description(description)
    .usage('[options]')
    .option('-n, --repo <name>', 'specify repo name')
    .option('-org, --organization <name>', 'specify organization name')
    .option('-s, --state <state>', 'specify issue state [open|closed|all], default state is open', "open")
    .option('-a, --assigned', 'get issues assigned to user', false)
    .option('-i, --issue <number>', 'specify an issue')
    .option('-o, --open', 'open an issue')
    .option('-r, --reopen <number>', 'reopen an issue')
    .option('-c, --close <number>', 'close an issue')
    .option('-t, --title <title>', 'set title')
    .option('-b, --body <body>', 'set body', '')
    .option('-m, --modify <number>', 'modify issue data');

program.addHelpText('after', `
    * Option '-a' do not accept other options
    * Options '-o', '-r', '-c' are only available for current repository
`
);


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
        shell.echo(`Error: command ${command} failed: invalid options \n${result.stderr}`);
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
    // let command = "api repos/:owner/:repo/issues | jq '.[] | .number,.title,.body,.user.login,.assignee.login'";
    let command = `api repos/:owner/:repo/issues?state=${state} --template \"$(cat repo.gotemplate)\"`;
    // let command = `api repos/:owner/:repo/issues?state=${state} --template \"${templates.repo}\"`;
    console.log(gh(command));
}

function getRepoIssues(owner, repo, state) {
    let command =`api /repos/${owner}/${repo}/issues?state=${state} --template \"$(cat repo.gotemplate)\"`;
    console.log(gh(command));
}

function getIssue(owner, repo, number) {
    let command =`api /repos/${owner}/${repo}/issues/${number} --template \"$(cat issue.gotemplate)\"`;
    console.log(gh(command));
}

function getAssignedIssuesByUser(state) {
    let command =`api /issues?state=${state} --template \"$(cat assignee.gotemplate)\"`;
    console.log(gh(command));
}

function getAssignedIssuesByOrg(org, state) {
    let command =`api /orgs/${org}/issues?state=${state} --template \"$(cat assignee.gotemplate)\"`;
    console.log(gh(command));
}

function openIssue(title, body, owner, repo) {
    gh(`api -X POST /repos/${owner}/${repo}/issues -f title="${title}" -f body="${body}"`);
    console.log(`A new issue has been created`);
}

function updateIssueState(owner, repo, number, state) {
    gh(`api -X PATCH /repos/${owner}/${repo}/issues/${number} -f state=${state}`);
    console.log(`Issue ${number} is now ${state}`);
}

function updateIssue(owner, repo, number, fields) {
    gh(`api -X PATCH /repos/${owner}/${repo}/issues/${number} ${fields}`);
    console.log(`Issue ${number} updated`);
}


// Choose what to execute

if (options.modify) {
    // title, body, state can be modified
    let modifiers = [
        { "title": options.title },
        { "body": options.body },
    ]

    let fields = "";

    modifiers.forEach(element => {
        if (element[Object.keys(element)[0]]) {
            fields += `-f ${Object.keys(element)[0]}="${element[Object.keys(element)[0]]}" `;
        }
    });

    updateIssue(":owner", ":repo", options.modify, fields);
}
else if (options.repo) {
    if (options.user) {
        if (options.issue)
            getIssue(options.user, options.repo, options.issue);
        else 
            getRepoIssues(options.user, options.repo, options.state);
    }
    else if (options.organization) {
        if (options.issue)
            getIssue(options.organization, options.repo, options.issue);
        else 
            getRepoIssues(options.organization, options.repo, options.state);
    }
    else {
        // This option uses auth user
        if (options.issue)
            getIssue(getUserLogin(), options.repo, options.issue);
        else 
            getRepoIssues(getUserLogin(), options.repo, options.state);
    }
}
else if (options.assigned) {
    getAssignedIssuesByUser(options.state)
}
else if (options.organization) {
    getAssignedIssuesByOrg(options.organization, options.state)
}
else if (options.user) {
    getRepoIssues()
}
else if (options.open && options.title) {
    openIssue(options.title, options.body, ":owner", ":repo");
}
else if (options.close) {
    updateIssueState(":owner", ":repo", options.close, "close");
}
else if (options.reopen) {
    updateIssueState(":owner", ":repo", options.reopen, "open");
}
else {
    if (options.issue)
        getIssue(":owner", ":repo", options.issue);
    else 
        getThisRepoIssues(options.state);
}
