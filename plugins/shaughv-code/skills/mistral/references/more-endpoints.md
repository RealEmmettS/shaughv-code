# More endpoints — libraries/RAG, connectors, observability, workflows, events, deprecated

This file is an **operation-level index** for the long-tail and beta endpoints —
every path, method, and `operationId` listed so they're usable at a glance. It is
deliberately *not* a per-field reference: exact request/response schemas live in
the bundled [openapi.yaml](openapi.yaml) (and the always-current live spec at
`https://docs.mistral.ai/openapi.yaml`). Per-endpoint human docs follow the
pattern `https://docs.mistral.ai/api/endpoint/<group>[/<operation>]`.

**Auth & base (all endpoints):** every request needs
`Authorization: Bearer $MISTRAL_API_KEY`, base URL `https://api.mistral.ai`.
Most groups below are **beta** (`beta.*` tags in the spec) and may change.

## Libraries (beta)

Document libraries (knowledge bases) you can populate, query, and share — the
storage layer behind agent/RAG document search. CRUD on libraries, their
documents (upload, metadata, text, status, signed URLs, reprocess), and access
control. Docs: https://docs.mistral.ai/api/endpoint/libraries

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/libraries` | `libraries_list_v1` | List all libraries you have access to |
| POST | `/v1/libraries` | `libraries_create_v1` | Create a new library |
| GET | `/v1/libraries/{library_id}` | `libraries_get_v1` | Detailed information about a specific library |
| DELETE | `/v1/libraries/{library_id}` | `libraries_delete_v1` | Delete a library and all of its documents |
| PATCH | `/v1/libraries/{library_id}` | `libraries_patch_v1` | Update a library |
| PUT | `/v1/libraries/{library_id}` | `libraries_update_v1` | Update a library (**deprecated** — use PATCH) |
| GET | `/v1/libraries/{library_id}/documents` | `libraries_documents_list_v1` | List documents in a library |
| POST | `/v1/libraries/{library_id}/documents` | `libraries_documents_upload_v1` | Upload a new document (multipart) |
| GET | `/v1/libraries/{library_id}/documents/{document_id}` | `libraries_documents_get_v1` | Retrieve a document's metadata |
| PATCH | `/v1/libraries/{library_id}/documents/{document_id}` | `libraries_documents_patch_v1` | Update a document's metadata |
| PUT | `/v1/libraries/{library_id}/documents/{document_id}` | `libraries_documents_update_v1` | Update document metadata (**deprecated** — use PATCH) |
| DELETE | `/v1/libraries/{library_id}/documents/{document_id}` | `libraries_documents_delete_v1` | Delete a document |
| GET | `/v1/libraries/{library_id}/documents/{document_id}/text_content` | `libraries_documents_get_text_content_v1` | Retrieve a document's extracted text |
| GET | `/v1/libraries/{library_id}/documents/{document_id}/status` | `libraries_documents_get_status_v1` | Retrieve a document's processing status |
| GET | `/v1/libraries/{library_id}/documents/{document_id}/signed-url` | `libraries_documents_get_signed_url_v1` | Signed URL for the original document |
| GET | `/v1/libraries/{library_id}/documents/{document_id}/extracted-text-signed-url` | `libraries_documents_get_extracted_text_signed_url_v1` | Signed URL for extracted text |
| POST | `/v1/libraries/{library_id}/documents/{document_id}/reprocess` | `libraries_documents_reprocess_v1` | Reprocess a document |
| GET | `/v1/libraries/{library_id}/share` | `libraries_share_list_v1` | List all access grants on a library |
| PUT | `/v1/libraries/{library_id}/share` | `libraries_share_create_v1` | Create or update an access level |
| DELETE | `/v1/libraries/{library_id}/share` | `libraries_share_delete_v1` | Delete an access level |

## Connectors (beta)

Register external tool/data connectors, drive their OAuth flow, scope them
(organization / workspace / user), manage stored credentials, and invoke the
tools they expose. Docs: https://docs.mistral.ai/api/endpoint/connectors

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| POST | `/v1/connectors` | `connector_create_v1` | Create a new connector |
| GET | `/v1/connectors` | `connector_list_v1` | List all connectors |
| GET | `/v1/connectors/{connector_id_or_name}` | `connector_get_v1` | Get a connector (spec key `…#idOrName`) |
| PATCH | `/v1/connectors/{connector_id}` | `connector_update_v1` | Update a connector (spec key `…#id`) |
| DELETE | `/v1/connectors/{connector_id}` | `connector_delete_v1` | Delete a connector (spec key `…#id`) |
| GET | `/v1/connectors/{connector_id_or_name}/auth_url` | `connector_get_auth_url_v1` | Get the OAuth auth URL for a connector |
| POST | `/v1/connectors/{connector_id}/organization/activate` | `connector_activate_for_organization_v1` | Activate for an organization |
| POST | `/v1/connectors/{connector_id}/organization/deactivate` | `connector_deactivate_for_organization_v1` | Deactivate for an organization |
| POST | `/v1/connectors/{connector_id}/workspace/activate` | `connector_activate_for_workspace_v1` | Activate for a workspace |
| POST | `/v1/connectors/{connector_id}/workspace/deactivate` | `connector_deactivate_for_workspace_v1` | Deactivate for a workspace |
| POST | `/v1/connectors/{connector_id}/user/activate` | `connector_activate_for_user_v1` | Activate for the current user |
| POST | `/v1/connectors/{connector_id}/user/deactivate` | `connector_deactivate_for_user_v1` | Deactivate for the current user |
| GET | `/v1/connectors/{connector_id_or_name}/tools` | `connector_list_tools_v1` | List tools a connector exposes |
| POST | `/v1/connectors/{connector_id_or_name}/tools/{tool_name}/call` | `connector_call_tool_v1` | Call a connector tool |
| GET | `/v1/connectors/{connector_id_or_name}/authentication_methods` | `connector_get_authentication_methods_v1` | Get supported authentication methods |
| GET | `/v1/connectors/{connector_id_or_name}/organization/credentials` | `connector_list_organization_credentials_v1` | List organization credentials |
| POST | `/v1/connectors/{connector_id_or_name}/organization/credentials` | `connector_create_or_update_organization_credentials_v1` | Create/update organization credentials |
| DELETE | `/v1/connectors/{connector_id_or_name}/organization/credentials/{credentials_name}` | `connector_delete_organization_credentials_v1` | Delete organization credentials |
| GET | `/v1/connectors/{connector_id_or_name}/workspace/credentials` | `connector_list_workspace_credentials_v1` | List workspace credentials |
| POST | `/v1/connectors/{connector_id_or_name}/workspace/credentials` | `connector_create_or_update_workspace_credentials_v1` | Create/update workspace credentials |
| DELETE | `/v1/connectors/{connector_id_or_name}/workspace/credentials/{credentials_name}` | `connector_delete_workspace_credentials_v1` | Delete workspace credentials |
| GET | `/v1/connectors/{connector_id_or_name}/user/credentials` | `connector_list_user_credentials_v1` | List user credentials |
| POST | `/v1/connectors/{connector_id_or_name}/user/credentials` | `connector_create_or_update_user_credentials_v1` | Create/update user credentials |
| DELETE | `/v1/connectors/{connector_id_or_name}/user/credentials/{credentials_name}` | `connector_delete_user_credentials_v1` | Delete user credentials |

