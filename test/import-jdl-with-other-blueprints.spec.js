const path = require('path');
const fs = require('fs');
const assert = require('yeoman-assert');
const execSync = require('child_process').execSync;

const walker = require('./path-walker');

const testDir = '/tmp/preauthorize-with-other-blueprints';
describe('import jdl of preauthorize and other blueprints JHipster blueprint', () => {
    describe('Sample test', () => {
        before(() => {
            execSync('npm link', { stdio: 'inherit' });
            execSync(`rm -Rf ${testDir} && cp -R ./test/templates/ngx-blueprint/ ${testDir};`, { stdio: 'inherit' });
            execSync('npm link generator-jhipster-preauthorize;', { cwd: testDir, stdio: 'inherit' });
            execSync('jhipster import-jdl --blueprints primeng-blueprint,composite-key-server,preauthorize jhipster.jh --skip-install', {
                cwd: testDir,
                stdio: 'inherit'
            });
        });

        it('it works', () => {
            // eslint-disable-next-line no-console
            console.log(testDir);
            const basePath = path.join(__dirname, './samples/preauthorize-with-other-blueprints');
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
