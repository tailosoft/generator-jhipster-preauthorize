import LiquibaseGenerator from 'generator-jhipster/generators/liquibase';
import { TEMPLATES_MAIN_RESOURCES_DIR as SERVER_MAIN_RES_DIR } from "generator-jhipster";
import { ensureReplace, replaceAuthorityInFiles } from "../utils.js";

export default class extends LiquibaseGenerator {
  constructor(args, opts, features) {
    super(args, opts, {
      ...features,

      sbsBlueprint: true,
    });
  }

  get [LiquibaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      changeAuthorityToRole() {
        const filesNames = [
          `${SERVER_MAIN_RES_DIR}config/liquibase/data/authority.csv`,
          `${SERVER_MAIN_RES_DIR}config/liquibase/data/user_authority.csv`,
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`
        ];
        replaceAuthorityInFiles(this, filesNames);

        /* ************ 00000000000000_initial_schema.xml ************ */
        const initialSchemaFileName = `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`;
        let resultInitialSchema = this.fs.read(initialSchemaFileName);
        if (!resultInitialSchema.includes("jhi_role_permission")) {
          resultInitialSchema = ensureReplace(
            resultInitialSchema,
            '<loadData',
            `
      <createTable tableName="jhi_role_permission">
          <column name="role_name" type="varchar(50)">
              <constraints nullable="false"/>
          </column>
          <column name="permission" type="varchar(50)">
              <constraints nullable="false"/>
          </column>
      </createTable>

      <addPrimaryKey columnNames="role_name, permission" tableName="jhi_role_permission"/>

      <addForeignKeyConstraint baseColumnNames="role_name"
                               baseTableName="jhi_role_permission"
                               constraintName="fk_role_permission_role_name"
                               referencedColumnNames="name"
                               referencedTableName="jhi_role"/>

      <loadData`,
            initialSchemaFileName
          );
          this.fs.write(initialSchemaFileName, resultInitialSchema);
        }
      }
    });
  }
}
