/* eslint-disable consistent-return */
const chalk = require('chalk');
const ClientGenerator = require('generator-jhipster/generators/client');
const constants = require('generator-jhipster/generators/generator-constants');

const ANGULAR_DIR = constants.ANGULAR_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

module.exports = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint preauthorize')}`);
        }

        this.configOptions = jhContext.configOptions || {};

        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupClientOptions(this, jhContext);
    }

    get initializing() {
        /**
         * Any method beginning with _ can be reused from the superclass `ClientGenerator`
         *
         * There are multiple ways to customize a phase from JHipster.
         *
         * 1. Let JHipster handle a phase, blueprint doesnt override anything.
         * ```
         *      return super._initializing();
         * ```
         *
         * 2. Override the entire phase, this is when the blueprint takes control of a phase
         * ```
         *      return {
         *          myCustomInitPhaseStep() {
         *              // Do all your stuff here
         *          },
         *          myAnotherCustomInitPhaseStep(){
         *              // Do all your stuff here
         *          }
         *      };
         * ```
         *
         * 3. Partially override a phase, this is when the blueprint gets the phase from JHipster and customizes it.
         * ```
         *      const phaseFromJHipster = super._initializing();
         *      const myCustomPhaseSteps = {
         *          displayLogo() {
         *              // override the displayLogo method from the _initializing phase of JHipster
         *          },
         *          myCustomInitPhaseStep() {
         *              // Do all your stuff here
         *          },
         *      }
         *      return Object.assign(phaseFromJHipster, myCustomPhaseSteps);
         * ```
         */
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._initializing();
    }

    get prompting() {
        // The prompting phase is being overriden so that we can ask our own questions
        // return {
        //     askForClient: prompts.askForClient,
        //     askForClientSideOpts: prompts.askForClientSideOpts,

        //     setSharedConfigOptions() {
        //         this.configOptions.lastQuestion = this.currentQuestion;
        //         this.configOptions.totalQuestions = this.totalQuestions;
        //         this.configOptions.clientFramework = this.clientFramework;
        //         this.configOptions.useSass = this.useSass;
        //     }
        // };
        // If the prompts need to be overridden then use the code commented out above instead

        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        const customPhaseSteps = {
            preauthorizeClientReplaceAuthorityWithRole() {
                const filesNames = [
                    `${ANGULAR_DIR}admin/user-management/user-management-detail.component.html`,
                    `${ANGULAR_DIR}admin/user-management/user-management-update.component.html`,
                    `${ANGULAR_DIR}admin/user-management/user-management-update.component.ts`,
                    `${ANGULAR_DIR}admin/user-management/user-management.component.html`,
                    `${ANGULAR_DIR}core/user/user.service.ts`,
                    `${CLIENT_TEST_SRC_DIR}spec/app/admin/user-management/user-management-update.component.spec.ts`,
                    `${CLIENT_TEST_SRC_DIR}spec/app/core/user/user.service.spec.ts`,
                    `${CLIENT_TEST_SRC_DIR}spec/app/admin/user-management/user-management-detail.component.spec.ts`
                ];

                filesNames.forEach(fileName => {
                    if (this.fs.exists(fileName)) {
                        const result = this._replaceAuthorityByRole(this.fs.read(fileName));
                        this.fs.write(fileName, result);
                    }
                });

                /* ****** user.model.ts ****** */
                const userModelFileName = `${ANGULAR_DIR}core/user/user.model.ts`;
                let resultUserModel = this.fs.read(userModelFileName);
                resultUserModel = resultUserModel.replace(
                    'authorities?: string[];',
                    `roles?: string[];
  authorities?: string[];`
                );
                resultUserModel = resultUserModel.replace(
                    'public authorities?: string[],',
                    `public roles?: string[],
    public authorities?: string[],`
                );
                this.fs.write(userModelFileName, resultUserModel);
            }
        };
        return customPhaseSteps;
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }

    _replaceAuthorityByRole(data) {
        data = data.replace(/Authority/g, 'Role');
        data = data.replace(/authority/g, 'role');
        data = data.replace(/Authorities/g, 'Roles');
        data = data.replace(/authorities/g, 'roles');
        data = data.replace(/Role.USER/g, 'Authority.USER');
        data = data.replace(/Role.ADMIN/g, 'Authority.ADMIN');
        data = data.replace(
            "import { Role } from 'app/shared/constants/role.constants';",
            "import { Authority } from 'app/shared/constants/authority.constants';"
        );
        // add fields to User constructor in tests
        data = data.replace("[Authority.USER], 'admin'", "[Authority.USER], undefined, 'admin'");
        return data;
    }
};
