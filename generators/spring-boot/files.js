import { JAVA_MAIN_SOURCES_DIR as SERVER_MAIN_SRC_DIR } from "generator-jhipster";
import { moveToJavaPackageSrcDir } from 'generator-jhipster/generators/java/support';

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
  serverJavaRolePermission: [
    {
      condition: generator => generator.databaseType !== 'no',
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'config/MatrixVariableConfiguration.java',
        'domain/RolePermission.java',
        'domain/RolePermissionId.java',
        'domain/Role.java', // override
        'repository/RoleRepository.java', // override
      ],
    },
  ],
};

export async function writeRolePermissionServerFiles({ application }) {
  if (this.skipServer) return;
  await this.writeFiles({
    sections: serverFiles,
    context: application,
  });
}
