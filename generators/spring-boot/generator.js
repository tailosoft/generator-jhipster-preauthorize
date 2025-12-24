import { kebabCase, snakeCase } from 'lodash-es';
import SpringBootGenerator from 'generator-jhipster/generators/spring-boot';
import { JAVA_MAIN_SOURCES_DIR as SERVER_MAIN_SRC_DIR, TEMPLATES_TEST_SOURCES_DIR as SERVER_TEST_SRC_DIR } from "generator-jhipster";
import { writeRolePermissionServerFiles } from "./files.js";
import { ensureReplace, replaceAuthorityInFiles } from "../utils.js";

export default class extends SpringBootGenerator {
  constructor(args, opts, features) {
    super(args, opts, {
      ...features,
      sbsBlueprint: true  // Side-by-side mode - doesn't override, just adds
    });
  }

  async beforeQueue() {
    await super.beforeQueue();
  }


  get [SpringBootGenerator.WRITING]() {
    return {
      changeAuthorityToRole({ application }) {
        const { packageName, packageFolder } = application;

        // Files that exist early in the generation process (not dependent on User entity)
        const earlyFiles = [
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/security/DomainUserDetailsService.java`,
          `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/AccountResourceIT.java`,
        ];
        replaceAuthorityInFiles(this, earlyFiles);

        /* ************ AuthoritiesConstants.java ************ */
        const fileNameAuthoritiesConstants = `${SERVER_MAIN_SRC_DIR}${packageFolder}/security/AuthoritiesConstants.java`;
        let resultAuthoritiesConstants = this.fs.read(fileNameAuthoritiesConstants);
        if (!resultAuthoritiesConstants.includes('public static final String ROLE_PREFIX = "ROLE_";')) {
          resultAuthoritiesConstants = ensureReplace(
            resultAuthoritiesConstants,
            `${packageName}.security;`,
            `${packageName}.security;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;`,
            fileNameAuthoritiesConstants
          );
          resultAuthoritiesConstants = ensureReplace(
            resultAuthoritiesConstants,
            'private AuthoritiesConstants()',
            `public static final String ROLE_PREFIX = "ROLE_";
    public static final String ROLE_REGEX = "ROLE_[A-Z_]+";

    /* jhipster-preauthorize-needle-add-entity-authorities */

    public static final Map<String, List<String>> PERMISSION_TREE = Stream.of(
        /* jhipster-preauthorize-needle-add-to-authorities-tree */
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    private AuthoritiesConstants()`,
            fileNameAuthoritiesConstants
          );
          this.fs.write(fileNameAuthoritiesConstants, resultAuthoritiesConstants);
        }

        /* ************ AccountResource.java ************ */
        const fileNameAccountResource = `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/AccountResource.java`;
        let resultAccountResource = this.fs.read(fileNameAccountResource);
        if (!resultAccountResource.includes("getUserWithRoles()")) {
          resultAccountResource = ensureReplace(
            resultAccountResource,
            `@GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService.getUserWithAuthorities()
            .map(AdminUserDTO::new)
            .orElseThrow(() -> new AccountResourceException("User could not be found"));`,
            `@GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService.getUserWithRoles()
            .map(AdminUserDTO::new)
            .map(userDto -> {
                userDto.setAuthorities(SecurityUtils.getCurrentAuthorities());
                return userDto;
            })
            .orElseThrow(() -> new AccountResourceException("User could not be found"));`,
            fileNameAccountResource
          );
          this.fs.write(fileNameAccountResource, resultAccountResource);
        }

        /* ************ SecurityUtils.java ************ */
        const securityUtilsFileName = `${SERVER_MAIN_SRC_DIR}${packageFolder}/security/SecurityUtils.java`;
        let resultSecurityUtils = this.fs.read(securityUtilsFileName);
        if (!resultSecurityUtils.includes('getCurrentAuthorities')) {
          resultSecurityUtils = ensureReplace(
            resultSecurityUtils,
            `import java.util.stream.Stream;
import java.util.Optional;`,
            `import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;`,
            securityUtilsFileName
          );
          resultSecurityUtils = ensureReplace(
            resultSecurityUtils,
            `}

}`,
            `}

    public static Set<String> getCurrentAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getAuthorities(authentication).collect(Collectors.toSet());
    }
}`,
            securityUtilsFileName
          );
          this.fs.write(securityUtilsFileName, resultSecurityUtils);
        }

        // force ROLE_ prefix in application roles, to avoid privilege escalation by assigning keycloak roles like realm admin...

        /* ************ Role.java replace back ************ */
//         const roleFileName = `${SERVER_MAIN_SRC_DIR}${packageFolder}/domain/Role.java`;
//         let resultRole = this.fs.read(roleFileName);
//         resultRole = ensureReplace(
//           resultRole,
//           'private String name;',
//           `@Pattern(regexp = AuthoritiesConstants.ROLE_REGEX)
//   private String name;`,
//           roleFileName
//         );
//         resultRole = ensureReplace(
//           resultRole,
//           'import java.io.Serializable;',
//           `import ${packageName}.security.AuthoritiesConstants;
// import java.io.Serializable;`,
//           roleFileName
//         );
//         this.fs.write(roleFileName, resultRole);

