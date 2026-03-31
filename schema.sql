-- Create the database schema for Crime Scene Languages

-- 1. Languages Table
CREATE TABLE languages (
    code TEXT PRIMARY KEY, -- e.g., 'es', 'fr', 'en'
    name TEXT NOT NULL,    -- e.g., 'Spanish', 'French'
    is_active BOOLEAN DEFAULT false
);

-- 2. Profiles Table (Extending default Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    native_language TEXT DEFAULT 'en' REFERENCES languages(code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cases Table
CREATE TABLE cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    language_code TEXT REFERENCES languages(code),
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL, -- 'A1', 'A2', 'B1', etc.
    description TEXT NOT NULL,
    setting TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Evidence Table
CREATE TABLE evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    tab_name TEXT NOT NULL, -- e.g., 'Message', 'Receipt'
    content TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- 5. Witness Interactions Table
CREATE TABLE witness_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    witness_name TEXT NOT NULL,
    question_1_target TEXT NOT NULL,
    question_1_native TEXT NOT NULL,
    reply_1_target TEXT NOT NULL,
    question_2_target TEXT NOT NULL,
    question_2_native TEXT NOT NULL,
    reply_2_target TEXT NOT NULL,
    question_3_target TEXT NOT NULL,
    question_3_native TEXT NOT NULL,
    reply_3_target TEXT NOT NULL
);

-- 6. Deductions Table
CREATE TABLE deductions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false
);

-- 7. Word Encounters Table
CREATE TABLE word_encounters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    word_target TEXT NOT NULL,
    translation_native TEXT NOT NULL,
    language_code TEXT REFERENCES languages(code),
    click_count INTEGER DEFAULT 1,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, word_target, language_code)
);

-- Seed Initial Data

-- Active Spanish language
INSERT INTO languages (code, name, is_active) VALUES ('es', 'Spanish', true);
-- Placeholder languages
INSERT INTO languages (code, name, is_active) VALUES ('fr', 'French', false);
INSERT INTO languages (code, name, is_active) VALUES ('de', 'German', false);
INSERT INTO languages (code, name, is_active) VALUES ('jp', 'Japanese', false);
INSERT INTO languages (code, name, is_active) VALUES ('en', 'English', true); -- Native language option

-- Seed the first case: "El desayuno desaparecido"
DO $$
DECLARE
    case_uuid UUID;
BEGIN
    INSERT INTO cases (language_code, title, difficulty, description, setting)
    VALUES ('es', 'El desayuno desaparecido', 'A1', 'A customer is furious. They ordered breakfast 20 minutes ago. Nothing has arrived.', 'A small café in Madrid, Tuesday morning')
    RETURNING id INTO case_uuid;

    -- Evidence
    INSERT INTO evidence (case_id, tab_name, content, display_order) VALUES
    (case_uuid, 'Receipt', 'Café €1.50 / Tostada €2.00 / Zumo de naranja €2.50 / Total €6.00 / Mesa 4 / 08:47', 1),
    (case_uuid, 'Message', '¿Dónde está mi desayuno? ¡Mesa 4! Llevo 20 minutos esperando.', 2),
    (case_uuid, 'Note', 'Mesa 4 — cliente muy impaciente. Pedido: cocina.', 3);

    -- Witness
    INSERT INTO witness_interactions (case_id, witness_name, 
        question_1_target, question_1_native, reply_1_target,
        question_2_target, question_2_native, reply_2_target,
        question_3_target, question_3_native, reply_3_target)
    VALUES (case_uuid, 'El camarero', 
        '¿Dónde está el pedido?', 'Where is the order?', 'El pedido está en la cocina. El cocinero lo tiene.',
        '¿Cuánto tiempo lleva el cliente esperando?', 'How long has the customer been waiting?', 'Veinte minutos. Lo siento mucho.',
        '¿Hay un problema con la mesa?', 'Is there a problem with the table?', 'No, la mesa está bien. El problema está en la cocina.');

    -- Deductions
    INSERT INTO deductions (case_id, option_text, is_correct) VALUES
    (case_uuid, 'The customer ordered at the wrong table', false),
    (case_uuid, 'The order is ready but the waiter never collected it from the kitchen', true),
    (case_uuid, 'The café was closed that morning', false);
