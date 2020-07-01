# generator-jhipster-preauthorize
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> JHipster blueprint, Adds PreAuthorize to each end point for each entity

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint, that is meant to be used in a JHipster application.

This Blueprint allows to use fine grained permissions foreach generated endpoint.

To be able to use fine grained permissions without assigning each permission/authority to a user we:
1. Replace the "Old" Authority Class with a new Role Class
2. Now that users have roles, we link their roles to the Authorities, using a new Entity RoleAuthority

## Technical choices
We now have a relationship UserRole and manage it through the UserResource endpoint (the same way Jhipster does by default with UserAuthority).
In the case of AccountResource, and only in that case, we would like to return the users (Fine Grained) Authorities with its roles, for an easier code we added back the field authorities to the UserDTO (only), and it is always empty except in that case.
(If you have a better proposition please create an Issue and PR).

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

# Installation

## With NPM

To install this blueprint:

```bash
npm install -g generator-jhipster-preauthorize
```

To update this blueprint:

```bash
npm update -g generator-jhipster-preauthorize
```

## With Yarn

To install this blueprint:

```bash
yarn global add generator-jhipster-preauthorize
```

To update this blueprint:

```bash
yarn global upgrade generator-jhipster-preauthorize
```

# Usage

To use this blueprint, run the below command

```bash
jhipster --blueprint preauthorize
```


## Running local Blueprint version for development

During development of blueprint, please note the below steps. They are very important.

1. Link your blueprint globally 

Note: If you do not want to link the blueprint(step 3) to each project being created, use NPM instead of Yarn as yeoman doesn't seem to fetch globally linked Yarn modules. On the other hand, this means you have to use NPM in all the below steps as well.

```bash
cd preauthorize
npm link
```

2. Link a development version of JHipster to your blueprint (optional: required only if you want to use a non-released JHipster version, like the master branch or your own custom fork)

You could also use Yarn for this if you prefer

```bash
cd generator-jhipster
npm link

cd preauthorize
npm link generator-jhipster
```

3. Create a new folder for the app to be generated and link JHipster and your blueprint there

```bash
mkdir my-app && cd my-app

npm link generator-jhipster-preauthorize
npm link generator-jhipster (Optional: Needed only if you are using a non-released JHipster version)

jhipster -d --blueprint preauthorize

```

#Contributing and debugging
When coding the generator, sometimes break points could help a lot, but our tests use import-jdl that uses muti-threading and make them hard to debug with breakpoints.
Please contact as if you really need this.

Our internal workaround is to add the following spec file in /test/temp/server-debugger-helper.spec.js and run it with a debugger. It is much easier.
```
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('Subgenerator server of preauthorize JHipster blueprint', () => {
    describe('Sample test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/server')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'preauthorize',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../../generators/server'), // eslint-disable-line global-require
                        'jhipster-preauthorize:server',
                        path.join(__dirname, '../generators/server/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'session',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr', 'de'],
                    buildTool: 'maven',
                    rememberMeKey: '2bb60a80889aa6e6767e9ccd8714982681152aa5'
                })
                .on('end', done);
        });

        it('it works', () => {
            assert.textEqual('This should fail!', 'This should never be comited or fixed!');
        });
    });
});

```

You can have a similar one for testing the other generators (entity-server...), check the branch generator-upstream for their content

# License

Apache-2.0 © [Youssef El Houti](https://elhouti.com)


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-preauthorize.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-preauthorize
[travis-image]: https://travis-ci.org/elhoutico/generator-jhipster-preauthorize.svg?branch=master
[travis-url]: https://travis-ci.org/elhoutico/generator-jhipster-preauthorize
[daviddm-image]: https://david-dm.org/elhoutico/generator-jhipster-preauthorize.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/elhoutico/generator-jhipster-preauthorize
