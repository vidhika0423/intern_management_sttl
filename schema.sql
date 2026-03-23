--
-- PostgreSQL database dump
--

\restrict jUMmlUbWpOFWTyZlzGkRhW6ywLCNuB9OF58mKXWmKi7DcMatItdLD4H2BrXbQ8b

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-23 15:57:32

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

--
-- TOC entry 6 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3591 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 16702)
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_by uuid,
    title character varying(200) NOT NULL,
    body text NOT NULL,
    audience character varying(30) DEFAULT 'all'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT announcements_audience_check CHECK (((audience)::text = ANY ((ARRAY['all'::character varying, 'interns_only'::character varying, 'mentors_only'::character varying])::text[])))
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16651)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intern_id uuid NOT NULL,
    date date NOT NULL,
    check_in time without time zone,
    check_out time without time zone,
    status character varying(20) DEFAULT 'present'::character varying,
    notes text,
    CONSTRAINT attendance_status_check CHECK (((status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'half_day'::character varying, 'wfh'::character varying])::text[])))
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16586)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    head_user_id uuid,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16688)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intern_id uuid NOT NULL,
    type character varying(50),
    file_url text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16668)
-- Name: evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intern_id uuid NOT NULL,
    evaluator_id uuid,
    score integer,
    feedback text,
    period character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT evaluations_score_check CHECK (((score >= 1) AND (score <= 10)))
);


ALTER TABLE public.evaluations OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16718)
-- Name: intern_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.intern_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intern_id uuid NOT NULL,
    given_by uuid,
    type character varying(20),
    message text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT intern_feedback_type_check CHECK (((type)::text = ANY ((ARRAY['positive'::character varying, 'negative'::character varying, 'neutral'::character varying])::text[])))
);


ALTER TABLE public.intern_feedback OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16600)
-- Name: interns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    department_id uuid,
    mentor_id uuid,
    status character varying(20) DEFAULT 'active'::character varying,
    start_date date NOT NULL,
    end_date date,
    college character varying(150),
    position_title character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    cgpa numeric(3,1),
    city character varying(100),
    skills text[],
    languages text[],
    experience_level character varying(20),
    CONSTRAINT interns_cgpa_check CHECK (((cgpa >= (0)::numeric) AND (cgpa <= (10)::numeric))),
    CONSTRAINT interns_experience_level_check CHECK (((experience_level)::text = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::text[]))),
    CONSTRAINT interns_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'terminated'::character varying])::text[])))
);


ALTER TABLE public.interns OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16628)
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intern_id uuid NOT NULL,
    assigned_by uuid,
    title character varying(200) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'todo'::character varying,
    priority character varying(10) DEFAULT 'medium'::character varying,
    due_date date,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['todo'::character varying, 'in_progress'::character varying, 'in_review'::character varying, 'done'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16574)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'mentor'::character varying, 'intern'::character varying, 'hr'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3584 (class 0 OID 16702)
-- Dependencies: 224
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, created_by, title, body, audience, created_at) FROM stdin;
18279361-1cfc-4332-aa8a-80794111519b	16d14e29-32fa-4bf8-80c7-96745dc0af92	Welcome to Summer Internship 2025!	We are excited to welcome all our interns for the Summer 2025 batch.	all	2026-03-23 10:13:56.776327
f61db5f9-6dd5-4400-8a0d-37f6324bc892	16d14e29-32fa-4bf8-80c7-96745dc0af92	Weekly standup schedule	All interns must attend Monday 10am standup.	interns_only	2026-03-23 10:13:56.776327
99eba78f-71a6-474e-b56e-ba0ed0608e66	16d14e29-32fa-4bf8-80c7-96745dc0af92	Mentor evaluation reminder	Please submit intern evaluations for Week 4 by Friday.	mentors_only	2026-03-23 10:13:56.776327
\.


