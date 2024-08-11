-- Limpiar tabla test_case_expected_results
DELETE FROM public.test_case_expected_results
WHERE test_case_id NOT IN (
    SELECT test_case_id FROM public.test_case_expected_results LIMIT 1
);

-- Limpiar tabla test_case_actions
DELETE FROM public.test_case_actions
WHERE test_case_id NOT IN (
    SELECT test_case_id FROM public.test_case_actions LIMIT 1
);

DELETE FROM public.test_case_actions
WHERE action_id NOT IN (
    SELECT action_id FROM public.test_case_actions LIMIT 1
);

-- Limpiar tabla test_case
DELETE FROM public.test_case
WHERE id NOT IN (
    SELECT test_case_id FROM public.test_case_expected_results LIMIT 1
);

-- Limpiar tabla test_suite_level_2
DELETE FROM public.test_suite_level_2
WHERE id NOT IN (
    SELECT level_2_id FROM public.test_case LIMIT 1
);

-- Limpiar tabla test_suite_level_1
DELETE FROM public.test_suite_level_1
WHERE id NOT IN (
    SELECT level_1_id FROM public.test_suite_level_2 LIMIT 1
);

-- Limpiar tabla expected_results
DELETE FROM public.expected_results
WHERE id NOT IN (
    SELECT expected_result_id FROM public.test_case_expected_results LIMIT 1
);

-- Limpiar tabla test_actions
DELETE FROM public.test_actions
WHERE id NOT IN (
    SELECT action_id FROM public.test_case_actions LIMIT 1
);

-- Confirmar que se mantengan los datos relacionados
DELETE FROM public.test_suite_level_2
WHERE id NOT IN (
    SELECT level_2_id FROM public.test_case
);

DELETE FROM public.test_suite_level_1
WHERE id NOT IN (
    SELECT level_1_id FROM public.test_suite_level_2
);

DELETE FROM public.test_case_expected_results
WHERE expected_result_id NOT IN (
    SELECT id FROM public.expected_results
);

DELETE FROM public.test_case_actions
WHERE action_id NOT IN (
    SELECT id FROM public.test_actions
);
