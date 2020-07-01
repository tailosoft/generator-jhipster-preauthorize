package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.service.dto.RoleAuthorityDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for the entity {@link RoleAuthority} and its DTO {@link RoleAuthorityDTO}.
 */
@Mapper(componentModel = "spring")
public interface RoleAuthorityMapper extends EntityMapper<RoleAuthorityDTO, RoleAuthority> {

    @Mapping(source = "id.authority", target = "authority")
    @Mapping(source = "id.roleName", target = "roleName")
    RoleAuthorityDTO toDto(RoleAuthority roleAuthority);

    @Mapping(source = "authority", target = "id.authority")
    @Mapping(source = "roleName", target = "id.roleName")
    @Mapping(source = "roleName", target = "role")
    RoleAuthority toEntity(RoleAuthorityDTO roleAuthorityDTO);

    default RoleAuthority fromId(RoleAuthorityId id) {
        if (id == null) {
            return null;
        }
        RoleAuthority roleAuthority = new RoleAuthority();
        roleAuthority.setId(id);
        return roleAuthority;
    }

    @Mapping(source = "roleName", target = "name")
    Role roleFromName(String roleName);
}
