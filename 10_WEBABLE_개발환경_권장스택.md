# WEBABLE 개발환경/권장 스택

## 1. 저장소 구조

권장 구조는 모노레포입니다.

```text
webable/
  apps/
    admin-web/        # 관리자/빌더
    storefront/       # 공개 사이트 렌더러
    api/              # Backend API
    worker/           # Queue worker, AI jobs, publish jobs
  packages/
    ui/               # 디자인 시스템
    builder-schema/   # Section/Block JSON schema
    sdk/              # 외부 앱/프론트 SDK
    config/           # eslint/tsconfig/shared config
  infra/
    terraform/
    k8s/
  docs/
```

## 2. 프론트엔드

- Next.js, React, TypeScript
- Tailwind CSS 또는 디자인 토큰 기반 스타일 시스템
- dnd-kit 기반 드래그 앤 드롭
- TipTap 또는 Lexical 기반 리치 텍스트 편집
- Zustand/Jotai 기반 편집 상태 관리
- Playwright 기반 E2E/시각 회귀 테스트

## 3. 백엔드

- NestJS 또는 Spring Boot
- PostgreSQL + Row Level Security
- Redis + BullMQ/SQS
- OpenAPI 기반 API 계약
- Webhook signature, retry, dead letter queue
- Audit log와 Idempotency key 기본화

## 4. AI 계층

- AI Gateway: provider/model 라우팅, retry, fallback, 비용 계산
- Prompt Registry: 버전별 prompt, system instruction, output schema 관리
- Tool Runtime: 권한 검증 후 내부 API 실행
- Eval Pipeline: 사이트 생성 품질, 안전성, 권한 준수 평가
- Brand Memory: 브랜드 톤, 금칙어, 상품/서비스 요약, 고객 공개 데이터 중심 저장

## 5. 인프라

- Docker, Kubernetes/ECS 또는 서버리스 혼합
- S3 호환 Object Storage + CDN
- DNS/SSL 자동화
- Observability: logs, metrics, traces, AI cost dashboard
- WAF, rate limit, secret manager, KMS

## 6. 브랜치/배포 전략

- `main`: 운영 배포 가능 상태
- `develop`: 통합 개발
- `feature/*`: 기능 개발
- `release/*`: QA/릴리즈 후보
- `hotfix/*`: 운영 긴급 수정

배포는 preview, staging, production 환경으로 나누고, 빌더/렌더러/스키마 변경은 반드시 migration과 rollback 전략을 포함합니다.

## 7. Definition of Done

- 기능 요구사항과 acceptance criteria 충족
- 권한/테넌트 scope 테스트 통과
- E2E 또는 통합 테스트 추가
- 감사 로그 대상 작업 기록
- AI 기능은 input/output schema, 비용 기록, safety check 포함
- 문서/API 스펙 업데이트
- 모니터링 지표 또는 로그 추가
