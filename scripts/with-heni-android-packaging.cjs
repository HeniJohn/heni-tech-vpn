const { withAppBuildGradle } = require('@expo/config-plugins');

const duplicateMetaInf = 'META-INF/versions/9/OSGI-INF/MANIFEST.MF';

module.exports = function withHeniAndroidPackaging(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language === 'kotlin') {
      throw new Error('Heni Android packaging plugin expects Groovy app/build.gradle');
    }

    const contents = mod.modResults.contents;
    if (contents.includes(duplicateMetaInf)) return mod;

    const packagingBlock = `\nandroid {\n  packaging {\n    resources {\n      excludes += ['${duplicateMetaInf}']\n    }\n  }\n}\n`;
    mod.modResults.contents = `${contents.trimEnd()}\n${packagingBlock}`;
    return mod;
  });
};
