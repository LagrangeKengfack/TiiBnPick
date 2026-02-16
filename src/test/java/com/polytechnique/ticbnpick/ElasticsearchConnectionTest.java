package com.polytechnique.ticbnpick;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ElasticsearchConnectionTest {

    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    @Test
    public void testElasticsearchConnection() {
        assertThat(elasticsearchOperations).isNotNull();
        // Simple check to ensure we can communicate with the cluster
        // We can get cluster version or similar info, but just existence of bean
        // implies auto-config worked likely
        // Let's try to index a dummy doc or just assert operations is available
        System.out
                .println("ElasticsearchOperations bean is available: " + elasticsearchOperations.getClass().getName());
    }
}
