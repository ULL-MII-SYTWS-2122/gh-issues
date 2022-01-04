# gh-issues

Extension that emulates some basic operations to get, create and modify issues.


## Documentation

[gh-issues docs](https://ull-mii-sytws-2122.github.io/gh-issues/)


## Installation

```
gh extension install ULL-MII-SYTWS-2122/gh-issues

npm install @alu0101106335/gh-issues
```

## Usage

```
Usage: gh issues [options]

gh extension for issues

Options:
  -V, --version                output the version number
  -n, --repo <name>            specify repo name
  -org, --organization <name>  specify organization name
  -s, --state <state>          specify issue state [open|closed|all], default state is open (default: "open")
  -a, --assigned               get issues assigned to user (default: false)
  -i, --issue <number>         specify an issue
  -o, --open                   open an issue
  -r, --reopen <number>        reopen an issue
  -c, --close <number>         close an issue
  -t, --title <title>          set title
  -b, --body <body>            set body (default: "")
  -m, --modify <number>        modify issue data
  -h, --help                   display help for command

    * Option '-a' do not accept other options
    * Options '-o', '-r', '-c' are only available for current repository
```

## Tests

```
npm run test
```

## Examples

Extension without options will get current repository issues:

```bash
$ gh issues
5 - other title (created 13 hours ago)
4 - i3 (created 14 hours ago)
3 - i1 (created 14 hours ago)
2 - Issue 2 (created 17 hours ago)
1 - Issue 1 (created 17 hours ago)
```

Get user repo issues

```
$ gh issues -n SYTW_Cliente
1 - Issue SYTW_Cliente (created 16 hours ago)
```

Get repo issues in an organization

```
gh issues -org ULL-MII-SYTWS-2122 -n gh-cli-PaulaExposito
1 - Prueba (created 7 days ago)
```

Get assigned issues

```
$ gh issues -a
=============================================================

1
Title: Issue SYTW_Cliente
Body: other repo
Assignee: PaulaExposito  
Repository: PaulaExposito/SYTW_Cliente

=============================================================

2
Title: Issue 2
Body: comment 2
@PaulaExposito 

Assignee: crguezl PaulaExposito  
Repository: ULL-MII-SYTWS-2122/gh-issues

=============================================================
```

Get issues assigned in an organization

```
$ gh issues -org ULL-MII-SYTWS-2122
=============================================================
2
Title: Issue 2
Body: comment 2
@PaulaExposito 

Assignee: PaulaExposito 
=============================================================
```

Get one issue with details
```
$ gh issues --issue 2
Title: Issue 2
Number of issue: 2
State: open

Body: comment 2
@PaulaExposito 


Assignees: PaulaExposito 

Issue created by PaulaExposito 18 hours ago
https://github.com/ULL-MII-SYTWS-2122/gh-issues/issues/2
```

Create new issue

```
$ gh issues --open -t "new issue" -b "another one"
A new issue has been created
```

Close issue

```
$ gh issues --close 7 
Issue 7 is now close
```

Reopen issue

```
$ gh issues --reopen 7 
Issue 7 is now open
```

Change issue data

```
 $ gh issues --modify 6 --title "new title" --body "Hello"
Issue 6 updated
```

Filter issues by state:

```
$ gh issues --state closed -n TFG-TrackYourTrails
11 - Ubicación (created 4 months ago)
10 - Resumen y conclusiones (created 4 months ago)
9 - Vue app (created 5 months ago)
8 - Integración de mapas (created 5 months ago)
7 - Postman coverage (created 5 months ago)
6 - Codecov Setup (created 6 months ago)
5 - Quasar setup (created 6 months ago)
4 - API (created 6 months ago)
3 - Docker (created 6 months ago)
2 - Setup de remote en organizacion ULL-TFGyMs-vblanco y submodule para memoria (created 6 months ago)
1 - Create main.yml (created 7 months ago)
```


## Release History

* 0.1.0 - Requests to gh
* 0.2.0 - Using JS Modules
* 1.0.0 - First release
