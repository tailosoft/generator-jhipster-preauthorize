const constants = require('generator-jhipster/generators/generator-constants.js');

const { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR } = constants;
// const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
  serverJavaRolePermission: [
    {
      condition: generator => generator.databaseType !== 'no',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Role.java',
          renameTo: generator => `${generator.javaDir}domain/Role.java`,
        },
        {
          file: 'package/service/dto/RoleDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/RoleDTO.java`,
        },
        {
          file: 'package/service/mapper/RoleMapper.java',
          renameTo: generator => `${generator.javaDir}service/mapper/RoleMapper.java`,
        },
        {
          file: 'package/domain/RolePermission.java',
          renameTo: generator => `${generator.javaDir}domain/RolePermission.java`,
        },
        {
          file: 'package/domain/RolePermissionId.java',
          renameTo: generator => `${generator.javaDir}domain/RolePermissionId.java`,
        },
        {
          file: 'package/service/RoleService.java',
          renameTo: generator => `${generator.javaDir}service/RoleService.java`,
        },
        {
          file: 'package/web/rest/RoleResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/RoleResource.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseType !== 'no',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/RoleResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/RoleResourceIT.java`,
        },
      ],
    },
  ],
};

async function writeRolePermissionServerFiles() {
  if (this.skipServer) return;
  this.javaDir = `${this.jhipsterConfig.packageFolder}/`;
  this.testDir = `${this.jhipsterConfig.packageFolder}/`;
  const { application } = this.jhipsterContext;
  await this.writeFiles({
    sections: serverFiles,
    context: application,
  });
}

module.exports = {
  writeRolePermissionServerFiles,
  SERVER_MAIN_SRC_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_TEST_SRC_DIR,
};
