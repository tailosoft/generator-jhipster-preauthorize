import chalk from 'chalk';
import _ from 'lodash';
import EntityServerGenerator from 'generator-jhipster/generators/entity-server';

import { SERVER_MAIN_SRC_DIR } from './files.js'

export default class extends EntityServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (this.options.help) return;

    if (!this.options.jhipsterContext) {
      throw new Error(
        `This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints preauthorize')}`
      );
    }

    this.sbsBlueprint = true;
  }

  get [EntityServerGenerator.WRITING]() {
    return {
      addPreAuthorizeAnnotationsAndImports() {
        const { entityClass, packageName } = this.entity;
        const entityNameUpperCase = _.snakeCase(this.entity.name).toUpperCase();
        const fileName = `${SERVER_MAIN_SRC_DIR}${this.jhipsterConfig.packageFolder}/web/rest/${entityClass}Resource.java`;
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
          `import static ${packageName}.security.AuthoritiesConstants.*;

/**
 * REST controller`
        );
        // add preAuthorize annotations
        result = result.replace(
          /(@GetMapping.+)/g,
          `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_READ + "')")`
        );
        result = result.replace(
          /(@DeleteMapping.+)/g,
          `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_DELETE + "')")`
        );
        result = result.replace(
          /(@PostMapping.+)/g,
          `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_CREATE + "')")`
        );
        result = result.replace(
          /(@PutMapping.+)/g,
          `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_UPDATE + "')")`
        );
        result = result.replace(
          /(@PatchMapping.+)/g,
          `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_UPDATE + "')")`
        );
        this.fs.write(fileName, result);

        const fileNameIT = `src/test/java/${this.jhipsterConfig.packageFolder}/web/rest/${entityClass}ResourceIT.java`;
        let resultIT = this.fs.read(fileNameIT);
        resultIT = resultIT.replace(
          `@WithMockUser
public class ${entityClass}ResourceIT {`,
          `public class ${entityClass}ResourceIT {`
        );
        resultIT = resultIT.replace(
          'import static org.assertj.core.api.Assertions.assertThat;',
          `import static ${packageName}.security.AuthoritiesConstants.*;
import static org.assertj.core.api.Assertions.assertThat;`
        );
        resultIT = resultIT.replace(
          /(void create.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_CREATE})
    $1`
        );
        resultIT = resultIT.replace(
          /(void check.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_CREATE})
    $1`
        );
        resultIT = resultIT.replace(
          /(void get.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_READ})
    $1`
        );
        resultIT = resultIT.replace(
          /(void delete.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_DELETE})
    $1`
        );
        resultIT = resultIT.replace(
          /(void put.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_UPDATE})
    $1`
        );
        resultIT = resultIT.replace(
          /(void partialUpdate.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_UPDATE})
    $1`
        );
        resultIT = resultIT.replace(
          /(void fullUpdate.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_UPDATE})
    $1`
        );
        resultIT = resultIT.replace(
          /(void patch.+)/g,
          `@WithMockUser(authorities = {${entityNameUpperCase}_UPDATE})
    $1`
        );
        this.fs.write(fileNameIT, resultIT);
      },

      addAuthoritiesConstant() {
        const fileName = `${SERVER_MAIN_SRC_DIR}${this.jhipsterConfig.packageFolder}/security/AuthoritiesConstants.java`;
        let result = this.fs.read(fileName);
        const entityNameUpperCase = _.snakeCase(this.entity.name).toUpperCase();
        const entityKebabCase = _.kebabCase(this.entity.name);

        // Add authorities
        const authorities = `public static final String ${entityNameUpperCase}_CREATE = "${entityKebabCase}.create";
    public static final String ${entityNameUpperCase}_READ = "${entityKebabCase}.read";
    public static final String ${entityNameUpperCase}_UPDATE = "${entityKebabCase}.update";
    public static final String ${entityNameUpperCase}_DELETE = "${entityKebabCase}.delete";
`;
        result = result.replace(
          '/* jhipster-preauthorize-needle-add-entity-authorities */',
          `${authorities}

    /* jhipster-preauthorize-needle-add-entity-authorities */`
        );

        // Add authorities to tree
        const createUpdateRequiredAuthorities = this.entity.relationships.filter(r => r.ownerSide && r.otherEntityName !== 'user')
          .map(r => _.snakeCase(r.otherEntityName).toUpperCase() + '_READ').join(', ')
        const createUpdateList = createUpdateRequiredAuthorities.length ? `Arrays.asList(${createUpdateRequiredAuthorities})` : 'new ArrayList<String>()';
        const treeInit = `
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_CREATE, ${createUpdateList}),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_UPDATE, ${createUpdateList}),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_DELETE, new ArrayList<String>())`;
        result = result.replace(
          `
        /* jhipster-preauthorize-needle-add-to-authorities-tree */`,
          `${result.includes('new AbstractMap.SimpleEntry<>') ? ',\n' : ''}
        ${treeInit}
        /* jhipster-preauthorize-needle-add-to-authorities-tree */`
        );

        this.fs.write(fileName, result);
      }
    };
  }
}
