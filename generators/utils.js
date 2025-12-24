/**
 * Performs a string replacement and throws an error if no change was made.
 * @param {string} content - The original string
 * @param {string|RegExp} search - The pattern to search for
 * @param {string} replacement - The replacement string
 * @param {string} [context] - Optional context for error message (e.g., file name)
 * @returns {string} The modified string
 * @throws {Error} If the replacement didn't change anything
 */
export function ensureReplace(content, search, replacement, context = '') {
  const result = content.replace(search, replacement);
  if (result === content) {
    const searchStr = search instanceof RegExp ? search.toString() : `"${search}"`;
    const contextInfo = context ? ` in ${context}` : '';
    throw new Error(`Replace failed${contextInfo}: could not find pattern ${searchStr}`);
  }
  return result;
}

export function replaceAuthorityByRole(data) {
  return data
    .replace(/Authority/g, 'Role')
    .replace(/authority/g, 'role')
    .replace(/Authorities/g, 'Roles')
    .replace(/authorities/g, 'roles') // don't replace @WithMockUser(authorities
    .replace(/hasRole/g, 'hasAuthority')
    .replace(/RolesConstants/g, 'AuthoritiesConstants')
    .replace(/GrantedRole/g, 'GrantedAuthority')
    .replace(/org.springframework.security.core.role./g, 'org.springframework.security.core.authority.');
}

/**
 * Replaces Authority with Role in specified files.
 * Handles file renaming if the filename contains Authority/authority.
 * @param {Object} generator - The generator instance (provides fs)
 * @param {string[]} fileNames - List of file paths to process
 */
export function replaceAuthorityInFiles(generator, fileNames) {
  fileNames.forEach(fileName => {
    if (generator.fs.exists(fileName)) {
      const result = replaceAuthorityByRole(generator.fs.read(fileName));
      const newFileName = replaceAuthorityByRole(fileName);
      generator.fs.write(newFileName, result);
      if (fileName !== newFileName) {
        generator.fs.delete(fileName);
      }
    } else {
      console.warn('could not find file to update authority with role: ' + fileName)
    }
  });
}
