import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { JAVA_MAIN_SOURCES_DIR as SERVER_MAIN_SRC_DIR } from "generator-jhipster";
import { ensureReplace, replaceAuthorityInFiles } from "../utils.js";

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, {
      ...features,

      sbsBlueprint: true,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      changeAuthorityToRole({ application }) {
        const { packageName, packageFolder } = application;

        const filesNames = [
          `${SERVER_MAIN_SRC_DIR}${packageFolder}/config/CacheConfiguration.java`,
        ];
        replaceAuthorityInFiles(this, filesNames);

        const fileNameCacheConfig = `${SERVER_MAIN_SRC_DIR}${packageFolder}/config/CacheConfiguration.java`;
        let resultCacheConfig = this.fs.read(fileNameCacheConfig);
        resultCacheConfig = ensureReplace(
          resultCacheConfig,
          'return cm -> {',
          `return cm -> {
          createCache(cm, ${packageName}.domain.RolePermission.class.getName());`,
          fileNameCacheConfig
        );
        this.fs.write(fileNameCacheConfig, resultCacheConfig);
      }
    });
  }
}
