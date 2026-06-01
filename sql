SELECT 
    b.blog_id,
    bm_name.meta_value        AS title,
    bm_desc.meta_value        AS description,
    IF(
        pm.meta_value REGEXP CONCAT('s:[0-9]+:"', b.blog_id, '"'),
        1, 0
    )                          AS excluded
FROM wp_blogs b
LEFT JOIN wp_blogmeta bm_name 
    ON bm_name.blog_id = b.blog_id 
    AND bm_name.meta_key = 'blogname'
LEFT JOIN wp_blogmeta bm_desc 
    ON bm_desc.blog_id = b.blog_id 
    AND bm_desc.meta_key = 'blogdescription'
LEFT JOIN wp_postmeta pm 
    ON pm.post_id   = 123                      -- <-- your post_id here
    AND pm.meta_key = 'exclude_web_site'
ORDER BY b.blog_id;