## Observability (beta)

Inspect, search, judge, and curate model traffic. Logically splits into
chat-completion events, judges & live-judging, campaigns, datasets & records,
and the OpenTelemetry-style logs / traces / spans search layer. Docs:
https://docs.mistral.ai/api/endpoint/observability

### Chat-completion events & fields

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| POST | `/v1/observability/chat-completion-events/search` | `get_chat_completion_events_v1_observability_chat_completion_events_search_post` | Search chat-completion events |
| POST | `/v1/observability/chat-completion-events/search-ids` | `get_chat_completion_event_ids_v1_observability_chat_completion_events_search_ids_post` | Search returning only event IDs (high volume) |
| GET | `/v1/observability/chat-completion-events/{event_id}` | `get_chat_completion_event_v1_observability_chat_completion_events__event_id__get` | Get one chat-completion event |
| GET | `/v1/observability/chat-completion-events/{event_id}/similar-events` | `get_similar_chat_completion_events_v1_observability_chat_completion_events__event_id__similar_events_get` | Get similar events |
| POST | `/v1/observability/chat-completion-events/{event_id}/live-judging` | `judge_chat_completion_event_v1_observability_chat_completion_events__event_id__live_judging_post` | Run a judge live on an event |
| GET | `/v1/observability/chat-completion-fields` | `get_chat_completion_fields_v1_observability_chat_completion_fields_get` | List filterable event fields |
| GET | `/v1/observability/chat-completion-fields/{field_name}/options` | `get_chat_completion_field_options_v1_observability_chat_completion_fields__field_name__options_get` | List a field's option values |
| POST | `/v1/observability/chat-completion-fields/{field_name}/options-counts` | `get_chat_completion_field_options_counts_v1_observability_chat_completion_fields__field_name__options_counts_post` | Counts per option value for a field |

