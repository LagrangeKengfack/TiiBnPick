package com.polytechnique.ticbnpick.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka configuration.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    /**
     * Creates the Kafka producer factory.
     *
     * @return the ProducerFactory bean
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * Creates the KafkaTemplate for sending messages.
     *
     * @return the KafkaTemplate bean
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    /**
     * Creates the delivery-person-created topic.
     *
     * @return the NewTopic bean
     */
    @Bean
    public NewTopic deliveryPersonCreatedTopic() {
        return TopicBuilder.name("delivery-person-created")
                .partitions(1)
                .replicas(1)
                .build();
    }

    /**
     * Creates the delivery-person-validated topic.
     *
     * @return the NewTopic bean
     */
    @Bean
    public NewTopic deliveryPersonValidatedTopic() {
        return TopicBuilder.name("delivery-person-validated")
                .partitions(1)
                .replicas(1)
                .build();
    }

    /**
     * Creates the announcement-published topic.
     *
     * @return the NewTopic bean
     */
    @Bean
    public NewTopic announcementPublishedTopic() {
        return TopicBuilder.name("announcement-published")
                .partitions(1)
                .replicas(1)
                .build();
    }

    /**
     * Creates the Kafka consumer factory.
     *
     * @return the ConsumerFactory bean
     */
    @Bean
    public org.springframework.kafka.core.ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(org.apache.kafka.clients.consumer.ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(org.apache.kafka.clients.consumer.ConsumerConfig.GROUP_ID_CONFIG, "ticbnpick-group");
        configProps.put(org.apache.kafka.clients.consumer.ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                org.apache.kafka.common.serialization.StringDeserializer.class);
        configProps.put(org.apache.kafka.clients.consumer.ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                org.springframework.kafka.support.serializer.JsonDeserializer.class);
        configProps.put(org.springframework.kafka.support.serializer.JsonDeserializer.TRUSTED_PACKAGES, "*");
        return new org.springframework.kafka.core.DefaultKafkaConsumerFactory<>(configProps);
    }

    /**
     * Creates the Kafka listener container factory with robust error handling.
     *
     * @return the ConcurrentKafkaListenerContainerFactory bean
     */
    @Bean
    public org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory<String, Object> factory = new org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setCommonErrorHandler(errorHandler()); // Use the robust error handler
        return factory;
    }

    /**
     * Configures a robust error handler with Retry and DLQ.
     * - Fixed BackOff: 1 second interval, 3 attempts.
     * - Dead Letter Queue: After retries are exhausted, message is sent to .DLT
     * topic.
     *
     * @return the DefaultErrorHandler bean
     */
    @Bean
    public org.springframework.kafka.listener.DefaultErrorHandler errorHandler() {
        org.springframework.util.backoff.FixedBackOff fixedBackOff = new org.springframework.util.backoff.FixedBackOff(
                1000L, 3);
        org.springframework.kafka.listener.DeadLetterPublishingRecoverer recoverer = new org.springframework.kafka.listener.DeadLetterPublishingRecoverer(
                kafkaTemplate());

        return new org.springframework.kafka.listener.DefaultErrorHandler(recoverer, fixedBackOff);
    }
}
