package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqOAuth2MergeDto;
import com.study.SpringSecurityMybatis.dto.request.ReqProfileImgDto;
import com.study.SpringSecurityMybatis.dto.request.ReqSigninDto;
import com.study.SpringSecurityMybatis.dto.request.ReqSignupDto;
import com.study.SpringSecurityMybatis.dto.response.RespDeleteUserDto;
import com.study.SpringSecurityMybatis.dto.response.RespSigninDto;
import com.study.SpringSecurityMybatis.dto.response.RespSignupDto;
import com.study.SpringSecurityMybatis.dto.response.RespUserInfoDto;
import com.study.SpringSecurityMybatis.entity.OAuth2User;
import com.study.SpringSecurityMybatis.entity.Role;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.entity.UserRoles;
import com.study.SpringSecurityMybatis.exception.DeleteUserException;
import com.study.SpringSecurityMybatis.exception.SingupException;
import com.study.SpringSecurityMybatis.repository.RoleMapper;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.repository.UserRolesMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Value("${user.profile.img.default}")
    private String defaultProfileImg;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private UserRolesMapper userRolesMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    public Boolean isDuplicateUsername(String username) {
        // isPresent 가 true 인지 false 인지 구분 해줌 / null이면 false
        return Optional.ofNullable(userMapper.findByUsername(username)).isPresent();
    }

    @Transactional(rollbackFor = SingupException.class) // 무조건 예외 터지면 rollback
    public RespSignupDto insertUserAndUserRoles(ReqSignupDto dto) throws SingupException {
        User user = null;

        try {
            user = dto.toEntity(passwordEncoder);
            userMapper.save(user);

            // ROLES_USER 찾기
            Role role = roleMapper.findByName("ROLE_USER");

            if(role == null) {
                roleMapper.save(Role.builder().name("ROLE_USER").build());
                roleMapper.save(role);
            }

            UserRoles userRoles = UserRoles.builder()
                    .userId(user.getId())
                    .roleId(role.getId())
                    .build();

            userRolesMapper.save(userRoles);
            user.setUserRoles(Set.of(userRoles));

        } catch (Exception e) {
            throw new SingupException(e.getMessage());
        }

        return RespSignupDto.builder()
                .message("회원가입 완료")
                .user(user)
                .build();
    }

    public RespSigninDto getGeneratedAccessToken(ReqSigninDto dto) {
        User user = checkUsernameAndPassword(dto.getUsername(), dto.getPassword());

        return RespSigninDto.builder()
                .expireDate(jwtProvider.getExpireDate().toLocaleString())
                .accessToken(jwtProvider.generateAccessToken(user))
                .build();
    }

    private User checkUsernameAndPassword(String username, String password) {
        User user = userMapper.findByUsername(username); // username을 찾는

        // username이 없으면
        if(user == null) {
            throw new UsernameNotFoundException("사용자 정보를 다시 확인하세요.");
        }

        // 내가 로그인 시도한 비밀번호와 데이터베이스가 갖고 있는 비밀번호와 같지 않으면
        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("사용자 정보를 다시 확인하세요.");
        }

        return user;
    }

    @Transactional(rollbackFor = SQLException.class)
    public RespDeleteUserDto deleteUser(Long id) {
        User user = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        PrincipalUser principalUser = (PrincipalUser) authentication.getPrincipal();
        if(principalUser.getId() != id) {
            throw new AuthenticationServiceException("삭제 할 수 있는 권한이 없습니다.");
        }
        user = userMapper.findById(id);
        if(user == null) {
            throw new AuthenticationServiceException("해당 사용자는 존재하지 않는 사용자입니다.");
        }
        userRolesMapper.deleteByUserId(id);
        userMapper.deleteById(id);

        return RespDeleteUserDto.builder()
                .isDeleting(true)
                .message("사용자 삭제 완료")
                .deleteUser(user)
                .build();
    }

    public RespUserInfoDto getUserInfo(Long id) {
        User user = userMapper.findById(id);
        Set<String> roles = user.getUserRoles().stream().map(
                userRoles -> userRoles.getRole().getName()
        ).collect(Collectors.toSet());

        return RespUserInfoDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .img(user.getImg())
                .roles(roles)
                .build();
    }

    public Boolean updateProfileImg(ReqProfileImgDto dto) {
        PrincipalUser principalUser =
                (PrincipalUser) SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getPrincipal();
        if(dto.getImg() == null || dto.getImg().isBlank()) {
            userMapper.modifyImgById(principalUser.getId(), defaultProfileImg);
            return true;
        }
        userMapper.modifyImgById(principalUser.getId(), dto.getImg());
        return true;
    }

    public OAuth2User mergeSignin(ReqOAuth2MergeDto dto) {
        User user = checkUsernameAndPassword(dto.getUsername(), dto.getPassword());
        return OAuth2User.builder()
                .userId(user.getId())
                .oAuth2Name(dto.getOauth2Name())
                .provider(dto.getProvider())
                .build();
    }
}