### Judges

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| POST | `/v1/observability/judges` | `create_judge_v1_observability_judges_post` | Create a new judge |
| GET | `/v1/observability/judges` | `get_judges_v1_observability_judges_get` | List judges (filter/search) |
| GET | `/v1/observability/judges/{judge_id}` | `get_judge_by_id_v1_observability_judges__judge_id__get` | Get a judge by id |
| PUT | `/v1/observability/judges/{judge_id}` | `update_judge_v1_observability_judges__judge_id__put` | Update a judge |
| DELETE | `/v1/observability/judges/{judge_id}` | `delete_judge_v1_observability_judges__judge_id__delete` | Delete a judge |
| POST | `/v1/observability/judges/{judge_id}/live-judging` | `judge_conversation_v1_observability_judges__judge_id__live_judging_post` | Run a saved judge on a conversation |

### Campaigns

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| POST | `/v1/observability/campaigns` | `create_campaign_v1_observability_campaigns_post` | Create & start a campaign |
| GET | `/v1/observability/campaigns` | `get_campaigns_v1_observability_campaigns_get` | List all campaigns |
| GET | `/v1/observability/campaigns/{campaign_id}` | `get_campaign_by_id_v1_observability_campaigns__campaign_id__get` | Get a campaign by id |
| DELETE | `/v1/observability/campaigns/{campaign_id}` | `delete_campaign_v1_observability_campaigns__campaign_id__delete` | Delete a campaign |
| GET | `/v1/observability/campaigns/{campaign_id}/status` | `get_campaign_status_by_id_v1_observability_campaigns__campaign_id__status_get` | Get campaign status |
| GET | `/v1/observability/campaigns/{campaign_id}/selected-events` | `get_campaign_selected_events_v1_observability_campaigns__campaign_id__selected_events_get` | Event IDs selected by the campaign |

