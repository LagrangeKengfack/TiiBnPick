# Architecture Hexagonale — TiiBnTick Backend

## Vue d'ensemble

Le backend suit l'**architecture hexagonale** (Ports & Adapters / Clean Architecture).
L'idée centrale : le domaine métier est au centre, isolé de l'infrastructure par des interfaces (ports).

```
┌─────────────────────────────────────────────────────────────┐
│                        ADAPTERS                             │
│  ┌──────────────────┐           ┌──────────────────────┐   │
│  │  INBOUND (REST,  │           │  OUTBOUND (R2DBC,    │   │
│  │   Kafka topics)  │           │   Kafka, Email, ES)  │   │
│  └────────┬─────────┘           └──────────┬───────────┘   │
│           │                                │               │
│    ┌──────▼────────────────────────────────▼──────┐        │
│    │              APPLICATION                      │        │
│    │          (Use Case Implementations)           │        │
│    └──────┬────────────────────────────────────────┘        │
│           │                                                  │
│    ┌──────▼────────────────────────────────────────┐        │
│    │                DOMAIN                         │        │
│    │   port/inbound/   port/outbound/              │        │
│    │   (Use Case ifs)  (Repo / Infra ifs)          │        │
│    └───────────────────────────────────────────────┘        │
│                                                             │
│  INFRASTRUCTURE (Spring config, Security, Kafka, ES config) │
└─────────────────────────────────────────────────────────────┘
```

---

## Structure des packages

```
com.polytechnique.tiibntick/
│
├── domain/                        ← Cœur métier (PAS de dépendance Spring/infra)
│   └── port/
│       ├── inbound/               ← Interfaces des cas d'usage (contrats)
│       │   ├── AuthUseCase
│       │   ├── ClientUseCase
│       │   ├── AnnouncementUseCase
│       │   ├── DeliveryPersonRegistrationUseCase
│       │   ├── DeliveryPersonProfileUseCase
│       │   ├── DeliveryPersonLocationUseCase
│       │   ├── AdminUseCase
│       │   ├── AdminDeliveryPersonUseCase
│       │   ├── AddressUseCase
│       │   └── PasswordSetupUseCase
│       └── outbound/              ← Interfaces vers l'infrastructure
│           ├── PersonRepository
│           ├── ClientRepository
│           ├── DeliveryPersonRepository
│           ├── AnnouncementRepository
│           ├── AddressRepository
│           ├── LogisticsRepository
│           ├── AnnouncementSubscriptionRepository
│           ├── NotificationRepository
│           ├── PacketRepository
│           ├── PasswordTokenRepository
│           ├── EventPublisher
│           ├── EmailPort
│           ├── FileStoragePort
│           ├── PushNotificationPort
│           └── NotificationStreamPort
│
├── application/                   ← Implémentations des use cases
│   └── usecase/
│       ├── AuthUseCaseImpl
│       ├── ClientUseCaseImpl
│       ├── AnnouncementUseCaseImpl
│       ├── DeliveryPersonRegistrationUseCaseImpl
│       ├── DeliveryPersonProfileUseCaseImpl
│       ├── DeliveryPersonLocationUseCaseImpl
│       └── AdminUseCaseImpl
│
├── adapter/
│   ├── inbound/
│   │   ├── rest/                  ← Controllers HTTP (WebFlux)
│   │   │   ├── AuthController
│   │   │   ├── ClientController
│   │   │   ├── AnnouncementController  (fusionné avec SubscriptionController)
│   │   │   ├── DeliveryPersonController
│   │   │   ├── DeliveryPersonRegistrationController
│   │   │   ├── DeliveryPersonLocationController
│   │   │   ├── AdminController
│   │   │   ├── AdminDeliveryPersonController
│   │   │   ├── AdminClientController
│   │   │   ├── AddressController
│   │   │   ├── PasswordSetupController
│   │   │   └── NotificationStreamController
│   │   └── messaging/             ← Kafka consumers
│   │       ├── SubscriptionConfirmationConsumer
│   │       ├── MatchingNotificationConsumer
│   │       └── DeliveryPersonEventConsumer
│   └── outbound/
│       ├── persistence/           ← Adaptateurs R2DBC (wrappent les repositories Spring Data)
│       │   ├── PersonRepositoryAdapter
│       │   ├── ClientRepositoryAdapter
│       │   ├── DeliveryPersonRepositoryAdapter
│       │   ├── AnnouncementRepositoryAdapter
│       │   ├── AddressRepositoryAdapter
│       │   ├── LogisticsRepositoryAdapter
│       │   ├── AnnouncementSubscriptionRepositoryAdapter
│       │   ├── NotificationRepositoryAdapter
│       │   ├── PacketRepositoryAdapter
│       │   └── PasswordTokenRepositoryAdapter
│       ├── messaging/
│       │   └── KafkaEventPublisherAdapter
│       ├── notification/
│       │   ├── EmailAdapter
│       │   ├── PushNotificationAdapter
│       │   └── NotificationStreamAdapter
│       └── storage/
│           └── FileStorageAdapter
│
├── infrastructure/                ← Configuration Spring (SecurityConfig, KafkaConfig…)
│   └── [anciennement config/]
│
├── shared/                        ← Types partagés entre couches
│   ├── dto/
│   │   ├── address/, admin/, announcement/, auth/
│   │   ├── client/, packet/, requests/, responses/, subscription/
│   └── events/                    ← POJOs des événements Kafka
│
│  ─── Packages legacy (coexistance transitoire) ───
├── models/                        ← Entités R2DBC (restent en place, seront isolées)
├── repositories/                  ← Spring Data R2DBC interfaces (wrappées par adapters)
├── services/                      ← Services métier existants (migrés progressivement)
├── config/                        ← Config Spring (à déplacer vers infrastructure/)
├── security/                      ← JWT, Spring Security
├── elasticsearch/                 ← Documents et repos ES
├── events/                        ← Anciens événements Kafka (remplacés par shared/events)
├── dtos/                          ← Anciens DTOs (remplacés par shared/dto)
├── mappers/                       ← Mappers Lombok/manual
├── validators/                    ← Validateurs réactifs
└── exceptions/                    ← Exceptions métier + GlobalExceptionHandler
```

