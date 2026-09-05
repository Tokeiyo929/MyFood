--
-- PostgreSQL database dump
--

\restrict ioepfLlaifb1OcYPPXQcT2t6zTNkuTsVBb29xsSRaaK63Xv9LNgZ5LigdTcSAfJ

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg12+1)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
DROP EXTENSION IF EXISTS pg_stat_statements;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: myfood
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO myfood;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


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
9	怪味胡豆	["蚕豆"]	["甜", "辣", "咸"]	偏好吃	myfood/19073f8b8f864e358c8c921f0ca07515.jpg			0		[]
25	高粱饴	["麦芽糖浆", "小麦粉"]	["甜"]	偏好吃	myfood/61f24a629a764fcab24c98b0c2abb463.jpg	圣福记		0		[]
3	花生芝麻包	["芝麻", "花生"]	["甜"]	偏难吃	myfood/7405ca1188974bef917bcd743d311a01.jpg	久号食堂	冷的	0		[]
5	皮蛋瘦肉粥	["皮蛋", "猪肉"]	["咸"]	偏难吃	myfood/26db0f7587c6457788c4d42be212b17a.jpg	久号食堂	不爱吃皮蛋	0		[]
44	黑咖生椰自律豆浆粉	["豆浆粉"]	[]	偏难吃	myfood/968f3627f9034a8ba64c097b4772127a.jpg	九阳豆浆		0		[]
45	茉莉绝弦轻乳茶	["糖"]	["甜"]	偏好吃	myfood/24c94df79bf441e2bc4a3c356709e16e.jpg	每鲜说		0		[]
51	西瓜	["西瓜"]	["甜"]	偏好吃	myfood/05cc8c02c5f14286801f6606f2a823ba.jpg			0		[]
52	干烙蛋糕	["小麦粉"]	["甜", "咸"]	偏好吃	myfood/a4b5d3f075a448908b953d796193e913.jpg	优乐麦		0		[]
53	鹰嘴豆荞麦锅巴	["荞麦粉", "鹰嘴豆粉"]	["咸"]	偏好吃	myfood/4f4beb98dfd748d5be2287ef3f809796.jpg	萃乐麦		0		[]
54	鹰嘴豆	["鹰嘴豆"]	["咸"]	偏好吃	myfood/4982b64f97b54578b560fb71b4619df5.jpg	森林小将		0		[]
57	水果味硬糖	["麦芽糖"]	["甜"]	偏难吃	myfood/655b6dd5333341948f7e52d3c802c134.jpg	金冠		0		[]
60	刺柠吉天然高维C饮料	["白砂糖"]	["酸", "甜", "咸"]	偏好吃	myfood/fda32dfedb8f4766afd25d9a261e55b6.jpg	王老吉		0		[]
10	三明治	["小麦粉"]	["甜"]	偏难吃	myfood/e6112744aebf4016aef8b3a8be294f7a.jpg		糖很假甜，面皮很硬	0		[]
6	灌蛋	["鸭蛋", "猪肉", "蘑菇"]	[]	偏难吃	myfood/296174399bce424dae5ba5385802c552.jpg	福鸣馨	像白开水一样没入味	0		[]
12	沙琪玛	["小麦粉"]	["甜"]	偏好吃	myfood/f23394119d96495eaa32c51e7e2a88b0.jpg			0		[]
16	台湾风味奶茶	["白砂糖"]	["甜"]	偏好吃	myfood/08d8e472a1c9431ca913ee52a553b935.jpg			0		[]
4	胡辣汤	["金针菇", "木耳","蛋花","豆腐"]	["酸", "辣", "咸"]	偏好吃	myfood/075dfbc919fe47ea91b1eb9c643748e6.jpg	久号食堂		0		[]
20	青提栀子果乳茶	["白砂糖"]	["甜"]	偏难吃	myfood/0fcc0333d28c40dc9dfe61b0d02c22a0.jpg	每鲜说	太甜了	0		[]
14	牛肉切片	["素肉"]	["咸"]	偏难吃	myfood/bbaf4d18cc564140b903c396c0695d90.jpg		牛肉的价格，比素肉还难吃	0		[]
19	粘豆包	["花生", "葡萄", "红枣", "红豆"]	["酸"]	偏好吃	myfood/3c49b0f44958487cbace78411dd58c33.jpg	久号食堂		0		[]
11	蜂蜜绿豆饼	["小麦粉", "绿豆沙"]	["甜"]	偏好吃	myfood/640f4ca85ecc4f9e9aaed968dd3ee642.jpg			0		[]
8	肉丸子	["鸡蛋", "猪肉"]	[]	偏好吃	myfood/c83d6a8ef2f54b838c671d618b23ce98.jpg			0		[]
21	幽兰红韵燕麦乳茶	["白砂糖"]	["甜"]	偏难吃	myfood/ce599c0aeda34b2384fa6b5029d547a7.jpg	西麦	太甜了	0		[]
23	辣条	["面筋"]	["辣", "咸"]	偏难吃	myfood/39ba85ffe27045589d6df61370bf6b90.jpg	麻辣王子	太油了	0		[]
22	冷萃冰博客拿铁	["牛奶", "咖啡"]	["甜"]	偏难吃	myfood/e3de826ca4184d2fa1cf1226994ba87e.jpg	NEVERCOFFEE	又甜又腻，热量还高	0		[]
24	亲嘴烧	["面筋"]	["咸"]	偏难吃	myfood/f6d7312705c5481fa7d074dc1b822d6d.jpg	卫龙	面筋太难吃了，太油	0		[]
33	菜包	["胡萝卜", "蘑菇", "小麦粉"]	[]	偏难吃	myfood/356fe82d461146368668b0c373d2352d.jpg	晶晶有味	我不喜欢吃蘑菇	0		[]
37	新疆茯砖牛乳茶	["白砂糖"]	[]	偏难吃	myfood/65305cb9a6c44c79bfad1c067e30b5c2.jpg	哈纳斯	没有味道	0		[]
38	桂满觉陇轻乳茶	["白砂糖"]	["甜"]	偏难吃	myfood/7be09d78a9804477a15a4503d3793ab6.jpg	每鲜说	太甜了	0		[]
40	茉莉雪芽燕麦乳茶	["白砂糖"]	["甜"]	偏难吃	myfood/2a5264f84df04f0284757a014a630a55.jpg	西麦	太甜了	0		[]
42	鸡蛋饼	["鸡蛋", "小麦粉"]	[]	偏好吃	myfood/4de8822a8cc8417a9b5057a1cad19944.jpg	贵哥千层饼		0		[]
18	笋肉烧卖	["笋丝", "猪肉"]	["甜", "咸"]	偏好吃	myfood/7d641f67a45a4519a48cd93898ac8a2f.jpg	大斗烧麦档		0		[]
48	豆浆	["豆浆粉"]	[]	偏难吃	myfood/288d22e556f743b1afdb979bb853e1f6.jpg	久号食堂	太淡了，像在喝水	0		[]
49	红枣红豆浆	["红豆", "豆浆粉"]	["甜"]	偏难吃	myfood/84af45aca3e14bc484e162a80eb8d456.jpg	久号食堂	太淡了，像在喝水	0		[]
50	肉饼汤	["猪肉"]	["甜", "咸"]	偏好吃	myfood/400a07f777e949b29b835ec97bb1f581.jpg	母亲		0		[]
58	冬枣	["冬枣"]	["甜"]	偏难吃	myfood/409f80b3eec546a38012a7bc53bfc178.jpg		不够甜	0		[]
13	鸡蛋灌饼	["小麦粉", "鸡蛋", "火腿肠"]	["甜", "咸"]	偏好吃	myfood/d0228c417dd943f383114032743d87ae.jpg			0		[]
17	奶疙瘩	["白砂糖"]	["甜", "咸"]	偏好吃	myfood/f894ef923323405e982bfa4c32bda6f5.jpg			0		[]
15	千层饼	["小麦粉"]	["咸"]	偏难吃	myfood/ccfd859369454a56a782a46471a76d2e.jpg	富源饼店	冷的	0		[]
26	小笼包	["小麦粉", "猪肉"]	["甜", "咸"]	偏好吃	myfood/8218f9149a2b4f1991008ccb61855141.jpg	永辉小笼包		0		[]
27	肉包	["小麦粉", "猪肉"]	["甜", "咸"]	偏好吃	myfood/85a759c88b644aedaf99937b506f02da.jpg	原东部食堂		0		[]
28	蛋挞	["鸡蛋", "小麦粉", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/e7e42de8c41048a4ab8f44a13cce3354.jpg	肯德基		0		[]
30	肉包	["猪肉", "小麦粉"]	["甜", "咸"]	偏好吃	myfood/3511c8d8dd194de390e76501a089c6b3.jpg	大福包的		0		[]
32	菜肉包	["包菜", "猪肉", "小麦粉"]	["咸"]	偏好吃	myfood/4d652d42bfa34d88b0f54e3ac2bb9980.jpg	晶晶有味		0		[]
34	玫瑰豆沙包	["红豆", "豆沙", "小麦粉"]	["甜"]	偏好吃	myfood/e733409886714a9bb7fa9cb90502191c.jpg	久号食堂		0		[]
36	小笼包	["猪肉", "小麦粉"]	["甜", "咸"]	偏好吃	myfood/f3a6c03a2e5a44b698857deddf071768.jpg	邵武张元肉包		0		[]
39	千层饼	["小麦粉"]	["咸"]	偏好吃	myfood/337653c1afc044e983a9034de6f23002.jpg	贵哥千层饼		0		[]
43	苹果茉莉牛乳茶	["白砂糖"]	["甜"]	偏好吃	myfood/399bad7f27564e64ada920f360f11c98.jpg	蜜雪冰城		0		[]
46	肉包	["猪肉", "小麦粉"]	["咸"]	偏好吃	myfood/5cb94dd529704b31a3cd2ad5f8fa5d11.jpg	晶晶有味		0		[]
7	酱香饼	["小麦粉"]	["辣", "咸"]	偏难吃	myfood/2452617efa474751af91bec7ae1b9807.jpg	富源饼店	冷的	0		[]
61	奶香味东北小花生	["花生"]	["甜", "咸"]	偏好吃	myfood/a42bfd22f7ae4d5884cc93c7d72e91c1.jpg	永信		0		[]
63	芒果	["芒果"]	["甜"]	偏好吃	myfood/d5709631b8f54456bbab27e4f3849cd6.jpg			0		[]
67	黄油千层面包	["小麦粉"]	["咸"]	偏难吃	myfood/a7ac1667ce4d42e9ae10b207edc62b38.jpg	尚谷麦丰		0		[]
78	精选吊瓜子	["吊瓜子"]	["咸"]	偏难吃	myfood/7543a8d69f59464e97162f003926523d.jpg	良品铺子	没什么味道	0		[]
64	香葱薄片饼干	["小麦粉"]	["咸"]	偏难吃	myfood/d64af1002f7e41fd9184a99b0df40cb8.jpg	疯狂饼干城	太油了	0		[]
65	爆浆红豆面包	["小麦粉", "红豆", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/98aae09633ab4f64b1fc829fdffe0410.jpg	优时乐		0		[]
66	蒸原味蛋糕	["小麦粉", "白砂糖"]	["甜", "咸"]	偏难吃	myfood/746136031d93406384fb1fd79f223f2a.jpg	友趣味		0		[]
69	年轮面包	["小麦粉", "白砂糖"]	["甜"]	偏难吃	myfood/cd0c210dae1b4bfaa512a210efb8bc0f.jpg	友趣味		0		[]
71	生椰拿铁	["白砂糖", "奶粉"]	["甜", "苦", "咸"]	偏好吃	myfood/7294264df1be4146a172350da24c869e.jpg	雀巢咖啡		0		[]
73	阳光益菌宝	["白砂糖"]	["酸", "甜"]	偏好吃	myfood/2f9ac9c32d174ae0b604ae6929a3d6db.jpg	阳光		0		[]
74	果粒鲜酪乳草莓树莓风味	["生牛乳", "草莓树莓果酱", "白砂糖"]	["酸", "甜"]	偏好吃	myfood/edfc5fc27b1542f5b79a3e9eee10dbe3.jpg	卡士		0		[]
75	超酸酶条	["青梅", "白砂糖"]	["酸", "甜"]	偏好吃	myfood/7e7d7a10d2344589b650951792d9681e.jpg	良品铺子		0		[]
76	马铃薯薄脆饼	["小麦粉"]	["咸"]	偏好吃	myfood/6e792e301ef74e649ce07506e4b45496.jpg	布特公主		0		[]
77	五香味牙签瓜子	["葵花籽"]	["咸"]	偏好吃	myfood/db11f197e2c644c09b72e4a00298f4ce.jpg	好迪		0		[]
85	甲鱼	["甲鱼"]	["咸"]	偏好吃	myfood/11c59336321042ca913a4403495ebbb3.jpg	父亲		0		[]
84	基围虾	["基围虾"]	["咸"]	偏好吃	myfood/0df6d55b097246cc9359cf95b53ce63c.jpg	父亲		0		[]
81	油麦菜	["油麦菜"]	["咸"]	偏好吃	myfood/fe4839a3fe564d6c83e52807a1a01c23.jpg	父亲		0		[]
92	巧倍滋	["代可可脂", "奶粉", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/d8bda4624b494ff18fa98048575e9035.jpg	不二良品		0		[]
93	香米饼	["大米", "白砂糖"]	["甜", "咸"]	偏难吃	myfood/d692d74cc93546738f3bcc5b2f40a967.jpg	米多奇		0		[]
96	黑芝麻海苔苏打饼	["小麦粉"]	["咸"]	偏好吃	myfood/db233a97d016434e881f7946f71d689c.jpg	杰夫		0		[]
97	NFC西班牙血橙复合果汁饮品	["NFC果汁"]	["酸", "甜"]	偏难吃	myfood/f7976791c4d2407dac2f6ad20bd77769.jpg	蜡笔小新		0		[]
98	半边梅	["李梅", "白砂糖"]	["酸", "甜"]	偏好吃	myfood/2cf204674bbe4e2a8b0f8de308c5b1d7.jpg	和成		0		[]
99	迷你山楂片	["白砂糖", "山楂"]	["酸", "甜"]	偏好吃	myfood/9323d4ad9983427c9a7291a0c921660f.jpg	楂纪		0		[]
101	多味花生	["花生", "小麦粉", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/c9ec719b73274028a76b75b6b8a3bc11.jpg	牡丹亭		0		[]
102	咸蛋黄卷心酥	["小麦粉", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/eb457820a39449de915703e23ce7565e.jpg	图牛		0		[]
104	泰国风味炒米	["米"]	["咸"]	偏好吃	myfood/d0998bd91a9b473ea52efc6eb4fefc93.jpg	浏乡		0		[]
105	香蕉片	["香蕉", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/30cf004365234946812f93d4724df000.jpg	小亲新		0		[]
106	山楂千层	["山楂", "白砂糖"]	["酸", "甜"]	偏好吃	myfood/7be6c68e68f343b9af7c2bdae87ab739.jpg	楂纪		0		[]
107	香酥猫耳朵	["小麦粉", "白砂糖"]	["辣", "咸"]	偏好吃	myfood/4bece2f33900464480f0ea80dc382a1d.jpg	潘氏兄弟		0		[]
100	小麻花	["小麦粉"]	["甜"]	偏好吃	myfood/ef911bc9d6604b3b9769d91f0f8e6859.jpg	亨特		0		[]
112	毛豆	["毛豆", "胡萝卜", "辣椒", "洋葱"]	[]	偏好吃	myfood/bdcd2cc1c27f4edab364e1e68ce84948.jpg	六号餐厅		1		[]
109	千层豆沙卷	["小麦粉", "白砂糖"]	["甜", "咸"]	偏难吃	myfood/ea6cda4f35b7495892e640e357342757.jpg	久号食堂	没味道，没有馅	0		[]
110	辣椒炒肉	["芹菜", "辣椒", "洋葱", "猪肉", "胡萝卜"]	["甜", "咸"]	偏好吃	myfood/fd0295542c5d4583856b477e321df656.jpg	六号餐厅		0		[]
111	梅干菜烧豆腐	["豆腐", "梅干菜"]	["甜", "咸", "酸"]	偏难吃	myfood/3063bb8048fe47388d18326b0ddb879c.jpg	六号餐厅	冷的，太咸了	0		[]
113	黑芝麻核桃包	["小麦粉", "核桃", "黑芝麻"]	["咸"]	偏好吃	myfood/fe3d7fb20af44b6b860976a54af893cc.jpg	久号食堂		0		[]
62	香浓牛奶味薄脆饼干	["小麦粉", "白砂糖"]	["甜", "咸"]	偏难吃	myfood/8f1c83f841d24eb3893d01e98fba04d8.jpg	疯狂饼干城	太油了	0		[]
79	炒粉	["粉丝", "猪肉", "青菜"]	["辣", "咸"]	偏好吃	myfood/b86f20c2eb4145f09647257181b44946.jpg	父亲		0		[]
80	黄鱼	["黄鱼"]	["辣", "咸"]	偏难吃	myfood/c726434246fa444b83244609df852179.jpg	父亲	有点咸了	0		[]
82	凉拌牛肉	["牛肉"]	["酸", "甜", "辣", "咸"]	偏好吃	myfood/093aeb165bf64197b339abba450e3606.jpg	父亲		0		[]
83	藕条	["藕"]	["咸"]	偏好吃	myfood/ff02e8be5df141309adbb391b4d40e00.jpg	父亲		0		[]
86	鸡爪	["鸡爪"]	["咸"]	偏好吃	myfood/558968fbcfb741d8ba7557f12705fc22.jpg	父亲		0		[]
88	干豆角烧肉	["干豆角", "红烧肉"]	["甜", "咸"]	偏好吃	myfood/833877d6ca5d472e9712dd325d970273.jpg	父亲		0		[]
89	拍黄瓜	["黄瓜"]	["酸", "甜", "咸"]	偏好吃	myfood/27669e2fcdbc4b8c8cf4921748420e7a.jpg	父亲		0		[]
90	肥肠	["肥肠", "洋葱", "辣椒"]	["甜", "辣"]	偏好吃	myfood/c80d59a7271d454c86ebcb2ddf4951ec.jpg	父亲		0		[]
91	冰糖葫芦	["山楂"]	["甜"]	偏难吃	myfood/b868d3c8983345ddb0201bd99bf04115.jpg	迈恺迪	没什么味道	0		[]
103	马铃薯薄饼干	["小麦粉"]	["咸"]	偏难吃	myfood/0ee59c9213ee4e518f8eaf32305a3712.jpg	疯狂饼干城	太油了	0		[]
68	绵白拿铁	["奶粉", "白砂糖"]	["苦", "咸"]	偏难吃	myfood/2852e010c63e452db9c5dd5b2a55add6.jpg	瑞幸咖啡		0		[]
29	肉包	["猪肉", "小麦粉"]	[]	偏难吃	myfood/001e754efec842c698ba530e1cbcc5c4.jpg	六意	肉太假了，和速冻水饺差不多	0		[]
47	酱肉包	["猪肉", "小麦粉"]	["咸"]	偏难吃	myfood/b9dee60057754596803c4f75cf5db21a.jpg	馒笼喜	太咸了	0		[]
95	麻花	["小麦粉"]	["甜"]	偏好吃	myfood/1c3dbe749ddd4aa1ae6094fc974daef3.jpg	安宁晋福		0		[]
59	清新草莓味夹心饼干	["小麦粉", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/b86e264326e04131b18eee19c90ead0c.jpg	奥利奥		0		[]
72	手标泰式茶	["红茶粉", "白砂糖"]	["苦"]	偏难吃	myfood/e03421eedc314a6e9c11168dc48e207d.jpg	ChaTraMue	没什么味道	0		[]
87	笋丝	["笋丝", "芹菜", "猪肉"]	["咸"]	偏难吃	myfood/18a9d902b7274b07a1da85125d698380.jpg	父亲	味道有点清淡	0		[]
108	海蛎煎	["豆芽", "鸡蛋", "海蛎", "小麦粉", "生菜"]	["甜"]	偏难吃	myfood/2889a97092874188b5635ffd269c2296.jpg	陈家蚵仔煎	有点咸，虽然馅料很足，性价比很高	0		[]
114	土豆烧鸡	["土豆", "鸡块"]	[]	偏好吃	myfood/ff3020af32644e1a92d86b295114ddcf.jpg	六号餐厅		0		[]
115	洋葱炒蛋	["洋葱", "鸡蛋"]	["甜"]	偏好吃	myfood/1e0ca3813d6f48ec87f8d9a2d0765ddd.jpg	六号餐厅		0		[]
116	手撕包菜	["包菜"]	["咸", "辣"]	偏好吃	myfood/3ede86f932ea46d49be90c7d8f8930a3.jpg	六号餐厅		0		[]
117	芋泥味三明治面包	["小麦粉", "白砂糖", "芋泥沙拉酱"]	["咸", "甜"]	偏好吃	myfood/c1b3b7a6c1604a2ea5e85960a86ac9e1.jpg	宜顶		0		[]
118	板栗饼	["小麦粉", "白砂糖", "板栗", "绿豆"]	["咸", "甜"]	偏好吃	myfood/7c93d043fbd84624904783ef55abc52f.jpg	丽林		0		[]
119	黑椒牛肉米饭	["米饭", "蘑菇", "牛肉"]	["咸", "甜", "辣"]	偏好吃	myfood/9825824ec73240a8803dbb2e77b26e46.jpg			0		[]
120	紫薯卷	["小麦粉", "紫薯"]	[]	偏难吃	myfood/49a2d8da3f6845cba64e23ee36a02435.jpg	久号食堂	没啥味，不够甜	0		[]
121	洋葱炒肉	["猪肉", "洋葱", "甜椒"]	["甜", "咸"]	偏好吃	myfood/3c97f3647ca54d33b56dcc3509d3c5fd.jpg	荷叶饭		0		[]
122	手撕包菜	["包菜"]	["甜"]	偏好吃	myfood/382455be2f8047068780d5bbf8e175c5.jpg	荷叶饭		0		[]
123	红烧豆腐	["豆腐"]	["咸", "辣"]	偏好吃	myfood/314f9d460f794bed9dd0424adb048264.jpg	荷叶饭		0		[]
124	油淋生菜	["生菜"]	["甜"]	偏好吃	myfood/8e43d226a7724d7abdbb0e54941b491c.jpg	荷叶饭		0		[]
126	豆腐	["豆腐"]	["咸", "辣"]	偏好吃	myfood/d46259767ccb4947bb23eba77f22ea86.jpg			0		[]
127	西红柿炒蛋	["西红柿", "鸡蛋"]	["酸", "甜"]	偏难吃	myfood/e9a5e2adf48b49aea6432fe2ebed7535.jpg	大碗先生	我一直不喜欢福州的西红柿炒蛋，太甜了	0		[]
128	桃山月饼	["麦芽糖", "白芸豆", "白砂糖"]	["甜", "咸"]	偏好吃	myfood/ec33ce2a1e50411e9439667b2fb93c60.jpg	食滋源		0		[]
129	肉松饼	["小麦粉", "白砂糖", "鸡肉松"]	["咸"]	偏好吃	myfood/724193ddee4c48e9b45db3fca4c8be3c.jpg	友臣		0		[]
130	老婆饼	["糯米粉", "白砂糖"]	["咸", "甜"]	偏难吃	myfood/7d974d7cd73d4ee1baec41c08ab0951a.jpg	麦可佳	太油了	0		[]
132	面线糊	["面线", "胡萝卜"]	["咸"]	偏好吃	myfood/8e4d468f9e4e4f958ca02f11cedb5e74.jpg	久号食堂		0		[]
131	酸菜粉丝包	["粉丝", "腌菜", "猪肉"]	["咸", "酸"]	偏难吃	myfood/b2a2d328b84143149508af81331897f5.jpg	久号食堂	碳水加碳水	0		[]
2	八宝粥	["红枣", "葡萄", "红豆","桂圆"]	["甜"]	偏难吃	myfood/2befa9bd97ae4b6da82bac40497d1e3c.jpg	久号食堂	变稀了，和喝水一样，也不甜，没味	0		[]
134	清新抹茶本味好丽友派	["小麦粉", "白砂糖"]	["甜"]	偏好吃	myfood/30be90cd149c4eb0aa97645ab3c630c7.jpg	好丽友		0		[]
135	蒸蛋	["鸡蛋", "猪肉"]	["咸"]	偏好吃	myfood/ce3075f645c24a19944f77ac2a3f3861.jpg	六号餐厅		0		[]
136	韭菜炒蛋	["韭菜", "胡萝卜", "鸡蛋"]	["咸", "辣"]	偏难吃	myfood/de5959c1cda745dbbf2cfd05667481e0.jpg	六号餐厅	韭菜生的，没炒熟	0		[]
137	榴莲饼	["小麦粉", "白砂糖", "绿豆"]	["咸", "甜"]	偏好吃	myfood/5ef8a862bbd64b89be462c53c3033512.jpg	老饼店		0		[]
138	黑芝麻芡实糕	["大米粉", "糯米粉", "麦芽糖"]	["咸"]	偏难吃	myfood/9ac3011f89394e2e955cf16285fb16c9.jpg	桂笙记	米糕都没什么味道	0		[]
139	豆腐	["豆腐"]	["咸"]	偏好吃	myfood/6af23e433bb34449a593f81a9f1c7c37.jpg	大碗先生		0		[]
149	腐竹	["腐竹", "木耳", "芹菜", "洋葱"]	["甜", "咸"]	偏好吃	myfood/323ffa4522784cce952bd88460a58e6a.jpg	名轩食堂		0		[]
140	手撕包菜	["包菜"]	["咸", "甜"]	偏好吃	myfood/66133ded0b674d789d7bb5ed883da6cb.jpg	大碗先生		0		[]
141	流心冰皮月饼	["麦芽糖浆", "芸豆"]	["甜"]	偏难吃	myfood/f888666588f041b4b11123e938260727.jpg	食滋源	不甜也不香，表皮的口感像口香糖，内馅又太甜的麦芽糖	0		[]
142	乳酸菌面包	["乳酸菌味沙拉酱", "小麦粉"]	["甜"]	偏好吃	myfood/3312ede09dcd4d6dac3e39c4f3839346.jpg	豪士		0		[]
143	法式乳酪饼	["白砂糖", "豌豆", "小麦粉"]	["甜", "咸"]	偏好吃	myfood/55f52bb7a42a40f9bbaa926ff173f261.jpg	食滋源		0		[]
144	蛋皮吐司面包	["小麦粉", "白砂糖"]	["咸", "甜"]	偏好吃	myfood/e702f7bd5ea14a1393bb08edf015dddc.jpg	豪士		0		[]
145	素菜包	["包菜", "蘑菇"]	["咸"]	偏难吃	myfood/ef7ec0c02e1a43eea93a0f42254d0757.jpg	久号食堂	我不喜欢蘑菇味	0		[]
147	菠萝大口袋面包	["菠萝果酱", "麦芽糖浆", "白砂糖"]	["甜"]	偏难吃	myfood/63cb7205d0b242d894f07e07e6f46cd6.jpg	焙宁	果酱太甜了	0		[]
31	肉包	["小麦粉", "猪肉"]	["甜", "咸"]	偏好吃	myfood/aebb016a4e504b62a3a35b5423c71502.jpg	传统包子		0		[]
55	金条代可可脂巧克力	["代可可脂"]	["甜"]	偏难吃	myfood/bc5d678acec44a8599fdb263cf88dd32.jpg	超达	很假的巧克力，软化了	0		[]
146	瑞士卷	["鸡蛋", "白砂糖", "小麦粉"]	[]	偏难吃	myfood/859972fa1c6a4f5eb3a02af9bcf23e52.jpg	达利园	太甜了，而且除了甜就没什么味道	0		[]
148	达利园派	["小麦粉", "白砂糖", "粉末油脂"]	["甜"]	偏难吃	myfood/7295e80680074ade8d916c22f59064cf.jpg	达利园	就是饼干裹一层巧克力加起泡油沫	0		[]
151	麻婆豆腐	["豆腐"]	["甜", "辣", "咸"]	偏好吃	myfood/91e3fa7380714ed9aac556a113caf4c9.jpg	名轩食堂		0		[]
152	火腿卷	["小麦粉", "热狗"]	["咸"]	偏难吃	myfood/3aa929cf6829464bb2f657bd5e614ba5.jpg	久号食堂	料很真实，真烟熏肠，比其他淀粉肠好多了，但是有点咸，而且面粉太厚了	0		[]
153	绵绵蛋黄派	["小麦粉", "白砂糖", "鸡蛋"]	["甜", "咸"]	偏好吃	myfood/97d316215da8444f824b7d3fb88aea0d.jpg	好丽友		0		[]
150	秋刀鱼	["秋刀鱼"]	["咸"]	偏好吃	myfood/d303e25913d8468cab6a17201d58c6f4.jpg	名轩食堂		0		[]
133	蛋黄酥	["小麦粉", "麦芽糖"]	["甜", "咸"]	偏难吃	myfood/8301f8d180a348b4b15ab7418044fbc7.jpg	泓一	闻起来鸡蛋香很浓，但吃起来没味	0		[]
154	巧克力蛋糕	["白砂糖", "可可粉", "小麦粉"]	["甜"]	偏好吃	myfood/522fe72813fb450bbe7dc796b6dd7141.jpg	唇动		0		[]
125	腐竹	["腐竹", "木耳"]	["甜"]	偏好吃	myfood/3972d3b38852464c8de2641830fda258.jpg			2		[]
155	豆角	["豆角"]	["咸"]	偏难吃	myfood/c5d9bba21a2f4f06b83b14999e58adce.jpg	大碗先生	有点咸	0		[]
156	凉拌豆皮	["豆皮"]	["咸"]	偏难吃	myfood/1cd09c1ff3cc4dc2987170bdcd09db5b.jpg	大碗先生	有点咸	0		[]
157	蛋黄味达利园派	["小麦粉", "白砂糖", "鸡蛋"]	["甜"]	偏难吃	myfood/434778f7a4f04a7a9dfe8ae1427184ba.jpg	达利	没什么味道，有点甜，和好丽友差远了	0		[]
158	抹茶味豆豆曲奇	["小麦粉", "麦芽糖浆", "抹茶味糕点酱"]	["甜"]	偏好吃	myfood/f89aa70656eb48d3b17b59df264a4cd3.jpg	黑士		0		[]
159	草莓味达利园派	["小麦粉", "白砂糖", "鸡蛋"]	["甜"]	偏好吃	myfood/1e33e3c1e5cb4e31a038b3f604dc8809.jpg	达利		0		[]
160	槟榔	["槟榔"]	["甜"]	偏难吃	myfood/94cddda5d70f4e3cae6eb1305d664803.jpg	小和醇	吃完喉咙一直是凉的，比口香糖猛多了去，一直想吞口水，面部发麻，喉咙凉的有点痛，像是被什么东西压住了	0		[]
162	芝士肉松三明治	["小麦粉", "芝士味沙拉酱", "鸡肉松"]	["甜", "咸"]	偏好吃	myfood/86aac8eae373497ca0d662a36451854d.jpg	豪士		0		[]
163	好丽友派	["小麦粉", "白砂糖", "可可粉"]	["甜"]	偏好吃	myfood/cb3cd076ad9f485085b8037795f11462.jpg	好丽友		0		[]
161	咸香酥	["小麦粉", "白砂糖", "香葱"]	["甜", "咸"]	偏难吃	myfood/5296c8f4b0b84a53a0caf2f324718cf7.jpg	戴哥	葱油糖的感觉，葱辣加糖甜，但是太油了	0		[]
164	肉沫太阳蛋	["鸡蛋", "猪肉"]	["甜", "咸"]	偏好吃	myfood/8a66ab72b39d442da6f7ee79e2e18368.jpg	京元食堂		0		[]
165	豆芽	["豆芽", "芹菜", "胡萝卜"]	["甜"]	偏好吃	myfood/b906fe3391a2436fbbdceca39823fae5.jpg	京元食堂		0		[]
166	酸菜豆腐	["豆腐", "腌菜"]	["酸", "甜", "咸"]	偏好吃	myfood/99ad486239aa43d8a9615ec67bc49e85.jpg	京元食堂		0		[]
167	红丝绒巧克力蛋糕	["小麦粉", "白砂糖", "草莓树莓果酱"]	["甜"]	偏好吃	myfood/8d6a536484c346fabf8818c303484a9c.jpg	唇动		0		[]
168	蛋皮流心吐司	["小麦粉", "白砂糖", "蛋皮"]	["甜"]	偏好吃	myfood/a97ece8224344731a0cd906b592b626a.jpg	焙宁		0		[]
169	凉拌藕片	["藕"]	["酸", "甜"]	偏好吃	myfood/5ff07ce855a24dcab22d72088c785537.jpg	大碗先生		0		[]
170	笋	["笋"]	["甜", "咸"]	偏好吃	myfood/fc62893c46354aee8605f6b5e331f8bb.jpg	大碗先生		0		[]
171	花菜炒肉	["西兰花", "花菜", "猪肉"]	["咸"]	偏好吃	myfood/fd59364c37ca4d70b2e3fccd9bb37e11.jpg	大碗先生		0		[]
172	小礼饼	["小麦粉", "白砂糖", "花生"]	["甜", "咸"]	偏好吃	myfood/37e0d256c6cb47f886964b092cdb0a96.jpg	百饼园		0		[]
173	凤梨酥	["小麦粉", "葡萄糖浆"]	["甜"]	偏难吃	myfood/0f91d7ec421a4609b34e820b338dcc51.jpg	徐福记	甜，酥饼也不好吃	0		[]
175	巧克力蛋皮吐司	["小麦粉", "白砂糖", "蛋皮糕点预拌粉"]	["甜"]	偏好吃	myfood/b308c0c0a54b4696bda93d1aedf00943.jpg	豪士		0		[]
176	蔓越莓白巧克力涂饰蛋糕	["小麦粉", "白砂糖", "代可可脂", "蔓越莓"]	["甜"]	偏难吃	myfood/caff3383018e4effa94a9112fc4b5d52.jpg	泓一	甜很廉价不好吃	0		[]
177	牛杂牛肉丸粿条	["生菜", "豆芽", "粿条", "牛杂"]	["咸"]	偏好吃	myfood/a3b419e773e7429bac9718d505eff663.jpg	潮兴记		0		[]
178	黑椒味烤肠	["烤肠"]	["咸"]	偏好吃	myfood/87c6bdd88dd845c3a2805e1ace64238c.jpg	皇家小虎		0		[]
179	黑胡椒牛肉堡	["小麦粉", "白砂糖", "牛肉"]	["甜"]	偏难吃	myfood/520614db5cc64bc1bc524216c2056ae9.jpg	cc	很难吃，完全没有肉味，像果冻一样，面皮还行松软，沙拉酱也正常	0		[]
180	光饼	["小麦粉"]	["咸"]	偏难吃	myfood/3843c2edeec94f6b9ffe6cb7c36334f1.jpg	庆城林华光饼	硬馒头，除了便宜没什么好吃的	0		[]
181	鸡蛋豆芽饼	["豆芽", "鸡蛋", "海带", "火腿肠", "小麦粉"]	["酸", "辣", "咸"]	偏难吃	myfood/85356e15ae294426a0bd3bc9e5d2f840.jpg	银仙老店	其实是好吃的，但是我很讨厌老板的态度，做法很糊弄，搅吧搅吧就好了，我都没说就直接给我上了大满贯，价格也贵，12元，有这钱我不如去六号吃一荤两素，油腻	0		[]
182	包菜	["包菜"]	["甜", "咸"]	偏好吃	myfood/7aaabc91a0774625b7ecac36ccadbd1f.jpg	港式烧腊		0		[]
183	娃娃菜	["娃娃菜", "日本豆腐"]	["甜"]	偏好吃	myfood/d6bedd4c7b774d42822d115d45b1ed67.jpg	港式烧腊		0		[]
184	豆腐	["豆腐"]	["咸"]	偏好吃	myfood/d89eb60e43e44c54b5dd0ab8a0406146.jpg	港式烧腊		0		[]
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: myfood
--

COPY public.tags (id, name, category) FROM stdin;
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
1	麻薯	中式糕点
\.


--
-- Name: foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myfood
--

SELECT pg_catalog.setval('public.foods_id_seq', 184, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myfood
--

SELECT pg_catalog.setval('public.tags_id_seq', 50, true);


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
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT wal_buffers_full bigint, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT parallel_workers_to_launch bigint, OUT parallel_workers_launched bigint, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT wal_buffers_full bigint, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT parallel_workers_to_launch bigint, OUT parallel_workers_launched bigint, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO myfood;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO myfood;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO myfood;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO myfood;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO myfood;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO myfood;


--
-- PostgreSQL database dump complete
--

\unrestrict ioepfLlaifb1OcYPPXQcT2t6zTNkuTsVBb29xsSRaaK63Xv9LNgZ5LigdTcSAfJ