### Datasets

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| POST | `/v1/observability/datasets` | `create_dataset_v1_observability_datasets_post` | Create a new empty dataset |
| GET | `/v1/observability/datasets` | `get_datasets_v1_observability_datasets_get` | List datasets |
| GET | `/v1/observability/datasets/{dataset_id}` | `get_dataset_by_id_v1_observability_datasets__dataset_id__get` | Get a dataset by id |
| PATCH | `/v1/observability/datasets/{dataset_id}` | `update_dataset_v1_observability_datasets__dataset_id__patch` | Patch a dataset |
| DELETE | `/v1/observability/datasets/{dataset_id}` | `delete_dataset_v1_observability_datasets__dataset_id__delete` | Delete a dataset |
| POST | `/v1/observability/datasets/{dataset_id}/imports/from-campaign` | `post_dataset_records_from_campaign_v1_observability_datasets__dataset_id__imports_from_campaign_post` | Import records from a campaign |
| POST | `/v1/observability/datasets/{dataset_id}/imports/from-explorer` | `post_dataset_records_from_explorer_v1_observability_datasets__dataset_id__imports_from_explorer_post` | Import from the explorer |
| POST | `/v1/observability/datasets/{dataset_id}/imports/from-file` | `post_dataset_records_from_file_v1_observability_datasets__dataset_id__imports_from_file_post` | Import from an uploaded file |
| POST | `/v1/observability/datasets/{dataset_id}/imports/from-playground` | `post_dataset_records_from_playground_v1_observability_datasets__dataset_id__imports_from_playground_post` | Import from the playground |
| POST | `/v1/observability/datasets/{dataset_id}/imports/from-dataset` | `post_dataset_records_from_dataset_v1_observability_datasets__dataset_id__imports_from_dataset_post` | Import from another dataset |
| GET | `/v1/observability/datasets/{dataset_id}/exports/to-jsonl` | `export_dataset_to_jsonl_v1_observability_datasets__dataset_id__exports_to_jsonl_get` | Export to JSONL (presigned URL) |
| GET | `/v1/observability/datasets/{dataset_id}/tasks` | `get_dataset_import_tasks_v1_observability_datasets__dataset_id__tasks_get` | List import tasks |
| GET | `/v1/observability/datasets/{dataset_id}/tasks/{task_id}` | `get_dataset_import_task_v1_observability_datasets__dataset_id__tasks__task_id__get` | Get one import task's status |

