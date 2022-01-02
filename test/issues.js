const should = require('chai').should();
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
} = require('../issues');


describe('#current_repo_issues', () => {
    it('get this repo has not open issues', () => {
        getThisRepoIssues("open").trim().should.equals("");
    });
    it('get this repo closed issues exists', () => {
        should.exist(getThisRepoIssues("closed"));
    });
    it('get this repo has some closed issues', () => {
        getThisRepoIssues("closed").split('\n').length.should.at.least(8);
    });
});

describe('#get_specific_issue', () => {
    let issueJSON = new Map();
    before( () => {
        const issueArr = getIssue("PaulaExposito", "SYTW_Cliente", 1).split('\n');
        issueArr.forEach((line) => issueJSON[line.split(":")[0]] = line.split(":")[1]);
    });
    it('an especific issue of external repo', () => {
        should.exist(getIssue("PaulaExposito", "SYTW_Cliente", 1));
    });
    it('checking issue title', () => {
        issueJSON['Title'].should.equals(' Issue SYTW_Cliente');
    });
});