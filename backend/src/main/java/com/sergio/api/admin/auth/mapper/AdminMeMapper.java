package com.sergio.api.admin.auth.mapper;

import com.sergio.api.admin.auth.dto.AdminMeResponse;
import com.sergio.application.admin.auth.AuthenticatedAdmin;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface AdminMeMapper {

    AdminMeResponse toDto(AuthenticatedAdmin admin);
}