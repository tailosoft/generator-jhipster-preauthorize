/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const EntityServerGenerator = require('generator-jhipster/generators/entity-server');
const constants = require('generator-jhipster/generators/generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

module.exports = class extends EntityServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        if (!this.jhipsterContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint preauthorize')}`);
        }
    }

    get initializing() {
        /**
         * Any method beginning with _ can be reused from the superclass `EntityServerGenerator`
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
        const customPostPhaseSteps = {
            addPreAuthorizeAnnotationsAndImports() {
                const fileName = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/web/rest/${this.entityClass}Resource.java`;
                const entityNameUpperCase = _.snakeCase(this.name).toUpperCase();
                // this.fs.append(fileName, `// ${entityNameUpperCase}_DELETE`);
                let result = this.fs.read(fileName);
                // add imports
                result = result.replace(
                    'import org.springframework.http.ResponseEntity;',
                    `import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;`
                );
                result = result.replace(
                    `/**
 * REST controller`,
                    `import static ${this.packageName}.security.AuthoritiesConstants.*;

/**
 * REST controller`
                );
                // add preAuthorize annotations
                result = result.replace(/(@GetMapping.+)/g, `$1\n    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_READ + "')")`);
                result = result.replace(
                    /(@DeleteMapping.+)/g,
                    `$1\n    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_DELETE + "')")`
                );
                result = result.replace(
                    /(@PostMapping.+)/g,
                    `$1\n    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_CREATE + "')")`
                );
                result = result.replace(
                    /(@PutMapping.+)/g,
                    `$1\n    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_UPDATE + "')")`
                );
                this.fs.write(fileName, result);
            },

            addAuthoritiesConstant() {
                const fileName = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/security/AuthoritiesConstants.java`;
                let result = this.fs.read(fileName);
                const entityNameUpperCase = _.snakeCase(this.name).toUpperCase();
                const entityKebabCase = _.kebabCase(this.name);
                const treeInit = `
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_DELETE, new ArrayList<String>())`;
                if (result.indexOf('AUTHORITIES_TREE') === -1) {
                    result = result.replace(
                        `${this.packageName}.security;`,
                        `${this.packageName}.security;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;`
                    );
                    result = result.replace(
                        'private AuthoritiesConstants()',
                        `public static final Map<String, List<String>> AUTHORITIES_TREE = Stream.of(${treeInit}
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    private AuthoritiesConstants()`
                    );
                } else {
                    result = result.replace(
                        `)
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));`,
                        `),
${treeInit}
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));`
                    );
                }
                const authorities = `public static final String ${entityNameUpperCase}_CREATE = "${entityKebabCase}+create";
    public static final String ${entityNameUpperCase}_READ = "${entityKebabCase}+read";
    public static final String ${entityNameUpperCase}_UPDATE = "${entityKebabCase}+update";
    public static final String ${entityNameUpperCase}_DELETE = "${entityKebabCase}+delete";
`;
                result = result.replace(
                    'public static final Map<String, List<String>> AUTHORITIES_TREE = Stream.of(',
                    `${authorities}
    public static final Map<String, List<String>> AUTHORITIES_TREE = Stream.of(`
                );

                this.fs.write(fileName, result);
            }
        };
        // TODO check if another EntityServerGenerator Blueprint exist to know if we should return only our custom function or prepend it with super._writing();
        const otherBlueprintPresent = false;
        if (!otherBlueprintPresent) {
            return {
                ...super._writing(),
                ...customPostPhaseSteps
            };
        }
        return customPostPhaseSteps;
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
