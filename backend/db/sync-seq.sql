-- Sync sequence values for all tables

SELECT setval('master_users_id_seq', (SELECT MAX(id) FROM master_users));

SELECT setval('core_concept_art_id_seq', (SELECT MAX(id) FROM core_concept_art));

SELECT setval('core_art_media_id_seq', (SELECT MAX(id) FROM core_art_media));

SELECT setval('core_art_likes_id_seq', (SELECT MAX(id) FROM core_art_likes));

SELECT setval('core_art_comments_id_seq', (SELECT MAX(id) FROM core_art_comments));

SELECT setval('core_conversations_id_seq', (SELECT MAX(id) FROM core_conversations));

SELECT setval('core_messages_id_seq', (SELECT MAX(id) FROM core_messages));