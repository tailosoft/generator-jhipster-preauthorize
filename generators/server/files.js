/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const constants = require('generator-jhipster/generators/generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
// const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
    serverJavaRoleAuthority: [
        {
            condition: generator => generator.databaseType !== 'no',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/domain/RoleAuthority.java',
                    renameTo: generator => `${generator.javaDir}domain/RoleAuthority.java`
                },
                { file: 'package/domain/RoleAuthorityId.java', renameTo: generator => `${generator.javaDir}domain/RoleAuthorityId.java` },
                {
                    file: 'package/repository/RoleAuthorityRepository.java',
                    renameTo: generator => `${generator.javaDir}repository/RoleAuthorityRepository.java`
                },
                {
                    file: 'package/service/dto/RoleAuthorityDTO.java',
                    renameTo: generator => `${generator.javaDir}service/dto/RoleAuthorityDTO.java`
                },
                {
                    file: 'package/service/mapper/RoleAuthorityMapper.java',
                    renameTo: generator => `${generator.javaDir}service/mapper/RoleAuthorityMapper.java`
                },
                {
                    file: 'package/service/RoleAuthorityService.java',
                    renameTo: generator => `${generator.javaDir}service/RoleAuthorityService.java`
                },
                {
                    file: 'package/web/rest/RoleAuthorityResource.java',
                    renameTo: generator => `${generator.javaDir}web/rest/RoleAuthorityResource.java`
                }
            ]
            // },
            // {
            //     condition: generator => generator.authenticationType === 'oauth2' && generator.databaseType !== 'no',
            //     path: SERVER_TEST_SRC_DIR,
            //     templates: [
            //         {
            //             file: 'package/service/mapper/UserMapperTest.java',
            //             renameTo: generator => `${generator.testDir}service/mapper/UserMapperTest.java`,
            //         },
            //         {
            //             file: 'package/web/rest/UserResourceIT.java',
            //             renameTo: generator => `${generator.testDir}web/rest/UserResourceIT.java`,
            //         }
            //     ]
            // },
            // {
            //     path: SERVER_TEST_SRC_DIR,
            //     templates: [
            //         {
            //             file: 'package/web/rest/AccountResourceIT.java',
            //             renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.java`,
            //         }
            //     ]
        }
    ]
};

function writeFiles() {
    return {
        // setUp() {
        //     this.javaDir = `${this.packageFolder}/`;
        //     this.testDir = `${this.packageFolder}/`;
        // },

        writeRoleAuthorityServerFiles() {
            if (this.skipServer) return;

            this.writeFilesToDisk(serverFiles, this, false, '.');
        }
    };
}

module.exports = {
    writeFiles
};