---

## Flux d'une requête HTTP

```
HTTP Request
    │
    ▼
adapter/inbound/rest/[XxxController]
    │  (appelle le port inbound)
    ▼
domain/port/inbound/[XxxUseCase]  ← interface
    │  (implémentée par)
    ▼
application/usecase/[XxxUseCaseImpl]
    │  (appelle les ports outbound)
    ▼
domain/port/outbound/[XxxRepository | EmailPort | EventPublisher …]  ← interfaces
    │  (implémentées par)
    ▼
adapter/outbound/[persistence|messaging|notification|storage]/[XxxAdapter]
    │
    ▼
Infrastructure (R2DBC, Kafka, JavaMailSender, Filesystem)
```

---

## Flux d'un message Kafka entrant

```
Kafka Topic
    │
    ▼
adapter/inbound/messaging/[XxxConsumer]
    │  (appelle directement les services domain ou ports outbound)
    ▼
Logique métier → persistence
```

---

## Règles de dépendance

| Package           | Peut dépendre de                          |
|-------------------|-------------------------------------------|
| `domain`          | `models`, `shared`, rien d'autre          |
| `application`     | `domain`, `models`, `shared`              |
| `adapter/inbound` | `domain/port/inbound`, `shared`           |
| `adapter/outbound`| `domain/port/outbound`, `models`, `shared`|
| `infrastructure`  | Tout (seulement pour la config Spring)    |
| `shared`          | `models/enums` uniquement                 |

---

## Migration progressive

Les packages `services/`, `dtos/`, `events/`, `config/` **coexistent** avec la nouvelle structure
pendant la période de transition. Les services existants sont délégués via les `UseCaseImpl`
(pattern Façade/Adapter).

La migration complète vers les ports outbound (suppression des dépendances directes aux
`repositories/` dans les services) est la prochaine étape.