END $$;

-- Seed the second case: "La llave perdida"
DO $$
DECLARE
    case_uuid UUID;
BEGIN
    INSERT INTO cases (language_code, title, difficulty, description, setting)
    VALUES ('es', 'La llave perdida', 'A1', 'A neighbour notices Ana''s front door is wide open. Ana has no idea how.', 'An apartment building in Barcelona, Monday evening')
    RETURNING id INTO case_uuid;

    INSERT INTO evidence (case_id, tab_name, content, display_order) VALUES
    (case_uuid, 'Message', 'Hola Ana. Tu puerta está abierta. ¿Estás bien?', 1),
    (case_uuid, 'Receipt', 'Copia de llave x1 — €3.50. Martes 16:20.', 2),
    (case_uuid, 'Diary', 'Martes: mi llave, ¿dónde está? Busco en casa pero nada.', 3);

    INSERT INTO witness_interactions (case_id, witness_name,
        question_1_target, question_1_native, reply_1_target,
        question_2_target, question_2_native, reply_2_target,
        question_3_target, question_3_native, reply_3_target)
    VALUES (case_uuid, 'Elena, la vecina',
        '¿Viste a alguien en el pasillo?', 'Did you see anyone in the hallway?', 'Sí. Un hombre joven. No lo conozco.',
        '¿A qué hora viste la puerta abierta?', 'What time did you see the door open?', 'A las seis de la tarde, más o menos.',
        '¿Es normal esto?', 'Is this normal?', 'No. Ana es muy ordenada.');

    INSERT INTO deductions (case_id, option_text, is_correct) VALUES
    (case_uuid, 'Ana lost her key by accident', false),
    (case_uuid, 'Someone made a copy of Ana''s key and entered', true),
    (case_uuid, 'The neighbour left the door open', false);
END $$;

-- Seed the third case: "El restaurante cerrado"
DO $$
DECLARE
    case_uuid UUID;
BEGIN
    INSERT INTO cases (language_code, title, difficulty, description, setting)
    VALUES ('es', 'El restaurante cerrado', 'A2', 'A popular restaurant closed without explanation on its busiest night. The owner is not answering calls.', 'A restaurant in Seville, Saturday night')
    RETURNING id INTO case_uuid;

    -- Evidence
    INSERT INTO evidence (case_id, tab_name, content, display_order) VALUES
    (case_uuid, 'Voicemail', 'Escucha, necesito hablar contigo. El propietario llegó tarde esa noche. Muy tarde. Nadie sabe por qué.', 1),
    (case_uuid, 'Message', 'No vengas mañana. El restaurante estará cerrado.', 2),
    (case_uuid, 'Review', 'Llegamos a las 9. Todo cerrado. Sin explicación. Qué vergüenza.', 3),
    (case_uuid, 'Receipt', 'Cena para dos, vino tinto. Total €66. 21:14.', 4);

    -- Witness
    INSERT INTO witness_interactions (case_id, witness_name,
        question_1_target, question_1_native, reply_1_target,
        question_2_target, question_2_native, reply_2_target,
        question_3_target, question_3_native, reply_3_target)
    VALUES (case_uuid, 'Marco, el camarero',
        '¿Trabajaste esa noche?', 'Did you work that night?', 'Sí. Hasta las diez. Después el jefe me dijo que me fuera.',
        '¿Había clientes cuando cerraste?', 'Were there customers when you closed?', 'Una pareja. En la mesa del fondo. No los conocía.',
        '¿El propietario estaba nervioso?', 'Was the owner nervous?', 'Nervioso, sí. Recibió una llamada y cambió.');

    -- Deductions
    INSERT INTO deductions (case_id, option_text, is_correct) VALUES
    (case_uuid, 'The restaurant was closed for renovation', false),
    (case_uuid, 'The owner closed early to have a private dinner with someone', true),
    (case_uuid, 'The chef forgot to open the restaurant', false);
END $$;