### Dataset records

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/observability/datasets/{dataset_id}/records` | `get_dataset_records_v1_observability_datasets__dataset_id__records_get` | List records in a dataset |
| POST | `/v1/observability/datasets/{dataset_id}/records` | `create_dataset_record_v1_observability_datasets__dataset_id__records_post` | Add a conversation to the dataset |
| GET | `/v1/observability/dataset-records/{dataset_record_id}` | `get_dataset_record_v1_observability_dataset_records__dataset_record_id__get` | Get a record's conversation |
| DELETE | `/v1/observability/dataset-records/{dataset_record_id}` | `delete_dataset_record_v1_observability_dataset_records__dataset_record_id__delete` | Delete a record |
| POST | `/v1/observability/dataset-records/bulk-delete` | `delete_dataset_records_v1_observability_dataset_records_bulk_delete_post` | Delete multiple records |
| POST | `/v1/observability/dataset-records/{dataset_record_id}/live-judging` | `judge_dataset_record_v1_observability_dataset_records__dataset_record_id__live_judging_post` | Run a judge on a record |
| PUT | `/v1/observability/dataset-records/{dataset_record_id}/payload` | `update_dataset_record_payload_v1_observability_dataset_records__dataset_record_id__payload_put` | Update a record's conversation payload |
| PUT | `/v1/observability/dataset-records/{dataset_record_id}/properties` | `update_dataset_record_properties_v1_observability_dataset_records__dataset_record_id__properties_put` | Update a record's properties |

### Logs / traces / spans (search & fields)

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| POST | `/v1/observability/logs/search` | `search_logs_v1_observability_logs_search_post` | Search logs |
| POST | `/v1/observability/traces/search` | `search_traces_v1_observability_traces_search_post` | Search traces |
| POST | `/v1/observability/spans/search` | `search_spans_v1_observability_spans_search_post` | Search spans |
| POST | `/v1/observability/spans/evaluations/search` | `search_span_evaluations_v1_observability_spans_evaluations_search_post` | Search span evaluations |
| POST | `/v1/observability/spans/evaluations/search/latest` | `search_latest_span_evaluations_v1_observability_spans_evaluations_search_latest_post` | Search latest span evaluations |
| GET | `/v1/observability/traces/{trace_id}` | `get_trace_by_id_v1_observability_traces__trace_id__get` | Get a trace by id |
| GET | `/v1/observability/traces/{trace_id}/spans` | `get_trace_spans_v1_observability_traces__trace_id__spans_get` | Get a trace's spans |
| GET | `/v1/observability/traces/{trace_id}/spans/{span_id}` | `get_span_by_id_v1_observability_traces__trace_id__spans__span_id__get` | Get a span by id |
| GET | `/v1/observability/traces/fields` | `get_trace_fields_v1_observability_traces_fields_get` | Trace field definitions |
| GET | `/v1/observability/logs/fields` | `get_log_fields_v1_observability_logs_fields_get` | Log field definitions |
| GET | `/v1/observability/spans/fields` | `get_span_fields_v1_observability_spans_fields_get` | Span field definitions |
| GET | `/v1/observability/spans/evaluations/fields` | `get_span_evaluation_fields_v1_observability_spans_evaluations_fields_get` | Span-evaluation field definitions |
| GET | `/v1/observability/traces/fields/{field_name}/options` | `get_trace_field_options_v1_observability_traces_fields__field_name__options_get` | Options for a trace field |
| GET | `/v1/observability/logs/fields/{field_name}/options` | `get_log_field_options_v1_observability_logs_fields__field_name__options_get` | Options for a log field |
| GET | `/v1/observability/spans/fields/{field_name}/options` | `get_span_field_options_v1_observability_spans_fields__field_name__options_get` | Options for a span field |
| GET | `/v1/observability/spans/evaluations/fields/{field_name}/options` | `get_span_evaluation_field_options_v1_observability_spans_evaluations_fields__field_name__options_get` | Options for a span-evaluation field |

## Workflows

Long-running, durable, schedulable workflow executions plus their runs,
schedules, deployments, registrations, events, metrics, and trace/log streams.
Multiple resource families share the `/v1/workflows` prefix. Docs:
https://docs.mistral.ai/api/endpoint/workflows

### Executions

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/workflows/executions/{execution_id}` | `get_workflow_execution_v1_workflows_executions__execution_id__get` | Get a workflow execution |
| GET | `/v1/workflows/executions/{execution_id}/history` | `get_workflow_execution_history_v1_workflows_executions__execution_id__history_get` | Get execution history |
| POST | `/v1/workflows/executions/{execution_id}/signals` | `signal_workflow_execution_v1_workflows_executions__execution_id__signals_post` | Send a signal to an execution |
| POST | `/v1/workflows/executions/{execution_id}/queries` | `query_workflow_execution_v1_workflows_executions__execution_id__queries_post` | Query an execution |
| POST | `/v1/workflows/executions/{execution_id}/updates` | `update_workflow_execution_v1_workflows_executions__execution_id__updates_post` | Send an update to an execution |
| POST | `/v1/workflows/executions/{execution_id}/terminate` | `terminate_workflow_execution_v1_workflows_executions__execution_id__terminate_post` | Terminate an execution |
| POST | `/v1/workflows/executions/terminate` | `batch_terminate_workflow_executions_v1_workflows_executions_terminate_post` | Batch-terminate executions |
| POST | `/v1/workflows/executions/{execution_id}/cancel` | `cancel_workflow_execution_v1_workflows_executions__execution_id__cancel_post` | Cancel an execution |
| POST | `/v1/workflows/executions/cancel` | `batch_cancel_workflow_executions_v1_workflows_executions_cancel_post` | Batch-cancel executions |
| POST | `/v1/workflows/executions/{execution_id}/reset` | `reset_workflow_v1_workflows_executions__execution_id__reset_post` | Reset a workflow |
| GET | `/v1/workflows/executions/{execution_id}/stream` | `stream_v1_workflows_executions__execution_id__stream_get` | Stream execution updates (SSE) |
| GET | `/v1/workflows/executions/{execution_id}/trace/otel` | `get_workflow_execution_trace_otel` | Execution trace (OTel format) |
| GET | `/v1/workflows/executions/{execution_id}/trace/summary` | `get_workflow_execution_trace_summary` | Execution trace summary |
| GET | `/v1/workflows/executions/{execution_id}/trace/events` | `get_workflow_execution_trace_events` | Execution trace events |
| GET | `/v1/workflows/executions/{execution_id}/logs` | `get_workflow_execution_logs` | Execution logs |
| GET | `/v1/workflows/executions/{execution_id}/logs/stream` | `stream_workflow_execution_logs` | Stream execution logs (SSE) |

