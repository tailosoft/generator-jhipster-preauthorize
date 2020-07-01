package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.service.RoleAuthorityService;
import com.mycompany.myapp.service.dto.RoleAuthorityDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import static com.mycompany.myapp.security.AuthoritiesConstants.*;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.RoleAuthority}.
 */
@RestController
@RequestMapping("/api")
public class RoleAuthorityResource {

    private final Logger log = LoggerFactory.getLogger(RoleAuthorityResource.class);

    private static final String ENTITY_NAME = "roleAuthority";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RoleAuthorityService roleAuthorityService;

    public RoleAuthorityResource(RoleAuthorityService roleAuthorityService) {
        this.roleAuthorityService = roleAuthorityService;
    }

    /**
     * {@code PUT  /role-authorities/:roleName} : sets all the authorties for the role with name roleName
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of roleAuthorities in body, or with status {@code 403 (Forbidden)}.
     */
    @PutMapping("/role-authorities/{roleName}")
    @PreAuthorize("hasAuthority('" + ROLE_AUTHORITY_UPDATE + "')")
    public void updateAuthorities(@Valid @RequestBody List<String> authorities, @PathVariable String roleName) throws URISyntaxException {
        roleAuthorityService.updateAuthorities(authorities, roleName);
    }

    /**
     * {@code GET  /role-authorities/} : get all the roleAuthorities.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of roleAuthorities in body.
     */
    @GetMapping("/role-authorities/{roleName}")
    @PreAuthorize("hasAuthority('" + ROLE_AUTHORITY_READ + "')")
    public List<RoleAuthorityDTO> getAllRoleAuthoritiesForRole(@PathVariable String roleName) {
        log.debug("REST request to get all RoleAuthorities");
        return roleAuthorityService.findByRoleName(roleName);
    }

    @GetMapping("/role-authorities/authorities-dependencies")
    @PreAuthorize("hasAuthority('" + ROLE_AUTHORITY_READ + "')")
    public Map<String, List<String>> getAuthoritiesDependencies() {
        return roleAuthorityService.getAuthoritiesDependencies();
    }
}
