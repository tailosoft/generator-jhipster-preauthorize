import chalk from 'chalk';
import ServerGenerator from 'generator-jhipster/generators/server';

import { writeRolePermissionServerFiles, SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR } from './files.js';
import { replaceAuthorityByRole } from '../utils.js';

export default class extends ServerGenerator {
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

  get [ServerGenerator.WRITING]() {
    return {
      writeRolePermissionServerFiles,
      changeAuthorityToRole() {
        const { packageName, packageFolder, incrementalChangelog, recreateInitialChangelog } = this.jhipsterConfig;
        this.fs.delete(`${SERVER_MAIN_SRC_DIR}${packageFolder}/domain/Authority.java`);
        this.fs.delete(`${SERVER_MAIN_SRC_DIR}${packageFolder}/repository/AuthorityRepository.java`);
        const filesNames = [
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/domain/User.java`,
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/PublicUserResource.java`,
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/security/DomainUserDetailsService.java`,
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/repository/UserRepository.java`,
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/mapper/UserMapper.java`,
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/UserService.java`,
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/config/CacheConfiguration.java`,
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/dto/AdminUserDTO.java`,
          `${SERVER_MAIN_RES_DIR}config/liquibase/data/authority.csv`,
          `${SERVER_MAIN_RES_DIR}config/liquibase/data/user_authority.csv`,
          `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/AccountResourceIT.java`,
          `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/UserResourceIT.java`,
          `${SERVER_TEST_SRC_DIR}${packageFolder}/service/mapper/UserMapperTest.java`
        ];
        if (!incrementalChangelog || recreateInitialChangelog) {
          filesNames.push(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`)
        }
        filesNames.forEach(fileName => {
          if (this.fs.exists(fileName)) {
            const result = replaceAuthorityByRole(this.fs.read(fileName));
            const newFileName = replaceAuthorityByRole(fileName);
            this.fs.write(newFileName, result);
            if (fileName !== newFileName) {
              this.fs.delete(fileName);
            }
          } else {
            console.warn('could not find file to update authority with role: ' + fileName)
          }
        });
        const fileNameCacheConfig = `${SERVER_MAIN_SRC_DIR}${packageFolder}/config/CacheConfiguration.java`;
        let resultCacheConfig = this.fs.read(fileNameCacheConfig);
        resultCacheConfig = resultCacheConfig.replace(
          'return cm -> {',
          `return cm -> {
            createCache(cm, ${packageName}.domain.RolePermission.class.getName());`
        );
        this.fs.write(fileNameCacheConfig, resultCacheConfig);

        /* ************ UserService.java ************ */
        // fix back user service
        const fileNameUserService = `${SERVER_MAIN_SRC_DIR}${packageFolder}/service/UserService.java`;
        let resultUserService = this.fs.read(fileNameUserService);
        resultUserService = resultUserService.replace(
          /authToken[\n\s]*.getRoles\(\)/,
          `authToken.getAuthorities()`
        );
        resultUserService = resultUserService.replace(
          `GrantedAuthority::getRole`,
          `GrantedAuthority::getAuthority`
        );
        this.fs.write(fileNameUserService, resultUserService);

        /* ************ UserResource.java ************ */
        const fileNameUserResource = `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/UserResource.java`;
        let resultUserResource = this.fs.read(fileNameUserResource);
        resultUserResource = resultUserResource.replace(
          'getUserWithAuthoritiesByLogin',
          'getUserWithRolesByLogin'
        );
        this.fs.write(fileNameUserResource, resultUserResource);

        /* ************ PublicUserResource.java ************ */
        const fileNamePublicUserResource = `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/PublicUserResource.java`;
        let resultPublicUserResource = this.fs.read(fileNamePublicUserResource);
        resultPublicUserResource = resultPublicUserResource.replace(
          `

    /**
     * Gets a list of all roles.
     * @return a string list of all roles.
     */
    @GetMapping("/roles")
    public List<String> getRoles() {
        return userService.getRoles();
    }`,
          ''
        );
        this.fs.write(fileNamePublicUserResource, resultPublicUserResource);

        /* ************ PublicUserResourceIT.java ************ */
        const fileNamePublicUserResourceIT = `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/PublicUserResourceIT.java`;
        let resultPublicUserResourceIT = this.fs.read(fileNamePublicUserResourceIT);
        resultPublicUserResourceIT = resultPublicUserResourceIT.replace(
          `

    @Test
    @Transactional
    void getAllAuthorities() throws Exception {
        restUserMockMvc
            .perform(get("/api/authorities").accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").value(hasItems(AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN)));
    }`,
          ''
        );
        this.fs.write(fileNamePublicUserResourceIT, resultPublicUserResourceIT);


        /* ************ AuthoritiesConstants.java ************ */
        const fileNameAuthoritiesConstants = `${SERVER_MAIN_SRC_DIR}${packageFolder}/security/AuthoritiesConstants.java`;
        let resultAuthoritiesConstants = this.fs.read(fileNameAuthoritiesConstants);
        resultAuthoritiesConstants = resultAuthoritiesConstants.replace(
          `${packageName}.security;`,
          `${packageName}.security;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;`
        );
        resultAuthoritiesConstants = resultAuthoritiesConstants.replace(
          'private AuthoritiesConstants()',
          `public static final String ROLE_PREFIX = "ROLE_";
    public static final String ROLE_REGEX = "ROLE_[A-Z_]+";

    /* jhipster-preauthorize-needle-add-entity-authorities */

    public static final Map<String, List<String>> PERMISSION_TREE = Stream.of(
        /* jhipster-preauthorize-needle-add-to-authorities-tree */
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    private AuthoritiesConstants()`
        );
        this.fs.write(fileNameAuthoritiesConstants, resultAuthoritiesConstants);

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

        /* ************ AccountResource.java ************ */
        const fileNameAccountResource = `${SERVER_MAIN_SRC_DIR}${packageFolder}/web/rest/AccountResource.java`;
        let resultAccountResource = this.fs.read(fileNameAccountResource);
        resultAccountResource = resultAccountResource.replace(
          `@GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService.getUserWithAuthorities()
            .map(AdminUserDTO::new)
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }`,
          `@GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService.getUserWithRoles()
            .map(AdminUserDTO::new)
            .map(userDto -> {
                userDto.setAuthorities(SecurityUtils.getCurrentAuthorities());
                return userDto;
            })
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }`
        );
        this.fs.write(fileNameAccountResource, resultAccountResource);

        /* ************ SecurityUtils.java ************ */
        const securityUtilsFileName = `${SERVER_MAIN_SRC_DIR}${packageFolder}/security/SecurityUtils.java`;
        let resultSecurityUtils = this.fs.read(securityUtilsFileName);
        resultSecurityUtils = resultSecurityUtils.replace(
          `import java.util.Optional;
import java.util.stream.Stream;`,
          `import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;`
        );
        resultSecurityUtils = resultSecurityUtils.replace(
          `}

}`,
          `}

    public static Set<String> getCurrentAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getAuthorities(authentication).collect(Collectors.toSet());
    }
}`// FIXME
        );
        this.fs.write(securityUtilsFileName, resultSecurityUtils);

        // force ROLE_ prefix in application roles, to avoid privilege escalation by assigning keycloak roles like realm admin...

        /* ************ Role.java replace back ************ */
        const roleFileName = `${SERVER_MAIN_SRC_DIR}${packageFolder}/domain/Role.java`;
        let resultRole = this.fs.read(roleFileName);
        resultRole = resultRole.replace(
          'private String name;',
          `@Pattern(regexp = AuthoritiesConstants.ROLE_REGEX)
    private String name;`
        );
        resultRole = resultRole.replace(
          'import java.io.Serializable;',
          `import ${packageName}.security.AuthoritiesConstants;
import java.io.Serializable;`
        );
        this.fs.write(roleFileName, resultRole);

        /* ************ 00000000000000_initial_schema.xml ************ */

        if (!incrementalChangelog || recreateInitialChangelog) {
          const initialSchemaFileName = `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`;
          let resultInitialSchema = this.fs.read(initialSchemaFileName);
          resultInitialSchema = resultInitialSchema.replace(
            /(<addPrimaryKey.+)/,
            `<createTable tableName="jhi_role_permission">
            <column name="permission" type="varchar(255)">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="role_name" type="varchar(255)">
                <constraints primaryKey="true" nullable="false"/>
            </column>
        </createTable>

        $1`
          );
          resultInitialSchema = resultInitialSchema.replace(
            /(<addNotNullConstraint.+)/,
            `<addForeignKeyConstraint baseColumnNames="role_name"
                                 baseTableName="jhi_role_permission"
                                 constraintName="fk_role_permission_role_name"
                                 referencedColumnNames="name"
                                 referencedTableName="jhi_role"/>

        $1`
          );
          this.fs.write(initialSchemaFileName, resultInitialSchema);
        }

        /* ************ AccountResourceIT.java  replace back ************ */
        const accountResourceITFileName = `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/AccountResourceIT.java`;
        let resultAccountResourceIT = this.fs.read(accountResourceITFileName);
        resultAccountResourceIT = resultAccountResourceIT.replace(/getRoles/g, 'getAuthorities');
        resultAccountResourceIT = resultAccountResourceIT.replace(/setRoles/g, 'setAuthorities');
        resultAccountResourceIT = resultAccountResourceIT.replace('user.setAuthorities(roles);', 'user.setRoles(roles);');
        resultAccountResourceIT = resultAccountResourceIT.replace(
          'assertThat(userDup.get().getAuthorities()).hasSize(1)',
          'assertThat(userDup.get().getRoles()).hasSize(1)'
        );
        resultAccountResourceIT = resultAccountResourceIT.replace(
          'assertThat(updatedUser.getAuthorities()).isEmpty();',
          'assertThat(updatedUser.getRoles()).isEmpty();'
        );
        this.fs.write(accountResourceITFileName, resultAccountResourceIT);

        /* ************ UserResourceIT.java replace back ************ */
        const userResourceITFileName = `${SERVER_TEST_SRC_DIR}${packageFolder}/web/rest/UserResourceIT.java`;
        let resultUserResourceIT = this.fs.read(userResourceITFileName);
        resultUserResourceIT = resultUserResourceIT.replace(
          '@WithMockUser(roles = AuthoritiesConstants.ADMIN)',
          '@WithMockUser(authorities = AuthoritiesConstants.ADMIN)'
        );
        this.fs.write(userResourceITFileName, resultUserResourceIT);
      }
    };
  }
}
