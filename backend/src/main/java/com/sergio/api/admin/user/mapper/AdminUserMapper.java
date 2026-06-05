package com.sergio.api.admin.user.mapper;

import com.sergio.api.admin.user.dto.AdminUserResponse;
import com.sergio.api.admin.user.dto.CreateAdminUserRequest;
import com.sergio.domain.admin.AdminUser;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface AdminUserMapper {

    AdminUserResponse toDto(AdminUser adminUser);

    AdminUser toDomain(CreateAdminUserRequest createAdminUserRequest);
}
