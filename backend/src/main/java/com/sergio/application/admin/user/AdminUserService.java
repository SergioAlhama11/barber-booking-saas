package com.sergio.application.admin.user;

import com.sergio.application.admin.auth.PasswordService;
import com.sergio.application.admin.authorization.AdminOwnershipService;
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
    private final AdminOwnershipService ownershipService;

    public AdminUserService(AdminUserRepository repository, AdminUserPersistenceMapper mapper, PasswordService passwordService, AdminOwnershipService ownershipService) {
        this.repository = repository;
        this.mapper = mapper;
        this.passwordService = passwordService;
        this.ownershipService = ownershipService;
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
            case SUPER_ADMIN -> validateSuperAdmin(user);
            case OWNER -> validateOwner(user);
            case BARBER -> validateBarber(user);
        }
    }

    private void validateSuperAdmin(AdminUser user) {
        if (user.getBarbershopId() != null || user.getBarberId() != null) {
            throw new IllegalArgumentException("SUPER_ADMIN cannot have barbershopId or barberId");
        }
    }

    private void validateOwner(AdminUser user) {
        if (user.getBarbershopId() == null) {
            throw new IllegalArgumentException("OWNER requires barbershopId");
        }

        if (user.getBarberId() != null) {
            throw new IllegalArgumentException("OWNER cannot have barberId");
        }

        ownershipService.validateBarbershopExists(user.getBarbershopId());
    }

    private void validateBarber(AdminUser user) {
        if (user.getBarbershopId() == null || user.getBarberId() == null) {
            throw new IllegalArgumentException("BARBER requires barbershopId and barberId");
        }

        ownershipService.validateBarberOwnership(user.getBarbershopId(), user.getBarberId());
    }
}