        /* ************ AccountResourceIT.java  replace back ************ */
        const accountResourceITFileName = `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/AccountResourceIT.java`;
        let resultAccountResourceIT = this.fs.read(accountResourceITFileName);
        if (!resultAccountResourceIT.includes('user.setRoles(roles);')) {
          resultAccountResourceIT = ensureReplace(resultAccountResourceIT, /getRoles/g, 'getAuthorities', accountResourceITFileName);
          resultAccountResourceIT = ensureReplace(resultAccountResourceIT, /setRoles/g, 'setAuthorities', accountResourceITFileName);
          resultAccountResourceIT = ensureReplace(resultAccountResourceIT, 'user.setAuthorities(roles);', 'user.setRoles(roles);', accountResourceITFileName);
          resultAccountResourceIT = ensureReplace(
            resultAccountResourceIT,
            'assertThat(userDup.get().getAuthorities()).hasSize(1)',
            'assertThat(userDup.get().getRoles()).hasSize(1)',
            accountResourceITFileName
          );
          resultAccountResourceIT = ensureReplace(
            resultAccountResourceIT,
            'assertThat(updatedUser.getAuthorities()).isEmpty();',
            'assertThat(updatedUser.getRoles()).isEmpty();',
            accountResourceITFileName
          );
          this.fs.write(accountResourceITFileName, resultAccountResourceIT);
        }
      },
    };
  }

  get [SpringBootGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async addPreAuthorizeAnnotationsAndImports({ entities, application }) {
        const { packageName, packageFolder } = application;
        for (const entity of entities) {
          const { entityClass } = entity;
          if (entity.builtInUser) {
            // Replace Authority with Role in User-related files (after User entity is created)
            const userFiles = [
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/domain/User.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/PublicUserResource.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/UserResource.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/repository/UserRepository.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/mapper/UserMapper.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/UserService.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/dto/AdminUserDTO.java`, // no replacing this on purpose
              `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/UserResourceIT.java`,
              `${SERVER_TEST_SRC_DIR}${packageFolder}/service/mapper/UserMapperTest.java`
            ];
            replaceAuthorityInFiles(this, userFiles);

            /* ************ UserService.java ************ */
            // fix back user service for OAuth2
            if (application.authenticationTypeOauth2) {
              const fileNameUserService = `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/UserService.java`;
              let resultUserService = this.fs.read(fileNameUserService);
              resultUserService = ensureReplace(
                resultUserService,
                /authToken[\n\s]*.getRoles\(\)/,
                `authToken.getAuthorities()`,
                fileNameUserService
              );
              resultUserService = ensureReplace(
                resultUserService,
                `GrantedAuthority::getRole`,
                `GrantedAuthority::getAuthority`,
                fileNameUserService
              );
              this.fs.write(fileNameUserService, resultUserService);
            }

            /* ************ UserResourceIT.java replace back ************ */
            const userResourceITFileName = `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/UserResourceIT.java`;
            let resultUserResourceIT = this.fs.read(userResourceITFileName);
            resultUserResourceIT = ensureReplace(
              resultUserResourceIT,
              '@WithMockUser(roles = AuthoritiesConstants.ADMIN)',
              '@WithMockUser(authorities = AuthoritiesConstants.ADMIN)',
              userResourceITFileName
            );
            this.fs.write(userResourceITFileName, resultUserResourceIT);

            /* ************ AdminUserDTO.java replace back ************ */
            const fileNameUserDTO = `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/dto/AdminUserDTO.java`;
            // eslint-disable-next-line no-unused-vars
            let resultUserDTO = this.fs.read(fileNameUserDTO);
            resultUserDTO = resultUserDTO.replace(
              'private Set<String> roles;',
              `private Set<String> roles;

    private Set<String> authorities;`
            );
            resultUserDTO = resultUserDTO.replace(
              `public void setRoles(Set<String> roles) {
        this.roles = roles;
    }`,
              `public void setRoles(Set<String> roles) {
        this.roles = roles;
    };

    public Set<String> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<String> authorities) {
        this.authorities = authorities;
    }`
            );
            this.fs.write(fileNameUserDTO, resultUserDTO);

          } else if (entity.name === 'Authority') {
            // Rename Authority files to Role files
            const authorityFiles = [
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/domain/Authority.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/repository/AuthorityRepository.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/AuthorityService.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/dto/AuthorityDTO.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/mapper/AuthorityMapper.java`,
              `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/AuthorityResource.java`,
              `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/AuthorityResourceIT.java`,
              `${SERVER_TEST_SRC_DIR}${packageFolder}/domain/AuthorityAsserts.java`,
              `${SERVER_TEST_SRC_DIR}${packageFolder}/domain/AuthorityTest.java`,
              `${SERVER_TEST_SRC_DIR}${packageFolder}/domain/AuthorityTestSamples.java`,
              // FIXME add angular
            ];
            replaceAuthorityInFiles(this, authorityFiles);

            // Fix RoleResourceIT specific patterns
            const roleResourceITFileName = `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/RoleResourceIT.java`;
            let resultRoleResourceIT = this.fs.read(roleResourceITFileName);
            resultRoleResourceIT = resultRoleResourceIT
              .replace(/@WithMockUser\(roles = /g, '@WithMockUser(authorities = ')
              .replace(/DEFAULT_NAME = "AAAAAAAAAA"/g, 'DEFAULT_NAME = "ROLE_AAAAAAAAAA"')
              .replace(/UPDATED_NAME = "BBBBBBBBBB"/g, 'UPDATED_NAME = "ROLE_BBBBBBBBBB"')
              .replace(/.*role\.setName\(UUID\.randomUUID\(\)\.toString\(\)\);.*\n/g, '');
            this.fs.write(roleResourceITFileName, resultRoleResourceIT);

            // Write template files to override the renamed files
            await writeRolePermissionServerFiles.call(this, { application });

          } else if (!entity.skipServer) {
            const entityNameUpperCase = snakeCase(entity.name).toUpperCase();
            const fileName = `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/${entityClass}Resource.java`;
            let result = this.fs.read(fileName);
            if (!result.includes("PreAuthorize")) {
              // add imports
              result = ensureReplace(
                result,
                'import org.springframework.http.ResponseEntity;',
                `import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;`,
                fileName
              );
              result = ensureReplace(
                result,
                `/**
 * REST controller`,
                `import static ${packageName}.security.AuthoritiesConstants.*;

/**
 * REST controller`,
                fileName
              );
              // add preAuthorize annotations
              result = ensureReplace(
                result,
                /(@GetMapping.+)/g,
                `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_READ + "')")`,
                fileName
              );
              result = ensureReplace(
                result,
                /(@DeleteMapping.+)/g,
                `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_DELETE + "')")`,
                fileName
              );
              result = ensureReplace(
                result,
                /(@PostMapping.+)/g,
                `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_CREATE + "')")`,
                fileName
              );
              result = ensureReplace(
                result,
                /(@PutMapping.+)/g,
                `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_UPDATE + "')")`,
                fileName
              );
              result = ensureReplace(
                result,
                /(@PatchMapping.+)/g,
                `$1
    @PreAuthorize("hasAuthority('" + ${entityNameUpperCase}_UPDATE + "')")`,
                fileName
              );
              this.fs.write(fileName, result);
            }

            const fileNameIT = `src/test/java/${packageFolder}/web/rest/${entityClass}ResourceIT.java`;
            let resultIT = this.fs.read(fileNameIT);
            const classResourceITregex = new RegExp(`@WithMockUser\\n(public )?class ${entityClass}ResourceIT \\{`);
            if (classResourceITregex.test(resultIT)) {
              resultIT = ensureReplace(
                resultIT,
                classResourceITregex,
                `$1class ${entityClass}ResourceIT {`,
                fileNameIT
              );
              resultIT = ensureReplace(
                resultIT,
                'import static org.assertj.core.api.Assertions.assertThat;',
                `import static ${packageName}.security.AuthoritiesConstants.*;
import static org.assertj.core.api.Assertions.assertThat;`,
                fileNameIT
              );
              resultIT = ensureReplace(
                resultIT,
                /(void (create|check).+)/g,
                `@WithMockUser(authorities = {${entityNameUpperCase}_CREATE})
    $1`,
                fileNameIT
              );
              resultIT = ensureReplace(
                resultIT,
                /(void get.+)/g,
                `@WithMockUser(authorities = {${entityNameUpperCase}_READ})
    $1`,
                fileNameIT
              );
              resultIT = ensureReplace(
                resultIT,
                /(void delete.+)/g,
                `@WithMockUser(authorities = {${entityNameUpperCase}_DELETE})
    $1`,
                fileNameIT
              );
              resultIT = ensureReplace(
                resultIT,
                /(void (put|update|partialUpdate|fullUpdate|patch).+)/g,
                `@WithMockUser(authorities = {${entityNameUpperCase}_UPDATE})
    $1`,
                fileNameIT
              );
              this.fs.write(fileNameIT, resultIT);
            }
          }
        }
      },
      addAuthoritiesConstant({ entities, application }) {
        const { packageName, packageFolder } = application;
        for (const entity of entities) {
          if (entity.skipServer || entity.name === 'User' || entity.name === 'Authority') {
            continue;
          }
          const fileName = `${SERVER_MAIN_SRC_DIR}${packageFolder}/security/AuthoritiesConstants.java`;
          let result = this.fs.read(fileName);
          const entityNameUpperCase = snakeCase(entity.name).toUpperCase();
          const entityKebabCase = kebabCase(entity.name);

          if (!result.includes(`public static final String ${entityNameUpperCase}_READ`)) {

            // Add authorities
            const authorities = `public static final String ${entityNameUpperCase}_CREATE = "${entityKebabCase}.create";
    public static final String ${entityNameUpperCase}_READ = "${entityKebabCase}.read";
    public static final String ${entityNameUpperCase}_UPDATE = "${entityKebabCase}.update";
    public static final String ${entityNameUpperCase}_DELETE = "${entityKebabCase}.delete";
`;
            result = ensureReplace(
              result,
              '/* jhipster-preauthorize-needle-add-entity-authorities */',
              `${authorities}

    /* jhipster-preauthorize-needle-add-entity-authorities */`,
              fileName
            );

            // Add authorities to tree
            const createUpdateRequiredAuthorities = entity.relationships.filter(r => r.ownerSide && r.otherEntityName !== 'user')
              .map(r => snakeCase(r.otherEntityName).toUpperCase() + '_READ').join(', ')
            const createUpdateList = createUpdateRequiredAuthorities.length ? `Arrays.asList(${createUpdateRequiredAuthorities})` : 'new ArrayList<String>()';
            const treeInit = `
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_CREATE, ${createUpdateList}),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_UPDATE, ${createUpdateList}),
        new AbstractMap.SimpleEntry<>(${entityNameUpperCase}_DELETE, new ArrayList<String>())`;
            result = ensureReplace(
              result,
              `
        /* jhipster-preauthorize-needle-add-to-authorities-tree */`,
              `${result.includes('new AbstractMap.SimpleEntry<>') ? ',\n' : ''}
        ${treeInit}
        /* jhipster-preauthorize-needle-add-to-authorities-tree */`,
              fileName
            );

            this.fs.write(fileName, result);
          }
        }
      }
    });
  }
}
