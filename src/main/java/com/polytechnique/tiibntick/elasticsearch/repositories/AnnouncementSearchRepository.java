package com.polytechnique.tiibntick.elasticsearch.repositories;

import com.polytechnique.tiibntick.elasticsearch.models.AnnouncementDocument;
import org.springframework.data.elasticsearch.repository.ReactiveElasticsearchRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

/**
 * Reactive Repository for accessing Announcement documents in Elasticsearch.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@Repository
public interface AnnouncementSearchRepository extends ReactiveElasticsearchRepository<AnnouncementDocument, UUID> {
}
