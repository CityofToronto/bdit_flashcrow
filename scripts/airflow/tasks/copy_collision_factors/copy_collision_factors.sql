CREATE SCHEMA IF NOT EXISTS collision_factors;
CREATE TABLE IF NOT EXISTS collision_factors.loccoord
(
    field text,
    loccoord text,
    offence text,
    description text,
    code text,
    field_desc text
);
CREATE TABLE IF NOT EXISTS collision_factors.acclass
(
    field text,
    acclass text,
    offence text,
    description text,
    code text,
    field_desc text
);
CREATE TABLE IF NOT EXISTS collision_factors.accloc
(
    field text,
    accloc text,
    offence text,
    description text,
    code text,
    field_desc text
);
CREATE TABLE IF NOT EXISTS collision_factors.impactype
(
    field text,
    impactype text,
    offence text,
    description text,
    code text,
    field_desc text
);
CREATE TABLE IF NOT EXISTS collision_factors.visible
(
    field text,
    visible text,
    offence text,
    description text,
    code text,
    field_desc text
);
CREATE TABLE IF NOT EXISTS collision_factors.light
(
    field text,
    light text,
    offence text,
    description text,
    code text,
    field_desc text
);
CREATE TABLE IF NOT EXISTS collision_factors.rdsfcond
(
    field text,
    rdsfcond text,
    offence text,
    description text,
    code text,
    field_desc text
);
TRUNCATE TABLE collision_factors.rdsfcond, collision_factors.light,
collision_factors.visible, collision_factors.impactype, collision_factors.accloc,
collision_factors.acclass, collision_factors.loccoord  restart identity;
