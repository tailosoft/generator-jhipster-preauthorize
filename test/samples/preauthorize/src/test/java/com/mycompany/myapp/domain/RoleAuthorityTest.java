package com.mycompany.myapp.domain;

import com.mycompany.myapp.web.rest.RoleAuthorityResourceIT;
import com.mycompany.myapp.web.rest.RoleResourceIT;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import com.mycompany.myapp.web.rest.TestUtil;

public class RoleAuthorityTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(RoleAuthority.class);
        RoleAuthority roleAuthority1 = new RoleAuthority();
        roleAuthority1.setId(new RoleAuthorityId(RoleAuthorityResourceIT.DEFAULT_AUTHORITY, RoleResourceIT.DEFAULT_NAME));
        RoleAuthority roleAuthority2 = new RoleAuthority();
        roleAuthority2.setId(new RoleAuthorityId(RoleAuthorityResourceIT.DEFAULT_AUTHORITY, RoleResourceIT.DEFAULT_NAME));
        assertThat(roleAuthority1).isEqualTo(roleAuthority2);
        roleAuthority2.setId(new RoleAuthorityId(RoleAuthorityResourceIT.UPDATED_AUTHORITY, RoleResourceIT.UPDATED_NAME));
        assertThat(roleAuthority1).isNotEqualTo(roleAuthority2);
        roleAuthority1.setId(null);
        assertThat(roleAuthority1).isNotEqualTo(roleAuthority2);
    }
}