### Runs

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/workflows/runs` | `list_runs_v1_workflows_runs_get` | List runs |
| GET | `/v1/workflows/runs/{run_id}` | `get_run_v1_workflows_runs__run_id__get` | Get a run |
| GET | `/v1/workflows/runs/{run_id}/history` | `get_run_history_v1_workflows_runs__run_id__history_get` | Get a run's history |

### Schedules

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/workflows/schedules` | `get_schedules_v1_workflows_schedules_get` | List schedules |
| POST | `/v1/workflows/schedules` | `schedule_workflow_v1_workflows_schedules_post` | Schedule a workflow |
| GET | `/v1/workflows/schedules/{schedule_id}` | `get_schedule_v1_workflows_schedules__schedule_id__get` | Get a schedule |
| PATCH | `/v1/workflows/schedules/{schedule_id}` | `update_schedule_v1_workflows_schedules__schedule_id__patch` | Update a schedule |
| DELETE | `/v1/workflows/schedules/{schedule_id}` | `unschedule_workflow_v1_workflows_schedules__schedule_id__delete` | Unschedule a workflow |
| POST | `/v1/workflows/schedules/{schedule_id}/pause` | `pause_schedule_v1_workflows_schedules__schedule_id__pause_post` | Pause a schedule |
| POST | `/v1/workflows/schedules/{schedule_id}/resume` | `resume_schedule_v1_workflows_schedules__schedule_id__resume_post` | Resume a schedule |
| POST | `/v1/workflows/schedules/{schedule_id}/trigger` | `trigger_schedule_v1_workflows_schedules__schedule_id__trigger_post` | Trigger a schedule now |

### Deployments & registrations

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/workflows/deployments` | `list_deployments_v1_workflows_deployments_get` | List deployments |
| GET | `/v1/workflows/deployments/{name}` | `get_deployment_v1_workflows_deployments__name__get` | Get a deployment |
| GET | `/v1/workflows/registrations` | `get_workflow_registrations_v1_workflows_registrations_get` | List workflow registrations |
| GET | `/v1/workflows/registrations/{workflow_registration_id}` | `get_workflow_registration_v1_workflows_registrations__workflow_registration_id__get` | Get a workflow registration |
| POST | `/v1/workflows/registrations/{workflow_registration_id}/execute` | `execute_workflow_registration_v1_workflows_registrations__workflow_registration_id__execute_post` | Execute a registration |

### Workflows (definitions) & metrics

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/workflows` | `get_workflows_v1_workflows_get` | List workflows |
| GET | `/v1/workflows/{workflow_identifier}` | `get_workflow_v1_workflows__workflow_identifier__get` | Get a workflow |
| PUT | `/v1/workflows/{workflow_identifier}` | `update_workflow_v1_workflows__workflow_identifier__put` | Update a workflow |
| POST | `/v1/workflows/{workflow_identifier}/execute` | `execute_workflow_v1_workflows__workflow_identifier__execute_post` | Execute a workflow |
| PUT | `/v1/workflows/{workflow_identifier}/archive` | `archive_workflow_v1_workflows__workflow_identifier__archive_put` | Archive a workflow |
| PUT | `/v1/workflows/{workflow_identifier}/unarchive` | `unarchive_workflow_v1_workflows__workflow_identifier__unarchive_put` | Unarchive a workflow |
| PUT | `/v1/workflows/archive` | `bulk_archive_workflows_v1_workflows_archive_put` | Bulk-archive workflows |
| PUT | `/v1/workflows/unarchive` | `bulk_unarchive_workflows_v1_workflows_unarchive_put` | Bulk-unarchive workflows |
| GET | `/v1/workflows/{workflow_name}/metrics` | `get_workflow_metrics_v1_workflows__workflow_name__metrics_get` | Get workflow metrics |

