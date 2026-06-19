package com.sergio.api.admin.auth.mapper;

import com.sergio.api.admin.auth.dto.AdminLoginRequest;
import com.sergio.domain.admin.AdminUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface AdminAuthMapper {

   @Mapping(target = "id", ignore = true)
   @Mapping(target = "barbershopId", ignore = true)
   @Mapping(target = "passwordHash", ignore = true)
   @Mapping(target = "role", ignore = true)
   @Mapping(target = "createdAt", ignore = true)
   @Mapping(target = "updatedAt", ignore = true)
   AdminUser toDomain(AdminLoginRequest request);
}