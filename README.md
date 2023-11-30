# Preauthorize Blueprint
> JHipster blueprint, Adds PreAuthorize to each end point for each entity

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint, that is meant to be used in a JHipster application.

This Blueprint allows to use fine grained permissions foreach generated endpoint.

To be able to use fine grained permissions without assigning each permission/authority to a user we:
1. Replace the "Old" Authority Class with a new Role Class
2. Now that users have roles, we link their roles to the permissions, using a new Entity RolePermission

# known quirks

## Adding permissions to authentications

Since there are many way to authenticate, we need to populate the fined grained permissions after authenticating.
it seems like there a way to do this using Spring `RoleHierarchy` but for know this needs to be added manually after install depending on what authentication you are using.
ex: in TokenProvider when using JWT
```
    public Authentication getAuthentication(String token) {
        Claims claims = jwtParser.parseClaimsJws(token).getBody();

        List<String> roles = Arrays.asList(claims.get(ROLES_KEY).toString().split(","));
        Collection<String> permissions = roles.contains(AuthoritiesConstants.ADMIN) ?
            AuthoritiesConstants.PERMISSION_TREE.keySet() :
            roleRepository.findPermissionsByRoleNames(roles);

        Collection<? extends GrantedAuthority> authorities = Stream.concat(
                roles.stream(),
                permissions.stream()
            )
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

        User principal = new User(claims.getSubject(), "", authorities);

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

```

# Technical choices
We now have a relationship UserRole and manage it through the UserResource endpoint (the same way Jhipster does by default with UserAuthority).
In the case of AccountResource, and only in that case, we would like to return the users (Fine Grained) Authorities with its roles, for an easier code we added back the field authorities to the UserDTO (only), and it is always empty except in that case.
(If you have a better proposition please create an Issue and PR).

# Usage

To use this blueprint, run the below command

```bash
jhipster --blueprints primeng-blueprint,preauthorize import-jdl jhipster.jh
```

Fine-grained permission are added in the frontend using the primeng blueprint.