## Events

Workflow event streams — a server-sent stream of events and a paginated list,
tagged `events` in the spec (under the `/v1/workflows` prefix). Docs:
https://docs.mistral.ai/api/endpoint/events

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/workflows/events/stream` | `get_stream_events_v1_workflows_events_stream_get` | Stream workflow events (SSE) |
| GET | `/v1/workflows/events/list` | `get_workflow_events_v1_workflows_events_list_get` | List workflow events |

## RAG (beta)

Manage ingestion pipeline configurations and search indexes that back
retrieval-augmented generation. Docs: https://docs.mistral.ai/api/endpoint/rag

| Method | Path | operationId | Purpose |
|--------|------|-------------|---------|
| GET | `/v1/rag/ingestion_pipeline_configurations` | `get_configs_v1_rag_ingestion_pipeline_configurations_get` | List ingestion pipeline configurations |
| PUT | `/v1/rag/ingestion_pipeline_configurations` | `register_config_v1_rag_ingestion_pipeline_configurations_put` | Register a pipeline configuration |
| PUT | `/v1/rag/ingestion_pipeline_configurations/{id}/run_info` | `update_run_info_v1_rag_ingestion_pipeline_configurations__id__run_info_put` | Update a pipeline's run info |
| GET | `/v1/rag/search_index` | `get_search_indexes_v1_rag_search_index_get` | List search indexes |
| PUT | `/v1/rag/search_index` | `register_search_index_v1_rag_search_index_put` | Register a search index |

## Deprecated

The Mistral docs surface two legacy groups under `https://docs.mistral.ai/api/`.
Prefer the current equivalents — the deprecated routes still resolve but receive
no new features:

- **Deprecated Agents** — the older agents API. Prefer the current
  **Agents & Conversations** beta (`/v1/agents`, `/v1/conversations`) plus
  `/v1/agents/completions` for stateless agent completions.
- **Deprecated Fine Tuning** — the older fine-tuning surface. Prefer the current
  fine-tuning jobs API (`/v1/fine_tuning/jobs`, `/v1/fine_tuning/models/*`).

Within the groups above, individual operations are also marked deprecated in the
spec — notably the **PUT** library/document update routes
(`libraries_update_v1`, `libraries_documents_update_v1`), which advise using
**PATCH** instead. Grep `deprecated: true` in [openapi.yaml](openapi.yaml) to
find every deprecated operation and parameter.

## cURL examples

List your libraries (Libraries, beta):

```bash
curl https://api.mistral.ai/v1/libraries \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```

Get a single workflow execution by id (Workflows):

```bash
curl https://api.mistral.ai/v1/workflows/executions/EXECUTION_ID \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```

## Going deeper

This file is an index, not a schema. To get the exact request/response shape for
any operation:

1. **Grep the `operationId`** in [openapi.yaml](openapi.yaml) (e.g.
   `register_search_index_v1_rag_search_index_put`) to jump to the operation,
   then follow its `requestBody`/`responses` `$ref`s to the named schema.
2. **Grep the schema name** under `components/schemas` (e.g.
   `CreateSearchIndexInfoRequest`, `SearchIndexResponse`) for the full field
   list, types, and required flags.
3. For path/query parameters, read the operation's `parameters:` block in place.

If an operation, field, or whole group is missing here or in the bundled spec,
**diff against the live spec** at `https://docs.mistral.ai/openapi.yaml` — the
API ships fast and beta surfaces change; the live spec and
`https://docs.mistral.ai/api/` are the ultimate ground truth.