--
-- TOC entry 3581 (class 0 OID 16651)
-- Dependencies: 221
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, intern_id, date, check_in, check_out, status, notes) FROM stdin;
0895955c-d99b-4e55-84d0-f7fbce931e3e	3e8ce5cc-9837-4cb8-be22-dc6241d9a000	2025-07-01	09:05:00	18:10:00	present	\N
bf5d50fb-a810-478b-ba3c-9408442f54de	3e8ce5cc-9837-4cb8-be22-dc6241d9a000	2025-07-02	09:15:00	18:00:00	present	\N
ec0fcee0-39f8-416b-a5f1-9c8a2cd70aff	3e8ce5cc-9837-4cb8-be22-dc6241d9a000	2025-07-03	\N	\N	absent	\N
2115e8f1-c6e6-4434-b7c4-9d979db684f6	d50080b0-8af6-428a-b093-da937f2a750a	2025-07-01	09:00:00	18:00:00	present	\N
5e977848-e6ca-488d-8535-b93c0b9c1139	d50080b0-8af6-428a-b093-da937f2a750a	2025-07-02	09:30:00	14:00:00	half_day	\N
d0f193cb-3947-40a3-a248-be23f95192e9	d87b4932-304f-415d-9812-30dda92874de	2025-07-01	10:00:00	18:30:00	wfh	\N
48cd5392-f76f-4801-9aef-e3972df30bf8	d87b4932-304f-415d-9812-30dda92874de	2025-07-02	09:00:00	18:00:00	present	\N
423be3b0-36f7-42e4-a816-659718e8c612	d174344d-c347-49ac-b3b9-3ea2c49969e0	2025-07-01	09:10:00	18:05:00	present	\N
\.


--
-- TOC entry 3578 (class 0 OID 16586)
-- Dependencies: 218
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, description, head_user_id, created_at) FROM stdin;
ffa47aef-9ebb-47f1-a366-79ecaba022b6	Engineering	Software development and tech	\N	2026-03-23 10:13:56.776327
74a7733f-e3d3-48f0-b558-466bd36f08f5	Design	UI/UX and product design	\N	2026-03-23 10:13:56.776327
5e911d64-dece-45f1-8d60-9be7eea3f9c3	Marketing	Growth and communications	\N	2026-03-23 10:13:56.776327
97cc59b3-ede6-4071-aed3-cb489027b650	HR	Human resources and operations	\N	2026-03-23 10:13:56.776327
\.


--
-- TOC entry 3583 (class 0 OID 16688)
-- Dependencies: 223
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, intern_id, type, file_url, uploaded_at) FROM stdin;
\.


--
-- TOC entry 3582 (class 0 OID 16668)
-- Dependencies: 222
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluations (id, intern_id, evaluator_id, score, feedback, period, created_at) FROM stdin;
a02c6ead-944a-4df5-8160-65cdb4760fc7	3e8ce5cc-9837-4cb8-be22-dc6241d9a000	4253d38d-4a1d-4ce3-9419-342a930d1859	8	Rahul shows strong initiative and picks up concepts quickly.	Week 4	2026-03-23 10:13:56.776327
0ddd4236-5ec3-4cea-b3ee-3ed8bc93584d	d50080b0-8af6-428a-b093-da937f2a750a	ea0f3808-74ba-470d-a6c1-93abe63efc16	9	Sneha delivers exceptional design work. Very detail-oriented.	Midterm	2026-03-23 10:13:56.776327
f0259a7a-0ca4-4c30-a44a-87b2aaa31725	d87b4932-304f-415d-9812-30dda92874de	4253d38d-4a1d-4ce3-9419-342a930d1859	7	Karan is technically sound but needs to improve documentation.	Week 4	2026-03-23 10:13:56.776327
436f062b-da3f-4062-80c7-6371245fd785	1e61a957-43f3-4ae8-97f2-e4dbeedc5939	ea0f3808-74ba-470d-a6c1-93abe63efc16	9	Meera completed all tasks ahead of schedule. Excellent performance.	Final	2026-03-23 10:13:56.776327
\.


--
-- TOC entry 3585 (class 0 OID 16718)
-- Dependencies: 225
-- Data for Name: intern_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.intern_feedback (id, intern_id, given_by, type, message, created_at) FROM stdin;
\.


