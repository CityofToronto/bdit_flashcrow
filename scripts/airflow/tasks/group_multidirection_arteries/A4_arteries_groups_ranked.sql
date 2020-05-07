CREATE SCHEMA IF NOT EXISTS counts;

-- Case 4: greedy ranked pairing with threshold
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_ranked_pairs AS (
  WITH arterycodes_remaining AS (
    SELECT am.arterycode, am.geo_id
    FROM counts.arteries_midblock am
    LEFT JOIN counts_new.arteries_groups ag USING (arterycode)
    WHERE am.geo_id IS NOT NULL AND ag.arterycode IS NULL
  ), geoids_remaining AS (
    SELECT DISTINCT(geo_id)
    FROM arterycodes_remaining
  ), arterycode_count_dates AS (
    SELECT ar.arterycode, ci."COUNT_DATE" AS count_date
    FROM arterycodes_remaining ar
    JOIN "TRAFFIC"."COUNTINFO" ci ON ar.arterycode = ci."ARTERYCODE"
    UNION ALL
    SELECT ar.arterycode, cim."COUNT_DATE" AS count_date
    FROM arterycodes_remaining ar
    JOIN "TRAFFIC"."COUNTINFOMICS" cim ON ar.arterycode = cim."ARTERYCODE"
  ), arterycode_num_count_dates AS (
    SELECT arterycode, COUNT(*) AS n
    FROM arterycode_count_dates
    GROUP BY arterycode
  )
  SELECT aps.a1, aps.a2, aps.score, gr.geo_id
  FROM geoids_remaining gr
  JOIN LATERAL (
    WITH arterycodes AS (
      SELECT arterycode
      FROM arterycodes_remaining
      WHERE geo_id = gr.geo_id
    ), arterycode_pairs AS (
      SELECT a1.arterycode AS a1, a2.arterycode AS a2
      FROM arterycodes a1
      JOIN arterycodes a2 ON a1.arterycode < a2.arterycode
      JOIN counts.arteries_midblock_direction amd1 ON a1.arterycode = amd1.arterycode
      JOIN counts.arteries_midblock_direction amd2 ON a2.arterycode = amd2.arterycode
      WHERE amd1.direction != amd2.direction
    ), arterycode_pair_features_1 AS (
      SELECT
        ap.a1, ap.a2,
        log(2, abs(ap.a1 - ap.a2)) AS f_arterycode_spread
      FROM arterycode_pairs ap
    ), arterycode_pair_features_2 AS (
      SELECT
        ap.a1, ap.a2,
        CASE
          WHEN aml1.from_link_id = aml2.to_link_id AND aml1.from_link_id = aml2.to_link_id THEN 1
          ELSE 0
        END AS f_mirrored_links
      FROM arterycode_pairs ap
      JOIN counts.arteries_midblock_link aml1 ON ap.a1 = aml1.arterycode
      JOIN counts.arteries_midblock_link aml2 ON ap.a2 = aml2.arterycode
    ), arterycode_pair_features_3 AS (
      SELECT
        ap.a1, ap.a2,
        word_similarity(ad1."LOCATION", ad2."LOCATION") AS f_location_similarity
      FROM arterycode_pairs ap
      JOIN "TRAFFIC"."ARTERYDATA" ad1 ON ap.a1 = ad1."ARTERYCODE"
      JOIN "TRAFFIC"."ARTERYDATA" ad2 ON ap.a2 = ad2."ARTERYCODE"
    ), arterycode_pair_features_4 AS (
      SELECT
        ap.a1, ap.a2,
        dot_product.n / SQRT(ancd1.n * ancd2.n) AS f_count_date_similarity
      FROM arterycode_pairs ap
      JOIN arterycode_num_count_dates ancd1 ON ap.a1 = ancd1.arterycode
      JOIN arterycode_num_count_dates ancd2 ON ap.a2 = ancd2.arterycode
      JOIN LATERAL (
        WITH a1_count_dates AS (
          SELECT count_date FROM arterycode_count_dates acd WHERE acd.arterycode = ap.a1
        ), a2_count_dates AS (
          SELECT count_date FROM arterycode_count_dates acd WHERE acd.arterycode = ap.a2
        )
        SELECT COUNT(*) AS n FROM a1_count_dates JOIN a2_count_dates USING (count_date)
      ) dot_product ON true
    )
    SELECT
      apf1.a1, apf1.a2,
      -apf1.f_arterycode_spread
        + apf2.f_mirrored_links * 10
        + apf3.f_location_similarity * 4
        + apf4.f_count_date_similarity * 8
      AS score
    FROM arterycode_pair_features_1 apf1
    JOIN arterycode_pair_features_2 apf2 USING (a1, a2)
    JOIN arterycode_pair_features_3 apf3 USING (a1, a2)
    JOIN arterycode_pair_features_4 apf4 USING (a1, a2)
  ) aps ON true
  WHERE aps.score > 0
  ORDER BY gr.geo_id ASC, aps.score DESC
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_ranked_pairs_a1_a2 ON counts.arteries_midblock_ranked_pairs (a1, a2);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_ranked_pairs;

-- At this point, we dump this to file and use a Python script to greedily match pairs.
