const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const rimraf = require('rimraf');

const importJdl = require('generator-jhipster/cli/import-jdl');
const walker = require('./path-walker');

const noopFork = () => ({
    on(code, cb) {
        cb(0);
    }
});

const testDir = '/tmp/preauthorize';
describe('Subgenerator entity-server of preauthorize JHipster blueprint', () => {
    describe('Sample test', () => {
        before(done => {
            rimraf.sync(testDir);
            helpers
                .run('generator-jhipster/generators/app')
                .inDir(testDir, dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/ngx-blueprint'), dir);
                    importJdl(['jhipster.jh'], { skipInstall: true, noInsight: true, interactive: false, 'skip-git': false }, {}, noopFork);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'preauthorize',
                    skipChecks: true,
                    // skipClient: true,
                    withEntities: true
                })
                .withGenerators([
                    [
                        require('../generators/server/index.js'), // eslint-disable-line global-require
                        'jhipster-preauthorize:server',
                        path.join(__dirname, '../generators/server/index.js')
                    ],
                    [
                        require('../generators/entity-server/index.js'), // eslint-disable-line global-require
                        'jhipster-preauthorize:entity-server',
                        path.join(__dirname, '../generators/entity-server/index.js')
                    ]
                ])
                .on('end', done);
        });

        it('it works', () => {
            // eslint-disable-next-line no-console
            console.log(testDir);
            const basePath = path.join(__dirname, './samples/preauthorize');
            const filesToTest = [basePath];
            filesToTest.forEach(file =>
                walker.walk(file).forEach(f => {
                    assert.file(path.join(testDir, f.substring(basePath.length)));
                    assert.textEqual(
                        fs.readFileSync(path.join(testDir, f.substring(basePath.length)), 'UTF-8'),
                        fs.readFileSync(path.join(basePath, f.substring(basePath.length)), 'UTF-8')
                    );
                })
            );
            // making sure file that should be created or renamed to are created, and files that should be renamed from or deleted are deleted
            assert.file(path.join(testDir, 'src/main/java/com/mycompany/myapp/domain/Role.java'));
            assert.noFile(path.join(testDir, 'src/main/java/com/mycompany/myapp/domain/Authority.java'));
        });
    });
});