--
-- TOC entry 3579 (class 0 OID 16600)
-- Dependencies: 219
-- Data for Name: interns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interns (id, user_id, department_id, mentor_id, status, start_date, end_date, college, position_title, created_at, cgpa, city, skills, languages, experience_level) FROM stdin;
3e8ce5cc-9837-4cb8-be22-dc6241d9a000	9df80d23-431e-4115-a42d-d9a1b25e4f1b	ffa47aef-9ebb-47f1-a366-79ecaba022b6	4253d38d-4a1d-4ce3-9419-342a930d1859	active	2025-06-01	2025-08-31	PDEU Ahmedabad	Frontend Intern	2026-03-23 10:13:56.776327	9.2	Ahmedabad	{React,JavaScript,CSS}	\N	\N
d50080b0-8af6-428a-b093-da937f2a750a	b861be4b-c936-4460-b532-1800ad2abe12	74a7733f-e3d3-48f0-b558-466bd36f08f5	ea0f3808-74ba-470d-a6c1-93abe63efc16	active	2025-06-01	2025-08-31	GTU Ahmedabad	UI/UX Intern	2026-03-23 10:13:56.776327	8.5	Surat	{Figma,"UI Design",Illustrator}	\N	\N
d87b4932-304f-415d-9812-30dda92874de	a70a1cc0-7039-423d-91a3-5e73cf834b30	ffa47aef-9ebb-47f1-a366-79ecaba022b6	4253d38d-4a1d-4ce3-9419-342a930d1859	active	2025-05-01	2025-07-31	DAIICT Gandhinagar	Backend Intern	2026-03-23 10:13:56.776327	7.8	Gandhinagar	{Python,Django,PostgreSQL}	\N	\N
1e61a957-43f3-4ae8-97f2-e4dbeedc5939	8f4d9963-2d17-4037-932c-ea5061a967a5	5e911d64-dece-45f1-8d60-9be7eea3f9c3	ea0f3808-74ba-470d-a6c1-93abe63efc16	completed	2025-01-01	2025-03-31	LD College Ahmedabad	Marketing Intern	2026-03-23 10:13:56.776327	9.5	Ahmedabad	{Marketing,SEO,"Content Writing"}	\N	\N
d174344d-c347-49ac-b3b9-3ea2c49969e0	16707d7f-8979-441d-b52e-221a2b8f63fd	97cc59b3-ede6-4071-aed3-cb489027b650	4253d38d-4a1d-4ce3-9419-342a930d1859	active	2025-07-01	2025-09-30	Nirma University	HR Intern	2026-03-23 10:13:56.776327	8.1	Vadodara	{HR,Recruitment,Excel}	\N	\N
\.


--
-- TOC entry 3580 (class 0 OID 16628)
-- Dependencies: 220
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, intern_id, assigned_by, title, description, status, priority, due_date, created_at) FROM stdin;
b140b4f0-bd52-4ec7-8478-d858ccffa373	3e8ce5cc-9837-4cb8-be22-dc6241d9a000	4253d38d-4a1d-4ce3-9419-342a930d1859	Build login page	Create responsive login UI	in_progress	high	2025-07-15	2026-03-23 10:13:56.776327
f564d5f3-2fe1-4761-ba8a-14dbc3d734f1	3e8ce5cc-9837-4cb8-be22-dc6241d9a000	4253d38d-4a1d-4ce3-9419-342a930d1859	Setup API integration	Connect frontend to GraphQL	todo	medium	2025-07-20	2026-03-23 10:13:56.776327
40ea62fe-951d-48a1-9b9b-0f765228bad0	d50080b0-8af6-428a-b093-da937f2a750a	ea0f3808-74ba-470d-a6c1-93abe63efc16	Design dashboard mockup	Create Figma mockup	done	high	2025-06-30	2026-03-23 10:13:56.776327
5121f0bf-d86e-4ab9-9f35-e44acdbbb624	d87b4932-304f-415d-9812-30dda92874de	4253d38d-4a1d-4ce3-9419-342a930d1859	Write database migrations	Create SQL migration scripts	in_review	medium	2025-07-10	2026-03-23 10:13:56.776327
30d5027b-3c2f-4480-9e08-a3e69bd9d776	d174344d-c347-49ac-b3b9-3ea2c49969e0	4253d38d-4a1d-4ce3-9419-342a930d1859	Prepare onboarding docs	Document intern onboarding checklist	todo	low	2025-07-25	2026-03-23 10:13:56.776327
\.


