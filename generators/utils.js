function replaceAuthorityByRole(data) {
  return data
    .replace(/Authority/g, 'Role')
    .replace(/authority/g, 'role')
    .replace(/Authorities/g, 'Roles')
    .replace(/authorities/g, 'roles')
    .replace(/hasRole/g, 'hasAuthority')
    .replace(/RolesConstants/g, 'AuthoritiesConstants')
    .replace(/GrantedRole/g, 'GrantedAuthority')
    .replace(/org.springframework.security.core.role./g, 'org.springframework.security.core.authority.');
}

module.exports = {
  replaceAuthorityByRole,
};
