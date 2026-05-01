-- Sync sequence values for all tables

SELECT setval('master_users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM master_users));

SELECT setval('core_concept_art_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_concept_art));

SELECT setval('core_art_media_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_art_media));

SELECT setval('core_likes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_likes));

SELECT setval('core_comments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_comments));

SELECT setval('core_conversations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_conversations));

SELECT setval('core_messages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_messages));

SELECT setval('core_job_posting_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_job_posting));

SELECT setval('core_job_applications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_job_applications));

SELECT setval('core_dev_log_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_dev_log));

SELECT setval('core_dev_log_media_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_dev_log_media));

SELECT setval('core_subscriptions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_subscriptions));

SELECT setval('core_content_reports_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_content_reports));

SELECT setval('core_moderation_actions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM core_moderation_actions));
