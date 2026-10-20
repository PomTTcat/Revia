const { withAppDelegate, withXcodeProject } = require('expo/config-plugins');

function configureProject(project) {
  const phases = project.hash.project.objects.PBXShellScriptBuildPhase;
  let found = false;
  for (const phase of Object.values(phases)) {
    if (!phase || typeof phase !== 'object' || !phase.shellScript) continue;
    let script = JSON.parse(phase.shellScript);
    if (!script.includes('react-native-xcode.sh')) continue;
    found = true;
    const marker = '# Revia: embed JavaScript for offline Debug';
    script = script.replace(/# Revia: embed JavaScript for offline Debug\nif \[\[.*?\nfi\n\n/s, '');
    const invocation = script.indexOf('`"$NODE_BINARY" --print');
    if (invocation < 0) throw new Error('Offline Debug: bundling invocation not found');
    const settings = `${marker}\nif [[ "$CONFIGURATION" = *Debug* ]]; then\n  unset SKIP_BUNDLING\n  export FORCE_BUNDLING=1\n  export EXTRA_PACKAGER_ARGS="\${EXTRA_PACKAGER_ARGS:-} --dev false --minify false"\nfi\n\n`;
    phase.shellScript = JSON.stringify(script.slice(0, invocation) + settings + script.slice(invocation));
  }
  if (!found) throw new Error('Offline Debug: Xcode bundling phase not found');
  return project;
}

module.exports = function withOfflineDebug(config) {
  config = withAppDelegate(config, (mod) => {
    const source = mod.modResults.contents;
    const pattern = /#if DEBUG\s+return RCTBundleURLProvider\.sharedSettings\(\)\.jsBundleURL\(forBundleRoot: "[^"]+"\)\s+#else\s+return Bundle\.main\.url\(forResource: "main", withExtension: "jsbundle"\)\s+#endif/;
    const replacement = 'return Bundle.main.url(forResource: "main", withExtension: "jsbundle")';
    if (!pattern.test(source) && !source.includes(replacement)) throw new Error('Offline Debug: unsupported AppDelegate bundle URL configuration');
    mod.modResults.contents = source.replace(pattern, replacement);
    return mod;
  });
  return withXcodeProject(config, (mod) => {
    configureProject(mod.modResults);
    return mod;
  });
};

module.exports.configureProject = configureProject;
