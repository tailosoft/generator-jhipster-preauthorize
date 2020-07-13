/* eslint-disable consistent-return */
const chalk = require('chalk');
const ServerGenerator = require('generator-jhipster/generators/server');
const constants = require('generator-jhipster/generators/generator-constants');
const writeFiles = require('./files').writeFiles;

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

module.exports = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint preauthorize')}`);
        }

        this.configOptions = jhContext.configOptions || {};

        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
    }

    get initializing() {
        /**
         * Any method beginning with _ can be reused from the superclass `ServerGenerator`
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
            ...writeFiles(),
            changeAuthorityToRole() {
                const filesNames = [
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/domain/User.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/domain/Authority.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/web/rest/UserResource.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/repository/UserRepository.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/security/DomainUserDetailsService.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/service/mapper/UserMapper.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/service/UserService.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/web/rest/UserResource.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/repository/UserRepository.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/repository/AuthorityRepository.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/security/DomainUserDetailsService.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/config/CacheConfiguration.java`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/service/dto/UserDTO.java`,
                    `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
                    `${SERVER_MAIN_RES_DIR}config/liquibase/data/authority.csv`,
                    `${SERVER_MAIN_RES_DIR}config/liquibase/data/user_authority.csv`,
                    `${SERVER_TEST_SRC_DIR}${this.packageFolder}/web/rest/AccountResourceIT.java`,
                    `${SERVER_TEST_SRC_DIR}${this.packageFolder}/web/rest/UserResourceIT.java`,
                    `${SERVER_TEST_SRC_DIR}${this.packageFolder}/service/mapper/UserMapperTest.java`
                ];
                filesNames.forEach(fileName => {
                    if (this.fs.exists(fileName)) {
                        const result = this._replaceAuthorityByRole(this.fs.read(fileName));
                        const newFileName = this._replaceAuthorityByRole(fileName);
                        this.fs.write(newFileName, result);
                        if (fileName !== newFileName) {
                            this.fs.delete(fileName);
                        }
                    }
                });
                const fileNameCacheConfig = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/config/CacheConfiguration.java`;
                let resultCacheConfig = this.fs.read(fileNameCacheConfig);
                resultCacheConfig = resultCacheConfig.replace(
                    'return cm -> {',
                    `return cm -> {
            createCache(cm, ${this.packageName}.domain.RoleAuthority.class.getName());`
                );
                this.fs.write(fileNameCacheConfig, resultCacheConfig);

                /* ************ AuthoritiesConstants.java ************ */
                const fileNameAuthoritiesConstants = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/security/AuthoritiesConstants.java`;
                let resultAuthoritiesConstants = this.fs.read(fileNameAuthoritiesConstants);
                resultAuthoritiesConstants = resultAuthoritiesConstants.replace(
                    `${this.packageName}.security;`,
                    `${this.packageName}.security;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;`
                );
                resultAuthoritiesConstants = resultAuthoritiesConstants.replace(
                    'private AuthoritiesConstants()',
                    `public static final String ROLE_CREATE = "role+create";
    public static final String ROLE_READ = "role+read";
    public static final String ROLE_DELETE = "role+delete";

    public static final String ROLE_AUTHORITY_READ = "role-authority+read";
    public static final String ROLE_AUTHORITY_UPDATE = "role-authority+update";

    public static final Map<String, List<String>> AUTHORITIES_TREE = Stream.of(
        new AbstractMap.SimpleEntry<>(ROLE_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(ROLE_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(ROLE_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(ROLE_AUTHORITY_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(ROLE_AUTHORITY_UPDATE, Arrays.asList(ROLE_AUTHORITY_READ))
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    private AuthoritiesConstants()`
                );
                this.fs.write(fileNameAuthoritiesConstants, resultAuthoritiesConstants);

                /* ************ UserDTO.java replace back ************ */
                const fileNameUserDTO = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/service/dto/UserDTO.java`;
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
                const fileNameAccountResource = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/web/rest/AccountResource.java`;
                let resultAccountResource = this.fs.read(fileNameAccountResource);
                // TODO add init roleAuthoritiesRepository
                resultAccountResource = resultAccountResource.replace(
                    `@GetMapping("/account")
    public UserDTO getAccount() {
        return userService.getUserWithAuthorities()
            .map(UserDTO::new)
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }`,
                    `@GetMapping("/account")
    public UserDTO getAccount() {
        return userService.getUserWithRoles()
            .map(UserDTO::new)
            .map(userDto -> {
                userDto.setAuthorities(SecurityUtils.getCurrentAuthorities());
                return userDto;
            })
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }`
                );
                resultAccountResource = resultAccountResource.replace(
                    `import ${this.packageName}.domain.User;`,
                    `import ${this.packageName}.domain.User;
import ${this.packageName}.repository.RoleAuthorityRepository;`
                );
                resultAccountResource = resultAccountResource.replace(
                    `private final MailService mailService;

    public AccountResource(UserRepository userRepository, UserService userService, MailService mailService) {

        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
    }`,
                    `private final RoleAuthorityRepository roleAuthorityRepository;

    private final MailService mailService;

    public AccountResource(UserRepository userRepository, UserService userService, RoleAuthorityRepository roleAuthorityRepository, MailService mailService) {

        this.userRepository = userRepository;
        this.userService = userService;
        this.roleAuthorityRepository = roleAuthorityRepository;
        this.mailService = mailService;
    }`
                );
                this.fs.write(fileNameAccountResource, resultAccountResource);

                /* ************ SecurityUtils.java ************ */
                const securityUtilsFileName = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/security/SecurityUtils.java`;
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
}`
                );
                resultSecurityUtils = resultSecurityUtils.replace(/authority/g, 'role');
                this.fs.write(securityUtilsFileName, resultSecurityUtils);

                /* ************ TokenProvider.java ************ */
                const tokenProviderFileName = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/security/jwt/TokenProvider.java`;
                let resultTokenProvider = this.fs.read(tokenProviderFileName);
                resultTokenProvider = resultTokenProvider.replace(/\bauthorities\b/g, 'roles');
                resultTokenProvider = resultTokenProvider.replace(/\bAUTHORITIES_KEY\b/g, 'ROLES_KEY');
                resultTokenProvider = resultTokenProvider.replace('"auth"', '"roles"');
                resultTokenProvider = resultTokenProvider.replace(
                    'import org.slf4j.Logger;',
                    `import com.google.common.collect.Streams;
import ${this.packageName}.repository.RoleAuthorityRepository;
import ${this.packageName}.security.AuthoritiesConstants;
import org.slf4j.Logger;`
                );
                resultTokenProvider = resultTokenProvider.replace(
                    `public TokenProvider(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }`,
                    `private final RoleAuthorityRepository roleAuthorityRepository;

    public TokenProvider(JHipsterProperties jHipsterProperties, RoleAuthorityRepository roleAuthorityRepository) {
        this.jHipsterProperties = jHipsterProperties;
        this.roleAuthorityRepository = roleAuthorityRepository;
    }`
                );
                resultTokenProvider = resultTokenProvider.replace(
                    /(map\(GrantedAuthority.+)/g,
                    `map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))`
                );
                resultTokenProvider = resultTokenProvider.replace(
                    `Collection<? extends GrantedAuthority> roles =
            Arrays.stream(claims.get(ROLES_KEY).toString().split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        User principal = new User(claims.getSubject(), "", roles);

        return new UsernamePasswordAuthenticationToken(principal, token, roles);`,
                    `Set<String> roles = Arrays.stream(claims.get(ROLES_KEY).toString().split(",")).collect(Collectors.toSet());
        Set<String> authorities;
        if (roles.contains(AuthoritiesConstants.ADMIN)) {
            authorities = AuthoritiesConstants.AUTHORITIES_TREE.keySet();
        } else {
            authorities = roleAuthorityRepository.findDistinctByRoles(roles);
        }
        List<SimpleGrantedAuthority> rolesAndAuthorties = Streams.concat(roles.stream(), authorities.stream())
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
        User principal = new User(claims.getSubject(), "", rolesAndAuthorties);
        return new UsernamePasswordAuthenticationToken(principal, token, rolesAndAuthorties);`
                );
                this.fs.write(tokenProviderFileName, resultTokenProvider);

                /* ************ 00000000000000_initial_schema.xml ************ */
                const initialSchemaFileName = `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`;
                let resultInitialSchema = this.fs.read(initialSchemaFileName);
                resultInitialSchema = resultInitialSchema.replace(
                    /(<addPrimaryKey.+)/,
                    `<createTable tableName="jhi_role_authority">
            <column name="authority" type="varchar(255)">
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
                                 baseTableName="jhi_role_authority"
                                 constraintName="fk_role_authority_role_name"
                                 referencedColumnNames="name"
                                 referencedTableName="jhi_role"/>

        $1`
                );
                this.fs.write(initialSchemaFileName, resultInitialSchema);

                /* ************ JWTFilterIT.java ************ */
                const jwtFilterTestFileName = `${SERVER_TEST_SRC_DIR}${this.packageFolder}/security/jwt/JWTFilterTest.java`;
                let resultJwtFilterTest = this.fs.read(jwtFilterTestFileName);
                resultJwtFilterTest = resultJwtFilterTest.replace(
                    'public class JWTFilterTest {',
                    `@SpringBootTest(classes = ${this.mainClass}.class)
public class JWTFilterIT {`
                );
                resultJwtFilterTest = resultJwtFilterTest.replace(
                    `import ${this.packageName}.security.AuthoritiesConstants;`,
                    `import ${this.packageName}.${this.mainClass};
import ${this.packageName}.repository.RoleAuthorityRepository;
import ${this.packageName}.security.AuthoritiesConstants;`
                );
                resultJwtFilterTest = resultJwtFilterTest.replace(
                    'import org.junit.jupiter.api.Test;',
                    `import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;`
                );
                resultJwtFilterTest = resultJwtFilterTest.replace(
                    'private JWTFilter jwtFilter;',
                    `private JWTFilter jwtFilter;

    @Autowired
    RoleAuthorityRepository roleAuthorityRepository;`
                );
                resultJwtFilterTest = resultJwtFilterTest.replace(
                    'tokenProvider = new TokenProvider(jHipsterProperties)',
                    'tokenProvider = new TokenProvider(jHipsterProperties, roleAuthorityRepository)'
                );
                // this.fs.write(jwtFilterTestFileName, resultJwtFilterTest);
                const newName = `${SERVER_TEST_SRC_DIR}${this.packageFolder}/security/jwt/JWTFilterIT.java`;
                this.fs.write(newName, resultJwtFilterTest);
                this.fs.delete(jwtFilterTestFileName);

                /* ************ TokenProviderTest.java ************ */
                const tokenProviderTestFileName = `${SERVER_TEST_SRC_DIR}${this.packageFolder}/security/jwt/TokenProviderTest.java`;
                let resultTokenProviderTest = this.fs.read(tokenProviderTestFileName);
                resultTokenProviderTest = resultTokenProviderTest.replace(
                    `import ${this.packageName}.security.AuthoritiesConstants;`,
                    `import ${this.packageName}.${this.mainClass};
import ${this.packageName}.repository.RoleAuthorityRepository;
import ${this.packageName}.security.AuthoritiesConstants;`
                );
                resultTokenProviderTest = resultTokenProviderTest.replace(
                    'import org.junit.jupiter.api.Test;',
                    `import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;`
                );
                resultTokenProviderTest = resultTokenProviderTest.replace(
                    'private TokenProvider tokenProvider;',
                    `private TokenProvider tokenProvider;

    @Autowired
    RoleAuthorityRepository roleAuthorityRepository;`
                );
                resultTokenProviderTest = resultTokenProviderTest.replace(
                    'tokenProvider = new TokenProvider( new JHipsterProperties());',
                    'tokenProvider = new TokenProvider(new JHipsterProperties(), roleAuthorityRepository);'
                );
                resultTokenProviderTest = resultTokenProviderTest.replace(
                    'public class TokenProviderTest {',
                    `@SpringBootTest(classes = ${this.mainClass}.class)
public class TokenProviderIT {`
                );
                this.fs.write(tokenProviderTestFileName.replace('Test', 'IT'), resultTokenProviderTest);
                this.fs.delete(tokenProviderTestFileName);

                /* ************ AccountResourceIT.java  replace back ************ */
                const accountResourceITFileName = `${SERVER_TEST_SRC_DIR}${this.packageFolder}/web/rest/AccountResourceIT.java`;
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
                const userResourceITFileName = `${SERVER_TEST_SRC_DIR}${this.packageFolder}/web/rest/UserResourceIT.java`;
                let resultUserResourceIT = this.fs.read(userResourceITFileName);
                resultUserResourceIT = resultUserResourceIT.replace(
                    '@WithMockUser(roles = AuthoritiesConstants.ADMIN)',
                    '@WithMockUser(authorities = AuthoritiesConstants.ADMIN)'
                );
                this.fs.write(userResourceITFileName, resultUserResourceIT);
            }
        };
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

    _replaceAuthorityByRole(data) {
        data = data.replace(/Authority/g, 'Role');
        data = data.replace(/authority/g, 'role');
        data = data.replace(/Authorities/g, 'Roles');
        data = data.replace(/authorities/g, 'roles');
        data = data.replace(/hasRole/g, 'hasAuthority');
        data = data.replace(/RolesConstants/g, 'AuthoritiesConstants');
        data = data.replace(/GrantedRole/g, 'GrantedAuthority');
        data = data.replace(/org.springframework.security.core.role./g, 'org.springframework.security.core.authority.');
        return data;
    }
};
