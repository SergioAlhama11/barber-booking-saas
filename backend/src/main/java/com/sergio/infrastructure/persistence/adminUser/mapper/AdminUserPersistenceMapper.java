package com.sergio.infrastructure.persistence.adminUser.mapper;

import com.sergio.domain.admin.AdminUser;
import com.sergio.infrastructure.persistence.adminUser.AdminUserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface AdminUserPersistenceMapper {

    AdminUserEntity toEntity(AdminUser adminUser);

    AdminUser toDomain(AdminUserEntity entity);
}