--
-- TOC entry 3577 (class 0 OID 16574)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, created_at) FROM stdin;
16d14e29-32fa-4bf8-80c7-96745dc0af92	Admin User	admin@company.com	$2a$06$mFN/99D/uwC54tUgCsd2z.m.1dZu7KVNYJrr2mSFGHZ2RnUb1R4jm	admin	2026-03-23 10:13:56.776327
4253d38d-4a1d-4ce3-9419-342a930d1859	Amit Patel	amit.patel@company.com	$2a$06$0S7GU81b1sRqjlQ7N9Z.VeV8ErA4ISNPKyvDBxfiKwiNlIP0niP.S	mentor	2026-03-23 10:13:56.776327
ea0f3808-74ba-470d-a6c1-93abe63efc16	Priya Mehta	priya.mehta@company.com	$2a$06$DAMvDCQIYZSMX84a.2wib.3.xkZd16MapfIsUQQLuRcJH9bXzJ7ES	mentor	2026-03-23 10:13:56.776327
9df80d23-431e-4115-a42d-d9a1b25e4f1b	Rahul Sharma	rahul.sharma@example.com	$2a$06$bsP2i8Nw1F8ImtIhB3Zi8OAuV2jvkAE3PLNdA9yje8sgBLzVRZ1/G	intern	2026-03-23 10:13:56.776327
b861be4b-c936-4460-b532-1800ad2abe12	Sneha Patel	sneha.patel@example.com	$2a$06$htEQl748dqkMHZmjfa7uKe6NRDPiF9a2QQ85AcunrtEcHt/cswIom	intern	2026-03-23 10:13:56.776327
a70a1cc0-7039-423d-91a3-5e73cf834b30	Karan Desai	karan.desai@example.com	$2a$06$EBaxn5ZQvquvXAmhLdwMseGwdGE0rcf2LSzFgoROCXAzC2R19CYc.	intern	2026-03-23 10:13:56.776327
8f4d9963-2d17-4037-932c-ea5061a967a5	Meera Shah	meera.shah@example.com	$2a$06$QiVIe8.EJpa5slJYsFfS.eZ.YbpyICrJElwLfxSWY836.CCvSMmcm	intern	2026-03-23 10:13:56.776327
16707d7f-8979-441d-b52e-221a2b8f63fd	Arjun Trivedi	arjun.trivedi@example.com	$2a$06$QvQQ7E4NmElS5RqNTSOrT.vN.XuLle0fwgnv4QDnyLReYgAsvA/zO	intern	2026-03-23 10:13:56.776327
\.


--
-- TOC entry 3419 (class 2606 OID 16712)
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- TOC entry 3411 (class 2606 OID 16662)
-- Name: attendance attendance_intern_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_intern_id_date_key UNIQUE (intern_id, date);


--
-- TOC entry 3413 (class 2606 OID 16660)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 3405 (class 2606 OID 16594)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 3417 (class 2606 OID 16696)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 3415 (class 2606 OID 16677)
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (id);


--
-- TOC entry 3421 (class 2606 OID 16727)
-- Name: intern_feedback intern_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intern_feedback
    ADD CONSTRAINT intern_feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 3407 (class 2606 OID 16612)
-- Name: interns interns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT interns_pkey PRIMARY KEY (id);


--
-- TOC entry 3409 (class 2606 OID 16640)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 3401 (class 2606 OID 16585)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3403 (class 2606 OID 16583)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3432 (class 2606 OID 16713)
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3428 (class 2606 OID 16663)
-- Name: attendance attendance_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(id) ON DELETE CASCADE;


--
-- TOC entry 3422 (class 2606 OID 16595)
-- Name: departments departments_head_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_head_user_id_fkey FOREIGN KEY (head_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3431 (class 2606 OID 16697)
-- Name: documents documents_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(id) ON DELETE CASCADE;


--
-- TOC entry 3429 (class 2606 OID 16683)
-- Name: evaluations evaluations_evaluator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3430 (class 2606 OID 16678)
-- Name: evaluations evaluations_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(id) ON DELETE CASCADE;


--
-- TOC entry 3433 (class 2606 OID 16733)
-- Name: intern_feedback intern_feedback_given_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intern_feedback
    ADD CONSTRAINT intern_feedback_given_by_fkey FOREIGN KEY (given_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3434 (class 2606 OID 16728)
-- Name: intern_feedback intern_feedback_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intern_feedback
    ADD CONSTRAINT intern_feedback_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(id) ON DELETE CASCADE;


--
-- TOC entry 3423 (class 2606 OID 16618)
-- Name: interns interns_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT interns_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 3424 (class 2606 OID 16623)
-- Name: interns interns_mentor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT interns_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3425 (class 2606 OID 16613)
-- Name: interns interns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT interns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3426 (class 2606 OID 16646)
-- Name: tasks tasks_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3427 (class 2606 OID 16641)
-- Name: tasks tasks_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.interns(id) ON DELETE CASCADE;


-- Completed on 2026-03-23 15:57:32

--
-- PostgreSQL database dump complete
--

\unrestrict jUMmlUbWpOFWTyZlzGkRhW6ywLCNuB9OF58mKXWmKi7DcMatItdLD4H2BrXbQ8b

