--
-- PostgreSQL database dump
--

\restrict YBSJd43ugjBLUiweVQkvesjQpbcESaA9mUlOWQwFyjpp21e1tNAO2tG5RbgJSiH

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

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

ALTER TABLE IF EXISTS ONLY public.tags DROP CONSTRAINT IF EXISTS tags_pkey;
ALTER TABLE IF EXISTS ONLY public.tags DROP CONSTRAINT IF EXISTS tags_name_key;
ALTER TABLE IF EXISTS ONLY public.foods DROP CONSTRAINT IF EXISTS foods_pkey;
ALTER TABLE IF EXISTS public.tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.foods ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.tags_id_seq;
DROP TABLE IF EXISTS public.tags;
DROP SEQUENCE IF EXISTS public.foods_id_seq;
DROP TABLE IF EXISTS public.foods;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: foods; Type: TABLE; Schema: public; Owner: myfood
--

CREATE TABLE public.foods (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    ingredients text NOT NULL,
    flavors text NOT NULL,
    preference character varying(32) NOT NULL,
    image_path character varying(500) DEFAULT ''::character varying NOT NULL,
    brand_name character varying(255) DEFAULT ''::character varying NOT NULL,
    dislike_reason character varying(500) DEFAULT ''::character varying NOT NULL,
    repurchase_count integer DEFAULT 0 NOT NULL,
    category character varying(255) DEFAULT ''::character varying NOT NULL,
    tags text DEFAULT '[]'::text NOT NULL
);


ALTER TABLE public.foods OWNER TO myfood;

--
-- Name: foods_id_seq; Type: SEQUENCE; Schema: public; Owner: myfood
--

CREATE SEQUENCE public.foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.foods_id_seq OWNER TO myfood;

--
-- Name: foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myfood
--

ALTER SEQUENCE public.foods_id_seq OWNED BY public.foods.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: myfood
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(255) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.tags OWNER TO myfood;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: myfood
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO myfood;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myfood
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: foods id; Type: DEFAULT; Schema: public; Owner: myfood
--

ALTER TABLE ONLY public.foods ALTER COLUMN id SET DEFAULT nextval('public.foods_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: myfood
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: myfood
--

COPY public.foods (id, name, ingredients, flavors, preference, image_path, brand_name, dislike_reason, repurchase_count, category, tags) FROM stdin;
1	台湾风味奶茶	["白糖"]	["甜"]	偏好吃	myfood/23cf459ed95041b7b165e2dadfb92b9e.jpg			0		[]
2	奶疙瘩	["牛奶", "白糖"]	["甜"]	偏难吃	myfood/80225ab2c4b94ec781714af669cf4d07.jpg			0		[]
3	肉包	["面粉", "猪头"]	[]	偏难吃	myfood/39f02019314f405c86b6e95811792e14.jpg			0		[]
5	1	["1"]	["酸"]	偏好吃		1		0		[]
4	肉丸子	["鸡蛋", "猪肉"]	[]	偏好吃	myfood/01026bf3745d4aaaa7eb4fe715fe2ce8.jpg			0		[]
8	3	["3"]	["辣"]	偏难吃		3		0		[]
6	2	["2"]	["酸"]	偏难吃		2		0		[]
7	肉丸子	["1"]	["辣"]	偏难吃		撒谎杜绝爱上		0		[]
12	1	["1"]	["苦"]	偏难吃		1	1	0		[]
17	1	["1"]	["甜"]	偏难吃		1	1	0		[]
13	1	["1"]	["酸", "甜"]	偏难吃		1		0		[]
16	1	["1"]	["甜", "酸"]	偏难吃		1	就是难吃	2		[]
15	1	["1"]	["酸", "甜"]	偏难吃		1	的撒	1		[]
14	1	["1"]	["酸", "甜"]	偏难吃		1	1	1		[]
11	一二三四五六七八九十十一	["一二三四五六七八九十十一"]	["甜"]	偏难吃		一二三四五六七八九十十一	1	0		[]
9	1	["1"]	["苦"]	偏难吃		11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111	1	0		[]
10	1	["1"]	["酸"]	偏难吃		一二三四五六七八九十十一	1	1		[]
18	1	["小麦粉"]	["酸"]	偏好吃		1		0		[]
19	1	["1", "231", "222"]	["酸"]	偏好吃		1		0		[]
20	1	["11", "22", "33"]	["酸"]	偏好吃		1		0		[]
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: myfood
--

COPY public.tags (id, name, category) FROM stdin;
1	麻麻	中式糕点
2	我要	中式糕点
3	排练	中式糕点
4	米米	中式糕点
5	壹壹	中式糕点
6	富贵	中式糕点
7	紙	中式糕点
8	鑫茶	中式糕点
9	南瓜饼	中式糕点
10	板栗饼	中式糕点
11	榴莲饼	中式糕点
12	薏米糕	中式糕点
13	老婆饼	中式糕点
14	芋泥饼	中式糕点
15	芡实糕	中式糕点
16	桂花糕	中式糕点
17	凤梨酥	中式糕点
18	绿豆饼	中式糕点
19	芝麻饼	中式糕点
20	绿豆糕	中式糕点
21	肉松饼	中式糕点
22	鲜花饼	中式糕点
23	雪花酥	中式糕点
24	沙琪玛	中式糕点
25	蛋黄酥	中式糕点
\.


--
-- Name: foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myfood
--

SELECT pg_catalog.setval('public.foods_id_seq', 20, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myfood
--

SELECT pg_catalog.setval('public.tags_id_seq', 125, true);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: myfood
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: myfood
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: myfood
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict YBSJd43ugjBLUiweVQkvesjQpbcESaA9mUlOWQwFyjpp21e1tNAO2tG5RbgJSiH

