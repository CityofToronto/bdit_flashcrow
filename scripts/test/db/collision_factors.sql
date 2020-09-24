--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.11
-- Dumped by pg_dump version 12.2 (Ubuntu 12.2-2.pgdg16.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP TABLE IF EXISTS collision_factors.visible;
DROP TABLE IF EXISTS collision_factors.vehtype;
DROP TABLE IF EXISTS collision_factors.traffictl;
DROP TABLE IF EXISTS collision_factors.trafctlcond;
DROP TABLE IF EXISTS collision_factors.safequip;
DROP TABLE IF EXISTS collision_factors.rdsfcond;
DROP TABLE IF EXISTS collision_factors.pedtype;
DROP TABLE IF EXISTS collision_factors.pedcond;
DROP TABLE IF EXISTS collision_factors.pedact;
DROP TABLE IF EXISTS collision_factors.municipal;
DROP TABLE IF EXISTS collision_factors.manoeuver;
DROP TABLE IF EXISTS collision_factors.loccoord;
DROP TABLE IF EXISTS collision_factors.light;
DROP TABLE IF EXISTS collision_factors.invtype;
DROP TABLE IF EXISTS collision_factors.injury;
DROP TABLE IF EXISTS collision_factors.initdir;
DROP TABLE IF EXISTS collision_factors.impactype;
DROP TABLE IF EXISTS collision_factors.event3;
DROP TABLE IF EXISTS collision_factors.event2;
DROP TABLE IF EXISTS collision_factors.event1;
DROP TABLE IF EXISTS collision_factors.drivcond;
DROP TABLE IF EXISTS collision_factors.drivact;
DROP TABLE IF EXISTS collision_factors.cyclistype;
DROP TABLE IF EXISTS collision_factors.cyccond;
DROP TABLE IF EXISTS collision_factors.cycact;
DROP SEQUENCE IF EXISTS collision_factors.collision_id_id_seq;
DROP SEQUENCE IF EXISTS collision_factors.collision_id_date_id_seq;
DROP TABLE IF EXISTS collision_factors.acctime;
DROP TABLE IF EXISTS collision_factors.accloc;
DROP TABLE IF EXISTS collision_factors.acclass;
DROP SCHEMA IF EXISTS collision_factors;
--
-- Name: collision_factors; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA collision_factors;


SET default_tablespace = '';

--
-- Name: acclass; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.acclass (
    field text,
    acclass text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: accloc; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.accloc (
    field text,
    accloc text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: acctime; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.acctime (
    field text,
    acctime text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: collision_id_date_id_seq; Type: SEQUENCE; Schema: collision_factors; Owner: -
--

CREATE SEQUENCE collision_factors.collision_id_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: collision_id_id_seq; Type: SEQUENCE; Schema: collision_factors; Owner: -
--

CREATE SEQUENCE collision_factors.collision_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cycact; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.cycact (
    field text,
    cycact text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: cyccond; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.cyccond (
    field text,
    cyccond text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: cyclistype; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.cyclistype (
    field text,
    cyclistype text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: drivact; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.drivact (
    field text,
    drivact text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: drivcond; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.drivcond (
    field text,
    drivcond text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: event1; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.event1 (
    field text,
    event1 text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: event2; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.event2 (
    field text,
    event2 text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: event3; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.event3 (
    field text,
    event3 text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: impactype; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.impactype (
    field text,
    impactype text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: initdir; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.initdir (
    field text,
    initdir text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: injury; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.injury (
    field text,
    injury text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: invtype; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.invtype (
    field text,
    invtype text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: light; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.light (
    field text,
    light text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: loccoord; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.loccoord (
    field text,
    loccoord text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: manoeuver; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.manoeuver (
    field text,
    manoeuver text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: municipal; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.municipal (
    field text,
    municipal text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: pedact; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.pedact (
    field text,
    pedact text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: pedcond; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.pedcond (
    field text,
    pedcond text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: pedtype; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.pedtype (
    field text,
    pedtype text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: rdsfcond; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.rdsfcond (
    field text,
    rdsfcond text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: safequip; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.safequip (
    field text,
    safequip text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: trafctlcond; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.trafctlcond (
    field text,
    trafctlcond text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: traffictl; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.traffictl (
    field text,
    traffictl text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: vehtype; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.vehtype (
    field text,
    vehtype text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Name: visible; Type: TABLE; Schema: collision_factors; Owner: -
--

CREATE TABLE collision_factors.visible (
    field text,
    visible text,
    offence text,
    description text,
    code text,
    field_desc text
);


--
-- Data for Name: acclass; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.acclass (field, acclass, offence, description, code, field_desc) FROM stdin;
ACCLASS	01	0.00	Fatal	FA	Accident Classification
ACCLASS	02	0.00	Non-Fatal Injury	PI	Accident Classification
ACCLASS	03	0.00	Property Damage Only	PD	Accident Classification
ACCLASS	04	0.00	Non-Reportable	NR	Accident Classification
ACCLASS	99	0.00	Other	OT	Accident Classification
ACCLASS	05	0.00	Sudden Deaths	SD	Accident Classification
ACCLASS	\N	0.00	\N	Blank	Accident Classification
\.


--
-- Data for Name: accloc; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.accloc (field, accloc, offence, description, code, field_desc) FROM stdin;
ACCLOC	01	0.00	Non Intersection	NonInter	Accident Location
ACCLOC	02	0.00	Intersection Related	InterRel	Accident Location
ACCLOC	03	0.00	At Intersection	Intersec	Accident Location
ACCLOC	04	0.00	At/Near Private Drive	PrvDrive	Accident Location
ACCLOC	05	0.00	At Railway Crossing	RailCros	Accident Location
ACCLOC	06	0.00	Underpass or Tunnel	Tunnel	Accident Location
ACCLOC	07	0.00	Overpass or Bridge	Bridge	Accident Location
ACCLOC	08	0.00	Trail	Trail	Accident Location
ACCLOC	09	0.00	Frozen Lake or River	LakeRivr	Accident Location
ACCLOC	10	0.00	Parking Lot	ParkLot	Accident Location
ACCLOC	97	0.00	Other	Other	Accident Location
ACCLOC	98	0.00	Laneway	Lanewy	Accident Location
ACCLOC	99	0.00	Private Driveway	Drivwy	Accident Location
ACCLOC	\N	0.00	\N	Blank	Accident Location
\.


--
-- Data for Name: acctime; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.acctime (field, acctime, offence, description, code, field_desc) FROM stdin;
ACCTIME	00	0.00	00:00 to 00:59	12-1am	Time of Accident
ACCTIME	01	0.00	01:00 to 01:59	1-2am	Time of Accident
ACCTIME	02	0.00	02:00 to 02:59	2-3am	Time of Accident
ACCTIME	03	0.00	03:00 to 03:59	3-4am	Time of Accident
ACCTIME	04	0.00	04:00 to 04:59	4-5am	Time of Accident
ACCTIME	05	0.00	05:00 to 05:59	5-6am	Time of Accident
ACCTIME	06	0.00	06:00 to 06:59	6-7am	Time of Accident
ACCTIME	07	0.00	07:00 to 07:59	7-8am	Time of Accident
ACCTIME	08	0.00	08:00 to 08:59	8-9am	Time of Accident
ACCTIME	09	0.00	09:00 to 09:59	9-10am	Time of Accident
ACCTIME	10	0.00	10:00 to 10:59	10-11am	Time of Accident
ACCTIME	11	0.00	11:00 to 11:59	11-12am	Time of Accident
ACCTIME	12	0.00	12:00 to 12:59	12-1pm	Time of Accident
ACCTIME	13	0.00	13:00 to 13:59	1-2pm	Time of Accident
ACCTIME	14	0.00	14:00 to 14:59	2-3pm	Time of Accident
ACCTIME	15	0.00	15:00 to 15:59	3-4pm	Time of Accident
ACCTIME	16	0.00	16:00 to 16:59	4-5pm	Time of Accident
ACCTIME	17	0.00	17:00 to 17:59	5-6pm	Time of Accident
ACCTIME	18	0.00	18:00 to 18:59	6-7pm	Time of Accident
ACCTIME	19	0.00	19:00 to 19:59	7-8pm	Time of Accident
ACCTIME	20	0.00	20:00 to 20:59	8-9pm	Time of Accident
ACCTIME	21	0.00	21:00 to 21:59	9-10pm	Time of Accident
ACCTIME	22	0.00	22:00 to 22:59	10-11pm	Time of Accident
ACCTIME	23	0.00	23:00 to 23:59	11-12pm	Time of Accident
ACCTIME	\N	0.00	\N	Blank	Time of Accident
\.


--
-- Data for Name: cycact; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.cycact (field, cycact, offence, description, code, field_desc) FROM stdin;
CYCACT	01	0.00	Driving Properly	DrivProp	Apparent Driver Action
CYCACT	02	0.00	Following too Close	Foll2Cls	Apparent Driver Action
CYCACT	03	0.00	Exceeding Speed Limit	Speeding	Apparent Driver Action
CYCACT	04	0.00	Speed too Fast For Condition	TooFast	Apparent Driver Action
CYCACT	05	0.00	Speed too Slow	TooSlow	Apparent Driver Action
CYCACT	06	0.00	Improper Turn	ImpropTn	Apparent Driver Action
CYCACT	07	0.00	Disobeyed Traffic Control	Disobey	Apparent Driver Action
CYCACT	08	0.00	Failed to Yield Right of Way	FTY ROW	Apparent Driver Action
CYCACT	09	0.00	Improper Passing	ImpropPa	Apparent Driver Action
CYCACT	10	0.00	Lost control	LostCtrl	Apparent Driver Action
CYCACT	11	0.00	Wrong Way on One Way Road	WrongWay	Apparent Driver Action
CYCACT	12	0.00	Improper Lane Change	ImpLaChg	Apparent Driver Action
CYCACT	99	0.00	Other	Other	Apparent Driver Action
CYCACT	\N	0.00	\N	Blank	Apparent Driver Action
\.


--
-- Data for Name: cyccond; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.cyccond (field, cyccond, offence, description, code, field_desc) FROM stdin;
\.


--
-- Data for Name: cyclistype; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.cyclistype (field, cyclistype, offence, description, code, field_desc) FROM stdin;
CYCLISTYPE	01	\N	Motorist opened vehicle door in Cyclist's path	\N	\N
CYCLISTYPE	02	\N	Overtaking collision ("Side-swipe" or "rear -end")	\N	\N
CYCLISTYPE	03	\N	Cyclist rode off sidewalk into road at mid-block	\N	\N
CYCLISTYPE	04	\N	Cyclist rode out at inter., lane, or driv., without yield. ROW	\N	\N
CYCLISTYPE	05	\N	Motorist drove out at inter., lane, or driv., without yield. ROW	\N	\N
CYCLISTYPE	06	\N	Motorist turned right at red light	\N	\N
CYCLISTYPE	07	\N	Motorist turned right - not at red light	\N	\N
CYCLISTYPE	08	\N	Motorist turned left	\N	\N
CYCLISTYPE	09	\N	Cyclist turned left	\N	\N
CYCLISTYPE	10	\N	Other	\N	\N
CYCLISTYPE	11	\N	Unknown (Insuf info available to categorize collision)	\N	\N
CYCLISTYPE	12	\N	Cyclist struck opened vehicle door	\N	\N
CYCLISTYPE	13	\N	Cyclist and Driver travelling in same direction. One vehicle rear-ended the other.	\N	\N
CYCLISTYPE	14	\N	Cyclist and Driver travelling in same direction. One vehicle sideswipes the other.	\N	\N
CYCLISTYPE	15	\N	Cyclist rode off sidewalk into road at midblock.	\N	\N
CYCLISTYPE	16	\N	Cyclist loses control and strikes object (pole, ttc track)	\N	\N
CYCLISTYPE	17	\N	Cyclist without ROW rides into path of motorist at inter, lnwy, dwy-Cyclist not turn.	\N	\N
CYCLISTYPE	18	\N	Motorist without ROW drives into path of cyclist at inter, lnwy, dwy-Driver not turn.	\N	\N
CYCLISTYPE	19	\N	Motorist turning right on red at signalized intersection strikes cyclist.	\N	\N
CYCLISTYPE	20	\N	Motorist turning right on green or amber at signalized intersection strikes cyclist.	\N	\N
CYCLISTYPE	21	\N	Motorist turns right at non-signal Inter.(stop, yield, no cont.,& dwy) & strikes cyclist.	\N	\N
CYCLISTYPE	22	\N	Motorist turned left across cyclist's path.	\N	\N
CYCLISTYPE	23	\N	Cyclist turned left across motorist's path.	\N	\N
CYCLISTYPE	24	\N	Cyclist struck at PXO(cyclist either travel in same dir. as veh. or ride across xwalk)	\N	\N
CYCLISTYPE	25	\N	Cyclist hit in parking lot.	\N	\N
CYCLISTYPE	26	\N	Motorist reversing struck cyclist.	\N	\N
CYCLISTYPE	27	\N	Motorist makes u-turn in-front of cyclist.	\N	\N
CYCLISTYPE	28	\N	Cyclist makes u-turn in-front of driver.	\N	\N
CYCLISTYPE	29	\N	Motorist loses control and strikes cyclist.	\N	\N
CYCLISTYPE	30	\N	Cyclist falls off bike - no contact with motorist.	\N	\N
CYCLISTYPE	31	\N	Cyclist strikes pedestrian.	\N	\N
CYCLISTYPE	32	\N	Cyclist strikes a parked vehicle.	\N	\N
CYCLISTYPE	33	\N	Cyclist strikes another cyclist.	\N	\N
CYCLISTYPE	34	\N	Insufficient information (to determine cyclist crash type).	\N	\N
CYCLISTYPE	35	\N	Cyclist turns right across motorist's path	\N	\N
CYCLISTYPE	\N	\N	\N	\N	\N
\.


--
-- Data for Name: drivact; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.drivact (field, drivact, offence, description, code, field_desc) FROM stdin;
DRIVACT	01	0.00	Driving Properly	DrivProp	Apparent Driver Action
DRIVACT	02	0.00	Following too Close	Foll2Cls	Apparent Driver Action
DRIVACT	03	0.00	Exceeding Speed Limit	Speeding	Apparent Driver Action
DRIVACT	04	0.00	Speed too Fast For Condition	TooFast	Apparent Driver Action
DRIVACT	05	0.00	Speed too Slow	TooSlow	Apparent Driver Action
DRIVACT	06	0.00	Improper Turn	ImpropTn	Apparent Driver Action
DRIVACT	07	0.00	Disobeyed Traffic Control	Disobey	Apparent Driver Action
DRIVACT	08	0.00	Failed to Yield Right of Way	FTY ROW	Apparent Driver Action
DRIVACT	09	0.00	Improper Passing	ImpropPa	Apparent Driver Action
DRIVACT	10	0.00	Lost control	LostCtrl	Apparent Driver Action
DRIVACT	11	0.00	Wrong Way on One Way Road	WrongWay	Apparent Driver Action
DRIVACT	12	0.00	Improper Lane Change	ImpLaChg	Apparent Driver Action
DRIVACT	99	0.00	Other	Other	Apparent Driver Action
DRIVACT	\N	0.00	\N	Blank	Apparent Driver Action
\.


--
-- Data for Name: drivcond; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.drivcond (field, drivcond, offence, description, code, field_desc) FROM stdin;
DRIVCOND	00	0.00	Unknown	Unknown	Driver Condition
DRIVCOND	01	0.00	Normal	Normal	Driver Condition
DRIVCOND	02	0.00	Had Been Drinking	HadDrink	Driver Condition
DRIVCOND	03	0.00	Ability Impaired, Alcohol Over .08	Over.08	Driver Condition
DRIVCOND	04	0.00	Ability Impaired, Alcohol	ImpairAl	Driver Condition
DRIVCOND	05	0.00	Ability Impaired, Drugs	ImpairDr	Driver Condition
DRIVCOND	06	0.00	Fatigue	Fatigue	Driver Condition
DRIVCOND	07	0.00	Medical or Physical Disability	Disabil	Driver Condition
DRIVCOND	08	0.00	Inattentive	Inatten	Driver Condition
DRIVCOND	99	0.00	Other	Other	Driver Condition
DRIVCOND	\N	0.00	\N	Blank	Driver Condition
\.


--
-- Data for Name: event1; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.event1 (field, event1, offence, description, code, field_desc) FROM stdin;
EVENT1	1	0	Automobile	\N	Moveable Objects
EVENT1	2	0	Unattended Vehicle	UnatdVeh	Moveable Objects
EVENT1	3	0	Pedestrian	Pedestri	Moveable Objects
EVENT1	4	0	Cyclist	Cyclist	Moveable Objects
EVENT1	5	0	Railway Train	RlwTrain	Moveable Objects
EVENT1	6	0	Street Car	StretCar	Moveable Objects
EVENT1	7	0	Farm Tractor	FarmTrac	Moveable Objects
EVENT1	8	0	Animal-Domestic	DomAniml	Moveable Objects
EVENT1	9	0	Animal-Wild	WldAniml	Moveable Objects
EVENT1	20	0	Ran Off Road	OffRoad	Moveable Objects
EVENT1	21	0	Skidding/Sliding	Skidding	Moveable Objects
EVENT1	22	0	Jacknifing	Jacknifg	Moveable Objects
EVENT1	23	0	Load Spill	LoadSpil	Moveable Objects
EVENT1	24	0	Fire Explosion	FireXplo	Moveable Objects
EVENT1	25	0	Submersion	Submersn	Moveable Objects
EVENT1	26	0	Rollover	Rollover	Moveable Objects
EVENT1	27	0	Debris on Road	Debris	Moveable Objects
EVENT1	28	0	Debris Falling Off Vehice	DebrFall	Moveable Objects
EVENT1	50	0	Cable Guide Rail	CablGuid	Moveable Objects
EVENT1	51	0	Concrete Guide Rail	ConcGuid	Moveable Objects
EVENT1	52	0	Steel Guide Rail	StelGuid	Moveable Objects
EVENT1	53	0	Pole (Utility, Tower)	UtilPole	Moveable Objects
EVENT1	54	0	Pole (Sign, Parking Meter)	SignPole	Moveable Objects
EVENT1	55	0	Fince/Noise Barrier	Fence	Moveable Objects
EVENT1	56	0	Culvert	Culvert	Moveable Objects
EVENT1	57	0	Bridge Support	BridgeSp	Moveable Objects
EVENT1	58	0	Rock Face	RockFace	Moveable Objects
EVENT1	59	0	Snowbank/Drift	SnowBank	Moveable Objects
EVENT1	60	0	Ditch	Ditch	Moveable Objects
EVENT1	61	0	Curb	Curb	Moveable Objects
EVENT1	62	0	Crask Cushion	CraskCus	Moveable Objects
EVENT1	63	0	Building or Wall	BuildWal	Moveable Objects
EVENT1	64	0	Water Course	WaterCse	Moveable Objects
EVENT1	65	0	Construction Marker	Constmrk	Moveable Objects
EVENT1	66	0	Tree, Shrub, Stump	Tree	Moveable Objects
EVENT1	67	\N	Hydrant	Hydrant	Moveable Object
EVENT1	97	0	Other	Other	Moveable Objects
EVENT1	98	0	Other	Other	Moveable Objects
EVENT1	99	0	Other	Other	Moveable Objects
\.


--
-- Data for Name: event2; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.event2 (field, event2, offence, description, code, field_desc) FROM stdin;
EVENT2	20	0.00	Ran Off Road	OffRoad	Non-Collision accidents
EVENT2	21	0.00	Skidding/Sliding	Skidding	Non-Collision accidents
EVENT2	22	0.00	Jacknifing	Jacknifg	Non-Collision accidents
EVENT2	23	0.00	Load Spill	LoadSpil	Non-Collision accidents
EVENT2	24	0.00	Fire Explosion	FireXplo	Non-Collision accidents
EVENT2	25	0.00	Submersion	Submersn	Non-Collision accidents
EVENT2	26	0.00	Rollover	Rollover	Non-Collision accidents
EVENT2	27	0.00	Debris on Road	Debris	Non-Collision accidents
EVENT2	28	0.00	Debris Falling Off Vehicle	DebrFall	Non-Collision accidents
EVENT2	98	0.00	Other	Other	Non-Collision accidents
EVENT2	01	0.00	Other motor vehicle	OthMvh	Non-Collision accidents
EVENT2	02	0.00	Unattended Vehicle	UnatdVeh	Non-Collision accidents
EVENT2	03	0.00	Pedestrian	Pedestri	Non-Collision accidents
EVENT2	04	0.00	Bicycle	Bicycle	Non-Collision accidents
EVENT2	05	0.00	Railway Train	RlwTrain	Non-Collision accidents
EVENT2	06	0.00	Street Car	StretCar	Non-Collision accidents
EVENT2	07	0.00	Farm Tractor	FarmTrac	Non-Collision accidents
EVENT2	08	0.00	Animal-Domestic	DomAniml	Non-Collision accidents
EVENT2	09	0.00	Animal-Wild	WldAniml	Non-Collision accidents
EVENT2	97	0.00	other	other	Non-Collision accidents
EVENT2	50	0.00	Cable Guide Rail	CablGuid	Non-Collision accidents
EVENT2	51	0.00	Concrete Guide Rail	ConcGuid	Non-Collision accidents
EVENT2	52	0.00	Steel Guide Rail	StelGuid	Non-Collision accidents
EVENT2	53	0.00	Pole (Utility, Tower)	UtilPole	Non-Collision accidents
EVENT2	54	0.00	Pole (Sign, Parking Meter)	SignPole	Non-Collision accidents
EVENT2	55	0.00	Fence/Noise Barrier	Fence	Non-Collision accidents
EVENT2	56	0.00	Culvert	Culvert	Non-Collision accidents
EVENT2	57	0.00	Bridge Support	BridgeSp	Non-Collision accidents
EVENT2	58	0.00	Rock Face	RockFace	Non-Collision accidents
EVENT2	59	0.00	Snowbank/Drift	SnowBank	Non-Collision accidents
EVENT2	60	0.00	Ditch	Ditch	Non-Collision accidents
EVENT2	61	0.00	Curb	Curb	Non-Collision accidents
EVENT2	62	0.00	Crash Cushion	CrashCus	Non-Collision accidents
EVENT2	63	0.00	Building or Wall	BuildWal	Non-Collision accidents
EVENT2	64	0.00	Water Course	WaterCse	Non-Collision accidents
EVENT2	65	0.00	Construction Marker	ConstMrk	Non-Collision accidents
EVENT2	66	0.00	Tree, Shrub, Stump	Tree	Non-Collision accidents
EVENT2	99	0.00	Other	Other	Non-Collision accidents
EVENT2	\N	0.00	\N	Blank	Moveable Objects
EVENT2	\N	0.00	\N	Blank	Non-Collision accidents
\.


--
-- Data for Name: event3; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.event3 (field, event3, offence, description, code, field_desc) FROM stdin;
EVENT3	50	0.00	Cable Guide Rail	CablGuid	Fixed Objects
EVENT3	51	0.00	Concrete Guide Rail	ConcGuid	Fixed Objects
EVENT3	52	0.00	Steel Guide Rail	StelGuid	Fixed Objects
EVENT3	53	0.00	Pole (Utility, Tower)	UtilPole	Fixed Objects
EVENT3	54	0.00	Pole (Sign, Parking Meter)	SignPole	Fixed Objects
EVENT3	55	0.00	Fence/Noise Barrier	Fence	Fixed Objects
EVENT3	56	0.00	Culvert	Culvert	Fixed Objects
EVENT3	57	0.00	Bridge Support	BridgeSp	Fixed Objects
EVENT3	58	0.00	Rock Face	RockFace	Fixed Objects
EVENT3	59	0.00	Snowbank/Drift	SnowBank	Fixed Objects
EVENT3	60	0.00	Ditch	Ditch	Fixed Objects
EVENT3	61	0.00	Curb	Curb	Fixed Objects
EVENT3	62	0.00	Crash Cushion	CrashCus	Fixed Objects
EVENT3	63	0.00	Building or Wall	BuildWal	Fixed Objects
EVENT3	64	0.00	Water Course	WaterCse	Fixed Objects
EVENT3	65	0.00	Construction Marker	ConstMrk	Fixed Objects
EVENT3	66	0.00	Tree, Shrub, Stump	Tree	Fixed Objects
EVENT3	99	0.00	Other	Other	Fixed Objects
EVENT3	01	0.00	Other motor vehicle	OthMvh	Fixed Objects
EVENT3	02	0.00	Unattended Vehicle	UnatdVeh	Fixed Objects
EVENT3	03	0.00	Pedestrian	Pedestri	Fixed Objects
EVENT3	04	0.00	Bicycle	Bicycle	Fixed Objects
EVENT3	05	0.00	Railway Train	RlwTrain	Fixed Objects
EVENT3	06	0.00	Street Car	StretCar	Fixed Objects
EVENT3	07	0.00	Farm Tractor	FarmTrac	Fixed Objects
EVENT3	08	0.00	Animal-Domestic	DomAniml	Fixed Objects
EVENT3	09	0.00	Animal-Wild	WldAniml	Fixed Objects
EVENT3	97	0.00	Other	Other	Fixed Objects
EVENT3	20	0.00	Ran Off Road	OffRoad	Fixed Objects
EVENT3	21	0.00	Skidding/Sliding	Skidding	Fixed Objects
EVENT3	22	0.00	Jacknifing	Jacknifg	Fixed Objects
EVENT3	23	0.00	Load Spill	LoadSpil	Fixed Objects
EVENT3	24	0.00	Fire Explosion	FireXplo	Fixed Objects
EVENT3	25	0.00	Submersion	Submersn	Fixed Objects
EVENT3	26	0.00	Rollover	Rollover	Fixed Objects
EVENT3	27	0.00	Debris on Road	Debris	Fixed Objects
EVENT3	28	0.00	Debris Falling off Vehicle	DebrFall	Fixed Objects
EVENT3	98	0.00	Other	Other	Fixed Objects
EVENT3	\N	0.00	\N	Blank	Fixed Objects
\.


--
-- Data for Name: impactype; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.impactype (field, impactype, offence, description, code, field_desc) FROM stdin;
IMPACTYPE	01	0.00	Approaching	Approach	Initial Impact Type
IMPACTYPE	02	0.00	Angle	Angle	Initial Impact Type
IMPACTYPE	03	0.00	Rear End	RearEnd	Initial Impact Type
IMPACTYPE	04	0.00	Sideswipe	SideSwip	Initial Impact Type
IMPACTYPE	05	0.00	Turning Movement	Turning	Initial Impact Type
IMPACTYPE	06	0.00	SMV Unattended Vehicle	SMVUnatd	Initial Impact Type
IMPACTYPE	07	0.00	SMV Other	SMVOther	Initial Impact Type
IMPACTYPE	08	0.00	Pedestrian Collisions	PedestrianColl	Initial Impact Type
IMPACTYPE	99	0.00	Other	Other	Initial Impact Type
IMPACTYPE	09	0.00	Cyclist Collisions	CyclistColl	Initial Impact Type
IMPACTYPE	\N	0.00	\N	Blank	Initial Impact Type
\.


--
-- Data for Name: initdir; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.initdir (field, initdir, offence, description, code, field_desc) FROM stdin;
INITDIR	01	0.00	North	N	Initial Direction of Travel
INITDIR	02	0.00	South	S	Initial Direction of Travel
INITDIR	03	0.00	East	E	Initial Direction of Travel
INITDIR	04	0.00	West	W	Initial Direction of Travel
INITDIR	00	0.00	Unknown	UN	Initial Direction of Travel
INITDIR	\N	0.00	\N	?	Initial Direction of Travel
\.


--
-- Data for Name: injury; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.injury (field, injury, offence, description, code, field_desc) FROM stdin;
INJURY	0	0.00	None	NO	Injuries of involved person
INJURY	1	0.00	Minimal	MI	Injuries of involved person
INJURY	2	0.00	Minor	MR	Injuries of involved person
INJURY	3	0.00	Major	MJ	Injuries of involved person
INJURY	4	0.00	Fatal	FA	Injuries of involved person
INJURY	\N	0.00	\N	OT	Injuries of involved person
\.


--
-- Data for Name: invtype; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.invtype (field, invtype, offence, description, code, field_desc) FROM stdin;
INVTYPE	\N	0.00	Blank; N/A	Blank	Type of Involved Person
INVTYPE	01	0.00	Driver	Driver	Type of Involved Person
INVTYPE	02	0.00	Passenger	Passeng	Type of Involved Person
INVTYPE	03	0.00	Pedestrian	Pedest	Type of Involved Person
INVTYPE	04	0.00	Cyclist	CycDrivr	Type of Involved Person
INVTYPE	05	0.00	Cyclist Passenger	CycPass	Type of Involved Person
INVTYPE	06	0.00	Motorcycle Driver	M/CDrivr	Type of Involved Person
INVTYPE	07	0.00	Motorcycle Passenger	M/CPass	Type of Involved Person
INVTYPE	08	0.00	Moped Driver	MopedDr	Type of Involved Person
INVTYPE	09	0.00	Moped Passenger	MopedPas	Type of Involved Person
INVTYPE	10	0.00	Vehicle Owner	Vehown	Type of Involved Person
INVTYPE	11	0.00	Trailer Owner	Trlown	Type of Involved Person
INVTYPE	12	0.00	Other Property Owner	Othown	Type of Involved Person
INVTYPE	13	0.00	Witness	Witnes	Type of Involved Person
INVTYPE	14	0.00	Victim	Victim	Type of Involved Person
INVTYPE	15	0.00	Company	Compny	Type of Involved Person
INVTYPE	16	0.00	Animal	Animal	Type of Involved Person
INVTYPE	99	0.00	Other	OTHER	Type of Involved Person
INVTYPE	1A	0.00	Unknown - FTR	Unknwn	Type of Involved Person
INVTYPE	1B	0.00	Runaway - No Driver	Runawy	Type of Involved Person
INVTYPE	17	0.00	In-Line Skater	InLineSk	Type of Involved Person
INVTYPE	18	0.00	Truck Driver	TrkDrive	Type of Involved Person
INVTYPE	19	0.00	Wheelchair	WheelCh	Type of Involved Person
INVTYPE	20	0.00	Pedestrian - Not Hit	PedestNH	Type of Involved Person
INVTYPE	21	0.00	Cyclist - Not Hit	CyclistNH	Type of Involved Person
INVTYPE	22	0.00	Driver - Not Hit	DriverNH	Type of Involved Person
\.


--
-- Data for Name: light; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.light (field, light, offence, description, code, field_desc) FROM stdin;
LIGHT	01	0.00	Daylight	Day	Lighting Conditions
LIGHT	03	0.00	Dawn	Dawn	Lighting Conditions
LIGHT	05	0.00	Dusk	Dusk	Lighting Conditions
LIGHT	07	0.00	Dark	Dark	Lighting Conditions
LIGHT	02	0.00	Daylight, artificial	DAYART	Lighting Conditions
LIGHT	04	0.00	Dawn, artificial	DWNART	Lighting Conditions
LIGHT	06	0.00	Dusk, artificial	DSKART	Lighting Conditions
LIGHT	08	0.00	Dark, artificial	DRKART	Lighting Conditions
LIGHT	99	0.00	Other	OTHER	Lighting Conditions
LIGHT	\N	0.00	\N	Blank	Lighting Conditions
\.


--
-- Data for Name: loccoord; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.loccoord (field, loccoord, offence, description, code, field_desc) FROM stdin;
LOCCOORD	01	0.00	Intersection	Intersec	Location Coordinate
LOCCOORD	02	0.00	Mid-Block	MidBlock	Location Coordinate
LOCCOORD	03	0.00	Mid-Block (Abnormal)	N or E	Location Coordinate
LOCCOORD	04	0.00	Exit Ramp Northbound	ExtNorth	Location Coordinate
LOCCOORD	05	0.00	Exit Ramp Southbound	ExtSouth	Location Coordinate
LOCCOORD	06	0.00	Exit Ramp Eastbound	ExtEast	Location Coordinate
LOCCOORD	07	0.00	Exit Ramp Westbound	ExtWest	Location Coordinate
LOCCOORD	08	0.00	Entrance Ramp Northbound	EntNorth	Location Coordinate
LOCCOORD	09	0.00	Entrance Ramp Southbound	EntSouth	Location Coordinate
LOCCOORD	10	0.00	Entrance Ramp Eastbound	EntEast	Location Coordinate
LOCCOORD	11	0.00	Entrance Ramp Westbound	EntWest	Location Coordinate
LOCCOORD	99	0.00	Park, Private Property, Public Lane	PrivProp	Location Coordinate
LOCCOORD	\N	0.00	\N	Blank	Location Coordinate
\.


--
-- Data for Name: manoeuver; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.manoeuver (field, manoeuver, offence, description, code, field_desc) FROM stdin;
MANOEUVER	01	0.00	Going Ahead	GoAhead	Vehicle Manoeuver
MANOEUVER	02	0.00	Slowing or Stopping	Slowing	Vehicle Manoeuver
MANOEUVER	03	0.00	Overtaking	Passing	Vehicle Manoeuver
MANOEUVER	04	0.00	Turning Left	TurnLeft	Vehicle Manoeuver
MANOEUVER	05	0.00	Turning Right	TurnRigh	Vehicle Manoeuver
MANOEUVER	07	0.00	Changing Lanes	ChgLane	Vehicle Manoeuver
MANOEUVER	08	0.00	Merging	Merging	Vehicle Manoeuver
MANOEUVER	09	0.00	Reversing	Reverse	Vehicle Manoeuver
MANOEUVER	00	0.00	Unknown	Unknown	Vehicle Manoeuver
MANOEUVER	06	0.00	Making "U" Turn	UTurn	Vehicle Manoeuver
MANOEUVER	10	0.00	Stopped	Stopped	Vehicle Manoeuver
MANOEUVER	15	0.00	Stopped or Parked	StopPark	Vehicle Manoeuver
MANOEUVER	12	0.00	Disabled	Disabled	Vehicle Manoeuver
MANOEUVER	13	0.00	Pulling Away from Shoulder or Curb	PullAway	Vehicle Manoeuver
MANOEUVER	14	0.00	Pulling Onto Shoulder or towardCurb	PullOnto	Vehicle Manoeuver
MANOEUVER	99	0.00	Other	Other	Vehicle Manoeuver
MANOEUVER	11	0.00	Parked	Parked	Vehicle Manoeuver
MANOEUVER	\N	0.00	\N	Blank	Vehicle Manoeuver
\.


--
-- Data for Name: municipal; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.municipal (field, municipal, offence, description, code, field_desc) FROM stdin;
MUNICIPAL	01	0.00	Toronto	TOR	Municipality
MUNICIPAL	02	0.00	Etobicoke	ETO	Municipality
MUNICIPAL	03	0.00	North York	NYK	Municipality
MUNICIPAL	04	0.00	Scarborough	SCA	Municipality
MUNICIPAL	05	0.00	York	YRK	Municipality
MUNICIPAL	06	0.00	East York	EYK	Municipality
MUNICIPAL	07	0.00	Markham	MAR	Municipality
MUNICIPAL	08	0.00	Vaughan	VAU	Municipality
MUNICIPAL	00	0.00	Unknown	UNK	Municipality
MUNICIPAL	09	0.00	Pickering	PIC	Municipality
MUNICIPAL	10	0.00	Durham	DUR	Municipality
MUNICIPAL	11	0.00	Mississauga	MIS	Municipality
MUNICIPAL	12	0.00	Peel	PEE	Municipality
MUNICIPAL	99	0.00	Outside	O/S	Municipality
MUNICIPAL	13	0.00	MetroToronto	MTO	Municipality
MUNICIPAL	\N	0.00	\N	Blank	Municipality
\.


--
-- Data for Name: pedact; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.pedact (field, pedact, offence, description, code, field_desc) FROM stdin;
PEDACT	01	0.00	Crossing with right of way	CrossROW	Apparent Pedestrian Action
PEDACT	02	0.00	Crossing without right of way	CrsNoROW	Apparent Pedestrian Action
PEDACT	03	0.00	Crossing, no Traffic Control	CrosNoTC	Apparent Pedestrian Action
PEDACT	04	0.00	Crossing, Pedestrian Crossover	CrossPXO	Apparent Pedestrian Action
PEDACT	05	0.00	Crossing marked crosswalk without ROW	CrsXNoRW	Apparent Pedestrian Action
PEDACT	06	0.00	Walking on Roadway with Traffic	WalkTfc	Apparent Pedestrian Action
PEDACT	07	0.00	Walking on Roadway Against Traffic	WalkNoTf	Apparent Pedestrian Action
PEDACT	08	0.00	On Sidewalk or Shoulder	S/WShoul	Apparent Pedestrian Action
PEDACT	09	0.00	Playing or Working on Highway	PlayHigh	Apparent Pedestrian Action
PEDACT	10	0.00	Coming From Behind Parked Vehicle	BehidVeh	Apparent Pedestrian Action
PEDACT	11	0.00	Running onto Roadway	RunOnRd	Apparent Pedestrian Action
PEDACT	12	0.00	Person Getting on/off School Bus	OnOfScBu	Apparent Pedestrian Action
PEDACT	13	0.00	Person Getting on/off Vehicle	OnOffVeh	Apparent Pedestrian Action
PEDACT	14	0.00	Pushing/Working on Vehicle	PushVeh	Apparent Pedestrian Action
PEDACT	99	0.00	Other	Other	Apparent Pedestrian Action
PEDACT	\N	0.00	\N	Blank	Apparent Pedestrian Action
\.


--
-- Data for Name: pedcond; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.pedcond (field, pedcond, offence, description, code, field_desc) FROM stdin;
PEDCOND	\N	0.00	Blank; N/A	Blank	Condition of Pedestrian
PEDCOND	00	0.00	Unknown	Unknown	Condition of Pedestrian
PEDCOND	01	0.00	Normal	Normal	Condition of Pedestrian
PEDCOND	02	0.00	Had Been Drinking	HadDrink	Condition of Pedestrian
PEDCOND	03	0.00	Ability Impaired, Alcohol Over .80	Over.80	Condition of Pedestrian
PEDCOND	04	0.00	Ability Impaired, Alcohol	ImpairAl	Condition of Pedestrian
PEDCOND	05	0.00	Ability Impaired, Drugs	ImpairDr	Condition of Pedestrian
PEDCOND	06	0.00	Fatigue	Fatigue	Condition of Pedestrian
PEDCOND	07	0.00	Medical or Physical Disability	Disabil	Condition of Pedestrian
PEDCOND	08	0.00	Inattentive	Inatten	Condition of Pedestrian
PEDCOND	99	0.00	Other	Other	Condition of Pedestrian
\.


--
-- Data for Name: pedtype; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.pedtype (field, pedtype, offence, description, code, field_desc) FROM stdin;
PEDTYPE	01	\N	Vehicle turns left while ped crosses with ROW at inter.	\N	\N
PEDTYPE	02	\N	Vehicle turns left while ped crosses without ROW at inter.	\N	\N
PEDTYPE	03	\N	Vehicle turns right while ped crosses with ROW at inter.	\N	\N
PEDTYPE	04	\N	Vehicle turns right while ped crosses without ROW at inter.	\N	\N
PEDTYPE	05	\N	Vehicle is going straight thru inter.while ped cross with ROW	\N	\N
PEDTYPE	06	\N	Vehicle is going straight thru inter.while ped cross without ROW	\N	\N
PEDTYPE	08	\N	Pedestrian hit at mid-block	\N	\N
PEDTYPE	09	\N	Pedestrian hit at private driveway	\N	\N
PEDTYPE	10	\N	Pedestrian hit a PXO/ped. Mid-block signal	\N	\N
PEDTYPE	11	\N	Pedestrian hit on sidewalk or shoulder	\N	\N
PEDTYPE	55	\N	Pedestrian hit at parking lot	\N	\N
PEDTYPE	98	\N	Other / Undefined	\N	\N
PEDTYPE	99	\N	Unknown	\N	\N
PEDTYPE	12	\N	Pedestrian involved in a collision with transit vehicle anywhere along roadway	\N	\N
PEDTYPE	13	\N	Vehicle hits the pedestrian walking or running out from between parked vehicles at mid-block	\N	\N
PEDTYPE	14	\N	Vehicle is reversing and hits pedestrian	\N	\N
PEDTYPE	\N	\N	\N	\N	\N
\.


--
-- Data for Name: rdsfcond; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.rdsfcond (field, rdsfcond, offence, description, code, field_desc) FROM stdin;
RDSFCOND	01	0.00	Dry	Dry	Road surface Condition
RDSFCOND	02	0.00	Wet	Wet	Road surface Condition
RDSFCOND	03	0.00	Loose Snow	LSnow	Road surface Condition
RDSFCOND	04	0.00	Slush	Slush	Road surface Condition
RDSFCOND	05	0.00	Packed Snow	PSnow	Road surface Condition
RDSFCOND	06	0.00	Ice	Ice	Road surface Condition
RDSFCOND	07	0.00	Mud	Mud	Road surface Condition
RDSFCOND	08	0.00	Loose Sand or Gravel	Gravel	Road surface Condition
RDSFCOND	09	0.00	Spilled liquid	SPLIQU	Road surface Condition
RDSFCOND	99	0.00	Other	OTHER	Road surface Condition
RDSFCOND	\N	0.00	\N	Blank	Road surface Condition
\.


--
-- Data for Name: safequip; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.safequip (field, safequip, offence, description, code, field_desc) FROM stdin;
SAFEQUIP	00	0.00	Use Unknown	Unknown	Safety Equipment Used
SAFEQUIP	01	0.00	Lap and Shoulder Belt	LapShldr	Safety Equipment Used
SAFEQUIP	02	0.00	Lap Belt Only	Lap	Safety Equipment Used
SAFEQUIP	03	0.00	Lap Belt Only of Combined Assemb	LapCombd	Safety Equipment Used
SAFEQUIP	04	0.00	Child Safety Seat Used Incorrectly	ChildInc	Safety Equipment Used
SAFEQUIP	05	0.00	Child Safety Seat Used Correctly	ChildCor	Safety Equipment Used
SAFEQUIP	06	0.00	Air Bag Deployed	Airbag	Safety Equipment Used
SAFEQUIP	07	0.00	Other Passive Restraint Device	PasiveDv	Safety Equipment Used
SAFEQUIP	08	0.00	Helmet	Helmet	Safety Equipment Used
SAFEQUIP	09	0.00	Equipment Not Used But Available	NotUse	Safety Equipment Used
SAFEQUIP	10	0.00	No Equipment Available	NoEquip	Safety Equipment Used
SAFEQUIP	99	0.00	Other Safety Equipment Used	OtherUse	Safety Equipment Used
SAFEQUIP	\N	0.00	\N	Blank	Safety Equipment Used
\.


--
-- Data for Name: trafctlcond; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.trafctlcond (field, trafctlcond, offence, description, code, field_desc) FROM stdin;
TRAFCTLCOND	01	0.00	Functioning	\N	Traffic control condition
TRAFCTLCOND	02	0.00	Not functioning	\N	Traffic control condition
TRAFCTLCOND	03	0.00	Obscured	\N	Traffic control condition
TRAFCTLCOND	04	0.00	Missing/damaged	\N	Traffic control condition
\.


--
-- Data for Name: traffictl; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.traffictl (field, traffictl, offence, description, code, field_desc) FROM stdin;
TRAFFICTL	01	0.00	Traffic Signal	TrafficSigna	Traffic Control
TRAFFICTL	02	0.00	Stop Sign	StopSign	Traffic Control
TRAFFICTL	03	0.00	Yield Sign	YieldSign	Traffic Control
TRAFFICTL	04	0.00	Pedestrian Crossover	PedCrossing	Traffic Control
TRAFFICTL	05	0.00	Police Control	PoliceContro	Traffic Control
TRAFFICTL	06	0.00	School Guard	SchoolGuard	Traffic Control
TRAFFICTL	07	0.00	School Bus	SchoolBus	Traffic Control
TRAFFICTL	08	0.00	Traffic Gate	TrafficGate	Traffic Control
TRAFFICTL	09	0.00	Traffic Controller	TrafCont	Traffic Control
TRAFFICTL	10	0.00	No Control	NoControl	Traffic Control
TRAFFICTL	99	0.00	PXO - No Ped	PXO NP	Traffic Control
TRAFFICTL	11	0.00	Streetcar (Stop for)	StreetCar	Traffic Control
TRAFFICTL	\N	0.00	\N	Blank	Traffic Control
\.


--
-- Data for Name: vehtype; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.vehtype (field, vehtype, offence, description, code, field_desc) FROM stdin;
VEHTYPE	01	0.00	Automobile, Station Wagon	Automobi	Type of Vehicle
VEHTYPE	02	0.00	Motorcycle	MotCycle	Type of Vehicle
VEHTYPE	03	0.00	Moped	Moped	Type of Vehicle
VEHTYPE	04	0.00	Passenger Van	PassgVan	Type of Vehicle
VEHTYPE	05	0.00	Pick Up Truck	PikupTrk	Type of Vehicle
VEHTYPE	06	0.00	Delivery Van	DelivVan	Type of Vehicle
VEHTYPE	07	0.00	Tow Trunk	TowTruck	Type of Vehicle
VEHTYPE	08	0.00	Truck - Open	TrukOpen	Type of Vehicle
VEHTYPE	09	0.00	Truck - Closed (Blazer, etc)	TrukClos	Type of Vehicle
VEHTYPE	10	0.00	Truck - Tank	TrukTank	Type of Vehicle
VEHTYPE	11	0.00	Truck - Dump	TrukDump	Type of Vehicle
VEHTYPE	12	0.00	Truck - Car Carrier	TrukCarc	Type of Vehicle
VEHTYPE	13	0.00	Truck-Tractor	TrukTrac	Type of Vehicle
VEHTYPE	14	0.00	Municipal Transit Bus (TTC)	TTC	Type of Vehicle
VEHTYPE	15	0.00	Intercity Bus	InterBus	Type of Vehicle
VEHTYPE	16	0.00	Bus (Other) (Go Bus, Gray Coach)	OtherBus	Type of Vehicle
VEHTYPE	17	0.00	School Bus	ScholBus	Type of Vehicle
VEHTYPE	18	0.00	School Van	ScholVan	Type of Vehicle
VEHTYPE	19	0.00	Other School Vehicle/Bus	OthSchol	Type of Vehicle
VEHTYPE	20	0.00	Motor Home	MotorHom	Type of Vehicle
VEHTYPE	21	0.00	Off Road - 2 Wheels	2Wheels	Type of Vehicle
VEHTYPE	22	0.00	Off Road - 3 Wheels	3Wheels	Type of Vehicle
VEHTYPE	23	0.00	Off Road - 4 Wheels	4Wheels	Type of Vehicle
VEHTYPE	24	0.00	Off Road - Other	OthoFroa	Type of Vehicle
VEHTYPE	25	0.00	Motorized Snow Vehicle	MotorSno	Type of Vehicle
VEHTYPE	26	0.00	Farm Tractor	FarmTrac	Type of Vehicle
VEHTYPE	27	0.00	Other Farm Vehicle	OthrFarm	Type of Vehicle
VEHTYPE	28	0.00	Construction Equipment	ConstEqu	Type of Vehicle
VEHTYPE	29	0.00	Railway Train	RlwTrain	Type of Vehicle
VEHTYPE	30	0.00	Street Car	StretCar	Type of Vehicle
VEHTYPE	31	0.00	Snow Plow	SnowPlow	Type of Vehicle
VEHTYPE	32	0.00	Ambulance	Ambulanc	Type of Vehicle
VEHTYPE	33	0.00	Fire Vehicle	FireVehi	Type of Vehicle
VEHTYPE	34	0.00	Police Vehicle	PoliceVh	Type of Vehicle
VEHTYPE	35	0.00	Other Emergency Vehicle	EmergVeh	Type of Vehicle
VEHTYPE	36	0.00	Bicycle	Bicycle	Type of Vehicle
VEHTYPE	37	0.00	Unknown	Unknown	Type of Vehicle
VEHTYPE	32	0.00	Emergency Ambulance	EmgAmbul	Type of Vehicle
VEHTYPE	33	0.00	Emergency Fire Vehicle	EergFire	Type of Vehicle
VEHTYPE	34	0.00	Emergency Police Vehicle	EmgPolic	Type of Vehicle
VEHTYPE	98	0.00	Truck (other)	OthrTruk	Type of Vehicle
VEHTYPE	99	0.00	Other	Other	Type of Vehicle
VEHTYPE	38	\N	Rickshaw	Rickshaw	Type of Vehicle
VEHTYPE	39	\N	Taxi	TaxiCab	Type of Vehicle
VEHTYPE	\N	0.00	\N	Blank	Type of Vehicle
\.


--
-- Data for Name: visible; Type: TABLE DATA; Schema: collision_factors; Owner: -
--

COPY collision_factors.visible (field, visible, offence, description, code, field_desc) FROM stdin;
VISIBLE	01	0.00	Clear	Clear	Visibility conditions
VISIBLE	02	0.00	Rain	Rain	Visibility conditions
VISIBLE	03	0.00	Snow	Snow	Visibility conditions
VISIBLE	07	0.00	Fog, Mist, Smoke, Dust	Fog	Visibility conditions
VISIBLE	04	0.00	Freezing Rain	FZRAIN	Visibility conditions
VISIBLE	05	0.00	Drifting Snow	DRFSNO	Visibility conditions
VISIBLE	06	0.00	Strong wind	STRWND	Visibility conditions
VISIBLE	99	0.00	Other	OTHER	Visibility conditions
VISIBLE	\N	0.00	\N	Blank	Visibility conditions
\.


--
-- Name: collision_id_date_id_seq; Type: SEQUENCE SET; Schema: collision_factors; Owner: -
--

SELECT pg_catalog.setval('collision_factors.collision_id_date_id_seq', 486679, true);


--
-- Name: collision_id_id_seq; Type: SEQUENCE SET; Schema: collision_factors; Owner: -
--

SELECT pg_catalog.setval('collision_factors.collision_id_id_seq', 486670, true);


--
-- PostgreSQL database dump complete
--

