package com.mycompany.myapp.security;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String ROLE_CREATE = "role+create";
    public static final String ROLE_READ = "role+read";
    public static final String ROLE_DELETE = "role+delete";

    public static final String ROLE_AUTHORITY_READ = "role-authority+read";
    public static final String ROLE_AUTHORITY_UPDATE = "role-authority+update";

    public static final String EMPLOYEE_CREATE = "employee+create";
    public static final String EMPLOYEE_READ = "employee+read";
    public static final String EMPLOYEE_UPDATE = "employee+update";
    public static final String EMPLOYEE_DELETE = "employee+delete";

    public static final String EMPLOYEE_SKILL_CREATE = "employee-skill+create";
    public static final String EMPLOYEE_SKILL_READ = "employee-skill+read";
    public static final String EMPLOYEE_SKILL_UPDATE = "employee-skill+update";
    public static final String EMPLOYEE_SKILL_DELETE = "employee-skill+delete";

    public static final String CERTIFICATE_TYPE_CREATE = "certificate-type+create";
    public static final String CERTIFICATE_TYPE_READ = "certificate-type+read";
    public static final String CERTIFICATE_TYPE_UPDATE = "certificate-type+update";
    public static final String CERTIFICATE_TYPE_DELETE = "certificate-type+delete";

    public static final String EMPLOYEE_SKILL_CERTIFICATE_CREATE = "employee-skill-certificate+create";
    public static final String EMPLOYEE_SKILL_CERTIFICATE_READ = "employee-skill-certificate+read";
    public static final String EMPLOYEE_SKILL_CERTIFICATE_UPDATE = "employee-skill-certificate+update";
    public static final String EMPLOYEE_SKILL_CERTIFICATE_DELETE = "employee-skill-certificate+delete";

    public static final String TASK_CREATE = "task+create";
    public static final String TASK_READ = "task+read";
    public static final String TASK_UPDATE = "task+update";
    public static final String TASK_DELETE = "task+delete";

    public static final String TASK_COMMENT_CREATE = "task-comment+create";
    public static final String TASK_COMMENT_READ = "task-comment+read";
    public static final String TASK_COMMENT_UPDATE = "task-comment+update";
    public static final String TASK_COMMENT_DELETE = "task-comment+delete";

    public static final String PRICE_FORMULA_CREATE = "price-formula+create";
    public static final String PRICE_FORMULA_READ = "price-formula+read";
    public static final String PRICE_FORMULA_UPDATE = "price-formula+update";
    public static final String PRICE_FORMULA_DELETE = "price-formula+delete";

    public static final Map<String, List<String>> AUTHORITIES_TREE = Stream.of(
        new AbstractMap.SimpleEntry<>(ROLE_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(ROLE_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(ROLE_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(ROLE_AUTHORITY_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(ROLE_AUTHORITY_UPDATE, Arrays.asList(ROLE_AUTHORITY_READ)),

        new AbstractMap.SimpleEntry<>(EMPLOYEE_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(CERTIFICATE_TYPE_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(CERTIFICATE_TYPE_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(CERTIFICATE_TYPE_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(CERTIFICATE_TYPE_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_CERTIFICATE_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_CERTIFICATE_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_CERTIFICATE_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(EMPLOYEE_SKILL_CERTIFICATE_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(TASK_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(TASK_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(TASK_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(TASK_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(TASK_COMMENT_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(TASK_COMMENT_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(TASK_COMMENT_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(TASK_COMMENT_DELETE, new ArrayList<String>()),

        new AbstractMap.SimpleEntry<>(PRICE_FORMULA_CREATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(PRICE_FORMULA_READ, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(PRICE_FORMULA_UPDATE, new ArrayList<String>()),
        new AbstractMap.SimpleEntry<>(PRICE_FORMULA_DELETE, new ArrayList<String>())
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    private AuthoritiesConstants() {
    }
}
