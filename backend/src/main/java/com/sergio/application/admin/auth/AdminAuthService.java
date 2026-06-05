package com.sergio.application.admin.auth;

import com.sergio.domain.admin.AdminUser;
import com.sergio.domain.admin.exception.InvalidAdminCredentialsException;
import com.sergio.infrastructure.persistence.adminUser.AdminUserEntity;
import com.sergio.infrastructure.persistence.adminUser.AdminUserRepository;
import com.sergio.infrastructure.persistence.adminUser.mapper.AdminUserPersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AdminAuthService {

    private static final Logger LOG = Logger.getLogger(AdminAuthService.class);

    private final AdminUserRepository adminUserRepository;
    private final AdminUserPersistenceMapper persistenceMapper;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    public AdminAuthService(
            AdminUserRepository adminUserRepository,
            AdminUserPersistenceMapper persistenceMapper,
            PasswordService passwordService,
            JwtService jwtService
    ) {
        this.adminUserRepository = adminUserRepository;
        this.persistenceMapper = persistenceMapper;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    public String login(AdminUser loginRequest) {
        AdminUser adminUser = findByEmailOrThrow(loginRequest.getEmail());

        validateCredentials(loginRequest.getPassword(), adminUser.getPasswordHash());

        LOG.infof(
                "admin_login_success email=%s role=%s barbershopId=%s",
                adminUser.getEmail(),
                adminUser.getRole(),
                adminUser.getBarbershopId()
        );

        return jwtService.generate(adminUser);
    }

    private AdminUser findByEmailOrThrow(String email) {
        AdminUserEntity entity = adminUserRepository
                .findByEmail(email)
                .orElseThrow(InvalidAdminCredentialsException::new);

        return persistenceMapper.toDomain(entity);
    }

    private void validateCredentials(String rawPassword, String passwordHash) {
        boolean valid = passwordService.verify(rawPassword, passwordHash);

        if (!valid) {
            LOG.warn("admin_login_failed");
            throw new InvalidAdminCredentialsException();
        }
    }
}