package com.sergio.application.admin.user;

import com.sergio.api.admin.user.dto.CreateAdminUserRequest;
import com.sergio.application.admin.auth.PasswordService;
import com.sergio.domain.admin.AdminUser;
import com.sergio.infrastructure.persistence.adminUser.AdminUserEntity;
import com.sergio.infrastructure.persistence.adminUser.AdminUserRepository;
import com.sergio.infrastructure.persistence.adminUser.mapper.AdminUserPersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class AdminUserService {

    private final AdminUserRepository repository;
    private final AdminUserPersistenceMapper mapper;
    private final PasswordService passwordService;

    public AdminUserService(
            AdminUserRepository repository,
            AdminUserPersistenceMapper mapper,
            PasswordService passwordService
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.passwordService = passwordService;
    }

    public List<AdminUser> findAll() {
        return repository.listAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Transactional
    public AdminUser create(AdminUser adminUser) {
        validate(adminUser);

        if (repository.findByEmail(adminUser.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        adminUser.setPasswordHash(passwordService.hash(adminUser.getPassword()));
        adminUser.setCreatedAt(Instant.now());

        AdminUserEntity entity = mapper.toEntity(adminUser);

        repository.persist(entity);

        return mapper.toDomain(entity);
    }

    private void validate(AdminUser user) {
        switch (user.getRole()) {
            case SUPER_ADMIN -> {
                if (user.getBarbershopId() != null ||
                        user.getBarberId() != null) {
                    throw new IllegalArgumentException("SUPER_ADMIN cannot have barbershop or barber");
                }
            }

            case OWNER -> {
                if (user.getBarbershopId() == null) {
                    throw new IllegalArgumentException("OWNER requires barbershopId");
                }

                if (user.getBarberId() != null) {
                    throw new IllegalArgumentException("OWNER cannot have barberId");
                }
            }

            case BARBER -> {
                if (user.getBarbershopId() == null || user.getBarberId() == null) {
                    throw new IllegalArgumentException("BARBER requires barbershopId and barberId");
                }
            }
        }
    }
}
