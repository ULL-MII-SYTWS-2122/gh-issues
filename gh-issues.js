const { program } = require('commander');
const { version, description } = require('./package.json');
const {
    getUserLogin,
    getThisRepoIssues,
    getRepoIssues,
    getIssue,
    getAssignedIssuesByUser,
    getAssignedIssuesByOrg,
    openIssue,
    updateIssueState,
    updateIssue,
} = require('./issues');


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


// Choose what to execute

if (options.modify) {
    // title and body can be modified
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

    console.log(updateIssue(":owner", ":repo", options.modify, fields));
}
else if (options.repo) {
    if (options.user) {
        if (options.issue)
            console.log(getIssue(options.user, options.repo, options.issue));
        else 
            console.log(getRepoIssues(options.user, options.repo, options.state));
    }
    else if (options.organization) {
        if (options.issue)
            console.log(getIssue(options.organization, options.repo, options.issue));
        else 
            console.log(getRepoIssues(options.organization, options.repo, options.state));
    }
    else {
        // This option uses auth user
        if (options.issue)
            console.log(getIssue(getUserLogin(), options.repo, options.issue));
        else 
            console.log(getRepoIssues(getUserLogin(), options.repo, options.state));
    }
}
else if (options.assigned) {
    console.log(getAssignedIssuesByUser(options.state));
}
else if (options.organization) {
    console.log(getAssignedIssuesByOrg(options.organization, options.state));
}
else if (options.user) {
    console.log(getRepoIssues());
}
else if (options.open && options.title) {
    console.log(openIssue(options.title, options.body, ":owner", ":repo"));
}
else if (options.close) {
    console.log(updateIssueState(":owner", ":repo", options.close, "close"));
}
else if (options.reopen) {
    console.log(updateIssueState(":owner", ":repo", options.reopen, "open"));
}
else {
    if (options.issue)
        console.log(getIssue(":owner", ":repo", options.issue));
    else 
        console.log(getThisRepoIssues(options.state));
}
